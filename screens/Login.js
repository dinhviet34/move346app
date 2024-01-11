import React, { Component } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import server from "../server";
import * as Font from 'expo-font';
import func_store_data from "../class/storeData";
import { StatusBar } from 'expo-status-bar';
import * as Device from 'expo-device';
import footertext from "../class/footertext";
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';


class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: '',
            key: '',
            server: server(),
            assetsLoaded: false,
            device: '',
            usercode: '',
            footertext: '',
            checkhavetokenauth: false,

        };
    };
    async componentDidMount() {
        await Font.loadAsync({
            'Inter-Black': require('../assets/fonts/Inter-Black.ttf')
        });
        this.setState({ assetsLoaded: true });


    }
    func_check_have_tokenauth = async (token, Susercode, Stokenauth) => {
        let datetime = new Date().toLocaleString();
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);
        myHeaders.append("Content-Type", "application/json");
        let checker;
        var raw = JSON.stringify({
            "Susercode": Susercode,
            "Stokenauth": Stokenauth
        });


        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        await fetch(this.state.server + "/move/checkhavetokenauth", requestOptions)
            .then(response => response.text())
            .then(result => {
                //console.log("Result    " + result);
                func_store_data(result + "-" + datetime, "Log");
                if (result === "True") {
                    this.setState({ checkhavetokenauth: true })
                }
                else {
                    this.setState({ checkhavetokenauth: false })
                }

            })
            .catch(error => {
                console.log('error here', error);
                this.setState({ checkhavetokenauth: false })
            });

        return checker;
    }
    func_handler_device = async () => {
        //const deviceband = await Device.brand;
        //const deviceosname = await Device.osName;
        // const username = await this.state.username;
        // const deviceosbuild = await Device.osInternalBuildId;
        // this.setState({ device: username + "_" + deviceband + "_" + deviceosname + "_" + deviceosbuild });

        const username = await this.state.username;
        const value = await AsyncStorage.getItem('@storage_TokenAccess')
        //var md5c = md5(username);
        //const deviceosbuild = await Device.osInternalBuildId;
        this.setState({ device: username + "_" + value });
    }

    connect = async (username, password) => {
        //console.log("dmm")
        //alert(server());
        this.func_handler_device();
        //console.log(username + password);
        //console.log(this.state.server)
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "Suserad": username,
            "Spassword": password
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(this.state.server + "/move/userlogin", requestOptions)
            .then(response => response.text())
            .then(async result => {

                if (result === "No") {
                    //console.log(result);
                    alert("User chưa được cấp phép hoặc sai tên đăng nhập hoặc sai mật khẩu")
                }
                else {
                    //console.log(result);
                    var token = result.split(':')[0];
                    var usercode = result.split(':')[1];
                    func_store_data(username + ":" + result, "Key");
                    await this.func_check_have_tokenauth(token, usercode, this.state.device)
                    //console.log("checkkkkkk " + this.state.checkhavetokenauth);

                    if (this.state.checkhavetokenauth === true) {
                        this.props.navigation.navigate('Welcome');
                       

                    }
                    else {
                        this.props.navigation.navigate('Register');
                    }





                }

            })//Alert.alert(responseJson))
            .catch(error => console.log(error));
    }
    handlerUsername = (text) => {
        this.setState({ username: text });
    };
    handlerPassword = (text) => {
        this.setState({ password: text });
    };


    render() {
        const { assetsLoaded } = this.state;
        if (assetsLoaded) {
            return (
                <SafeAreaProvider style={styles.container}>
                    <StatusBar style="dark" />

                    <View style={[styles.f4, { justifyContent: 'center' }]}>
                        <View style={[{ flexDirection: "row" }]}>
                            <View style={styles.buttontron}>
                                <Ionicons name='md-key-sharp' size={30} color="#fff"></Ionicons>
                            </View>
                            <Text style={{ fontSize: 30, fontWeight: "bold", color: "#1177CB" }}>
                                Login
                            </Text>

                        </View>
                        <View style={{width:"100%",padding:10}}>
                            <TextInput style={styles.styleinput} placeholder="Tên đăng nhập" onChangeText={(this.handlerUsername)}></TextInput>
                            <TextInput style={styles.styleinput} placeholder="Mật khẩu" secureTextEntry={true} onChangeText={(this.handlerPassword)}></TextInput>
                        </View>

                        <View style={{ marginTop: 20, }}>
                            <TouchableOpacity style={styles.button} onPress={() => { this.connect(this.state.username, this.state.password) }}>
                                <Text style={styles.textinbutton}>Đăng nhập Move346</Text>
                            </TouchableOpacity>
                        </View>




                    </View>
                    <View style={styles.f3}>

                    </View>

                    <View style={{ flex: 1 }}>
                        <ImageBackground source={{ uri: this.state.server + '/icons/banner.png' }} style={styles.imagbg}>

                            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={styles.textfooter}>
                                    {footertext()}
                                </Text>
                                <Text style={[styles.textfooter, { alignItems: 'center', justifyContent: 'center', marginTop: 5 }]}>
                                    Ứng dụng Move346
                                </Text>

                            </View>
                        </ImageBackground>

                    </View>
                </SafeAreaProvider>
            )

        }

    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        fontFamily: 'Inter-Black',
        marginTop: '13%',

    },
    textfooter: {
        fontSize: 10,
        color: '#ffff',
    },
    b: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#1177CB',
        marginTop: 20,

    },
    buttontron: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        backgroundColor: '#1177CB',
        marginRight: 10,
    },
    styleinput: {
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 5,
        height: 50,
        padding: 10,


    },
    isHighlighted: {
        borderColor: 'green',
    },
    center: {
        //color:'red',
        fontWeight: 'bold',
        fontSize: 30,
    },
    f1footer: {
        flex: 1,



    },
    f2footer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    imagbg: {
        flex: 1,
        flexDirection: 'row',
        height: '100%',
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',

    },
    f1: {
        flex: 1,
        //backgroundColor:"red",
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'center',

    },
    f2: {
        alignItems: 'flex-start',
        flex: 1,

    },
    f3: {
        alignItems: 'center',
        flex: 2,
        width: '100%',
        padding: 20,
        justifyContent: 'center',

    },
    f4: {
        alignItems: 'center',
        flex: 4,
    },
    button: {
        backgroundColor: '#1177CB',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
    },
    linkbutton: {

        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
    },
    textinbutton: {
        color: 'white',
        fontWeight: "bold",
    }
});
export default Index;