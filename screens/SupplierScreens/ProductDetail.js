import React, { useEffect, useState, useCallback } from 'react';
import { Image, Alert } from 'react-native';
import { Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right, Input, Spinner } from 'native-base';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { createRequest, createRequestProduct, createRequestCustomer, updateRequestProduct } from "../../graphql/mutations";
import { listRequestsForProducts } from "../../graphql/customQueries";

import { sendNotifications } from '../../constants/functions'; 

import moment from 'moment';
import 'moment/min/locales';

moment.locale('es')

import NumericInput from 'react-native-numeric-input'

const ProductDetail = (props) => {
    const {cost, quantity, product } = props.route.params.product;

    const [image, setImage ] = useState('');
    const [_quantity, setQuantity ] = useState(1);
    const [_cost, setCost ] = useState(cost*_quantity);
    const [addCartLoading, setAddCartLoading ] = useState(false);


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
            try {
              const img = await getImageFromStorage(props.route.params.product.product.image);
              setImage(img);
            } catch (e) {
              console.log(e);
            }
        }
        fetchData();

    }, [getImageFromStorage]);

    const addToTheCart = async () => {
       try {
        setAddCartLoading(true);

          const _date = moment(new Date()).format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z';
              
          const ri = {state: 'ON_CART', paymentType: 'CASH', customerName: props.route.params.authData.attributes.name, customerUsername: props.route.params.authData.username, companyId: props.route.params.office.companyId, date: _date, createdAt: _date};
          const rpi = {requestProductRequestId: "", requestProductProductId: product.id, quantity: _quantity, cost: _cost, createdAt: _date};
          const rci = { requestCustomerRequestId: "", requestCustomerCustomerId: props.route.params.authData.userdb.id, createdAt: _date, cost: _cost};
          var request = null;
          var userRequests = {};
          var _nextToken = null;

          userRequests = await API.graphql(graphqlOperation(listRequestsForProducts, {limit: 100, filter: {state: {eq: 'ON_CART'}}}));
          _nextToken = userRequests.data.listRequests.nextToken;

          while (_nextToken !== null) {
            userRequests = await API.graphql(graphqlOperation(listRequestsForProducts, {limit: 100, nextToken: userRequests.data.listRequests.nextToken, filter: {state: {eq: 'ON_CART'}}}));
            if(userRequests.data.listRequests.items.length > 0){
              request = userRequests.data.listRequests.items[0];
              break;
            }
            _nextToken = userRequests.data.listRequests.nextToken;
          }

          if(request === null){
            request = await API.graphql(graphqlOperation(createRequest, {input: ri}));
            rpi.requestProductRequestId = request.data.createRequest.id;
            rci.requestCustomerRequestId = request.data.createRequest.id;

            await API.graphql(graphqlOperation(createRequestCustomer, {input: rci}));
            await API.graphql(graphqlOperation(createRequestProduct, {input: rpi}));

          }else{
            if (props.route.params.office.companyId === request.companyId) {
              rpi.requestProductRequestId = request.id;

              if(request.product.items.findIndex(_ =>_.product.id === product.id) === -1){

                await API.graphql(graphqlOperation(createRequestProduct, {input: rpi}));

              }else{

                const qty = parseInt(request.product.items[request.product.items.findIndex(_ =>_.product.id === product.id)].quantity) + parseInt(_quantity);
                const id = request.product.items[request.product.items.findIndex(_ =>_.product.id === product.id)].id;
                const rpcost = cost * qty;
                
                await API.graphql(graphqlOperation(updateRequestProduct, {input: {id: id, quantity: qty, cost: rpcost }}));
              }
            }else{
              Alert.alert("Hay una compra en el carrito", "Para poder comprar a otro suplidor, debe solicitar o cancelar la existente.");
            }
          }

          /* if(props.route.params.office.employees.items[0].phoneid !== null && props.route.params.office.employees.items[0].phoneid !== ""){
            const object = {
                to: employee.phoneid,
                title: 'Nueva Solicitud de Producto',
                body: "Ha recibido una nueva solicitud de "+props.route.params.authData.attributes.name,
                sound: 'default',
                naviateto: "Employee",
            }
    
            await sendNotifications(object);
          } */
          
          setAddCartLoading(false);
    
        } catch (e) {
          console.log(e);
          setAddCartLoading(false);
          setErrorsr(true)
          setErrorsrm('Ha ocurrido un error. Favor intentar mas tarde');
        }
    }
  
    return (
      <Container>
        <Header />
        <Content>
          <Card>
            <CardItem>
              <Left>
                {/* <Thumbnail source={{uri: 'Image URL'}} /> */}
                <Body>
                  <Text>{product.name} {product.packagingformat}</Text>
                  <Text note>{quantity} unidad(es) disponible(s)</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem cardBody>
              <Image source={{uri: image}}  style={{height: 200, width: null, flex: 1}}/>
            </CardItem>
            <CardItem>
              <Left>
                <Text>Qty  </Text>
                <NumericInput minValue={1} maxValue={quantity} value={_quantity} onChange={value => {setQuantity(value); setCost(value*cost)}} />
              </Left>
              <Right>
                {/* <Icon active type="MaterialIcons" name="attach-money" /> */}
                <Text>RD$ {_cost}</Text>
              </Right>
            </CardItem>
            <CardItem>
                <Button onPress={e => { e.preventDefault(); addToTheCart()}}>
                  <Text>Añadir al Carito</Text>{!addCartLoading && <Icon type="FontAwesome" name="cart-plus" style={{fontSize: 30}} color={'primary'} />}{addCartLoading && <Spinner color='white' style={{marginRight: 10}} />}
                </Button>
            </CardItem>
          </Card>
        </Content>
      </Container>
    );
}

export default ProductDetail