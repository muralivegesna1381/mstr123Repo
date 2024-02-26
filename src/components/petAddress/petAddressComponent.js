import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import PetAddressUI from './petAddressUI';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';

let trace_inPetAddressScreen;

const PetAddressComponent = ({ navigation, route, ...props }) => {

    const [date, set_Date] = useState(new Date());
    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);
    const [addLine1, set_addLine1] = useState('');
    const [addLine2, set_addLine2] = useState('');
    const [city, set_city] = useState(undefined);
    const [state, set_state] = useState(undefined);
    const [zipCode, set_zipCode] = useState(undefined);
    const [country, set_country] = useState(undefined);
    const [isAddressChange, set_isAddressChange] = useState(false);
    const [sobJson, set_sobJson] = useState(undefined);
    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [isPetParentAddress, set_isPetParentAddress] = useState(false);
    const [allAnswered, set_allAnswered] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpAlert, set_popUpAlert] = useState('Alert');
    const [addressMOBJ, set_addressMOBJ] = useState(false);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let sJosnObj = useRef({});

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_pet_address);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_pet_address, "User in Pet Address Screen", '');
            getSOBDetails();
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

        if (route.params?.isFrom) {
            set_isFromScreen(route.params?.isFrom);
        }

    }, [route.params?.isFrom]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetAddressScreen = await perf().startTrace('t_inPetAddressScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetAddressScreen.stop();
    };

    const getSOBDetails = async () => {

        if (isFromScreen === 'editPet') {

        } else {

            let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
            sJson = JSON.parse(sJson);

            if (sJson) {
                // set_sobJson(sJson);
                sJosnObj.current = sJson;
                if (((sJson.petLocation && sJson.isSameAddress === 'same'))) {
                    set_isNxtBtnEnable(true);
                    set_addLine1(sJson.petLocation.address1);
                    set_addLine2(sJson.petLocation.address2);
                    set_city(sJson.petLocation.city);
                    set_state(sJson.petLocation.state);
                    set_zipCode(sJson.petLocation.zipCode);
                    set_country(sJson.petLocation.country);
                    set_isPetParentAddress(sJson.isPetParentAddress);
                } else if (sJson.petLocationNew && sJson.isSameAddress === 'notSame' && Object.keys(sJson.petLocationNew).length !== 0) {
                    set_isNxtBtnEnable(true);
                    set_addLine1(sJson.petLocationNew.address1);
                    set_addLine2(sJson.petLocationNew.address2);
                    set_city(sJson.petLocationNew.city);
                    set_state(sJson.petLocationNew.state);
                    set_zipCode(sJson.petLocationNew.zipCode);
                    set_country(sJson.petLocationNew.country);
                    set_isPetParentAddress(sJson.isPetParentAddress);
                    set_addressMOBJ(sJson.petLocationNew);
                }
            }
        }

    };

    const validatePetParentAddress = async (address) => {

        let obj = {
            'address': address
        }
        set_isLoading(true);
        isLoadingdRef.current = 1;

        let addressServiceObj = await ServiceCalls.validateAddress(obj);
        set_isLoading(false);
        isLoadingdRef.current = 0;

        if (addressServiceObj && addressServiceObj.logoutData) {
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Parent_Address_api_fail, firebaseHelper.screen_petParent_address, "Validate Address Failed", 'User Loged Out - Multiple login');
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }

        if (addressServiceObj && addressServiceObj.invalidData) {
            createPopup(Constant.ALERT_DEFAULT_TITLE, 'Invalid Address', true);
            set_isNxtBtnEnable(false);
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Parent_Address_api_fail, firebaseHelper.screen_petParent_address, "Validate Address Failed", 'Entered Invalid Address');
            return;
        }

        if (addressServiceObj && !addressServiceObj.isInternet) {
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true);
            set_isNxtBtnEnable(false);
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Parent_Address_api_fail, firebaseHelper.screen_petParent_address, "Validate Address Failed", 'No Internet');
            return;
        }

        if (addressServiceObj && addressServiceObj.statusData) {

            if (addressServiceObj.responseData && addressServiceObj.responseData.isValidAddress === 1) {

                let addObj = {
                    "addressId" : null,
                    "address1" : addressServiceObj.responseData.address.address1,
                    "address2" : '',
                    "city" : addressServiceObj.responseData.address.city,
                    "state" : addressServiceObj.responseData.address.state,
                    "country" : addressServiceObj.responseData.address.country,
                    "zipCode" : addressServiceObj.responseData.address.zipCode,
                    "timeZoneId" : addressServiceObj.responseData.address.timeZone.timeZoneId,
                    "timeZone" : addressServiceObj.responseData.address.timeZone.timeZoneName,
                    "addressType" : 1,
                    "isPreludeAddress" : 0
               }

                set_addLine1(addressServiceObj.responseData.address.address1);
                set_addLine2('');
                set_city(addressServiceObj.responseData.address.city);
                set_state(addressServiceObj.responseData.address.state);
                set_zipCode(addressServiceObj.responseData.address.zipCode);
                set_country(addressServiceObj.responseData.address.country);
                set_addressMOBJ(addObj);
                set_allAnswered(true);
                set_isNxtBtnEnable(true);

            } else {
                set_isNxtBtnEnable(false);
                firebaseHelper.logEvent(firebaseHelper.event_registration_Address_api_fail, firebaseHelper.screen_register_parent_address, "User address Update Failed ", 'error : Invalid Address');
                createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
            }

        } else {
            set_isNxtBtnEnable(false);
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Parent_Address_api_fail, firebaseHelper.screen_petParent_address, "Validate Address Failed", 'Service Status : false');
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
        }

        if (addressServiceObj && addressServiceObj.error) {
            set_isNxtBtnEnable(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
            let errors = addressServiceObj.error.length > 0 ? addressServiceObj.error[0].code : '';
            firebaseHelper.logEvent(firebaseHelper.event_Pet_Parent_Address_api_fail, firebaseHelper.screen_petParent_address, "Validate Address Failed", 'error : ' + errors);
        }

    };

    const navigateToPrevious = () => {
        if (isFromScreen === 'feedingPrefs') {
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_petParent_address, "User clicked on Back button : PetFeedingPreferencesComponentUI", '');
            navigation.navigate('PetFoodInfoComponent');
        } else if (isFromScreen === 'pLocation') {
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_petParent_address, "User clicked on Back button : PetLocationComponent", '');
            navigation.navigate('PetLocationComponent');
        }

    };

    const submitAction = async () => {

        if (isFromScreen === 'petEdit') {
            //// Update Pet address here
        } else {

            if (sobJson && sobJson.isSameAddress === 'same') {
                updateLocalData(sobJson.petParentObj.petParentAddress);
            } else {
                updateLocalData(addressMOBJ);
                // validatePetParentAddress();
            }
        }

    };

    const createPopup = (title, msg, isPop) => {
        set_popUpAlert(title);
        set_popUpMessage(msg);
        set_isPopUp(isPop);
        popIdRef.current = 1;
    };

    const popOkBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpMessage('');
        set_popUpAlert('');
    };

    const updateLocalData = async (addChangeObj) => {

        sJosnObj.current.petLocation = sJosnObj.current.petParentObj && sJosnObj.current.petParentObj.petParentAddress ? sJosnObj.current.petParentObj.petParentAddress : undefined;
        sJosnObj.current.petLocationNew = sJosnObj.current.isSameAddress === 'notSame' ? addChangeObj : sJosnObj.current.petLocationNew;
        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));
        navigation.navigate('SensorTypeComponent', { isFrom: 'petAddress' });
    };

    const getAddress = (address) => {
        validatePetParentAddress(address);
    };

    return (
        <PetAddressUI
            isNxtBtnEnable={isNxtBtnEnable}
            addLine1={addLine1}
            addLine2={addLine2}
            state={state}
            city={city}
            zipCode={zipCode}
            country={country}
            isAddressChange={isAddressChange}
            isFromScreen={isFromScreen}
            isPetParentAddress={isPetParentAddress}
            addressMOBJ={addressMOBJ}
            isLoading={isLoading}
            isPopUp={isPopUp}
            popUpMessage={popUpMessage}
            popUpAlert={popUpAlert}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction={popOkBtnAction}
            getAddress={getAddress}
        />
    );

}

export default PetAddressComponent;