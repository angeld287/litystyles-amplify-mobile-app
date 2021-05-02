import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, View, Platform, Alert, Button as RNButton } from 'react-native';
import { Container, Header, Content, List, ListItem, Thumbnail, Left, Spinner, Right, Card, CardItem, Text, Icon, Badge, DatePicker } from 'native-base';

import DateTimePicker from '@react-native-community/datetimepicker';

import { Button, Block, NavBar, theme, Input } from 'galio-framework';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { HeaderHeight } from "../../constants/utils";
import { sendNotifications } from '../../constants/functions'; 

import GLOBAL from '../../global';

import moment from 'moment';

import { createRequest, createRequestEmployee, createRequestService, createRequestCustomer } from '../../graphql/mutations';
import { listRequests } from '../../graphql/customQueries';

import getListCompleted from "../../constants/getList";

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

const SendRequest = ({ route, navigation }) => {
  const [ loading, setLoading ] = useState(false);
  const [ errorsr, setErrorsr ] = useState(false);
  const [ errorsrm, setErrorsrm ] = useState('no error');

  const [ chosenDate, setChosenDate ] = useState(new Date());
  const [ showDateTimepicker, setShowDateTimepicker ] = useState(false);
  const [ mode, setMode ] = useState('date');


  const { authData, employee, service } = route.params;

  /* 
  useEffect(() => {
    console.log(employee);
  }, []);
  */

  const sendScheduledRequest = async () => {
      //sendRequest(moment(chosenDate).format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z');
      console.log(moment(chosenDate).format('YYYY-MM-DDTHH:mm:00.000')+'Z');
      console.log(service.duration);

      var _starDate = String(moment(chosenDate).format('YYYY-MM-DDTHH:mm:00.000')+'Z');
      var _endDate = String(moment(chosenDate).format('YYYY-MM-DDTHH:mm:00.000')+'Z');

      console.log(moment(chosenDate).subtract(service.duration, 'minutes').format('YYYY-MM-DDTHH:mm:00.000')+'Z');

      const _filter = {
        and: {or: {state: {eq: 'IN_PROCESS'}, state: {eq: 'ON_HOLD'}}, 
        resposibleName: {eq: employee.username}},
        and: [
          {date: {gt: _starDate}},
          {date: {lt: _endDate}},
        ]
      }

      console.log(_filter);

      /**
       * filter: {
					  and: [
						{date: {gt: _date}}, 
						{date: {lt: String(moment(date).format('YYYY-MM-DDT')+'23:59:59.000')}},
						{companyId: {eq: props.state.company.id}},
						{state: {eq: 'FINISHED'}},
					  ]
					}
       */

      //var reqs = await getListCompleted('listRequests', listRequests, _filter); 

      //console.log(reqs);
      /* Alert.alert(
        "Fecha o Hora no seleccionada",
        "Debe agregar una fecha y una hora para agendar",
        [
          {
            text: "OK",
            onPress: () => console.log("OK Pressed"),
          },
        ],
        { cancelable: false }
      ); */
    
  }

  const setDate = () => {
    //setChosenDate(moment(newDate).format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z');
    setMode('date');
    setShowDateTimepicker(true);
  }

  const setTime = () => {
    setMode('time');
    setShowDateTimepicker(true);
  }

  const onSetDate = (event, selectedDate) => {
    if(event.type === "dismissed"){
      setShowDateTimepicker(false);

    }else{
      const currentDate = selectedDate || currentDate;
      setShowDateTimepicker(Platform.OS === 'ios');
      setChosenDate(currentDate);
    }
  }

  const sendRequestForNow = () => {
    const nowDate = moment(new Date()).format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z';
    sendRequest(nowDate);
  }

  const sendRequest = async (requestDate) => {

    const _date = moment(new Date()).format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z';

    const ri = {state: 'ON_HOLD', resposibleName: employee.username, paymentType: 'CASH', customerName: authData.attributes.name, customerUsername: authData.username, companyId: employee.companyId, date: requestDate, createdAt: _date};
    const rei = {requestEmployeeEmployeeId: employee.id, requestEmployeeRequestId: "", cost: service.cost, createdAt: _date,};
		const rsi = {resposibleName: employee.username, requestServiceServiceId: service.service.id, requestServiceRequestId: "", cost: service.cost, createdAt: _date};
    const rci = {requestCustomerCustomerId: authData.userdb.id, requestCustomerRequestId: "", resposibleName: employee.username, cost: service.cost, createdAt: _date};
    
    try {
      setLoading(true);
      
			var request = {};
			request = await API.graphql(graphqlOperation(createRequest, {input: ri}));

			rei.requestEmployeeRequestId = request.data.createRequest.id;
      rsi.requestServiceRequestId = request.data.createRequest.id;
      rci.requestCustomerRequestId = request.data.createRequest.id;

			await API.graphql(graphqlOperation(createRequestEmployee, {input: rei}));
      await API.graphql(graphqlOperation(createRequestService, {input: rsi}));
      await API.graphql(graphqlOperation(createRequestCustomer, {input: rci}));

      if(employee.phoneid !== null && employee.phoneid !== ""){
        const object = {
            to: employee.phoneid,
            title: 'Nueva Solicitud de Servicio',
            body: "Ha recibido una nueva solicitud de "+authData.attributes.name,
            sound: 'default',
            naviateto: "Employee",
        }

        await sendNotifications(object);
      }
      
      GLOBAL.HAS_REQUEST = true;

      navigation.navigate('Homee');
      navigation.navigate('RequestInfo');
      
			setLoading(false);

		} catch (e) {
      setLoading(false);
      setErrorsr(true)
			setErrorsrm('Ha ocurrido un error. Favor intentar mas tarde');
    }
    
  }

  // sleep time expects milliseconds
  function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

 return (
        <Content style={{marginTop: 50, margin: 10}}>
          <Block flex style={styles.profile}>
              <Card>
                <CardItem>
                  <Icon active style={{color: '#d9534f'}} name="person" />
                  <Text style={{marginLeft: 5}}>Estilista: {employee.name}</Text>
                  <Right>
                  </Right>
                </CardItem>
              </Card>
              <Card>
                <CardItem>
                  <Icon type="Entypo" style={{color: '#0275d8'}} name="scissors" />
                  <Text style={{marginLeft: 5}}>Servicio: {service.service.name}</Text>
                  <Right>
                  </Right>
                </CardItem>
              </Card>
              <Card>
                <CardItem>
                  <Icon type="FontAwesome5" style={{color: '#85bb65'}} name="money-bill-wave" />
                  <Text style={{marginLeft: 5}}>Costo: RD$ {service.cost}</Text>
                  <Right>
                  </Right>
                </CardItem>
              </Card>
              <Button disabled={loading} round style={{ width: '97%', marginTop: 20}} uppercase color="success" onPress={() => {sendRequestForNow()}}>Solicitar</Button>
              
              {loading && <Content>
                <Spinner color='green' />
              </Content>}

              {errorsr && <Content>
                <Badge><Text>{errorsrm}</Text></Badge>
              </Content>}

              <Button disabled={loading} round style={{ width: '97%', marginTop: 5}} uppercase color="danger" onPress={(e) => { 
                    e.preventDefault();
                    setChosenDate(new Date());
                    setShowDateTimepicker(false);
                    navigation.navigate('Homee');
                  }
                }>Cancelar</Button>
              {/* <Block style={{marginTop:30}}>
                <Text note>Tambien puedes agendar una cita:</Text>     
                <View>
                  { showDateTimepicker &&
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={chosenDate}
                      mode={mode}
                      is24Hour={true}
                      display="default"
                      onChange={onSetDate}
                      minimumDate={new Date()}
                      is24Hour={false}
                    />
                  }
                </View>
                <View style={styles.container}>
                  <View style={styles.buttonContainer}>
                    <Button disabled={loading} round style={{ width: '97%'}} uppercase color="info" onPress={() => {setDate()}}>Fecha</Button>
                  </View>
                  <View style={styles.buttonContainer}>
                    <Button disabled={loading} round style={{ width: '97%'}} uppercase color="info" onPress={() => {setTime()}}>Hora</Button>
                  </View>
                </View>
                <Button disabled={loading} round style={{ width: '97%'}} uppercase color="warning" onPress={() => {sendScheduledRequest()}}>Agendar</Button>
              </Block> */}
          </Block>
        </Content>
 );
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === "android" ? 30 : 0,
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
  },
  container: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  },
  buttonContainer: {
      flex: 1,
  }
});

export default SendRequest;
