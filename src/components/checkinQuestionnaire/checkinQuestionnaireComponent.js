import React,{useState, useEffect, useRef} from 'react';
import {Platform} from 'react-native';
import CheckinQuestionnaireData from './checkinQuestionnaireData';
import  * as QestionnaireDataObj from "./../../components/questionnaire/questionnaireCustomComponents/questionnaireData/questionnaireSaveGetData"
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as Apolloclient from './../../config/apollo/apolloConfig';
import * as Queries from "./../../config/apollo/queries";
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import * as ImageProgress from './../../utils/imageProcessComponent/imageProcessComponent';
import moment from 'moment/moment';
import { useQuery} from "@apollo/react-hooks";
import * as internetCheck from "./../../utils/internetCheck/internetCheck";

let trace_inQuestionnaireQuestionsScreen;
let trace_Questions_Submit_API_Complete;

const Alert_Network_Id = 1;
const Alert_Save_Info_BackBtn_Id = 2;
const Alert_Madatory_Id = 3;
const Alert_Success_Id = 4;
const Alert_Min_Answer_Id = 5;
const Alert_Fail_Id = 6;
const Alert_Submit_Media = 7;
const Alert_Auto_Submit_Questionnaire = 8;
const Alert_Answer_Mandate = 9;
const Alert_Questions_Save_Id = 10;
const Alert_Auto_Submit_Quest_RBtn = 11;

const QUESTIONNAIRE_QUESTIONS_KEY = {
  QUESTIONITEM: 'questionItem',
  QUESTIONANSWER:'questionAnswer',
  QUESTIONNAIREID:'questionnaireId',
  ISMANDATORY:'isMandatory',
  QUESTIONTYPE : 'questionType'
};

