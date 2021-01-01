import React, { useEffect, useState, useCallback } from 'react';
import { Image, Alert } from 'react-native';
import { Block } from "galio-framework";
import { Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right, Badge, List, ListItem, Spinner } from 'native-base';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { createRequest, createRequestProduct, createRequestCustomer, updateRequestProduct } from "../../graphql/mutations";
import { listRequestsForProducts, getRequestForOrderDetail, getCompanyForCart } from "../../graphql/customQueries";

import _default from "../../images/default-image.png";

import CartItems from "../../components/CartItems";

import { sendNotifications } from '../../constants/functions'; 

import moment from 'moment';
import 'moment/min/locales';

moment.locale('es')

import NumericInput from 'react-native-numeric-input'

const Orders = (props) => {

    const [image, setImage ] = useState('');
    const [supplier, setSupplier ] = useState(null);
    const [company, setCompany ] = useState(null);
    const [request, setRequest ] = useState(null);
    const [loading, setLoading ] = useState(true);
    const [hasReq, setHasReq ] = useState(false);


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
              setLoading(true)
              var request = null;
              var userRequests = {};
              var _nextToken = null;

              userRequests = await API.graphql(graphqlOperation(listRequestsForProducts, {limit: 100, filter: { or: [ {state: {eq: 'AWAITING_APPROVAL'}}, {state: {eq: 'APPROVED'}}]}}));
              _nextToken = userRequests.data.listRequests.nextToken;

              while (_nextToken !== null) {
                userRequests = await API.graphql(graphqlOperation(listRequestsForProducts, {limit: 100, nextToken: userRequests.data.listRequests.nextToken, filter: { or: [ {state: {eq: 'AWAITING_APPROVAL'}}, {state: {eq: 'APPROVED'}}]}}));
                if(userRequests.data.listRequests.items.length > 0){
                  request = userRequests.data.listRequests.items[0];
                  break;
                }
                _nextToken = userRequests.data.listRequests.nextToken;
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
              console.log(e);
            }
        }

        async function fetcRequest() {
            try {
              setLoading(true)
              var request = null;
              var userRequests = {};
              var _nextToken = null;

              userRequests = await API.graphql(graphqlOperation(getRequestForOrderDetail, {id: props.route.params.id}));
              request = userRequests.data.getRequest;

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
              console.log(e);
            }
        }

        if(props.route.params.id === undefined){
          fetchData();
        }else{
          fetcRequest();
        }

    }, [getImageFromStorage, props]);

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
                <Thumbnail source={{uri: image}} />
                <Body>
                  <Text>{supplier !== null ? supplier.name : ""}</Text>
                  <Text note>{supplier !== null ? supplier?.employees.items[0].name : ""}</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem>
                <Content>
                  <Text>En Espera de Aprobacion</Text>
                </Content>
            </CardItem>
            <CardItem cardBody>
              <Block flex style={{padding: 5}}>
                {_products}
              </Block>
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

export default Orders