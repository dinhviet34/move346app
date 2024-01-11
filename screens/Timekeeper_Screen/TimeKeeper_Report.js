import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, ScrollView, Platform } from 'react-native';
import server from '../../server';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import func_handler_key_sub from '../../class/handleKey';
import { DataTable } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Svg, { Path } from "react-native-svg";
import { Picker } from '@react-native-picker/picker';
import func_handler_auth_sub from '../../class/handleAuth';
import DateTimePicker from '@react-native-community/datetimepicker';

class Timekeeper_report extends Component {
    constructor(props) {
        super(props)
        this.state = {
            server: server(),
            assetsLoaded: false,
            username: '',
            key: '',
            usercode: '',
            data: "",
            thang: '',
            ngay: '',
            nam: '',
            date: '',
            datetosend: '',
            showreason: false,
            information: '',
            mylevel: '',
            id: '',
            reason: '',
            userapproverarrayarray: [],
            userapprover: '',
            approve: '',
            session: '',
            fromdate: '',
            todate: '',
            fromdatemmddyyyy: '',
            todatemmddyyyy: '',
            showfromdate: false,
            showtodate: false,
            macnsaved:'',
        }
    };



    async componentDidMount() {
        await Font.loadAsync({
            'Inter-Black': require('../../assets/fonts/Inter-Black.ttf')
        });
        await this.func_set_date();
        const macnsave = await AsyncStorage.getItem('@storage_branchcode');
        //console.log(macnsave + "macn")
        this.setState({macnsaved:macnsave});

        this.setState({ assetsLoaded: true });
        await this.func_handler_key();
        await this.func_get_approver();

    }
    func_set_date = async () => {
        let today = new Date();

        this.setState({ fromdate: today });
        this.setState({ todate: today });
        let day = today.getDate();
        if (String(day).length < 2) {
            day = '0' + day;
        }

        let month = today.getMonth() + 1;
        if (String(month).length < 2) {
            month = '0' + month;
        }
        let year = today.getFullYear();
        this.setState({ fromdatemmddyyyy: month + '/' + day + '/' + year });
        this.setState({ todatemmddyyyy: month + '/' + day + '/' + year });

    }



