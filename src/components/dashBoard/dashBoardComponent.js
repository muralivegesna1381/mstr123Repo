import React, { useState, useEffect } from 'react';
import {Platform,PermissionsAndroid,Linking,NativeModules} from 'react-native';
import DashBoardUI from './dashBoardUI';
import { useQuery} from "@apollo/react-hooks";
import { useNavigation } from "@react-navigation/native";
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import * as Apolloclient from './../../config/apollo/apolloConfig';
import * as Queries from "../../config/apollo/queries";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import PushNotification from "react-native-push-notification";
import * as PermissionsiOS from './../../utils/permissionsComponents/permissionsiOS';
import Highlighter from "react-native-highlight-words";
import * as CheckPermissionsAndroid from './../../utils/permissionsComponents/permissionsAndroid';
import * as AppPetsData from '../../utils/appDataModels/appPetsModel.js';
import * as ObservationModel from "./../../components/observationsJournal/observationModel/observationModel.js";
import * as clearAppDataModel from "./../../utils/appDataModels/clearAppDataModel.js";
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";

const  DasBoardComponent = ({route, ...props }) => {

    const { loading:timerWidgetNavigationLoad, data : timerWidgetNavigationData } = useQuery(Queries.DASHBOARD_TIMER_WIDGET, { fetchPolicy: "cache-only" });
    const { loading:logoutNaviLoading, data:logoutNaviData } = useQuery(Queries.LOG_OUT_APP_NAVI, { fetchPolicy: "cache-only" });
    const { loading:loadingData, data:uploadDashboardData } = useQuery(Queries.UPDATE_DASHBOARD_DATA, { fetchPolicy: "cache-only" });
    const { loading:loadingQst, data:uploadQstMediaData } = useQuery(Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS, { fetchPolicy: "cache-only" });
    const { loading:loadingImgs, data:uploadImgMediaData } = useQuery(Queries.IMAGE_UPLOAD_BACKGROUND_STATUS, { fetchPolicy: "cache-only" });
    const { loading:loadingVids, data:uploadVideosData } = useQuery(Queries.VIDEO_UPLOAD_BACKGROUND_STATUS, { fetchPolicy: "cache-only" });
    const { loading: captureBFILoading, data: captureBFIData } = useQuery(Queries.UPLOAD_CAPTURE_BFI_BACKGROUND_STATUS, { fetchPolicy: "cache-only" });
    const { loading:questLoading, data : questData } = useQuery(Queries.UPDATE_Quest_LIST, { fetchPolicy: "cache-only" });

    const [uploadStatus, set_uploadStatus] = useState(undefined);
    const [observationText, set_observationText] = useState(undefined);
    const [fileName, set_fileName] = useState(undefined);
    const [uploadProgress, set_uploadProgress] = useState(undefined);
    const [progressTxt, set_progressTxt] = useState(undefined);
    const [internetType, set_internetType] = useState(undefined);
    const [questText, set_questText] = useState(undefined);
    const [questUploadStatus, set_questUploadStatus] = useState(undefined);
    const [questFileName, set_questFileName] = useState(undefined);
    const [questUploadProgress, set_questUploadProgress] = useState(undefined);
    const [questProgressTxt, set_questProgressTxt] = useState(undefined);
    const [questInternetType, set_questInternetType] = useState(undefined);
    const [obsImgText, set_obsImgText] = useState(undefined);
    const [obsImgUploadStatus, set_obsImgUploadStatus] = useState(undefined);
    const [obsImgFileName, set_obsImgFileName] = useState(undefined);
    const [obsImgUploadProgress, set_obsImgUploadProgress] = useState(undefined);
    const [obsImgProgressTxt, set_obsImgProgressTxt] = useState(undefined);
    const [obsImgInternetType, set_obsImgInternetType] = useState(undefined);
    const [obsVideoText, set_obsVideoText] = useState(undefined);
    const [obsVideoUploadStatus, set_obsVideoUploadStatus] = useState(undefined);
    const [obsVideoFileName, set_obsVideoFileName] = useState(undefined);
    const [obsVideoUploadProgress, set_obsVideoUploadProgress] = useState(undefined);
    const [obsVideoProgressTxt, set_obsVideoProgressTxt] = useState(undefined);
    const [obsVideoInternetType, set_obsVideoInternetType] = useState(undefined);
    const [isPTDropdown, set_isPTDropdown] = useState(undefined)
    const [isSearchDropdown, set_isSearchDropdown] = useState(undefined);
    const [bfiUploadStatus, set_bfiUploadStatus] = useState(undefined);
    const [bfiFileName, set_bfiFileName] = useState(undefined);
    const [bfiUploadProgress, set_bfiUploadProgress] = useState(undefined);
    const [bfiProgressText, set_bfiProgressText] = useState(undefined);

    const navigation = useNavigation();

    React.useEffect(() => {

      removeNotifications();
      autoNavigateNotifications();
      if(Platform.OS==='android'){
        requestStoragePermission();

        requestNotificationPermission()
      } 
      // Logging out Zendesk from here
      // Calling android method from here for Zendesk logout
      if(Platform.OS === 'android') { 
        NativeModules.ZendeskChatModule.logOutFromZendeskWindow("logout" ,(convertedVal) => {
             //handle callback if needed     
        });
      }
      // Calling iOS method from here for Zendesk logout
      else{

        if(NativeModules.ZendeskChatbot && NativeModules.ZendeskChatbot.logOutFromZendeskMessagingWindow) {
          NativeModules.ZendeskChatbot.logOutFromZendeskMessagingWindow( "logout", (value) => {
            //handle callback if needed
         });
        }
        
      }   

    }, []);

    useEffect(() => {

      if(timerWidgetNavigationData && timerWidgetNavigationData.data.__typename === 'DashboardTimerWidget' && timerWidgetNavigationData.data.timerStatus){
        updateTimer('Settings','Continue');
        props.setTimerValue(false);
      }

      if(timerWidgetNavigationData && timerWidgetNavigationData.data.__typename === 'DashboardTimerWidget' && timerWidgetNavigationData.data.timerBtnActions==='TimerLogs' ){
        navigateToTimerLogs();
      }
        
    }, [timerWidgetNavigationData]);

    useEffect(() => {

      if (logoutNaviData && logoutNaviData.data.__typename === 'LogOutAppNavi' && logoutNaviData.data.isLogOutNavi === 'logOutNavi') {
        props.removeItems();
        props.clearObjects(); 
        AuthoriseCheck.authoriseCheck();
        // navigation.navigate('WelcomeComponent');
        navigation.navigate('LoginComponent',{"isAuthEnabled" : false}); 
      }

    }, [logoutNaviData]);

    useEffect(() => {
      if (uploadDashboardData && uploadDashboardData.data.__typename === 'UpdateDashboardData' && uploadDashboardData.data.data === 'refresh') {
        props.refreshPT();
      } else if (uploadDashboardData && uploadDashboardData.data.__typename === 'UpdateDashboardData' && uploadDashboardData.data.data === 'refreshModularity') {
        props.updateModularitySetupDone();
      }
    }, [uploadDashboardData]);

    useEffect(() => {

      if(uploadQstMediaData && uploadQstMediaData.data.uploadMode === 'backGround' && uploadQstMediaData.data.__typename === 'UploadQuestionnaireVideoBackgroundStatus'){

        if(uploadQstMediaData.data.statusUpload==='Uploading Done'){
          updateQuestionnareCount()
          set_questUploadStatus(undefined);
        } else {
          set_questUploadStatus(uploadQstMediaData.data.statusUpload);
        }

        if(uploadQstMediaData.data.obsVidName){
          set_questText(uploadQstMediaData.data.obsVidName);
        } else {
          set_questText('');
        }

        if(uploadQstMediaData.data.fileName){
          let tempName = uploadQstMediaData.data.fileName.length > 9 ? uploadQstMediaData.data.fileName.replace('/r','/').slice(0, 9)+"..." : uploadQstMediaData.data.fileName;
          set_questFileName(tempName);
        } else {
          set_questFileName('');
        }

        if(uploadQstMediaData.data.uploadProgress){
          set_questUploadProgress(uploadQstMediaData.data.uploadProgress);
        }

        if(uploadQstMediaData.data.progressTxt){
          set_questProgressTxt(uploadQstMediaData.data.progressTxt);
        }

        if(uploadQstMediaData.data.internetType==='notWi-Fi'){
          set_questInternetType('cellular');
        } else {
          set_questInternetType('Wi-Fi');
        }
    }
        
    }, [uploadQstMediaData]);
  
    useEffect(() => {

      if(captureBFIData && captureBFIData.data.__typename === 'UploadCaptureBFIBackgroundStatus'){
        if(captureBFIData.data.stausType==='Uploading Done'){
          set_bfiUploadStatus(undefined);
        } else {
          set_bfiUploadStatus(captureBFIData.data.statusUpload);
        }
        if(captureBFIData.data.fileName){
          set_bfiFileName(captureBFIData.data.fileName);
        } else {
          set_bfiFileName('');
        }
        if(captureBFIData.data.uploadProgress){
          set_bfiUploadProgress(captureBFIData.data.uploadProgress);
        }
        if(captureBFIData.data.progressTxt){
          set_bfiProgressText(captureBFIData.data.progressTxt);
        }
    }
        
    }, [captureBFIData]);

    useEffect(() => {

      if(uploadVideosData && uploadVideosData.data.uploadMode === 'backGround' && uploadVideosData.data.__typename === 'videoUploadBackgroundStatus'){

        if(uploadVideosData.data.statusUpload==='Uploading Done'){
          set_obsVideoUploadStatus(undefined);
        } else {
          set_obsVideoUploadStatus(uploadVideosData.data.statusUpload);
        }

        if(uploadVideosData.data.obsVidName){
          set_obsVideoText(uploadVideosData.data.obsVidName);
        } else {
          set_obsVideoText('');
        }

        if(uploadVideosData.data.fileName){
          let tempName = uploadVideosData.data.fileName.length > 9 ? uploadVideosData.data.fileName.replace('/r','/').slice(0, 9)+"..." : uploadVideosData.data.fileName;
          set_obsVideoFileName(tempName);
        } else {
          set_obsVideoFileName('');
        }

        if(uploadVideosData.data.uploadProgress && uploadVideosData.data.uploadProgress !== ''){
          set_obsVideoUploadProgress(uploadVideosData.data.uploadProgress);
        } else {
          set_obsVideoUploadProgress('');
        }

        if(uploadVideosData.data.progressTxt){
          set_obsVideoProgressTxt(uploadVideosData.data.progressTxt);
        } else {
          set_obsVideoProgressTxt('');
        }

        if(uploadVideosData.data.internetType==='notWi-Fi'){
          set_obsVideoInternetType('cellular');
        } else {
          set_obsVideoInternetType('Wi-Fi');
        }
    }
        
    }, [uploadVideosData]);

    useEffect(() => {

      if(uploadImgMediaData && uploadImgMediaData.data.uploadMode === 'backGround' && uploadImgMediaData.data.__typename === 'imageUploadBackgroundStatus'){

        if(uploadImgMediaData.data.statusUpload==='Uploading Done'){
          updateQuestionnareCount()
          set_obsImgUploadStatus(undefined);
        } else {
          set_obsImgUploadStatus(uploadImgMediaData.data.statusUpload);
        }

        if(uploadImgMediaData.data.obsImgName){
          set_obsImgText(uploadImgMediaData.data.obsImgName);
          
        } else {
          set_obsImgText('');
        }

        if(uploadImgMediaData.data.fileName){
          let tempName = uploadImgMediaData.data.fileName.length > 9 ? uploadImgMediaData.data.fileName.replace('/r','/').slice(0, 9)+"..." : uploadQstMediaData.data.fileName;
          set_obsImgFileName(tempName);
        } else {
          set_obsImgFileName('');
        }

        if(uploadImgMediaData.data.uploadProgress){
          set_obsImgUploadProgress(uploadImgMediaData.data.uploadProgress);
        } else {
          set_obsImgUploadProgress('');
        }

        if(uploadImgMediaData.data.progressTxt){
          set_obsImgProgressTxt(uploadImgMediaData.data.progressTxt);
        } else {
          set_obsImgProgressTxt('');
        }

        if(uploadImgMediaData.data.internetType==='notWi-Fi'){
          set_obsImgInternetType('cellular');
        } else {
          set_obsImgInternetType('Wi-Fi');
        }
    }
        
    }, [uploadImgMediaData]);

    useEffect(() => {
      if (questData && questData.data.__typename === 'UpdateQuestList') {
        props.enableQuestionnaire();
      } 
    }, [questData]);

    const requestStoragePermission = async () => {
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
      } catch (err) {
      }
    };
  
    const requestNotificationPermission = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        try {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (result === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
          } else {
            createPopup('Notification Permission Required', 'To receive important updates and notifications, please enable notifications in your app settings.', 'OK', false, true);
            return false;
          }
        } catch (error) {
          return false;
        }
      }
      return true;
    };

    const removeNotifications = () => {
      PushNotification.setApplicationIconBadgeNumber(0);
      PushNotification.removeAllDeliveredNotifications();
    };

    // Navigates to Settings from Dashboard Quick actions widget
    const menuAction = async () => {
    
      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_Menu, firebaseHelper.screen_dashboard, "Menu button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
          props.clearObjects();
          updateTimer('Settings','Continue');
          navigation.navigate('MenuComponent',{deviceType:AppPetsData.petsData.defaultPet && AppPetsData.petsData.defaultPet.devices.length > 0 && AppPetsData.petsData.defaultPet.devices[0].deviceModel ? AppPetsData.petsData.defaultPet.devices[0].deviceModel : '', isConfigured:AppPetsData.petsData.defaultPet && AppPetsData.petsData.defaultPet.devices.length > 0 && AppPetsData.petsData.defaultPet.devices[0].isDeviceSetupDone ? 'SetupDone' : 'SetupPending'});
      }
    };

    // Query to timer when button actions on Timer widget
    const updateTimer = (value,stopValue) => {
      props.setTimerValue(false);
      Apolloclient.client.writeQuery({
        query: Queries.TIMER_WIDGET_QUERY,
        data: {
          data: { 
            screenName:value,stopTimerInterval:stopValue,__typename: 'TimerWidgetQuery'}
          },
      })
    };

    const refreshDashBoardDetails = async (value,pObject) => {
      AppPetsData.petsData.defaultPet = pObject;
      props.refreshDashBoardDetails(value,pObject);
    };

    const popOkBtnAction = () => {
      props.popOkBtnAction();
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    const quickSetupAction = async (value) => {

      ptDropAction();
      let internet = await internetCheck.internetCheck();
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true); 
      } else {
         
        if(value==='Timer'){
          timerAction();
        } else if(value==='Quick Video'){

          if(Platform.OS === 'ios') {
            let camPermissions = await DataStorageLocal.getDataFromAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED);
            if(camPermissions && camPermissions === 'isFirstTime') {
              await DataStorageLocal.saveDataToAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED,'existingUser');
              updateTimer('SetupPet','Continue');
              quickObservationAction();
            } else {

              let permissions = await PermissionsiOS.checkCameraPermissions();
              if(!permissions) {
                let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
                searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED]}
                textToHighlight={
                  Constant.CAMERA_PERMISSION_MSG
                }/>
                createPopup(Constant.ALERT_DEFAULT_TITLE,high,"OK",false,true); 
                  return
              } else {
                updateTimer('SetupPet','Continue');
                quickObservationAction();
              }

            }

          } else {
              
            let androidPer = await CheckPermissionsAndroid.checkCameraPermissions();
            let androidGalleryPer = await CheckPermissionsAndroid.checkMediaPermissions();
            if(androidPer === 'Camera not granted') {
              let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
              searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED_ANDROID]}
              textToHighlight={
                Constant.CAMERA_PERMISSION_MSG_ANDROID
              }/>
              createPopup(Constant.ALERT_DEFAULT_TITLE,high,"OK",false,true); 
              return;
            }else if(androidGalleryPer === 'Gallery not granted'){
              let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
              searchWords={[Constant.GALLERY_PERMISSION_MSG_HIGHLIGHTED_ANDROID]}
                textToHighlight={
                  Constant.GALLERY_PERMISSION_MSG_ANDROID
              }/>
              createPopup(Constant.ALERT_DEFAULT_TITLE,high,"OK",false,true); 
              return;
            }else {
              updateTimer('SetupPet','Continue');
              quickObservationAction();
            }
          }

        } else if(value === 'Support'){

          props.clearObjects();
          updateTimer('Support','Continue');
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_Support, firebaseHelper.screen_dashboard, "Support button clicked", "Internet Status: " + internet.toString());
          navigation.navigate('SupportComponent',{isFrom:'Dashboard'});

        } else if (value === 'Chat'){
          /*
          * Zendesk is implemented in native android and iOS. Based on platform that is using the app
          * we are launching the SDK from the native module methods from here
          * For android we call the launchZendeskChatWindow method and for iOS we call launchZendeskMessagingWindow
          */
          if(Platform.OS === 'android') {
            NativeModules.ZendeskChatModule.launchZendeskChatWindow("chatstart" ,(convertedVal) => {
              //callback can be handled here
            });
          }
          else{
            NativeModules.ZendeskChatbot.launchZendeskMessagingWindow( "chatstart", (value) => {
              //callback can be handled here
            });
          }
          updateTimer('Chatboat','Continue');
          //navigation.navigate('ChatBotComponent');
        }
            
      }
    };

    // Navigates to Timer module from Dashboard Quick actions widget
    const timerAction = async () => {

      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_Timer_Quick, firebaseHelper.screen_dashboard, "Timer Quick action button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        updateTimer('Timer','Stop');
        props.clearObjects();
        // getFeedbackQuestionnaire();
        await DataStorageLocal.saveDataToAsync(Constant.TIMER_SELECTED_PET, JSON.stringify(AppPetsData.petsData.defaultPet));
        if(props.timePetsArray) {
          await DataStorageLocal.saveDataToAsync(Constant.TIMER_PETS_ARRAY, JSON.stringify(props.timePetsArray));
        }
        Apolloclient.client.writeQuery({query: Queries.TIMER_START_QUERY,data: {data: {timerStart:'',__typename: 'TimerStartQuery'}},});
        navigation.navigate('TimerComponent',{isFrom:'Dashboard'});           
      } 
    };

     // Navigates to add Observations from Dashboard Quick actions widget
    const quickObservationAction = async () => {
      
      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_Quick_Video, firebaseHelper.screen_dashboard, "Quick VIdeo button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        
        await clearAppDataModel.clearObservationData();
        let obj = {
          "selectedPet" : Object, 
          "fromScreen" : String, 
          "isPets" : Boolean, 
          "isEdit" : Boolean,
          "obsText" : String,
          "obserItem" : Object,
          "selectedDate" : String,
          "mediaArray" : Array,
          "behaviourItem" : Object,
          "observationId" : Number,
          "ctgNameId" : Number,
          "ctgName" : String,
          "quickVideoFileName" : String
        }
        ObservationModel.observationData = obj;
        ObservationModel.observationData.selectedPet = AppPetsData.petsData.defaultPet;
        ObservationModel.observationData.selectedDate = new Date();
        ObservationModel.observationData.fromScreen = 'quickVideo';


        props.clearObjects();
        updateTimer('Observations','Continue');
        
        await DataStorageLocal.removeDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
        await DataStorageLocal.saveDataToAsync(Constant.OBS_SELECTED_PET, JSON.stringify(AppPetsData.petsData.defaultPet));
        navigation.navigate('QuickVideoComponent');
        
      }
      
    };

    const editPetAction = async (item) => {
      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_Pet_Edit, firebaseHelper.screen_dashboard, "Edit Pet Button button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        updateTimer('Observations','Continue');
        props.clearObjects();
        navigation.navigate('PetEditComponent',{petObject:item});
      }
    };

    // Navigates to Sensor Instructions page from Dashboard Sensor Widget
    const firmwareUpdateAction = async () => {
      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_firmwareUpdate, firebaseHelper.screen_dashboard, "FirmwareUpdate button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        updateTimer('Sensor','Continue');
        props.clearObjects();
        await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE, ""+0);
        navigation.navigate('SensorInitialComponent',{defaultPetObj:AppPetsData.petsData.defaultPet});
      }
      
    };

    // Questionnaire button action
    const quickQuestionAction = async (item) => {  
      
      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_Questionnaire, firebaseHelper.screen_dashboard, "Questionnaire Question button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true); 
      } else {

        let selectedQuest = await DataStorageLocal.getDataFromAsync(Constant.SELECTED_QUESTIONNAIRE);
        selectedQuest = JSON.parse(selectedQuest);
        let questId = item.questionnaireId;

        if(selectedQuest && selectedQuest.length > 0) {

          let isTrue = false;
          for (let i = 0; i < selectedQuest.length ; i++) {
            if(selectedQuest[i].petId ===AppPetsData.petsData.defaultPet.petID && selectedQuest[i].questId === questId) {           
              isTrue = true;
            } 
          }

          if(isTrue === false) {
            updateTimer('Questionnaire','Continue');
            props.clearObjects();
            await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(AppPetsData.petsData.defaultPet));
            navigation.navigate('QuestionnaireStudyComponent');
            navigation.navigate('QuestionnaireQuestionsService',{questionObject : item, petObj : AppPetsData.petsData.defaultPet});
          } else {
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.QUEST_INPROGRESS_MSG,"OK",false,true); 
          }

        } else {
          updateTimer('Questionnaire','Continue');
          await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringifyAppPetsData.petsData.defaultPet);
          props.clearObjects();
          navigation.navigate('QuestionnaireStudyComponent');
          navigation.navigate('QuestionnaireQuestionsService',{questionObject : item, petObj : AppPetsData.petsData.defaultPet});
        }
      }
    };

    // Question button action
    const quickQuestionnaireAction = async () => {

      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_Questionnaire, firebaseHelper.screen_dashboard, "Questionnaires button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true); 
      } else {
        
        updateTimer('Questionnaire','Continue');
        props.clearObjects();
        await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(AppPetsData.petsData.defaultPet));
        navigation.navigate('QuestionnaireStudyComponent',{isFrom:'Dashboard'});
        // let questPets = await DataStorageLocal.getDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
        // questPets = JSON.parse(questPets);
        // let pet = AppPetsData.petsData.defaultPet;
        // var petObj = undefined
        // if(questPets && pet) {
        //   petObj = questPets.filter(item => item.petID === pet.petID);
        //   if(petObj) {

        //     await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(AppPetsData.petsData.defaultPet));
        //     navigation.navigate('QuestionnaireStudyComponent',{isFrom:'Dashboard'});

        //   } else {
        //     createPopup(Constant.ALERT_NETWORK,Constant.SERVICE_FAIL_MSG,"OK",false,true); 
        //   }
        // } else {
        //   createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,"OK",false,true); 
        // }

      }

    };

     // Navigation to Timer logs when Timer widget is enabled on the dashboard
     const navigateToTimerLogs = async () => {
      ptDropAction();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_timer_widget, firebaseHelper.screen_dashboard, "Timerlogs button in Widget clicked", "Internet Status: ");
      updateTimer('Settings','Continue');
      props.setTimerValue(false);
      let timerPets = await DataStorageLocal.getDataFromAsync(Constant.TIMER_PETS_ARRAY);
      timerPets = JSON.parse(timerPets);
      navigation.navigate('TimerLogsComponent',{timerPets:timerPets,isFrom:'TimerWidget'});

    };

    // Based on title navigates to particular feature
    const setupDeviceAction = async (value) => {

      ptDropAction();
      let internet = await internetCheck.internetCheck();
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {

        updateTimer('Settings','Continue');
        props.clearObjects();
        let defaultPet = AppPetsData.petsData.defaultPet;
        await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(defaultPet));
        if(value === 17){
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_sensor_setup, firebaseHelper.screen_dashboard, "Adding a Device button clicked", "Device Missing");
          navigation.navigate('DeviceTutorialComponent',{value:'AddDevice', petName : AppPetsData.petsData.defaultPet.petName,id:value});
        }else if(value === 16){
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_sensor_setup, firebaseHelper.screen_dashboard, "Complete Setup button clicked", "Setup Pending");
          let objTemp = undefined;
          let index=0;
          for (let i = 0; i < AppPetsData.petsData.defaultPet.devices.length; i++){
            if(AppPetsData.petsData.defaultPet.devices[i].isDeviceSetupDone && index===0){
              index=index+1;
              objTemp = AppPetsData.petsData.defaultPet.devices[i];
            } 
          }

          if(AppPetsData.petsData.defaultPet && AppPetsData.petsData.defaultPet.devices.length>0){

            for(let i = 0; i < AppPetsData.petsData.defaultPet.devices.length; i++){
              if(AppPetsData.petsData.defaultPet.devices[i].deviceNumber && AppPetsData.petsData.defaultPet.devices[i].deviceNumber!==''){
                if(AppPetsData.petsData.defaultPet.devices[i].deviceModel && AppPetsData.petsData.defaultPet.devices[i].deviceModel.includes('HPN1')){
                  await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE,""+i);
                } else {
                  await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE,""+i);
                }
              } 
            }
            
          }

          if(objTemp){
            if(objTemp.deviceModel && objTemp.deviceModel.includes("HPN1")){
              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,'HPN1Sensor');
            } else {
              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,'Sensor');
            }
          } else {
            if(AppPetsData.petsData.defaultPet.devices[0].deviceModel && AppPetsData.petsData.defaultPet.devices[0].deviceModel.includes("HPN1")){
              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,'HPN1Sensor');
            } else {
              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,'Sensor');
            }
          }

            let devObj = {
              pObj : AppPetsData.petsData.defaultPet, 
              petItemObj : AppPetsData.petsData.defaultPet.devices[0],
              actionType : 2,
              isReplaceSensor : 0,
              isForceSync : 0,
              syncDeviceNo : '',
              syncDeviceModel : '',
              configDeviceNo: AppPetsData.petsData.defaultPet.devices[0].deviceNumber,
              configDeviceModel : AppPetsData.petsData.defaultPet.devices[0].deviceModel,
              reasonId : '',
              petName : AppPetsData.petsData.defaultPet.petName,
              deviceNo : AppPetsData.petsData.defaultPet.devices[0].deviceNumber,
              isDeviceSetupDone : AppPetsData.petsData.defaultPet.devices[0].isDeviceSetupDone,
              petID: AppPetsData.petsData.defaultPet.petID,
              isFirmwareReq : AppPetsData.petsData.defaultPet.devices[0].isFirmwareVersionUpdateRequired
            }
        
            await DataStorageLocal.saveDataToAsync(Constant.CONFIG_SENSOR_OBJ, JSON.stringify(devObj));
            navigation.navigate('DeviceTutorialComponent', { value:'SetupPending',defaultPetObj: AppPetsData.petsData.defaultPet,id:value });

        } else if(value==='ONBOARD YOUR PET'){
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_onBoaring, firebaseHelper.screen_dashboard, "Onboard your Pet button clicked", "New User");
          await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
          navigation.navigate('PetNameComponent',{isFrom:'Dashboard'});
        }
      }

    };

    // Navigates to PDF view page/Browser based on selection(Document/Video) from Dashboard when pet is having Setup Pending/Device Missing.
    const supportBtnAction = (item) => {

      ptDropAction();
      if(item.urlOrAnswer){

        if(item.materialTypeId === 3){
          updateTimer('PDFViewerComponent','Continue');
          navigation.navigate('PDFViewerComponent',{'pdfUrl' : item.urlOrAnswer,'title':item.titleOrQuestion})
        } else {
          Linking.openURL(item.urlOrAnswer);
        }
          
      }

    };

    const internetBtnAction = async () => {
      await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
      Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND,data: {data: { obsData:'checkForUploads',__typename: 'UploadVideoBackground'}},})
    };

    const internetQuestBtnAction = async () => {
      await DataStorageLocal.removeDataFromAsync(Constant.QUEST_VIDEO_UPLOAD_PROCESS_STARTED);
      Apolloclient.client.writeQuery({query: Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND,data: {data: { questData:'checkForQstUploads',__typename: 'UploadQuestionnaireVideoBackground'}},})
    };

    // Navigates to List of device availble for the selected pet from Dashboard Sensor Widget
    const devicesSelectionAction = async () => {

      ptDropAction();
      let internet = await internetCheck.internetCheck();
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        updateTimer('Settings','Continue');
        props.clearObjects();

        let devObj = {
          pObj : defaultPetObj, 
          petItemObj : defaultPetObj.devices[0],
          actionType : 2,
          isReplaceSensor : 0,
          isForceSync : 0,
          syncDeviceNo : '',
          syncDeviceModel : '',
          configDeviceNo: defaultPetObj.devices[0].deviceNumber,
          configDeviceModel : defaultPetObj.devices[0].deviceModel,
          reasonId : '',
          petName : defaultPetObj.petName,
          deviceNo : defaultPetObj.devices[0].deviceNumber,
          isDeviceSetupDone : defaultPetObj.devices[0].isDeviceSetupDone,
          petID: defaultPetObj.petID,
          isFirmwareReq : defaultPetObj.devices[0].isFirmwareVersionUpdateRequired
        }
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_devices_selection, firebaseHelper.screen_dashboard, "Devices button clicked", "Device No : " + defaultPetObj.devices[0].deviceNumber.toString());
        await DataStorageLocal.saveDataToAsync(Constant.CONFIG_SENSOR_OBJ, JSON.stringify(devObj));
        navigation.navigate('SensorInitialComponent', { defaultPetObj: defaultPetObj });
      }
      
    };

    const createPopup = (title,msg,rBtnTitle,isPopLftbtn,isPopup) => {
      props.createPopup(title,msg,rBtnTitle,isPopLftbtn,isPopup);
    };

    const ptDropAction = () => {
      if(isPTDropdown === false) {
        set_isPTDropdown(undefined);
      } else {
        set_isPTDropdown(false);
      }
    };

    const updateQuestionnareCount = () => {
      props.updateQuestionnareCount();
    };

    // Default pet selection function
    const selectedPetAction = async (item) => {
      AppPetsData.petsData.defaultPet = item;
      props.selectedPetAction(item);
    };

    // Removeval dropdown when navigating to other screens
    const searchDropAction = () => {
      if(isSearchDropdown === false) {
        set_isSearchDropdown(undefined);
      } else {
        set_isSearchDropdown(false);
      }
    };

    const captureImages = async () => {

      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_CaptureImages_selection, firebaseHelper.screen_dashboard, "Score Images button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        updateTimer('Settings','Continue');
        props.clearObjects();
      }
      
    };

    const featureActions = async (item) => {

      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_Features_selection, firebaseHelper.screen_dashboard, "Features button clicked : " + item.action, "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        props.clearObjects();

        if(item.action === 'Capture Images') {
          updateTimer('PetListComponent','Continue');
          let userDetails = UserDetailsModel.userDetailsData.userRole;
          let userDetails1 =  await DataStorageLocal.getDataFromAsync(Constant.USER_NAME);
          userDetails1 = JSON.parse(userDetails1)
          let petObj = {
            birthday:AppPetsData.petsData.defaultPet.birthday,
            "brandId":AppPetsData.petsData.defaultPet.brandId,
            "brandName":AppPetsData.petsData.defaultPet.brandName,
            "feedUnit":AppPetsData.petsData.defaultPet.feedUnit,
            "foodIntake":AppPetsData.petsData.defaultPet.foodIntake,
            "gender":AppPetsData.petsData.defaultPet.gender,
            "isNeutered":AppPetsData.petsData.defaultPet.isNeutered,
            "isPetWithPetParent":AppPetsData.petsData.defaultPet.isPetWithPetParent,
            "petAge":AppPetsData.petsData.defaultPet.petAge,
            "petBreed":AppPetsData.petsData.defaultPet.petBreed,
            "petID":AppPetsData.petsData.defaultPet.petID,
            "petName":AppPetsData.petsData.defaultPet.petName,
            "petParentEmail":userDetails ? userDetails.Email : '',
            "petParentId":userDetails ? userDetails.ClientID : '',
            "petParentName":userDetails1 ? userDetails1.fullName : '',
            "petStatus":AppPetsData.petsData.defaultPet.petStatus,
            "speciesId":AppPetsData.petsData.defaultPet.speciesId,
            "weight":AppPetsData.petsData.defaultPet.weight,
            "weightUnit":AppPetsData.petsData.defaultPet.weightUnit,
          }

          // navigation.navigate('PetListComponent');
          navigation.navigate('PetInformationComponent', {petData: petObj});
        } else if(item.action === 'Score Pet') {

          updateTimer('SelectBSCScoringComponent','Continue');
          navigation.navigate('SelectBSCScoringComponent');
  
        } else if(item.action === 'Eating Enthusiasim') {

          updateTimer('EatingEnthusiasticComponent','Continue');
          navigation.navigate('EatingEnthusiasticComponent');
  
        } else if(item.action === 'Pet Weight') {

          updateTimer('WeighAction','Continue');
          navigation.navigate('PetWeightHistoryComponent',{petObject:AppPetsData.petsData.defaultPet,petWeightUnit:props.petWeightUnit});

        }
        
      }

    };

    const foodRecommand = async () => {

      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_Food_Rec, firebaseHelper.screen_dashboard, "Food Recommendation button clicked : ", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        updateTimer('foodRecommand','Continue');
        props.clearObjects();
        let fhPets = await DataStorageLocal.getDataFromAsync(Constant.FH_PETS_ARRAY);
        fhPets = JSON.parse(fhPets);
        navigation.navigate("FoodHistoryPetSelectionComponent",{petsArray:fhPets,defaultPetObj:AppPetsData.petsData.defaultPet});
      }
    };

    const goalSetAction = async () => {
      
      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_Goal_Set, firebaseHelper.screen_dashboard, "Goal Setting button clicked : ", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        updateTimer('GoalSetComponent','Continue');
        props.clearObjects();
        navigation.navigate('GoalSetComponent',{goalSetValue: AppPetsData.petsData.defaultPet.goalDurationInMins === 0 ? 30 : AppPetsData.petsData.defaultPet.goalDurationInMins,petObject:AppPetsData.petsData.defaultPet});
      }

    };

    const goalVisualizationAction = async (value) => {

      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_Goal_Vis, firebaseHelper.screen_dashboard, "Goal Visualization button clicked : ", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        updateTimer('GoalSetComponent','Continue');
        props.clearObjects();
        navigation.navigate('BehaviorVisualizationComponent',{petObject:AppPetsData.petsData.defaultPet, behData:props.behVisualData, value:value});
      }
    };

    const deviceSetupMissingActions = (value) => {
      setupDeviceAction(value);
    };

    const notificationAction = async () => {
      // props.notificationAction();
      ptDropAction();
      let internet = await internetCheck.internetCheck();
      // firebaseHelper.logEvent(firebaseHelper.event_dashboard_Goal_Vis, firebaseHelper.screen_dashboard, "Goal Visualization button clicked : ", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        updateTimer('GoalSetComponent','Continue');
        props.clearObjects();
        navigation.navigate('NotificationsComponent',{isNotificationCount:props.isNotificationCount});
      }

    };

    const autoNavigateNotifications = async () => {
      let isNotificationClick = await DataStorageLocal.getDataFromAsync(Constant.IS_FROM_NOTIFICATION);
      if(isNotificationClick) {
        navigation.navigate('NotificationsComponent',{});
      }
    };

    return (
      <>
          <DashBoardUI 
            isLoading = {props.isLoading}
            loaderMsg = {props.loaderMsg}
            tempPermissions = {props.tempPermissions}
            changeInPetObj = {props.changeInPetObj}
            activeSlide = {props.activeSlide}
            deviceStatusText = {props.deviceStatusText}
            buttonTitle = {props.buttonTitle}
            isModularityService = {props.isModularityService}
            questionnaireData = {props.questionnaireData}
            isQuestLoading = {props.isQuestLoading}
            supportMetialsArray = {props.supportMetialsArray}
            popUpMessage = {props.popUpMessage}
            popUpAlert = {props.popUpAlert}
            popUpRBtnTitle = {props.popUpRBtnTitle}
            isPopLeft = {props.isPopLeft}
            isPopUp = {props.isPopUp}
            petWeightUnit = {props.petWeightUnit}
            isPTLoading = {props.isPTLoading}
            campagainName = {props.campagainName}
            campagainArray = {props.campagainArray}
            currentCampaignPet = {props.currentCampaignPet}
            leaderBoardArray = {props.leaderBoardArray}
            leaderBoardPetId = {props.leaderBoardPetId}
            leaderBoardCurrent = {props.leaderBoardCurrent}
            enableLoader = {props.enableLoader}
            questionnaireDataLength = {props.questionnaireDataLength}
            firstName = {props.firstName}
            secondName = {props.secondName}
            petType = {props.petType}
            uploadStatus = {uploadStatus}
            observationText = {observationText}
            fileName = {fileName}
            uploadProgress = {uploadProgress}
            progressTxt = {progressTxt}
            internetType = {internetType}
            questText = {questText}
            questUploadStatus = {questUploadStatus}
            questFileName = {questFileName}
            questUploadProgress = {questUploadProgress}
            questProgressTxt = {questProgressTxt}
            questInternetType={questInternetType}
            bfiUploadStatus={bfiUploadStatus}
            bfiUploadProgress={bfiUploadProgress}
            bfiFileName={bfiFileName}
            bfiProgressText = {bfiProgressText}
            ptActivityLimits = {props.ptActivityLimits}
            questSubmitLength = {props.questSubmitLength}
            isPTDropdown = {isPTDropdown}
            isSearchDropdown = {isSearchDropdown}
            behVisualData = {props.behVisualData}
            weightHistoryData = {props.weightHistoryData}
            obsImgText = {obsImgText}
            obsImgFileName = {obsImgFileName}
            obsImgUploadProgress = {obsImgUploadProgress}
            obsImgProgressTxt = {obsImgProgressTxt}
            obsImgInternetType = {obsImgInternetType}
            obsImgUploadStatus = {obsImgUploadStatus}
            obsVideoText = {obsVideoText}
            obsVideoUploadStatus = {obsVideoUploadStatus}
            obsVideoFileName = {obsVideoFileName}
            obsVideoUploadProgress = {obsVideoUploadProgress}
            obsVideoProgressTxt = {obsVideoProgressTxt}
            obsVideoInternetType = {obsVideoInternetType}
            foodHistoryObj = {props.foodHistoryObj}
            isNotificationCount = {props.isNotificationCount}
            refreshDashBoardDetails = {refreshDashBoardDetails}
            popOkBtnAction = {popOkBtnAction}
            popCancelBtnAction = {popCancelBtnAction}
            menuAction = {menuAction}
            quickSetupAction = {quickSetupAction}
            editPetAction = {editPetAction}
            firmwareUpdateAction = {firmwareUpdateAction}
            quickQuestionAction = {quickQuestionAction}
            quickQuestionnaireAction = {quickQuestionnaireAction}
            setupDeviceAction = {setupDeviceAction}
            supportBtnAction = {supportBtnAction}
            internetBtnAction = {internetBtnAction}
            internetQuestBtnAction = {internetQuestBtnAction}
            devicesSelectionAction = {devicesSelectionAction}
            updateQuestionnareCount = {updateQuestionnareCount}
            selectedPetAction = {selectedPetAction}
            captureImages ={captureImages}
            foodRecommand = {foodRecommand}
            featureActions = {featureActions}
            goalSetAction = {goalSetAction}
            goalVisualizationAction = {goalVisualizationAction}
            deviceSetupMissingActions = {deviceSetupMissingActions}
            notificationAction = {notificationAction}
          />
      </>
       
    );

  }

  export default DasBoardComponent;