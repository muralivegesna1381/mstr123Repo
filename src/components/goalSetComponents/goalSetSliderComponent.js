import React,{useEffect, useState} from 'react';
import {View,StyleSheet,Platform,Text} from 'react-native';
import fonts from './../../utils/commonStyles/fonts';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../utils/commonStyles/commonStyles';
 import Slider from "react-native-slider";
import SliderSmooth from "react-native-smooth-slider";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import * as Constant from './../../utils/constants/constant';

  const GoalSetSliderComponent = ({minValue,maxValue,value,breakValue,setValue,route,...props}) => {

      const [valueSlider, set_valueSlider] = useState(undefined);
      const [stepValue, set_stepValue] = useState(1);

      useEffect(() => { 
        if(breakValue){
          set_stepValue(breakValue);
        }
      },[breakValue]);

      useEffect(() => { 

        if(value){
          set_valueSlider(parseInt(value));
        }else{
          set_valueSlider(parseInt(minValue));
        }
        
      },[value]);

      const selectAction = (value) => {

        set_valueSlider(value);
        setValue(value)  
        
      }
    /**
     * Textinput UI
     * Based on Multiline, this component will be Text Area / TextInput
     */
    return(
        <View style={styles.container}>

            <View style={{width: wp('80%'), alignItems:'center'}}>

                <GestureHandlerRootView style={styles.container}>

                    {Platform.OS === 'ios' ? <SliderSmooth style = {[styles.track1]}
                        value={valueSlider}
                        disabled={false}
                        useNativeDriver={true}
                        minimumValue = {minValue}
                        maximumValue = {maxValue}
                        vertical = {false}
                        // animationType = {'spring' }
                        minimumTrackTintColor={'#64DED3'}
                        maximumTrackTintColor={'#D3D3D3'}
                        step = {stepValue}
                        trackStyle = {{height: (Platform.isPad ? hp('1.5%') : hp('1%')),borderRadius: 15, }}
                        thumbTintColor = {'black'}
                        thumbStyle = {{width: (Platform.isPad ? 30 : 20), height: (Platform.isPad ? 30 : 20),borderRadius: 100,}}
                        onSlidingComplete={value => {selectAction(value)}}
                    /> : 
                    <Slider
                        style={{ width: wp('80%'), marginLeft: Platform.OS === 'android' ? wp('3%') : wp('0%') }}
                        value={valueSlider}
                        onValueChange={value => {selectAction(value)}}
                        minimumValue = {minValue}
                        maximumValue = {maxValue}
                        step = {stepValue}
                        minimumTrackTintColor = {'#64DED3'}
                        maximumTrackTintColor = {'#D3D3D3'}
                        animateTransitions = {true}
                        animationType = {'spring'}
                        thumbTintColor ={'black'}
                        thumbStyle={styles.thumb}
                        trackStyle={styles.track}
                        disabled = {false}
                        
                    /> 
              }
            </GestureHandlerRootView>

            </View>

            <View style={{width: wp('75%'), flexDirection:'row',justifyContent:'space-between',marginTop: -30,}}>
              {<Text style={[styles.valuesTextStyle,]}>{minValue}</Text>}
              {<Text style={[styles.valuesTextStyle]}>{maxValue}</Text>}
            </View>

        </View>

    )
}
export default GoalSetSliderComponent;

const styles = StyleSheet.create({

    container: {
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
        backgroundColor: 'black',
        borderRadius:100
    },

    track1:{
      height:10,
      width : wp('75%'),
    },

    track:{
      height:8,
      width : 300,
      borderRadius: 15,
      
    },

    valuesTextStyle: {
      ...CommonStyles.textStyleBold,
      fontSize: fonts.fontSmall,
      textAlign: "left",
      color:'#000000',
    },

});