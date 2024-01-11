import React, { Component } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ImageBackground, TouchableOpacity, TextInput, Image, Keyboard } from 'react-native';
import * as Location from 'expo-location';
import { Camera, CameraType } from 'expo-camera';
import server from '../server';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import func_handler_key_sub from '../class/handleKey';
import func_handler_menu from '../class/handleMenu';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import func_handler_auth_sub from '../class/handleAuth';
import * as Clipboard from 'expo-clipboard';
import func_checkVersion from '../class/checkVersion';
import { FlatList, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import footertext from '../class/footertext';
import func_store_data from '../class/storeData';
import GenRandomString from '../class/genRandomString';
import func_getbranch from '../class/getBranch';
import func_getappallow from '../class/getAppAllow';
import func_checkLock from '../class/checkLock';
import * as ImagePicker from 'expo-image-picker';
import {createStackNavigator,withNavigation,} from 'react-navigation';
  

class Welcome extends Component {
    constructor(props) {
        super(props)
        this.state = {
            server: server(),
            assetsLoaded: false,
            caidat: '',
            namecaidat: '',
            namechamcong: '',
            namefile: '',
            namediachi: '',
            chamcong: '',
            uploadfile: '',
            key: '',
            usercode: '',
            username: '',
            version: '1',
            managerlocation: '',
            macn: '',
            tencn: '',
            allowapp: '',
            macnsaved: '',
            refreshing: false,
            thongbao: "",
        }
    }


    async componentDidMount() {

        this.load();

    }
    
  
    load = async () => {
        this.setState({ refreshing: true });
        await this.func_handler_key();
        var checklock = await func_checkLock(this.state.key, this.state.server);
        if (checklock === "1") {

            this.props.navigation.navigate("Login");
        }
        else {
            await Font.loadAsync({
                'Inter-Black': require('../assets/fonts/Inter-Black.ttf')
            });
            this.setState({ assetsLoaded: true });
            const value = await AsyncStorage.getItem('@storage_TokenAccess')


            if (value !== null) {

            }
            else {
                func_store_data(GenRandomString(20), 'TokenAccess');
            }

            await this.func_handler_menu_local();
            await this.func_handle_branch();
            const macnsave = await AsyncStorage.getItem('@storage_branchcode');
            //console.log(macnsave + "macn")
            this.setState({ macnsaved: macnsave });
            await this.func_handle_allowapp();
            var checkver = await func_checkVersion(this.state.key, this.state.server);


            if (this.state.version === checkver) {

            }
            else {
                if (checkver === '') {

                }
                else {
                    alert("Đã có version mới bạn cần cài đặt lại ứng dụng");
                }

            }
        }
        this.setState({ refreshing: false });
    }
    func_handle_branch = async () => {

        var result = await func_getbranch(this.state.server, this.state.usercode);

        this.setState({ macn: result.split('-')[0] });
        this.setState({ tencn: result.split('-')[1] });
    }
    func_handle_allowapp = async () => {

        var result = await func_getappallow(this.state.server, this.state.macn);

        this.setState({ allowapp: result });
    }
    func_handler_menu_local = async () => {
        var result = await func_handler_menu(this.state.server);
        var json = JSON.parse(result);
        console.log(json);
        for (var i = 0; i < json.length; i++) {

            if (json[i].Id === 1) {
                this.setState({ caidat: String(json[i].Nlock) });
                this.setState({ namecaidat: String(json[i].Sname).trim() })
            }
            else {
                if (json[i].Id === 2) {
                    this.setState({ chamcong: String(json[i].Nlock) });
                    this.setState({ namechamcong: String(json[i].Sname).trim() })
                }
                else {
                    if (json[i].Id === 3) {
                        this.setState({ uploadfile: String(json[i].Nlock) });
                        this.setState({ namefile: String(json[i].Sname).trim() })
                    }
                    else {
                        if (json[i].Id === 4) {
                            this.setState({ managerlocation: String(json[i].Nlock) });
                            this.setState({ namediachi: String(json[i].Sname).trim() });
                        }
                    }
                }
            }
        }


        // console.log(this.state.caidat + " " + this.state.chamcong + "fuck")

        //console.log(json);
    }
    //RENDER ELEMENT
    func_render_caidat = () => {
        if (this.state.caidat === '0') {
            if (this.state.allowapp.includes('1')) {
                return (
                    <View style={styles.appbar}>
                        <View style={[styles.bartext, styles.shadowProp]}>
                            <Text style={styles.texthead2}>
                                {this.state.namecaidat}
                            </Text>
                        </View>
                        <View style={[styles.f1, styles.card, styles.shadowProp]}>
                            <View style={styles.buttonGPlusStyle}>
                                <TouchableOpacity activeOpacity={0.5} onPress={this.func_redirect_timekeepersetting}>
                                    <Image
                                        source={{ uri: this.state.server + '/icons/setting.png' }}
                                        style={styles.ImageIconStyle}
                                    />

                                    <Text style={styles.TextStyle}> Cài đặt</Text>
                                </TouchableOpacity>


                            </View>

                        </View>
                    </View>

                )
            }

        }
    }
    func_render_upload = () => {
        if (this.state.uploadfile === '0') {
            if (this.state.allowapp.includes('3')) {
                return (
                    <View style={styles.appbar}>
                        <View style={[styles.bartext, styles.shadowProp]}>
                            <Text style={styles.texthead2}>
                                {this.state.namefile}
                            </Text>
                        </View>

                        <View style={[styles.f1, styles.card, styles.shadowProp]}>

                            <View style={styles.buttonGPlusStyle}>
                                <TouchableOpacity activeOpacity={0.5} onPress={this.func_redirect_uploadfiles}>
                                    <Image
                                        source={{ uri: this.state.server + '/icons/uploadfile.png' }}
                                        style={styles.ImageIconStyle}
                                    />
                                    <Text style={styles.TextStyle}> Chuyển tệp tin </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonGPlusStyle}>
                                <TouchableOpacity activeOpacity={0.5} onPress={this.func_redirect_library}>
                                    <Image
                                        source={{ uri: this.state.server + '/icons/libraryfile.png' }}
                                        style={styles.ImageIconStyle}
                                    />
                                    <Text style={styles.TextStyle}> Thư viện tệp </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonGPlusStyle}>
                                <TouchableOpacity activeOpacity={0.5} onPress={this.func_create_link}>
                                    <Image
                                        source={{ uri: this.state.server + '/icons/link.png' }}
                                        style={styles.ImageIconStyle}
                                    />
                                    <Text style={styles.TextStyle}> Tạo link </Text>
                                </TouchableOpacity>
                            </View>



                        </View>
                    </View>
                )
            }

        }
    }

    func_render_chamcong = () => {
        if (this.state.chamcong === '0') {
            if (this.state.allowapp.includes('2')) {
                return (

                    <View style={styles.appbar}>
                        <View style={[styles.bartext, styles.shadowProp]}>
                            <Text style={styles.texthead2}>
                                {this.state.namechamcong}
                            </Text>
                        </View>

                        <View style={[styles.f1, styles.card, styles.shadowProp]}>

                            <View style={styles.buttonGPlusStyle}>
                                <TouchableOpacity activeOpacity={0.5} onPress={this.func_redirect_Timekeeper}>
                                    <Image
                                        source={{ uri: this.state.server + '/icons/timekeeper.jpg' }}
                                        style={styles.ImageIconStyle}
                                    />
                                    <Text style={styles.TextStyle}> Chấm công </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonGPlusStyle}>

                                <TouchableOpacity activeOpacity={0.5} onPress={this.func_redirect_timekeeperreport}>
                                    <Image
                                        source={{ uri: this.state.server + '/icons/reports.png' }}
                                        style={styles.ImageIconStyle}
                                    />

                                    <Text style={styles.TextStyle}> Báo cáo</Text>
                                </TouchableOpacity>
                            </View>


                        </View>
                    </View>
                )
            }

        }
    }
    func_render_location = () => {
        if (this.state.managerlocation === '0') {
            if (this.state.allowapp.includes('4')) {
                return (

                    <View style={styles.appbar}>
                        <View style={[styles.bartext, styles.shadowProp]}>
                            <Text style={styles.texthead2}>
                                {this.state.namediachi}
                            </Text>
                        </View>

                        <View style={[styles.f1, styles.card, styles.shadowProp]}>
                            <View style={styles.buttonGPlusStyle}>
                                <TouchableOpacity activeOpacity={0.5} onPress={this.func_redirect_addlocation}>
                                    <Image
                                        source={{ uri: this.state.server + '/icons/addlocation.png' }}
                                        style={styles.ImageIconStyle}
                                    />
                                    <Text style={styles.TextStyle}>Thêm địa chỉ </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonGPlusStyle}>
                                <TouchableOpacity activeOpacity={0.5} onPress={this.func_redirect_location}>
                                    <Image
                                        source={{ uri: this.state.server + '/icons/location.png' }}
                                        style={styles.ImageIconStyle}
                                    />
                                    <Text style={styles.TextStyle}> Danh sách địa chỉ </Text>
                                </TouchableOpacity>
                            </View>



                        </View>
                    </View>
                )
            }

        }
    }
    func_render_thongbao = () => {
        if (this.state.thongbao != "") {
            return (
                <View>
                    <Text style={styles.texthead3}>
                        {this.state.thongbao}
                    </Text>
                </View>
            )
        }

    }


    func_handler_key = async () => {
        await this.func_require_camera();
        await this.func_require_gps();
        await this.func_require_ImageAccess();
        let hkeysub = await func_handler_key_sub(this.state.server);
        //console.log(hkeysub + "jjjjjf");
        if (hkeysub === false) {
            this.setState({ thongbao: "Bạn cần khởi động lại ứng dụng." })
            this.props.navigation.navigate('Login')
        }
        else {
            const value = await AsyncStorage.getItem('@storage_Key')
           // alert(value);
            if (value != null) {
               
                //console.log(value);
                let handlerauth = await func_handler_auth_sub(this.state.server);
                //console.log('oday');
                // console.log(handlerauth + " auth      ");
                if (handlerauth === false) {
                    this.props.navigation.navigate("Register");
                }
                else {
                   
                    this.setState({ key: value.split(':')[1] });
                    this.setState({ username: value.split(':')[0] });
                    this.setState({ usercode: value.split(':')[2] });
                }
            }
            else {
                this.setState({ thongbao: "Bạn cần khởi động lại ứng dụng. Để chương trình load lại menu." })
                this.props.navigation.navigate("Login");
            }

        }
    }
    func_require_ImageAccess = async()=>{
        let{status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if(status !== 'granted'){
            alert('Quyền truy cập thư viện bị từ chối hay thay đổi trong cài đặt');
            return;
        }
        return 'OK';
    }
   
    func_require_camera = async () => {
        let { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Quyền truy cập camera bị từ chối hãy thay đổi trong Cài đặt');
            return;
        }
        return 'OK';

    }
    func_require_gps = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Quyền truy cập vị trí bị từ chối hãy thay đổi trong Cài đặt');
            return;
        }
        return 'OK';


    }
    func_redirect_Timekeeper = () => {
        this.props.navigation.navigate('Timekeeper')
    }
    func_redirect_timekeepersetting = () => {
        this.props.navigation.navigate('Setting');
    }
    func_redirect_timekeeperreport = () => {
        this.props.navigation.navigate('Report');
    }
    func_redirect_uploadfiles = () => {
        this.props.navigation.navigate('Uploadfiles');
    }
    func_redirect_library = () => {
        this.props.navigation.navigate('Libraryfiles');
    }
    func_create_link = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + this.state.key);

        var formdata = new FormData();
        formdata.append("Susername", this.state.username);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };

        await fetch(this.state.server + "/move/createlink", requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result);
                Clipboard.setStringAsync(result);
                alert("Đã tạo link: " + result + " vào clipboard. Paste vào nơi cần gửi");
            })
            .catch(error => console.log('error', error));
    }
    func_redirect_location = () => {
        this.props.navigation.navigate('Address');
    }
    func_redirect_addlocation = () => {
        this.props.navigation.navigate('OperationAddress');
    }
   
    render() {
        const { assetsLoaded } = this.state;
        if (!assetsLoaded) return null;

        return (

            <SafeAreaProvider style={styles.motherview}>
                <StatusBar style="dark" />
                <View style={{ flex: 2 }}>
                    <ImageBackground source={{ uri: this.state.server + '/icons/bannerwelcome.jpg' }} style={styles.imagbg}>
                        <View style={styles.f1}>

                            <Text style={styles.texthead}>Move346</Text>


                        </View>
                        <View style={[styles.f1, { alignItems: 'flex-end' }]}>
                            <Image
                                source={{
                                    uri: this.state.server + '/icons/iconmobile.png'
                                }}
                                style={{ width: 50, height: '100%', opacity: 0.8 }}></Image>
                        </View>
                    </ImageBackground>


                </View>
                <View style={styles.ViewAvata}>
                    <Image
                        source={{
                            uri: this.state.server + "/move/renderfacefile?faceorupload=Faces&filename=" + this.state.usercode + ".jpg&username=" + this.state.username + "&key=" + this.state.key,
                        }}
                        style={styles.Avata}></Image>
                    <View style={{ justifyContent: 'center' }}>
                        <Text style={[styles.texthead3, { marginRight: 'auto' }]}>
                            {this.state.username.toLocaleUpperCase()}
                        </Text>
                        <Text style={styles.texthead4}>
                            {this.state.tencn?.toLocaleLowerCase()} - {this.state.macnsaved}
                        </Text>
                    </View>

                </View>


                <View style={styles.f3}>
                        {this.func_render_thongbao()}
                    <ScrollView style={{ flex: 1 }} refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.load}
                        ></RefreshControl>
                    }>
                        {this.func_render_chamcong()}
                        {this.func_render_upload()}
                        {this.func_render_location()}
                        {this.func_render_caidat()}
                    </ScrollView>


                </View>

                <View style={[styles.f1, { margin: 10, alignItems: 'center' }]}>
                    <Text style={styles.textfooter}>
                        {footertext()}
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.textfooter, { alignItems: 'center', justifyContent: 'center', marginTop: 5 }]}>
                            Ứng dụng Move346
                        </Text>

                    </View>

                </View>
                <View style={{ flex: 2 }}>
                    <ImageBackground source={{ uri: this.state.server + '/icons/banner.png' }} style={styles.imagbg}>

                    </ImageBackground>

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
    f1: {
        flex: 1,



    },
    f2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    f3: {
        flexDirection: 'column',
        flex: 15,


    },
    textfooter: {
        fontSize: 10,
        color: '#1177CB',
    },
    texthead: {
        fontSize: 20,
        fontWeight: 'bold',

        color: '#070A52',
        paddingLeft: 30,
        paddingRight: 30,
        textShadowColor: '#fff',
        textShadowOffset: { width: 5, height: 5 },
        textShadowRadius: 10,
    },
    texthead2: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#FFF',
        alignSelf: 'center',
    },
    texthead3: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#1177CB',
        alignSelf: 'center',
        marginLeft: 10,
    },
    texthead4: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#1177CB',
        alignSelf: 'center',
        marginLeft: 10,
        textTransform: 'capitalize',
    },
    ViewAvata: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginLeft: 10,
        marginRight: 10,
    },
    imagbg: {
        flex: 1,
        flexDirection: 'row',
        height: '100%',
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',

    },
    Avata: {
        width: 70,
        height: 70,
        aspectRatio: 1,
        alignSelf: 'center',

        borderRadius: 70 / 2,
    },
    ImageIconStyle: {
        padding: 10,
        margin: 5,
        height: 30,
        width: 30,
        borderRadius: 3,
        resizeMode: 'stretch',
    },
    buttonGPlusStyle: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#1177CB',
        borderWidth: 0.5,
        borderColor: '#fff',
        borderRadius: 5,
        margin: 5,
        width: 70,
        height: 70,


    },
    TextStyle: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        //paddingVertical: 45,
        //paddingHorizontal: 25,
        marginLeft: 10,
        marginRight: 10,
        maxHeight: 80,

        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    bartext: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        backgroundColor: '#d80a47',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 0,
        paddingBottom: 5,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',


    },
    appbar: {
        flex: 1,

    },


})


export default Welcome;