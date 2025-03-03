import React, { useState, useRef } from 'react';
import {BackHandler} from 'react-native';
import ObservationUI from './observationUI';
import * as internetCheck from "./../../../../utils/internetCheck/internetCheck";
import * as Constant from "./../../../../utils/constants/constant";
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../../utils/getServicesData/apiMethodManger.js';
import * as ObservationModel from "./../../observationModel/observationModel.js"

let trace_inAddObservation_SelectBehvaior_ObsText;
let trace_Get_Behaviors_API_Complete;

const  ObservationComponent = ({navigation, route, ...props }) => {

  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [obsText , set_obsText] = useState(undefined);
  const [behavioursData, set_behavioursData] = useState(undefined);
  const [date, set_Date] = useState(new Date());
  const [behName, set_behName] = useState(undefined);
  const [nxtBtnEnable, set_nxtBtnEnable] = useState(false);
  const [obserItem, set_obserItem] = useState("");
  const [behType,set_behType] = useState(1);
  const [isLoading, set_isLoading] = useState(false);
  const [loaderMsg, set_loaderMsg] = useState(undefined);

  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);

  React.useEffect(() => {    
      
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    getObsDetails(); 
    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      observationsAddObsTextSessionStart();
      // firebaseHelper.reportScreen(firebaseHelper.screen_add_observations_text_beh);
      // firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_add_observations_text_beh, "User in Add Observations Obs Text and behavior Selection Screen", '');
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

    let oJson = ObservationModel.observationData;
    Object.keys(oJson.obsText).length > 0 ? set_obsText(oJson.obsText) : set_obsText(undefined);
    Object.keys(oJson.behaviourItem).length > 0 ? set_behName(oJson.behaviourItem.behaviorName) : set_behName(undefined);
    Object.keys(oJson.behaviourItem).length > 0 ? set_obserItem(oJson.behaviourItem) : set_obserItem(undefined);
    Object.keys(oJson.behaviourItem).length > 0 ? set_behType(oJson.behaviourItem.behaviorTypeId) : set_behType(undefined);

    if(oJson.obsText && Object.keys(oJson.behaviourItem).length > 0){
      set_nxtBtnEnable(true)
    } else {
      set_nxtBtnEnable(false)
    }

    behavioursAPIRequest(oJson.selectedPet.speciesId,oJson.ctgNameId);

  };

  const behavioursAPIRequest = async (sId,ctgNameId) => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    set_loaderMsg(Constant.BEHAVIOURS_LOADING_MSG);
    if(!sId){
      sId = 1;
    }
    getBehavioursFromBckEnd(sId,ctgNameId);

  };

  const getBehavioursFromBckEnd = async (sid,ctgNameId) => {

    let apiMethod = apiMethodManager.GET_BEHAVIORS + sid;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    set_isLoading(false);
    isLoadingdRef.current = 0;
        
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {

      if(apiService.data.petBehaviorList && apiService.data.petBehaviorList.length > 0){
        
        let behArray = sortByAscending(apiService.data.petBehaviorList);
        let behTemp = []
        if(ctgNameId === 0) {
          behTemp = behArray.filter(item => item.behaviorTypeId === 3);
        } else if(ctgNameId === 1) {
          behTemp = behArray.filter(item => item.behaviorTypeId === 4);
        }
        set_behavioursData(behTemp);                         
      } else {
        set_behavioursData(undefined);
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.DETAILS_FETCH_BEHAVIOR,true);     
      }
            
    } else if(apiService && apiService.isInternet === false) {
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_api_fail, firebaseHelper.screen_add_observations_Category, "Behaviors api fail", 'error : '+apiService.error.errorMsg);
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
    } else {
      firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_api_fail, firebaseHelper.screen_add_observations_Category, "Behaviors api fail", 'Service Status : false');
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);

    }

  };

  function sortByAscending(arrayBeh) {
    const sortedList = arrayBeh.sort((a, b) => a.behaviorName.localeCompare(b.behaviorName));
    return sortedList;
  };  

  const submitAction = async (obsText,item) => {

    let internet = await internetCheck.internetCheck();
    firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_submit, firebaseHelper.screen_add_observations_text_beh, "User clicked on Submit ", 'Internet Status : '+internet);
      
    if(!internet){

<<<<<<< HEAD
        set_popUpAlert(Constant.ALERT_NETWORK);
        set_popUpMessage(Constant.NETWORK_STATUS);
        set_isPopUp(true);
        popIdRef.current = 1;

      } else {

        let obsObj = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
        obsObj = JSON.parse(obsObj);

        if(obsObj) {
            
          if(fromScreen.current === 'quickVideo') {

            let bName = item && item.behaviorName ? item.behaviorName.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '') : 'NOBEHAVIOR';
            bName = bName !== "" ? (bName.length > 15 ? bName.substring(0, 15) : bName) : 'NOBEHAVIOR';
            // let temObsName = item && item.behaviorName && item.behaviorName.length > 15 ? item.behaviorName.slice(0,15) : item.behaviorName;
            if(obsObj && obsObj.mediaArray[0]){
              let fileName = obsObj.quickVideoFileName+'_'+ bName;
              obsObj.mediaArray[0].fileName = fileName.toLocaleLowerCase() +'.mp4'
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

      // if(isLoadingdRef.current === 0 && popIdRef.current === 0){
      //   navigation.navigate("CategorySelectComponent"); 
      // }

      navigation.pop();
          
    };

    const createPopup = (title,msg,isPop) => {
      set_popUpAlert(title);
      set_popUpMessage(msg);
      set_isPopUp(isPop);
=======
      set_popUpAlert(Constant.ALERT_NETWORK);
      set_popUpMessage(Constant.NETWORK_STATUS);
      set_isPopUp(true);
>>>>>>> feature/wearables_dev0.74_withoutEnhancements
      popIdRef.current = 1;

    } else {

      if(ObservationModel.observationData) {
            
        if(ObservationModel.observationData.fromScreen === 'quickVideo') {

          let bName = item && item.behaviorName ? item.behaviorName.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '') : 'NOBEHAVIOR';
          bName = bName !== "" ? (bName.length > 15 ? bName.substring(0, 15) : bName) : 'NOBEHAVIOR';
          if(ObservationModel.observationData.mediaArray.length > 0){
            let fileName = ObservationModel.observationData.quickVideoFileName
            ObservationModel.observationData.mediaArray[0].fileName = fileName.toLocaleLowerCase() +'.mp4';
          } 
        }
        ObservationModel.observationData.obsText = obsText;
        ObservationModel.observationData.obserItem = item ? item : ObservationModel.observationData.obserItem;
        ObservationModel.observationData.behaviourItem = item ? item : ObservationModel.observationData.behaviourItem;
      }
      navigation.navigate("SelectDateComponent");  
    }        
        
  };

  const navigateToPrevious = () => {   
    navigation.pop();   
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
      behavioursData = {behavioursData}
      obsText = {obsText}
      behName = {behName}
      obserItem = {obserItem}
      nxtBtnEnable = {nxtBtnEnable}
      behType = {behType}
      isLoading = {isLoading}
      loaderMsg = {loaderMsg}
      navigateToPrevious = {navigateToPrevious}
      submitAction = {submitAction}
      popOkBtnAction = {popOkBtnAction}
    />
  );

}
  
export default ObservationComponent;