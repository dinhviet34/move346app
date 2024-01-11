import React, { Component } from "react";
import { View, Text, StyleSheet, Pressable, TouchableOpacity, TextInput, Image, Keyboard } from 'react-native';
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import Home from "./screens/Timekeeper";
import Login from "./screens/Login";
import * as Network from "expo-network";
import Register from "./screens/Register";
import Welcome from "./screens/Welcome";
import Timekeeper from "./screens/Timekeeper";
import Timekeeper_setting from "./screens/Timekeeper_Screen/Timekeeper_Setting";
import Timekeeper_report from "./screens/Timekeeper_Screen/TimeKeeper_Report";
import Uploadfiles from "./screens/Uploadfiles";
import Libraryfiles from "./screens/Libraryfiles";
import Address from "./screens/Address";
import OperationAddress from "./screens/Address_Screen/OperationAddress";

class Stack extends Component {
    render() {
        return (
            <AppContainer />
        )
    }
}

const myStack = createStackNavigator({
   
    Welcome: {
        screen: Welcome,
        navigationOptions: {
            headerShown: false,
        }
    },
    Login: {
        screen:Login,
        navigationOptions:{
            headerShown:false,
        }
    },
    
    Timekeeper:{ 
        screen:Timekeeper,
        navigationOptions:{
            headerShown:false,
        }
    },
    Register:{
        screen:Register,
        navigationOptions:{
            headerShown:false,
        }
    
    },
    Setting:{ 
        screen:Timekeeper_setting,
        navigationOptions:{
            headerShown:false,
        }
    },
    Report:{
        screen:Timekeeper_report,
        navigationOptions:{
            headerShown:false,
        }
    } ,
    Uploadfiles:{
        screen:Uploadfiles,
        navigationOptions:{
            headerShown:false,
        }
    },
    Libraryfiles:{
        screen:Libraryfiles,
        navigationOptions:{
            headerShown:false,
        }
    },
    Address:{
        screen:Address,
        navigationOptions:{
            headerShown:false,
        }
    },
    OperationAddress:{
        screen:OperationAddress,
        navigationOptions:{
            headerShown:false,
        }

    }
}, { initialRouterName: 'Welcome' });
const AppContainer = createAppContainer(myStack);

export default Stack;