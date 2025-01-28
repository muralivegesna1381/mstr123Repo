import moment from 'moment';
import { Video } from 'react-native-compressor';
import storage, { firebase } from '@react-native-firebase/storage';
import { createThumbnail } from "react-native-create-thumbnail";
import * as dataObjComponent from './../../../utils/dataComponent/dataObjComponent'
import * as Apolloclient from './../../../config/apollo/apolloConfig';
import * as Queries from "./../../../config/apollo/queries";
import {Platform,NativeModules,NativeEventEmitter} from 'react-native';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";

var RNFS = require('react-native-fs');

export async function prepareVideos (videoObj,petId,clientId,QueestionnaireId,modeOfUpload,qestName) {

  let newObj = await compressVideo(videoObj,petId,clientId,QueestionnaireId,modeOfUpload,qestName);
  return newObj;

};

const compressVideo = async (videoObj,petId,clientId,QueestionnaireId,modeOfUpload,qestName) => {

    let pathExists = '';
    if(Platform.OS==='android') {
      pathExists = await RNFS.exists(videoObj.filePath);
    } else {
      pathExists = await RNFS.exists(videoObj.filePath);
    }

    if(pathExists){

      if(Platform.OS==='android'){
            
        eventVideoUpload();

        let androidComressFile = await compressAndroidVideoFile(videoObj);
        let updatedCompressObj = await dataObjComponent.updateObjKeys(videoObj,androidComressFile,'compressedFile');
        let fVideoFile = await uploadVideoToFB(updatedCompressObj,androidComressFile,petId,clientId,QueestionnaireId,modeOfUpload,qestName); 
        let updatedFBVideoObj = await dataObjComponent.updateObjKeys(updatedCompressObj,fVideoFile,'fbFilePath');
        let thumImage = await generateThumbnail(updatedFBVideoObj,videoObj.filePath,petId,clientId,QueestionnaireId,modeOfUpload,qestName);
        let updatedThumbObj = await dataObjComponent.updateObjKeys(updatedFBVideoObj,thumImage,'thumbFilePath');
        return updatedThumbObj;

      } else {

        const result = await Video.compress(videoObj.filePath,
        {
          compressionMethod: 'auto',
        },(progress) => {
            Apolloclient.client.writeQuery({query: Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS,data: {data: {
              questName : qestName, 
              statusUpload : 'Preparing Video ',
              fileName : videoObj.fileName,
              uploadProgress:Math.floor(progress * 100) + '%',
              progressTxt:'Completed' ,
              stausType:'Uploading',
              mediaTYpe:'Video',
              internetType:'wifi',
              uploadMode:modeOfUpload,
              __typename: 'UploadQuestionnaireVideoBackgroundStatus'
            }
          },})  
        });

        let updatedCompressObj = await dataObjComponent.updateObjKeys(videoObj,result,'compressedFile');
        let fVideoFile = await uploadVideoToFB(updatedCompressObj,result,petId,clientId,QueestionnaireId,modeOfUpload,qestName); 
        let updatedFBVideoObj = await dataObjComponent.updateObjKeys(updatedCompressObj,fVideoFile,'fbFilePath');
        let thumImage = await generateThumbnail(updatedFBVideoObj,videoObj.filePath,petId,clientId,QueestionnaireId,modeOfUpload,qestName);
        let updatedThumbObj = await dataObjComponent.updateObjKeys(updatedFBVideoObj,thumImage,'thumbFilePath');
        return updatedThumbObj;

      }
      
    } else {

      let updatedCompressObj = await dataObjComponent.updateObjKeys(videoObj,'','compressedFile');
      let updatedFBVideoObj = await dataObjComponent.updateObjKeys(updatedCompressObj,'','fbFilePath');
      let updatedThumbObj = await dataObjComponent.updateObjKeys(updatedFBVideoObj,'','thumbFilePath');
      return updatedThumbObj;
    }; 

};

const compressAndroidVideoFile = async (videoObj,petId,clientId,QueestionnaireId,modeOfUpload,qestName) => {

  let _uri ='';
  _uri = videoObj.filePath.replace("file:///", "/");

  return new Promise(function(resolve, reject) {
    
    NativeModules.VideoCompression.getDeviceName(_uri ,(status) => {
      resolve(status);
    });  

  });     
         
};

const eventVideoUpload = async () => {
  const eventEmitter = new NativeEventEmitter(NativeModules.VideoCompression.onProgress);    
  var subscriptionAndroid = eventEmitter.addListener('videoUploadRecieveProgressMsg', onRecieveCompressedFile);  
};

