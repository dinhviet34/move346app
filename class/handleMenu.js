import AsyncStorage from '@react-native-async-storage/async-storage';

const func_handler_menu = async (server) => {
    const value = await AsyncStorage.getItem('@storage_Key');
    if (value !== null) {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + value.split(':')[1]);

        

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow'
        };
        var ress;

        await fetch(server + "/move/loadmobilemenu", requestOptions)
            .then(response => response.text())
            .then(result => {
                //console.log(result);
                ress = result;
            })
            .catch(error => {
                //console.log('error', error);
                ress = "";
            });
            
            return ress;
    }
    else {
        return "";
    }
}
export default func_handler_menu;