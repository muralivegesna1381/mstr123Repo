import React,{useState, useEffect, useRef} from 'react';
import {BackHandler,Platform} from 'react-native';
import CheckinQuestionnaireUI from './checkinQuestionnaireUI'
import  * as QestionnaireDataObj from "./../../components/questionnaire/questionnaireCustomComponents/questionnaireData/questionnaireSaveGetData"
import * as Constant from "./../../utils/constants/constant";
import Highlighter from "react-native-highlight-words";
import { useNavigation } from "@react-navigation/native";

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

const Mandate_Answered = 101;
const Mandate_Not_Answered = 102;
const No_Mandate = 103;
const Non_Mandate_Answered = 104;

const QUESTIONNAIRE_QUESTIONS_KEY = {
  QUESTIONITEM: 'questionItem',
  QUESTIONANSWER:'questionAnswer',
  QUESTIONNAIREID:'questionnaireId',
  ISMANDATORY:'isMandatory',
  QUESTIONTYPE : 'questionType'
};

const CheckinQuestionnaireData = ({route,...props}) => {

    const navigation = useNavigation();
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [questionObject, set_questionObject] = useState(undefined);
    const [petId, set_petId] = useState(undefined);
    const [petURL, set_petURL] = useState(undefined);
    const [questionnaireId, set_questionnaireId] = useState(undefined);
    const [questionsArrayInitial, set_questionsArrayInitial] = useState(undefined);
    const [mandatoryQuestions, set_mandatoryQuestions] = useState(undefined);
    const [questionsArray, set_questionsArray] = useState(undefined);
    const [noAction, set_noAction] = useState(true);
    const [infoText, set_infoText] = useState('')
    const [noActionRBtnQuest, set_noActionRBtnQuest] = useState(true);
    const [isNoSelected, set_isNoSelected] = useState(false);
    const [totalSections, set_totalSections] = useState(0);
    const [sectionsAnswered, set_sectionsAnswered] = useState(0);
    const [completeQuestions, set_completeQuestions] = useState(undefined);
    const [status, set_status] = useState(undefined);
    const [isDropdown, set_isDropDown] = useState(false);
    const [secDesc, set_secDesc] = useState(undefined);
    const [secChange, set_secChange] = useState(null);
    const [isQuestListOpen, set_isQuestListOpen] = useState(false);

    let sectionArray = useRef([]);
    let indexArray = useRef([]);
    let sectionIndex = useRef(1);
    let filterName = useRef('All');
    let noOfSections = useRef([]);
    let previouQstNo = useRef(0);
    var questionnaireDictTemp = useRef({});
    let noActionRBtnQuest1 = useRef(undefined);
    let isChangesMade = useRef(false);
    let completeQuestionsSet = useRef();
    let questionnaireDictSet = useRef();
    let isUpdateSecNum = useRef(true);
    let secAnsweredRef = useRef(0);

    const [answeredQuestions, set_answeredQuestions] = useState(0);
    const [questionnaireDict, set_questionnaireDict] = useState(undefined);
    const [filterOptions, set_filterOptions] = useState(['All','Answered','Unanswered']);
    const [isFiterEmpty, set_isFiterEmpty] = useState(false);

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);
      
    useEffect(() => {

        if(props.defaultPetObj){
            set_defaultPetObj(props.defaultPetObj);
            set_petURL(props.petURL);
        }
        
        if(props.questionObject){
            // checkNoSections(props.questionObject);
            prepareQuestionsforSkip(props.questionObject);
        }

    }, [props.defaultPetObj,props.questionObject, props.petURL]);

    useEffect(() => {

        if(props.petId) {
            set_petId(props.petId);
        }

        if(props.questionnaireId) {
            set_questionnaireId(props.questionnaireId);
        }

    }, [props.petId,props.questionnaireId]);

    useEffect(() => {
        if(props.questionnaireDict) {
            set_questionnaireDict(props.questionnaireDict);
        }
    }, [props.questionnaireDict]);

    useEffect(() => {

        if(props.noAction) {
            set_noAction(props.noAction);
        }

    }, [props.noAction]);

    useEffect(() => {

        if(props.noActionRBtnQuest) {
            set_noActionRBtnQuest(props.noActionRBtnQuest);
        }

    }, [props.noActionRBtnQuest]);

    const handleBackButtonClick = () => {
        // navigateToPrevious();
        // return true;
    };

    const prepareQuestionsforSkip = async(questObj) => {

        for (let i = 0; i < questObj.questions.length; i++) {
            questObj.questions[i].isSkip = false;
        }

        if(questObj.status !== 'Submitted') {

            set_completeQuestions(questObj.questions);
            completeQuestionsSet.current = questObj.questions;
            set_questionObject(props.questionObject);
            var questDict =   await QestionnaireDataObj.getAnswer(props.questionObject.questionnaireId,props.petId);
            if(questDict) {
                await resetPreviousSkipQuestions( questDict,null);
            }
            checkNoSections(props.questionObject,questObj.questions);

        } else {
            submittedQuestionnaireView(questObj);
        }
  
    };

    const checkNoSections = async (questionsObject,questAnswers) => {

        if(questionsObject ) {

            const questions = questAnswers.filter(question => question.isSkip === false);

            if(questionsObject.instructions && questionsObject.instructions.length > 0) {

                let inst = '';
                for (let i = 0; i < questionsObject.instructions.length; i++) {
                    if((questionsObject.instructions.length - i) === 1) {
                        inst = inst + questionsObject.instructions[i].instruction
                    } else {
                        inst = inst + questionsObject.instructions[i].instruction + '\n\n';
                    }
                    
                }
                set_infoText(inst);
            }

            set_status(questionsObject.status);
            let questionaArray = questions;

            const groupByCategory = questionaArray.reduce((group, sections) => {

                const { sectionOrder } = sections;
                group[sectionOrder] = group[sectionOrder] ?? [];
                group[sectionOrder].push(sections);
                return group;

            }, {});
              
            let secNo = Object.keys(groupByCategory);

            noOfSections.current = [];
            if(secNo[0] !== 'undefined') {

                for (let i = 0; i < secNo.length; i++) {
                    noOfSections.current.push(parseInt(secNo[i]));
                }

            } else {
                noOfSections.current.push(1);
            }
            set_totalSections(noOfSections.current.length);

            if(secNo[0] === 'undefined') {

                if(filterName.current === 'All') {
                    set_questionsArray(questionaArray);
                }
                set_questionnaireId(questionsObject.questionnaireId); 
                set_questionsArrayInitial(questionaArray);
                set_secDesc(questionaArray[0].sectionDescription);
                let isAnswered = 0;

                if(questionaArray && questionaArray.length > 0) {
                    
                    let dict = await QestionnaireDataObj.getAnswer(questionsObject.questionnaireId,props.petId);
                    if(dict) {
                        set_questionnaireDict(dict);
                        questionnaireDictSet.current = dict;
                        props.updateQstServiceDict(dict, completeQuestionsSet.current);
                        // isAnswered = await saveSectionsAnswered(questionaArray,dict,props.petId);
                         isAnswered = await saveWithoutSectionsAnswered(questionaArray,dict,props.petId);
                         if(isAnswered) {
                            secAnsweredRef.current = isAnswered;
                            set_sectionsAnswered(isAnswered);

                         } else {
                            secAnsweredRef.current = 0;
                            set_sectionsAnswered(0)
                         }
                        //  set_sectionsAnswered(isAnswered)
                        // if(isAnswered) {
                        //     set_sectionsAnswered(1);
                        // }
                    } else {
                        if(questionsObject.status === 'Submitted') {
                            secAnsweredRef.current = 1;
                            set_sectionsAnswered(1);
                        }
                    }
                    
                }
                
                return;

            } 
            
            // set_completeQuestions(questionaArray);
            // completeQuestionsSet.current = questionaArray;
            prepareQuestionsData(questionaArray,noOfSections.current[sectionIndex.current-1],noOfSections.current,questionsObject.questionnaireId,questionsObject.status);           
        }

    }

    const prepareQuestionsData = async (questionaArray, sIndex,noOfSections,qID,statusQuest) => {

        var temp = questionaArray.filter(item => item.sectionOrder === sIndex);
        set_questionnaireId(qID); 
        if(filterName.current === 'All') {
            set_questionsArray(temp);   
        }
        set_questionsArrayInitial(temp);
        set_isDropDown(false);
        set_secDesc(temp[0].sectionDescription);
        // set_mandatoryQuestions(value);

        if(completeQuestionsSet.current && completeQuestionsSet.current.length > 0) {

            let dict = {};
            dict = await QestionnaireDataObj.getAnswer(qID,props.petId);

            if(questionnaireDictSet.current) {
                dict = questionnaireDictSet.current;
            }
            if(dict) {
                props.updateQstServiceDict(dict, completeQuestionsSet.current);
                let sectionsCount = 0;
                if(statusQuest !== 'Submitted') {
                    set_questionnaireDict(dict);
                    questionnaireDictSet.current = dict;
                }
                
                for (let i = 0; i < noOfSections.length; i++) {
                    var temp1 = questionaArray.filter(item => item.sectionOrder === noOfSections[i]);
                    /////Total sections count changes again here
                    // set_totalSections(noOfSections.length);
                    //let isAnswered = await saveSectionsAnswered(temp1,dict,props.petId);
                    let isAnswered = await saveSectionsAnsweredNext(temp1,dict,props.petId);
                    if(isAnswered) {
                        sectionsCount = sectionsCount + 1;
                    }
                }
                
                if(isUpdateSecNum.current) {
                    isUpdateSecNum.current = false;
                    secAnsweredRef.current = sectionsCount;
                    set_sectionsAnswered(sectionsCount);
                }
                set_totalSections(noOfSections.length);
                
            } else {
                isUpdateSecNum.current = false;
            }         
        }
    };

    const submittedQuestionnaireView = async (questionnairObj) => {
        let totalQuestions = questionnairObj.questions;
        await updateSubmittedDictionary(totalQuestions,questionnairObj.questionnaireId,props.petId,questionnairObj);
    };

    const updateSubmittedDictionary = async (arrayQuest,qID,petID,questionnairObj) => {

        let tempDict = {};
        let skipToId = 0
        let skipSelectId = 0
        
        for (let i=0 ; i < arrayQuest.length ; i++){
            if(arrayQuest[i].answer) { 
                tempDict = await updateQuestionnaireQuestionsSubmitted(arrayQuest[i], arrayQuest[i].answer,arrayQuest[i].isMandatory,arrayQuest[i].questionType,qID,petID);  
            }
        }
        for (let index = 0; index < arrayQuest.length; index++) {
            if(arrayQuest[index].answer && arrayQuest[index].questionAnswerOptions && arrayQuest[index].questionAnswerOptions.length > 0) { 
                skipSelectId = arrayQuest[index].questionOrder;
                for (let indexj = 0; indexj < arrayQuest[index].questionAnswerOptions.length; indexj++) {
                    if((arrayQuest[index].answer === arrayQuest[index].questionAnswerOptions[indexj].questionAnswer) && arrayQuest[index].questionAnswerOptions[indexj].skipTo) {
                        var temp = arrayQuest.filter(item => item.questionId === arrayQuest[index].questionAnswerOptions[indexj].skipTo);
                        if(temp && temp.length > 0) {
                            skipToId = temp[0].questionOrder;
                        }
                        
                        break;
                    }
                }

                for (let indexk = 0; indexk < arrayQuest.length; indexk++) {
                    if((arrayQuest[indexk].questionOrder > skipSelectId) && arrayQuest[indexk].questionOrder < skipToId) {
                        arrayQuest[indexk].isSkip = true;
                    }
                }
            }

        }

        let isAutoSubmit = false;
        let autoSubmitQuestions = [];
        for (let i = 0; i < arrayQuest.length; i++){

            autoSubmitQuestions.push(arrayQuest[i]);
            for (let k = 0; k < arrayQuest[i].questionAnswerOptions.length; k++) {
                if(arrayQuest[i].answer === arrayQuest[i].questionAnswerOptions[k].questionAnswer && arrayQuest[i].questionAnswerOptions[k].submitQuestionnaire) {
                    isAutoSubmit = true
                    break;
                }
            }

            if(isAutoSubmit) {
                break;
            }
                
        }
        set_completeQuestions(autoSubmitQuestions);
        completeQuestionsSet.current = autoSubmitQuestions;
        checkNoSections(questionnairObj,autoSubmitQuestions);
        
    };
  
    const updateQuestionnaireQuestionsSubmitted = async (item, answersArray,isMadatory,questionType,id,petID) => {

        let tempDict = {...questionnaireDictTemp.current};
        tempDict['QestionId_'+item.questionId+petID] = {
          ...tempDict['QestionId_'+item.questionId+petID],
            [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM]: item,
            [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]: answersArray,
            [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONNAIREID]: id,
            [QUESTIONNAIRE_QUESTIONS_KEY.ISMANDATORY]:isMadatory,
            [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONTYPE]:questionType,
        };

        questionnaireDictTemp.current = tempDict;
        questionnaireDictSet.current = tempDict;
        set_questionnaireDict(questionnaireDictTemp.current);
        return tempDict
     
    };
  
   const updateQuestionnaireQuestions = async(item, answersArray,isMadatory,questionType) => {
          let tempDictRemove;
        //   if(!answersArray || answersArray==='[]'){
        if(!answersArray || answersArray.length === 0 || answersArray==='[]'){
            const copyDict= questionnaireDict;
            delete copyDict['QestionId_'+item.questionId+petId];
            tempDictRemove = copyDict;
            questionnaireDictSet.current = tempDictRemove;
            set_questionnaireDict(tempDictRemove);
            set_answeredQuestions(Object.keys(tempDictRemove).length);
        
        }else {
            let tempDict = {...questionnaireDict};
            tempDict['QestionId_'+item.questionId+petId] = {
                ...tempDict['QestionId_'+item.questionId+petId],
                [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM]: item,
                [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]: answersArray,
                [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONNAIREID]: questionnaireId,
                [QUESTIONNAIRE_QUESTIONS_KEY.ISMANDATORY]:isMadatory,
                [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONTYPE]:questionType,
            };
            questionnaireDictSet.current = tempDict;
            set_questionnaireDict(tempDict);
            set_answeredQuestions(Object.keys(tempDict).length);
            props.updateQstServiceDict(tempDict, completeQuestionsSet.current);
            isChangesMade.current = true;
        }     
    };

    const filterQuestionsAction = (value) => {

      let tempArray = [];
      indexArray.current = [];
      if(value === 'All'){

        if(questionsArrayInitial && questionsArrayInitial.length > 0) {
            tempArray = questionsArrayInitial;
        }
          
      }else {

        if(questionsArrayInitial && questionsArrayInitial.length > 0) {

            questionsArrayInitial.map((item,index) => {

                if(status === 'Submitted') {
    
                    if(questionnaireDict) {
                        let dict = questionnaireDict['QestionId_'+item.questionId+petId];  
                        if(dict && value === 'Answered') {
                            tempArray.push(questionsArrayInitial[index]);
                        } else if(!dict && value === 'Unanswered') {
                            tempArray.push(questionsArrayInitial[index]);
                        } 
                    }
                    
                } else {
    
                    if(questionnaireDict) {
    
                        let dict = questionnaireDict['QestionId_'+item.questionId+petId];  
                        if(dict && value === 'Answered'){
                    
                            if(dict && dict.questionItem.questionTypeId === 3) {
                                if(dict.questionAnswer) {
                                    let tempDict = JSON.parse(dict.questionAnswer);
                                    if(tempDict && tempDict.length === 1 && tempDict[0].option === Constant.MSELECTION_OTHER_SPECIFY && tempDict[0].rAnswer === '') {
                                        
                                    } else {
                                        tempArray.push(questionsArrayInitial[index]);
                                    }
                                } 
                            }else if(dict.questionItem.questionTypeId === 1 && dict.questionAnswer.option === undefined) {
                            }else if(dict.questionItem.questionTypeId === 2 && dict.questionAnswer.option === undefined) {
                            } else if((dict.questionAnswer.option && dict.questionAnswer.option === Constant.MSELECTION_OTHER_SPECIFY && dict.questionAnswer.rAnswer === '')) {
                            } else {
                                tempArray.push(questionsArrayInitial[index]);
                            }                   
                        }
        
                        if(!dict && value === 'Unanswered'){
                            tempArray.push(questionsArrayInitial[index]);
                        }
        
                        if(dict && value === 'Unanswered'){
                            if(dict.questionAnswer.option && dict.questionAnswer.option === Constant.MSELECTION_OTHER_SPECIFY && dict.questionAnswer.rAnswer === '') {
                                tempArray.push(questionsArrayInitial[index]);
                            } else if(!dict.questionAnswer) {
                                tempArray.push(questionsArrayInitial[index]);
                            } else if(dict.questionItem.questionTypeId === 1 && dict.questionAnswer.option === undefined) {
                                tempArray.push(questionsArrayInitial[index]);
                            }else if(dict.questionItem.questionTypeId === 2 && dict.questionAnswer.option === undefined) {
                                tempArray.push(questionsArrayInitial[index]);
                            }
                            
                            if(dict && dict.questionItem.questionTypeId === 3) {
                                
                                if(dict.questionAnswer) {
                                    let tempDict = JSON.parse(dict.questionAnswer);
                                    if(tempDict && tempDict.length === 1 && tempDict[0].option === Constant.MSELECTION_OTHER_SPECIFY && tempDict[0].rAnswer === '') {
                                        tempArray.push(questionsArrayInitial[index]);
                                    }  
                                } 
                            } 
                        }
                    } else {
                        if(value !== 'Answered') {
                            tempArray = questionsArrayInitial;
                        }   
                    }
    
                }
    
            })

        }
        
        
      }  
      
      if(tempArray.length > 0){
          set_isFiterEmpty(false);
      }else{
          set_isFiterEmpty(true);
      }
      filterName.current = value;
      if(tempArray.length > 0) {
        set_questionsArray(tempArray);
      } else {
        set_questionsArray(undefined);
      }
      
    };

    const navigateToPrevious = async () => {  
    };

    const saveQuestions = () => {

      if(Object.keys(questionnaireDict).length === 0){
        props.createPopup(Constant.QUESTIONS_ANSWER_MSG,Alert_Min_Answer_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);  
      }else {
          QestionnaireDataObj.saveAnswer(questionnaireDict,questionnaireId,petId);
          navigation.navigate("QuestionnaireStudyComponent"); 
      }

    };

    const viewVideoAction = (item) => {
        if(item.fileType === 'video'){
            navigation.navigate('ViewPhotoComponent',{mediaURL:item.fbFilePath,mediaType:item.fileType, fromScreen : 'questionnaire'});
        }
    }

    const popOkBtnAction = async () => {
        props.popOkBtnAction();        
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();  
    };

    const checkErrorPermissions = (value) => {

        if (value === 'galleryNotAllowed') {
            let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
              searchWords={[Constant.GALLERY_PERMISSION_MSG_HIGHLIGHTED]}
              textToHighlight={
                Constant.GALLERY_PERMISSION_MSG
              }/>
            props.createPopup(high,Alert_Madatory_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,0); 
        } else if (value === 'cameraNotAllowed') {
            let high = '';
            if(Platform.OS === 'android') {
                high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
                searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED_ANDROID]}
                textToHighlight={
                  Constant.CAMERA_PERMISSION_MSG_ANDROID
                }/>
            } else {
                high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
                searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED]}
                textToHighlight={
                  Constant.CAMERA_PERMISSION_MSG
                }/>
            }
            
            props.createPopup(high,Alert_Madatory_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,0); 
        }
    };

    const nextSection = async (value) => {
        filterName.current = 'All';
        set_isFiterEmpty(false);
        set_isQuestListOpen(undefined);
        // if(status !== 'Submitted') {

            if(value === 'SUBMIT') {
                submitQuestionData();
                return;
            }
            if(sectionIndex.current !== totalSections) {

                if(status !== 'Submitted') {
                    
                    let mndtryAnswered = await getSectionsAnswered();
                    let checkOtherSpecify = await getOthersSpecfyAnswered();
                    if(checkOtherSpecify !== 0) {
                        props.createPopup(Constant.MANDATE_ANSWER_REC,Alert_Madatory_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);
                        return;
                    }

                    if(mndtryAnswered === Mandate_Answered || mndtryAnswered === No_Mandate || mndtryAnswered === Non_Mandate_Answered) {
                        indexArray.current = [];
                        sectionIndex.current = sectionIndex.current + 1;

                        var temp = completeQuestionsSet.current.filter(item => item.sectionOrder === noOfSections.current[sectionIndex.current-1] && item.isSkip === false);
                        set_secChange(true);
                        set_questionsArray(temp);
                        set_questionsArrayInitial(temp);
                        set_secDesc(temp[0].sectionDescription);
                        // await QestionnaireDataObj.saveAnswer(questionnaireDict,questionnaireId,petId);
                        await saveQuestionnaire('nextAction');

                    } else {
                        props.createPopup(Constant.MANDATE_ANSWER_REC,Alert_Madatory_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);
                    }

                } else {

                    indexArray.current = [];
                    sectionIndex.current = sectionIndex.current + 1;

                    var temp = completeQuestionsSet.current.filter(item => item.sectionOrder === noOfSections.current[sectionIndex.current-1] && item.isSkip === false);
                    set_questionsArray(temp);
                    set_questionsArray(temp);
                    set_questionsArrayInitial(temp);
                    set_secDesc(temp[0].sectionDescription);

                }
                
            }
            set_isDropDown(false);
            if(value === 'FINISH') {
                navigateToPrevious();
                return;
            }
        
    };

    const getSectionsAnswered = async () => {

        var mandateValue = 0;
        for(let i = 0; i < questionsArrayInitial.length; i++){
            if(questionsArrayInitial[i].isMandatory){
                mandateValue = mandateValue+1;                    
            }
        }
        set_mandatoryQuestions(mandateValue);

        if(mandateValue > 0) {
            let checkAnswered = 0;

            if(questionnaireDict) {
                questionsArrayInitial.map((item,index) => {
                    let dict = questionnaireDict['QestionId_'+item.questionId+petId];
                    if(dict && dict.isMandatory) {
                        if(dict.questionItem.questionTypeId === 1) {
                            if(!dict.questionAnswer.option) {
                                checkAnswered = checkAnswered - 1;
                            } else {
                                checkAnswered = checkAnswered + 1;
                            }

                        }
                        else if(dict.questionItem.questionTypeId === 2) {
                            if(!dict.questionAnswer.option) {
                                checkAnswered = checkAnswered - 1;
                            } else {
                                checkAnswered = checkAnswered + 1;
                            }

                        } else {
                            checkAnswered = checkAnswered + 1;
                        }
                        
                    }              
                });

            }

            if(checkAnswered === mandateValue) {
                return 101;
            }

            return 102;

        } else {

            let checkAnswered = 0;
            questionsArrayInitial.map((item,index) => {
                if(questionnaireDict) {
                    let dict = questionnaireDict['QestionId_'+item.questionId+petId];
                    if(dict) {
                        checkAnswered = checkAnswered + 1;
                    }
                }
                
            });

            if(checkAnswered > 0) {
                return 104;
            }

            return 103;
        }
    };

    const getOthersSpecfyAnswered = async () => {

        let checkAnswered = 0;
        if(questionnaireDict) {

            questionsArrayInitial.map((item,index) => {
                let dict = questionnaireDict['QestionId_'+item.questionId+petId];
                if(dict) {
                    if(dict.questionItem.questionTypeId === 1) {

                        if((dict.questionAnswer.option && dict.questionAnswer.option === Constant.MSELECTION_OTHER_SPECIFY && dict.questionAnswer.rAnswer === '')) {
                            checkAnswered = checkAnswered + 1;
                        } 
    
                    } else if(dict.questionItem.questionTypeId === 2) {
    
                        if((dict.questionAnswer.option && dict.questionAnswer.option === Constant.MSELECTION_OTHER_SPECIFY && dict.questionAnswer.rAnswer === '')) {
                            checkAnswered = checkAnswered + 1;
                        } 
    
                    }else if(dict.questionItem.questionTypeId === 3) {
                        if(dict.questionAnswer) {
                            let tempDict = JSON.parse(dict.questionAnswer);
                            if(tempDict && tempDict.length === 1 && tempDict[0].option === Constant.MSELECTION_OTHER_SPECIFY && tempDict[0].rAnswer === '') {
                                checkAnswered = checkAnswered + 1;
                            } 
                        } 
                    } 
                }               
            })
        }
        return checkAnswered;
        
    };

    const previousSection = async (value) => {

        filterName.current = 'All';
        set_isFiterEmpty(false);
        set_isDropDown(false);
        set_isQuestListOpen(null);

        if(props.status !== 'Submitted') {

            let mndtryAnswered = await getSectionsAnswered();
            if(mndtryAnswered === Mandate_Answered || mndtryAnswered === Non_Mandate_Answered) {
                // saveQuestions('prevAction');
            } 

            indexArray.current = [];
            if (sectionIndex.current > 1) {
                sectionIndex.current = sectionIndex.current -1
            }
            
            if(sectionIndex.current !== totalSections) {

                var temp = completeQuestionsSet.current.filter(item => item.sectionOrder === noOfSections.current[sectionIndex.current-1] && item.isSkip ==  false);
                set_secChange(false);
                set_questionsArray(temp);
                set_questionsArrayInitial(temp);
                if(temp[0] && temp[0].sectionDescription) {
                    set_secDesc(temp[0].sectionDescription);
                } else {
                    set_secDesc('');
                }              
            }
        }

    };

    const saveQuestionnaire = async (value) => {

        if(mandatoryQuestions > 0 && Object.keys(questionnaireDict).length === 0){
            props.createPopup(Constant.QUESTIONS_ANSWER_MSG,Alert_Min_Answer_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);  
        }else {

            await QestionnaireDataObj.saveAnswer(questionnaireDict,questionnaireId,petId);
            let dict = await QestionnaireDataObj.getAnswer(questionnaireId,petId);

            if(dict) {
                props.updateQstServiceDict(dict, completeQuestionsSet.current);
                let isAnswered = 0;

                if(noOfSections.current.length > 1) {
                    isAnswered = await saveSectionsAnsweredNext(completeQuestions,dict,petId);
                } else {
                    isAnswered = await saveWithoutSectionsAnswered(completeQuestions,dict,petId);
                }
                if(isAnswered) {
                    secAnsweredRef.current = isAnswered;
                    set_sectionsAnswered(isAnswered);
                } else {
                    secAnsweredRef.current = 0;
                    set_sectionsAnswered(0);
                }
                isChangesMade.current = false;
            }

            if(value !== 'nextAction' && value !== 'prevAction') {
                props.createPopup('Your responses saved successfully',Alert_Questions_Save_Id,Constant.ALERT_INFO,'OK',false,true,1);
            }

          }
    };

    const saveSectionsAnswered = async (questions,dict,petId) => {

        let checkAnswered = 0;
        questions.map((item,index) => {
            let dict1 = dict['QestionId_'+item.questionId+petId];
            if(dict1) {
                checkAnswered = checkAnswered + 1;
            }
            
        })

        if(checkAnswered > 0) {
            return true;
        } 

        return false;

    };

    const saveWithoutSectionsAnswered = async (questions,dict,petId) => {
        
        var totalAnsweredSections = 0;

        var mandateAnsweredQuestions = 0;
        let mandateQuestions = questions.filter(item => item.isMandatory);

        if(mandateQuestions.length === 0) {
            var answeredQuestions = 0;
            for (let mnd = 0; mnd < questions.length; mnd++) {

                let dict1 = dict['QestionId_'+questions[mnd].questionId+petId];
                if(dict1) {                              
                    answeredQuestions = answeredQuestions + 1;                
                } 
                                
            }

            if(answeredQuestions !== 0 ) {
                totalAnsweredSections = totalAnsweredSections + 1;
            }

        } else {

            for (let mnd = 0; mnd < mandateQuestions.length; mnd++) {

                let dict1 = dict['QestionId_'+mandateQuestions[mnd].questionId+petId];
                if(dict1) {                              
                    mandateAnsweredQuestions = mandateAnsweredQuestions + 1; 
                } 
                            
            }
    
            if(mandateAnsweredQuestions === mandateQuestions.length && mandateQuestions.length !== 0) {
    
                totalAnsweredSections = totalAnsweredSections + 1;
                            
            } 
        }
        
        return totalAnsweredSections;

    };

    const saveSectionsAnsweredNext = async (questions,dict,petId) => {
        
        let noSections = 0;

        questions.map((item,index) => {
            
            if(item.sectionOrder) {
                noSections = item.sectionOrder
            }
            
        })

        if(noSections > 0) {

            var result = [];
            var totalAnsweredSections = 0;

            for (let sec = 0; sec < noSections; sec++) {

                result = questions.filter(item => item.sectionOrder === sec+1);
                var mandateAnsweredQuestions = 0;
                let mandateQuestions = result.filter(item => item.isMandatory);

                if(mandateQuestions.length === 0) {
                    var answeredQuestions = 0;
                    for (let mnd = 0; mnd < result.length; mnd++) {

                        let dict1 = dict['QestionId_'+result[mnd].questionId+petId];
                        if(dict1) {                              
                            answeredQuestions = answeredQuestions + 1;                
                        } 
                                
                    }

                    if(answeredQuestions !== 0 ) {
                        totalAnsweredSections = totalAnsweredSections + 1;
                    }

                } else {

                    for (let mnd = 0; mnd < mandateQuestions.length; mnd++) {

                        let dict1 = dict['QestionId_'+mandateQuestions[mnd].questionId+petId];
                        if(dict1) {                              
                            mandateAnsweredQuestions = mandateAnsweredQuestions + 1; 
                        } 
                            
                    }
    
                    if(mandateAnsweredQuestions === mandateQuestions.length && mandateQuestions.length !== 0) {
    
                        totalAnsweredSections = totalAnsweredSections + 1;
                            
                    } 
                }
                
            }

        }
        
        return totalAnsweredSections;

    };

    const showInfo = () => {
        props.createPopup(infoText,Alert_Network_Id,'Instruction','OK',false,true,1);
    };

    const autoSubmitQuestRadioBtnAction = (value,qId) => {
       props.autoSubmitQuestRadioBtnAction(value,qId);
    };

    const autoSubmitQuestionnaire = (value,qId) => {
        props.autoSubmitQuestionnaire(value,qId);
    };

    const showMandatePopup = () => {
        props.createPopup(Constant.MANDATE_ANSWER_REC,Alert_Answer_Mandate,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,0); 
    };

    const submitQuestionData = async () => {
        props.submitQuestionData();
    };

    const skipRadioBtnAction = (value, obj) => {
        rearrangeSkipQuestions(value, obj);
    };

    const showiOScamAlert = () => {

        let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
                        searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED]}
                        textToHighlight={
                        Constant.CAMERA_PERMISSION_MSG}
                    />
        props.createPopup(high,Alert_Network_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,0); 
    }

    const resetPreviousSkipQuestions = async (questionnaireDict, selectedQuestion) => {

        let arrPrevAnswers1 = questionnaireDict;
        var arrPrevAnswers = undefined;
        if(arrPrevAnswers1 ) {
            arrPrevAnswers = Object.values(arrPrevAnswers1);
        }

        var skipLastQuestion = [];
        if (arrPrevAnswers && arrPrevAnswers.length > 0) {
            if (selectedQuestion != null) {
                var skipLastQuestion = arrPrevAnswers.filter(obj1 => obj1.questionItem.questionId == selectedQuestion.questionId);

                if (skipLastQuestion && skipLastQuestion.length > 0) {

                    var skipQuestionItem = skipLastQuestion[0].questionItem;
                    var skipQuestionAnswer = skipLastQuestion[0].questionAnswer;

                    var finalQuestionOptions = skipQuestionItem.questionAnswerOptions.filter(obj1 => obj1.questionAnswer == skipQuestionAnswer.option &&  obj1.skipTo != undefined);
                    if (finalQuestionOptions.length > 0) {

                    var finalQuestion = finalQuestionOptions[0].skipTo;
                    var selectedQuestionList = completeQuestionsSet.current.filter(obj1 => obj1.questionId == finalQuestion);
                    for (let i = 0; i < completeQuestionsSet.current.length ;  i++) {

                        if (completeQuestionsSet.current[i].questionOrder > selectedQuestion.questionOrder && completeQuestionsSet.current[i].questionOrder < selectedQuestionList[0].questionOrder){
                            completeQuestionsSet.current[i].isSkip = false;
                        }
                    }      
                    //    for (var i = selectedQuestion.questionOrder; i < selectedQuestionList[0].questionOrder ;  i++) {
                    //     completeQuestionsSet.current[i].isSkip = false;
                    //    }
                    }
                } 

            }
            else {

                for (var index = 0; index < arrPrevAnswers.length; index ++) {
                    var selectedQuestion = arrPrevAnswers[index].questionItem;
                    if (selectedQuestion != null) {
                        var skipLastQuestion = arrPrevAnswers.filter(obj1 => obj1.questionItem.questionId == selectedQuestion.questionId);
            
                        if (skipLastQuestion && skipLastQuestion.length > 0) {
            
                            var skipQuestionItem = skipLastQuestion[0].questionItem;            
                            var skipQuestionAnswer = skipLastQuestion[0].questionAnswer;
            
                            var finalQuestionOptions = skipQuestionItem.questionAnswerOptions.filter(obj1 => obj1.questionAnswer == skipQuestionAnswer.option &&  obj1.skipTo != undefined);
                            if (finalQuestionOptions.length > 0) {
                            var finalQuestion = finalQuestionOptions[0].skipTo;
            
                            var selectedQuestionList = completeQuestionsSet.current.filter(obj1 => obj1.questionId == finalQuestion);
                            for (let i = 0; i < completeQuestionsSet.current.length ;  i++) {

                                if (completeQuestionsSet.current[i].questionOrder > selectedQuestion.questionOrder && completeQuestionsSet.current[i].questionOrder < selectedQuestionList[0].questionOrder){
                                    completeQuestionsSet.current[i].isSkip = true;
                                }
                            }            
                            }
                        } 
    
                    }
                }
            }
        }

    }

    const rearrangeSkipQuestions = async (value, obj) => {

        var selectedQuestion = completeQuestionsSet.current.filter(obj1 => obj1.questionId == obj.questionId);
        var skipLastQuestion = completeQuestionsSet.current.filter(obj1 => obj1.questionId == value.skipQuestion);
        await resetPreviousSkipQuestions(questionnaireDict, selectedQuestion[0])

        if (value.skipQuestion != undefined) {
            let arrPrevAnswers1 = questionnaireDict;//await QestionnaireDataObj.getAnswer(questionObject.questionnaireId,petId);
            var arrPrevAnswers = undefined;
            if(arrPrevAnswers1 ) {
                arrPrevAnswers = Object.values(arrPrevAnswers1);
            }
            for (let i = 0; i < completeQuestionsSet.current.length ;  i++) {

                if (completeQuestionsSet.current[i].questionOrder > selectedQuestion[0].questionOrder && completeQuestionsSet.current[i].questionOrder < skipLastQuestion[0].questionOrder){
                    var key =   'QestionId_'+completeQuestionsSet.current[i].questionId+petId;

                    if(questionnaireDict) {

                        const copyDict = questionnaireDict;
                        delete copyDict[key];
                        var tempDict = copyDict;
                        set_questionnaireDict(tempDict);

                    }

                    completeQuestionsSet.current[i].isSkip = true;

                }
               
            }
        }
 
        await updateQuestionnaireQuestions(obj,value,obj.isMandatory,obj.questionType);
        // if(filterName.current === 'Answered' || filterName.current === 'Unanswered') {
        // if(filterName.current === 'All') {
            // filterName.current = 'All'
            //checkNoSections(props.questionObject,completeQuestionsSet.current);
        // }
        
    };

    return(
        <>
            <CheckinQuestionnaireUI

                questionsArray = {questionsArray}
                questionsArrayInitial = {questionsArrayInitial}
                mandatoryQuestions = {mandatoryQuestions}
                questionnaireName = {props.questionnaireName}
                status = {status}
                petId = {petId}
                petURL = {petURL}
                defaultPetObj = {defaultPetObj}
                questionnaireDict = {questionnaireDict}
                answeredQuestions = {answeredQuestions}
                filterOptions = {filterOptions}
                isFiterEmpty = {isFiterEmpty}
                noAction = {props.noAction}
                noActionDropQId = {props.noActionDropQId}
                noActionRadQId = {props.noActionRadQId}
                noActionRBtnQuest = {props.noActionRBtnQuest}
                noActionRBtnQuest1 = {noActionRBtnQuest1.current}
                isNoSelected = {isNoSelected}
                infoText = {infoText}
                filterName = {filterName.current}
                sectionIndex = {sectionIndex.current}
                indexArray = {indexArray.current}
                sectionAnswered = {secAnsweredRef.current}
                sectionAnsweredTotal = {secAnsweredRef.current}
                sectionArray = {sectionArray.current}
                totalSection = {totalSections}
                secDesc = {secDesc}
                isPopUp = {props.isPopUp}
                popUpMessage = {props.popUpMessage}
                popUpTitle = {props.popUpTitle}
                popupRBtnTitle = {props.popupRBtnTitle}
                isPopUpLftBtn = {props.isPopUpLftBtn}
                popIdRef = {props.popIdRef}
                isLoading = {props.isLoading}
                loaderMsg = {props.loaderMsg}
                isDropDown = {isDropdown}
                secChange = {secChange}
                isQuestListOpen = {isQuestListOpen}
                popOkBtnAction = {popOkBtnAction}
                popCancelBtnAction = {popCancelBtnAction}
                submitQuestionData = {submitQuestionData}
                saveQuestions = {saveQuestions}
                navigateToPrevious = {navigateToPrevious}
                updateQuestionnaireQuestions = {updateQuestionnaireQuestions}
                filterQuestionsAction = {filterQuestionsAction}
                viewVideoAction = {viewVideoAction}
                checkErrorPermissions = {checkErrorPermissions}
                autoSubmitQuestionnaire = {autoSubmitQuestionnaire}
                showMandatePopup = {showMandatePopup}
                nextSection = {nextSection}
                previousSection = {previousSection}
                saveQuestionnaire = {saveQuestionnaire}
                showInfo = {showInfo}
                autoSubmitQuestRadioBtnAction = {autoSubmitQuestRadioBtnAction}
                skipRadioBtnAction = {skipRadioBtnAction}
                showiOScamAlert ={showiOScamAlert}
            />

        </>
    )
}
export default CheckinQuestionnaireData;