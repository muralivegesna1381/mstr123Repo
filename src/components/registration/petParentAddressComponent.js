import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import PetParentAddressUi from "./petParentAddressUI"
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import * as Constant from "./../../utils/constants/constant";

let trace_inPetParentAddressScreen;
let trace_Email_Verification_API_Complete;
let trace_Pet_Parent_Address_API_Complete;

const PetParentAddressComponent = ({ navigation, route, ...props }) => {

    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [primaryEmail, set_primaryEmail] = useState(undefined);
    const [secondaryEmail, set_secondaryEmail] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(true);
    const [isNotificationEnable, set_isNotificationEnable] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpAlert, set_popUpAlert] = useState('Alert');
    const [parentObj, set_parentObj] = useState(undefined);
    const [isPrelude, set_isPrelude] = useState(false);

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

        if(route.params?.parentObj){

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

    const submitAction = async (addLine1Ref,addLine2Ref,cityRef,stateRef,zipCodeRef,countryRef,prludeValue) => {

        let line1 = addLine1Ref.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        let line2 = '';
        if(addLine2Ref && addLine2Ref !== '') {
            line2 = addLine2Ref.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        }

        if(addLine1Ref && cityRef && stateRef && zipCodeRef && countryRef) {
            set_isLoading(true);
            let objAddress = {
                "address1" : line1,
                "address2" : line2,
                "city" : cityRef,
                "state" : stateRef,
                "zipCode" : zipCodeRef,
                "country" : countryRef,
            }

            firebaseHelper.logEvent(firebaseHelper.event_registration_account_Address_action, firebaseHelper.screen_register_parent_address, "User address", 'isPrelude User ' + isPrelude);
            trace_Pet_Parent_Address_API_Complete = await perf().startTrace('t_Parent_Address_Validation_API');
            validateAddress(line1,line2,cityRef,stateRef,zipCodeRef,countryRef);
        } 
        
    };

    const validateAddress = async (addLine1Ref,addLine2Ref,cityRef,stateRef,zipCodeRef,countryRef) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let seviceString = 'address1='+addLine1Ref+'&'+'address2='+addLine2Ref+'&'+'city='+cityRef+'&'+'state='+stateRef+'&'+'country='+countryRef+'&'+'zipCode='+zipCodeRef;

        let addressServiceObj = await ServiceCalls.validateAddress(seviceString);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        stopAddFBTrace();

        if (addressServiceObj && addressServiceObj.invalidData) {
            firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'Entered Invalid Address ');
            createPopup(Constant.ALERT_DEFAULT_TITLE, 'Invalid Address', true);
            return;
        }

        if (addressServiceObj && !addressServiceObj.isInternet) {
            firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'IsInternet ' + addressServiceObj.isInternet);
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true);
            return;
        }

        if (addressServiceObj && addressServiceObj.statusData) {
            
            let addObj = {
                 "addressId" : null,
                 "address1" : addLine1Ref,
                 "address2" : addLine2Ref,
                 "city" : cityRef,
                 "state" : stateRef,
                 "country" : countryRef,
                 "zipCode" : zipCodeRef,
                 "timeZoneId" : addressServiceObj.responseData.address.timeZone.timeZoneId,
                 "timeZone" : addressServiceObj.responseData.address.timeZone.timeZoneName,
                 "addressType" : 1,
                 "isPreludeAddress" : 0
            }
            getOTPAPI(primaryEmail,addObj);

        } else {
            firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'Service Status : false' );
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
        }

        if (addressServiceObj && addressServiceObj.error) {
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
            let errors = addressServiceObj.error.length > 0 ? addressServiceObj.error[0].code : '';
            firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'error : ',errors);
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

        let pRequestServiceObj = await ServiceCalls.registerUserSendEmailVerificationCode(json);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        stopEVFBTrace();

        if (pRequestServiceObj && !pRequestServiceObj.isInternet) {
            firebaseHelper.logEvent(firebaseHelper.event_registration_otp_api_fail, firebaseHelper.screen_register_parent_address, "Requesting OTP API Failed", 'error : No Internet');
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true);
            return;
        }

        if (pRequestServiceObj && pRequestServiceObj.statusData) {
            navigation.navigate('OTPComponent', { isFromScreen: 'registration', eMailValue: email, secondaryEmail: secondaryEmail, isNotificationEnable:isNotificationEnable, addressObj:addObj });
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_registration_otp_api_fail, firebaseHelper.screen_register_parent_address, "Requesting OTP API Failed", 'Email : ' + email);
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
        }

        if (pRequestServiceObj && pRequestServiceObj.error) {
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

    return (
        <PetParentAddressUi
            isNxtBtnEnable = {isNxtBtnEnable}
            popUpAlert = {popUpAlert}
            popUpMessage = {popUpMessage}
            isPopUp = {isPopUp}
            isLoading = {isLoading}
            isPrelude = {isPrelude}
            parentObj = {parentObj}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction = {popOkBtnAction}
        />
    );

}

export default PetParentAddressComponent;