import moment from 'moment';
import { Video } from 'react-native-compressor';
import { getVideoMetaData } from 'react-native-compressor';
import { getRealPath } from 'react-native-compressor';
import storage, { firebase } from '@react-native-firebase/storage';
import { createThumbnail } from "react-native-create-thumbnail";
import RNThumbnail from "react-native-thumbnail";
import * as dataObjComponent from '../../dataComponent/dataObjComponent'
import * as Apolloclient from '../../../config/apollo/apolloConfig';
import * as Queries from "../../../config/apollo/queries";
import {Platform,NativeModules,NativeEventEmitter} from 'react-native';
import * as DataStorageLocal from "../../storage/dataStorageLocal";
import * as Constant from "../../constants/constant";

var RNFS = require('react-native-fs');

export async function prepareVideos (videoObj,petId,clientId,behId,modeOfUpload,obsName) {

  let newObj = await compressVideo(videoObj,petId,clientId,behId,modeOfUpload,obsName);
  return newObj;

};

const compressVideo = async (videoObj,petId,clientId,behId,modeOfUpload,obsName) => {

    let pathExists = '';
    if(Platform.OS==='android') {
        pathExists = await RNFS.exists(videoObj.filePath);
    } else {
        pathExists = await RNFS.exists(videoObj.filePath);
    }
    if(pathExists){

        if(Platform.OS==='android'){
            
          eventVideoUpload();

            let androidComressFile = await compressAndroidVideoFile(videoObj,petId,clientId,behId,modeOfUpload,obsName);
            let updatedCompressObj = await dataObjComponent.updateObjKeys(videoObj,androidComressFile,'compressedFile');
            let fVideoFile = await uploadVideoToFB(updatedCompressObj,androidComressFile,petId,clientId,behId,modeOfUpload,obsName); 
            let updatedFBVideoObj = await dataObjComponent.updateObjKeys(updatedCompressObj,fVideoFile,'fbFilePath');
            let thumImage = await generateThumbnail(updatedFBVideoObj,videoObj.filePath,petId,clientId,behId,modeOfUpload,obsName);
            let updatedThumbObj = await dataObjComponent.updateObjKeys(updatedFBVideoObj,thumImage,'thumbFilePath');
            return updatedThumbObj;

        } else {

            const result = await Video.compress(videoObj.filePath,
            {
                compressionMethod: 'auto',
            },(progress) => {

              Apolloclient.client.writeQuery({query: Queries.VIDEO_UPLOAD_BACKGROUND_STATUS,data: {data: {
                  obsVidName : obsName, 
                  statusUpload : 'Preparing Video ',
                  fileName : videoObj.fileName,
                  uploadProgress:Math.floor(progress * 100) + '%',
                  progressTxt:'Completed' ,
                  stausType:'Uploading',
                  mediaTYpe:'Video',
                  internetType:'wifi',
                  uploadMode:modeOfUpload,
                  __typename: 'videoUploadBackgroundStatus'
                }},})  
            });

            let updatedCompressObj = await dataObjComponent.updateObjKeys(videoObj,result,'compressedFile');
            let fVideoFile = await uploadVideoToFB(updatedCompressObj,result,petId,clientId,behId,modeOfUpload,obsName); 
            let updatedFBVideoObj = await dataObjComponent.updateObjKeys(updatedCompressObj,fVideoFile,'fbFilePath');
            let thumImage = await generateThumbnail(updatedFBVideoObj,videoObj.filePath,petId,clientId,behId,modeOfUpload,obsName);
            let updatedThumbObj = await dataObjComponent.updateObjKeys(updatedFBVideoObj,thumImage,'thumbFilePath');
            return updatedThumbObj;

        }
      
    } else {
        // createPopup('OK','Sorry','Video not found');
        // uploadMediaToFB('','fileNotFound');
        return 'nofileFound'
    }; 

};

const compressAndroidVideoFile = async (videoObj,petId,clientId,QueestionnaireId,modeOfUpload,obsName) => {

  let _uri ='';
  _uri = videoObj.filePath.replace("file:///", "/");

  return new Promise(function(resolve, reject) {
    
    NativeModules.VideoCompression.getDeviceName(_uri ,(status) => {
      Apolloclient.client.writeQuery({query: Queries.VIDEO_UPLOAD_BACKGROUND_STATUS,data: {data: {
        obsVidName : obsName, 
        statusUpload : 'Preparing Video ',
        fileName : videoObj.fileName,
        uploadProgress:status + '%',
        progressTxt:'Completed' ,
        stausType:'Uploading',
        mediaTYpe:'Video',
        internetType:'wifi',
        uploadMode:modeOfUpload,
        __typename: 'videoUploadBackgroundStatus'
      }},})  
      resolve(status);
    });  

  });     
         
};

const eventVideoUpload = async () => {
  const eventEmitter = new NativeEventEmitter(NativeModules.VideoCompression.onProgress);    
  var subscriptionAndroid = eventEmitter.addListener('videoUploadRecieveProgressMsg', onRecieveCompressedFile);  
};

