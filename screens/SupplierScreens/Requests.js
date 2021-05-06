import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, View, RefreshControl, Modal, TouchableWithoutFeedback } from 'react-native';
import { Container, Header, Content, List, ListItem, Thumbnail, Left, Body, Right, Button, Card, CardItem, Icon as I, Text, Subtitle, Spinner } from 'native-base';

import { Block, theme, Accordion } from 'galio-framework';
import Icon from 'react-native-vector-icons/FontAwesome';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { Images } from "../../constants";
import { HeaderHeight } from "../../constants/utils";

import image from "../../images/avatardefault.png";

import { sendNotifications } from '../../constants/functions'; 

import { getOffice, listRequestsForSupplierAdmin, getCompany } from '../../graphql/customQueries';
import { updateRequestE, updateRequest } from '../../graphql/customMutations';
import { onUpdateRequest } from '../../graphql/subscriptions';

import { onCreateRequestCustomer } from '../../graphql/customSubscptions';

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

const SupplierRequests = ({ route, navigation }) => {
  
  const [ requests, setRequests ] = useState(null);
  const [ refreshing, setRefreshing ] = useState(false);
  const [ requestInProcess, setRequestInProcess ] = useState(false);
  const [ loading, setLoading ] = useState(true);
  const [ notifyLoading, setNotifyLoading ] = useState(false);

  const [ inDeliveredLoading, setDeliveredLoading ] = useState('');
  const [ finishError, setFinishError ] = useState(false);
  const [ finishErrorMessage, setFinishErrorMessage ] = useState(false);   
  const [ inApporvedLoading, setApporvedLoading ] = useState('');
  const [ inApporvedError, setInApporvedError ] = useState(false);
  const [ inApproveErrorMessage, setInApproveErrorMessage ] = useState(false);


  useEffect(() => {
    let didCancel = false;

    const username = route.params?.authData.username;

        const fetch = async () => {
            setLoading(true);
            try {
                var reqs = null;
                var requests = [];
                var _nextToken = null;

                const _filterR = {
                    and: [
                      {or: [
                        {state: {eq: 'AWAITING_APPROVAL'}},
                        {state: {eq: 'APPROVED'}}
                      ]},
                      {resposibleName: {eq: username}},
                    ]
                };

                reqs = await API.graphql(graphqlOperation(listRequestsForSupplierAdmin, {limit: 100, filter: _filterR}));
                requests = reqs.data.listRequests.items;
                _nextToken = reqs.data.listRequests.nextToken;

                while (_nextToken !== null) {
                  reqs = await API.graphql(graphqlOperation(listRequestsForSupplierAdmin, {limit: 100, nextToken: reqs.data.listRequests.nextToken, filter: _filterR}));
                  if(reqs.data.listRequests.items.length > 0){
                    reqs.data.listRequests.items.forEach(e => {requests.push(e)});
                  }
                  _nextToken = reqs.data.listRequests.nextToken;
                }

                setRequests(requests.sort((a, b) => new Date(a.date) - new Date(b.date)));
                setLoading(false);

            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        };

        fetch();

        return () => {
            didCancel = true;
        };
        
  }, []);

  // sleep time expects milliseconds
  function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  const getList = async () => {
    const username = route.params?.authData.username;
    try {
      setRefreshing(true);
      var reqs = null;
      var requests = [];
      var _nextToken = null;

      const _filterR = {
          and: [
            {or: [
              {state: {eq: 'AWAITING_APPROVAL'}},
              {state: {eq: 'APPROVED'}}
            ]},
            {resposibleName: {eq: username}},
          ]
      };

      reqs = await API.graphql(graphqlOperation(listRequestsForSupplierAdmin, {limit: 100, filter: _filterR}));
      requests = reqs.data.listRequests.items;
      _nextToken = reqs.data.listRequests.nextToken;

      while (_nextToken !== null) {
        reqs = await API.graphql(graphqlOperation(listRequestsForSupplierAdmin, {limit: 100, nextToken: reqs.data.listRequests.nextToken, filter: _filterR}));
        if(reqs.data.listRequests.items.length > 0){
          reqs.data.listRequests.items.forEach(e => {requests.push(e)});
        }
        _nextToken = reqs.data.listRequests.nextToken;
      }

      setRequests(requests.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setRefreshing(false);
    } catch (e) {
      setRefreshing(false);
      console.log(e);
    }
  };

  const notify = async (item, position) => {
        try {
            var title = "Posicion "+position+" - Posible perdida de turno";
            var body = position === '2' ? "Usted se encuentra en el segundo lugar de la lista de turnos. De no llegar a tiempo, podria perder su turno." : (position === '3' ? "Usted se encuentra en el tercer lugar de la lista de turnos. Su turno esta cerca." : "");
            setNotifyLoading(true)
            const object = {
                to: item.customer.items[0].customer.phoneid,
                title: title,
                body: body,
                sound: 'default',
                naviateto: "RequestInfo",
            }

            await sendNotifications(object);

            if(position === '2'){
                const req = await API.graphql(graphqlOperation(updateRequestE, { input: { id: item.id , notified: true } }))

                setRequests(p => ([...p.filter(e => e.id !== req.data.updateRequest.id), req.data.updateRequest])); 
            }

            setNotifyLoading(false) 
        } catch (e) {
            console.log(e);
            setNotifyLoading(false)
        }
    }

    const viewDetails = (item) => {
      navigation.navigate('Order', {id: item.id});
    }

    const aproveRequest = (item) => {
      setApporvedLoading(item.id);
        API.graphql(graphqlOperation(updateRequest, { input: { id: item.id, state: 'APPROVED' } }))
        .then(r => {
            const editObject = requests[requests.findIndex(e => e.id === r.data.updateRequest.id)];
            requests.splice(requests.findIndex(e => e.id === r.data.updateRequest.id), 1);
            editObject.state = 'APPROVED';
            requests.unshift(editObject);
            setApporvedLoading('');
        })
        .catch(e => {
            setInApporvedError(true);
            setApporvedLoading('')
            setInApproveErrorMessage(e);
        });
    }

    const deliverRequest = (item) => {
      setDeliveredLoading(item.id);
        API.graphql(graphqlOperation(updateRequest, { input: { id: item.id, state: 'DELIVERED' } }))
        .then(r => {
            requests.splice(requests.findIndex(e => e.id === r.data.updateRequest.id), 1);
            setDeliveredLoading('');
        })
        .catch(e => {
            setDeliveredLoading('');
            console.log(e);
        });
    }

const _requestsList = (requests !== null)?([].concat(requests)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item,i)=> 
    <TouchableWithoutFeedback onPress={(e) => { e.preventDefault(); viewDetails(item) }}>
      <ListItem avatar>
        <Left>
            <Thumbnail source={image} />
        </Left>
        <Body>
            <Text style={{marginTop: 5}} >{item.customerName}</Text>
            <Text note>{item.state === "AWAITING_APPROVAL" ? "Esperando Aprobacion" : "Aprobado"}</Text>
        </Body>
        <Right>
            {item.state === "AWAITING_APPROVAL" && <Button success transparent onPress={(e) => { e.preventDefault(); aproveRequest(item) }}>{!(inApporvedLoading === item.id) && <I active type="MaterialCommunityIcons" name="format-list-checks" />}{inApporvedLoading === item.id && <Spinner size="small" color='green' />}</Button>}
            {item.state === "APPROVED" && <Button danger transparent onPress={(e) => { e.preventDefault(); deliverRequest(item) }}>{!(inDeliveredLoading === item.id) && <I active type="MaterialCommunityIcons" name="truck-delivery" />}{inDeliveredLoading === item.id && <Spinner size="small" color='red' />}</Button>}
        </Right>
      </ListItem>
    </TouchableWithoutFeedback>
  )):(<Block></Block>)
  

 return (
    <Block flex>
      {loading &&
        <Content style={{marginTop: 100}}>
          <Spinner color='blue' />
        </Content>
      }
      {!loading  &&
        <Block flex>
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={getList} />
              }
            >
                <Block style={{margin: 5}}>
                    <List>{_requestsList}</List>
                </Block>
            </ScrollView>
        </Block>
      }
    </Block>
 );
}


export default SupplierRequests;