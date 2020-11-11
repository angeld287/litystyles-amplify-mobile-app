import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';

import Amplify, { Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react-native'

Amplify.configure(awsconfig);

async function signOut() {
  console.log("entro");
  try {
      const t = await Auth.signOut({ global: true });
      console.log(t);
  } catch (error) {
      console.log('error signing out: ', error);
  }
}

function App() {

  const createTwoButtonAlert = () =>
    Alert.alert(
      "Alert Title",
      "My Alert Msg",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ],
      { cancelable: false }
    );

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      
      <Button onPress={signOut} title="salir"></Button>
      <StatusBar style="auto" />
    </View>
  );
}

export default withAuthenticator(App)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
