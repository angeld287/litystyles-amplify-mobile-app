
import { SignUp } from 'aws-amplify-react-native'
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
  Modal
} from "react-native";
import { Auth } from "aws-amplify";
import { Block, Text, theme } from "galio-framework";
import { API, graphqlOperation } from 'aws-amplify';

import { Button, Icon, Input } from "../../components";
import { argonTheme } from "../../constants";

import { Container } from 'native-base';

import { createCustomer } from '../../graphql/mutations';

import awsconfig from '../../aws-exports';

const { width, height } = Dimensions.get("screen");

const ubpn = (propertyName, value) => () => ({
    [propertyName]: value
  });

const INITIAL_STATES = {
  email: "",
  password: "",
  fullname: "",
  phonenumber: "",
  error: null,
  errorM: null,
  errorC: null,
  errorCM: null,
  loading: false,
  gloading: false,
  code: '',
  modal: false,
  loadingConfirmation: false,
  loadingResend: false,
  username: '',
};


class MySignUp extends SignUp {
    constructor(props) {
        super(props);
        this.state = INITIAL_STATES;
    }

    signUp = async () => {
      try {
        this.setState({error:null, loading: true});

        const { email, password, phonenumber, fullname, modal } = this.state;

        if(email === "" || password === "" || /* phonenumber === "" || */ fullname === ""){
          this.setState({errorM: "Debe ingresar los datos requeridos.", error: true, loading: false});
          return;
        }

        if(email.match(/(^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$)/i) === null){
          this.setState({errorM: "El formato de email no es valido.", error: true, loading: false});
          return;
        }

        if(password.match(/(?=.{8,})/i) === null || password.match(/(?=.*[!@#$%^&*])/i) === null || password.match(/(?=.*[0-9])/i) === null){
          this.setState({errorM: "La clave las condiciones: 8 caracteres o más, al menos 1 carácter especial y al menos 1 carácter numérico.", error: true, loading: false});
          return;
        }

        var attr = {
          email: email,  
          name: fullname,
        };

        if(phonenumber != "" && phonenumber.match(/(^[+]*[0-9]{11}$)/i) === null){
          this.setState({errorM: "Numero de Telefono invalido. Ej: 18094332233.", error: true, loading: false});
          return;
        }else if(phonenumber != ""){
          attr.phone_number = "+"+phonenumber;
        }

        

        const su = await Auth.signUp({
          username: email,
          password: password,
          attributes: attr,
        });

        this.setState({modal: !modal, loading: false, username: su.userSub});
        
      } catch (error) {
        console.log(error); 
        if(error.code === "UsernameExistsException"){
          this.setState({errorM: "Ya existe una cuenta con este email, favor iniciar sesion.", error: true, loading: false});
        }else{
          this.setState({errorM: "Error al crear la cuenta, intentelo mas tarde.", error: true, loading: false});
        }
      }
    }

    handleConfirmCode = async () => {
      try {
        const { username, code } = this.state;
        this.setState({loadingConfirmation: true});
        if(code === ""){
          this.setState({errorCM: "Debe ingresar el codigo.", errorC: true, loadingConfirmation: false});
          return;
        }

        const cu = await Auth.confirmSignUp(username, code);
        
        //agregar el usaurio al grupo customer
        var roll = await this.addUserToGroup(username); 

        //reiniciar los stados
        this.setState(INITIAL_STATES);

        //ir a la pantalla de login
        this.props.onStateChange('signIn',{});

        this.setState({loadingConfirmation: false, modal: false});
      } catch (error) {
        console.log(error); 
        this.setState({loadingConfirmation: false, errorCM: "Error al confirmar el email, intentelo mas tarde.", errorC: true, loadingConfirmation: false});
      }
    };

    handleResendCode = async () => {
      try {

        const { username } = this.state;
        
        this.setState({ loadingResend: true });

        const rsc = await Auth.resendSignUp(username);

        this.setState({ loadingResend: false });

      } catch (error) {
        console.log(error);
        this.setState({loadingResend: false, errorCM: "Error al reenviar el codigo, intentelo mas tarde.", errorC: true});
      }
    };

    addUserToGroup = async () => {
        try {
          const apiOptions = {};
  
          apiOptions['headers'] = {
              'Content-Type': 'application/json'
          };
          
          apiOptions['body'] = {
            GroupName: 'customer',
            UserPoolId: awsconfig.aws_user_pools_id,
            Username: this.state.username
          };
  
          await API.post('apiForLambda', '/addUserToGroup', apiOptions);
  
          return true;
  
        } catch (e) {
          console.log(e);
          return false;
        }
    };

    _googleSignIn = async () => {
      this.setState({gloading: true});
      await Auth.federatedSignIn({provider: 'Google'});
      this.setState({gloading: false});
    }

    render() {
        const { email, password, loading, errorM, error, gloading, fullname, phonenumber, modal, code, loadingConfirmation, loadingResend, errorC, errorCM } = this.state;
        const { googleSignIn } = this.props; 
        const signup = (
            <Container >
              <StatusBar hidden />
              <ScrollView showsVerticalScrollIndicator={false}>
                <Block flex middle>
                    <Block style={styles.registerContainer}>
                      <Block flex={0.25} middle style={styles.socialConnect}>
                          <Block>
                            <Text color="#8898AA" size={12}>
                                Crear cuenta con Google
                            </Text>
                          </Block>
                          <Block row style={{ marginTop: theme.SIZES.BASE }}>
                              <GoogleSigninButton
                                style={{ width: 192, height: 48 }}
                                size={GoogleSigninButton.Size.Wide}
                                color={GoogleSigninButton.Color.Dark}
                                onPress={this._googleSignIn}
                                disabled={gloading}
                              />
                          </Block>
                          <Block>
                            {gloading && 
                              <View style={[styles.container, styles.horizontal]}>
                                <ActivityIndicator size="large" color="#0000ff" />
                              </View>
                            }
                          </Block>
                      </Block>
                      <Block flex>
                          <Block flex={0.17} middle>
                          <Text color="#8898AA" size={12}>
                              O crea la cuenta de la forma clasica
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
                              <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                              <Input
                                  borderless
                                  placeholder="Nombre"
                                  value={fullname} 
                                  onChangeText={e => {this.setState(ubpn("fullname", e)); this.setState({error: false});} }
                                  iconContent={
                                  <Icon
                                      size={16}
                                      color={argonTheme.COLORS.ICON}
                                      name="account"
                                      family="MaterialCommunityIcons"
                                      style={styles.inputIcons}
                                  />
                                  }
                              />
                              </Block>
                              <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                              <Input
                                  borderless
                                  placeholder="Numero de Telefono"
                                  value={phonenumber} 
                                  onChangeText={e => {this.setState(ubpn("phonenumber", e)); this.setState({error: false});} }
                                  iconContent={
                                  <Icon
                                      size={16}
                                      color={argonTheme.COLORS.ICON}
                                      name="cellphone"
                                      family="MaterialCommunityIcons"
                                      style={styles.inputIcons}
                                  />
                                  }
                              />
                              </Block>
                              <Block middle>
                                  <Button loading={loading} color="primary" style={styles.createButton} onPress={this.signUp}>
                                      <Text bold size={14} color={argonTheme.COLORS.WHITE}>
                                          SIGNUP
                                      </Text>
                                  </Button>
                                  <Button
                                      shadowless
                                      color="transparent"
                                      textStyle={{
                                        color: argonTheme.COLORS.PRIMARY,
                                        fontSize: 14
                                      }}
                                      onPress={(e) => {e.preventDefault(); this.props.onStateChange('signIn',{}); }}
                                  >
                                      iniciar sesion
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
                </Block>
              </ScrollView>
              <Modal
                animationType="slide"
                transparent={true}
                visible={modal}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Block>
                      <Text h5 style={{marginBottom: 3, textAlign: 'center'}}>Confirmacion de Email.</Text>
                      <Text p italic style={{marginBottom: 3, textAlign: 'center'}}>Favor digitar el codigo que le enviamos a su correo.</Text>
                    </Block>
                    <Block>
                      <Input
                          borderless
                          placeholder="Codigo"
                          value={code} 
                          onChangeText={e => {this.setState(ubpn("code", e)); this.setState({error: false});} }
                          iconContent={
                            <Icon
                                size={10}
                                color={argonTheme.COLORS.ICON}
                                name="onepassword"
                                family="MaterialCommunityIcons"
                                style={styles.inputIcons}
                            />
                          }
                      />
                    </Block>
                    <Block style={{flexDirection: "row", justifyContent: "space-around", padding: 10}}>
                      <Button loading={loadingConfirmation} color="success" onPress={(e) => {e.preventDefault(); this.handleConfirmCode(); }}>
                          Confirmar
                      </Button>
                    </Block>
                    <Block>
                      <Button color="warning" loading={loadingResend} onPress={(e) => {e.preventDefault(); this.handleResendCode(); }}>
                          Reenviar Codigo
                      </Button>
                    </Block>
                    {errorC && <Block row style={styles.passwordCheck}>
                        <Text bold size={12} color={argonTheme.COLORS.ERROR}>
                            {errorCM}
                        </Text>
                    </Block>}
                  </View>
                </View>
              </Modal>
            </Container>
        )
      return this.props.authState === "signUp" && signup
    }
}

const styles = StyleSheet.create({
    registerContainer: {
      backgroundColor: "#F4F5F7",
      padding: 10,
      width: width * 0.9,
      marginBottom: 20,
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
      paddingLeft: 5,
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
    },
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
    modalText: {
      marginBottom: 15,
      textAlign: "center"
    }
  });

export default MySignUp;