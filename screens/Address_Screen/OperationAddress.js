import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Keyboard, Modal, Image, TextInput, TouchableOpacity, ImageBackground, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import { getPreciseDistance } from 'geolib';
import server from '../../server';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import func_handler_key_sub from '../../class/handleKey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import func_handler_auth_sub from '../../class/handleAuth';
import * as Linking from 'expo-linking';
import { FlatList } from 'react-native-gesture-handler';
import Svg, { Path } from "react-native-svg";
import ImageViewer from 'react-native-image-zoom-viewer';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Asset } from 'expo-asset';
import FileSystem from 'expo-file-system';
import GenRandomString from '../../class/genRandomString';
import { TouchableHighlightComponent } from 'react-native';


class OperationAddress extends Component {

    constructor(props) {
        super(props)

        this.state = {
            server: server(),
            assetsLoaded: false,
            nameaddress: '',
            address: '',
            id: '',
            district: '',
            province: '',
            note: '',
            user: '',
            date: '',
            images: '',
            listimages: [],
            listimagesdelete: [],
            listimagesupload: [],
            key: '',
            usercode: '',
            username: '',
            lat: '',
            lng: '',
            loading: false,
          
        }
    }
    componentDidMount() {
        this.func_get_values();
        this.func_handler_key();
        this.getPrermissionCap();
        this.getPrermissionPick();
      
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
    func_render_loading = () => {

        if (this.state.loading == true) {
            return (
                <View style={{ flexDirection: 'row', justifyContent: "center", alignItems: "center", width: '100%', marginBottom: 5, }}>
                    <Text style={{ fontSize: 13, margin: 5, }}>Đang xử lý dữ liệu</Text>
                    <ActivityIndicator size="large" color="#white" />
                </View>
            )
        };
    }


    func_get_location = async () => {
        this.setState({ loading: true });
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Chương trình cần phải được cấp quyền truy cập vị trí để lấy tọa độ của điểm cần lưu');

        }
        else {
            try {


                let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.BestForNavigation});
                let fulladdress = await Location.reverseGeocodeAsync(location.coords);
                let address1 = "";
                let district1 = "";
                let province1 = "";
                fulladdress.find(p => {
                    address1 = p.name + "-" + p.district;
                    district1 = p.city;
                    province1 = p.region;
                });

                this.setState({ address: address1 });
                this.setState({ district: district1 });
                this.setState({ province: province1 });
                let mock = location.mocked ? "Yes" : "No";
                if (mock === "No") {
                    this.setState({ lat: location.coords.latitude });
                    this.setState({ lng: location.coords.longitude });
                }
                else {
                    alert("Bạn đang sử dụng chương trình fake GPS");
                    this.props.navigation.navigate("Welcome");
                }

                //console.log(this.state.address + " " + this.state.district + " " + this.state.province);
                //console.log(this.state.lat + "   " + this.state.lng);
                this.setState({ loading: false });

            }
            catch (error) {
                console.log(error);
            }


        }


    };
    func_confirm_deleteaddress = ()=>{
        // alert(value);
         Alert.alert(
             'Xác nhận',
             'Bạn muốn xóa địa chỉ này?',
             [
                 { text: 'Xóa', onPress: async() => await this.func_delete_address() },
                 { text: 'Hủy' },
             ],
             { cancelable: false }
         )
 
     }
    func_delete_address = () => {
        if(this.state.id === ""){
            alert("Không thể thực hiện thao tác này");
        }
        else{
            this.setState({ loading: true });
            var myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer " + this.state.key);
            myHeaders.append("Content-Type", "application/json");
    
            var raw = JSON.stringify({
                "Id": this.state.id
            });
    
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
    
            fetch(this.state.server + "/move/deleteaddress", requestOptions)
                .then(response => response.text())
                .then(result => {
                    console.log(result);
                    alert(result);
                    this.setState({ loading: false });
                    this.props.navigation.navigate('Address',{
                        sendusername: this.state.username,
                    });
                })
                .catch(error => console.log('error', error));
        }
 
    }

    func_get_values = () => {
        const { navigation } = this.props;
        const getnameaddress = navigation.getParam('sendnameaddress', '')
        this.setState({ nameaddress: getnameaddress });
        const getdistrict = navigation.getParam('senddistrict', '');
        this.setState({ district: getdistrict });
        const getaddress = navigation.getParam('sendaddress', '');
        this.setState({ address: getaddress });
        const getprovince = navigation.getParam('sendprovince', '');
        this.setState({ province: getprovince })
        const getuser = navigation.getParam('senduser', '');
        this.setState({ user: getuser });
        const getdate = navigation.getParam('senddate', '');
        this.setState({ date: getdate });
        const getid = navigation.getParam('sendid', '');
        this.setState({ id: getid });
        const getnote = navigation.getParam('sendnote', '');
        this.setState({ note: getnote });
        const getimages = navigation.getParam('sendimages', '');
        this.setState({ images: getimages });
        const getcoordinate = navigation.getParam('sendcoordinate', '');
        if (getcoordinate !== '') {
            this.setState({ lat: getcoordinate.split(',')[0].trim() });
            this.setState({ lng: getcoordinate.split(',')[1].trim() });
        }

        if (getimages !== null) {
            var stringimages = getimages;

            var arrayimages = [];
            var splitimages = stringimages.split(',');

            for (let i = 0; i < splitimages.length; i++) {
                if (splitimages[i].trim() !== "") {

                    arrayimages.push(splitimages[i].trim());
                }
            }
            this.setState({ listimages: arrayimages })

        }
        
      


    }
    func_update_address = async () => {
        
        if (this.state.nameaddress !== "" &&
            this.state.address !== "" &&
            this.state.district !== "" &&
            this.state.province !== ""
        ) {
            this.setState({ loading: true });
            if (this.state.id != "") {
                var myHeaders = new Headers();
                myHeaders.append("Authorization", "Bearer " + this.state.key);

                var formdata = new FormData();
                var listf = this.state.listimagesupload;

                var formdata = new FormData();

                for (let i = 0; i < listf.length; i++) {
                    let file = {
                        uri: listf[i].uri,
                        type: listf[i].type,
                        name: listf[i].name,

                    }

                    formdata.append("images", file);
                }
                formdata.append("Sname", this.state.nameaddress);
                formdata.append("Saddress", this.state.address);
                formdata.append("Sdistrict", this.state.district);
                formdata.append("Sprovince", this.state.province);
                formdata.append("Scoordinate", this.state.lat + "," + this.state.lng);
                formdata.append("Snote", this.state.note);
                formdata.append("Simage", this.state.listimages);
                formdata.append("Suserad", this.state.username);
                formdata.append("Id", this.state.id);


                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: formdata,
                    redirect: 'follow'
                };

                await fetch(this.state.server + "/move/updateaddress", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        console.log(result);
                        alert(result);
                        this.setState({ loading: false });
                        this.props.navigation.navigate('Address',{
                            sendusername: this.state.username,
                        });
                    })
                    .catch(error => console.log('error', error));
            }
            else {
               

                var myHeaders = new Headers();
                myHeaders.append("Authorization", "Bearer " + this.state.key);

                var formdata = new FormData();
                formdata.append("Saddress", this.state.address);
                formdata.append("Sdistrict", this.state.district);
                formdata.append("Sprovince", this.state.province);
                formdata.append("Scoordinate", this.state.lat + "," + this.state.lng);
                formdata.append("Susercode", this.state.usercode);
                formdata.append("Suserad", this.state.username);
                formdata.append("Snote",this.state.note);
                formdata.append("Sname", this.state.nameaddress);
            
                var listf = this.state.listimagesupload;
                for (let i = 0; i < listf.length; i++) {
                    let file = {
                        uri: listf[i].uri,
                        type: listf[i].type,
                        name: listf[i].name,

                    }

                    formdata.append("images", file);
                }

                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: formdata,
                    redirect: 'follow'
                };

                await fetch(this.state.server + "/move/addnewaddress", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        console.log(result);
                        alert(result);
                        this.setState({ loading: false });
                        this.props.navigation.navigate('Address',{
                            sendusername: this.state.username,
                        });

                    })
                    .catch(error => console.log('error', error));
            }

        
    

        }
        else {
            alert("Bạn cần phải điền đầy đủ thông tin, chương trình có thể lấy địa chỉ tự động từ tọa độ")
        }

    }

    func_take_picture = async () => {
        let arrayimagestoupload = []
        let arrayimages = [];
        arrayimages = this.state.listimages;
        arrayimagestoupload = this.state.listimagesupload;
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            //console.log(result.assets[0]);
            const manipResult = await ImageManipulator.manipulateAsync(
                result.assets[0].localUri || result.assets[0].uri,
                [{ resize: { width: result.assets[0].width * 0.4, height: result.assets[0].height * 0.4 } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }

            );

            //console.log(manipResult.length);
            arrayimages.push(manipResult.uri);
            arrayimagestoupload.push({ uri: manipResult.uri, type: "image/jpeg", name: this.state.nameaddress + GenRandomString(4) + ".jpg" });
            //var fullfile = { uri: uri, type: type, name: name };
        }

        this.setState({ listimages: arrayimages });
        this.setState({ listimagesupload: arrayimagestoupload });
        console.log(this.state.listimagesupload);
    }

    func_get_picture = async () => {
        let arrayimagestoupload = []
        let arrayimages = [];
        arrayimages = this.state.listimages;
        arrayimagestoupload = this.state.listimagesupload;
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            //console.log(result.assets[0]);
            const manipResult = await ImageManipulator.manipulateAsync(
                result.assets[0].localUri || result.assets[0].uri,
                [{ resize: { width: result.assets[0].width * 0.5, height: result.assets[0].height * 0.5 } }],
                { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }

            );

            //console.log(manipResult.uri);
            arrayimages.push(manipResult.uri);
            arrayimagestoupload.push({ uri: manipResult.uri, type: "image/jpeg", name: this.state.nameaddress + GenRandomString(4) + ".jpg" });
            //var fullfile = { uri: uri, type: type, name: name };
        }

        this.setState({ listimages: arrayimages });
        this.setState({ listimagesupload: arrayimagestoupload });
        console.log(this.state.listimagesupload);
    }
    func_render_listimage = () => {
        if (this.state.listimages != []) {
            return (
                <ScrollView


                    showsHorizontalScrollIndicator={false}

                >
                    <View style={styles.ViewImages}>
                        {
                            this.state.listimages.map((prop, key) => {
                                //console.log(prop);

                                if (prop !== "") {
                                    if (prop.includes('file:///')) {
                                        return (
                                            <View
                                                key={key}
                                                style={styles.Images}
                                            >
                                                <TouchableOpacity onLongPress={() => this.func_set_selecteddelete(prop)}>
                                                    <Image
                                                        source={{
                                                            uri: prop,
                                                        }}
                                                        style={styles.ImageAddress}></Image>

                                                </TouchableOpacity>


                                            </View>
                                        )
                                    }
                                    else {
                                        return (
                                            <View
                                                key={key}
                                                style={styles.Images}
                                            >
                                                <TouchableOpacity onLongPress={() => this.func_set_selecteddelete(prop)}>
                                                    <Image
                                                        source={{
                                                            uri: this.state.server + "/move/renderimageaddressfile?filename=" + prop + "&username=" + this.state.username + "&key=" + this.state.key,
                                                        }}
                                                        style={styles.ImageAddress}></Image>

                                                </TouchableOpacity>


                                            </View>
                                        )
                                    }



                                }


                            })

                        }

                    </View>

                </ScrollView>
            )
        }

    }
    func_remove_selected_image = (value) => {
        //console.log(value);
        let images = this.state.listimages;
        //console.log(images)
        var index = images.indexOf(value);
        if (index > -1) {
            images.splice(index, 1);
        }
        this.setState({ listimages: images });
        console.log(this.state.listimages);
    }
    func_set_selecteddelete = (value) => {
        Alert.alert(
            'Xác nhận',
            'Bạn muốn xóa ảnh này?',
            [
                { text: 'Xóa', onPress: () => this.func_remove_selected_image(value) },
                { text: 'Hủy' },
            ],
            { cancelable: false }
        )

    }
    getPrermissionPick = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Chương trình cần quyền truy cập thư viện hãy thay đổi trong cài đặt')
            }

        }

    }
    getPrermissionCap = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Chương trình cần quyền truy cập camera hãy thay đổi trong cài đặt')
            }

        }
    }

    func_handler_nameaddress = (text) => {
        this.setState({ nameaddress: text });
    };
    func_hander_address = (text) => {
        this.setState({ address: text });

    };
    func_hander_district = (text) => {
        this.setState({ district: text });
    };
    func_hander_province = (text) => {
        this.setState({ province: text });
    };
    func_hander_note = (text) => {
        this.setState({ note: text });
    };
    func_hander_coordinate = (text) => {
        this.setState({ coordinate: text });
    };






    render() {

        return (
            <SafeAreaProvider >
                <View style={styles.motherview}>
                    <ScrollView>
                    <View>
                        {this.func_render_loading()}
                    </View>
                    <View style={styles.viewlableinput}>
                        <Text style={styles.lable}>{this.state.id}</Text>
                       
                    </View>
                    <View style={styles.viewlableinput}>
                        <Text style={styles.lable}>Tên địa điểm</Text>
                        <TextInput style={styles.styleinput} onChangeText={(this.func_handler_nameaddress)}>{this.state.nameaddress}</TextInput>
                    </View>
                    <View>
                        <Text style={styles.lable}>Tọa độ</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <TextInput style={[styles.styleinput, { width: '80%' }]} onChangeText={(this.func_hander_coordinate)}>{this.state.lat},{this.state.lng}</TextInput>
                            <TouchableOpacity style={{ width: '16%', borderRadius: 5, backgroundColor: '#1177CB', alignItems: 'center', justifyContent: 'center' }} onPress={() => this.func_get_location()}>
                                <Ionicons name='location-outline' size={20} color="#fff"></Ionicons>
                            </TouchableOpacity>
                        </View>

                    </View>
                    <View style={styles.viewlableinput}>
                        <Text style={styles.lable}>Địa chỉ</Text>
                        <TextInput style={styles.styleinput} onChangeText={(this.func_hander_address)}>{this.state.address}</TextInput>
                    </View>
                    <View style={styles.viewlableinput}>
                        <Text style={styles.lable}>Quận/huyện</Text>
                        <TextInput style={styles.styleinput} onChangeText={(this.func_hander_district)}>{this.state.district}</TextInput>
                    </View>
                    <View style={styles.viewlableinput}>
                        <Text style={styles.lable}>Tỉnh</Text>
                        <TextInput style={styles.styleinput} onChangeText={(this.func_hander_province)}>{this.state.province}</TextInput>
                    </View>
                    <View style={styles.viewlableinput}>
                        <Text style={styles.lable}>Ghi chú</Text>
                        <TextInput style={styles.styleinputmulti} onChangeText={(this.func_hander_note)} multiline={true} editable numberOfLines={10}>{this.state.note}</TextInput>
                    </View>

                    </ScrollView>
                    
                </View>
                <View style={styles.bartext}>
                    <Ionicons name='md-images-sharp' size={20} color="#fff"></Ionicons>


                </View>

                {this.func_render_listimage()}





                <View style={styles.footerstyle}>
                    <TouchableOpacity style={styles.buttontron} onPress={() => this.func_take_picture()}>
                        <Ionicons name='md-camera-outline' size={20} color="#fff"></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttontron} onPress={() => this.func_get_picture()}>
                        <Ionicons name='md-images-outline' size={20} color="#fff"></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttontron} onPress={() => this.func_update_address()}>
                        <Ionicons name='md-save-outline' size={20} color="#fff"></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttontron} onPress={() => this.func_confirm_deleteaddress()}>
                        <Ionicons name='md-close-outline' size={20} color="#fff"></Ionicons>
                    </TouchableOpacity>


                </View>




            </SafeAreaProvider>
        )
    }
}
const styles = StyleSheet.create({
    MainonTop: {
        flex: 1,
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        position: 'absolute',

    },
    viewaction: {
        backgroundColor: "#D14D72",
        borderRadius: 10,
        marginTop: 10,
    },
    viewlableinput: {
        //flexDirection: 'row',
        //alignItems: 'center',
    },
    lable: {
        //width: '20%',
    },
    textbuttonStyle: {
        color: 'white',
        fontSize: 14,
    },
    bartext: {
        flexDirection: 'row',
        backgroundColor: '#d80a47',
        alignItems: 'center',
        marginBottom: 0,
        alignContent: 'center',

        height: 30,
    },
    footerstyle: {
        position: 'absolute',
        height: 80,
        backgroundColor: '#BFCCB5',
        left: 0,
        right: 0,
        bottom: 0,
        padding: 10,
        flexDirection: 'row',
    },
    styleinput: {

        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        margin: 5,
        height: 40,
        padding: 10,

    },
    styleinputmulti: {

        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        margin: 5,
        height: 80,
        padding: 10,

    },
    textStyle: {
        color: '#1177CB',
        fontSize: 14,
        fontWeight: 'bold',
    },
    operationbar: {
        borderWidth: 1,
        borderColor: "thistle",
        borderRadius: 50,
        height: 35,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'

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
    textStylesmall: {
        color: '#1177CB',
        fontWeight: 'bold',
    },
    FlatstyleElement: {
        backgroundColor: "#fff",
        marginBottom: 10,
        borderRadius: 10,
        marginTop: 10,
        padding: 10,
    },
    motherview: {
        // backgroundColor: 'white',
        fontFamily: 'Inter-Black',
        marginTop: "13%",
        marginRight: 10,
        marginLeft: 10,
    },

    buttonStyle: {
        width: "32%",
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        elevation: 3,
        backgroundColor: '#1177CB',
        height: 50
    },
    buttonfindwayStyle: {
        flexDirection: 'row',
    },
    textinbutton: {
        color: "#fff",
    },
    ImageAddress: {
        width: 120,
        height: 120,
        aspectRatio: 1,
        alignSelf: 'center',
        margin: 5,


    },
    ViewImages: {

        flexDirection: 'row',
        width: '100%',
        flexWrap: 'wrap',
        height: '100%',
        marginBottom: 80,

    },
    Images: {

    }
})
export default OperationAddress