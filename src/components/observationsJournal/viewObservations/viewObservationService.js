import React, { useState, useEffect, useRef } from 'react';
import {View,BackHandler} from 'react-native';
import ViewObservationComponent from './viewObservationComponent';
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import storage, { firebase } from '@react-native-firebase/storage';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import * as ServiceCalls from './../../../utils/getServicesData/getServicesData.js';
import { parse } from 'qs';

const OBS_DELETE = 1;
const OBS_EDIT = 2;

let trace_Get_Behaviors_API_Complete;
let trace_inViewObservation;

const  ViewObservationService = ({navigation, route, ...props }) => {

  const [obsObject, set_obsObject] = useState(undefined);
  const [isLoading, set_isLoading] = useState(false);
  const [behavioursData, set_behavioursData] = useState(undefined);
  const [mediaArray, set_mediaArray] = useState([]);
  const [behItem, set_behItem] = useState([]);
  const [isEdit, set_isEdit] = useState(undefined);

  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [popUplftBtnEnable, set_popUplftBtnEnable] = useState(false);
  const [popUplftBtnTitle, set_popUplftBtnTitle] = useState('');
  const [popupId, set_popupId] = useState(0);
  const [popupRgtBtnTitle, set_popupRgtBtnTitle] = useState('')
  const [date, set_Date] = useState(new Date());
  
  let deleteCount = useRef(0);
  let totalCount = useRef(0);
  let behTypeId = useRef(0);
  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);

  React.useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    const focus = navigation.addListener("focus", () => {

      set_Date(new Date());
      firebaseHelper.reportScreen(firebaseHelper.screen_view_observations);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_view_observations, "User in View Observation Screen", ''); 
      viewObservationsSessionStart();

      set_isLoading(true);
      isLoadingdRef.current = 1;
      behavioursAPIRequest();

    });

    const unsubscribe = navigation.addListener('blur', () => {
      viewObservationsSessionStop();
    });

    return () => {
      focus();
      unsubscribe();
      viewObservationsSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };

  }, [navigation]);

  useEffect(() => {
    if(route.params?.obsObject){
      prepareObservation(route.params?.obsObject);
    }
  }, [route.params?.obsObject]);

  const viewObservationsSessionStart = async () => {
    trace_inViewObservation = await perf().startTrace('t_inViewObservation');
  };

  const viewObservationsSessionStop = async () => {
    await trace_inViewObservation.stop();
  };

  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  const prepareObservation = (obsObject) => {

    if(obsObject){

      set_obsObject(obsObject);
      behTypeId.current = obsObject.behaviorId
      let tempArray = [];
      if(obsObject.behaviorTypeId && (parseInt(obsObject.behaviorTypeId) === 3 || parseInt(obsObject.behaviorTypeId) === 4)) {
        set_isEdit(true);
      } else {
        set_isEdit(false);
      }

      if(obsObject.photos && obsObject.photos.length>0){

        for (let i = 0; i < obsObject.photos.length; i++){

          if(obsObject.photos[i].filePath!==''){
            let pObj = {
              fileName: obsObject.photos[i].fileName,
              filePath: obsObject.photos[i].filePath,
              isDeleted: obsObject.photos[i].isDeleted,
              observationPhotoId: obsObject.photos[i].observationPhotoId,
              type:'image'
            }
            tempArray.push(pObj);
          }
               
        }
            
      }

      if(obsObject.videos && obsObject.videos.length>0){
        for (let i = 0; i < obsObject.videos.length; i++){
          let pObj = {
            videoName: obsObject.videos[i].videoName,
            videoUrl: obsObject.videos[i].videoUrl,
            isDeleted: obsObject.videos[i].isDeleted,
            observationVideoId: obsObject.videos[i].observationVideoId,
            type:'video',
            videoStartDate : obsObject.videos[i].videoStartDate,
            videoEndDate : obsObject.videos[i].videoEndDate,
            videoThumbnailUrl: obsObject.videos[i].videoThumbnailUrl
            }
          tempArray.push(pObj);
        }
      }

      set_mediaArray(tempArray);
      totalCount.current = tempArray.length;
    }
  }

  const behavioursAPIRequest = async () => {
    getDefaultData();
  };

  const getDefaultData = async () => {

    let defPet = await DataStorageLocal.getDataFromAsync(Constant.OBS_SELECTED_PET);
    defPet = JSON.parse(defPet);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

    let id = 1;
    if(defPet && defPet.speciesId){
      id = defPet.speciesId;
    }
    firebaseHelper.logEvent(firebaseHelper.event_behaviors_api, firebaseHelper.screen_view_observations, "Initiated Get Behaviors Api", 'Species Id : '+id);
    trace_Get_Behaviors_API_Complete = await perf().startTrace('t_Get_Behaviors_API');
    getBehavioursFromBckEnd(id,token);
  };

  const getBehavioursFromBckEnd = async (id,token) => {

    let getBehServiceObj = await ServiceCalls.getPetBehaviors(id,token);
    set_isLoading(false);
    isLoadingdRef.current = 0;
    stopFBTraceGetBehaviors();

    if(getBehServiceObj && getBehServiceObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }
        
    if(getBehServiceObj && !getBehServiceObj.isInternet){
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,false,'OK',true,0,'');
      return;
    }
  
    if(getBehServiceObj && getBehServiceObj.statusData){

      if(getBehServiceObj.responseData && getBehServiceObj.responseData.length > 0){
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_behavioursData(getBehServiceObj.responseData);
        getBehaviourName(getBehServiceObj.responseData);                 
      } else {
        set_behavioursData(undefined);     
      }
        
    } else {
      firebaseHelper.logEvent(firebaseHelper.event_behaviors_api_fail, firebaseHelper.screen_view_observations, "Get Behaviors Api Failed", 'Service Status : false ');
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,false,'OK',true,0,'');
    }
  
    if(getBehServiceObj && getBehServiceObj.error) {
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,false,'OK',true,0,'');
      let errors = getBehServiceObj.error.length > 0 ? getBehServiceObj.error[0].code : '';
      firebaseHelper.logEvent(firebaseHelper.event_behaviors_api_fail, firebaseHelper.screen_view_observations, "Get Behaviors Api Failed", 'error : '+errors);
    }
  };

  const stopFBTraceGetBehaviors = async () => {
    await trace_Get_Behaviors_API_Complete.stop();
  };

  const getBehaviourName = async (bData) => {
    let bText = await findArrayElement(bData,behTypeId.current);
    set_behItem(bText);      
  };

  function findArrayElement(array, behaviorType) {
    return array.find((element) => {
      return element.behaviorId === behaviorType;
    })
  };

  const deleteButtonAction = (item) => {
    createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.DELETE_OBS_MSG,true,'YES',true,OBS_DELETE,'NO');
  };

  const navigateToPrevious = () => { 
      
    if(isLoadingdRef.current === 0 && popIdRef.current === 0){
      firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_view_observations, "User clicked on back button to navigate to ObservationsListComponent", '');
      navigation.navigate('ObservationsListComponent');
    }
      
  };

  const viewAction = async (item) => {
    if(item.type==='video'){
      navigation.navigate('ViewPhotoComponent',{mediaURL:item.videoUrl,mediaType:item.type});
    }   
  };

  const leftButtonAction = () => {
    createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.EDIT_OBS_MSG,true,'YES',true,OBS_EDIT,'NO');
  };

  const deleteObservationBcknd = async (obsId,petId) => {

    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

    let deleteObsServiceObj = await ServiceCalls.deleteObservations(obsId,petId,clientId,token);
    if(deleteObsServiceObj && deleteObsServiceObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      firebaseHelper.logEvent(firebaseHelper.event_delete_observation_api_fail, firebaseHelper.screen_view_observations, "Deleting Observation(id) Fail", 'Unautherised');
      return;
    }
          
    if(deleteObsServiceObj && !deleteObsServiceObj.isInternet){
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,false,'OK',true,0,'');
      firebaseHelper.logEvent(firebaseHelper.event_delete_observation_api_fail, firebaseHelper.screen_view_observations, "Deleting Observation(id) Fail", 'Internet : false');
      return;
    }
    
    if(deleteObsServiceObj && deleteObsServiceObj.statusData){

      if(totalCount.current > 0){
        isLoadingdRef.current = 0;
        navigateToPrevious();
      } else {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        navigateToPrevious();
      }
          
    } else {
      firebaseHelper.logEvent(firebaseHelper.event_delete_observation_api_fail, firebaseHelper.screen_view_observations, "Deleting Observation(id) Fail : "+obsId, 'Pet Id : '+petId);
      set_isLoading(false);
      isLoadingdRef.current = 0;
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,false,'OK',true,0,'');
    }
    
    if(deleteObsServiceObj && deleteObsServiceObj.error) {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,false,'OK',true,0,'');
      let errors = deleteObsServiceObj.error.length > 0 ? deleteObsServiceObj.error[0].code : '';
      firebaseHelper.logEvent(firebaseHelper.event_delete_observation_api_fail, firebaseHelper.screen_view_observations, "Deleting Observation(id) Fail", 'error : '+errors);
    }

  };

  const deleteFBFile =()=> {

    let filePath;

    if(mediaArray[deleteCount.current].filePath) {
      filePath = mediaArray[deleteCount.current].filePath;
    } else if(mediaArray[deleteCount.current].videoUrl) {
      filePath = mediaArray[deleteCount.current].videoUrl;
    } 
    if(filePath){

      const storageRef = storage().refFromURL(filePath);
      const imgRef = storage().ref(storageRef);

      storageRef.delete().then(()=> {
        deleteCount.current = deleteCount.current + 1;
        if(deleteCount.current < totalCount.current){
          deleteFBFile();
        } else {
          set_isLoading(false);
          isLoadingdRef.current = 0;
          navigateToPrevious();
        }
      }).catch((e)=>{
            
        deleteCount.current = deleteCount.current + 1;
        if(deleteCount.current < totalCount.current){
          deleteFBFile();
        } else {
          set_isLoading(false);
          isLoadingdRef.current = 0;
          navigateToPrevious();
        }

      })

    } else {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      navigateToPrevious();

    }    

  };

  const createPopup = (title,msg,isLftBtn,rBtnTitle,isPop,popId,lftBtnTitle) => {
    set_popUpAlert(title);
    set_popUpMessage(msg);
    set_popUplftBtnEnable(isLftBtn);
    set_popupRgtBtnTitle(rBtnTitle);
    set_isPopUp(isPop);
    set_popupId(popId);
    set_popUplftBtnTitle(lftBtnTitle);
    popIdRef.current = 1;
  };

  const popOkBtnAction = async () => {

    if(popupId === OBS_DELETE){

      set_isLoading(true);
      isLoadingdRef.current = 1;
      deleteObservationBcknd(obsObject.observationId,obsObject.petId);

    } else if(popupId === OBS_EDIT){

      let defPet = await DataStorageLocal.getDataFromAsync(Constant.OBS_SELECTED_PET);
      defPet = JSON.parse(defPet);

      let tempArray = [];

      if(obsObject){

        if(obsObject.photos && obsObject.photos.length>0){

          for (let i = 0; i < obsObject.photos.length; i++){

            if(obsObject.photos[i].filePath && obsObject.photos[i].filePath!==''){

              let imgObj = {
                'filePath':'',
                'fbFilePath':obsObject.photos[i].filePath,
                'fileName': obsObject.photos[i].fileName,
                'observationPhotoId' : obsObject.photos[i].observationPhotoId,
                'localThumbImg': '',
                'fileType':'image',
                "isDeleted": 0,
                "actualFbThumFile": '',
                "thumbFilePath":'',
                "compressedFile":''
              };
              tempArray.push(imgObj);

            }

          }

        } 
        if (obsObject && obsObject.videos && obsObject.videos.length>0){

          for (let i = 0; i < obsObject.videos.length; i++){

            if(obsObject.videos[i].videoUrl && obsObject.videos[i].videoUrl!==''){

              let vidObj = {
                'filePath':'',
                'fbFilePath':obsObject.videos[i].videoUrl,
                'fileName':obsObject.videos[i].videoName,//dateFile+"_#"+response.assets[i].fileName,
                'observationVideoId' : obsObject.videos[i].observationVideoId,
                'localThumbImg': obsObject.videos[i].videoThumbnailUrl,
                'fileType':'video',
                "isDeleted": 0,
                "actualFbThumFile": obsObject.videos[i].videoThumbnailUrl,
                'thumbFilePath':obsObject.videos[i].videoThumbnailUrl,
                'compressedFile':'',
                "videoStartDate" : obsObject.videos[i].videoStartDate,
                "videoEndDate" : obsObject.videos[i].videoEndDate,
              };
              tempArray.push(vidObj);

            }

          }

        }

      }

      let obsObj = {
        selectedPet : defPet,
        obsText : obsObject ? obsObject.obsText : '', 
        obserItem : behItem, 
        selectedDate : obsObject ? obsObject.observationDateTime : new Date(),  
        mediaArray: tempArray,
        fromScreen : 'viewObs',
        isPets : false,
        isEdit : true,
        behaviourItem : behItem, 
        observationId : obsObject.observationId,
        ctgNameId : obsObject.behaviorTypeId === 3 ? 0 : 1
      }

      firebaseHelper.logEvent(firebaseHelper.event_edit_observation_Action, firebaseHelper.screen_view_observations, "User clicked on the Observation(iD) Edit button : "+obsObject.observationId, 'Pet Id : '+defPet.petID);
      await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ, JSON.stringify(obsObj));
      navigation.navigate('ObservationComponent');

    }
    popCancelBtnAction();
      
  };

  const popCancelBtnAction = () => {
    set_popUpAlert(undefined);
    set_popUpMessage(undefined);
    set_popupId(undefined);
    set_popUplftBtnEnable(false);
    set_popupRgtBtnTitle(undefined);
    set_isPopUp(false);
    popIdRef.current = 0;
  };

  return (
    <ViewObservationComponent 
      obsObject = {obsObject}
      isLoading = {isLoading}
      behavioursData = {behavioursData}
      mediaArray = {mediaArray}
      popupRgtBtnTitle = {popupRgtBtnTitle}
      popUplftBtnEnable = {popUplftBtnEnable}
      popUplftBtnTitle = {popUplftBtnTitle}
      popUpMessage = {popUpMessage}
      popUpAlert = {popUpAlert}
      isPopUp = {isPopUp}
      isEdit = {isEdit}
      navigateToPrevious = {navigateToPrevious}
      deleteButtonAction = {deleteButtonAction}
      viewAction = {viewAction}
      leftButtonAction = {leftButtonAction}
      popCancelBtnAction = {popCancelBtnAction}
      popOkBtnAction = {popOkBtnAction}
    />
  );

}
  
export default ViewObservationService;