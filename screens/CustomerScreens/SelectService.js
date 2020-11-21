import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Container, Header, Content, List, ListItem, Left, Right, Button, Text, Icon } from 'native-base';

import { theme } from 'galio-framework';

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

const SelectServices = ({ route, navigation }) => {
  const [ loading, setLoading ] = useState(true);

  const { employee } = route.params;

  const isCustomer = (route.params?.authData.roles.indexOf('customer') !== -1);

  useEffect(() => {
    let didCancel = false;
		const fetch = async () => {
      setLoading(true);
      try {
        
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
  }, []);

  // sleep time expects milliseconds
  function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  const _servicesList = (employee._companyServices !== null)?([].concat(employee._companyServices).map((e,i)=> 
        <ListItem noIndent onPress={() => { navigation.navigate('SendRequest', {employee: employee, service: e})}}>
          <Left>
            <Text>{e.service.name}</Text>
          </Left>
          <Right>
            <Button transparent onPress={() => { navigation.navigate('SendRequest', {employee: employee, service: e})}}><Icon name="arrow-forward" /></Button>
          </Right>
        </ListItem>
  )):(<ListItem></ListItem>)

 return (
  <Container>
    <Header />
    <Content>
      <List>
        {_servicesList}
      </List>
    </Content>
  </Container>
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
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure
  }
});

export default SelectServices;
