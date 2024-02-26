import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import * as DataStorageLocal from "./../../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../../utils/constants/constant";
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import CategorySelectUI from './categorySelectUI';
import * as AuthoriseCheck from './../../../../utils/authorisedComponent/authorisedComponent';
import * as ServiceCalls from './../../../../utils/getServicesData/getServicesData.js';

let trace_inAddCategoryScreen;

const CategorySelectComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [ctgName, set_ctgNameName] = useState(undefined);
    const [ctgNameId, set_ctgNameId] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [behavioursData, set_behavioursData] = useState(undefined);

    let sJosnObj = useRef({});
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

      getObsDetails();
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_add_observations_Category);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_add_observations_Category, "User in Add Obs Select Category Screen", '');
            
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

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inAddCategoryScreen = await perf().startTrace('t_inAddOBSCategoryScreen');
    };

    const initialSessionStop = async () => {
        await trace_inAddCategoryScreen.stop();
    };

    const getObsDetails = async () => {

        let oJson = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
        oJson = JSON.parse(oJson);
        if(oJson){
            set_isFromScreen(oJson.fromScreen);
            sJosnObj.current = oJson;
            set_selectedIndex(oJson.ctgNameId);
            set_ctgNameId(oJson.ctgNameId);
            set_ctgNameName(oJson.ctgName);
            if(oJson.ctgNameId === 0 || oJson.ctgNameId === 1) {
                set_isBtnEnable(true);
            }  

            // set_isLoading(true);
            // isLoadingdRef.current = 1;
            // behavioursAPIRequest(oJson.selectedPet.speciesId);
        }

    };

    // const behavioursAPIRequest = async (sId) => {

    //     set_isLoading(true);
    //     isLoadingdRef.current = 1;
    //     set_loaderMsg(Constant.BEHAVIOURS_LOADING_MSG);
    //     let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    //     if(!sId){
    //       sId = 1;
    //     }
    //     getBehavioursFromBckEnd(sId,token);

    // };

    // const getBehavioursFromBckEnd = async (sid,token) => {

    //   let getBehScoreServiceObj = await ServiceCalls.getPetBehaviors(sid,token);
      
    //   set_isLoading(false);
    //   isLoadingdRef.current = 0;

    //   if(getBehScoreServiceObj && getBehScoreServiceObj.logoutData){
    //     AuthoriseCheck.authoriseCheck();
    //     navigation.navigate('WelcomeComponent');
    //     return;
    //   }
        
    //   if(getBehScoreServiceObj && !getBehScoreServiceObj.isInternet){
    //     createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
    //     return;
    //   }
  
    //   if(getBehScoreServiceObj && getBehScoreServiceObj.statusData){
    //     if(getBehScoreServiceObj.responseData && getBehScoreServiceObj.responseData.length > 0){
    //       let behArray = sortByAscending(getBehScoreServiceObj.responseData);
    //       set_behavioursData(behArray);                         
    //     } else {
    //       set_behavioursData(undefined);     
    //     }
        
    //   } else {
    //     firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_api_fail, firebaseHelper.screen_add_observations_Category, "Behaviors api fail", 'Service Status : false');
    //     createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
    //   }
  
    //   if(getBehScoreServiceObj && getBehScoreServiceObj.error) {
    //     let errors = getBehScoreServiceObj.error.length > 0 ? getBehScoreServiceObj.error[0].code : '';
    //     firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_api_fail, firebaseHelper.screen_add_observations_Category, "Behaviors api fail", 'error : '+errors);
    //     createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
    //   }

    // };

    // function sortByAscending(arrayBeh) {
    //   const sortedList = arrayBeh.sort((a, b) => a.behaviorName.localeCompare(b.behaviorName));
    //   return sortedList;
    // };
      
    const nextButtonAction = async () => {

      let tempObj = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
      tempObj = JSON.parse(tempObj)
        
      if(tempObj.ctgNameId !== parseInt(ctgNameId)) {
        tempObj.obserItem = undefined;
        tempObj.mediaArray = undefined;
      }
      tempObj.ctgNameId = ctgNameId;
      tempObj.ctgName = ctgName;

      firebaseHelper.logEvent(firebaseHelper.event_add_category_nxt_btn, firebaseHelper.screen_add_observations_Category, "User selected Category type", 'Breed Id : ' + ctgNameId);
      await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ, JSON.stringify(tempObj));

      // let behTemp = []
      // if(ctgNameId === 0) {
      //   behTemp = behavioursData.filter(item => item.behaviorTypeId === 3);
      // } else if(ctgNameId === 1) {
      //   behTemp = behavioursData.filter(item => item.behaviorTypeId === 4);
      // }

      navigation.navigate('ObservationComponent');

    };

    const backBtnAction = () => {
        navigation.pop();
    };

    const selectCategory = (categoryType, index) => {
        set_isBtnEnable(true);
        set_selectedIndex(index);
        set_ctgNameId(index);
        set_ctgNameName(categoryType);
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
        <CategorySelectUI
            isBtnEnable = {isBtnEnable}
            selectedIndex = {selectedIndex}
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            isPopUp = {isPopUp}
            isLoading = {isLoading}
            loaderMsg = {loaderMsg}
            behavioursData = {behavioursData}
            selectCategory = {selectCategory}
            nextButtonAction = {nextButtonAction}
            backBtnAction = {backBtnAction}
            popOkBtnAction = {popOkBtnAction}
        ></CategorySelectUI>
    );
}

export default CategorySelectComponent;
