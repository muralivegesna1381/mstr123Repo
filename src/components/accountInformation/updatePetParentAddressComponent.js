import React, { useState, useEffect,useRef } from 'react';
import { View, BackHandler } from 'react-native';
import UpdatePetParentAddressUI from './updatePetParentAddressUI';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";

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
    const [isEditable, set_isEditable] = useState(false);
    const [addressMOBJ, set_addressMOBJ] = useState(false);
    const [popupId, set_popupId] = useState(0);
    const [prefObj, set_prefObj] = useState(undefined);
    const [prefTimeText, set_prefTimeText] = useState(undefined);
    const [weightUnitId, set_weightUnitId] = useState(1)
    const [unitId, set_unitId] = useState(4);

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

        if(route.params?.prefObj) {
            set_prefObj(route.params?.prefObj)
        }
        
    }, [route.params?.fullName, route.params?.phoneNo,route.params?.firstName,route.params?.secondName,route.params?.isNotification,route.params?.secondaryEmail, route.params?.petParentAddress,route.params?.prefObj]);

    useEffect(() => {

        if(route.params?.prefObj) {
            set_unitId(route.params?.prefObj.preferredFoodRecUnitId)
            set_prefTimeText(route.params?.prefObj.preferredFoodRecTime);
            set_weightUnitId(route.params?.prefObj.preferredWeightUnitId);
        }
    }, [route.params?.prefObj]);

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

        updateAddress(petParentAddress);

    };

    const validatePetParentAddress = async (address) => {

        let obj = {
            'address' : address
        }

        set_isLoading(true);
        isLoadingdRef.current = 1;

        let apiMethod = apiMethodManager.VALIDATE_ADDRESS;
        let apiService = await apiRequest.postData(apiMethod,obj,Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
            if(apiService.data.isValidAddress === 1 && apiService.data.address) {

                let addObj = {
                    "addressId" : null,
                    "address1" : apiService.data.address.address1,
                    "address2" : '',
                    "city" : apiService.data.address.city,
                    "state" : apiService.data.address.state,
                    "country" : apiService.data.address.country,
                    "zipCode" : apiService.data.address.zipCode,
                    "timeZoneId" : apiService.data.address.timeZone.timeZoneId,
                    "timeZone" : apiService.data.address.timeZone.timeZoneName,
                    "addressType" : 1,
                    "isPreludeAddress" : 0
               }
               set_addressMOBJ(addObj);
               set_petParentAddress(addObj);

            } else {
                firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'error : Invalid Address');
                createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_UPDATE_ERROR_MSG, true,0);
            }
          
        } else if(apiService && apiService.isInternet === false) {
            firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'IsInternet ' + ": No Internet");
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true,0);         

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true,0);
            firebaseHelper.logEvent(firebaseHelper.event_change_name_api_fail, firebaseHelper.screen_change_name, "User Name Api failed", 'error');

        } else if(apiService && apiService.logoutError !== null) {
        }else {
            firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'error : '+ addressServiceObj.error && addressServiceObj.error.length > 0 ? addressServiceObj.error[0].code : '');
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true,0);

        }

    };

    const updateAddress = async (objAddress) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let userId = UserDetailsModel.userDetailsData.userRole.UserId;

        let jsonTemp = {
            ClientID: "" + clientIdTemp,
            UserId : userId,
            FirstName: firstName,
            LastName: secondName ,
            PhoneNumber: phnNo,
            IsdCodeId: route.params?.isdCode_Id? route.params?.isdCode_Id :'',
            SecondaryEmail:secondaryEmail,
            NotifyToSecondaryEmail:isNotification,
            PetParentAddress : objAddress,
            PreferredFoodRecTime : prefTimeText,
            PreferredWeightUnitId : weightUnitId,
            PreferredFoodRecUnitId :  unitId
        };
        trace_Edit_PAddress_API_Complete = await perf().startTrace('t_ChangeClient_PP_Address_API');

        let apiMethod = apiMethodManager.CHANGE_CLIENT_INFO;
        let apiService = await apiRequest.postData(apiMethod,jsonTemp,Constant.SERVICE_MIGRATED);
        stopFBTrace();
        set_isLoading(false);
        isLoadingdRef.current = 0; 
        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
            if(apiService.data.Key){
                set_isNavigate(true);
                createPopup(Constant.ALERT_INFO,Constant.CHANGE_ADDRESS_SUCCESS,true,0);  
            } else {
                firebaseHelper.logEvent(firebaseHelper.event_change_PPAddress_api_fail, firebaseHelper.screen_edit_parent_address, "Change Pet parent Api Failed ", '');
                set_isNavigate(false);
                createPopup('Alert',Constant.ADDRESS_ERROR_UPDATE,true,0);   
            }
        } else if(apiService && apiService.isInternet === false) {
            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,0);          
            return;
        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true,0); 
            firebaseHelper.logEvent(firebaseHelper.event_change_PPAddress_api_fail, firebaseHelper.screen_edit_parent_address, "Change Pet parent Api Failed ", 'error : ' + apiService.error.errorMsg);
            set_isNavigate(false);
            
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_change_PPAddress_api_fail, firebaseHelper.screen_edit_parent_address, "Change Pet parent Api Failed ", '');
            set_isNavigate(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,0); 
        }

    };

    const stopFBTrace = async () => {
        await trace_Edit_PAddress_API_Complete.stop();
      };

    const createPopup = (title, msg, isPop,popId) => {
        set_popUpAlert(title);
        set_popUpMessage(msg);
        set_isPopUp(isPop);
        popIdRef.current = 1;
        set_popupId(popId);
    };

    const popOkBtnAction = async () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpMessage('');
        set_popUpAlert('');
        if (isNavigate) {
            navigateToPrevious();
        }
    };

    const getAddress = (address) => {
        validatePetParentAddress(address);
    };

    return (
        <UpdatePetParentAddressUI
            isNxtBtnEnable = {isNxtBtnEnable}
            popUpAlert = {popUpAlert}
            popUpMessage = {popUpMessage}
            isPopUp = {isPopUp}
            isLoading = {isLoading}
            petParentAddress = {petParentAddress}
            addressMOBJ = {addressMOBJ}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction = {popOkBtnAction}
            getAddress = {getAddress}
        />
    );

}

export default UpdatePetParentAddressComponent;