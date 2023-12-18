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

const  DasBoardComponent = ({route, ...props }) => {

    const { loading:timerWidgetNavigationLoad, data : timerWidgetNavigationData } = useQuery(Queries.DASHBOARD_TIMER_WIDGET, { fetchPolicy: "cache-only" });
    const { loading:logOutLoading, data:logOutdata } = useQuery(Queries.LOG_OUT_APP, { fetchPolicy: "cache-only" });
    const { loading:logoutNaviLoading, data:logoutNaviData } = useQuery(Queries.LOG_OUT_APP_NAVI, { fetchPolicy: "cache-only" });
    const { loading:loadingData, data:uploadDashboardData } = useQuery(Queries.UPDATE_DASHBOARD_DATA, { fetchPolicy: "cache-only" });
    const { loading:vbackgrndloading, data:uploadMediaData } = useQuery(Queries.UPLOAD_VIDEO_BACKGROUND_STATUS, { fetchPolicy: "cache-only" });
    const { loading:loadingQst, data:uploadQstMediaData } = useQuery(Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS, { fetchPolicy: "cache-only" });
    const { loading: captureBFILoading, data: captureBFIData } = useQuery(Queries.UPLOAD_CAPTURE_BFI_BACKGROUND_STATUS, { fetchPolicy: "cache-only" });
  
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
    const [isPTDropdown, set_isPTDropdown] = useState(undefined)
  
    const [bfiUploadStatus, set_bfiUploadStatus] = useState(undefined);
    const [bfiFileName, set_bfiFileName] = useState(undefined);
    const [bfiUploadProgress, set_bfiUploadProgress] = useState(undefined);
    const [bfiProgressText, set_bfiProgressText] = useState(undefined);

    const navigation = useNavigation();

    React.useEffect(() => {

      removeNotifications();
      if(Platform.OS==='android'){
        requestStoragePermission();
      } 
      //Logging out Zendesk from here
      // Calling android method from here for Zendesk logout
      if(Platform.OS === 'android') { 
        NativeModules.ZendeskChatModule.logOutFromZendeskWindow("logout" ,(convertedVal) => {
             //handle callback if needed     
        });
      }
      // Calling iOS method from here for Zendesk logout
      else{
        NativeModules.ZendeskChatbot.logOutFromZendeskMessagingWindow( "logout", (value) => {
           //handle callback if needed
        });
      }   

    }, []);

    useEffect(() => {

      if(timerWidgetNavigationData && timerWidgetNavigationData.data.__typename === 'DashboardTimerWidget' && timerWidgetNavigationData.data.timerStatus==='StopTimer'){
        updateTimer('Settings','Continue');
        props.setTimerValue(false);
      }

      if(timerWidgetNavigationData && timerWidgetNavigationData.data.__typename === 'DashboardTimerWidget' && timerWidgetNavigationData.data.timerBtnActions==='TimerLogs' ){
        navigateToTimerLogs();
      }
        
    }, [timerWidgetNavigationData]);

    useEffect(() => {
      if (logOutdata && logOutdata.data.__typename === 'LogOutApp' && logOutdata.data.isLogOut === 'logOut') {
        props.removeItems();
        props.clearObjects();       
      }
    }, [logOutdata]);

    useEffect(() => {

      if (logoutNaviData && logoutNaviData.data.__typename === 'LogOutAppNavi' && logoutNaviData.data.isLogOutNavi === 'logOutNavi') {
        props.removeItems();
        props.clearObjects(); 
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
      }

    }, [logoutNaviData]);

    useEffect(() => {
      if (uploadDashboardData && uploadDashboardData.data.__typename === 'UpdateDashboardData' && uploadDashboardData.data.isRefresh === 'refresh') {
        props.refreshPT();
      } else if (uploadDashboardData && uploadDashboardData.data.__typename === 'UpdateDashboardData' && uploadDashboardData.data.isRefresh === 'refreshModularity') {
        props.updateModularitySetupDone();
      }
    }, [uploadDashboardData]);

    useEffect(() => {

      if(uploadMediaData && uploadMediaData.data.__typename === 'UploadVideoBackgroundStatus'){

        if(uploadMediaData.data.stausType==='Uploading Done'){
            set_uploadStatus(undefined);
        } else {
            set_uploadStatus(uploadMediaData.data.statusUpload);
        }

        if(uploadMediaData.data.observationName){
            set_observationText(uploadMediaData.data.observationName);
        } else {
            set_observationText('');
        }

        if(uploadMediaData.data.fileName){
            set_fileName(uploadMediaData.data.fileName);
        } else {
            set_fileName('');
        }

        if(uploadMediaData.data.uploadProgress){
            set_uploadProgress(uploadMediaData.data.uploadProgress);
        }

        if(uploadMediaData.data.progressTxt){
            set_progressTxt(uploadMediaData.data.progressTxt);
        }

        if(uploadMediaData.data.internetType==='notWi-Fi'){
            set_internetType('cellular');
        } else {
            set_internetType('Wi-Fi');
        }
    }
        
    }, [uploadMediaData]);

    useEffect(() => {

      if(uploadQstMediaData && uploadQstMediaData.data.uploadMode === 'backGround' && uploadQstMediaData.data.__typename === 'UploadQuestionnaireVideoBackgroundStatus'){

        if(uploadQstMediaData.data.statusUpload==='Uploading Done'){
          updateQuestionnareCount()
          set_questUploadStatus(undefined);
        } else {
            set_questUploadStatus(uploadQstMediaData.data.statusUpload);
        }

        if(uploadQstMediaData.data.questName){
            set_questText(uploadQstMediaData.data.questName);
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

      console.log("captureBFIData",captureBFIData)
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
          navigation.navigate('MenuComponent',{deviceType:props.defaultPetObj && props.defaultPetObj.devices.length > 0 ? props.defaultPetObj.devices[0].deviceModel : '', isConfigured:props.defaultPetObj && props.defaultPetObj.devices.length > 0 ? (props.defaultPetObj.devices[0].isDeviceSetupDone ? 'SetupDone' : 'SetupPending') : undefined});
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
      await DataStorageLocal.saveDataToAsync(Constant.DEFAULT_PET_OBJECT,JSON.stringify(pObject));
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
        await DataStorageLocal.saveDataToAsync(Constant.TIMER_SELECTED_PET, JSON.stringify(props.defaultPetObj));
        await DataStorageLocal.saveDataToAsync(Constant.TIMER_PETS_ARRAY, JSON.stringify(props.timePetsArray));
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
        let obsObj = {
          selectedPet : props.defaultPetObj, 
          obsText : '', 
          obserItem : '', 
          selectedDate : '', 
          imagePath : '', 
          videoPath: '',
          imgName : '',
          videoName : '',
          thumbnailImage : '',
          fromScreen : 'quickVideo',
          isPets : false, 
        }

        await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ,JSON.stringify(obsObj));
        props.clearObjects();
        updateTimer('Observations','Continue');
        await DataStorageLocal.saveDataToAsync(Constant.OBS_SELECTED_PET, JSON.stringify(props.defaultPetObj));
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
        navigation.navigate('SensorInitialComponent',{defaultPetObj:props.defaultPetObj});
      }
      
    };

    // Edit Weight button action
    const weightAction = async () => {

      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_editpet, firebaseHelper.screen_dashboard, "Edit pet button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true); 
      } else {
        updateTimer('WeighAction','Continue');
        props.clearObjects();
        navigation.navigate('PetWeightHistoryComponent',{petObject:props.defaultPetObj,petWeightUnit:props.petWeightUnit});
      }
    };

    // EnthusiasticAction button action
    const enthusiasticAction = async () => {

      ptDropAction();
      await DataStorageLocal.removeDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_enthusiasm, firebaseHelper.screen_dashboard, "Eating Enthusiasm button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        props.clearObjects();
        updateTimer('EatingEnthusiasticComponent','Continue');
        navigation.navigate('EatingEnthusiasticComponent');
      }

    };

    // Imagebase scoring button action
    const imageScoreAction = async () => {

      ptDropAction();
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_imageScoring, firebaseHelper.screen_dashboard, "ImageScoring button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup();
      } else {
        props.clearObjects();
        updateTimer('SelectBSCScoringComponent','Continue');
        navigation.navigate('SelectBSCScoringComponent');
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
            if(selectedQuest[i].petId === props.defaultPetObj.petID && selectedQuest[i].questId === questId) {           
              isTrue = true;
            } 
          }

          if(isTrue === false) {
            updateTimer('Questionnaire','Continue');
            props.clearObjects();
            await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(props.defaultPetObj));
            navigation.navigate('QuestionnaireStudyComponent');
            navigation.navigate('QuestionnaireQuestionsService',{questionObject : item, petObj : props.defaultPetObj});
          } else {
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.QUEST_INPROGRESS_MSG,"OK",false,true); 
          }

        } else {
          updateTimer('Questionnaire','Continue');
          await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(props.defaultPetObj));
          props.clearObjects();
          navigation.navigate('QuestionnaireStudyComponent');
          navigation.navigate('QuestionnaireQuestionsService',{questionObject : item, petObj : props.defaultPetObj});
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
          await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(props.defaultPetObj));
          navigation.navigate('QuestionnaireStudyComponent',{isFrom:'Dashboard'});
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

        if(value==='ADD A DEVICE?'){
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_sensor_setup, firebaseHelper.screen_dashboard, "Adding a Device button clicked", "Device Missing");
          navigation.navigate('SensorTypeComponent',{value:'AddDevice', petName : props.defaultPetObj.petName});
        }else if(value==='COMPLETE SENSOR SETUP'){
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_sensor_setup, firebaseHelper.screen_dashboard, "Complete Setup button clicked", "Setup Pending");
          let objTemp = undefined;
          let index=0;
          for (let i = 0; i < props.defaultPetObj.devices.length; i++){
            if(props.defaultPetObj.devices[i].isDeviceSetupDone && index===0){
              index=index+1;
              objTemp = props.defaultPetObj.devices[i];
            } 
          }

          if(props.defaultPetObj && props.defaultPetObj.devices.length>0){

            for(let i = 0; i < props.defaultPetObj.devices.length; i++){
              if(props.defaultPetObj.devices[i].deviceNumber && props.defaultPetObj.devices[i].deviceNumber!==''){
                if(props.defaultPetObj.devices[i].deviceModel && props.defaultPetObj.devices[i].deviceModel.includes('HPN1')){
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
            if(props.defaultPetObj.devices[0].deviceModel && props.defaultPetObj.devices[0].deviceModel.includes("HPN1")){
              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,'HPN1Sensor');
            } else {
              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,'Sensor');
            }
          }
          navigation.navigate('MultipleDevicesComponent',{petObject:props.defaultPetObj, isFrom:'Dashboard'});
            // navigation.navigate('SensorInitialComponent',{defaultPetObj:props.defaultPetObj});

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
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_devices_selection, firebaseHelper.screen_dashboard, "Devices button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        updateTimer('Settings','Continue');
        props.clearObjects();
        navigation.navigate('MultipleDevicesComponent',{petObject:props.defaultPetObj});
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
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_CaptureImages_selection, firebaseHelper.screen_dashboard, "Score Images button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,"OK",false,true);
      } else {
        props.clearObjects();

        if(item.action === 'Capture Images') {
          updateTimer('PetListComponent','Continue');
          navigation.navigate('PetListComponent');
        } else if(item.action === 'Score Pet') {

          updateTimer('SelectBSCScoringComponent','Continue');
          navigation.navigate('SelectBSCScoringComponent');
  
        } else if(item.action === 'Eating Enthusiasim') {

          updateTimer('EatingEnthusiasticComponent','Continue');
          navigation.navigate('EatingEnthusiasticComponent');
  
        } else if(item.action === 'Pet Weight') {

          updateTimer('WeighAction','Continue');
          navigation.navigate('PetWeightHistoryComponent',{petObject:props.defaultPetObj,petWeightUnit:props.petWeightUnit});

        }
        
      }

    };

    const foodRecommand = async () => {

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

    return (
      <>
          <DashBoardUI 
            isLoading = {props.isLoading}
            loaderMsg = {props.loaderMsg}
            petsArray = {props.petsArray}
            isFirstUser = {props.isFirstUser}
            defaultPetObj = {props.defaultPetObj}
            activeSlide = {props.activeSlide}
            isDeviceMissing = {props.isDeviceMissing}
            isDeviceSetupDone = {props.isDeviceSetupDone}
            deviceStatusText = {props.deviceStatusText}
            buttonTitle = {props.buttonTitle}
            isObsEnable = {props.isObsEnable}
            isTimer = {props.isTimer}
            isModularityService = {props.isModularityService}
            weight = {props.weight}
            weightUnit = {props.weightUnit}
            isEatingEnthusiasm = {props.isEatingEnthusiasm}
            isImageScoring = {props.isImageScoring}
            isPetWeight = {props.isPetWeight}
            isQuestionnaireEnable = {props.isQuestionnaireEnable}
            questionnaireData = {props.questionnaireData}
            isQuestLoading = {props.isQuestLoading}
            isDeceased = {props.isDeceased}
            supportMetialsArray = {props.supportMetialsArray}
            devicesCount = {props.devicesCount}
            popUpMessage = {props.popUpMessage}
            popUpAlert = {props.popUpAlert}
            popUpRBtnTitle = {props.popUpRBtnTitle}
            isPopLeft = {props.isPopLeft}
            isPopUp = {props.isPopUp}
            petWeightUnit = {props.petWeightUnit}
            isPTEnable = {props.isPTEnable}
            isTimerEnable = {props.isTimerEnable}
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
            supportID = {props.supportID}
            supportDMissingArray = {props.supportDMissingArray}
            supportSPendingArray = {props.supportSPendingArray}
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
            refreshDashBoardDetails = {refreshDashBoardDetails}
            popOkBtnAction = {popOkBtnAction}
            popCancelBtnAction = {popCancelBtnAction}
            menuAction = {menuAction}
            quickSetupAction = {quickSetupAction}
            editPetAction = {editPetAction}
            firmwareUpdateAction = {firmwareUpdateAction}
            // weightAction = {weightAction}
            // enthusiasticAction = {enthusiasticAction}
            // imageScoreAction = {imageScoreAction}
            quickQuestionAction = {quickQuestionAction}
            quickQuestionnaireAction = {quickQuestionnaireAction}
            setupDeviceAction = {setupDeviceAction}
            supportBtnAction = {supportBtnAction}
            internetBtnAction = {internetBtnAction}
            internetQuestBtnAction = {internetQuestBtnAction}
            devicesSelectionAction = {devicesSelectionAction}
            updateQuestionnareCount = {updateQuestionnareCount}
            captureImages ={captureImages}
            foodRecommand = {foodRecommand}
            featureActions = {featureActions}
            
          />
      </>
       
    );

  }
  
  export default DasBoardComponent;