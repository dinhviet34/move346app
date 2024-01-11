import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';



const func_handler_auth_sub = async (server) => {
    const value = await AsyncStorage.getItem('@storage_Key')
    if (value !== null) {
        //this.setState({ key: value.split(':')[1] })
        //var deviceband = await Device.brand;
        //var deviceosname = await Device.osName;

        //var deviceosbuild = await Device.osInternalBuildId;
        const tokenaccess = await AsyncStorage.getItem('@storage_TokenAccess')
        var username = value.split(':')[0];
        //var md5c = md5(username);
        //console.log(md5c);
        var device = username +  "_" + tokenaccess;
        console.log(device);
        var ress;
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + value.split(':')[1]);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "Susercode": value.split(':')[2],
            "Stokenauth":device
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        await fetch(server + "/move/checkhavetokenauth", requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result + ' auth');
                if (result === 'True') {
                    ress = true;
                }
                else {
                    ress = false;
                }

            })
            .catch(error => {
                console.log('error', error + "     aut");
                ress = false;
            });
        return ress;

    }
    else {

        return false;
    }


}
export default func_handler_auth_sub;