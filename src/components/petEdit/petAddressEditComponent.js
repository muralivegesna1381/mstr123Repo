import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import PetAddressEditUI from './petAddressEditUI';

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

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

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
    
      }, [route.params?.isFromScreen, route.params?.petParentObj, route.params?.petObj, route.params?.isPetWithPetParent,route.params?.isEditable]);

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

            if(petParentObj && petParentObj.petParentAddress && Object.keys(petParentObj.petParentAddress).length !== 0) {
                set_isNxtBtnEnable(true);
                setaddressValues(petParentObj.petParentAddress,isPetWithParent);
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
    };

    const validatePetParentAddress = async (addLine1Ref,addLine2Ref,cityRef,stateRef,zipCodeRef,countryRef) => {

        let line1 = addLine1Ref.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        let line2 = '';
        if(addLine2Ref && addLine2Ref !== '') {
            line2 = addLine2Ref.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        }

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let seviceString = 'address1='+line1+'&'+'address2='+line2+'&'+'city='+cityRef+'&'+'state='+stateRef+'&'+'country='+countryRef+'&'+'zipCode='+zipCodeRef;
        let addressServiceObj = await ServiceCalls.validateAddress(seviceString);

        if (addressServiceObj && addressServiceObj.logoutData) {
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Validate Address Failed - PetAddressEditComponent", 'User Loged Out - Multiple login');
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }

        if (addressServiceObj && addressServiceObj.invalidData) {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Validate Address Failed - PetAddressEditComponent", 'Invalid Address');
            createPopup(Constant.ALERT_DEFAULT_TITLE, 'Invalid Address', true,0,1);
            return;
        }

        if (addressServiceObj && !addressServiceObj.isInternet) {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Validate Address Failed - PetAddressEditComponent", 'No Internet');
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true,0,1);
            return;
        }

        if (addressServiceObj && addressServiceObj.statusData) {
            
            let addObj = {
                 "addressId" : null,
                 "address1" : line1,
                 "address2" : line2,
                 "city" : cityRef,
                 "state" : stateRef,
                 "country" : countryRef,
                 "zipCode" : zipCodeRef,
                 "timeZoneId" : addressServiceObj.responseData.address.timeZone.timeZoneId,
                 "timeZone" : addressServiceObj.responseData.address.timeZone.timeZoneName,
                 "addressType" : 1,
                 "isPreludeAddress" : 0
            }
            updateAddress(addObj);
        } else {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Validate Address Failed - PetAddressEditComponent", 'Service Status : false');
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true,0,1);
        }

        if (addressServiceObj && addressServiceObj.error) {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true,0,1);
            let errors = addressServiceObj.error.length > 0 ? addressServiceObj.error[0].code : '';
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Validate Address Failed - PetAddressEditComponent", 'error : '+errors);
            
        }

    };

    const navigateToPrevious = () => {

        if(isFromScreen === 'petEdit') {
            navigation.navigate('PetEditComponent');
        } else {
            navigation.navigate('PetAddressEditConfirmComponent');
        }
        
    };

    const submitAction = async (addLine1Ref,addLine2Ref,cityRef,stateRef,zipCodeRef,countryRef) => {

       if(!isPetWithPP && petParentObj.petParentAddress.address1 === addLine1Ref && petParentObj.petParentAddress.address2 === addLine2Ref 
        && petParentObj.petParentAddress.city === cityRef && petParentObj.petParentAddress.zipCode === zipCodeRef 
         && petParentObj.petParentAddress.country === countryRef) {
            createPopup(Constant.ALERT_DEFAULT_TITLE, 'No changes found in the Address', true,0,1);
            return;
        }
       
       if(isPetWithPP && !isEditable) {
        updateAddress(petParentObj.petParentAddress);
       } else {
        validatePetParentAddress(addLine1Ref,addLine2Ref,cityRef,stateRef,zipCodeRef,countryRef);
       }

    };

    const updateAddress = (addObj) => {

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
                ClientID: petParentObj.clientId+ "",
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

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

        set_isLoading(true);
        isLoadingdRef.current = 1;

        let addressServiceObj = await ServiceCalls.updatePetInfo(finalJSON,token);
        set_isLoading(false);
        isLoadingdRef.current = 0;

        if (addressServiceObj && addressServiceObj.logoutData) {
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_update_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Update Address Failed - PetAddressEditComponent", 'Logged out - Multiple logins');
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }
 
        if (addressServiceObj && addressServiceObj.invalidData) {
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_update_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Update Address Failed - PetAddressEditComponent", 'Invalid Address');
            createPopup(Constant.ALERT_DEFAULT_TITLE, 'Invalid Address', true,0,1);
            return;
        }

        if (addressServiceObj && !addressServiceObj.isInternet) {
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_update_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Update Address Failed - PetAddressEditComponent", 'No Internet');
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true,0,1);
            return;
        }

        if (addressServiceObj && addressServiceObj.statusData && addressServiceObj.responseData) {
            createPopup(Constant.ALERT_INFO, 'Pet Address updated Successfully.', true,1,1);
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_update_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Update Address Failed - PetAddressEditComponent", 'Service status : false');
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true,0,1);
        }

        if (addressServiceObj && addressServiceObj.error) {
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true,0,1);
            let errors = addressServiceObj.error.length > 0 ? addressServiceObj.error[0].code : '';
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Address_update_api_fail, firebaseHelper.screen_petAddress_EditComponent_screen, "Update Address Failed - PetAddressEditComponent", 'error : '+errors);
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
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            popOkBtnAction = {popOkBtnAction}
        />
    );

}

export default PetAddressEditComponent;