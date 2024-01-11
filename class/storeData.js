import AsyncStorage from '@react-native-async-storage/async-storage';

func_store_data = async (value,value2) => {
    var kq;
    try {
        await AsyncStorage.setItem('@storage_' + value2, value)
        console.log('save done');
        kq= true;
    } catch (e) {
        console.log('save error cho nay' + e)
        kq= false;
        // saving error
    }
    return kq;
}
export default func_store_data;