import React, {useState,useEffect,useRef} from 'react';
import {View,BackHandler} from 'react-native';
import SensorPNQUI from './sensorPNQUI';
import * as Queries from "./../../../config/apollo/queries";
import { useMutation, } from "@apollo/react-hooks";
import * as Constant from "./../../../utils/constants/constant";
import * as internetCheck from "./../../../utils/internetCheck/internetCheck";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../../utils/getServicesData/getServicesData.js';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';

let trace_inSensorPNQSelectioncreen;

const SensorPNQComponent = ({navigation, route, ...props }) => {

    const [notificationRequest,{ loading: notificationLoading, error: notificationError, data: notificationData },] = useMutation(Queries.SEND_SENSOR_NOTIFICATION_SETTINGS);

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [clientId, set_clientId] = useState(undefined);
    const [petId, set_petId] = useState(undefined);
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let checkinQuestObj = useRef(undefined);

    useEffect(() => {

        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_sensor_pn_noti);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_sensor_pn_noti, "User in Pushnotification permission Screen", ''); 
        getValues();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            initialSessionStop();
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    useEffect(() => { 

          if(notificationData){
    
            if(notificationData && notificationData.sendSensorNotifications.success){
                firebaseHelper.logEvent(firebaseHelper.event_sensor_PNP_api_Success, firebaseHelper.screen_sensor_pn_noti, "Push Notification Permissions API success", 'petId : ', petId);
                set_isLoading(false);
                isLoadingdRef.current = 0;
                // navigateToNext();
                getFeedbackQuestionnaire(petId);
            }else{     
              set_isLoading(false);
              isLoadingdRef.current = 0;
              createPopup(Constant.SERVICE_FAIL_MSG,Constant.ALERT_DEFAULT_TITLE,true); 
            }
            
          }
    
          if(notificationError) {
            firebaseHelper.logEvent(firebaseHelper.event_sensor_PNP_api_fail, firebaseHelper.screen_sensor_pn_noti, "Push Notification Permissions API Fail", 'error : '+notificationError);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            createPopup(Constant.SERVICE_FAIL_MSG,Constant.ALERT_DEFAULT_TITLE,true);  
          }
    
    }, [notificationLoading, notificationError, notificationData]);
  
    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inSensorPNQSelectioncreen = await perf().startTrace('t_inSensorPNDateSelectionScreen');
    };
  
    const initialSessionStop = async () => {
        await trace_inSensorPNQSelectioncreen.stop();
    };

    const getValues = async () => {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        petObj = JSON.parse(petObj);
        if(clientId){
            set_clientId(clientId);
        }
        if(petObj){
            set_petId(petObj.petID);
        }
    };

    const getFeedbackQuestionnaire = async (pId) => {

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        // let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        // petObj = JSON.parse(petObj);
        let configObj = await DataStorageLocal.getDataFromAsync(Constant.CONFIG_SENSOR_OBJ);
        configObj = JSON.parse(configObj);

        let getFQuestServiceObj = await ServiceCalls.getFeedbackQuestionnaireByPetId(configObj.petID,configObj.configDeviceModel,token);
        set_isLoading(false);
        isLoadingdRef.current = 0;

        if(getFQuestServiceObj && getFQuestServiceObj.logoutData){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }
      
        if(getFQuestServiceObj && !getFQuestServiceObj.isInternet){
            set_isLoading(false);
            createPopup(Constant.NETWORK_STATUS,Constant.ALERT_NETWORK,true);
            return;
        }
      
        if(getFQuestServiceObj && getFQuestServiceObj.statusData) {

            if(getFQuestServiceObj.responseData) {
                checkinQuestObj.current = getFQuestServiceObj.responseData;
                navigateToNext(getFQuestServiceObj.responseData)
            }
            
        } else {
            // createPopup(Constant.SERVICE_FAIL_MSG,Constant.ALERT_NETWORK,true);
            navigateToNext();
        }
      
        if(getFQuestServiceObj && getFQuestServiceObj.error) {
            navigateToNext();
            // createPopup(Constant.SERVICE_FAIL_MSG,Constant.ALERT_NETWORK,true);           
        }
    };

    const navigateToNext = async (obJCheckin) => {

        let sobPets = await DataStorageLocal.getDataFromAsync(Constant.SAVE_SOB_PETS); 
        sobPets = JSON.parse(sobPets);

        let configObj = await DataStorageLocal.getDataFromAsync(Constant.CONFIG_SENSOR_OBJ);
        configObj = JSON.parse(configObj);

        if(sobPets){
            await DataStorageLocal.removeDataFromAsync(Constant.SAVE_SOB_PETS); 
        }
        firebaseHelper.logEvent(firebaseHelper.event_sensor_pnq_next_btn_action, firebaseHelper.screen_sensor_pn_noti, "User clicked on Next button to navigate to Checkin Questionnaire Page", '');
        if(obJCheckin && Object.keys(obJCheckin).length !== 0){
            // navigation.navigate('CheckinQuestionnaireComponent',{petObj:defaultPet, questionObject : obJCheckin,loginPets:sobPets});
            navigation.navigate('CheckinQuestionnaireComponent',{petObj:configObj.pObj, questionObject : obJCheckin,loginPets:sobPets});
        } else {
            navigation.navigate('DashBoardService',{loginPets:sobPets});
        }
        
    };

    const nextButtonAction = async (actionValue,weekValue,dateValue) => {

        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_sensor_PNP_api, firebaseHelper.screen_sensor_pn_noti, "User clicked on Submit button to Submit Push Notification dates", 'Internet Status : '+internet);
        if(!internet){
            createPopup(Constant.NETWORK_STATUS,Constant.ALERT_NETWORK,true);
        } else {
            set_isLoading(true);
            isLoadingdRef.current = 1;
            set_loaderMsg(Constant.LOADER_WAIT_MESSAGE);
            let json = {
                ClientID: ""+clientId,//parseInt(clientId),
                PetID: ""+petId,//parseInt(petId""),
                NotificationType: actionValue,
                NotificationDay:weekValue ? weekValue : "",
                NotificationDate: dateValue ? ""+dateValue : "",
                Opt:''
             };
             await notificationRequest({ variables: { input: json } });
        }

    };

    const backBtnAction = () => {
        
        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_sensor_pn_noti, "User clicked on back button to navigate to Push Notification Instruction Page", '');
            navigation.navigate('SensorInitialPNQComponent');
        }
        
    };

    const createPopup = (msg,title,isPop) => {
        set_popUpMessage(msg);
        set_popUpAlert(title);
        set_isPopUp(isPop);
        popIdRef.current = 1;
    };

    const popOkBtnAction = () => {

        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpAlert(undefined);
        set_popUpMessage(undefined);
        
    };

    const popCancelBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpAlert(undefined);
        set_popUpMessage(undefined);
    };

return (

       <SensorPNQUI
            isLoading = {isLoading}
            isPopUp = {isPopUp}
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            loaderMsg = {loaderMsg}
            nextButtonAction = {nextButtonAction}
            backBtnAction = {backBtnAction}
            popOkBtnAction = {popOkBtnAction}
            popCancelBtnAction = {popCancelBtnAction}       
       />
    );
};

export default SensorPNQComponent;
