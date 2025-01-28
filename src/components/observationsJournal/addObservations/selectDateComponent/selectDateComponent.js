import React, { useState } from 'react';
import {BackHandler} from 'react-native';
import SelectDateUI from './selectDateUI';
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as ObservationModel from "./../../observationModel/observationModel.js";

let trace_inAddObservationSelectDate;

const  SelectDateComponent = ({navigation, route, ...props }) => {

  const [date, set_Date] = useState(new Date());
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

    let oJson = ObservationModel.observationData;
    set_mediaType(oJson.ctgNameId); 
    // oJson.ctgNameId ? set_mediaType(oJson.ctgNameId) : set_mediaType(undefined);
    oJson.selectedDate && oJson.selectedDate !=='' ? set_selectedDate(oJson.selectedDate) : set_selectedDate(new Date());
    set_selectedDate(oJson.selectedDate)

  };

  const submitAction = async (selDate) => {

    set_selectedDate(selDate);
    var dte = new Date(selDate);
    ObservationModel.observationData.selectedDate = dte;
    firebaseHelper.logEvent(firebaseHelper.event_add_observations_date_submit, firebaseHelper.screen_add_observations_date, "User Selected Date for Observation", 'Date : '+selDate);
    if(ObservationModel.observationData.fromScreen === 'quickVideo') {
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