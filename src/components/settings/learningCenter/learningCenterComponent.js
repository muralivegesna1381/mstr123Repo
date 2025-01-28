import React, { useState, useEffect, useRef } from 'react';
import {View,BackHandler} from 'react-native';
import LearningCenterUI from './learningCenterUI';
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';

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

    let apiMethod = apiMethodManager.GET_SUPPORT_DOCS;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    set_isLoading(false);
    isLoadingdRef.current = 0;
        
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {

      if(apiService.data.supportMaterials) {
        set_faqsArray(apiService.data.supportMaterials.fags);
        set_videosArray(apiService.data.supportMaterials.videos);
        set_userGuidesArray(apiService.data.supportMaterials.userGuides);
      }

    } else if(apiService && apiService.isInternet === false) {

      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
      firebaseHelper.logEvent(firebaseHelper.event_Learning_center_page_api_failure, firebaseHelper.screen_learning_center, "Get Support Docs Api Failed",'Internet : false');

    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

      firebaseHelper.logEvent(firebaseHelper.event_Learning_center_page_api_failure, firebaseHelper.screen_learning_center, "Get Support Docs Api Failed",'error : '+apiService.error); 
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);  
            
    } else {

      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      firebaseHelper.logEvent(firebaseHelper.event_Learning_center_page_api_failure, firebaseHelper.screen_learning_center, "Get Support Docs Api Failed",'Service Status : false');

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