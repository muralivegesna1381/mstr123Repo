import React, { useState, useEffect, useRef } from 'react';
import * as Queries from "./../../../config/apollo/queries";
import { useQuery } from "@apollo/react-hooks";
import * as Constant from "./../../constants/constant";
import * as internetCheck from "./../../internetCheck/internetCheck";
import * as DataStorageLocal from "./../../storage/dataStorageLocal";
import {View} from 'react-native';
import AlertComponent from './../../commonComponents/alertComponent';
import CommonStyles from './../../commonStyles/commonStyles';
import * as ImageProgress from './../../mediaProcessingComponents/imageProcessComponent/imageProcessComponent';
import * as Apolloclient from './../../../config/apollo/apolloConfig';
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';

var RNFS = require('react-native-fs');

const ImageBackgrounUpload = ({navigation, route,...props }) => {

    const { loading, data : imageUploadData } = useQuery(Queries.UPLOAD_IMAGE_BACKGROUND, { fetchPolicy: "cache-only" });

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popAlert, set_popAlert] = useState(undefined);
    const [popRightBtnTitle, set_popRightBtnTitle] = useState(undefined);

    var imagesArray = useRef([]);
    var holdMediaArray = useRef([]);
    var actualMediaLength = useRef(0);
    var completeMediaLength= useRef(0);
    var mediaType = useRef(0);
    var petName = useRef('');

    useEffect (() => {

        if(imageUploadData && imageUploadData.data.__typename === 'UploadImageBackground') {
            checkInternetStatus();
        }

    },[imageUploadData]);

    const checkInternetStatus = async () => {

        let imgData = await DataStorageLocal.getDataFromAsync(Constant.IMAGE_UPLOAD_DATA);
        imgData = JSON.parse(imgData);

        if(imgData){

            let internetType = await internetCheck.internetTypeCheck();
            if(internetType === 'wifi'){
                petName.current = imgData[0].petName;
                startUploadingProcess(); 
            } else {

                await DataStorageLocal.removeDataFromAsync(Constant.IMAGES_UPLOAD_PROCESS_STARTED);  
                statusOfUpload(imgData[0].obsText,'Please Wait... ','','Uploading','notWi-Fi');
                
            }

        }

    };

    const startUploadingProcess = async () => {

        let uploadProcess = await DataStorageLocal.getDataFromAsync(Constant.IMAGES_UPLOAD_PROCESS_STARTED);
        if(!uploadProcess){    
            checkImageUploadData();
        }

    };

    const checkImageUploadData = async () => {

        let imagesData = await DataStorageLocal.getDataFromAsync(Constant.IMAGE_UPLOAD_DATA);
        imagesData = JSON.parse(imagesData);
        if(imagesData && imagesData.length > 0) {
    
            statusOfUpload(imagesData[0].obsText,'Please Wait... ','','Uploading','wifi');

            await DataStorageLocal.saveDataToAsync(Constant.IMAGES_UPLOAD_PROCESS_STARTED,'Started');
            let answersArray = imagesData[0].photos;

            if(answersArray) {

                imagesArray.current = answersArray;

            }
            if(imagesArray.current && imagesArray.current.length) { 
                let totalCount = 0
                for (let i = 0; i < imagesArray.current.length; i++) {
                    if(imagesArray.current[i].filePath !== "") {
                        totalCount = totalCount+1;
                    }
                }
                completeMediaLength.current = 0;
                actualMediaLength.current = imagesArray.current.length;
                mediaType.current = 'image';
            } 

            startProcessingMedia(imagesData);
            
        }
   
    };

    const startProcessingMedia = async (imagesData) => {

        if(mediaType.current === 'image') {

            let pendingUploads = 7;
            for (let i = 0; i < imagesArray.current.length; i++) {
                if (imagesArray.current[i].fbFilePath === '') {
                    pendingUploads = i;
                    break;
                } 
            }
            completeMediaLength.current = pendingUploads;
            if(completeMediaLength.current < actualMediaLength.current) {
                processMedia(imagesData,imagesArray.current);
                return;
            } else {
                ///// Images C0mpleted
            }

        } 

    };

    const processMedia = async (imagesData,mArray) => {

        let petId = imagesData[0].petId;
        let client = imagesData[0].loginUserId;
        let behaviorId = imagesData[0].behaviorId;
        let obsName = imagesData[0].obsText;
        let fileDate = imagesData[0].photos[completeMediaLength.current].fileDate;
        let fbObj = undefined;

        if(mediaType.current === 'image' && mArray[completeMediaLength.current].filePath !== "") {
            fbObj = await ImageProgress.prepareImages(mArray[completeMediaLength.current],mArray[completeMediaLength.current].fileName,mArray[completeMediaLength.current].filePath,petId,client,behaviorId,'backGround',fileDate,obsName);
            mArray[completeMediaLength.current] = fbObj;
        } 

        if(fbObj) {
            holdMediaArray.current.push(fbObj);
        }
        
        completeMediaLength.current = completeMediaLength.current + 1;
        
        if(completeMediaLength.current < actualMediaLength.current) {
            processMedia(imagesData,mArray);
        } else {

            let imgArray = [];
            let totalFilesFound = 0;
            let totalFilesNotfound = 0;

            if(mArray.length > 0) {

                totalFilesFound = totalFilesFound + mArray.length;

                for (let i = 0; i < mArray.length; i++){

                    if(mArray[i] !== 'nofileFound'){
    
                        let imgObj = {
                            "observationPhotoId": mArray[i].observationPhotoId,
                            "fileName": mArray[i].fileName,
                            "filePath": ""+mArray[i].fbFilePath,
                            "isDeleted": mArray[i].isDeleted
                        }
    
                        imgArray.push(imgObj);
    
                    } else {
    
                        totalFilesNotfound = totalFilesNotfound + 1;
    
                    }
                }
                statusOfUpload(imagesData[0].obsText,'Please Wait... ','done','Uploading','wifi');
                imagesData[0].photos = imgArray;
                serviceCallToBackend(imagesData,totalFilesFound,totalFilesNotfound);
            }
            
        }

        return;

    };

    const serviceCallToBackend = async (imagesData,totalFilesFound,totalFilesNotfound) => {

        let apiMethod = apiMethodManager.SAVE_PET_OBSERVATION;
        let apiService = await apiRequest.postData(apiMethod,imagesData[0],Constant.SERVICE_JAVA,navigation);
            
        if(apiService && apiService.status) {
            
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
    
            updateObservationData('success',imagesData[0],filesStatus);
                
        } else if(apiService && apiService.isInternet === false) {
    
            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,1,FAIL_OBS,false,'OK','');
                
        } 
    
    
    };

    const updateObservationData = async (status,obj,filesStatus) => {

        let obsData = await DataStorageLocal.getDataFromAsync(Constant.IMAGE_UPLOAD_DATA);
        obsData = JSON.parse(obsData);
        if(status==='success'){

            let alrtMsg = '';
            let alrtTitle = '';
            alrtTitle = Constant.ALERT_INFO;
            alrtMsg = "The Observation " + '"' + obj.obsText + '"'+" is submitted successfully";
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

            createPopup(alrtTitle,alrtMsg,'OK',true);
            deleteObsObj(obj.rNumber);

        } else {
            createPopup("Sorry","The Observation " + '"' + obj.obsText + '"'+" is can't be uploaded. Please try again later",'OK',true);
        }

    };

    const deleteObsObj = async (id) => {
        
        let obsData = await DataStorageLocal.getDataFromAsync(Constant.IMAGE_UPLOAD_DATA);
        obsData = JSON.parse(obsData);
        let tempArray = obsData;

        const tasks = tempArray.filter(task => task.rNumber !== id);

        imagesArray.current = [];
        holdMediaArray.current = [];
        actualMediaLength.current = 0;
        completeMediaLength.current = 0;
        mediaType.current = 0;
        petName.current = '';

        if(tasks.length > 0){   
            await DataStorageLocal.saveDataToAsync(Constant.IMAGE_UPLOAD_DATA, JSON.stringify(tasks));          
            checkImageUploadData();
        } else {
            await DataStorageLocal.removeDataFromAsync(Constant.IMAGE_UPLOAD_DATA); 
            await DataStorageLocal.removeDataFromAsync(Constant.IMAGES_UPLOAD_PROCESS_STARTED);
            statusOfUpload(obsData[0].obsText,'Uploading Done','done','Uploading Done','wifi');
        }

    };

    const statusOfUpload = async (obsName,statusUpload,uploadProgress,stausType,internetType) => {

        Apolloclient.client.writeQuery({query: Queries.IMAGE_UPLOAD_BACKGROUND_STATUS,data: {data: {
            obsImgName : obsName, 
            statusUpload : statusUpload,
            fileName : '',
            uploadProgress: uploadProgress,
            progressTxt:'' ,
            stausType:stausType,
            mediaTYpe:'',
            internetType:internetType,
            uploadMode:'backGround',
            __typename: 'imageUploadBackgroundStatus'
          }},})

    };

    const deleteFileFromFirebase = () => {
        // Create a reference to the file to delete
        var desertRef = firebase.storage().child('images/example.jpg');

        // Delete the file
        desertRef.delete().then(function() {
        // File deleted successfully
        }).catch(function(error) {
        // Uh-oh, an error occurred!
        });
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
export default ImageBackgrounUpload;