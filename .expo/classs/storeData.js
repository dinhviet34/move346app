storeData = async (value) => {
    try {
        await AsyncStorage.setItem('@storage_Department', value)
        console.log('save done');
        return true;
    } catch (e) {
        console.log('save error ' + e)
        return false;
        // saving error
    }
}
export default storeData;