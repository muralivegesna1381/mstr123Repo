import React, { useState, useEffect,useRef } from 'react';
import {BackHandler} from 'react-native';
import FeedbackUI from './feedbackUI';
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';

const FeedbackComponent = ({navigation, route, ...props }) => {

    const [feedbackArray, set_feedbackArray] = useState([])
    const [isLoading, set_isLoading] = useState(true);
    const [date, set_Date] = useState(new Date());
    const [noLogsShow, set_noLogsShow] = useState(true);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [popupAlert, set_popupAlert] = useState(undefined);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(1);
    let trace_inFeedback_Screen;
    let trace_Get_Feedback_Details_Api_Complete;

    React.useEffect(() => {

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        feedbackSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_feedback);   
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_feedback, "User in Feedback Screen", '');
        initialiseData();
      });

      const unsubscribe = navigation.addListener('blur', () => {
        feedbackSessionStop();
      });
  
      return () => {
        focus();
        unsubscribe();
        feedbackSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };
      
    }, []);

    const initialiseData = async () => {

      trace_Get_Feedback_Details_Api_Complete = await perf().startTrace('t_Get_Feedback_Details_Api');
      let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
      let getfeedbackServiceObj = await ServiceCalls.getFeedbackByPetParent(client,token);

      set_isLoading(false);
      isLoadingdRef.current = 0;
      stopFBTraceGetFeedbackByPetParent();

      if(getfeedbackServiceObj && getfeedbackServiceObj.logoutData){
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
        return;
      }
      
      if(getfeedbackServiceObj && !getfeedbackServiceObj.isInternet){
          createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
          return;
      }

      if(getfeedbackServiceObj && getfeedbackServiceObj.statusData){
          if(getfeedbackServiceObj.responseData && getfeedbackServiceObj.responseData.length > 0){
            set_feedbackArray(getfeedbackServiceObj.responseData);
            set_noLogsShow(false);             
          } else {
            set_noLogsShow(true);
          }
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_feedback_details_api_failure, firebaseHelper.screen_feedback, "Getting Feedback details API Fail", 'Service Status : false');
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      }

      if(getfeedbackServiceObj && getfeedbackServiceObj.error) {
        let errors = getfeedbackServiceObj.error.length > 0 ? getfeedbackServiceObj.error[0].code : '';
        firebaseHelper.logEvent(firebaseHelper.event_feedback_details_api_failure, firebaseHelper.screen_feedback, "Getting Feedback details API Fail", 'error : '+errors);
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      }
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

      // Navigates to Dashboard
    const navigateToPrevious = () => {  
      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        navigation.pop();
      }      
    };

    // Navigates to Submit New feedback
    const nextButtonAction = () => {
      navigation.navigate('SendFeedbackComponent');
    }

    // Navigates to view Feedback record selected
    const actionOnRow = (item) => {
      navigation.navigate('ViewFeedbackComponent',{feedbackItem:item});
    }

    const feedbackSessionStart = async () => {
      trace_inFeedback_Screen = await perf().startTrace('t_Feedback_Screen');
    };
  
    const feedbackSessionStop = async () => {
      await trace_inFeedback_Screen.stop();
    };

    const stopFBTraceGetFeedbackByPetParent = async () => {
      await trace_Get_Feedback_Details_Api_Complete.stop();
    };

    const createPopup = (title,msg,isPop) => {
      set_popupAlert(title);
      set_popupMsg(msg);
      set_isPopUp(isPop);
      popIdRef.current = 1;
    };

    const popOkBtnAction = () => {
      set_isPopUp(false);
      popIdRef.current = 0;     
    };

    return (
        <FeedbackUI 
            feedbackArray = {feedbackArray}
            isLoading = {isLoading}
            noLogsShow = {noLogsShow}
            isPopUp = {isPopUp}
            popupMsg = {popupMsg}
            popupAlert = {popupAlert}
            navigateToPrevious = {navigateToPrevious}
            nextButtonAction = {nextButtonAction}
            actionOnRow = {actionOnRow}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default FeedbackComponent;