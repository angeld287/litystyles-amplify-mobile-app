import React, {useEffect, useState, useCallback} from 'react';
import { Image, Linking, Platform, Alert, ActivityIndicator, View, Modal, StyleSheet, Text } from "react-native";
import { AppLoading } from "expo";
import { useFonts } from '@use-expo/font';
import { Asset } from "expo-asset";
import { Block, GalioProvider } from "galio-framework";
import { NavigationContainer } from "@react-navigation/native";
import { API, graphqlOperation } from 'aws-amplify';

import { createCustomer, updateCustomer, updateEmployee } from './graphql/mutations';
import { listCustomers, listEmployees } from './graphql/queries';

import firebase from 'react-native-firebase';

import GLOBAL from './global';

import PushNotification from "react-native-push-notification";

import Amplify, { Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
import { ConfirmSignIn, ConfirmSignUp, ForgotPassword, RequireNewPassword, SignUp, VerifyContact, withAuthenticator } from 'aws-amplify-react-native';
import { notificationManager } from './NotificationManager';

// Before rendering any navigation stack
import { enableScreens } from "react-native-screens";
enableScreens();

import Screens from "./navigation/Screens";
import { Images, articles, argonTheme } from "./constants";

import MySignIn from './screens/Auth/MySignIn';
import MySignUp from './screens/Auth/MySignUp';

import InAppbrowser from 'react-native-inappbrowser-reborn'

const messaging = firebase.messaging();

  messaging.hasPermission()
    .then( (enabled) => {
        if (enabled) {
          messaging.getToken()
            .then(token => {
              console.log(token);
              GLOBAL.PHONE_TOKEN = token;
            })
            .catch( err => console.log(err))
        }else {
          messaging.requestPermissions()
            .then(token => {
                GLOBAL.PHONE_TOKEN = token;
              })
            .catch( err => console.log(err))
        }
      }
    )
    .catch(err => {
      console.log(err)
      }
);

firebase.notifications().onNotification((notification) => {
  const {data, title, body} = notification;
  PushNotification.localNotification({
      /* iOS and Android properties */
      title: title, // (optional)
      message: body, // (required)
      vibrate: true,
      vibration: 300,
  });
})

async function urlOpener(url, redirectUrl){
  await InAppbrowser.isAvailable();
  const {type, url: newUrl} = await InAppbrowser.openAuth(url, redirectUrl,
  {
    showTitle: false,
    enableUrlBarHiding: true,
    enableDefaultShare: false,
    ephemeralWebSession: false,
  })

  if (type==="success") {
    Linking.openURL(newUrl)
  }
}

Amplify.configure({
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    urlOpener,
  },
  Analytics: {
    disabled: true,
  },
});


// cache app images
const assetImages = [
  Images.Onboarding,
  Images.LogoOnboarding,
  Images.Logo,
  Images.Pro,
  Images.ArgonLogo,
  Images.iOSLogo,
  Images.androidLogo
];

// cache product images
articles.map(article => assetImages.push(article.image));

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === "string") {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

const sendLocalNotification = () => {

  notificationManager.showNotification(
    1,
    "App Notification",
    "Esto es una prueba de notificacion",
    {},
    {}
  );
  
}

const sendNotifications = (object) => {
  fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          'Authorization': 'key=AAAAd-I4wFI:APA91bGEnWMecuwzNUCeBUTde5HwEYP9eHEtXjhkHHgh7ivKX9yQnyQyxtaRcO5Ny_TLbyQFPoN5bYMEkUClfPr_ql8oDsK1OSw9yC0TCu7-Npjhn-871rJ-rfUW7JIti4EQwkkxu-3r'
          },
          body: JSON.stringify({
                  to: object.to,
                  notification: {
                      title: object.title,
                      body: object.message,
                      sound: 'default',
                  },
                  data: {
                      naviateto: object.naviateto,
                  }
              })
      }).then((r) => r.json()).then().catch((err) => { // Error response
          console.log(err);
      });
  
}

