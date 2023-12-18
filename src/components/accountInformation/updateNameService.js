import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import UpdateNameUI from './updateNameUI';
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import * as Constant from "../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';

let trace_inChangeName_Screen;
let trace_ChangeName_API_Complete;

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

        if(route.params?.petParentAddress) {
            set_petParentAddress(route.params?.petParentAddress);
        }

    }, [route.params?.fullName, route.params?.phoneNo, route.params?.firstName, route.params?.secondName,route.params?.isNotification,route.params?.secondaryEmail,route.params?.petParentAddress]);

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
        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            navigation.navigate('AccountInfoService');
        } 
    };

    // Service call to update the User name
    const UpdateAction = async (frst, last) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let userId = await DataStorageLocal.getDataFromAsync(Constant.USER_ID);
        let json = {
            ClientID: "" + clientIdTemp,
            UserId : userId,
            FirstName: frst,
            LastName: lastName ? last : ' ',
            PhoneNumber: phnNo ? phnNo : '',
            SecondaryEmail:secondaryEmail,
            NotifyToSecondaryEmail:isNotification,
            PetParentAddress : petParentAddress ? petParentAddress : {}
        };

        changeInfoApi(json);

    };

    const changeInfoApi = async (json) => {

        trace_ChangeName_API_Complete = await perf().startTrace('t_ChangeClientInfo_API');
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let cNameServiceObj = await ServiceCalls.changeClientInfo(json,token);
        set_isLoading(false);
        isLoadingdRef.current = 0; 
        stopFBTrace();
        if(cNameServiceObj && cNameServiceObj.logoutData){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }
            
        if(cNameServiceObj && !cNameServiceObj.isInternet){
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);  
            return;
        }
            
        if(cNameServiceObj && cNameServiceObj.statusData){

            if(cNameServiceObj.responseData && cNameServiceObj.responseData.Key){
                // firebaseHelper.logEvent(firebaseHelper.event_change_name_api_success, firebaseHelper.screen_change_name, "User Name Api success", '');
                set_isNavigate(true);
                createPopup(Constant.ALERT_INFO,Constant.CHANGE_NAME_SUCCESS,true);  
            } else {                 
                firebaseHelper.logEvent(firebaseHelper.event_change_name_api_fail, firebaseHelper.screen_change_name, "User Name Api failed", 'Responce Key : false');
                set_isNavigate(false);   
                createPopup('Alert',Constant.NAME_ERROR_UPDATE,true);        
            }
                        
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_change_name_api_fail, firebaseHelper.screen_change_name, "User Name Api failed", 'Status : false');
            set_isNavigate(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.NAME_ERROR_UPDATE,true);              
        }
            
        if(cNameServiceObj && cNameServiceObj.error) {
            firebaseHelper.logEvent(firebaseHelper.event_change_name_api_fail, firebaseHelper.screen_change_name, "User Name Api failed", 'error');
            set_isNavigate(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.NAME_ERROR_UPDATE,true);  
        }
    };

    const createPopup = (title,msg,value) => {
        popIdRef.current = 1;
        set_popAlert(title);
        set_popUpMessage(msg);
        set_isPopUp(value);
    };

    // Popup Ok button Action
    const popOkBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
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