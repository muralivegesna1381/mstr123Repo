import React,{useEffect, useState} from 'react';
import {View,StyleSheet,Text,ImageBackground,ActivityIndicator,TouchableOpacity} from 'react-native';
import fonts from '../../../../utils/commonStyles/fonts';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from '../../../../utils/commonStyles/commonStyles';
import VerticalSlider from 'rn-vertical-slider';
import Slider from "react-native-smooth-slider";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import * as Constant from './../../../../utils/constants/constant';
import ImageView from "react-native-image-viewing";
// import { Slider } from '@sharcoux/slider'
   
  const QstVerticalSliderComponent = ({minValue,maxValue,value,breakValue,status_QID,desc,setValue,isContinuousScale,questionImageUrl,setScroll,floorDescription,ceilDescription,isAnsSubmitted,route,...props}) => {

    const [valueSlider, set_valueSlider] = useState(undefined);
    const [stepValue, set_stepValue] = useState(1);
    const [imgLoader, set_imgLoader] = useState(true);
    const [isSliding, setIsSliding] = useState(false);
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

      // useEffect(() => { 

      //   if(status_QID !== 'Submitted') {
      //     // setValue(valueSlider);
      //   }
        
      // },[valueSlider]);

      useEffect(() => { 
        if(value){
          set_valueSlider(parseInt(value));
        }else{
          set_valueSlider(parseInt(minValue));
        }       
      },[value]);

      const selectAction = (actionType) => {

        if(actionType === 'SUBMIT') {
          setValue(valueSlider); 
          set_valueSlider(parseInt(value));         
        } else {
          set_valueSlider(parseInt(0));
          setValue(parseInt(0));
        }
        
      }
 
    return(

        <View style={styles.container}>

          {questionImageUrl ? <View style={{marginBottom: hp('6%')}}>
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

          {/* <ScrollView> */}

          {!isAnsSubmitted && status_QID === 'Submitted' ? <View style = {{height: hp("4%"),justifyContent:'center',}}>
              <Text style={[CommonStyles.submitQSTNotAnsweredTextStyle]}>{Constant.QUESTIONS_NOT_ANSWERED}</Text>
            </View> : <View>

            <View style={{width: wp('80%'),marginTop: questionImageUrl ? hp('0%') : hp('4%'), height: hp('35%'),flexDirection:'row'}}>

              <View style = {{flex:1,alignItems:'flex-start',}}>
                  {ceilDescription && ceilDescription !== '' ? <View style = {{flex:1.2,alignItems:'flex-start',}}>
                    <Text style={[styles.descTextStyle, {color:'green',width: wp("35%")}]}>{ceilDescription}</Text>
                  </View> : <View style = {{flex:1.2,  alignItems:'flex-start',}}>
                  </View>}

                  {floorDescription && floorDescription !== '' ? <View style = {{flex:1.2,alignItems:'flex-start',bottom:0,position:'absolute'}}>
                    <Text style={[styles.descTextStyle,{color:'red',}]}>{floorDescription}</Text>
                  </View> : null}
                  
                </View>

              <GestureHandlerRootView style={[styles.container,{}]}>

                <View>
                  <Slider style = {styles.track}
                    value={valueSlider}
                    disabled={status_QID === 'Submitted' ? true : false}
                    useNativeDriver={true}
                    setScroll={isSliding}
                    minimumValue = {minValue}
                    maximumValue = {maxValue}
                    vertical = {true}
                    minimumTrackTintColor={'gray'}
                    maximumTrackTintColor={'#D3D3D3'}
                    step = {stepValue}
                    trackStyle = {{height: hp('2%'),borderRadius: 15, }}
                    thumbTintColor = {'#6BC105'}
                    thumbStyle = {{width: 25, height: 25,borderRadius: 100,}}
                    // thumbTouchSize = {{width: 100, height: 100}}
                    // onSlidingComplete={value => {set_valueSlider(value);setValue(value)}}
                    onSlidingStart={value => { setIsSliding(true); setScroll(true) }}
                    onSlidingComplete={value => { set_valueSlider(value); setValue(value); setScroll(false); setIsSliding(false) }}

                  /> 
                </View>
                {/* : 
                <VerticalSlider
                  value={valueSlider}
                  disabled={status_QID === 'Submitted' ? true : false}
                  min={minValue}
                  max={maxValue}
                  onChange={value => {
                    set_valueSlider(value);setValue(value)
                  }}
                  width={20}
                  height={200}
                  step={stepValue}
                  borderRadius={5}
                  showBallIndicator={true}
                  minimumTrackTintColor={'gray'}
                  maximumTrackTintColor={'#D3D3D3'}
                  ballIndicatorColor={'#6BC105'}
                  ballIndicatorTextColor={'#6BC105'}
                  ballIndicatorWidth={40}
                  ballIndicatorHeight={20}
                  ballIndicatorPosition = {-45}
              /> */}

              </GestureHandlerRootView>

                <View style = {{flex:1,alignItems:'flex-end',}}>
                  <View style = {{flex:1,alignItems:'flex-end',}}>             
                    {!isContinuousScale ? <Text style={styles.valuesTextStyle}>{maxValue}</Text> : null}
                  </View> 
                  <View style = {{flex:1.2,alignItems:'flex-start',justifyContent:'flex-start',bottom:0,position:'absolute'}}>           
                    {!isContinuousScale ? <Text style={styles.valuesTextStyle}>{minValue}</Text> : null}
                  </View> 
                </View>
              </View>

          {/* </ScrollView> */}

          <View style={{width: wp('80%'),justifyContent:'flex-start', alignItems:'center'}}>
          {!isContinuousScale && value ? <Text style={[styles.IndexName,{flex:1,marginTop: hp('4%')}]}>{"Selected : "+value}</Text> : null}
            <View style = {{alignItems:'center',marginBottom: hp('2%'),marginTop: !isContinuousScale && value ? hp('2%') : hp('5%')}}>
            {desc ?<Text style={styles.descTextStyle}>{desc}</Text> : null}
            </View> 
          </View>

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
export default QstVerticalSliderComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    thumb: {
      width: 30,
      height: 30,
      backgroundColor: '#6BC105',
      borderRadius:100
    },

    track:{
      height:10,
      width : 250,
      marginBottom: 40,
    },

    gestureStyle:{
      height:250,
      width : 50,
      backgroundColor: '#6BC105',      
    },

    IndexName: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontMedium,
      color:'#000000',
      width:wp('80%'),
      textAlign:'center',
    },

    valuesTextStyle: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontMedium,
      textAlign: "left",
      color:'#000000',
    },

    descTextStyle: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontXSmall,
      textAlign: "left",
      color:'black',
    },

});