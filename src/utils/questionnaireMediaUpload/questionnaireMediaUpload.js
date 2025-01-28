import React, { useState, useEffect, useRef } from 'react';
import * as Queries from "./../../config/apollo/queries";
import { useQuery } from "@apollo/react-hooks";
import * as Constant from "./../constants/constant";
import * as internetCheck from "./../internetCheck/internetCheck";
import * as DataStorageLocal from "./../storage/dataStorageLocal";
import {View} from 'react-native';
import AlertComponent from './../commonComponents/alertComponent';
import CommonStyles from './../commonStyles/commonStyles';
import * as ImageProgress from './../../utils/questionnaireMediaUpload/imageProcessComponent/questImageProcessComponent.js';
import * as VideoProcessingComponent from './../../utils/questionnaireMediaUpload/videoProcessingComponent/questVideoProcessingComponent.js';
import * as Apolloclient from './../../config/apollo/apolloConfig';
import  * as QestionnaireDataObj from "./../../components/questionnaire/questionnaireCustomComponents/questionnaireData/questionnaireSaveGetData";
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';

var RNFS = require('react-native-fs');

const QuestionnaireMediaUpload = ({navigation, route,...props }) => {

    const { loading, data : questUploadData } = useQuery(Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND, { fetchPolicy: "cache-only" });

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popAlert, set_popAlert] = useState(undefined);
    const [popRightBtnTitle, set_popRightBtnTitle] = useState(undefined);

    var imagesArray = useRef([]);
    var videosArray = useRef([]);
    var holdMediaArray = useRef([]);
    var actualMediaLength = useRef(0);
    var completeMediaLength= useRef(0);
    var mediaType = useRef(0);
    var petName = useRef('');

    useEffect (() => {

        if(questUploadData && questUploadData.data.__typename === 'UploadQuestionnaireVideoBackground') {
            checkInternetStatus(questUploadData);
        }

    },[questUploadData]);

    const checkInternetStatus = async (dataNew) => {

        let qstData = await DataStorageLocal.getDataFromAsync(Constant.QUEST_UPLOAD_DATA);
        qstData = JSON.parse(qstData);
        if(qstData){

            let internetType = await internetCheck.internetTypeCheck();
            if(internetType === 'wifi'){

                // if(dataNew){
                    petName.current = qstData[0].petName;
                    startUploadingProcess(); 
                // }
            } else {

                await DataStorageLocal.removeDataFromAsync(Constant.QUEST_VIDEO_UPLOAD_PROCESS_STARTED);  
                Apolloclient.client.writeQuery({query: Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS,data: {data: {
                    questName:'', 
                    statusUpload:'Please Wait... ',
                    fileName:'', 
                    uploadProgress:'',
                    progressTxt:'' ,
                    stausType:'Uploading',
                    mediaTYpe:'',
                    internetType:'notWi-Fi',
                    uploadMode:'backGround',
                    __typename: 'UploadQuestionnaireVideoBackgroundStatus'}},});
            }

        }

    };

    const startUploadingProcess = async () => {

        let uploadProcess = await DataStorageLocal.getDataFromAsync(Constant.QUEST_VIDEO_UPLOAD_PROCESS_STARTED);
        if(!uploadProcess){    
            checkQuestUploadData();
        }

    };

    const checkQuestUploadData = async () => {

        let questData = await DataStorageLocal.getDataFromAsync(Constant.QUEST_UPLOAD_DATA);
        questData = JSON.parse(questData);

        if(questData && questData[0].questionAnswers.length > 0) {

            await DataStorageLocal.saveDataToAsync(Constant.QUEST_VIDEO_UPLOAD_PROCESS_STARTED,'Started');
            let answersArray = questData[0].questionAnswers;

            if(answersArray) {

                for (let i = 0; i < answersArray.length; i++) {

                    if(answersArray[i].mediaType === 1) {
                        imagesArray.current.push(answersArray[i].answer);
                    } else if(answersArray[i].mediaType === 2) {
                        videosArray.current.push(answersArray[i].answer);
                    }

                }

            }

            if(imagesArray.current && imagesArray.current.length) { 
                completeMediaLength.current = 0;
                actualMediaLength.current = imagesArray.current.length;
                mediaType.current = 'image';
            } else if(videosArray.current.length && videosArray.current.length > 0) {
                completeMediaLength.current = 0;
                actualMediaLength.current = videosArray.current.length;
                mediaType.current = 'video';
            }
            startProcessingMedia(questData);
            
        }
   
    };

    const startProcessingMedia = async (questData) => {

            if(mediaType.current === 'image') {

                let pendingUploads = 10;
                for (let i = 0; i < imagesArray.current.length; i++) {
                    if (imagesArray.current[i].fbFilePath === '') {
                        pendingUploads = i;
                        break;
                    } 
                }
                
                completeMediaLength.current = pendingUploads;
                if(completeMediaLength.current < actualMediaLength.current) {

                    processMedia(questData,imagesArray.current);
                    return;

                } else {

                    mediaType.current = 'video';
                    processVideos(questData,videosArray.current);
                    
                    
                }

            } else if(mediaType.current === 'video') {
                processVideos(questData,videosArray.current);
            }

    };

    const processVideos = async (questData,mediaArray) => {

        let pendingUploads = 10;
        for (let i = 0; i < mediaArray.length; i++) {
            if (mediaArray[i].fbFilePath === '') {
                pendingUploads = i;
                break;
            } 
        }
        completeMediaLength.current = pendingUploads;
        actualMediaLength.current = mediaArray.length;
        if(completeMediaLength.current < actualMediaLength.current) {
            processMedia(questData,mediaArray);
            return;
        } else {
            startUploadingToBackend();
        }
    };

    const processMedia = async (answers,mArray) => {

        let petId = answers[0].petId;
        let client = answers[0].petParentId;
        let questId = answers[0].questionnaireId;
        let qestName = answers[0].questionnaireName;

        let fbObj = undefined;

        if(mediaType.current === 'image') {
            fbObj = await ImageProgress.prepareImages(mArray[completeMediaLength.current],petId,client,questId,'backGround',qestName);
        } else if(mediaType.current === 'video') {
            fbObj = await VideoProcessingComponent.prepareVideos(mArray[completeMediaLength.current],petId,client,questId,'backGround',qestName);
        }

        holdMediaArray.current.push(fbObj);
        completeMediaLength.current = completeMediaLength.current + 1;

        if(completeMediaLength.current < actualMediaLength.current) {
            processMedia(answers,mArray);
        } else {
            let tempArray = [];

            for (let i = 0; i < answers[0].questionAnswers.length; i++) {
                if(answers[0].questionAnswers && answers[0].questionAnswers[i].mediaType === 1 || answers[0].questionAnswers && answers[0].questionAnswers[i].mediaType === 2) {
                    var temp = holdMediaArray.current.filter(item => item.id === answers[0].questionAnswers[i].answer.id);
                    if(temp && temp.length > 0) {

                        var temp1 = answers[0].questionAnswers.filter(item => item.answer.id === temp[0].id);
                        if(temp && temp.length > 0 && temp[0].fbFilePath && temp[0].fbFilePath !== '') {
                            let newObj = {
                                "questionId" : temp1[0].questionId,
                                "answerOptionId" : null,
                                "answer" : temp[0].fbFilePath,
                                "mediaType" : temp1[0].mediaType,
                                "mediaUrl" : temp[0].fbFilePath
                            }
                            tempArray.push(newObj);
                        } else {
                            tempArray.push(answers[0].questionAnswers[i]);
                        }

                    } else {
                        tempArray.push(answers[0].questionAnswers[i]);
                    }
                   
                }  else {
                    tempArray.push(answers[0].questionAnswers[i]);
                }
            }

            let newAnswers = {
                petId : petId,
                petParentId : client,
                questionAnswers : tempArray,
                questionnaireId : questId,
                questionnaireName : answers[0].questionnaireName,
                studyIds : answers[0].studyIds
            }

            await updateNewObj(newAnswers);

            if (mediaType.current === 'image') {

                completeMediaLength.current = 0;
                actualMediaLength.current = 0;
                mediaType.current = '';
                holdMediaArray.current = [];
                imagesArray.current = [];
                if(videosArray.current.length > 0) {
                    actualMediaLength.current = videosArray.current.length;
                    mediaType.current = 'video';
                    startProcessingMedia([newAnswers]);
                } 
            } else if (mediaType.current === 'video') {

                Apolloclient.client.writeQuery({query: Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS,data: {data: {
                    questName : '', 
                    statusUpload : 'Almost there! completing the process',
                    fileName : '',
                    uploadProgress: '',
                    progressTxt:'' ,
                    stausType:'Uploading',
                    mediaTYpe:'Video',
                    internetType:'wifi',
                    uploadMode:'backGround',
                    __typename: 'UploadQuestionnaireVideoBackgroundStatus'
                }},}) 

                imagesArray.current = [];
                videosArray.current = [];
                holdMediaArray.current = [];
                completeMediaLength.current = 0;
                actualMediaLength.current = 0;
                
                startUploadingToBackend();

            } 
        }

        return;

    };

    const updateNewObj = async (newAnswers) => {

        let questUploadData = await DataStorageLocal.getDataFromAsync(Constant.QUEST_UPLOAD_DATA);
        questUploadData = JSON.parse(questUploadData);

        if(questUploadData) {
            let resultArray1 = await deleteObsObjFromAsync(questUploadData,newAnswers.petId,newAnswers.questionnaireId);
            let addResult1 = addAfter(resultArray1,0,newAnswers);
            await DataStorageLocal.saveDataToAsync(Constant.QUEST_UPLOAD_DATA, JSON.stringify(addResult1));
        }

    };

    const deleteObsObjFromAsync = async (tempArray,petId,questionnaireId) => {
        let tempArray1 = tempArray;
        const tasks = tempArray1.filter(task => task.petId+task.questionnaireId !== petId+questionnaireId);
        let temp = tasks;
        return temp;
    };

    function addAfter(array, index, newAnswers) {
        return [
            ...array.slice(0, index),
            newAnswers,
            ...array.slice(index)
        ];
    };

    const startUploadingToBackend = async () => {

        let questionnaireObj = await DataStorageLocal.getDataFromAsync(Constant.QUEST_UPLOAD_DATA);
        questionnaireObj = JSON.parse(questionnaireObj);
        let totalMedia = 0;
        let totalMediaSuccess = 0;

        if(questionnaireObj) {

            for (let i = 0; i < questionnaireObj[0].questionAnswers.length; i++) {
                if(questionnaireObj[0].questionAnswers[i].mediaType === 2 || questionnaireObj[0].questionAnswers[i].mediaType === 1) {
                    totalMedia = totalMedia + 1;
                    if(questionnaireObj[0].questionAnswers[i].mediaUrl && questionnaireObj[0].questionAnswers[i].mediaUrl !== '') {
                        totalMediaSuccess = totalMediaSuccess + 1;
                    }
                }
            }

            serviceCallToBackend(questionnaireObj[0],totalMedia,totalMediaSuccess,questionnaireObj[0].petId,questionnaireObj[0].questionnaireId);
        }

    };

    const serviceCallToBackend = async (answersDictToBackend,totalMedia,totalMediaSuccess,petId, questId) => {

        let apiMethod = apiMethodManager.SAVE_QUESTION_ANSWERS;
        let apiService = await apiRequest.postData(apiMethod,answersDictToBackend,Constant.SERVICE_JAVA,navigation);
        Apolloclient.client.writeQuery({query: Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS,data: {data: {
            questName : '', 
            statusUpload : 'Uploading Done',
            fileName : '',
            uploadProgress: '',
            progressTxt:'' ,
            stausType:'Uploading',
            mediaTYpe:'Video',
            internetType:'wifi',
            uploadMode:'backGround',
            __typename: 'UploadQuestionnaireVideoBackgroundStatus'
        }},}) 
                        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
        
            if(apiService.data.message){
                let msg = ''

                if(totalMedia === totalMediaSuccess) {

                    if(petName.current && petName.current !== '') {
                        msg = 'Thank You! Your responses for ' + answersDictToBackend.questionnaireName + ' of ' + petName.current + ' are submitted.'
                    } else {
                        msg = 'Thank You! Your responses for ' + answersDictToBackend.questionnaireName + ' are submitted.'
                    }
                    createPopup(Constant.ALERT_INFO, msg ,'OK',true);
                } else {

                    if(petName.current && petName.current !== '') {
                        msg = 'An error occurred during the uploading of a video response. However, the responses of other questions ' + answersDictToBackend.questionnaireName + ' of ' + petName.current + ' are successfully submitted.'
                    } else {
                        msg = 'An error occurred during the uploading of a video response. However, the responses of other questions ' + answersDictToBackend.questionnaireName + ' are successfully submitted.'
                    }
                    createPopup('Sorry!', msg ,'OK',true);
                }
                
                await reConfigureQuestObj(answersDictToBackend,petId, questId); 
            }
    
        } else if(apiService && apiService.isInternet === false) {

            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK',true); 

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,'OK',true);
          
        } else {

            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,'OK',true);     

        }

    };

    const reConfigureQuestObj = async (answersDictToBackend,petId, questId) => {

        let questionnaireObj = await DataStorageLocal.getDataFromAsync(Constant.QUEST_UPLOAD_DATA);
        questionnaireObj = JSON.parse(questionnaireObj);

        await DataStorageLocal.removeDataFromAsync(Constant.QUEST_VIDEO_UPLOAD_PROCESS_STARTED);
        let selectedQuest = await DataStorageLocal.getDataFromAsync(Constant.SELECTED_QUESTIONNAIRE);
        selectedQuest = JSON.parse(selectedQuest);

        if(questionnaireObj && selectedQuest && selectedQuest.length > 0){
            let filteredArray = selectedQuest.filter(item => item.petId+item.questId+'' !== answersDictToBackend.petId+answersDictToBackend.questionnaireId+'');
            await DataStorageLocal.saveDataToAsync(Constant.SELECTED_QUESTIONNAIRE,JSON.stringify(filteredArray));
        } else {
            await DataStorageLocal.removeDataFromAsync(Constant.SELECTED_QUESTIONNAIRE);
        }

        if(questionnaireObj && questionnaireObj.length > 0) {

            let tempArray = questionnaireObj;
            const tasks = tempArray.filter(task => task.questionnaireId+task.petId !== questionnaireObj[0].questionnaireId+questionnaireObj[0].petId);
            await QestionnaireDataObj.deleteQuestionnaire(questionnaireObj[0].questionnaireId,petId);
            if(tasks && tasks.length > 0) {
                await DataStorageLocal.saveDataToAsync(Constant.QUEST_UPLOAD_DATA, JSON.stringify(tasks)); 
                await checkInternetStatus();
            } else {
                await DataStorageLocal.removeDataFromAsync(Constant.QUEST_UPLOAD_DATA);
            }

        } else {
            await QestionnaireDataObj.deleteQuestionnaire(questionnaireObj[0].questionnaireId,petId);
            await DataStorageLocal.removeDataFromAsync(Constant.QUEST_UPLOAD_DATA);
        }  

    };

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
    }


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
export default QuestionnaireMediaUpload;