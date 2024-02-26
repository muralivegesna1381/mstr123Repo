import React, { useState, useEffect, useRef } from 'react';
import * as Queries from "../../../config/apollo/queries.js";
import { useQuery } from "@apollo/react-hooks";
import * as Constant from "../../constants/constant.js";
import * as internetCheck from "../../internetCheck/internetCheck.js";
import * as DataStorageLocal from "../../storage/dataStorageLocal.js";
import {View} from 'react-native';
import AlertComponent from '../../commonComponents/alertComponent.js';
import CommonStyles from '../../commonStyles/commonStyles.js';
import * as VideoProcess from '../videoProcessingComponent/videoProcessingComponent.js';
import * as Apolloclient from '../../../config/apollo/apolloConfig.js';
import * as ServiceCalls from '../../getServicesData/getServicesData.js';
import * as AuthoriseCheck from '../../authorisedComponent/authorisedComponent.js';

var RNFS = require('react-native-fs');

const VideoBackgroundUpload = ({navigation, route,...props }) => {

    const { loading, data : videoUploadData } = useQuery(Queries.UPLOAD_VIDEOS_BACKGROUND, { fetchPolicy: "cache-only" });

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popAlert, set_popAlert] = useState(undefined);
    const [popRightBtnTitle, set_popRightBtnTitle] = useState(undefined);

    var videosArray = useRef([]);
    var holdMediaArray = useRef([]);
    var actualMediaLength = useRef(0);
    var completeMediaLength= useRef(0);
    var mediaType = useRef(0);
    var petName = useRef('');

    useEffect (() => {

        if(videoUploadData && videoUploadData.data.__typename === 'UploadVideosBackground') {
            checkInternetStatus();
        }

    },[videoUploadData]);

    const checkInternetStatus = async () => {

        let vidsData = await DataStorageLocal.getDataFromAsync(Constant.VIDEOS_UPLOAD_DATA);
        vidsData = JSON.parse(vidsData);
        if(vidsData){

            let internetType = await internetCheck.internetTypeCheck();
            if(internetType === 'wifi'){
                    petName.current = vidsData[0].petName;
                    startUploadingProcess(); 
            } else {

                await DataStorageLocal.removeDataFromAsync(Constant.VIDEOS_UPLOAD_PROCESS_STARTED);  
                statusOfUpload(vidsData[0].obsText,'Please Wait... ','','Uploading','notWi-Fi');
                
            }

        }

    };

    const startUploadingProcess = async () => {

        let uploadProcess = await DataStorageLocal.getDataFromAsync(Constant.VIDEOS_UPLOAD_PROCESS_STARTED);
        await DataStorageLocal.removeDataFromAsync(Constant.VIDEOS_UPLOAD_PROCESS_STARTED);
        if(!uploadProcess){    
            checkVideoUploadData();
        }

    };

    const checkVideoUploadData = async () => {

        let vidsData = await DataStorageLocal.getDataFromAsync(Constant.VIDEOS_UPLOAD_DATA);
        vidsData = JSON.parse(vidsData);
        if(vidsData && vidsData.length > 0) {
    
            // statusOfUpload(vidsData[0].obsText,'Please Wait... ','','Uploading','wifi');
            Apolloclient.client.writeQuery({query: Queries.VIDEO_UPLOAD_BACKGROUND_STATUS,data: {data: {
                obsVidName : vidsData[0].obsText, 
                statusUpload : 'Please Wait... ',
                fileName : '',
                uploadProgress: 'waiting',
                progressTxt:'' ,
                stausType:'Uploading',
                mediaTYpe:'',
                internetType:'wifi',
                uploadMode:'backGround',
                __typename: 'videoUploadBackgroundStatus'
            }},})

            await DataStorageLocal.saveDataToAsync(Constant.VIDEOS_UPLOAD_PROCESS_STARTED,'Started');
            let vidsData1 = vidsData[0].videos;
            if(vidsData1) {

                videosArray.current = vidsData1;

            }
            if(videosArray.current && videosArray.current.length) { 
                completeMediaLength.current = 0;
                actualMediaLength.current = videosArray.current.length;
                mediaType.current = 'video';
            } 

            startProcessingMedia(vidsData);
            
        }
   
    };

    const startProcessingMedia = async (vidsData) => {

        if(mediaType.current === 'video') {

            let pendingUploads = 10;
            for (let i = 0; i < videosArray.current.length; i++) {
                if (videosArray.current[i].fbFilePath === '') {
                    pendingUploads = i;
                    break;
                } 
            }

            completeMediaLength.current = pendingUploads;
                
            if(completeMediaLength.current < actualMediaLength.current) {
                processMedia(vidsData,videosArray.current);
                return;
            } else {
                ///// Videos C0mpleted
            }

        } 

    };

    const processMedia = async (videosData,mArray) => {

        let petId = videosData[0].petId;
        let client = videosData[0].loginUserId;
        let behaviorId = videosData[0].behaviorId;
        let obsName = videosData[0].obsText;
        // let fileDate = videosData[0].photos[completeMediaLength.current].fileDate;
        let fbObj = undefined;
        if(mediaType.current === 'video' && mArray[completeMediaLength.current].filePath !=="") {
            fbObj = await VideoProcess.prepareVideos(mArray[completeMediaLength.current],petId,client,behaviorId,'backGround',obsName);
            mArray[completeMediaLength.current] = fbObj;
        } 

        if(fbObj) {
            holdMediaArray.current.push(fbObj);
        }
        
        completeMediaLength.current = completeMediaLength.current + 1;
        if(completeMediaLength.current < actualMediaLength.current) {
            processMedia(videosData,mArray);
        } else {

            let vidArray = [];
            let totalFilesFound = 0;
            let totalFilesNotfound = 0;

            if(mArray.length > 0) {

                totalFilesFound = totalFilesFound + mArray.length;

                for (let i = 0; i < mArray.length; i++){

                    if(mArray[i] !== 'nofileFound'){
    
                        let vidObj = {
                            "observationVideoId": mArray[i].observationVideoId,
                            "videoName": mArray[i].fileName,
                            "videoUrl": mArray[i].fbFilePath,
                            "videoThumbnailUrl": mArray[i].thumbFilePath,
                            "isDeleted": mArray[i].isDeleted,
                            "videoStartDate" : mArray[i].videoStartDate,
                            "videoEndDate" : mArray[i].videoEndDate,
                        }
    
                        vidArray.push(vidObj);
    
                    } else {
    
                        totalFilesNotfound = totalFilesNotfound + 1;
    
                    }
                }

                // statusOfUpload(videosData[0].obsText,'Please Wait... ','done','Uploading','wifi');
                Apolloclient.client.writeQuery({query: Queries.VIDEO_UPLOAD_BACKGROUND_STATUS,data: {data: {
                    obsVidName : videosData[0].obsText, 
                    statusUpload : 'Please Wait... ',
                    fileName : '',
                    uploadProgress: 'done',
                    progressTxt:'' ,
                    stausType:'Uploading',
                    mediaTYpe:'',
                    internetType:'wifi',
                    uploadMode:'backGround',
                    __typename: 'videoUploadBackgroundStatus'
                }},})
                videosData[0].videos = vidArray;
                serviceCallToBackend(videosData,totalFilesFound,totalFilesNotfound);
            }
            
        }

        return;

    };

    const serviceCallToBackend = async (vidsData,totalFilesFound,totalFilesNotfound) => {

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let sendObsServiceObj = await ServiceCalls.savePetObservation(vidsData[0],token);

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

            let filesNotFailed = totalFilesFound-totalFilesNotfound;
            let filesStatus = undefined;

            if(filesNotFailed === totalFilesFound) {
                filesStatus = 'success'
            } else  {

                if(filesNotFailed === 0){
                    filesStatus = 'ObsSuccessful'
                } else {
                    filesStatus = 'someMediaFailed'
                }

            }

            updateObservationData('success',vidsData[0],filesStatus);

        } else {
            
            // createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,1,FAIL_OBS,false,'OK','');
        }
  
        if(sendObsServiceObj && sendObsServiceObj.error) {

            // createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,1,FAIL_OBS,false,'OK','');
        }


    };

    const updateObservationData = async (status,obj,filesStatus) => {

        let obsData = await DataStorageLocal.getDataFromAsync(Constant.VIDEOS_UPLOAD_DATA);
        obsData = JSON.parse(obsData);
        if(status==='success'){

            let alrtMsg = '';
            let alrtTitle = '';
            // if(filesStatus === 'success'){
            //     alrtTitle = Constant.ALERT_INFO;
            //     alrtMsg = "The Observation " + '"' + obj.obsText + '"'+" is submitted successfully";
            // } else if(filesStatus === 'ObsSuccessful'){
            //     alrtTitle = "Sorry!"
            //     alrtMsg = "The Observation  " + '"' + obj.obsText + '"'+" is submitted successfully, but we are unable to upload your media";
            // }else {
            //     alrtTitle = "Sorry";
            //     alrtMsg = "The Observation  " + '"' + obj.obsText + '"'+" is submitted successfully, but we are unable to upload some of your media";
            // }

            // createPopup(alrtTitle,alrtMsg,'OK',true);
            createPopup(Constant.ALERT_INFO,"The Observation " + '"' + obj.obsText + '"'+" is submitted successfully",'OK',true);
            deleteObsObj(obj.rNumber);

        } else {
            createPopup("Sorry","The Observation " + '"' + obj.obsText + '"'+" is can't be uploaded. Please try again later",'OK',true);
        }

    };

    const deleteObsObj = async (id) => {
        
        let obsData = await DataStorageLocal.getDataFromAsync(Constant.VIDEOS_UPLOAD_DATA);
        obsData = JSON.parse(obsData);
        let tasks = []
        if(obsData) {
            let tempArray = obsData;
            tasks = tempArray.filter(task => task.rNumber !== id);
        }
        
        videosArray.current = [];
        holdMediaArray.current = [];
        actualMediaLength.current = 0;
        completeMediaLength.current = 0;
        mediaType.current = 0;
        petName.current = '';
        if(tasks.length > 0){   
            await DataStorageLocal.saveDataToAsync(Constant.VIDEOS_UPLOAD_DATA, JSON.stringify(tasks));          
            checkVideoUploadData();
        } else {
            await DataStorageLocal.removeDataFromAsync(Constant.VIDEOS_UPLOAD_DATA); 
            // statusOfUpload(obsData[0].obsText,'Uploading Done','done','Uploading Done','wifi');
            Apolloclient.client.writeQuery({query: Queries.VIDEO_UPLOAD_BACKGROUND_STATUS,data: {data: {
                obsVidName : obsData ? obsData[0].obsText : '', 
                statusUpload : 'Uploading Done',
                fileName : '',
                uploadProgress: 'done',
                progressTxt:'' ,
                stausType:'Uploading Done',
                mediaTYpe:'',
                internetType:'wifi',
                uploadMode:'backGround',
                __typename: 'videoUploadBackgroundStatus'
            }},})
            await DataStorageLocal.removeDataFromAsync(Constant.VIDEOS_UPLOAD_PROCESS_STARTED);   
        }

    };

    const statusOfUpload = async (obsName,statusUpload,uploadProgress,stausType,internetType) => {

        Apolloclient.client.writeQuery({query: Queries.VIDEO_UPLOAD_BACKGROUND_STATUS,data: {data: {
            obsVidName : obsName, 
            statusUpload : statusUpload,
            fileName : '',
            uploadProgress: uploadProgress,
            progressTxt:'' ,
            stausType:stausType,
            mediaTYpe:'',
            internetType:internetType,
            uploadMode:'backGround',
            __typename: 'videoUploadBackgroundStatus'
        }},})

    }

    const createPopup = (title,msg,rTitle,isPopup) => {

        set_popAlert(title);
        set_popUpMessage(msg);
        set_popRightBtnTitle(rTitle);
        set_isPopUp(isPopup);

    };

    const popOkBtnAction = () => {
        createPopup('','',"OK",false)
    };

    const popCancelBtnAction = () => {
        createPopup('','',"OK",false)
    };

    return (
        <>      
            {isPopUp ? <View style={CommonStyles.customPopUpGlobalStyle}>
                <AlertComponent
                    header = {popAlert}
                    message={popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {popRightBtnTitle}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}
        </>
        
    );

};
export default VideoBackgroundUpload;