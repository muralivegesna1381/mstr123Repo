import React,{useState, useEffect, useRef} from 'react';
import {View, Text,TouchableOpacity,StyleSheet,ImageBackground,ActivityIndicator, TextInput} from 'react-native';
import fonts from './../../../../utils/commonStyles/fonts';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../../../utils/commonStyles/commonStyles';
import * as Constant from './../../../../utils/constants/constant';
import ImageView from "react-native-image-viewing";

const questionnaireRadioButtonComponent = ({navigation,value,answersArray,selectedAnswer,setValue,status_QID,questionImageUrl,setSubmitValue,autoSubmitActionRbtnQuest,setSkipValue,isAnsSubmitted,suffleOptionOrder,questionId,autoNoRadQid, route,...props}) => {

    const [checkValue,set_checkValue]=useState('');
    const [answers, set_answers] = useState([]);
    const [imgLoader, set_imgLoader] = useState(true);
    const [textAnswer, set_textAnswer] = useState('');
    const [isOthers, set_isOthers] = useState(undefined);
    const [isAutoSubmit, set_isAutoSubmit] = useState(undefined);
    const [isImageView, set_isImageView] = useState(false);
    const [images, set_images] = useState([]);

    var selectedIndex = useRef(0);
    var isPinnedOptions = useRef(false);
  /**
   * Sets the default values recieved from where it initialises
   */
    useEffect(() => { 
      prepareOptions(answersArray);
    },[answersArray,selectedAnswer]);

    useEffect(() => {     
      if(questionImageUrl && questionImageUrl !== ''){
        let img = {uri : questionImageUrl};
        set_images([img]);
    }
      
    },[questionImageUrl]);

    useEffect(() => { 
      
      if((autoSubmitActionRbtnQuest === false || autoSubmitActionRbtnQuest === null) && autoNoRadQid === questionId) {
        set_isAutoSubmit(false)
        setValue('');
        set_checkValue({option:'',rAnswer: '', submitQuestionnaire:false,ansOptionMediaFileName : null});
      } else {
        set_isAutoSubmit(true);
      }

    },[autoSubmitActionRbtnQuest]);

    const prepareOptions = async (answersArray) => {
      // set_answers(answersArray);
      let list = answersArray;
      
      if(!isPinnedOptions.current) {
        if(suffleOptionOrder === true) {
          list = list.sort(() => Math.random() - 0.5);
        }
        isPinnedOptions.current = true;
      }
      let pinsArray = await pinPointOption(list,Constant.MSELECTION_OTHER_SPECIFY);
      let pinsNoneArray = await pinPointOption(pinsArray,Constant.MSELECTION_NONE_OF_THE_ABOVE);

      if(pinsNoneArray) {
        set_answers(pinsNoneArray);
      } else {
        set_answers(answersArray);
      }
      
      if(status_QID === "Submitted") {
        var res = []
        if(selectedAnswer && selectedAnswer.includes('&&&')) {
          res = selectedAnswer.split('&&&');
        }
        if(res && res.length > 1) {
          set_checkValue({option: res[0],rAnswer: res[1],submitQuestionnaire: false});
          if(res[0].toUpperCase() === Constant.MSELECTION_OTHER_SPECIFY.toUpperCase()) {
            set_isOthers(true);
            set_textAnswer(res[1]);
          }
        } else {
          set_checkValue({option: selectedAnswer,rAnswer: selectedAnswer,submitQuestionnaire: false});
        }

      } else {
        selectedAnswer && set_checkValue({option:selectedAnswer.option,rAnswer: selectedAnswer.rAnswer,submitQuestionnaire:false,ansOptionMediaFileName : selectedAnswer.ansOptionMediaFileName});
        if(selectedAnswer && selectedAnswer.option && selectedAnswer.option.toUpperCase() === Constant.MSELECTION_OTHER_SPECIFY.toUpperCase()) {
          set_isOthers(true);
          set_textAnswer(selectedAnswer.rAnswer);
        }
      }

    };

    const pinPointOption = async (questionsList,value) => {

      let tempItem = await getItem(questionsList,value);
      let tempArray = await removeObject(questionsList,value);
      let list = tempArray;
      if(tempArray.length < questionsList.length ) {
        tempArray = await addAfter(list,list.length,tempItem)
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

    const assignImages = (uriValue) => {
      set_isImageView(true);
      let img = {uri : uriValue};
      set_images([img]);

    };

    /**
     * Radio Button UI
     * Options will be suplied to this component from where it initialises
     * Most likely YES or NO options
     * Selected values will passed to Parent class
     */
    const _renderRadioItems = () => {
        if(answers) {
            return answers.map((item,index) => {
                return (
                   <>
                   <View style={{marginBottom:hp('1%')}}>
                        
                        <TouchableOpacity disabled = {status_QID === "Submitted" ? true : false} style={checkValue.option === item.questionAnswer ? (questionImageUrl ? [styles.selectedBtnStyle,{}] : [styles.selectedBtnStyle]) : (questionImageUrl ? [styles.unSelectedBtnStyle,{}] : [styles.unSelectedBtnStyle])} onPress={()=>{
                          selectedIndex.current = index;
                          if(item.questionAnswer.toUpperCase() === Constant.MSELECTION_OTHER_SPECIFY.toUpperCase()) {
                            set_isOthers(true);
                            setValue({option:answers[index].questionAnswer,rAnswer: textAnswer,submitQuestionnaire:answers[index].submitQuestionnaire,ansOptionMediaFileName : answers[index].ansOptionMediaFileName});
                            set_checkValue({option:answers[index].questionAnswer,rAnswer: textAnswer,submitQuestionnaire:answers[index].submitQuestionnaire,ansOptionMediaFileName : answers[index].ansOptionMediaFileName});
                          } else {
                            set_isOthers(false);
                            set_textAnswer('');
                            setValue({
                              option:answers[index].questionAnswer,
                              rAnswer: answers[index].questionAnswer,
                              submitQuestionnaire:answers[index].submitQuestionnaire,
                              skipQuestion : answers[index].skipTo,
                              skipSection : answers[index].skipToSectionId, 
                              questionAnswerId : answers[index].questionAnswerId,
                              ansOptionMediaFileName : answers[index].ansOptionMediaFileName
                            });
                            set_checkValue({option:answers[index].questionAnswer,rAnswer: answers[index].questionAnswer,submitQuestionnaire:answers[index].submitQuestionnaire,ansOptionMediaFileName : answers[index].ansOptionMediaFileName});
                          }

                          setSubmitValue(answers[index].submitQuestionnaire);
                          // setSkipValue({
                          //   skipQuestion : answers[index].skipTo,
                          //   skipSection : answers[index].skipToSectionId, 
                          //   questionAnswerId : answers[index].questionAnswerId});
                        }} >  
                        <Text style={checkValue && checkValue.option && checkValue.option.toUpperCase() === item.questionAnswer.toUpperCase() ? [styles.selectedTextColor] : [styles.unSelectedTextColor]}>{item.questionAnswer}</Text>
                        {item.ansOptionMediaUrl ? <View>
                          <TouchableOpacity style = {CommonStyles.optionsQuestImagesBtnStyle} onPress={() => assignImages(item.ansOptionMediaUrl)}>
                            <ImageBackground source={{uri : item.ansOptionMediaUrl}} style={[CommonStyles.questOptionImageStyles]} imageStyle = {{borderRadius:10}}
                                  onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {set_imgLoader(false)}}>
                                    {imgLoader ? <ActivityIndicator size="large" color="gray"/> : null}
                                    {!imgLoader ? <View style={[CommonStyles.optionsmediaSubViewStyle,{height:hp('1.8'),}]}>
                                      <Text style={[CommonStyles.optionMediaViewTextStyle,{}]}>{'VIEW'}</Text>
                                  </View> : null}
                                  </ImageBackground>
                          </TouchableOpacity>
                        </View> : null}
                      </TouchableOpacity>

                      {isOthers && checkValue && checkValue.option && checkValue.option.toUpperCase() === item.questionAnswer.toUpperCase() ? <View style={[styles.SectionStyle,{minHeight: hp("5%"),}]}>
                        <TextInput
                          style={styles.textInputStyle}
                          maxLength={100}
                          multiline={true}
                          placeholder={'Enter Text (Limit: 100) *'}
                          underlineColorAndroid="transparent"
                          placeholderTextColor="#808080"
                          value={textAnswer}
                          onChangeText={async (text) => {
                            set_textAnswer(text.trimStart());
                            // if(text) {
                            //   setValue({option:answers[selectedIndex.current].questionAnswer,rAnswer: text,submitQuestionnaire: false});
                            // } else {
                            //   setValue()
                            // }  
                            
                            // if(selectedIndex.current > 0 && isOthers) {
                              setValue({option:Constant.MSELECTION_OTHER_SPECIFY,rAnswer: text.trimStart(),submitQuestionnaire: false,ansOptionMediaFileName : null});
                              set_checkValue({option:Constant.MSELECTION_OTHER_SPECIFY,rAnswer: text.trimStart(),submitQuestionnaire: false,ansOptionMediaFileName : null})
                            // }
                            
                          }}
                          editable={status_QID === "Submitted" ? false : true}
                        />   
                      </View> : null}

                   </View>
            
                   </>
                 )
            });
            }
       };

    return(

        <View style={styles.smsContainer} >

          {questionImageUrl ? <View>
            <TouchableOpacity style = {CommonStyles.questImagesBtnStyle} onPress={() => assignImages(questionImageUrl)}>
              <ImageBackground source={{uri : questionImageUrl}} style={[CommonStyles.questImageStyles]} imageStyle = {{borderRadius:10}}
                    onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {set_imgLoader(false)}}>
                      {imgLoader ? <ActivityIndicator size="large" color="gray"/> : null}
                      {!imgLoader ? <View style={CommonStyles.mediaSubViewStyle}>
                        <Text style={CommonStyles.mediaViewTextStyle}>{'VIEW'}</Text>
                    </View> : null}
                    </ImageBackground>
            </TouchableOpacity>
          </View> : null}

            {!isAnsSubmitted && status_QID === 'Submitted' ? <View style = {{height: hp("4%"),justifyContent:'center',}}>
              <Text style={[CommonStyles.submitQSTNotAnsweredTextStyle]}>{Constant.QUESTIONS_NOT_ANSWERED}</Text>
            </View> : _renderRadioItems()}

            {isImageView ? <ImageView
              images={images}
              imageIndex={0}
              visible={isImageView}
              onRequestClose={() => set_isImageView(false)}
            /> : null}
          </View>
    )
}
export default questionnaireRadioButtonComponent;

