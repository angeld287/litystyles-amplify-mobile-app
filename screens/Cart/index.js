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

const Cart = (props) => {

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
              //const img = await getImageFromStorage(props.route.params.product.product.image);
              //setImage(img);
            } catch (e) {
              console.log(e);
            }
        }
        fetchData();

    }, [getImageFromStorage]);
  
    return (
      <Container>
        <Content>
            <Text>Soy el Carrito</Text>          
        </Content>
      </Container>
    );
}

export default Cart