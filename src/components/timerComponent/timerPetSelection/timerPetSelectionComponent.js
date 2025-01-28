import React, { useState, useEffect } from 'react';
import {View,BackHandler} from 'react-native';
import TimerPetSelectionUI from './timerPetSelectionUI';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inTimerPetSelScreen;

const  TimerPetSelectionComponent = ({navigation, route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [selectedPet, set_selectedPet] = useState(undefined);
    const [nxtBtnEnable, set_nxtBtnEnable] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [selectedPName, set_selectedPName] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isKeboard, set_isKeboard] = useState(undefined);

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_timer_pets);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_timer_pets, "User in Timer Pets Selection Screen", '');
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            initialSessionStop();
            focus();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

     useEffect(() => {

         if(route.params?.petsArray && route.params?.defaultPetObj){
            prepareTimerPets(route.params?.petsArray,route.params?.defaultPetObj)
         }

    }, [route.params?.petsArray,route.params?.defaultPetObj]);

    const prepareTimerPets = async (petsArray,defaultPetObj) => {
        
        let duplicates = getUnique(petsArray, 'petID');
        set_petsArray(duplicates);

        let petItem = undefined;
        let indeXValue = 0;
        if(duplicates && defaultPetObj){
            for (let i=0; i < duplicates.length; i++){
                if(duplicates[i].petID === defaultPetObj.petID){

                    petItem = duplicates[i];
                    indeXValue = i;
                                          
                }
            }
        }

        if(petItem) {
            set_selectedPet(petItem);
            set_selectedPName(petItem.petName);
            set_defaultPetObj(petItem);
        } else {
            set_selectedPet(duplicates[0]);
            set_selectedPName(duplicates[0].petName);
            set_defaultPetObj(duplicates[0]);
        }
            
        set_selectedIndex(indeXValue);
        set_nxtBtnEnable(true);  

    }
  
    const handleBackButtonClick = () => {
        //   navigateToPrevious();
          return true;
    };

    const initialSessionStart = async () => {
        trace_inTimerPetSelScreen = await perf().startTrace('t_inTimerPetSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inTimerPetSelScreen.stop();
    };

    // removes the duplicate objects from the Pets array
    function getUnique(petArray, index) {
        const uniqueArray = petArray.map(e => e[index]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => petArray[e]).map(e => petArray[e]);
        return uniqueArray;
    };

    const submitAction = () => {
        if(isKeboard === false) {
            set_isKeboard(undefined);
        } else {
            set_isKeboard(false);
        }
        firebaseHelper.logEvent(firebaseHelper.event_timer_selected_pet, firebaseHelper.screen_timer_activity, "User selected Pet for Timer ", "Pet Id : "+selectedPet ? selectedPet.petID : '');
        navigation.navigate('TimerActivityComponent',{timerPet : selectedPet});
    };

    const navigateToPrevious = () => {        
       navigation.navigate('TimerComponent');     
    };

    const selectPetAction = (item) => {
      // set_selectedPet(item);
       set_nxtBtnEnable(true);
       
        if(petsArray && item){
            for (let i=0; i < petsArray.length; i++){
                if(petsArray[i].petID === item.petID){
                    set_selectedPet(petsArray[i]);
                    set_selectedIndex(i);
                    set_selectedPName(petsArray.petName);
                    set_nxtBtnEnable(true);                    
                }
            }
        }
    };

    return (
        <TimerPetSelectionUI 
            petsArray = {petsArray}
            defaultPetObj = {defaultPetObj}
            nxtBtnEnable = {nxtBtnEnable}
            selectedIndex = {selectedIndex}
            selectedPName = {selectedPName}
            isKeboard = {isKeboard}
            selectedPet = {selectedPet}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            selectPetAction = {selectPetAction}
        />
    );

  }
  
  export default TimerPetSelectionComponent;