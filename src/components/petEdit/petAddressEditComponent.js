import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import PetAddressEditUI from './petAddressEditUI';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';

let trace_inPetAddressEditScreen;
const Address_Save_Id = 1;

const PetAddressEditComponent = ({ navigation, route, ...props }) => {

    const [date, set_Date] = useState(new Date());
    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(true);
    const [addLine1, set_addLine1] = useState(undefined);
    const [addLine2, set_addLine2] = useState(undefined);
    const [city, set_city] = useState(undefined);
    const [state, set_state] = useState(undefined);
    const [zipCode, set_zipCode] = useState(undefined);
    const [country, set_country] = useState(undefined);
    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpAlert, set_popUpAlert] = useState('Alert');
    const [isPetWithPP, set_isPetWithPP] = useState(false);
    const [petParentObj, set_petParentObj] = useState(undefined);
    const [petObj, set_petObj] = useState(undefined);
    const [popupId, set_popupId] = useState(undefined);
    const [isEditable, set_isEditable] = useState(false);
    const [addressMOBJ, set_addressMOBJ] = useState(false);
    const [invalidAddress, set_invalidAddress] = useState(null);
    const [showAddressFields, set_showAddressFields] = useState(false);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let inValid = useRef(false);

    React.useEffect(() => {
        
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_petAddress_EditComponent_screen);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_petAddress_EditComponent_screen, "User in PetAddressEditComponent Screen", '');
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

        if (route.params?.isFromScreen) {
            set_isFromScreen(route.params?.isFromScreen);
            prepareAddressDetails(route.params?.isFromScreen, route.params?.petParentObj, route.params?.petObj, route.params?.isPetWithPetParent,route.params?.isEditable);
        }

        if (route.params?.petParentObj) {
            set_petParentObj(route.params?.petParentObj);
        }

        if (route.params?.petObj) {
            set_petObj(route.params?.petObj)
        }

        if(route.params?.showAddressFields) {
            set_showAddressFields(route.params?.showAddressFields);
        }
    
      }, [route.params?.isFromScreen, route.params?.petParentObj, route.params?.petObj, route.params?.isPetWithPetParent,route.params?.isEditable,route.params?.showAddressFields]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetAddressEditScreen = await perf().startTrace('t_inPetAddressEditComponentScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetAddressEditScreen.stop();
    };

    const prepareAddressDetails = async (isFrom,petParentObj,petObj,isPetWithParent,isEditable) => {

        set_isEditable(isEditable);
        if(isPetWithParent) {
            if(petParentObj && petParentObj.address && Object.keys(petParentObj.address).length !== 0) {
                set_isNxtBtnEnable(true);
                setaddressValues(petParentObj.address,isPetWithParent);
            }

        } else {
            if(petObj && petObj.petAddress && Object.keys(petObj.petAddress).length !== 0) {
                set_isNxtBtnEnable(true);
                setaddressValues(petObj.petAddress,isPetWithParent)
            }

        }

    };

    const setaddressValues = (pObj,isPetWithParent) => {

        set_addLine1(pObj.address1);
        set_addLine2(pObj.address2);
        set_city(pObj.city);
        set_state(pObj.state);
        set_zipCode(pObj.zipCode);
        set_country(pObj.country);
        set_isPetWithPP(isPetWithParent); 
        
        if(isPetWithParent) {

            let addObj = {
                "addressId" : pObj.addressId,
                "address1" : pObj.address1,
                "address2" : pObj.address2,
                "city" : pObj.city,
                "state" : pObj.state,
                "country" : pObj.country,
                "zipCode" : pObj.zipCode,
                "timeZoneId" : pObj.timeZoneId,
                "timeZone" : pObj.timeZone,
                "addressType" : 1,
                "isPreludeAddress" : 0
           }

           set_addressMOBJ(addObj)

        }
        

    };

    const validatePetParentAddress = async (address) => {

        let addObj = {
            "address":address
        }
        set_isLoading(true);
        isLoadingdRef.current = 1;

        let apiMethod = apiMethodManager.VALIDATE_ADDRESS;
        let apiService = await apiRequest.postData(apiMethod,addObj,Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {

            if(apiService.data.isValidAddress === 1 && apiService.data.address) {

                let addObj = {
                    "addressId" : null,
                    "address1" : apiService.data.address.address1,
                    "address2" : '',
                    "city" : apiService.data.address.city,
                    "state" : apiService.data.address.state,
                    "country" : apiService.data.address.country,
                    "zipCode" : apiService.data.address.zipCode,
                    "timeZoneId" : apiService.data.address.timeZone.timeZoneId,
                    "timeZone" : apiService.data.address.timeZone.timeZoneName,
                    "addressType" : 1,
                    "isPreludeAddress" : 0
               }
               set_addressMOBJ(addObj)
                set_addLine1(apiService.data.address.address1);
                set_addLine2('');
                set_city(apiService.data.address.city);
                set_state(apiService.data.address.state);
                set_zipCode(apiService.data.address.zipCode);
                set_country(apiService.data.address.country);
                set_showAddressFields(true);

            } else {

                set_invalidAddress(true);
                firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Validate Address Failed - PetAddressEditComponent", 'Service Status : false');
                createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true,0,1);

            }
          
        } else if(apiService && apiService.isInternet === false) {

            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Validate Address Failed - PetAddressEditComponent", 'No Internet');
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true,0,1);
            return;

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
            
            set_invalidAddress(true);
            createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, true,0,1);
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Validate Address Failed - PetAddressEditComponent", 'error : '+apiService.error.errorMsg);
            
        } else {

            set_invalidAddress(true);
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Validate Address Failed - PetAddressEditComponent", 'Service Status : false');
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true,0,1);
            
        }

    };

    const navigateToPrevious = () => {

        if(isFromScreen === 'petEdit') {
            navigation.navigate('PetEditComponent');
        } else {
            navigation.navigate('PetAddressEditConfirmComponent');
        }
        
    };

    const submitAction = async () => {

        if(addressMOBJ) {
            updateAddress(addressMOBJ);
        }

    };

    const updateAddress = async (addObj) => {

        let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);

        let finalJSON = {
    
            About: {
                PetID: petObj.petID+"",
                PetName: petObj.petName,
                PetBirthday: '2013-05-13',
                PetGender: petObj.gender,
                IsNeutered: ""+petObj.isNeutered,
                PetWeight: petObj.weight ? petObj.weight + "" : '0.1',
                WeightUnit: petObj.weightUnit ? petObj.weightUnit : 'lbs',
                PetBFI: "",
                PetAge: "",
                IsMixed: "false",
                PetBreedID: 1 + "",
                PetBreedName: petObj.petBreed,
                PetMixBreed: "",
                IsUnknown: "false", //// No value from Object
                ExtPatientID: "",
                ExtPatientIDValue: "",
                PetAddress : addObj,
                IsPetWithPetParent : isEditable ? 0 : 1//isPetWithPP ? 1 : 0,
            },
      
            Client: {
                ClientID: clientId+ "",
                ClientEmail: petParentObj.email,
                ClientFullName: petParentObj.fullName,
                ClientFirstName: petParentObj.firstName,
                ClientLastName: petParentObj.lastName,
                ClientPhone: petParentObj.phoneNumber,
            },
        }

        updatePetAddressToBackend(finalJSON);
    };

    const updatePetAddressToBackend = async (finalJSON) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;

        let apiMethod = apiMethodManager.UPDATE_PETINFO;
        let apiService = await apiRequest.postData(apiMethod,finalJSON,Constant.SERVICE_MIGRATED);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        
        if(apiService && apiService.data && apiService.data.Key) {
            createPopup(Constant.ALERT_INFO, 'Pet Address updated Successfully.', true,1,1);

        } else if(apiService && apiService.isInternet === false) {

            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_update_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Update Address Failed - PetAddressEditComponent", 'No Internet');
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true,0,1);
            return;

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
            
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true,0,1);
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_update_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Update Address Failed - PetAddressEditComponent", 'error : '+apiService.error);
            
        } else if(apiService && apiService.logoutError !== null) {             
        }else {

            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true,0,1);
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_update_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Update Address Failed - PetAddressEditComponent", 'error : '+ 'Status Failed');
            
        }

    }

    const createPopup = (title, msg, isPop, popId,refId) => {
        set_popUpAlert(title);
        set_popUpMessage(msg);
        set_isPopUp(isPop);
        set_popupId(popId)
        popIdRef.current = refId;
    };

    const popOkBtnAction = () => {

        if(popupId === Address_Save_Id) {
            navigation.navigate('DashBoardService');
        }
        createPopup('','',false,0,0);
    };

    const getAddress = (address) => {
        validatePetParentAddress(address);
    };

    return (
        <PetAddressEditUI
            addLine1 = {addLine1}
            addLine2 = {addLine2}
            state = {state}
            city = {city}
            zipCode = {zipCode}
            country = {country}
            isPetWithPP = {isPetWithPP}
            isNxtBtnEnable = {isNxtBtnEnable}
            isPopUp = {isPopUp}
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            isLoading ={isLoading}
            isEditable = {isEditable}
            addressMOBJ = {addressMOBJ}
            showAddressFields = {showAddressFields}
            invalidAddress = {inValid.current}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            popOkBtnAction = {popOkBtnAction}
            getAddress = {getAddress}
        />
    );

}

export default PetAddressEditComponent;