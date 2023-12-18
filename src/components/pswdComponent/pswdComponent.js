import React, { useState, useEffect } from 'react';
import { Platform, NativeModules, BackHandler } from 'react-native';
import * as Constant from "./../../utils/constants/constant";
import PswdUI from './pswdUI'
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as internetCheck from "./../../utils/internetCheck/internetCheck"
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';

let trace_inPasswordConponentScreen;
let trace_Password_API_Complete;

const PswdComponent = ({ navigation, route, ...props }) => {

    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [otpValue, set_otpValue] = useState(undefined);
    const [eMailValue, set_eMailValue] = useState(undefined);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [popUpBtnTitle, set_popUpBtnTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [secondaryEmail, set_secondaryEmail] = useState('');
    const [isNotification, set_isNotification] = useState(false);
    const [addressObj, set_addressObj] = useState({});
    const [date, set_Date] = useState(new Date());

    useEffect(() => {

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_pswd);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_pswd, "User in Password Screen", ''); 
          });
    
          const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
          });
      
          return () => {
            initialSessionStop();
            focus();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
          };
    
    }, []);

    /**
     * set the values from navigation to local variables
     */
    useEffect(() => {
        set_isFromScreen(route.params.isFromScreen);
        set_otpValue(route.params.otpValue);
        set_eMailValue(route.params.eMailValue);

        if (route.params?.secondaryEmail) {
            set_secondaryEmail(route.params?.secondaryEmail);
        }

        if (route.params?.isNotificationEnable) {
            set_isNotification(route.params?.isNotificationEnable);
        }

        if (route.params?.addressObj){
            set_addressObj(route.params?.addressObj);
        }

    }, [route.params.isFromScreen, route.params.otpValue, route.params.eMailValue,route.params?.secondaryEmail,route.params?.isNotificationEnable,,route.params?.addressObj]);

    const initialSessionStart = async () => {
        trace_inPasswordConponentScreen = await perf().startTrace('t_inPasswordConponentScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inPasswordConponentScreen.stop();
    };

    const stopFBTrace = async () => {
        await trace_Password_API_Complete.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    /**
     * Based on isFromScreen, navigate back to the screen from where this screen is called
     */
    const navigateToPrevious = () => {
        // navigation.navigate('OTPComponent');
    }

    /**
     * Based on isFromScreen, navigate to the screen to where it should be navigated and pass the isFromScreen value also
     */
    // const submitAction = async (psdValue,secondaryEmail,isNotification) => {
    const submitAction = async (psdValue) => {

        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_password, firebaseHelper.screen_pswd, "User clicked on Submitting the password : " + isFromScreen, 'Internet Status : ' + internet);
        if (!internet) {
            set_popUpTitle(Constant.ALERT_NETWORK);
            set_popUpBtnTitle('OK');
            set_popUpMessage(Constant.NETWORK_STATUS);
            set_isPopUp(true);
        } else {

            if (Platform.OS === 'android') {
                //If the user is using an android device
                NativeModules.Device.getDeviceName(psdValue, (convertedVal) => {
                    // serviceCall(convertedVal,secondaryEmail,isNotification);
                    serviceCall(convertedVal);
                });

            }
            else {
                //If the user is using an iOS device
                NativeModules.EncryptPassword.encryptPassword(psdValue, (value) => {
                    serviceCall(value);
                })
            }

        }

    }

    /**
     * @param {*} email
     * @param {*} otpValue
     * @param {*} psdValue
     */
    // const serviceCall = async (psdValue,secondaryEmail,isNotification) => {
    const serviceCall = async (psdValue) => {

        trace_Password_API_Complete = await perf().startTrace('t_SetPassword_API');
        set_isLoading(true);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let json = {};
        if(isFromScreen === 'registration') {

            json = {
                Email: eMailValue,
                VerificationCode: otpValue,
                Password: psdValue,
                SecondaryEmail:secondaryEmail,
                NotifyToSecondaryEmail:isNotification,
                PetParentAddress : addressObj
            };

        } else {
            json = {
                Email: eMailValue,
                VerificationCode: otpValue,
                Password: psdValue,
                SecondaryEmail:secondaryEmail,
                NotifyToSecondaryEmail:isNotification,
            };
        }
        // await psdRequest({ variables: { input: json } });
        creatPsd(json,token);

    };

    /**
     * This method returns the Password success / failure info from Login API
     * Success : returns value as true and Pet Parent will be navigated to Login Page
     * Failure : returns  value as false
     * When Failure alert, message will be shown to user
     */
    const creatPsd = async (json,token) => {

        let apiName = '';
        if (isFromScreen === 'registration') {
            apiName = 'RegisterUser';
        } else {
            apiName = 'ResetForgotPassword';
        }

        let psdServiceObj = await ServiceCalls.createPassword(json,apiName);
        set_isLoading(false);
        stopFBTrace();

        if(psdServiceObj && psdServiceObj.logoutData){
            firebaseHelper.logEvent(firebaseHelper.event_password_api_fail, firebaseHelper.screen_pswd, "Password api failed" + isFromScreen, 'Unautherised');
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }
        
        if(psdServiceObj && !psdServiceObj.isInternet){
            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,'OK');
            firebaseHelper.logEvent(firebaseHelper.event_password_api_fail, firebaseHelper.screen_pswd, "Password api failed" + isFromScreen, 'Internet : false');
            return;
        }

        if(psdServiceObj && psdServiceObj.statusData){
            await DataStorageLocal.removeDataFromAsync(Constant.USER_PSD_LOGIN);
            setTempUserId();  
            createPopup('Congratulations',isFromScreen === "forgotPassword" ? Constant.PASSWORD_CREATION_SUCCESS : Constant.REGISTRATION_SUCCESS,true,'LOGIN');        
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_password_api_fail, firebaseHelper.screen_pswd, "Password api failed" + isFromScreen, 'Email : ' + eMailValue);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,'OK'); 
        }

        if(psdServiceObj && psdServiceObj.error) {
            firebaseHelper.logEvent(firebaseHelper.event_password_api_fail, firebaseHelper.screen_pswd, "Password api failed" + isFromScreen, 'Email : ' + eMailValue);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,'OK'); 
        }
    };

    const createPopup = (title,msg,isPop,btnTitle) => {
        set_popUpTitle(title);
        set_popUpMessage(msg);
        set_isPopUp(isPop);
        set_popUpBtnTitle(btnTitle);
    };

    /**
     * by resetting the values, Pet parent will be navigated to Login Page
     */
    const popOkBtnAction = (value,) => {

        if (popUpMessage === Constant.PASSWORD_CREATION_SUCCESS || popUpMessage === Constant.REGISTRATION_SUCCESS) {
            navigation.navigate('LoginComponent');
        }
        set_isPopUp(value);
        set_popUpBtnTitle(undefined);
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);

    };

    /**
     * @param {*} email 
     * This will check the email formate.
     * When valid, next button will enable
     * Checks phone number length, should be 10.
     * When valid, saves the user entered email for backend validation
     */
    const validateEmail = (email,val) => {

        set_secondaryEmail(email.replace(/ /g, ''));
        var emailValid = /\S+@\S+\.\S+/;

        if(emailValid.test(email.replace(/ /g, ''))){
            set_isNotification(true);
            set_enableNotiUI(true);
        }else {
            set_isNotification(false);
            set_enableNotiUI(false);
        }

        if((email.length<1 || (email.length>1 && emailValid && emailValid.test(email.replace(/ /g, '')) && phNumber.length > 9))){
            set_isNxtBtnEnable(true);
        } else {
            set_isNxtBtnEnable(false);
        }

    };

    const setTempUserId = async () => {
        await DataStorageLocal.saveDataToAsync(Constant.USER_EMAIL_LOGIN_TEMP, eMailValue);
    }

    return (
        <PswdUI
            isFromScreen={isFromScreen}
            isPopUp={isPopUp}
            popUpMessage={popUpMessage}
            popUpTitle={popUpTitle}
            isLoading={isLoading}
            popUpBtnTitle={popUpBtnTitle}
            popOkBtnAction={popOkBtnAction}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
        />
    );

}

export default PswdComponent;