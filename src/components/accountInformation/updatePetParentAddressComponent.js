import React, { useState, useEffect,useRef } from 'react';
import { View, BackHandler } from 'react-native';
import UpdatePetParentAddressUI from './updatePetParentAddressUI';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';

let trace_inUpdatePetParentAddressScreen;
let trace_Edit_PAddress_API_Complete;

const UpdatePetParentAddressComponent = ({ navigation, route, ...props }) => {

    const [date, set_Date] = useState(new Date());
    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(true);
    const [firstName, set_firstName] = useState('');
    const [secondName, set_secondName] = useState('');
    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpAlert, set_popUpAlert] = useState('Alert');
    const [petParentAddress, set_petParentAddress] = useState(undefined);
    const [secondaryEmail, set_secondaryEmail] = useState('');
    const [isNotification, set_isNotification] = useState(false);
    const [phnNo, set_phNo] = useState(undefined);
    const [isNavigate, set_isNavigate] = useState(undefined);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    React.useEffect(() => {
        
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_edit_parent_address);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_edit_parent_address, "User in Edit Pet Parent Address Screen", '');
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
        
        if (route.params?.firstName) {
            set_firstName(route.params?.firstName);
        }
        if (route.params?.secondName) {
            set_secondName(route.params?.secondName);
        }

        if (route.params?.phoneNo) {
            set_phNo(route.params?.phoneNo)
        }

        if (route.params?.secondaryEmail) {
            set_secondaryEmail(route.params?.secondaryEmail)
        }

        if (route.params?.isNotification) {
            set_isNotification(route.params?.isNotification)
        }

        if(route.params?.petParentAddress) {
            set_petParentAddress(route.params?.petParentAddress);
        }
        
    }, [route.params?.fullName, route.params?.phoneNo,route.params?.firstName,route.params?.secondName,route.params?.isNotification,route.params?.secondaryEmail, route.params?.petParentAddress]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inUpdatePetParentAddressScreen = await perf().startTrace('t_inEditPetParentAddressScreen');
    };

    const initialSessionStop = async () => {
        await trace_inUpdatePetParentAddressScreen.stop();
    };

    const navigateToPrevious = () => {
        // firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_edit_parent_address, "User clicked on back button to navigate to AccountInfoService ", '');
        navigation.navigate('AccountInfoService');
    }

    const submitAction = async (addLine1Ref,addLine2Ref,cityRef,stateRef,zipCodeRef,countryRef) => {

        if(addLine1Ref && cityRef && stateRef && zipCodeRef && countryRef) {
            validatePetParentAddress(addLine1Ref,addLine2Ref,cityRef,stateRef,zipCodeRef,countryRef);
        } else {

        }

    };

    const validatePetParentAddress = async (addLine1Ref,addLine2Ref,cityRef,stateRef,zipCodeRef,countryRef) => {

        let line1 = addLine1Ref.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        let line2 = '';
        if(addLine2Ref && addLine2Ref !== '') {
            line2 = addLine2Ref.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        }

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let seviceString = 'address1='+line1+'&'+'address2='+line2+'&'+'city='+cityRef+'&'+'state='+stateRef+'&'+'country='+countryRef+'&'+'zipCode='+zipCodeRef;

        let addressServiceObj = await ServiceCalls.validateAddress(seviceString);
        set_isLoading(false);
        isLoadingdRef.current = 0;

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
            
            if(addressServiceObj.responseData && addressServiceObj.responseData.isValidAddress === 1)  {

                let addObj = {
                    "addressId" : null,
                    "address1" : line1,
                    "address2" : line2,
                    "city" : cityRef,
                    "state" : stateRef,
                    "country" : countryRef,
                    "zipCode" : zipCodeRef,
                    "timeZoneId" : addressServiceObj.responseData.address.timeZone.timeZoneId,
                    "timeZone" : addressServiceObj.responseData.address.timeZone.timeZoneName,
                    "addressType" : 1,
                    "isPreludeAddress" : 0
               }
   
               updateAddress(addObj);

            } else {
                firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'error : Invalid Address');
                createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
            }
            

        } else {
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
        }

        if (addressServiceObj && addressServiceObj.error) {
            firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'error : '+ addressServiceObj.error && addressServiceObj.error.length > 0 ? addressServiceObj.error[0].code : '');
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
        }

    };

    const updateAddress = async (objAddress) => {

        let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let jsonTemp = {
            ClientID: "" + clientIdTemp,
            FirstName: firstName,
            LastName: secondName ,
            PhoneNumber: phnNo,
            SecondaryEmail:secondaryEmail,
            NotifyToSecondaryEmail:isNotification,
            PetParentAddress : objAddress
        };

        trace_Edit_PAddress_API_Complete = await perf().startTrace('t_ChangeClient_PP_Address_API');
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let addServiceObj = await ServiceCalls.changeClientInfo(jsonTemp,token);
        stopFBTrace();
        set_isLoading(false);
        isLoadingdRef.current = 0; 

        if(addServiceObj && addServiceObj.logoutData){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }
          
        if(addServiceObj && !addServiceObj.isInternet){
            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);  
            return;
        }
          
        if(addServiceObj && addServiceObj.statusData){
            if(addServiceObj.responseData && addServiceObj.responseData.Key){
                set_isNavigate(true);
                createPopup(Constant.ALERT_INFO,Constant.CHANGE_ADDRESS_SUCCESS,true);  
            } else {                 
                firebaseHelper.logEvent(firebaseHelper.event_change_PPAddress_api_fail, firebaseHelper.screen_edit_parent_address, "Change Pet parent Api Failed ", '');
                set_isNavigate(false);
                createPopup('Alert',Constant.ADDRESS_ERROR_UPDATE,true);        
            }
          
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_change_PPAddress_api_fail, firebaseHelper.screen_edit_parent_address, "Change Pet parent Api Failed ", '');
            set_isNavigate(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);              
        }
          
        if(addServiceObj && addServiceObj.error) {

            firebaseHelper.logEvent(firebaseHelper.event_change_PPAddress_api_fail, firebaseHelper.screen_edit_parent_address, "Change Pet parent Api Failed ", '');
            set_isNavigate(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
                
        }

    };

    const stopFBTrace = async () => {
        await trace_Edit_PAddress_API_Complete.stop();
      };

    const createPopup = (title, msg, isPop) => {
        set_popUpAlert(title);
        set_popUpMessage(msg);
        set_isPopUp(isPop);
        popIdRef.current = 1;
    };

    const popOkBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpMessage('');
        set_popUpAlert('');
        if (isNavigate) {
            navigateToPrevious();
        }
    };

    return (
        <UpdatePetParentAddressUI
            isNxtBtnEnable = {isNxtBtnEnable}
            popUpAlert = {popUpAlert}
            popUpMessage = {popUpMessage}
            isPopUp = {isPopUp}
            isLoading = {isLoading}
            petParentAddress = {petParentAddress}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction = {popOkBtnAction}
        />
    );

}

export default UpdatePetParentAddressComponent;