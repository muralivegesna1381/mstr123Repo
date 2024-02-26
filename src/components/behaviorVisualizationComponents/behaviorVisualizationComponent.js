import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,BackHandler,ScrollView,Platform,ImageBackground,Image} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../../utils/commonStyles/fonts.js'
import CommonStyles from '../../utils/commonStyles/commonStyles.js';
import HeaderComponent from '../../utils/commonComponents/headerComponent.js';
import DeviceInfo from 'react-native-device-info';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';

const POP_SUCCESS = 1;
let fmUpImg  = require("../../../assets/images/dashBoardImages/svg/fmUpImg.svg");
let fmDownImg  = require("../../../assets/images/dashBoardImages/svg/fmDownImg.svg");
let trace_bv_Screen;

const BehaviorVisualizationComponent = ({navigation,route, ...props }) => {
   
    const [petObj, set_petObj] = useState(undefined);
    const [behData, set_behData] = useState(undefined);
    const [lastWeekFMAvgText, set_lastWeekFMAvgText] = useState(undefined);
    const [previousFMText, set_previousFMText] = useState(undefined);
    const [previousFMPer, set_previousFMPer] = useState(undefined);
    const [isUpArrow, set_isUpArrow] = useState(false);
    const [tFMsofar, set_tFMsofar] = useState(undefined);
    const [isTFUpArrow, set_isTFUpArrow] = useState(false);
    const [todayFMPer, set_todayFMPer] = useState(undefined);
    const [comparetxt, set_comparetxt] = useState(undefined);
    const [type, set_type] = useState(undefined);
    const [perText1, set_perText1] = useState(0)
    const [perText2, set_perText2] = useState(0)

    //setting firebase helper
    useEffect(() => {
        
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_behavior_Visualization);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_behavior_Visualization, "User in Behaviour Visualization Screen", '');
         return () => {
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };

    } , []);

    // setting the feedback item to view
    useEffect(() => {
        set_petObj(route.params?.petObject);
        if(route.params?.behData) {
            set_behData(route.params?.behData);
            prepareBehData(route.params?.behData,route.params?.value);
        }

        set_type(route.params?.value);
    }, [route.params?.petObject, route.params?.behData,route.params?.value]);

    const initialSessionStart = async () => {
        trace_bv_Screen = await perf().startTrace('t_inbVisualizationScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_bv_Screen.stop();
    };

    const prepareBehData = (behData,type) => {

        if(behData) {

            if (type === 1) {

                set_lastWeekFMAvgText(behData.forwardMotionInfo.lastWeekFMAvgText);
                set_previousFMText(behData.forwardMotionInfo.previousDayFMText);
                set_tFMsofar(behData.forwardMotionInfo.todayForwardMotionSofarText)
                if (behData.forwardMotionInfo.prevDayFMVsLastWeekFMAvgPercentage) {

                    let temp = 100 - behData.forwardMotionInfo.prevDayFMVsLastWeekFMAvgPercentage;
                    set_perText1(Math.abs(temp))
                    if (temp > 0) {
                        set_isUpArrow(false);
                    } else {
                        set_isUpArrow(true);
                    }

                    set_previousFMPer(Math.abs(temp) > 100 ? 100 : Math.abs(temp));
                }

                if (behData.forwardMotionInfo.todayFMSofarVsLastWeekFMAvgPercentage) {

                    let temp = 100 - behData.forwardMotionInfo.todayFMSofarVsLastWeekFMAvgPercentage;
                    set_perText2(Math.abs(temp))
                    if (temp > 0) {
                        set_isTFUpArrow(false);
                    } else {
                        set_isTFUpArrow(true);
                    }

                    set_todayFMPer(Math.abs(temp) > 100 ? 100 : Math.abs(temp));
                }

                if (behData.forwardMotionInfo.todayFMSofarVsPrevDayFMAtThisTime) {

                    if (behData.forwardMotionInfo.todayFMSofarVsPrevDayFMAtThisTime > 0) {
                        set_comparetxt('More');
                    } else if (behData.forwardMotionInfo.todayFMSofarVsPrevDayFMAtThisTime < 0) {
                        set_comparetxt('Less');
                    }else {
                        set_comparetxt('Same');
                    }

                }

            } else {

                set_lastWeekFMAvgText(behData.sleepInfo.lastWeekTotalSleepAverageText);
                set_previousFMText(behData.sleepInfo.previousDayTotalSleepText);
                set_tFMsofar(behData.sleepInfo.todayTotalSleepSofarText)
                if (behData.sleepInfo.prevDayTSVsLastWeekTSAvgPercentage) {

                    let temp = 100 - behData.sleepInfo.prevDayTSVsLastWeekTSAvgPercentage;
                    set_perText1(Math.abs(temp))
                    if (temp > 0) {
                        set_isUpArrow(false);
                    } else {
                        set_isUpArrow(true);
                    }

                    set_previousFMPer(Math.abs(temp) > 100 ? 100 : Math.abs(temp));
                }

                if (behData.sleepInfo.todayTSSofarVsLastWeekTSAvgPercentage) {

                    let temp = 100 - behData.sleepInfo.todayTSSofarVsLastWeekTSAvgPercentage;
                    set_perText2(Math.abs(temp))
                    if (temp > 0) {
                        set_isTFUpArrow(false);
                    } else {
                        set_isTFUpArrow(true);
                    }

                    set_todayFMPer(Math.abs(temp) > 100 ? 100 : Math.abs(temp));
                }

                if (behData.sleepInfo.todayTSSofarVsPrevDayTSAtThisTime) {

                    if (behData.sleepInfo.todayTSSofarVsPrevDayTSAtThisTime > 0) {
                        set_comparetxt('More');
                    } else if (behData.sleepInfo.todayTSSofarVsPrevDayTSAtThisTime < 0) {
                        set_comparetxt('Less');
                    }else {
                        set_comparetxt('Same');
                    }

                }
            }
            
        }
        
    }

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    // Naigates to previous screen
    const backBtnAction = () => {
        navigation.pop();
    };

    // Caliculates the batter percentage for each Device
    const calculateBatteryPercentage = (item) => {
        let batteryLevel = item ? item.replace("%", "") : item;
        let _batteryflex = 0;
        if(parseInt(batteryLevel) > 50) {
            _batteryflex = parseInt(batteryLevel) - 15+"%";
        } else {
            _batteryflex = parseInt(batteryLevel)+"%";
        }
        
        return _batteryflex;
    };

    return (
        <View style={[styles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={type === 1 ? 'Daily Behavior' : 'Sleep Behavior'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.middleViewStyle}>

                <View style={{marginTop:wp('3%')}}>

                    <View style={{width:wp('90%')}}>
                        <Text style={[styles.sliderTextStyle,]}>{type && type === 1 ? (petObj ? petObj.petName : '') + ' average daily forward motion last week was ' : (petObj ? petObj.petName : '' )+ ' average daily sleep last week was'} <Text style={[styles.sliderTextStyle,]}>{lastWeekFMAvgText ? lastWeekFMAvgText+'.' : ''}</Text></Text>
                        
                    </View>

                    <View style ={[styles.tylebckViewStyle,{...CommonStyles.shadowStyle,marginTop:wp('5%')}]}>

                        <View style={{marginTop:hp('2%'),justifyContent:'center',marginLeft:wp('2%')}}>
                            <Text style={[styles.sliderHTextStyle,]}>{type && type === 1 ? 'Total forward motion yesterday was' : 'Total sleep yesterday was'}</Text>

                            <View style={{flexDirection:'row',marginTop:hp('0.5%')}}>
                                <Text style={[styles.sliderSubHTextStyle,]}>{previousFMText ? previousFMText+ " " + (' ('+perText1 + '%') : ''}</Text>
                                {perText1 === 0 ? null : <Image source={isUpArrow ? fmUpImg : fmDownImg} style={Platform.isPad ? [styles.upDownImgStyle,{width:wp('2%'),tintColor:isUpArrow ? '#6BC100' : '#FF9203'}] : [styles.upDownImgStyle]}/>}
                                <Text style={[styles.sliderSubHTextStyle,]}>{')'}</Text>
                            </View>

                            <View style={{marginTop:hp('1%'),width: wp("85%"),height: hp("3%"),backgroundColor: "#F7F7F7", justifyContent: "center", borderRadius: 5,}}>
                                <View style={{backgroundColor: isUpArrow ? "#0EF039" : "#F0650E",height: hp("3%"),borderRadius: 5,width: wp(""+calculateBatteryPercentage(previousFMPer ? ''+previousFMPer :"0")),margin: DeviceInfo.isTablet() ? 5 : 3,marginRight: 8,}}/>
                            </View>
                        </View>

                        <View style={{marginTop:hp('2%'),marginLeft:wp('2%')}}>
                            <Text style={[styles.sliderHTextStyle,]}>{type && type === 1 ? 'Total forward motion so far today is' : 'Total sleep so far today is'}</Text>

                            <View style={{flexDirection:'row',marginTop:hp('0.5%')}}>
                                <Text style={[styles.sliderSubHTextStyle,]}>{tFMsofar ? tFMsofar+ " " + (' ('+perText2 + '%') : ''}</Text>
                                {perText2 === 0 ? null : <Image source={isTFUpArrow ? fmUpImg : fmDownImg} style={Platform.isPad ? [styles.upDownImgStyle,{width:wp('2%'),tintColor:isTFUpArrow ? '#6BC100' : '#FF9203'}] : [styles.upDownImgStyle]}/>}
                                <Text style={[styles.sliderSubHTextStyle,]}>{')'}</Text>
                            </View>

                            <View style={{marginTop:hp('1%'),width: wp("85%"),height: hp("3%"),backgroundColor: "#F7F7F7", justifyContent: "center", borderRadius: 5,}}>
                                <View style={{backgroundColor: isTFUpArrow ? "#0EF039" : "#F0650E",height: hp("3%"),borderRadius: 5,width: wp(""+calculateBatteryPercentage(todayFMPer ? ''+todayFMPer :'0')),margin: DeviceInfo.isTablet() ? 5 : 3,marginRight: 8,}}/>
                            </View>
                        </View>

                        <View style={{marginTop:hp('2%'),marginRight:wp('4%'),marginLeft:wp('2%')}}>
                            <Text style={[styles.sliderHTextStyle,{color:'black'}]}>{type && type === 1 ? 'Total forward motion so far today is ' + comparetxt +' compared to forward motion at this time yesterday' : 'Total sleep so far today is ' + comparetxt +' compared to sleep at this time yesterday'}</Text>
                        </View>

                    </View>

                    <View>

                    </View>

                </View>

            </View>
            
        </View>
    );
  }
  
  export default BehaviorVisualizationComponent;

  const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'           
    },

    middleViewStyle : {
        alignItems:'center',
        marginTop: hp("5%"),
        height:hp('60%'),
    }, 

    labelTextStyles : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXSmall,
        color:'black',
        alignSelf:'center',
    },

    goalTextStyles : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXXXXLarge,
        color:'black',
    },

    headerTextStyle : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontLarge,
        color:'black',
        marginTop:hp('1%'),
        marginBottom:hp('1%'),
        marginLeft:hp('2%'),
        marginRight:hp('2%'),
        textAlign:"left"
    },

    tyleViewStyle : {
        height:hp('11%'), 
        width:wp('42%'), 
        borderWidth:1,
        borderRadius:10,
        flexDirection:'row',
    },

    sliderTextStyle : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
        color: 'black', 
    },

    sliderHTextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: '#97A1B1', 
    },

    sliderSubHTextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleMedium,
        color: 'black', 
    },

    tylebckViewStyle : {
        height:hp('30%'), 
        width:wp('90%'), 
        alignSelf:'center',
        // flexDirection:'row', 
        marginBottom:hp('1%'),
        marginTop:hp('0.5%'),
        backgroundColor:'white'
    },

    upDownImgStyle : {
        width:wp('4%'),
        height:hp('1.5%'),
        resizeMode:'contain',
        marginTop:hp('0.5%'),
        // backgroundColor:'red'
    },

  });