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

  const [ finishLoading, setFinishLoading ] = useState(false);
  const [ finishError, setFinishError ] = useState(false);
  const [ finishErrorMessage, setFinishErrorMessage ] = useState(false);   
  const [ tcPayLoading, setTcPayLoading ] = useState(false);
  const [ tcPayError, setTcPayError ] = useState(false);
  const [ tcPayErrorMessage, setTcPayErrorMessage ] = useState(false);     
  const [ inProcessLoading, setInProcessLoading ] = useState(false);
  const [ inProcessError, setInProcessError ] = useState(false);
  const [ inProcessErrorMessage, setInProcessErrorMessage ] = useState(false);

  const [ requestToCancel, setRequestToCancel ] = useState('');
  const [ cancelOverlay, setCancelOverlay ] = useState(false);
  const [ cancelLoading, setCancelLoading ] = useState(false);
  const [ cancelerror, setCancelError ] = useState(false);
  const [ cancelerrorMessage, setCancelErrorMessage ] = useState(false);

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

                console.log(requests);

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
      
      setRequests(reqs.data.listRequests.items.sort((a, b) => new Date(a.date) - new Date(b.date)));
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
      console.log(item);
      navigation.navigate('Order', {id: item.id});
    }

    const aproveRequest = (item) => {
        setInProcessLoading(true);
        API.graphql(graphqlOperation(updateRequest, { input: { id: item.id, state: 'APPROVED' } }))
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
            requests.splice(requests.findIndex(e => e.id === requests[0].id), 1);
            if(requests[2] !== undefined && requests[2].customer.items.length !== 0){
                notify(requests[2], '3');
            }
            setRequestInProcess(false);
            setFinishLoading(false);
        })
        .catch(e => {
            console.log(e);
            setFinishError(true);
            setFinishLoading(false)
            setFinishErrorMessage(e);
        });
    }

    const setTCPayment = (item) => {
        setTcPayLoading(true);
        API.graphql(graphqlOperation(updateRequest, { input: { id: itemid, paymentType: 'CARD' } }))
        .then(r => {
            var req = requests[requests.findIndex(e => e.id === ritem.id)];
            req.paymentType = "CARD";
            setTcPayLoading(false);
        })
        .catch(e => {
            console.log(e);
            setTcPayError(true);
            setTcPayLoading(false)
            setTcPayErrorMessage(e);
        });
    }

    const confirmCancelRequest = () => {
        setCancelOverlay(false);
        setCancelLoading(true);
        API.graphql(graphqlOperation(updateRequest, { input: { id: requestToCancel, state: 'CANCELED' } }))
        .then(r => {
          requests.splice(requests.findIndex(e => e.id === requestToCancel), 1);
          setCancelOverlay(false);
          setCancelLoading(false);
        })
        .catch(e => {
          setCancelError(true);
          setCancelLoading(false);
          console.log(e)
          setCancelErrorMessage('Ha ocurrido un error al cancelar la solicitud');
        });
    }
    
    const openCancelModal = (item) => {
        setRequestToCancel(item.id);
        setCancelOverlay(true);
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
            {item.state === "AWAITING_APPROVAL" && <Button primary transparent onPress={(e) => { e.preventDefault(); aproveRequest(item) }}>{!cancelLoading && <I active type="MaterialCommunityIcons" name="format-list-checks" />}{cancelLoading && <Spinner size="small" color='red' />}</Button>}
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
            <Modal
              animationType="slide"
              transparent={true}
              visible={cancelOverlay}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={{marginBottom: 3, fontSize: 16}}>Seguro que desea rechazar?</Text>
                  <Block style={{flexDirection: "row", justifyContent: "space-around", padding: 10}}>
                    <Button style={{marginRight: 5}} success onPress={confirmCancelRequest}>{ !cancelLoading && <Text>Si</Text>}{cancelLoading && <Spinner size="small" color="#fff" />}</Button>
                    <Button danger onPress={ (e) => { e.preventDefault(); setCancelOverlay(false);}}><Text>No</Text></Button>
                  </Block>
                </View>
              </View>
            </Modal>
        </Block>
      }
    </Block>
 );
}

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22
    },
    modalView: {
      margin: 20,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center"
    }
  });


export default SupplierRequests;