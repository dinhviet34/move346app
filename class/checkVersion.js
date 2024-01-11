const func_checkVersion = async(token, server) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);
    var resu;
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow'
    };

    await fetch(server + "/move/versionmobileapp", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log(result);
            resu = result

        })
        .catch(error => {
            console.log('error', error);
            resu = null;
        });
    return resu;
}
export default func_checkVersion;