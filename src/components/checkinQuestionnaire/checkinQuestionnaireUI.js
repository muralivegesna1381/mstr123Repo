import React,{useState, useEffect,useRef} from 'react';
import {View,Text,TouchableOpacity,FlatList, Image,ImageBackground} from 'react-native';
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import { LogBox } from 'react-native';

import CheckinQuestionnaireStyles from "./checkinQuestionnaireStyles";
import QuestionnaireTextInput from './../questionnaire/questionnaireCustomComponents/customComponents/questionnaireTextInputComponent';
import QuestionnaireRadioButtonComponent from './../questionnaire/questionnaireCustomComponents/customComponents/questionnaireRadioButtonComponent';
import QuestionnaireMultySelectionComponent from './../questionnaire/questionnaireCustomComponents/customComponents/questionnaireMultiSelectionComponent';
import QuestionnaireDropdownComponent from "./../questionnaire/questionnaireCustomComponents/customComponents/questionnaireDropdownComponent";
import QuestionnaireSliderComponent from "./../questionnaire/questionnaireCustomComponents/customComponents/questionnaireSliderComponent";
import QstVerticalSliderComponent from "./../questionnaire/questionnaireCustomComponents/customComponents/qstVerticalSliderComponent";
import QstMediaUploadComponent from './../questionnaire/questionnaireCustomComponents/customComponents/qstMediaUploadComponent';
import QstDatePickerComponent from './../questionnaire/questionnaireCustomComponents/customComponents/qstDatePickerComponent';

import DownButtonImg from "./../../../assets/images/otherImages/svg/downArrowGrey.svg";
import UpButtonImg from "./../../../assets/images/otherImages/svg/upArrow.svg";
import DefaultPetImg from "./../../../assets/images/otherImages/png/defaultDogIcon_dog.png";
import filterImg from "./../../../assets/images/otherImages/png/filter.png";
import gradientImg from "./../../../assets/images/otherImages/png/petCarasoulBck.png";
import InfoImg from "./../../../assets/images/otherImages/svg/questInst.svg";
import NoRecordsImg from "./../../../assets/images/dogImages/noRecordsDog.svg";

const QUESTIONNAIRE_QUESTIONS_KEY = {
    QUESTIONITEM: 'questionItem',
    QUESTIONANSWER:'questionAnswer',
    QUESTIONNAIREID:'questionnaireId',
    ISMANDATORY:'isMandatory',
    QUESTIONTYPE : 'questionType'
};

const QUEST_DROPDOWN = 1;
const QUEST_RADIO_BUTTON = 2;
const QUEST_MULTIPLE_CHECKBOX = 3;
const QUEST_TEXT_BOX = 4;
const QUEST_TEXT_AREA = 5;
const QUEST_SCALE = 6;
const QUEST_IMAGE_UPLOAD = 7;
const QUEST_VIDEO_UPLOAD = 8;
const QUEST_DATE_TYPE = 9;