    func_handler_key = async () => {
        let handlerkey = await func_handler_key_sub(this.state.server);
        if (handlerkey === false) {
            this.props.navigation.navigate("Login");
        }
        else {
            const value = await AsyncStorage.getItem('@storage_Key')
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
                    this.setState({ mylevel: value.split(':')[3] });

                }


            }
        }
    }
    func_get_approver = async () => {

        let lev = this.state.mylevel;
       
        if(lev > 3){
            lev = 3;
        }
        console.log(lev + " dau tien")
        if (lev > 1 ) {
          
            lev = lev - 1;
        }
        console.log(lev + " sau do");
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + this.state.key);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "Nlevel": parseInt(lev),
            "Sbranchcode": this.state.macnsaved
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        await fetch(this.state.server + "/move/getbylevel", requestOptions)
            .then(response => response.text())
            .then(result => {
                //console.log(result);
                let array = [];
                var kq = JSON.parse(result)
                for (var r in kq) {
                    array.push(kq[r].Suserad.trim());

                }

                this.setState({ userapproverarray: array });

            })
            .catch(error => console.log('error', error));
    }







    func_get_data = async () => {
        Keyboard.dismiss();
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + this.state.key);
        //console.log(this.state.date + "     " + this.state.usercode);
        //alert(this.state.fromdatemmddyyyy + "  " + this.state.todatemmddyyyy);
        //this.setState({ datetosend: this.state.nam + '-' + this.state.thang + '-' + this.state.ngay });
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        //console.log(date);
        await fetch(this.state.server + "/move/getbetweendate?startdate=" + this.state.fromdatemmddyyyy + "&todate=" + this.state.todatemmddyyyy + "&susercode=" + this.state.usercode, requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result);

                if (result === '[]') {
                    alert("Không có kết quả cho ngày này");
                    this.setState({ data: null });
                }
                else {
                    //console.log(result);
                    this.setState({ data: result });

                }
            })
            .catch(error => console.log('error', error));
    }
    func_cell_onpress = (text) => {


        this.setState({ session: text.split('|')[1] })
        this.setState({ showreason: true });
        this.setState({ information: text });
        this.setState({ id: text.split('|')[0] });
        this.setState({ approve: text.split('|')[4] });
        this.setState({ datetosend: text.split('|')[5].split('T')[0] })
        let fulldate = text.split('|')[5].split('T')[0];
        //alert(fulldate);
        this.setState({ nam: fulldate.split('-')[0] });
        this.setState({ thang: fulldate.split('-')[1] });
        this.setState({ ngay: fulldate.split('-')[2] });

        //console.log(this.state.showreason);
    }
    func_render_table = () => {
        if (this.state.data !== "") {
            var result = JSON.parse(this.state.data);
            //console.log(this.state.date);
            var bodytable = [];
            for (let i = 0; i < result.length; i++) {
                bodytable.push(

                    <DataTable.Row key={i} onPress={() => this.func_cell_onpress(result[i].Id + '|' + result[i].Ssession + '|' + result[i].Snote + '|' + result[i].Sresult + '|' + result[i].Sstatus + '|' + result[i].Ddate)}>
                        <DataTable.Cell>{result[i].Id}</DataTable.Cell>
                        <DataTable.Cell>{result[i].Ssession}</DataTable.Cell>
                        <DataTable.Cell >{result[i].Snote}</DataTable.Cell>
                        <DataTable.Cell>{result[i].Sresult}</DataTable.Cell>
                        <DataTable.Cell>{result[i].Sstatus}</DataTable.Cell>
                        <DataTable.Cell>{result[i].Ddate}</DataTable.Cell>
                    </DataTable.Row>
                )
            }
            return (
                <View>
                    {bodytable}
                </View>

            )



        }
        else {
            return (
                <DataTable.Row>
                </DataTable.Row>
            )
        }
    }
    func_send_data = async () => {

        //console.log(this.state.userapprover + this.state.reason + this.state.id);
        if (this.state.userapprover === "" || this.state.userapprover === "Chọn") {
            alert("Vui lòng chọn người phê duyệt")
        }
        else {
            if (this.state.reason === "") {
                alert("Vui lòng nhập lý do")
            }
            else {
                var myHeaders = new Headers();
                myHeaders.append("Authorization", "Bearer " + this.state.key);
                myHeaders.append("Content-Type", "application/json");

                var raw = JSON.stringify({
                    "Id": parseInt(this.state.id),
                    "Susercode": this.state.usercode,
                    'Ssession': parseInt(this.state.session),
                    "Sresult": "False",
                    "Sreason": this.state.reason,
                    "Suserapprover": this.state.userapprover,
                    "Ddate": this.state.datetosend,
                    "Sstatus": "Waitting"
                });

                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow'
                };

                await fetch(this.state.server + "/move/writereason", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        alert(result);
                        this.func_close_reason();
                    })
                    .catch(error => console.log('error', error));
            }
        }

    }
    func_handler_userapprover = (text) => {

        this.setState({ userapprover: text })

    }
    func_handler_reason = (text) => {
        this.setState({ reason: text })
    }
    func_close_reason = () => {
        this.setState({ showreason: false });
        this.setState({ reason: "" });
        this.setState({ userapprover: "" });
        this.setState({ approve: "" });
        this.setState({ session: "" });
    }
    func_handle_Focus = () => {
        inputEl.current.select();
    }




    func_on_fromdate_Selected = async (event, value) => {
        this.setState({ fromdate: value });
        let day = value.getDate();
        if (String(day).length < 2) {
            day = '0' + day;
        }

        let month = value.getMonth() + 1;
        if (String(month).length < 2) {
            month = '0' + month;
        }
        let year = value.getFullYear();
        await this.setState({ fromdatemmddyyyy: month + '/' + day + '/' + year });
        this.setState({showfromdate:false});

    }
    func_on_todate_Selected = async (event, value) => {
        this.setState({ todate: value });
        let day = value.getDate();
        if (String(day).length < 2) {
            day = '0' + day;
        }

        let month = value.getMonth() + 1;
        if (String(month).length < 2) {
            month = '0' + month;
        }
        let year = value.getFullYear();
        await this.setState({ todatemmddyyyy: month + '/' + day + '/' + year });
        this.setState({showtodate:false});
    }


    func_render_reason = () => {
        if (this.state.showreason === true) {
            //console.log(this.state.userapprover);
            var stateinfo = this.state.information;
            var idl = stateinfo.split('|')[0];

            var phien = stateinfo.split('|')[1];

            var note = stateinfo.split('|')[2].trim();
            var ketqua = stateinfo.split('|')[3].trim();
            var trangthai = stateinfo.split('|')[4];
            //console.log(trangthai)
            if (trangthai === 'null' || trangthai === 'undefined' || trangthai.trim() === '') {
                trangthai = "Chưa chuyển phê duyệt"
            }
            else {
                trangthai = trangthai;
            }
            if (trangthai === "Chưa chuyển phê duyệt" && ketqua === "False") {
                return (
                    <View style={styles.containerMainontop}>
                        <View style={{ flex: 1, justifyContent: 'flex-start', alignSelf: 'flex-end', margin: 10, }}>
                            <TouchableOpacity onPress={() => this.func_close_reason()}>
                                <Svg
                                    width={40}
                                    height={40}
                                    viewBox="0 0 20 20"
                                >
                                    <Path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z" fill="#000" />
                                </Svg>

                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 20, margin: 10, }}>
                            <View style={[styles.card, styles.shadowProp, { flex: 2 }]}>
                                <Text style={styles.textStyle}>
                                    {idl}
                                </Text>
                                <Text style={styles.textStyle}>
                                    Ngày:{this.state.ngay + '/' + this.state.thang + '/' + this.state.nam}
                                </Text>
                                <Text style={styles.textStyle}>
                                    Phiên:{phien}
                                </Text>
                                <Text style={styles.textStyle}>
                                    Ghi chú:{note}
                                </Text>
                                <Text style={styles.textStyle}>
                                    Kết quả:{ketqua}
                                </Text>
                                <Text style={styles.textStyle}>
                                    Trạng thái:{trangthai}
                                </Text>
                            </View>


                            <View style={{ backgroundColor: "transparent", flex: 8 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <TextInput
                                        editable
                                        multiline
                                        numberOfLines={4}
                                        maxLength={40}
                                        onChangeText={(this.func_handler_reason)}
                                        placeholder="Lý do vi phạm"
                                        style={{
                                            padding: 10,
                                            borderBottomColor: "#1ca0ff",
                                            borderLeftColor: "#ffffff",
                                            borderRightColor: "#ffffff",
                                            borderTopColor: "#ffffff",

                                            borderWidth: 1,
                                            width: "70%",

                                        }}
                                    />
                                    <TouchableOpacity style={styles.button} onPress={() => { Keyboard.dismiss() }}>
                                        <Text style={styles.textinbutton}>Xong</Text>
                                    </TouchableOpacity>

                                </View>


                                <Picker
                                    style={[styles.pickerStyle, { marginTop: 10 }]}
                                    selectedValue={this.state.userapprover}
                                    onValueChange={(itemValue) => { this.func_handler_userapprover(itemValue) }}
                                >
                                    <Picker.Item label='Chọn người phê duyệt' value='Chọn' />

                                    {this.state.userapproverarray.map((item, id) => {

                                        return <Picker.Item key={id} label={item} value={item} />
                                    })
                                    }
                                </Picker>
                                <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={() => this.func_send_data()}>
                                    <Text style={styles.textinbutton}>Gửi phê duyệt</Text>
                                </TouchableOpacity>

                            </View>


                        </View>




                    </View>
                )
            }
            else {
                return (
                    <View style={styles.containerMainontop}>
                        <View style={{ flex: 1, justifyContent: 'flex-start', alignSelf: 'flex-end', margin: 10, }}>
                            <TouchableOpacity onPress={() => this.func_close_reason()}>
                                <Svg
                                    width={40}
                                    height={40}
                                    viewBox="0 0 20 20"
                                >
                                    <Path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z" fill="#000" />
                                </Svg>

                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 20, margin: 10, }}>
                            <View style={[styles.card, styles.shadowProp, { flex: 3 }]}>
                                <Text style={styles.textStyle}>
                                    {idl}
                                </Text>
                                <Text style={styles.textStyle}>
                                    Ngày:{this.state.ngay + '/' + this.state.thang + '/' + this.state.nam}
                                </Text>
                                <Text style={styles.textStyle}>
                                    Phiên:{phien}
                                </Text>
                                <Text style={styles.textStyle}>
                                    Ghi chú:{note}
                                </Text>
                                <Text style={styles.textStyle}>
                                    Kết quả:{ketqua}
                                </Text>
                                <Text style={styles.textStyle}>
                                    Trạng thái:{trangthai}
                                </Text>
                            </View>
                        </View>
                    </View>
                )
            }


        }

    }

    func_call_fromdate_android=()=>{
        this.setState({showfromdate:true});
    }
    func_render_fromdate_android = () => {
        if (this.state.showfromdate === true) {
            return (
                <DateTimePicker
                    value={this.state.fromdate}
                    mode={'date'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    is24Hour={true}
                    onChange={(this.func_on_fromdate_Selected)}
                    style={styles.datePicker}
                />
            )
        }
    }
   
    func_call_todate_android=()=>{
        this.setState({showtodate:true});
    }
    func_render_todate_android = () => {
        if (this.state.showtodate === true) {
            return (
                <DateTimePicker
                    value={this.state.todate}
                    mode={'date'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    is24Hour={true}
                    onChange={(this.func_on_todate_Selected)}
                    style={styles.datePicker}
                />
            )
        }
    }
    func_render_date_picker = () => {
        if (Platform.OS === 'ios') {
            return (
                <View>
                    <View style={[{ margin: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }]}>
                        <Text>
                            Từ ngày
                        </Text>
                        <DateTimePicker
                            value={this.state.fromdate}
                            mode={'date'}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            is24Hour={true}
                            onChange={(this.func_on_fromdate_Selected)}
                            style={styles.datePicker}
                        />



                    </View>
                    <View style={[{ margin: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }]}>
                        <Text>
                            Đến ngày
                        </Text>
                        <DateTimePicker
                            value={this.state.todate}
                            mode={'date'}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            is24Hour={true}
                            onChange={(this.func_on_todate_Selected)}
                            style={styles.datePicker}
                        />
                    </View>
                </View>
            )
        }
        else {
            return (
                <View>
                    <View style={[{flexDirection:"row",alignItems:'center'}]}>
                    <TouchableOpacity style={styles.button} onPress={this.func_call_fromdate_android}>
                                <Text style={styles.textinbutton}>Từ ngày</Text>
                            </TouchableOpacity>
                            <Text style={styles.textStyle}>
                                {this.state.fromdatemmddyyyy}
                            </Text>
                    </View>
                       <View style={[{flexDirection:'row',alignItems:'center'}]}>
                       <TouchableOpacity style={styles.button} onPress={this.func_call_todate_android}>
                                <Text style={styles.textinbutton}>Đến ngày</Text>
                            </TouchableOpacity>
                            <Text style={styles.textStyle}>
                                {this.state.todatemmddyyyy}
                            </Text>
                       </View>
                          
                </View>
            )
        }

    }

    render() {
        const { assetsLoaded } = this.state;
        if (assetsLoaded) {
            return (
                <SafeAreaProvider style={styles.mainview}>
                    <View style={styles.f3}>
                        {this.func_render_date_picker()}
                        {this.func_render_fromdate_android()}
                        {this.func_render_todate_android()}
                        <View>
                            <TouchableOpacity style={styles.button} onPress={this.func_get_data}>
                                <Text style={styles.textinbutton}>Xem</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                    <View style={styles.f6}>


                        <ScrollView style={styles.viewtable}>
                            <DataTable>
                                <DataTable.Header>
                                    <DataTable.Title>ID</DataTable.Title>
                                    <DataTable.Title>Phiên</DataTable.Title>
                                    <DataTable.Title>Ghi chú</DataTable.Title>
                                    <DataTable.Title>Kết quả</DataTable.Title>
                                    <DataTable.Title>Trạng thái</DataTable.Title>
                                    <DataTable.Title>Ngày</DataTable.Title>
                                </DataTable.Header>
                                {this.func_render_table()}
                            </DataTable>
                        </ScrollView>
                    </View>
                    {this.func_render_reason()}

                </SafeAreaProvider>)
        }
    }

}
const styles = StyleSheet.create({
    mainview: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: '13%',
    },
    datePicker: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: 320,
        height: 60,
        display: 'flex',
    },
    containerMainontop: {
        flex: 1,
        backgroundColor: '#ffffff',
        width: '100%',
        height: '100%',
        position: 'absolute',

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
    datePickerStyle: {
        width: 100,
        marginTop: 20,
    },
    textsource: {
        fontSize: 20,
        margin: 5,
    },
    texttitle: {
        fontSize: 20,
        marginTop: 10,
        color: '#1177CB',
    },
    viewtable: {

        paddingHorizontal: 30,
    },
    button: {
        backgroundColor: '#1177CB',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        height: 50,
        margin: 10,
    },
    textinbutton: {
        color: 'white',
        fontWeight: "bold",
        textAlign: 'center',

    },
    styleinput: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 5,
        height: 40,
        padding: 10,
        marginRight: 20,

    },
    textStyle: {
        color: '#1177CB',
        fontSize: 13,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 4,
        paddingVertical: 45,
        paddingHorizontal: 25,

        marginVertical: 10,

    },
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
})


export default Timekeeper_report;