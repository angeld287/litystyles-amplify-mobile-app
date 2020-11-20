import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, View, ActivityIndicator, ImageBackground } from 'react-native';
import { Button, Block, NavBar, Text, theme, Accordion } from 'galio-framework';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { Images } from "../constants";

import { getOffice, listRequests } from '../graphql/customQueries';

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

const RequestService = ({ route, navigation }) => {
  const [ office, setOffice ] = useState(null);
  const [ employees, setEmployees ] = useState(null);
  const [ _image , setImage ] = useState('')
  const [ loading, setLoading ] = useState(true);

  const { employeeid, employeeusername } = route.params;

  const isCustomer = (route.params?.authData.roles.indexOf('customer') !== -1);

  useEffect(() => {
    console.log(employeeid, employeeusername);
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
  
  const data = [
    { title: 'test' , content: "Lorem ipsum dolor sit amet" },
    { title: "2nd Chapter", content: JSON.stringify(id) },
    { title: "3rd Chapter", content: "Lorem ipsum dolor sit amet" }
  ];

 return (
    <Block flex style={styles.profile}>
      <Text>Solicitar Servicio</Text>
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
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure
  }
});

export default RequestService;
