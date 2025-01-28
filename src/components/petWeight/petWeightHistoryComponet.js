import React, { useState,useRef } from 'react';
import {BackHandler} from 'react-native';
import PetWeightHistoryUI from './petWeightHistoryUI';
import * as Constant from "./../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';

let trace_inWeightHistoryScreen;
let trace_WeightHistory_API_Complete;

const PetWeightHistoryComponent = ({navigation, route, ...props }) => {

    const [weightHistoryArray, set_weightHistoryArray] = useState([]);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMessage, set_popupMessage] = useState(undefined);
    const [isLoading, set_isLoading] = useState(true);
    const [selectedPet, set_selectedPet] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [noLogsShow, set_noLogsShow] = useState(undefined);
    const [petWeightUnit, set_petWeightUnit] = useState(undefined);
    const [popupAlert,set_popupAlert] = useState(undefined);
    const [weightDflt,set_weightDflt] = useState(undefined);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(1);

    React.useEffect(() => {
      
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_pet_history_weight);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_pet_history_weight, "User in Pet Weight History Screen", '');
        initialDataSetup();
      });

      const unsubscribe = navigation.addListener('blur', () => {
        initialSessionStop();
      });

      return () => {
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
          focus();
          unsubscribe();
          initialSessionStop();
        };

    }, [[route.params?.petObject,route.params?.petWeightUnit]]);

    const initialDataSetup = () => {

      if(route.params?.petObject){
        getWeightHistory(route.params?.petObject.petID);
        set_selectedPet(route.params?.petObject);
      } else {     
        getWeightHistory(selectedPet.petID);
      }

      if(route.params?.petWeightUnit){
          set_petWeightUnit(route.params?.petWeightUnit);
      }
    };

    const initialSessionStart = async () => {
      trace_inWeightHistoryScreen = await perf().startTrace('t_inWeightHistoryScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inWeightHistoryScreen.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const getWeightHistory = async (petID) => {

      trace_WeightHistory_API_Complete = await perf().startTrace('t_WeightHistory_API');
      let apiMethod = apiMethodManager.GET_PET_WEIGHT_HISTORY_DATE_RECORDS + petID;
      let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
      stopFBTrace();
      set_isLoading(false);
      isLoadingdRef.current = 0;
                
      if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
        
        if(apiService.data.petWeightHistories && apiService.data.petWeightHistories.length > 0){
          set_weightHistoryArray(apiService.data.petWeightHistories);  
          set_weightDflt(apiService.data.petWeightHistories[0]);
          set_noLogsShow(false);        
        } else {
          set_noLogsShow(true);
        }
 
      } else if(apiService && apiService.isInternet === false) {
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
        return;

      } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
        set_noLogsShow(true);
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
        firebaseHelper.logEvent(firebaseHelper.event_pet_weight_history_api_fail, firebaseHelper.screen_pet_history_weight, "Pet Weight History API Fail", 'error : '+apiService.error);

      } else {
        set_noLogsShow(true);
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
        firebaseHelper.logEvent(firebaseHelper.event_pet_weight_history_api_fail, firebaseHelper.screen_pet_history_weight, "Pet Weight History API Fail", 'Service Status : false');

      }

    };

    const stopFBTrace = async () => {
      await trace_WeightHistory_API_Complete.stop();
    };

    const navigateToPrevious = () => {  

      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        navigation.navigate('DashBoardService');
      }
        
    };

    const enterWeightAction = (value,item) => {

      set_noLogsShow(false);
      if(value==='edit'){
        firebaseHelper.logEvent(firebaseHelper.event_pet_weight_history_button_trigger, firebaseHelper.screen_pet_history_weight, "User clicked on Edit Weight Button", 'Previous Weight : '+item.weight);
        navigation.navigate('EnterWeightComponent',{selectedPet:selectedPet,value:value,weightitem:item,petWeightUnit:item.weightUnit});
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_pet_weight_history_button_trigger, firebaseHelper.screen_pet_history_weight, "User clicked on Add Weight Button", 'Pet Id : '+selectedPet.petID);
        navigation.navigate('EnterWeightComponent',{selectedPet:selectedPet,value:value,weightitem:item,petWeightUnit:petWeightUnit});
      }
      

    };

    const createPopup = (title,msg,isPop) => {
      set_popupAlert(title);
      set_popupMessage(msg);
      set_isPopUp(isPop);
      popIdRef.current = 1;
    };

    const popOkBtnAction = () => {
      set_popupAlert('');
      set_popupMessage(undefined);
      set_isPopUp(false);
      popIdRef.current = 0;
    };

    return (
        <PetWeightHistoryUI 
            weightHistoryArray = {weightHistoryArray}
            isLoading = {isLoading}
            isPopUp = {isPopUp}
            popupMessage = {popupMessage}
            noLogsShow = {noLogsShow}
            popupAlert = {popupAlert}
            weightDflt = {weightDflt}
            selectedPet = {selectedPet}
            navigateToPrevious = {navigateToPrevious}
            enterWeightAction = {enterWeightAction}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default PetWeightHistoryComponent;