import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, View, ActivityIndicator, ImageBackground } from 'react-native';
import { Container, Header, Content, List, ListItem, Thumbnail, Left, Body, Right, Button, Card, CardItem, Icon, Text, Subtitle, Spinner } from 'native-base';

import { Block, NavBar, theme, Accordion } from 'galio-framework';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { Images } from "../../constants";
import { HeaderHeight } from "../../constants/utils";

import { getOffice, listRequests, getCompany } from '../../graphql/customQueries';

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

const Office = ({ route, navigation }) => {
  
  const [ office, setOffice ] = useState(null);
  const [ employees, setEmployees ] = useState(null);
  const [ _image , setImage ] = useState('')
  const [ loading, setLoading ] = useState(true);

  const { id } = route.params;

  const isCustomer = (route.params?.authData.roles.indexOf('customer') !== -1);


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

  const _employeesList = (employees !== null)?([].concat(employees).map((e,i)=> 
        <CardItem>
          <Left>
              <Icon active name="person" />
          </Left>
          <Body>
            <Text>{e.name}</Text>
            <Text note>{e.quantity} cliente(s) en turno</Text>
          </Body>          
          <Right>
            <Button transparent onPress={() => { navigation.navigate('SelectService', {employee: e})}}><Text>Solicitar Servicio</Text></Button>
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
        var image = '';
        var _employees = [];

        officeApi = await API.graphql(graphqlOperation(getOffice, { id: id }));
        setOffice(officeApi.data.getOffice);
        
        companyApi = await API.graphql(graphqlOperation(getCompany, { id: officeApi.data.getOffice.companyId } ) );
        companyServices = companyApi.data.getCompany.services.items;
        
        image =  await getImageFromStorage(officeApi.data.getOffice.image);

        setImage(image);
        officeApi.data.getOffice.employees.items.filter(_ => _.services.items.length > 0).forEach(async e => {
          var reqs = null;
          var _companyServices = [];
          const _filter = {
            and: {or: {state: {eq: 'IN_PROCESS'}, state: {eq: 'ON_HOLD'}}, resposibleName: {eq: e.username}}
          }
          reqs =  await API.graphql(graphqlOperation(listRequests, { limit: 400, filter: _filter } ) );
          
          e.services.items.forEach(es => {  
            _companyServices.push(companyServices[companyServices.findIndex(_ => _.service.id === es.service.id)]);
          });
          
          _employees.push({ ...e, companyId: officeApi.data.getOffice.companyId, _companyServices, quantity: reqs.data.listRequests.items.length});
        });

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
        <Content style={{marginTop: 40}}>
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
                <Subtitle style={{margin: 5}}>{office.name}</Subtitle>
                <Content>
                  <Card>
                    {_employeesList}
                  </Card>
                </Content>
              </Container>
            </ScrollView>
          </ImageBackground>
        </Block>
      }
    </Block>
 );
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1
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
