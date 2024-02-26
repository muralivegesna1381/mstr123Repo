import React,{useState, useEffect,useRef} from 'react';
import {View, Text,TouchableOpacity,StyleSheet,ImageBackground,ActivityIndicator,TextInput,FlatList} from 'react-native';
import fonts from './../../../../utils/commonStyles/fonts';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../../../utils/commonStyles/commonStyles';
import * as Constant from './../../../../utils/constants/constant'
import ImageView from "react-native-image-viewing";

const questionnaireMultiSelectionComponent = ({navigation,_questionId,value,setValue,answerArray, selectedArray,questionImageUrl,status_QID,isAnsSubmitted,suffleOptionOrder, route,...props}) => {

    const [answersArray,set_answersArray]=useState([]);
    const [imgLoader, set_imgLoader] = useState(true);
    const [updateState, set_updateState] = useState([]);
    const [selectText, set_selectText] = useState('Select All');
    const [isOthersSpecify, set_isOthersSpecify] = useState(false);
    const [textAnswer, set_textAnswer] = useState('');
    const [isImageView, set_isImageView] = useState(false);
    const [images, set_images] = useState([]);

    var selectedAnswers = useRef([]);
    var tempAnswersArray = useRef([]);
    var totalOptions = useRef(0);
    // var noneValue = useRef('More than 7 times per week');
    // var otheSpecifyValue = useRef('Once per week or less  ');

    /**
     * This component is used for selecting multiple options
     * Options will be supplied from where this component initialises
     * Default option selection will be set in this useEffect.
     */
    useEffect( () => {  
      prepareOptions(answerArray);
    },[answerArray]);

    useEffect(() => {     

      if(questionImageUrl && questionImageUrl !== ''){
        let img = {uri : questionImageUrl};
        set_images([img]);
    }
      
    },[questionImageUrl]);

    const prepareOptions = async (answerArray) => {

      if(status_QID === "Submitted" ) {
        let tempArray = [];
        if(value && value.includes('###')) {
          const res = value.split('###');
          tempArray = res;
        } else {
          tempArray.push(value);
        }
        let tempJsonArray = [];

        for (let i = 0 ; i < tempArray.length; i++){          
          let jsonValue = {"questionAnswer":tempArray[i]};
          tempJsonArray.push(jsonValue);
        }

        if(tempJsonArray && tempJsonArray.length>0){
          tempAnswersArray.current=[];
          tempAnswersArray.current=tempJsonArray;
          let temp = [];
          let check = tempJsonArray;
          for (let i = 0; i < check.length; i++){
            if(check[i].questionAnswer.toUpperCase().includes(Constant.MSELECTION_OTHER_SPECIFY.toUpperCase())) {
              const res1 = check[i].questionAnswer.split('&&&');
              if(res1 && res1.length > 1) {
                temp.push(res1[0]);
                set_textAnswer(res1[1]);
                set_isOthersSpecify(true)
              }
            } else {
              temp.push(check[i].questionAnswer);
            }
            
          }
          selectedAnswers.current = temp;
        }
        
        let tempItem = undefined;
        let tempArrayFilter = [];
        let list1 = [];
        const otherValue = answerArray.filter(question => question.questionAnswer === Constant.MSELECTION_OTHER_SPECIFY);
        if(otherValue) {
          tempItem = await getItem(answerArray,Constant.MSELECTION_OTHER_SPECIFY);
          tempArrayFilter = await removeObject(answerArray,Constant.MSELECTION_OTHER_SPECIFY);
          list1 = tempArrayFilter;
        }
        if(tempArrayFilter.length < answerArray.length ) {
          tempArrayFilter = await addAfter(list1,list1.length,tempItem)
        }

        const noneValueTemp = answerArray.filter(question => question.questionAnswer === Constant.MSELECTION_NONE_OF_THE_ABOVE);
        if(noneValueTemp) {
          tempItem = await getItem(tempArrayFilter,Constant.MSELECTION_NONE_OF_THE_ABOVE);
          tempArrayFilter = await removeObject(tempArrayFilter,Constant.MSELECTION_NONE_OF_THE_ABOVE);
          list1 = tempArrayFilter;
        }

        if(tempArrayFilter.length < answerArray.length ) {
          tempArrayFilter = await addAfter(list1,list1.length,tempItem)
        }

        set_answersArray(tempArrayFilter);

      } else {

        if(selectedArray) {
          selectedArray = JSON.parse(selectedArray);
        }

        if(selectedArray && selectedArray.length > 0){
          
          tempAnswersArray.current = [];
          tempAnswersArray.current = selectedArray;
          
          let temp=[];
          let check = selectedArray;
          for (let i = 0; i < check.length; i++){
            if(check[i].option === Constant.MSELECTION_OTHER_SPECIFY) {
              set_isOthersSpecify(true);
              set_textAnswer(check[i].rAnswer);
            } else {
              set_isOthersSpecify(false);
            }
            temp.push(check[i].option);
          }
          
          selectedAnswers.current = temp;
          selectedAnswers.current = Array.from(new Set(selectedAnswers.current));
          
        }
        
        if(status_QID !== "Submitted") {
          
          let list = answerArray;

          if(suffleOptionOrder === true) {
            list = list.sort(() => Math.random() - 0.5);
          }

          let tempItem = undefined;
          let tempArray = [];
          let list1 = [];
          const otherValue = answerArray.filter(question => question.questionAnswer === Constant.MSELECTION_OTHER_SPECIFY);
          if(otherValue) {
            tempItem = await getItem(list,Constant.MSELECTION_OTHER_SPECIFY);
            tempArray = await removeObject(list,Constant.MSELECTION_OTHER_SPECIFY);
            list1 = tempArray;
          }

          if(tempArray.length < list.length ) {
            tempArray = await addAfter(list1,list1.length,tempItem)
          }
          const noneValueTemp = answerArray.filter(question => question.questionAnswer === Constant.MSELECTION_NONE_OF_THE_ABOVE);
          if(noneValueTemp) {
            tempItem = await getItem(tempArray,Constant.MSELECTION_NONE_OF_THE_ABOVE);
            tempArray = await removeObject(tempArray,Constant.MSELECTION_NONE_OF_THE_ABOVE);
            list1 = tempArray;
          }

          if(tempArray.length < list.length ) {
            tempArray = await addAfter(list1,list1.length,tempItem)
          }

          if((otherValue && otherValue.length > 0) && (noneValueTemp && noneValueTemp.length > 0)) {
            
            totalOptions.current = answerArray.length - 2;
          } else if((otherValue && otherValue.length > 0) || (noneValueTemp && noneValueTemp.length > 0)) {
            totalOptions.current = answerArray.length - 1;
          } else {
            totalOptions.current = answerArray.length;
          }

          set_answersArray(tempArray);
        } else {
          set_answersArray(answerArray);
        }

        const noneAbove = answerArray.filter(question => question.questionAnswer === Constant.MSELECTION_NONE_OF_THE_ABOVE);        
        if(noneAbove && noneAbove.length > 0) {
          if(selectedAnswers.current && selectedAnswers.current.length === answerArray.length-1) {
            set_selectText('Unselect All')
          }
        } else {
          if(selectedAnswers.current && selectedAnswers.current.length === answerArray.length) {
            set_selectText('Unselect All')
          }
        }

      }

    };

    const selectAllOptions = () => {

      selectedAnswers.current = [];
      tempAnswersArray.current = [];
      set_isOthersSpecify(false);
      if(selectText === 'Select All') {
        for(let i=0; i < answersArray.length ; i++){
          
          if(answersArray[i].questionAnswer !== Constant.MSELECTION_NONE_OF_THE_ABOVE && answersArray[i].questionAnswer !== Constant.MSELECTION_OTHER_SPECIFY) {
            let obj = {option:answersArray[i].questionAnswer, rAnswer: textAnswer,questionAnswerId:answersArray[i].questionAnswerId,ansOptionMediaFileName : answersArray[i].ansOptionMediaFileName};
            selectedAnswers.current.push(answersArray[i].questionAnswer);
            tempAnswersArray.current.push(obj);
          }

        }
        set_selectText('Unselect All');
        selectedAnswers.current = Array.from(new Set(selectedAnswers.current));
        tempAnswersArray.current = Array.from(new Set(tempAnswersArray.current));
        setValue(JSON.stringify(tempAnswersArray.current));
        set_updateState(selectedAnswers.current);

      } else {
        set_selectText('Select All');
        selectedAnswers.current = [];
        tempAnswersArray.current = [];
        setValue([]);
      }

    };
  
    function getItem(array,value) {
      return array.find(data => data.questionAnswer === value);
    };

    const removeObject = (arr,value) => {
      const arr1 = arr.filter((item) => item.questionAnswer !== value);
      return arr1;
    };

    function addAfter(array, index, newItem) {
      return [
          ...array.slice(0, index),
          newItem,
          ...array.slice(index)
      ];
    };

    const assignImages = (uriValue) => {
      set_isImageView(true);
      let img = {uri : uriValue};
      set_images([img]);

    };

    /**
     * UI for Multiple answers
     * When selectedAnswers, particular options will be in selection mode
     * Else all options will be in default state
     * Values will be saved / deleted based on seletion / unselection
     * selected objects will passed to parent class for saving objects as default.
     * @returns 
     */
      const _renderMultiAnswers = () => {
        if(answersArray) {
            return answersArray.map((item, index) => {
                return (
                   <>
                     <View style={styles.selectionContainer}>
                     <View style={selectedAnswers.current.includes(item.questionAnswer) ? [styles.unSelectedBtnStyle] : [styles.selectedBtnStyle]}>
                        <TouchableOpacity disabled = {status_QID === "Submitted" ? true : false} onPress={()=>{
                            
                            if(item.questionAnswer === Constant.MSELECTION_NONE_OF_THE_ABOVE) {
                              selectedAnswers.current = [];
                              tempAnswersArray.current = [];
                              set_isOthersSpecify(false);
                              set_textAnswer('');
                              let obj = {option:item.questionAnswer,rAnswer: textAnswer,questionAnswerId:item.questionAnswerId,ansOptionMediaFileName : item.ansOptionMediaFileName};
                              selectedAnswers.current.push(item.questionAnswer);
                              tempAnswersArray.current.push(obj);
                              
                            }else if(item.questionAnswer === Constant.MSELECTION_OTHER_SPECIFY) {

                              selectedAnswers.current = [];
                              tempAnswersArray.current = [];
                              let obj = {option:item.questionAnswer,rAnswer: textAnswer,questionAnswerId:item.questionAnswerId,ansOptionMediaFileName : item.ansOptionMediaFileName};
                              selectedAnswers.current.push(item.questionAnswer);
                              tempAnswersArray.current.push(obj);
                              set_isOthersSpecify(true);

                            } else {

                              if (selectedAnswers.current.includes(item.questionAnswer)){

                                var index1 = selectedAnswers.current.findIndex(e => e === item.questionAnswer);
                                var index2 = selectedAnswers.current.findIndex(e => e === Constant.MSELECTION_NONE_OF_THE_ABOVE);
                                var index3 = selectedAnswers.current.findIndex(e => e === Constant.MSELECTION_OTHER_SPECIFY);
                                if (index1 != -1) {
                                  selectedAnswers.current.splice(index1, 1);
                                  tempAnswersArray.current.splice(index1, 1);
                                }
                                if (index2 != -1) {
                                  selectedAnswers.current.splice(index1, 1);
                                  tempAnswersArray.current.splice(index1, 1);
                                }
                                if (index3 != -1) {
                                  selectedAnswers.current.splice(index, 1);
                                  tempAnswersArray.current.splice(index, 1);
                                }
                                
                                set_isOthersSpecify(false);
                                set_textAnswer('');

                              }else {
                                  
                                var index2 = selectedAnswers.current.findIndex(e => e === Constant.MSELECTION_NONE_OF_THE_ABOVE);
                                var index3 = selectedAnswers.current.findIndex(e => e === Constant.MSELECTION_OTHER_SPECIFY);
                                if (index2 != -1) {
                                  selectedAnswers.current.splice(index2, 1);
                                  tempAnswersArray.current.splice(index2, 1);
                                }
                                if (index3 != -1) {
                                  selectedAnswers.current.splice(index3, 1);
                                  tempAnswersArray.current.splice(index3, 1);
                                }
                                  let obj = {option:item.questionAnswer,rAnswer: textAnswer,questionAnswerId:item.questionAnswerId, ansOptionMediaFileName : item.ansOptionMediaFileName};
                                  selectedAnswers.current.push(item.questionAnswer);
                                  tempAnswersArray.current.push(obj);
                                  set_isOthersSpecify(false);
                                  set_textAnswer('');
                              }

                            }

                            if(totalOptions.current === selectedAnswers.current.length) {
                              set_selectText('Unselect All');
                            } else {
                              set_selectText('Select All');
                            }

                            set_updateState(selectedAnswers.current); 
                            selectedAnswers.current = Array.from(new Set(selectedAnswers.current));
                            tempAnswersArray.current = Array.from(new Set(tempAnswersArray.current));
                            setValue(JSON.stringify(tempAnswersArray.current));

                        }} >  
                        <View style={{width:wp('80%')}}>
                          <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',}}>

                            {<View style={{flex:1,alignItems:'center',justifyContent:'center',marginLeft: "2%",}}>
                              <View style={selectedAnswers.current.includes(item.questionAnswer) ? [styles.unSelPointsViewStyle] : [styles.selPointsViewStyle]}>
                                <Text style={selectedAnswers.current.includes(item.questionAnswer) ? [styles.selPointsTextStyle] : [styles.unSelPointsTextStyle]}>{index+1}</Text> 
                              </View>
                            </View>}
                            <View style={{flex:5,}}>
                              <Text style={selectedAnswers.current.includes(item.questionAnswer) ? [styles.selectedTextColor] : [styles.unSelectedTextColor]}>{answersArray[index].questionAnswer}</Text> 
                              {item.ansOptionMediaUrl ? <View>
                          
                        </View> : null} 
                            </View>

                            {item.ansOptionMediaUrl ? <View  style={{flex:2,}}>
                          <TouchableOpacity style = {CommonStyles.optionsQuestImagesBtnStyle} onPress={() => assignImages(item.ansOptionMediaUrl)}>
                            <ImageBackground source={{uri : item.ansOptionMediaUrl}} style={[CommonStyles.questOptionImageStyles]} imageStyle = {{borderRadius:10}}
                                  onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {set_imgLoader(false)}}>
                                    {imgLoader ? <ActivityIndicator size="large" color="gray"/> : null}
                                    {!imgLoader ? <View style={[CommonStyles.optionsmediaSubViewStyle,{height:hp('1.8'),}]}>
                                      <Text style={[CommonStyles.optionMediaViewTextStyle,{}]}>{'VIEW'}</Text>
                                  </View> : null}
                                  </ImageBackground>
                          </TouchableOpacity>
                        </View> : <View  style={{flex:2,}}></View>}
 
                          </View> 

                        </View>      
                      </TouchableOpacity>

                   </View>
                   {isOthersSpecify && selectedAnswers.current.includes(item.questionAnswer) ? <View style={[styles.SectionStyle,{minHeight: hp("5%"),}]}>
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
                          setValue(JSON.stringify([{option:Constant.MSELECTION_OTHER_SPECIFY,rAnswer: text.trimStart()}]));
                           
                        }}
                        editable={status_QID === "Submitted" ? false : true}/>   
                    </View> : null}
                  </View>
                  </>
                 )
            });
          }
       };

    return(
        <View >         
          <View>

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
              {!isAnsSubmitted && status_QID === "Submitted" ? <View style = {{height: hp("4%"),justifyContent:'center',}}>
              <Text style={[CommonStyles.submitQSTNotAnsweredTextStyle]}>{Constant.QUESTIONS_NOT_ANSWERED}</Text>
            </View> : (status_QID === "Submitted" ? null : <View style={{alignSelf:'center',marginBottom:hp('1%'),marginTop:hp('1%')}}>
                <TouchableOpacity style = {styles.selectedBtnStyle} onPress={()=>{selectAllOptions()}}>
                  <Text style={[styles.unSelectedTextColor]}>{selectText}</Text>  
                </TouchableOpacity>
              </View>)}
            {!isAnsSubmitted && status_QID === 'Submitted' ? null : _renderMultiAnswers()}
          </View>

          {isImageView ? <ImageView
                images={images}
                imageIndex={0}
                visible={isImageView}
                onRequestClose={() => set_isImageView(false)}
            /> : null}

        </View>

    )
}
export default questionnaireMultiSelectionComponent;

