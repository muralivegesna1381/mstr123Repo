import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import * as Constant from "./../../utils/constants/constant";
import RegisterAccountUi from "./registerAccountUi"
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';

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

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let secondaryEmailNew = useRef('');
    let notificationEnable = useRef(false);

    React.useEffect(() => {

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
    const submitAction = async (email, phNumber, firstName, secondName, secondaryEmail, notificationsEnable) => {

        set_email(email);
        set_secondaryEmail(secondaryEmail);
        set_isNotification(notificationsEnable);
        secondaryEmailNew.current = secondaryEmail;
        notificationEnable.current = notificationsEnable;
        set_phNumber(phNumber);
        set_isLoading(true);
        isLoadingdRef.current = 1;

        let json = {
            FirstName : firstName,
            LastName : secondName,
            Email : email,
            PhoneNumber: phNumber,
            SecondaryEmail : secondaryEmail,
            NotifyToSecondaryEmail : notificationsEnable
        };

        firebaseHelper.logEvent(firebaseHelper.event_registration_account_action, firebaseHelper.screen_register_account, "User clicked submit button to initiate the Account cration API ", 'Emails : ' + (email + ' and sEmail ' + secondaryEmail));
        trace_RegisterAccount_API_Complete = await perf().startTrace('t_RegisterAccount_API');
        requestforRegistration(json,email);

    };

    /**
     * This Method returns the Registration process success / failure info from API
     * Success : Based on Client not equals to 0, Peet parent will be navigated to OTP screen
     * Failure : When client id is 0, error message will be shown 
     */
    const requestforRegistration = async (json,email) => {

        let registerServiceObj = await ServiceCalls.registerUserValidateEmail(json);
        stopFBTrace();
        set_isLoading(false);
        isLoadingdRef.current = 0;

        if (registerServiceObj && !registerServiceObj.isInternet) {
            firebaseHelper.logEvent(firebaseHelper.event_registration_account_api_fail, firebaseHelper.screen_register_account, "Registering the Account API Fail ", 'Error : No Internet');
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true);
            return;
        }

        if (registerServiceObj && registerServiceObj.statusData) {
            
            if(registerServiceObj.responseData) {
                
                if(registerServiceObj.responseData.Key) {
                    navigation.navigate('PetParentAddressComponent', { isFromScreen: 'registration', eMailValue: email, secondaryEmail: secondaryEmailNew.current, isNotificationEnable:notificationEnable.current, parentObj : registerServiceObj.responseData });
                } else {
                    firebaseHelper.logEvent(firebaseHelper.event_registration_account_api_fail, firebaseHelper.screen_register_account, "Registering the Account API Fail ", 'Error : ' + registerServiceObj.responseData.Value);
                    createPopup(Constant.ALERT_DEFAULT_TITLE, registerServiceObj.responseData.Value, true);
                }
            }
                       
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_registration_account_api_fail, firebaseHelper.screen_register_account, "Registering the Account API Fail ", 'Error : Email already Exists');
            createPopup(Constant.ALERT_DEFAULT_TITLE, registerServiceObj.responseData.Value, true);
        }

        if (registerServiceObj && registerServiceObj.error) {
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
            firebaseHelper.logEvent(firebaseHelper.event_registration_account_api_fail, firebaseHelper.screen_register_account, "Registering the Account API Fail ", 'Error : ');
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

    return (
        <RegisterAccountUi
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