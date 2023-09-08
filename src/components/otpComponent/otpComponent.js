import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import * as Constant from "./../../utils/constants/constant";
import OTPUI from './otpUI'
import * as firebaseHelper from '././../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";

let trace_inOTPScreen;

const OTPComponent = ({ navigation, route, ...props }) => {

    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [eMailValue, set_eMailValue] = useState(undefined);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [alertTitle, set_alertTitle] = useState('');
    const [date, set_Date] = useState(new Date());
    const [secondaryEmail, set_secondaryEmail] = useState('');
    const [isNotification, set_isNotification] = useState(false);
    const [addressObj, set_addressObj] = useState({});

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_otp);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_otp, "User in OTP Screen", '');
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

    /**
   * isFromScreen : registration, forgotPassword, changePassword
   */

    useEffect(() => {
        if (route.params?.eMailValue) {
            set_eMailValue(route.params?.eMailValue)
        }

        if (route.params?.isFromScreen) {
            set_isFromScreen(route.params?.isFromScreen);
        }

        if (route.params?.secondaryEmail) {
            set_secondaryEmail(route.params?.secondaryEmail);
        }

        if (route.params?.isNotificationEnable) {
            set_isNotification(route.params?.isNotificationEnable);
        }

        if(route.params?.addressObj) {
            set_addressObj(route.params?.addressObj);
        }

    }, [route.params?.isFromScreen, route.params?.eMailValue,route.params?.secondaryEmail,route.params?.isNotificationEnable,route.params?.addressObj]);

    const initialSessionStart = async () => {
        trace_inOTPScreen = await perf().startTrace('t_inOTPScreen');
    };

    const initialSessionStop = async () => {
        await trace_inOTPScreen.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    /**
     * Based on isFromScreen, navigates back to the screen from where this screen is called
     */
    const navigateToPrevious = () => {

        if (isLoadingdRef.current === 0 && popIdRef.current === 0) {

            if (isFromScreen === 'registration') {
                navigation.navigate('PetParentAddressComponent');
            } else if (isFromScreen === 'forgotPassword') {
                navigation.navigate('ForgotPasswordComponent');
            } 
        }

    }

    /**
     * OTP entered by the pet parent will be validated usin API
     * Along with OTP code, email also sent to API
     * This Method returns the OTP success / failure info from Login API
     * Success : returns email,token,clientid will be saved and can be used across the app
     * when error a proper message will be shown to user
     */
    const submitAction = async (otpValue1) => {

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        set_isLoading(true);
        isLoadingdRef.current = 1;
        let json = {
            Email: eMailValue,
            VerificationCode: otpValue1,
        };

        let apiName = '';
        if (isFromScreen === 'registration') {
            apiName = 'RegisterUserValidateEmailVerificationCode';
        } else {
            apiName = 'ForgotPasswordValidateEmailVerificationCode';
        }

        let otpServiceObj = await ServiceCalls.validateOTPBackend(json, apiName);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        if (otpServiceObj && otpServiceObj.logoutData) {
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            firebaseHelper.logEvent(firebaseHelper.event_OTP_api_fail, firebaseHelper.screen_otp, "OTP Api Failed", 'Unatherised');
            return;
        }

        if (otpServiceObj && !otpServiceObj.isInternet) {
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true);
            firebaseHelper.logEvent(firebaseHelper.event_OTP_api_fail, firebaseHelper.screen_otp, "OTP Api Failed", 'Internet : false');
            return;
        }

        if (otpServiceObj && otpServiceObj.statusData) {
            set_popUpMessage('');
            navigation.navigate('PswdComponent', { isFromScreen: isFromScreen, otpValue: otpValue1, eMailValue: eMailValue, secondaryEmail: secondaryEmail, isNotificationEnable:isNotification, addressObj:addressObj });
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_OTP_api_fail, firebaseHelper.screen_otp, "OTP Api Failed - Wrong OTP Value", 'Email : ' + eMailValue);
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.OTP_VERIFICATION_CODE_FAILURE, true);
        }

        if (otpServiceObj && otpServiceObj.error) {
            firebaseHelper.logEvent(firebaseHelper.event_OTP_api_fail, firebaseHelper.screen_otp, "OTP Api Failed - Wrong OTP Value", 'error');
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
        }

    };

    const createPopup = (title, msg, isPop) => {
        set_alertTitle(title);
        set_popUpMessage(msg);
        set_isPopUp(isPop);
        popIdRef.current = 1;
    };

    /**
     * This method triggers when user clicks on Popup Button.
     */
    const popOkBtnAction = (value) => {
        set_isPopUp(value);
        popIdRef.current = 0;
        set_alertTitle(undefined);
        set_popUpMessage(undefined);
    }

    return (
        <OTPUI
            isFromScreen={isFromScreen}
            isPopUp={isPopUp}
            isLoading={isLoading}
            popUpMessage={popUpMessage}
            alertTitle={alertTitle}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction={popOkBtnAction}
        />
    );

}

export default OTPComponent;