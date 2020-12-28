import React, { useState, useEffect } from "react";
import { Easing, Animated, Dimensions } from "react-native";

import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// screens
import Home from "../screens/Home";
import Profile from "../screens/Profile";
import Elements from "../screens/Elements";
import Articles from "../screens/Articles";

//custoemr screens
import Office from "../screens/CustomerScreens/Office"
import SelectService from '../screens/CustomerScreens/SelectService'
import SendRequest from '../screens/CustomerScreens/SendRequest'
import RequestInfo from '../screens/CustomerScreens/RequestInfo'

//employee screens 
import Requests from '../screens/EmployeeScreens/Requests'

//suppliers screens
import Suppliers from "../screens/SupplierScreens/Suppliers";
import ProductDetail from "../screens/SupplierScreens/ProductDetail";
import Orders from "../screens/SupplierScreens/Orders";

//cart
import Cart from "../screens/Cart";

// drawer
import CustomDrawerContent from "./Menu";

// header for screens
import { Icon, Header } from "../components";

const { width } = Dimensions.get("screen");

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function ElementsStack(props) {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Elements"
        component={Elements}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="Elements" navigation={navigation} scene={scene} />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              white
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true
        }}
      />
    </Stack.Navigator>
  );
}

function ArticlesStack(props) {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Articles"
        component={Articles}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="Articles" navigation={navigation} scene={scene} />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              white
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true
        }}
      />
    </Stack.Navigator>
  );
}

function EmployeeStack(props) {

  const params = {
    ...props.route.params
  }

  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Employee"
        component={Requests}
        initialParams={params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Estilista"
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        initialParams={props.route.params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              white
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true
        }}
      />
    </Stack.Navigator>
  );
}

function HomeStack(props) {

  const [isBarber, setIsBarber] = useState(true);

  const params = {
    ...props.route.params,
    isBarber
  }

  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Homee"
        component={Home}
        initialParams={params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Home"
              //search
              //options
              //optionRight="Salones"
              //optionLeft="Barberias"
              //actionLeft={e => {setIsBarber(true); action();}}
              //actionRigth={e => {setIsBarber(false); action();}}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />
      <Stack.Screen
        name="RequestInfo"
        component={RequestInfo}
        initialParams={props.route.params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Informacion de Solicitud"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        initialParams={props.route.params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              white
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="Office"
        component={Office}
        initialParams={props.route.params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Empresa"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="SelectService"
        component={SelectService}
        initialParams={props.route.params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Seleccione un Servicio"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="SendRequest"
        component={SendRequest}
        initialParams={props.route.params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Confirmar y Enviar"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true
        }}
      />
    </Stack.Navigator>
  );
}


// Stack de suplidores para solicitudes de productos

function SupplierStack(props) {


  const params = {
    ...props.route.params,
  }

  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Suppliers"
        component={Suppliers}
        initialParams={params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Suplidores"
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        initialParams={props.route.params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              white
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="Cart"
        component={Cart}
        initialParams={props.route.params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Carrito"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="Orders"
        component={Orders}
        initialParams={props.route.params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Pedidos"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="Office"
        component={Office}
        initialParams={props.route.params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Empresa"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetail}
        initialParams={props.route.params}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Detalle de Producto"
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true
        }}
      />
    </Stack.Navigator>
  );
}

export default function OnboardingStack(props) {
  return (
    <Stack.Navigator mode="card" headerMode="none">
      {/* <Stack.Screen
        name="Onboarding"
        component={Onboarding}
        option={{
          headerTransparent: true
        }}
      /> */}
      <Stack.Screen name="App" component={AppStack } initialParams={props} />
    </Stack.Navigator>
  );
}

const AppStack = (props) => {
  const params = props.route.params;

  const roles = props.route.params?.authData.roles;

  const initialRoute = roles.indexOf('employee') !== -1 ? "Employee" : roles.indexOf('customer') !== -1 ? "Home" : "Home";
  return (
    <Drawer.Navigator
      style={{ flex: 1 }}
      drawerContent={_ => { 
        const props = {
          _,
          params
        }
        return (<CustomDrawerContent {...props} />)
      }}
      drawerStyle={{
        backgroundColor: "white",
        width: width * 0.8
      }}
      drawerContentOptions={{
        activeTintcolor: "white",
        inactiveTintColor: "#000",
        activeBackgroundColor: "transparent",
        itemStyle: {
          width: width * 0.75,
          backgroundColor: "transparent",
          paddingVertical: 16,
          paddingHorizonal: 12,
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          overflow: "hidden"
        },
        labelStyle: {
          fontSize: 18,
          marginLeft: 12,
          fontWeight: "normal"
        }
      }}
      initialRouteName={initialRoute}
    >
      <Drawer.Screen name="Home" component={HomeStack} initialParams={props.route.params}/>
      <Drawer.Screen name="Employee" component={EmployeeStack} initialParams={props.route.params}/>
      <Drawer.Screen name="Suppliers" component={SupplierStack} initialParams={props.route.params}/>
      <Drawer.Screen name="Elements" component={ElementsStack} />
      <Drawer.Screen name="Articles" component={ArticlesStack} />
    </Drawer.Navigator>
  );
}

