import React, { useState, useEffect, useRef } from 'react';
import {BackHandler} from 'react-native';
import * as Queries from "../../config/apollo/queries";
import DasBoardComponent from './dashBoardComponent';
import * as Storage from '../../utils/storage/dataStorageLocal';
import * as Constant from "../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import * as Apolloclient from './../../config/apollo/apolloConfig';
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
  const [defaultPetObj, set_defaultPetObj] = useState(undefined);
  const [activeSlide, set_activeSlide] = useState(0);
  const [isObsEnable, set_isObsEnable] = useState(false);
  const [isModularityService, set_isModularityService] = useState(false);
  const [isDeviceMissing, set_isDeviceMissing] = useState(false);
  const [isDeviceSetupDone, set_isDeviceSetupDone] = useState(true);
  const [deviceStatusText, set_deviceStatusText] = useState(undefined);
  const [buttonTitle, set_buttonTitle] = useState(undefined);
  const [isTimer, set_isTimer] = useState(false);
  const [weight, set_weight] = useState(undefined);
  const [weightUnit, set_weightUnit] = useState(undefined);
  const [isEatingEnthusiasm, set_isEatingEnthusiasm] = useState(false);
  const [isImageScoring, set_isImageScoring] = useState(false);
  const [isPetWeight, set_isPetWeight] = useState(false);
  const [questionnaireData, set_questionnaireData] = useState(undefined);
  const [isQuestLoading, set_isQuestLoading] = useState(false);
  const [isQuestionnaireEnable, set_isQuestionnaireEnable] = useState(false);
  const [isDeceased, set_isDeceased] = useState(undefined);
  const [supportMetialsArray, set_supportMetialsArray] = useState();
  const [devicesCount, set_devicesCount] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [popUpRBtnTitle, set_popUpRBtnTitle] = useState(undefined);
  const [isPopupLeft, set_isPopupLeft] = useState(false);
  const [petWeightUnit, set_petWeightUnit] = useState(undefined);
  const [isPTEnable, set_isPTEnable] = useState(false);
  const [isTimerEnable, set_isTimerEnable] = useState(false);
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
  const [supportSPendingArray, set_supportSPendingArray] = useState([]);
  const [supportDMissingArray, set_supportDMissingArray] = useState([]);
  const [supportID,set_supportID] = useState(undefined);
  const [ptActivityLimits, set_ptActivityLimits] = useState(undefined);
  const [behVisualData, set_behVisualData] = useState(undefined);
  const [weightHistoryData, set_weightHistoryData] = useState(undefined);
  const [devModel, set_devModel] = useState(undefined);
  const [isFmGoalSet, set_isFmGoalSet] = useState(false);
  const [isFmGraph, set_isFmGraph] = useState(false);
  const [isSleepGraph, set_isSleepGraph] = useState(false);
  const [isWeightPer, set_isWeightPer] = useState(false);
  const [isFoodHistory, set_isFoodHistory] = useState(false);
  const [foodHistoryObj, set_foodHistoryObj] = useState(undefined);
  const [isFeedingReq, set_isFeedingReq] = useState(undefined)

  var setupDonePetsRef = useRef([]);
  var setupDonePetsLength = useRef(0);
  var ptExists = useRef(false);
  var enableLoader = useRef(true);
  var modularityServiceCount = useRef(0);
  var pushTimerPetsArray = useRef([]);
  var pushObservationsPetsArray = useRef([]);
  var pushQuestionnairePetsArray = useRef([]);
  var pushPTPetsArray = useRef([]);
  var isDefaultModularity = useRef(false);
  var currentCampaignPet = useRef(undefined);
  var petArrayRef = useRef(undefined);
  var isFmDataService = useRef(false)

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

    let firstUser = await Storage.getDataFromAsync(Constant.IS_FIRST_TIME_USER);
    firstUser = JSON.parse(firstUser);
    let isMultiLogin = await Storage.getDataFromAsync(Constant.IS_MULTIPLE_LOGIN);
    if(isMultiLogin && isMultiLogin === 'multipleLogin') {
      isDefaultModularity.current = false;
      await Storage.removeDataFromAsync(Constant.IS_MULTIPLE_LOGIN);
    }
    if (firstUser) {
      set_isFirstUser(true);
      getUserDetails();
      set_buttonTitle('ONBOARD YOUR PET');
      set_isLoading(false);
      clearModularityPets();
    } else {
      if(enableLoader.current) {
        set_isLoading(true);
        set_loaderMsg(Constant.DASHBOARD_LOADING_MSG);
      } 
      set_isFirstUser(false);
      getDashBoardPets();
    }
  };

  const getUserDetails = async () => {

    let firstName = await Storage.getDataFromAsync(Constant.SAVE_FIRST_NAME);
    let secondName = await Storage.getDataFromAsync(Constant.SAVE_SECOND_NAME);
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
    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);

    let serviceCallsObj = await ServiceCalls.getPetParentPets(clientID,token);
    if(serviceCallsObj && serviceCallsObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if(serviceCallsObj && !serviceCallsObj.isInternet){
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      return;
    }

    if(serviceCallsObj && serviceCallsObj.statusData) {

      if(serviceCallsObj && serviceCallsObj.responseData && serviceCallsObj.responseData.length > 0){

        if (serviceCallsObj.responseData.length > 0) {
          set_isFirstUser(false);
          set_petsArray(serviceCallsObj.responseData);
          petArrayRef.current = serviceCallsObj.responseData;
          await Storage.saveDataToAsync(Constant.ALL_PETS_ARRAY, JSON.stringify(serviceCallsObj.responseData));
          setDefaultSlide(serviceCallsObj.responseData);

        } else {
          await Storage.removeDataFromAsync(Constant.ALL_PETS_ARRAY);
        }
      
      } else {
        set_isLoading(false);
      }

    } else {
      set_isLoading(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,'OK', false,true);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getPets_fail, firebaseHelper.screen_dashboard, "Dashboard Getpets Service failed", 'Service Status : false');
    }

    if(serviceCallsObj && serviceCallsObj.error) {
      let errors = serviceCallsObj.error.length > 0 ? serviceCallsObj.error[0].code : ''
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getPets_fail, firebaseHelper.screen_dashboard, "Dashboard Getpets Service failed", 'Service error : ' + errors);
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

  const setDefaultSlide = async (petsArray) => {

    let defaultPet = await Storage.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    defaultPet = JSON.parse(defaultPet);
    firebaseHelper.logEvent(firebaseHelper.event_dashboard_petSwipe, firebaseHelper.screen_dashboard, "Dashboard Pet Swipe Action", 'Default Pet Id : ' + defaultPet.petID);
    let index = 0;
    let petobj = undefined;

    if(!defaultPet){
      set_defaultPetObj(petsArray[0]);
    } else {
      
      for (var i = 0; i < petsArray.length; i++) {
        if (petsArray[i].petID === defaultPet.petID) {
          index = i;
          petobj = petsArray[i];
          break;
        }
      }
      if(petobj) {
        defaultPet = petobj;
        set_defaultPetObj(petobj);
        await Storage.saveDataToAsync(Constant.DEFAULT_PET_OBJECT, JSON.stringify(petobj));
      } else {
        set_defaultPetObj(defaultPet);
      }
      
      set_activeSlide(index);
    }   

    let value = defaultPet.devices && defaultPet.devices.length > 0 ? defaultPet.devices[0].isDeviceSetupDone : 'noDevices'
    firebaseHelper.logEvent(firebaseHelper.event_dashboard_defaultPet_Status, firebaseHelper.screen_dashboard, "Pet Name : "+ defaultPet.petName, 'Pets Status : ' + value);

    if (defaultPet){

      set_weight(defaultPet.weight);
      set_weightUnit(defaultPet.weightUnit);
      if(parseInt(defaultPet.petStatus) === 3 || parseInt(defaultPet.petStatus) === 4){
        set_isDeceased(true);
      } else {
        set_isDeceased(false);
      }

    }

    if(defaultPet.devices.length > 0) {
      set_isDeviceMissing(false);
    } else {
      set_isDeviceMissing(true);
    }
    
    if(defaultPet.devices.length > 0){
      set_isDeviceMissing(false);
      set_isDeviceSetupDone(defaultPet.devices[0].isDeviceSetupDone);
      set_devModel(defaultPet.devices[0].deviceModel);
    } else {
      set_isDeviceMissing(true);
      set_isDeviceSetupDone(false);
    }
    
    await getPetModularity(defaultPet.petID);

  };

  const refreshDashBoardDetails = async (value,pObject) => {

    set_supportMetialsArray([]);
    // set_isLoading(true);
    enableLoader.current = true;
    isDefaultModularity.current = true;
    modularityServiceCount.current = 0;
    setupDonePetsLength.current = 1;
    setDefaultSlide(petsArray);

  };

  const getPetModularity = async (petId) => {

    if(enableLoader.current) {
      set_isLoading(true);
    }

    let obj = {"petIds":[petId]}
    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    let modularServiceObj = await ServiceCalls.getModularityPermission(obj,token);
    if(modularServiceObj && modularServiceObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if(modularServiceObj && !modularServiceObj.isInternet){
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      return;
    }

    if(modularServiceObj && modularServiceObj.statusData) {
      if(modularServiceObj && modularServiceObj.responseData){        
        await checkModularPermissions(modularServiceObj.responseData, petId);
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_getModularity_fail, firebaseHelper.screen_dashboard, "Dashboard Modularity Service", 'Getting Modularity in Dashboard : No Datafound');
      }

    }

    if(modularServiceObj && modularServiceObj.error) {
      let errors = modularServiceObj.error.length > 0 ? modularServiceObj.error[0].code : '';
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getModularity_fail, firebaseHelper.screen_dashboard, "Dashboard Modularity Service Failed", 'error : '+errors);
    }

  };

  // App Visualisation Service API
  const getPetBehaviorVisualization = async (petId) => {

    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    let behVisServiceObj = await ServiceCalls.getPetBehaviorVisualization(petId,token);
    set_isLoading(false);
    isFmDataService.current = false;

    if(behVisServiceObj && behVisServiceObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if(behVisServiceObj && !behVisServiceObj.isInternet){
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      return;
    }

    if(behVisServiceObj && behVisServiceObj.statusData) {
      if(behVisServiceObj && behVisServiceObj.responseData){
        set_behVisualData(behVisServiceObj.responseData);
      } else {
        set_behVisualData(undefined)
      }

    } else {
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_getVisual_fail, firebaseHelper.screen_dashboard, "Dashboard Get Visualization Service failed", 'Service Status : false');
    }

    if(behVisServiceObj && behVisServiceObj.error) {
      let errors = behVisServiceObj.error.length > 0 ? behVisServiceObj.error[0].code : '';
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_getVisual_fail, firebaseHelper.screen_dashboard, "Dashboard Get Visualization Service failed", 'errors : ' + errors);
      set_isLoading(false);
    }

  };

  // App Visualisation Service API
  const getPetWeightHistory = async (petId) => {

    let toDate =  moment(new Date()).format("YYYY-MM-DD")
    let fromDate =  new Date();
    fromDate.setDate(fromDate.getDate() - 6);
    fromDate = moment(fromDate).format("YYYY-MM-DD");
    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    let phServiceObj = await ServiceCalls.getPetWeightHistory(petId,token,toDate,fromDate);
    // set_isLoading(false);
    if (!isFmDataService.current) {
      set_isLoading(false);
    }  
    if(phServiceObj && phServiceObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if(phServiceObj && !phServiceObj.isInternet){
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      return;
    }

    if(phServiceObj && phServiceObj.statusData) {
      if(phServiceObj && phServiceObj.responseData){
        set_weightHistoryData(phServiceObj.responseData);
      } else {
        set_weightHistoryData(undefined);
      }

    } else {
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_getPet_Wgt_History_fail, firebaseHelper.screen_dashboard, "Dashboard Get Pet Weight History Service failed", 'Service Status : false');
    }

    if(phServiceObj && phServiceObj.error) {
      let errors = phServiceObj.error.length > 0 ? phServiceObj.error[0].code : '';
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_getPet_Wgt_History_fail, firebaseHelper.screen_dashboard, "Dashboard Get Pet Weight History Service failed", 'error : ' + errors);
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
      // let timerPetsTemp = await getsetupFeaturePets(timerPets);
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
      // let timerPetsTemp = await getsetupFeaturePets(timerPets);
      await Storage.saveDataToAsync(Constant.FH_PETS_ARRAY, JSON.stringify(fhPets));
    } else {
      await Storage.removeDataFromAsync(Constant.FH_PETS_ARRAY);
    }

  };

  // finds out the setup done pets
  const getsetupFeaturePets = (pets) => {

    let tempArray = [];
    for (let i = 0; i < pets.length; i++) {   
      let devices = pets[i].devices;
      for (let j = 0; j < devices.length; j++) {
        if (devices.length > 0 && devices[j].isDeviceSetupDone) {
          tempArray.push(pets[i]);
        }
      }
    }

    let duplicates = getUnique(tempArray, 'petID');
    return duplicates;
  };

  /**
   * Saves the Questionnaire permission enabled pets.
   * Used in Questionnaire feature.
   * @param {*} questPets 
   */
  const savePetsForQuestionnaire = async (questPets) => {

    if (questPets && questPets.length > 0) {
      // let qstPetsTemp = await getsetupFeaturePets(questPets);
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

    let defaultPet = await Storage.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    defaultPet = JSON.parse(defaultPet);
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
      set_isFmGraph(true);
      isFmDataService.current = true;    
    } else {
      isFmDataService.current = false;
      set_isFmGraph(false);
    }

    if (modularArray.includes(PERMISSION_FM_GOAL_SET) && defaultPet.showFmGoalSetting) {
      set_isFmGoalSet(true);
      isFmDataService.current = true; 
    } else {
      isFmDataService.current = false;
      set_isFmGoalSet(false);
    }

    if (modularArray.includes(PERMISSION_SLEEP_CHART) && defaultPet.showSleepChart) {
      isFmDataService.current = true;
      set_isSleepGraph(true);
    } else {
      isFmDataService.current = false;
      set_isSleepGraph(false);
    }

    if (modularArray.includes(PERMISSION_PETWEIGHT)) {
      set_isPetWeight(true);
    } else {
      set_isPetWeight(false);
    }

    if (modularArray.includes(Permission_EatingEnthusiasm)) {
      set_isEatingEnthusiasm(true);
    } else {
      set_isEatingEnthusiasm(false);
    }

    if (modularArray.includes(PERMISSION_IMAGESCORING)) {
      set_isImageScoring(true);
    } else {
      set_isImageScoring(false);
    }

    if (modularArray.includes(PERMISSION_POINTTRACKING)) {

      if(enableLoader.current){
        ptExists.current = true;
         getCampaignListByPet();
      } else {
        ptExists.current = false;
      }
      
    } else {
      ptExists.current = false;
      set_isPTEnable(false);
    }

    if (modularArray.includes(PERMISSION_IDEAL_BODY_WHT)) {
      await getPetWeightHistory(defaultPet.petID);
      set_isWeightPer(true);
    } else {
      set_isWeightPer(false);
    }

    if (modularArray.includes(PERMISSION_QUESTIONNAIRE)) {
      set_isQuestionnaireEnable(true);
      permissionPetsAPI(2);
      getQuestionnaireData();
    } else {

      let questPeri = await Storage.getDataFromAsync(Constant.QUETIONNAIRE_PERMISSION,);
      if(questPeri && questPeri === 'available' || defaultPet.petSpecQuesCount > 0) {
        set_isQuestionnaireEnable(true);
        permissionPetsAPI(2);
        getQuestionnaireData();
      } 
      
    }

    if (modularArray.includes(PERMISSION_OBSERVATIONS)) {
      set_isObsEnable(true);
      permissionPetsAPI(1);
    } else {
      set_isObsEnable(false);
    }

    if (modularArray.includes(PERMISSION_TIMER)) {
      set_isTimerEnable(true);
      permissionPetsAPI(5);
    } else {
      set_isTimerEnable(false);
    }

    if (modularArray.includes(PERMISSION_FOOD_HISTORY)) {
      permissionPetsAPI(11);
      getFoodIntakeConfigDataApi(defaultPet.petID);
      set_isFoodHistory(true);
    } else {
      set_isFoodHistory(false);
    }

    if (modularArray.includes(PERMISSION_FEEDING_REQ)) {
      set_isFeedingReq(true);
    } else {
      set_isFeedingReq(true);
    }

    if (isFmDataService.current) {  
      await getPetBehaviorVisualization(defaultPet.petID);
    }    

    set_isModularityService(false);

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
    
    let defaultPet = await Storage.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    defaultPet = JSON.parse(defaultPet);
    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    let questServiceObj = await ServiceCalls.getQuestionnaireData(defaultPet.petID,token);
    set_isQuestLoading(false);
    // if(!ptExists.current){
      if (!isFmDataService.current) {
        set_isLoading(false);
      }  
    // }
    
    if(questServiceObj && questServiceObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if(questServiceObj && !questServiceObj.isInternet){
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getQuestionnaire_fail, firebaseHelper.screen_dashboard, "Dashboard Get Questionnaire Service Failed", 'No Internet ');
      return;
    }

    if(questServiceObj && questServiceObj.statusData){
      if(questServiceObj && questServiceObj.responseData && questServiceObj.responseData.length > 0){
        checkQuestionnairLength(questServiceObj.responseData);
      } else {
        set_questionnaireData(undefined);
      } 
    } 

    if(questServiceObj && questServiceObj.error) {
      set_isLoading(false);
      set_isQuestLoading(false);
      let errors = questServiceObj.error.length > 0 ? questServiceObj.error[0].code : '';
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getQuestionnaire_fail, firebaseHelper.screen_dashboard, "Dashboard Get Questionnaire Service Failed", 'error : '+errors);
    }
    
  };

  const getCampaignListByPet = async () => {

    set_leaderBoardArray(undefined);
    let defaultPet = await Storage.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    defaultPet = JSON.parse(defaultPet);
    set_leaderBoardPetId(defaultPet.petID);

    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    let serviceCallsObj = await ServiceCalls.getCampaignListByPet(defaultPet.petID,token);

    if(serviceCallsObj && serviceCallsObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if(serviceCallsObj && !serviceCallsObj.isInternet){
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getCampaign_fail, firebaseHelper.screen_dashboard, "Dashboard Get Campaign Service Failed", 'No Internet');
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      return;
    }

    if(serviceCallsObj && serviceCallsObj.statusData){
      
      if(serviceCallsObj && serviceCallsObj.responseData && serviceCallsObj.responseData.length > 0){ 
              
        set_campagainArray(serviceCallsObj.responseData);
        set_isPTEnable(true);
        set_isPTLoading(true);
        set_campagainName(serviceCallsObj.responseData[0].campaignName);
        getLeaderBoardDetails(serviceCallsObj.responseData[0].campaignId, defaultPet.petID);

        if(serviceCallsObj.responseData[0].activityLimits && serviceCallsObj.responseData[0].activityLimits.length > 0) {
          set_ptActivityLimits(serviceCallsObj.responseData)
        } else {
          set_ptActivityLimits(undefined)
        }
          
      } else {
        if (!isFmDataService.current) {
          set_isLoading(false);
        }  
        set_isPTEnable(false);
        set_isPTLoading(false);
      }
    }

    if(serviceCallsObj && serviceCallsObj.error) {
      let errors = serviceCallsObj.error.length > 0 ? serviceCallsObj.error[0].code : '';
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getCampaign_fail, firebaseHelper.screen_dashboard, "Dashboard Get Campaign Service Failed", 'error : '+errors);
    }

  };

  const getLeaderBoardDetails = async (campId, campaignPetId) => {

    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    let serviceCallsObj = await ServiceCalls.getLeaderBoardByCampaignId(campId,campaignPetId,token);
    set_isPTLoading(false);

    if(serviceCallsObj && serviceCallsObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if(serviceCallsObj && !serviceCallsObj.isInternet){
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getLeaderboard_fail, firebaseHelper.screen_dashboard, "Dashboard Get Leaderboard Details Service Failed", 'No Internet');
      return;
    }

    if(serviceCallsObj && serviceCallsObj.statusData){
      if(serviceCallsObj.responseData && serviceCallsObj.responseData.leaderBoards.length > 0){
        set_leaderBoardArray(serviceCallsObj.responseData.leaderBoards);
        set_isPTEnable(true);
        currentCampaignPet.current = serviceCallsObj.responseData.currentObj;
        set_leaderBoardCurrent(serviceCallsObj.responseData.currentObj);

      } else {
        set_leaderBoardArray([]);
        set_isPTEnable(true);
        currentCampaignPet.current = undefined;
        set_leaderBoardCurrent(undefined);
        await Storage.removeDataFromAsync(Constant.LEADERBOARD_ARRAY);
        await Storage.removeDataFromAsync(Constant.LEADERBOARD_CURRENT);
      }
    } else {
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getLeaderboard_fail, firebaseHelper.screen_dashboard, "Dashboard Get Leaderboard Details Service Failed", 'Service Status : false');
    }

    if(serviceCallsObj && serviceCallsObj.error) {
      set_isLoading(false);
      stopFBTraceLeaderBoardDetails();
      set_isPTEnable(false);
      set_isPTLoading(false);
      let errors = serviceCallsObj.error.length > 0 ? serviceCallsObj.error[0].code : '';
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getLeaderboard_fail, firebaseHelper.screen_dashboard, "Dashboard Get Leaderboard Details Service Failed", 'error : '+errors);
    }

  };

  const permissionPetsAPI = async (mId,isNavigate) => {

    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    let clientId = await Storage.getDataFromAsync(Constant.CLIENT_ID);
    let userRoleDetails = await Storage.getDataFromAsync(Constant.USER_ROLE_DETAILS);
    userRoleDetails = JSON.parse(userRoleDetails);

    let permissionServiceObj = await ServiceCalls.configPermissionAPI(clientId,mId,token);
    // if (!isFmDataService.current) {
    //   set_isLoading(false);
    // }  
    if(permissionServiceObj && permissionServiceObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if(permissionServiceObj && !permissionServiceObj.isInternet){
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
      return;
    }

    if(permissionServiceObj && permissionServiceObj.statusData){

      if (permissionServiceObj.responseData) {

        if(mId === 5){
          savePetsForTImer(permissionServiceObj.responseData);
        } else if(mId === 1){
          await savePetsForObservations(permissionServiceObj.responseData);
        }else if(mId === 2){
          savePetsForQuestionnaire(permissionServiceObj.responseData);
        }
        if(mId === 11){
          savePetsForFH(permissionServiceObj.responseData);
        }
        // return permissionServiceObj.responseData
      }

    } else {
      // createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_Get_Permi_Pets_fail, firebaseHelper.screen_dashboard, "Dashboard Get Pet Permissions Service failed", 'Service Status : false');
    }

    if(permissionServiceObj && permissionServiceObj.error) {
      // createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_Get_Permi_Pets_fail, firebaseHelper.screen_dashboard, "Dashboard Get Pet Permissions Service failed", 'error : ' + errors);
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

    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    let client = await Storage.getDataFromAsync(Constant.CLIENT_ID);
    let fIntakeListServiceObj = await ServiceCalls.getFoodIntakeConfigDataApi(petId, client, dataValue, token);

    if (fIntakeListServiceObj && fIntakeListServiceObj.logoutData) {
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if (fIntakeListServiceObj && !fIntakeListServiceObj.isInternet) {
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 0);
      return;
    }

    if (fIntakeListServiceObj && fIntakeListServiceObj.statusData) {
      if (fIntakeListServiceObj.responseData && fIntakeListServiceObj.responseData) {

        if(fIntakeListServiceObj.responseData.recommondedDiet && fIntakeListServiceObj.responseData.recommondedDiet.length > 0) {
          set_isFoodHistory(true);
          set_foodHistoryObj(fIntakeListServiceObj.responseData.recommondedDiet[0])
        } else {
          set_foodHistoryObj(undefined)
        }

      } 

    } else {
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_Food_Intake_fail, firebaseHelper.screen_dashboard, "Dashboard Get Food Intake Service failed", 'Service Status : false');
    }

    if (fIntakeListServiceObj && fIntakeListServiceObj.error) {
      let errors = getfeedbackServiceObj.error.length > 0 ? getfeedbackServiceObj.error[0].code : '';
      firebaseHelper.logEvent(firebaseHelper.event_dBoard_Food_Intake_fail, firebaseHelper.screen_dashboard, "Dashboard Get Food Intake Service failed", 'error : ' + errors);
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
    set_isTimer(value);
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
    set_isObsEnable(false);
    set_isQuestionnaireEnable(false);
    set_isPTEnable(false);
    set_isTimerEnable(false);
    set_isPTLoading(false);
    set_isQuestLoading(false);
    set_isEatingEnthusiasm(false);
    set_isImageScoring(false);
    set_isPetWeight(false);
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
        set_isTimer(true);
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
    if(isPTEnable) {
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
  }

  return (

    <DasBoardComponent
      isLoading = {isLoading}
      loaderMsg = {loaderMsg}
      petsArray = {petsArray}
      isFirstUser = {isFirstUser}
      defaultPetObj = {defaultPetObj}
      activeSlide = {activeSlide}
      isDeviceMissing = {isDeviceMissing}
      isDeviceSetupDone = {isDeviceSetupDone}
      deviceStatusText = {deviceStatusText}
      buttonTitle = {buttonTitle}
      isObsEnable = {isObsEnable}
      isTimer = {isTimer}
      weight = {weight}
      weightUnit = {weightUnit}
      isEatingEnthusiasm = {isEatingEnthusiasm}
      isImageScoring = {isImageScoring}
      isModularityService = {isModularityService}
      isPetWeight = {isPetWeight}
      isQuestionnaireEnable = {isQuestionnaireEnable}
      questionnaireData = {questionnaireData}
      isQuestLoading = {isQuestLoading}
      isDeceased = {isDeceased}
      supportMetialsArray = {supportMetialsArray}
      devicesCount = {devicesCount}
      popUpMessage = {popUpMessage}
      popUpAlert = {popUpAlert}
      popUpRBtnTitle = {popUpRBtnTitle}
      isPopLeft = {isPopupLeft}
      isPopUp = {isPopUp}
      petWeightUnit = {petWeightUnit}
      isPTEnable = {isPTEnable}
      isTimerEnable = {isTimerEnable}
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
      supportID = {supportID}
      supportDMissingArray = {supportDMissingArray}
      supportSPendingArray = {supportSPendingArray}
      ptActivityLimits = {ptActivityLimits}
      questSubmitLength = {questSubmitLength}
      behVisualData = {behVisualData}
      weightHistoryData = {weightHistoryData}
      devModel = {devModel}
      isFmGoalSet = {isFmGoalSet}
      isFmGraph = {isFmGraph}
      isWeightPer = {isWeightPer}
      isFoodHistory = {isFoodHistory}
      isFeedingReq = {isFeedingReq}
      isSleepGraph = {isSleepGraph}
      foodHistoryObj = {foodHistoryObj}
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
    />
  );

}

export default DasBoardService;