import React, { useState, useEffect,useRef } from 'react';
import {BackHandler} from 'react-native';
import FoodIntakeMainUI from './foodIntakeMainUI.js';
import * as DataStorageLocal from "../../../utils/storage/dataStorageLocal.js";
import * as Constant from "../../../utils/constants/constant.js";
import * as firebaseHelper from '../../../utils/firebase/firebaseHelper.js';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from '../../../utils/authorisedComponent/authorisedComponent.js';
import * as ServiceCalls from '../../../utils/getServicesData/getServicesData.js';
import moment from "moment";

let trace_inFoodIntakeListScreen;

const FoodIntakeMainComponent = ({navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [date, set_Date] = useState(new Date());
    const [noLogsShow, set_noLogsShow] = useState(true);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [popupAlert, set_popupAlert] = useState(undefined);
    const [foodArray, set_foodArray] = useState(undefined)
    const [datePickerDate, set_datePickerDate] = useState(new Date());
    const [tabSelection, set_tabSelection] = useState(0);
    const [isDateVisible, set_isDateVisible] = useState(undefined);
    const [isDropDown, set_isDropDown] = useState(undefined);
    const [petObj, set_petObj] = useState(undefined);
    const [selectedDietName, set_selectedDietName] = useState("");
    const [selectedDietId, set_selectedDietId] = useState(0);
    const [selectdCategoryUnit, set_selectdCategoryUnit] = useState("grams");

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    React.useEffect(() => {

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      unitChangeSelection();
      if(route.params?.petObject) {
        set_petObj(route.params?.petObject);
        let dataValue = moment(datePickerDate).format('YYYY-MM-DD');
        foodIntakeListApi(route.params?.petObject.petID,dataValue);
      }

      const focus = navigation.addListener("focus", () => {

        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_Food_Intake_List_Sel);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_Food_Intake_List_Sel, "User in Food History Intake List Screen", '');

        if(route.params?.selectedDateMain) {
          let formatted = moment(route.params?.selectedDateMain, 'MM-DD-YYYY').format('YYYY-MM-DD').toString()
          set_datePickerDate(moment(route.params?.selectedDateMain).format('YYYY-MM-DD'));
          // set_datePickerDate(route.params?.selectedDateMain)
          foodIntakeListApi(petObj.petID,moment(route.params?.selectedDateMain).format('YYYY-MM-DD'));
        }

      });
  
      return () => {
        focus();
        initialSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };
      
    }, [route.params?.petObject,route.params?.selectedDateMain,route.params?.selectedDate]);

    const initialSessionStart = async () => {
      trace_inFoodIntakeListScreen = await perf().startTrace('t_inFoodIntakeListScreen');
    };
  
    const initialSessionStop = async () => {
      await trace_inFoodIntakeListScreen.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

      // Navigates to Dashboard
    const navigateToPrevious = () => { 

      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        navigation.pop();
      }      
    };

    const foodIntakeListApi = async (petId,dteString) => {

      set_isLoading(true);
      isLoadingdRef.current = 1;
      let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
      let fIntakeListServiceObj = await ServiceCalls.foodIntakeListApi(petId,client,dteString,token);

      set_isLoading(false);
      isLoadingdRef.current = 0;

      if(fIntakeListServiceObj && fIntakeListServiceObj.logoutData){
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
        return;
      }
      
      if(fIntakeListServiceObj && !fIntakeListServiceObj.isInternet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
        return;
      }

      if(fIntakeListServiceObj && fIntakeListServiceObj.statusData){
        if(fIntakeListServiceObj.responseData && fIntakeListServiceObj.responseData.length > 0){
          set_foodArray(fIntakeListServiceObj.responseData)
          set_noLogsShow(false);             
        } else {
          set_foodArray(undefined)
          set_noLogsShow(true);
        }
      } else {
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
        firebaseHelper.logEvent(firebaseHelper.event_Get_Food_Inatke_List_api_fail, firebaseHelper.screen_Food_Intake_List_Sel, "Get Food Intake List Api Failed : ", 'Service Status : false');
      }

      if(fIntakeListServiceObj && fIntakeListServiceObj.error) {
        let errors = getfeedbackServiceObj.error.length > 0 ? getfeedbackServiceObj.error[0].code : '';
        firebaseHelper.logEvent(firebaseHelper.event_Get_Food_Inatke_List_api_fail, firebaseHelper.screen_Food_Intake_List_Sel, "Get Food Intake List Api Failed : ", 'error : '+errors);
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      }

    };

    const getFoodIntakeApi = async (id) => {

      set_isLoading(true);
      isLoadingdRef.current = 1;
      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
      let fIntakeListServiceObj = await ServiceCalls.getFoodIntakeApi(id,token);

      set_isLoading(false);
      isLoadingdRef.current = 0;

      if(fIntakeListServiceObj && fIntakeListServiceObj.logoutData){
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
        return;
      }
      
      if(fIntakeListServiceObj && !fIntakeListServiceObj.isInternet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
        return;
      }

      if(fIntakeListServiceObj && fIntakeListServiceObj.statusData){
        if(fIntakeListServiceObj.responseData){
          let formatedDate = moment(fIntakeListServiceObj.responseData.intakeDate, 'MM-DD-YYYY').format('YYYY-MM-DD').toString();
          navigation.navigate('FoodIntakeComponent',{isEdit:2,petObj : petObj,foodEditObj:fIntakeListServiceObj.responseData,selectedDate: formatedDate});          
        } else {
          createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.DETAILS_FETCH_FAIL,true);
        }
      } else {
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
        firebaseHelper.logEvent(firebaseHelper.event_Get_Food_Inatke_By_Id_api_fail, firebaseHelper.screen_Food_Intake_List_Sel, "Get Food Intake by Id Api Failed : ", 'Service Status : false');
      }

      if(fIntakeListServiceObj && fIntakeListServiceObj.error) {
        let errors = getfeedbackServiceObj.error.length > 0 ? getfeedbackServiceObj.error[0].code : '';
        firebaseHelper.logEvent(firebaseHelper.event_Get_Food_Inatke_By_Id_api_fail, firebaseHelper.screen_Food_Intake_List_Sel, "Get Food Intake by Id Api Failed : ", 'error : '+errors);
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      }

    };

    // Navigates to Submit New feedback
    const nextButtonAction = () => {
      navigation.navigate('FoodIntakeComponent',{isEdit:1,petObj : petObj,selectedDate:datePickerDate})
    };

    const editAction = (item) => {
      getFoodIntakeApi(item.intakeId);
    };

    // Done btn action in Filter popup view
    const doneAction = (date) => {
      let dataValue = moment(date).format('YYYY-MM-DD').toString();
      foodIntakeListApi(petObj.petID,dataValue)
      set_datePickerDate(date);
      set_isDateVisible(!isDateVisible);
      set_isDropDown(!isDropDown)
    };

    // Cancel action to dismiss the filter view
    const cancelAction = () => {
      set_isDateVisible(!isDateVisible);
      set_isDropDown(!isDropDown)
    };

    const dateTopBtnAction = () => {
      set_isDateVisible(true);
    };

    const tabBarBtnAction = (value) => {
      set_isDateVisible(false);
      set_tabSelection(value);
      let tabValue = 'Intake'
      if (value === 1) {
        tabValue = 'History'
      }
      firebaseHelper.logEvent(firebaseHelper.event_Food_Inatke_Screen, firebaseHelper.screen_Food_Intake_List_Sel, "User in : "+tabValue, '');
    };

    const unitChangeSelection = async (value) => {

      let petParent = await DataStorageLocal.getDataFromAsync(Constant.PET_PARENT_OBJ,);
      petParent = JSON.parse(petParent)
      if(petParent && petParent.preferredFoodRecUnitId === 4) {
        set_selectdCategoryUnit("cups");
      } else {
        set_selectdCategoryUnit("grams");
      }
      
    }
    const createPopup = (title,msg,isPop) => {
      set_popupAlert(title);
      set_popupMsg(msg);
      set_isPopUp(isPop);
      popIdRef.current = 1;
    };

    const popOkBtnAction = () => {
      set_isPopUp(false);
      popIdRef.current = 0;     
    };

    const updateLoader = (value) => {

      set_isLoading(value);
      if(value) {
        isLoadingdRef.current = 1;
      } else {
        isLoadingdRef.current = 0;
      }
      
    };

    const updatePopup = (value) => {
      createPopup(value.title,value.msg,value.isPop)
    };

    const doneCalenderBtnAction = (startDate, endDate) => {
      set_isDateVisible(false);
    };

    const cancelCalenderBtnAction = () => {
      set_isDateVisible(undefined);
    };

    const setDietInfo = (dietId, dietName) => {
      set_selectedDietName(dietName);
      set_selectedDietId(dietId);
    }
    return (

      <FoodIntakeMainUI 
        isLoading = {isLoading}
        noLogsShow = {noLogsShow}
        petObj = {petObj}
        isPopUp = {isPopUp}
        popupMsg = {popupMsg}
        popupAlert = {popupAlert}
        foodArray = {foodArray}
        tabSelection ={tabSelection}
        isDateVisible = {isDateVisible}
        isDropDown = {isDropDown}
        datePickerDate = {datePickerDate}
        navigateToPrevious = {navigateToPrevious}
        nextButtonAction = {nextButtonAction}
        popOkBtnAction = {popOkBtnAction}
        editAction = {editAction}
        cancelAction = {cancelAction}
        dateTopBtnAction = {dateTopBtnAction}  
        doneAction = {doneAction}
        tabBarBtnAction ={tabBarBtnAction}
        updateLoader = {updateLoader}
        updatePopup = {updatePopup}
        doneCalenderBtnAction = {doneCalenderBtnAction}
        cancelCalenderBtnAction = {cancelCalenderBtnAction}
        selectdCategoryUnit= {selectdCategoryUnit}
      />
    );

  }
  
  export default FoodIntakeMainComponent;