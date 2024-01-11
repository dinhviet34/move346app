import AsyncStorage from '@react-native-async-storage/async-storage';

const func_handler_key_sub = async (server) => {
        const value = await AsyncStorage.getItem('@storage_Key')
        if (value !== null) {
            //this.setState({ key: value.split(':')[1] })
            var ress;
            var myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer " + value.split(':')[1]);
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                redirect: 'follow'
            };
            await fetch(server + "/move/checktoken", requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result + ' key');
                if(result ==='True'){
                    ress = true;
                }
                else{
                    ress =false;
                }
            })
            .catch(error => {
                console.log('error', error + "    key");
                ress = false;
            });
            return ress;
        }
        else {
          
            return false;
        }
   
    
}
export default func_handler_key_sub;