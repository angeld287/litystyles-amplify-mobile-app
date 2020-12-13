import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, ScrollView, View } from 'react-native';
import { Button, Block, NavBar, Text, theme } from 'galio-framework';

import { Card, Companies } from '../../components';
import Input from '../../components/Input';
import Icon from '../../components/Icon';
import argonTheme from '../../constants/Theme';
import { API, graphqlOperation } from 'aws-amplify';

import { listCategorys } from '../../graphql/queries';
import { listOfficesHome, listRequests } from '../../graphql/customQueries';

import GLOBAL from '../../global';

const { width } = Dimensions.get('screen');

const Suppliers = (props) => {
  const [ offices, setOffices ] = useState(null);
  const [ _offices, set_Offices ] = useState(null);
  const [ categories, setCategories ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const isCustomer = (props.route.params?.authData.roles.indexOf('customer') !== -1);

  // sleep time expects milliseconds
  function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }


  useEffect(() => {
    let didCancel = false;

		const fetch = async () => {
      setLoading(true);
      try {
        var officesApi = null;
        var categoriesApi = null;
        var c = categories;
        var o = offices;
        var _categoryId = null;

        categoriesApi = await API.graphql(graphqlOperation(listCategorys));
        c = categoriesApi.data.listCategorys.items;
        _categoryId = c[c.findIndex(c => c.code === 'SP01' )].id;

        officesApi = await API.graphql(graphqlOperation(listOfficesHome, {limit: 400, filter: {and: [ {categoryId: {eq: _categoryId}}, {deleted: {ne: true}}, {companyId: {ne: null}}, {image: {ne: null}}, {categoryId: {ne: null}} ] } } ) );
        
        o = officesApi.data.listOffices.items;

        setOffices(o.filter(_ => (_.categoryId !== null) && (_.image !== null) && (_.companyId !== null)));
        setCategories(c);

        set_Offices(o.filter(_ => (_.categoryId !== null) && (_.image !== null) && (_.companyId !== null)).filter(o => o.categoryId === _categoryId));
        setLoading(false);
        
      } catch (e) {
         console.log(e); 
         setLoading(false)
      }
		};

		fetch();

		return () => {
			didCancel = true;
		};
	}, []);

  const renderSearch = () => {
    return (
      <Input
        right
        color="black"
        style={styles.search}
        placeholder="What are you looking for?"
        placeholderTextColor={'#8898AA'}
        //onFocus={() => actions()}
        iconContent={<Icon size={16} color={theme.COLORS.MUTED} name="search-zoom-in" family="ArgonExtra" />}
      />
    );
  }


  const renderHeader = () => {

    const headerStyles = [
      styles.shadow
    ];

      return (
        <Block center style={headerStyles}>
          {renderSearch()}
        </Block>
      );
  }

 return (
   <Block flex center style={styles.home}>
      <ScrollView
       showsVerticalScrollIndicator={false}
       contentContainerStyle={styles.articles}>
       {renderHeader()}
       <Companies supplier={true} {...props} offices={_offices} loading={loading} />
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
  button: {
    padding: 12,
    position: 'relative',
  },
  title: {
    width: '100%',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shadow: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  notify: {
    backgroundColor: argonTheme.COLORS.LABEL,
    borderRadius: 4,
    height: theme.SIZES.BASE / 2,
    width: theme.SIZES.BASE / 2,
    position: 'absolute',
    top: 9,
    right: 12,
  },
  header: {
    backgroundColor: theme.COLORS.WHITE,
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.ICON,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: argonTheme.COLORS.BORDER
  },
  options: {
    marginBottom: 24,
    marginTop: 10,
    elevation: 4,
  },
  tab: {
    backgroundColor: theme.COLORS.TRANSPARENT,
    width: width * 0.35,
    borderRadius: 0,
    borderWidth: 0,
    height: 24,
    elevation: 0,
  },
  tabTitle: {
    lineHeight: 19,
    fontWeight: '400',
    color: argonTheme.COLORS.HEADER
  },
});

export default Suppliers;
