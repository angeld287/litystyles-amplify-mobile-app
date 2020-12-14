import React, { useEffect, useState, useCallback } from 'react';
import { Image } from 'react-native';
import { Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right, Input, Spinner } from 'native-base';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { Block } from "galio-framework";

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
        const _date = moment(new Date()).format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z';
    /* 
        const ri = {state: 'ON_CART', paymentType: 'CASH', customerName: authData.attributes.name, customerUsername: authData.username, companyId: employee.companyId, date: _date, createdAt: _date};
        const rpi = {requestProductRequestId: "", requestProductProductId: "", quantity: "", cost: "", createdAt: _date};
        const rci = {resposibleName: "", requestCustomerRequestId: "", requestCustomerCustomerId: "", createdAt: _date, cost: ""};
        
        try {
          setLoading(true);
          
                var request = {};
                request = await API.graphql(graphqlOperation(createRequest, {input: ri}));
    
                rei.requestEmployeeRequestId = request.data.createRequest.id;
          rsi.requestServiceRequestId = request.data.createRequest.id;
          rci.requestCustomerRequestId = request.data.createRequest.id;
    
          await API.graphql(graphqlOperation(createRequestService, {input: rsi}));
          await API.graphql(graphqlOperation(createRequestCustomer, {input: rci}));
    
          if(employee.phoneid !== null && employee.phoneid !== ""){
            const object = {
                to: employee.phoneid,
                title: 'Nueva Solicitud de Servicio',
                body: "Ha recibido una nueva solicitud de "+authData.attributes.name,
                sound: 'default',
                naviateto: "Employee",
            }
    
            await sendNotifications(object);
          }
          
          GLOBAL.HAS_REQUEST = true;
    
          navigation.navigate('Homee');
          navigation.navigate('RequestInfo');
          
          setLoading(false);
    
        } catch (e) {
          setLoading(false);
          setErrorsr(true)
          setErrorsrm('Ha ocurrido un error. Favor intentar mas tarde');
        } */
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