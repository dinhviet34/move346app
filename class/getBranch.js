import AsyncStorage from '@react-native-async-storage/async-storage';
import func_store_data from './storeData';
const func_getbranch = async (server, Susercode) => {
    const value = await AsyncStorage.getItem('@storage_Key');
    if (value !== null) {
        var myHeaders = new Headers();
     
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Bearer " + value.split(':')[1]);
        
        var raw = JSON.stringify({
          "Susercode": Susercode
        });
        
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };
        var ress;
        await fetch(server + "/move/getbranchofuser", requestOptions)
          .then(response => response.text())
          .then(async result => {
            let branchcode = result.split('-')[0]
          //console.log(branchcode);
          //let branchcode = "342"
            await func_store_data(branchcode,"branchcode");
            ress = result;
        })
          .catch(error => console.log('error', error));
        
        return ress;
    }
    else {
        return "";
    }
}
export default func_getbranch;