const Home = props => {

  const { roles, username, attributes, userdb, employeedb } = props.authData;

  const [_roles, setRoles ] = useState(roles);
  const [modalVisible, setModalVisible] = useState(false);


  const addUserToGroup = useCallback( 
    async (username) => {
      try {
        const apiOptions = {};

        apiOptions['headers'] = {
            'Content-Type': 'application/json'
        };
        
        apiOptions['body'] = {
          GroupName: 'customer',
          UserPoolId: awsconfig.aws_user_pools_id,
          Username: username
        };

        await API.post('apiForLambda', '/addUserToGroup', apiOptions);

        return true;

      } catch (e) {

        console.log(e);

        return false;
      }
    },
    []
  );

  const appStart = useCallback(
    async () => {
      try {
        var _r = roles;
        var attr = attributes

        if(attr === undefined){
          const usr = await Auth.currentAuthenticatedUser();
          attr = usr.attributes;
        }

        //const hasOnlyGoogleRole = _r !== undefined && _r.length === 1 && _r[0].toUpperCase().includes("GOOGLE");
        if (roles.indexOf('customer') === -1) {
          var added = roles.indexOf('customer') === -1 ? await addUserToGroup(username) : true; 
          if (added) {
            
            _r.push('customer');
            setRoles(_r);

            //cierre de sesion para que se refleje el nuevo rol agregado
            setModalVisible(true);
            sleep(6000).then(async () => {
                setModalVisible(false)
                await Auth.signOut({ global: true });
            });
          }
        }

        const cuser = userdb === null ? await API.graphql(graphqlOperation(createCustomer, {input: {username: username, name: attr.name, image: attr.picture}})) : null;
        
        if(userdb !== null){
          if(userdb.image !== attr.picture){
            await API.graphql(graphqlOperation(updateCustomer, {input: {id: userdb.id, image: attr.picture}}));
          }
        }
          
        if (roles.indexOf('employee') !== -1 || roles.indexOf('supplier') !== -1) {
          if(attr.picture !== undefined && employeedb.image !== attr.picture){
            await API.graphql(graphqlOperation(updateEmployee, {input: {id: employeedb.id, image: attr.picture}}));
          }
        }
        
      } catch (e) {
        //await Auth.signOut();
        console.log(e);
      }
    },
    [addUserToGroup]
  );

  useEffect(() => { 
    appStart();
    notificationManager.configure(onRegister, onNotification, onOpenNotification); 

  }, [notificationManager, appStart]);
  
  const onRegister = (token) => {
    GLOBAL.PHONE_TOKEN = token.token;
    console.log(token);
    //console.log(userdb);
    if(userdb !== null && userdb != undefined && userdb.phoneid !== token.token){
      API.graphql(graphqlOperation(updateCustomer, {input: {id: userdb.id, phoneid: token.token}})).catch(_ => console.log("ha ocurrido un error al actualizar el phoneid del usuario"));
    }
    
    //console.log(employeedb);
    if((roles.indexOf('employee') !== -1 || roles.indexOf('supplier') !== -1) && employeedb !== null && employeedb !== undefined && employeedb.phoneid !== token.token){
      API.graphql(graphqlOperation(updateEmployee, {input: {id: employeedb.id, phoneid: token.token}})).catch(_ => console.log("ha ocurrido un error al actualizar el phoneid del empleado ", _));
    }
  }

  const onNotification = (notification) => {
    //console.log("[Notification] onNotification: ", notification);
  }

  const onOpenNotification = (notify) => {
    //console.log("[Notification] onOpenNotification: ", notify.data.naviateto);
  }

  const [isLoadingComplete, setLoading] = useState(false);
  let [fontsLoaded] = useFonts({
    'ArgonExtra': require('./assets/font/argon.ttf'),
  });

  function _loadResourcesAsync() {
    return Promise.all([...cacheImages(assetImages)]);
  }

  function _handleLoadingError(error) {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

 function _handleFinishLoading() {
    setLoading(true);
  };

  if(!fontsLoaded && !isLoadingComplete) {
    return (
      <AppLoading
        startAsync={_loadResourcesAsync}
        onError={_handleLoadingError}
        onFinish={_handleFinishLoading}
      />
    );
  } else if(fontsLoaded) {

    props.authData.roles = _roles;

    return (
      <NavigationContainer>
        <GalioProvider theme={argonTheme}>
          <Block flex>
            <Screens {...props} SLN={sendLocalNotification}/>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={{marginBottom: 3, fontSize: 16}}>Cierre de Sesion Programado</Text>
                  <Text style={styles.modalText}>En unos segundos procederemos a cerrar la sesion para que se terminen de completar algunas configuracion. Favor iniciar sesion nuevamente.</Text>
                </View>
              </View>
            </Modal>
          </Block>
        </GalioProvider>
      </NavigationContainer>
    );
  } else {
    return null
  }
}

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const AuthScreens = (props) => {
  const [loaging , setLoading] = useState(true);
  const [error , setError] = useState(false);
  props.authData.roles = props.authData.signInUserSession.accessToken.payload['cognito:groups'];
  API.graphql(graphqlOperation(listCustomers, {limit: 400, filter: { username: {eq: props.authData.username}}}))
  .then(r => {
    props.authData.userdb = r.data.listCustomers.items.length !== 0 ? r.data.listCustomers.items[0] : null;

    if(props.authData.attributes === undefined){
      Auth.currentAuthenticatedUser().then(r => {
        props.authData.attributes = r.attributes;
      })
      .catch(e => {
        setLoading(false);
        setError(true);
        console.log(e);
      });
    }

    if(props.authData.signInUserSession.accessToken.payload['cognito:groups'].indexOf('employee') !== -1 || props.authData.signInUserSession.accessToken.payload['cognito:groups'].indexOf('supplier') !== -1){
      _getEmployee();
    }else{
      props.authData.employeedb = null;
      setLoading(false);
    }
  })
  .catch(e => {
    setLoading(false);
    console.log(e);
  });
  
  const _getEmployee = () => {
    API.graphql(graphqlOperation(listEmployees, {limit: 400, filter: { username: {eq: props.authData.username}}})).then(r => {
      props.authData.employeedb = r.data.listEmployees.items.length !== 0 ? r.data.listEmployees.items[0] : null;
      setLoading(false);
    }).catch(e => {
      setLoading(false);
      console.log(e);
    });
  }

  return loaging ? <View style={{marginTop: 40}}><ActivityIndicator size="large" color="#0000ff" /></View> : <Home {...props}/>
};

export default withAuthenticator(AuthScreens, false, [
  <MySignIn/>,
  <ConfirmSignIn/>,
  <VerifyContact/>,
  <MySignUp/>,
  <ConfirmSignUp/>,
  <ForgotPassword/>,
  <RequireNewPassword />
]);

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});