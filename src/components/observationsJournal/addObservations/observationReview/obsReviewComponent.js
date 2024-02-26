import React, { useState, useEffect, useRef } from 'react';
import {BackHandler, Platform} from 'react-native';
import ObsReviewUI from './obsReviewUI';
import * as Queries from "./../../../../config/apollo/queries";
import * as Constant from "./../../../../utils/constants/constant";
import * as internetCheck from "./../../../../utils/internetCheck/internetCheck";
import moment from 'moment';
import * as DataStorageLocal from "./../../../../utils/storage/dataStorageLocal";
import * as Apolloclient from './../../../../config/apollo/apolloConfig';
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../../../utils/authorisedComponent/authorisedComponent';
import * as ServiceCalls from './../../../../utils/getServicesData/getServicesData.js';
import * as generatRandomNubmer from './../../../../utils/generateRandomId/generateRandomId.js';

const FAIL_NETWORK = 1;
const SEND_OBS_COMPRESS_UPLOAD = 2;
const FAIL_OBS = 5;
const REMOVE_MEDIA = 3;
const NETWORK_TYPE = 7;

let trace_inAddObservationReview;
let trace_Upload_Observation_API_Complete;
let trace_Upload_Media_Complete;

const  ObsReviewComponent = ({navigation, route, ...props }) => {

    const [selectedPet, set_selectedPet] = useState(undefined);
    const [obsText , set_obsText] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [loadingMsg, set_loadingMsg] = useState(undefined);
    const [selectedBehaviour, set_selectedBehaviour] = useState(undefined);
    const [selectedDate, set_selectedDate] = useState(new Date());

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [popUplftBtnEnable, set_popUplftBtnEnable] = useState(false);
    const [popUplftBtnTitle, set_popUplftBtnTitle] = useState('');
    const [popupId, set_popupId] = useState(0);
    const [popupRgtBtnTitle, set_popupRgtBtnTitle] = useState('')
    const [obsObject, set_obsObject] = useState(undefined);
    const [fromScreen,set_fromScreen] = useState(undefined);
    const fromScreen1 = useRef(undefined);
    const [mediaArray, set_mediaArray] = useState([]);
    const [isEdit, set_isEdit] = useState(false);
    const [mediaType, set_mediaType] = useState(undefined)

    let deleteSelectedMediaFile = useRef(undefined);
    let deletedMedia = useRef([]);
    let finalImgArray = useRef([]);
    let totalCount = useRef(0);
    let deleteIndex = useRef(undefined);
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    let imgArray = useRef([]);

    useEffect(() => {

          observationsReviewStart();
          firebaseHelper.reportScreen(firebaseHelper.screen_add_observations_review);
          firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_add_observations_review, "User in Add Observations Review Screen", ''); 
          BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        return () => {
          observationsReviewStop();
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
        
      }, [navigation]);

    useEffect(() => {  

        if(route.params?.deletedMedia){
            deletedMedia.current = route.params?.deletedMedia;
            totalCount.current = route.params?.deletedMedia.length;
        }           
        getObsDetails();  

    },[route.params?.deletedMedia]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const getObsDetails = async () => {

        let oJson = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
        oJson = JSON.parse(oJson);
        if(oJson){
            set_obsObject(oJson);
            set_selectedPet(oJson.selectedPet);
            set_selectedBehaviour(oJson.behaviourItem);
            set_selectedDate(oJson.selectedDate);
            set_obsText(oJson.obsText);
            set_mediaArray(oJson.mediaArray);
            set_fromScreen(oJson.fromScreen);
            set_isEdit(oJson.isEdit);
            set_mediaType(oJson.ctgNameId);
            fromScreen1.current = oJson.fromScreen;
        }
    };

    const observationsReviewStart = async () => {
        trace_inAddObservationReview = await perf().startTrace('t_inObservationsList');
    };
    
    const observationsReviewStop = async () => {
        await trace_inAddObservationReview.stop();
    };

    const navigateToOBSList = async () => {
        await DataStorageLocal.saveDataToAsync(Constant.OBS_SELECTED_PET,JSON.stringify(selectedPet));
        navigation.navigate('ObservationsListComponent');
    };

    const submitOBSObj = async (iArray,vArray) => {

        stopFBTraceMediaUpload();
        set_isLoading(true);
        isLoadingdRef.current = 1;
        set_loadingMsg('Please wait..');

        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

        trace_Upload_Observation_API_Complete = await perf().startTrace('t_SavePetObservation_API');
        let finalObj = { 
            "observationId": obsObject ? obsObject.observationId : '',
            "petId": selectedPet.petID,
            "obsText": obsText,
            "behaviorId": obsObject.behaviourItem.behaviorId,
            "observationDateTime": obsObject.selectedDate,
            "emotionIconsText": "",
            "seizuresDescription": "",
            "loginUserId": client,
            "videos": vArray,
            "photos": iArray

        }

        sendOBSToBackend(finalObj,token);

    };

    const sendOBSToBackend = async (finalObj,token) => {

        let sendObsServiceObj = await ServiceCalls.savePetObservation(finalObj,token);
        stopFBTraceSaveObservation();

        if(sendObsServiceObj && sendObsServiceObj.logoutData){
          AuthoriseCheck.authoriseCheck();
          navigation.navigate('WelcomeComponent');
          return;
        }
        
        if(sendObsServiceObj && !sendObsServiceObj.isInternet){
            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,1,FAIL_OBS,false,'OK','');
            return;
        }
  
        if(sendObsServiceObj && sendObsServiceObj.statusData){

            firebaseHelper.logEvent(firebaseHelper.event_add_observations_api_success, firebaseHelper.screen_add_observations_review, "Add Observation Api Success", 'Media count : '+imgArray.current.length);
            set_isLoading(false);    
            isLoadingdRef.current = 0;
            set_loadingMsg(undefined);
            navigateToOBSList();
        
        } else {
            
            firebaseHelper.logEvent(firebaseHelper.event_add_observations_api_fail, firebaseHelper.screen_add_observations_review, "Add Observation Api Fail", '');
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,1,FAIL_OBS,false,'OK','');
        }
  
        if(sendObsServiceObj && sendObsServiceObj.error) {
            firebaseHelper.logEvent(firebaseHelper.event_add_observations_api_fail, firebaseHelper.screen_add_observations_review, "Add Observation Api Fail", '');
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_loadingMsg(undefined);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,1,FAIL_OBS,false,'OK','');
        }

    };

    const prpareMediaToUpload = async () => {

        let delArray = [];

        if(deletedMedia.current && deletedMedia.current.length > 0){
            
            for (let i = 0; i < deletedMedia.current.length; i++) {
    
                let tempObj = {}
                let rNumber = await generatRandomNubmer.generateRandomNumber();

                if(deletedMedia.current[i] && deletedMedia.current[i].fileType === 'image'){
    
                    tempObj = deletedMedia.current[i]
                    tempObj.id = rNumber;
                    delArray.push(tempObj);
    
                } else if(deletedMedia.current[i] && deletedMedia.current[i].fileType === 'video'){

                    tempObj = deletedMedia.current[i]
                    tempObj.id = rNumber;
                    delArray.push(tempObj);
    
                }
    
            }
        } 

        let tempArrayMain = [...delArray,...mediaArray]

        let rNumber = await generatRandomNubmer.generateRandomNumber();
        let dte = moment().utcOffset("+00:00").format("MMDDYYYYHHmmss")
        let clientID = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        
        await DataStorageLocal.removeDataFromAsync(Constant.IMAGES_UPLOAD_PROCESS_STARTED);  
        await DataStorageLocal.removeDataFromAsync(Constant.IMAGE_UPLOAD_DATA);
        await DataStorageLocal.removeDataFromAsync(Constant.VIDEOS_UPLOAD_PROCESS_STARTED);  
        await DataStorageLocal.removeDataFromAsync(Constant.VIDEOS_UPLOAD_DATA);

        if(mediaType === 0) {

            let tempArray = []
            let iProcess = await DataStorageLocal.getDataFromAsync(Constant.IMAGES_UPLOAD_PROCESS_STARTED);  
            let imgData = await DataStorageLocal.getDataFromAsync(Constant.IMAGE_UPLOAD_DATA);
            imgData = JSON.parse(imgData);

            if(imgData) {
                tempArray = imgData;
            }
            let finalObj = {
                'rNumber':rNumber,
                "observationId": obsObject ? obsObject.observationId : '',
                "petId": selectedPet.petID,
                "petName": selectedPet.petName,
                "obsText": obsText,
                "behaviorId": obsObject.behaviourItem.behaviorId,
                "observationDateTime": obsObject.selectedDate,
                "emotionIconsText": "",
                "seizuresDescription": "",
                "loginUserId": clientID,
                "videos": [],
                "photos": tempArrayMain
            
            }
            tempArray.push(finalObj);

            if(iProcess) {
                await DataStorageLocal.saveDataToAsync(Constant.IMAGE_UPLOAD_DATA,JSON.stringify(tempArray));
            } else {
                await DataStorageLocal.saveDataToAsync(Constant.IMAGE_UPLOAD_DATA,JSON.stringify(tempArray));
                Apolloclient.client.writeQuery({query: Queries.UPLOAD_IMAGE_BACKGROUND,data: {data: { imageData:'checkForUploads',__typename: 'UploadImageBackground'}},})
            }
            navigation.navigate('DashBoardService');
            return;

        } else if (mediaType === 1) {

            let tempArray = []
            let iProcess = await DataStorageLocal.getDataFromAsync(Constant.VIDEOS_UPLOAD_PROCESS_STARTED);  
            let vidsData = await DataStorageLocal.getDataFromAsync(Constant.VIDEOS_UPLOAD_DATA);
            vidsData = JSON.parse(vidsData);

            if(vidsData) {
                tempArray = vidsData;
            }
            let finalObj = {
                'rNumber':rNumber,
                "observationId": obsObject ? obsObject.observationId : '',
                "petId": selectedPet.petID,
                "petName": selectedPet.petName,
                "obsText": obsText,
                "behaviorId": obsObject.behaviourItem.behaviorId,
                "observationDateTime": obsObject.selectedDate,
                "emotionIconsText": "",
                "seizuresDescription": "",
                "loginUserId": clientID,
                "videos": tempArrayMain,
                "photos": []
            
            }

            if(iProcess) {
                tempArray.push(finalObj);
                await DataStorageLocal.saveDataToAsync(Constant.VIDEOS_UPLOAD_DATA,JSON.stringify(tempArray));
            } else {
                tempArray.push(finalObj);
                await DataStorageLocal.saveDataToAsync(Constant.VIDEOS_UPLOAD_DATA,JSON.stringify(tempArray));
                Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEOS_BACKGROUND,data: {data: { videoData:'checkForUploads',__typename: 'UploadVideosBackground'}},})
            }
            navigation.navigate('DashBoardService');
            return;
                    
        }

    };

    const submitAction = async () => {

        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_add_observations_review_submit, firebaseHelper.screen_add_observations_review, "User initiated uploading Observation ", 'Internet Status : '+internet);

        if(!internet){
            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,1,FAIL_NETWORK,false,'OK','');
        } else {

            finalImgArray.current=[];
            if(mediaArray.length === 0 && deletedMedia.current.length === 0){

                firebaseHelper.logEvent(firebaseHelper.event_add_observations_review_submit_nomedia, firebaseHelper.screen_add_observations_review, "User initiated uploading Observation ", 'Media : Without Media');
                set_isLoading(true);
                isLoadingdRef.current = 1;
                set_loadingMsg(Constant.UPLOAD_OBS_DATA_MSG);
                submitOBSObj([],[]);

            } else {

                if(isEdit) {

                    let delArray = [];

                    if(mediaArray.length === 0 && deletedMedia.current.length > 0) {

                        if(mediaType === 0) {

                            for (let i = 0; i < deletedMedia.current.length; i++) {

                                let obj = {
                                    "observationPhotoId": deletedMedia.current[i].observationPhotoId,
                                    "fileName": deletedMedia.current[i].fileName,
                                    "filePath": ""+deletedMedia.current[i].fbFilePath,
                                    "isDeleted": deletedMedia.current[i].isDeleted
                                }
                                delArray.push(obj);
                            }
                            submitOBSObj(delArray,[]);
                            return;

                        } else {

                            for (let i = 0; i < deletedMedia.current.length; i++) {

                                let obj = {
                                    "observationVideoId": deletedMedia.current[i].observationVideoId,
                                    "videoName": deletedMedia.current[i].fileName,
                                    "videoUrl": deletedMedia.current[i].fbFilePath,
                                    "videoThumbnailUrl": deletedMedia.current[i].localThumbImg,
                                    "isDeleted": deletedMedia.current[i].isDeleted,
                                    "videoStartDate" : deletedMedia.current[i].videoStartDate,
                                    "videoEndDate" : deletedMedia.current[i].videoEndDate,
                                }
                                delArray.push(obj);
                            }
                            submitOBSObj([], delArray);
                            return;
                        }

                    }
                    
                    if(mediaArray.length > 0 && deletedMedia.current.length > 0) {
                        
                        let finalArray = [...mediaArray,...deletedMedia.current];
                        let value = 0;
                        
                        for (let i = 0; i < finalArray.length; i++) {

                            if(finalArray[i].fbFilePath === '') {
                                value = value + 1;
                            }

                        }

                        if (value > 0) {

                            let internetType = await internetCheck.internetTypeCheck();
                            if(internetType !== 'wifi'){
                                createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.NETWORK_TYPE_WIFI,true,1,NETWORK_TYPE,false,'OK','');
                                return;
                            } 

                            let msg = '';
                            if(Platform.OS === 'android'){
                                msg = Constant.UPLOAD_OBS_SUBMIT_MSG_ANDROID;
                            } else {
                                msg = Constant.UPLOAD_OBS_SUBMIT_MSG;
                            }
                            createPopup('Thank You!',msg,true,1,SEND_OBS_COMPRESS_UPLOAD,false,'OK','');
                            return

                        } else {

                            if(mediaType === 0) {

                                for (let i = 0; i < finalArray.length; i++) {

                                    let obj = {
                                        "observationPhotoId": finalArray[i].observationPhotoId,
                                        "fileName": finalArray[i].fileName,
                                        "filePath": ""+finalArray[i].fbFilePath,
                                        "isDeleted": finalArray[i].isDeleted
                                    }
                                    delArray.push(obj);
                                }
                                submitOBSObj(delArray,[]);
                                return;

                            } else {

                                for (let i = 0; i < finalArray.length; i++) {

                                    let obj = {
                                        "observationVideoId": finalArray[i].observationVideoId,
                                        "videoName": finalArray[i].fileName,
                                        "videoUrl": finalArray[i].fbFilePath,
                                        "videoThumbnailUrl": finalArray[i].localThumbImg,
                                        "isDeleted": finalArray[i].isDeleted,
                                        "videoStartDate" : finalArray[i].videoStartDate,
                                        "videoEndDate" : finalArray[i].videoEndDate,
                                    }
                                    delArray.push(obj);
                                }
                                submitOBSObj([], delArray);
                                return;
                            }
                            
                        }

                    }

                    if(mediaArray.length > 0 && deletedMedia.current.length === 0) {

                        let finalArray = mediaArray;
                        let value = 0;
                        
                        for (let i = 0; i < finalArray.length; i++) {

                            if(finalArray[i].fbFilePath === '') {
                                value = value + 1;
                            }

                        }

                        if(value > 0) {

                            if(mediaArray.length > 0) {

                                let internetType = await internetCheck.internetTypeCheck();
                                if(internetType !== 'wifi'){
                                    createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.NETWORK_TYPE_WIFI,true,1,NETWORK_TYPE,false,'OK','');
                                    return;
                                } 

                                let msg = '';
                                if(Platform.OS === 'android'){
                                    msg = Constant.UPLOAD_OBS_SUBMIT_MSG_ANDROID;
                                } else {
                                    msg = Constant.UPLOAD_OBS_SUBMIT_MSG;
                                }
                                createPopup('Thank You!',msg,true,1,SEND_OBS_COMPRESS_UPLOAD,false,'OK','');
                                return
        
                            }

                        } else {

                            if(mediaType === 0) {

                                for (let i = 0; i < finalArray.length; i++) {

                                    let obj = {
                                        "observationPhotoId": finalArray[i].observationPhotoId,
                                        "fileName": finalArray[i].fileName,
                                        "filePath": ""+finalArray[i].fbFilePath,
                                        "isDeleted": finalArray[i].isDeleted
                                    }
                                    delArray.push(obj);
                                }
                                submitOBSObj(delArray,[]);
                                return;

                            } else {

                                for (let i = 0; i < finalArray.length; i++) {

                                    let obj = {
                                        "observationVideoId": finalArray[i].observationVideoId,
                                        "videoName": finalArray[i].fileName,
                                        "videoUrl": finalArray[i].fbFilePath,
                                        "videoThumbnailUrl": finalArray[i].localThumbImg,
                                        "isDeleted": finalArray[i].isDeleted,
                                        "videoStartDate" : finalArray[i].videoStartDate,
                                        "videoEndDate" : finalArray[i].videoEndDate,
                                    }
                                    delArray.push(obj);
                                }
                                submitOBSObj([], delArray);
                                return;
                            }

                        }

                    }

                    if(mediaArray.length > 0) {

                        let internetType = await internetCheck.internetTypeCheck();
                        if(internetType !== 'wifi'){
                            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.NETWORK_TYPE_WIFI,true,1,NETWORK_TYPE,false,'OK','');
                            return;
                        } 

                        let msg = '';
                        if(Platform.OS === 'android'){
                            msg = Constant.UPLOAD_OBS_SUBMIT_MSG_ANDROID;
                        } else {
                            msg = Constant.UPLOAD_OBS_SUBMIT_MSG;
                        }
                        createPopup('Thank You!',msg,true,1,SEND_OBS_COMPRESS_UPLOAD,false,'OK','');
                        return

                    } 
                    
                } else {

                    let internetType = await internetCheck.internetTypeCheck();
                    if(internetType !== 'wifi'){
                        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.NETWORK_TYPE_WIFI,true,1,NETWORK_TYPE,false,'OK','');
                        return;
                    } 
                    
                    let msg = '';
                        if(Platform.OS === 'android'){
                            msg = Constant.UPLOAD_OBS_SUBMIT_MSG_ANDROID;
                        } else {
                            msg = Constant.UPLOAD_OBS_SUBMIT_MSG;
                        }
                        createPopup('Thank You!',msg,true,1,SEND_OBS_COMPRESS_UPLOAD,false,'OK','');
                        return

                }

            } 

        }

    };

    const stopFBTraceSaveObservation = async () => {
        await trace_Upload_Observation_API_Complete.stop();
    };

    const stopFBTraceMediaUpload = async () => {
        await trace_Upload_Media_Complete.stop();
    };

    const removeMedia = (item,index) => {
        deleteSelectedMediaFile.current = item;
        deleteIndex.current = index;   
        createPopup(Constant.ALERT_DEFAULT_TITLE,'Are you sure you want to delete this ' + item.fileType,true,1,REMOVE_MEDIA,true,'YES','NO');
    };

    const createPopup = (title,msg,isPop,popRef,popId,isLetBtn,rBtntitle,lBtnTitle) => {
        set_popUpAlert(title);
        set_popUpMessage(msg);
        set_isPopUp(isPop);
        popIdRef.current = popRef;
        set_popupId(popId);
        set_popUplftBtnEnable(isLetBtn);
        set_popUplftBtnTitle(lBtnTitle);
        set_popupRgtBtnTitle(rBtntitle);
    };

    const popOkBtnAction = async () => {

        if(popupId===REMOVE_MEDIA){
            popCancelBtnAction();
        }else if(popupId === NETWORK_TYPE || popupId === FAIL_NETWORK || popupId === FAIL_OBS) {
            popCancelBtnAction();
        }else if(popupId === SEND_OBS_COMPRESS_UPLOAD) {
            popCancelBtnAction();
            prpareMediaToUpload();
        } 

    };

    const popCancelBtnAction = () => {

        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpAlert(undefined);
        set_popUpMessage(undefined);
        set_popupId(0);
        set_popUplftBtnEnable(false);
        set_popUplftBtnTitle('');
        set_popupRgtBtnTitle('');       

    };

    const navigateToPrevious = () => {  

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_add_observations_review, "User clicked on back button to navigate to UploadObsVideoComponent", '');
            // navigation.navigate("UploadObsVideoComponent");    
            navigation.pop();   

        }
            
    };

    return (
        <ObsReviewUI 
            isLoading = {isLoading}
            loadingMsg = {loadingMsg}
            selectedPet = {selectedPet}
            obsText = {obsText}
            selectedBehaviour = {selectedBehaviour}
            selectedDate = {selectedDate}
            mediaArray = {mediaArray}
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            isPopUp = {isPopUp}
            popupRgtBtnTitle = {popupRgtBtnTitle}
            popUplftBtnEnable = {popUplftBtnEnable}
            popUplftBtnTitle = {popUplftBtnTitle}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            popOkBtnAction = {popOkBtnAction}
            popCancelBtnAction = {popCancelBtnAction}
            removeMedia = {removeMedia}
        />
    );

  }
  
  export default ObsReviewComponent;