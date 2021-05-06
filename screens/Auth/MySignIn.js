
import { SignIn } from 'aws-amplify-react-native'
import { GoogleSignin, GoogleSigninButton } from '@react-native-community/google-signin';
import React from "react";
import {
  StyleSheet,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  View,
  ScrollView,
  Platform
} from "react-native";

import { Auth } from "aws-amplify";
import { Block, Text, theme } from "galio-framework";

import { Button, Icon, Input } from "../../components";
import { argonTheme } from "../../constants";

import { Container, Icon as NVIcon, Button as NVButton, Text as NVText} from 'native-base';

const { width, height } = Dimensions.get("screen");

const ubpn = (propertyName, value) => () => ({
    [propertyName]: value
  });


class MySignIn extends SignIn {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            error: null,
            errorM: null,
            loading: false,
            gloading: false,
            aloading: false,
         };
    }

    signIn = async () => {

        if(this.state.email === "" || this.state.password === ""){
            this.setState({errorM: "Debe ingresar los datos requeridos", error: true, loading: false});
            return;
        }
        try {
          this.setState({ loading: true});
          const user = await Auth.signIn(this.state.email, this.state.password);
      
          if (user.challengeName === "SMS_MFA" || user.challengeName === "SOFTWARE_TOKEN_MFA") {
            this.changeState("confirmSignIn", user);
          } else if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
            this.props.onStateChange("requireNewPassword", user);
          } else if (user.challengeName === "MFA_SETUP") {
            this.changeState("TOTPSetup", user);
          } else {
            this.props.onStateChange('signedIn', user);
          }
      
        } catch (e) {
          if (e.code === "UserNotConfirmedException") {
            this.setState({errorM: "Usuario no Confirmado", error: true, loading: false});
          } else if (e.code === "PasswordResetRequiredException") {
            this.setState({errorM: "Se requiere cambio de contraseña", error: true, loading: false});
          } else if (e.code === "UserNotFoundException") {
            this.setState({errorM: "El usuario no existe", error: true, loading: false});
          } else if (e.code === "NotAuthorizedException") {
            this.setState({errorM: "Contraseña incorrecta", error: true, loading: false});
          } else {
            this.setState({errorM: e.message, error: true, loading: false});
          }
        }
    }

    _googleSignIn = async () => {
      //console.log(Platform.OS)
      this.setState({gloading: true});
      await Auth.federatedSignIn({provider: 'Google'});
      this.setState({gloading: false});
    }

    _appleSignIn = async () => {
      this.setState({aloading: true});
      await Auth.federatedSignIn({provider: 'SignInWithApple'});
      this.setState({aloading: false});
    }

    render() {
        const { email, password, loading, errorM, error, gloading, aloading} = this.state;
        const { googleSignIn } = this.props; 

        const login = (
        <Container >
          <StatusBar hidden />
            <ScrollView showsVerticalScrollIndicator={false}>
              <Block style={styles.registerContainer}>
              <Block flex={0.25} middle style={styles.socialConnect}>
                  <Block style={{marginBottom: 30}}>
                    <Text color="#8898AA" size={12}>
                      {Platform.OS === "ios" && "Inicia sesion con Google o Apple ID"}
                      {Platform.OS !== "ios" && "Inicia sesion con Google"}
                    </Text>
                  </Block>
                  <Block row style={{ marginBottom: 20, marginTop: theme.SIZES.BASE }}>
                      <GoogleSigninButton
                        style={{ width: 192, height: 48 }}
                        size={GoogleSigninButton.Size.Wide}
                        color={GoogleSigninButton.Color.Dark}
                        onPress={this._googleSignIn}
                        disabled={gloading}
                      />
                  </Block>
                  {Platform.OS === "ios" &&
                    <Block row >
                      <NVButton iconLeft dark onPress={this._appleSignIn}>
                          <NVIcon  type="MaterialCommunityIcons" name="apple"/>
                          <NVText uppercase={false}>
                            Iniciar sesión con Apple
                          </NVText>
                      </NVButton>
                  </Block>
                  }
                  <Block>
                    {gloading && 
                      <View style={[styles.container, styles.horizontal]}>
                        <ActivityIndicator size="large" color="#0000ff" />
                      </View>
                    }
                    {aloading && 
                      <View style={[styles.container, styles.horizontal]}>
                        <ActivityIndicator size="large" color="#0000ff" />
                      </View>
                    }
                  </Block>
              </Block>
              <Block flex>
                  <Block flex={0.17} middle style={{marginBottom: 30}}>
                  <Text color="#8898AA" size={12}>
                      O inicia sesion de la forma clasica
                  </Text>
                  </Block>
                  <Block flex center>
                  <KeyboardAvoidingView
                      style={{ flex: 1 }}
                      behavior="padding"
                      enabled
                  >
                      <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                          borderless
                          placeholder="Email"
                          value={email} 
                          onChangeText={e => {this.setState(ubpn("email", e)); this.setState({error: false});} }
                          iconContent={
                          <Icon
                              size={16}
                              color={argonTheme.COLORS.ICON}
                              name="email"
                              family="MaterialCommunityIcons"
                              style={styles.inputIcons}
                          />
                          }
                      />
                      </Block>
                      <Block width={width * 0.8}>
                      <Input
                          password
                          borderless
                          placeholder="Password"
                          value={password} 
                          onChangeText={e => {this.setState(ubpn("password", e)); this.setState({error: false});} }
                          iconContent={
                          <Icon
                              size={16}
                              color={argonTheme.COLORS.ICON}
                              name="account-key"
                              family="MaterialCommunityIcons"
                              style={styles.inputIcons}
                          />
                          }
                      />
                      </Block>
                      <Block middle>
                        <Button loading={loading} color="primary" style={styles.createButton} onPress={this.signIn}>
                            <Text bold size={14} color={argonTheme.COLORS.WHITE}>
                                LOGIN
                            </Text>
                        </Button>
                        <Button
                            shadowless
                            color="transparent"
                            textStyle={{
                              color: argonTheme.COLORS.PRIMARY,
                              fontSize: 14
                            }}
                            onPress={(e) => {e.preventDefault();     this.props.onStateChange('signUp',{}); }}
                        >
                            crear una cuenta
                        </Button>
                      </Block>
                      {error && <Block row style={styles.passwordCheck}>
                          <Text bold size={12} color={argonTheme.COLORS.ERROR}>
                              {errorM}
                          </Text>
                      </Block>}
                  </KeyboardAvoidingView>
                  </Block>
              </Block>
              </Block>
          </ScrollView>
      </Container>);

        return this.props.authState === "signIn" && login
    }
}