const onRecieveCompressedFile = async (event) => {

  let videoData = await DataStorageLocal.getDataFromAsync(Constant.VIDEOS_UPLOAD_DATA);
  videoData = JSON.parse(videoData);

  Apolloclient.client.writeQuery({query: Queries.VIDEO_UPLOAD_BACKGROUND_STATUS,data: {data: {
    obsVidName : '', 
    statusUpload : 'Preparing Video ',
    fileName : '',
    uploadProgress:parseInt(JSON.parse(event.eventProperty))+'%',
    progressTxt:'Completed' ,
    stausType:'Uploading',
    mediaTYpe:'Video',
    internetType:'wifi',
    uploadMode:'backGround',
    __typename: 'videoUploadBackgroundStatus'
  }},})       

};

const uploadVideoToFB = async (videoObj,compressedFile,petId,clientId,behId,modeOfUpload,qestName1) => { 

    let behIdT = behId;
    let dte = moment(new Date()).format("YYYYMMDDHHmmss");
    let medianame = videoObj.fileName.replace('/r','/')
    let filename = "Observations_Videos/"+ medianame;
    let fileUri = decodeURI(compressedFile)

    return new Promise(function(resolve, reject) {

        const storageRef = storage().ref(filename)
        const uploadTask = storageRef.putFile(fileUri)
        uploadTask.on('state_changed',
          function(snapshot) {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progress = parseInt(progress);
  
            Apolloclient.client.writeQuery({query: Queries.VIDEO_UPLOAD_BACKGROUND_STATUS,data: {data: {
              obsVidName : qestName1, 
              statusUpload : 'Uploading Video ',
              fileName : videoObj.fileName,
              uploadProgress: progress + '%',
              progressTxt:'Completed' ,
              stausType:'Uploading',
              mediaTYpe:'Video',
              internetType:'wifi',
              uploadMode:modeOfUpload,
              __typename: 'videoUploadBackgroundStatus'
            }},}) 
          },
          function error(err) {
            resolve('nofileFound')
          },
          function complete() {
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
              resolve(downloadURL);
            })
          }
        )
      });
  
};

const generateThumbnail = async (videoObj,fbFilePath,petId,clientId,behId,modeOfUpload,qestName) => { 

    if(Platform.OS==='android'){

        let thumImg1 = undefined;
        await createThumbnail({url: fbFilePath,timeStamp: 10000,}).then(response => thumImg1 = response).catch(err => {});
        // uploadThumnailToFB(thumImg1,'thumbImg');
        let thumFB = await uploadThumnailToFB(videoObj,videoObj.localThumbImg,petId,clientId,behId,modeOfUpload,qestName);
        // if(thumImg1) {
        //   thumFB = await uploadThumnailToFB(videoObj,fbFilePath,petId,clientId,behId,modeOfUpload,qestName);
        //   return thumFB;
        // }
        return thumFB;
    } else {

      let thumImg = '';
      await createThumbnail({url: videoObj.filePath,timeStamp: 10000,}).then(response => thumImg = response.path).catch(err => {});
      if(thumImg !== '') {
        let thumFB = await uploadThumnailToFB(videoObj,thumImg,petId,clientId,behId,modeOfUpload,qestName);
        return thumFB;
      }
      return thumImg;

    }  

};

const uploadThumnailToFB = async (videoObj,thnumImage,petId,clientId,behId,modeOfUpload,qestName) => { 

    let questId = behId;
    let dte = moment(new Date()).format("YYYYMMDDHHmmss");
    let medianame = videoObj.fileName.replace('/r','/');
    medianame = medianame.slice(0, -4)
    let filename = "Observations_Thumbnails/"+ medianame + '.jpg';
    
    return new Promise(function(resolve, reject) {
        const storageRef = storage().ref(filename)
        const uploadTask = storageRef.putFile(thnumImage)
        uploadTask.on('state_changed',
          function(snapshot) {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            progress = parseInt(progress);

            Apolloclient.client.writeQuery({query: Queries.VIDEO_UPLOAD_BACKGROUND_STATUS,data: {data: {
              obsVidName : qestName, 
              statusUpload : 'Validating Video ',
              fileName : videoObj.fileName,
              uploadProgress: progress + '%',
              progressTxt:'Completed' ,
              stausType:'Uploading',
              mediaTYpe:'Video',
              internetType:'wifi',
              uploadMode:modeOfUpload,
              __typename: 'videoUploadBackgroundStatus'
            }},}) 
          },
          function error(err) {
            reject('nofileFound')
          },
          function complete() {

            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
              
              Apolloclient.client.writeQuery({query: Queries.VIDEO_UPLOAD_BACKGROUND_STATUS,data: {data: {
                obsVidName : qestName, 
                statusUpload : 'Validating Video',
                fileName : '',
                uploadProgress: '',
                progressTxt:'' ,
                stausType:'Uploading',
                mediaTYpe:'Video',
                internetType:'wifi',
                uploadMode:modeOfUpload,
                __typename: 'videoUploadBackgroundStatus'
              }},}) 
              
              resolve(downloadURL);
            })
          }
        )
      });
  
};