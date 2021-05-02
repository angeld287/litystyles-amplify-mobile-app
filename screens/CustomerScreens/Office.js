import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, View, ActivityIndicator, ImageBackground, Platform } from 'react-native';
import { Container, Header, Content, List, ListItem, Thumbnail, Left, Body, Right, Button, Card, CardItem, Icon, Text, Subtitle, Spinner } from 'native-base';

import { Block, theme } from 'galio-framework';
import { API, graphqlOperation, Storage } from 'aws-amplify';

import _image from "../../images/avatardefault.png";

import { getOffice, listRequests, getCompany } from '../../graphql/customQueries';
import getListCompleted from "../../constants/getList";

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

const Office = (props) => {
 
  const { route, navigation } = props;
  const [ office, setOffice ] = useState(null);
  const [ products, setProducts ] = useState([]);
  const [ employees, setEmployees ] = useState(null);
  const [ _image , setImage ] = useState('')
  const [ loading, setLoading ] = useState(true);

  const { id, supplier } = route.params;

  const isCustomer = (route.params?.authData.roles.indexOf('customer') !== -1);


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

  const _products = (!loading && products !== null)?([].concat(products)
    .map((item,i)=> 
    <ListItem key={i} avatar>
            <Left>
                <ProductImage image={item.product.image} />
            </Left>
            <Body>
                <Text style={{marginBottom: 5}}>{item.product.name}</Text>
                <Text note>{item.quantity} unidad(es) disponible(s)</Text>
            </Body>
            <Right>
                <Button transparent onPress={() => { navigation.navigate('ProductDetail', {product: item, office: office})}}><Text style={{color: 'blue'}}>Ver</Text></Button>
            </Right>
      </ListItem>
    ) ):(<ListItem></ListItem>)

  const _employeesList = (employees !== null)?([].concat(employees).map((e,i)=> 
        <CardItem key={i}>
          <Left>
              <Icon active name="person" />
          </Left>
          <Body>
            <Text>{e.name}</Text>
            <Text note>{e.quantity} en turno</Text>
          </Body>         
          <Right>
          <Button transparent onPress={() => { navigation.navigate('SelectService', {employee: e})}}><Icon type="Entypo" active name="arrow-with-circle-right" style={{fontSize: 40}}/></Button>
          </Right>
        </CardItem>
  )):(<Block></Block>)

  useEffect(() => {
    let didCancel = false;
    const fetch = async () => {
      setLoading(true);
      try {
        var officeApi = null;
        var companyApi = null;
        var companyServices = [];
        var companyProducts = [];
        var image = '';
        var _employees = [];

        officeApi = await API.graphql(graphqlOperation(getOffice, { id: id }));
        setOffice(officeApi.data.getOffice);
       
        companyApi = await API.graphql(graphqlOperation(getCompany, { id: officeApi.data.getOffice.companyId } ) );
        companyServices = companyApi.data.getCompany.services.items;
        companyProducts = companyApi.data.getCompany.products.items;
       
        image =  await getImageFromStorage(officeApi.data.getOffice.image);

        setImage(image);
        for (const e of officeApi.data.getOffice.employees.items.filter(_ => _.services.items.length > 0)) {
          var reqs = null;
          var _companyServices = [];
          const _filter = {
            and: {or: {state: {eq: 'IN_PROCESS'}, state: {eq: 'ON_HOLD'}}, resposibleName: {eq: e.username}}
          }

          //solo puede ver la cantidad de request del empleado si la oficina es diferente de suplidor ya que los suplidores no necesitan empleados
          if(!supplier){
            reqs = await getListCompleted('listRequests', listRequests, _filter);
            //console.log(resu__);
            //reqs =  await API.graphql(graphqlOperation(listRequests, { limit: 1000, filter: _filter } ) );
          }
         
          e.services.items.forEach(es => {  
            var _es = companyServices[companyServices.findIndex(_ => _.service.id === es.service.id)];
            _es.duration = es.duration
            _companyServices.push(_es);
          });
         
          _employees.push({ ...e, companyId: officeApi.data.getOffice.companyId, _companyServices, quantity: reqs.length});
        }

        setProducts(companyProducts);
        setEmployees(_employees);

        sleep(1000).then(() => {
          setLoading(false)
        });
       
      } catch (e) {
         console.log(e);
         setLoading(false)
      }
    };

    fetch();

    return () => {
      didCancel = true;
    };
  }, [getImageFromStorage]);

  // sleep time expects milliseconds
  function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
 

 return (
    <Block flex style={styles.profile}>
      {loading &&
        <Content style={{marginTop: 100}}>
          <Spinner color='blue' />
        </Content>
      }
      {!loading &&
        <Block flex>
          <ImageBackground
            source={{uri: _image}}
            style={styles.profileContainer}
            imageStyle={styles.profileBackground}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ width, marginTop: '25%' }}
            > 
              <Container style={{marginTop: 200}}>
                {Platform.OS === "ios" && <Subtitle style={{margin: 5}}>{office.name}</Subtitle>}
                {Platform.OS === "android" && <Block center><Text note style={{margin: 5}}>{office.name}</Text></Block>}
                <Content>
                  {!supplier && <Card>{_employeesList}</Card>}
                  {supplier && <List>{_products}</List>}
                </Content>
              </Container>
            </ScrollView>
          </ImageBackground>
        </Block>
      }
    </Block>
 );
}

const ProductImage = (props) => {
 
  const { image } = props;

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
          const img = await getImageFromStorage(image);
          setImage(img);
          setLoading(false);
        } catch (e) {
          console.log(e);
          setLoading(false);
        }
    }
    fetchData();
  }, [getImageFromStorage]);

  return (<Thumbnail source={{uri: _image}} />);

}

const styles = StyleSheet.create({
  profile: {
    //marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: Platform.OS === "ios" ? 1 : 0
  },
  profileBackground: {
    width: width,
    height: height / 2
  },
  profileCard: {
    // position: "relative",
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 200,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2
  },
  info: {
    paddingHorizontal: 40
  },
  avatarContainer: {
    position: "relative",
    marginTop: -80
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0
  },
  nameInfo: {
    marginTop: 35,
    marginBottom: 35
  },
  divider: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#E9ECEF"
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure
  }
});

export default Office;