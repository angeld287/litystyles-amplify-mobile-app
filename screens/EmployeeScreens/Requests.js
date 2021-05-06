import React, { useEffect, useState, useCallback } from 'react';
import { Button as Btn, StyleSheet, Dimensions, ScrollView, Image, View, RefreshControl, Modal, Platform, Linking, Icon as RNI } from 'react-native';
import { Container, Header, Content, List, ListItem, Thumbnail, Left, Body, Right, Button, Card, CardItem, Icon as I, Text, Subtitle, Spinner } from 'native-base';

import { Block, theme, Accordion } from 'galio-framework';
import Icon from 'react-native-vector-icons/FontAwesome';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { Images } from "../../constants";
import { HeaderHeight } from "../../constants/utils";

import image from "../../images/avatardefault.png";

import moment from 'moment';

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

                setRequests(reqs.data.listRequests.items.sort((a, b) => new Date(a.date) - new Date(b.date)));
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
        subscribeRequestCustomer();

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


    const LinkCall = async (item) => {
      try {
        var phoneN = item.customer.items[0].customer.phone_number
        var phoneNumber = "";
        if (Platform.OS === 'android') {
          phoneNumber = 'tel:${'+ phoneN +'}';
        }
        else {
          phoneNumber = 'telprompt:${' + phoneN + '}';
        }

        Linking.openURL(phoneNumber);

      } catch (e) {
          console.log(e);
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

    const setTCPayment = () => {
        setTcPayLoading(true);
        API.graphql(graphqlOperation(updateRequest, { input: { id: requests[0].id, paymentType: 'CARD' } }))
        .then(r => {
            var req = requests[requests.findIndex(e => e.id === requests[0].id)];
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
    <ListItem key={i} avatar>
        <Left>
            <Thumbnail source={image} />
        </Left>
        <Body>
            <Text style={{marginTop: 5}} >{item.customerName}</Text>
            <Text note>{moment(requests[0]?.date).format("dddd, MMMM Do, HH:mm")}</Text>
        </Body>
        <Right>
            {(i === 1 && item.customer.items.length !== 0 && item.notified && item.customer.items[0].customer.phone_number != undefined) && <Button success transparent onPress={(e) => { e.preventDefault(); LinkCall(item) }}><I active type="MaterialIcons" name="phone" /></Button>}
            {(i === 1 && item.customer.items.length !== 0 && !item.notified) && <Button warning transparent onPress={(e) => { e.preventDefault(); notify(item, "2") }}>{!notifyLoading && <I active type="MaterialIcons" name="notifications-active" />}{notifyLoading && < Spinner color='orange' />}</Button>}
            {(i === 0 && item.state === "ON_HOLD") && <Button danger transparent onPress={(e) => { e.preventDefault(); openCancelModal(item) }}>{!cancelLoading && <I active type="MaterialIcons" name="cancel" />}{cancelLoading && <Spinner size="small" color='red' />}</Button>}
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
      {!loading  &&
        <Block flex>
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={getList} />
              }
            > 
                { requests.length > 0 &&<Block>
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
                            {requestInProcess && <Button onPress={ (e) => {e.preventDefault(); FinishRequest()}} rounded style={{height: 150}} large block danger>{ !finishLoading && <Text uppercase style={{fontSize: 50}}>FINALIZAR</Text>}{finishLoading && <Spinner color="#fff" size="large" />}</Button>}
                            {!requestInProcess && <Button onPress={ (e) => { e.preventDefault(); nextRequest()}} rounded style={{height: 150}} large block blue>{ !inProcessLoading && <Text uppercase style={{fontSize: 60}}>PROXIMO</Text>}{inProcessLoading && <Spinner size="large" color="#fff" />}</Button>}
                        </Body>
                    </CardItem>
                    <CardItem>
                        <Left>
                            {(requestInProcess && (requests[0].paymentType !== "CARD")) && <Button transparent style={{padding: 3}} onPress={(e) => { e.preventDefault(); setTCPayment()}}>{ !tcPayLoading && <Icon size={30} color="#f0ad4e" name="credit-card-alt" ></Icon>}{tcPayLoading && <Spinner size="small" color="#f0ad4e" />}</Button>}
                        </Left>
                    </CardItem>
                </Card>
                </Block>}
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
                  <Text style={{marginBottom: 3, fontSize: 16}}>Seguro que desea cancelar?</Text>
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
    },
  });


export default Requests;

