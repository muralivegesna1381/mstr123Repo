import React, { useState, useEffect,useRef } from 'react';
import { BackHandler } from 'react-native';
import ImageScoringMainUI from './imageScoringMainUI';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as AppPetsData from '../../utils/appDataModels/appPetsModel.js';

const ImageScoringMainComponent = ({ navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [popupAlert, set_popupAlert] = useState(undefined);
    const [isDetailsView, set_isDetailsView] = useState(false);
    const [scoreObj, set_scoreObj] = useState(undefined);
    const [selectedObj, set_selectedObj] = useState(undefined);
    const [scoringTypeId, set_scoringTypeId] = useState(undefined);
    const [imageScoringId, set_imageScoringId] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let trace_inImage_Scoring_Main_Screen;
    let trace_ImageScoring_Send_Score_Details_API_Complete;

      // Setting the firebase screen name
    useEffect(() => {
        
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            firebaseHelper.reportScreen(firebaseHelper.screen_image_based_score_measurements);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_image_based_score_measurements, "User in ImageBased Measurements Screen", ''); 
            imageScoringMainPageSessionStart();
        });

        const unsubscribe = navigation.addListener('blur', () => {
            imageScoringMainPageSessionStop();
        });

         return () => {
           imageScoringMainPageSessionStop();
           focus();
           unsubscribe();
           BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };

    }, []);

    // Setting the selected scoring obi from previous screen to local variable
    useEffect(() => {

        if (route.params?.scoreObj) {
            set_scoreObj(route.params?.scoreObj);
            set_scoringTypeId(route.params?.scoreObj.scoringTypeId);
            set_imageScoringId(route.params?.scoreObj.imageScoringScaleId);
        }

    }, [route.params?.scoreObj]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    // Navigates previous creen
    const navigateToPrevious = () => {
        if(popIdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_image_based_score_measurements, "User clicked on back button to navigate to SelectBSCScoringComponent", '');
            navigation.navigate('SelectBSCScoringComponent');
        }
    };

    // Navigates to Date selection class if the objecct relates to BCS,BFI or Stool, or submits the record to backend
    const submitAction = (dataArray) => {
        if(scoringTypeId === 4){
            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_page_final_api, firebaseHelper.screen_image_based_score_measurements, "Final image based scoring Api called", "Scoring type: "+scoringTypeId);
            submitDetails(dataArray);
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_measurement_button_trigger, firebaseHelper.screen_image_based_score_measurements, "User clicked on next to image upload for image based scoring", "");
            navigation.navigate('ScoringImagePickerComponent', { selectedObj: selectedObj, scoreObj:scoreObj, scoringTypeId:scoringTypeId, imageScoringId:imageScoringId });
        }
    };

    const submitDetails = async (arryDetails) => {

        trace_ImageScoring_Send_Score_Details_API_Complete = await perf().startTrace('t_Image_Scoring_Send_Scoring_Details_API');
        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let petObj = AppPetsData.petsData.defaultPet;

        let tempArray = [];

        for (let i = 0; i < arryDetails.length; i++){
            let obj = {
                "imageScoringDtlsId": arryDetails[i].imageScoringDetailsId,
                "imageUrl": "",
                "thumbnailUrl": "",
                "value": arryDetails[i].txtValue,
                "uom": 0
            }
            tempArray.push(obj);
        }

        let jsonScoring = {
            "imageScoreType": scoringTypeId,
            "imageScoringId": imageScoringId,
            "petId": petObj.petID,
            "petImgScoreDetails": tempArray,
            "petParentId": client
          }

        set_isLoading(true);
        isLoadingdRef.current = 1;
        sendScoringDetailsToBackend(jsonScoring,token);
    };

    const sendScoringDetailsToBackend = async (jsonScoring,token) => {

        let apiMethod = apiMethodManager.ADD_PETIMAGE_SCORING;
        let apiService = await apiRequest.postData(apiMethod,jsonScoring,Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        stopFBTraceSendScoringData();
            
        if(apiService && apiService.status) {
            createPopup('Success',Constant.HWPMEASUREMENT_SUCCESS_MSG,true);
        } else if(apiService && apiService.isInternet === false) {

            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_page_api_final_failure, firebaseHelper.screen_image_based_score_measurements, "Final image based scoring Api failed", "No Internet");
            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
            return;

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true);
            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_page_api_final_failure, firebaseHelper.screen_image_based_score_measurements, "Final image based scoring Api failed", "error : "+apiService.error.errorMsg);
            
        } else {

            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_page_api_final_failure, firebaseHelper.screen_image_based_score_measurements, "Final image based scoring Api failed", "Service Status : false");
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);

        }

    };

    const createPopup = (title,msg,isPop) => {
        set_popupAlert(title);
        set_popupMsg(msg);
        set_isPopUp(isPop);
        popIdRef.current = 1;
    };

    // By setting false, Popup will dissappear from the screen
    const popOkBtnAction = () => {

        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popupAlert(undefined);
        set_popupMsg(undefined);
        if(scoringTypeId===4){
            navigation.navigate("DashBoardService");
        }
    };

    const selectImageAction = (item) => {
        set_selectedObj(item)
    };

    const imageScoringMainPageSessionStart = async () => {
        trace_inImage_Scoring_Main_Screen = await perf().startTrace('t_Image_Scoring_Main_Screen');
    };
    
    const imageScoringMainPageSessionStop = async () => {
        await trace_inImage_Scoring_Main_Screen.stop();
    };

    const stopFBTraceSendScoringData = async () => {
        await trace_ImageScoring_Send_Score_Details_API_Complete.stop();
    };

    return (
        <ImageScoringMainUI
            isLoading={isLoading}
            isPopUp={isPopUp}
            popupMsg={popupMsg}
            popupAlert = {popupAlert}
            isDetailsView={isDetailsView}
            scoreObj={scoreObj}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction={popOkBtnAction}
            selectImageAction={selectImageAction}
        />
    );

}

export default ImageScoringMainComponent;