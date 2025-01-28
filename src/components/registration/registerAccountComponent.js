import perf from '@react-native-firebase/perf';
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import * as Constant from "./../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import RegisterAccountUi from "./registerAccountUi";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";

let trace_inRegisterAccountScreen;
let trace_RegisterAccount_API_Complete;

const RegisterAccountComponent = ({ navigation, route, ...props }) => {

    const [firstName, set_firstName] = useState('');
    const [secondName, set_secondName] = useState('');
    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [email, set_email] = useState('');
    const [phNumber, set_phNumber] = useState('');
    const [date, set_Date] = useState(new Date());
    const [popUpAlert, set_popUpAlert] = useState('Alert');
    const [secondaryEmail, set_secondaryEmail] = useState('');
    const [isNotification, set_isNotification] = useState(false);
    const [countryISDCodes, set_countryISDCodes] = useState(undefined)

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let secondaryEmailNew = useRef('');
    let notificationEnable = useRef(false);

    React.useEffect(() => {

        getISDCodes()

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_register_account);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_register_account, "User in Registering account Screen", '');
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            initialSessionStop();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
            focus();
        };
    }, []);

    /**
     * setting navigation values to local variables
     */
    useEffect(() => {
        if (route.params?.firstName) {
            set_firstName(route.params?.firstName);
        }

        if (route.params?.secondName) {
            set_secondName(route.params?.secondName);
        }

    }, [route.params?.firstName, route.params?.secondName]);

    const initialSessionStart = async () => {
        trace_inRegisterAccountScreen = await perf().startTrace('t_inRegisterAccountScreen');
    };

    const initialSessionStop = async () => {
        await trace_inRegisterAccountScreen.stop();
    };

    const stopFBTrace = async () => {
        await trace_RegisterAccount_API_Complete.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    ///Navigates the pet parent to Profile screen
    const navigateToPrevious = () => {
        if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_register_account, "User clicked on back button to navigate to PetParentProfileComponent ", '');
            navigation.navigate('PetParentProfileComponent');
        }
    }

    /**
     * @param {*} email 
     * @param {*} phNumber 
     * @param {*} firstName 
     * @param {*} secondName 
     * On validating the details, these details will be sent to backend Api to validate
     */
    const submitAction = async (email, phNumber, firstName, secondName, secondaryEmail, notificationsEnable, isdCodeID) => {

        set_email(email);
        set_secondaryEmail(secondaryEmail);
        set_isNotification(notificationsEnable);
        secondaryEmailNew.current = secondaryEmail;
        notificationEnable.current = notificationsEnable;
        set_phNumber(phNumber);
        set_isLoading(true);
        isLoadingdRef.current = 1;

        let json = {
            FirstName: firstName,
            LastName: secondName,
            Email: email,
            PhoneNumber: phNumber,
            IsdCodeId: isdCodeID,
            SecondaryEmail: secondaryEmail,
            NotifyToSecondaryEmail: notificationsEnable
        };

        firebaseHelper.logEvent(firebaseHelper.event_registration_account_action, firebaseHelper.screen_register_account, "User clicked submit button to initiate the Account cration API ", 'Emails : ' + (email + ' and sEmail ' + secondaryEmail));
        trace_RegisterAccount_API_Complete = await perf().startTrace('t_RegisterAccount_API');
        requestforRegistration(json, email);

    };

    /**
     * This Method returns the Registration process success / failure info from API
     * Success : Based on Client not equals to 0, Peet parent will be navigated to OTP screen
     * Failure : When client id is 0, error message will be shown 
     */
    const requestforRegistration = async (json, email) => {

        let apiMethod = apiMethodManager.REGISTER_USER_EMAIL;
        let apiService = await apiRequest.postData(apiMethod, json, Constant.SERVICE_MIGRATED, navigation);
        stopFBTrace();
        set_isLoading(false);
        isLoadingdRef.current = 0;

        if (apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {

            if (apiService.data.Key) {
                navigation.navigate('PetParentAddressComponent', { isFromScreen: 'registration', eMailValue: email, secondaryEmail: secondaryEmailNew.current, isNotificationEnable: notificationEnable.current, parentObj: apiService.data });
            } else {
                firebaseHelper.logEvent(firebaseHelper.event_registration_account_api_fail, firebaseHelper.screen_register_account, "Registering the Account API Fail ", 'Error : ');
                createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.data.Value, true);
            }

        } else if (apiService && apiService.isInternet === false) {

            firebaseHelper.logEvent(firebaseHelper.event_registration_account_api_fail, firebaseHelper.screen_register_account, "Registering the Account API Fail ", 'Error : No Internet');
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true);

        } else if (apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, true);
            firebaseHelper.logEvent(firebaseHelper.event_registration_account_api_fail, firebaseHelper.screen_register_account, "Registering the Account API Fail ", 'Error : ' + apiService.error.errorMsg);

        } else {

            firebaseHelper.logEvent(firebaseHelper.event_registration_account_api_fail, firebaseHelper.screen_register_account, "Registering the Account API Fail ", 'Error : Email already Exists');
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);

        }

    };

    const createPopup = (title, msg, isPop) => {
        set_popUpAlert(title);
        set_popUpMessage(msg);
        set_isPopUp(isPop);
        popIdRef.current = 1;
    };

    // Popup Ok button action
    const popOkBtnAction = (value) => {
        set_isPopUp(value);
        set_popUpMessage('');
        set_popUpAlert('');
        popIdRef.current = 0;
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

    return (
        <RegisterAccountUi
            countryISDCodes={countryISDCodes}
            firstName={firstName}
            secondName={secondName}
            isLoading={isLoading}
            isPopUp={isPopUp}
            popUpMessage={popUpMessage}
            popUpAlert={popUpAlert}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction={popOkBtnAction}
        />
    );

}

export default RegisterAccountComponent;