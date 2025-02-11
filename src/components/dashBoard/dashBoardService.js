import React, { useState, useEffect, useRef } from 'react';
import {BackHandler} from 'react-native';
import * as Queries from "../../config/apollo/queries";
import DasBoardComponent from './dashBoardComponent';
import * as Storage from '../../utils/storage/dataStorageLocal';
import * as Constant from "../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as Apolloclient from './../../config/apollo/apolloConfig';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as AppPetsData from '../../utils/appDataModels/appPetsModel.js';
import * as modularPermissions from '../../utils/appDataModels/modularPermissionsModel.js';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";
import perf from '@react-native-firebase/perf';
import RNExitApp from 'react-native-exit-app';
import moment from 'moment/moment';

const PERMISSION_OBSERVATIONS = 1;
const PERMISSION_QUESTIONNAIRE = 2;
const PERMISSION_POINTTRACKING = 3;
const PERMISSION_TIMER = 5;
const PERMISSION_PETWEIGHT = 7;
const Permission_EatingEnthusiasm = 8;
const PERMISSION_IMAGESCORING = 9;
const PERMISSION_FM_GOAL_SET = 12;
const PERMISSION_IDEAL_BODY_WHT = 13;
const PERMISSION_FM_CHAT = 14;
const PERMISSION_FEEDING_REQ = 10;
const PERMISSION_FOOD_HISTORY = 11;
const PERMISSION_SLEEP_CHART = 15;

let trace_inDashBoard;