const onRecieveCompressedFile = async (event) => {

  let questData = await DataStorageLocal.getDataFromAsync(Constant.QUEST_UPLOAD_DATA);
  questData = JSON.parse(questData);

  Apolloclient.client.writeQuery({query: Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS,data: {data: {
    questName : questData[0] && questData[0].questionnaireName ? questData[0].questionnaireName : '', 
    statusUpload : 'Preparing Video ',
    fileName : '',
    uploadProgress:parseInt(JSON.parse(event.eventProperty))+'%',
    progressTxt:'Completed' ,
    stausType:'Uploading',
    mediaTYpe:'Video',
    internetType:'wifi',
    uploadMode:'backGround',
    __typename: 'UploadQuestionnaireVideoBackgroundStatus'
  }},})       

};

const uploadVideoToFB = async (videoObj,compressedFile,petId,clientId,QueestionnaireId,modeOfUpload,qestName1) => { 

    let questId = QueestionnaireId;
    let dte = moment(new Date()).format("YYYYMMDDHHmmss");
    let medianame = videoObj.fileName.replace('/r','/')
    let filename = "Questionnaire_Videos/"+ medianame;
    
    return new Promise(function(resolve, reject) {

        const storageRef = storage().ref(filename)
        const uploadTask = storageRef.putFile(compressedFile)
        uploadTask.on('state_changed',
          function(snapshot) {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progress = parseInt(progress);

            Apolloclient.client.writeQuery({query: Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS,data: {data: {
              questName : qestName1, 
              statusUpload : 'Uploading Video ',
              fileName : videoObj.fileName,
              uploadProgress: progress + '%',
              progressTxt:'Completed' ,
              stausType:'Uploading',
              mediaTYpe:'Video',
              internetType:'wifi',
              uploadMode:modeOfUpload,
              __typename: 'UploadQuestionnaireVideoBackgroundStatus'
            }},}) 
          },
          function error(err) {
            reject('nofileFOund')
          },
          function complete() {
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
              resolve(downloadURL);
            })
          }
        )
      });
  
};

const generateThumbnail = async (videoObj,fbFilePath,petId,clientId,QueestionnaireId,modeOfUpload,qestName) => { 

    if(Platform.OS==='android'){

        let thumImg1 = undefined;
        await createThumbnail({url: fbFilePath,timeStamp: 10000,}).then(response => thumImg1 = response.path).catch(err => {});
        // uploadThumnailToFB(thumImg1,'thumbImg');
        let thumFB = ''
        if(thumImg1) {
          thumFB = await uploadThumnailToFB(videoObj,fbFilePath,petId,clientId,QueestionnaireId,modeOfUpload,qestName);
          return thumFB;
        }
        return thumFB;
    } else {

        let thumImg = '';
        await createThumbnail({url: videoObj.filePath,timeStamp: 10000,}).then(response => thumImg = response.path).catch(err => {});
        if(thumImg !== '') {
          let thumFB = await uploadThumnailToFB(videoObj,thumImg,petId,clientId,QueestionnaireId,modeOfUpload,qestName);
          return thumFB;
        }
        return thumImg;

    }  

};

const uploadThumnailToFB = async (videoObj,thnumImage,petId,clientId,QueestionnaireId,modeOfUpload,qestName) => { 

    let questId = QueestionnaireId;
    let dte = moment(new Date()).format("YYYYMMDDHHmmss");
    let medianame = videoObj.fileName.replace('/r','/');
    medianame = medianame.slice(0, -4)
    let filename = "Questionnaire_Thumb_Images/"+ medianame + '.jpg';
    
    return new Promise(function(resolve, reject) {
      const storageRef = storage().ref(filename)
      const uploadTask = storageRef.putFile(thnumImage)
      uploadTask.on('state_changed',
        function(snapshot) {
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          progress = parseInt(progress);

          Apolloclient.client.writeQuery({query: Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS,data: {data: {
            questName : qestName, 
            statusUpload : 'Validating Video ',
            fileName : videoObj.fileName,
            uploadProgress: progress + '%',
            progressTxt:'Completed' ,
            stausType:'Uploading',
            mediaTYpe:'Video',
            internetType:'wifi',
            uploadMode:modeOfUpload,
            __typename: 'UploadQuestionnaireVideoBackgroundStatus'
          }},}) 
        },
        function error(err) {
            reject('nofileFOund')
        },
        function complete() {
          uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
              
            Apolloclient.client.writeQuery({query: Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS,data: {data: {
              questName : qestName, 
              statusUpload : 'Validating Video',
              fileName : '',
              uploadProgress: '',
              progressTxt:'' ,
              stausType:'Uploading',
              mediaTYpe:'Video',
              internetType:'wifi',
              uploadMode:modeOfUpload,
              __typename: 'UploadQuestionnaireVideoBackgroundStatus'
            }},}) 
              
            resolve(downloadURL);
          })
        }
      )
    });
  
};