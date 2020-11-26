import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, Alert } from 'react-native';
import { Container, Badge, Content, List, ListItem, Thumbnail, Left, Spinner, Right, Card, CardItem, Text, Icon } from 'native-base';

import { Button, Block, NavBar, theme, Input, Text as T } from 'galio-framework';
import { API, graphqlOperation, Storage } from 'aws-amplify';

import { listRequestsFull, getOfficeBasic, listRequests } from '../../graphql/customQueries';
import { updateRequest } from '../../graphql/mutations';
import { HeaderHeight } from "../../constants/utils";
import GLOBAL from '../../global';

import moment from 'moment';
import 'moment/min/locales';

moment.locale('es')

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

const RequestInfo = ({ route, navigation }) => {
  
  const [ office, setOffice ] = useState(null);
  const [ request, setRequest ] = useState(null);
  const [ requests, setRequests ] = useState(null);
  const [ position, setPosition] = useState(0);
  const [ hasRequests, setHasRequests ] = useState(false);
  const [ loading, setLoading ] = useState(true);
  const [ cloading, setCloading ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ errorm, setErrorm ] = useState('no error');
  const [ errorc, setErrorc ] = useState(false);
  const [ errorcm, setErrorcm ] = useState('no error');

  const { authData, SLN } = route.params;

  const isCustomer = (route.params?.authData.roles.indexOf('customer') !== -1);

  useEffect(() => {
    let didCancel = false;
		const fetch = async () => {
      setLoading(true);
      try {
        var requestsApi = null;
        var officeApi = null;
        var reqs = null;
        var req_pos = null;

        const _filter = {
          and: {or: {state: {eq: 'IN_PROCESS'}, state: {eq: 'ON_HOLD'}}, customerUsername: {eq: authData.username}}
        };

        requestsApi = await API.graphql(graphqlOperation(listRequestsFull, {limit: 400, filter: _filter}));
        var hasRed = (requestsApi.data.listRequests.items.length !== 0);

        setHasRequests(hasRed);
        
        if (hasRed) {
          officeApi = await API.graphql(graphqlOperation(getOfficeBasic, {id: requestsApi.data.listRequests.items[0].resposible.items[0].employee.officeId}));

          const _filterR = {
            and: {or: {state: {eq: 'IN_PROCESS'}, state: {eq: 'ON_HOLD'}}, resposibleName: {eq: requestsApi.data.listRequests.items[0].resposible.items[0].employee.username}}
          }

          reqs =  await API.graphql(graphqlOperation(listRequests, { limit: 400, filter: _filterR } ) );
          req_pos = reqs.data.listRequests.items.sort((a, b) => new Date(a.date) - new Date(b.date))
          
          setPosition(req_pos.findIndex(_ => _.customerUsername === authData.username) + 1);
          setRequest(requestsApi.data.listRequests.items[0]);
          setRequests(requestsApi.data.listRequests.items);
          setOffice(officeApi.data.getOffice);
        }

        sleep(1000).then(() => {
            setLoading(false);
        });
        
      } catch (e) {
         console.log(e); 
         setError(true);
         setErrorm('Error al intentar traer la informacion')
         setLoading(false);
      }
    };

		fetch();

		return () => {
			didCancel = true;
		};
  }, []);

  const createTwoButtonAlert = () =>
    Alert.alert(
      "Cancelar Solicitud",
      "Seguro que desea cancelar la solicitud?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => confirmCancelRequest() }
      ],
      { cancelable: false }
    );

	const confirmCancelRequest = () => {
		setCloading(true);
		API.graphql(graphqlOperation(updateRequest, { input: { id: requests[0].id, state: 'CANCELED' } }))
		.then(r => {
      requests.splice(requests.findIndex(e => e.id === requests[0].id), 1);

      sleep(1000).then(() => {
          setHasRequests(requests.length !== 0)
          setCloading(false);
          GLOBAL.HAS_REQUEST = false;
      });
		})
		.catch(e => {
			setErrorc(true);
			setCloading(false);
			console.log(e);
			setErrorcm('Error al cancelar la solicitud');
		});
	}

  // sleep time expects milliseconds
  function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }


  if(loading || cloading) {return(
      <Content style={{marginTop: 40}}>
        <Spinner color='blue' />
      </Content>
  )}


  if(error) {return(
      <Block center style={{marginTop: 40}}>
          <Badge><Text>{errorm}</Text></Badge>
      </Block>
  )}

 return (
    <Content style={{ margin: 10}}>
      {(hasRequests) && <Block flex style={styles.profile}>
          <Block center style={{marginBottom: 10, marginTop: 10}}>
            <T h1 color={position < 4 ? "red" : (position > 3 && position < 5) ? "orange" : "green"}>{position}</T>
            <Text note> Posicion en la lista de espera</Text>
          </Block>
          <Card>
            <CardItem>
              <Icon type="FontAwesome" style={{color: '#85bb65'}} name="building-o" />
              <Text style={{marginLeft: 5}}>{office?.name}</Text>
              <Right>
              </Right>
            </CardItem>
          </Card>
          <Card>
            <CardItem>
              <Icon active style={{color: '#d9534f'}}  name="person" />
              <Text style={{marginLeft: 5}}>Estilista: {requests[0]?.resposible.items[0].employee.name}</Text>
              <Right>
              </Right>
            </CardItem>
          </Card>
          <Card>
            <CardItem>
              <Icon type="Entypo" style={{color: '#0275d8'}} name="scissors" />
              <Text style={{marginLeft: 5}}>Servicio: {requests[0]?.service.items[0].service.name}</Text>
              <Right>
              </Right>
            </CardItem>
          </Card>
          <Card>
            <CardItem>
              <Icon type="Fontisto" style={{color: '#f0ad4e'}} name="date" />
                {/* dddd, MMMM Do, h:mm a */}
                <Text style={{marginLeft: 5}}>Fecha: {moment(requests[0]?.createdAt).format("dddd, MMMM Do")}</Text>
              <Right>
              </Right>
            </CardItem>
          </Card>
          <Button disabled={loading || cloading} round style={{ marginTop: 20, width: '97%'}} uppercase color="warning">Reagendar</Button>

          <Button disabled={loading || cloading} round style={{ width: '97%', marginTop: 5}} uppercase color="danger" onPress={() => { createTwoButtonAlert()}}>Cancelar Solicitud</Button>

          <Button round style={{ width: '97%', marginTop: 5}} uppercase color="danger" onPress={() => { SLN()}}>Notify</Button>

          {cloading && <Content>
            <Spinner color='red' />
          </Content>}

          {errorc && <Content>
             <Badge><Text>{errorcm}</Text></Badge>
          </Content>}
      </Block>}
      {!hasRequests && 
          <Block center>
             <Badge><Text>No hay solicitudes realizadas</Text></Badge>
          </Block>
      }
    </Content>
 );
}

const styles = StyleSheet.create({
  profile: {
    //marginTop: Platform.OS === "android" ? 0 : 0,
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

export default RequestInfo;
