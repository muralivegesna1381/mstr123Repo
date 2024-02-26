import React, { useState, useEffect, useRef, useDebugValue } from 'react';
import { View, BackHandler, Platform, NativeModules } from 'react-native';
import QuickVideoUI from './quickVideoUI';
import * as DataStorageLocal from "./../../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../../utils/constants/constant";
import * as ImagePicker from 'react-native-image-picker';
import CameraRoll from "@react-native-community/cameraroll";
import { PermissionsAndroid } from 'react-native';
import { createThumbnail } from "react-native-create-thumbnail";
import moment from 'moment';
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import Highlighter from "react-native-highlight-words";
import * as PermissionsiOS from './../../../../utils/permissionsComponents/permissionsiOS';
import MediaMeta from "react-native-media-meta";

let trace_inQuickVideo;

const QuickVideoComponent = ({ navigation, route, ...props }) => {

  const [selectedPet, set_selectedPet] = useState(undefined);
  const [isLoading, set_isLoading] = useState(false);
  const [loaderMsg, set_loaderMsg] = useState(undefined);
  const [originalFilePath, set_OriginalFilePath] = useState(undefined);
  const [videoPath, set_videoPath] = useState(undefined);
  const [thumbnailImage, set_thumbnailImage] = useState(undefined);
  const [videoName, set_videoName] = useState(undefined);
  const [isMediaSelection, set_isMediaSelection] = useState(false);
  const [mediaArray, set_mediaArray] = useState([]);

  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [isPopLftBtnEnable, set_isPopLftBtnEnable] = useState(undefined);
  const [isPopRBtnTitle, set_isPopRBtnTitle] = useState('YES');
  const [date, set_Date] = useState(new Date());

  let popIdRef = useRef(0);
  let selectedPetRef = useRef(undefined);
  let trimmedPath;
  let vStartDate = null;
  let vEndDate = null;
  let dateFile = null;
  let thumImg = undefined;

  React.useEffect(() => {

    getObsDetails();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    if (Platform.OS === 'android') {
      requestCameraPermission();

    } else {
      chooseCamera();
    }

    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      observationsQuickVideoSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_quick_video);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_quick_video, "User in Add Observations Quick Video Screen", '');
      deleteMedia();
    });

    const unsubscribe = navigation.addListener('blur', () => {
      observationsQuickVideoSessionStop();
    });

    return () => {
      observationsQuickVideoSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      focus();
      unsubscribe();
    };

  }, []);

  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  const observationsQuickVideoSessionStart = async () => {
    trace_inQuickVideo = await perf().startTrace('t_inQuickVideo');
  };

  const observationsQuickVideoSessionStop = async () => {
    await trace_inQuickVideo.stop();
  };

  const getObsDetails = async () => {

    let oJson = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
    oJson = JSON.parse(oJson);
    if (oJson) {
      firebaseHelper.logEvent(firebaseHelper.event_observation_quick_video, firebaseHelper.screen_quick_video, "User Selected Quick Video option", 'Pet Id : ' + oJson.selectedPet.petID);
      set_selectedPet(oJson.selectedPet);
      selectedPetRef.current = oJson.selectedPet;
    }

  };

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
        chooseCamera();
      } else {
      }
    } catch (err) { }
  };

  const submitAction = async () => {

    let obsPets = await DataStorageLocal.getDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
    obsPets = JSON.parse(obsPets);
    let obsObject = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
    obsObject = JSON.parse(obsObject);

    // obsObject.selectedPet = obsObject ? obsObject.selectedPet : '';
    // obsObject.obsText = obsObject ? obsObject.obsText : '';
    // obsObject.obserItem = obsObject ? obsObject.obserItem : '';
    // obsObject.selectedDate = obsObject ? obsObject.observationDateTime : new Date();
    // obsObject.mediaArray = mediaArray;
    // obsObject.fromScreen = obsObject ? obsObject.fromScreen : '';
    // obsObject.isPets = false;
    // obsObject.isEdit = false;


    let obsObj = {
      fromScreen: obsObject ? obsObject.fromScreen : '',
      isPets: false,
      isEdit: false,
      behaviourItem: obsObject ? obsObject.behaviourItem : '',
      observationId: obsObject ? obsObject.observationId : '',
      quickVideoFileName: mediaArray[0].fileName,
      quickVideoDateFile: mediaArray[0].quickVideoDateFile,
      mediaArray: mediaArray,
      selectedPet: obsObject ? obsObject.selectedPet : '',
      ctgNameId: 1
    }

    await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ, JSON.stringify(obsObj));
    firebaseHelper.logEvent(firebaseHelper.event_observation_quick_video_action, firebaseHelper.screen_quick_video, "User clicked on Next", 'Pet Id : ' + obsObject ? obsObject.selectedPet.petID : '');
    if (obsPets && obsPets.length > 1) {
      navigation.navigate('AddOBSSelectPetComponent', { petsArray: obsPets, defaultPetObj: obsObject.selectedPet });
    } else {
      navigation.navigate('ObservationComponent');
    }

  };

  const navigateToPrevious = () => {

    if (popIdRef.current === 1) {
    } else {
      firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_quick_video, "User clicked on back button to navigate to Dashboard", '');
      navigation.navigate("DashBoardService");
    }

  };

  const selectMediaAction = async () => {
    firebaseHelper.logEvent(firebaseHelper.event_observation_quick_video_media_action, firebaseHelper.screen_quick_video, "User clicked on Choose Camera option", '');

    if (Platform.OS === 'ios') {

      let camPermissions = await DataStorageLocal.getDataFromAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED);
      if (camPermissions && camPermissions === 'isFirstTime') {
        await DataStorageLocal.saveDataToAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED, 'existingUser');
        chooseCamera();
      } else {

        let permissions = await PermissionsiOS.checkCameraPermissions();
        if (!permissions) {

          let high = <Highlighter highlightStyle={{ fontWeight: "bold", }}
            searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED]}
            textToHighlight={
              Constant.CAMERA_PERMISSION_MSG
            } />
          set_popUpMessage(high);
          set_popUpAlert('Alert');
          set_isPopUp(true);
          set_isPopRBtnTitle('OK')
          set_isPopLftBtnEnable(false)
          popIdRef.current = 1;
          return
        } else {
          chooseCamera();
        }

      }

    } else {
      chooseCamera();
    }

  };

  const safeNewDate = function (localDateTimeStr) {

    var match = localDateTimeStr.match(
      /(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2}):(\d{2})(.(\d+))?/,
    )
    if (!match) throw new Error('Invalid format.')

    var [, year, month, date, hours, minutes, seconds, , millseconds] = match

    return new Date(
      year,
      Number(month) - 1,
      date,
      hours,
      minutes,
      seconds,
      millseconds || 0,
    )
  }

  const chooseCamera = async () => {

    set_loaderMsg('Please wait..')
    set_isLoading(true)
    let options = {
      mediaType: "video",
      durationLimit: 1200,
      videoQuality: "medium", // 'low', 'medium', or 'high'
      allowsEditing: true, //Allows Video for trimming
      storageOptions: {
        skipBackup: true,
        path: "Wearables",
      },
    };

    ImagePicker.launchCamera(options, async (response) => {

      set_loaderMsg('')
      set_isLoading(false);

      if (response.didCancel) {
      } else if (response.error) {
      } else {

        let sourceUri = "";
        let duration = undefined;
        // vEndDate = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss");
        sourceUri = response.assets[0].uri;
        duration = response.assets[0].duration;

        let _uri = '';
        _uri = response.assets[0].uri.replace("file:///", "/");
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

        // set_isLoading(true);
        var promise = CameraRoll.save(response.assets[0].uri, {
          type: "video",
          album: "Wearables",
          // filename: "video"+moment(new Date()).format('MMDDYYYYhhmmss'),
        });
        promise.then(async function (result) {

          await createThumbnail({ url: response.assets[0].uri, timeStamp: 10000, }).then(response => thumImg = response.path)
            .catch(err => { });
          set_videoPath(result);
          set_thumbnailImage(thumImg)

          dateFile = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss");
          set_OriginalFilePath(response.assets[0].uri)

          let fileName = '';
          if (selectedPetRef.current && selectedPetRef.current.devices && selectedPetRef.current.devices.length > 0) {
            let pName = selectedPetRef.current.petName.length > 15 ? selectedPetRef.current.petName.substring(0, 15) : selectedPetRef.current.petName;
            let sName = selectedPetRef.current.studyName.length > 20 ? selectedPetRef.current.studyName.substring(0, 20) : selectedPetRef.current.studyName;
            if (selectedPetRef.current.devices[0].isDeviceSetupDone) {
              fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPetRef.current.devices[0].deviceNumber + '_' + dateFile;
            } else {
              fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + selectedPetRef.current.devices[0].deviceNumber + '_SETUP_PENDING' + '_' + dateFile;
            }
          } else {

            let pName = selectedPetRef.current.petName.length > 15 ? selectedPetRef.current.petName.substring(0, 15) : selectedPetRef.current.petName;
            let sName = selectedPetRef.current.studyName.length > 20 ? selectedPetRef.current.studyName.substring(0, 20) : selectedPetRef.current.studyName;
            // fileName = pName +'_'+sName+'_'+selectedPetRef.current.devices[0].deviceNumber+'_'+dateFile;
            fileName = pName.replace(/_/g, ' ') + '_' + sName.replace(/_/g, ' ') + '_' + "NO_DEVICE" + '_' + dateFile;

          }

          set_videoName(fileName)

          let vidObj = {
            'filePath': response.assets[0].uri,
            'fbFilePath': '',
            'fileName': fileName,//dateFile+"_"+response.assets[0].fileName,
            'observationVideoId': '',
            'localThumbImg': thumImg,
            'fileType': 'video',
            "isDeleted": 0,
            "actualFbThumFile": '',
            'thumbFilePath': response.assets[0].uri,
            'compressedFile': '',
            "videoStartDate": vStartDate,
            "videoEndDate": vEndDate,
            "quickVideoDateFile": dateFile,
          }
          set_mediaArray([vidObj]);

        }).catch(err => {
          // if(err) {
          set_loaderMsg('');
          set_isLoading(false);
          if (Platform.OS === 'ios') {
            let high = <Highlighter highlightStyle={{ fontWeight: "bold", }}
              searchWords={[Constant.GALLERY_PERMISSION_MSG_HIGHLIGHTED]}
              textToHighlight={
                Constant.GALLERY_PERMISSION_MSG
              } />
            set_popUpMessage(high);
            set_popUpAlert('Alert');
            set_isPopUp(true);
            set_isPopRBtnTitle('OK')
            set_isPopLftBtnEnable(false)
          }
          popIdRef.current = 1;
          return
          // }
        });
      }
    });

  }

  const deleteMedia = async () => {

    let vid = await DataStorageLocal.getDataFromAsync(Constant.DELETE_VIDEO);
    vid = JSON.parse(vid);
    firebaseHelper.logEvent(firebaseHelper.event_observation_quick_video_delete_media_action, firebaseHelper.screen_quick_video, "User deleted recorded Video from list", '');
    if (vid) {

      set_videoPath(undefined);
      set_thumbnailImage(undefined);
      await DataStorageLocal.removeDataFromAsync(Constant.DELETE_VIDEO);

    }

  };

  const removeVideo = () => {

    set_popUpAlert('Alert');
    set_popUpMessage('Are you sure you want to delete the Video?');
    set_isPopUp(true);
    set_isPopRBtnTitle("YES")
    set_isPopLftBtnEnable(true)
    popIdRef.current = 1;

  };

  const popOkBtnAction = () => {

    set_videoPath(undefined);
    set_videoName(undefined)
    set_thumbnailImage(undefined);
    popCancelBtnAction();
  };

  const popCancelBtnAction = () => {
    set_popUpAlert(undefined);
    set_popUpMessage(undefined);
    set_isPopUp(false);
    set_isPopRBtnTitle('YES')
    set_isPopLftBtnEnable(false);
    popIdRef.current = 0;
  };

  const redirectToMediaEdit = () => {
    moveToPhotoEditor()
  };

  const moveToPhotoEditor = async () => {

    if (Platform.OS === 'android') {

      let fileName = originalFilePath.split('/').pop();
      let timmedVideosArray = [];
      NativeModules.K4lVideoTrimmer.navigateToTrimmer(originalFilePath, "10", (convertedVal) => {
        convertedVal = convertedVal.replace("[", "");
        convertedVal = convertedVal.replace("]", "");
        timmedVideosArray = convertedVal.split(",");

        let vidObj = {
          'filePath': timmedVideosArray[0],
          'fbFilePath': '',
          'fileName': fileName,//dateFile+"_"+response.assets[0].fileName,
          'observationVideoId': '',
          'localThumbImg': thumbnailImage,
          'fileType': 'video',
          "isDeleted": 0,
          "actualFbThumFile": '',
          'thumbFilePath': timmedVideosArray[0],
          'compressedFile': '',
          "videoStartDate": vStartDate,
          "videoEndDate": vEndDate,
          "quickVideoDateFile": dateFile,
        }

        set_mediaArray([vidObj]);
        set_loaderMsg('');
        set_isLoading(false);
      });
    }
    else if (Platform.OS === 'ios') {
      set_loaderMsg(Constant.LOADER_WAIT_MESSAGE);
      set_isLoading(true);
      let vArray = [];
      vArray.push(originalFilePath)
      if (Platform.OS === 'ios') {
        let myPromise = new Promise(function (resolve) {
          NativeModules.ChangeViewBridge.changeToNativeView(
            vArray,
            eventId => {
              resolve(eventId);
            },
          );
        });
        let videoArray = [];
        videoArray = await myPromise;
        set_loaderMsg('');
        set_isLoading(false);
        let updateFilePath = videoPath
        if (videoArray[0].startsWith("file://")) {
          updateFilePath = videoArray[0];
        }
        else {
          updateFilePath = 'file://' + videoArray[0];
        }
        let fileName = originalFilePath.split('/').pop();
        let vidObj = {
          'filePath': updateFilePath,
          'fbFilePath': '',
          'fileName': fileName,//dateFile+"_"+response.assets[0].fileName,
          'observationVideoId': '',
          'localThumbImg': thumbnailImage,
          'fileType': 'video',
          "isDeleted": 0,
          "actualFbThumFile": '',
          'thumbFilePath': thumImg,
          'compressedFile': '',
          "videoStartDate": vStartDate,
          "videoEndDate": vEndDate,
          "quickVideoDateFile": dateFile,
        }

        set_mediaArray([vidObj]);
        set_loaderMsg('');
        set_isLoading(false);
      }
    }
  }

  return (
    <QuickVideoUI
      isLoading={isLoading}
      loaderMsg={loaderMsg}
      selectedPet={selectedPet}
      videoPath={videoPath}
      videoName={videoName}
      thumbnailImage={thumbnailImage}
      isMediaSelection={isMediaSelection}
      popUpMessage={popUpMessage}
      popUpAlert={popUpAlert}
      isPopUp={isPopUp}
      isPopLftBtnEnable={isPopLftBtnEnable}
      isPopRBtnTitle={isPopRBtnTitle}
      navigateToPrevious={navigateToPrevious}
      submitAction={submitAction}
      selectMediaAction={selectMediaAction}
      removeVideo={removeVideo}
      // actionOnRow = {actionOnRow}
      popOkBtnAction={popOkBtnAction}
      popCancelBtnAction={popCancelBtnAction}
      redirectToMediaEdit={redirectToMediaEdit}
    />

  );

}

export default QuickVideoComponent;
