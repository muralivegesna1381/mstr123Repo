import React, { useState, useEffect } from 'react';
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "../../utils/constants/constant";
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import InitialScreenUI from './initialScreenUI';
import SplashScreen from 'react-native-splash-screen';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import { Platform } from 'react-native';
import VersionNumber from 'react-native-version-number';

var PushNotification = require("react-native-push-notification");

let trace_inInitialScreen;
let trace_Login_API_Complete;
let trace_Get_UserDetails_API_Complete;

const InitialScreenComponent = ({ navigation, route, ...props }) => {

  const [loaderPercent, set_loaderPercent] = useState(0);
  const [internetStaus, set_internetStatus] = useState(true);

  useEffect(() => {

    set_loaderPercent(0);
    // initialSessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_appInitial);
    // firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_appInitial, "User in App Initial Screen", '');

    setTimeout(() => {
      SplashScreen.hide();
      getInternetStatus();
      
    }, 3000)

    clearAppData();
    return () => {
      // initialSessionStop();
    };

  }, []);

  const clearAppData = async () => {

    await DataStorageLocal.removeDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    await DataStorageLocal.removeDataFromAsync(Constant.APP_TOKEN);
      await DataStorageLocal.removeDataFromAsync(Constant.CLIENT_ID);
      await DataStorageLocal.removeDataFromAsync(Constant.PET_ID);
      await DataStorageLocal.removeDataFromAsync(Constant.MODULATITY_OBJECT);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_SELECTED_PET);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT);
      await DataStorageLocal.removeDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.POINT_TRACKING_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.IS_FIRST_TIME_USER);
      await DataStorageLocal.removeDataFromAsync(Constant.QUESTIONNAIRE_SELECTED_PET);
      await DataStorageLocal.removeDataFromAsync(Constant.OBS_SELECTED_PET);
      await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_CURRENT);
      await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
      await DataStorageLocal.removeDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
      await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
      await DataStorageLocal.removeDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);

      //////// New ////////
      await DataStorageLocal.removeDataFromAsync(Constant.TOTAL_PETS_ARRAY);
      // await DataStorageLocal.removeDataFromAsync(Constant.USER_PSD_LOGIN);
      // await DataStorageLocal.removeDataFromAsync(Constant.FCM_TOKEN);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_EMAIL_LOGIN_TEMP);
      await DataStorageLocal.removeDataFromAsync(Constant.SAVE_SOB_PETS);
      await DataStorageLocal.removeDataFromAsync(Constant.SAVE_FIRST_NAME);
      await DataStorageLocal.removeDataFromAsync(Constant.SAVE_SECOND_NAME);
      await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
      await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
      await DataStorageLocal.removeDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_DATA_FLOW_OBJ);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_MILLISECONDS);
      await DataStorageLocal.removeDataFromAsync(Constant.SENOSR_INDEX_VALUE);
      await DataStorageLocal.removeDataFromAsync(Constant.MULTY_SENSOR_INDEX);

      await DataStorageLocal.removeDataFromAsync(Constant.VIDEO_PATH_OBSERVATION);
      await DataStorageLocal.removeDataFromAsync(Constant.DELETE_IMG);
      await DataStorageLocal.removeDataFromAsync(Constant.DELETE_VIDEO);
      await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_CURRENT);
      await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
      await DataStorageLocal.removeDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
      await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
      await DataStorageLocal.removeDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);
      await DataStorageLocal.removeDataFromAsync(Constant.CONFIGURED_WIFI_LIST);
      await DataStorageLocal.removeDataFromAsync(Constant.BEACON_INSTANCE_ID);

      await DataStorageLocal.removeDataFromAsync(Constant.PET_PARENT_OBJ);
      await DataStorageLocal.removeDataFromAsync(Constant.QUEST_VIDEO_UPLOAD_PROCESS_STARTED);
      await DataStorageLocal.removeDataFromAsync(Constant.QUEST_UPLOAD_DATA);
      await DataStorageLocal.removeDataFromAsync(Constant.SELECTED_QUESTIONNAIRE);
      await DataStorageLocal.removeDataFromAsync(Constant.ANSWERED_SECTIONS);
      await DataStorageLocal.removeDataFromAsync(Constant.CTW_QUESTIONNAIRE);

      await DataStorageLocal.removeDataFromAsync(Constant.ALL_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_ROLE_ID);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_ROLE_DETAILS);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_ROLE_CAPTURE_IMGS);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_ID);

  }

  const initialSessionStart = async () => {
    trace_inInitialScreen = await perf().startTrace('t_inInitialScreen');
  };

  const initialSessionStop = async () => {
    await trace_inInitialScreen.stop();
  };

  const stopFBTraceLogin = async () => {
    await trace_Login_API_Complete.stop();
  };

  const stopFBTraceUserDetails = async () => {
    await trace_Get_UserDetails_API_Complete.stop();
  };

  const getAppUpdateStatus = async () => {

    set_loaderPercent(33);
    let deviceAppVersion = VersionNumber.buildVersion;
    let osValue = Platform.OS === 'ios' ? 1 : 2
    let serviceCallsObj = await ServiceCalls.getAppUpdateStatus(osValue,deviceAppVersion);

    if(serviceCallsObj && serviceCallsObj.statusData) {
      set_loaderPercent(66);
      if(serviceCallsObj.responseData){
        // if(serviceCallsObj.responseData.appVersion && (parseFloat(serviceCallsObj.responseData.appVersion) > parseFloat(deviceAppVersion))) {          
          return serviceCallsObj.responseData;
        // } else {
        //   return undefined;
        // }
      } else {
        return undefined;
      }
    } 

    if(serviceCallsObj && serviceCallsObj.error) {
      set_loaderPercent(66);
      return undefined;
    }

    return undefined;

  };

  const getInternetStatus = async () => {

    // PushNotification.removeAllDeliveredNotifications();
    let internet = await internetCheck.internetCheck();
    firebaseHelper.logEvent(firebaseHelper.event_initial_internet_check, firebaseHelper.screen_appInitial, "Internet Check", 'Internet Status : ' + internet);
    if (internet) {

      set_internetStatus(true);
      getLoginStatus();
      await uploadMediaInitialisation();
      await uploadQstMediaInitialisation();
      // await removeTimer();
    } else {

      set_internetStatus(false);

    }
  }

  const uploadMediaInitialisation = async () => {
    await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
    await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED); 
  };

  const uploadQstMediaInitialisation = async () => {
    await DataStorageLocal.removeDataFromAsync(Constant.QUEST_VIDEO_UPLOAD_PROCESS_STARTED);
    await DataStorageLocal.removeDataFromAsync(Constant.SELECTED_QUESTIONNAIRE);
    await DataStorageLocal.removeDataFromAsync(Constant.QUEST_UPLOAD_DATA);
  };

  const removeTimer = async () => {
    PushNotification.cancelAllLocalNotifications();
    await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT);
  }

  const getLoginStatus = async () => {

    let userSkip = await DataStorageLocal.getDataFromAsync(Constant.IS_USER_SKIPPED);
    userSkip = JSON.parse(userSkip);
    set_loaderPercent(33);

    if (userSkip) {

        let appStatus = await getAppUpdateStatus();        
        let userEmail = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN);
        let userPsd = await DataStorageLocal.getDataFromAsync(Constant.USER_PSD_LOGIN);
        if (userEmail && userPsd && userPsd !== 'undefined') {
          validateAuthentication(appStatus);             
        } else {
          set_loaderPercent(99);
          navigation.navigate('LoginComponent',{"isAuthEnabled" : false, appStatus : appStatus}); 
        }

    } else {
      navigation.navigate('InitialTutorialComponent');
    }

  };

  const validateAuthentication = (appStatus) => {

    const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
    rnBiometrics.biometricKeysExist().then((resultObject) => {
      const { keysExist } = resultObject
      if (keysExist) {
        set_loaderPercent(99);
        navigation.navigate('LoginComponent',{"isAuthEnabled" : true, appStatus : appStatus});  
      } else {
        set_loaderPercent(99);
        navigation.navigate('LoginComponent',{"isAuthEnabled" : false, appStatus : appStatus}); 
      }
     })
     
  }

  const callLoginAfterNet = () => {
    getInternetStatus();
  };

  return (
    <InitialScreenUI
      loaderPercent={loaderPercent}
      internetStaus={internetStaus}
      callLoginAfterNet={callLoginAfterNet}
    />

  );

}

export default InitialScreenComponent;