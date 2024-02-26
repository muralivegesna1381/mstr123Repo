import { Image } from 'react-native-compressor';
import storage, { firebase } from '@react-native-firebase/storage';
import {Platform} from 'react-native';
import * as dataObjComponent from './../../../utils/dataComponent/dataObjComponent'
import * as Apolloclient from './../../../config/apollo/apolloConfig';
import * as Queries from "./../../../config/apollo/queries";

var RNFS = require('react-native-fs');

export async function prepareImages (imgObj,fileName,filePath,petId,clientId,id,modeOfUpload,dateString,obsName) {

    let fbFileName = await uploadImageToFB(imgObj,fileName,filePath,petId,clientId,id,modeOfUpload,dateString,obsName);
    let updatedObj1 = await dataObjComponent.updateObjKeys(imgObj,fbFileName,'fbFilePath');
    return updatedObj1;
};

const compressImage = async (imgObj,petId,clientId,QueestionnaireId,modeOfUpload,qestName) => {

    let pathExists = '';
    if(Platform.OS === 'android') {
        pathExists = await RNFS.exists(imgObj.thumbFilePath);
    } else {
        pathExists = await RNFS.exists(imgObj.filePath);
    }
    if(pathExists){

      Apolloclient.client.writeQuery({query: Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS,data: {data: {
        questName : qestName, 
        statusUpload : 'Uploading Image ',
        fileName : imgObj.fileName,
        uploadProgress:'',
        progressTxt:'' ,
        stausType:'Uploading',
        mediaTYpe:'',
        internetType:'wifi',
        uploadMode:modeOfUpload,
        __typename: 'UploadQuestionnaireVideoBackgroundStatus'
      }},})
      
      const result = await Image.compress(imgObj.filePath, {
        compressionMethod: 'auto',
      });
            
      let updatedObj = await dataObjComponent.updateObjKeys(imgObj,result,'compressedFile');
      let fbFileObj =  await uploadImageToFB(updatedObj,result,petId,clientId,QueestionnaireId,modeOfUpload,qestName);
      let updatedObj1 = await dataObjComponent.updateObjKeys(updatedObj,fbFileObj,'fbFilePath');

      return updatedObj1;
      
    } else {
        // createPopup('OK','Sorry','Image not found');
        // uploadMediaToFB('','fileNotFound');
        return 'nofileFound'
    }; 

};

const uploadImageToFB = async (imgObj,fileName,filePath,petId,clientId,id,modeOfUpload,dateString,obsName) => { 

  let filename = '';
  let medianame = fileName.replace('/r','/')
  filename = "Observations_Images/" + clientId.toString() + '_' + petId.toString() + '_' + id.toString() + '_' + dateString + '_' + medianame;

  return new Promise(function(resolve, reject) {
    const storageRef = storage().ref(filename)
    const uploadTask = storageRef.putFile(filePath)
    uploadTask.on('state_changed',
      function(snapshot) {
        
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        progress = parseInt(progress);

        Apolloclient.client.writeQuery({query: Queries.IMAGE_UPLOAD_BACKGROUND_STATUS,data: {data: {
          obsImgName : obsName, 
          statusUpload : 'Uploading Media ',
          fileName : fileName,
          uploadProgress: progress + '%',
          progressTxt:'Completed' ,
          stausType:'Uploading',
          mediaTYpe:'',
          internetType:'wifi',
          uploadMode:modeOfUpload,
          __typename: 'imageUploadBackgroundStatus'
        }},})
      },
      function error(err) {
        reject('nofileFound')
      },
      function complete() {
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          resolve(downloadURL);
        })
      }
    )
  })
};