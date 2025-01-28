import React, { useState, useEffect,useRef } from 'react';
import { View, BackHandler } from 'react-native';
import ForgotPasswordUi from "./forgotPasswordUi";
import * as Constant from "./../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as clearAPIDAta from './../../utils/dataComponent/savedAPIData.js';

let trace_inForgotPasswordcreen;
let trace_Forgot_Password_API_Complete;

const ForgotPasswordComponent = ({ navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [userMessage, set_userMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [alertTitle, set_alertTitle] = useState('');
    const [eMail, set_eMail] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    React.useEffect(() => {

        firebaseHelper.reportScreen(firebaseHelper.screen_forgrotPassword);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_forgrotPassword, "User in Forgot Password Screen", ''); 
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            FPSessionStart();
        });

        const unsubscribe = navigation.addListener('blur', () => {
            FPSessionStop();
        });

        return () => {
            FPSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
            focus();
            unsubscribe();
        };
        
    }, []);
    
    // Setting the user email
    useEffect(() => {

        if (route.params?.userEmail) {
            set_eMail(route.params?.userEmail);
        }

    }, [route.params?.userEmail]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const FPSessionStart = async () => {
        trace_inForgotPasswordcreen = await perf().startTrace('t_inForgotPasswordScreen');
    };

    const FPSessionStop = async () => {
        await trace_inForgotPasswordcreen.stop();
    };

    // navigate back to the screen from where this screen is called
    const navigateToPrevious = async () => {

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            let userEmail = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN);
            let userPsd = await DataStorageLocal.getDataFromAsync(Constant.USER_PSD_LOGIN);
            const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
            rnBiometrics.biometricKeysExist().then((resultObject) => {
                const { keysExist } = resultObject
                if (keysExist && userEmail && userPsd && userPsd !== 'undefined') {
                navigation.navigate('LoginComponent',{"isAuthEnabled" : true});                  
                } else {
                navigation.navigate('LoginComponent',{"isAuthEnabled" : false});
                }
            })
        } 
        
    };

    // submit email and initiates the API call
    const submitAction = (email) => {
        set_eMail(email);
        serviceCall(email);
    }

    /**
     * Service call
     * @param {*} email
     */
    const serviceCall = async (email) => {
        set_isLoading(true);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        isLoadingdRef.current = 1;
        let json = {
            Email: email,
        };
        // trace_Forgot_Password_API_Complete = await perf().startTrace('t_Forgot_Password_API');
        forgotPSWDRequest(json,token,email);
    };

    /**
     * This Method returns the forgot Password success / failure info from API
     * Success : returns key value as true
     * Failure : returns Key value as false
     * When Failure alert message will be shown to user
     */
    const forgotPSWDRequest = async (json,token,email) => {

        let apiMethod = apiMethodManager.FORGOT_PASSWORD;
        let apiService = await apiRequest.postData(apiMethod,json,Constant.SERVICE_MIGRATED);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
        
            if (apiService.data.Key) {
                navigation.navigate('OTPComponent', { isFromScreen: 'forgotPassword', eMailValue: email });
            } else if (apiService.data.Value && apiService.data.Value !== '') {
                createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.data.Value,true); 
            } else {
                createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true); 
                firebaseHelper.logEvent(firebaseHelper.event_forgot_password_api_fail, firebaseHelper.screen_forgrotPassword, "Forgot passwoed Api Failed - wrong emailid", 'Email : ' + eMail);
            }
          
        } else if(apiService && apiService.isInternet === false) {

            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
            return;

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true); 
            firebaseHelper.logEvent(firebaseHelper.event_forgot_password_api_fail, firebaseHelper.screen_forgrotPassword, "Forgot passwoed Api Failed", 'error : ' + apiService.error.errorMsg);
            
        } else {
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true); 
            firebaseHelper.logEvent(firebaseHelper.event_forgot_password_api_fail, firebaseHelper.screen_forgrotPassword, "Forgot passwoed Api Failed - wrong emailid", 'Email : ' + eMail);

        }

    };

    const createPopup = (title,msg,isPop) => {
        set_alertTitle(title);
        set_userMessage(msg);
        set_isPopUp(isPop);
        popIdRef.current = 1;
    };

    // By setting false, Popup will dissappear from the screen
    const popOkBtnAction = (value) => {
        set_isPopUp(value);
        popIdRef.current = 0;
        set_alertTitle(undefined);
        set_userMessage(undefined);
    };

    return (
        <ForgotPasswordUi
            isLoading={isLoading}
            userMessage={userMessage}
            isPopUp={isPopUp}
            alertTitle={alertTitle}
            eMail={eMail}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction={popOkBtnAction}
        />
    );

}

export default ForgotPasswordComponent;