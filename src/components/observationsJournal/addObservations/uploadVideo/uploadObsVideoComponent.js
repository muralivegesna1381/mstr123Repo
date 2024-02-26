import React, { useState, useEffect, useRef } from 'react';
import { BackHandler, Platform, NativeModules } from 'react-native';
import UploadObsVideoUI from './uploadObsVideoUI';
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import * as DataStorageLocal from "./../../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../../utils/constants/constant";
import * as ImagePicker from 'react-native-image-picker';
import MediaMeta from "react-native-media-meta";
import CameraRoll from "@react-native-community/cameraroll";
import { createThumbnail } from "react-native-create-thumbnail";
import moment from 'moment';
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import PhotoEditor from 'react-native-photo-editor'
import * as PermissionsiOS from './../../../../utils/permissionsComponents/permissionsiOS';
import * as CheckPermissionsAndroid from './../../../../utils/permissionsComponents/permissionsAndroid';
import Highlighter from "react-native-highlight-words";
import DeviceInfo from "react-native-device-info";

var RNFS = require('react-native-fs');

let trace_inMediaSelection;
const POPUP_DELETE = 1;

const UploadObsVideoComponent = ({ navigation, route, ...props }) => {

  const [selectedPet, set_selectedPet] = useState(undefined);
  const [isLoading, set_isLoading] = useState(false);
  const [loaderMsg, set_loaderMsg] = useState(false);
  const [videoPath, set_videoPath] = useState(undefined);
  const [isMediaSelection, set_isMediaSelection] = useState(false);

  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [popUpleftBtnEnable, set_popUpleftBtnEnable] = useState(true);
  const [date, set_Date] = useState(new Date());
  const [obsObject, set_obsObject] = useState(undefined);
  const [optionsArray, set_optionsArray] = useState(['CAMERA', 'GALLERY', 'CANCEL']);
  const [mediaSize, set_mediaSize] = useState(0);
  const [mediaArray, set_mediaArray] = useState([]);
  const [isEdit, set_isEdit] = useState(false);
  const [popId, set_PopId] = useState(undefined)
  const [mediaType, set_mediaType] = useState(undefined);

  let deleteSelectedMediaFile = useRef(undefined);
  let deletedMediaArray = useRef([]);
  let popIdRef = useRef(0);
  let editImgCountRef = useRef(0);
  let actualEditImgCountRef = useRef(0);
  let editedImagesArray = useRef([]);
  let videoArray = [];
  let timmedVideosArray = [];
  let cameraTrimmedpath;

  React.useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    if (Platform.OS === 'android') {
      requestCameraPermission();
    }
    getObsDetails();

    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      observationsMediaSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_add_observations_media);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_add_observations_media, "User in Add Observations Media selection Screen", '');
      deleteMedia();
    });

    const unsubscribe = navigation.addListener('blur', () => {
      observationsMediaSessionStop();
    });

    return () => {
      observationsMediaSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      focus();
      unsubscribe();
    };

  }, []);

  const observationsMediaSessionStart = async () => {
    trace_inMediaSelection = await perf().startTrace('t_inAdd_Observation_MediaSelection');
  };

  const observationsMediaSessionStop = async () => {
    await trace_inMediaSelection.stop();
  };

  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  const getObsDetails = async () => {

    let oJson = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
    oJson = JSON.parse(oJson);
    if (oJson) {
      set_obsObject(oJson);
      set_selectedPet(oJson.selectedPet);
      set_isEdit(oJson.isEdit);
      // set_fromScreen(oJson.fromScreen);
      set_mediaType(oJson.ctgNameId);
      if (oJson && oJson.mediaArray) {
        set_mediaArray(oJson.mediaArray);
        set_mediaSize(oJson.mediaArray.length);
      } else {
        set_mediaArray([]);
      }
    }
  };

  const requestCameraPermission = async () => {

    let androidPer = await CheckPermissionsAndroid.checkCameraPermissions();

    if (androidPer === 'Camera not granted') {
      let high = <Highlighter highlightStyle={{ fontWeight: "bold", }}
        searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED_ANDROID]}
        textToHighlight={
          Constant.CAMERA_PERMISSION_MSG_ANDROID
        } />

      createPopup(high, Constant.ALERT_DEFAULT_TITLE, false, true, 1);
      return;
    }

  };

  const deleteMedia = async () => {

    let delMedia = await DataStorageLocal.getDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
    delMedia = JSON.parse(delMedia);

    if (delMedia) {
      set_mediaArray(delMedia);
    }

  };

  const submitAction = async () => {

    if (obsObject) {
      obsObject.mediaArray = mediaArray
    }
    firebaseHelper.logEvent(firebaseHelper.event_add_observations_media_submit, firebaseHelper.screen_add_observations_media, "User selected Media ", 'No of Media : ' + mediaArray.length);
    await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ, JSON.stringify(obsObject));
    navigation.navigate("ObsReviewComponent", { deletedMedia: deletedMediaArray.current });

  };

  const navigateToPrevious = () => {

    if (popIdRef.current === 0) {
      navigation.pop();
    }

  };

  const selectMediaAction = async () => {

    if (mediaType === 0 ? mediaSize < 7 : mediaSize < 5) {
      set_optionsArray(['CAMERA', 'GALLERY', 'CANCEL']);
      set_isMediaSelection(!isMediaSelection);
    } else {
      let pMsg = mediaType === 0 ? Constant.MAX_PHOTOS_PERMITTED : Constant.MAX_VIDEOS_PERMITTED
      createPopup(pMsg, Constant.FAIL_MSG_ALERT, false, true, 1);
    }

  };

  const chooseImage = () => {

    ImagePicker.launchImageLibrary({
      mediaType: mediaType === 0 ? 'photo' : 'video',
      includeBase64: false,
      selectionLimit: mediaType === 0 ? 7 - mediaSize : 5 - mediaSize,
      durationLimit: 1200,
      includeExtra: true,
    },
      async (response) => {

        if (response && response.errorCode === 'permission') {
          set_loaderMsg('');
          set_isLoading(false);
          let high = <Highlighter highlightStyle={{ fontWeight: "bold", }}
            searchWords={[Constant.GALLERY_PERMISSION_MSG_HIGHLIGHTED]}
            textToHighlight={
              Constant.GALLERY_PERMISSION_MSG
            } />

          createPopup(high, Constant.ALERT_DEFAULT_TITLE, false, true, 1);
          return
        }
        if (response.didCancel) {
          set_loaderMsg('');
          set_isLoading(false);
        } else if (response.error) {
          set_loaderMsg('');
          set_isLoading(false);
        } else {
          set_loaderMsg('');
          set_isLoading(false);
          if (response && response.assets) {

            actualEditImgCountRef.current = response.assets.length;
            let mArray = mediaArray;
            
            for (let i = 0; i < response.assets.length; i++) {

              if (response.assets[i].type.includes('image')) {

                let isExists = undefined;
                if (mArray && mArray.length > 0) {

                  const isFound = mArray.some(element => {
                    if (element.fileName === response.assets[i].fileName) {
                      isExists = true;
                    }
                  });

                }

                if (isExists) {

                } else {

                  var dateFile = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss");
                  if (response.assets[i].timestamp) {
                    dateFile = moment(response.assets[i].timestamp).utcOffset("+00:00").format("MMDDYYYYHHmmss");
                  }

                  let fileName = '';
                  if (selectedPet && selectedPet.devices && selectedPet.devices.length > 0) {
                    let pName = selectedPet.petName.length > 15 ? selectedPet.petName.substring(0, 15) : selectedPet.petName;
                    let sName = selectedPet.studyName.length > 20 ? selectedPet.studyName.substring(0, 20) : selectedPet.studyName;
                    let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0, 15) : obsObject.behaviourItem.behaviorName;
                    if (selectedPet.devices[0].isDeviceSetupDone) {
                      fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPet.devices[0].deviceNumber + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + i + '.jpg';
                    } else {
                      fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + "_SETUP_PENDING" + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + i + '.jpg';
                    }
                  } else {

                    let pName = selectedPet.petName.length > 15 ? selectedPet.petName.substring(0, 15) : selectedPet.petName;
                    let sName = selectedPet.studyName.length > 20 ? selectedPet.studyName.substring(0, 20) : selectedPet.studyName;
                    let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0, 15) : obsObject.behaviourItem.behaviorName;
                    fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + 'NO_DEVICE' + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + i + '.jpg';

                  }

                  let imgObj = {
                    'filePath': response.assets[i].uri,
                    'fbFilePath': '',
                    'fileName': fileName,//response.assets[i].fileName,
                    'observationPhotoId': '',
                    'localThumbImg': response.assets[i].uri,
                    'fileType': 'image',
                    "isDeleted": 0,
                    "actualFbThumFile": '',
                    'thumbFilePath': '',
                    'compressedFile': '',
                    'isEdited': false,
                    'fileDate': dateFile.toString()
                  };

                  mArray.push(imgObj);
                }

              }

              if (response.assets[i].type.includes('video')) {

                let _uri = '';
                _uri = response.assets[i].uri.replace("file:///", "/");
                //Checking if User has uplaoded more than selection limit
                //Adding this condition only for android 13 and above 
                if (response.assets.length > 5) {
                  let high = <Highlighter highlightStyle={{ fontWeight: "bold", }}
                    searchWords={[Constant.UPLAOD_LIMIT_ANDROID_VIDEOS]}
                    textToHighlight={
                      Constant.UPLAOD_LIMIT_ANDROID_VIDEOS
                    } />
                  createPopup(high, Constant.ALERT_DEFAULT_TITLE, false, true, 1);
                  return;
                }
                var vStartDate = null;
                var vEndDate = null;
                var dateFile = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss");
                if (response.assets[i].timestamp) {
                  dateFile = moment(response.assets[i].timestamp).utcOffset("+00:00").format("MMDDYYYYHHmmss");
                }

                if (response.assets[i].timestamp) {
                  vStartDate = moment(response.assets[i].timestamp).utcOffset("+00:00").format("MMDDYYYYHHmmss");
                }
                if (response.assets[i].duration) {
                  var tempDate = new Date(response.assets[i].timestamp);
                  if (tempDate && tempDate !== '') {
                    tempDate.setSeconds(tempDate.getSeconds() + response.assets[i].duration)
                    vEndDate = moment(new Date(tempDate)).utcOffset("+00:00").format("MMDDYYYYHHmmss");
                  }

                }
                let fileName = '';

                if (selectedPet && selectedPet.devices && selectedPet.devices.length > 0) {
                  let pName = selectedPet.petName.length > 15 ? selectedPet.petName.substring(0, 15) : selectedPet.petName;
                  let sName = selectedPet.studyName.length > 20 ? selectedPet.studyName.substring(0, 20) : selectedPet.studyName;
                  let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0, 15) : obsObject.behaviourItem.behaviorName;
                  if (selectedPet.devices[0].isDeviceSetupDone) {
                    fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPet.devices[0].deviceNumber + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + i + '.mp4';
                  } else {
                    fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPet.devices[0].deviceNumber + "_SETUP_PENDING" + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + i + '.mp4';
                  }
                } else {

                  let pName = selectedPet.petName.length > 15 ? selectedPet.petName.substring(0, 15) : selectedPet.petName;
                  let sName = selectedPet.studyName.length > 20 ? selectedPet.studyName.substring(0, 20) : selectedPet.studyName;
                  let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0, 15) : obsObject.behaviourItem.behaviorName;
                  fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + 'NO_DEVICE' + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + i + '.mp4';

                }

                let isExists = undefined;
                if (mArray && mArray.length > 0) {

                  const isFound = mArray.some(element => {
                    let spliTArray = element.fileName.split('_#');
                    if (spliTArray[1] === response.assets[i].fileName) {
                      isExists = true;
                    }
                  });

                }

                if (isExists) {

                } else {
                  let thumImg = undefined;
                  await createThumbnail({ url: response.assets[i].uri, timeStamp: 10000, }).then(response => thumImg = response.path).catch(err => { });

                  //for android picker returns content path, so converting to real path
                  if (Platform.OS === 'android') {
                    let newPath = `${RNFS.DocumentDirectoryPath}/${"obs_video_" + Date.now() + '.mp4'}`;
                    RNFS.copyFile(response.assets[i].uri, newPath).then((success) => {
                      newPath = 'file://' + newPath;
                      let vidObj = {
                        'filePath': newPath,
                        'fbFilePath': '',
                        'fileName': fileName,
                        'observationVideoId': '',
                        'localThumbImg': thumImg,
                        'fileType': 'video',
                        "isDeleted": 0,
                        "actualFbThumFile": '',
                        'thumbFilePath': '',
                        'compressedFile': '',
                        "videoStartDate": vStartDate,
                        "videoEndDate": vEndDate,
                      };

                      timmedVideosArray[i] = newPath;
                      //mArray.splice(0, 0, vidObj);
                      mArray.push(vidObj)
                      set_mediaArray(null)
                      set_mediaArray(mArray);
                    }).catch((err) => {});
                  } else {
                    let vidObj = {
                      'filePath': response.assets[i].uri,
                      'fbFilePath': '',
                      'fileName': fileName,
                      'observationVideoId': '',
                      'localThumbImg': thumImg,
                      'fileType': 'video',
                      "isDeleted": 0,
                      "actualFbThumFile": '',
                      'thumbFilePath': '',
                      'compressedFile': '',
                      "videoStartDate": vStartDate,
                      "videoEndDate": vEndDate,
                    };
                    timmedVideosArray[i] = response.assets[i].uri;
                    //mArray.splice(0, 0, vidObj);
                    mArray.push(vidObj)
                    set_mediaArray(null)
                    set_mediaArray(mArray);
                  }

                }

              }
            }

            //editPhoto(mArray)
            set_mediaSize(mediaSize + actualEditImgCountRef.current)
          } else {
            set_loaderMsg('');
            set_isLoading(false);
          }

        }

      },)

  };

  const chooseCamera = async (value) => {

    let vStartDate = null;
    let vEndDate = null;

    let options = {
      mediaType: value,
      durationLimit: 1200,
      videoQuality: "medium", // 'low', 'medium', or 'high'
      allowsEditing: true, //Allows Video for trimming
      storageOptions: {
        skipBackup: true,
        path: "Wearables",
      },
    };
    ImagePicker.launchCamera(options, async (response) => {

      if (response.didCancel) {
        set_loaderMsg('');
        set_isLoading(false);
      } else if (response.error) {
        set_loaderMsg('');
        set_isLoading(false);
      } else {
        let _uri = '';
        _uri = response.assets[0].uri.replace("file:///", "/");
        if (response.assets[0].type.includes('video')) {
          
          set_mediaSize(mediaSize+response.assets.length)

          await MediaMeta.get(_uri).then((metadata) => {
            if (Platform.OS === 'android') {

              vEndDate = moment(metadata.creation_time).utcOffset("+00:00").format("MMDDYYYYHHmmss");
              if (metadata.duration) {
                var tempDate = '';
                tempDate = new Date(metadata.creation_time);;

                if (tempDate && tempDate !== '') {
                  tempDate.setSeconds(tempDate.getSeconds() - (metadata.duration / 1000))
                  vStartDate = moment(new Date(tempDate)).utcOffset("+00:00").format("MMDDYYYYHHmmss");
                }

              }
            } else {
              vStartDate = moment(metadata.creationDate).utcOffset("+00:00").format("MMDDYYYYHHmmss");
              if (metadata.duration) {
                var tempDate = '';
                tempDate = new Date(metadata.creationDate);;

                if (tempDate && tempDate !== '') {
                  tempDate.setSeconds(tempDate.getSeconds() + (metadata.duration / 1000))
                  vEndDate = moment(new Date(tempDate)).utcOffset("+00:00").format("MMDDYYYYHHmmss");
                }

              }
            }

          }).catch((err) => { vEndDate = moment(new Date()).utcOffset("+00:00").format("MMDDYYYYHHmmss"); }
          );
        }
        let mArray = mediaArray;
        set_videoPath();
        // set_mediaArray(mArray);
        var promise = CameraRoll.save(response.assets[0].uri, {
          type: "video",
          album: "Wearables",
          filename: "video" + moment(new Date()).format('MMDDYYYYhhmmss'),
        });
        promise.then(async function (result) {

          if (response.assets[0].type.includes('video')) {
            set_loaderMsg('');
            set_isLoading(false);

            // let myPromise = new Promise(function (resolve) {
            //   if (Platform.OS === 'android') {
            //     NativeModules.K4lVideoTrimmer.navigateToTrimmer(response.assets[0].uri, "11", (convertedVal) => {
            //       resolve(convertedVal);
            //     });
            //   }
            //   if (Platform.OS === 'ios') {
            //     NativeModules.ChangeViewBridge.changeToNativeView(
            //       [response.assets[0].uri],
            //       eventId => {
            //         resolve(eventId);
            //       },
            //     );

            //   }
            // });

            //cameraTrimmedpath = await myPromise;
            //write function here to handle video path for android and iOS

            // if (Platform.OS === 'android') {
            //   cameraTrimmedpath = cameraTrimmedpath.replace("[", "");
            //   cameraTrimmedpath = cameraTrimmedpath.replace("]", "");
            //   cameraTrimmedpath = 'file://' + cameraTrimmedpath;
            // }
            // else {

            //   if (cameraTrimmedpath[0].startsWith("file://")) {
            //     cameraTrimmedpath = cameraTrimmedpath[0]
            //   }
            //   else {
            //     cameraTrimmedpath = 'file://' + cameraTrimmedpath[0];
            //   }

            // }


            let thumImg = undefined;
            await createThumbnail({ url: response.assets[0].uri, timeStamp: 10000, }).then(response => thumImg = response.path)
              .catch(err => { });

            var dateFile = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss");
            let fileName = '';

            if (selectedPet && selectedPet.devices && selectedPet.devices.length > 0) {
              let pName = selectedPet.petName.length > 15 ? selectedPet.petName.substring(0, 15) : selectedPet.petName;
              let sName = selectedPet.studyName.length > 20 ? selectedPet.studyName.substring(0, 20) : selectedPet.studyName;
              let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0, 15) : obsObject.behaviourItem.behaviorName;
              if (selectedPet.devices[0].isDeviceSetupDone) {
                fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPet.devices[0].deviceNumber + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + '.mp4';
              } else {
                fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPet.devices[0].deviceNumber + "_SETUP_PENDING" + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + '.mp4';
              }
            } else {

              let pName = selectedPet.petName.length > 15 ? selectedPet.petName.substring(0, 15) : selectedPet.petName;
              let sName = selectedPet.studyName.length > 20 ? selectedPet.studyName.substring(0, 20) : selectedPet.studyName;
              let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0, 15) : obsObject.behaviourItem.behaviorName;
              fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + 'NO_DEVICE' + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + '.mp4';

            }

            let vidObj = {
              'filePath': response.assets[0].uri,
              'fbFilePath': '',
              'fileName': fileName,//dateFile+"_"+response.assets[0].fileName,
              'observationVideoId': '',
              'localThumbImg': thumImg,
              'fileType': 'video',
              "isDeleted": 0,
              "actualFbThumFile": '',
              'thumbFilePath': thumImg,
              'compressedFile': '',
              "videoStartDate": vStartDate,
              "videoEndDate": vEndDate,
              'fileDate': dateFile.toString()
            };

            mArray.splice(0, 0, vidObj);
            set_videoPath(mArray);
            set_mediaArray(mArray);
          }

        }).catch(function (error) { });

        if (response.assets[0].type.includes('image')) {
          
          set_mediaSize(mediaSize+response.assets.length)
          var dateFile = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss");
          let fileName = '';

          if (selectedPet && selectedPet.devices && selectedPet.devices.length > 0) {
            let pName = selectedPet.petName.length > 15 ? selectedPet.petName.substring(0, 15) : selectedPet.petName;
            let sName = selectedPet.studyName.length > 20 ? selectedPet.studyName.substring(0, 20) : selectedPet.studyName;
            let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0, 15) : obsObject.behaviourItem.behaviorName;
            if (selectedPet.devices[0].isDeviceSetupDone) {
              fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPet.devices[0].deviceNumber + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + '.jpg';
            } else {
              fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPet.devices[0].deviceNumber + "_SETUP_PENDING" + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + '.mp4';
            }
          } else {

            let pName = selectedPet.petName.length > 15 ? selectedPet.petName.substring(0, 15) : selectedPet.petName;
            let sName = selectedPet.studyName.length > 20 ? selectedPet.studyName.substring(0, 20) : selectedPet.studyName;
            let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0, 15) : obsObject.behaviourItem.behaviorName;
            fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + 'NO_DEVICE' + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + '.jpg';

          }

          let imgObj = {
            'filePath': response.assets[0].uri,
            'fbFilePath': '',
            'fileName': fileName,//response.assets[0].fileName,
            'observationPhotoId': '',
            'localThumbImg': response.assets[0].uri,
            'fileType': 'image',
            "isDeleted": 0,
            "actualFbThumFile": '',
            'thumbFilePath': response.assets[0].uri,
            'compressedFile': '',
            'isEdited': false,
            'fileDate': dateFile.toString()
          };

          //mArray.splice(0, 0, imgObj);
          //editPhoto(mArray);
          mArray.push(imgObj)
          set_mediaArray(null)
          set_mediaArray(mArray)
        }
      }
    });

  };

  const actionOnRow = async (value, item) => {

    set_isMediaSelection(value);
    editImgCountRef.current = 0;
    actualEditImgCountRef.current = 0;
    editedImagesArray.current = [];

    if (item === 'GALLERY') {
      set_loaderMsg(Constant.LOADER_WAIT_MESSAGE);
      set_isLoading(true);
      if (Platform.OS === 'android') {
        if (mediaArray.length == 0) {
          NativeModules.K4lVideoTrimmer.clearExistingMedia()
        }
        if (DeviceInfo.getSystemVersion() > 12 && mediaType === 1) {
          chooseImage();
        }
        else {
          chooseMultipleMedia();
        }


      } else {
        chooseImage();
      }

    } else if (item === 'CAMERA') {

      if (Platform.OS === 'android') {

        if (mediaArray.length == 0) {
          NativeModules.K4lVideoTrimmer.clearExistingMedia()
        }
        let androidPer = await CheckPermissionsAndroid.checkCameraPermissions();

        if (androidPer === 'Camera not granted') {
          let high = <Highlighter highlightStyle={{ fontWeight: "bold", }}
            searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED_ANDROID]}
            textToHighlight={
              Constant.CAMERA_PERMISSION_MSG_ANDROID
            } />
          createPopup(high, Constant.ALERT_DEFAULT_TITLE, false, true, 1);
          return;
        }

      } else {

        let camPermissions = await DataStorageLocal.getDataFromAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED);
        if (camPermissions && camPermissions === 'isFirstTime') {
          await DataStorageLocal.saveDataToAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED, 'existingUser');
        } else {

          let permissions = await PermissionsiOS.checkCameraPermissions();
          if (!permissions) {

            let high = <Highlighter highlightStyle={{ fontWeight: "bold", }}
              searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED]}
              textToHighlight={Constant.CAMERA_PERMISSION_MSG} />
            createPopup(high, Constant.ALERT_DEFAULT_TITLE, false, true, 1);
            // return
          }

        }

      }
      set_isMediaSelection(value);
      set_loaderMsg(Constant.LOADER_WAIT_MESSAGE);
      chooseCamera(mediaType === 0 ? 'photo' : 'video');

    }

  };

  const deleteSelectedMedia = async () => {

    let obj = deleteSelectedMediaFile.current;

    if (isEdit) {

      if (deleteSelectedMediaFile.current.observationVideoId && deleteSelectedMediaFile.current.observationVideoId !== '') {

        obj.isDeleted = 1;

      } else if (deleteSelectedMediaFile.current.observationPhotoId && deleteSelectedMediaFile.current.observationPhotoId !== '') {

        obj.isDeleted = 1;

      }

      deletedMediaArray.current.push(obj);
    } else {
      deletedMediaArray.current = [];
    }

    let resultArray = await deleteObsObj(mediaArray, deleteSelectedMediaFile.current.fileName);
    set_mediaSize(resultArray.length);
    set_mediaArray(resultArray);

  };

  const deleteObsObj = async (arrayMedia, id) => {

    let tempArray = arrayMedia;
    const tasks = tempArray.filter(task => task.fileName !== id);
    let temp = tasks;
    return temp;

  };

  const removeMedia = (item) => {
    deleteSelectedMediaFile.current = item;
    createPopup('Are you sure you want to delete this ' + item.fileType + '?', Constant.ALERT_DEFAULT_TITLE, true, true, 1);
    set_PopId(POPUP_DELETE);
  };

  const redirectToMediaEdit = (item, index) => {
    moveToPhotoEditor(item, index)
  };

  const popOkBtnAction = () => {
    if (popId === POPUP_DELETE) {
      deleteSelectedMedia();
      popCancelBtnAction();
    }
    else {
      set_loaderMsg('');
      set_isLoading(false);
      popCancelBtnAction();
    }
  };

  const popCancelBtnAction = () => {
    createPopup('', '', false, false, 0);
  };

  const chooseMultipleMedia = async () => {

    try {
      var response = await MultipleImagePicker.openPicker({
        selectedAssets: [],
        // isExportThumbnail: true,
        maxVideo: 7,
        usedCameraButton: false,
        singleSelectedMode: false,
        isCrop: false,
        isCropCircle: false,
        mediaType: mediaType === 0 ? 'image' : 'video',
        maxVideoDuration: 1200,
        singleSelectedMode: false,
        selectedColor: '#f9813a',
        maxSelectedAssets: 7 - mediaSize,
        allowedPhotograph: false,
        allowedVideoRecording: false,
        preventAutomaticLimitedAccessAlert: true,
        isPreview: true,

      });

      if (response) {
        let mArray = mediaArray;
        set_mediaSize(mediaSize+response.length);

        for (let i = 0; i < response.length; i++) {

          if (response[i].type.includes('image')) {

            var dateFile = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss");
            let _uri = '';
            _uri = response[i].realPath.replace("file:///", "/");
            var numb = response[i].fileName.match(/\d/g);
            numb = numb.join("");

            if (numb) {
              let year = numb.substring(0, 4);
              let month = numb.substring(4, 6);
              let day = numb.substring(6, 8);
              let time = numb.substring(8, 14)

              let momentObj = moment(year + '-' + month + '-' + day + '-' + time, 'YYYY-MM-DD-HHmmss');
              dateFile = moment(momentObj).utcOffset("+00:00").format("MMDDYYYYHHmmss");
              if (dateFile === "Invalid date") {
                dateFile = moment(new Date).utcOffset("+00:00").format("MMDDYYYYHHmmss");
              }
            }

            let fileName = '';

            if (selectedPet && selectedPet.devices && selectedPet.devices.length > 0) {
              let pName = selectedPet.petName.length > 15 ? selectedPet.petName.substring(0, 15) : selectedPet.petName;
              let sName = selectedPet.studyName.length > 20 ? selectedPet.studyName.substring(0, 20) : selectedPet.studyName;
              let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0, 15) : obsObject.behaviourItem.behaviorName;
              if (selectedPet.devices[0].isDeviceSetupDone) {
                fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPet.devices[0].deviceNumber + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + i + '.jpg';
              } else {
                fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPet.devices[0].deviceNumber + "_SETUP_PENDING" + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + i + '.jpg';
              }
            } else {

              let pName = selectedPet.petName.length > 15 ? selectedPet.petName.substring(0, 15) : selectedPet.petName;
              let sName = selectedPet.studyName.length > 20 ? selectedPet.studyName.substring(0, 20) : selectedPet.studyName;
              let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0, 15) : obsObject.behaviourItem.behaviorName;
              fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + 'NO_DEVICE' + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + i + '.jpg';

            }

            let imgObj = {
              'filePath': response[i].path,
              'fbFilePath': '',
              'fileName': fileName,//response[i].fileName,
              'observationPhotoId': '',
              'localThumbImg': response[i].path,
              'fileType': 'image',
              "isDeleted": 0,
              "actualFbThumFile": '',
              "thumbFilePath": response[i].realPath,
              "compressedFile": '',
              'isEdited': false,
              'fileDate': dateFile.toString()
            };
            mArray.splice(0, 0, imgObj);

          }

          if (response[i].type.includes('video')) {

            let thumImg1 = undefined;
            await createThumbnail({ url: response[i].path, timeStamp: 10000, }).then(response => thumImg1 = response.path)
              .catch(err => { });

            let _uri = '';
            _uri = response[i].realPath.replace("file:///", "/");

            // if (Platform.OS === 'android') {

            //   NativeModules.K4lVideoTrimmer.navigateToTrimmer(response[i].realPath, "10", (convertedVal) => {
            //     convertedVal = convertedVal.replace("[", "");
            //     convertedVal = convertedVal.replace("]", "");
            //     timmedVideosArray = convertedVal.split(",");
            //     //CALL UPDATE URLS METHOD FROM HERE
            //     updateTrimmedURLs();
            //   });
            // }
            var dateFile = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss");

            let vStartDate = null;
            let vEndDate = null;

            await MediaMeta.get(_uri).then((metadata) => {

              dateFile = moment(metadata.creation_time).utcOffset("+00:00").format("MMDDYYYYHHmmss");

              if (dateFile === "Invalid date") {
                dateFile = moment(new Date).utcOffset("+00:00").format("MMDDYYYYHHmmss");
              }

              if (metadata.creation_time) {
                vStartDate = moment(metadata.creation_time).utcOffset("+00:00").format("MMDDYYYYHHmmss");
              }

              if (response[i].duration) {
                var tempDate = new Date(metadata.creation_time);
                if (tempDate && tempDate !== '') {
                  tempDate.setSeconds(tempDate.getSeconds() + (response[i].duration / 1000))
                  vEndDate = moment(new Date(tempDate)).utcOffset("+00:00").format("MMDDYYYYHHmmss");
                }

              }
            }).catch((err) => { }
            );

            let fileName = '';

            if (selectedPet && selectedPet.devices && selectedPet.devices.length > 0) {
              let pName = selectedPet.petName.length > 15 ? selectedPet.petName.substring(0, 15) : selectedPet.petName;
              let sName = selectedPet.studyName.length > 20 ? selectedPet.studyName.substring(0, 20) : selectedPet.studyName;
              let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0, 15) : obsObject.behaviourItem.behaviorName;
              if (selectedPet.devices[0].isDeviceSetupDone) {
                fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPet.devices[0].deviceNumber + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + i + '.mp4';
              } else {
                fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPet.devices[0].deviceNumber + "_SETUP_PENDING" + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + i + '.mp4';
              }
            } else {

              let pName = selectedPet.petName.length > 15 ? selectedPet.petName.substring(0, 15) : selectedPet.petName;
              let sName = selectedPet.studyName.length > 20 ? selectedPet.studyName.substring(0, 20) : selectedPet.studyName;
              let bName = obsObject.behaviourItem.behaviorName.length > 15 ? obsObject.behaviourItem.behaviorName.substring(0, 15) : obsObject.behaviourItem.behaviorName;
              fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + 'NO_DEVICE' + '_' + dateFile + '_' + bName.replace(/_/g, ' ') + i + '.mp4';

            }

            let vidObj = undefined;

            vidObj = {
              'filePath': response[i].realPath,
              'fbFilePath': '',
              'fileName': fileName,//dateFile+"_"+response[i].fileName,
              'observationVideoId': '',
              'localThumbImg': thumImg1,
              'fileType': 'video',
              "isDeleted": 0,
              "actualFbThumFile": '',
              'thumbFilePath': response[i].path,
              'compressedFile': '',
              "videoStartDate": vStartDate,
              "videoEndDate": vEndDate
            };

            mArray.push(vidObj);

          }
        }
        //editPhoto(mArray);
        set_loaderMsg(undefined);
        set_isLoading(false);

      }
    } catch (e) {
      set_loaderMsg(undefined);
      set_isLoading(false);
      set_isLoading(false);
    }
  }

  // const editPhoto = async (mediaArray) => {
  //   let vArray = [];
  //   let iArray = [];

  //   for (let i = 0; i < mediaArray.length; i++) {
  //     if (mediaArray[i].fileType === 'image') {
  //       iArray.push(mediaArray[i])
  //     }
  //     if (mediaArray[i].fileType === 'video') {
  //       vArray.push(mediaArray[i])
  //     }
  //   }

  //   if (iArray.length > 0) {
  //     actualEditImgCountRef.current = iArray.length;
  //     addEditedImg(iArray[editImgCountRef.current].filePath, iArray, vArray);
  //   } else if (vArray.length > 0) {
  //     if (Platform.OS === 'ios') {
  //       trimVideos(vArray);
  //     }
  //   }

  // };

  // const addEditedImg = async (uri, iArray, vArray) => {

  //   let isEdit = iArray[editImgCountRef.current].isEdited;

  //   if (uri && !isEdit) {

  //     let fileName = uri.split('/').pop();
  //     let newPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  //     RNFS.copyFile(uri, newPath).then((success) => {

  //       setTimeout(() => {
  //         PhotoEditor.Edit({
  //           path: newPath,
  //           // colors : ['#000000', '#808080', '#a9a9a9'],
  //           hiddenControls: ['share', 'sticker'],
  //           onDone: imagePath => {

  //             let imgObj = {
  //               'filePath': imagePath,
  //               'fbFilePath': '',
  //               'fileName': iArray[editImgCountRef.current].fileName,
  //               'observationPhotoId': '',
  //               'localThumbImg': iArray[editImgCountRef.current].localThumbImg,
  //               'fileType': 'image',
  //               "isDeleted": 0,
  //               "actualFbThumFile": '',
  //               "thumbFilePath": iArray[editImgCountRef.current].thumbFilePath,
  //               "compressedFile": '',
  //               'isEdited': true,
  //               'fileDate': iArray[editImgCountRef.current].fileDate
  //             };

  //             editedImagesArray.current.push(imgObj);
  //             editImgCountRef.current = editImgCountRef.current + 1;
  //             if (editImgCountRef.current < actualEditImgCountRef.current) {
  //               addEditedImg(iArray[editImgCountRef.current].filePath, iArray, vArray);
  //             } else {
  //               let tempArray = [...editedImagesArray.current, ...vArray]
  //               //let tempArray = [...iArray, ...vArray]
  //               set_mediaArray(tempArray);
  //               set_mediaSize(tempArray.length);
  //               set_loaderMsg('');
  //               set_isLoading(false);
  //               if (vArray.length > 0) {
  //                 if (Platform.OS === 'ios') {
  //                   trimVideos(tempArray);
  //                 }
  //               }

  //             }

  //           },
  //           onCancel: () => {

  //             let imgObj = {
  //               'filePath': iArray[editImgCountRef.current].filePath,
  //               'fbFilePath': '',
  //               'fileName': iArray[editImgCountRef.current].fileName,
  //               'observationPhotoId': '',
  //               'localThumbImg': iArray[editImgCountRef.current].localThumbImg,
  //               'fileType': 'image',
  //               "isDeleted": 0,
  //               "actualFbThumFile": '',
  //               "thumbFilePath": iArray[editImgCountRef.current].thumbFilePath,
  //               "compressedFile": '',
  //               'isEdited': true,
  //               'fileDate': iArray[editImgCountRef.current].fileDate
  //             };

  //             editedImagesArray.current.push(imgObj);
  //             // editedImagesArray.current.push(iArray[editImgCountRef.current]);
  //             editImgCountRef.current = editImgCountRef.current + 1;
  //             if (editImgCountRef.current < actualEditImgCountRef.current) {
  //               addEditedImg(iArray[editImgCountRef.current].filePath, iArray, vArray);
  //             } else {

  //               let tempArray = [...editedImagesArray.current, ...vArray]
  //               set_mediaArray(tempArray);
  //               set_mediaSize(tempArray.length);
  //               set_loaderMsg('');
  //               set_isLoading(false);
  //               if (vArray.length > 0) {
  //                 if (Platform.OS === 'ios') {
  //                   trimVideos(tempArray);
  //                 }
  //               }
  //             }
  //           }
  //         });
  //       }, 700,

  //       );
  //     }).catch((err) => {

  //       editedImagesArray.current.push(iArray[editImgCountRef.current]);
  //       editImgCountRef.current = editImgCountRef.current + 1;
  //       if (editImgCountRef.current < actualEditImgCountRef.current) {
  //         addEditedImg(iArray[editImgCountRef.current].filePath, iArray, vArray);
  //       } else {
  //         let tempArray = [...editedImagesArray.current, ...vArray]
  //         set_mediaArray(tempArray);
  //         set_mediaSize(tempArray.length);
  //         set_loaderMsg('');
  //         set_isLoading(false);
  //         if (vArray.length > 0) {
  //           if (Platform.OS === 'ios') {
  //             trimVideos(tempArray);
  //           }
  //         }
  //       }
  //     });

  //   } else {

  //     editedImagesArray.current.push(iArray[editImgCountRef.current]);
  //     editImgCountRef.current = editImgCountRef.current + 1;
  //     if (editImgCountRef.current < actualEditImgCountRef.current) {
  //       addEditedImg(iArray[editImgCountRef.current].filePath, iArray, vArray);
  //     } else {
  //       let tempArray = [...editedImagesArray.current, ...vArray]
  //       set_mediaArray(tempArray);
  //       set_mediaSize(tempArray.length);
  //       set_loaderMsg('');
  //       set_isLoading(false);
  //       if (Platform.OS === 'ios') {
  //         trimVideos(tempArray);
  //       }
  //       return;
  //     }
  //   }

  // };

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
              'filePath': imagePath,
              'fbFilePath': '',
              'fileName': item.fileName,
              'observationPhotoId': '',
              'localThumbImg': item.localThumbImg,
              'fileType': 'image',
              "isDeleted": 0,
              "actualFbThumFile": '',
              "thumbFilePath": item.thumbFilePath,
              "compressedFile": '',
              'isEdited': true,
              'fileDate': item.fileDate
            };
            mediaArray[index] = imgObj
            set_loaderMsg('');
            set_isLoading(false);
          },
          onCancel: () => {
            let imgObj = {
              'filePath': item.filePath,
              'fbFilePath': '',
              'fileName': item.fileName,
              'observationPhotoId': '',
              'localThumbImg': item.localThumbImg,
              'fileType': 'image',
              "isDeleted": 0,
              "actualFbThumFile": '',
              "thumbFilePath": item.thumbFilePath,
              "compressedFile": '',
              'isEdited': true,
              'fileDate': item.fileDate
            };
            mediaArray[index] = imgObj
            set_loaderMsg('');
            set_isLoading(false);
          }
        });

      }).catch((err) => {});
    }
    else if (item && item.fileType === 'video') {
      if (Platform.OS === 'android') {
        let fileName = item.filePath.split('/').pop();
        let newPath = `${RNFS.DocumentDirectoryPath}/${"obs_video_" + Date.now() + '.mp4'}`;
        RNFS.copyFile(item.filePath, newPath).then((success) => {
          newPath = 'file://' + newPath;
          NativeModules.K4lVideoTrimmer.navigateToTrimmer(newPath, "10", (convertedVal) => {
            convertedVal = convertedVal.replace("[", "");
            convertedVal = convertedVal.replace("]", "");
            timmedVideosArray = convertedVal.split(",");

            let vidObj = {
              'filePath': timmedVideosArray[0],
              'fbFilePath': '',
              'fileName': item.fileName,
              'observationVideoId': '',
              'localThumbImg': item.localThumbImg,
              'fileType': 'video',
              "isDeleted": 0,
              "actualFbThumFile": '',
              'thumbFilePath': item.thumbFilePath,
              'compressedFile': '',
              "videoStartDate": item.videoStartDate,
              "videoEndDate": item.videoEndDate
            };
            mediaArray[index] = vidObj
            set_loaderMsg('');
            set_isLoading(false);
          });

        }).catch((err) => {});
      }
      else if (Platform.OS === 'ios') {
        set_loaderMsg(Constant.LOADER_WAIT_MESSAGE);
        set_isLoading(true);
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
          set_loaderMsg('');
          set_isLoading(false);
          let updateFilePath = item.filePath
          if (videoArray[0].startsWith("file://")) {
            updateFilePath = videoArray[0];
          }
          else {
            updateFilePath = 'file://' + videoArray[0];
          }
          let vidObj = {
            'filePath': updateFilePath,
            'fbFilePath': '',
            'fileName': item.fileName,
            'observationVideoId': '',
            'localThumbImg': item.localThumbImg,
            'fileType': 'video',
            "isDeleted": 0,
            "actualFbThumFile": '',
            'thumbFilePath': item.thumbFilePath,
            'compressedFile': '',
            "videoStartDate": item.videoStartDate,
            "videoEndDate": item.videoEndDate
          };
          mediaArray[index] = vidObj
          set_loaderMsg('');
          set_isLoading(false);
        }
      }
    }

  };

  const trimVideos = async (mediaArr) => {

    let vArray = [];
    let iArray = [];

    for (let i = 0; i < mediaArr.length; i++) {
      if (mediaArr[i].fileType === 'image') {
        iArray.push(mediaArr[i])
      }
      if (mediaArr[i].fileType === 'video') {
        vArray.push(mediaArr[i])
      }
    }

    if (vArray.length > 0) {

      set_loaderMsg(Constant.LOADER_WAIT_MESSAGE);
      set_isLoading(true);

      if (Platform.OS === 'ios' && timmedVideosArray.length > 0) {
        let myPromise = new Promise(function (resolve) {
          timmedVideosArray = timmedVideosArray.filter((a) => a)
          // if(Platform.OS === 'ios' ){
          NativeModules.ChangeViewBridge.changeToNativeView(
            timmedVideosArray,
            eventId => {
              resolve(eventId);
            },
          );
          // }
        });
        videoArray = await myPromise;
        set_loaderMsg('');
        set_isLoading(false);

        for (let i = 0; i < vArray.length; i++) {
          if (videoArray[i].startsWith("file://")) {
            vArray[i].filePath = videoArray[i];
          }
          else {
            vArray[i].filePath = 'file://' + videoArray[i];
          }

        }
        let finalArray = [...iArray, ...vArray];
        set_mediaArray(finalArray);

      }
      set_loaderMsg('');
      set_isLoading(false);
    }

  };

  //to handle trimmed urls for android
  const updateTrimmedURLs = async () => {

    var iArray = mediaArray.filter(item => item.fileType === 'image');
    var vArray = mediaArray.filter(item => item.fileType === 'video');
    var tempArray = [];

    if (timmedVideosArray.length > 0) {
      for (let i = 0; i < vArray.length; i++) {
        vArray[i].filePath = timmedVideosArray[i].trim();
      }
      tempArray = [...vArray, ...iArray]
      set_mediaArray(tempArray)
    }

  };

  const createPopup = (pMsg, pAlert, pLeftEnable, isPop, popId) => {

    set_popUpMessage(pMsg);
    set_popUpAlert(pAlert);
    set_popUpleftBtnEnable(pLeftEnable);
    set_isPopUp(isPop);
    popIdRef.current = popId;

  };

  return (
    <UploadObsVideoUI
      isLoading={isLoading}
      loaderMsg={loaderMsg}
      selectedPet={selectedPet}
      videoPath={videoPath}
      isMediaSelection={isMediaSelection}
      popUpMessage={popUpMessage}
      popUpAlert={popUpAlert}
      popUpleftBtnEnable={popUpleftBtnEnable}
      isPopUp={isPopUp}
      optionsArray={optionsArray}
      mediaArray={mediaArray}
      isEdit={isEdit}
      mediaType={mediaType}
      navigateToPrevious={navigateToPrevious}
      submitAction={submitAction}
      selectMediaAction={selectMediaAction}
      actionOnRow={actionOnRow}
      popOkBtnAction={popOkBtnAction}
      popCancelBtnAction={popCancelBtnAction}
      removeMedia={removeMedia}
      redirectToMediaEdit={redirectToMediaEdit}
    />

  );

}

export default UploadObsVideoComponent;