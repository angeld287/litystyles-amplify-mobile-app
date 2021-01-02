import React, { useEffect, useState, useCallback } from 'react';
import { Image, Alert, StyleSheet, Modal } from 'react-native';
import { Block } from "galio-framework";
import { Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, View, Right, Badge, List, ListItem, Spinner } from 'native-base';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { updateRequest } from "../../graphql/mutations";
import { listRequestsForProducts, getRequestForOrderDetail, getCompanyForCart } from "../../graphql/customQueries";

import defaultImage from "../../images/avatardefault.png";

import _default from "../../images/default-image.png";

import CartItems from "../../components/CartItems";

import { sendNotifications } from '../../constants/functions'; 

import moment from 'moment';
import 'moment/min/locales';

moment.locale('es')

import NumericInput from 'react-native-numeric-input'

const Orders = (props) => {

    const [image, setImage ] = useState('');
    const [user, setUser ] = useState(null);
    const [company, setCompany ] = useState(null);
    const [request, setRequest ] = useState(null);

    const [loading, setLoading ] = useState(true);
    const [ inDeliveredLoading, setDeliveredLoading ] = useState(false);
    const [ inApporvedLoading, setApporvedLoading ] = useState(false);
    const [refuseLoading, setRefuseLoading ] = useState(false);

    const [hasReq, setHasReq ] = useState(false);
    const [isSupplier, setIsSupplier ] = useState(false);

    const [ requestToCancel, setRequestToCancel ] = useState('');
    const [ cancelOverlay, setCancelOverlay ] = useState(false);
    const [ cancelLoading, setCancelLoading ] = useState(false);
    const [ cancelerror, setCancelError ] = useState(false);
    const [ cancelerrorMessage, setCancelErrorMessage ] = useState(false);


    const getImageFromStorage = useCallback(
        async (image) => {
          try {
            if(image !== null) {
                var i = await Storage.get(image, { level: 'public' });
                return i
            }else{
                return _image;
            }
          } catch (e) {
              console.log(e); 
              return _image;
          }
        },
        [],
    );

    useEffect(() => {
        async function fetchData() {
          const username = props.route.params?.authData.username;

            try {
              setLoading(true)
              var request = null;
              var userRequests = {};
              var _nextToken = null;

              const _filterR = {
                  and: [
                    {or: [
                      {state: {eq: 'AWAITING_APPROVAL'}},
                      {state: {eq: 'APPROVED'}}
                    ]},
                    {customerUsername: {eq: username}},
                  ]
              };

              userRequests = await API.graphql(graphqlOperation(listRequestsForProducts, {limit: 100, filter: _filterR}));
              _nextToken = userRequests.data.listRequests.nextToken;

              if(userRequests.data.listRequests.items.length === 0){
                while (_nextToken !== null) {
                  userRequests = await API.graphql(graphqlOperation(listRequestsForProducts, {limit: 100, nextToken: userRequests.data.listRequests.nextToken, filter: _filterR}));
                  if(userRequests.data.listRequests.items.length > 0){
                    request = userRequests.data.listRequests.items[0];
                    break;
                  }
                  _nextToken = userRequests.data.listRequests.nextToken;
                }  
              }else{
                request = userRequests.data.listRequests.items[0];
              }
              

              setHasReq(request !== null);

              console.log(request);

              if(request !== null){
                setRequest(request);
                const company = await API.graphql(graphqlOperation(getCompanyForCart, {id: request.companyId}));

                setUser(company.data.getCompany.offices.items[0]);
  
                setCompany(company.data.getCompany);
  
                const img = await getImageFromStorage(company.data.getCompany.offices.items[0].image);
                setImage(img);
              }

              setLoading(false);
            } catch (e) {
              console.log(e);
            }
        }

        async function fetchRequest() {
            try {
              setLoading(true)
              var request = null;
              var userRequests = {};
              var _nextToken = null;

              userRequests = await API.graphql(graphqlOperation(getRequestForOrderDetail, {id: props.route.params.id}));
              request = userRequests.data.getRequest;

              setHasReq(request !== null);

              if(request !== null){
                var _imgdb = request.customer.items[0].customer.image;
                setRequest(request);

                setUser(request.customer.items[0].customer);

                if (_imgdb !== null && !(_imgdb.match(/(http[s]{0,1}:\/\/)/i) !== null)) {
                  const img = await getImageFromStorage(_imgdb);
                  _imgdb = img;
                }

                setImage(_imgdb);
              }

              setLoading(false);
            } catch (e) {
              console.log(e);
            }
        }

        setIsSupplier(props.route.params.id !== undefined)

        if(props.route.params.id === undefined){
          fetchData();
        }else{
          fetchRequest();
        }

    }, [getImageFromStorage, props]);

    const approveRequest = (item) => {
      setApporvedLoading(true);
        API.graphql(graphqlOperation(updateRequest, { input: { id: request.id, state: 'APPROVED' } }))
        .then(r => {
            const editObject = request;
            editObject.state = 'APPROVED';
            setRequest(editObject);
            setApporvedLoading(false);
        })
        .catch(e => {
            setApporvedLoading(false)
            console.log(e);
        });
    }

    const deliverRequest = () => {
      setDeliveredLoading(true);
        API.graphql(graphqlOperation(updateRequest, { input: { id: request.id, state: 'DELIVERED' } }))
        .then(r => {
            props.navigation.navigate('Administracion');
            setDeliveredLoading(false);
        })
        .catch(e => {
            setDeliveredLoading(false);
            console.log(e);
        });
    }

    const refuseRequest = () => {
      setRequestToCancel(request.id);
      setCancelOverlay(true);
    }

    const confirmCancelRequest = () => {
        setCancelOverlay(false);
        setCancelLoading(true);
        API.graphql(graphqlOperation(updateRequest, { input: { id: requestToCancel, state: 'REJECTED' } }))
        .then(r => {
          props.navigation.navigate('Administracion');
          setCancelLoading(false);
        })
        .catch(e => {
          setCancelError(true);
          setCancelLoading(false);
          console.log(e)
          setCancelErrorMessage('Ha ocurrido un error al cancelar la solicitud');
        });
    }
    
    const _products = (request !== null && request.product.items.length > 0)?([].concat(request.product.items)
		  .map((item,i)=>
			  {      
                var product = {
                    id: item.id,
                    title: item.product.name,
                    image: item.product.image,
                    cta: 'Entrar', 
                    horizontal: true,
                    supplier: false,
                    cost: item.cost,
                    quantity_requested: item.quantity,
                };

          return (<CartItems quantity item={product} horizontal/>);
        }

    )):(<CartItems></CartItems>)
  
    const body = (
      <Container>
        <Header />
        <Content>
          <Card>
            <CardItem>
              <Text>Subtotal ({request !== null ? request.product.items.length : "0"} Items):</Text>
              <Badge style={{marginLeft: 4}} danger>
                <Text>RD$ {request !== null ? request?.total : ""}</Text>
              </Badge>
            </CardItem>
            <CardItem>
              <Left>
                {image === null ? <Thumbnail source={defaultImage} /> : <Thumbnail source={{uri: image}} />}
                <Body>
                  <Text>{user !== null ? user.name : ""}</Text>
                  <Text note>{user !== null ? user.employees !== undefined ? user.employees.items[0].name : "" : ""}</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem>
                <Content>
                  <Text>{request !== null ? request.state === "AWAITING_APPROVAL" ? "En Espera de Aprobacion" : request.state === "APPROVED" ? "Aprobado" : "" : ""} </Text>
                </Content>
            </CardItem>
            <CardItem cardBody>
              <Block flex style={{padding: 5}}>
                {_products}
              </Block>
            </CardItem>
            {isSupplier && <CardItem>
              <Left>
                {request !== null && request.state === "AWAITING_APPROVAL" &&<Content>
                  <Button rounded block success onPress={(e) => { e.preventDefault(); approveRequest() }}>{inApporvedLoading&&<Spinner color='white' />}{!inApporvedLoading&&<Text>Aprobar</Text>}</Button>
                </Content>}
                {request !== null && request.state === "APPROVED" &&<Content>
                  <Button rounded block success onPress={(e) => { e.preventDefault(); deliverRequest() }}>{inDeliveredLoading&&<Spinner color='white' />}{!inDeliveredLoading&&<Text>Entregar</Text>}</Button>
                </Content>}
              </Left>
              <Right>
                <Content>
                  <Button block danger rounded onPress={(e) => { e.preventDefault(); refuseRequest() }} >
                    { cancelLoading && <Spinner color='white' /> }
                    { !cancelLoading && <Text>Rechazar</Text> }
                  </Button>
                </Content>
              </Right>
            </CardItem>}
          </Card>
        </Content>
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
      </Container>
    );

    const noRequest = (
      <Container>
        <Header />
        <Content>
          <Card>
            <CardItem>
              <Text>No tiene ninguna solicitud</Text>
            </CardItem>
          </Card>
        </Content>
      </Container>
    );

    const spinner = (
        <Content style={{marginTop: 100}}>
          <Spinner color='blue' />
        </Content>
    );

    return (
      loading ? spinner : ( hasReq ? body : noRequest)
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

export default Orders