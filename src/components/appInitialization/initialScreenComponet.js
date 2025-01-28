import React, { useState, useEffect } from 'react';
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "../../utils/constants/constant";
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import InitialScreenUI from './initialScreenUI';
import SplashScreen from 'react-native-splash-screen';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Platform } from 'react-native';
import VersionNumber, { appVersion } from 'react-native-version-number';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as clearAPIDAta from './../../utils/dataComponent/savedAPIData.js';

var PushNotification = require("react-native-push-notification");

const InitialScreenComponent = ({ navigation, route, ...props }) => {

  const [loaderPercent, set_loaderPercent] = useState(0);
  const [internetStaus, set_internetStatus] = useState(true);

  useEffect(() => {

    set_loaderPercent(0);
    firebaseHelper.reportScreen(firebaseHelper.screen_appInitial);

    setTimeout(() => {
      SplashScreen.hide();
      getInternetStatus();  
    }, 1000)

    clearAppData();

  }, []);

  const clearAppData = async () => {

    await clearAPIDAta.clearAPIDAta();

  }

  const getAppUpdateStatus = async () => {

    set_loaderPercent(33);
    let deviceAppVersion = VersionNumber.buildVersion;
    let osValue = Platform.OS === 'ios' ? 1 : 2;

    let apiMethod = apiMethodManager.APP_UPDATE_STATUS + osValue + '/' + deviceAppVersion;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);

    set_loaderPercent(66);
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      return apiService.data;
    }  else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      set_loaderPercent(66);
      return undefined;  
    } else {
      set_loaderPercent(66);
      return undefined;
    }

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