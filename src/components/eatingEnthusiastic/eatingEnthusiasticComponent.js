import React, { useState, useEffect,useRef } from 'react';
import {View,BackHandler} from 'react-native';
import EatingEnthusiasticUI from './eatingEnthusiasticUI';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as AppPetsData from '../../utils/appDataModels/appPetsModel.js';

const  EatingEnthusiasticComponent = ({navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [popupAlert, set_popupAlert] = useState(undefined);
    const [eatingEntArray, set_eatingEntArray] = useState(undefined);
    const [specieId, set_specieId] = useState("1");
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    let trace_inEatingEnthusiasmScreen;
    let trace_EatingEnthu_Get_Scale_API_Complete;

     // Setting the firebase screen name
     useEffect(() => {

        getDefaultPet();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            eatingEnthusiasmScaleScreenSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_eating_enthusiasm);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_eating_enthusiasm, "User in Eating Enthusiasm Screen", ''); 
        });

        const unsubscribe = navigation.addListener('blur', () => {
            eatingEnthusiasmScaleScreenSessionStop();
        });

        return () => {
          eatingEnthusiasmScaleScreenSessionStop();
          focus();
          unsubscribe();
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    const getDefaultPet = async () => {

        let defaultPet = AppPetsData.petsData.defaultPet;
        if(defaultPet){
            set_specieId(defaultPet.speciesId);
            set_isLoading(true);
            trace_EatingEnthu_Get_Scale_API_Complete = await perf().startTrace('t_Eating_Enthusiasm_Get_Scale_API');
            firebaseHelper.logEvent(firebaseHelper.event_get_pet_eating_enthusiasm_scale_api, firebaseHelper.screen_eating_enthusiasm, "Get eating enthusiasm scale api", 'Pet Id : '+defaultPet ? defaultPet.petID : '');
            isLoadingdRef.current = 1;
            getPetEatingEnthusiasmScale(defaultPet.speciesId);
        }
    };

    /**
     * This Method returns the EatingScale(DOG/CAT) success / failure info from EES API
     * Success : Data will be populated in the UI.
     * when error a proper message will be shown to user
     */

    const getPetEatingEnthusiasmScale = async (sID) => {

        let apiMethod = apiMethodManager.GET_EATING_ENTHUSIASMSCALE + sID;
        let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0; 
        stopFBTraceGetScale();
        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {

            if(apiService.data.eatingEnthusiasmScales && apiService.data.eatingEnthusiasmScales.length > 0){
                set_eatingEntArray(apiService.data.eatingEnthusiasmScales);
            } else {
                set_eatingEntArray([]);
            }
            
        } else if(apiService && apiService.isInternet === false) {
            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true);
            firebaseHelper.logEvent(firebaseHelper.event_get_pet_eating_enthusiasm_scale_api_failure, firebaseHelper.screen_eating_enthusiasm, "Get eating enthusiasm scale api failed", 'error : ', apiService.error.errorMsg);
            
        } else {

            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
            firebaseHelper.logEvent(firebaseHelper.event_get_pet_eating_enthusiasm_scale_api_failure, firebaseHelper.screen_eating_enthusiasm, "Get eating enthusiasm scale api failed", 'error : ', 'Status Failed');

        }

    };

    const eatingEnthusiasmScaleScreenSessionStart = async () => {
        trace_inEatingEnthusiasmScreen = await perf().startTrace('t_inEating_Enthusiasm_Scale_Screen');
    };
    
    const eatingEnthusiasmScaleScreenSessionStop = async () => {
        await trace_inEatingEnthusiasmScreen.stop();
    };

    const stopFBTraceGetScale = async () => {
        await trace_EatingEnthu_Get_Scale_API_Complete.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
         return true;
    };

    // Navigates to Dashboard - backbutton action
    const navigateToPrevious = () => {
        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            navigation.navigate('DashBoardService');
        }       
    }

    // After selection, creates the selected object and passes through the navigation to Select date class
    const submitAction = async (item) => {

        let eatObj =  await DataStorageLocal.getDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
        eatObj = JSON.parse(eatObj);
        let eatTempObj = {};

        if(eatObj){

            eatTempObj = {
                sliderValue : item.enthusiasmScaleId, 
                eDate : eatObj.eDate ? eatObj.eDate : '', 
                eTime : eatObj.eTime ? eatObj.eTime : '', 
            }

        } else {
                eatTempObj = {
                sliderValue : item.enthusiasmScaleId, 
                eDate : '', 
                eTime :'', 
            }
        }
        firebaseHelper.logEvent(firebaseHelper.event_pet_eating_enthusiasm_scale_selection_trigger, firebaseHelper.screen_eating_enthusiasm, "User selection in eating enthusiasm scale", ''+item.enthusiasmScaleId);
        await DataStorageLocal.saveDataToAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ,JSON.stringify(eatTempObj));
        navigation.navigate('SelectDateEnthusiasmComponent',{sliderObj:item.enthusiasmScaleId});
    };

    const createPopup = (title,msg,isPop) => {
        set_popupAlert(title);
        set_popupMsg(msg);
        set_isPopUp(isPop);
        popIdRef.current = 1;
    };

    // Popup Btn action, By setting false, Popup will dissappear from the screen
    const popOkBtnAction = (value) => {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popupAlert(undefined);
        set_popupMsg(undefined);
        navigateToPrevious();
    }

    return (
        <EatingEnthusiasticUI 
            isLoading = {isLoading}
            isPopUp = {isPopUp}
            popupMsg = {popupMsg}
            specieId = {specieId}
            eatingEntArray = {eatingEntArray}
            submitAction = {submitAction}
            navigateToPrevious = {navigateToPrevious}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default EatingEnthusiasticComponent;