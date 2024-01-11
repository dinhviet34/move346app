const func_remove_speacialchar = (str)=> {

    str = str.replace(/[^a-zA-Z0-9 ]/g, '');
  
   
     return str;
}
export default func_remove_speacialchar;