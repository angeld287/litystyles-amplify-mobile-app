import React, {useEffect, useState} from 'react';
import { Image, Linking, Platform, Alert } from "react-native";
import { AppLoading } from "expo";
import { useFonts } from '@use-expo/font';
import { Asset } from "expo-asset";
import { Block, GalioProvider } from "galio-framework";
import { NavigationContainer } from "@react-navigation/native";


import firebase from 'react-native-firebase';

import GLOBAL from './global';

import Amplify, { Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
import { ConfirmSignIn, ConfirmSignUp, ForgotPassword, RequireNewPassword, SignUp, VerifyContact, withAuthenticator } from 'aws-amplify-react-native';
import { notificationManager } from './NotificationManager';

// Before rendering any navigation stack
import { enableScreens } from "react-native-screens";
enableScreens();

import Screens from "./navigation/Screens";
import { Images, articles, argonTheme } from "./constants";
import MySignIn from './components/Auth/MySignIn';

import InAppbrowser from 'react-native-inappbrowser-reborn'

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
          'Authorization': 'key=AIzaSyBnmavsrltI_zvcP8kmZVpwr8fS0e95fQY'
          },
          body: JSON.stringify({
                  to: object.to,
                  notification: {
                      title: object.title,
                      body: object.message,
                      sound: 'default',
                  },
                  data: {
                      consult_id: object.consultation_id,
                  }
              })
      }).then((r) => r.json()).then().catch((err) => { // Error response
          console.log(err);
      });
  
}

const Home = props => {

  useEffect(() => { notificationManager.configure(onRegister, onNotification, onOpenNotification); }, []);
  
  const onRegister = (token) => {
    //console.log("Para insertar token en la db, si no existe", token);
  }

  const onNotification = (notification) => {
    //console.log("[Notification] onNotification: ", notification);
    notificationManager.showNotification(notification.id, notification.title, notification.message, notification.data = {} , {});
  }

  const onOpenNotification = (notify) => {
    //console.log("[Notification] onOpenNotification: ", notify);
    alert("Abrio por fin!!!");
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
    return (
      <NavigationContainer>
        <GalioProvider theme={argonTheme}>
          <Block flex>
            <Screens {...props} SLN={sendLocalNotification}/>
          </Block>
        </GalioProvider>
      </NavigationContainer>
    );
  } else {
    return null
  }
}

const AuthScreens = (props) => {
  //console.log('props', props.authState);
  props.authData.roles = props.authData.signInUserSession.accessToken.payload['cognito:groups'];
  if(props.authData.attributes === undefined){
    Auth.currentAuthenticatedUser().then(r => {
      props.authData.attributes = r.attributes;
    });
  }

  switch (props.authState) {
    case 'signIn':
      return <MySignIn {...props} />;
    case 'signUp':
      return <MySignIn {...props} />;
    case 'forgotPassword':
      return <MySignIn {...props} />;
    case 'confirmSignUp':
      return <MySignIn {...props} />;
    case 'changePassword':
      return <MySignIn {...props} />;
    case 'signedIn':
      return <Home {...props}/>;
    default:
      return <></>;
  }
};

export default withAuthenticator(AuthScreens, false, [
  <MySignIn/>,
  <ConfirmSignIn/>,
  <VerifyContact/>,
  <SignUp/>,
  <ConfirmSignUp/>,
  <ForgotPassword/>,
  <RequireNewPassword />
]);