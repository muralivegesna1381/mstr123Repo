import React, { useState, useRef } from 'react';
import {BackHandler} from 'react-native';
import ObservationUI from './observationUI';
import * as internetCheck from "./../../../../utils/internetCheck/internetCheck";
import * as Constant from "./../../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../../utils/storage/dataStorageLocal";
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../../../utils/authorisedComponent/authorisedComponent';
import * as ServiceCalls from './../../../../utils/getServicesData/getServicesData.js';

let trace_inAddObservation_SelectBehvaior_ObsText;
let trace_Get_Behaviors_API_Complete;

const  ObservationComponent = ({navigation, route, ...props }) => {

    const [selectedPet, set_selectedPet] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [obsText , set_obsText] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [behavioursData, set_behavioursData] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [obsObject, set_obsObject] = useState(undefined);
    const [behName, set_behName] = useState(undefined);
    const [nxtBtnEnable, set_nxtBtnEnable] = useState(false);
    const [obserItem, set_obserItem] = useState("");
    const [isPets, set_isPets] = useState(false);
    const [behType,set_behType] = useState(1);

    let fromScreen = useRef();
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    React.useEffect(() => {    
      
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      getObsDetails();
        const focus = navigation.addListener("focus", () => {
          set_Date(new Date());
          observationsAddObsTextSessionStart();
          firebaseHelper.reportScreen(firebaseHelper.screen_add_observations_text_beh);
          firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_add_observations_text_beh, "User in Add Observations Obs Text and behavior Selection Screen", '');
          
        });

        const unsubscribe = navigation.addListener('blur', () => {
          observationsAddObsTextSessionStop();
        });

        return () => {
            observationsAddObsTextSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
            focus();
            unsubscribe();
          };

    }, [navigation]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const observationsAddObsTextSessionStart = async () => {
      trace_inAddObservation_SelectBehvaior_ObsText = await perf().startTrace('t_inObservationsList');
    };  

    const observationsAddObsTextSessionStop = async () => {
      await trace_inAddObservation_SelectBehvaior_ObsText.stop();
    }; 

    const getObsDetails = async () => {

      let oJson = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
      oJson = JSON.parse(oJson);
      if(oJson){

          set_obsObject(oJson);
          set_selectedPet(oJson.selectedPet);
          fromScreen.current = oJson.fromScreen;
          set_obsText(oJson.obsText);

          if(oJson.obsText && oJson.obserItem){
            set_nxtBtnEnable(true)
          } else {
            set_nxtBtnEnable(false)
          }
          
          if(oJson.obserItem){
            set_behName(oJson.obserItem.behaviorName); 
            set_behType(oJson.obserItem.behaviorTypeId);
          }
          
          set_obserItem(oJson.obserItem); 
          set_isPets(oJson.isPets);

          set_isLoading(true);
          isLoadingdRef.current = 1;
          firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_api, firebaseHelper.screen_add_observations_text_beh, "Initiating the Behaviors api", 'Species Id : '+oJson.selectedPet.speciesId);
          behavioursAPIRequest(oJson.selectedPet.speciesId);
      }
    };

    function sortByAscending(arrayBeh) {
      const sortedList = arrayBeh.sort((a, b) => a.behaviorName.localeCompare(b.behaviorName));
        return sortedList;
    }
    
    const behavioursAPIRequest = async (sId) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        set_loaderMsg(Constant.BEHAVIOURS_LOADING_MSG);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        trace_Get_Behaviors_API_Complete = await perf().startTrace('t_Get_Behaviors_API');
        if(!sId){
          sId = 1;
        }
        getBehavioursFromBckEnd(sId,token);

    };

    const getBehavioursFromBckEnd = async (sid,token) => {

      let getBehScoreServiceObj = await ServiceCalls.getPetBehaviors(sid,token);
      set_isLoading(false);
      isLoadingdRef.current = 0;
      stopFBTraceGetBehaviors();

      if(getBehScoreServiceObj && getBehScoreServiceObj.logoutData){
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
        return;
      }
        
      if(getBehScoreServiceObj && !getBehScoreServiceObj.isInternet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
        return;
      }
  
      if(getBehScoreServiceObj && getBehScoreServiceObj.statusData){
        if(getBehScoreServiceObj.responseData && getBehScoreServiceObj.responseData.length > 0){
          let behArray = sortByAscending(getBehScoreServiceObj.responseData);
          set_behavioursData(behArray);                         
        } else {
          set_behavioursData(undefined);     
        }
        
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_api_fail, firebaseHelper.screen_add_observations_text_beh, "Behaviors api fail", 'Service Status : false');
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      }
  
      if(getBehScoreServiceObj && getBehScoreServiceObj.error) {
        let errors = getBehScoreServiceObj.error.length > 0 ? getBehScoreServiceObj.error[0].code : '';
        firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_api_fail, firebaseHelper.screen_add_observations_text_beh, "Behaviors api fail", 'error : '+errors);
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      }

    };

    const stopFBTraceGetBehaviors = async () => {
      await trace_Get_Behaviors_API_Complete.stop();
    };

    const submitAction = async (obsText,item) => {

        set_obsText(obsText);
        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_submit, firebaseHelper.screen_add_observations_text_beh, "User clicked on Submit ", 'Internet Status : '+internet);
        if(!internet){

            set_popUpAlert(Constant.ALERT_NETWORK);
            set_popUpMessage(Constant.NETWORK_STATUS);
            set_isPopUp(true);
            popIdRef.current = 1;

        } else {

          let obsObj = obsObject;
          if(obsObject) {
            
            if(fromScreen.current === 'quickVideo') {
              let temObsName = item && item.behaviorName && item.behaviorName.length > 15 ? item.behaviorName.slice(0,15) : item.behaviorName;
              if(obsObj && obsObj.mediaArray[0]){
                obsObj.mediaArray[0].fileName = obsObj.quickVideoFileName+'_'+ temObsName+'.mp4'
              } 
            }
            obsObj.obsText = obsText;
            obsObj.obserItem = item ? item : obsObj.obserItem;
            obsObj.behaviourItem = item ? item : obsObj.behaviourItem;
          }

          await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ,JSON.stringify(obsObj));
          navigation.navigate("SelectDateComponent");  
        }        
        
    };

    const navigateToPrevious = () => {   

      if(isLoadingdRef.current === 0 && popIdRef.current === 0){

        if(fromScreen.current==='obsList'){
          if(isPets){
            navigation.navigate("AddOBSSelectPetComponent"); 
          }else {
            navigation.navigate("ObservationsListComponent"); 
          }
          
        } else if(fromScreen.current==='quickVideo'){
  
          if(isPets){
            navigation.navigate("AddOBSSelectPetComponent"); 
          }else {
            navigation.navigate("QuickVideoComponent"); 
          }
  
          
        } else if(fromScreen.current==='viewObs'){
          navigation.navigate("ViewObservationService"); 
        }
        
        else {
          navigation.navigate("AddOBSSelectPetComponent"); 
        }

      }
          
    };

    const createPopup = (title,msg,isPop) => {
      set_popUpAlert(title);
      set_popUpMessage(msg);
      set_isPopUp(isPop);
      popIdRef.current = 1;
    };

    const popOkBtnAction = () => {
      set_popUpAlert(undefined);
      set_popUpMessage(undefined);
      set_isPopUp(false);
      popIdRef.current = 0;
    }

    return (
        <ObservationUI 
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            isPopUp = {isPopUp}
            isLoading = {isLoading}
            loaderMsg = {loaderMsg}
            behavioursData = {behavioursData}
            obsText = {obsText}
            behName = {behName}
            obserItem = {obserItem}
            nxtBtnEnable = {nxtBtnEnable}
            behType = {behType}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default ObservationComponent;