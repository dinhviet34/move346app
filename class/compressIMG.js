import * as ImageManipulatior from 'expo-image-manipulator';

const resizeIMG = async(image) =>{
    return await ImageManipulatior.manipulateAsync(
        image.localUri|| image.uri,
        [{resize:{width:image.width * 0.8,height:image.height *0.8}}],
        {compress:0.8,format:ImageManipulatior.SaveFormat.JPEG}

    );
}
export default resizeIMG;