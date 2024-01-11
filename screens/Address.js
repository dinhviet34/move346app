import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Keyboard, Modal, Image, TextInput, TouchableOpacity, ImageBackground, RefreshControl, Alert } from 'react-native';
import * as Location from 'expo-location';
import { getPreciseDistance } from 'geolib';
import server from '../server';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import func_handler_key_sub from '../class/handleKey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import func_handler_auth_sub from '../class/handleAuth';
import * as Linking from 'expo-linking';
import { FlatList } from 'react-native-gesture-handler';
import Svg, { Path } from "react-native-svg";
import ImageViewer from 'react-native-image-zoom-viewer';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';


class Address extends Component {
    constructor(props) {
        super(props)
        this.state = {
            server: server(),
            assetsLoaded: false,
            lat: '',
            lng: '',
            key: '',
            usercode: '',
            username: '',
            address: '',
            district: '',
            province: '',
            jsonaddress: null,
            isFetching: false,
            renderimage: false,
            linkimage: [],
            indeximage: 0,
            searchvalue: '',
            usernamesend: '',
            loading: false,
            idload: '',
            banner: '',
            canhan: true,
            macnsaved:'',
        }
    }
    async componentDidMount() {

        await Font.loadAsync({
            'Inter-Black': require('../assets/fonts/Inter-Black.ttf')
        });
        const macnsave = await AsyncStorage.getItem('@storage_branchcode');
        //console.log(macnsave + "macn")
        this.setState({macnsaved:macnsave});
        this.setState({ assetsLoaded: true });
        await this.func_get_values();
        await this.func_handler_key();
        await this.func_get_my_address();
        await this.func_get_location();
      


    }
    func_get_values = () => {
        const { navigation } = this.props;
        const getusername = navigation.getParam('sendusername', '')
        this.setState({ usernamesend: getusername });

    }
    func_get_my_address = async () => {
        this.setState({ banner: "Dữ liệu cá nhân" });
        this.setState({ canhan: true });
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Bearer " + this.state.key);

        var raw = JSON.stringify({
            "Suserad": this.state.username,
            "Sbranchcode":this.state.macnsaved
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(this.state.server + "/move/getmyaddress", requestOptions)
            .then(response => response.text())
            .then(result => {
                this.setState({ jsonaddress: JSON.parse(result) });
                console.log(this.state.jsonaddress);
            })
            .catch(error => console.log('error', error));
    }

    func_get_random10 = async () => {
        this.setState({ banner: "Dữ liệu chia sẻ" })
        this.setState({ canhan: false });
        console.log(this.state.macnsaved)
        var myHeaders = new Headers();
        var raw = JSON.stringify({
            "Sbranchcode": this.state.macnsaved
          });
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Bearer " + this.state.key);
       
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body:raw,
            redirect: 'follow'
           
        };

        fetch(this.state.server + "/move/getrandomaddress", requestOptions)
            .then(response => response.text())
            .then(result => {
                // console.log(result);
                this.setState({ jsonaddress: JSON.parse(result) });
                console.log(this.state.jsonaddress);
            })
            .catch(error => console.log('error', error + "fuc"));
    }
    onRefresh = () => {
        this.setState({ isFetching: true })
        if (this.state.canhan === true) {
            this.func_get_my_address();
        }
        else {
            this.func_get_random10();
        }

        this.setState({ isFetching: false });
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
                //console.log(handlerauth);
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
    func_get_location = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access location was denied');

        }
        else {
            try {

                let location = await Location.getCurrentPositionAsync({});
                let fulladdress = await Location.reverseGeocodeAsync(location.coords);
                //console.log(fulladdress);
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
                console.log(this.state.lat + "   " + this.state.lng);

            }
            catch (error) {
                console.log(error);
            }


        }


    };
    func_set_imageview = (ID, uriimage) => {
        var array = []
        var json = this.state.jsonaddress;
        for (let i = 0; i < json.length; i++) {

            if (json[i].Id === ID) {
                var images = json[i].Simage;
                var index = 0;

                var arrayimages = images.split(',');
                arrayimages.map((prop, key) => {
                    index++;
                    if (prop !== "") {

                        array.push({ "url": this.state.server + "/move/renderimageaddressfile?filename=" + prop + "&username=" + json[i].Suserad.trim() + "&key=" + this.state.key })
                    }

                })
            }
        }
        this.setState({ linkimage: array });
        this.setState({ renderimage: true });

        for (let i = 0; i < array.length; i++) {
            if (array[i].url === uriimage) {

                this.setState({ indeximage: i });
            }
        }
    }
    func_find = async () => {
        if (this.state.canhan === true) {
            this.func_find_address_by_user();
        }
        else {
            this.func_find_address();
        }
    }
    func_find_address_by_user = async () => {
        Keyboard.dismiss();
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + this.state.key);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "Sname": this.state.searchvalue,
            "Saddress": this.state.searchvalue,
            "Sdistrict": this.state.searchvalue,
            "SProvince": this.state.searchvalue,
            "Suserad": this.state.username,
            "Sbranchcode":this.state.macnsaved
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(this.state.server + "/move/getbyaddressofuser", requestOptions)
            .then(response => response.text())
            .then(result => {

                this.setState({ jsonaddress: JSON.parse(result) });
                console.log(this.state.jsonaddress);
            })
            .catch(error => console.log('error', error));
    }

    func_find_address = async () => {
        Keyboard.dismiss();
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + this.state.key);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "Sname": this.state.searchvalue,
            "Saddress": this.state.searchvalue,
            "Sdistrict": this.state.searchvalue,
            "SProvince": this.state.searchvalue,
            "Suserad": this.state.searchvalue,
            "Sbranchcode":this.state.macnsaved
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(this.state.server + "/move/getbyaddress", requestOptions)
            .then(response => response.text())
            .then(result => {

                this.setState({ jsonaddress: JSON.parse(result) });
            })
            .catch(error => console.log('error', error));
    }

    func_render_viewer = () => {
        if (this.state.renderimage === true) {
            return (

                <View style={[styles.MainonTop, styles.viewerinmage]}>
                    <ImageViewer imageUrls={this.state.linkimage} backgroundColor='#f2f2f2' renderIndicator={() => null} index={this.state.indeximage} enableSwipeDown onSwipeDown={() => this.setState({ renderimage: false })} />

                </View>





            )
        }
    }



    func_render_images_item = (thisID) => {

        if (this.state.idload != '' && thisID === this.state.idload) {
            var json = this.state.jsonaddress;
            for (let i = 0; i < json.length; i++) {
                if (json[i].Id === this.state.idload) {
                    var images = json[i].Simage;

                    if (images !== null) {
                        var arrayimages = images.split(',');
                        return (
                            <ScrollView
                                style={styles.ViewImages}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                pagingEnabled={true}
                            >
                                {
                                    arrayimages.map((prop, key) => {
                                        if (prop !== "") {

                                            return (
                                                <View
                                                    key={key}
                                                    style={styles.Images}
                                                >
                                                    <TouchableOpacity onPress={() => this.func_set_imageview(this.state.idload, this.state.server + "/move/renderimageaddressfile?filename=" + prop + "&username=" + json[i].Suserad.trim() + "&key=" + this.state.key)}>
                                                        <Image
                                                            source={{
                                                                uri: this.state.server + "/move/renderimageaddressfile?filename=" + prop + "&username=" + json[i].Suserad.trim() + "&key=" + this.state.key,
                                                            }}
                                                            style={styles.ImageAddress}></Image>
                                                    </TouchableOpacity>

                                                </View>
                                            )
                                        }

                                    })
                                }
                            </ScrollView>
                        )
                    }
                    else {
                        return (
                            <View

                                style={styles.Images}
                            >
                                <TouchableOpacity onPress={() => this.func_set_imageview(this.state.idload, this.state.server + "/move/renderimageaddressfile?filename=" + prop + "&username=" + json[i].Suserad.trim() + "&key=" + this.state.key)}>
                                    <Image
                                        source={{
                                            uri: this.state.server + "/move/renderimageaddressfile?filename=" + images + "&username=" + json[i].Suserad.trim() + "&key=" + this.state.key,
                                        }}
                                        style={styles.ImageAddress}></Image>
                                </TouchableOpacity>

                            </View>
                        )
                    }



                }


            }
        }

    }
    func_call_images = (ID) => {
        this.setState({ idload: ID });
        console.log(this.state.idload);
    }
    func_findway = (coordinate) => {

        var latden = coordinate.split(',')[0];
        var londen = coordinate.split(',')[1];
        var url = 'https://www.google.com/maps/dir/?api=1&origin=' + this.state.lat + ',' + this.state.lng + '&destination=' + latden + ',' + londen;
        //console.log(url);
        Linking.openURL(url);
    }
    func_render_findway = (coordinate) => {
        if (this.state.lat !== "" && this.state.lng !== "") {
            return (
                <View>
                    <TouchableOpacity style={styles.buttonfindwayStyle} onPress={() => this.func_findway(coordinate)}>
                        <Svg
                            width={20}
                            height={20}
                            viewBox="0 0 20 20">
                            <Path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.598-.49L10.5.99 5.598.01a.5.5 0 0 0-.196 0l-5 1A.5.5 0 0 0 0 1.5v14a.5.5 0 0 0 .598.49l4.902-.98 4.902.98a.502.502 0 0 0 .196 0l5-1A.5.5 0 0 0 16 14.5V.5zM5 14.09V1.11l.5-.1.5.1v12.98l-.402-.08a.498.498 0 0 0-.196 0L5 14.09zm5 .8V1.91l.402.08a.5.5 0 0 0 .196 0L11 1.91v12.98l-.5.1-.5-.1z" fill="#1177CB" />
                        </Svg>
                        <Text style={styles.textStylesmall}>

                            Tìm đường đi

                        </Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }
    func_redirect_operation = (ida) => {
        let nameaddress = "";
        let address = "";
        let district = "";
        let province = "";
        let user = "";
        let note = "";
        let date = "";
        let coordinate = "";
        let id = "";
        let arrayimage = "";
        let data = this.state.jsonaddress;
        for (let i = 0; i < data.length; i++) {
            if (data[i].Id === ida) {
                address = data[i].Saddress;
                district = data[i].Sdistrict;
                province = data[i].Sprovince;
                coordinate = data[i].Scoordinate;
                note = data[i].Snote;
                user = data[i].Suserad;
                date = data[i].Ddate;
                nameaddress = data[i].Sname;
                id = data[i].Id;
                arrayimage = data[i].Simage;
            }
        }
        /* 1. Navigate to the Details route with params */
        this.props.navigation.navigate('OperationAddress', {
            sendaddress: address,
            senddistrict: district,
            sendprovince: province,
            sendnote: note,
            senduser: user,
            senddate: date,
            sendid: id,
            sendimages: arrayimage,
            sendnameaddress: nameaddress,
            sendcoordinate: coordinate,
        });
    }
    func_set_hideorshow = (id) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Bearer " + this.state.key);

        var raw = JSON.stringify({
            "Id": id
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(this.state.server + "/move/updatehideorshowaddress", requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result);
                Alert.alert("Kết quả",result);
            })
            .catch(error => console.log('error', error));
    }


    func_render_operation_button = (User, id, show) => {
        if (this.state.username.toLowerCase().trim() === User.toLowerCase().trim()) {
            if (show === 1) {
                return (
                    <View style={styles.operationbar}>
                        <TouchableOpacity style={styles.buttontron} onPress={() => this.func_redirect_operation(id)}>
                            <Ionicons name='md-pencil-sharp' size={14} color="#fff"></Ionicons>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttontron} onPress={() => this.func_print_to_file(id)}>
                            <Ionicons name='md-share-social-sharp' size={14} color="#fff"></Ionicons>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttontron} onPress={() => this.func_set_hideorshow(id)}>
                            <Ionicons name='md-eye-off' size={14} color="#fff"></Ionicons>
                        </TouchableOpacity>
                    </View>
                )
            }
            else {
                return (
                    <View style={styles.operationbar}>
                        <TouchableOpacity style={styles.buttontron} onPress={() => this.func_redirect_operation(id)}>
                            <Ionicons name='md-pencil-sharp' size={14} color="#fff"></Ionicons>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttontron} onPress={() => this.func_print_to_file(id)}>
                            <Ionicons name='md-share-social-sharp' size={14} color="#fff"></Ionicons>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttontron} onPress={() => this.func_set_hideorshow(id)}>
                            <Ionicons name='md-eye' size={14} color="#fff"></Ionicons>
                        </TouchableOpacity>
                    </View>
                )
            }

        }
        else {
            return (
                <View style={styles.operationbar}>
                    <TouchableOpacity style={styles.buttontron} onPress={() => this.func_print_to_file(id)}>
                        <Ionicons name='md-share-social-sharp' size={14} color="#fff"></Ionicons>
                    </TouchableOpacity>

                </View>
            )
        }
    }
    handlerSearch = (text) => {
        this.setState({ searchvalue: text });
    };

    func_print_to_file = async (ida) => {
        this.setState({ loading: true });
        let nameaddress = "";
        let address = "";
        let district = "";
        let province = "";
        let user = "";
        let note = "";
        let date = "";
        let coordinate = "";
        let id = "";
        let arrayimage = "";
        let data = this.state.jsonaddress;
        for (let i = 0; i < data.length; i++) {
            if (data[i].Id === ida) {
                if (data[i].Saddress === null) {
                    address = '';
                }
                else {
                    address = data[i].Saddress;
                }
                if (data[i].Sdistrict === null) {
                    district = '';
                }
                else {
                    district = data[i].Sdistrict;
                }
                if (data[i].Sprovince === null) {
                    province = '';
                }
                else {
                    province = data[i].Sprovince;
                }




                coordinate = data[i].Scoordinate;
                if (data[i].Snote === null) {
                    note = '';
                }
                else {
                    note = data[i].Snote;
                }

                user = data[i].Suserad;
                date = data[i].Ddate;
                nameaddress = data[i].Sname;
                id = data[i].Id;
                arrayimage = data[i].Simage;
            }
        }
        let temparray = arrayimage.split(',');
        let arrayshowimage = [];

        for (var i = 0; i < temparray.length; i++) {
            //console.log(temparray[i].trim())
            //console.log('<img src="' + this.state.server + "/move/renderimageaddressfile?filename=" + temparray[i].trim() + "&username=" + user + "&key=" + this.state.key + '" style="width: 90vw;" />');
            arrayshowimage.push('<img src="' + this.state.server + "/move/renderimageaddressfile?filename=" + temparray[i].trim() + "&username=" + user.trim() + "&key=" + this.state.key + '" style="width: 100vw;height:50%;" />')
        }
        //console.log(arrayshowimage)
        const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          </head>
          <body>
            <div style="margin-left:30px;">
            <h1 style="font-size: 50px; font-family: Helvetica Neue; font-weight: normal;text-align: center;">`+
            nameaddress +
            `</h1>
            <p>Địa chỉ:`+
            address +
            `</p>
            <p>Quận/huyện:`+
            district +
            `</p>
            <p>Tỉnh:`+
            province +
            `</p>
            <p>Ghi chú:`+
            note +
            `</p></div>` +
            `<div style="text-align: center;">` +
            arrayshowimage +
            `</div>
               
            </body>
        </html>
        `;

        const { uri } = await Print.printToFileAsync({
            html,
            margins: {
                left: 20,
                top: 50,
                right: 20,
                bottom: 100,
            },
        });
        console.log('File has been saved to:', uri);
        this.setState({ loading: false });
        await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    };
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



    render() {
        const { navigate } = this.props.navigation;
        return (
            <SafeAreaProvider style={styles.motherview}>
                <View>
                    {this.func_render_loading()}
                </View>
                <View>
                    <Text style={styles.banner}>
                        {this.state.banner}
                    </Text>
                </View>
                <View style={styles.topviewstyle}>
                   
                    <View style={{ flexDirection: 'row' }}>

                    <TouchableOpacity style={styles.buttonfooter} onPress={() => this.func_get_my_address()}>
                        <Ionicons name='md-person' size={20} color="#fff"></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonfooter} onPress={() => this.func_get_random10()}>
                        <Ionicons name='md-eye' size={20} color="#fff"></Ionicons>
                    </TouchableOpacity>
                        <TextInput style={styles.styleinput} placeholder="Nhập thông tin tìm kiếm" onChangeText={(this.handlerSearch)}>
                            {this.state.usernamesend}
                        </TextInput>
                        <TouchableOpacity style={styles.buttonStyle} onPress={() => this.func_find()}>
                            <Text style={styles.textinbutton}>
                                <Ionicons name='md-search' size={14} color="#fff"></Ionicons>

                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
              

                <FlatList
                    showsVerticalScrollIndicator={false}
                    persistentScrollbar={true}
                    data={this.state.jsonaddress}
                    extraData={this.state}
                    refreshControl={
                        <RefreshControl
                            onRefresh={() => this.onRefresh()}
                            refreshing={this.state.isFetching}
                        />}
                    renderItem={({ item }) => (
                        <View style={styles.FlatstyleElement}>
                            <Text style={styles.textStyle}>
                                {item.Sname}
                            </Text>
                            <Text>
                                Địa chỉ: {item.Saddress}
                            </Text>
                            <Text>
                                Quận/huyên: {item.Sdistrict}
                            </Text>
                            <Text>
                                Tỉnh: {item.Sprovince}
                            </Text>
                            <Text>
                                Ghi chú: {item.Snote}
                            </Text>
                            <Text>
                                Người tạo: {item.Suserad}
                            </Text>
                            <Text>
                                Ngày tạo: {item.Ddate}
                            </Text>

                            <TouchableOpacity style={styles.buttonfindwayStyle} onPress={() => this.func_call_images(item.Id)}>
                                <Svg
                                    width={20}
                                    height={20}
                                    viewBox="0 0 20 20">
                                    <Path fill-rule="evenodd" d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="#1177CB" />
                                    <Path fill-rule="evenodd" d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z" fill="#1177CB" />
                                </Svg>
                                <Text style={styles.textStylesmall}>

                                    Hình ảnh

                                </Text>
                            </TouchableOpacity>

                            {this.func_render_images_item(item.Id)}
                            {this.func_render_findway(item.Scoordinate)}
                            {this.func_render_operation_button(item.Suserad, item.Id, item.Nhideorshow)}

                        </View>
                    )}
                    keyExtractor={item => item.Id}
                >
                </FlatList>
                {this.func_render_viewer()}


                <View style={styles.footerstyle}>




                </View>







            </SafeAreaProvider>
        )
    }


}
const styles = StyleSheet.create({
    MainonTop: {
        flex: 1,
        backgroundColor: '#fff',
        width: '100%',
        height: '100%',
        position: 'absolute',

    },
    viewerinmage: {
        margin: 0,
    },
    viewaction: {
        backgroundColor: "#D14D72",
        borderRadius: 10,
        marginTop: 10,
    },
    banner: {
        color: '#1177CB',
        fontSize: 20,
        fontWeight: 'bold',

    },
    textStyle: {
        color: '#1177CB',
        fontSize: 14,
        fontWeight: 'bold',
    },
    operationbar: {
        // borderWidth: 1,
        // borderColor: "thistle",
        borderRadius: 50,
        height: 35,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#F6F1F1',

    },
    topviewstyle: {
        height: 80,
        backgroundColor: '#BFCCB5',
        left: 0,
        right: 0,
        bottom: 0,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignContent: 'center',
        backgroundColor:'#ccc',
    },
    buttonfooter: {
     
       
        alignItems: 'center',
        justifyContent: 'center',
      
        marginRight: 10,
    




    },
    buttontron: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        backgroundColor: '#fff',
        borderRadius: 15,
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

    },
    styleinput: {

        borderColor: 'gray',
        borderWidth: 1,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        backgroundColor: "#fff",
        height: 50,
        padding: 10,
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25,

    },
    buttonStyle: {

        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        elevation: 3,
        backgroundColor: '#1177CB',
        height: 50,

        borderTopRightRadius: 25,
        borderBottomRightRadius: 25,

    },
    buttonfindwayStyle: {
        flexDirection: 'row',
    },
    textinbutton: {
        color: "#fff",
    },
    ImageAddress: {
        width: 80,
        height: 80,
        aspectRatio: 1,
        alignSelf: 'center',
        margin: 5,


    },
    ViewImages: {
        flexDirection: 'row',
        width: '100%',
    },
    Images: {

    }
})
export default Address;