import React, { useState, useEffect } from 'react';
import {View,BackHandler} from 'react-native';
import SelectDateEnthusiasmUI from './selectDateEnthusiasmUI';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import moment from 'moment';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';

const  SelectDateEnthusiasmComponent = ({navigation, route, ...props }) => {

    const [eatingObj, set_eatingObj] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [popupAlert, set_popupAlert] = useState(undefined)

    let trace_inEatingEnthusiasm_Date_Screen;

    // Setting the firebase screen name
    useEffect(() => {

        getEatingData(); 
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            firebaseHelper.reportScreen(firebaseHelper.screen_eating_enthusiasm_date);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_eating_enthusiasm_date, "User in Eating Enthusiasm Date selection Screen", '');
            eatingEnthusiasmDateSelectionScreenSessionStart();
        });

        const unsubscribe = navigation.addListener('blur', () => {
            eatingEnthusiasmDateSelectionScreenSessionStop();
        });

         return () => {
            focus();
            unsubscribe();
            eatingEnthusiasmDateSelectionScreenSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };

    }, []);

    // Setting the Eating values selected in the previous screen
    const getEatingData = async () => {
        let eatObj =  await DataStorageLocal.getDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
        eatObj = JSON.parse(eatObj);
        // firebaseHelper.logEvent(firebaseHelper.event_get_scale_selection_value, firebaseHelper.screen_eating_enthusiasm_date, "User selection in eating enthusiasm scale in main page", '');
        if(eatObj){
            set_eatingObj(eatObj);
        }
    }

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const eatingEnthusiasmDateSelectionScreenSessionStart = async () => {
        trace_inEatingEnthusiasm_Date_Screen = await perf().startTrace('t_inEating_Enthusiasm_Date_Selection_Screen');
    };
    
    const eatingEnthusiasmDateSelectionScreenSessionStop = async () => {
        await trace_inEatingEnthusiasm_Date_Screen.stop();
    };

    // Saving the date selected value
    const submitAction = async (dateValue) => {

        let eatObj =  await DataStorageLocal.getDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
        eatObj = JSON.parse(eatObj);
        let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        petObj = JSON.parse(petObj);
        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        
        var data = [
            // [0, 6, "Good night"], 
            [6, 12, "Good morning"],          
            [12, 18, "Good afternoon"],
            [18, 24, "Good evening"]
        ];

        let hr = new Date(dateValue).getHours();
        let value = 'Good morning';
        let feedingId = 1;
        for(var i = 0; i < data.length; i++){
            if(hr >= data[i][0] && hr <= data[i][1]){
                value = data[i][2];
            }
        }

        if(value === "Good morning") {
            feedingId = 1;
        } else if(value === "Good afternoon") {
            feedingId = 2;
        } else {
            feedingId = 3;
        }

        if (client) {

            set_isLoading(true);
            // isLoadingdRef.current = 1;
            let finalJson = {
                "feedingEnthusiasmScaleId": null,
                "petId": petObj.petID,
                "enthusiasmScaleId": eatObj.sliderValue,
                "feedingTimeId": feedingId,
                "feedingDate": moment(new Date(dateValue)).utcOffset("+00:00").format("YYYY-MM-DD HH:mm"),
                "petParentId": parseInt(client)
            }
            firebaseHelper.logEvent(firebaseHelper.event_get_scale_selection_value, firebaseHelper.screen_eating_enthusiasm_date, "User date selection object value", '');
            submitPetFeedingTime(finalJson);
        }

    };

    const submitPetFeedingTime = async (finalJson) => {

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let sPetFeedtimeServiceObj = await ServiceCalls.addPetFeedingTime(finalJson,token);
        set_isLoading(false);

        if(sPetFeedtimeServiceObj && sPetFeedtimeServiceObj.logoutData){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }
          
        if(sPetFeedtimeServiceObj && !sPetFeedtimeServiceObj.isInternet){
            createPopup(Constant.NETWORK_STATUS,Constant.ALERT_NETWORK,true);  
            return;
        }
          
        if(sPetFeedtimeServiceObj && sPetFeedtimeServiceObj.statusData){
            createPopup(Constant.ALERT_INFO,Constant.EATING_SUBMIT_POP_MSG,true);  
            await DataStorageLocal.removeDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);        
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_submit_pet_feeding_time_api_failure, firebaseHelper.screen_eating_enthusiasm_time, "Submit Pet Feeding Time Api failed", '');
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);                          
        }
          
        if(sPetFeedtimeServiceObj && sPetFeedtimeServiceObj.error) {
            let errors = sPetFeedtimeServiceObj.error.length > 0 ? sPetFeedtimeServiceObj.error[0].code : '';
            firebaseHelper.logEvent(firebaseHelper.event_submit_pet_feeding_time_api_failure, firebaseHelper.screen_eating_enthusiasm_time, "Submit Pet Feeding Time Api failed", 'error : '+errors);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true); 
        }

    };

    const createPopup = (title,msg,isPop) => {
        set_popupAlert(title);
        set_popupMsg(msg);
        set_isPopUp(isPop);
    };

    // Popup action
    const popOkBtnAction = () => {
        if (popupMsg === Constant.EATING_SUBMIT_POP_MSG) {
            navigation.navigate('DashBoardService');
        }
        set_isLoading(false);
        set_isPopUp(false);
        set_popupAlert(undefined);
        set_popupMsg(undefined);
    };

    // Navigates to previous screen
    const navigateToPrevious = () => {        
        navigation.navigate("EatingEnthusiasticComponent");     
    };

    return (

        <SelectDateEnthusiasmUI 
            eatingObj = {eatingObj}
            isLoading = {isLoading}
            isPopUp = {isPopUp}
            popupAlert = {popupAlert}
            popupMsg = {popupMsg}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default SelectDateEnthusiasmComponent;