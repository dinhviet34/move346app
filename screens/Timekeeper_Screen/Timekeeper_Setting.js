import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

import server from '../../server';
import * as Font from 'expo-font';
import func_store_data from "../../class/storeData";
import AsyncStorage from '@react-native-async-storage/async-storage';
import func_handler_key_sub from '../../class/handleKey';
import Svg, { Path } from "react-native-svg";
import { Alert } from 'react-native';

class Timekeeper_setting extends Component {
    constructor(props) {
        super(props)
        this.state = {
            server: server(),
            assetsLoaded: false,
            username: '',
            key: '',
            tokenaccess: '',
            macn:''
        }
    };

    async componentDidMount() {
        await Font.loadAsync({
            'Inter-Black': require('../../assets/fonts/Inter-Black.ttf')
        });
        this.setState({ assetsLoaded: true });
        await this.func_handler_key();
        const value = await AsyncStorage.getItem('@storage_TokenAccess');
        this.setState({ tokenaccess: value });
        const macnsave = await AsyncStorage.getItem('@storage_branchcode');
        this.setState({macn:macnsave});
    }
    func_handler_key = async () => {
        try {
            let handlerkey = await func_handler_key_sub(this.state.server);
            if (handlerkey === false) {
                this.props.navigation.navigate("Login");
            }
            else {
                const value = await AsyncStorage.getItem('@storage_Key')
                if (value != null) {
                    this.setState({ key: value.split(':')[1] })
                    this.setState({ username: value.split(':')[0] })


                }
            }

        }
        catch (e) {
            console.log(e)
        }
    }
    func_delete_request = async () => {
        try {
           
            const value_token = await AsyncStorage.getItem("@storage_Key");
            if (value_token !== null) {
                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", "Bearer " + this.state.key);

                var raw = JSON.stringify({
                    "Suserad": this.state.username,
                    "Sbranchcode":this.state.macn
                });

                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow'
                };

                fetch(this.state.server + "/move/deleteuserrequest", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        console.log(result)
                        if (result === "Have") {
                            Alert.alert("Thông báo", "Bạn đã gửi yêu cầu và yêu cầu của bạn đang trong quá trình xét duyệt");
                        }
                        else {
                            if (result === "OK") {
                                Alert.alert("Thông báo", "Yêu cầu của bạn đã được gửi thành công chung tôi sẽ thực hiện việc xóa tài khoản sau 3 ngày làm việc")
                            }
                        }
                    })
                    .catch(error => console.log('error', error));
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    func_confirm_delete_request = () => {
        Alert.alert(
            'Thông báo',
            'Bạn chắc chán muốn hủy tài khoản của mình',
            [

                {
                    text: 'Không',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Có', onPress: () => {
                        console.log('OK Pressed');
                        this.func_delete_request();
                    }
                },
            ],
            { cancelable: false }
        );
    }

    func_re_register = () => {
        this.props.navigation.navigate('Register');
    }
    func_check_log = async () => {
        const value = await AsyncStorage.getItem('@storage_Log');
        alert(value);
    }
    func_handler_department = async () => {
        try {
            const value_token = await AsyncStorage.getItem('@storage_Key')
            if (value_token !== null) {

                var myHeaders = new Headers();
                myHeaders.append("Authorization", "Bearer " + this.state.key);

                var requestOptions = {
                    method: 'GET',
                    headers: myHeaders,
                    redirect: 'follow'
                };

                fetch(this.state.server + "/move/getdepartment", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        console.log(result);

                        let storeAble = func_store_data(result, 'department');

                        alert('Đã lấy xong dữ liệu phòng ban');

                    })
                    .catch(error => console.log('error', error));


            }
        }
        catch (e) {
            alert("EXXXXXXX" + e);
        }
    }

    render() {
        const { assetsLoaded } = this.state;
        if (assetsLoaded) {
            return (
                <SafeAreaView style={styles.mainview}>
                
                    <View style={styles.f1}>
                        <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={this.func_re_register}>
                            <Text style={styles.textinbutton} >
                                <Svg
                                    width={30}
                                    height={30}
                                    viewBox="0 0 20 15"
                                >
                                    <Path fill-rule="evenodd" d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434l.071-.286zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5zm0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78h4.723zM5.048 3.967c-.03.021-.058.043-.087.065l.087-.065zm-.431.355A4.984 4.984 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8 4.617 4.322zm.344 7.646.087.065-.087-.065z" fill="#FFFFFF" />
                                </Svg>
                                Đăng ký lại thiết bị
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={this.func_handler_department}>
                            <Text style={styles.textinbutton} >
                                <Svg
                                    width={30}
                                    height={30}
                                    viewBox="0 0 20 15"
                                >
                                    <Path fill-rule="evenodd" d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434l.071-.286zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5zm0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78h4.723zM5.048 3.967c-.03.021-.058.043-.087.065l.087-.065zm-.431.355A4.984 4.984 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8 4.617 4.322zm.344 7.646.087.065-.087-.065z" fill="#FFFFFF" />
                                </Svg>
                                Lấy dữ liệu phòng ban mới
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={() => { alert(this.state.tokenaccess) }}>
                            <Text style={styles.textinbutton} >
                                <Svg
                                    width={30}
                                    height={30}
                                    viewBox="0 0 20 15"
                                >
                                    <Path fill-rule="evenodd" d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2zM2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="#FFFFFF" />
                                </Svg>
                                {this.state.tokenaccess}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={(this.func_check_log)}>
                            <Text style={styles.textinbutton} >
                                <Svg
                                    width={30}
                                    height={30}
                                    viewBox="0 0 20 15"
                                >
                                    <Path fill-rule="evenodd" d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" fill="#FFFFFF" />
                                </Svg>
                                Xem log
                            </Text>
                        </TouchableOpacity>
                       
                        <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={(this.func_confirm_delete_request)}>
                            <Text style={styles.textinbutton} >
                                <Svg
                                    width={30}
                                    height={30}
                                    viewBox="0 0 20 15"
                                >
                                    <Path fill-rule="evenodd" d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zm-6.106 4.5L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z" fill="#FFFFFF" />
                                </Svg>
                                Yêu cầu xóa tài khoản
                            </Text>
                        </TouchableOpacity>
                    </View>
                
                </SafeAreaView>
            )
        }

    }
}





const styles = StyleSheet.create({
    mainview: {
        flexDirection: 'column',
        flex: 1,
        backgroundColor: 'white',
        marginTop: '13%',
        marginLeft: 10,
        marginRight: 10,
    },
    f1: {
        flex: 1,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#1177CB',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        width: "100%",
        height: 60,

    },
    textinbutton: {
        color: 'white',
        fontWeight: "bold",
        textAlign: 'center',

    },
})
export default Timekeeper_setting;