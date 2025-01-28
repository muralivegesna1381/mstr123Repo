import React,{useState, useEffect, useRef} from 'react';
import {View, StyleSheet,ImageBackground,ActivityIndicator, TextInput,Text, TouchableOpacity} from 'react-native';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../../../utils/commonStyles/commonStyles';
import * as Constant from "./../../../../utils/constants/constant";
import ImageView from "react-native-image-viewing";
import { Dropdown } from 'react-native-element-dropdown';

const questionnaireDropdownComponent = ({navigation,dropdownAns,setValue, answerArray,status_QID,questionImageUrl,setSubmitValue,autoSubmitAction,setSkipValue,isAnsSubmitted,suffleOptionOrder,questionId,autoNoQid, route,...props}) => {

    const [checkValue,set_checkValue]=useState('Please Select');
    const [answers, set_answers] = useState([]);
    const [imgLoader, set_imgLoader] = useState(true);
    const [textAnswer, set_textAnswer] = useState('');
    const [isOthers, set_isOthers] = useState(false);
    const [isAutoSubmit, set_isAutoSubmit] = useState(undefined)
    const [isImageView, set_isImageView] = useState(false);
    const [images, set_images] = useState([]);
    const [value, set_Value] = useState(null);
    const [isFocus, setIsFocus] = useState(true);
    const [suffleOptionOrderLoc, set_suffleOptionOrderLoc] = useState(true);
    var check = useRef({option:'Please select...' ,rAnswer: ''});
    var selectedDrop = useRef();

    /**
     * This component is used to select values from Dropdown
     * all the values in the dropdown will be initialised here from answersArray props
     * Third-Party library used for this Dropdown is material drodown
     */
    useEffect(() => {     

      prepareOptions(answerArray);
      
    },[answerArray]);

    useEffect(() => {     
      
    },[dropdownAns]);

    useEffect(() => {     

      if(suffleOptionOrder !== undefined) {
        set_suffleOptionOrderLoc(suffleOptionOrder);
      }
      
    },[suffleOptionOrder]);

    useEffect(() => {     

      if(questionImageUrl && questionImageUrl !== ''){
        let img = {uri : questionImageUrl};
        set_images([img]);
    }
      
    },[questionImageUrl]);

    useEffect(() => { 
      
      if((autoSubmitAction === false || autoSubmitAction === null) && autoNoQid === questionId) {
        set_isAutoSubmit(false)
        setValue('');
        set_checkValue({option:'',rAnswer: '', submitQuestionnaire:false});
        check.current = {option:'Please select...' ,rAnswer: '', submitQuestionnaire:false};
        set_Value(0);
      } else {
        set_isAutoSubmit(true);
      }

    },[autoSubmitAction]);

    const prepareOptions = async (answersArray) => {

      let list = answersArray;
      if(suffleOptionOrder === true) {
        list = list.sort(() => Math.random() - 0.5);
      }

      let pinsArray = await pinPointOption(list,Constant.MSELECTION_OTHER_SPECIFY);
      let pinsNoneArray = await pinPointOption(pinsArray,Constant.MSELECTION_NONE_OF_THE_ABOVE);

      let tempArray = pinsNoneArray;
      let temp = [];

      for(let i=0; i < tempArray.length; i++){
        let json = {
          label: tempArray[i].questionAnswer,
          value : tempArray[i].questionAnswerId,
          rAnswer : '', 
          submitQuestionnaire : tempArray[i].submitQuestionnaire,
          skipTo : tempArray[i].skipTo ? tempArray[i].skipTo : undefined,
          skipToSectionId : tempArray[i].skipToSectionId ? tempArray[i].skipToSectionId : undefined,
          questionAnswerId : tempArray[i].questionAnswerId
        };
        temp.push(json);
      }
      set_answers(temp);
      if(status_QID === "Submitted") {

        var res = []
        if(dropdownAns && dropdownAns.includes('&&&')) {
          res = dropdownAns.split('&&&');
        }
        if(res && res.length > 1) {

          check.current = {option:res[0], rAnswer: res[1], submitQuestionnaire:false};
          set_checkValue({option:res[0], rAnswer: res[1], submitQuestionnaire:false})
          const answerValue = temp.filter(question => question.label === res[0]); 
          if(answerValue) {
            set_Value(answerValue[0].value);
          } 
          set_isOthers(true);
          set_textAnswer(res[1]);

        } else {
          const answerValue = temp.filter(question => question.label === dropdownAns); 
          if(answerValue) {
            set_Value(answerValue[0].value);
          }       
          check.current = {option:dropdownAns, rAnswer: dropdownAns.option === Constant.MSELECTION_OTHER_SPECIFY ? dropdownAns.rAnswer : dropdownAns.option, submitQuestionnaire:false};
          set_checkValue({option:dropdownAns, rAnswer: dropdownAns.option === Constant.MSELECTION_OTHER_SPECIFY ? dropdownAns.rAnswer : dropdownAns.option, submitQuestionnaire:false})
          
        }
        
      } else {

        if(dropdownAns) {

          set_Value(dropdownAns.value);
          selectedDrop.current = dropdownAns;
          check.current = {option:dropdownAns.option, rAnswer: dropdownAns.option === Constant.MSELECTION_OTHER_SPECIFY ? dropdownAns.rAnswer : dropdownAns.option, submitQuestionnaire:false}
          set_checkValue({option:dropdownAns.option, rAnswer: dropdownAns.option === Constant.MSELECTION_OTHER_SPECIFY ? dropdownAns.rAnswer : dropdownAns.option, submitQuestionnaire:false})   
              
        } else {
          check.current = {option:'Please select...' ,rAnswer: '', submitQuestionnaire:false}
          set_checkValue({option:'Please select...' ,rAnswer: '', submitQuestionnaire:false})  
          set_Value(0);
        }

        if(dropdownAns && (dropdownAns.option === Constant.MSELECTION_OTHER_SPECIFY)) {
          set_isOthers(true);
          set_textAnswer(dropdownAns.rAnswer);
        }
        
      }

    };

    const pinPointOption = async (questionsList,value) => {

      let tempItem = await getItem(questionsList,value);
      let tempArray = await removeObject(questionsList,value);
      let list = tempArray;

      if(tempArray.length < questionsList.length ) {
        tempArray = addAfter(list,list.length,tempItem)
      }
      return tempArray;

    };
  
    function getItem(array,value) {
      return array.find(data => data.questionAnswer === value);
    };

    function addAfter(array, index, newItem) {
      return [
          ...array.slice(0, index),
          newItem,
          ...array.slice(index)
      ];
    };

    const removeObject = (arr,value) => {
      const arr1 = arr.filter((item) => item.questionAnswer !== value);
      return arr1;
    };

    const renderLabel = () => {
      if (value || isFocus) {
        return (
          <Text style={[styles.label, isFocus && { color: 'blue' }]}>
            Dropdown label
          </Text>
        );
      }
      return null;
    };

    /**
     * All the UI elements for Dropdown
     * Initialises 
     */
    return(
      
        <View>

          {questionImageUrl ? <View>
            <TouchableOpacity style = {CommonStyles.questImagesBtnStyle} onPress={() => set_isImageView(true)}>
              <ImageBackground source={{uri : questionImageUrl}} style={[CommonStyles.questImageStyles]} imageStyle = {{borderRadius:10}}
                    onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {set_imgLoader(false)}}>
                      {imgLoader ? <ActivityIndicator size="large" color="gray"/> : null}
                      {!imgLoader ? <View style={CommonStyles.mediaSubViewStyle}>
                        <Text style={CommonStyles.mediaViewTextStyle}>{'VIEW'}</Text>
                    </View> : null}
                    </ImageBackground>
                    
            </TouchableOpacity>
          </View> : null}

          {!isAnsSubmitted && status_QID === 'Submitted' ? <View>
            <Text style={CommonStyles.submitQSTNotAnsweredTextStyle}>{Constant.QUESTIONS_NOT_ANSWERED}</Text>
            </View> : 
            <View style={styles.container}>

          <Dropdown
            style={[styles.dropdown1, isFocus && { borderColor: 'red' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            activeColor = {'#D9D9D9'}
            // inputSearchStyle={styles.inputSearchStyle}
            // iconStyle={styles.iconStyle}
            data={answers}
            // search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={'Please Select...'}
            disable = {status_QID === 'Submitted' ? true : false}
            // searchPlaceholder="Search..."
            value={value}
            // onFocus={() => setIsFocus(true)}
            // onBlur={() => setIsFocus(false)}
            onChange = {item => {              
              set_Value(item.value);
              selectedDrop.current = item;
              if(item.label === Constant.MSELECTION_OTHER_SPECIFY){
                set_isOthers(true);
                setValue({
                  option:item.label,
                  value:item.value,
                  rAnswer: '',
                  submitQuestionnaire: item.submitQuestionnaire,
                  skipQuestion : item.skipTo,
                  skipSection : item.skipToSectionId, 
                  questionAnswerId : item.questionAnswerId
                });
                check.current = {option:item.label,value:item.value, rAnswer: '', submitQuestionnaire: item.submitQuestionnaire}
                setSubmitValue(item.submitQuestionnaire);

              } else {

                set_textAnswer('')
                set_isOthers(false);
                setValue({
                  option:item.label,
                  value:item.value,
                  rAnswer: item.label === Constant.MSELECTION_OTHER_SPECIFY ? '' : item.label,
                  submitQuestionnaire: item.submitQuestionnaire,
                  skipQuestion : item.skipTo,
                  skipSection : item.skipToSectionId, 
                  questionAnswerId : item.questionAnswerId
                });
                check.current = {option:item.label,value:item.value, rAnswer: item.label === Constant.MSELECTION_OTHER_SPECIFY ? '' : item.label, submitQuestionnaire: item.submitQuestionnaire}
                set_checkValue({option:item.label,value:item.value, rAnswer: item.label === Constant.MSELECTION_OTHER_SPECIFY ? '' : item.label, submitQuestionnaire: item.submitQuestionnaire})
                setSubmitValue(item.submitQuestionnaire);
              }

          }}

        />

          </View>}

            {isOthers ? <View style={[styles.SectionStyle,{minHeight: hp("5%"),}]}>
              <TextInput 
                style={styles.textInputStyle}
                maxLength = {100}
                multiline = {true}
                placeholder = {'Enter Text (Limit: 100) *'}
                underlineColorAndroid = "transparent"
                placeholderTextColor = "#808080"
                value = {textAnswer}
                onChangeText = {async (text) => {
                  set_textAnswer(text.trimStart());
                  setValue({
                    option:Constant.MSELECTION_OTHER_SPECIFY,
                    value:selectedDrop.current.value,
                    rAnswer: text && text.length > 0 ? text.trimStart() : '',
                    submitQuestionnaire: selectedDrop.current.submitQuestionnaire,
                    skipQuestion : selectedDrop.current.skipTo,
                    skipSection : selectedDrop.current.skipToSectionId, 
                    questionAnswerId : selectedDrop.current.questionAnswerId
                  });

                  check.current = {option:Constant.MSELECTION_OTHER_SPECIFY,value:selectedDrop.current.value, rAnswer: text && text.length > 0 ? text.trimStart() : '' , submitQuestionnaire: selectedDrop.current.submitQuestionnaire}
                  set_checkValue({option:Constant.MSELECTION_OTHER_SPECIFY,value:selectedDrop.current.value, rAnswer: text && text.length > 0 ? text.trimStart() : '', submitQuestionnaire: selectedDrop.current.submitQuestionnaire})
                }}
                editable={status_QID==="Submitted" ? false : true}
              />   
            </View> : null}

            {isImageView ? <ImageView
                images={images}
                imageIndex={0}
                visible={isImageView}
                onRequestClose={() => set_isImageView(false)}
            /> : null}
      </View>
    )
}
export default questionnaireDropdownComponent;

const styles = StyleSheet.create({

    container: {
      justifyContent: 'center',
      alignSelf: 'center',
      width:wp('80%'),
      borderRadius:5,
      borderColor:'grey',
      borderWidth:1,
      alignItems:'center',
      marginBottom: hp("2%"),
    },

    dropdown: {
      width:wp('80%'),
      height:hp('5.5%'),
      justifyContent: 'center',
      marginTop: hp("2%"),  
    },

    dropdownText: {
      width:wp('80%'),
      height:hp('10.5%'),
      justifyContent: 'center',      
    },

    pickerStyle: {
      width:wp('80%'),
      marginTop: hp("6.5%"),
      marginLeft: hp("1%"),
      alignSelf: 'center',
      justifyContent: 'center',
  },

    textInputStyle: {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontMedium,
      width: wp("75%"),
      minHeight: hp("3%"),
      marginLeft: "5%",
      color: "black", 
    },

    SectionStyle: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
      borderWidth: 0.5,
      borderColor: "#D8D8D8",
      width: wp("80%"),
      borderRadius: hp("1%"),
      alignSelf: "center",
      marginBottom: hp("1%"),
      marginTop: hp("1%"),
    },

    dropdown1: {
      height: 50,
      width:wp('75%'),
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },

});