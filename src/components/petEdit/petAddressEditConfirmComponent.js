import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import PetAddressEditConfrimUI from './petAddressEditConfrimUI';

let trace_inPetAddress_Confirmation_Screen;

const PetAddressEditConfirmComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [petParentObj, set_petParentObj] = useState(undefined);
    const [petObj, set_petObj] = useState(undefined);
    const [petAddress, set_petAddress] = useState(undefined);
    const [petParentAddress, set_petParentAddress] = useState(undefined);
    const [date, set_date] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [addressType,  set_addressType] = useState(undefined);
    const [isPetWithParent, set_isPetWithParent] = useState(false);

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            
            set_date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_petLocation_selection_screen);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_petLocation_selection_screen, "User in PetAddressEditConfirmComponent Screen", '');
            preparePetParentDetails();
            if (route.params?.petObject) {
                set_petObj(route.params?.petObject);
                preparePetDetails(route.params?.petObject);
            }
            
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

    }, [route.params?.petObject]);

    const initialSessionStart = async () => {
        trace_inPetAddress_Confirmation_Screen = await perf().startTrace('t_inPetAddressConfirmationScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetAddress_Confirmation_Screen.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const navigateToPrevious = () => {  
        navigation.navigate('PetEditComponent');
    };
   
    const preparePetDetails = async (petObject) => {

        if(petObject) {
            set_isPetWithParent(petObject.isPetWithPetParent);
            set_petName(petObject.petName);
        }
        
        if(petObject && Object.keys(petObject.petAddress).length !==0 ) {

            let tempAdd2 = '';
            if(petObject.petAddress.address2 !=='' && petObject.petAddress.address2) {
                tempAdd2 = petObject.petAddress.address2 + ', '
            }
            let tempAdd = petObject.petAddress.address1+ ', ' 
              + tempAdd2 
              + petObject.petAddress.city + ', ' 
              + petObject.petAddress.state+ ', '
              + petObject.petAddress.country+ ', '
              + petObject.petAddress.zipCode;
            set_petAddress(tempAdd);
            
        }

    };

    const preparePetParentDetails = async () => {

        let pParentObj = await DataStorageLocal.getDataFromAsync(Constant.PET_PARENT_OBJ);
        pParentObj = JSON.parse(pParentObj);
        if(pParentObj) {
            set_petParentObj(pParentObj);  
            if(pParentObj.address&& Object.keys(pParentObj.address).length !==0) {
                
                let tempAdd2 = '';
                if(pParentObj.address.address2 !=='' && pParentObj.address.address2) {
                    tempAdd2 = pParentObj.address.address2 + ', '
                }
                let tempAdd = pParentObj.address.address1+ ', ' 
              + tempAdd2 
              + pParentObj.address.city + ', ' 
              + pParentObj.address.state+ ', '
              + pParentObj.address.country+ ', '
              + pParentObj.address.zipCode;
              set_petParentAddress(tempAdd);
            }     
        }

    };

    const selectAddressAction = (typeAddress, index) => {
        set_isBtnEnable(true);
        set_selectedIndex(index);
        set_addressType(typeAddress);
    };

    const nextButtonAction = () => {
        firebaseHelper.logEvent(firebaseHelper.event_PLocation_Selection_btn, firebaseHelper.screen_petLocation_selection_screen, "User in PetAddressEditConfirmComponent selection Screen", 'isPetWithPetParent : ' + addressType);
        navigation.navigate('PetAddressEditComponent',{petParentObj : petParentObj, petObj : petObj,isFromScreen:'petEditConfirm', isPetWithPetParent : addressType && addressType === 'same' ? true : false,isEditable : addressType && addressType === 'same' ? false : true});
    };

    return (

        <PetAddressEditConfrimUI
            petName = {petName}
            petAddress = {petAddress}
            petParentAddress = {petParentAddress}
            isBtnEnable = {isBtnEnable}
            selectedIndex = {selectedIndex}
            isPetWithParent = {isPetWithParent}
            navigateToPrevious = {navigateToPrevious}
            selectAddressAction = {selectAddressAction}
            nextButtonAction = {nextButtonAction}
        />
        
    );
}

export default PetAddressEditConfirmComponent;