import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import UpdatePhoneUI from './updatePhoneUI';
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import * as Constant from "../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';

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

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    // Android Physical button actions
    useEffect(() => {

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

        if (route.params?.fullName) {
            let splitWords = route.params?.fullName.split(" ");
            set_firstName(splitWords[0]);
            if (splitWords.length > 0) {
                set_lastName(splitWords[1]);
            }
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
        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            navigation.navigate('AccountInfoService');
        } 
    };

    // Service call to update the User Phone number
    const UpdateAction = async (phn, cCode) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let phoneTemp = phn.replace(/\D/g, "");
        let phoneTemp1 = phoneTemp.substring(0, 3);
        phoneTemp1 = "(" + phoneTemp1 + ")";
        let phoneTemp2 = phoneTemp.substring(3, 6);
        let phoneTemp3 = phoneTemp.substring(6, phoneTemp.length);
        phoneTemp3 = "-" + phoneTemp3;

        let json = {
            ClientID: parseInt(clientIdTemp),
            FirstName: firstName ? firstName : ' ',
            LastName: lastName ? lastName : ' ',
            PhoneNumber: phn ? cCode + phoneTemp1 + phoneTemp2 + phoneTemp3 : '',
            SecondaryEmail:secondaryEmail,
            NotifyToSecondaryEmail:isNotification,
            PetParentAddress : petParentAddress ? petParentAddress : {}
        };
        trace_ChangePhone_API_Complete = await perf().startTrace('t_ChangeClientInfo_API');
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        changePhoneNo(json,token);
        
    };

    const changePhoneNo = async (json,token) => {

        let cPhNoServiceObj = await ServiceCalls.changeClientInfo(json,token);
        set_isLoading(false);
        isLoadingdRef.current = 0; 
        stopFBTrace();

        if(cPhNoServiceObj && cPhNoServiceObj.logoutData){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }
          
        if(cPhNoServiceObj && !cPhNoServiceObj.isInternet){
            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);  
            return;
        }
          
        if(cPhNoServiceObj && cPhNoServiceObj.statusData){
            if(cPhNoServiceObj.responseData && cPhNoServiceObj.responseData.Key){
                // firebaseHelper.logEvent(firebaseHelper.event_change_phone_api_success, firebaseHelper.screen_change_phone, "Chanhe Phone Api success ", '');
                set_isNavigate(true);
                createPopup(Constant.ALERT_INFO,Constant.CHANGE_PHONE_SUCCESS,true);  
            } else {                 
                firebaseHelper.logEvent(firebaseHelper.event_change_phone_api_fail, firebaseHelper.screen_change_phone, "Chanhe Phone Api Failed ", 'Responce Key : false');
                set_isNavigate(false);   
                createPopup('Alert',Constant.PHONE_ERROR_UPDATE,true);        
            }
          
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_change_phone_api_fail, firebaseHelper.screen_change_phone, "Chanhe Phone Api Failed ", 'Responce Status : false');
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);              
        }
          
        if(cPhNoServiceObj && cPhNoServiceObj.error) {

            firebaseHelper.logEvent(firebaseHelper.event_change_phone_api_fail, firebaseHelper.screen_change_phone, "Chanhe Phone Api Failed ", 'Responce error');
            set_isNavigate(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
                
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

    }

    return (
        <UpdatePhoneUI
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