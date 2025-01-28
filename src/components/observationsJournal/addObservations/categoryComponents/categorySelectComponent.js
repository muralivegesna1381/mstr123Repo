import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import CategorySelectUI from './categorySelectUI';
import * as ObservationModel from "./../../observationModel/observationModel.js";

let trace_inAddCategoryScreen;

const CategorySelectComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [date, set_Date] = useState(new Date());
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [behavioursData, set_behavioursData] = useState(undefined);

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

      let oJson = ObservationModel.observationData;
      set_selectedIndex(oJson.ctgNameId);
      if(oJson.ctgNameId === 0 || oJson.ctgNameId === 1) {
        set_isBtnEnable(true);
      }

    };
      
    const nextButtonAction = async () => {

      if(selectedIndex !== ObservationModel.observationData.ctgNameId) {
        ObservationModel.observationData.mediaArray = [];
        ObservationModel.observationData.obserItem = Object;
        ObservationModel.observationData.behaviourItem = Object;
      }
      ObservationModel.observationData.ctgNameId = selectedIndex;

      firebaseHelper.logEvent(firebaseHelper.event_add_category_nxt_btn, firebaseHelper.screen_add_observations_Category, "User selected Category type", 'Breed Id : ' + ObservationModel.observationData.ctgNameId);
      navigation.navigate('ObservationComponent');

    };

    const backBtnAction = () => {
      navigation.pop();
    };

    const selectCategory = (categoryType, index) => {

      set_isBtnEnable(true);
      ObservationModel.observationData.ctgName = categoryType;
      set_selectedIndex(index);

    };

  return (
    <CategorySelectUI
      isBtnEnable = {isBtnEnable}
      selectedIndex = {selectedIndex}
      behavioursData = {behavioursData}
      selectCategory = {selectCategory}
      nextButtonAction = {nextButtonAction}
      backBtnAction = {backBtnAction}
    ></CategorySelectUI>
  );
}

export default CategorySelectComponent;