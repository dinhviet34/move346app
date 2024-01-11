import React, { Component } from 'react';
import { View, Text, StyleSheet,Alert, ScrollView, ActivityIndicator, Image, TextInput, TouchableOpacity, ImageBackground } from 'react-native';

import server from '../server';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import func_handler_key_sub from '../class/handleKey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import func_handler_auth_sub from '../class/handleAuth';
import { ProgressBar, Searchbar } from 'react-native-paper';
import * as Linking from 'expo-linking';

class Libraryfiles extends Component {
    constructor(props) {
        super(props)
        this.state = {
            server: server(),
            key: '',
            usercode: '',
            username: '',
            usequota: "",
            loading: false,
            jsonresult: '',
            assetsLoaded: false,
            search: '',
        }
    }
    async componentDidMount() {
        await Font.loadAsync({
            'Inter-Black': require('../assets/fonts/Inter-Black.ttf')
        });
        this.setState({ assetsLoaded: true });
        this.func_handler_key();
    }




    func_get_listfiles = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + this.state.key);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "Suserad": this.state.username
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(this.state.server + "/move/listfiles", requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result);
                this.setState({ jsonresult: result })
            })
            .catch(error => console.log('error', error));
    }
    func_handler_key = async () => {

        let handlerkey = await func_handler_key_sub(this.state.server);
        console.log("hkey " + handlerkey)
        if (handlerkey === false) {
            this.props.navigation.navigate("Login");
        }
        else {
            const value = await AsyncStorage.getItem('@storage_Key')
            //alert(value);
            if (value != null) {


                let handlerauth = await func_handler_auth_sub(this.state.server);
                console.log(handlerauth);
                if (handlerauth === false) {
                    this.props.navigation.navigate("Register");
                }
                else {
                    this.setState({ key: value.split(':')[1] });
                    this.setState({ username: value.split(':')[0] });
                    this.setState({ usercode: value.split(':')[2] });
                    this.func_get_usequota();
                    this.func_get_listfiles();
                }
            }
            else {
                this.props.navigation.navigate("Login");
            }

        }

    }
    func_render_usequota = () => {

        if (this.state.usequota !== "") {
            return (
                <View>
                    <ProgressBar progress={parseInt(this.state.usequota) / 100} color="#009FBD" />
                </View>
            )
        }

    }
    func_confirm_delete = (value)=>{
       // alert(value);
        Alert.alert(
            'Xác nhận',
            'Bạn muốn xóa file này?',
            [
                { text: 'Xóa', onPress: async() => await this.func_delete_file(value) },
                { text: 'Hủy' },
            ],
            { cancelable: false }
        )

    }
    func_delete_file = async(filename) => {
        
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + this.state.key);

        var formdata = new FormData();
        formdata.append("filename", filename);
        formdata.append("Susername", this.state.username);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        await fetch(this.state.server + "/move/deletefileuploadfolder", requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result);
                alert(result);
                this.func_get_listfiles();
               
            })
            .catch(error => console.log('error', error));
    }


    func_get_usequota = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + this.state.key);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "Suserad": this.state.username
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        await fetch(this.state.server + "/move/usequota", requestOptions)
            .then(response => response.text())
            .then(result => {
                this.setState({ usequota: result });
                console.log(result);
            })
            .catch(error => console.log('error', error));
    }
    func_render_uploading = () => {

        if (this.state.loading == true) {
            return (
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: "center", alignItems: "center", width: '100%', height: '30%', backgroundColor: "#1177CB", marginBottom: 5, }}>
                    <Text style={{ color: "white", fontSize: 13 }}>Đang thực hiện download file</Text>
                    <ActivityIndicator size="large" color="#white" />
                </View>
            )
        };
    }
    handlertext = async (object) => {


        let remoteUrl = this.state.server + "/move/downloadfile?username=" + this.state.username + "&filename=" + object.fileName + "&key=" + this.state.key;
        Linking.openURL(remoteUrl);
    };
    func_render_listfile_search = () => {

        //console.log(this.state.search);
        if (this.state.jsonresult != "") {
            if (this.state.search === '') {
                var json = JSON.parse(this.state.jsonresult);
                var listitem = [];
                json.forEach(element => {
                    listitem.push(element);
                })
            }
            else {
                var json = JSON.parse(this.state.jsonresult);
                var listitem = [];
                json.forEach(element => {
                    let filen = element.fileName.toUpperCase();
                    let datec = element.datecreate.toUpperCase();
                    if (filen.includes(this.state.search.toUpperCase())) {
                        listitem.push(element);
                    }
                    else {
                        if (datec.includes(this.state.search.toUpperCase())) {
                            listitem.push(element);
                        }
                    }

                })
            }



            return (
                <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={true}>
                    <View style={[styles.grey, { flexDirection: 'row' }]}>
                        {listitem.map((prop, key) => {
                            var iconr;
                            if (prop.icon === "/images/unknowfile.jpg") {
                                iconr = this.state.server + prop.icon;
                            }
                            else {
                                iconr = prop.icon;
                            }
                            return (
                                <View style={styles.bouderfile} key={key}>
                                    <Image
                                        source={{
                                            uri: iconr,
                                        }}
                                        style={{ width: 30, height: 30 }}></Image>
                                    <Text style={styles.textStyle} onLongPress={()=> this.func_confirm_delete(prop.fileName)} onPress={() => this.handlertext(prop)}>
                                        {prop.fileName}
                                    </Text>
                                    <Text style={styles.textStylesmall}>
                                        {prop.datecreate}
                                    </Text>
                                </View>
                            )

                        })
                        }

                    </View>
                </ScrollView>
            )



        }
    }
    handlersearch = (text) => {
        this.setState({ search: text });
    }


    func_render_listfile = () => {


        if (this.state.jsonresult != "") {
            var json = JSON.parse(this.state.jsonresult);
            var listitem = [];
            json.forEach(element => {
                listitem.push(element);
            });


            return (
                <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={true}>
                    <View style={[styles.grey, { flexDirection: 'row' }]}>
                        {listitem.map((prop, key) => {
                            var iconr;
                            if (prop.icon === "/images/unknowfile.jpg") {
                                iconr = this.state.server + prop.icon;
                            }
                            else {
                                iconr = prop.icon;
                            }
                            return (
                                <View style={styles.bouderfile} key={key}>
                                    <Image
                                        source={{
                                            uri: iconr,
                                        }}
                                        style={{ width: 30, height: 30 }}></Image>
                                    <Text style={styles.textStyle} onPress={() => this.handlertext(prop)}>
                                        {prop.fileName}
                                    </Text>
                                    <Text style={styles.textStylesmall}>
                                        {prop.datecreate}
                                    </Text>
                                </View>
                            )

                        })
                        }

                    </View>
                </ScrollView>
            )



        }


    }





    render() {
        return (
            <SafeAreaProvider style={styles.motherview}>
                <StatusBar style="dark" />
                <View style={styles.fatherview}>
                    <View style={{ flex: 1 }}>
                        <ImageBackground source={{ uri: this.state.server + '/icons/File_Upload_Banner_Final.png' }} style={styles.imagbg}>
                            <Text style={styles.textbannerStyle}>
                                Thư viện lưu trữ file
                            </Text>
                        </ImageBackground>
                        {this.func_render_uploading()}
                    </View>
                    <View style={{ flex: 9 }}>
                        <View style={styles.bartext}>
                            <Text style={styles.textbuttonStyle}>
                                Danh sách file của bạn
                            </Text>
                        </View>

                        {this.func_render_usequota()}
                        <View>
                            <TextInput
                                style={styles.styleinput}
                                onChangeText={(text) => this.handlersearch(text)}
                                value={this.state.search}
                                underlineColorAndroid="transparent"
                                placeholder="Tìm kiếm file ..."
                            />
                        </View>
                        {this.func_render_listfile_search()}
                    </View>

                </View>
            </SafeAreaProvider>
        )
    }
}
const styles = StyleSheet.create({
    motherview: {
        // backgroundColor: 'white',
        fontFamily: 'Inter-Black',
        marginTop: "13%",
    },
    textbuttonStyle: {
        color: 'white',
        fontSize: 14,
    },
    textStylesmall: {
        color: '#1177CB',
        fontSize: 11,
    },
    textbannerStyle: {
        fontSize: 21,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    textStyle: {

        fontSize: 14,
        textAlign: 'center',
        color: '#1177CB',
    },
    buttonStyle: {

        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#1177CB',
    },
    listfile: {

    },
    bartext: {

        backgroundColor: '#d80a47',
        paddingStart: 5,
        marginBottom: 0,
        alignContent: 'center',
        justifyContent: 'center',
        height: 30,
    },
    bouderfile: {
        flexDirection: 'column',
        alignItems: 'center',
        margin: 5,
        width: 90,
        height: 150,


    },
    grey: {
        backgroundColor: '#DDDDDD',
        paddingBottom: 10,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        width: '100%',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    fatherview: {
        flexDirection: 'column',
        flex: 1,
    },
    buttonStyle: {
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#1177CB',
    },
    imagbg: {
        flex: 1,
        height: '100%',
        resizeMode: 'cover',
        justifyContent: 'center',

    },
    textInputStyle: {
        height: 40,
        borderWidth: 1,
        paddingLeft: 20,
        margin: 5,
        borderColor: '#009688',
        backgroundColor: '#FFFFFF',
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

})
export default Libraryfiles;