const DasBoardService = ({ navigation, route, ...props }) => {

  const [isLoading, set_isLoading] = useState(true);
  const [loaderMsg, set_loaderMsg] = useState(Constant.DASHBOARD_LOADING_MSG);
  const [isFirstUser, set_isFirstUser] = useState(false);
  const [petsArray, set_petsArray] = useState([]);
  const [activeSlide, set_activeSlide] = useState(0);
  const [isModularityService, set_isModularityService] = useState(false);
  const [deviceStatusText, set_deviceStatusText] = useState(undefined);
  const [buttonTitle, set_buttonTitle] = useState(undefined);
  const [questionnaireData, set_questionnaireData] = useState(undefined);
  const [isQuestLoading, set_isQuestLoading] = useState(false);
  const [supportMetialsArray, set_supportMetialsArray] = useState();
  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [popUpRBtnTitle, set_popUpRBtnTitle] = useState(undefined);
  const [isPopupLeft, set_isPopupLeft] = useState(false);
  const [petWeightUnit, set_petWeightUnit] = useState(undefined);
  const [leaderBoardPetId, set_leaderBoardPetId] = useState(undefined);
  const [leaderBoardArray, set_leaderBoardArray] = useState([]);
  const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
  const [campagainArray, set_campagainArray] = useState([]);
  const [campagainName, set_campagainName] = useState("");
  const [isPTLoading, set_isPTLoading] = useState(false);
  const [questionnaireDataLength,set_questionnaireDataLength] = useState(undefined);
  const [questSubmitLength,set_questSubmitLength] = useState(0);
  const [date, set_Date] = useState(new Date());
  const [firstName, set_firstName] = useState(undefined);
  const [secondName, set_secondName] = useState(undefined);
  const [ptActivityLimits, set_ptActivityLimits] = useState(undefined);
  const [behVisualData, set_behVisualData] = useState(undefined);
  const [weightHistoryData, set_weightHistoryData] = useState(undefined);
  const [isFoodHistory, set_isFoodHistory] = useState(false);
  const [foodHistoryObj, set_foodHistoryObj] = useState(undefined);
  const [tempPermissions, set_tempPermissions] = useState(null);
  const [changeInPetObj, set_changeInPetObj] = useState(null);
  const [petType, set_petType] = useState(null);
  const [isNotificationCount, set_isNotificationCount] = useState(false);

  var setupDonePetsRef = useRef([]);
  var setupDonePetsLength = useRef(0);
  var enableLoader = useRef(true);
  var modularityServiceCount = useRef(0);
  var pushTimerPetsArray = useRef([]);
  var pushObservationsPetsArray = useRef([]);
  var pushQuestionnairePetsArray = useRef([]);
  var pushPTPetsArray = useRef([]);
  var isDefaultModularity = useRef(false);
  var currentCampaignPet = useRef(undefined);
  var petArrayRef = useRef(undefined);

  React.useEffect(() => {

    clearObjects();
    // removeItems();
    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      dashBoardSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_dashboard);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_dashboard, "User in Dashboard Screen", ''); 
      getTimerDetails();
      checkInitialDashboardData();
    });

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    const unsubscribe1 = navigation.addListener('blur', () => {
      dashBoardSessionStop();
      enableLoader.current = false;
      isDefaultModularity.current = true;
    });

    return () => {
      focus();
      unsubscribe1();
      dashBoardSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
    
  }, []);

  useEffect(() => {
    if (route.params?.loginPets && route.params?.loginPets.length > 0) {
      set_petsArray(route.params?.loginPets);
    }
  }, [route.params?.loginPets]);

  const dashBoardSessionStart = async () => {
    trace_inDashBoard = await perf().startTrace('t_inDashBoard');
  };

   const dashBoardSessionStop = async () => {
    await trace_inDashBoard.stop();
   }

   const handleBackButtonClick = () => {
    set_popUpAlert('Exit App');
    set_popUpMessage(Constant.ARE_YOU_SURE_YOU_WANT_EXIT);
    set_popUpRBtnTitle('YES');
    set_isPopupLeft(true);
    set_isPopUp(true);
    return true;
  };

  /**
   * Checks if the logged in user is First Time User or not
   * When not First time user, initiates the getPetDevicesByPetParent Service call
   */
  const checkInitialDashboardData = async () => {

    let isMultiLogin = await Storage.getDataFromAsync(Constant.IS_MULTIPLE_LOGIN);
    if(isMultiLogin && isMultiLogin === 'multipleLogin') {
      isDefaultModularity.current = false;
      await Storage.removeDataFromAsync(Constant.IS_MULTIPLE_LOGIN);
    }
    if (AppPetsData && AppPetsData.petsData && AppPetsData.petsData.isFirstUser) {
      getUserDetails();
      set_buttonTitle('ONBOARD YOUR PET');
      set_isLoading(false);
      clearModularityPets();
      await getNotificationsApi();
    } else {
      if(enableLoader.current) {
        set_isLoading(true);
        set_loaderMsg(Constant.DASHBOARD_LOADING_MSG);
      } 
      getDashBoardPets();
    }
  };

  const getUserDetails = async () => {
   
    let firstName = UserDetailsModel.userDetailsData.user.firstName;
    let secondName = UserDetailsModel.userDetailsData.user.lastName;
    if (firstName){
      set_firstName(firstName);
    }
    if (secondName){
      set_secondName(secondName);
    }
    
  };

  /**
   * Service call to fetch the Pet details from the backend.
   * @param {*} clientID 
   * Calculates the Sensor setup pending, setup done or Device missing status for each pet.
   * When atleat one pet is having the sensor Setup Staus as Done, calls the method to initiate the Modularity permissions check.
   */
   const getDashBoardPets = async () => {

    let clientID = await Storage.getDataFromAsync(Constant.CLIENT_ID);
    let apiMethod = apiMethodManager.GET_PETPARENT_PETS + clientID;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      
      if(apiService.data.petDevices.length > 0){
        set_isFirstUser(false);
        set_petsArray(apiService.data.petDevices);
        petArrayRef.current = apiService.data.petDevices;
        AppPetsData.petsData.totalPets = apiService.data.petDevices;
        setDefaultSlide();
      } else {
        set_isLoading(false);
        AppPetsData.petsData.isFirstUser = true;
      }
            
    } else if(apiService && apiService.isInternet === false) {

      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getPets_fail, firebaseHelper.screen_dashboard, "Dashboard Getpets Service failed", 'Service error : ' + apiService.error.errorMsg);
    
    } else {

      set_isLoading(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,'OK', false,true);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getPets_fail, firebaseHelper.screen_dashboard, "Dashboard Getpets Service failed", 'Service Status : false');

    }

  };

  // removes the duplicate objects from the Pets array
  function getUnique(petArray, index) {
    const uniqueArray = petArray.map(e => e[index]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => petArray[e]).map(e => petArray[e]);
    return uniqueArray;
  };

  const removeModularity = async () => {
    await Storage.removeDataFromAsync(Constant.TIMER_PETS_ARRAY);
    await Storage.removeDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
    await Storage.removeDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
  }

  const setDefaultSlide = async () => {

    let defaultPet = AppPetsData.petsData.defaultPet;
    let petsArray = AppPetsData.petsData.totalPets;
   
    let index = 0;

    if(!defaultPet || defaultPet === null){
      AppPetsData.petsData.defaultPet = petsArray[0];
      defaultPet = petsArray[0];
    } else {
      for (var i = 0; i < petsArray.length; i++) {
        if (petsArray[i].petID === defaultPet.petID) {
          index = i;
          AppPetsData.petsData.defaultPet = petsArray[i];
          break;
        }
      }
    }

    set_activeSlide(index);
    let value = defaultPet.devices && defaultPet.devices.length > 0 ? defaultPet.devices[0].isDeviceSetupDone : 'noDevices'
    firebaseHelper.logEvent(firebaseHelper.event_dashboard_defaultPet_Status, firebaseHelper.screen_dashboard, "Pet Name : "+ defaultPet.petName, 'Pets Status : ' + value);

    if(parseInt(defaultPet.petStatus) === 3 || parseInt(defaultPet.petStatus) === 4){
      AppPetsData.petsData.isDeceased = true;
    } else {
      AppPetsData.petsData.isDeceased = false;
    }
    
    if(defaultPet.devices && defaultPet.devices.length > 0) {
      AppPetsData.petsData.isDeviceSetupDone = defaultPet.devices[0].isDeviceSetupDone;
      AppPetsData.petsData.deviceModel = defaultPet.devices[0].deviceModel;
      AppPetsData.petsData.isDeviceMissing = false;
    } else {
      AppPetsData.petsData.isDeviceSetupDone = false;
      AppPetsData.petsData.isDeviceMissing = true;
    }

    if(defaultPet.devices && defaultPet.devices.length > 5) {
      AppPetsData.petsData.showSearch = true;
    } else {
      AppPetsData.petsData.showSearch = false;
    }

    if (changeInPetObj === null) {
      set_changeInPetObj(true);
    } else if (changeInPetObj) {
      set_changeInPetObj(false);
    } else {
      set_changeInPetObj(null);
    }

    if(defaultPet && defaultPet.speciesId && parseInt(defaultPet.speciesId) === 2) {
      set_petType('cat');
    } else if(defaultPet && defaultPet.speciesId && parseInt(defaultPet.speciesId) === 1) {
      set_petType('dog');
    } else {
      set_petType(undefined);
    }
   await getNotificationsApi();
    await getPetModularity(defaultPet.petID);

  };

  const refreshDashBoardDetails = async () => {

    set_supportMetialsArray([]);
    enableLoader.current = true;
    isDefaultModularity.current = true;
    modularityServiceCount.current = 0;
    setupDonePetsLength.current = 1;
    setDefaultSlide()

  };

  const getPetModularity = async (petId) => {

    if(enableLoader.current) {
      set_isLoading(true);
    }

    let obj = {"petIds":[petId]}
    let apiMethod = apiMethodManager.GET_MOBILEAPPCONFIGS;
    let apiService = await apiRequest.postData(apiMethod,obj,Constant.SERVICE_JAVA,navigation);
    
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      
      if(apiService.data.mobileAppConfigs){        
        await checkModularPermissions(apiService.data.mobileAppConfigs, petId);
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_getModularity_fail, firebaseHelper.screen_dashboard, "Dashboard Modularity Service", 'Getting Modularity in Dashboard : No Datafound');
      }
            
    } else if(apiService && apiService.isInternet === false) {
      
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      return;
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getModularity_fail, firebaseHelper.screen_dashboard, "Dashboard Modularity Service Failed", 'error : '+apiService.error.errorMsg);
      
    } else {

      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getModularity_fail, firebaseHelper.screen_dashboard, "Dashboard Modularity Service Failed", 'error : '+'Status Failed');
      
    }

  };

  // App Visualisation Service API
  const getPetBehaviorVisualization = async (petId) => {

    let apiMethod = apiMethodManager.GET_BEHAVIORVISUALISATION + petId;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    set_isLoading(false);
    modularPermissions.modularPermissionsData.isFmDataService = false;

    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      
      if(apiService.data){
        set_behVisualData(apiService.data);
      } else {
        set_behVisualData(undefined)
      }
            
    } else if(apiService && apiService.isInternet === false) {
      
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      return;
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_getVisual_fail, firebaseHelper.screen_dashboard, "Dashboard Get Visualization Service failed", 'errors : ' + apiService.error.errorMsg);
      
    } else {
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_getVisual_fail, firebaseHelper.screen_dashboard, "Dashboard Get Visualization Service failed", 'Service Status : false');
    }

  };

  // App Visualisation Service API
  const getPetWeightHistory = async (petId) => {

    let toDate =  moment(new Date()).format("YYYY-MM-DD")
    let fromDate =  new Date();
    fromDate.setDate(fromDate.getDate() - 6);
    fromDate = moment(fromDate).format("YYYY-MM-DD");

    let apiMethod = apiMethodManager.GET_PET_WEIGHT_HISTORY_DATE_RECORDS + petId + "?" + "fromDate=" + fromDate + "&" + "toDate=" + toDate;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    if (!modularPermissions.modularPermissionsData.isFmDataService) {
      set_isLoading(false);
    }  
    
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      if(apiService.data){
        set_weightHistoryData(apiService.data);
      } else {
        set_weightHistoryData(undefined);
      }
            
    } else if(apiService && apiService.isInternet === false) {
      
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      return;
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_getPet_Wgt_History_fail, firebaseHelper.screen_dashboard, "Dashboard Get Pet Weight History Service failed", 'error : ' + apiService.error.errorMsg);

    } else {
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_getPet_Wgt_History_fail, firebaseHelper.screen_dashboard, "Dashboard Get Pet Weight History Service failed", 'error : ' + 'Status failed');
      set_isLoading(false);
      
    }

  };

  /**
   * Saves the Timer permission enabled pets.
   * Used while initiating the timer.
   * @param {*} setupDonePet 
   */
   const savePetsForTImer = async (timerPets) => {

    if (timerPets && timerPets.length > 0) {
      await Storage.saveDataToAsync(Constant.TIMER_PETS_ARRAY, JSON.stringify(timerPets));
    } else {
      await Storage.removeDataFromAsync(Constant.TIMER_PETS_ARRAY);
    }

  };

  /**
   * Saves the Timer permission enabled pets.
   * Used while initiating the timer.
   * @param {*} setupDonePet 
   */
  const savePetsForFH = async (fhPets) => {

    if (fhPets && fhPets.length > 0) {
      await Storage.saveDataToAsync(Constant.FH_PETS_ARRAY, JSON.stringify(fhPets));
    } else {
      await Storage.removeDataFromAsync(Constant.FH_PETS_ARRAY);
    }

  };

  /**
   * Saves the Questionnaire permission enabled pets.
   * Used in Questionnaire feature.
   * @param {*} questPets 
   */
  const savePetsForQuestionnaire = async (questPets) => {

    if (questPets && questPets.length > 0) {
      await Storage.saveDataToAsync(Constant.QUESTIONNAIR_PETS_ARRAY, JSON.stringify(questPets));
    } else {
      await Storage.removeDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
    }
  };

  /**
   * Saves the Observations permission enabled pets.
   * Used in Observations feature.
   * @param {*} obsPets 
   */

  const savePetsForObservations = async (obsPets) => {

    if (obsPets && obsPets.length > 0) {
      await Storage.saveDataToAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY, JSON.stringify(obsPets));
    } else {
      await Storage.removeDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
    }
  };

  const checkModularPermissions = async (modularArray1,petId) => {

    if(modularArray1) {

      let modularArrayMain = Object.keys(modularArray1).map(key => ({[key]: modularArray1[key]}));
      let newValue = undefined;
      for (let i = 0; i < modularArrayMain.length; i++) {

        let newKey = Object.keys(modularArrayMain[i]);
        if(newKey[0].toString() === petId.toString()) {
          newValue = Object.values(modularArrayMain[i]);
          break; 
        } 

      }

      if(newValue) {
        updateModularity(newValue[0]);
      } else {
        set_isLoading(false)
        updateModularity([]);
      }
    }

  };

  const updateModularity = async (modularArray1) => {

    let defaultPet = AppPetsData.petsData.defaultPet;
    let tempArray = [];
    let modularArray = [];

    for (let i = 0; i < modularArray1.length; i++) {
      tempArray.push(modularArray1[i].mobileAppConfigId);
      if (modularArray1[i].mobileAppConfigId === PERMISSION_PETWEIGHT) {
        set_petWeightUnit(modularArray1[i].weightUnit);
      }
    }

    modularArray = tempArray;
    firebaseHelper.logEvent(firebaseHelper.event_dashboard_defaultPet_modularity, firebaseHelper.screen_dashboard, "DBoard Default Pet Permissions", 'P Set : '+JSON.stringify(modularArray));
    
    if (modularArray.includes(PERMISSION_FM_CHAT) && defaultPet.showFmChart) { 
      modularPermissions.modularPermissionsData.isFmGraph = true;
      modularPermissions.modularPermissionsData.isFmDataService = true;
    } else {
      modularPermissions.modularPermissionsData.isFmGraph = false;
      modularPermissions.modularPermissionsData.isFmDataService = false;
    }

    if (modularArray.includes(PERMISSION_FM_GOAL_SET) && defaultPet.showFmGoalSetting) {
      modularPermissions.modularPermissionsData.isFmGoalSet = true;
      modularPermissions.modularPermissionsData.isFmDataService = true;
    } else {
      modularPermissions.modularPermissionsData.isFmGoalSet = false;
      modularPermissions.modularPermissionsData.isFmDataService = false;
    }

    if (modularArray.includes(PERMISSION_SLEEP_CHART) && defaultPet.showSleepChart) {
      modularPermissions.modularPermissionsData.isSleepGraph = true;
      modularPermissions.modularPermissionsData.isFmDataService = true;
    } else {
      modularPermissions.modularPermissionsData.isSleepGraph = false;
      modularPermissions.modularPermissionsData.isFmDataService = false;
    }

    if (modularArray.includes(PERMISSION_PETWEIGHT)) {
      modularPermissions.modularPermissionsData.isPetWeight = true;
    } else {
      modularPermissions.modularPermissionsData.isPetWeight = false;
    }

    if (modularArray.includes(Permission_EatingEnthusiasm)) {
      modularPermissions.modularPermissionsData.isEatingEnthusiasm = true;
    } else {
      modularPermissions.modularPermissionsData.isEatingEnthusiasm = false;
    }

    if (modularArray.includes(PERMISSION_IMAGESCORING)) {
      modularPermissions.modularPermissionsData.isImageScoring = true;
    } else {
      modularPermissions.modularPermissionsData.isImageScoring = false;
    }

    if (modularArray.includes(PERMISSION_POINTTRACKING)) {

      if(enableLoader.current){
        modularPermissions.modularPermissionsData.ptExists = true;
         getCampaignListByPet();
      } else {
        modularPermissions.modularPermissionsData.ptExists = false;
      }
      
    } else {
      modularPermissions.modularPermissionsData.ptExists = false;
      modularPermissions.modularPermissionsData.isPTEnable = false;
    }

    if (modularArray.includes(PERMISSION_IDEAL_BODY_WHT)) {
      await getPetWeightHistory(defaultPet.petID);
      modularPermissions.modularPermissionsData.isWeightPer = true;
    } else {
      modularPermissions.modularPermissionsData.isWeightPer = false;
    }

    if (modularArray.includes(PERMISSION_QUESTIONNAIRE)) {
      modularPermissions.modularPermissionsData.isQuestionnaireEnable = true;
      permissionPetsAPI(2);
      getQuestionnaireData();
    } else {

      let questPeri = await Storage.getDataFromAsync(Constant.QUETIONNAIRE_PERMISSION,);
      if(questPeri && questPeri === 'available' || defaultPet.petSpecQuesCount > 0) {
        modularPermissions.modularPermissionsData.isQuestionnaireEnable = true;
        permissionPetsAPI(2);
        getQuestionnaireData();
      } else {
        modularPermissions.modularPermissionsData.isQuestionnaireEnable = false;
      }
      
    }

    if (modularArray.includes(PERMISSION_OBSERVATIONS)) {
      modularPermissions.modularPermissionsData.isObsEnable = true;
      permissionPetsAPI(1);
    } else {
      modularPermissions.modularPermissionsData.isObsEnable = false;
    }

    if (modularArray.includes(PERMISSION_TIMER)) {
      modularPermissions.modularPermissionsData.isTimerEnable = true;
      permissionPetsAPI(5);
    } else {
      modularPermissions.modularPermissionsData.isTimerEnable = false;
    }

    if (modularArray.includes(PERMISSION_FOOD_HISTORY)) {
      permissionPetsAPI(11);
      getFoodIntakeConfigDataApi(defaultPet.petID);
      modularPermissions.modularPermissionsData.isFoodHistory = true;
    } else {
      modularPermissions.modularPermissionsData.isFoodHistory = false;
    }

    if (modularArray.includes(PERMISSION_FEEDING_REQ)) {
      modularPermissions.modularPermissionsData.isFeedingReq = true;
    } else {
      modularPermissions.modularPermissionsData.isFeedingReq = false;
    }

    if (modularPermissions.modularPermissionsData.isFmDataService) {  
      await getPetBehaviorVisualization(defaultPet.petID);
    }    

    set_isModularityService(false);
    if (tempPermissions === null) {
      set_tempPermissions(true);
    } else if (tempPermissions) {
      set_tempPermissions(false);
    } else {
      set_tempPermissions(null);
    }
    
    if(modularArray.includes(PERMISSION_POINTTRACKING) || modularArray.includes(PERMISSION_QUESTIONNAIRE) || modularArray.includes(PERMISSION_POINTTRACKING) || (modularArray.includes(PERMISSION_SLEEP_CHART) && defaultPet.showSleepChart) || (modularArray.includes(PERMISSION_FM_GOAL_SET && defaultPet.showFmGoalSetting)) || (modularArray.includes(PERMISSION_FM_CHAT) && defaultPet.showFmChart) || modularArray.includes(PERMISSION_IDEAL_BODY_WHT)) {

    } else {
      // if(modularityServiceCount.current+1 === setupDonePetsLength.current){
        set_isLoading(false);
      // }
      
    }
  }

  /**
   * When the default pet is having the Questionnaire permission, this service call will be initiated
   * Pet id is rquired.
   * With this data, default Question and no of Questionnaires short info shown in the dashboard
   */
   const getQuestionnaireData = async () => {
    
    let defaultPet = AppPetsData.petsData.defaultPet;
    let apiMethod = apiMethodManager.GET_PET_QUESTIONNAIRE + defaultPet.petID + '?isDateSupported=true';
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    set_isQuestLoading(false);
    if (!modularPermissions.modularPermissionsData.isFmDataService) {
      set_isLoading(false);
    }  
    
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      
      set_questionnaireData(null);
      if(apiService.data.questionnaireList.length > 0){
        checkQuestionnairLength(apiService.data.questionnaireList);
      } else {
        set_questionnaireData(undefined);
      } 
   
    } else if(apiService && apiService.isInternet === false) {
      
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      return;
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      
      set_isLoading(false);
      set_isQuestLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getQuestionnaire_fail, firebaseHelper.screen_dashboard, "Dashboard Get Questionnaire Service Failed", 'error : '+apiService.error.errorMsg);

    } else {

      set_isLoading(false);
      set_isQuestLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getQuestionnaire_fail, firebaseHelper.screen_dashboard, "Dashboard Get Questionnaire Service Failed", 'error : '+'Status Failed')
      
    }
    
  };

  const getCampaignListByPet = async () => {

    set_leaderBoardArray(undefined);
    let defaultPet = AppPetsData.petsData.defaultPet;
    set_leaderBoardPetId(defaultPet.petID);

    let apiMethod = apiMethodManager.GET_CAPAGAIN_LIST + defaultPet.petID;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      
      if(apiService.data.campaigns && apiService.data.campaigns.length > 0){

        set_campagainArray(apiService.data.campaigns);
        modularPermissions.modularPermissionsData.isPTEnable = true;
        set_isPTLoading(true);
        set_campagainName(apiService.data.campaigns[0].campaignName);
        getLeaderBoardDetails(apiService.data.campaigns[0].campaignId, defaultPet.petID);

        if(apiService.data.campaigns[0].activityLimits && apiService.data.campaigns[0].activityLimits.length > 0) {
          set_ptActivityLimits(apiService.data.campaigns)
        } else {
          set_ptActivityLimits(undefined)
        }

      } else {

        if (!modularPermissions.modularPermissionsData.isFmDataService) {
          set_isLoading(false);
        }  
        modularPermissions.modularPermissionsData.isPTEnable = false;
        set_isPTLoading(false);
        set_campagainName(undefined);
      }
      
    } else if(apiService && apiService.isInternet === false) {
      
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      return;
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getCampaign_fail, firebaseHelper.screen_dashboard, "Dashboard Get Campaign Service Failed", 'error : '+apiService.error.errorMsg);

    } else {
      //set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getCampaign_fail, firebaseHelper.screen_dashboard, "Dashboard Get Campaign Service Failed", 'error : '+'Status failed');
      
    }

  };

  const getLeaderBoardDetails = async (campId, campaignPetId) => {

    let apiMethod = apiMethodManager.GET_LEADERBOARD + campId + "/" + campaignPetId;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    set_isPTLoading(false);

    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      
      if(apiService.data.leaderBoards.length > 0){
        set_leaderBoardArray(apiService.data.leaderBoards);
        modularPermissions.modularPermissionsData.isPTEnable = true;
        currentCampaignPet.current = apiService.data.currentObj;
        set_leaderBoardCurrent(apiService.data.currentObj);

      } else {
        set_leaderBoardArray([]);
        modularPermissions.modularPermissionsData.isPTEnable = false;
        currentCampaignPet.current = undefined;
        set_leaderBoardCurrent(undefined);
        await Storage.removeDataFromAsync(Constant.LEADERBOARD_ARRAY);
        await Storage.removeDataFromAsync(Constant.LEADERBOARD_CURRENT);
      }
      
    } else if(apiService && apiService.isInternet === false) {
      
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      return;
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      
      set_isLoading(false);
      stopFBTraceLeaderBoardDetails();
      modularPermissions.modularPermissionsData.isPTEnable = false;
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getLeaderboard_fail, firebaseHelper.screen_dashboard, "Dashboard Get Leaderboard Details Service Failed", 'error : '+apiService.error.errorMsg);
      
    } else {

      set_isLoading(false);
      stopFBTraceLeaderBoardDetails();
      modularPermissions.modularPermissionsData.isPTEnable = false;
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getLeaderboard_fail, firebaseHelper.screen_dashboard, "Dashboard Get Leaderboard Details Service Failed", 'Service Status : false');
      
    }

  };

  const permissionPetsAPI = async (mId,isNavigate) => {

    let clientId = await Storage.getDataFromAsync(Constant.CLIENT_ID);
    let apiMethod = apiMethodManager.GET_PERMISSION_PETS + clientId + '/' + mId;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      
      if(apiService.data.pets && apiService.data.pets.length > 0) {

        if(mId === 5){
          savePetsForTImer(apiService.data.pets);
        } else if(mId === 1){
          await savePetsForObservations(apiService.data.pets);
        }else if(mId === 2){
          savePetsForQuestionnaire(apiService.data.pets);
        }
        if(mId === 11){
          savePetsForFH(apiService.data.pets);
        }

      }
      
    } else if(apiService && apiService.isInternet === false) {
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
      return;
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_Get_Permi_Pets_fail, firebaseHelper.screen_dashboard, "Dashboard Get Pet Permissions Service failed", 'error : ' + apiService.error.errorMsg);
      
    } else {
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_Get_Permi_Pets_fail, firebaseHelper.screen_dashboard, "Dashboard Get Pet Permissions Service failed", 'Service Status : false');
      
    }

  };

  const checkQuestionnairLength = (qArray) => {

    if(qArray && qArray.length > 0) {
      let statusArray = [];
      let completeArray = [];
      
      for (let i=0; i < qArray.length ; i++){
         if(qArray[i].status === 'Elapsed' || qArray[i].status === 'Open'){
            statusArray.push(qArray[i]);
         } else {
          completeArray.push(qArray[i])
         }
      }

      if(statusArray.length > 0) {
        set_questionnaireData(statusArray);
      } else if(completeArray.length > 0) {
        set_questionnaireData(completeArray);
      }
      set_questionnaireDataLength(statusArray.length);
      set_questSubmitLength(completeArray.length);

    } else {
      set_questionnaireDataLength(undefined);
      set_questionnaireData(undefined);
    }

  };

  const getFoodIntakeConfigDataApi = async (petId) => {

    let dataValue = moment(new Date()).format('YYYY-MM-DD').toString();
    let client = await Storage.getDataFromAsync(Constant.CLIENT_ID);

    let apiMethod = apiMethodManager.GET_FOOGINATKE_CONFIGDATA + petId + "/" + client + "/" + dataValue;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    set_isLoading(false);

    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      
      if (apiService.data.recommondedDiet && apiService.data.recommondedDiet.length > 0) {
        
        set_isFoodHistory(true);
        set_foodHistoryObj(apiService.data.recommondedDiet[0])

      } else {
        set_isFoodHistory(false);
        set_foodHistoryObj(undefined)
      }
      
    } else if(apiService && apiService.isInternet === false) {
      
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 0);
      return;
            
    } 

  };

  const getNotificationsApi = async () => {

    let client = await Storage.getDataFromAsync(Constant.CLIENT_ID);
    let apiMethod = apiMethodManager.GET_NOTIFICATIONS + client + "/" + 1 + "/" + 1 +'?searchText='+''+'&fromDate='+''+'&toDate='+'';
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    set_isLoading(false);

    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
          
      if (apiService.data.notifications && apiService.data.notifications.length > 0) {
        if(apiService.data.notifications[0].unReadCount > 0){
          set_isNotificationCount(true);
        } else {
          set_isNotificationCount(undefined);
        }
      } else {
        set_isNotificationCount(undefined);
      }
      
    }

  };

  const createPopup = (aTitle,msg,rBtnTitle,isPopLeft,isPop) => {

    set_popUpAlert(aTitle);
    set_popUpMessage(msg);
    set_popUpRBtnTitle(rBtnTitle);
    set_isPopupLeft(isPopLeft);
    set_isPopUp(isPop);

  };

  const clearPopup = () => {

    set_isPopUp(false);
    set_popUpAlert(undefined);
    set_popUpMessage(undefined);
    set_popUpRBtnTitle('OK');
    set_isPopupLeft(false);

  };

  const popOkBtnAction = () => {
    if(popUpMessage===Constant.ARE_YOU_SURE_YOU_WANT_EXIT){
      RNExitApp.exitApp();
    }
    clearPopup();
  };

  const popCancelBtnAction = () => {
    clearPopup();
  };

  const setTimerValue = (value) => {
    //set_isTimer(value);
    modularPermissions.modularPermissionsData.isTimer = value;
  };

  // Clears the Modularity based arrays data. Calls when user navigates away from the dashboard.
  const clearObjects = async () => {
    setupDonePetsRef.current=undefined;
    pushTimerPetsArray.current=[];
    pushObservationsPetsArray.current=[];
    pushQuestionnairePetsArray.current=[];
    pushPTPetsArray.current=[];
    modularityServiceCount.current = 0;
  };

  /**
   * Clears the Widget enable permissions
   */
   const removeItems = () => {
    set_isPTLoading(undefined);
    set_isQuestLoading(undefined);
    set_questionnaireData(undefined);
    set_campagainArray(undefined);
    set_petsArray([]);
    isDefaultModularity.current = false;
    enableLoader.current = true;
    clearModularityPets();
  };

   // Clears the Modularity permission for all the pets
  const clearModularityPets = async () => {
    await Storage.removeDataFromAsync(Constant.TIMER_PETS_ARRAY);
    await Storage.removeDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
    await Storage.removeDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
    await Storage.removeDataFromAsync(Constant.POINT_TRACKING_PETS_ARRAY);
  };

  const getTimerDetails = async () => {

    let timerObj = await Storage.getDataFromAsync(Constant.TIMER_OBJECT);
    timerObj = JSON.parse(timerObj);
    if(timerObj){   

      if(timerObj.isTimerStarted || timerObj.isTimerPaused){
        //set_isTimer(true);
        modularPermissions.modularPermissionsData.isTimer = true;
        Apolloclient.client.writeQuery({
          query: Queries.TIMER_WIDGET_QUERY,
          data: {
            data: { 
              screenName:'Dashboard',stopTimerInterval:'Continue',__typename: 'TimerWidgetQuery'}
          },
        })
      }   
    }

  };

  const updateQuestionnareCount = () => {
    getQuestionnaireData();
  };

  const refreshPT = () => {
    if(modularPermissions.modularPermissionsData.isPTEnable) {
      getCampaignListByPet();
    }
  };

  const updateModularitySetupDone = () => {
    isDefaultModularity.current = false;
    enableLoader.current = true;
  };

  const selectedPetAction = () => {
    refreshDashBoardDetails();
  };

  const quickObservationAction = async () => {
    permissionPetsAPI(1,true)
  };

  const notificationAction = () => {
    
  };

  const enableQuestionnaire = () => {
    set_isLoading(true);
  }

  return (

    <DasBoardComponent
      isLoading = {isLoading}
      loaderMsg = {loaderMsg}
      tempPermissions = {tempPermissions}
      changeInPetObj = {changeInPetObj}
      activeSlide = {activeSlide}
      deviceStatusText = {deviceStatusText}
      buttonTitle = {buttonTitle}
      isModularityService = {isModularityService}
      questionnaireData = {questionnaireData}
      isQuestLoading = {isQuestLoading}
      supportMetialsArray = {supportMetialsArray}
      popUpMessage = {popUpMessage}
      popUpAlert = {popUpAlert}
      popUpRBtnTitle = {popUpRBtnTitle}
      isPopLeft = {isPopupLeft}
      isPopUp = {isPopUp}
      petWeightUnit = {petWeightUnit}
      leaderBoardArray = {leaderBoardArray}
      leaderBoardPetId = {leaderBoardPetId}
      leaderBoardCurrent = {leaderBoardCurrent}
      campagainName = {campagainName}
      campagainArray = {campagainArray}
      currentCampaignPet = {currentCampaignPet.current}
      enableLoader = {enableLoader.current}
      isPTLoading = {isPTLoading}
      questionnaireDataLength = {questionnaireDataLength}
      firstName = {firstName}
      secondName = {secondName}
      ptActivityLimits = {ptActivityLimits}
      questSubmitLength = {questSubmitLength}
      behVisualData = {behVisualData}
      weightHistoryData = {weightHistoryData}
      foodHistoryObj = {foodHistoryObj}
      petType = {petType}
      isNotificationCount = {isNotificationCount}
      popOkBtnAction = {popOkBtnAction}
      popCancelBtnAction = {popCancelBtnAction}
      refreshDashBoardDetails = {refreshDashBoardDetails}
      setTimerValue = {setTimerValue}
      clearObjects = {clearObjects}
      createPopup = {createPopup}
      removeItems = {removeItems}
      updateQuestionnareCount = {updateQuestionnareCount}
      refreshPT = {refreshPT}
      updateModularitySetupDone = {updateModularitySetupDone}
      selectedPetAction = {selectedPetAction}
      quickObservationAction = {quickObservationAction}
      notificationAction = {notificationAction}
      enableQuestionnaire = {enableQuestionnaire}
    />
  );

}

export default DasBoardService;