import React, { Component } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { getPreciseDistance } from 'geolib';
import { Camera, CameraType } from 'expo-camera';

import * as FaceDetector from 'expo-face-detector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import server from '../server';
import * as Font from 'expo-font';
import Svg, { Path } from "react-native-svg";
import func_handler_key_sub from '../class/handleKey';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import func_handler_auth_sub from '../class/handleAuth';
import resizeIMG from '../class/compressIMG';
import { StatusBar } from 'expo-status-bar';

const title = "Khai báo chấm công";
var dem = 1;



class Timekeeper extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lat: '',
            lng: '',
            distance: null,
            type: CameraType.front,
            dem: 1,
            viewcamera: false,
            facesDetected: false,
            facealert: '',
            timer: null,
            laydulieu: '',
            key: '',
            server: server(),
            assetsLoaded: false,
            departmentarray: [],
            departmentcode: '',
            departmentname: '',
            usercode: '',
            username:'',
            loading: false,
            imageuri: null,
            currentdate: null,
        }
    };


    fucn_get_CurrentTime = () => {
        let today = new Date();
        let hours = (today.getHours() < 10 ? '0' : '') + today.getHours();
        let minutes = (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();
        let seconds = (today.getSeconds() < 10 ? '0' : '') + today.getSeconds();
        return hours + ':' + minutes + ':' + seconds;
    }

    func_get_location = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Bạn đã không cấp quyền truy cập vị trí nên không thể xác định được vị trí của bạn để thực hiện việc điểm danh chấm công');

        }
        else {
            try { 
                let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.BestForNavigation});
                let mock = location.mocked ? "Yes" : "No";
                console.log(mock);
                if (mock === "No") {
                    const value_department = await AsyncStorage.getItem('@storage_department');
                    console.log(value_department);
                    let obj = JSON.parse(value_department);

                    var arraydepcode = [];
                    var array = [];
                    for (const x in obj) {
                        var pointlat = obj[x].Scoordinate.split(',')[0];
                        var pointlng = obj[x].Scoordinate.split(',')[1];
                        var dist = getPreciseDistance(
                            { latitude: location.coords.latitude, longitude: location.coords.longitude },
                            { latitude: pointlat, longitude: pointlng },
                        );
                        arraydepcode.push(obj[x].Sdepartmentcode + ":" + obj[x].Sdepartmentname + ":" + dist);
                        array.push(dist);
                    }
                    var mindistance = Math.min.apply(Math, array)

                    //const loc = JSON.stringify(location);
                    //this.setState({lat:location.coords.latitude});
                    //this.setState({lng:location.coords.longitude});
                    //alert(loc);
                    //alert(location.coords.latitude)  
                    this.setState({ lat: location.coords.latitude });
                    this.setState({ lng: location.coords.longitude });
                    this.setState({ distance: mindistance });
                    var indexofmin = array.indexOf(mindistance);
                    this.setState({ departmentcode: arraydepcode[indexofmin].split(':')[0] })
                    this.setState({ departmentname: arraydepcode[indexofmin].split(':')[1] })

                }
                else {
                    alert("Bạn đang sử dụng chương trình fake GPS");
                    this.props.navigation.navigate("Welcome");
                }


                return location;

            }
            catch (error) {
                console.log(error);
            }


        }


    };


    func_camera = async () => {
        let { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('');

        }
        else {
            this.setState({ type: CameraType.front });
            this.setState({ viewcamera: true });
        }

    }
    func_take_photo = async () => {
        let { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            this.setState({ thongbao: "Camera đã không được cho phép, vui lòng vào phần cài đặt để thay đổi quyền truy cập camera" })
        }
        else {
            var photo = await this.camera.takePictureAsync();
            var resizeimage = await resizeIMG(photo);
            //console.log(resizeimage.uri);
            this.setState({ imageuri: resizeimage.uri })
            //console.log(this.state.imageuri);


        }
    }

    func_get_time = () => {
        let timer = setInterval(() => {
            this.setState({ timer: this.fucn_get_CurrentTime() });
        }, 1000);
    }




    func_toggle_CameraType = () => {
        arraysmile = [];
        arryangle = [];
        arryeyes = [];
        arrypushdis = [];
        dem = dem + 1;
        if (dem % 2 == 0) {
            this.setState({ type: CameraType.back });
        }
        else {
            this.setState({ type: CameraType.front });
        }


    }

    func_get_info = async () => {

        this.setState({ laydulieu: "Đang lấy dữ liệu" })
        var loc = await this.func_get_location();
        if (loc !== null) {
            if (loc.length > 0) {
                var tachloc = loc.split('|');
                this.setState({ lat: tachloc[0] });
                this.setState({ lng: tachloc[1] });
                this.setState({ distance: tachloc[2] });


            }
            this.setState({ laydulieu: "Lấy dữ liệu vị trí hiện tại" })
        }
        else {
            this.setState({ laydulieu: "Không có thông tin phòng ban" });
        }



        //var num = await getphonenumber();



    }
    func_render_uploading = () => {

        if (this.state.loading == true) {
            return (
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: "center", alignItems: "center", width: '100%', height: '30%', backgroundColor: "#1177CB", marginBottom: 5, }}>
                    <Text style={{ color: "white", fontSize: 13 }}>Đang thực hiện đối chiếu</Text>
                    <ActivityIndicator size="large" color="#white" />
                </View>
            )
        };
    }
    func_get_CurrentDate = () => {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        this.setState({ currentdate: mm + '/' + dd + '/' + yyyy });
    }

    func_chamcong = async () => {
        //console.log(this.state.key + "ddfsd");
        let hkeysub = await func_handler_key_sub(this.state.server);
        //console.log(hkeysub + "jjjjjf");
        if (hkeysub === false) {
            this.props.navigation.navigate('Login')
        }
        else {
            let hauthsub = await func_handler_auth_sub(this.state.server);
            if (hauthsub === true) {
                this.setState({ loading: true });
                const photof = await this.func_take_photo();

                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();

                var currentday = mm + '/' + dd + '/' + yyyy;


                let hours = (today.getHours() < 10 ? '0' : '') + today.getHours();
                let minutes = (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();
                let seconds = (today.getSeconds() < 10 ? '0' : '') + today.getSeconds();
                var currenttime = hours + ':' + minutes + ':' + seconds;

                console.log(currenttime + "          " + currentday + this.state.usercode + this.state.departmentcode);
                //var photouri = photof.uri;
                let filename = this.state.imageuri.split('/')[this.state.imageuri.split('/').length - 1];
                //console.log(filename);
                var photo = {
                    uri: this.state.imageuri,
                    type: 'image/jpg',
                    name: filename,
                };
                var myHeaders = new Headers();
                myHeaders.append("Authorization", "Bearer " + this.state.key);

                var formdata = new FormData();
                formdata.append("file", photo);
                formdata.append("Susercode", this.state.usercode);
                formdata.append("Sdepartmentcode", this.state.departmentcode);
                formdata.append("Stime", currenttime);
                formdata.append("Ddate", currentday);
                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: formdata,
                    redirect: 'follow'
                };

                await fetch(this.state.server + "/move/writelog", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        //this.setState({faceDetected:false});
                        console.log(result);
                        this.setState({ loading: false });
                        alert(result);
                        //this.setState({faceDetected:true});


                    })
                    .catch(error => console.log('error', error));
            }
            else {
                this.props.navigation.navigate('Register')
            }

        }
    }

    func_face_Detected = async ({ faces }) => {

        if (faces.length === 1) {
            this.setState({ faceDetected: true });
            this.setState({ facealert: "Đã phát hiện khuôn mặt giữ nguyên và nhấn nút khai báo" });
        }
        else {
            if (faces.length === 0) {

                //console.log(arryangle)

                this.setState({ faceDetected: false });
                this.setState({ facealert: "Không thể phát hiện khuôn mặt" });
            }
            else {
                if (faces.length > 1) {

                    this.setState({ faceDetected: false });
                    this.setState({ facealert: "Có quá nhiều khuôn mặt trong khung hình" });
                }
            }


        }
    }

    func_render_ElementGetInfo() {
        if (this.state.distance !== null) {
            if (this.state.distance < 20) {
                if (this.state.faceDetected == true && this.state.loading == false) {
                    return (
                        <View>

                            <Pressable style={styles.buttonStyle} onPress={this.func_chamcong}>
                                <Text style={styles.textbuttonStyle}>{title}</Text>
                            </Pressable>

                        </View>
                    )

                }
            }
            else {
                return (
                    <View>
                        <Text>
                            Khoảng cách đến điểm khai báo quá xa tiếp tục di chuyển và lấy lại dữ liệu
                        </Text>
                        <Pressable style={styles.buttonStyle} onPress={this.func_get_info}>
                            <Text style={styles.textbuttonStyle}>{this.state.laydulieu}</Text>
                        </Pressable>

                    </View>
                )

            }


        }
        else {
            return (
                <View>
                    <Text>
                        Khoảng cách đến điểm khai báo quá xa tiếp tục di chuyển và lấy lại dữ liệu
                    </Text>
                    <Pressable style={styles.buttonStyle} onPress={this.func_get_info}>
                        <Text style={styles.textbuttonStyle}>{this.state.laydulieu}</Text>
                    </Pressable>

                </View>
            )

        }
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
                }
            }
            else {
                this.props.navigation.navigate("Login");
            }

        }

    }
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
                            this.func_setstate_department_array(result);

                        })
                        .catch(error => console.log('error', error));
                }
                else {
                    this.func_setstate_department_array(value_department);

                }
            }
        }
        catch (e) {
            console.log("EXXXXXXX" + e);
        }
    }



    func_setstate_department_array = (inputjsontype) => {
        let obj = JSON.parse(inputjsontype);
        var array = [];
        for (const x in obj) {
            array.push(obj[x].Scoordinate);

        }
        this.setState({ departmentarray: array });
        console.log(this.state.departmentarray);
    }




    async componentDidMount() {
        await Font.loadAsync({
            'Inter-Black': require('../assets/fonts/Inter-Black.ttf')
        });

        this.setState({ assetsLoaded: true });
        this.func_get_time();
        this.func_get_CurrentDate();
        await this.func_handler_key();
        await this.func_camera();
        await this.func_get_info();


        await this.func_handler_department();


    }
    async componentWillUnmount() {

        this.timer
    }







    render() {
        const { assetsLoaded } = this.state;
        if (assetsLoaded) {
            return (
                <SafeAreaProvider style={styles.viewStyle}>

                    <StatusBar style="dark" />
                    <View style={[styles.card, styles.shadowProp, styles.f5]}>

                        <View style={styles.f4}>
                            {this.func_render_uploading()}

                            <View style={[styles.f5, styles.previewcamera]}>
                                <Camera
                                    style={[styles.camera, styles.f4]}
                                    type={this.state.type}
                                    ratio={'4:3'}
                                    onFacesDetected={this.func_face_Detected}
                                    faceDetectorSettings={{
                                        mode: FaceDetector.FaceDetectorMode.accurate,
                                        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                                        runClassifications: FaceDetector.FaceDetectorClassifications.all,
                                        minDetectionInterval: 125,
                                        tracking: true
                                    }}
                                    ref={ref => { this.camera = ref }}
                                >



                                </Camera>

                            </View>


                        </View>

                        <View style={[styles.f2, { paddingBottom: 15, }]}>
                            <Text style={styles.textcenter}>
                                {this.state.facealert}
                            </Text>
                            <View style={[styles.bartext]}>
                                <Text style={styles.texthead2}>
                                    Dữ liệu
                                </Text>
                            </View>
                            <View style={styles.grey}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Svg
                                        width={20}
                                        height={20}
                                        viewBox="0 0 20 20"
                                    >
                                        <Path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" fill="#000" />

                                    </Svg>
                                    <Text>
                                        {this.state.username}


                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Svg
                                        width={20}
                                        height={20}
                                        viewBox="0 0 20 20"
                                    >
                                        <Path fill-rule="evenodd" d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" fill="#000" />
                                        <Path fill-rule="evenodd" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" fill="#000" />


                                    </Svg>
                                    <Text>
                                        {this.state.timer} {this.state.currentdate}
                                    </Text>

                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Svg
                                        width={20}
                                        height={20}
                                        viewBox="0 0 20 20"
                                    >
                                        <Path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="#000" />

                                    </Svg>
                                    <Text>
                                        {this.state.lat},{this.state.lng}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Svg
                                        width={20}
                                        height={20}
                                        viewBox="0 0 20 20"
                                    >
                                        <Path fill-rule="evenodd" d="M3.1 11.2a.5.5 0 0 1 .4-.2H6a.5.5 0 0 1 0 1H3.75L1.5 15h13l-2.25-3H10a.5.5 0 0 1 0-1h2.5a.5.5 0 0 1 .4.2l3 4a.5.5 0 0 1-.4.8H.5a.5.5 0 0 1-.4-.8l3-4z" fill="#000" />
                                        <Path fill-rule="evenodd" d="M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999z" fill="#000" />


                                    </Svg>
                                    <Text>
                                        {this.state.departmentname}
                                    </Text>

                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Svg
                                        width={20}
                                        height={20}
                                        viewBox="0 0 20 20"
                                    >
                                        <Path d="M1 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5v-1H2v-1h4v-1H4v-1h2v-1H2v-1h4V9H4V8h2V7H2V6h4V2h1v4h1V4h1v2h1V2h1v4h1V4h1v2h1V2h1v4h1V1a1 1 0 0 0-1-1H1z" fill="#000" />
                                    </Svg>
                                    <Text>
                                        {this.state.distance}
                                    </Text>

                                </View>

                            </View>

                        </View>


                    </View>
                    <View style={[styles.f1, { marginBottom: 10 }]}>
                        {this.func_render_ElementGetInfo()}
                    </View>


                </SafeAreaProvider>

            )
        }



    }
}

