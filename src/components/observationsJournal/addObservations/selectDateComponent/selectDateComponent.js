import React, { useState, useEffect } from 'react';
import {BackHandler} from 'react-native';
import SelectDateUI from './selectDateUI';
import * as Constant from "./../../../../utils/constants/constant";
import * as DataStorageLocal from "../../../../utils/storage/dataStorageLocal";
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inAddObservationSelectDate;

const  SelectDateComponent = ({navigation, route, ...props }) => {

  const [fromScreen,set_fromScreen] = useState(undefined);
  const [date, set_Date] = useState(new Date());
  const [obsObject, set_obsObject] = useState(undefined);
  const [selectedDate, set_selectedDate] = useState(new Date());
  const [mediaType, set_mediaType] = useState(undefined);
  
  React.useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      observationsSelectDateStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_add_observations_date);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_add_observations_date, "User in Add Observations Date selection Screen", ''); 
      getObsDetails();
    });

    const unsubscribe = navigation.addListener('blur', () => {
      observationsSelectDateStop();
    });

    return () => {
      observationsSelectDateStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      focus();
      unsubscribe();
    };
  }, [navigation]);

  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  const observationsSelectDateStart = async () => {
    trace_inAddObservationSelectDate = await perf().startTrace('t_inAdd_Obaservation_SelectDate');
  };
  
  const observationsSelectDateStop = async () => {
    await trace_inAddObservationSelectDate.stop();
  };

  const getObsDetails = async () => {
    let oJson = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
    oJson = JSON.parse(oJson);
    if(oJson){
      set_obsObject(oJson);
      set_fromScreen(oJson.fromScreen);
      set_mediaType(oJson.ctgNameId); 
      if(oJson.selectedDate && oJson.selectedDate!==''){
        set_selectedDate(new Date(oJson.selectedDate));
      }
    }
  };

  const submitAction = async (selDate) => {
    let oJson = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
    oJson = JSON.parse(oJson);
    set_selectedDate(selDate);
    var hours = new Date().getHours();
    var min = new Date().getMinutes();
    var sec = new Date().getSeconds();
    var dte = new Date(selDate)
       
    if(oJson) {
      oJson.selectedDate = dte;
    }
    await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ,JSON.stringify(oJson));
    firebaseHelper.logEvent(firebaseHelper.event_add_observations_date_submit, firebaseHelper.screen_add_observations_date, "User Selected Date for Observation", 'Date : '+selDate);
    if(fromScreen === 'quickVideo') {
      navigation.navigate("ObsReviewComponent"); 
    } else {
      navigation.navigate("UploadObsVideoComponent"); 
    }
    
  };

  const navigateToPrevious = () => {        
    navigation.navigate("ObservationComponent");  
    
  };

  return (
    <SelectDateUI 
      selectedDate = {selectedDate}
      mediaType = {mediaType}
      navigateToPrevious = {navigateToPrevious}
      submitAction = {submitAction}
    />
  );

}
  
export default SelectDateComponent;