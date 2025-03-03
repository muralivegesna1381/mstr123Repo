import React, { useState,useRef, useEffect } from 'react';
import {View,BackHandler} from 'react-native';
import QuestionnaireStudyUI from './questionnaireStudyUI';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';
import * as Queries from "./../../../config/apollo/queries";
import { useQuery} from "@apollo/react-hooks";
import { json } from 'stream/consumers';

let trace_inQuestionnaireScreen;
let trace_Questionnaire_API_Complete;

const  QuestionnaireStudyComponent = ({navigation, route, ...props }) => {

  const { loading:questLoading, data : questData } = useQuery(Queries.UPDATE_Quest_LIST, { fetchPolicy: "cache-only" });
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [petsArray, set_petsArray] = useState(undefined);
    const [isLoading, set_isLoading] = useState(true);
    const [questionnaireData, set_questionnaireData] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isSearchDropdown, set_isSearchDropdown] = useState(undefined);
    const [isFrom, set_isFrom] = useState(undefined);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(1);

     /**
   * This Useeffect calls when there is cahnge in API responce
   * All the Questionnaire data will be saved for rendering in UI
   */
    React.useEffect(() => {
      
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        getQuestPets();
        const focus = navigation.addListener("focus", () => {
          set_Date(new Date());
          initialSessionStart();
          firebaseHelper.reportScreen(firebaseHelper.screen_questionnaire_study);  
          firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_questionnaire_study, "User in Questionnaire Study Screen", '');
          
        });

        const unsubscribe = navigation.addListener('blur', () => {
          initialSessionStop();
        });
    
        return () => {
          focus();
          unsubscribe();
          initialSessionStop();
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, [navigation]);

    useEffect(() => {

      if(route.params?.isFrom){
          set_isFrom(route.params?.isFrom);
      }

    }, [route.params?.isFrom]);

    useEffect(() => {

      if(questData && questData.data.__typename === 'UpdateQuestList'){
        set_isLoading(true)
        getQuestPets();
      }
        
    }, [questData]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
      trace_inQuestionnaireScreen = await perf().startTrace('t_inQuestionnaireScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inQuestionnaireScreen.stop();
    };

    // Fetches the Pets having the Questionnaire permissions
    const getQuestPets = async () => {

        let questPets =  await DataStorageLocal.getDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
        questPets = JSON.parse(questPets);
        let duplicates = getUnique(questPets, 'petID');
        set_petsArray(duplicates);
        
        let defPet = await DataStorageLocal.getDataFromAsync(Constant.QUESTIONNAIRE_SELECTED_PET);
        defPet = JSON.parse(defPet)
        set_defaultPetObj(defPet);
        getQuestionnaireData(defPet.petID);
        
    };

    // removes the duplicate objects from the Pets array
    function getUnique(petArray, index) {
      const uniqueArray = petArray.map(e => e[index]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => petArray[e]).map(e => petArray[e]);
      return uniqueArray;
    };

    // API to fetch the Questionnaires for a selected pet
    const getQuestionnaireData = async (petId) => {

      set_isLoading(true);
      isLoadingdRef.current = 1;
      trace_Questionnaire_API_Complete = await perf().startTrace('t_GetQuestionnaireByPetId_API');
      firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_api, firebaseHelper.screen_questionnaire_study, "Initiated API to get Questionnaires", 'Pet Id : '+petId);

      if(petId){
        let apiMethod = apiMethodManager.GET_QUESTIONNAIRE_LIST + petId + '?isDateSupported=true';
        let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        stopFBTrace();
        isLoadingdRef.current = 0;
                        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
          if(apiService.data.questionnaireList && apiService.data.questionnaireList.length > 0){
            set_questionnaireData(apiService.data.questionnaireList);
          } else {
            set_questionnaireData(undefined);
          } 
    
        } else if(apiService && apiService.isInternet === false) {

          firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_api_fail, firebaseHelper.screen_questionnaire_study, "Get Questionnaires API Fail", 'No Internet');
          createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

          createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true);   
          firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_api_fail, firebaseHelper.screen_questionnaire_study, "Get Questionnaires API Fail", 'error : ' + apiService.error);
          
        } else {
          firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_api_fail, firebaseHelper.screen_questionnaire_study, "Get Questionnaires API Fail", '');
          createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);

        }

      } else {
        firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_api_fail, firebaseHelper.screen_questionnaire_study, "Get Questionnaires API Fail", 'error : No Pet Id');
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      }

    };

    const stopFBTrace = async () => {
      await trace_Questionnaire_API_Complete.stop();
    };

    const navigateToPrevious = () => { 
      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_questionnaire_study, "User clicked on back button to navigate to DashBoardService", '');
        navigation.pop();
      }    
    };

    const createPopup = (title,msg,isPop) => {
      set_popUpTitle(title);
      set_popUpMessage(msg);
      set_isPopUp(isPop);
      popIdRef.current = 1;
    };

    const popOkBtnAction = (value,) => {
        set_isPopUp(value);
        popIdRef.current = 0;
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);
    };

    // Pet selection action
    const questPetSelection = (pObject) => {
      set_isLoading(true)
      isLoadingdRef.current = 1;
      firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_pet_swipe_button_trigger, firebaseHelper.screen_questionnaire_study, "User selected another Pet for Questionnaires", 'Pet Id : '+pObject.petID);
      getQuestPets();       
    };

    // Navigates to Questionnaire question section
    const selectQuetionnaireAction = async (item) => {
      searchDropAction();
      let selectedQuest = await DataStorageLocal.getDataFromAsync(Constant.SELECTED_QUESTIONNAIRE);
      selectedQuest = JSON.parse(selectedQuest);
      let questId = item.questionnaireId;

      if(selectedQuest && selectedQuest.length > 0){

        let isTrue = false;

        for (let i = 0; i < selectedQuest.length ; i++) {

          if(selectedQuest[i].petId === defaultPetObj.petID && selectedQuest[i].questId === questId) {           
            isTrue = true;
          } 
          
        }

        if(!isTrue) {
          firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_question_button_trigger, firebaseHelper.screen_questionnaire_study, "User selected Question : ", 'Questionnaire Name : '+item.questionnaireName);
          navigation.navigate('QuestionnaireQuestionsService',{questionObject : item, petObj : defaultPetObj});
        } else {
          set_popUpTitle(Constant.ALERT_DEFAULT_TITLE)
          set_popUpMessage(Constant.QUEST_INPROGRESS_MSG);
          set_isPopUp(true);
          popIdRef.current = 1;
        }

      } else {
        firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_question_button_trigger, firebaseHelper.screen_questionnaire_study, "User selected Question : ", 'Questionnaire Name : '+item.questionnaireName);
        navigation.navigate('QuestionnaireQuestionsService',{questionObject : item, petObj : defaultPetObj});
      }
        
    };

    const selectedSearchPetAction = (item) => {
      firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_pet_swipe_button_trigger, firebaseHelper.screen_questionnaire_study, "User selected another Pet for Questionnaires", 'Pet Id : '+item.petID);
      getQuestPets();  
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
      <QuestionnaireStudyUI 
        defaultPetObj = {defaultPetObj}
        petsArray = {petsArray}
        isPopUp = {isPopUp}
        popUpMessage = {popUpMessage}
        popUpTitle = {popUpTitle}
        isLoading = {isLoading}
        questionnaireData = {questionnaireData}
        isSearchDropdown = {isSearchDropdown}
        popOkBtnAction = {popOkBtnAction}
        questPetSelection = {questPetSelection}
        navigateToPrevious = {navigateToPrevious}
        selectQuetionnaireAction = {selectQuetionnaireAction}
        selectedSearchPetAction = {selectedSearchPetAction}
      />
    );

  }
  
  export default QuestionnaireStudyComponent;