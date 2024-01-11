const func_get_filename =(input)=>{
    return input.split('/')[input.split('/').length - 1];
}
export default func_get_filename;