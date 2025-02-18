import React, { useState, useEffect,useRef } from 'react';
import {BackHandler} from 'react-native';
import TimerLogsUI from './timerLogsUI';
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';
import perf from '@react-native-firebase/perf';

let trace_inTimerLogsScreen;

const  TimerLogsComponent = ({navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [timerLogsArray, set_timerLogsArray] = useState(undefined);
    const [timerPets, set_timerPets] = useState(undefined);
    const [isFrom, set_isFrom] = useState(undefined);
    const [noLogsShow, set_noLogsShow] = useState(false);

    let isLoadingdRef = useRef(0);

    useEffect(() => {

      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_timer_logs);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_timer_logs, "User in Timer Logs Screen", '');
      getTimerLogDetails();

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
        initialSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };

    }, []);

    useEffect(() => {

      if(route.params?.timerPets){
        set_timerPets(route.params?.timerPets);
      }

      if(route.params?.isFrom){
        set_isFrom(route.params?.isFrom);
      }

    }, [route.params?.timerPets,route.params?.isFrom]);

    const initialSessionStart = async () => {
      trace_inTimerLogsScreen = await perf().startTrace('t_inTimerLogsScreen');
    };

    const initialSessionStop = async () => {
        await trace_inTimerLogsScreen.stop();
    };

    const handleBackButtonClick = () => {
      navigateToPrevious();
      return true;
    };

    const getTimerLogDetails = async () => {
      set_isLoading(true);
      isLoadingdRef.current = 1;
      let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID,);
      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN,);

      let json = {
        ClientID: "" + client,
      };
        getTimerDetails(json,token);
    };

    const getTimerDetails = async (json,token) => {

      let apiMethod = apiMethodManager.GET_TIMER_LOGS;
      let apiService = await apiRequest.postData(apiMethod,json,Constant.SERVICE_MIGRATED,navigation);
      set_isLoading(false);
      isLoadingdRef.current = 0;
              
      if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
              
        if(apiService.data){
          set_timerLogsArray(apiService.data.Value);
          if(apiService.data.Value.length>0){
            set_noLogsShow(false);
          } else {
            set_noLogsShow(true);
          }
        }
      
      } else if(apiService && apiService.isInternet === false) {
        set_noLogsShow(true);
      } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
        set_noLogsShow(true);
      } else {
        set_noLogsShow(true);
      }

    };

    const navigateToPrevious = () => {  
      
      if(isLoadingdRef.current === 0){

        if(isFrom === 'TimerWidget'){
          navigation.navigate('DashBoardService');  
        } else {
          navigation.navigate('TimerComponent');  
        }

      }
 
    };

    return (
        <TimerLogsUI 
            isLoading = {isLoading}
            loaderMsg = {loaderMsg}
            timerLogsArray = {timerLogsArray}
            timerPets = {timerPets}
            noLogsShow = {noLogsShow}
            navigateToPrevious = {navigateToPrevious}
        />
    );

  }
  
  export default TimerLogsComponent;