import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, ScrollView, Text } from 'react-native';
import { Block, theme } from 'galio-framework';

import { Card, Companies } from '../components';
import articles from '../constants/articles';
const { width } = Dimensions.get('screen');

const Home = (props) => {

  const isCustomer = (props.route.params?.authData.roles.indexOf('customer') !== -1);


 return (
   <Block flex center style={styles.home}>
      <ScrollView
       showsVerticalScrollIndicator={false}
       contentContainerStyle={styles.articles}>
       <Companies isBarber={props.route.params.isBarber}/>
      </ScrollView>
   </Block>
 );
}

const styles = StyleSheet.create({
  home: {
    width: width,    
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
});

export default Home;
