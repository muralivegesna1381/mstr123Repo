import React, { useState, useEffect } from 'react';
import {View,BackHandler} from 'react-native';
import AddOBSSelectPetUI from './addOBSSelectePetUI';
import * as internetCheck from "./../../../../utils/internetCheck/internetCheck";
import * as Constant from "./../../../../utils/constants/constant";
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as ObservationModel from "./../../observationModel/observationModel.js"

let trace_inObservationsList;

const  AddOBSSelectPetComponent = ({navigation, route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [selectedPet, set_selectedPet] = useState(undefined);
    const [nxtBtnEnable, set_nxtBtnEnable] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [selectedPName, set_selectedPName] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    // Initial the class. Gets the pets list
    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick); 
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            observationSelectPetStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_add_observations_pets);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_add_observations_pets, "User in Add Observations Pets Selection Screen", '');
        });

        const unsubscribe = navigation.addListener('blur', () => {
            observationSelectPetStop();
        });
    
        return () => {
            observationSelectPetStop();
            focus();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
      }, []);

      // setting the values to local variables - Pets need to be shown
    useEffect(() => {

        if(route.params?.petsArray){

            let petsArray = getUnique(route.params?.petsArray, 'petID');
            set_petsArray(petsArray);

            if(route.params?.defaultPetObj){
                for (let i=0; i < petsArray.length; i++){
                    if(petsArray[i].petID === route.params?.defaultPetObj.petID){
                        set_selectedPet(petsArray[i]);
                        set_selectedIndex(i);
                        set_selectedPName(petsArray[i].petName)
                        set_nxtBtnEnable(true);                    
                    }
                }
            }
        }

    }, [route.params?.petsArray,route.params?.defaultPetObj]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    // removes the duplicate objects from the Pets array
    function getUnique(petArray, index) {
        const uniqueArray = petArray.map(e => e[index]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => petArray[e]).map(e => petArray[e]);
        return uniqueArray;
    };

    // Firebase traces
    const observationSelectPetStart = async () => {
        trace_inObservationsList = await perf().startTrace('t_inAddObservationSelectPet');
    };
    
    const observationSelectPetStop = async () => {
        await trace_inObservationsList.stop();
    };

      // Moves to next screen and checks Internet connectivity
    const submitAction = async () => {

        let newPet = selectedPet;
        let existingPet = ObservationModel.observationData.selectedPet;

        if (newPet && existingPet) {

            if(newPet.petID !== existingPet.petID) {

                let obj = {
                    "selectedPet" : Object, 
                    "fromScreen" : String, 
                    "isPets" : Boolean, 
                    "isEdit" : Boolean,
                    "obsText" : String,
                    "obserItem" : Object,
                    "selectedDate" : String,
                    "mediaArray" : Array,
                    "behaviourItem" : Object,
                    "observationId" : Number,
                    "ctgNameId" : Number,
                    "ctgName" : String,
                    "quickVideoFileName" : String
                  }
                  ObservationModel.observationData = obj;
                  ObservationModel.observationData.selectedDate = new Date();

            }

        }

        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_add_observations_pet_selection, firebaseHelper.screen_add_observations_pets, "Pet selection to add observation", 'Pet Id : '+selectedPet ? selectedPet.petID : '');
        if(!internet){
            set_popUpAlert(Constant.ALERT_NETWORK);
            set_popUpMessage(Constant.NETWORK_STATUS);
            set_isPopUp(true);
        } else {

            let obj = ObservationModel.observationData;
            let fileName = '';

            if(selectedPet && obj && obj.fromScreen && obj.fromScreen === "quickVideo") {
                let petId = selectedPet.petID;
                let pName = selectedPet.petName.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '');
                pName = pName.length > 15 ? pName.substring(0, 15) : pName;
                let sName = selectedPet.studyName.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '');
                sName = sName !== "" ? (sName.length > 20 ? sName.substring(0, 20) : sName) : "NOSTUDY";

                if (selectedPet && selectedPet.devices && selectedPet.devices.length > 0) {
              
                    let devNumber = selectedPet.devices[0].deviceNumber.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '')
                    fileName = pName + '_' + petId + '_' + sName+ '_' + devNumber+ '_' + obj.quickVideoDateFile;
 
                } else {
                    fileName = pName + '_' + petId + '_' + sName + '_' + 'NO DEVICE' + '_' + obj.quickVideoDateFile;
                }

                ObservationModel.observationData.mediaArray[0].fileName = fileName;
                ObservationModel.observationData.quickVideoFileName = fileName;

            }

            ObservationModel.observationData.selectedPet = selectedPet;
            ObservationModel.observationData.isPets = true;

            if(ObservationModel.observationData.fromScreen === "quickVideo") {
                navigation.navigate('ObservationComponent');
            } else {
                navigation.navigate('CategorySelectComponent');
            }
            
        }
        
    }

    // Navigates to previous screen
    const navigateToPrevious = () => {      
        
        // if(ObservationModel.observationData === 'quickVideo'){
        //     navigation.navigate('QuickVideoComponent');  
        // } else {
        //     navigation.navigate('ObservationsListComponent');  
        // }
        navigation.goBack()
          
    }

    // In search dropdown, After selecting the pet sets the pet to observation
    const selectPetAction = (item) => {
        set_selectedPet(item);
        set_nxtBtnEnable(true);
    };

    // Popup Actions
    const popOkBtnAction = () => {
        set_popUpAlert(undefined);
        set_popUpMessage(undefined);
        set_isPopUp(false);
    };

    return (
        <AddOBSSelectPetUI 
            petsArray = {petsArray}
            nxtBtnEnable = {nxtBtnEnable}
            selectedIndex = {selectedIndex}
            selectedPName = {selectedPName}
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            isPopUp = {isPopUp}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            selectPetAction = {selectPetAction}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default AddOBSSelectPetComponent;