import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import SelectBSCScoringUI from './SelectBSCScoringUI';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';

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
        let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        petObj = JSON.parse(petObj);
        set_defaultPetObj(petObj);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        getPetImageScoringScales(petObj.petID, token);
    };

    const getPetImageScoringScales = async (petId, token) => {

        let getImgScoreServiceObj = await ServiceCalls.getPetImageScoringScales(petId, token);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        stopFBTraceGetPetImageScoringScales();

        if (getImgScoreServiceObj && getImgScoreServiceObj.logoutData) {
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }

        if (getImgScoreServiceObj && !getImgScoreServiceObj.isInternet) {
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true);
            return;
        }

        if (getImgScoreServiceObj && getImgScoreServiceObj.statusData) {

            if (getImgScoreServiceObj.responseData && getImgScoreServiceObj.responseData.length > 0) {
                set_scoringArray(getImgScoreServiceObj.responseData);
            } else {
                set_scoringArray([]);
                firebaseHelper.logEvent(firebaseHelper.event_image_scoring_pet_image_scoring_scales_api_success, firebaseHelper.screen_image_based_score, "Get Pet Image Scoring scales Api success", "Response length: " + getImgScoreServiceObj.responseData.length);
            }

        } else {
            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_pet_image_scoring_scales_api_failure, firebaseHelper.screen_image_based_score, "Get Pet Image Scoring scales Api failed", "Service Status : false");
            createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true);
        }

        if (getImgScoreServiceObj && getImgScoreServiceObj.error) {
            let errors = getImgScoreServiceObj.error.length > 0 ? getImgScoreServiceObj.error[0].code : '';
            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_pet_image_scoring_scales_api_failure, firebaseHelper.screen_image_based_score, "Get Pet Image Scoring scales Api failed", "error : " + errors);
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

        // //Redirect to new BFI Scoring screen for dog
        // if (defaultPetObj.speciesId === "1" && item.scoringType === "BFI Scoring") {
        //     navigation.navigate('PetListBFIScoringScreen');
        // } else {
        //     navigation.navigate('ImageScoringMainComponent', { scoreObj: item });
        // }
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