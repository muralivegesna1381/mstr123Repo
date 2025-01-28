import React, { useState,useRef,useEffect } from 'react';
import { BackHandler } from 'react-native';
import ObservationsListUI from './observationsListUI'
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';
import * as Queries from "./../../../config/apollo/queries";
import { useQuery} from "@apollo/react-hooks";
import * as ObservationModel from "./../observationModel/observationModel.js"
import * as clearAppDataModel from "./../../../utils/appDataModels/clearAppDataModel.js";

let trace_Get_Observations_API_Complete;
let trace_inObservationsList;

const ObservationsListComponent = ({ navigation, route, ...props }) => {

  const { loading:updateObsListLoading, data : updateObsListData } = useQuery(Queries.UPDATE_OBSERVATION_LIST, { fetchPolicy: "cache-only" });
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpTitle, set_popUpTitle] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [defaultPetObj, set_defaultPetObj] = useState(undefined);
  const [petsArray, set_petsArray] = useState(undefined);
  const [isLoading, set_isLoading] = useState(true);
  const [loaderMsg, set_loaderMsg] = useState(undefined);
  const [date, set_Date] = useState(new Date());
  const [observationsArray, set_observationsArray] = useState([]);
  const [defauiltPetId, set_defauiltPetId] = useState(undefined);
  const [isSearchDropdown, set_isSearchDropdown] = useState(undefined);

  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);

  // initiates the Observations API
  React.useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick); 
    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      observationsSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_observations);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_observations, "User in Observations List Screen", '');
      // set_observationsArray(undefined)
      
    });

    getObsPets();
    const unsubscribe = navigation.addListener('blur', () => {
      observationsSessionStop();
    });

    return () => {
      observationsSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      focus();
      unsubscribe();
    };
  }, [navigation]);

  useEffect(() => {

    if(updateObsListData && updateObsListData.data.__typename === 'UpadateObservationList'){
      getObsPets();
    }
      
  }, [updateObsListData]);

  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  // Firebase traces
  const observationsSessionStart = async () => {
    trace_inObservationsList = await perf().startTrace('t_inObservationsList');
  };

  const observationsSessionStop = async () => {
    await trace_inObservationsList.stop();
  };

  // Fetches the Observation permitted pets
  const getObsPets = async () => {

    let obsPets = await DataStorageLocal.getDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
    obsPets = JSON.parse(obsPets);

    let duplicates = getUnique(obsPets, 'petID');
    set_petsArray(duplicates);

    let defPet = await DataStorageLocal.getDataFromAsync(Constant.OBS_SELECTED_PET);
    set_defaultPetObj(JSON.parse(defPet));
    set_defauiltPetId(JSON.parse(defPet).petID);

    trace_Get_Observations_API_Complete = await perf().startTrace('t_Get_Observations_List_API');
    getObservationList(JSON.parse(defPet).petID);

  };

  // removes the duplicate objects from the Pets array
  function getUnique(petArray, index) {
    const uniqueArray = petArray.map(e => e[index]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => petArray[e]).map(e => petArray[e]);
    return uniqueArray;
  };

  // API to fetch the observations data
  const getObservationList = async (petId) => {
    
    set_isLoading(true);
    isLoadingdRef.current = 1;
    set_loaderMsg(Constant.OBSERVATION_LOADING_MSG);
    let apiMethod = apiMethodManager.GET_OBSERVATION_LIST + petId;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    stopFBTraceGetObserrvations();
            
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      
      if(apiService.data.petObservations && apiService.data.petObservations.length > 0){
        set_observationsArray(apiService.data.petObservations);
      } else {
        set_observationsArray([]);
      }

      set_isLoading(false);
      isLoadingdRef.current = 0;
            
    } else if(apiService && apiService.isInternet === false) {

      set_isLoading(false);
      isLoadingdRef.current = 0;
      firebaseHelper.logEvent(firebaseHelper.event_observation_list_api_fail, firebaseHelper.screen_observations, "Observations List Api Failed", 'Internet : false');
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

      set_isLoading(false);
      isLoadingdRef.current = 0;
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      firebaseHelper.logEvent(firebaseHelper.event_observation_list_api_fail, firebaseHelper.screen_observations, "Observations List Api Failed", 'error : '+apiService.error.errorMsg);
    
    } else {

      set_isLoading(false);
      isLoadingdRef.current = 0;
      firebaseHelper.logEvent(firebaseHelper.event_observation_list_api_fail, firebaseHelper.screen_observations, "Observations List Api Failed", 'Service Status : false');
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);

    }

  };

  const stopFBTraceGetObserrvations = async () => {
    await trace_Get_Observations_API_Complete.stop();
  };

  /**
   * Navigates to Add observations component, when Observations pets count is 1
   * else navigates to pet component to select the pet to upload the observation
   * @param {*} value 
   */
  const submitAction = async () => {

    searchDropAction();
    clearAppDataModel.clearObservationData();
    ObservationModel.observationData.selectedPet = defaultPetObj;
    ObservationModel.observationData.fromScreen = 'obsList';
    ObservationModel.observationData.isPets = false;
    ObservationModel.observationData.isEdit = false;
    ObservationModel.observationData.selectedDate = new Date();

    await DataStorageLocal.removeDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
    firebaseHelper.logEvent(firebaseHelper.event_observations_new_btn, firebaseHelper.screen_observations, "User clicked on Add new Observation", 'Pet Id : '+defauiltPetId);
    
    if (petsArray && petsArray.length > 1) {
      navigation.navigate('AddOBSSelectPetComponent', { petsArray: petsArray, defaultPetObj: defaultPetObj });
    } else {
      navigation.navigate('CategorySelectComponent');
    }

  };

  // Navigates to Dashboard
  const navigateToPrevious = () => {
    if(isLoadingdRef.current === 0 && popIdRef.current === 0){
      navigation.pop();
    } 
  };

  // Popup Actions
  const createPopup = (title,msg,isPop) => {
    set_popUpTitle(title);
    set_popUpMessage(msg);
    set_isPopUp(isPop);
    popIdRef.current = 1;
};


  // Popup btn Actions
  const popOkBtnAction = () => {
    set_isPopUp(false);
    popIdRef.current = 0;
    set_popUpTitle(undefined);
    set_popUpMessage(undefined);
  };

  // Selects the pet to view the Observation data
  const observationsPetSelection = () => {
    getObsPets();
  };

  // Navigates to view the selected observation record
  const selectObservationAction = async (item) => {
    
    searchDropAction();
    clearAppDataModel.clearObservationData();
    ObservationModel.observationData.selectedDate = new Date();

    firebaseHelper.logEvent(firebaseHelper.event_observations_view_btn, firebaseHelper.screen_observations, "User clicked on View Observation", '');
    await DataStorageLocal.removeDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
    navigation.navigate('ViewObservationService', { obsObject: item });
  };

  const selectedSearchPetAction = (item) => {
    getObsPets();
  };

  // Removes Dropdown while navigating to another screen
  const searchDropAction = () => {
    if(isSearchDropdown === false) {
      set_isSearchDropdown(undefined);
    } else {
      set_isSearchDropdown(false);
    }
  };

  return (
    <ObservationsListUI
      defaultPetObj={defaultPetObj}
      petsArray={petsArray}
      isPopUp={isPopUp}
      popUpMessage={popUpMessage}
      popUpTitle={popUpTitle}
      isLoading={isLoading}
      loaderMsg={loaderMsg}
      observationsArray={observationsArray}
      isSearchDropdown = {isSearchDropdown}
      popOkBtnAction={popOkBtnAction}
      submitAction={submitAction}
      observationsPetSelection={observationsPetSelection}
      navigateToPrevious={navigateToPrevious}
      selectObservationAction={selectObservationAction}
      selectedSearchPetAction = {selectedSearchPetAction}
    />
  );

}

export default ObservationsListComponent;