import AsyncStorage from '@react-native-async-storage/async-storage';
const func_getappallow = async (server, Sbranchcode) => {
    const value = await AsyncStorage.getItem('@storage_Key');
    if (value !== null) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Bearer " + value.split(':')[1]);
        var resu;
        var raw = JSON.stringify({
            "Sbranchcode": Sbranchcode
        });
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        await fetch(server + "/move/getallowapp", requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result);
                resu = result

            })
            .catch(error => {
                console.log('error', error);
             
            });
        return resu;
    }
    else{
        return "";
    }
}
export default func_getappallow;