const styles = StyleSheet.create({
    viewStyle: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginTop: "13%",
    },
    f1: {
        flex: 1,
    },
    f2: {
        flex: 2,
    },
    f3: {
        flex: 3,
    },
    f4: {
        flex: 4,
    },
    f5: {
        flex: 5,
    },
    f6: {
        flex: 6,
    },
    f7: {
        flex: 7,
    },
    textcenter: {
        textAlign: 'center',
    },
    textStyle: {
        color: '#362FD9',
        fontSize: 18,
    },
    textclock: {
        color: '#1177CB',
        fontSize: 20,
        fontWeight: 'bold',
    },
    textbuttonStyle: {
        color: 'white',
        fontSize: 18,
    },
    textbuttonStyle2: {
        color: 'white',
        fontSize: 14,
    },
    viewcamera: {
        flex: 1,
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
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 25,
        width: '100%',
        marginVertical: 10,

    },
    cardmenu: {
        backgroundColor: 'white',
        borderRadius: 8,


    },
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    bottomContainer: {
        backgroundColor: '#1177CB',
        width: '100%',
        height: 45,

        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute', //Here is the trick
        bottom: 0, //Here is the trick
    },
    buttonbottom: {
        backgroundColor: '#1177CB',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
    },
    camera: {
        width: '100%',
        height: '80%',


    },
    bartext: {
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
        backgroundColor: '#d80a47',
        paddingStart: 5,
        marginBottom: 0,

        height: 30,



    },
    texthead2: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#FFF',

    },
    previewcamera: {
        height: '100%',
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden'
    },
    ImageIconStyle: {
        padding: 10,
        margin: 5,
        height: 40,
        width: 40,
        borderRadius: 8,
        resizeMode: 'stretch',
    },
    buttonGPlusStyle: {
        flexDirection: 'column',
        backgroundColor: '#1177CB',
        borderWidth: 0.5,
        alignItems: 'center',
        borderColor: '#fff',
        height: 70,
        borderRadius: 5,
        margin: 5,
    },
    grey: {
        backgroundColor: '#DDDDDD',
        paddingBottom: 10,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    }


})
export default Timekeeper;