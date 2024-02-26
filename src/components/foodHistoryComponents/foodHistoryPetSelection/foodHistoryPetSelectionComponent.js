import React, { useState, useEffect } from 'react';
import {View,BackHandler} from 'react-native';
import FoodHistoryPetSelectionUI from './foodHistoryPetSelectionUI';
import * as firebaseHelper from '../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inFoodPetSelScreen;

const  FoodHistoryPetSelectionComponent = ({navigation, route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [selectedPet, set_selectedPet] = useState(undefined);
    const [nxtBtnEnable, set_nxtBtnEnable] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [selectedPName, set_selectedPName] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isKeboard, set_isKeboard] = useState(undefined);

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', navigateToPrevious);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_Food_Pet_Sel);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_Food_Pet_Sel, "User in Food History Pet Selection Screen", '');
        });

        return () => {
            focus();
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', navigateToPrevious);
        };

    }, []);

     useEffect(() => {

         if(route.params?.petsArray){

            if(route.params?.defaultPetObj){
                set_defaultPetObj(route.params?.defaultPetObj);
             }
            let duplicates = getUnique(route.params?.petsArray, 'petID');
            set_petsArray(duplicates);
            if(duplicates && route.params?.defaultPetObj){

                let temPet = undefined;
                let ind = 0
                for (let i=0; i < duplicates.length; i++){
                    if(duplicates[i].petID === route.params?.defaultPetObj.petID){
                        temPet = duplicates[i]
                        ind = i;
                        break                
                    }
                }

                if (temPet) {
                    set_selectedPet(temPet);
                    set_selectedIndex(ind);
                    set_selectedPName(temPet.petName);
                    set_nxtBtnEnable(true); 
                } else {
                    set_selectedPet(route.params?.petsArray[0]);
                    set_selectedIndex(0);
                    set_selectedPName(route.params?.petsArray[0].petName);
                    set_nxtBtnEnable(true); 
                }
            } else {

                set_selectedPet(route.params?.petsArray[0]);
                set_selectedIndex(0);
                set_selectedPName(route.params?.petsArray[0].petName);
                set_nxtBtnEnable(true); 

            }
         }

    }, [route.params?.petsArray,route.params?.defaultPetObj]);

    const initialSessionStart = async () => {
        trace_inFoodPetSelScreen = await perf().startTrace('t_inFoodPetSelectionScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inFoodPetSelScreen.stop();
    };

    // removes the duplicate objects from the Pets array
    function getUnique(petArray, index) {
        const uniqueArray = petArray.map(e => e[index]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => petArray[e]).map(e => petArray[e]);
        return uniqueArray;
    };

    const submitAction = () => {
        
        navigation.navigate("FoodIntakeMainComponent",{petObject:selectedPet});
        if(isKeboard === false) {
            set_isKeboard(undefined);
        } else {
            set_isKeboard(false);
        }
    };

    const navigateToPrevious = () => {        
       navigation.pop();     
    };

    function getIndex( arr,value) {
        for(var i = 0; i < arr.length; i++) {
            if(arr[i].petID === value) {
                return i;
            }
        }
        return -1; //to handle the case where the value doesn't exist
    }

    const selectPetAction = (item) => {
        
        if(item && item.petID) {
            var index = getIndex(petsArray,item.petID)
            set_selectedPet(item);
            set_selectedIndex(index);
            set_selectedPName(item.petName);
            set_nxtBtnEnable(true);
        }
        
    };

    return (
        <FoodHistoryPetSelectionUI 
            petsArray = {petsArray}
            defaultPetObj = {defaultPetObj}
            nxtBtnEnable = {nxtBtnEnable}
            selectedIndex = {selectedIndex}
            selectedPName = {selectedPName}
            isKeboard = {isKeboard}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            selectPetAction = {selectPetAction}
        />
    );

  }
  
  export default FoodHistoryPetSelectionComponent;