const func_checkLock = async(token, server) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + token);
    var resu;
    var raw = JSON.stringify({
      "Suserad": "Dinhhoangviet"
    });
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    
    await fetch(server + "/move/checklock", requestOptions)
      .then(response => response.text())
      .then(result => {
       // console.log(result)
        resu = result;
    })
      .catch(error => {
       //console.log('error', error);
        resu = "";
    });
    return resu;
}
export default func_checkLock;