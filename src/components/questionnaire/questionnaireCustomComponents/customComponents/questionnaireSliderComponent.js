import React,{useEffect, useState} from 'react';
import {View,StyleSheet,Text,ImageBackground,ActivityIndicator,TouchableOpacity, Platform} from 'react-native';
import fonts from './../../../../utils/commonStyles/fonts';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../../../utils/commonStyles/commonStyles';
 import Slider from "react-native-slider";
import SliderSmooth from "react-native-smooth-slider";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import * as Constant from './../../../../utils/constants/constant';
import ImageView from "react-native-image-viewing";

    const questionnaireSliderComponent = ({minValue,maxValue,value,breakValue,status_QID,desc,setValue,isContinuousScale,questionImageUrl,floorDescription,ceilDescription,isAnsSubmitted,route,...props}) => {

      const [valueSlider, set_valueSlider] = useState(undefined);
      const [stepValue, set_stepValue] = useState(1);
      const [imgLoader, set_imgLoader] = useState(true);
      const [isImageView, set_isImageView] = useState(false);
      const [images, set_images] = useState([]);

      useEffect(() => { 
        if(breakValue){
          set_stepValue(breakValue);
        }
      },[breakValue]);

      useEffect(() => {     

        if(questionImageUrl && questionImageUrl !== ''){
          let img = {uri : questionImageUrl};
          set_images([img]);
      }
        
      },[questionImageUrl]);

      useEffect(() => { 

        if(value){
          set_valueSlider(parseInt(value));
        }else{
          set_valueSlider(parseInt(minValue));
        }
        
      },[]);

      const selectAction = (value) => {

        set_valueSlider(value);
        setValue(value)  

        // if(actionType === 'SUBMIT') {
        //   set_valueSlider(value);
        //   setValue(value)         
        // } else {
        //   set_valueSlider(parseInt(minValue));
        //   setValue("");
        // }
        
      }
    /**
     * Textinput UI
     * Based on Multiline, this component will be Text Area / TextInput
     */
    return(
        <View style={styles.container}>

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

              {!isAnsSubmitted && status_QID === 'Submitted' ? <View style = {{height: hp("4%"),justifyContent:'center',}}>
              <Text style={[CommonStyles.submitQSTNotAnsweredTextStyle]}>{Constant.QUESTIONS_NOT_ANSWERED}</Text>
            </View> : 
            <View>

            {isContinuousScale === false ? <View style={{width: wp('80%'), flexDirection:'row',justifyContent:'space-between'}}>
              {<Text style={[styles.valuesTextStyle,]}>{minValue}</Text>}
              {<Text style={[styles.valuesTextStyle]}>{maxValue}</Text>}
            </View> : null}

            <View style={{width: wp('80%'), alignItems:'center'}}>

            <GestureHandlerRootView style={styles.container}>

              {Platform.OS === 'ios' ? <SliderSmooth style = {styles.track1}
                    value={valueSlider}
                    disabled={status_QID === 'Submitted' ? true : false}
                    useNativeDriver={true}
                    minimumValue = {minValue}
                    maximumValue = {maxValue}
                    vertical = {false}
                    // animationType = {'spring' }
                    minimumTrackTintColor={'gray'}
                    maximumTrackTintColor={'#D3D3D3'}
                    step = {stepValue}
                    trackStyle = {{height: hp('2%'),borderRadius: 15, }}
                    thumbTintColor = {'#6BC105'}
                    thumbStyle = {{width: 25, height: 25,borderRadius: 100,}}
                    onSlidingComplete={value => {selectAction(value)}}
              /> : 
               <Slider
                  style={{width: wp('70%')}}
                  value={valueSlider}
                  onValueChange={value => {selectAction(value)}}
                  minimumValue = {minValue}
                  maximumValue = {maxValue}
                  step = {stepValue}
                  minimumTrackTintColor = {'grey'}
                  maximumTrackTintColor = {'#D3D3D3'}
                  animateTransitions = {true}
                  animationType = {'spring'}
                  thumbTintColor ={'#37B57C'}
                  thumbStyle={styles.thumb}
                  trackStyle={styles.track}
                  disabled = {status_QID === 'Submitted' ? true : false}
                  
              /> 
              }
            </GestureHandlerRootView>

            </View>

            <View style={{width: wp('80%'),flexDirection:'row',justifyContent:'space-between', alignItems:'center',marginBottom: hp('1%'),}}>
              {floorDescription && floorDescription !== '' ? <View style = {{flex:1,alignItems:'flex-start'}}>
                <Text style={[styles.descTextStyle,{color:'red'}]}>{floorDescription}</Text>
              </View> : null}
              {isContinuousScale === false && value ? <Text style={[styles.IndexName,{flex:1,}]}>{"Selected : "+value}</Text> : null}
              {ceilDescription && ceilDescription !== '' ? <View style = {{flex:1,alignItems:'flex-end'}}>
                <Text style={[styles.descTextStyle,{color:'green'}]}>{ceilDescription}</Text>
              </View> : null}
          
            </View>
            
            <View style = {{alignItems:'center'}}>
                {<Text style={[styles.descTextStyle,{marginBottom: hp('1%'),}]}>{desc}</Text>}
            </View> 

            {/* {status_QID === 'Submitted' ? null : <View style={{flexDirection:'row', justifyContent:'flex-end',width: wp('75%'),marginTop: hp('2%')}}>
              <TouchableOpacity style={CommonStyles.tilesBtnLftStyle} onPress={() => selectAction('REVERT')}>
                  <ImageBackground source={require("./../../../../../assets/images/otherImages/png/wrong.png")} style={CommonStyles.tilesBtnImgStyle} resizeMode='contain'></ImageBackground>
              </TouchableOpacity>

              <TouchableOpacity style={CommonStyles.tilesBtnStyle} onPress={() => selectAction('SUBMIT')}>
                  <ImageBackground source={require("./../../../../../assets/images/otherImages/png/right.png")} style={CommonStyles.tilesBtnImgStyle} resizeMode='contain'></ImageBackground>
              </TouchableOpacity>

              </View>} */}
              
              </View>}

              {isImageView ? <ImageView
                images={images}
                imageIndex={0}
                visible={isImageView}
                onRequestClose={() => set_isImageView(false)}
            /> : null}

        </View>

    )
}
export default questionnaireSliderComponent;

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        alignItems: "center",
        justifyContent: "center",
        width:wp('80%'),
        minHeight:hp('10%'),
        marginBottom: hp('1%'),
    },

    thumb: {
        width: 25,
        height: 25,
        backgroundColor: '#6BC105',
        borderRadius:100
    },

    track1:{
      height:10,
      width : 300,
    },

    track:{
      height:15,
      width : 260,
      borderRadius: 15
    },

    IndexName: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontMedium,
      color:'#000000',
      width:wp('80%'),
      textAlign:'center',
      // marginBottom: wp('2%'),
    },

    valuesTextStyle: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontNormal,
      textAlign: "left",
      color:'#000000',
    },

    descTextStyle: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontXSmall,
      color:'black',
    },


});