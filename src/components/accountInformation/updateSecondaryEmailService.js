import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import UpdateSecondaryEmailUI from './UpdateSecondaryEmailUI';
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import * as Constant from "../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";

let t_inChangeSecondaryEmailScreen;
let trace_SecondaryEmail_API_Complete;
let POP_ID_REMOVE = 1;

const UpdateSecondaryEmailService = ({ navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popAlert, set_popAlert] = useState(undefined);
    const [isPopLeft, set_isLeft] = useState(false);
    const [popRightBtnTitle, set_popRightBtnTitle] = useState('OK')
    const [isNavigate, set_isNavigate] = useState(undefined);
    const [secondaryEmail, set_secondaryEmail] = useState('');
    const [isNotification, set_isNotification] = useState(false);
    const [firstName, set_firstName] = useState('');
    const [lastName, set_lastName] = useState('');
    const [phnNo, set_phNo] = useState('');
    const [petParentAddress, set_petParentAddress] = useState(undefined);
    const [popID, set_popID] = useState(0);
    const [enableRemoveBtn, set_enableRemoveBtn] = useState(false);
    const [prefObj, set_prefObj] = useState(undefined);
    const [prefTimeText, set_prefTimeText] = useState(undefined);
    const [weightUnitId, set_weightUnitId] = useState(1)
    const [unitId, set_unitId] = useState(4);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_change_secondary_email);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_change_secondary_email, "User in Change Secondary email Screen", '');
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
            set_lastName(route.params?.secondName)
        }

        if (route.params?.phoneNo) {
            set_phNo(route.params?.phoneNo)
        }

        if (route.params?.secondaryEmail) {
            set_secondaryEmail(route.params?.secondaryEmail);
            set_enableRemoveBtn(true);
        }

        if (route.params?.isNotification) {

            set_isNotification(route.params?.isNotification)
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
        t_inChangeSecondaryEmailScreen = await perf().startTrace('t_inChangeSecondaryEmailScreen');
    };

    const initialSessionStop = async () => {
        await t_inChangeSecondaryEmailScreen.stop();
    };

    const stopFBTrace = async () => {
        await trace_SecondaryEmail_API_Complete.stop();
    };

    // Navigate to previous screen
    const navigateToPrevious = () => {
        if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
            navigation.navigate('AccountInfoService');
        }
    };

    // Service call to update the User name
    const UpdateAction = async (email, isNotification) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let userId = UserDetailsModel.userDetailsData.userRole.UserId;
        let json = {
            ClientID: "" + clientIdTemp,
            UserId: userId,
            FirstName: firstName,
            LastName: lastName,
            PhoneNumber: phnNo,
            IsdCodeId: route.params?.isdCode_Id ? route.params?.isdCode_Id : '',
            SecondaryEmail: email,
            NotifyToSecondaryEmail: isNotification,
            PetParentAddress: petParentAddress ? petParentAddress : {},
            PreferredFoodRecTime: prefTimeText,
            PreferredWeightUnitId: weightUnitId,
            PreferredFoodRecUnitId: unitId
        };
        changeInfoApi(json);

    };

    const changeInfoApi = async (json) => {

        trace_SecondaryEmail_API_Complete = await perf().startTrace('t_ChangeClientInfo_SecondaryEmail_API');

        let apiMethod = apiMethodManager.CHANGE_CLIENT_INFO;
        let apiService = await apiRequest.postData(apiMethod, json, Constant.SERVICE_MIGRATED, navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        stopFBTrace();

        if (apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
            if (apiService.data.Key) {
                createPopup(Constant.ALERT_INFO, 'Changes made successfully', true, 'OK', false, 0, 1, true);
            } else if (apiService.data.Value && apiService.data.Value !== '') {
                firebaseHelper.logEvent(firebaseHelper.event_secondaryEmail_api_fail, firebaseHelper.screen_change_secondary_email, "Update Secondary email Api failed", 'error : ', apiService.data.Value);
                createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.data.Value, true, 'OK', false, 0, 1, false);
            } else {
                createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SECONDARY_EMAIL_ERROR_UPDATE, true, 'OK', false, 0, 1, false);
            }

        } else if (apiService && apiService.isInternet === false) {
            firebaseHelper.logEvent(firebaseHelper.event_secondaryEmail_api_fail, firebaseHelper.screen_change_secondary_email, "Update Secondary email Api failed", 'Internet : ' + 'No Internet');
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 'OK', false, 0, 1, false);

        } else if (apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
            createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, true, 'OK', false, 0, 1, false);
            firebaseHelper.logEvent(firebaseHelper.event_change_name_api_fail, firebaseHelper.screen_change_name, "User Name Api failed", 'error');

        } else {
            firebaseHelper.logEvent(firebaseHelper.event_change_name_api_fail, firebaseHelper.screen_change_name, "User Name Api failed", 'error : Service error');
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_UPDATE_ERROR_MSG, true, 'OK', false, 0, 1, false);

        }

    };

    const createPopup = (title, msg, value, rgtTitle, isLeftBtn, idPop, popRef, isNavi) => {
        popIdRef.current = popRef;
        set_popAlert(title);
        set_popUpMessage(msg);
        set_isPopUp(value);
        set_popRightBtnTitle(rgtTitle);
        set_isLeft(isLeftBtn);
        set_popID(idPop);
        set_isNavigate(isNavi)
    };

    // Popup Ok button Action
    const popOkBtnAction = async () => {

        if (isNavigate) {
            popIdRef.current = 0;
            navigateToPrevious();
            return;
        }

        if (POP_ID_REMOVE === popID) {
            // firebaseHelper.logEvent(firebaseHelper.event_secondaryEmail_remove_btn, firebaseHelper.screen_change_secondary_email, "Pet Parent clicked on remove secondary email", 'Secondary email : ', secondaryEmail);
            UpdateAction('', false)
        }

        createPopup('', '', false, 'OK', false, 0, 0, false);

    };

    const removeButtonAction = () => {
        createPopup('Alert', 'Are you sure, you want to remove the secondary email?', true, 'YES', true, 1, 1, false);
    };

    const popUpLeftBtnAction = () => {
        createPopup('', '', false, 'OK', false, 0, 0, false);
    };

    return (
        <UpdateSecondaryEmailUI
            secondaryEmail={secondaryEmail}
            isNotification={isNotification}
            isLoading={isLoading}
            isPopUp={isPopUp}
            popUpMessage={popUpMessage}
            popAlert={popAlert}
            isPopLeft={isPopLeft}
            popRightBtnTitle={popRightBtnTitle}
            enableRemoveBtn={enableRemoveBtn}
            navigateToPrevious={navigateToPrevious}
            UpdateAction={UpdateAction}
            removeButtonAction={removeButtonAction}
            popOkBtnAction={popOkBtnAction}
            popUpLeftBtnAction={popUpLeftBtnAction}
        />
    );

}

export default UpdateSecondaryEmailService;