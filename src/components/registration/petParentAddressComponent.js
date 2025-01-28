import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import PetParentAddressUi from "./petParentAddressUI"
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as Constant from "./../../utils/constants/constant";
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';

let trace_inPetParentAddressScreen;
let trace_Email_Verification_API_Complete;
let trace_Pet_Parent_Address_API_Complete;

const PetParentAddressComponent = ({ navigation, route, ...props }) => {

    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [primaryEmail, set_primaryEmail] = useState(undefined);
    const [secondaryEmail, set_secondaryEmail] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isNotificationEnable, set_isNotificationEnable] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpAlert, set_popUpAlert] = useState('Alert');
    const [parentObj, set_parentObj] = useState(undefined);
    const [isPrelude, set_isPrelude] = useState(false);
    const [addressMOBJ, set_addressMOBJ] = useState(false);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    React.useEffect(() => {
        
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_register_parent_address);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_register_parent_address, "User in Registering Pet Parent Address Screen", '');
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

    useEffect(() => {

        if (route.params?.isFromScreen) {
            set_isFromScreen(route.params?.isFromScreen);
        }
        if (route.params?.eMailValue) {
            set_primaryEmail(route.params?.eMailValue);
        }
        if (route.params?.secondaryEmail) {
            set_secondaryEmail(route.params?.secondaryEmail);
        }
        if (route.params?.isNotificationEnable) {
            set_isNotificationEnable(route.params?.isNotificationEnable);
        }

        if(route.params?.parentObj && route.params?.parentObj.PetParentAddress){

            if(Object.keys(route.params?.parentObj.PetParentAddress).length !== 0){
                set_parentObj(route.params?.parentObj);
                if(route.params?.parentObj.PetParentAddress.isPreludeAddress === 1) {
                    set_isPrelude(true);
                } else {
                    set_isPrelude(false);
                }
                
            }
            
        }
                   
    }, [route.params?.isFromScreen,route.params?.eMailValue,route.params?.secondaryEmail,route.params?.isNotificationEnable,route.params?.parentObj]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetParentAddressScreen = await perf().startTrace('t_inPetParentAddressScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetParentAddressScreen.stop();
    };

    const navigateToPrevious = () => {
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_register_parent_address, "User clicked on back button to navigate to RegisterAccountComponent ", '');
        navigation.navigate('RegisterAccountComponent');
    };

    const submitAction = async (isPrelude) => {
        getOTPAPI(primaryEmail,addressMOBJ);
    };

    const validateAddress = async (address) => {

        let obj = {
            'address' : address
        }
        set_isLoading(true);
        isLoadingdRef.current = 1;

        let apiMethod = apiMethodManager.VALIDATE_ADDRESS;
        let apiService = await apiRequest.postData(apiMethod,obj,Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
       // stopAddFBTrace();
                        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
            
            if(apiService.data.isValidAddress === 1 && apiService.data.address)  {

                let addObj = {
                    "addressId" : null,
                    "address1" : apiService.data.address.address1,
                    "address2" : '',
                    "city" : apiService.data.address.city,
                    "state" : apiService.data.address.state,
                    "country" : apiService.data.address.country,
                    "zipCode" : apiService.data.address.zipCode,
                    "timeZoneId" : apiService.data.address.timeZone.timeZoneId,
                    "timeZone" : apiService.data.address.timeZoneName,
                    "addressType" : 1,
                    "isPreludeAddress" : 0
               }

                set_addressMOBJ(addObj);

            } else {
                firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'error : Invalid Address');
                createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
            }
    
        } else if(apiService && apiService.isInternet === false) {

            firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'IsInternet ' + 'No Internet');
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true);

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, true);
            firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'error : ' + apiService.error.errorMsg);

        } else {

            firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'error : Invalid Address');
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);

        }

    };

    const getOTPAPI = async (email,addObj) => {

        let json = {
            Email: email,
            isNewUser:1
        };
        firebaseHelper.logEvent(firebaseHelper.event_registration_otp_api, firebaseHelper.screen_register_parent_address, "Requesting OTP API initiated", 'Email : ' + email);
        trace_Email_Verification_API_Complete = await perf().startTrace('t_Register_Email_Verification_API');
        psdRequest(json,email,addObj);
    };

    const psdRequest = async (json,email,addObj) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;

        let apiMethod = apiMethodManager.REGISTER_SEND_EMAIL_CODE;
        let apiService = await apiRequest.postData(apiMethod,json,Constant.SERVICE_MIGRATED,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        stopEVFBTrace();
                        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {

            if(apiService.data.Key) {
                navigation.navigate('OTPComponent', { isFromScreen: 'registration', eMailValue: email, secondaryEmail: secondaryEmail, isNotificationEnable:isNotificationEnable, addressObj:addObj });
            }
            
        } else if(apiService && apiService.isInternet === false) {

            firebaseHelper.logEvent(firebaseHelper.event_registration_otp_api_fail, firebaseHelper.screen_register_parent_address, "Requesting OTP API Failed", 'error : No Internet');
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true);

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            firebaseHelper.logEvent(firebaseHelper.event_registration_otp_api_fail, firebaseHelper.screen_register_parent_address, "Requesting OTP API Failed", 'Email : ' + email);
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);

        } else {

            firebaseHelper.logEvent(firebaseHelper.event_registration_otp_api_fail, firebaseHelper.screen_register_parent_address, "Requesting OTP API Failed", 'Email : ' + email);
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);

        }

    };

    const stopEVFBTrace = async () => {
        await trace_Email_Verification_API_Complete.stop();
    };

    const stopAddFBTrace = async () => {
        await trace_Pet_Parent_Address_API_Complete.stop();
    };

    const createPopup = (title, msg, isPop) => {
        set_popUpAlert(title);
        set_popUpMessage(msg);
        set_isPopUp(isPop);
        popIdRef.current = 1;
    };

    const popOkBtnAction = () => {
        set_popUpAlert(undefined);
        set_popUpMessage(undefined);
        set_isPopUp(undefined);
        popIdRef.current = 0;
    };

    const getAddress = (address) => {
        validateAddress(address);
    };

    return (
        <PetParentAddressUi
            popUpAlert = {popUpAlert}
            popUpMessage = {popUpMessage}
            isPopUp = {isPopUp}
            isLoading = {isLoading}
            isPrelude = {isPrelude}
            parentObj = {parentObj}
            addressMOBJ = {addressMOBJ}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction = {popOkBtnAction}
            getAddress = {getAddress}
        />
    );

}

export default PetParentAddressComponent;