const CheckinQuestionnaireUI = ({navigation, route,...props}) => {

    const [questionsArray, set_questionsArray] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [questionnaireDict, set_questionnaireDict] = useState({});
    const [status, set_status] = useState(undefined);
    const [answeredQuestions, set_answeredQuestions] = useState(0);
    const [petId, set_petId] = useState(undefined);
    const [petURL, set_petURL] = useState(undefined);
    const [filterOptions, set_filterOptions] = useState(['All','Answered','Unanswered']);
    const [isQuestListOpen, set_isQuestListOpen] = useState(false);
    const [dropDownPostion, set_dropDownPostion] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [expandedIndex,set_expandedIndex] = useState(-1);  
    const [filterName, set_filterName] = useState('All');
    const [isFiterEmpty, set_isFiterEmpty] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);  
    const [isLoading, set_isLoading] = useState(false);
    const [isDropdown, set_isDropDown] = useState(false);
    const [ddIndex,set_ddIndex] = useState(0);
    const [dropDownItem,set_dropDownItem] = useState(undefined);
    const [dropDownValue,set_dropDownValue] = useState('Please select');
    const [questionTitle, set_questionTitle] = useState('');
    const [isScrollEnable, set_isScrollEnable] = useState(true);
    const [mandatoryIDArray, set_mandatoryIDArray] = useState(undefined);
    const [isShowInfoView, set_isShowInfoView] = useState(false);
    const [isImgFailed, set_isImgFailed] = useState(false);
    const [isSliding, setIsSliding] = useState(false);

    var indexArray = useRef([]);
    var popCancelValue = useRef(undefined);

    useEffect(() => {
        LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
    }, [])

    useEffect(() => {

        set_questionnaireDict(props.questionnaireDict);        
        if(props.questionsArray) {
            set_questionsArray(props.questionsArray);
            // getMandatoryQuestions(props.questionsArray);

        }
        if(props.defaultPetObj) {
            set_defaultPetObj(props.defaultPetObj);
        }
        if(props.questionObject){
            set_questionTitle(props.questionObject.questionnaireName);
        }
        // set_questionTitle(props.questionObject.questionnaireName);
    }, [props.defaultPetObj,props.questionsArray,props.questionsArrayInitial,props.mandatoryQuestions,props.questionnaireDict,props.questionObject,props.sectionsAnswered ]);

    useEffect(() => {
        set_status(props.status);
        set_answeredQuestions(props.answeredQuestions);
        set_isFiterEmpty(props.isFiterEmpty);
    }, [props.status,props.answeredQuestions,props.isFiterEmpty]);

    useEffect(() => {
        set_petId(props.petId);
        set_petURL(props.petURL);
        set_filterOptions(props.filterOptions);
    }, [props.petId,props.petURL]);

    useEffect(() => {
    }, [props.noAction]);

    useEffect(() => {
        indexArray.current = props.indexArray;
        set_filterName(props.filterName);
    }, [props.indexArray,props.filterName]);

    useEffect(() => {
        set_isDropDown(props.isDropDown);
    }, [props.isDropDown]);

    useEffect(() => {
        set_isQuestListOpen(props.isQuestListOpen);
    }, [props.isQuestListOpen]);

    useEffect(() => {
        set_popUpMessage(props.popUpMessage);
        set_popUpTitle(props.popUpTitle);
        set_isPopUp(props.isPopUp);
        set_isLoading(props.isLoading);      
    }, [props.popUpMessage,props.popUpTitle,props.isPopUp,props.isLoading]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const saveButtonAction = () => {
        props.saveQuestions();
    };

    const submitButtonAction = () => {
        props.submitQuestionData();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const getMandatoryQuestions = (arrayQuestions) => {

        let tempArray = [];
        for (let i = 0; i < arrayQuestions.length; i++) {
            if(arrayQuestions[i].isMandatory) {
                tempArray.push(arrayQuestions[i].questionOrder) 
            }
            
        }
        set_mandatoryIDArray(tempArray);

    }

    const getQuestionnaireQuestions = (key, subKey) => {
        if(questionnaireDict) {
            const requiredSubDict = questionnaireDict['QestionId_'+key+petId];   
              if(requiredSubDict) {
                 const _subKey = subKey || QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER;
                 return requiredSubDict ? requiredSubDict[_subKey] : '';
              }
              return '';
        }
    };
    
    const updateQuestionnaireQuestions= (item, answersArray,isMadatory,questionType) => {
      props.updateQuestionnaireQuestions(item, answersArray,isMadatory,questionType);
    };

    const calculateQuestionsPercentage = (item) =>{
        let _questionsflex = props.totalSection ? props.sectionAnswered/props.totalSection :100/100;
        return _questionsflex;
    };

    const actionOnRow = (item) => {
        updateQuestionnaireQuestions(item,item.questionAnswer,dropDownItem.isMandatory,dropDownItem.questionType);
        set_isDropDown(!isDropdown);
        set_dropDownValue(item.questionAnswer);
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    const dropDownBtnAction = (item,index) => {

        let value = undefined;
        value = getQuestionnaireQuestions(item.questionId);
        set_isDropDown(!isDropdown);
        set_ddIndex(index);
        set_dropDownItem(item);
    }

    const viewVideoAction = (item) => {
        props.viewVideoAction(item);
    };

    const checkErrorPermissions = (value) => {
        props.checkErrorPermissions(value);
    };

    const autoSubmitQuestionnaire = (value,qId) => {
        props.autoSubmitQuestionnaire(value,qId);
    };
   
    const showMandatePopup = () => {
        props.showMandatePopup();
    };

    const saveQuestionnaire = (value) => {
        props.saveQuestionnaire(value);
    };

    const previousSection = (value) => {
        props.previousSection(value);
    };

    const nextSection = (value) => {
        props.nextSection(value);
    };

    const showInfo = () => {

        props.showInfo();
        // set_isShowInfoView(!isShowInfoView);
    };

    const autoSubmitQuestRadioBtnAction = (value,qId) => {
        props.autoSubmitQuestRadioBtnAction(value,qId);
    };

    const skipRadioBtnAction = (value,item) => {
        props.skipRadioBtnAction(value,item);
    };

    const showiOScamAlert = () => {
        props.showiOScamAlert();
    }

    const {

        petsSelView,
        petImageStyle,
        indexName,
        questionnaireName,
        imageStyle,
        collapsedBodyStyle,
        collapseHeaderStyle,
        petTitle,
        petSubTitle,
        progressAnswered,
        progressViewStyle,
        topBarStyles,
        filterButtonUI,
        filterImageStyles,
        filterTextStyle,
        questListStyle,
        filterImageBackViewStyles,
        backViewGradientStyle,
        dropDownBtnStyle,
        dropTextStyle,
        popSearchViewStyle,
        flatcontainer,
        flatview,
        name,
        saveBtnStyle,
        infoBtnStyle,
        infoImgStyle,
        infoPopStyle,
        infoPopImgStyle,
        infoTextStyle,
        secDescStyle,
        secDescTxtStyle,
        secNumTxtStyle
      } = CheckinQuestionnaireStyles;

    const renderItemQuestionsFilter = ({ item, index }) => {
        return (
          <View>
            <TouchableOpacity key={index} onPress={() => {
                set_isQuestListOpen(!isQuestListOpen);
                set_filterName(item);
                props.filterQuestionsAction(item);
              }}
            >
              <View style={{backgroundColor: filterName === item ? '#6BC105' : "white",height: hp("4%"),justifyContent:'center'}}>
                <Text style={{ color: filterName === item ? "white" : "black" ,marginLeft: hp("1%"),}}>{item}</Text>
              </View>
              {index !== 2 ? <View style={{height: hp("0.1%"), backgroundColor:'#818588'}}></View> : null}
            </TouchableOpacity>
          </View>
        );
    };

   const renderItem = ({ item, index }) => {

    return (
        <>   

            <TouchableOpacity style={[collapseHeaderStyle]} onPress={() => {

                if(status !== 'Submitted' ) {
                    
                    let isNotAnswered = false;

                    for (let i = 0; i < questionsArray.length; i++) {
                        if(((questionsArray[i].questionOrder < item.questionOrder)) ) { 

                            if(questionsArray[i].isMandatory) {

                                if(!getQuestionnaireQuestions(questionsArray[i].questionId)) {
                                    isNotAnswered = true;
                                    break;
                                } else {
                                    let temp = getQuestionnaireQuestions(questionsArray[i].questionId);        
                                    if(questionsArray[i].questionTypeId === QUEST_MULTIPLE_CHECKBOX) {
                                        if(temp && temp !== '' && temp[0] && temp[0].option === Constant.MSELECTION_OTHER_SPECIFY && temp[0].rAnswer === '') {
                                            isNotAnswered = true;
                                            break;
                                        }
                                    } else {
                                        if(temp && temp !== '' && temp.option === Constant.MSELECTION_OTHER_SPECIFY && temp.rAnswer === '') {
                                            isNotAnswered = true;
                                            break;
                                        } else {
                                            if(questionsArray[i].questionTypeId === QUEST_DROPDOWN && temp !== '' && temp.option === undefined) {
                                                isNotAnswered = true;
                                                break;
                                            } else if(questionsArray[i].questionTypeId === QUEST_RADIO_BUTTON && temp !== '' && temp.option === undefined) {
                                                isNotAnswered = true;
                                                break;
                                            }
                                        }
                                    }
 
                                }

                            } else {
                                
                                let temp = getQuestionnaireQuestions(questionsArray[i].questionId);

                                if(temp && temp !== '' && questionsArray[i].questionTypeId === QUEST_MULTIPLE_CHECKBOX ) {
                                    temp = JSON.parse(temp);
                                    if(temp !== '' && temp[0] && temp[0].option === Constant.MSELECTION_OTHER_SPECIFY && temp[0].rAnswer === '') {
                                        isNotAnswered = true;
                                        break;
                                    }
                                } else {
                                    if(temp && temp !== '' && temp.option === Constant.MSELECTION_OTHER_SPECIFY && temp.rAnswer === '') {
                                        isNotAnswered = true;
                                        break;
                                    } 

                                }                                
                            }                           
                                
                        }
                        
                    }

                    if(isNotAnswered) {
                        showMandatePopup();
                        return;
                    }
                }
 
                if(indexArray.current.includes(index)){
                    var temp = indexArray.current.filter(item => item !== index);
                    indexArray.current = temp;
                }else{
                    indexArray.current.push(index);
                }
                expandedIndex === index ? set_expandedIndex(-1) : set_expandedIndex(index);
                    
                }}>
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        {/* <Text style={[indexName]}>{item.questionOrder}</Text> */}
                        <Text style={[indexName]}>{index+1}</Text>
                    </View>
                    <View style={{flex:6,justifyContent:'center'}}>
                        <Text style={item.question && item.question.length > 75 ? [questionnaireName,{marginTop:hp('1.2%'),marginBottom:hp('1.2%'),}] : [questionnaireName]}>{item.question }{item.isMandatory ? <Text style={[questionnaireName,{color:'red'}]}>  *</Text> : null}</Text>                                   

                    </View>
                                    
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        {indexArray.current.includes(index) ? <UpButtonImg style={imageStyle}/> : <DownButtonImg style={imageStyle}/>}                                     
                    </View>
                </TouchableOpacity>

                    {indexArray.current.includes(index) ? 
                    
                    <View style={[collapsedBodyStyle]}>

                        {item.questionTypeId === QUEST_TEXT_AREA ?  <QuestionnaireTextInput
                            placeholder={'Enter Text (Limit: 500)'}   
                            maxLength = {500}
                            textAnswer={getQuestionnaireQuestions(item.questionId)}
                            isMultiLineText={false}
                            status_QID = {status}
                            questionImageUrl = {item.questionImageUrl ? item.questionImageUrl : false}
                            isAnsSubmitted = {item.answer ? true : false}
                            setValue={(textAnswer) => {
                                updateQuestionnaireQuestions(item,textAnswer,item.isMandatory,item.questionType);
                            }}
                        /> 
                        : null}
                       {item.questionTypeId === QUEST_TEXT_BOX ?  <QuestionnaireTextInput
                            placeholder={'Enter Text (Limit: 20)'}   
                            maxLength = {20}
                            textAnswer={getQuestionnaireQuestions(item.questionId)}
                            isMultiLineText={false}
                            status_QID = {status}
                            questionImageUrl = {item.questionImageUrl}
                            isAnsSubmitted = {item.answer ? true : false}
                            setValue={(textAnswer) => {
                                updateQuestionnaireQuestions(item,textAnswer,item.isMandatory,item.questionType);
                            }}
                       /> 

                       : null}
                       {item.questionTypeId === QUEST_RADIO_BUTTON ? <QuestionnaireRadioButtonComponent
                            selectedAnswer = {getQuestionnaireQuestions(item.questionId)}
                            answersArray = {questionsArray[index].questionAnswerOptions}
                            textAnswer = {getQuestionnaireQuestions(item.questionId)}
                            status_QID = {status}
                            autoSubmitActionRbtnQuest = {props.noActionRBtnQuest}
                            questionImageUrl = {item.questionImageUrl}
                            isAnsSubmitted = {item.answer ? true : false}
                            suffleOptionOrder = {item.suffleOptionOrder}
                            questionId = {item.questionId}
                            autoNoRadQid = {props.noActionRadQId}
                            setValue={(textAnswer) => {
                                let tempValue = {
                                    option:textAnswer.option,
                                    rAnswer: textAnswer.rAnswer,
                                    submitQuestionnaire: textAnswer.submitQuestionnaire,
                                    skipQuestion : textAnswer.skipQuestion,
                                    skipSection : textAnswer.skipSection, 
                                    questionAnswerId : textAnswer.questionAnswerId, 
                                    questSecOrder : item.sectionOrder, 
                                    questOrder : item.questionOrder, 
                                    questionId: item.questionId,
                                    ansOptionMediaFileName : textAnswer.ansOptionMediaFileName
                                }; 
                                skipRadioBtnAction(tempValue,item);
                                updateQuestionnaireQuestions(item,textAnswer,item.isMandatory,item.questionType);
                            }} 
                            setSubmitValue={(value) => {
                                autoSubmitQuestRadioBtnAction(value,item.questionId);
                            }} 
                            // setSkipValue={(value) => {
                              
                            // }} 

                       /> : null}

                       {item.questionTypeId === QUEST_MULTIPLE_CHECKBOX ?  <QuestionnaireMultySelectionComponent
                            value={getQuestionnaireQuestions(item.questionId)}
                            selectedArray={getQuestionnaireQuestions(item.questionId)}
                            answerArray = {questionsArray[index].questionAnswerOptions}
                            status_QID = {status}
                            questionImageUrl = {item.questionImageUrl}
                            isAnsSubmitted = {item.answer ? true : false}
                            suffleOptionOrder = {item.suffleOptionOrder}
                            setValue={(selectedArray) => {
                                updateQuestionnaireQuestions(item,selectedArray,item.isMandatory,item.questionType);
                            }} 
                       /> : null}

                       {item.questionTypeId === QUEST_DROPDOWN ?  <QuestionnaireDropdownComponent
                            dropdownAns = {getQuestionnaireQuestions(item.questionId)}
                            answerArray = {questionsArray[index].questionAnswerOptions}
                            status_QID = {status}
                            questionImageUrl = {item.questionImageUrl}
                            autoSubmitAction = {props.noAction}
                            questionId = {item.questionId}
                            isAnsSubmitted = {item.answer ? true : false}
                            suffleOptionOrder = {item.suffleOptionOrder}
                            autoNoQid = {props.noActionDropQId}
                            setValue={(textAnswer) => {
                                let tempValue = {
                                    option:textAnswer.option,
                                    value:textAnswer.value,
                                    rAnswer: textAnswer.rAnswer,
                                    submitQuestionnaire: textAnswer.submitQuestionnaire,
                                    skipQuestion : textAnswer.skipQuestion,
                                    skipSection : textAnswer.skipSection, 
                                    questionAnswerId : textAnswer.questionAnswerId, 
                                    questSecOrder : item.sectionOrder, 
                                    questOrder : item.questionOrder, 
                                    questionId: item.questionId
                                }; 
    
                                skipRadioBtnAction(tempValue,item);
                                updateQuestionnaireQuestions(item,tempValue,item.isMandatory,item.questionType);
                            }}
                            setSubmitValue={(value) => {
                                autoSubmitQuestionnaire(value,item.questionId);
                            }}

                        /> : null}

                       {item.questionTypeId === QUEST_SCALE && !item.isVerticalScale ? <QuestionnaireSliderComponent
                            value={getQuestionnaireQuestions(item.questionId)}
                            minValue = {item.floor}
                            maxValue = {item.ceil}
                            breakValue = {item.tickStep}
                            isContinuousScale = {item.isContinuousScale}
                            desc = {item.questionAnswerOptions[0].questionAnswer}
                            status_QID = {status}
                            questionImageUrl = {item.questionImageUrl}
                            ceilDescription = {item.ceilDescription}
                            floorDescription = {item.floorDescription}
                            isAnsSubmitted = {item.answer ? true : false}
                            setValue={(value) => {
                                updateQuestionnaireQuestions(item,value,item.isMandatory,item.questionType);
                            }}/> 
                        : null}

                        {item.questionTypeId === QUEST_SCALE && item.isVerticalScale ? <QstVerticalSliderComponent
                            value={getQuestionnaireQuestions(item.questionId)}
                            minValue = {item.floor}
                            maxValue = {item.ceil}
                            breakValue = {item.tickStep}
                            isContinuousScale = {item.isContinuousScale}
                            desc = {item.questionAnswerOptions[0].questionAnswer}
                            questionImageUrl = {item.questionImageUrl}
                            isScrollEnable = {isScrollEnable}
                            status_QID = {status}
                            ceilDescription = {item.ceilDescription}
                            floorDescription = {item.floorDescription}
                            isAnsSubmitted = {item.answer ? true : false}
                            setValue={(value) => {
                                updateQuestionnaireQuestions(item,value,item.isMandatory,item.questionType);
                            }}
                            setScroll={(scrollvalue) => {
                                setIsSliding(scrollvalue);
                               // set_isScrollEnable(value);
                            }}
                            /> 
                            
                        : null} 

                        {item.questionTypeId === QUEST_VIDEO_UPLOAD ? <QstMediaUploadComponent
                            value={getQuestionnaireQuestions(item.questionId)}
                            mediaType = {'video'}
                            desc = {item.questionAnswerOptions.length > 0 ? item.questionAnswerOptions[0].questionAnswer : ''}
                            status_QID = {status}
                            questionImageUrl = {item.questionImageUrl}
                            defaultPetObj = {defaultPetObj}
                            questionName = {item.question}
                            questionnaireName = {questionTitle}
                            submittedAnswer = {item.answer ? item.answer : undefined}
                            viewVideoAction = {(value) => {
                                viewVideoAction(value);
                            }} 
                            setValue = {(value) => {
                                updateQuestionnaireQuestions(item,value,item.isMandatory,item.questionType);
                            }} 
                            errorPermissions={(value) => {
                                checkErrorPermissions(value);
                            }} 
                            showiOScamAlert={(value) => {
                                showiOScamAlert(value);
                            }} 
                            setLoaderValue={(value) => {}}/> 
                        : null}

                        {item.questionTypeId === QUEST_IMAGE_UPLOAD ? <QstMediaUploadComponent
                            value={getQuestionnaireQuestions(item.questionId)}
                            mediaType = {'photo'}
                            desc = {item.questionAnswerOptions.length > 0 ? item.questionAnswerOptions[0].questionAnswer : ''}
                            status_QID = {status}
                            questionImageUrl = {item.questionImageUrl}
                            defaultPetObj = {defaultPetObj}
                            questionName = {item.question}
                            questionnaireName = {questionTitle}
                            submittedAnswer = {item.answer ? item.answer : undefined}
                            setValue={(value) => {
                                updateQuestionnaireQuestions(item,value,item.isMandatory,item.questionType);
                            }} 

                            errorPermissions={(value) => {
                                checkErrorPermissions(value);
                            }} 
                            setLoaderValue={(value) => {}}/> 
                        : null}

                        {item.questionTypeId === QUEST_DATE_TYPE ? <QstDatePickerComponent
                            value={getQuestionnaireQuestions(item.questionId)}
                            desc = {item.questionAnswerOptions.length > 0 ? item.questionAnswerOptions[0].questionAnswer : ''}
                            status_QID = {status}
                            questionImageUrl = {item.questionImageUrl}
                            isAnsSubmitted = {item.answer ? true : false}
                            setValue={(value) => {
                                updateQuestionnaireQuestions(item,value.toString(),item.isMandatory,item.questionType);                                
                            }}/> 
                        : null}

                        </View> 
                    
                    : null}
            </>
        );

   }

   return(

    <View style={[CommonStyles.mainComponentStyle,{backgroundColor:'#F2F2F2'}]}>

            <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    isBackBtnEnable={false}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={props.questionnaireName && props.questionnaireName.length > 15 ? props.questionnaireName.slice(0,20) + '...'  : props.questionnaireName}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={[petsSelView]}>

                <ImageBackground style={[backViewGradientStyle]} imageStyle={{ borderRadius: 5 }} source={gradientImg}>

                    <View style={{alignItems:'center',justifyContent:'center',marginRight:hp('2%'),marginLeft:hp('3%'),}}>
                        {petURL && !isImgFailed ? <ImageBackground source={{uri:petURL}} style={[petImageStyle]} onError = {() => set_isImgFailed(true)}/> : <ImageBackground source={DefaultPetImg} style={[petImageStyle]}/>}
                    </View>

                    <View style={{flex:3,justifyContent:'center'}}>
                        <Text style={[petTitle]}>{defaultPetObj ? (defaultPetObj.petName && defaultPetObj.petName.length > 18 ? defaultPetObj.petName.slice(0,18) + '...' : defaultPetObj.petName): ''}</Text>
                        <Text style={[petSubTitle]}>{defaultPetObj ? (defaultPetObj.petBreed && defaultPetObj.petBreed.length > 18 ? defaultPetObj.petBreed.slice(0,18) : defaultPetObj.petBreed) : ''}</Text>
                        <Text style={[petSubTitle]}>{ defaultPetObj && defaultPetObj.speciesId === '1' ? 'Dog ' : 'Cat '}<Text>{defaultPetObj ? (defaultPetObj.gender ? '- ' +defaultPetObj.gender : defaultPetObj.gender) : ''}</Text></Text>
                    </View>

                    {props.infoText !== '' ? <View style={{flex:0.8,justifyContent:'center'}}>
                        <TouchableOpacity style={[infoBtnStyle]} onPress={() => {showInfo()}}>
                            <InfoImg style={[infoImgStyle]}/>
                        </TouchableOpacity>
                    </View> : null}

                </ImageBackground>

            </View>

            <View style={{marginBottom:10}}>            
                <View style={topBarStyles}>
                
                    <View style={progressViewStyle}>               
                        <View style={{backgroundColor:'#6BC105',alignItems: "center",flex:calculateQuestionsPercentage()}}></View>
                    </View>

                
                    <View style={{width:wp('30%'),height:hp('5%')}}>
                        <View style={filterButtonUI} onLayout={(event) => {
                                const layout = event.nativeEvent.layout;
                                const postionDetails = {
                                    x: layout.x,
                                    y: layout.y,
                                    width: layout.width,
                                    height: layout.height,
                                };
                                set_dropDownPostion(postionDetails)
                            }}>
                            
                            <TouchableOpacity style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',}} onPress={() => set_isQuestListOpen(!isQuestListOpen)}>
                                
                                <Text style={filterTextStyle}>{filterName}</Text> 
                                <View style={filterImageBackViewStyles}>
                                    <Image style={filterImageStyles} source={filterImg}></Image>  
                                </View>
                                    
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            
                <View style={{marginTop:hp('1.1%'), marginLeft:wp('18%'), position:'absolute',}}>
                    <Text style={[progressAnswered]}>{props.sectionAnsweredTotal + " of " + props.totalSection + (props.totalSection > 1 ? " Sections Answered" : " Section Answered")}</Text>
                </View>
           
            </View>
            
            {isFiterEmpty === false ? <View style={{alignItems:'center',height: status === 'Submitted' && props.totalSection && props.totalSection < 2 ? hp('70%') : hp('55%')}}>

              <KeyboardAwareScrollView scrollEnabled={!isSliding} keyboardShouldPersistTaps='handled' resetScrollToCoords = {{x:0, y:0}} automaticallyAdjustContentInsets={false} enableOnAndroid={true}>
                {/* {_renderQuetionItems()} */}
                {props.secDesc && props.secDesc.length > 0 ? <View style = {secDescStyle}>
                    <View style={{backgroundColor:'grey',width: wp("100%"),alignItems:'center'}}>
                        <Text style = {secNumTxtStyle}>{'Section : '+props.sectionIndex}</Text>
                    </View>
                    <Text style = {secDescTxtStyle}>{props.secDesc}</Text>
            </View> : null}

                <View style={{ marginTop: hp('1%'),alignItems : 'center'}}>

                    <FlatList
                        // ref={flatListRef}
                        data={questionsArray}
                        renderItem={renderItem}
                        scrollToOffset = {{ animated: true, offset: 0 }}
                        keyExtractor={(item, index) => "" + index}
                        keyboardShouldPersistTaps='always'
                        removeClippedSubviews = {false}
                        scrollEnabled={!isSliding}
                    />

                </View>
                
              </KeyboardAwareScrollView>
             
            </View> : 
            <View style={{justifyContent:'center', alignItems:'center',marginTop: hp("15%"),}}>
                <NoRecordsImg style= {[CommonStyles.nologsDogStyle]}/>
                <Text style={[CommonStyles.noRecordsTextStyle,{marginTop: hp("2%")}]}>{Constant.NO_RECORDS_LOGS}</Text>
                <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
            </View>}

            {status === 'Submitted' && props.totalSection && props.totalSection < 2 ? null : <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {props.sectionIndex === props.totalSection ? (status === 'Submitted' && props.sectionIndex === props.totalSection ? "FINISH" : 'SUBMIT') : "NEXT"}
                    leftBtnTitle = {'PREVIOUS'}
                    isLeftBtnEnable = {props.sectionIndex > 1 ? true : false}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextSection(props.sectionIndex === props.totalSection ? (status === 'Submitted' && props.sectionIndex === props.totalSection ? "FINISH" : 'SUBMIT') : "NEXT")}
                    leftButtonAction = {async () => previousSection()}
                />
            </View>}

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpTitle}
                    message={popUpMessage}
                    isLeftBtnEnable = {props.isPopUpLftBtn}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {props.popupRBtnTitle}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {props.loaderMsg} isButtonEnable = {false} /> : null} 

            {isQuestListOpen === true && (<FlatList style={[ questListStyle,{top:dropDownPostion.y-20 + dropDownPostion.height,}]}
              data={props.filterOptions}
              renderItem={renderItemQuestionsFilter}
              keyExtractor={(item, index) => "" + index}
            />)}

            {isDropdown ? <View style={[popSearchViewStyle]}>
                <FlatList
                    style={flatcontainer}
                    data={questionsArray[ddIndex].questionAnswerOptions}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => actionOnRow(item)}>
                            <View style={flatview}>
                                <Text numberOfLines={2} style={[name]}>{item.questionAnswer}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    enableEmptySections={true}
                    keyExtractor={(item,index) => index}
                /> 
                        
                </View> : null}

         </View>
    )
}
export default CheckinQuestionnaireUI;