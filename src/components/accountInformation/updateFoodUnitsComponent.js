import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import * as Constant from "./../../utils/constants/constant";
import UpdateFoodUnitsUI from './updateFoodUnitsUI.js';
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import moment from "moment";

let trace_inPUnits_Screen;

const UpdateFoodUnitsComponent = ({ navigation, route, ...props }) => {

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [isNavigate, set_isNavigate] = useState(undefined);
    const [userPs, set_userPs] = useState(undefined);
    const [prefObj, set_prefObj] = useState(undefined);
    const [prefTimeArray, set_prefTimeArray] = useState(undefined);
    const [isPrefUnitsView, set_isPrefUnitsView] = useState(false);
    const [prefTimeText, set_prefTimeText] = useState(undefined);
    const [unitsArray, set_UnitsArray] = useState(undefined);
    const [whtUnitsArray, set_whtUnitsArray] = useState(undefined);
    const [unitsText, set_unitsText] = useState(undefined);
    const [isUnitsView, set_isUnitsView] = useState(false);
    const [unitId, set_unitId] = useState(4);
    const [weightUnitsText, set_weightUnitsText] = useState(undefined);
    const [isWeightView, set_isWeightView] = useState(false);
    const [weightUnitId, set_weightUnitId] = useState(1)
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_PP_Food_Units);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_PP_Food_Units, "User in Update Food Units Screen", '');
        });
      
        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });
      
        return () => {
            focus();
            unsubscribe();
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    useEffect(() => {

        if(route.params?.prefObj) {
            generateTime();
            set_prefObj(route.params?.prefObj);
            set_unitsText(route.params?.prefObj.preferredFoodRecUnit)
            set_unitId(route.params?.prefObj.preferredFoodRecUnitId)
            set_prefTimeText(route.params?.prefObj.preferredFoodRecTime);
            set_weightUnitsText(route.params?.prefObj.preferredWeightUnit);
            set_weightUnitId(route.params?.prefObj.preferredWeightUnitId);
            getUnits();
        }
    }, [route.params?.prefObj]);

    const getUnits = async () => {

        let unitsArray = await getFeedingData('FOOD');
        let weightArray = await getFeedingData('WEIGHT');
        set_UnitsArray(unitsArray);
        set_whtUnitsArray(weightArray);
    }

    const generateTime = () => {

        const locale = 'en';
        const hours = [];
        moment.locale(locale);

        for(let hour = 7; hour < 22; hour++) {
            hours.push(moment({ hour }).format('H:mm'));
            hours.push(moment({hour,minute: 30}).format('H:mm'));
        }

        hours.push("22:00")
        set_prefTimeArray(hours)

    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPUnits_Screen = await perf().startTrace('t_inUpdatePrefferedUnits');
    };
    
    const initialSessionStop = async () => {
        await trace_inPUnits_Screen.stop();
    };

    /**
     * navigate back to the screen from where this screen is called
     */
    const navigateToPrevious = () => {
        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            navigation.navigate('AccountInfoService');
        } 
    };

    const getFeedingData = async (value) => {

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let getFeedingUnitsSOBJ = await ServiceCalls.getFoofdUnitsApi(value,token);
        set_isLoading(false);
        isLoadingdRef.current = 0; 

        if(getFeedingUnitsSOBJ && getFeedingUnitsSOBJ.logoutData){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }
            
        if(getFeedingUnitsSOBJ && !getFeedingUnitsSOBJ.isInternet){
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);  
            return;
        }
            
        if(getFeedingUnitsSOBJ && getFeedingUnitsSOBJ.statusData){

            if(getFeedingUnitsSOBJ.responseData){
                return getFeedingUnitsSOBJ.responseData.measurementUnits               
            } else {                 
                set_isNavigate(false);   
                createPopup('Alert','Details cannot be update. Please try after some time',true);        
            }
                        
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_get_foodUnits_api_fail, firebaseHelper.screen_PP_Food_Units, "Get FoodUnits Api Failed : ", 'Service Status : false');
            set_isNavigate(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE,'Details cannot be update. Please try after some time',true);              
        }
            
        if(getFeedingUnitsSOBJ && getFeedingUnitsSOBJ.error) {
            firebaseHelper.logEvent(firebaseHelper.event_get_foodUnits_api_fail, firebaseHelper.screen_PP_Food_Units, "Get FoodUnits Api Failed : ", 'Other_Info : Service error');
            set_isNavigate(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE,'Details cannot be update. Please try after some time',true);  
        }
    }

    // Saves the user new password for auto login
    const savePs = async (ps) => {
        await DataStorageLocal.saveDataToAsync(Constant.USER_PSD_LOGIN, "" + ps);
    };

    // Service call to save the changed password
    const submitAction = async () => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let userId = await DataStorageLocal.getDataFromAsync(Constant.USER_ID);
        let json = {
            ClientID: "" + clientIdTemp,
            UserId : userId,
            FirstName: prefObj && prefObj.firstName ? prefObj.firstName : '',
            LastName: prefObj && prefObj.lastName ? prefObj.lastName : '',
            PhoneNumber: prefObj && prefObj.phoneNumber ? prefObj.phoneNumber : '',
            SecondaryEmail: prefObj && prefObj.secondaryEmail ? prefObj.secondaryEmail : '',
            NotifyToSecondaryEmail: true,
            PetParentAddress : prefObj && prefObj.address ? prefObj.address : {},
            PreferredFoodRecTime : prefTimeText,
            PreferredWeightUnitId : weightUnitId,
            PreferredFoodRecUnitId :  unitId
        };

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        updatePrefTime(json,token);

    };

    const updatePrefTime = async (json,token) => {

        let cNameServiceObj = await ServiceCalls.changeClientInfo(json,token);
        set_isLoading(false);
        isLoadingdRef.current = 0; 

        if(cNameServiceObj && cNameServiceObj.logoutData){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }
            
        if(cNameServiceObj && !cNameServiceObj.isInternet){
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);  
            return;
        }
            
        if(cNameServiceObj && cNameServiceObj.statusData){

            if(cNameServiceObj.responseData && cNameServiceObj.responseData.Key){
                set_isNavigate(true);
                createPopup(Constant.ALERT_INFO,Constant.CHANGE_UNITS_SUCCESS,true);  
            } else {                 
                set_isNavigate(false);   
                createPopup('Alert',Constant.SERVICE_UPDATE_ERROR_MSG,true);        
            }
                        
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_update_foodUnits_api_fail, firebaseHelper.screen_PP_Food_Units, "Update FoodUnits Api Failed : ", 'Service Status : false');
            set_isNavigate(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_UPDATE_ERROR_MSG,true);              
        }
            
        if(cNameServiceObj && cNameServiceObj.error) {
            firebaseHelper.logEvent(firebaseHelper.event_update_foodUnits_api_fail, firebaseHelper.screen_PP_Food_Units, "Update FoodUnits Api Failed : ", 'Service Status : service error');
            set_isNavigate(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_UPDATE_ERROR_MSG,true);  
        }
    }

    const createPopup = (title,msg,value) => {
        popIdRef.current = 1;
        set_popUpTitle(title);
        set_popUpMessage(msg);
        set_isPopUp(value);
    };

    // Popup Ok button action
    const popOkBtnAction = (value,) => {
        set_isPopUp(value);
        popIdRef.current = 0;
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);
        if (isNavigate) {
            navigateToPrevious();
        }
    };

    const selectPrefTime = (value) => {

        if(value === 1) {
            set_isPrefUnitsView(false);
            set_isUnitsView(true);
            set_isWeightView(false);
        } else if(value === 2) {
            set_isPrefUnitsView(true);
            set_isUnitsView(false);
            set_isWeightView(false);
        } else {
            set_isUnitsView(false);
            set_isWeightView(true);
            set_isPrefUnitsView(false)
        }
        
    };

    const actionOnDropDown = (item,value) => {

        if(value === 1) {
            set_unitsText(item.unit);
            set_unitId(item.unitId)
            set_isPrefUnitsView(undefined);
            set_isUnitsView(undefined);
            set_isWeightView(undefined);
        } else if(value === 2) {
            set_prefTimeText(item);
            set_isPrefUnitsView(undefined);
            set_isUnitsView(undefined);
            set_isWeightView(undefined);
        }  else {
            set_weightUnitsText(item.unit);
            set_weightUnitId(item.unitId)
            set_isPrefUnitsView(undefined);
            set_isUnitsView(undefined);
            set_isWeightView(undefined);
        }
        
    };

    const onCancel = () => {
        set_isPrefUnitsView(undefined);
        set_isUnitsView(undefined);
        set_isWeightView(undefined);
    };

    return (
        <UpdateFoodUnitsUI
            isPopUp={isPopUp}
            popUpMessage={popUpMessage}
            popUpTitle={popUpTitle}
            isLoading={isLoading}
            prefObj = {prefObj}
            prefTimeArray = {prefTimeArray}
            isPrefUnitsView = {isPrefUnitsView}
            prefTimeText = {prefTimeText}
            unitsText = {unitsText}
            unitsArray = {unitsArray}
            isUnitsView = {isUnitsView}
            weightUnitId = {weightUnitId}
            weightUnitsText = {weightUnitsText}
            isWeightView = {isWeightView}
            whtUnitsArray = {whtUnitsArray}
            popOkBtnAction={popOkBtnAction}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            selectPrefTime = {selectPrefTime}
            actionOnDropDown = {actionOnDropDown}
            onCancel = {onCancel}
        />
    );

}

export default UpdateFoodUnitsComponent;