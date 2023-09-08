import React, { useState, useEffect,useRef } from 'react';
import { View, BackHandler, Platform } from 'react-native';
import ScoringImagePickerUI from './scoringImagePickerUI';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import storage, { firebase } from '@react-native-firebase/storage';
import * as internetCheck from "./../../utils/internetCheck/internetCheck";
import moment from 'moment';
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import * as PermissionsiOS from './../../utils/permissionsComponents/permissionsiOS';
import Highlighter from "react-native-highlight-words";
import * as ImagePicker from 'react-native-image-picker';
import PhotoEditor from 'react-native-photo-editor'
import CameraRoll from "@react-native-community/cameraroll";
import * as CheckPermissionsAndroid from './../../utils/permissionsComponents/permissionsAndroid';

var RNFS = require('react-native-fs');

const ScoringImagePickerComponent = ({ navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [isMediaSelection, set_isMediaSelection] = useState(false);
    const [imagePath, set_imagePath] = useState(undefined);
    const [imagePath1, set_imagePath1] = useState(undefined);
    const [loadingMsg, set_loadingMsg] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [popupBtnTitle, set_popupBtnTitle] = useState(undefined);
    const [popupLftBtnEnable, set_popupLftBtnEnable] = useState(false);
    const [selectedObj, set_selectedObj] = useState(undefined);
    const [title, set_title] = useState(undefined);
    const [scoringTypeId, set_scoringTypeId] = useState(undefined);
    const [imageScoringId, set_imageScoringId] = useState(undefined);

    let trace_inImage_Scoring_ImagePicker_Screen;

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

     // Setting the firebase screen name
    useEffect(() => {
        
        firebaseHelper.reportScreen(firebaseHelper.screen_image_based_score_image_upload);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_image_based_score_image_upload, "User in ImageBased Image selection Screen", ''); 
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        imageScoringImagePickerPageSessionStart();
     
         return () => {
           imageScoringImagePickerPageSessionStop();
           BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };

    }, []);

    // Setting the prams values to local variables
    useEffect(() => {

        if (route.params?.selectedObj) {
            set_selectedObj(route.params?.selectedObj);
        }

        if (route.params?.scoreObj) {
            set_title(route.params?.scoreObj.scoringType);
        }

        if (route.params?.scoringTypeId) {
            set_scoringTypeId(route.params?.scoringTypeId);
        }

        if (route.params?.imageScoringId) {
            set_imageScoringId(route.params?.imageScoringId);
        }

    }, [route.params?.selectedObj, route.params?.scoreObj,route.params?.scoringTypeId,route.params?.imageScoringId]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    // Uploading image to firebase
    const submitAction = async () => {
        uploadImgToCLoud(imagePath);
    };

    // Navigates to previous screen
    const navigateToPrevious = () => {

        // if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_image_based_score_image_upload, "User clicked on back button to navigate to ImageScoringMainComponent", '');
            navigation.navigate("ImageScoringMainComponent");
        // }
        
    };

    const imageScoringImagePickerPageSessionStart = async () => {
        trace_inImage_Scoring_ImagePicker_Screen = await perf().startTrace('t_Image_Scoring_ImagePicker_Screen');
      };
    
      const imageScoringImagePickerPageSessionStop = async () => {
        await trace_inImage_Scoring_ImagePicker_Screen.stop();
      };

    // Selecting the Image from Camera/Gallery
    const selectMediaAction = async () => {
        set_isMediaSelection(true);
    };

    // Selecting the image
    const chooseMultipleMedia = async () => {

      try {
        var response = await MultipleImagePicker.openPicker({
          selectedAssets: [],
          maxVideo: 0,
          usedCameraButton: true,
          singleSelectedMode: true,
          isCrop: false,
          isCropCircle: false,
          mediaType: "image",
          singleSelectedMode: true,
          selectedColor: '#f9813a',
          haveThumbnail: true,
          maxSelectedAssets: 1,
          allowedPhotograph: true,
          allowedVideoRecording: false,
          preventAutomaticLimitedAccessAlert: true,
          isPreview: true
        });
            
        if (response) {
          set_imagePath(response.path);
          set_imagePath1(response.path);
          addEditedImg(response.path);
          set_isLoading(false);
          isLoadingdRef.current = 0;
          set_loadingMsg(undefined);
        }
      } catch (e) {
        set_isLoading(false);
        isLoadingdRef.current = 0;
      }
    };

    const chooseImage = () => {

      set_isLoading(true);
      set_loadingMsg('Please Wait...')
      ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        selectionLimit: 1,
        durationLimit:1200,
        includeExtra : true,
      },
      async (response) => {
        if(response && response.errorCode === 'permission') {
          set_isLoading(false);
          let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
            searchWords={[Constant.GALLERY_PERMISSION_MSG_HIGHLIGHTED]}
            textToHighlight={
              Constant.GALLERY_PERMISSION_MSG
            }/>
          set_popUpMessage(high);
          set_popUpAlert('Alert');
          set_popupBtnTitle('OK');
          set_isPopUp(true); 
          popIdRef.current = 1;
          return
        }
        if (response.didCancel) {
          set_isLoading(false);
        } else if (response.error) {
          set_isLoading(false);
        } else {
          if(response && response.assets){
              set_imagePath(response.assets[0].uri);
              set_imagePath1(response.assets[0].uri);
              addEditedImg(response.assets[0].uri);
              set_isLoading(false);
            } else {
              set_isLoading(false);
            }
        }
      },)
  
    };

    const addEditedImg = async (uri) => {
    
      let fileName = uri.split('/').pop();
      let newPath = `${RNFS.DocumentDirectoryPath}/${fileName}`; 
      RNFS.copyFile(uri, newPath).then((success) => {
  
        setTimeout(() => {
          PhotoEditor.Edit({
            path: newPath,
            // colors : ['#000000', '#808080', '#a9a9a9'],
            hiddenControls : ['share','sticker'],
            onDone : imagePath => {
              set_imagePath(imagePath);
              if(Platform.OS === 'ios') {
                set_imagePath1(imagePath);
              }                      
            },
            onCancel : () => {}
          });
        },700,);}).catch((err) => {
      });

    };

    const chooseCamera = async () => {

      let options = {
        mediaType: 'photo',
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
          set_isLoading(false);
          isLoadingdRef.current = 0;
          popIdRef.current = 0;
        } else if (response.error) {
          set_isLoading(false);
          isLoadingdRef.current = 0;
          popIdRef.current = 0;
        } else {
          set_isLoading(false);
          isLoadingdRef.current = 0;
          popIdRef.current = 0;
          var promise = CameraRoll.save(response.assets[0].uri, {
            type: "photo",
            album: "Wearables",
            filename: "photo"+moment(new Date()).format('MMDDYYYYhhmmss'),
          });
          promise.then(async function(result) { }) .catch(function(error) {});
  
          if(response.assets[0].type.includes('image')){
            set_imagePath(response.assets[0].uri);
            set_imagePath1(response.assets[0].uri);
            addEditedImg(response.assets[0].uri);
            editPhoto(mArray);
          } 
        }
      });
      
      };
    
    // Uploading the image to Firebase
    const uploadImgToCLoud = async (fileUrl) => {

      let internet = await internetCheck.internetCheck();
      set_loadingMsg('Please wait..');

      if (!internet) {
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,'OK',false);           
      } else {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        petObj = JSON.parse(petObj);

        firebaseHelper.logEvent(firebaseHelper.event_image_scoring_image_upload_api, firebaseHelper.screen_image_based_score_image_upload, "Image based scoring image upload Api", "");
        let dte = moment(new Date()).format("YYYYMMDDHHmmss");
        let filename = "Wearables_Scoring_Images/" + petObj.petID.toString() + client.toString() + dte + "." + 'jpg';
        let reference = storage().ref(filename); // 2
        let task = reference.putFile(fileUrl); // 3
        task.on('state_changed', taskSnapshot => {
          set_loadingMsg("Uploading Image..." + '\n' +  + (Math.round(`${taskSnapshot.bytesTransferred}` / `${taskSnapshot.totalBytes}` * 100)) + ' % Completed');
        });

        task.then(() => {
          storage().ref(filename).getDownloadURL().then((url) => {
            prpareScorinObject(url,client,petObj.petID);                   
          });

        }).catch((error) => {
          set_isLoading(false);
          isLoadingdRef.current = 0;
          set_loadingMsg(undefined);
          createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,'OK',false);
          firebaseHelper.logEvent(firebaseHelper.event_image_scoring_image_upload_api_fail, firebaseHelper.screen_image_based_score_image_upload, "Image based scoring image upload Api success", ""+error);
        });
      }

    };

    const prpareScorinObject = async (url,client,petID) => {

      set_isLoading(true);
      isLoadingdRef.current = 1;
      set_loadingMsg(undefined);
      let jsonScoring = {
        "imageScoreType": scoringTypeId,
        "imageScoringId": imageScoringId,
        "petId": petID,
        "petImgScoreDetails": [
          {
            "imageScoringDtlsId": selectedObj.imageScoringDetailsId,
            "imageUrl": url,
            "thumbnailUrl": "",
            "value": "",
            "uom": 0
          }
        ],
        "petParentId": client
      }
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        sendScoringDetailsToBackend(jsonScoring,token);
    };

    const sendScoringDetailsToBackend = async (jsonScoring,token) => {

      let submitScoreServiceObj = await ServiceCalls.addPetImageScoring(jsonScoring,token);
      set_isLoading(false);
      isLoadingdRef.current = 0;
      set_loadingMsg(undefined);

      if(submitScoreServiceObj && submitScoreServiceObj.logoutData){
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
        return;
      }
      if(submitScoreServiceObj && !submitScoreServiceObj.isInternet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,'OK',false);
        return;
      }
      if(submitScoreServiceObj && submitScoreServiceObj.statusData){
            
        let msg = '';
        if(title==='BFI Scoring'){
          msg = Constant.BFISCORING_SUCCESS_MSG;
        } else if(title==='BCS Scoring'){
          msg = Constant.BCSCORING_SUCCESS_MSG;
        } else {
          msg = Constant.STOOL_SCORING_SUCCESS_MSG;
        }   
        createPopup('Success',msg,true,'OK',false);
        
        } else {
          firebaseHelper.logEvent(firebaseHelper.event_image_scoring_page_api_final_failure, firebaseHelper.screen_image_based_score_measurements, "Final image based scoring Api failed", "");
          createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,'OK');
        }
  
        if(submitScoreServiceObj && submitScoreServiceObj.error) {
          firebaseHelper.logEvent(firebaseHelper.event_image_scoring_page_api_final_failure, firebaseHelper.screen_image_based_score_measurements, "Final image based scoring Api failed", "");
          createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,'OK',false);
        }

    };

    // Removes the selected image from the memory
    const removeImageAction = () => {
      set_popUpAlert('Alert');
      set_popupBtnTitle('YES');
      set_popupLftBtnEnable(true);
      set_popUpMessage('Are you sure you want to delete the Image?');
      set_isPopUp(true);
      popIdRef.current = 1;
    };

    const createPopup = (title,msg,isPop,btntitle,isLetBtn) => {
      set_popUpAlert(title);
      set_popUpMessage(msg);
      set_isPopUp(isPop);
      set_popupBtnTitle(btntitle);
      set_popupLftBtnEnable(isLetBtn);
      popIdRef.current = 1;
    };

    // Popup actions
    const popOkBtnAction = () => {

      if (popUpMessage === 'Are you sure you want to delete the Image?') {
        set_imagePath(undefined);
        set_imagePath1(undefined);
      } else if (popUpMessage === Constant.BCSCORING_SUCCESS_MSG || popUpMessage === Constant.BFISCORING_SUCCESS_MSG || popUpMessage === Constant.STOOL_SCORING_SUCCESS_MSG) {
        navigation.navigate("DashBoardService");
      }
        popCancelBtnAction();
    };

    const popCancelBtnAction = () => {
      set_isPopUp(false);
      popIdRef.current = 0;
      set_popUpAlert(undefined);
      set_popupBtnTitle('YES');
      set_popupLftBtnEnable(false);
      set_popUpMessage(undefined);
    };

    // Selection to take image
    const actionOnRow = async (item) => {

      set_isMediaSelection(false);

      if (item === 'GALLERY') {
        set_isLoading(true);
        isLoadingdRef.current = 1;
        set_loadingMsg(Constant.LOADER_WAIT_MESSAGE);
        if(Platform.OS === 'ios') {
          chooseImage()
        } else {
          chooseMultipleMedia();
        }
      } 
      if (item === 'CAMERA') {

        if(Platform.OS === 'android') {

          let androidPer = await CheckPermissionsAndroid.checkCameraPermissions();
      
          if(androidPer === 'Camera not granted') {
            let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
              searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED_ANDROID]}
              textToHighlight={
                Constant.CAMERA_PERMISSION_MSG_ANDROID
              }/>
            set_popUpMessage(high);
            set_popUpAlert('Alert');
            set_isPopUp(true); 
            set_popupBtnTitle('OK');
            popIdRef.current = 1;
            return;
          }
      
        } else {
      
          let camPermissions = await DataStorageLocal.getDataFromAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED);
          if(camPermissions && camPermissions === 'isFirstTime') {
            await DataStorageLocal.saveDataToAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED,'existingUser');
          } else {
      
            let permissions = await PermissionsiOS.checkCameraPermissions();
            if(!permissions) {
              
              let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
                  searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED]}
                  textToHighlight={
                    Constant.CAMERA_PERMISSION_MSG
                  }/>
              set_popUpMessage(high);
              set_popUpAlert('Alert');
              set_isPopUp(true); 
              set_popupBtnTitle('OK');
              popIdRef.current = 1;
              return;                   
            } 
      
          }
          
        } 
        set_isLoading(true);
        isLoadingdRef.current = 1;
        set_loadingMsg(Constant.LOADER_WAIT_MESSAGE);
        chooseCamera();
      }  
    }

    return (

      <ScoringImagePickerUI
        title={title}
        isLoading={isLoading}
        loaderMsg={loadingMsg}
        isMediaSelection={isMediaSelection}
        popUpMessage={popUpMessage}
        popUpAlert={popUpAlert}
        isPopUp={isPopUp}
        imagePath={imagePath}
        imagePath1 = {imagePath1}
        popupBtnTitle={popupBtnTitle}
        popupLftBtnEnable={popupLftBtnEnable}
        navigateToPrevious={navigateToPrevious}
        submitAction={submitAction}
        selectMediaAction={selectMediaAction}
        removeImageAction={removeImageAction}
        popOkBtnAction={popOkBtnAction}
        popCancelBtnAction={popCancelBtnAction}
        actionOnRow={actionOnRow}
      />

    );

}

export default ScoringImagePickerComponent;