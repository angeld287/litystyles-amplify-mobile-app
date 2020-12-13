import React, { useEffect, useState, useCallback } from 'react';
import { Image } from 'react-native';
import { Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right } from 'native-base';
import { API, graphqlOperation, Storage } from 'aws-amplify';

const ProductDetail = (props) => {
    const [image, setImage ] = useState('');

    const {cost, quantity, product } = props.route.params.product;

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
  
    return (
      <Container>
        <Header />
        <Content>
          <Card>
            <CardItem>
              <Left>
                {/* <Thumbnail source={{uri: 'Image URL'}} /> */}
                <Body>
                  <Text>{product.name}</Text>
                  <Text note>{quantity} unidad(es) disponible(s)</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem cardBody>
              <Image source={{uri: image}}  style={{height: 200, width: null, flex: 1}}/>
            </CardItem>
            <CardItem>
              <Left>
                  <Icon active type="MaterialIcons" name="attach-money" />
                  <Text>{cost}</Text>
              </Left>
              <Body>
                <Button transparent>
                  <Text>Solicitar</Text>
                </Button>
              </Body>
              <Right>
                <Text>{product.packagingformat}</Text>
              </Right>
            </CardItem>
          </Card>
        </Content>
      </Container>
    );
}

export default ProductDetail