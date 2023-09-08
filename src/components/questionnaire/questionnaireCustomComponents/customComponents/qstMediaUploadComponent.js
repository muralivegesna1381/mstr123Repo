import React,{useEffect, useState, useRef} from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Platform, FlatList,ImageBackground,Image,ActivityIndicator,NativeModules} from 'react-native';
import fonts from './../../../../utils/commonStyles/fonts';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../../../utils/commonStyles/commonStyles';
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';

import * as ImagePicker from 'react-native-image-picker';
import MediaMeta from "react-native-media-meta";
import CameraRoll from "@react-native-community/cameraroll";
import { createThumbnail } from "react-native-create-thumbnail";
import moment from 'moment';
import { PermissionsAndroid } from 'react-native';
import ImageView from "react-native-image-viewing";
import Video from 'react-native-video';
import * as PermissionsiOS from './../../../../utils/permissionsComponents/permissionsiOS';
import * as CheckPermissionsAndroid from './../../../../utils/permissionsComponents/permissionsAndroid';
import PhotoEditor from 'react-native-photo-editor'
import * as generatRandomNubmer from './../../../../utils/generateRandomId/generateRandomId.js';
import * as Constant from "./../../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../../utils/storage/dataStorageLocal";

var RNFS = require('react-native-fs');

