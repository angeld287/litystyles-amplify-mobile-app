import React from 'react';
import { StyleSheet, Dimensions, View, ActivityIndicator, List } from 'react-native';
import { withNavigation } from '@react-navigation/compat';
import { Block, theme } from 'galio-framework';

import { Item } from '.';
const { width } = Dimensions.get('screen');

const Products = (props) => {

const _products = (!props.loading && props.products !== null)?([].concat(props.products)
		.map((item,i)=> <Item {...props} key={i} item={item}  />) ):(<Item></Item>)

return (
    <Block flex>
      {props.loading &&
        <View style={{marginTop: 40}}>
           <ActivityIndicator size="large" color="#0000ff" />
        </View>
      }
      {!props.loading && <List>{_products}</List>}

    </Block>
 );
}

const styles = StyleSheet.create({
  companies: {
    width: width,    
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
});

export default withNavigation(Products);