const QuestionnaireQuestionsService = ({navigation, route,...props}) => {

    const { loading:loadingQst, data:uploadQstMediaData } = useQuery(Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS, { fetchPolicy: "cache-only" });

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isPopUpLftBtn, set_isPopUpLftBtn] = useState(false);
    const [popupRBtnTitle, set_popupRBtnTitle] = useState(undefined)
    const [popupId, set_popupId] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [questionObject, set_questionObject] = useState(undefined);
    const [petId, set_petId] = useState(undefined);
    const [petName, set_petName] = useState('');
    const [petURL, set_petURL] = useState(undefined);
    const [questionnaireId, set_questionnaireId] = useState(undefined);
    const [questionnaireName, set_questionnaireName] = useState(undefined);
    const [studyId, set_studyId] = useState(undefined);
    const [loaderMsg, set_loaderMsg] = useState('');
    const [noAction, set_noAction] = useState(true);
    const [noActionRBtnQuest, set_noActionRBtnQuest] = useState(true);
    const [completeQuestions, set_completeQuestions] = useState(undefined);
    const [noActionDropQId, set_noActionDropQId] = useState(undefined);
    const [noActionRadQId, set_noActionRadQId] = useState(undefined);
    const [loginPets, set_loginPets] = useState(undefined);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let previouQstNo = useRef(0);
    let noActionRBtnQuest1 = useRef(undefined);
    let totalImagesCount = useRef(0);
    let actualImagesCount = useRef(0);
    let holdImagesArray = useRef([]);
    let dashboardQuestDict = useRef({});

    const [questionnaireDict, set_questionnaireDict] = useState({});

    useEffect(() => {

        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_questionnaire_questions);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_questionnaire_questions, "User in Questionnaire Qustions Screen", ''); 
        return () => {
            initialSessionStop();
        };

    }, []);
      
     useEffect(() => {

        if(route.params?.petObj){
            set_defaultPetObj(route.params?.petObj);
            set_petURL(route.params?.petObj.photoUrl);
            set_petName(route.params?.petObj.petName);
            set_petId(route.params?.petObj.petID);
        }

        if(route.params?.questionObject){
            set_questionObject(route.params?.questionObject);
            set_studyId(route.params?.questionObject.studyIds);
            set_questionnaireName(route.params?.questionObject.questionnaireName);
            set_completeQuestions(route.params?.questionObject.questions);
            set_questionnaireId(route.params?.questionObject.questionnaireId);
        }

    }, [route.params?.petObj,route.params?.questionObject]);

    useEffect(() => {
        if(route.params?.loginPets){
          set_loginPets(route.params?.loginPets);
        }
      }, [route.params?.loginPets]);

    useEffect(() => {

        if(uploadQstMediaData&& uploadQstMediaData.data.uploadMode === 'foreGround'  && uploadQstMediaData.data.__typename === 'UploadQuestionnaireVideoBackgroundStatus'){
            
            set_isLoading(true);
            if(uploadQstMediaData.data.fileName && uploadQstMediaData.data.uploadProgress && uploadQstMediaData.data.progressTxt  && uploadQstMediaData.data.stausType) {
                let tempName = uploadQstMediaData.data.fileName;
                set_loaderMsg(uploadQstMediaData.data.stausType + ' ' + tempName + ' ' + uploadQstMediaData.data.uploadProgress + ' ' + uploadQstMediaData.data.progressTxt);               
            }

        }
          
      }, [uploadQstMediaData]);

    const initialSessionStart = async () => {
        trace_inQuestionnaireQuestionsScreen = await perf().startTrace('t_inQuestionnaireQuestionsScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inQuestionnaireQuestionsScreen.stop();
    };

    const submitQuestionData = async () => {

        let answerArray = [];
        var value = 0;
        let mandateValue = 0;
        let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);

        var mandatoryTotal = completeQuestions.filter(item => item.isMandatory === true);
        if(mandatoryTotal) {
            mandateValue = mandatoryTotal.length;
        }
        
        for (let i = 0; i < completeQuestions.length; i++) {

            let dict = questionnaireDict['QestionId_'+completeQuestions[i].questionId+petId];
            let temp = {};
            if(dict) {

                if(dict.questionAnswer.submitQuestionnaire === true) {

                    let srtValue=undefined;

                    if(dict.questionType === 'Multiple Choice, Checkboxes'){
                            
                        let multyAnswer = JSON.parse(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]);
                        var multyString = [];
                        
                        for(let i=0; i < multyAnswer.length; i++){
                            if(multyAnswer[i].option === Constant.MSELECTION_OTHER_SPECIFY) {
                                // multyString.push(multyAnswer[i].option+'&&&'+multyAnswer[i].rAnswer); 
                                let tempnewAns = {
                                    "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                    "answerOptionId" : multyAnswer[i].questionAnswerId,
                                    "answer" : multyAnswer[i].option+'&&&'+multyAnswer[i].rAnswer,
                                    "mediaType" : null,
                                    "mediaFileName" : multyAnswer[i].ansOptionMediaFileName
                                } 
                                multyString.push(tempnewAns);
                            } else {
                                // multyString.push(multyAnswer[i].option); 
                                let tempnewAns = {
                                    "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                    "answerOptionId" : multyAnswer[i].questionAnswerId,
                                    "answer" : multyAnswer[i].option,
                                    "mediaType" : null,
                                    "mediaFileName" : multyAnswer[i].ansOptionMediaFileName
                                } 
                                multyString.push(tempnewAns); 
                            }
                                                         
                        }
                        // srtValue = multyString.join("###");
                        srtValue = multyString;
                    }

                    let newAns = '';
                    if(dict.questionType === 'Multiple Choice, Checkboxes') {
                        // newAns = srtValue;
                        if(srtValue && srtValue.length > 0) {
                            for (let i = 0; i < srtValue.length; i++) {
                                answerArray.push(srtValue[i]);
                            }
                        } 
                    } else if(dict.questionType === 'Multiple Choice, Radio Button') {
                        if(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].option === Constant.MSELECTION_OTHER_SPECIFY) {
                            // newAns = dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].option+'&&&'+dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer;
                            newAns = {
                                "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                "answerOptionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].questionAnswerId,
                                "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].option+'&&&'+dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer,
                                "mediaType" : null,
                                "mediaFileName" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].ansOptionMediaFileName
                            }
                        } else {
                            // newAns = dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer;
                            newAns = {
                                "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                "answerOptionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].questionAnswerId,
                                "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer,
                                "mediaType" : null,
                                "mediaFileName" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].ansOptionMediaFileName
                            }
                        }
                    } else if(dict.questionType === 'Dropdown') {
                        if(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].option === Constant.MSELECTION_OTHER_SPECIFY) {
                            // newAns = dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].option+'&&&'+dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer;
                            newAns = {
                                "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                "answerOptionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].questionAnswerId,
                                "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].option+'&&&'+dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer,
                                "mediaType" : null,
                                "mediaUrl" : null
                            }
                        } else {
                            // newAns = dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer;
                            newAns = {
                                "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                "answerOptionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].questionAnswerId,
                                "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer,
                                "mediaType" : null,
                                "mediaUrl" : null
                            }
                        }
                    } else if(dict.questionType === 'Date') {
                        // newAns = moment(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]).format("YYYY-MM-DD");
                        newAns = {"questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                "answerOptionId" : null,
                                "answer" : moment(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]).format("YYYY-MM-DD"),
                                "mediaType" : null,
                                "mediaUrl" : null
                          }
                    } else {
                        // newAns = dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER];
                        if(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionTypeId === 7) {
                            if(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER] && dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].length > 0) {
                                for (let i = 0; i < dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].length; i++) {
                                    newAns = {"questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                        "answerOptionId" : null,
                                        "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER][i],
                                        "mediaType" : 1,
                                        "mediaUrl" : null
                                    }
                                    answerArray.push(newAns);
                                }
                            }
                        } else if(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionTypeId === 8) {
                            if(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER] && dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].length > 0) {
                                for (let i = 0; i < dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].length; i++) {
                                    newAns = {"questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                        "answerOptionId" : null,
                                        "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER][i],
                                        "mediaType" : 2,
                                        "mediaUrl" : null
                                    }
                                    answerArray.push(newAns);
                                }
                            }
                            
                        } else {

                            newAns = {"questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                "answerOptionId" : null,
                                "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER],
                                "mediaType" : null,
                                "mediaUrl" : null
                            }

                        }
                    }
                    // temp.questionId = completeQuestions[i].questionId;
                    // temp.questionType = completeQuestions[i].questionTypeId;
                    // temp.answer = newAns;                
                    // answerArray.push(temp);
                    value = mandateValue;
                    break;
                    
                } else {
                    if(completeQuestions[i].isMandatory) {
                        value = value + 1;
                    }
                    let srtValue=undefined;
                    if(dict.questionType === 'Multiple Choice, Checkboxes'){
                            
                        let multyAnswer = JSON.parse(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]);
                        var multyString = [];
                        for(let i=0; i < multyAnswer.length; i++){
                            if(multyAnswer[i].option === Constant.MSELECTION_OTHER_SPECIFY) {
                                // multyString.push(multyAnswer[i].option+'&&&'+multyAnswer[i].rAnswer); 
                                let tempnewAns = {
                                    "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                    "answerOptionId" : multyAnswer[i].questionAnswerId,
                                    "answer" : multyAnswer[i].option+'&&&'+multyAnswer[i].rAnswer,
                                    "mediaType" : null,
                                    "mediaFileName" : multyAnswer[i].ansOptionMediaFileName
                                } 
                                multyString.push(tempnewAns);
                            } else {
                                // multyString.push(multyAnswer[i].option); 
                                let tempnewAns = {
                                    "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                    "answerOptionId" : multyAnswer[i].questionAnswerId,
                                    "answer" : multyAnswer[i].option,
                                    "mediaType" : null,
                                    "mediaFileName" : multyAnswer[i].ansOptionMediaFileName
                                } 
                                multyString.push(tempnewAns); 
                            }
                                                         
                        }
                        // srtValue = multyString.join("###");
                        srtValue = multyString;
                    }

                    let newAns = '';
                    if(dict.questionType === 'Multiple Choice, Checkboxes') {
                        // newAns = srtValue;
                        if(srtValue && srtValue.length > 0) {
                            for (let i = 0; i < srtValue.length; i++) {
                                answerArray.push(srtValue[i]);
                            }
                        } 
                    } else if(dict.questionType === 'Multiple Choice, Radio Button') {
                        if(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].option === Constant.MSELECTION_OTHER_SPECIFY) {
                            // newAns = dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].option+'&&&'+dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer;
                            newAns = {
                                "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                "answerOptionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].questionAnswerId,
                                "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].option+'&&&'+dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer,
                                "mediaType" : null,
                                "mediaFileName" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].ansOptionMediaFileName,
                            }
                        } else {
                            // newAns = dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer;
                            newAns = {
                                "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                "answerOptionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].questionAnswerId,
                                "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer,
                                "mediaType" : null,
                                "mediaFileName" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].ansOptionMediaFileName
                            }
                        }
                        
                    } else if(dict.questionType === 'Dropdown') {
                        if(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].option === Constant.MSELECTION_OTHER_SPECIFY) {
                            // newAns = dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].option+'&&&'+dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer;
                            newAns = {
                                "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                "answerOptionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].questionAnswerId,
                                "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].option+'&&&'+dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer,
                                "mediaType" : null,
                                "mediaUrl" : null
                            }
                        } else {
                            // newAns = dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer;
                            newAns = {
                                "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                "answerOptionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].questionAnswerId,
                                "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].rAnswer,
                                "mediaType" : null,
                                "mediaUrl" : null
                            }
                        }
                    } else if(dict.questionType === 'Date') {
                        // newAns = moment(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]).format("YYYY-MM-DD");
                        newAns = {
                            "questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                            "answerOptionId" : null,
                            "answer" : moment(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]).format("YYYY-MM-DD"),
                            "mediaType" : null,
                            "mediaUrl" : null
                        }
                    } else {
                        // newAns = dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER];
                        if(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionTypeId === 7) {
                            if(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER] && dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].length > 0) {
                                for (let i = 0; i < dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].length; i++) {
                                    newAns = {"questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                        "answerOptionId" : null,
                                        "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER][i],
                                        "mediaType" : 1,
                                        "mediaUrl" : null
                                    }
                                    answerArray.push(newAns);
                                }
                            }
                        } else if(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionTypeId === 8) {
                            if(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER] && dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].length > 0) {
                                for (let i = 0; i < dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER].length; i++) {
                                    newAns = {"questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                        "answerOptionId" : null,
                                        "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER][i],
                                        "mediaType" : 2,
                                        "mediaUrl" : null
                                    }
                                    answerArray.push(newAns);
                                }
                            }
                            
                        } else {

                            newAns = {"questionId" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionId,
                                "answerOptionId" : null,
                                "answer" : dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER],
                                "mediaType" : null,
                                "mediaUrl" : null
                            }

                        }
                        
                    }

                    // temp.questionId = completeQuestions[i].questionId;
                    // temp.questionType = completeQuestions[i].questionTypeId;
                    // temp.answer = newAns; 
                             
                    if(newAns !== "" && dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionTypeId !== 7 && dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM].questionTypeId !== 8) {
                        answerArray.push(newAns);
                    }
                }
                
            }

        }
        
        if(value === mandateValue){

            let answerDict  = {};
            answerDict.questionnaireId = questionnaireId;
            answerDict.questionnaireName = questionnaireName;
            answerDict.petId = petId;
            answerDict.petName = petName
            answerDict.studyIds = studyId;
            answerDict.petParentId = clientId;
            answerDict.questionAnswers = answerArray;
            if(answerArray.length > 0){
                holdImagesArray.current = [];
                processQuestionnaire(answerDict);               
            }else{ 
                createPopup(Constant.MANDATE_ANSWER_REC,Alert_Madatory_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);
            }
 
        } else {
            createPopup(Constant.MANDATE_ANSWER_REC,Alert_Madatory_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);
        }

    };

    const processQuestionnaire = async (answers) => {

        let isVideos = false;
        let isImages = false;
        let imgArray = [];
        let videosArray = [];

        if(answers && answers.questionAnswers.length > 0){
            for (let i = 0; i < answers.questionAnswers.length; i++){
                
                if (answers.questionAnswers[i].mediaType && answers.questionAnswers[i].mediaType === 2 && answers.questionAnswers[i].answer) {
                    isVideos = true;
                    videosArray.push(answers.questionAnswers[i].answer);
                }

                if (answers.questionAnswers[i].mediaType && answers.questionAnswers[i].mediaType === 1 && answers.questionAnswers[i].answer) {
                    isImages = true;
                    imgArray.push(answers.questionAnswers[i].answer);
                }
            }
        }

        if(isImages && !isVideos) {

            actualImagesCount.current = 0;
            totalImagesCount.current = imgArray.length;
            processImages(answers,imgArray,answers.petId,answers.petParentId,answers.questionnaireId);

        } else if((isImages && isVideos) || isVideos) {
            let msg = '';
            if(Platform.OS === 'android'){
                msg = Constant.UPLOAD_QUEST_SUBMIT_MSG_ANDROID;
            } else {
                msg = Constant.UPLOAD_QUEST_REQUEST_MSG_IOS;
            }
            dashboardQuestDict.current = answers;

            let internetType = await internetCheck.internetTypeCheck();
            if(internetType === 'wifi'){
                createPopup(msg,Alert_Submit_Media,'Thank You!','OK',false,true,1); 
                return;
            } else {
                createPopup(Constant.NETWORK_TYPE_WIFI_QUEST,Alert_Network_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1); 
            }

        } else {
            sendAnswersToBackend(answers);
        }

    };

    const uploadMediaQuestionnaire = async () => {

        let previousArray = [];
        let previousData = await DataStorageLocal.getDataFromAsync(Constant.QUEST_UPLOAD_DATA);
        previousData = JSON.parse(previousData);

        if(previousData && previousData.length>0){
            previousArray = previousData;
        }
        previousArray.push(dashboardQuestDict.current);

        let duplicates = getUnique(previousArray, 'petId');
        previousArray = duplicates;
        let selectedQuestionnaires = await DataStorageLocal.getDataFromAsync(Constant.SELECTED_QUESTIONNAIRE);
        selectedQuestionnaires = JSON.parse(selectedQuestionnaires);
        let tempArray = [];
        if(selectedQuestionnaires && selectedQuestionnaires.length > 0) {
            tempArray = selectedQuestionnaires;
        }

        tempArray.push({questId : dashboardQuestDict.current.questionnaireId, petId : dashboardQuestDict.current.petId});
        await DataStorageLocal.saveDataToAsync(Constant.SELECTED_QUESTIONNAIRE,JSON.stringify(tempArray));

        await DataStorageLocal.saveDataToAsync(Constant.QUEST_UPLOAD_DATA, JSON.stringify(previousArray));
        let uploadQstProcess = await DataStorageLocal.getDataFromAsync(Constant.QUEST_VIDEO_UPLOAD_PROCESS_STARTED);
        if(!uploadQstProcess){
            Apolloclient.client.writeQuery({query: Queries.UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND,data: {data: { questData:'checkForQstUploads',__typename: 'UploadQuestionnaireVideoBackground'}},})
        }
        // navigation.navigate('DashBoardService');
        navigation.navigate('DashBoardService',{loginPets:loginPets});

    }

    // removes the duplicate objects from the Pets array
    function getUnique(qArray, index) {
        const uniqueArray = qArray.map(e => e[index]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => qArray[e]).map(e => qArray[e]);
        return uniqueArray;
    };

    const processImages = async (answers,imgArray,petId,clientId,QueestionnaireId) => {
        
        let fbObj = await ImageProgress.prepareImages(imgArray[actualImagesCount.current],petId,clientId,QueestionnaireId,'foreGround',answers.questionnaireName);
        holdImagesArray.current.push(fbObj);
        actualImagesCount.current = actualImagesCount.current + 1;
        if(actualImagesCount.current < totalImagesCount.current) {
            processImages(answers,imgArray,petId,clientId,QueestionnaireId);
        } else {

            let tempArray = [];
            // let tempImgArray1 = undefined;
            for (let i = 0; i < answers.questionAnswers.length; i++) {
                if(answers.questionAnswers && answers.questionAnswers[i].mediaType === 1) {

                }  else {
                    tempArray.push(answers.questionAnswers[i]);
                }
            }
            if(holdImagesArray.current && holdImagesArray.current.length > 0) {
                for (let i = 0; i < holdImagesArray.current.length; i++) {
                    var temp = answers.questionAnswers.filter(item => item.answer.id === holdImagesArray.current[i].id);
                    let newObj = {
                        "questionId" : temp[0].questionId,
                        "answerOptionId" : null,
                        "answer" : holdImagesArray.current[i].fbFilePath,
                        "mediaType" : temp[0].mediaType,
                        "mediaUrl" : holdImagesArray.current[i].fbFilePath
                    }
                    tempArray.push(newObj);
                }
            }
           
            let newAnswers = {
                petId : answers.petId,
                petParentId : answers.petParentId,
                questionAnswers : tempArray,
                questionnaireId : answers.questionnaireId,
                questionnaireName : answers.questionnaireName,
                studyIds : answers.studyIds
            }

            set_isLoading(false);
            sendAnswersToBackend(newAnswers);
            return;
        }

    };

    const sendAnswersToBackend = async (answersDictToBackend) => {

        trace_Questions_Submit_API_Complete = await perf().startTrace('t_SaveQuestionAnswers_API');
        set_isLoading(true);
        set_loaderMsg(Constant.LOADER_WAIT_MESSAGE);
        isLoadingdRef.current = 1;
        
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let answersServiceObj = await ServiceCalls.saveQuestionAnswers(answersDictToBackend,token);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        stopFBTrace();

        if(answersServiceObj && answersServiceObj.logoutData){
            firebaseHelper.logEvent(firebaseHelper.event_questionnaire_questions_submit_api_fail, firebaseHelper.screen_questionnaire_questions, "Submit Questionnaire API Fail", 'Duplicate Login');
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }
          
        if(answersServiceObj && !answersServiceObj.isInternet){
            firebaseHelper.logEvent(firebaseHelper.event_questionnaire_questions_submit_api_fail, firebaseHelper.screen_questionnaire_questions, "Submit Questionnaire API Fail", 'No Internet');
            createPopup(Constant.NETWORK_STATUS,Alert_Network_Id,Constant.ALERT_NETWORK,'OK',false,true,1); 
            return;
        }
          
        if(answersServiceObj && answersServiceObj.statusData){

            if(answersServiceObj.responseData){

                firebaseHelper.logEvent(firebaseHelper.event_questionnaire_questions_submit_api_success, firebaseHelper.screen_questionnaire_questions, "Submit Questionnaire API Success", '');
                await QestionnaireDataObj.deleteQuestionnaire(questionnaireId,petId);
                let tempQuest = QestionnaireDataObj.getAnswer(questionnaireId,petId);
                updateDashboardData();
                createPopup(Constant.QUESTIONS_SUBMIT_SUCCESS_MSG,Alert_Success_Id,Constant.ALERT_INFO,'OK',false,true,1);

            } else {  
                firebaseHelper.logEvent(firebaseHelper.event_questionnaire_questions_submit_api_fail, firebaseHelper.screen_questionnaire_questions, "Submit Questionnaire API Fail", '');
                createPopup(Constant.SERVICE_FAIL_MSG,Alert_Fail_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);
            }
          
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_questionnaire_questions_submit_api_fail, firebaseHelper.screen_questionnaire_questions, "Submit Questionnaire API Fail", '');
            createPopup(Constant.SERVICE_FAIL_MSG,Alert_Fail_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);                        
        }
          
        if(answersServiceObj && answersServiceObj.error) {
            firebaseHelper.logEvent(firebaseHelper.event_questionnaire_questions_submit_api_fail, firebaseHelper.screen_questionnaire_questions, "Submit Questionnaire API Fail", '');
            createPopup(Constant.SERVICE_FAIL_MSG,Alert_Fail_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);
        }

    };

    const stopFBTrace = async () => {
        await trace_Questions_Submit_API_Complete.stop();
    };

    const updateDashboardData = () => {
        Apolloclient.client.writeQuery({query: Queries.UPDATE_DASHBOARD_DATA,data: {data: { isRefresh:'refresh',__typename: 'UpdateDashboardData'}},});
    };

    const createPopup = (msg,pId,pTitle,pRghtTitle,isPLft,isPop,idRef) => {

        set_isPopUp(isPop);
        if(isPop) {
            popIdRef.current = idRef;
            set_popUpMessage(msg);
            set_popupId(pId);
            set_popUpTitle(pTitle);
            set_popupRBtnTitle(pRghtTitle);
            set_isPopUpLftBtn(isPLft);
            
        } else {

        }

    };

    const popOkBtnAction = async (value) => {

        if(popupId === Alert_Network_Id || popupId === Alert_Madatory_Id || popupId === Alert_Min_Answer_Id || popupId === Alert_Fail_Id || popupId === Alert_Answer_Mandate || popupId === Alert_Questions_Save_Id){
            popCancelBtnAction();
        } else if(popupId === Alert_Auto_Submit_Questionnaire){
            set_noAction(true);
            submitQuestionData();
            createPopup(undefined,undefined,undefined,undefined,false,false,0);  
        }else if(popupId === Alert_Auto_Submit_Quest_RBtn){
            submitQuestionData();
            noActionRBtnQuest1.current = true;
            set_noActionRBtnQuest(true);
            createPopup(undefined,undefined,undefined,undefined,false,false,0);  
        }else if(popupId === Alert_Save_Info_BackBtn_Id){
            saveQuestionnaire();
            popCancelBtnAction();
            navigation.navigate('DashBoardService');
        } else if(popupId === Alert_Success_Id){
            popCancelBtnAction();
            // navigation.navigate('DashBoardService'); 
            navigation.navigate('DashBoardService',{loginPets:loginPets});
        } else if(popupId === Alert_Submit_Media) {
            uploadMediaQuestionnaire();
            popCancelBtnAction();
        }
        
    };

    const popCancelBtnAction = () => {

        if(popupId === Alert_Save_Info_BackBtn_Id){
            navigation.navigate('DashBoardService');
        } if(popupId === Alert_Auto_Submit_Questionnaire){
            if(noAction === false) {
                set_noAction(null);
            } else {
                set_noAction(false);
            }

        } if(popupId === Alert_Auto_Submit_Quest_RBtn){
            
            if(noActionRBtnQuest === false) {
                set_noActionRBtnQuest(null);            
            } else {
                set_noActionRBtnQuest(false);            
            }

        }
        createPopup(undefined,undefined,undefined,undefined,false,false,0);  
    };

    const autoSubmitQuestRadioBtnAction = (value,qId) => {
        set_noActionRBtnQuest(undefined);
        set_noActionRadQId(qId);
        if(value) {
            createPopup(Constant.AUTOSUBMIT_QUEST,Alert_Auto_Submit_Quest_RBtn,Constant.ALERT_DEFAULT_TITLE,'YES',true,true,0); 
        }
    };

    const autoSubmitQuestionnaire = (value, qId) => {
        set_noAction(undefined);
        set_noActionDropQId(qId);
        if(value) {
            createPopup(Constant.AUTOSUBMIT_QUEST,Alert_Auto_Submit_Questionnaire,Constant.ALERT_DEFAULT_TITLE,'YES',true,true,0); 
        }
    };

    const saveQuestionnaire = async () => {

        await QestionnaireDataObj.saveAnswer(questionnaireDict,questionnaireId,petId);
        let dict = await QestionnaireDataObj.getAnswer(questionnaireId,petId);

    };

    const updateQstServiceDict = (dict,completeQuests) => {

        set_questionnaireDict(dict);
        if(completeQuests && completeQuests.length > 0) {
            let tempArray = [];
            for (let index = 0; index < completeQuests.length; index++){

                if(!completeQuests[index].isSkip) {
                    tempArray.push(completeQuests[index]);
                }

            }

            set_completeQuestions(tempArray);
        }

    }

    return(
        <>
            <CheckinQuestionnaireData

                defaultPetObj = {defaultPetObj}
                isPopUp = {isPopUp}
                popUpMessage = {popUpMessage}
                popUpTitle = {popUpTitle}
                popupRBtnTitle = {popupRBtnTitle}
                isPopUpLftBtn = {isPopUpLftBtn}
                popIdRef = {popIdRef.current}
                isLoading = {isLoading}
                questionObject = {questionObject}
                questionnaireId = {questionnaireId}
                questionnaireName = {questionnaireName}
                petId = {petId}
                petURL = {petURL}
                noAction = {noAction}
                noActionRBtnQuest = {noActionRBtnQuest}
                noActionDropQId = {noActionDropQId}
                noActionRadQId = {noActionRadQId}
                // completeQuestions = {completeQuestions}
                loaderMsg = {loaderMsg}
                isLoadingdRef = {isLoadingdRef.current}
                popOkBtnAction = {popOkBtnAction}
                createPopup = {createPopup}
                popCancelBtnAction = {popCancelBtnAction}
                submitQuestionData = {submitQuestionData}
                autoSubmitQuestRadioBtnAction = {autoSubmitQuestRadioBtnAction}
                autoSubmitQuestionnaire = {autoSubmitQuestionnaire}
                updateQstServiceDict = {updateQstServiceDict}
            />

        </>
    )
}
export default QuestionnaireQuestionsService;