const styles = StyleSheet.create({

    smsContainer: {
        marginLeft:wp('2%'),
        marginRight:wp('2%'),   
    },

     selectedTextColor: {
      ...CommonStyles.textStyleBold,
      fontSize: fonts.fontMedium,
        textAlign: "left",
        color:'#6BC105',
        marginRight:wp('2%'),
        marginLeft:wp('2%'),  
        marginTop:wp('2%'),
        marginBottom:wp('2%'), 
        alignSelf:'center'     
      },

      unSelectedTextColor: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color:'#6C6C6C',
        marginRight:wp('2%'),
        marginLeft:wp('2%'),
        marginTop:wp('2%'),
        marginBottom:wp('2%'),
        alignSelf:'center'
      },

      unSelectedBtnStyle : {
        width:wp('80%'),
        minHeight:hp('6'),
        backgroundColor:'#ededed',
        borderRadius:15,
        borderColor:'#B1B1B5',
        borderWidth:1,
        justifyContent:'space-between',
        flexDirection: "row",
      },

      selectedBtnStyle : {
        width:wp('80%'),
        minHeight:hp('6'),
        backgroundColor:'#D9F4BA',
        borderRadius:15,
        borderColor:'#6BC105',
        borderWidth:1,
        justifyContent:'space-between',
        flexDirection: "row",
        alignItems:'center'
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

});