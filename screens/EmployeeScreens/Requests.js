import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, View, RefreshControl, ImageBackground, Platform } from 'react-native';
import { Container, Header, Content, List, ListItem, Thumbnail, Left, Body, Right, Button, Card, CardItem, Icon as I, Text, Subtitle, Spinner } from 'native-base';

import { Block, theme, Accordion } from 'galio-framework';
import Icon from 'react-native-vector-icons/FontAwesome';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { Images } from "../../constants";
import { HeaderHeight } from "../../constants/utils";

import image from "../../images/avatardefault.png";

import { sendNotifications } from '../../constants/functions'; 

import { getOffice, listRequestsEmployee, getCompany } from '../../graphql/customQueries';
import { updateRequestE, updateRequest } from '../../graphql/customMutations';
import { onUpdateRequest } from '../../graphql/subscriptions';

import { onCreateRequestCustomer } from '../../graphql/customSubscptions';

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

const Requests = ({ route, navigation }) => {
  
  const [ requests, setRequests ] = useState(null);
  const [ refreshing, setRefreshing ] = useState(false);
  const [ requestInProcess, setRequestInProcess ] = useState(false);
  const [ loading, setLoading ] = useState(true);
  const [ notifyLoading, setNotifyLoading ] = useState(false);

  const [ finishLoading, setFinishLoading ] = useState(false);
  const [ finishError, setFinishError ] = useState(false);
  const [ finishErrorMessage, setFinishErrorMessage ] = useState(false);   
  const [ tcPayLoading, setTcPayLoading ] = useState(false);
  const [ tcPayError, setTcPayError ] = useState(false);
  const [ tcPayErrorMessage, setTcPayErrorMessage ] = useState(false);     
  const [ inProcessLoading, setInProcessLoading ] = useState(false);
  const [ inProcessError, setInProcessError ] = useState(false);
  const [ inProcessErrorMessage, setInProcessErrorMessage ] = useState(false);

  useEffect(() => {
    let didCancel = false;

    const username = route.params?.authData.username;

        const fetch = async () => {
            setLoading(true);
            try {
                var reqs = null;

                const _filterR = {
                    and: [
                      {or: [
                        {state: {eq: 'IN_PROCESS'}},
                        {state: {eq: 'ON_HOLD'}}
                      ]},
                      {resposibleName: {eq: username}}
                    ]
                };

                reqs =  await API.graphql(graphqlOperation(listRequestsEmployee, { limit: 1000, filter: _filterR } ) );

                setRequests(reqs.data.listRequests.items);
                console.log(reqs.data.listRequests.items);
                setLoading(false);

            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        };

        const subscribeRequest = async () => {
            await API.graphql(graphqlOperation(onUpdateRequest, {resposibleName: username})).subscribe({
                next: r => {
                    var state = r.value.data.onUpdateRequest.state;
                    if (state !== "ON_HOLD" && state !== "IN_PROCESS") {
                        setRequests(p => ([...p.filter(e => e.id !== r.value.data.onUpdateRequest.id)]));
                    }
                }
            });
        };

        const subscribeRequestCustomer = async () => {
            await API.graphql(graphqlOperation(onCreateRequestCustomer, {resposibleName: username})).subscribe({
              next: async r => {
                  var request = null;
                  request = await API.graphql(graphqlOperation(getRequest, {id: r.value.data.onCreateRequestCustomer.request.id}));
                  setRequests(prevState => ([...prevState, request.data.getRequest]));
              }
            });
        };

        fetch();
        //subscribeRequest();
        //subscribeRequestCustomer();

        return () => {
            didCancel = true;
        };
        
  }, []);

  // sleep time expects milliseconds
  function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  const getList = async () => {
    try {
      setRefreshing(true);
      var reqs = null;

      const _filterR = {
        and: [
          {or: [
            {state: {eq: 'IN_PROCESS'}},
            {state: {eq: 'ON_HOLD'}}
          ]},
          {resposibleName: {eq: route.params?.authData.username}}
        ]
      };

      reqs =  await API.graphql(graphqlOperation(listRequestsEmployee, { limit: 1000, filter: _filterR } ) );
      
      setRequests(reqs.data.listRequests.items);
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

    const nextRequest = () => {
        setInProcessLoading(true);
        API.graphql(graphqlOperation(updateRequest, { input: { id: requests[0].id, state: 'IN_PROCESS' } }))
        .then(r => {
            const editObject = requests[requests.findIndex(e => e.id === r.data.updateRequest.id)];
            requests.splice(requests.findIndex(e => e.id === r.data.updateRequest.id), 1);
            editObject.state = 'IN_PROCESS';
            requests.unshift(editObject);
            setRequestInProcess(true);
            setInProcessLoading(false);
        })
        .catch(e => {
            setInProcessError(true);
            setInProcessLoading(false)
            setInProcessErrorMessage(e);
        });
    }

    const FinishRequest = () => {
        setFinishLoading(true);
        API.graphql(graphqlOperation(updateRequest, { input: { id: requests[0].id, state: 'FINISHED' } }))
        .then(r => {
            requests.splice(requests.findIndex(e => e.id === requestToFinish), 1);
            if(requests[2] !== undefined && requests[2].customer.items.length !== 0){
                notify(requests[2], '3');
            }
            setRequestInProcess(false);
            setFinishLoading(false);
        })
        .catch(e => {
            setFinishError(true);
            setFinishLoading(false)
            setFinishErrorMessage(e);
        });
    }

    const setTCPayment = () => {
        setTcPayLoading(true);
        API.graphql(graphqlOperation(updateRequest, { input: { id: requests[0].id, paymentType: 'CARD' } }))
        .then(r => {
            var req = requests[requests.findIndex(e => e.id === requestToFinish)];
            req.paymentType = "CARD";
            setTcPayLoading(false);
        })
        .catch(e => {
            setTcPayError(true);
            setTcPayLoading(false)
            setTcPayErrorMessage(e);
        });
    }

const _requestsList = (requests !== null)?([].concat(requests).map((e,i)=> 
    <ListItem avatar>
        <Left>
            <Thumbnail source={image} />
        </Left>
        <Body>
            <Text style={{marginTop: 5}} >{e.customerName}</Text>
            <Text note></Text>
        </Body>
        <Right>
            {(i === 1 && e.customer.items.length !== 0 && !e.notified) && <Button warning transparent onPress={() => { notify }}><I active type="MaterialIcons" name="notifications-active" />{false && < Spinner color='orange' />}</Button>}
            {(i === 0) && <Button danger transparent onPress={() => { notify }}><I active type="MaterialIcons" name="cancel" />{false && < Spinner color='red' />}</Button>}
        </Right>
    </ListItem>
  )):(<Block></Block>)
  

 return (
    <Block flex>
      {loading &&
        <Content style={{marginTop: 100}}>
          <Spinner color='blue' />
        </Content>
      }
      {!loading &&
        <Block flex>
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={getList} />
              }
            > 
                <Block>
                <Card style={{flex: 0}}>
                    <CardItem>
                        <Left>
                            <Icon size={30} name="cogs" />
                            <Body>
                                <Text>{requests[0].customerName}</Text>
                                <Text note>{requests[0].service.items.length > 0 ? requests[0].service.items[0].service.name : ""}</Text>
                            </Body>
                        </Left>
                    </CardItem>
                    <CardItem>
                        <Body>
                            {requestInProcess && <Button onPress={FinishRequest} rounded style={{height: 150}} large block blue><Text uppercase style={{fontSize: 60}}>FINALIZAR</Text></Button>}
                            {!requestInProcess && <Button onPress={nextRequest} rounded style={{height: 150}} large block blue><Text uppercase style={{fontSize: 60}}>PROXIMO</Text></Button>}
                        </Body>
                    </CardItem>
                    <CardItem>
                        <Left>
                            {requestInProcess && <Button onPress={setTCPayment}><Icon size={30} color="#C0C0C0" name="credit-card-alt" ></Icon></Button>}
                        </Left>
                    </CardItem>
                </Card>
                </Block>
                <Block style={{margin: 5}}>
                    <List>{_requestsList}</List>
                </Block>
            </ScrollView>
        </Block>
      }
    </Block>
 );
}


export default Requests;

