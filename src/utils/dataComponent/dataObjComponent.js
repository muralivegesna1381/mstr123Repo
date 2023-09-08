
export async function updateObjKeys (mediaObj,url,keyName) {

    let newObj = {};

    if(keyName === 'fbFilePath') {
        newObj = {...mediaObj, fbFilePath : url};
    } else if(keyName === 'compressedFile') {
        newObj = {...mediaObj, compressedFile : url};
    } else if(keyName === 'thumbFilePath') {
        newObj = {...mediaObj, thumbFilePath : url};
    }

    return newObj;

};