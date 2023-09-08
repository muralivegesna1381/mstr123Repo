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

const PERMISSION_OBSERVATIONS = 1;
const PERMISSION_QUESTIONNAIRE = 2;
const PERMISSION_POINTTRACKING = 3;
const PERMISSION_TIMER = 5;
const PERMISSION_PETWEIGHT = 7;
const Permission_EatingEnthusiasm = 8;
const PERMISSION_IMAGESCORING = 9;

let trace_Dashboard_GetPets_Complete;
let trace_inDashBoard;
let trace_Questionnaire_API_Complete;
let trace_Get_Support_Meterials_API_Complete;
let trace_campaign_API_Complete;
let trace_LeaderBoard_Campaign_API_Complet;
let trace_Modularity_API_Complet;

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
  const [firmware, set_firmware] = useState(undefined);
  const [birthday, set_birthday] = useState(undefined);
  const [lastSeen, set_lastSeen] = useState(undefined);
  const [weight, set_weight] = useState(undefined);
  const [weightUnit, set_weightUnit] = useState(undefined);
  const [deviceNumber, set_deviceNumber] = useState(undefined);
  const [isEatingEnthusiasm, set_isEatingEnthusiasm] = useState(false);
  const [isImageScoring, set_isImageScoring] = useState(false);
  const [isPetWeight, set_isPetWeight] = useState(false);
  const [questionnaireData, set_questionnaireData] = useState(undefined);
  const [isQuestLoading, set_isQuestLoading] = useState(false);
  const [isQuestionnaireEnable, set_isQuestionnaireEnable] = useState(false);
  const [isDeceased, set_isDeceased] = useState(undefined);
  const [supportMetialsArray, set_supportMetialsArray] = useState();
  const [isFirmwareUpdate, set_isFirmwareUpdate] = useState(false);
  const [devicesCount, set_devicesCount] = useState(undefined);
  const [battery, set_battery] = useState(undefined);
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
  const [isSwipedModularity, set_isSwipedModularity] = useState (false);
  const [isPTLoading, set_isPTLoading] = useState(false);
  const [questionnaireDataLength,set_questionnaireDataLength] = useState(undefined);
  const [questSubmitLength,set_questSubmitLength] = useState(0);
  const [date, set_Date] = useState(new Date());
  const [firstName, set_firstName] = useState(undefined);
  const [secondName, set_secondName] = useState(undefined);
  const [supportSPendingArray, set_supportSPendingArray] = useState([]);
  const [supportDMissingArray, set_supportDMissingArray] = useState([]);
  const [supportID,set_supportID] = useState(undefined);
  const [ptActivityLimits, set_ptActivityLimits] = useState(undefined)

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
  var modularitySetupDonePetsRef = useRef(undefined);
  var petArrayRef = useRef(undefined);

  React.useEffect(() => {

    clearObjects();
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
    set_popUpMessage('Are you sure?');
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
    trace_Dashboard_GetPets_Complete = await perf().startTrace('t_DashBoard_GetPets_Info_API');

    let serviceCallsObj = await ServiceCalls.getPetParentPets(clientID,token);
    await trace_Dashboard_GetPets_Complete.stop();
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
        let tempArray = [];
        let tempArray1 = [];
        if (serviceCallsObj.responseData.length > 0) {
          set_isFirstUser(false);
          set_petsArray(serviceCallsObj.responseData);
          petArrayRef.current = serviceCallsObj.responseData;
          await Storage.saveDataToAsync(Constant.ALL_PETS_ARRAY, JSON.stringify(serviceCallsObj.responseData));
          setDefaultSlide(serviceCallsObj.responseData);
          for (let i = 0; i < serviceCallsObj.responseData.length; i++) {
            
            let devices = serviceCallsObj.responseData[i].devices;
            for (let j = 0; j < devices.length; j++) {
              if (devices.length > 0 && devices[j].isDeviceSetupDone) {
                tempArray.push(serviceCallsObj.responseData[i]);
                tempArray1.push(serviceCallsObj.responseData[i].petID);
              }
            }
          }

          let duplicates = getUnique(tempArray, 'petID');
          tempArray = duplicates;
          setupDonePetsRef.current = tempArray;
          setupDonePetsLength.current = tempArray.length;
          modularitySetupDonePetsRef.current = tempArray1;

          if(setupDonePetsRef.current && setupDonePetsRef.current.length === 0) {
            removeModularity()
          }

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
      set_birthday(defaultPet.birthday);

      if(parseInt(defaultPet.petStatus) === 3 || parseInt(defaultPet.petStatus) === 4){
        set_isDeceased(true);
      } else {
        set_isDeceased(false);
      }

    }
    
    if(defaultPet.devices.length > 0){

      if((defaultPet.devices[0].deviceNumber || defaultPet.devices[0].deviceNumber != "")){

        set_isDeviceMissing(false);
        set_deviceNumber(defaultPet.devices[0].deviceNumber); 
        set_firmware(defaultPet.devices[0].firmware); 
        set_lastSeen(defaultPet.devices[0].lastSeen); 
        set_isFirmwareUpdate(defaultPet.devices[0].isFirmwareVersionUpdateRequired);
        set_battery(defaultPet.devices[0].battery);

        if(defaultPet.devices[0].isDeviceSetupDone){

          set_isDeviceSetupDone(true);
          await getPetModularity(modularitySetupDonePetsRef.current,defaultPet.petID);

        } else {

          set_isLoading(false);
          set_isDeviceSetupDone(false);
          checkModularPermissions([],defaultPet.petID);
          set_buttonTitle('COMPLETE SENSOR SETUP');
          getsupportMeterials(16);
          set_deviceStatusText(Constant.DEVICE_PENDING_DASHBAORD); 

        }

      } else {

        set_isLoading(false);
        set_isDeviceMissing(true);
        checkModularPermissions([],defaultPet.petID);
        set_buttonTitle('ADD A DEVICE?');
        getsupportMeterials(17);
        set_deviceStatusText(Constant.DEVICE_MISSING_DASHBOARD);

      }

      set_devicesCount(defaultPet.devices.length);

    } else {
      set_isLoading(false);
      set_isDeviceMissing(true);
      checkModularPermissions([],defaultPet.petID);
      set_buttonTitle('ADD A DEVICE?');
      getsupportMeterials(17);
      set_deviceStatusText(Constant.DEVICE_MISSING_DASHBOARD);
    }

  };

  const refreshDashBoardDetails = async (value,pObject) => {
    set_supportMetialsArray([]);
    set_isLoading(true);
    enableLoader.current = true;
    isDefaultModularity.current = true;
    modularityServiceCount.current = 0;
    setupDonePetsLength.current = 1;
    setDefaultSlide(petsArray);
    // getDashBoardPets();
  };

  const getPetModularity = async (petIdArray,petId) => {

    if(enableLoader.current) {
      set_isLoading(true);
    }
    let obj = {"petIds":petIdArray}
    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    trace_Modularity_API_Complet= await perf().startTrace('t_DashBoard_GetPets_Info_API');
    let modularServiceObj = await ServiceCalls.getModularityPermission(obj,token);
    await trace_Modularity_API_Complet.stop();

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
        await updatePermissionsArrays(modularServiceObj.responseData);
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

  const saveModularityAsync = async (moduleArray,petId) => {
    // firebaseHelper.logEvent(firebaseHelper.event_dashboard_defaultPet_modularity, firebaseHelper.screen_dashboard, "Dashboard Modularity Permissions Pet Id : "+petId, 'Permissions : ' + JSON.stringify(moduleArray));
    // await Storage.saveDataToAsync(Constant.MODULATITY_OBJECT, JSON.stringify(moduleArray));
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
        updateModularity([]);
      }
    }

  };

  const updatePermissionsArrays = async (modularArray) => {

    let obsArray = []
    let timeArray = [];
    let questArray = [];
    let modularArrayMain = Object.keys(modularArray).map(key => ({[key]: modularArray[key]}));
    for (let k = 0; k < modularArrayMain.length; k++) {

      let newKey = Object.keys(modularArrayMain[k]);
        var temp = petArrayRef.current.filter(item => item.petID.toString() === newKey[0].toString());
        if(temp) {
          let configArray = Object.values(modularArrayMain[k]);
          configArray = configArray[0]
          
          if(configArray) {
            for (let i = 0; i < configArray.length; i++) {
              if (configArray[i].mobileAppConfigId === PERMISSION_OBSERVATIONS) {
                obsArray.push(temp[0]);
              } 
          
              if (configArray[i].mobileAppConfigId === PERMISSION_QUESTIONNAIRE) {
                questArray.push(temp[0]);
              } 
          
              if (configArray[i].mobileAppConfigId === PERMISSION_TIMER) {
                timeArray.push(temp[0]);
              } 

            }
          }
        }

      }
      await savePetsForObservations(obsArray);
      await savePetsForQuestionnaire(questArray);
      await savePetsForTImer(timeArray);
  };

  const updateModularity = async (modularArray1) => {

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
    if (modularArray.includes(PERMISSION_OBSERVATIONS)) {
      set_isObsEnable(true);
    } else {
      set_isObsEnable(false);
    }

    if (modularArray.includes(PERMISSION_POINTTRACKING)) {

      if(enableLoader.current){
        ptExists.current = true;
        await getCampaignListByPet();
      } else {
        ptExists.current = false;
      }
      
    } else {
      ptExists.current = false;
      set_isPTEnable(false);
    }

    if (modularArray.includes(PERMISSION_QUESTIONNAIRE)) {
      set_isQuestionnaireEnable(true);
      await getQuestionnaireData();
    } else {
      set_isQuestionnaireEnable(false);    
    }

    if (modularArray.includes(PERMISSION_TIMER)) {
      set_isTimerEnable(true);
    } else {
      set_isTimerEnable(false);
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

    set_isModularityService(false);

    if(modularArray.includes(PERMISSION_POINTTRACKING) || modularArray.includes(PERMISSION_QUESTIONNAIRE) || modularArray.includes(PERMISSION_POINTTRACKING)) {

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
    trace_Questionnaire_API_Complete = await perf().startTrace('t_DashBoard_Questionnaire_Info_API');
    let questServiceObj = await ServiceCalls.getQuestionnaireData(defaultPet.petID,token);

    await trace_Questionnaire_API_Complete.stop();
    set_isQuestLoading(false);
    // if(!ptExists.current){
      set_isLoading(false);
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

    trace_campaign_API_Complete = await perf().startTrace('t_Campaign_Details_API');
    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    let serviceCallsObj = await ServiceCalls.getCampaignListByPet(defaultPet.petID,token);
    await trace_campaign_API_Complete.stop();

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
        set_isLoading(false);
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
    trace_LeaderBoard_Campaign_API_Complet = await perf().startTrace('t_Campaign_Details_API');

    let serviceCallsObj = await ServiceCalls.getLeaderBoardByCampaignId(campId,campaignPetId,token);
    await trace_LeaderBoard_Campaign_API_Complet.stop();
    // setTimeout(async () => {  
    //   set_isLoading(false);
    // }, 2000);
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

  /**
   * When default pet is having setup Pending or device missing,
   * Dashboard shows the pdf or videos related to abouve status.
   * This service call fetches the required meterials and loads the data in the dashboard.
   * Setup Pending id = 16 and Device missing id = 17
   * @param {*} id 
   */
   const getsupportMeterials = async (id) => {

    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    set_supportID(id);
    if(enableLoader.current) {
      set_isLoading(true);
    }
    set_loaderMsg(Constant.DASHBOARD_LOADING_MSG);
    trace_Get_Support_Meterials_API_Complete = await perf().startTrace('t_Get_Support_Meterials_API');
    let supportMetObj = await ServiceCalls.getAppSupportDocs(id,token);
    set_isLoading(false);
    set_isPTLoading(false);
    await trace_Get_Support_Meterials_API_Complete.stop();

    if(supportMetObj && supportMetObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if(supportMetObj && !supportMetObj.isInternet){
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getMeterials_fail, firebaseHelper.screen_dashboard, "Dashboard Support Meterials Failed", 'No Internet : ');
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
      return;
    }

    if(supportMetObj && supportMetObj.statusData){
      if(supportMetObj.responseData && supportMetObj.responseData.length > 0){
          set_supportMetialsArray(supportMetObj.responseData);
          if(id === 16){
            set_supportSPendingArray(supportMetObj.responseData);
          } else {
            set_supportDMissingArray(supportMetObj.responseData);
          }
      } else {
        set_supportMetialsArray([]);
      }
    }

    if(supportMetObj && supportMetObj.error) {
      set_isLoading(false);
      let errors = supportMetObj.error.length > 0 ? supportMetObj.error[0].code : '';
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getMeterials_fail, firebaseHelper.screen_dashboard, "Dashboard Support Meterials Failed", 'error : ', errors);
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
    if(popUpMessage==='Are you sure?'){
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
      birthday = {birthday}
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
      isFirmwareUpdate = {isFirmwareUpdate}
      firmware = {firmware}
      deviceNumber = {deviceNumber}
      lastSeen = {lastSeen}
      battery = {battery}
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
      isSwipedModularity = {isSwipedModularity}
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
    />
  );

}

export default DasBoardService;