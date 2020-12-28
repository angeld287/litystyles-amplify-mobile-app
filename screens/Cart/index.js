import React, { useEffect, useState, useCallback } from 'react';
import { Image, Alert } from 'react-native';
import { Block } from "galio-framework";
import { Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right, Badge, List, ListItem , Spinner} from 'native-base';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { updateRequestProduct, deleteRequestProduct } from "../../graphql/mutations";
import { getCompany, getRequest } from "../../graphql/queries";
import { listRequestsForProducts, getCompanyForCart } from "../../graphql/customQueries";
import { updateRequestForCart } from "../../graphql/customMutations";

import _default from "../../images/default-image.png";

import CartItems from "../../components/CartItems";

import { sendNotifications } from '../../constants/functions'; 

import moment from 'moment';
import 'moment/min/locales';

moment.locale('es')

import NumericInput from 'react-native-numeric-input'

const Cart = (props) => {

    const [image, setImage ] = useState('');
    const [supplier, setSupplier ] = useState(null);
    const [company, setCompany ] = useState(null);
    const [request, setRequest ] = useState(null);
    const [loading, setLoading ] = useState(true);
    const [cancelLoading, setCancelLoading ] = useState(false);
    const [sendLoading, setSendLoading ] = useState(false);
    const [hasReq, setHasReq ] = useState(false);
    const [ updateQtyLoading , setUpdateQtyLoading ] = useState(true)
    const [ itemLoading, setItemLoading ] = useState('')
    const [ deleteItemLoading, setDeleteItemLoading ] = useState('')


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

    const updateQuatity = async (item, qty) => {
      try {
        setItemLoading(item.id)
        var _total = 0;
        var _productCost = 0;
        
        request.product.items.filter(_ => _.id !== item.id).forEach(e => {
          _total = _total + parseInt(e.cost);
        });

        _productCost = (item.productCost * qty)
        _total = _total + _productCost;

        await API.graphql(graphqlOperation(updateRequestProduct, { input: {id: item.id, quantity: qty, cost: _productCost}}));
        const req = await API.graphql(graphqlOperation(updateRequestForCart, {input: {id: request.id, total: _total}}));

        setRequest(req.data.updateRequest);
        setItemLoading('')
      } catch (e) { 
        console.log(e);
        setItemLoading('')
      }
    }

    const deleteItem = async (item) => {
      try {
        setDeleteItemLoading(item.id);
        if(request.product.items.length === 1){
          await API.graphql(graphqlOperation(updateRequestForCart, {input: {id: request.id, state: 'CANCELED'}}));
          setRequest(null);
          setHasReq(false);
        }else{

          var _total = 0;
          
          request.product.items.filter(_ => _.id !== item.id).forEach(e => {
            _total = _total + parseInt(e.cost);
          });

          await API.graphql(graphqlOperation(deleteRequestProduct, { input: {id: item.id}}));
          const req = await API.graphql(graphqlOperation(updateRequestForCart, {input: {id: request.id, total: _total}}));

          setRequest(req.data.updateRequest);
        }

        setDeleteItemLoading('');
      } catch (e) {
        console.log(e);
        setDeleteItemLoading('');
      }
    }

    const SendRequest = async (item) => {
      try {
        setSendLoading(true);
          
        await API.graphql(graphqlOperation(updateRequestForCart, {input: {id: request.id, state: 'AWAITING_APPROVAL'}}));
        setRequest(null);
        setHasReq(false);

        setSendLoading(false);
      } catch (e) {
        console.log(e);
        setSendLoading(false);
      }
    }

    const CancelRequest = async (item) => {
      try {
        setCancelLoading(true);
          
        await API.graphql(graphqlOperation(updateRequestForCart, {input: {id: request.id, state: 'CANCELED'}}));
        setRequest(null);
        setHasReq(false);

        setCancelLoading(false);
      } catch (e) {
        console.log(e);
        setCancelLoading(false);
      }
    }

    useEffect(() => {
        async function fetchData() {
            try {
              setLoading(true)
              var request = null;
              var userRequests = {};
              var _nextToken = null;

              userRequests = await API.graphql(graphqlOperation(listRequestsForProducts, {limit: 100, filter: {state: {eq: 'ON_CART'}}}));
              _nextToken = userRequests.data.listRequests.nextToken;

              if(userRequests.data.listRequests.items.length === 0){
                while (_nextToken !== null) {
                  userRequests = await API.graphql(graphqlOperation(listRequestsForProducts, {limit: 100, nextToken: userRequests.data.listRequests.nextToken, filter: {state: {eq: 'ON_CART'}}}));
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

              if(request !== null){
                setRequest(request);
                const company = await API.graphql(graphqlOperation(getCompanyForCart, {id: request.companyId}));

                setSupplier(company.data.getCompany.offices.items[0]);
  
                setCompany(company.data.getCompany);
  
                const img = await getImageFromStorage(company.data.getCompany.offices.items[0].image);
                setImage(img);
              }

              setLoading(false);
            } catch (e) {
              setLoading(false);
              console.log(e);
            }
        }
        fetchData();

    }, [getImageFromStorage]);

    const _products = (request !== null && company !== null && request.product.items.length > 0)?([].concat(request.product.items)
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
                    quantity_available: company.products.items.filter(_ => _.product.id === item.product.id)[0].quantity,
                    productId: company.products.items.filter(_ => _.product.id === item.product.id)[0].id,
                    productCost: company.products.items.filter(_ => _.product.id === item.product.id)[0].cost,
                };

          return (<CartItems itemLoading={itemLoading} updateQuatity={updateQuatity} remove numeric item={product} deleteItemLoading={deleteItemLoading} deleteItem={deleteItem} horizontal/>);
        }

    )):(<Block></Block>)
  
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
                <Thumbnail source={{uri: image}} />
                <Body>
                  <Text>{supplier !== null ? supplier.name : ""}</Text>
                  <Text note>{supplier !== null ? supplier?.employees.items[0].name : ""}</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem>
                <Content>
                  <Button rounded block warning onPress={(e) => { e.preventDefault(); SendRequest() }}>
                    { sendLoading && <Spinner color='white' style={{marginRight: 10}} /> }
                    { !sendLoading && <Text>Enviar Solicitud</Text> }
                  </Button>
                </Content>
            </CardItem>
            <CardItem cardBody>
              <Block flex style={{padding: 5}}>
                {_products}
              </Block>
            </CardItem>
            <CardItem>
              <Left>
                <Content>
                  <Button rounded block warning onPress={(e) => { e.preventDefault(); SendRequest() }}>
                      { sendLoading && <Spinner color='white' /> }
                      { !sendLoading && <Text>Solicitar</Text> }
                  </Button>
                </Content>
              </Left>
              <Right>
                <Content>
                  <Button block danger rounded onPress={(e) => { e.preventDefault(); CancelRequest() }} >
                    { cancelLoading && <Spinner color='white' /> }
                    { !cancelLoading && <Text>Cancelar</Text> }
                  </Button>
                </Content>
              </Right>
            </CardItem>
          </Card>
        </Content>
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

export default Cart