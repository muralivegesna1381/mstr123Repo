import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import UpdateNameUI from './updateNameUI';
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import * as Constant from "../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as clearAPIDAta from './../../utils/dataComponent/savedAPIData.js';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";

let trace_inChangeName_Screen;
let trace_ChangeName_API_Complete;
const LOGOUT_POPUP_ID = 1;

const UpdateNameService = ({ navigation, route, ...props }) => {

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
    const [prefObj, set_prefObj] = useState(undefined);
    const [prefTimeText, set_prefTimeText] = useState(undefined);
    const [weightUnitId, set_weightUnitId] = useState(1)
    const [unitId, set_unitId] = useState(4);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_change_name);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_change_name, "User in Change Name Screen", '');
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

        if (route.params?.prefObj) {
            set_prefObj(route.params?.prefObj)
        }

    }, [route.params?.fullName, route.params?.phoneNo, route.params?.firstName, route.params?.secondName, route.params?.isNotification, route.params?.secondaryEmail, route.params?.petParentAddress, route.params?.prefObj]);

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
        trace_inChangeName_Screen = await perf().startTrace('t_inChangeNameScreen');
    };

    const initialSessionStop = async () => {
        await trace_inChangeName_Screen.stop();
    };

    const stopFBTrace = async () => {
        await trace_ChangeName_API_Complete.stop();
    };

    // Navigate to previous screen
    const navigateToPrevious = () => {
        if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
            navigation.navigate('AccountInfoService');
        }
    };

    // Service call to update the User name
    const UpdateAction = async (frst, last) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let userId = UserDetailsModel.userDetailsData.userRole.UserId;
        let json = {
            ClientID: "" + clientIdTemp,
            UserId: userId,
            FirstName: frst,
            LastName: lastName ? last : ' ',
            PhoneNumber: phnNo ? phnNo : '',
            IsdCodeId: route.params?.isdCode_Id ? route.params?.isdCode_Id : '',
            SecondaryEmail: secondaryEmail,
            NotifyToSecondaryEmail: isNotification,
            PetParentAddress: petParentAddress ? petParentAddress : {},
            PreferredFoodRecTime: prefTimeText,
            PreferredWeightUnitId: weightUnitId,
            PreferredFoodRecUnitId: unitId
        };
        changeInfoApi(json);

    };

    const changeInfoApi = async (json) => {

        trace_ChangeName_API_Complete = await perf().startTrace('t_ChangeClientInfo_API');

        let apiMethod = apiMethodManager.CHANGE_CLIENT_INFO;
        let apiService = await apiRequest.postData(apiMethod, json, Constant.SERVICE_MIGRATED, navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        stopFBTrace();

        if (apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
            if (apiService.data.Key) {
                set_isNavigate(true);
                createPopup(Constant.ALERT_INFO, Constant.CHANGE_NAME_SUCCESS, true, 0);
            } else {
                firebaseHelper.logEvent(firebaseHelper.event_change_name_api_fail, firebaseHelper.screen_change_name, "User Name Api failed", 'Responce Key : false');
                set_isNavigate(false);
                createPopup('Alert', Constant.NAME_ERROR_UPDATE, true, 0);
            }

        } else if (apiService && apiService.isInternet === false) {
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 0);
            return;

        } else if (apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
            createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, true, 0);
            firebaseHelper.logEvent(firebaseHelper.event_change_name_api_fail, firebaseHelper.screen_change_name, "User Name Api failed", 'error');
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_change_name_api_fail, firebaseHelper.screen_change_name, "User Name Api failed", 'error : Service error');
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_UPDATE_ERROR_MSG, true, 0);
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
        if (popupId === LOGOUT_POPUP_ID) {
            await clearAPIDAta.clearAPIDAta();
            navigation.popToTop();
            // navigation.navigate('WelcomeComponent');
            navigation.navigate('LoginComponent', { "isAuthEnabled": false });
            return
        }

        set_popUpMessage('');
        set_popAlert('');
        if (isNavigate) {
            navigateToPrevious();
        }
    };

    return (
        <UpdateNameUI
            firstName={firstName}
            lastName={lastName}
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

export default UpdateNameService;