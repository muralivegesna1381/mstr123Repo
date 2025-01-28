import React, { useState, useRef } from 'react';
import { BackHandler } from 'react-native';
import FoodIntakeUI from './foodIntakeUI.js';
import * as DataStorageLocal from "../../../utils/storage/dataStorageLocal.js";
import * as Constant from "../../../utils/constants/constant.js";
import moment from "moment";
import * as firebaseHelper from '../../../utils/firebase/firebaseHelper';
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';
import perf from '@react-native-firebase/perf';
import * as UserDetailsModel from "./../../../utils/appDataModels/userDetailsModel.js"

let trace_inFoodIntakeScreen;
const SUBMIT_INTAKE = 2;

const FoodIntakeComponent = ({ navigation, route, ...props }) => {

  const [isLoading, set_isLoading] = useState(false);
  const [date, set_Date] = useState(new Date());
  const [noLogsShow, set_noLogsShow] = useState(true);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popupMsg, set_popupMsg] = useState(undefined);
  const [popupAlert, set_popupAlert] = useState(undefined);
  const [isOtherFood, set_isOtherFood] = useState(true);
  const [isListView, set_isListView] = useState(false);
  const [isRecEdit, set_isRecEdit] = useState(undefined);
  const [isOtherList, set_isOtherList] = useState(undefined);
  const [isFeedback, set_isFeedback] = useState(false);
  const [isDateVisible, set_isDateVisible] = useState(undefined);
  const [isRecFood, set_isRecFood] = useState(undefined)
  const [totalPercentage, set_totalPercentage] = useState(0)
  const [selectedDate, set_selectedDate] = useState(new Date());
  const [isDropSelected, set_isDropSelected] = useState(undefined);
  const [isDropConsumed, set_isDropConsumed] = useState(undefined)
  const [otherFoodUnitsArray, set_otherFoodUnitsArray] = useState([])
  const [consumedUnitsArray, set_consumedUnitsArray] = useState([])
  const [recommendedPercentage, set_recommendedPercentage] = useState(100);
  const [isCalDrop,set_isCalDrop] = useState(undefined)
  const [isConsumedDrop,set_isConsumedDrop] = useState(undefined)

  let foodEditObj = useRef(undefined);
  let deleteEditFoodObj = useRef([]);
  let pIdRef = useRef(0);

  const [foodHistoryIntakeObj, set_foodHistoryIntakeObj] = useState();
  const [optionsArray, set_optionsArray] = useState([
    { 'id': 1, 'name': 'Cups' },
    { 'id': 2, 'name': 'Grams' },
    { 'id': 3, 'name': 'Cancel' },
  ]);

  const [optionsOtherArray, set_optionsOtherArray] = useState([
    { 'id': 1, 'name': 'kcal/cups' },
    { 'id': 2, 'name': 'kcal/grams' },
    { 'id': 3, 'name': 'Cancel' },
  ]);
  const [isEdit, set_isEdit] = useState(-1)
  const [isItemAdded, set_isItemAdded] = useState(-1);
  const [petObj, set_petObj] = useState(undefined)
  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);

  React.useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_Food_Intake);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_Food_Intake, "User in Food History Intake Screen", '');
    });

    return () => {
      focus();
      initialSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };

  }, []);

  React.useEffect(() => {

    if (route.params?.isEdit) {
      set_isEdit(route.params?.isEdit)
    }

    if (route.params?.foodEditObj) {
      foodEditObj.current = route.params?.foodEditObj;
    }
    if (route.params?.petObj) {
      set_petObj(route.params?.petObj)
      getFoodIntakeConfigDataApi(route.params?.petObj.petID, route.params?.selectedDate ? new Date(route.params?.selectedDate) : new Date());
    }

    if (route.params?.petObj) {
      set_selectedDate(route.params?.selectedDate);
    }

  }, [route.params?.isEdit, route.params?.petObj, route.params?.foodEditObj, route.params?.selectedDate]);

  const initialSessionStart = async () => {
    trace_inFoodIntakeScreen = await perf().startTrace('t_inFoodIntakeScreen');
  };

  const initialSessionStop = async () => {
    await trace_inFoodIntakeScreen.stop();
  };

  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  // Navigates to Dashboard
  const navigateToPrevious = () => {

    if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
      navigation.navigate('FoodIntakeMainComponent',{});
    }
  };

  const getFoodIntakeConfigDataApi = async (petId, dte) => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let dataValue = moment(dte).format('YYYY-MM-DD').toString();
    let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);

    let apiMethod = apiMethodManager.GET_FOODINTAKE_CONFIG + petId + "/" + client + "/" + dataValue;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    set_isLoading(false);
    isLoadingdRef.current = 0;
        
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
        
      if (apiService.data) {
        prepareFoodIntakeData(apiService.data);
        set_noLogsShow(false);
      } else {
        set_noLogsShow(true);
      }
            
    } else if(apiService && apiService.isInternet === false) {
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 0);
               
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      firebaseHelper.logEvent(firebaseHelper.event_Get_Food_Inatke_Config_api_fail, firebaseHelper.screen_Food_Intake, "Get Food Intake Config Api Failed : ", 'error : '+apiService.error.errorMsg);
      createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, true, 0);
        
    } else {
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true, 0);
      firebaseHelper.logEvent(firebaseHelper.event_Get_Food_Inatke_Config_api_fail, firebaseHelper.screen_Food_Intake, "Get Food Intake Config Api Failed : ", 'Service Status : false');

    }

  };

  const prepareFoodIntakeData = async (fData) => {

    let feedbackType = [];
    let fRecFeed = [];
    let pBehFeed = [];

    if (foodEditObj.current) {

        let fObj = {}  
        if(fData.recommondedDiet && fData.recommondedDiet.length > 0) {

          for (let fRec = 0; fRec < fData.recommondedDiet.length; fRec++) {

            if(foodEditObj.current.intakeData.recommondedDiet[fRec].foodIntakeHistory && foodEditObj.current.intakeData.recommondedDiet[fRec].foodIntakeHistory.length > 0) {
  
              for (let fEditHistory = 0; fEditHistory < foodEditObj.current.intakeData.recommondedDiet[fRec].foodIntakeHistory.length; fEditHistory++) {
                fData.recommondedDiet[fRec].FOOD_OFFERED = foodEditObj.current.intakeData.recommondedDiet[fRec].foodIntakeHistory[fEditHistory].quantityOffered;
                fData.recommondedDiet[fRec].FOOD_CONSUMED = foodEditObj.current.intakeData.recommondedDiet[fRec].foodIntakeHistory[fEditHistory].quantityConsumed;
                fData.recommondedDiet[fRec].FEED_UNITS = foodEditObj.current.intakeData.recommondedDiet[fRec].foodIntakeHistory[fEditHistory].quantityUnitId;
                fData.recommondedDiet[fRec].FOODHISTORY_ID = foodEditObj.current.intakeData.recommondedDiet[fRec].foodIntakeHistory[fEditHistory].foodHistoryId;
                let tempValue;
                if(fData.recommondedDiet[fRec].FOOD_CONSUMED || fData.recommondedDiet[fRec].FOOD_CONSUMED > 0) {
                  tempValue = (parseFloat(fData.recommondedDiet[fRec].FOOD_CONSUMED)/parseFloat(fData.recommondedDiet[fRec].FOOD_OFFERED)) * 100;
                  tempValue = tempValue.toFixed(2)
                  fData.recommondedDiet[fRec].PERCENT_VALUE = parseFloat(tempValue);
            
                }
              }
            }
    
          }
              
          set_foodHistoryIntakeObj(fData);
          set_isRecFood(true);
        } else {
          set_isRecFood(false);
        }
      for (let i = 0; i < fData.dietFeedback.length; i++) {

        feedbackType.push(fData.dietFeedback[i].feedbackCategory);
        if (fData.dietFeedback[i].feedbackCategory === "Pet Behaviour Feedback") {
          fData.dietFeedback[i].selctedIndex = null;
          fData.dietFeedback[i].dietFeedbackId = null;
          pBehFeed.push(fData.dietFeedback[i])
        }
        if (fData.dietFeedback[i].feedbackCategory === "Food Recommendation Feedback") {
          fData.dietFeedback[i].selctedIndex = null;
          fData.dietFeedback[i].dietFeedbackId = null;
          fRecFeed.push(fData.dietFeedback[i])
        }

      }

      feedbackType = [...new Set(feedbackType)];
      let feedbackMain = [];

      if (feedbackType.length > 0) {

        set_isFeedback(true);
        for (let i = 0; i < feedbackType.length; i++) {
          
          if (feedbackType[i] === "Pet Behaviour Feedback") {

            let obj = {
              feedbackCategory: feedbackType[i],
              dietFeedbackId: 0,
              feedbackOptions: pBehFeed,
              isDeleted : 0
            }
            feedbackMain.push(obj)
          }
          if (feedbackType[i] === "Food Recommendation Feedback") {
            let obj = {
              feedbackCategory: feedbackType[i],
              dietFeedbackId: 0,
              feedbackOptions: fRecFeed,
              isDeleted : 0
            }
            feedbackMain.push(obj)
          }
        }

        const result = foodEditObj.current.intakeData.dietFeedback.filter((question) => question.selectedFeedback);
        if (result.length) {

          let resultFeed1 = result[0].feedbackId

          const result1 = feedbackMain[0].feedbackOptions.filter(question => question.feedbackId === resultFeed1);

          if(result1 && result1.length > 0) {

            result1[0].dietFeedbackId = result[0].selectedFeedback.dietFeedbackId
            result1[0].selctedIndex = resultFeed1
            if(result[0].selectedFeedback.feedbackText && result[0].selectedFeedback.feedbackText !== '') {
              feedbackMain[0].otherText = result[0].selectedFeedback.feedbackText;
              feedbackMain[0].isOthers = true;
            }

            for (let i = 0; i < fData.dietFeedback.length; i++) {

              if (fData.dietFeedback[i].feedbackCategory === "Food Recommendation Feedback") {
                fData.dietFeedback[i].dietFeedbackId = result[0].selectedFeedback.dietFeedbackId;
                // fRecFeed.push(fData.dietFeedback[i])
              }
      
            }

          }

        }

        if (result.length > 1) {

          let resultFeed2 = result[1].feedbackId
          const result2 = feedbackMain[1].feedbackOptions.filter(question => question.feedbackId === resultFeed2);

          if (result2.length > 0) {
            result2[0].selctedIndex = resultFeed2 - 6
            result2[0].dietFeedbackId = result[1].selectedFeedback.dietFeedbackId

            if(result[1].selectedFeedback.feedbackText && result[1].selectedFeedback.feedbackText !== '') {
              feedbackMain[1].otherText = result[1].selectedFeedback.feedbackText;
              feedbackMain[1].isOthers = true;
            }

            for (let i = 0; i < fData.dietFeedback.length; i++) {

              if (fData.dietFeedback[i].feedbackCategory === "Pet Behaviour Feedback") {
                fData.dietFeedback[i].dietFeedbackId = result[1].selectedFeedback.dietFeedbackId;
                // pBehFeed.push(fData.dietFeedback[i])
              }
      
            }           
            
          }

        }

        fData.dietFeedback = feedbackMain;

      } else {
        set_isFeedback(false);
      }
      if (fData && fData.otherFoods && fData.otherFoods.length > 0) {

        if (fData && fData.measurementUnits && fData.measurementUnits.length > 0) {

          let tempMeasurements = []
          let tempConsumed = []
          for (let i = 0; i < fData.measurementUnits.length; i++) {
            if (fData.measurementUnits[i].unitId === 15 || fData.measurementUnits[i].unitId === 16) {
              tempMeasurements.push(fData.measurementUnits[i])
            }
            if (fData.measurementUnits[i].unitId === 3 || fData.measurementUnits[i].unitId === 4) {
              tempConsumed.push(fData.measurementUnits[i])
            }
          }
          set_otherFoodUnitsArray(tempMeasurements);
          set_consumedUnitsArray(tempConsumed)
  
        }
        
        for (let i = 0; i < fData.otherFoods.length; i++) {

          const resultMain = fData.otherFoods.filter(question => question.otherFoodId === i + 1);

          if (resultMain.length > 0) {
            const result = foodEditObj.current.intakeData.otherFoods.filter(question => question.otherFoodId === resultMain[0].otherFoodId);

            if (result.length > 0) {
              let tempFood = []
              if (result[0].foodIntakeHistory.length > 0) {

                for (let k = 0; k < result[0].foodIntakeHistory.length; k++) {
                  let obj =
                  {
                    "FOOD_NAME": result[0].foodIntakeHistory[k].foodName,
                    "PERCENT_CONSUMED": result[0].foodIntakeHistory[k].percentConsumed,
                    "QUANTITY_CONSUMED": result[0].foodIntakeHistory[k].calDensity,
                    "QUANTITY_UNIT_ID": result[0].foodIntakeHistory[k].calDensityUnitId,
                    "FOODHISTORY_ID": result[0].foodIntakeHistory[k].foodHistoryId,
                    "INTAKE_ID": result[0].foodIntakeHistory[k].intakeId,
                    "UNIT": result[0].foodIntakeHistory[k].calDensityUnitId && result[0].foodIntakeHistory[k].calDensityUnitId === 15 ? "kcal/kg" : "kcal/cup",
                    "QUANTITY_CONSUMED_NEW" : result[0].foodIntakeHistory[k].quantityConsumed,
                    "QUANTITY_CONSUMED_UNIT" : result[0].foodIntakeHistory[k].quantityUnitName,
                    "QUANTITY_CONSUMED_UNIT_ID" : result[0].foodIntakeHistory[k].quantityUnitId,
                    "isDeleted": 0,
                  }

                  fData.otherFoods[i].percentageRecord = result[0].foodIntakeHistory[k].percentConsumed + (fData.otherFoods[i].percentageRecord ? fData.otherFoods[i].percentageRecord : 0);

                  tempFood.push(obj)

                }
                fData.otherFoods[i].foofDetails = tempFood;

              } else {

                let obj = [
                  {
                    "FOOD_NAME": '',
                    "PERCENT_CONSUMED": '',
                    "QUANTITY_CONSUMED": '',
                    "QUANTITY_UNIT_ID": 16,
                    "FOODHISTORY_ID": 0,
                    "INTAKE_ID": 0,
                    "UNIT": "kcal/cup",
                    "QUANTITY_CONSUMED_UNIT" : 'grams',
                    "QUANTITY_CONSUMED_UNIT_ID" : 3,
                    "isDeleted": 0,
                  }
                ]

                fData.otherFoods[i].percentageRecord = 0;
                fData.otherFoods[i].foofDetails = obj;

              }

            }
          }

        }
        set_isOtherFood(true);
      } else {
        set_isOtherFood(false);
      }

      initialPercentage(fData);
      set_foodHistoryIntakeObj(fData);
      
    } else {

      for (let i = 0; i < fData.dietFeedback.length; i++) {

        feedbackType.push(fData.dietFeedback[i].feedbackCategory);
        if (fData.dietFeedback[i].feedbackCategory === "Pet Behaviour Feedback") {
          fData.dietFeedback[i].selctedIndex = null;
          fData.dietFeedback[i].dietFeedbackId = 0;
          pBehFeed.push(fData.dietFeedback[i])
        }
        if (fData.dietFeedback[i].feedbackCategory === "Food Recommendation Feedback") {
          fData.dietFeedback[i].selctedIndex = null;
          fData.dietFeedback[i].dietFeedbackId = 0;
          fRecFeed.push(fData.dietFeedback[i])
        }

      }

      feedbackType = [...new Set(feedbackType)];
      let feedbackMain = [];

      if (feedbackType.length > 0) {

        set_isFeedback(true);
        for (let i = 0; i < feedbackType.length; i++) {
          if (feedbackType[i] === "Pet Behaviour Feedback") {

            let obj = {
              feedbackCategory: feedbackType[i],
              feedbackOptions: pBehFeed,
              dietFeedbackId: 0,
              isDeleted : 0
            }
            feedbackMain.push(obj)
          }
          if (feedbackType[i] === "Food Recommendation Feedback") {
            let obj = {
              feedbackCategory: feedbackType[i],
              feedbackOptions: fRecFeed,
              dietFeedbackId: 0,
              isDeleted : 0
            }
            feedbackMain.push(obj)
          }
        }

      } else {
        set_isFeedback(false);
      }

      if (fData && fData.otherFoods && fData.otherFoods.length > 0) {

        let userPref = UserDetailsModel.userDetailsData.user; 

        for (let i = 0; i < fData.otherFoods.length; i++) {

          let obj = [
            {
              "FOOD_NAME": '',
              "PERCENT_CONSUMED": '',
              "QUANTITY_CONSUMED": '',
              "QUANTITY_OFFERED": '',
              "QUANTITY_UNIT_ID": 16,
              "FOODHISTORY_ID": 0,
              "UNIT": "kcal/cup",
              "INTAKE_ID": 0,
              "isDeleted": 0,
              "QUANTITY_CONSUMED_NEW" : 0,
              "QUANTITY_CONSUMED_UNIT" : userPref && userPref.preferredFoodRecUnit ? userPref.preferredFoodRecUnit : "grams",
              "QUANTITY_CONSUMED_UNIT_ID" : userPref && userPref.preferredFoodRecUnitId ? userPref.preferredFoodRecUnitId : 3,
            }
          ]
          fData.otherFoods[i].percentageRecord = 0;
          fData.otherFoods[i].foofDetails = obj;
        }

        // set_isOtherFood(true);
      } else {
        // set_isOtherFood(false);
      }

      if (fData && fData.measurementUnits && fData.measurementUnits.length > 0) {

        let tempMeasurements = []
        let tempConsumed = []
        for (let i = 0; i < fData.measurementUnits.length; i++) {
          if (fData.measurementUnits[i].unitId === 15 || fData.measurementUnits[i].unitId === 16) {
            tempMeasurements.push(fData.measurementUnits[i])
          }
          if (fData.measurementUnits[i].unitId === 3 || fData.measurementUnits[i].unitId === 4) {
            tempConsumed.push(fData.measurementUnits[i])
          }
        }
        set_otherFoodUnitsArray(tempMeasurements);
        set_consumedUnitsArray(tempConsumed)

      }

      if (fData && fData.recommondedDiet && fData.recommondedDiet.length > 0) {

        for (let i = 0; i < fData.recommondedDiet.length; i++) {

          fData.recommondedDiet[i].FOOD_OFFERED = '';
          fData.recommondedDiet[i].FOOD_CONSUMED = '';
          fData.recommondedDiet[i].FEED_UNITS = fData.recommondedDiet[i].unitId;
        }

        set_isRecFood(true);
      } else {
        set_isRecFood(false);
      }

      fData.dietFeedback = feedbackMain;
      set_foodHistoryIntakeObj(fData);
      
    }

  }

  const saveOrUpdatePetFoodIntake = async () => {

    let userId = UserDetailsModel.userDetailsData.userRole.UserId;
    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let petId = petObj.petID;
    let dataValue = moment(selectedDate).format('MM-DD-YYYY HH:mm:ss');

    let intakeId = foodEditObj.current ? foodEditObj.current.intakeId : 0;

    let jsonValue = {
      "intakeId": intakeId,
      "petId": petId,
      "petParentId": clientId,
      "intakeDate": dataValue,
      "isOtherFood": true,
      "userId": userId,
      "modifiedDate": null,
    }

    let recOtherArray = [];
    let otherArray = [];
    let feedbackArray = [];

    if (foodHistoryIntakeObj && foodHistoryIntakeObj.recommondedDiet) {

      for (let i = 0; i < foodHistoryIntakeObj.recommondedDiet.length; i++) {

        let temp = {
          "foodHistoryId": foodHistoryIntakeObj.recommondedDiet[i].FOODHISTORY_ID ? foodHistoryIntakeObj.recommondedDiet[i].FOODHISTORY_ID : 0,
          "intakeId": intakeId,
          "feedingScheduledId": foodHistoryIntakeObj.recommondedDiet[i].feedingScheduledId,
          "dietId": foodHistoryIntakeObj.recommondedDiet[i].dietId,
          "dietName": foodHistoryIntakeObj.recommondedDiet[i].dietName,
          "foodName": foodHistoryIntakeObj.recommondedDiet[i].dietName,
          "quantityRecommended": foodHistoryIntakeObj.recommondedDiet[i].FEED_UNITS === 3 ? foodHistoryIntakeObj.recommondedDiet[i].recommendedAmountGrams : foodHistoryIntakeObj.recommondedDiet[i].recommendedAmountCups,
          "quantityOffered": foodHistoryIntakeObj.recommondedDiet[i].FOOD_OFFERED,
          "quantityConsumed": foodHistoryIntakeObj.recommondedDiet[i].FOOD_CONSUMED,
          "quantityUnitId": foodHistoryIntakeObj.recommondedDiet[i].FEED_UNITS,
          "quantityUnitName": foodHistoryIntakeObj.recommondedDiet[i].FEED_UNITS === 4 ? 'cup' : 'gram',
          "percentConsumed": recommendedPercentage,
          "quantityRecommendedRounded" : foodHistoryIntakeObj.recommondedDiet[i].FEED_UNITS === 3 ? foodHistoryIntakeObj.recommondedDiet[i].recommendedRoundedGrams : foodHistoryIntakeObj.recommondedDiet[i].recommendedRoundedCups,
          "calDensity": 0.0,
          "isDeleted": 0
        }
        recOtherArray.push(temp);
      }
    }

    jsonValue.foodIntakeHistory = recOtherArray;

    if (foodHistoryIntakeObj && foodHistoryIntakeObj.otherFoods) {

      for (let i = 0; i < foodHistoryIntakeObj.otherFoods.length; i++) {

        for (let k = 0; k < foodHistoryIntakeObj.otherFoods[i].foofDetails.length; k++) {

          if (foodHistoryIntakeObj.otherFoods[i].foofDetails[k].FOOD_NAME && foodHistoryIntakeObj.otherFoods[i].foofDetails[k].FOOD_NAME !== '') {

            let obj = {
              "foodHistoryId": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].FOODHISTORY_ID,
              "intakeId": intakeId,
              "dietName": "OTHER_FOOD",
              "otherFoodtypeId": foodHistoryIntakeObj.otherFoods[i].otherFoodId,
              "otherFoodTypeName": foodHistoryIntakeObj.otherFoods[i].otherFoodType,
              "foodName": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].FOOD_NAME,
              "quantityOffered": null,
              "quantityConsumed": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].QUANTITY_CONSUMED_NEW,
              "percentConsumed": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].PERCENT_CONSUMED,
              "calDensity": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].QUANTITY_CONSUMED,
              "calDensityUnitId": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].QUANTITY_UNIT_ID,
              "quantityUnitId": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].QUANTITY_CONSUMED_UNIT_ID,
              "quantityUnitName": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].QUANTITY_CONSUMED_UNIT,
              "isDeleted": 0
            }
            recOtherArray.push(obj);

          } else {

            if (foodHistoryIntakeObj.otherFoods[i].foofDetails[k].isDeleted > 0) {

              let obj = {
                "foodHistoryId": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].FOODHISTORY_ID,
                "intakeId": intakeId,
                "dietName": "OTHER_FOOD",
                "otherFoodtypeId": foodHistoryIntakeObj.otherFoods[i].otherFoodId,
                "otherFoodTypeName": foodHistoryIntakeObj.otherFoods[i].otherFoodType,
                "foodName": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].FOOD_NAME,
                "quantityOffered": null,
                "quantityConsumed": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].QUANTITY_CONSUMED_NEW,
                "percentConsumed": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].PERCENT_CONSUMED,
                "calDensity": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].QUANTITY_CONSUMED,
                "calDensityUnitId": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].QUANTITY_UNIT_ID,
                "quantityUnitId": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].QUANTITY_CONSUMED_UNIT_ID,
                "quantityUnitName": foodHistoryIntakeObj.otherFoods[i].foofDetails[k].QUANTITY_CONSUMED_UNIT,
                "isDeleted": 1
              }
              recOtherArray.push(obj);
            }

          }

        }

      }

      if(foodEditObj.current && deleteEditFoodObj.current.length > 0) {

        for (let i = 0; i < deleteEditFoodObj.current.length; i++) {

          let obj = {
            "foodHistoryId": deleteEditFoodObj.current[i].FOODHISTORY_ID,
            "intakeId": intakeId,
            "dietName": "OTHER_FOOD",
            "otherFoodtypeId": deleteEditFoodObj.current[i].OTHER_FOOD_ID,
            "otherFoodTypeName": deleteEditFoodObj.current[i].OTHER_FOOD_TYPE,
            "foodName": deleteEditFoodObj.current[i].FOOD_NAME,
            "quantityOffered": null,
            "quantityConsumed": deleteEditFoodObj.current[i].QUANTITY_CONSUMED_NEW,
            "percentConsumed": deleteEditFoodObj.current[i].PERCENT_CONSUMED,
            "calDensity": deleteEditFoodObj.current[i].QUANTITY_CONSUMED,
            "calDensityUnitId": deleteEditFoodObj.current[i].QUANTITY_UNIT_ID,
            "quantityUnitId": deleteEditFoodObj.current[i].QUANTITY_CONSUMED_UNIT_ID,
            "quantityUnitName": deleteEditFoodObj.current[i].QUANTITY_CONSUMED_UNIT,
            "isDeleted": 1
          }
          recOtherArray.push(obj);

        }

      }

    }

    jsonValue.foodIntakeHistory = recOtherArray;
    if (foodHistoryIntakeObj && foodHistoryIntakeObj.dietFeedback) {

      for (let i = 0; i < foodHistoryIntakeObj.dietFeedback.length; i++) {

        for (let k = 0; k < foodHistoryIntakeObj.dietFeedback[i].feedbackOptions.length; k++) {

          if (foodHistoryIntakeObj.dietFeedback[i].feedbackOptions[k].selctedIndex !== null) {

            let feed = {
              "dietFeedbackId": foodHistoryIntakeObj.dietFeedback[i].feedbackOptions[k].dietFeedbackId,
              "intakeId": intakeId ? intakeId : 0,
              "feedbackId": foodHistoryIntakeObj.dietFeedback[i].feedbackOptions[k].feedbackId,
              "isDeleted": 0
            }

            feedbackArray.push(feed);

          }

        }
        if(foodHistoryIntakeObj.dietFeedback[i].isOthers) {

          if(feedbackArray && feedbackArray.length === 1 ) {
            feedbackArray[0].feedbackText = foodHistoryIntakeObj.dietFeedback[i].otherText;
          } else {
            feedbackArray[i].feedbackText = foodHistoryIntakeObj.dietFeedback[i].otherText;
          }
          
        }

      }
    }

    jsonValue.dietFeedback = feedbackArray;

    if (recOtherArray.length === 0 && otherArray.length === 0) {
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.NO_CHANGES, true, 0);
      return
    }

    if (!validatePercentage(foodHistoryIntakeObj)) {
      //In Valid
      return;
    }

    set_isLoading(true);
    isLoadingdRef.current = 1;

    let apiMethod = apiMethodManager.SAVE_UPDATE_FOODINTAKE;
    let apiService = await apiRequest.postData(apiMethod,jsonValue,Constant.SERVICE_JAVA,navigation);
    set_isLoading(false);
    isLoadingdRef.current = 0;
        
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      navigation.navigate('FoodIntakeMainComponent',{selectedDateMain : selectedDate});
            
    } else if(apiService && apiService.isInternet === false) {               
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

      createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg, true, 0);
      firebaseHelper.logEvent(firebaseHelper.event_save_Food_Inatke_api_fail, firebaseHelper.screen_Food_Intake, "SaveUpdate Food Intake Api Failed : ", 'error : '+apiService.error.errorMsg);
      
    } else {

      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true, 0);
      firebaseHelper.logEvent(firebaseHelper.event_save_Food_Inatke_api_fail, firebaseHelper.screen_Food_Intake, "SaveUpdate Food Intake Api Failed : ", 'Service Status : false');
      
    }

  };

  // Navigates to Submit New feedback
  const nextButtonAction = async () => {

    let isFilled = true;
    let isRecFilled = true;
    let isFeedOtherFilled = true;

    if (foodHistoryIntakeObj) {

      if (foodHistoryIntakeObj && foodHistoryIntakeObj.recommondedDiet.length > 0) {

        for (let i = 0; i < foodHistoryIntakeObj.recommondedDiet.length; i++) {

          if ((foodHistoryIntakeObj.recommondedDiet[i].FOOD_OFFERED || foodHistoryIntakeObj.recommondedDiet[i].FOOD_OFFERED > 0 || foodHistoryIntakeObj.recommondedDiet[i].FOOD_OFFERED === 0)
            && (foodHistoryIntakeObj.recommondedDiet[i].FOOD_CONSUMED || foodHistoryIntakeObj.recommondedDiet[i].FOOD_CONSUMED > 0 || foodHistoryIntakeObj.recommondedDiet[i].FOOD_CONSUMED === 0)
            && foodHistoryIntakeObj.recommondedDiet[i].FEED_UNITS) {
            isRecFilled = true;
          } else {
            isRecFilled = false;
            break;
          }
        }
      }

      if (isFilled) {

        if (foodHistoryIntakeObj && foodHistoryIntakeObj.otherFoods.length > 0) {

          for (let i = 0; i < foodHistoryIntakeObj.otherFoods.length; i++) {

            for (let k = 0; k < foodHistoryIntakeObj.otherFoods[i].foofDetails.length; k++) {

              if (foodHistoryIntakeObj.otherFoods[i].foofDetails[k].FOOD_NAME || foodHistoryIntakeObj.otherFoods[i].foofDetails[k].PERCENT_CONSUMED || foodHistoryIntakeObj.otherFoods[i].foofDetails[k].QUANTITY_CONSUMED) {

                if (foodHistoryIntakeObj.otherFoods[i].foofDetails[k].FOOD_NAME && foodHistoryIntakeObj.otherFoods[i].foofDetails[k].PERCENT_CONSUMED) {
                  isFilled = true;
                }

                else {
                  isFilled = false;
                  break;
                }

              } else {
                isFilled = true;
                break;
              }

            }
            if (!isFilled) {
              break;
            }
          }
        }

      }

      if (isFeedOtherFilled) {

        if (foodHistoryIntakeObj && foodHistoryIntakeObj.dietFeedback && foodHistoryIntakeObj.dietFeedback.length > 0) {

          for( let dFeed = 0; dFeed < foodHistoryIntakeObj.dietFeedback.length; dFeed++) {
            if(foodHistoryIntakeObj.dietFeedback[dFeed].isOthers && foodHistoryIntakeObj.dietFeedback[dFeed].otherText === '') {
              isFeedOtherFilled = false;              
              break;
            }
          }

        }

      }

    }
    
    if (!isRecFilled) {
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.REC_POP_TEXT1, true, 0);
    } else if (!isFilled) {
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.OTHER_POP_TEXT, true, 0);
    } else if (!isFeedOtherFilled) {
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.FEEDBACK_OTHER_POP_TEXT, true, 0);
    }else {

      checkforEmptyFood();
      // saveOrUpdatePetFoodIntake();
    }

  };

  const checkforEmptyFood = () => {

    if (foodHistoryIntakeObj && foodHistoryIntakeObj.otherFoods.length > 0) {

      for (let i = 0; i < foodHistoryIntakeObj.otherFoods.length; i++) {

        for (let k = 0; k < foodHistoryIntakeObj.otherFoods[i].foofDetails.length; k++) {

          if (foodHistoryIntakeObj.otherFoods[i].foofDetails[k].FOOD_NAME === '' && foodHistoryIntakeObj.otherFoods[i].foofDetails[k].PERCENT_CONSUMED === '' && foodHistoryIntakeObj.otherFoods[i].foofDetails[k].FOODHISTORY_ID > 0) {
            foodHistoryIntakeObj.otherFoods[i].foofDetails[k].isDeleted = 1
          }

        }
        
      }
    }

    saveOrUpdatePetFoodIntake();

  }

  const createPopup = (title, msg, isPop, pId) => {
    set_popupAlert(title);
    set_popupMsg(msg);
    set_isPopUp(isPop);
    popIdRef.current = 1;
    pIdRef.current = pId;
  };

  const popOkBtnAction = () => {
    set_isPopUp(false);
    popIdRef.current = 0;
    isLoadingdRef.current = 0;
    popIdRef.current = 0;
    if (pIdRef.current === SUBMIT_INTAKE) {
      // navigateToPrevious()
      navigation.navigate('FoodIntakeMainComponent', { selectedDateMain: selectedDate });

    }
  };

  const updateOtherFoodItems = async (textValue, id, index, parentItemIndex, unitId) => {

    let tempRec = foodHistoryIntakeObj.otherFoods[parentItemIndex].foofDetails[index];
    if (id === 1) {

      let text = textValue.replace(/[^A-Za-z ]/g, '')
      tempRec.FOOD_NAME = text;
      
    } else if (id === 2) {

      if(!isNaN(+textValue) === false) {
        createPopup('Alert', 'Please enter valid amount', true);
        return;
      }
      tempRec.PERCENT_CONSUMED = textValue;
      var perTotal = 0;
      for (var foodItemIndex = 0; foodItemIndex < foodHistoryIntakeObj.otherFoods[parentItemIndex].foofDetails.length; foodItemIndex++) {
        let objTempFoodDetails = foodHistoryIntakeObj.otherFoods[parentItemIndex].foofDetails[foodItemIndex];
        if (objTempFoodDetails.PERCENT_CONSUMED && objTempFoodDetails.PERCENT_CONSUMED != "") {
          perTotal += parseFloat(objTempFoodDetails.PERCENT_CONSUMED);
        }
      }
      foodHistoryIntakeObj.otherFoods[parentItemIndex].percentageRecord = perTotal;

      let conPer = consumedPercentage(foodHistoryIntakeObj.otherFoods);

      if (conPer) {

        if (conPer > 100) {
          tempRec.PERCENT_CONSUMED = 0;
          foodHistoryIntakeObj.otherFoods[parentItemIndex].percentageRecord = '';
          
          set_popupAlert("Alert");
          set_popupMsg("Total Percentage more than 100.");
          set_isPopUp(true);

          var perTotal = 0;
          for (var foodItemIndex = 0; foodItemIndex < foodHistoryIntakeObj.otherFoods[parentItemIndex].foofDetails.length; foodItemIndex++) {
            let objTempFoodDetails = foodHistoryIntakeObj.otherFoods[parentItemIndex].foofDetails[foodItemIndex];
            if (objTempFoodDetails.PERCENT_CONSUMED && objTempFoodDetails.PERCENT_CONSUMED != "") {
              perTotal += parseFloat(objTempFoodDetails.PERCENT_CONSUMED);
            }
          }

          if(perTotal === 0) {
            
            let tempRecomend = foodHistoryIntakeObj.recommondedDiet[0];

            if(tempRecomend && tempRecomend.FOOD_CONSUMED && parseFloat(tempRecomend.FOOD_CONSUMED) > 0) {
              let conPer1 = consumedPercentage(foodHistoryIntakeObj.otherFoods);
              set_recommendedPercentage(100-conPer1);
            }
            if(tempRecomend && tempRecomend.FOOD_CONSUMED && parseFloat(tempRecomend.FOOD_CONSUMED) === 0) {
              set_recommendedPercentage(0);
            }
            
            
          } else {
            set_recommendedPercentage(100 - perTotal);
          }
          
          foodHistoryIntakeObj.otherFoods[parentItemIndex].percentageRecord = perTotal;

        } else {
          if (!isgetPercentageRecomened(foodHistoryIntakeObj)) {
            set_recommendedPercentage(0);
          } else {
            set_recommendedPercentage(100 - conPer);
          }
        }
        set_totalPercentage(parseInt(totalPercentage) + parseInt(textValue))

      } else {
        if (!isgetPercentageRecomened(foodHistoryIntakeObj)) {
          set_recommendedPercentage(0);
        } else {
          set_recommendedPercentage(100);
        }

        set_totalPercentage(100);
      }

    } else if (id === 3) {
      if(!isNaN(+textValue) === false) {
        createPopup('Alert', 'Please enter valid amount', true);
        return;
      }
      tempRec.QUANTITY_CONSUMED = textValue;
    } else if (id === 4) {
      tempRec.UNIT = textValue;
      tempRec.QUANTITY_UNIT_ID = unitId;
    } else if (id === 5) {
      if(!isNaN(+textValue) === false) {
        createPopup('Alert', 'Please enter valid amount', true);
        return;
      }
      tempRec.QUANTITY_CONSUMED_NEW = textValue;
    } else if (id === 6) {
      tempRec.QUANTITY_CONSUMED_UNIT = textValue;
      tempRec.QUANTITY_CONSUMED_UNIT_ID = unitId;
     
    }
    foodHistoryIntakeObj.otherFoods[parentItemIndex].foofDetails[index] = tempRec;
    set_foodHistoryIntakeObj(foodHistoryIntakeObj);
    set_isDropSelected(undefined);
    if (isEdit === -1) {
      set_isEdit(1)
    } else {
      set_isEdit(-1)
    }

  };

  const consumedPercentage = (foods) => {
    var per = 0;
    for (var i = 0; i < foods.length; i++) {
      let obj = foods[i];
      if(obj.percentageRecord && obj.percentageRecord > 0) {
        per = per + parseFloat(obj.percentageRecord);
      }
      
    }

    return per;
  }

  const isgetPercentageRecomened = (fData) => {
    let isPer = true;
    for (var i = 0; i < fData.recommondedDiet.length; i++) {
      let obj = fData.recommondedDiet[i];
      if (parseFloat(obj.FOOD_CONSUMED) == 0) {
        isPer = false;
        break;
        //  recoPet = recoPet+ parseFloat(obj.FOOD_CONSUME);
      }
    }

    return isPer;
  }

  const validatePercentage = (fData) => {
    var per = 0;
    for (var i = 0; i < fData.otherFoods.length; i++) {
      let obj = fData.otherFoods[i];
      for (var fooDetailsIndex = 0; fooDetailsIndex < obj.foofDetails.length; fooDetailsIndex++) {
        let objFood = obj.foofDetails[fooDetailsIndex];
        if (objFood.PERCENT_CONSUMED  && objFood.PERCENT_CONSUMED != "") {
          per = per + parseFloat(objFood.PERCENT_CONSUMED);
        }
      }
    }
    var isRecomendedExists = false;
    for (var i = 0; i < fData.recommondedDiet.length; i++) {
      let obj = fData.recommondedDiet[i];
      if (obj.FOOD_CONSUMED != "") {

        let ieRecExists = isgetPercentageRecomened(fData);
        if (ieRecExists) {
          isRecomendedExists = true;

        } else {
          isRecomendedExists = false;

        }
      }
    }

    if (isRecomendedExists == true) {
      if (recommendedPercentage == 0) {
        createPopup(Constant.ALERT_DEFAULT_TITLE, "Recommended quantity should not be 0%", true, 0);
        return false;
      }
      if (per + recommendedPercentage == 100) {
        return true;
      } else {
        createPopup(Constant.ALERT_DEFAULT_TITLE, "Total percentage of intake should be 100%", true, 0);

        //Total percentage should be 100
        return false;
      }
    } else {
      if (per == 100) {
        //Total percentage should be 100
        return true;
      } else {
        createPopup(Constant.ALERT_DEFAULT_TITLE, "Total percentage of intake should be 100%", true, 0);
        return false;
      }
    }

  };

  const initialPercentage = (fData) => {

    var per = 0;
    for (var i = 0; i < fData.otherFoods.length; i++) {
      let obj = fData.otherFoods[i];
      for (var fooDetailsIndex = 0; fooDetailsIndex < obj.foofDetails.length; fooDetailsIndex++) {
        let objFood = obj.foofDetails[fooDetailsIndex];
        if (objFood.PERCENT_CONSUMED && objFood.PERCENT_CONSUMED != "") {
          per = per + parseFloat(objFood.PERCENT_CONSUMED);
        }

      }
    }
    var isRecomendedExists = false;
    for (var i = 0; i < fData.recommondedDiet.length; i++) {
      let obj = fData.recommondedDiet[i];
      if (obj.FOOD_CONSUMED != "") {
        let ieRecExists = isgetPercentageRecomened(fData);
        
        if (ieRecExists) {
          isRecomendedExists = true;

        } else {
          isRecomendedExists = false;

        }
      }
    }
    if(isRecomendedExists) {
      let percentage = 100 - per;
      set_recommendedPercentage(percentage);
    } else {
      set_recommendedPercentage(0);
    }

  }

  const updateRecFoodData = (textValue, id, index) => {

    if(!isNaN(+textValue) === false) {
      createPopup('Alert', 'Please enter valid amount', true);
      return;
    }
    
    let tempRec = foodHistoryIntakeObj.recommondedDiet[index];

    if (id === 1) {
      tempRec.FOOD_OFFERED = textValue;
      foodHistoryIntakeObj.recommondedDiet[index].percentageRecord = '';
      tempRec.PERCENT_CONSUMED = '';
      tempRec.FOOD_CONSUMED = '';
      tempRec.PERCENT_VALUE= 0;
    } else if (id === 2) {

      if (textValue && parseInt(textValue) > 0) {
        foodHistoryIntakeObj.recommondedDiet[index].percentageRecord = textValue;
        tempRec.PERCENT_CONSUMED = textValue;
      } else {
        set_recommendedPercentage(0)
      }

      let tempValue;
      if(tempRec.FOOD_OFFERED || tempRec.FOOD_OFFERED > 0) {
        tempValue = (parseFloat(textValue)/parseFloat(tempRec.FOOD_OFFERED)) * 100;
        let deciValue = tempValue;
        deciValue = deciValue.toFixed(3)
        tempRec.PERCENT_VALUE = parseFloat(deciValue);
      }

      if (parseFloat(tempRec.FOOD_OFFERED) < parseFloat(textValue)) {
        tempRec.FOOD_CONSUMED = '';
        tempRec.PERCENT_VALUE= 0;
        createPopup('Alert', 'Consumed Amount cannot be greater than Offered amount', true);
      } else {
        tempRec.FOOD_CONSUMED = textValue;
      }

      let conPer = consumedPercentage(foodHistoryIntakeObj.otherFoods);
      if (conPer) {

        if (conPer > 100) {
          foodHistoryIntakeObj.recommondedDiet[index].percentageRecord = '';
          tempRec.PERCENT_CONSUMED = '';
          tempRec.FOOD_CONSUMED = '';
          set_popupAlert("Alert");
          set_popupMsg("Total Percentage is more than 100%");
          set_isPopUp(true);
        } else {
          if (!isgetPercentageRecomened(foodHistoryIntakeObj)) {
            set_recommendedPercentage(0);
          } else {
            set_recommendedPercentage(100 - conPer);
          }
        }
        set_totalPercentage(parseInt(totalPercentage) + parseInt(textValue))

      } else {
        if (!isgetPercentageRecomened(foodHistoryIntakeObj)) {
          set_recommendedPercentage(0);
        } else {
          set_recommendedPercentage(100);
        }

        set_totalPercentage(100);
      }

    } else if (id === 3) {
      tempRec.FEED_UNITS = textValue
    } else if (id === 4) {

      // if (textValue && parseInt(textValue) > 0) {
      //   foodHistoryIntakeObj.recommondedDiet[index].percentageRecord = textValue;
      //   tempRec.PERCENT_CONSUMED = textValue;
      // } else {
      //   set_recommendedPercentage(0)
      // }

      let tempValue;
      if(tempRec.FOOD_OFFERED || tempRec.FOOD_OFFERED > 0) {
        tempValue = parseFloat(tempRec.FOOD_OFFERED) / 100
        tempRec.PERCENT_VALUE = textValue;
        let deciValue = textValue * tempValue;
        deciValue = deciValue.toFixed(3)
        tempRec.FOOD_CONSUMED = parseFloat(deciValue);
      }

    }

    foodHistoryIntakeObj.recommondedDiet[index] = tempRec;
    set_foodHistoryIntakeObj(foodHistoryIntakeObj);

    if (isRecEdit === 1) {
      set_isRecEdit(-1)
    } else {
      set_isRecEdit(1)
    }

  };

  const addDeleteAction = (value, item, index, parentItem) => {

    if (foodHistoryIntakeObj && foodHistoryIntakeObj.otherFoods && foodHistoryIntakeObj.otherFoods.length > 0) {

      let temp = foodHistoryIntakeObj.otherFoods[parentItem].foofDetails;
      if (value === 2) {
        temp.push({
          "FOOD_NAME": '',
          "PERCENT_CONSUMED": null,
          "QUANTITY_CONSUMED": null,
          "QUANTITY_UNIT_ID": null,
          "QUANTITY_CONSUMED_NEW":null,
          "UNIT": "kcal/cup",
          "isDeleted":0,
          "FOODHISTORY_ID": 0,
          "QUANTITY_CONSUMED_UNIT" : "grams",
          "QUANTITY_CONSUMED_UNIT_ID" : 3,
        })
      } else {

        let fHID = foodHistoryIntakeObj.otherFoods[parentItem].foofDetails[index].FOODHISTORY_ID

        if(foodEditObj.current && fHID && fHID > 0){
          let tempObj = {
            "FOOD_NAME": foodHistoryIntakeObj.otherFoods[parentItem].foofDetails[index].FOOD_NAME,
            "PERCENT_CONSUMED": foodHistoryIntakeObj.otherFoods[parentItem].foofDetails[index].PERCENT_CONSUMED,
            "QUANTITY_CONSUMED": foodHistoryIntakeObj.otherFoods[parentItem].foofDetails[index].QUANTITY_CONSUMED,
            "QUANTITY_UNIT_ID": foodHistoryIntakeObj.otherFoods[parentItem].foofDetails[index].QUANTITY_UNIT_ID,
            "UNIT": foodHistoryIntakeObj.otherFoods[parentItem].foofDetails[index].UNIT,
            "FOODHISTORY_ID": foodHistoryIntakeObj.otherFoods[parentItem].foofDetails[index].FOODHISTORY_ID,
            "OTHER_FOOD_ID":foodHistoryIntakeObj.otherFoods[parentItem].otherFoodId,
            "OTHER_FOOD_TYPE" : foodHistoryIntakeObj.otherFoods[parentItem].otherFoodType,
            "QUANTITY_CONSUMED_NEW": foodHistoryIntakeObj.otherFoods[parentItem].foofDetails[index].QUANTITY_CONSUMED_NEW,
            "QUANTITY_CONSUMED_UNIT" : foodHistoryIntakeObj.otherFoods[parentItem].foofDetails[index].QUANTITY_CONSUMED_UNIT,
            "QUANTITY_CONSUMED_UNIT_ID" : foodHistoryIntakeObj.otherFoods[parentItem].foofDetails[index].QUANTITY_CONSUMED_UNIT_ID,
            "isDeleted":1
          }

          deleteEditFoodObj.current.push(tempObj);
          
        } 

        temp = [...foodHistoryIntakeObj.otherFoods[parentItem].foofDetails];
        temp.splice(index, 1);

      }
      foodHistoryIntakeObj.otherFoods[parentItem].foofDetails = temp;

      set_foodHistoryIntakeObj(foodHistoryIntakeObj);

      if (isItemAdded === -1) {
        set_isItemAdded(1)
      } else {
        set_isItemAdded(-1)
      }

      // tempRec.PERCENT_CONSUMED = textValue;
      var perTotal = 0;
      for (var foodItemIndex = 0; foodItemIndex < foodHistoryIntakeObj.otherFoods[parentItem].foofDetails.length; foodItemIndex++) {
        let objTempFoodDetails = foodHistoryIntakeObj.otherFoods[parentItem].foofDetails[foodItemIndex];
        if (objTempFoodDetails.PERCENT_CONSUMED && objTempFoodDetails.PERCENT_CONSUMED != "") {
          perTotal += parseFloat(objTempFoodDetails.PERCENT_CONSUMED);
        }
      }
      foodHistoryIntakeObj.otherFoods[parentItem].percentageRecord = perTotal;
      let conPer = consumedPercentage(foodHistoryIntakeObj.otherFoods);

      if (conPer) {

          if (!isgetPercentageRecomened(foodHistoryIntakeObj)) {
            set_recommendedPercentage(0);
          } else {
            set_recommendedPercentage(100 - conPer);
          }
        
        set_totalPercentage(parseInt(totalPercentage))

      } else {
        if (!isgetPercentageRecomened(foodHistoryIntakeObj)) {
          set_recommendedPercentage(0);
        } else {
          set_recommendedPercentage(100);
        }

        set_totalPercentage(100);
      }
    }

  };

  const enableOtherFoodAction = () => {
    set_isOtherFood(!isOtherFood);
  };

  const actionOnOptiontype = async (value,item) => {
    set_isListView(!isListView);
    if(value === 100) {
      updateOtherFoodItems(item.unit, 6, isDropConsumed.index, isDropConsumed.parentItemIndex, item.unitId);
    } else if(value === 101) {
      updateOtherFoodItems(item.unit, 4, isDropSelected.index, isDropSelected.parentItemIndex, item.unitId);
    }
    
  };

  const updateOtherUnitsActions = (value,item, index, parentItemIndex, pArray) => {

    if(value == 100) {
      set_isDropConsumed({ "index": index, "parentItemIndex": parentItemIndex });
      set_isCalDrop(false);
      set_isConsumedDrop(true)
    } else if(value == 101) {
      set_isConsumedDrop(false)
      set_isCalDrop(true);
      set_isDropSelected({ "index": index, "parentItemIndex": parentItemIndex });
    }
    set_isListView(true);

  };

  const selectFeedbackOptionsAction = (item, index, parentItemIndex) => {

    let tempRec = foodHistoryIntakeObj.dietFeedback[parentItemIndex];

    if (tempRec.feedbackOptions && tempRec.feedbackOptions.length > 0) {

      for (let i = 0; i < tempRec.feedbackOptions.length; i++) {

        if (i === index) {
          tempRec.feedbackOptions[i].selctedIndex = index + 1;
          if(index+1 === 6) {
            tempRec.isOthers = true;
            // tempRec.otherText = '';
          }
          
        } else {
          tempRec.feedbackOptions[i].selctedIndex = null;
          tempRec.isOthers = false;
          tempRec.otherText = '';
          
        }

      }
    }

    foodHistoryIntakeObj.dietFeedback[parentItemIndex].feedbackOptions = tempRec.feedbackOptions;
    // set_foodHistoryIntakeObj(foodHistoryIntakeObj);

    if (isRecEdit === 1) {
      set_isRecEdit(-1)
    } else {
      set_isRecEdit(1)
    }
  };

  const upDateFeedbackOtherTextAction = (item, index,value) => {

    let tempRec = foodHistoryIntakeObj.dietFeedback[index];
    tempRec.otherText = value;
    foodHistoryIntakeObj.dietFeedback[index] = tempRec;

    if (isRecEdit === 1) {
      set_isRecEdit(-1)
    } else {
      set_isRecEdit(1)
    }
  };

  const dateTopBtnAction = () => {
    set_isDateVisible(!isDateVisible);
  };

  const dateSelectAction = (dte) => {
    set_selectedDate(dte);
    let dateStr = moment(dte).format('YYYY-MM-DD')
    getFoodIntakeConfigDataApi(petObj.petID, dateStr);
  };

  const cancelDrop = () => {
    set_isListView(undefined);
  }

  return (
    <FoodIntakeUI
      isLoading={isLoading}
      noLogsShow={noLogsShow}
      isPopUp={isPopUp}
      popupMsg={popupMsg}
      popupAlert={popupAlert}
      isEdit={isEdit}
      isItemAdded={isItemAdded}
      foodHistoryIntakeObj={foodHistoryIntakeObj}
      isOtherFood={isOtherFood}
      isListView={isListView}
      optionsArray={optionsArray}
      optionsOtherArray={optionsOtherArray}
      isOtherList={isOtherList}
      isFeedback={isFeedback}
      isDateVisible={isDateVisible}
      isRecFood={isRecFood}
      selectedDate={selectedDate}
      otherFoodUnitsArray={otherFoodUnitsArray}
      consumedUnitsArray = {consumedUnitsArray}
      foodEditObj = {foodEditObj.current}
      isCalDrop = {isCalDrop}
      isConsumedDrop = {isConsumedDrop}
      recommendedPercentage={recommendedPercentage}
      navigateToPrevious={navigateToPrevious}
      nextButtonAction={nextButtonAction}
      popOkBtnAction={popOkBtnAction}
      updateOtherFoodItems={updateOtherFoodItems}
      updateRecFoodData={updateRecFoodData}
      addDeleteAction={addDeleteAction}
      enableOtherFoodAction={enableOtherFoodAction}
      actionOnOptiontype={actionOnOptiontype}
      updateOtherUnitsActions={updateOtherUnitsActions}
      selectFeedbackOptionsAction={selectFeedbackOptionsAction}
      dateTopBtnAction={dateTopBtnAction}
      dateSelectAction={dateSelectAction}
      cancelDrop={cancelDrop}
      upDateFeedbackOtherTextAction = {upDateFeedbackOtherTextAction}
    />
  );

}

export default FoodIntakeComponent;