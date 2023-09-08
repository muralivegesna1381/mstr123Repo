import React, { useState, useEffect, useRef } from 'react';
import {BackHandler, Platform} from 'react-native';
import ObsReviewUI from './obsReviewUI';
import * as Queries from "./../../../../config/apollo/queries";
import * as Constant from "./../../../../utils/constants/constant";
import * as internetCheck from "./../../../../utils/internetCheck/internetCheck";
import moment from 'moment';
import * as DataStorageLocal from "./../../../../utils/storage/dataStorageLocal";
import * as Apolloclient from './../../../../config/apollo/apolloConfig';
import storage, { firebase } from '@react-native-firebase/storage';
import { Image } from 'react-native-compressor';
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

    let deleteSelectedMediaFile = useRef(undefined);
    let deletedMedia = useRef(undefined);
    let fbIndex = useRef(0);
    let actualIndex = useRef(undefined);
    let finalImgArray = useRef([]);
    let totalImgArray = useRef([]);

    let deleteCount = useRef(0);
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

    const submitOBSObj = async () => {

        stopFBTraceMediaUpload();
        set_isLoading(true);
        isLoadingdRef.current = 1;
        set_loadingMsg('Please wait..');
        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

        trace_Upload_Observation_API_Complete = await perf().startTrace('t_SavePetObservation_API');
        let vidArray = [];
        let finalObj = {};

        if(deletedMedia.current && deletedMedia.current.length>0){

            for (let i = 0; i < deletedMedia.current.length; i++){

                let tempObj = {}
                if(deletedMedia.current[i].fileType === 'image'){

                    tempObj = {

                        "fileName": deletedMedia.current[i].fileName,
                        "filePath": deletedMedia.current[i].fbFilePath,
                        "isDeleted": deletedMedia.current[i].isDeleted,
                        "observationPhotoId": deletedMedia.current[i].observationPhotoId

                    }

                    imgArray.current.push(tempObj);

                } else if(deletedMedia.current[i].fileType === 'video'){

                    let obj = {

                        "videoName": deletedMedia.current[i].fileName,
                        "videoUrl": deletedMedia.current[i].fbFilePath,
                        "videoThumbnailUrl":""+deletedMedia.current[i].actualFbThumFile,
                        "isDeleted": deletedMedia.current[i].isDeleted,
                        "observationVideoId": deletedMedia.current[i].observationVideoId,
                        "videoStartDate" : deletedMedia.current[i].videoStartDate,
                        "videoEndDate" : deletedMedia.current[i].videoEndDate,
                    }
    
                    vidArray.push(obj);

                }

            }

            for (let i = 0; i < finalImgArray.current.length; i++){
                
                if(finalImgArray.current[i].fileType === 'video'){

                    let obj = {

                        "videoName": finalImgArray.current[i].fileName,
                        "videoUrl": finalImgArray.current[i].fbFilePath,
                        "videoThumbnailUrl":""+finalImgArray.current[i].actualFbThumFile,
                        "isDeleted": finalImgArray.current[i].isDeleted,
                        "observationVideoId": finalImgArray.current[i].observationVideoId,
                        "videoStartDate" : finalImgArray.current[i].videoStartDate,
                        "videoEndDate" : finalImgArray.current[i].videoEndDate,
                    }
    
                    vidArray.push(obj);

                } else if(finalImgArray.current[i].fileType === 'image'){
                    let obj = {

                        "fileName": finalImgArray.current[i].fileName,
                        "filePath": finalImgArray.current[i].fbFilePath,
                        "isDeleted": finalImgArray.current[i].isDeleted,
                        "observationPhotoId": finalImgArray.current[i].observationPhotoId
                    }
    
                    imgArray.current.push(obj);

                }

            }

        } else {

            for (let i = 0; i < finalImgArray.current.length; i++){

                if(finalImgArray.current[i].fileType === 'image'){

                    let obj = {

                        fileName: finalImgArray.current[i].fileName,
                        filePath: finalImgArray.current[i].fbFilePath,
                        isDeleted: finalImgArray.current[i].isDeleted,
                        observationPhotoId: finalImgArray.current[i].observationPhotoId
                    }

                    imgArray.current.push(obj);

                } 

            }

        }

        finalObj = {
           
            "observationId": obsObject ? obsObject.observationId : '',
            "petId": selectedPet.petID,
            "obsText": obsText,
            "behaviorId": obsObject.behaviourItem.behaviorId,
            "observationDateTime": obsObject.selectedDate,
            "emotionIconsText": "",
            "seizuresDescription": "",
            "loginUserId": client,
            "videos": vidArray,
            "photos": imgArray.current

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
            if(deletedMedia.current && deletedMedia.current.length>0){
                deleteFBFile();
            } else {
                set_isLoading(false);    
                isLoadingdRef.current = 0;
                set_loadingMsg(undefined);
                navigateToOBSList();
            }
        
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

    const submitAction = async () => {

        let isVidsNew = undefined;
        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_add_observations_review_submit, firebaseHelper.screen_add_observations_review, "User initiated uploading Observation ", 'Internet Status : '+internet);
        if(!internet){
            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,1,FAIL_NETWORK,false,'OK','');
        } else {

            finalImgArray.current=[];

            if(mediaArray.length===0){
                firebaseHelper.logEvent(firebaseHelper.event_add_observations_review_submit_nomedia, firebaseHelper.screen_add_observations_review, "User initiated uploading Observation ", 'Media : Without Media');
                set_isLoading(true);
                isLoadingdRef.current = 1;
                set_loadingMsg(Constant.UPLOAD_OBS_DATA_MSG);
                submitOBSObj();

            } else if(mediaArray && mediaArray.length > 0 && mediaArray.length === 1) {

                if(mediaArray[0].fileType==='image') {
                    firebaseHelper.logEvent(firebaseHelper.event_add_observations_review_submit_media, firebaseHelper.screen_add_observations_review, "User initiated uploading Observation with Single Media", 'MediaType : Image');
                    set_isLoading(true);
                    isLoadingdRef.current = 1;
                    set_loadingMsg(Constant.UPLOAD_OBS_DATA_MSG);
                    if(mediaArray[0].filePath && mediaArray[0].filePath!==''){
                        let compressurl = await compressImage(mediaArray[0].filePath);
                        actualIndex.current = 1;

                        let objImage = {
                            'filePath':mediaArray[0].filePath,
                            'fbFilePath':mediaArray[0].fbFilePath,
                            'fileName':mediaArray[0].fileName,
                            'observationPhotoId' : mediaArray[0].observationPhotoId,
                            'localThumbImg': '',
                            'fileType':mediaArray[0].fileType,
                            "isDeleted": mediaArray[0].isDeleted,
                            "actualFbThumFile": mediaArray[0].actualFbThumFile,
                            'thumbFilePath':mediaArray[0].thumbFilePath,
                            'compressedFile':compressurl                           
                        }

                        uploadImageToFB(objImage);

                    } else {

                        let obj = {
                            'filePath':mediaArray[0].filePath,
                            'fbFilePath':mediaArray[0].fbFilePath,
                            'fileName':mediaArray[0].fileName,
                            'observationPhotoId' : mediaArray[0].observationPhotoId,
                            'localThumbImg': mediaArray[0].localThumbImg,
                            'fileType':mediaArray[0].fileType,
                            "isDeleted": mediaArray[0].isDeleted,
                            "actualFbThumFile": mediaArray[0].actualFbThumFile,
                            'thumbFilePath':mediaArray[0].thumbFilePath,
                            "compressedFile":''
                        }
        
                        finalImgArray.current.push(obj);
                        submitOBSObj();
                    }                   

                } else if(mediaArray[0].fileType==='video') {

                    let internetType = await internetCheck.internetTypeCheck();

                    if(mediaArray[0].fbFilePath===''){
                        firebaseHelper.logEvent(firebaseHelper.event_add_observations_review_submit_media, firebaseHelper.screen_add_observations_review, "User initiated uploading Observation with Single Media", 'MediaType : Video');
                        let obj = {
                            'filePath':mediaArray[0].filePath,
                            'fbFilePath':mediaArray[0].fbFilePath,
                            'fileName':mediaArray[0].fileName,
                            'observationVideoId' : mediaArray[0].observationVideoId,
                            'localThumbImg': mediaArray[0].localThumbImg,
                            'fileType':mediaArray[0].fileType,
                            "isDeleted": mediaArray[0].isDeleted,
                            "actualFbThumFile": mediaArray[0].actualFbThumFile,
                            'thumbFilePath':mediaArray[0].thumbFilePath,
                            "compressedFile":'',
                            "videoStartDate" : mediaArray[0].videoStartDate,
                            "videoEndDate" : mediaArray[0].videoEndDate,
                        }
        
                        finalImgArray.current.push(obj);

                        let msg = '';
                        if(Platform.OS === 'android'){
                            msg = Constant.UPLOAD_OBS_SUBMIT_MSG_ANDROID;
                        } else {
                            msg = Constant.UPLOAD_OBS_SUBMIT_MSG;
                        }
                        createPopup('Thank You!',msg,true,1,SEND_OBS_COMPRESS_UPLOAD,false,'OK','');

                    } else {

                        let obj = {
                            'filePath':mediaArray[0].filePath,
                            'fbFilePath':mediaArray[0].fbFilePath,
                            'fileName':mediaArray[0].fileName,
                            'observationVideoId' : mediaArray[0].observationVideoId,
                            'localThumbImg': mediaArray[0].localThumbImg,
                            'fileType':mediaArray[0].fileType,
                            "isDeleted": mediaArray[0].isDeleted,
                            "actualFbThumFile": mediaArray[0].actualFbThumFile,
                            'thumbFilePath':mediaArray[0].thumbFilePath,
                            "compressedFile":''
                        }
        
                        finalImgArray.current.push(obj);
                        submitOBSObj();
                    }

                } 
            } else {

                let imgArray = [];
                let vidArray = [];

                for (let i =0; i < mediaArray.length; i++){
                    
                    if(mediaArray[i].fileType==='image') {
                        imgArray.push(mediaArray[i]) ;
                    }

                    if(mediaArray[i].fileType==='video' && mediaArray[i].filePath!=='') {
                        vidArray.push(mediaArray[i]) ;
                    }

                }
               
                totalImgArray.current = imgArray;
                actualIndex.current = imgArray.length;
                if(imgArray.length > 0 && vidArray.length === 0){
                    firebaseHelper.logEvent(firebaseHelper.event_add_observations_review_submit_multimedia, firebaseHelper.screen_add_observations_review, "User initiated uploading Observation with Multiple Media", 'MediaType : Images - '+imgArray.length);

                    set_isLoading(true);
                    isLoadingdRef.current = 1;
                    set_loadingMsg(Constant.UPLOAD_OBS_DATA_MSG);
                    trace_Upload_Media_Complete = await perf().startTrace('t_Compress_UploadFB');
                    compressioProcess();
                } else {

                    let internetType = await internetCheck.internetTypeCheck();
                    if(internetType==='wifi'){

                        let obj = {};
                        let imgArray = [];
                        for (let i = 0; i < mediaArray.length; i++){

                            if(mediaArray[i].fileType==='video'){

                                obj = {
                                    'filePath':mediaArray[i].filePath,
                                    'fbFilePath':mediaArray[i].fbFilePath,
                                    'fileName':mediaArray[i].fileName,
                                    'observationVideoId' : mediaArray[i].observationVideoId,
                                    'localThumbImg': mediaArray[i].localThumbImg,
                                    'fileType':mediaArray[i].fileType,
                                    "isDeleted": mediaArray[i].isDeleted,
                                    "actualFbThumFile": mediaArray[i].actualFbThumFile,
                                    'thumbFilePath':mediaArray[i].thumbFilePath,
                                    "compressedFile":'',
                                    "videoStartDate" : mediaArray[i].videoStartDate,
                                    "videoEndDate" : mediaArray[i].videoEndDate,
                                }

                                if(!mediaArray[i].observationVideoId && mediaArray[i].observationVideoId===''){
                                    isVidsNew = true;
                                }

                                finalImgArray.current.push(obj);

                            } else if(mediaArray[i].fileType==='image'){

                                if(mediaArray[i].filePath && mediaArray[i].filePath!==''){

                                    obj = {
                                        'filePath':mediaArray[i].filePath,
                                        'fbFilePath':mediaArray[i].fbFilePath,
                                        'fileName':mediaArray[i].fileName,
                                        'observationPhotoId' : mediaArray[i].observationPhotoId,
                                        'localThumbImg': mediaArray[i].localThumbImg,
                                        'fileType':mediaArray[i].fileType,
                                        "isDeleted": mediaArray[i].isDeleted,
                                        "actualFbThumFile": mediaArray[i].actualFbThumFile,
                                        'thumbFilePath':mediaArray[i].thumbFilePath,
                                        "compressedFile":''
                                    }

                                } else {

                                    obj = {
                                        'filePath':mediaArray[i].filePath,
                                        'fbFilePath':mediaArray[i].fbFilePath,
                                        'fileName':mediaArray[i].fileName,
                                        'observationPhotoId' : mediaArray[i].observationPhotoId,
                                        'localThumbImg': mediaArray[i].localThumbImg,
                                        'fileType':mediaArray[i].fileType,
                                        "isDeleted": mediaArray[i].isDeleted,
                                        "actualFbThumFile": mediaArray[i].actualFbThumFile,
                                        'thumbFilePath':mediaArray[i].thumbFilePath,
                                        "compressedFile":''
                                    }

                                }

                                imgArray.push(obj);
                                finalImgArray.current.push(obj);
                                
                            }
                        }

                        totalImgArray.current = imgArray;
                        actualIndex.current = imgArray.length;

                        if(imgArray.length>0 && vidArray.length===0){
                            set_isLoading(true);
                            isLoadingdRef.current = 1;
                            set_loadingMsg(Constant.UPLOAD_OBS_DATA_MSG);
                            trace_Upload_Media_Complete = await perf().startTrace('t_Compress_UploadFB');
                            compressioProcess();
                        } else {

                            if(vidArray.length===0){

                                set_isLoading(true);
                                isLoadingdRef.current = 1;
                                set_loadingMsg(Constant.UPLOAD_OBS_DATA_MSG);
                                submitOBSObj();

                            } else {

                                if(isVidsNew){
                                    let msg = '';
                                    if(Platform.OS === 'android'){
                                        msg = Constant.UPLOAD_OBS_SUBMIT_MSG_ANDROID;
                                    } else {
                                        msg = Constant.UPLOAD_OBS_SUBMIT_MSG;
                                    }
                                    createPopup('Thank You!',msg,true,1,SEND_OBS_COMPRESS_UPLOAD,false,'OK','');
                                    firebaseHelper.logEvent(firebaseHelper.event_add_observations_review_submit_multimedia, firebaseHelper.screen_add_observations_review, "User initiated uploading Observation with Multiple Media", 'MediaType : Images/Videos - ');
                                } else {

                                    set_isLoading(true);
                                    isLoadingdRef.current = 1;
                                    set_loadingMsg(Constant.UPLOAD_OBS_DATA_MSG);
                                    submitOBSObj();

                                }

                            }

                        }

                    } else {

                        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.NETWORK_TYPE_WIFI,true,1,NETWORK_TYPE,false,'OK','');

                    }

                }

            }

        }

    };

    const compressioProcess = async () => {

        if(fbIndex.current < actualIndex.current){

            if(totalImgArray.current[fbIndex.current].filePath && totalImgArray.current[fbIndex.current].filePath!='') {

                let result = await compressImage(totalImgArray.current[fbIndex.current].filePath);
                let objImage = {
                    'filePath':totalImgArray.current[fbIndex.current].filePath,
                    'fbFilePath':totalImgArray.current[fbIndex.current].fbFilePath ? totalImgArray.current[fbIndex.current].fbFilePath : '',
                    'fileName': totalImgArray.current[fbIndex.current].fileName,
                    'observationPhotoId' : totalImgArray.current[fbIndex.current].observationPhotoId,
                    'localThumbImg': totalImgArray.current[fbIndex.current].localThumbImg,
                    'fileType':totalImgArray.current[fbIndex.current].fileType,
                    "isDeleted": totalImgArray.current[fbIndex.current].isDeleted,
                    "actualFbThumFile": totalImgArray.current[fbIndex.current].actualFbThumFile,
                    'thumbFilePath':totalImgArray.current[fbIndex.current].thumbFilePath,
                    "compressedFile":result
                }

                set_loadingMsg('Uploading image ' + totalImgArray.current[fbIndex.current].fileName);
                uploadImageToFB(objImage);

            } else {

                let obj = {
                    'filePath':totalImgArray.current[fbIndex.current].filePath,
                    'fbFilePath':totalImgArray.current[fbIndex.current].fbFilePath ? totalImgArray.current[fbIndex.current].fbFilePath : '',
                    'fileName': totalImgArray.current[fbIndex.current].fileName,
                    'observationPhotoId' : totalImgArray.current[fbIndex.current].observationPhotoId,
                    'localThumbImg': totalImgArray.current[fbIndex.current].localThumbImg,
                    'fileType':totalImgArray.current[fbIndex.current].fileType,
                    "isDeleted": totalImgArray.current[fbIndex.current].isDeleted,
                    "actualFbThumFile": totalImgArray.current[fbIndex.current].actualFbThumFile,
                    'thumbFilePath':totalImgArray.current[fbIndex.current].thumbFilePath,
                    "compressedFile":totalImgArray.current[fbIndex.current].compressedFile
                }

                set_loadingMsg('Uploading image ' + totalImgArray.current[fbIndex.current].fileName);
                finalImgArray.current.push(obj);
                fbIndex.current = fbIndex.current+1;
                
                compressioProcess();
            }           
            
        } else {
            set_loadingMsg(Constant.UPLOAD_OBS_DATA_MSG);
            submitOBSObj();
        }

    };

    const compressImage = async (imgPath) => {

        const result = await Image.compress(imgPath, {
            compressionMethod: 'auto',
        });

        return result;

    };

    const uploadImageToFB = async (imgObj) => {

        let behId = !selectedBehaviour.behaviorId ? 0 : parseInt(selectedBehaviour.behaviorId);
        let dte = moment(new Date()).format("YYYYMMDDHHmmss");
        let filename = "Observation_Images/"+selectedPet.petID.toString() + behId.toString() + dte+"."+"jpg";
        let reference = storage().ref(filename); // 2
        let task = reference.putFile(imgObj.compressedFile); // 3
            task.on('state_changed', taskSnapshot => {
            });

            task.then(() => {
            storage().ref(filename).getDownloadURL().then((url) => {        
            if(actualIndex.current===1){
                
                let obj = {
                    'filePath':imgObj.filePath,
                    'fbFilePath':""+url,
                    'fileName': imgObj.fileName,
                    'observationPhotoId' : imgObj.observationPhotoId,
                    'localThumbImg': imgObj.localThumbImg,
                    'fileType':imgObj.fileType,
                    "isDeleted": imgObj.isDeleted,
                    "actualFbThumFile": imgObj.actualFbThumFile,
                    'thumbFilePath':imgObj.thumbFilePath,
                    "compressedFile":imgObj.compressedFile
                }

                finalImgArray.current.push(obj);
                submitOBSObj(); 

            } else {    
                    
                    let obj = {
                        'filePath':imgObj.filePath,
                        'fbFilePath':""+url,
                        'fileName': imgObj.fileName,
                        'observationPhotoId' : imgObj.observationPhotoId,
                        'localThumbImg': imgObj.localThumbImg,
                        'fileType':imgObj.fileType,
                        "isDeleted": imgObj.isDeleted,
                        "actualFbThumFile": imgObj.actualFbThumFile,
                        'thumbFilePath':imgObj.thumbFilePath,
                        "compressedFile":imgObj.compressedFile
                    }
    
                    finalImgArray.current.push(obj);
                    fbIndex.current = fbIndex.current+1;
                    compressioProcess();

            }
            
              
            });
        }).catch((error) => {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_loadingMsg(undefined);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_IMG_FB_MSG,true,1,FAIL_OBS,false,'OK','');
        });

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
    
    const deleteSelectedMedia = async () => {

        let obj = undefined;
        if(isEdit){

            if(deleteSelectedMediaFile.current.observationVideoId && deleteSelectedMediaFile.current.observationVideoId!==''){

                obj = {
                    "actualFbThumFile": deleteSelectedMediaFile.current.actualFbThumFile,
                    "fbFilePath": deleteSelectedMediaFile.current.fbFilePath ? deleteSelectedMediaFile.current.fbFilePath : '',
                    "fileName": deleteSelectedMediaFile.current.fileName,
                    "filePath": deleteSelectedMediaFile.current.filePath,
                    "fileType": deleteSelectedMediaFile.current.fileType,
                    "isDeleted": 1,
                    "localThumbImg": deleteSelectedMediaFile.current.localThumbImg,
                    "observationVideoId": deleteSelectedMediaFile.current.observationVideoId,
                    'thumbFilePath':deleteSelectedMediaFile.current.thumbFilePath,
                    'compressedFile':deleteSelectedMediaFile.current.compressedFile,
                    "videoStartDate" : deleteSelectedMediaFile.current.videoStartDate,
                    "videoEndDate" : deleteSelectedMediaFile.current.videoEndDate,
                  }

            } else if(deleteSelectedMediaFile.current.observationPhotoId && deleteSelectedMediaFile.current.observationPhotoId!==''){

                obj = {
                    "actualFbThumFile": deleteSelectedMediaFile.current.actualFbThumFile,
                    "fbFilePath": deleteSelectedMediaFile.current.fbFilePath ? deleteSelectedMediaFile.current.fbFilePath : '',
                    "fileName": deleteSelectedMediaFile.current.fileName,
                    "filePath": deleteSelectedMediaFile.current.filePath,
                    "fileType": deleteSelectedMediaFile.current.fileType,
                    "isDeleted": 1,
                    "localThumbImg": deleteSelectedMediaFile.current.localThumbImg,
                    "observationPhotoId": deleteSelectedMediaFile.current.observationPhotoId,
                    'thumbFilePath':deleteSelectedMediaFile.current.thumbFilePath,
                    'compressedFile':deleteSelectedMediaFile.current.compressedFile
                  }

            }

            deletedMedia.current.push(obj);
            } else {
                deletedMedia.current = [];
            }

            // deletedMedia.current.push(mediaArray[deleteIndex.current]);
            let resultArray = await deleteObsObj(mediaArray,deleteSelectedMediaFile.current.fileName);
            finalImgArray.current = resultArray;
            await DataStorageLocal.saveDataToAsync(Constant.DELETE_MEDIA_RECORDS, JSON.stringify(resultArray));
            set_mediaArray(resultArray);

    };

    const deleteFBFile =()=> {

        let filePath= undefined;

        if(deletedMedia.current[deleteCount.current].fbFilePath) {
          filePath = deletedMedia.current[deleteCount.current].fbFilePath;
        } 

        if(filePath){

          const storageRef = storage().refFromURL(filePath);
          const imgRef = storage().ref(storageRef.fullPath);
          imgRef.delete().then(()=>{
            deleteCount.current = deleteCount.current + 1;
            if(deleteCount.current < totalCount.current){
                deleteFBFile();
            } else {
                set_isLoading(false);
                isLoadingdRef.current = 0;    
                set_loadingMsg(undefined);
                navigateToOBSList();
            }
          }).catch((e)=>{

            deleteCount.current = deleteCount.current + 1;
            if(deleteCount.current < totalCount.current){
                deleteFBFile();
            } else {
                set_isLoading(false);
                isLoadingdRef.current = 0;  
                set_loadingMsg(undefined);
                navigateToOBSList();
            }

          })

        } else {

            set_isLoading(false);
            isLoadingdRef.current = 0;  
            set_loadingMsg(undefined);
            navigateToOBSList();

        }    

    };

    const deleteObsObj = async (arrayMedia,id) => {

        let tempArray = arrayMedia;
        const tasks = tempArray.filter(task => task.fileName !== id);
        let temp = tasks;  
        return temp;
  
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
            deleteSelectedMedia();
            popCancelBtnAction();

        }else if(popupId === NETWORK_TYPE || popupId === FAIL_NETWORK || popupId === FAIL_OBS) {
            popCancelBtnAction();
        }else if(popupId === SEND_OBS_COMPRESS_UPLOAD) {
            /// Start compression and navigate

            let imgArray = [];
            let vidArry = [];

            if(deletedMedia.current && deletedMedia.current.length > 0){
                for (let i = 0; i < deletedMedia.current.length; i++) {
    
                    let tempObj = {}
                    let rNumber = await generatRandomNubmer.generateRandomNumber();

                    if(deletedMedia.current[i] && deletedMedia.current[i].fileType === 'image'){
    
                        tempObj = {

                            "id": rNumber,
                            "localPath":deletedMedia.current[i].filePath,
                            "fbFileURL":deletedMedia.current[i].fbFilePath,
                            "fileName":deletedMedia.current[i].fileName,
                            "thumbFilePath" : deletedMedia.current[i].thumbFilePath,
                            "observationMediaId": deletedMedia.current[i].observationPhotoId,
                            "isDeleted": deletedMedia.current[i].isDeleted

                        }
    
                        imgArray.push(tempObj);
    
                    } else if(deletedMedia.current[i] && deletedMedia.current[i].fileType === 'video'){

                        tempObj = {
                            "id": rNumber,
                            "localPath": deletedMedia.current[i].filePath,
                            "fbFileURL":deletedMedia.current[i].fbFilePath,
                            "fileName": deletedMedia.current[i].fileName,
                            "thumbnailURL":deletedMedia.current[i].actualFbThumFile,
                            "thumbFilePath":deletedMedia.current[i].thumbFilePath,
                            "observationMediaId": deletedMedia.current[i].observationVideoId,
                            "isDeleted": deletedMedia.current[i].isDeleted,
                            "videoStartDate" : deletedMedia.current[i].videoStartDate,
                            "videoEndDate" : deletedMedia.current[i].videoEndDate,
                        }
    
                        vidArry.push(tempObj);
    
                    }
    
                }
            } 
            
            if(finalImgArray.current && finalImgArray.current.length>0){

                for (let i = 0; i < finalImgArray.current.length; i++) {
                    let rNumber = await generatRandomNubmer.generateRandomNumber();
                    if(finalImgArray.current && finalImgArray.current[i].fileType === 'video'){
    
                        let obj = {
                            "id": rNumber,
                            "localPath":finalImgArray.current[i].filePath,
                            "fbFileURL":""+finalImgArray.current[i].fbFilePath,
                            "fileName": finalImgArray.current[i].fileName,
                            "filePath": finalImgArray.current[i].filePath,
                            "thumbnailURL":finalImgArray.current[i].actualFbThumFile,
                            "thumbFilePath":finalImgArray.current[i].thumbFilePath,
                            "isDeleted": finalImgArray.current[i].isDeleted,
                            "observationMediaId": finalImgArray.current[i].observationVideoId,
                            "videoStartDate" : finalImgArray.current[i].videoStartDate,
                            "videoEndDate" : finalImgArray.current[i].videoEndDate,
                        }
        
                        vidArry.push(obj);
    
                    } else if(finalImgArray.current[i] && finalImgArray.current[i].fileType === 'image'){
                        let obj = {

                            "id": rNumber,
                            "localPath":finalImgArray.current[i].filePath,
                            "fbFileURL":finalImgArray.current[i].fbFilePath,
                            "fileName":finalImgArray.current[i].fileName,
                            "thumbFilePath" : finalImgArray.current[i].thumbFilePath,
                            "observationMediaId": finalImgArray.current[i].observationPhotoId,
                            "isDeleted": finalImgArray.current[i].isDeleted

                        }
        
                        imgArray.push(obj);
    
                    }
    
                }

            }

            popCancelBtnAction();
              
            let rNumber = await generatRandomNubmer.generateRandomNumber();
            let obsObj = {
                "id" : rNumber,
                "petId" : selectedPet.petID,
                "obsText" : obsText,
                "behaviorId": selectedBehaviour.behaviorId,
                "behaviorName": selectedBehaviour.behaviorName,
                "observationDateTime": selectedDate,
                "emotionIconsText": "",
                "seizuresDescription": "",
                "videos": vidArry,
                "photos": imgArray,
                "imageUploadStatus" : '',
                "videoUploadStatus" : '',
                "uploadToBackendStatus" : '', 
                "thumbnailUploadStatus" : '', 
                "observationId": obsObject.observationId           
            }

            let obsData = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
            obsData = JSON.parse(obsData);

            let tempArray=[];

            if(obsData && obsData.length > 0){
                tempArray = obsData;
            }

            tempArray.push(obsObj);

            await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_UPLOAD_DATA, JSON.stringify(tempArray));
            let uploadProcess = await DataStorageLocal.getDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
            if(!uploadProcess){
                Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND,data: {data: { obsData:'checkForUploads',__typename: 'UploadVideoBackground'}},})
            }
            navigation.navigate('DashBoardService');

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
            navigation.navigate("UploadObsVideoComponent");    
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