const styles = StyleSheet.create({

    selectionContainer: {
        marginLeft:wp('2%'),
        marginRight:wp('2%'),
        marginBottom:wp('2%'),       
    },

    selectedAllStyle: {
        width:wp('40%'),
        minHeight:hp('6'),
        backgroundColor:'#D9F4BA',
        borderRadius:15,
        borderColor:'#6BC105',
        borderWidth:1,
        marginHorizontal:10,
        justifyContent:'center',
        alignItems:'center'      
    },

    selectedTextColor: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontExtraSmall,
        textAlign: "left",
        color:'#6BC105',
        marginRight:wp('2%'),
        marginBottom:hp('1%'),
        marginTop:hp('1%'),
    },

      unSelectedTextColor: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontExtraSmall,
        textAlign: "left",
        color:'#6C6C6C',
        marginRight:wp('2%'),
        marginBottom:hp('1%'),
        marginTop:hp('1%'),
      },

      unSelectedBtnStyle : {

        width:wp('80%'),
        minHeight:hp('6'),
        backgroundColor:'#D9F4BA',
        borderRadius:15,
        borderColor:'#6BC105',
        borderWidth:1,
        marginHorizontal:10,
        justifyContent:'center',
        alignItems:'center'
        
      },

      selectedBtnStyle : {
        width:wp('80%'),
        minHeight:hp('6'),
        backgroundColor:'#EDEDED',
        borderRadius:15,
        borderColor:'#B1B1B5',
        borderWidth:1,
        justifyContent:'center',
        alignItems:'center',
        marginHorizontal:10,
      },
      selPointsViewStyle : {
        width:wp('8%'),
        height:hp('3.6%'),
        alignItems:'center',
        justifyContent:'center',
        borderRadius:8,
        backgroundColor:'white',
        borderColor:'#B1B1B5',
        borderWidth:1
      },

      unSelPointsViewStyle : {
        width:wp('8%'),
        height:hp('3.6%'),
        alignItems:'center',
        justifyContent:'center',
        borderRadius:8,
        backgroundColor:'#6BC105',
        borderColor:'#36b57b',
        borderWidth:1
      },

      selPointsTextStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontTiny,
        textAlign: "center",
        color:'white',
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

      unSelPointsTextStyle: {
        // ...CommonStyles.textStyleRegular,
        // fontSize: fonts.fontExtraSmall,
        // textAlign: "center",
        // color:'#6C6C6C',
      },

});