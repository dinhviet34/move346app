import React, { Component } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, TextInput,ImageBackground, Image, Keyboard, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { getPreciseDistance } from 'geolib';
import { Camera, CameraType } from 'expo-camera';
import * as Contacts from 'expo-contacts';
import { NetworkStateType } from 'expo-network';
import * as FaceDetector from 'expo-face-detector';
import server from '../server';
import * as Device from 'expo-device';
import * as Font from 'expo-font';
import func_store_data from "../class/storeData";
import AsyncStorage from '@react-native-async-storage/async-storage';
import func_handler_key_sub from '../class/handleKey';
import resizeIMG from '../class/compressIMG';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import func_checkPassword from '../class/checkPassword';
import footertext from '../class/footertext';
import Ionicons from '@expo/vector-icons/Ionicons';


var dem = 1;

class Register extends Component {
    constructor(props) {
        super(props)
        this.state = {
            password: '',
            repassword: '',
            username: '',
            usercode: '',
            key: '',
            camera: false,
            cameratype: CameraType.front,
            facesDetected: false,
            facealert: '',
            imageuri: null,
            server: server(),
            device: '',
            thongbao: '',
            assetsLoaded: false,
            loading: false,
            showbutton: true,

        };
    };

    async componentDidMount() {
        await Font.loadAsync({
            'Inter-Black': require('../assets/fonts/Inter-Black.ttf')
        });
        this.setState({ showbutton: true });
        this.setState({ assetsLoaded: true });
        this.func_handler_key();
        this.func_handler_department();

    }
    func_render_uploading = () => {

        if (this.state.loading == true) {
            return (
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: "center", alignItems: "center", width: '100%', height: '100%', backgroundColor: "#1177CB" }}>
                    <Text style={{ color: "#fff", fontSize: 15 }}>Đang thực hiện đăng ký</Text>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )
        };
    }
    func_render_register_button = () => {
        if (this.state.showbutton == true) {
            return (
                <View>
                    <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={this.func_capture}>
                        <Text style={styles.textinbutton} >Chụp nhận dạng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={this.func_fetch_data}>
                        <Text style={styles.textinbutton} >Đăng ký thiết bị và nhận dạng</Text>
                    </TouchableOpacity>
                </View>

            )
        }
    }



    func_fetch_data = async () => {
        if (this.state.password === this.state.repassword) {
            if (func_checkPassword(this.state.password) === true) {
                if (this.state.imageuri === null) {
                    this.setState({ thongbao: "Chưa chụp nhận dạng khuôn mặt" })

                }
                else {
                    this.setState({ showbutton: false });
                    let filename = this.state.imageuri.split('/')[this.state.imageuri.split('/').length - 1];
                    //console.log(filename);
                    //console.log(this.state.usercode);
                    console.log(this.state.device);
                    var photo = {
                        uri: this.state.imageuri,
                        type: 'image/jpg',
                        name: filename,
                    };
                    var myHeaders = new Headers();
                    myHeaders.append("Authorization", "Bearer " + this.state.key);

                    var formdata = new FormData();
                    formdata.append("file", photo);
                    formdata.append("Suserad", this.state.username);
                    formdata.append("Stokenauth", this.state.device);
                    formdata.append("Spassword", this.state.password);
                    formdata.append("Susercode", this.state.usercode);

                    var requestOptions = {
                        method: 'POST',
                        headers: myHeaders,
                        body: formdata,
                        redirect: 'follow'
                    };
                    fetch(this.state.server + "/move/updatetokenauth", requestOptions)
                        .then(response => response.text())
                        .then(result => {
                            this.setState({ loading: true });

                            console.log(result);
                            this.setState({ thongbao: result });
                           
                            this.timeoutHandle = setTimeout(() => {
                                this.props.navigation.navigate('Welcome');
                               
                            }, 3000);
                            this.setState({ loading: false });

                        })
                        .catch(error => console.log('error', error));
                }
            }
            else {
                this.setState({thongbao:"Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 ký tự đặc biệt, 1 chữ số và tối thiểu 8 ký tự"});

            }
        }
        else{
            
            this.setState({ thongbao: "Mật khẩu và nhắc lại mật khẩu không đúng" })
        }


    }

    func_take_photo = async () => {
        let { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            this.setState({ thongbao: "Camera đã không được cho phép, vui lòng vào phần cài đặt để thay đổi quyền truy cập camera" })
        }
        else {
            const photo = await this.camera.takePictureAsync();
            var resizeimage = await resizeIMG(photo);
            this.setState({ imageuri: resizeimage.uri })
            this.setState({ camera: false })
        }
    }
    func_capture = () => {
        this.setState({ camera: true })

    }

    func_capture_off = () => {
        this.setState({ camera: false })
    }
    func_toggle_CameraType = () => {
        dem = dem + 1
        if (dem % 2 == 0) {
            this.setState({ cameratype: CameraType.back });
        }
        else {
            this.setState({ cameratype: CameraType.front });
        }
    }
    func_face_Detected = ({ faces }) => {
        if (faces.length === 1) {
            this.setState({ faceDetected: true });
            this.setState({ facealert: "Đã nhận diện khuôn mặt" });

        }
        else {
            this.setState({ faceDetected: false });
            this.setState({ facealert: "Không thể nhận diện khuôn mặt, giữ camera thẳng với khuôn mặt của bạn" });

        }

    }
    func_opencam = () => {
        if (this.state.camera === true) {
            Keyboard.dismiss();

            return (

                <View style={styles.containerMainontop}>
                    <Camera
                        style={styles.camera}
                        type={this.state.cameratype}
                        onFacesDetected={this.func_face_Detected}
                        faceDetectorSettings={{
                            mode: FaceDetector.FaceDetectorMode.fast,
                            detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                            runClassifications: FaceDetector.FaceDetectorClassifications.all,
                            minDetectionInterval: 125,
                            tracking: false
                        }}
                        ref={ref => { this.camera = ref }}
                    >



                    </Camera>
                    <View style={{ height: 80, justifyContent: 'center' }}>
                        <Text style={{ color: '#D61355', fontWeight: 'bold', textAlign: 'center' }}>
                            Lưu ý: Giữ camera thẳng với khuôn mặt, đây sẽ là kết quả để đối chiếu sinh trắc học chấm công
                        </Text>
                        <Text style={{ textAlign: 'center', marginTop: 10 }}>
                            {this.state.facealert}
                        </Text>
                    </View>
                    <View style={[styles.bottomContainer, { flexDirection: 'row' }]}>
                        <TouchableOpacity style={styles.buttonbottom} onPress={this.func_toggle_CameraType}>
                            <Text style={styles.textinbutton}>Lật camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttoncapture} onPress={this.func_take_photo}>
                            <Text style={styles.textinbuttoncaptruer} >Chụp ảnh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonbottom} onPress={this.func_capture_off}>
                            <Text style={styles.textinbutton} >Tắt camera</Text>
                        </TouchableOpacity>

                    </View>



                </View>
            )
        }
    }
    func_render_image = () => {
        if (this.state.imageuri !== null) {
            return (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={{ uri: this.state.imageuri }} style={{ width: 150, height: 200 }} ></Image>

                </View>

            )
        }
    }

    func_handler_device = async () => {
        
     
        //const deviceband = await Device.brand;
        //const deviceosname = await Device.osName;
        const username = await this.state.username;
        const value = await AsyncStorage.getItem('@storage_TokenAccess')
        //var md5c = md5(username);
        //const deviceosbuild = await Device.osInternalBuildId;
        this.setState({ device: username + "_"  + value });


    }


    func_handler_password = (text) => {
        this.setState({ password: text });
    };
    func_handler_repassword = (text) => {
        this.setState({ repassword: text });
    };



    func_handler_department = async () => {
        try {
            const value_token = await AsyncStorage.getItem('@storage_Key')
            if (value_token !== null) {
                const value_department = await AsyncStorage.getItem('@storage_department');
                if (value_department === null) {
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
                            console.log(storeAble);

                        })
                        .catch(error => console.log('error', error));
                }
                else {
                    console.log(value_department);
                }
            }
        }
        catch (e) {
            console.log("Exception:" + e);
        }
    }


    func_handler_key = async () => {
        try {
            let hkeysub = await func_handler_key_sub(this.state.server);
            //console.log(hkeysub + "jjjjjf");
            if (hkeysub === false) {
                this.props.navigation.navigate('Login')
            }
            else {
                const value = await AsyncStorage.getItem('@storage_Key')
                if (value != null) {
                    this.setState({ key: value.split(':')[1] })
                    this.setState({ username: value.split(':')[0] })
                    this.setState({ usercode: value.split(':')[2] })
                    this.func_handler_device();

                }

            }

        }
        catch (e) {
            console.log(e)
        }

    }


    render() {
        const { assetsLoaded } = this.state;
        if (assetsLoaded) {
            return (
                <SafeAreaProvider style={styles.containerMain}>
                    <StatusBar style="dark" />
                    {this.func_render_uploading()}
                    <View style={styles.subview}>
                        <View>
                            <Text style={{fontWeight:"bold",color:"#1177CB"}}>
                            <Ionicons name='md-person-circle' size={30} color="#1177CB"></Ionicons>
                                {this.state.username}
                            </Text>
                            {this.func_render_image()}
                        </View>

                        <View
                            style={{
                                borderBottomColor: '#2D2727',
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                margin: 10,
                            }}
                        />
                        <Text>
                        <Ionicons name='md-create' size={20} color="#1177CB"></Ionicons>
                            Đổi mật khẩu mặc định
                        </Text>
                        <View
                            style={{
                                borderBottomColor: '#2D2727',
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                margin: 10,
                            }}
                        />

                        <TextInput style={styles.styleinput} placeholder="New password" secureTextEntry={true} onChangeText={(this.func_handler_password)}></TextInput>
                        <TextInput style={styles.styleinput} placeholder="Retype new password" secureTextEntry={true} onChangeText={(this.func_handler_repassword)}></TextInput>

                        {this.func_render_register_button()}
                        <Text>{this.state.thongbao}</Text>
                    </View>
                    {this.func_opencam()}

                    

                </SafeAreaProvider>

            )
        }

    }


}
const styles = StyleSheet.create({
    containerMain: {
        backgroundColor: '#fff',
        width: '100%',
        height: '100%',
        fontFamily: 'Inter-Black',
        marginTop: "13%",
    },
    containerMainontop: {
        backgroundColor: '#fff',
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    subview: {
        margin: 10,
        flex:9,
    },
    f1footer: {
        flex: 1,



    },
    styleinput: {
        width: '100%',
        borderColor: '#454545',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        height: 50,

    },
    imagbg: {
        flex: 1,
        flexDirection: 'row',
        height: '100%',
        resizeMode: 'cover',
        justifyContent: 'center',
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
    },
    buttonbottom: {
        backgroundColor: '#1177CB',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        width: '32%',

    },
    buttoncapture: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 44 / 2,
        elevation: 3,
        width: '32%',

    },
    textinbuttoncaptruer: {
        color: '#263A29',
        fontSize: 20,
        textAlign: 'center',
        fontWeight: "bold",
    },
    textinbutton: {
        color: '#fff',
        fontWeight: "bold",
        textAlign: 'center',
    },
    bottomContainer: {
        backgroundColor: '#1177CB',
        width: '100%',
        height: 100,

        justifyContent: 'space-around',
        alignItems: 'center',
        //position: 'absolute', //Here is the trick
        //bottom: 0, //Here is the trick
    },
    camera: {
        width: '100%',
        height: '70%',
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 13,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 45,
        paddingHorizontal: 25,
        width: '100%',
        marginVertical: 10,
    },
    elevation: {
        elevation: 20,
        shadowColor: '#52006A',
    },
})
export default Register;