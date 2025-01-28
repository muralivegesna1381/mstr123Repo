import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import UpdatePhoneUI from './updatePhoneUI';
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import * as Constant from "../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";

let trace_inAccountPhone_Screen;
let trace_ChangePhone_API_Complete;

const UpdatePhoneService = ({ navigation, route, ...props }) => {

    const [firstName, set_firstName] = useState(undefined);
    const [lastName, set_lastName] = useState(undefined);
    const [phnNo, set_phNo] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popAlert, set_popAlert] = useState(undefined);
    const [isNavigate, set_isNavigate] = useState(undefined);
    const [secondaryEmail, set_secondaryEmail] = useState('');
    const [isNotification, set_isNotification] = useState(false);
    const [petParentAddress, set_petParentAddress] = useState(undefined);
    const [popupId, set_popupId] = useState(0);
    const [countryISDCodes, set_countryISDCodes] = useState(undefined)

    const [isdCode, set_isdCode] = useState(undefined);
    const [isdCodeId, set_isdCodeId] = useState(undefined);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    const [prefTimeText, set_prefTimeText] = useState(undefined);
    const [weightUnitId, set_weightUnitId] = useState(1)
    const [unitId, set_unitId] = useState(4);

    // Android Physical button actions
    useEffect(() => {

        getISDCodes()

        firebaseHelper.reportScreen(firebaseHelper.screen_change_phone);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_change_phone, "User in Change Phone Number Screen", '');
        initialSessionStart();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    // setting the existing user details to local variables
    useEffect(() => {

        if (route.params?.firstName) {
            set_firstName(route.params?.firstName)
        }

        if (route.params?.secondName) {
            set_lastName(route.params?.secondName);
        }
        
        if (route.params?.phoneNo) {
            set_phNo(route.params?.phoneNo);
        }

        if (route.params?.secondaryEmail) {
            set_secondaryEmail(route.params?.secondaryEmail);
        }

        if (route.params?.isNotification) {
            set_isNotification(route.params?.isNotification);
        }

        if (route.params?.petParentAddress) {
            set_petParentAddress(route.params?.petParentAddress);
        }
        if (route.params?.isdCode_Id) {
            set_isdCodeId(route.params?.isdCode_Id);
        }
        if (route.params?.isd_Code) {
            set_isdCode(route.params?.isd_Code);
        }

    }, [route.params?.fullName, route.params?.phoneNo, route.params?.firstName, route.params?.secondName, route.params?.isNotification, route.params?.secondaryEmail, route.params?.petParentAddress]);

    useEffect(() => {

        if (route.params?.prefObj) {
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
        trace_inAccountPhone_Screen = await perf().startTrace('t_inChangePhoneScreen');
    };

    const initialSessionStop = async () => {
        await trace_inAccountPhone_Screen.stop();
    };

    const stopFBTrace = async () => {
        await trace_ChangePhone_API_Complete.stop();
    };

    // Navigate to previous screen
    const navigateToPrevious = () => {
        if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
            navigation.navigate('AccountInfoService');
        }
    };

    // Service call to update the User Phone number
    const UpdateAction = async (phn, cCode, isd_CodeId) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let userId = UserDetailsModel.userDetailsData.userRole.UserId;
        let phoneTemp = phn.replace(/\D/g, "");
        let phoneTemp1 = phoneTemp.substring(0, 3);
        phoneTemp1 = "(" + phoneTemp1 + ")";
        let phoneTemp2 = phoneTemp.substring(3, 6);
        let phoneTemp3 = phoneTemp.substring(6, phoneTemp.length);
        phoneTemp3 = "-" + phoneTemp3;

        let json = {
            ClientID: parseInt(clientIdTemp),
            UserId: userId,
            FirstName: firstName ? firstName : ' ',
            LastName: lastName ? lastName : ' ',
            PhoneNumber: phn ? phoneTemp1 + phoneTemp2 + phoneTemp3 : '',
            IsdCodeId: isd_CodeId,
            SecondaryEmail: secondaryEmail,
            NotifyToSecondaryEmail: isNotification,
            PetParentAddress: petParentAddress ? petParentAddress : {},
            PreferredFoodRecTime: prefTimeText,
            PreferredWeightUnitId: weightUnitId,
            PreferredFoodRecUnitId: unitId
        };
        trace_ChangePhone_API_Complete = await perf().startTrace('t_ChangeClientInfo_API');
        //let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        changePhoneNo(json);

    };

    const changePhoneNo = async (json,) => {

        let apiMethod = apiMethodManager.CHANGE_CLIENT_INFO;
        let apiService = await apiRequest.postData(apiMethod, json, Constant.SERVICE_MIGRATED, navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        stopFBTrace();

        if (apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {

            if (apiService.data.Key) {
                set_isNavigate(true);
                createPopup(Constant.ALERT_INFO, Constant.CHANGE_PHONE_SUCCESS, true, 0);
            } else {
                firebaseHelper.logEvent(firebaseHelper.event_change_phone_api_fail, firebaseHelper.screen_change_phone, "Chanhe Phone Api Failed ", 'Responce Key : false');
                set_isNavigate(false);
                createPopup('Alert', Constant.PHONE_ERROR_UPDATE, true, 0);
            }

        } else if (apiService && apiService.isInternet === false) {
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 0);
        } else if (apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
            createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, true, 0);
            firebaseHelper.logEvent(firebaseHelper.event_change_name_api_fail, firebaseHelper.screen_change_name, "User Name Api failed", 'error');
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_change_phone_api_fail, firebaseHelper.screen_change_phone, "Chanhe Phone Api Failed ", 'Responce Status : false');
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_UPDATE_ERROR_MSG, true, 0);

        }

    };

    const getISDCodes = async () => {
        let isdCodesLocalData = await DataStorageLocal.getDataFromAsync(Constant.PHONE_ISD_CODES);
        if (isdCodesLocalData) {
            const parsedData = JSON.parse(isdCodesLocalData);
            set_countryISDCodes(parsedData)
        } else {
            set_isLoading(true);
            isLoadingdRef.current = 1;
            let apiMethod = apiMethodManager.GET_ISD_CODES;
            let apiService = await apiRequest.getData(apiMethod, '', Constant.SERVICE_JAVA, navigation);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            if (apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
                if (apiService.data.isdCodes && apiService.data.isdCodes.length > 0) {
                    await DataStorageLocal.saveDataToAsync(Constant.PHONE_ISD_CODES, JSON.stringify(apiService.data.isdCodes));
                    set_isLoading(false);
                    isLoadingdRef.current = 0;
                    set_countryISDCodes(apiService.data.isdCodes)
                } else {
                    set_countryISDCodes([])
                }

            } else if (apiService && apiService.isInternet === false) {
                createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, false, 'OK', true, 0, '');
            } else if (apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
                createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, false, 'OK', true, 0, '');
            } else {
                createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, false, 'OK', true, 0, '');
            }
        }

    };

    const createPopup = (title, msg, value, popId) => {
        popIdRef.current = 1;
        set_popAlert(title);
        set_popUpMessage(msg);
        set_isPopUp(value);
        set_popupId(popId);
    };

    // Popup Ok button Action
    const popOkBtnAction = async () => {

        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpMessage('');
        set_popAlert('');
        if (isNavigate) {
            navigateToPrevious();
        }

    }

    return (
        <UpdatePhoneUI
            countryISDCodes={countryISDCodes}
            isdCode={isdCode}
            isdCodeId={isdCodeId}
            phnNo={phnNo}
            isLoading={isLoading}
            isPopUp={isPopUp}
            popUpMessage={popUpMessage}
            popAlert={popAlert}
            navigateToPrevious={navigateToPrevious}
            UpdateAction={UpdateAction}
            popOkBtnAction={popOkBtnAction}
        />
    );

}

export default UpdatePhoneService;