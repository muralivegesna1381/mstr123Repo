import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import * as Constant from "./../../utils/constants/constant";
import ChangePasswordUI from './changePasswordUI';
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';

let trace_inChangePswd_Screen;
let trace_ChangePswd_API_Complete;

const ChangePasswordComponent = ({ navigation, route, ...props }) => {

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [isNavigate, set_isNavigate] = useState(undefined);
    const [userPs, set_userPs] = useState(undefined);
    const [popupId, set_popupId] = useState(0);
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

        firebaseHelper.reportScreen(firebaseHelper.screen_change_password);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_change_password, "User in Change Password Screen", '');
        initialSessionStart();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        return () => {
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inChangePswd_Screen = await perf().startTrace('t_inChangePasswordScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inChangePswd_Screen.stop();
    };

    const stopFBTrace = async () => {
        await trace_ChangePswd_API_Complete.stop();
    };

    /**
     * navigate back to the screen from where this screen is called
     */
    const navigateToPrevious = () => {

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            navigation.navigate('AccountInfoService');
        } 
        
    };

    // Saves the user new password for auto login
    const savePs = async (ps) => {
        await DataStorageLocal.saveDataToAsync(Constant.USER_PSD_LOGIN, "" + ps);
    };

    // Service call to save the changed password
    const submitAction = async (currentPsdEncrypt, newPsdEncrypt) => {

        set_userPs(newPsdEncrypt);
        let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let json = {
            ClientID: "" + clientIdTemp,
            Password: currentPsdEncrypt,
            NewPassword: newPsdEncrypt,
        };

        trace_ChangePswd_API_Complete = await perf().startTrace('t_ChangePassword_API');
        changePswd(json);

    };

    const changePswd = async (json) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;

        let apiMethodManage = apiMethodManager.CHANGE_PASSWORD;
        let apiService  = await apiRequest.postData(apiMethodManage,json,Constant.SERVICE_MIGRATED,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        stopFBTrace();
        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
            if(apiService.data.Key) {

                set_isNavigate(true);
                await DataStorageLocal.removeDataFromAsync(Constant.USER_PSD_LOGIN);
                createPopup('Success',Constant.CHANGE_PSWD_SUCCESS,true,0); 
                savePs(userPs);  

            } else {
                createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.data.Value,true,0);   
            }
        } else if(apiService && apiService.isInternet === false) {

            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,0);             
            firebaseHelper.logEvent(firebaseHelper.event_change_password_api_fail, firebaseHelper.screen_change_password, "Change Password Api Failed : ", 'Other_Info : Internet : No Internet');
            
        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true,0);
            firebaseHelper.logEvent(firebaseHelper.event_account_main_api_fail, firebaseHelper.screen_account_main, "Account Api Failed", 'error : '+apiService.error.errorMsg);
            
        } else {
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_UPDATE_ERROR_MSG,true,0); 
        }
    }

    const createPopup = (title,msg,value,popId) => {
        popIdRef.current = 1;
        set_popUpTitle(title);
        set_popUpMessage(msg);
        set_isPopUp(value);
        set_popupId(popId);
    };

    // Popup Ok button action
    const popOkBtnAction = async (value,) => {

        set_isPopUp(value);
        popIdRef.current = 0;
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);
        if (isNavigate) {
            navigateToPrevious();
        }
    };

    return (
        <ChangePasswordUI
            isPopUp={isPopUp}
            popUpMessage={popUpMessage}
            popUpTitle={popUpTitle}
            isLoading={isLoading}
            popOkBtnAction={popOkBtnAction}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
        />
    );

}

export default ChangePasswordComponent;