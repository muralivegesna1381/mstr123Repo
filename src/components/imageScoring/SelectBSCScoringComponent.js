import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import SelectBSCScoringUI from './SelectBSCScoringUI';
import * as Constant from "./../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as AppPetsData from '../../utils/appDataModels/appPetsModel.js';

const SelectBSCScoringComponent = ({ navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [scoringArray, set_scoringArray] = useState([]);
    const [date, set_Date] = useState(new Date());
    const [popupAlert, set_popupAlert] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    let trace_inBCS_Scoring_Screen;
    let trace_Get_Pet_ImageScoring_Scales_API_Complete;

    useEffect(() => {

        getInitialData();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            firebaseHelper.reportScreen(firebaseHelper.screen_image_based_score);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_image_based_score, "User in ImageBased scoring Screen", '');
            imageScoringBCSScoringPageSessionStart();
        });

        const unsubscribe = navigation.addListener('blur', () => {
            imageScoringBCSScoringPageSessionStop();
        });

        return () => {
            imageScoringBCSScoringPageSessionStop();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    const getInitialData = async () => {
        set_isLoading(true);
        isLoadingdRef.current = 1;
        trace_Get_Pet_ImageScoring_Scales_API_Complete = await perf().startTrace('t_Image_Scoring_Get_Pet_Image_Scoring_Scales_API');
        let petObj = AppPetsData.petsData.defaultPet;
        set_defaultPetObj(petObj);
        getPetImageScoringScales(petObj.petID);
    };

    const getPetImageScoringScales = async (petId,) => {

        let apiMethod = apiMethodManager.Get_PETIMAGE_SCALES + petId;
        let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        stopFBTraceGetPetImageScoringScales();                
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
                
            if (apiService.data.imageScoringScales && apiService.data.imageScoringScales.length > 0) {
                set_scoringArray(apiService.data.imageScoringScales);
            } else {
                set_scoringArray([]);
                firebaseHelper.logEvent(firebaseHelper.event_image_scoring_pet_image_scoring_scales_api_success, firebaseHelper.screen_image_based_score, "Get Pet Image Scoring scales Api success", "Response length: " + 'No records');
            }
                
        } else if(apiService && apiService.isInternet === false) {
    
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true);
            return;

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, true);
            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_pet_image_scoring_scales_api_failure, firebaseHelper.screen_image_based_score, "Get Pet Image Scoring scales Api failed", "error : " + apiService.error.errorMsg);
            
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_pet_image_scoring_scales_api_failure, firebaseHelper.screen_image_based_score, "Get Pet Image Scoring scales Api failed", "Service Status : false");
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);

        }
        
    }

    const imageScoringBCSScoringPageSessionStart = async () => {
        trace_inBCS_Scoring_Screen = await perf().startTrace('t_Image_Scoring_BCS_Scoring_Screen');
    };

    const imageScoringBCSScoringPageSessionStop = async () => {
        await trace_inBCS_Scoring_Screen.stop();
    };

    const stopFBTraceGetPetImageScoringScales = async () => {
        await trace_Get_Pet_ImageScoring_Scales_API_Complete.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    // Navigates to previous screen
    const navigateToPrevious = () => {
        if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
            navigation.navigate('DashBoardService');
        }
    };

    const createPopup = (title, msg, isPop) => {
        set_popupAlert(title);
        set_popupMsg(msg);
        set_isPopUp(isPop);
        popIdRef.current = 1;
    };

    // Popup btn actions
    const popOkBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popupAlert(undefined);
        set_popupMsg(undefined);
    };

    // Navigates to Images scoring component
    const selectActivityAction = (item, index) => {

        let itemName = item && item.imageScaleName ? item.imageScaleName : ''
        firebaseHelper.logEvent(firebaseHelper.event_image_scoring_button_trigger, firebaseHelper.screen_image_based_score, "User selected item", '' + itemName);
        navigation.navigate('ImageScoringMainComponent', { scoreObj: item });

    };

    return (
        <SelectBSCScoringUI
            isPopUp={isPopUp}
            popupMsg={popupMsg}
            popupAlert={popupAlert}
            isLoading={isLoading}
            scoringArray={scoringArray}
            defaultPetObj={defaultPetObj}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction={popOkBtnAction}
            selectActivityAction={selectActivityAction}
        />
    );

}

export default SelectBSCScoringComponent;