import React, {useEffect , useCallback, useState} from 'react';
import { withNavigation } from '@react-navigation/compat';
import PropTypes from 'prop-types';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { StyleSheet, Dimensions, Image, TouchableWithoutFeedback, ListItem, Left, Right, Body, Thumbnail, Text, Button, Alert } from 'react-native';
import { Block, theme } from 'galio-framework';
import defaultImage from  '../images/default-image.png';
import GLOBAL from '../global';

import { argonTheme } from '../constants';


const Item = (props) => {
  
    const { navigation, item, horizontal, full, style, ctaColor, imageStyle } = props;

    const [ _image , setImage ] = useState('')
    const [ loading , setLoading ] = useState(true)

    const getImageFromStorage = useCallback(
      async (image) => {
        try {
          if(image !== null) {
              var i = await Storage.get(image, { level: 'public' });
              return i
          }else{
              return defaultImage;
          }
        } catch (e) {
            console.log(e); 
            return defaultImage;
        }
      },
      [],
    );

    useEffect(() => {
      async function fetchData() {
          try {
            setLoading(true)
            const img = await getImageFromStorage(item.product.image);
            setImage(img);
            setLoading(false);
          } catch (e) {
            console.log(e);
            setLoading(false);
          }
      }
      fetchData();
    }, [getImageFromStorage]);
    
    const imageStyles = [
      full ? styles.fullImage : styles.horizontalImage,
      imageStyle
    ];
    const cardContainer = [styles.card, styles.shadow, style];
    const imgContainer = [styles.imageContainer,
      horizontal ? styles.horizontalStyles : styles.verticalStyles,
      styles.shadow
    ];

    return (
      <ListItem avatar>
            <Left>
                <Thumbnail source={{uri: _image}} />
            </Left>
            <Body>
                <Text>{item.product.name}</Text>
                <Text note>{item.quantity} unidad(es) disponible(s)</Text>
            </Body>
            <Right>
                <Button transparent onPress={() => { navigation.navigate('ProductDetail', {product: item})}}><Text>Ver</Text></Button>
            </Right>
      </ListItem>
    );
  
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 114,
    marginBottom: 16
  },
  cardTitle: {
    flex: 1,
    flexWrap: 'wrap',
    paddingBottom: 6
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2
  },
  imageContainer: {
    borderRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  image: {
    // borderRadius: 3,
  },
  horizontalImage: {
    height: 122,
    width: 'auto',
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0
  },
  fullImage: {
    height: 215
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
});

export default withNavigation(Item);