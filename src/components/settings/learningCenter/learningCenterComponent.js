import React, { useState, useEffect, useRef } from 'react';
import {View,BackHandler} from 'react-native';
import LearningCenterUI from './learningCenterUI';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../../utils/getServicesData/getServicesData.js';

const LearningCenterComponent = ({navigation, route, ...props }) => {

  const [faqsArray, set_faqsArray] = useState(undefined);
  const [videosArray, set_videosArray] = useState(undefined);
  const [userGuidesArray, set_userGuidesArray] = useState(undefined);
  const [isLoading, set_isLoading] = useState(false);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popupMsg, set_popupMsg] = useState(undefined);
  const [popUpAlert , set_popUpAlert] = useState('Alert');

  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);

  let trace_inLearing_Center_Screen;

  useEffect(() => {

    learningCenterSessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_learning_center);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_learning_center, "User in Learning Center Screen", ''); 
    getsupportDocs();  
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    return () => {
      learningCenterSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
     
  }, []);
  
  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  const getsupportDocs = async () => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

    let supportMetObj = await ServiceCalls.getSupportDocs(token);
    set_isLoading(false);
    isLoadingdRef.current = 0;

    if(supportMetObj && supportMetObj.logoutData){
      firebaseHelper.logEvent(firebaseHelper.event_Learning_center_page_api_failure, firebaseHelper.screen_learning_center, "Get Support Docs Api Failed",'Unautherised');
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if(supportMetObj && !supportMetObj.isInternet){
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
      firebaseHelper.logEvent(firebaseHelper.event_Learning_center_page_api_failure, firebaseHelper.screen_learning_center, "Get Support Docs Api Failed",'Internet : false');
      return;
    }

    if(supportMetObj && supportMetObj.statusData){
      if(supportMetObj.responseData){
        set_faqsArray(supportMetObj.responseData.fags);
        set_videosArray(supportMetObj.responseData.videos);
        set_userGuidesArray(supportMetObj.responseData.userGuides);
      } 
    } else {
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      firebaseHelper.logEvent(firebaseHelper.event_Learning_center_page_api_failure, firebaseHelper.screen_learning_center, "Get Support Docs Api Failed",'Service Status : false');
    }

    if(supportMetObj && supportMetObj.error) {
      let errors = supportMetObj.error.length > 0 ? supportMetObj.error[0].code : '';
      firebaseHelper.logEvent(firebaseHelper.event_Learning_center_page_api_failure, firebaseHelper.screen_learning_center, "Get Support Docs Api Failed",'error : '+errors); 
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);  
    }

  };

  const learningCenterSessionStart = async () => {
    trace_inLearing_Center_Screen = await perf().startTrace('t_Learning_Center_Screen');
  };
    
  const learningCenterSessionStop = async () => {
    await trace_inLearing_Center_Screen.stop();
  };

    /**
     * Will be navigated to Support page
     */
  const navigateToPrevious = () => {  
    if(isLoadingdRef.current === 0 && popIdRef.current === 0){
      firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_learning_center, "User clicked on back button to navigate to SupportComponent", '');
      navigation.navigate("SupportComponent");
    }
  };

  const createPopup = (title,msg,isPop) => {
    set_popUpAlert(title);
    set_popupMsg(msg);
    set_isPopUp(isPop);
    popIdRef.current = 1;
  };

  const popOkBtnAction = () => {
    set_popUpAlert('');
    set_popupMsg('');
    set_isPopUp(false);
    popIdRef.current = 0;
  };

  return (
    <LearningCenterUI 
      faqsArray = {faqsArray}
      userGuidesArray = {userGuidesArray}
      videosArray = {videosArray}
      isLoading = {isLoading}
      isPopUp = {isPopUp}
      popupMsg = {popupMsg}
      popUpAlert = {popUpAlert}
      navigateToPrevious = {navigateToPrevious}
      popOkBtnAction = {popOkBtnAction}
    />
  );

}
  
  export default LearningCenterComponent;