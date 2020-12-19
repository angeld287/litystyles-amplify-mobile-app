import React, { useEffect, useState, useCallback } from 'react';
import { Image, Alert } from 'react-native';
import { Block } from "galio-framework";
import { Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right, Badge, List, ListItem } from 'native-base';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { createRequest, createRequestProduct, createRequestCustomer, updateRequestProduct } from "../../graphql/mutations";
import { listRequestsForProducts } from "../../graphql/customQueries";

import _default from "../../images/default-image.png";

import CartItems from "../../components/CartItems";

import { sendNotifications } from '../../constants/functions'; 

import moment from 'moment';
import 'moment/min/locales';

moment.locale('es')

import NumericInput from 'react-native-numeric-input'

const Orders = (props) => {

    const [image, setImage ] = useState('');
    const [_quantity, setQuantity ] = useState(1);
    const [_cost, setCost ] = useState();
    const [loading, setLoading ] = useState(false);


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
              const img = await getImageFromStorage('OFFICES_PROFILE_IMAGES/4cef4c33-d515-4245-bd0e-21c98f016455.jpeg');
              setImage(img);
            } catch (e) {
              console.log(e);
            }
        }
        fetchData();

    }, [getImageFromStorage]);

    var office = {
        id: 'item.id',
        title: 'Alcoholado',
        image: 'PRODUCTS_IMAGES/1607660366760_Alcoholado.jpeg',
        cta: 'Entrar', 
        horizontal: true,
        supplier: false,
        cost: "140"
    };

    var office1 = {
      id: 'item.id',
      title: 'Neck Paper',
      image: 'PRODUCTS_IMAGES/1607734206667_Neck_Paper.jpeg',
      cta: 'Entrar', 
      horizontal: true,
      supplier: false,
      cost: "140"
  };
  
    return (
      <Container>
        <Header />
        <Content>
          <Card>
            <CardItem>
              <Text>Subtotal (3 Items):</Text>
              <Badge style={{marginLeft: 4}} danger>
                <Text>RD$ 400</Text>
              </Badge>
            </CardItem>
            <CardItem>
              <Left>
                <Thumbnail source={{uri: image}} />
                <Body>
                  <Text>Angel Barber Supplier</Text>
                  <Text note>George David Mateo Rosario</Text>
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
                <CartItems item={office} horizontal/>
                <CartItems item={office1} horizontal/>
              </Block>
            </CardItem>
          </Card>
        </Content>
      </Container>
    );
}

export default Orders