let failedImg = require('./../../../../../assets/images/otherImages/svg/failedXIcon.svg');
let defaultPetImg = require( "./../../../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg");

    const QstMediaUploadComponent = ({navigation,value,setValue,setLoaderValue,mediaType,questionImageUrl,defaultPetObj,questionName,questionnaireName,status_QID,viewVideoAction,errorPermissions,submittedAnswer,showiOScamAlert, route,...props}) => {

        const [mediaArray, set_mediaArray] = useState([]);
        const [optionsArray, set_optionsArray] = useState(['CAMERA','GALLERY','CANCEL']);
        const [mediaSize, set_mediaSize] = useState(0);
        const [imgLoader, set_imgLoader] = useState(true);
        const [mediaLoader, set_mediaLoader] = useState(false);
        const [isImageView, set_isImageView] = useState(false);
        const [images, set_images] = useState([]);
        const [isLoading, set_isLoading] = useState(false);

        let editImgCountRef = useRef(0);
        let actualEditImgCountRef = useRef(0);
        let editedImagesArray = useRef([]);
        let videoArray =[];
        let androidTrimmedVideos = [];
        let cameraTrimmedpath;

      useEffect(() => { 

        if(Platform.OS === 'android') {
          requestCameraPermission();
        }
        
        if(value){
          let tempArray = value//JSON.parse(value);
          set_mediaArray(tempArray);
          set_mediaSize(tempArray.length);
        }else{
          set_mediaArray([]);
        }

        if(status_QID === 'Submitted' && submittedAnswer && submittedAnswer.length > 0) {

          const res = submittedAnswer.split('###');
          let tempArray = res;
          let tempArray1 = [];
          let vidObj = undefined;
          for (let i = 0 ; i < tempArray.length; i++){
              vidObj = {
                "id":moment(new Date()).format("YYYYMMDDHHmmss"),
                'filePath':tempArray[i],
                'androidFilePath' : tempArray[i],
                'fbFilePath':tempArray[i],
                'fileName':'QuestFile',
                'qstVideoId' : '',
                'localThumbImg': mediaType === 'photo' ? tempArray[i] : undefined,
                'fileType':mediaType,
                "isDeleted": 0,
                "actualFbThumFile": '',
                'thumbFilePath':'',
                'compressedFile':''
              };

              tempArray1.push(vidObj);
          }

          set_mediaArray(tempArray1);
        }
       
      },[]);

      // useEffect(() => {     

      //   if(questionImageUrl && questionImageUrl !== ''){
      //     prepareImage(questionImageUrl);
      //   }
        
      // },[questionImageUrl]);

      const prepareImage = (imgURL) => {
        let img = {uri : imgURL};
        set_images([img]);
        set_isImageView(true);
      }

      const requestCameraPermission = async () => {

        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "App Camera Permission",
              message:"App needs access to your camera ",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          } else {
          }
        } catch (err) {}
  
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: "App Camera Permission",
              message:"App needs access to your camera ",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          } else {
          }
        } catch (err) {}
      };

      const selectMediaAction = () => {

        editImgCountRef.current = 0;
        actualEditImgCountRef.current = 0;
        editedImagesArray.current = [];

        if(Platform.OS === 'android') {
          chooseMultipleMedia();
        } else {
          chooseMedia();
        }
        
      };

      const chooseMedia = () => {

        setLoaderValue(true);
        set_isLoading(true);

        ImagePicker.launchImageLibrary({
          mediaType: mediaType,
          includeBase64: false,
          selectionLimit: mediaType === 'video' ? 2 - mediaSize : 7 - mediaSize,
          durationLimit:1200,
          includeExtra : true
        },
        async (response) => {
          if(response && response.errorCode === 'permission') {
            setLoaderValue('');
            set_isLoading(false);
            errorPermissions('galleryNotAllowed');
            return
          }
          if(response && response.assets){
  
              let mArray = mediaArray;
              for (let i = 0; i < response.assets.length; i++){
                if(response.assets[i].type.includes('image')){

                  var dateFile = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss");
                  if(response.assets[i].timestamp) {
                    dateFile = moment(response.assets[i].timestamp).utcOffset("+00:00").format("MMDDYYYYHHmmss");  
                  }

                  let fileName = '';
                  
                  if(defaultPetObj) {
                    let pName = defaultPetObj.petName.length > 15 ? defaultPetObj.petName.substring(0,15) : defaultPetObj.petName;
                    let sName = defaultPetObj.studyName.length > 20 ? defaultPetObj.studyName.substring(0,20) : defaultPetObj.studyName;
                    // let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0,15) : obsObject.behaviourItem.behaviorName;
                    fileName = pName +'_'+sName+'_'+defaultPetObj.devices[0].deviceNumber+'_'+dateFile+'.jpg';
                  }

                  let isExists = undefined;
                  if(mArray && mArray.length>0){
  
                    const isFound = mArray.some(element => {
                      
                      if (element.fileName === fileName) {
                          isExists = true;
                      } 
  
                    });
  
                  }

                if(!isExists){

                  let rNumber = await generatRandomNubmer.generateRandomNumber();

                  let imgObj = {
                    "id":rNumber,
                    'filePath':response.assets[i].uri,
                    'fbFilePath':'',
                    'fileName':fileName,//response.assets[i].fileName,
                    'qstPhotoId' : '',
                    'localThumbImg': response.assets[i].uri,
                    'fileType':'image',
                    "isDeleted": 0,
                    "actualFbThumFile": '',
                    'thumbFilePath':response.assets[i].uri,
                    'compressedFile':'',
                    'isEdited' : false
                  };
                    mArray.push(imgObj);
                } 
               
                } 
                
                if(response.assets[i].type.includes('video')) {
  
                  let _uri ='';
                _uri = response.assets[i].uri.replace("file:///", "/");

                var dateFile = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss");
                  if(response.assets[i].timestamp) {
                    dateFile = moment(response.assets[i].timestamp).utcOffset("+00:00").format("MMDDYYYYHHmmss");  
                  }
                  
                let fileName = '';
                if(defaultPetObj) {
                  let pName = defaultPetObj.petName.length > 15 ? defaultPetObj.petName.substring(0,15) : defaultPetObj.petName;
                  let sName = defaultPetObj.studyName.length > 20 ? defaultPetObj.studyName.substring(0,20) : defaultPetObj.studyName;
                  let qName = questionName.length > 15 ? questionName.substring(0,15) : questionName;
                  let qnnaireName = questionnaireName.length > 15 ? questionnaireName.substring(0,15) : questionnaireName;
                  fileName = pName +'_'+sName+'_'+defaultPetObj.devices[0].deviceNumber+'_'+dateFile+qName+'_'+qnnaireName+'.mp4';
                }

                let isExists = undefined;

                if(mArray && mArray.length>0){
  
                  const isFound = mArray.some(element => {

                  if (element.fileName === fileName) {
                      isExists = true;
                  } 

                  });

                }
                
                if(isExists){

                } else {
                  let thumImg = undefined;
                  await createThumbnail({url: response.assets[i].uri,timeStamp: 10000,}).then(response => thumImg = response.path).catch(err => {});
                  let rNumber = await generatRandomNubmer.generateRandomNumber();
                  let vidObj = {
                    "id": rNumber,
                    'filePath':response.assets[i].uri,
                    'fbFilePath':'',
                    'fileName':fileName,//dateFile+"_&"+response.assets[i].fileName,
                    'qstVideoId' : '',
                    'localThumbImg': thumImg,
                    'fileType':'video',
                    "isDeleted": 0,
                    "actualFbThumFile": '',
                    'thumbFilePath':'',
                    'compressedFile':''
                  };
                  androidTrimmedVideos[i] = response.assets[i].uri;
                  mArray.splice(0, 0, vidObj);
                }
  
                }
              }     
              
             
              setLoaderValue(false);
              set_isLoading(false);

              if(androidTrimmedVideos.length>0){
                let myPromise = new Promise(function(resolve) {
                    androidTrimmedVideos = androidTrimmedVideos.filter((a)=>a)
                    if(Platform.OS === 'ios'){
                      NativeModules.ChangeViewBridge.changeToNativeView(
                        androidTrimmedVideos,
                        eventId => {
                          resolve(eventId);
                        },
                      );
                     
                      
                    }
                });
                videoArray = await myPromise;
                }

                for (let i = 0; i < videoArray.length; i++){
  
                  if(videoArray[i].startsWith("file://")){
                    mArray[i].filePath = videoArray[i];
                  }
                  else{
                     mArray[i].filePath = 'file://'+videoArray[i];
                  }
        
                }
                set_mediaArray(mArray);
                set_mediaSize(mArray.length);
                setValue(mArray);
              editPhoto(mArray);

          } else {
            setLoaderValue(false);
            set_isLoading(false);
          }
  
        })
        
      };

      const chooseMultipleMedia = async () => {

        setLoaderValue(true);
        set_isLoading(true)
        try {
          var response = await MultipleImagePicker.openPicker({
            selectedAssets: [],
            maxVideo: 2,
            usedCameraButton: false,
            singleSelectedMode: false,
            isCrop: false,
            isCropCircle: false,
            mediaType : mediaType === 'photo' ? "image" : "video",
            maxVideoDuration: 1200,
            singleSelectedMode: false,
            selectedColor: '#f9813a',
            maxSelectedAssets: mediaType === 'photo' ? 7 - mediaSize : 2 - mediaSize,
            allowedPhotograph : false,
            allowedVideoRecording : false,
            preventAutomaticLimitedAccessAlert : true,
            isPreview:true,
            
          });
    
          if(response) {
  
          let mArray = mediaArray;
          for (let i = 0; i < response.length; i++){
  
            if(response[i].type.includes('image')){
              let rNumber = await generatRandomNubmer.generateRandomNumber();
              let imgObj = {
                "id":rNumber,
                'filePath':response[i].path,
                'fbFilePath':'',
                'fileName':response[i].fileName,
                'qstPhotoId' : '',
                'localThumbImg': response[i].path,
                'fileType':'image',
                "isDeleted": 0,
                "actualFbThumFile": '',
                "thumbFilePath":response[i].realPath,
                "compressedFile":'',
                'isEdited' : false
              };
              mArray.splice(0, 0, imgObj);
  
            } 
            if(response[i].type.includes('video')){
  
              let thumImg1 = undefined;
              await createThumbnail({url: response[i].path,timeStamp: 10000,}).then(response => thumImg1 = response.path)
              .catch(err => {});
  
              let _uri ='';
                  _uri = response[i].realPath.replace("file:///", "/");

                  if(Platform.OS === 'android') {
                    NativeModules.K4lVideoTrimmer.navigateToTrimmer(response[i].realPath,"10",(convertedVal)  => {
                       convertedVal = convertedVal.replace("[", "");
                      convertedVal = convertedVal.replace("]", "");
                      androidTrimmedVideos = convertedVal.split(",");
                        //CALL UPDATE URLS METHOD FROM HERE
                         updateTrimmedURLs();
      
                    });
                }

                  var dateFile = moment().utcOffset("+00:00").format("YYYYMMDDHHmmss");
                  
  
              await MediaMeta.get(_uri).then((metadata) => {
                dateFile = moment(metadata.creation_time).utcOffset("+00:00").format("YYYYMMDDHHmmss");    
              }).catch((err) => {});
              let vidObj = undefined;
              let rNumber = await generatRandomNubmer.generateRandomNumber();
               vidObj = {
                "id":rNumber,
                'filePath':response[i].realPath,
                'fbFilePath':'',
                'fileName':dateFile+"_"+response[i].fileName,
                'qstVideoId' : '',
                'localThumbImg': thumImg1,
                'fileType':'video',
                "isDeleted": 0,
                "actualFbThumFile": '',
                'thumbFilePath':response[i].path,
                'compressedFile':''
              };
              mArray.push(vidObj);
  
            }

          }
            set_mediaArray(mArray);
            set_mediaSize(mArray.length);
            setValue(mArray);
            setLoaderValue(false);
            set_isLoading(false)
            editPhoto(mArray);
          }
        } catch (e) {
          setLoaderValue(false);
          set_isLoading(false)
        }
      };

      const openCamera = () => {

        let options = {
          mediaType: mediaType,
          durationLimit: 1200,
          videoQuality: "medium", // 'low', 'medium', or 'high'
          allowsEditing: true, //Allows Video for trimming
          storageOptions: {
            skipBackup: true,
            path: "Wearables",
          },
        };
        
        ImagePicker.launchCamera(options, (response) => {
    
          if (response.didCancel) {
          } else if (response.error) {
          } else {

            let mArray = mediaArray;
              var promise = CameraRoll.save(response.assets[0].uri, {
                type: "video",
                album: "Wearables",
                // filename: "video"+moment(new Date()).format('MMDDYYYYhhmmss'),
              });
              promise.then(async function(result) {

                  if(response.assets[0].type.includes('video')) {

                    let myPromise = new Promise(function(resolve) {
                      if(Platform.OS === 'android') {
                        NativeModules.K4lVideoTrimmer.navigateToTrimmer(response.assets[0].uri,"11",(convertedVal) => {
                          resolve(convertedVal);
                        });
                      }
                        if(Platform.OS === 'ios'){
                          NativeModules.ChangeViewBridge.changeToNativeView(
                            [response.assets[0].uri],
                            eventId => {
                              resolve(eventId);
                            },
                          );
                         
                          
                        }
                    });

                    cameraTrimmedpath = await myPromise;
                    //write function here to handle video path for android and iOS

                    if (Platform.OS === 'android') {
                      cameraTrimmedpath = cameraTrimmedpath.replace("[", "");
                      cameraTrimmedpath = cameraTrimmedpath.replace("]", "");
                      cameraTrimmedpath = 'file://' +cameraTrimmedpath;        
                    }
                    else {
                      if(cameraTrimmedpath[0].startsWith("file://")){
                        cameraTrimmedpath =  cameraTrimmedpath[0]
                      }
                      else{
                        cameraTrimmedpath = 'file://'+cameraTrimmedpath[0];
                      }
        
                    }

                    let thumImg = undefined;
                    await createThumbnail({url: response.assets[0].uri,timeStamp: 10000,}).then(response => thumImg = response.path)
                    .catch(err => {});
                    
                    var dateFile = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss");
                    
                    let fileName = '';
                    
                    if(defaultPetObj) {
                      let pName = defaultPetObj.petName.length > 15 ? defaultPetObj.petName.substring(0,15) : defaultPetObj.petName;
                      let sName = defaultPetObj.studyName.length > 20 ? defaultPetObj.studyName.substring(0,20) : defaultPetObj.studyName;
                      let qName = questionName.length > 15 ? questionName.substring(0,15) : questionName;
                      let qnnaireName = questionnaireName.length > 15 ? questionnaireName.substring(0,15) : questionnaireName;
                      fileName = pName +'_'+sName+'_'+defaultPetObj.devices[0].deviceNumber+'_'+dateFile+qName+'_'+qnnaireName+'.mp4';
                    }

                    let rNumber = await generatRandomNubmer.generateRandomNumber();
                    let vidObj = {
                      "id":rNumber,
                      'filePath':cameraTrimmedpath,
                      'fbFilePath':'',
                      'fileName':fileName,//dateFile+"_&"+response.assets[i].fileName,
                      'qstVideoId' : '',
                      'localThumbImg': thumImg,
                      'fileType':'video',
                      "isDeleted": 0,
                      "actualFbThumFile": '',
                      'thumbFilePath':'',
                      'compressedFile':'',
                      
                    };

                    mArray.splice(0, 0, vidObj);
                    set_mediaArray(mArray);
                    set_mediaSize(mArray.length);
                    setValue(mArray);
                    setLoaderValue(false);
    
                  }

                }) .catch(function(error) {setLoaderValue(false);});

              if(response.assets[0].type.includes('image')) {

                var dateFile = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss");
                let fileName = '';
                    
                if(defaultPetObj) {
                  let pName = defaultPetObj.petName.length > 15 ? defaultPetObj.petName.substring(0,15) : defaultPetObj.petName;
                  let sName = defaultPetObj.studyName.length > 20 ? defaultPetObj.studyName.substring(0,20) : defaultPetObj.studyName;
                  let qName = questionName.length > 15 ? questionName.substring(0,15) : questionName;
                  let qnnaireName = questionnaireName.length > 15 ? questionnaireName.substring(0,15) : questionnaireName;
                  fileName = pName +'_'+sName+'_'+defaultPetObj.devices[0].deviceNumber+'_'+dateFile+qName+'_'+qnnaireName+'.jpg';
                }

                let imgObj = {
                  "id":moment(new Date()).format("YYYYMMDDHHmmss")+response.assets[0].fileName.replace('/r','/'),
                  'filePath':response.assets[0].uri,
                    'fbFilePath':'',
                    'fileName':fileName,//dateFile+"_&"+response.assets[i].fileName,
                    'qstPhotoId' : '',
                    'localThumbImg': response.assets[0].uri,
                    'fileType':'image',
                    "isDeleted": 0,
                    "actualFbThumFile": '',
                    'thumbFilePath':response.assets[0].uri,
                    'compressedFile':'',
                    'isEdited' : false
                };
  
                mArray.splice(0, 0, imgObj);
                set_mediaArray(mArray);
                set_mediaSize(mArray.length);
                setValue(mArray);
                setLoaderValue(false);
                editPhoto(mArray);
              } 

            }

        });
        
      };

      const cameraBtnAction = async () => {

        editImgCountRef.current = 0;
        actualEditImgCountRef.current = 0;
        editedImagesArray.current = [];
        if(Platform.OS === 'ios') {

          let camPermissions = await DataStorageLocal.getDataFromAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED);
          if(camPermissions && camPermissions === 'isFirstTime') {
            await DataStorageLocal.saveDataToAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED,'existingUser');
            openCamera();
          } else {

            let permissions = await PermissionsiOS.checkCameraPermissions();
            if(!permissions) {
                showiOScamAlert();
                return
            } else {
              openCamera();
            }

          }

        } else {

          let androidPer = await CheckPermissionsAndroid.checkCameraPermissions();
          if(androidPer === 'Camera not granted') {
            setLoaderValue('');
            set_isLoading(false);
            errorPermissions('cameraNotAllowed');
            return
          } else {
            openCamera();
          }
        }
        
      };

      const removeMedia = async (id) => {

        let tempArray = mediaArray;
        const tasks = tempArray.filter(task => task.fileName !== id);
        let temp = tasks;
        set_mediaArray(temp);
        set_mediaSize(temp.length);
        setValue(temp);

      };

      const actionOnRow = (item) => {
        if(item.fileType === 'photo'){
          if(item.filePath !== ''){
              // let img = {uri : item.filePath};
              // set_images([img]);
              // set_isImageView(true);
              prepareImage(item.filePath);
          }
          
        } else {
            if(item.fbFilePath !== ''){
                viewAction(item);
            }
            
        }
    };

    const viewAction = async (item) => {
        viewVideoAction(item)
    };

    //to handle trimmed urls for android
    const updateTrimmedURLs = async() =>{

      var iArray = mediaArray.filter(item => item.fileType === 'image');
      var vArray = mediaArray.filter(item => item.fileType === 'video');
      var tempArray = [];

      if(androidTrimmedVideos.length>0){
        for (let i = 0; i < vArray.length; i++) {
            vArray[i].filePath = androidTrimmedVideos[i].trim();
        }
        tempArray = [...vArray,...iArray]
        set_mediaArray(tempArray)
      }

    };

    const editPhoto = async (mediaArray) => {
      
      let iArray = [];

      for (let i = 0; i < mediaArray.length; i++){

        if(mediaArray[i].fileType === 'image'){
          iArray.push(mediaArray[i])
        }
        
      }

      actualEditImgCountRef.current = iArray.length;
      addEditedImg(iArray[editImgCountRef.current].filePath,iArray);
            
    };

    const addEditedImg = async (uri,iArray) => {

      let isEdit = iArray[editImgCountRef.current].isEdited;

      if(uri && !isEdit) {

        let fileName = iArray[editImgCountRef.current].id;
        let newPath = `${RNFS.DocumentDirectoryPath}/${fileName}`; 
          RNFS.copyFile(uri, newPath).then((success) => {

            setTimeout(() => {
                PhotoEditor.Edit({
                  path: newPath,
                  // colors : ['#000000', '#808080', '#a9a9a9'],
                  hiddenControls : ['share','sticker'],
                  onDone : imagePath => {

                    let imgObj = {
                      "id":iArray[editImgCountRef.current].id,
                      'filePath':imagePath,
                      'fbFilePath':'',
                      'fileName':iArray[editImgCountRef.current].fileName,
                      'qstPhotoId' : '',
                      'localThumbImg': iArray[editImgCountRef.current].localThumbImg,
                      'fileType':'image',
                      "isDeleted": 0,
                      "actualFbThumFile": '',
                      'thumbFilePath':iArray[editImgCountRef.current].thumbFilePath,
                      'compressedFile':'',
                      'isEdited' : true
                    };
                    editedImagesArray.current.push(imgObj);
                    editImgCountRef.current = editImgCountRef.current + 1;
                    if(editImgCountRef.current < actualEditImgCountRef.current){
                      addEditedImg(iArray[editImgCountRef.current].filePath,iArray);
                    } else {

                      let tempArray = [...editedImagesArray.current]
                      set_mediaArray(tempArray);
                      set_mediaSize(tempArray.length);
                      setValue(tempArray);

                    }

                  },
                  onCancel : () => {

                    let imgObj = {
                      "id":iArray[editImgCountRef.current].id,
                      'filePath':iArray[editImgCountRef.current].filePath,
                      'fbFilePath':'',
                      'fileName':iArray[editImgCountRef.current].fileName,
                      'qstPhotoId' : '',
                      'localThumbImg': iArray[editImgCountRef.current].localThumbImg,
                      'fileType':'image',
                      "isDeleted": 0,
                      "actualFbThumFile": '',
                      'thumbFilePath':iArray[editImgCountRef.current].thumbFilePath,
                      'compressedFile':'',
                      'isEdited' : true
                    };

                    editedImagesArray.current.push(imgObj);
                    editImgCountRef.current = editImgCountRef.current + 1;
                    if(editImgCountRef.current < actualEditImgCountRef.current){
                      addEditedImg(iArray[editImgCountRef.current].filePath,iArray);
                    } else {

                      let tempArray = [...editedImagesArray.current]
                      set_mediaArray(tempArray);
                      set_mediaSize(tempArray.length);
                      setValue(tempArray);
                    }
                  }
                });
              },700,
          );

          }).catch((err) => {});

      } else {

          editedImagesArray.current.push(iArray[editImgCountRef.current]);
          editImgCountRef.current = editImgCountRef.current + 1;
          if(editImgCountRef.current < actualEditImgCountRef.current){
            addEditedImg(iArray[editImgCountRef.current].filePath,iArray);
          } else {
            let tempArray = [...editedImagesArray.current,]
            set_mediaArray(tempArray);
            set_mediaSize(tempArray.length);
            setValue(tempArray);
            return;
          }
      }

    };

    const renderItem = ({ item, index }) => {
      return (
          <>  
            <TouchableOpacity disabled={true} >

                {mediaArray.length> 0 && mediaArray[index].fileType === 'video' ? (mediaArray[index].localThumbImg ? 

                  <TouchableOpacity disabled={status_QID === 'Submitted' ? false : true} onPress={() => actionOnRow(item)}>
                    <ImageBackground source={{uri : mediaArray[index].localThumbImg }} style={styles.media} imageStyle={{borderRadius:5}} onLoadStart={() => set_mediaLoader(true)} onLoadEnd={() => {set_mediaLoader(false)}} >
                      {mediaLoader ? <ActivityIndicator size="small" color="gray"/> : null}
                            {status_QID === 'Submitted' ? null : <TouchableOpacity style={Platform.isPad ? [styles.imageBtnStyle,{marginTop:hp('-1%'),}] :[styles.imageBtnStyle] } onPress={() => removeMedia(item.fileName)}>
                                      <Image source={failedImg} style={styles.imageBtnStyle1}/>
                                  </TouchableOpacity>}

                                  {status_QID === 'Submitted' ? <View style={styles.viewStyle}>
                                    <Text style={styles.viewTextStyle}>{'VIEW'}</Text>
                                  </View> : null}

                    </ImageBackground> 
                  </TouchableOpacity>
                              : 
                        <TouchableOpacity disabled={status_QID === 'Submitted' ? false : true} onPress={() => actionOnRow(item)}>

                        <View style={styles.media}>

                          {Platform.OS === 'ios' ? <Video
                              source={{uri:item.filePath}}
                              rate={1.0}
                              volume={1.0}
                              muted={true}
                              paused = {true}
                              resizeMode={"cover"}
                              // repeat = {isLoading}
                              style={styles.videoStyle}
                              controls={false}
                              fullscreen={false}
                              fullscreenOrientation = {'portrait'}
                              onLoad = {set_isLoading(true)}
                              onLoadEnd = {set_isLoading(false)}
                              // onLoadStart = {set_isLoading(false)}
                              // poster={photoURL}

                          /> : <View style={styles.media1}><ImageBackground source={defaultPetImg} style={styles.videoStyleImg}/></View>}

                          {status_QID === 'Submitted' ? <View style={styles.viewStyle}>
                            <Text style={styles.viewTextStyle}>{'VIEW'}</Text>
                          </View> : null}

                        </View>
                        </TouchableOpacity>

                              ) : (mediaArray.length> 0 && mediaArray[index].filePath && mediaArray[index].filePath!=='' ? 
                              <TouchableOpacity disabled={status_QID === 'Submitted' ? false : true} onPress={() => actionOnRow(item)}>
                              
                                  <ImageBackground source={{uri : Platform.OS === 'ios' ? mediaArray[index].filePath : mediaArray[index].localThumbImg }} style={styles.media} imageStyle={{borderRadius:5}} onLoadStart={() => set_mediaLoader(true)} onLoadEnd={() => {set_mediaLoader(false)}} >
                                    {mediaLoader ? <ActivityIndicator size="small" color="gray"/> : null}
                                    {status_QID === 'Submitted'  ? null : <TouchableOpacity style={Platform.isPad ? [styles.imageBtnStyle,{marginTop:hp('-1%'),}] :[styles.imageBtnStyle] } onPress={() => removeMedia(item.fileName)}>
                                      <Image source={failedImg} style={styles.imageBtnStyle1}/>                                    
                                  </TouchableOpacity>}

                                  {status_QID === 'Submitted' ? <View style={styles.viewStyle}>
                                    <Text style={styles.viewTextStyle}>{'VIEW'}</Text>
                                  </View> : null}

                                  </ImageBackground>
                              </TouchableOpacity>
                               : 
                          <TouchableOpacity disabled={status_QID === 'Submitted' ? false : true} onPress={() => actionOnRow(item)}>
                            <ImageBackground source={{uri : mediaArray[index].fbFilePath}} style={styles.media} imageStyle={{borderRadius:5}} onLoadStart={() => set_mediaLoader(true)} onLoadEnd={() => {set_mediaLoader(false)}}>
                                          {mediaLoader ? <ActivityIndicator size='small' color="gray"/> : null} 
                                          {status_QID === 'Submitted'  ? null : <TouchableOpacity style={Platform.isPad ? [styles.imageBtnStyle,{marginTop:hp('-1.5%'),}] :[styles.imageBtnStyle]} onPress={() => removeMedia(item.fileName)}>
                                        <Image source={failedImg} style={styles.imageBtnStyle1}/>
                                    </TouchableOpacity>}

                            </ImageBackground>
                          </TouchableOpacity>
                          )
                        }

            </TouchableOpacity>
          </>
      )}

    return(

        <View style={styles.container}>

            {questionImageUrl && status_QID !== 'Submitted' && submittedAnswer  ? <View>
            <TouchableOpacity onPress={() => prepareImage(questionImageUrl)}>
              <ImageBackground source={{uri : questionImageUrl}} style={[CommonStyles.questImageStyles]} imageStyle = {{borderRadius:10}}
                    onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {set_imgLoader(false)}}>
                      {imgLoader ? <ActivityIndicator size="large" color="gray"/> : null}
                      {!imgLoader ? <View style={CommonStyles.mediaSubViewStyle}>
                        <Text style={CommonStyles.mediaViewTextStyle}>{'VIEW'}</Text>
                    </View> : null}
                    </ImageBackground>
            </TouchableOpacity>
          </View> : null}
            {mediaArray && mediaArray.length>0 ? <View style={styles.mediaUIStyle}>

            <View style={{justifyContent:'space-between',}}>
                
                <FlatList
                  style={styles.flatcontainer}
                  data={mediaArray}
                  showsVerticalScrollIndicator={true}
                  renderItem={renderItem}
                  keyExtractor={(item,index) => index}
                  numColumns={4}
                  key={4}
                />

              </View>

            </View> : null}

            {isLoading === true ? <View style={{minHeight:hp('10%'),width:wp('80%'),justifyContent:'center'}}><ActivityIndicator size="large" color="gray"/></View> : null}

            {status_QID === 'Submitted' && !submittedAnswer ? <View>
            <Text style={CommonStyles.submitQSTNotAnsweredTextStyle}>{Constant.QUESTIONS_NOT_ANSWERED}</Text>
            </View>
             : <View style={{width:wp('80%'), }}>

              {status_QID === 'Submitted' ? null : (mediaType === 'video' ? 
              <View style = {{flexDirection:'row',justifyContent:'space-between'}}>
                <TouchableOpacity disabled = {mediaSize > 1 ? true : false} style={mediaSize > 1 ? [styles.videoBtnDisabledStyle] : [styles.videoBtnStyle]} onPress={() => cameraBtnAction()}>
                  <Text style={styles.btnTextStyle}>{'CAMERA'}</Text>
                </TouchableOpacity>

                <TouchableOpacity disabled = {mediaSize > 1 ? true : false} style={mediaSize > 1 ? [styles.videoBtnDisabledStyle] : [styles.videoBtnStyle]} onPress={() => selectMediaAction()}>
                    <Text style={styles.btnTextStyle}>{'GALLERY'}</Text>
                </TouchableOpacity>
              </View> 

              : 

              <View style = {{flexDirection:'row',justifyContent:'space-between'}}>

                <TouchableOpacity disabled = {mediaSize > 6 ? true : false} style={mediaSize > 1 ? [styles.videoBtnDisabledStyle] : [styles.videoBtnStyle]} onPress={() => cameraBtnAction()}>
                  <Text style={styles.btnTextStyle}>{'CAMERA'}</Text>
                </TouchableOpacity>

                <TouchableOpacity disabled = {mediaSize > 6 ? true : false} style={mediaSize > 1 ? [styles.videoBtnDisabledStyle] : [styles.videoBtnStyle]} onPress={() => selectMediaAction()}>
                    <Text style={styles.btnTextStyle}>{'GALLERY'}</Text>
                </TouchableOpacity>
                
                </View>)}

            </View>}

            {isImageView ? <ImageView
                images={images}
                imageIndex={0}
                visible={isImageView}
                onRequestClose={() => set_isImageView(false)}
            /> : null}

        </View>

    )
}
export default QstMediaUploadComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        alignItems: "center",
        justifyContent: "center",
        width:wp('80%')
    },

    videoBtnStyle : {
        height:hp('5%'),
        width:wp('35%'),
        backgroundColor:'#cbe8b0',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:5,
        marginBottom: hp("2%"),
            
    },

    videoBtnDisabledStyle : {
      height:hp('5%'),
      width:wp('35%'),
      backgroundColor:'#DEEAD0',
      alignItems:'center',
      justifyContent:'center',
      borderRadius:5,
      marginBottom: hp("2%"),
          
  },

    btnTextStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXSmall,
        color:'#778D5E',
    },

    mediaUIStyle : {
      minHeight:hp('8%'),
      width:wp('80%'),
      borderColor:'#D5D5D5',
      borderWidth : 2,
      borderRadius:5,
      borderStyle: 'dashed',
      // alignItems:'center',
      justifyContent:'center',
      marginBottom: hp("2%"),   
  },

    flatcontainer: {
      justifyContent:'space-between',
    },

  name: {
    ...CommonStyles.textStyleSemiBold,
    fontSize: fonts.fontMedium,
    textAlign: "left",
    color: "black",
    flex:1
  },

  imageBtnStyle : {
    width:wp('8%'),
    aspectRatio:1,
    alignSelf:'flex-end',
    marginRight:wp('-1%'),
    justifyContent:'flex-end',
    alignItems:'flex-end',
    
    
  },

  imageBtnStyle1 : {
    width:wp('6%'),
    height:hp('6%'),
    resizeMode:'contain'
  },

  media: {
    width:wp('17%'),
    aspectRatio:1,
    resizeMode:'contain',
    margin:wp('1.3%'),
  },

  mediaVideoBkView: {
    borderRadius : 10
  },

  mainImageStyles : {
    width:wp('25%'),
    aspectRatio : 1,
    resizeMode:'contain',
  },

  viewStyle : {
    width:wp('17%'),
    height:hp('2%'),
    backgroundColor:'#6BC105',
    position:'absolute',
    bottom:0,
    alignItems:'center',
    justifyContent:'center'
  },

  viewTextStyle: {
    ...CommonStyles.textStyleBold,
    fontSize: fonts.fontTiny,
    color:'white',
  },

  videoStyle : {
    width:wp('17%'),
    aspectRatio:1, 
    borderRadius : 5
  },

  videoStyleImg: {
    width:wp('17%'),
    height:hp('7.2%'),
    borderRadius : 5,
    resizeMode:'contain',
  },

  media1: {
    width:wp('17%'),
    aspectRatio:1,
    resizeMode:'contain',
  },
});