const styles = StyleSheet.create({
    registerContainer: {
      padding: 10,
      width: width * 0.9,
      marginBottom: 20,
      marginTop: 20,
      paddingTop: 30,
      backgroundColor: "#F4F5F7",
      borderRadius: 4,
      shadowColor: argonTheme.COLORS.BLACK,
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowRadius: 8,
      shadowOpacity: 0.1,
      elevation: 1,
      overflow: "hidden"
    },
    socialConnect: {
      //backgroundColor: argonTheme.COLORS.WHITE,
      //borderBottomWidth: StyleSheet.hairlineWidth,
      //borderColor: "#8898AA"
      padding: 20
    },
    socialButtons: {
      width: 120,
      height: 40,
      backgroundColor: "#fff",
      shadowColor: argonTheme.COLORS.BLACK,
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowRadius: 8,
      shadowOpacity: 0.1,
      elevation: 1
    },
    socialTextButtons: {
      color: argonTheme.COLORS.PRIMARY,
      fontWeight: "800",
      fontSize: 14
    },
    inputIcons: {
      marginRight: 12
    },
    passwordCheck: {
      paddingLeft: 15,
      paddingTop: 13,
      paddingBottom: 30
    },
    createButton: {
      width: width * 0.5,
      marginTop: 25
    },
    container: {
      flex: 1,
      justifyContent: "center"
    },
    horizontal: {
      flexDirection: "row",
      justifyContent: "space-around",
      padding: 10
    }
  });

export default MySignIn;