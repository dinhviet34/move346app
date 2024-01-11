import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, ImageBackground } from 'react-native';

import server from '../server';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import func_handler_key_sub from '../class/handleKey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import func_get_filename from '../class/getfileName';
import Svg, { Path } from "react-native-svg";
import func_handler_auth_sub from '../class/handleAuth';
import func_remove_speacialchar from '../class/removeSpecialChar';
import { ProgressBar, MD3Colors } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

class Uploadfiles extends Component {
    constructor(props) {
        super(props)
        this.state = {
            server: server(),
            assetsLoaded: false,
            loading: false,
            listfile: [],
            listfilename: [],
            key: '',
            usercode: '',
            username: '',
            loading: false,
            result: false,
            jsonresult: '',
            showresult: false,
            usequota: "",

        }
    }
    async componentDidMount() {
        await Font.loadAsync({
            'Inter-Black': require('../assets/fonts/Inter-Black.ttf')
        });
        this.setState({ assetsLoaded: true });
        this.func_handler_key();



    }

    func_render_uploading = () => {

        if (this.state.loading === true) {
            return (
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: "center", alignItems: "center", width: '100%', height: '30%', backgroundColor: "#1177CB", marginBottom: 5, }}>
                    <Text style={{ color: "white", fontSize: 13 }}>Đang thực hiện đối chiếu</Text>
                    <ActivityIndicator size="large" color="#white" />
                </View>
            )
        };
    }
    func_render_button = () => {
        if (this.state.loading === false) {
            return (
                <View>
                    {this.func_render_usequota()}
                    <TouchableOpacity style={styles.buttonStyle} onPress={this.func_pick_documents}>
                        <View style={{ flexDirection: 'row' }}>
                            <Ionicons name='md-document-attach' size={14} color="#fff"></Ionicons>
                            <Text style={styles.textbuttonStyle}>

                                Chọn file...
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStyle} onPress={this.func_get_picture}>
                        <View style={{ flexDirection: 'row' }}>
                            <Ionicons name='md-images' size={14} color="#fff"></Ionicons>
                            <Text style={styles.textbuttonStyle}>

                                Chọn ảnh...
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStyle} onPress={this.func_upload}>
                        <View style={{ flexDirection: 'row' }}>
                            <Ionicons name='md-cloud-upload' size={14} color="#fff"></Ionicons>
                            <Text style={styles.textbuttonStyle}>

                                Tải lên
                            </Text>
                        </View>
                    </TouchableOpacity>

                </View>
            )
        }
    }
    func_get_picture = async () => {
        var listfilearray = this.state.listfile;
        var listfilenamearray = this.state.listfilename;
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            option: { allowsMultipleSelection: true },
        });

        if (!result.canceled) {
            //console.log(result.assets[0].fileName);
            var name = func_remove_speacialchar(result.assets[0].fileName.split('.')[0]);
            var ext = result.assets[0].fileName.split('.')[1];
            var fullnamefile = name + '.' + ext
            listfilenamearray.push(fullnamefile);
            var name = fullnamefile;
            var uri = result.assets[0].uri;
            var type = result.mimeType;
            var fullfile = { uri: uri, type: type, name: name };
            listfilearray.push(fullfile);
            this.setState({ listfile: listfilearray });
            this.setState({ listfilename: listfilenamearray });
        }


    }

    func_pick_documents = async () => {
        var listfilearray = this.state.listfile;
        var listfilenamearray = this.state.listfilename;
        let result = await DocumentPicker.getDocumentAsync({});
        var name = func_remove_speacialchar(result.name.split('.')[0]);
        var ext = result.name.split('.')[1];
        var fullnamefile = name + '.' + ext
        listfilenamearray.push(fullnamefile);
        var name = fullnamefile;
        var uri = result.uri;
        var type = result.mimeType;

        var fullfile = { uri: uri, type: type, name: name };
        listfilearray.push(fullfile);


        this.setState({ listfile: listfilearray });
        this.setState({ listfilename: listfilenamearray });
    }
    func_upload = async () => {
        this.setState({ loading: true });
        this.setState({ showresult: false });
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + this.state.key);
        var listf = this.state.listfile;

        var formdata = new FormData();
        formdata.append("Susername", this.state.username);
        for (let i = 0; i < listf.length; i++) {
            var file = {
                uri: listf[i].uri,
                type: listf[i].type,
                name: listf[i].name,

            }

            formdata.append("files", file);
        }
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        await fetch(this.state.server + "/move/uploadfiles", requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result);
                this.setState({ jsonresult: result });
                this.setState({ loading: false });
                this.setState({ listfilename: [] });
                this.setState({ showresult: true });
                this.setState({ listfile: [] });

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
                }
            }
            else {
                this.props.navigation.navigate("Login");
            }

        }

    }
    handlertext = (text) => {

        var lfilename = this.state.listfilename;
        var lfilefull = this.state.listfile;
        const index = lfilename.indexOf(text);
        const x = lfilename.splice(index, 1);
        this.setState({ listfilename: lfilename });
        for (let i = 0; i < lfilefull.length; i++) {
            if (lfilefull[i].name === text) {
                lfilefull.splice(i, 1);
            }
        }
        this.setState({ listfile: lfilefull });
        console.log(this.state.listfile);

    };
    func_render_uploadedfile = () => {
        if (this.state.showresult === true) {

            if (this.state.jsonresult != "") {
                var json = JSON.parse(this.state.jsonresult);
                var listitem = [];
                json.forEach(element => {
                    listitem.push(element);
                });


                return (
                    <ScrollView>
                        <View >
                            {listitem.map((prop, key) => {
                                return (
                                    <View key={key} style={{ flexDirection: 'column', margin: 5, }}>
                                        <View style={{ flexWrap: 'wrap', }}>
                                            <Svg
                                                width={20}
                                                height={20}
                                                viewBox="0 0 20 20"
                                            >
                                                <Path d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2z" fill="#1177CB" />
                                                <Path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z" fill="#1177CB" />
                                            </Svg>
                                            <Text style={styles.textStylesmall}>
                                                Tải lên : {prop.Name}
                                            </Text>
                                            <Text style={styles.textStylesmall}>
                                                Kết quả : {prop.Status}
                                            </Text>
                                        </View>

                                    </View>
                                )

                            })
                            }

                        </View>
                    </ScrollView>
                )



            }
        }

    }
    func_render_listfileupload = () => {
        if (this.state.listfilename != []) {
            var listitem = this.state.listfilename;

            return (
                <ScrollView>
                    <View style={[styles.grey, { flexDirection: 'row' }]}>


                        {listitem.map((prop, key) => {
                            return (
                                <View style={styles.bouderfile} key={key}>
                                    <Svg
                                        width={60}
                                        height={80}
                                        viewBox="0 0 20 20"
                                    >
                                        <Path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM3 9h10v1H6v2h7v1H6v2H5v-2H3v-1h2v-2H3V9z" fill="#1177CB" />

                                    </Svg>
                                    <Text onPress={() => this.handlertext(prop)} >
                                        {prop}


                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>


            )
        }
    }
    func_render_uploading = () => {

        if (this.state.loading == true) {
            return (
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: "center", alignItems: "center", width: '100%', height: '30%', backgroundColor: "#1177CB", marginBottom: 5, }}>
                    <Text style={{ color: "white", fontSize: 13 }}>Đang thực hiện chuyển file</Text>
                    <ActivityIndicator size="large" color="#white" />
                </View>
            )
        };
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



    render() {
        const { assetsLoaded } = this.state;
        if (!assetsLoaded) return null;
        return (
            <SafeAreaProvider style={styles.motherview}>
                <StatusBar style="dark" />
                <View style={styles.fatherview}>
                    <View style={{ flex: 1 }}>
                        <ImageBackground source={{ uri: this.state.server + '/icons/File_Upload_Banner_Final.png' }} style={styles.imagbg}>
                            <Text style={styles.textStyle}>
                                Chuyển dữ liệu từ di động vào Inet
                            </Text>
                        </ImageBackground>
                        {this.func_render_uploading()}
                    </View>
                    <View style={{ flex: 2, backgroundColor: '#DDDDDD' }}>
                        <View style={styles.bartext}>
                            <Text style={styles.textbuttonStyle}>
                                Danh sách file sẽ tải lên
                            </Text>
                        </View>
                        {this.func_render_listfileupload()}
                    </View>

                    <View style={{ flex: 4 }}>
                        <View style={{ flex: 1 }}>

                            {this.func_render_button()}
                        </View>
                        <View style={{ flex: 2 }}>
                            {this.func_render_uploadedfile()}

                        </View>

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
        marginLeft: 5,
    },
    textStylesmall: {
        color: '#1177CB',
        fontSize: 14,
    },
    textStyle: {

        fontSize: 21,
        textAlign: 'center',
        fontWeight: 'bold',
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
})
export default Uploadfiles;