import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, FlatList, ImageBackground, ActivityIndicator, NativeModules,Alert } from 'react-native';
import fonts from './../../../../utils/commonStyles/fonts';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
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

import EditMediaImg from "./../../../../../assets/images/otherImages/svg/editMedia.svg";
import FailedImg from "./../../../../../assets/images/otherImages/svg/failedXIcon.svg";
import DefaultPetImg from "./../../../../../assets/images/otherImages/png/defaultDogIcon_dog.png";

var RNFS = require('react-native-fs');

const QstMediaUploadComponent = ({ navigation, value, setValue, setLoaderValue, mediaType, questionImageUrl, defaultPetObj, questionName, questionnaireName, status_QID, viewVideoAction, errorPermissions, submittedAnswer, showiOScamAlert, route, ...props }) => {

  const [mediaArray, set_mediaArray] = useState([]);
  const [optionsArray, set_optionsArray] = useState(['CAMERA', 'GALLERY', 'CANCEL']);
  const [mediaSize, set_mediaSize] = useState(0);
  const [imgLoader, set_imgLoader] = useState(true);
  const [mediaLoader, set_mediaLoader] = useState(false);
  const [isImageView, set_isImageView] = useState(false);
  const [images, set_images] = useState([]);
  const [isLoading, set_isLoading] = useState(false);
  const [petId, set_petId] = useState('');
  const [pName, set_pName] = useState('');
  const [sName, set_sName] = useState('');
  const [deviceNumber, set_deviceNumber] = useState();
  const [setupStatus, set_setupStatus] = useState('XXXXXX');

  let editImgCountRef = useRef(0);
  let actualEditImgCountRef = useRef(0);
  let editedImagesArray = useRef([]);
  let videoArray = [];
  let androidTrimmedVideos = [];
  let cameraTrimmedpath;
  let timmedVideosArray = [];

  useEffect(() => {

    if (Platform.OS === 'android') {
      requestCameraPermission();
    }

    if (value) {
      let tempArray = value//JSON.parse(value);
      set_mediaArray(tempArray);
      set_mediaSize(tempArray.length);
    } else {
      set_mediaArray([]);
    }

    if (status_QID === 'Submitted' && submittedAnswer && submittedAnswer.length > 0) {

      const res = submittedAnswer.split('###');
      let tempArray = res;
      let tempArray1 = [];
      let vidObj = undefined;
      for (let i = 0; i < tempArray.length; i++) {
        vidObj = {
          "id": moment(new Date()).format("YYYYMMDDHHmmss"),
          'filePath': tempArray[i],
          'androidFilePath': tempArray[i],
          'fbFilePath': tempArray[i],
          'fileName': 'QuestFile',
          'qstVideoId': '',
          'localThumbImg': mediaType === 'photo' ? tempArray[i] : undefined,
          'fileType': mediaType,
          "isDeleted": 0,
          "actualFbThumFile": '',
          'thumbFilePath': '',
          'compressedFile': ''
        };

        tempArray1.push(vidObj);
      }

      set_mediaArray(tempArray1);
    }

    prepareFileName();

  }, []);

  const prepareFileName = () => {

    if(defaultPetObj) {
      set_petId(defaultPetObj.petID);
      
      let pName = defaultPetObj.petName.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '');
      pName = pName.length > 15 ? pName.substring(0, 15) : pName;
      set_pName(pName.toLocaleLowerCase());
      let sName = defaultPetObj.studyName.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '');
      sName = sName !== "" ? (sName.length > 20 ? sName.substring(0, 20) : sName) : "NOSTUDY";
      set_sName(sName.toLocaleLowerCase());

      if (defaultPetObj && defaultPetObj.devices && defaultPetObj.devices.length > 0) {
        if (defaultPetObj.devices[0].isDeviceSetupDone) {
          set_setupStatus("Complete");
          set_deviceNumber(defaultPetObj.devices[0].deviceNumber.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, ''));
        } else {
          set_setupStatus("Pending");
          set_deviceNumber(defaultPetObj.devices[0].deviceNumber.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, ''));
        }
      } else {
        set_deviceNumber('NODEVICE');
      }

    }

  };

  const prepareImage = (imgURL) => {
    let img = { uri: imgURL };
    set_images([img]);
    set_isImageView(true);
  }

  const requestCameraPermission = async () => {

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "App Camera Permission",
          message: "App needs access to your camera ",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      } else {
      }
    } catch (err) { }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "App Camera Permission",
          message: "App needs access to your camera ",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      } else {
      }
    } catch (err) { }
  };

  const selectMediaAction = () => {

    editImgCountRef.current = 0;
    actualEditImgCountRef.current = 0;
    editedImagesArray.current = [];
    if (Platform.OS === 'android') {
      if (Platform.Version > 31) {
        chooseImage()
      } else {
        chooseMultipleMedia();
      }
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
      durationLimit: 1200,
      includeExtra: true
    },
      async (response) => {
        if (response && response.errorCode === 'permission') {
          setLoaderValue('');
          set_isLoading(false);
          errorPermissions('galleryNotAllowed');
          return
        }
        if (response && response.assets) {

          let mArray = mediaArray;
          for (let i = 0; i < response.assets.length; i++) {
            if (response.assets[i].type.includes('image')) {

              var dateFile = moment().utcOffset("+00:00").format("MMDDYYHHmmss");
              if (response.assets[i].timestamp) {
                dateFile = moment(response.assets[i].timestamp).utcOffset("+00:00").format("MMDDYYHHmmss");
              }

              let fileName = '';

              if (defaultPetObj) {
                fileName = pName + '_' + petId + '_' + sName + '_' + deviceNumber + '_' + setupStatus + '_' + dateFile + '.jpg';
              }

              fileName = fileName.toLocaleLowerCase();
              let isExists = undefined;
              if (mArray && mArray.length > 0) {

                const isFound = mArray.some(element => {
                  if (element.fileName === fileName) {
                    isExists = true;
                  }

                });

              }

              if (!isExists) {

                let rNumber = await generatRandomNubmer.generateRandomNumber();

                let imgObj = {
                  "id": rNumber,
                  'filePath': response.assets[i].uri,
                  'fbFilePath': '',
                  'fileName': fileName,//response.assets[i].fileName,
                  'qstPhotoId': '',
                  'localThumbImg': response.assets[i].uri,
                  'fileType': 'image',
                  "isDeleted": 0,
                  "actualFbThumFile": '',
                  'thumbFilePath': response.assets[i].uri,
                  'compressedFile': '',
                  'isEdited': false
                };
                mArray.push(imgObj);
              } else {
                createAlert(Constant.OBSERVATION_DUPLICATE_MEDIA_FILE_ERROR);
              }

            }

            if (response.assets[i].type.includes('video')) {

              if(response.assets.length>2){
                createAlert(Constant.UPLAOD_LIMIT_ANDROID_QUEST_VIDEOS)
                set_isLoading(false);
                return;
              }

              let _uri = '';
              _uri = response.assets[i].uri.replace("file:///", "/");

              var dateFile = moment().utcOffset("+00:00").format("MMDDYYHHmmss");
              if (response.assets[i].timestamp) {
                dateFile = moment(response.assets[i].timestamp).utcOffset("+00:00").format("MMDDYYHHmmss");
              }

              let fileName = '';
              if (defaultPetObj) {
                fileName = pName+ '_' + petId + '_' + sName + '_' + deviceNumber + '_' + setupStatus + '_' + dateFile + '_' + '.mp4';

              }

              fileName = fileName.toLocaleLowerCase().replace(/\s+/g, '');
              let isExists = undefined;

              if (mArray && mArray.length > 0) {

                const isFound = mArray.some(element => {

                  if (element.fileName === fileName) {
                    isExists = true;
                  }

                });

              }

              if (isExists) {
                  createAlert(Constant.OBSERVATION_DUPLICATE_MEDIA_FILE_ERROR);
              } else {
                let thumImg = undefined;
                await createThumbnail({ url: response.assets[i].uri, timeStamp: 10000, }).then(response => thumImg = response.path).catch(err => { });
                let rNumber = await generatRandomNubmer.generateRandomNumber();
                let vidObj = {
                  "id": rNumber,
                  'filePath': response.assets[i].uri,
                  'fbFilePath': '',
                  'fileName': fileName,//dateFile+"_&"+response.assets[i].fileName,
                  'qstVideoId': '',
                  'localThumbImg': thumImg,
                  'fileType': 'video',
                  "isDeleted": 0,
                  "actualFbThumFile": '',
                  'thumbFilePath': '',
                  'compressedFile': ''
                };
                androidTrimmedVideos[i] = response.assets[i].uri;
                mArray.splice(0, 0, vidObj);
              }

            }
          }

          setLoaderValue(false);
          set_isLoading(false);
          set_mediaArray(mArray);
          set_mediaSize(mArray.length);
          setValue(mArray);
          //editPhoto(mArray);

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
        mediaType: mediaType === 'photo' ? "image" : "video",
        maxVideoDuration: 1200,
        singleSelectedMode: false,
        selectedColor: '#f9813a',
        maxSelectedAssets: mediaType === 'photo' ? 7 - mediaSize : 2 - mediaSize,
        allowedPhotograph: false,
        allowedVideoRecording: false,
        preventAutomaticLimitedAccessAlert: true,
        isPreview: true,

      });

      if (response) {

        let mArray = mediaArray;
        for (let i = 0; i < response.length; i++) {

          if (response[i].type.includes('image')) {
            let rNumber = await generatRandomNubmer.generateRandomNumber();
            let fileName = '';

            if (defaultPetObj) {
              fileName = pName+ '_' + petId + '_' + sName + '_' + deviceNumber + '_' + setupStatus + '_' + dateFile + '_' + '.jpg';
            }
  
            fileName = fileName.toLocaleLowerCase();

            let imgObj = {
              "id": rNumber,
              'filePath': response[i].path,
              'fbFilePath': '',
              'fileName': fileName,
              'qstPhotoId': '',
              'localThumbImg': response[i].path,
              'fileType': 'image',
              "isDeleted": 0,
              "actualFbThumFile": '',
              "thumbFilePath": response[i].realPath,
              "compressedFile": '',
              'isEdited': false
            };
            mArray.splice(0, 0, imgObj);

          }
          if (response[i].type.includes('video')) {

            let thumImg1 = undefined;
            await createThumbnail({ url: response[i].path, timeStamp: 10000, }).then(response => thumImg1 = response.path)
              .catch(err => { });

            let _uri = '';
            _uri = response[i].realPath.replace("file:///", "/");

            var dateFile = moment().utcOffset("+00:00").format("MMDDYYHHmmss");
            let fileName = '';

            await MediaMeta.get(_uri).then((metadata) => {
              dateFile = moment(metadata.creation_time).utcOffset("+00:00").format("MMDDYYHHmmss");
            }).catch((err) => { });
            let vidObj = undefined;
            let rNumber = await generatRandomNubmer.generateRandomNumber();

            if (defaultPetObj) {
              fileName = pName+ '_' + petId + '_' + sName + '_' + deviceNumber + '_' + setupStatus + '_' + dateFile + '_' + '.mp4';
            }
  
            fileName = fileName.toLocaleLowerCase().replace(/\s+/g, '');

            vidObj = {
              "id": rNumber,
              'filePath': response[i].realPath,
              'fbFilePath': '',
              'fileName': fileName,
              'qstVideoId': '',
              'localThumbImg': thumImg1,
              'fileType': 'video',
              "isDeleted": 0,
              "actualFbThumFile": '',
              'thumbFilePath': response[i].path,
              'compressedFile': ''
            };
            mArray.push(vidObj);

          }

        }
        set_mediaArray(mArray);
        set_mediaSize(mArray.length);
        setValue(mArray);
        setLoaderValue(false);
        set_isLoading(false)
        //editPhoto(mArray);
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
        promise.then(async function (result) {

          if (response.assets[0].type.includes('video')) {

            let thumImg = undefined;
            await createThumbnail({ url: response.assets[0].uri, timeStamp: 10000, }).then(response => thumImg = response.path)
              .catch(err => { });

            var dateFile = moment().utcOffset("+00:00").format("MMDDYYHHmmss");

            let fileName = '';

            if (defaultPetObj) {
              fileName = pName+ '_' + petId + '_' + sName + '_' + deviceNumber + '_' + setupStatus + '_' + dateFile + '_' + '.mp4';
            }

            fileName = fileName.toLocaleLowerCase();
            let rNumber = await generatRandomNubmer.generateRandomNumber();
            let vidObj = {
              "id": rNumber,
              'filePath': response.assets[0].uri,
              'fbFilePath': '',
              'fileName': fileName,//dateFile+"_&"+response.assets[i].fileName,
              'qstVideoId': '',
              'localThumbImg': thumImg,
              'fileType': 'video',
              "isDeleted": 0,
              "actualFbThumFile": '',
              'thumbFilePath': '',
              'compressedFile': '',

            };

            mArray.splice(0, 0, vidObj);
            set_mediaArray(mArray);
            set_mediaSize(mArray.length);
            setValue(mArray);
            setLoaderValue(false);

          }

        }).catch(function (error) { setLoaderValue(false); });

        if (response.assets[0].type.includes('image')) {

          var dateFile = moment().utcOffset("+00:00").format("MMDDYYHHmmss");
          let fileName = '';

          if (defaultPetObj) {
          
            fileName = pName+ '_' + petId + '_' + sName + '_' + deviceNumber + '_' + setupStatus + '_' + dateFile + '_' + '.jpg';

          }

          fileName = fileName.toLocaleLowerCase();
          let imgObj = {
            "id": moment(new Date()).format("YYYYMMDDHHmmss") + response.assets[0].fileName.replace('/r', '/'),
            'filePath': response.assets[0].uri,
            'fbFilePath': '',
            'fileName': fileName,//dateFile+"_&"+response.assets[i].fileName,
            'qstPhotoId': '',
            'localThumbImg': response.assets[0].uri,
            'fileType': 'image',
            "isDeleted": 0,
            "actualFbThumFile": '',
            'thumbFilePath': response.assets[0].uri,
            'compressedFile': '',
            'isEdited': false
          };

          mArray.splice(0, 0, imgObj);
          set_mediaArray(mArray);
          set_mediaSize(mArray.length);
          setValue(mArray);
          setLoaderValue(false);
          //editPhoto(mArray);
        }

      }

    });

  };

  const cameraBtnAction = async () => {

    editImgCountRef.current = 0;
    actualEditImgCountRef.current = 0;
    editedImagesArray.current = [];
    if (Platform.OS === 'ios') {

      let camPermissions = await DataStorageLocal.getDataFromAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED);
      if (camPermissions && camPermissions === 'isFirstTime') {
        await DataStorageLocal.saveDataToAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED, 'existingUser');
        openCamera();
      } else {

        let permissions = await PermissionsiOS.checkCameraPermissions();
        if (!permissions) {
          showiOScamAlert();
          return
        } else {
          openCamera();
        }

      }

    } else {

      let androidPer = await CheckPermissionsAndroid.checkCameraPermissions();
      if (androidPer === 'Camera not granted') {
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

  const createAlert = (alertmsg) =>
    Alert.alert('Info', alertmsg, [
      {text: 'OK', onPress: () => {}},
    ]);

  const actionOnRow = (item) => {
    if (item.fileType === 'photo') {
      if (item.filePath !== '') {
        // let img = {uri : item.filePath};
        // set_images([img]);
        // set_isImageView(true);
        prepareImage(item.filePath);
      }

    } else {
      if (item.fbFilePath !== '') {
        viewAction(item);
      }

    }
  };

  const viewAction = async (item) => {
    viewVideoAction(item)
  };

  const addEditedImg = async (uri, iArray) => {

    let isEdit = iArray[editImgCountRef.current].isEdited;

    if (uri && !isEdit) {

      let fileName = iArray[editImgCountRef.current].id;
      let newPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      RNFS.copyFile(uri, newPath).then((success) => {

        setTimeout(() => {
          PhotoEditor.Edit({
            path: newPath,
            // colors : ['#000000', '#808080', '#a9a9a9'],
            hiddenControls: ['share', 'sticker'],
            onDone: imagePath => {

              let imgObj = {
                "id": iArray[editImgCountRef.current].id,
                'filePath': imagePath,
                'fbFilePath': '',
                'fileName': iArray[editImgCountRef.current].fileName,
                'qstPhotoId': '',
                'localThumbImg': iArray[editImgCountRef.current].localThumbImg,
                'fileType': 'image',
                "isDeleted": 0,
                "actualFbThumFile": '',
                'thumbFilePath': iArray[editImgCountRef.current].thumbFilePath,
                'compressedFile': '',
                'isEdited': true
              };
              editedImagesArray.current.push(imgObj);
              editImgCountRef.current = editImgCountRef.current + 1;
              if (editImgCountRef.current < actualEditImgCountRef.current) {
                addEditedImg(iArray[editImgCountRef.current].filePath, iArray);
              } else {

                let tempArray = [...editedImagesArray.current]
                set_mediaArray(tempArray);
                set_mediaSize(tempArray.length);
                setValue(tempArray);

              }

            },
            onCancel: () => {

              let imgObj = {
                "id": iArray[editImgCountRef.current].id,
                'filePath': iArray[editImgCountRef.current].filePath,
                'fbFilePath': '',
                'fileName': iArray[editImgCountRef.current].fileName,
                'qstPhotoId': '',
                'localThumbImg': iArray[editImgCountRef.current].localThumbImg,
                'fileType': 'image',
                "isDeleted": 0,
                "actualFbThumFile": '',
                'thumbFilePath': iArray[editImgCountRef.current].thumbFilePath,
                'compressedFile': '',
                'isEdited': true
              };

              editedImagesArray.current.push(imgObj);
              editImgCountRef.current = editImgCountRef.current + 1;
              if (editImgCountRef.current < actualEditImgCountRef.current) {
                addEditedImg(iArray[editImgCountRef.current].filePath, iArray);
              } else {

                let tempArray = [...editedImagesArray.current]
                set_mediaArray(tempArray);
                set_mediaSize(tempArray.length);
                setValue(tempArray);
              }
            }
          });
        }, 700,
        );

      }).catch((err) => { });

    } else {

      editedImagesArray.current.push(iArray[editImgCountRef.current]);
      editImgCountRef.current = editImgCountRef.current + 1;
      if (editImgCountRef.current < actualEditImgCountRef.current) {
        addEditedImg(iArray[editImgCountRef.current].filePath, iArray);
      } else {
        let tempArray = [...editedImagesArray.current,]
        set_mediaArray(tempArray);
        set_mediaSize(tempArray.length);
        setValue(tempArray);
        return;
      }
    }

  };

  const moveToPhotoEditor = async (item, index) => {
    if (item && item.fileType === 'image') {
      let fileName = item.filePath.split('/').pop();
      let newPath = `${RNFS.DocumentDirectoryPath}/${fileName + Date.now()}`;
      RNFS.copyFile(item.filePath, newPath).then((success) => {
        PhotoEditor.Edit({
          path: newPath,
          hiddenControls: ['share', 'sticker'],
          onDone: imagePath => {
            let imgObj = {
              "id": item.id,
              'filePath': imagePath,
              'fbFilePath': '',
              'fileName': item.fileName,
              'qstPhotoId': '',
              'localThumbImg': item.localThumbImg,
              'fileType': 'image',
              "isDeleted": 0,
              "actualFbThumFile": '',
              'thumbFilePath': item.thumbFilePath,
              'compressedFile': '',
              'isEdited': false
            };
            mediaArray[index] = imgObj
            set_mediaArray(mediaArray)
          },
          onCancel: () => {
            let imgObj = {
              "id": moment(new Date()).format("YYYYMMDDHHmmss") + item.filePath.replace('/r', '/'),
              'filePath': item.filePath,
              'fbFilePath': '',
              'fileName': item.fileName,
              'qstPhotoId': '',
              'localThumbImg': item.localThumbImg,
              'fileType': 'image',
              "isDeleted": 0,
              "actualFbThumFile": '',
              'thumbFilePath': item.thumbFilePath,
              'compressedFile': '',
              'isEdited': false
            };

            mediaArray[index] = imgObj
            set_mediaArray(mediaArray)
          }
        });

      }).catch((err) => {});
    }
    else if (item && item.fileType === 'video') {
      if (Platform.OS === 'android') {
        let fileName = item.filePath.split('/').pop();
        let newPath = `${RNFS.DocumentDirectoryPath}/${"obs_video_"+Date.now() +'.mp4'}`;
        RNFS.copyFile(item.filePath, newPath).then((success) => {
          newPath = 'file://' + newPath;
          NativeModules.K4lVideoTrimmer.navigateToTrimmer(newPath, "10", (convertedVal) => {
            convertedVal = convertedVal.replace("[", "");
            convertedVal = convertedVal.replace("]", "");
            timmedVideosArray = convertedVal.split(",");
  
            let vidObj = {
              "id": item.id,
              'filePath': timmedVideosArray[0],
              'fbFilePath': '',
              'fileName': item.fileName,
              'qstVideoId': '',
              'localThumbImg': item.localThumbImg,
              'fileType': 'video',
              "isDeleted": 0,
              "actualFbThumFile": '',
              'thumbFilePath': item.thumbFilePath,
              'compressedFile': '',
            };
  
            mediaArray[index] = vidObj
            set_mediaArray(mediaArray)
          });

        }).catch((err) => {}); 
       
      }
      else if (Platform.OS === 'ios') {
        let vArray = [];
        vArray.push(item.filePath)
        let fileName = item.filePath.split('/').pop();
        if (Platform.OS === 'ios') {
          let myPromise = new Promise(function (resolve) {
            NativeModules.ChangeViewBridge.changeToNativeView(
              vArray,
              eventId => {
                resolve(eventId);
              },
            );
          });
          videoArray = await myPromise;
          let updateFilePath = item.filePath
          if (videoArray[0].startsWith("file://")) {
            updateFilePath = videoArray[0];
          }
          else {
            updateFilePath = 'file://' + videoArray[0];
          }

          let vidObj = {
            "id": item.id,
            'filePath': updateFilePath,
            'fbFilePath': '',
            'fileName': fileName,
            'qstVideoId': '',
            'localThumbImg': item.localThumbImg,
            'fileType': 'video',
            "isDeleted": 0,
            "actualFbThumFile": '',
            'thumbFilePath': item.thumbFilePath,
            'compressedFile': '',
          };

          mediaArray[index] = vidObj
          set_mediaArray(mediaArray)
        }
      }
    }

  };

  const renderItem = ({ item, index }) => {
    return (
      <>
        <TouchableOpacity disabled={true} >

          {mediaArray.length > 0 && mediaArray[index].fileType === 'video' ? (mediaArray[index].localThumbImg ?

            <TouchableOpacity disabled={status_QID === 'Submitted' ? false : true} onPress={() => actionOnRow(item)}>
              <View style={styles.flatview}>
                <Text numberOfLines={2} style={[styles.name]}>{item.fileName}</Text>
                <ImageBackground source={{ uri: mediaArray[index].localThumbImg }} style={styles.media} imageStyle={{ borderRadius: 5 }} onLoadStart={() => set_mediaLoader(true)} onLoadEnd={() => { set_mediaLoader(false) }} >
                  {mediaLoader ? <ActivityIndicator size="small" color="gray" /> : null}
                  {status_QID === 'Submitted' ? null : <TouchableOpacity style={Platform.isPad ? [styles.imageBtnStyle, { marginTop: hp('-2.5%'), }] : [styles.imageBtnStyle, { marginTop: hp('-1%'), }]} onPress={() => removeMedia(item.fileName)}>
                    <FailedImg width={wp('4.5%')} height={hp('4.5%')}/>
                  </TouchableOpacity>}

                  {status_QID === 'Submitted' ? <View style={styles.viewStyle}>
                    <Text style={styles.viewTextStyle}>{'VIEW'}</Text>
                  </View> : null}

                </ImageBackground>
                <TouchableOpacity onPress={() => moveToPhotoEditor(item, index)}>
                  <EditMediaImg style={styles.editMedia}/>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            :
            <TouchableOpacity disabled={status_QID === 'Submitted' ? false : true} onPress={() => actionOnRow(item)}>

              <View style={styles.media}>

                {Platform.OS === 'ios' ? <Video
                  source={{ uri: item.filePath }}
                  rate={1.0}
                  volume={1.0}
                  muted={true}
                  paused={true}
                  resizeMode={"cover"}
                  // repeat = {isLoading}
                  style={styles.videoStyle}
                  controls={false}
                  fullscreen={false}
                  fullscreenOrientation={'portrait'}
                  onLoad={set_isLoading(true)}
                  onLoadEnd={set_isLoading(false)}
                // onLoadStart = {set_isLoading(false)}
                // poster={photoURL}

                /> : <View style={styles.media1}><ImageBackground source={DefaultPetImg} style={styles.videoStyleImg} /></View>}

                {status_QID === 'Submitted' ? <View style={styles.viewStyle}>
                  <Text style={styles.viewTextStyle}>{'VIEW'}</Text>
                </View> : null}

              </View>
            </TouchableOpacity>

          ) : (mediaArray.length > 0 && mediaArray[index].filePath && mediaArray[index].filePath !== '' ?
            <TouchableOpacity disabled={status_QID === 'Submitted' ? false : true} onPress={() => actionOnRow(item)}>
              {status_QID === 'Submitted' ?
                <ImageBackground source={{ uri: Platform.OS === 'ios' ? mediaArray[index].filePath : mediaArray[index].localThumbImg }} style={styles.media} imageStyle={{ borderRadius: 5 }} onLoadStart={() => set_mediaLoader(true)} onLoadEnd={() => { set_mediaLoader(false) }} >
                  {mediaLoader ? <ActivityIndicator size="small" color="gray" /> : null}
                  {status_QID === 'Submitted' ? null : <TouchableOpacity style={Platform.isPad ? [styles.imageBtnStyle, { marginTop: hp('-2.5%'), }] : [styles.imageBtnStyle, { marginTop: hp('-1%'), }]} onPress={() => removeMedia(item.fileName)}>
                    <FailedImg width={wp('4.5%')} height={hp('4.5%')}/>
                  </TouchableOpacity>}

                  {status_QID === 'Submitted' ? <View style={styles.viewStyle}>
                    <Text style={styles.viewTextStyle}>{'VIEW'}</Text>
                  </View> : null}

                </ImageBackground> :
                <View style={styles.flatview}>

                  <Text numberOfLines={2} style={[styles.name]}>{item.fileName}</Text>
                  <ImageBackground source={{ uri: Platform.OS === 'ios' ? mediaArray[index].filePath : mediaArray[index].localThumbImg }} style={styles.media} imageStyle={{ borderRadius: 5 }} onLoadStart={() => set_mediaLoader(true)} onLoadEnd={() => { set_mediaLoader(false) }} >
                    {mediaLoader ? <ActivityIndicator size="small" color="gray" /> : null}
                    {status_QID === 'Submitted' ? null : <TouchableOpacity style={Platform.isPad ? [styles.imageBtnStyle, { marginTop: hp('-2.5%'), }] : [styles.imageBtnStyle, { marginTop: hp('-1%'), }]} onPress={() => removeMedia(item.fileName)}>
                      <FailedImg width={wp('4.5%')} height={hp('4.5%')}/>
                    </TouchableOpacity>}

                    {status_QID === 'Submitted' ? <View style={styles.viewStyle}>
                      <Text style={styles.viewTextStyle}>{'VIEW'}</Text>
                    </View> : null}

                  </ImageBackground>

                  <TouchableOpacity onPress={() => moveToPhotoEditor(item, index)}>
                    <EditMediaImg style={styles.editMedia}/>
                  </TouchableOpacity>
                </View>}



            </TouchableOpacity>
            :
            <TouchableOpacity disabled={status_QID === 'Submitted' ? false : true} onPress={() => actionOnRow(item)}>
              <ImageBackground source={{ uri: mediaArray[index].fbFilePath }} style={styles.media} imageStyle={{ borderRadius: 5 }} onLoadStart={() => set_mediaLoader(true)} onLoadEnd={() => { set_mediaLoader(false) }}>
                {mediaLoader ? <ActivityIndicator size='small' color="gray" /> : null}
                {status_QID === 'Submitted' ? null : <TouchableOpacity style={Platform.isPad ? [styles.imageBtnStyle, { marginTop: hp('-2.5%'), }] : [styles.imageBtnStyle, { marginTop: hp('-1%'), }]} onPress={() => removeMedia(item.fileName)}>
                  <FailedImg width={wp('4.5%')} height={hp('4.5%')}/>
                </TouchableOpacity>}

              </ImageBackground>
            </TouchableOpacity>
          )
          }

        </TouchableOpacity>
      </>
    )
  }

  return (

    <View style={styles.container}>

      {questionImageUrl ? <View>
        <TouchableOpacity onPress={() => prepareImage(questionImageUrl)}>
          <ImageBackground source={{ uri: questionImageUrl }} style={[CommonStyles.questImageStyles]} imageStyle={{ borderRadius: 10 }}
            onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => { set_imgLoader(false) }}>
            {imgLoader ? <ActivityIndicator size="large" color="gray" /> : null}
            {!imgLoader ? <View style={CommonStyles.mediaSubViewStyle}>
              <Text style={CommonStyles.mediaViewTextStyle}>{'VIEW'}</Text>
            </View> : null}
          </ImageBackground>
        </TouchableOpacity>
      </View> : null}
      {mediaArray && mediaArray.length > 0 ? <View style={styles.mediaUIStyle}>

        <View style={{ justifyContent: 'space-between', }}>

          {status_QID === 'Submitted' ?
            <FlatList
              style={styles.flatcontainer}
              data={mediaArray}
              showsVerticalScrollIndicator={true}
              renderItem={renderItem}
              keyExtractor={(item, index) => index}
              numColumns={4}
              key={4}
            />

            :
            <FlatList
              style={styles.flatcontainer}
              data={mediaArray}
              showsVerticalScrollIndicator={true}
              renderItem={renderItem}
              keyExtractor={(item, index) => index}
            />
          }
        </View>

      </View> : null}

      {isLoading === true ? <View style={{ minHeight: hp('10%'), width: wp('80%'), justifyContent: 'center' }}><ActivityIndicator size="large" color="gray" /></View> : null}

      {status_QID === 'Submitted' && !submittedAnswer ? <View>
        <Text style={CommonStyles.submitQSTNotAnsweredTextStyle}>{Constant.QUESTIONS_NOT_ANSWERED}</Text>
      </View>
        : <View style={{ width: wp('80%'), }}>

          {status_QID === 'Submitted' ? null : (mediaType === 'video' ?
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity disabled={mediaSize > 1 ? true : false} style={mediaSize > 1 ? [styles.videoBtnDisabledStyle] : [styles.videoBtnStyle]} onPress={() => cameraBtnAction()}>
                <Text style={styles.btnTextStyle}>{'CAMERA'}</Text>
              </TouchableOpacity>

              <TouchableOpacity disabled={mediaSize > 1 ? true : false} style={mediaSize > 1 ? [styles.videoBtnDisabledStyle] : [styles.videoBtnStyle]} onPress={() => selectMediaAction()}>
                <Text style={styles.btnTextStyle}>{'GALLERY'}</Text>
              </TouchableOpacity>
            </View>

            :

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

              <TouchableOpacity disabled={mediaSize > 6 ? true : false} style={mediaSize > 1 ? [styles.videoBtnDisabledStyle] : [styles.videoBtnStyle]} onPress={() => cameraBtnAction()}>
                <Text style={styles.btnTextStyle}>{'CAMERA'}</Text>
              </TouchableOpacity>

              <TouchableOpacity disabled={mediaSize > 6 ? true : false} style={mediaSize > 1 ? [styles.videoBtnDisabledStyle] : [styles.videoBtnStyle]} onPress={() => selectMediaAction()}>
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
    width: wp('80%')
  },

  videoBtnStyle: {
    height: hp('5%'),
    width: wp('35%'),
    backgroundColor: '#cbe8b0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: hp("2%"),

  },

  videoBtnDisabledStyle: {
    height: hp('5%'),
    width: wp('35%'),
    backgroundColor: '#DEEAD0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: hp("2%"),

  },

  btnTextStyle: {
    ...CommonStyles.textStyleBold,
    fontSize: fonts.fontXSmall,
    color: '#778D5E',
  },

  mediaUIStyle: {
    minHeight: hp('8%'),
    width: wp('80%'),
    borderColor: '#D5D5D5',
    borderWidth: 2,
    borderRadius: 5,
    borderStyle: 'dashed',
    // alignItems:'center',
    justifyContent: 'center',
    marginBottom: hp("2%"),
  },

  flatcontainer: {
    justifyContent: 'space-between',
  },

  name: {
    ...CommonStyles.textStyleSemiBold,
    fontSize: fonts.fontMedium,
    textAlign: "left",
    color: "black",
    flex: 1
  },

  imageBtnStyle: {
    width: wp('8%'),
    aspectRatio: 1,
    alignSelf: 'flex-end',
    marginRight: wp('-1%'),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  
  media: {
    width: wp('12%'),
    aspectRatio: 1,
    resizeMode: 'contain',
    margin: wp('1.3%'),
  },

  mediaVideoBkView: {
    borderRadius: 10
  },

  mainImageStyles: {
    width: wp('25%'),
    aspectRatio: 1,
    resizeMode: 'contain',
  },

  viewStyle: {
    width: wp('15%'),
    height: hp('2%'),
    backgroundColor: '#6BC105',
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },

  viewTextStyle: {
    ...CommonStyles.textStyleBold,
    fontSize: fonts.fontTiny,
    color: 'white',
  },

  videoStyle: {
    width: wp('15%'),
    aspectRatio: 1,
    borderRadius: 5
  },

  videoStyleImg: {
    width: wp('17%'),
    height: hp('7.2%'),
    borderRadius: 5,
    resizeMode: 'contain',
  },

  media1: {
    width: wp('17%'),
    aspectRatio: 1,
    resizeMode: 'contain',
  },

  flatview: {
    minHeight: hp("8%"),
    alignSelf: "center",
    justifyContent: "center",
    borderBottomColor: "grey",
    borderBottomWidth: wp("0.1%"),
    width: wp('70%'),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  editMedia: {
    width: wp('7%'),
    aspectRatio: 1,
    marginLeft: wp('2%'),
    resizeMode: 'contain'
  },
});