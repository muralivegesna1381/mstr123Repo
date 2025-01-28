import React, { useState, useEffect, useRef } from 'react';
import {View,TouchableOpacity,Text,Platform,ImageBackground,Dimensions} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as Constant from "../../../utils/constants/constant";
import DashBoardStyles from './../dashBoardStyles';
import { PieChart } from 'react-native-svg-charts'
// import { LineChart, Grid } from 'react-native-svg-charts'
import { ProgressCircle }  from 'react-native-svg-charts'
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import {LineChart,} from "react-native-chart-kit";
import Toast from 'react-native-simple-toast';
import moment from 'moment/moment';

import RightArrowBtnImg from "./../../../../assets/images/dashBoardImages/svg/right-arrow.svg";
import FMUpImg from "./../../../../assets/images/dashBoardImages/svg/fmUpImg.svg";
import FMDownImg from "./../../../../assets/images/dashBoardImages/svg/fmDownImg.svg";
import HomeFoodImg from "./../../../../assets/images/dashBoardImages/svg/home-food.svg";
import DashTimerImg from "../../../../assets/images/dashBoardImages/svg/dashTimerIcon.svg";
import DashQuickVideoImg from "../../../../assets/images/dashBoardImages/svg/dashQuickVideo.svg";
import DashChatImg from "../../../../assets/images/dashBoardImages/svg/chatIcon.svg";
import DashChatQSettingsImg from "../../../../assets/images/dashBoardImages/svg/chatQuickIcon.svg";
        
const  DashboardActivityUI = ({behVisualData,weightHistoryData1,isModularityService,setGoelAction,setQuickSetupAction,goalVisualizationAction,obsVideoUploadStatus,obsImgUploadStatus,questUploadStatus,navFRecommand,foodHistoryObj,petPermissionsData,dashboardPetsData,route, ...props }) => {

    const [runningValue, set_runningValue] = useState('');
    const [walkingValue, set_walkingValue] = useState('');
    const [daySleepValue, set_daySleepValue] = useState('');
    const [nightSleepValue, set_nightSleepValue] = useState('');
    const [weightHistoryData, set_weightHistoryData] = useState(undefined);
    const [weightHistoryUnits, set_weightHistoryUnits] = useState('lbs');
    const [isSleepData, set_isSleepData] = useState(false);
    const [isWalkData, set_isWalkData] = useState(false);
    const [isWeightData, set_isWeightData] = useState(undefined);
    const [fmLastWeekAvg, set_fmLastWeekAvg] = useState(0);
    const [sleepLastWeekAvg, set_sleepLastWeekAvg] = useState(0);
    const[goalSetValue, set_goalSetValue] = useState(0);
    const[actualGoalSetValue, set_actualGoalSetValue] = useState(0);
    const[colorValue1, set_colorValue1] = useState();
    const[colorValue2, set_colorValue2] = useState();
    const[goalSetText, set_goalSetText] = useState('');
    const[goalSetAchievedText, set_goalSetAchievedText] = useState('');
    const[goalSetAchievedValue, set_goalSetAchievedValue] = useState(0);
    const[fmPercentage, set_fmPercentage] = useState(0);
    const[isFMAVGIncrease, set_isFMAVGIncrease] = useState(0);
    const[isSleepAVGIncrease, set_isSleepAVGIncrease] = useState(0);
    const [tabItemWeight, set_tabItemWeight] = useState(0);
    const flatDBRef = useRef(null);
    const weightHistoryUnitsRef = useRef('lbs')
   
    const [dailyFMdata, set_dailyFMData] = useState([
        {
            key: `pie-${0}`,
            value: 20,
            svg: { fill: '#E3E3E3' },
        },
        {
            key: `pie-${1}`,
            value: 30,
            svg: { fill: '#E3E3E3' },
        } 
    ]);

    const [sleepData, set_sleepData] = useState([
        {
            key: `pie-${0}`,
            value: 30,
            svg: { fill: '#E3E3E3' },
        },
        {
            key: `pie-${1}`,
            value: 20,
            svg: { fill: '#E3E3E3' },
        } 
    ]);

    const dataNew = {
        labels: [], // optional
        data: [0.8]
    };

    const [weightData1, set_weightData1] = useState([10,20,40,20,60,10,80]);
    const [idealWeightData, set_idealWeightData] = useState([40,30,40,30,35,20,40]);
    const [weightLabels, set_weightLabels] = useState(["Oct11", "Oct12", "Oct13", "Oct14", "Oct15", "Oct16", "Oct17"]);

    // Setting the values from login COmponent to local variables
    useEffect(() => {

        if(behVisualData){
            prepareFMData(behVisualData);
        }
    }, [behVisualData]);

    useEffect(() => {

        if(weightHistoryData1){
            set_weightHistoryData(weightHistoryData1);
            prepareHistoryData(weightHistoryData1);
        }

    }, [weightHistoryData1,petPermissionsData]);

    const Gradient1 = () => (
      <Defs key={'grad1'}>
      <LinearGradient id={'grad1'} x1={'0'} y={'0'} x2={'0'} y2={'0'}>
        <Stop offset={'0%'} stopColor={'#6BC100'} />
        <Stop offset={'100%'} stopColor={'#6BC100'} />
        </LinearGradient>
      </Defs>
    );

    const Gradient2 = () => (
        <Defs key={'grad2'}>
        <LinearGradient id={'grad2'} x1={'0'} y1={'0'} x2={'100'} y2={'0'}>
        <Stop offset={'0%'} stopColor={'#FF9203'} />
          <Stop offset={'100%'} stopColor={'#FF9203'} />
        </LinearGradient>
      </Defs>
    );
    
    const chartConfig = {
      backgroundGradientFrom: "transparent",
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: "transparent",
      backgroundGradientToOpacity: 0,
      color: (opacity = 1) => `#6BC100`,
      backgroundColor:'red',
      strokeWidth: 3, // optional, default 3
      barPercentage: 1,
      useShadowColorFromDataset: false // optional
  };

    const convertMinsToTime = (d) => {
      d = Number(d);
      var h = Math.floor(d / 3600);
      var m = Math.floor(d % 3600 / 60);
      var s = Math.floor(d % 3600 % 60);

      var hDisplay = h > 0 ? h + (h == 1 ? "h " : "h ") : "";
      var mDisplay = m > 0 ? m + (m == 1 ? "m " : "m ") : "";
      var sDisplay = s > 0 ? s + (s == 1 ? "s" : "s") : "";
      return hDisplay + mDisplay + sDisplay; 
  };

  const convertMinsToTime1 = (d) => {
      d = Number(d);
      var h = Math.floor(d / 3600);
      var m = Math.floor(d % 3600 / 60);
      var s = Math.floor(d % 3600 % 60);

      var hDisplay = h > 0 ? h + (h == 1 ? " hr " : " hrs ") : "";
      var mDisplay = m > 0 ? m + (m == 1 ? " min " : " mins ") : "";
      var sDisplay = s > 0 ? s + (s == 1 ? " sec" : " secs") : "";
      return hDisplay + mDisplay + sDisplay; 
  };

  const prepareFMData = (fmData) => {

        if(fmData.forwardMotionInfo) {

            let avg = ''
            if(fmData.forwardMotionInfo.todayFMSofarVsLastWeekFMAvgPercentage > -1 ) {
                avg = 100 - fmData.forwardMotionInfo.todayFMSofarVsLastWeekFMAvgPercentage;
                if (avg > 0) {
                    set_isFMAVGIncrease(false);
                } else {
                    set_isFMAVGIncrease(true);
                }
            }
            
            if(parseInt(fmData.forwardMotionInfo.walking) === 0 && parseInt(fmData.forwardMotionInfo.running) === 0){
                set_isWalkData(false);
            } else {
                set_isWalkData(true);
            }

            let tempObj = [
                {
                    key: `pie-${0}`,
                    value: fmData.forwardMotionInfo.walking,
                    svg: { fill: 'url(#grad1)'},
                },
                {
                    key: `pie-${1}`,
                    value: fmData.forwardMotionInfo.running,
                    svg: { fill: 'url(#grad2)'},
                }
            ];
            set_walkingValue(fmData.forwardMotionInfo.walking);
            set_runningValue(fmData.forwardMotionInfo.running);
            set_dailyFMData(tempObj);
            if(avg === 0) {
                set_fmLastWeekAvg(100);
            } else {
                set_fmLastWeekAvg(avg);
            }

            // set_fmLastWeekAvg(avg);
            

        } else {
            set_isWalkData(false);
        }

        if(fmData.sleepInfo){

            let avg = ''
            if(fmData.sleepInfo.todayTSSofarVsLastWeekTSAvgPercentage > -1) {
                avg = 100 - fmData.sleepInfo.todayTSSofarVsLastWeekTSAvgPercentage;
                if (avg > 0) {
                    set_isSleepAVGIncrease(false);
                } else {
                    set_isSleepAVGIncrease(true);
                }
            }

            if(parseInt(fmData.sleepInfo.daySleep) === 0 && parseInt(fmData.sleepInfo.nightSleep) === 0){
                set_isSleepData(false);
            } else {               
                set_isSleepData(true);
            }

            let tempObj = [{
                key: `pie-${0}`,
                value: fmData.sleepInfo.nightSleep,
                svg: { fill: 'url(#grad1)'},
            },
            {
                key: `pie-${1}`,
                value: fmData.sleepInfo.daySleep,
                svg: { fill: 'url(#grad2)'},
            }];
       
            set_sleepData(tempObj);
            set_nightSleepValue(fmData.sleepInfo.nightSleep);
            set_daySleepValue(fmData.sleepInfo.daySleep);
            if(avg === 0) {
                set_sleepLastWeekAvg(100);
            } else {
                set_sleepLastWeekAvg(avg);
            }
            // set_sleepLastWeekAvg(avg);
            
        } else {
            set_isSleepData(false);
        }

        if(fmData.fmGoalSetting){

            set_actualGoalSetValue(fmData.fmGoalSetting.forwardMotionGoalSetting);
            set_goalSetAchievedValue(fmData.fmGoalSetting.todayForwardMotionSofar)
            set_goalSetText(fmData.fmGoalSetting.forwardMotionGoalSetText);
            set_goalSetAchievedText(fmData.fmGoalSetting.todayFMSofarText);

            let tempValue = fmData.fmGoalSetting.todayForwardMotionSofar ? parseInt(fmData.fmGoalSetting.todayForwardMotionSofar) : 0;
            let tempValue1 = fmData.fmGoalSetting.forwardMotionGoalSetting ? parseInt(fmData.fmGoalSetting.forwardMotionGoalSetting) : 0;

            let percent = 0
            if(tempValue !== 0 && tempValue1 !== 0 ) {
                percent = (tempValue/tempValue1)*100
            }

            set_fmPercentage(parseInt(percent))
            if(fmData.fmGoalSetting.todayForwardMotionSofar === 0) {
                set_colorValue1('#E3E3E3');
                set_colorValue2('#E3E3E3');
            } else {

                if(fmData.fmGoalSetting.todayForwardMotionSofar > fmData.fmGoalSetting.forwardMotionGoalSetting) {

                    let value = fmData.fmGoalSetting.todayForwardMotionSofar / fmData.fmGoalSetting.forwardMotionGoalSetting;

                    if(fmData.fmGoalSetting.todayForwardMotionVsGoalSettingPercentage > 200) {
                        set_goalSetValue(value);
                    } else {
                        set_goalSetValue(value - Math.floor(value));
                    }
                    
                    set_colorValue1('#25750D');
                    set_colorValue2('#6BC100');

                } else {

                    let value = fmData.fmGoalSetting.todayForwardMotionSofar / fmData.fmGoalSetting.forwardMotionGoalSetting;
                    set_goalSetValue(value);
                    set_colorValue1('#6BC100');
                    set_colorValue2('#E3E3E3');
                }
            }

        } 

    };

    const prepareHistoryData = (wHData) => {
        
        if(wHData.weightChartList && wHData.weightChartList.length > 0) {

            let wData = [];
            let labels = [];
            let idlWht = [];
            let value = null;
            set_isWeightData(true);

            for (let i = 0; i < wHData.weightChartList.length; i++) {

                if(weightHistoryUnitsRef.current === 'Kgs') {

                    if(wHData.weightChartList[i].weightInKgs) {

                        wData.push(wHData.weightChartList[i].weightInKgs);
                        if(wHData.weightChartList[i].date) {
                            let dte = moment(wHData.weightChartList[i].date).format("DD-MMM")
                            labels.push(dte);
                        }
                            
                    } else {
                        if(wHData.weightChartList[i].date) {
                            let dte = moment(wHData.weightChartList[i].date).format("DD-MMM")
                            labels.push(dte);
                        }
                        wData.push(0);
                    }
                        
                    if(wHData.weightChartList[i].ibwInKgs) {
                        value = wHData.weightChartList[i].ibwInKgs 
                    } else {

                        if(i === 0) {
                            value = 0
                        } 

                    }
                    idlWht.push(value);

                }

                if(weightHistoryUnitsRef.current === 'lbs') {

                    if(wHData.weightChartList[i].weightInLbs) {

                        wData.push(wHData.weightChartList[i].weightInLbs);
                        if(wHData.weightChartList[i].date) {
                            let dte = moment(wHData.weightChartList[i].date).format("DD-MMM")
                            labels.push(dte);
                        }
                            
                    } else {
                        if(wHData.weightChartList[i].date) {
                            let dte = moment(wHData.weightChartList[i].date).format("DD-MMM")
                            labels.push(dte);
                        }
                        wData.push(0);
                    }
                        
                    if(wHData.weightChartList[i].ibwInLbs) {
                        // idlWht.push(wHData.weightChartList[i].ibwInLbs);
                        value = wHData.weightChartList[i].ibwInLbs 
                    } else {
                        if(i === 0) {
                            value = 0
                        } 
                    }

                    idlWht.push(value);
                    
                }  
                
            }
            set_weightData1(wData);
            set_weightLabels(labels);
            set_idealWeightData(idlWht)

        } else {
            set_isWeightData(false)
        }

    };

    const updateWHistory = (id,units) => {

        set_tabItemWeight(id);
        weightHistoryUnitsRef.current = units;
        set_weightHistoryUnits(units);
        prepareHistoryData(weightHistoryData);

    };

    const goalVisualizationActionLoc = (value) => {
        goalVisualizationAction(value);
    };

    const navFoodRecommand = () => {
        navFRecommand();
    }

    // DashBoard page Styles
    const {
      quickselctionViewStyle,
      quickActionsInnerViewStyle,
      quickbtnInnerImgStyle,
      quickbtnInnerTextStyle,
      tyleActivityStyle,
      activityHeaderTextStyle,
      tabViewBtnStyle,
      tabViewEnableBtnStyle,
      tabBtnTextStyle,
      timeTextStyle,
      timeTextStyle1,
      timeTextStyle2,
      timeCenterTextStyle,
      plusTextStyle2,
      circleViewStyle,
      setGoalTextStyle,
      circleViewStyleiPad,
      timeTextStyle2iPad,
      timeTextStyle1iPad,
      timeTextStyleiPad,
      weightLabelTextStyle,
      wgtTyleActivityStyle,
      wgtTabViewStyle,
      tryLaterTextStyle,
      fMCenterTextStyle,
      upDownImgStyle,
      questArrowImgStyle,
      activityFoodTextStyle,
      activityFoodTextStyle1
  } = DashBoardStyles;
  
  return (
    
    <View>

    {(petPermissionsData && petPermissionsData.isFmGraph) && (dashboardPetsData && (!dashboardPetsData.isDeviceMissing && dashboardPetsData.isDeviceSetupDone)) ? <View style = {{width:wp('93.5%'),justifyContent:'center',alignSelf:'center',marginTop:hp('1%'),marginBottom:hp('2%')}}>
                
        <View style = {{marginTop:hp('2%'),justifyContent:'space-between'}}>

            {isWalkData ? <View>

                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('90%'),marginBottom:hp('1%')}}>
                    <Text style={[activityHeaderTextStyle]}>{'Daily Behavior'}</Text>
                    <TouchableOpacity style={{alignItems:'center'}} onPress={() => {goalVisualizationActionLoc(1)}}>
                        <RightArrowBtnImg style={[questArrowImgStyle,{}]}/>
                    </TouchableOpacity>
                </View>
                
                <View style = {[tyleActivityStyle,{...CommonStyles.shadowStyle,minHeight: hp("15%")}]}>

                    <View style={{flexDirection:'row'}}>

                        <View style={{flex:1.6,minHeight: hp("17%")}}>
                                
                            <PieChart style={{ height:Platform.isPad ? hp("20%") : hp("18%"),width: Platform.isPad ? wp("40%") : wp("40%")}} sort={(a,b) => b.value - a.value} outerRadius={'70%'}  padAngle={0} data={dailyFMdata}>
                                <Gradient1 ></Gradient1>
                                <Gradient2 ></Gradient2>
                                <View style={{height: hp("14%"), width: wp("25%"),justifyContent:'center',alignItems:'center'}}>
                                    <Text style={[timeCenterTextStyle,{}]}>{convertMinsToTime(runningValue + walkingValue)}</Text>
                                </View>
                            </PieChart>

                        </View>

                        <View style={{flex:1.2,marginTop:hp('2%')}}>

                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                <View style={{width:wp('1.5%'),aspectRatio:1,backgroundColor:'#6BC100',borderRadius:50}}></View>
                                <Text style={[Platform.isPad ? timeTextStyleiPad : timeTextStyle]}>{' Walking'}</Text>
                            </View>

                            <Text style={[Platform.isPad ? timeTextStyle1iPad : timeTextStyle1]}>{walkingValue && walkingValue > 0 ? convertMinsToTime1(walkingValue) : '---'}</Text>
                            <View style={{flexDirection:'row',alignItems:'center',marginTop:hp('1%')}}>
                                <View style={{width:wp('1.5%'),aspectRatio:1,backgroundColor:'#FF9203',borderRadius:50}}></View>
                                <Text style={[Platform.isPad ?  timeTextStyleiPad : timeTextStyle]}>{' Running'}</Text>
                            </View>

                            <Text style={[Platform.isPad ? timeTextStyle1iPad : timeTextStyle1]}>{runningValue && runningValue > 0 ? convertMinsToTime1(runningValue) : '---'}</Text>

                            <View style={{flexDirection:'row',width: Platform.isPad ? wp('35%') : wp('30%'),marginTop:hp("0.5%"),alignItems:'center' }}>
                                <Text style={[Platform.isPad ? [timeTextStyle2iPad,{color:isFMAVGIncrease ? '#6BC100' : '#FF9203'}] : [timeTextStyle2,{color:isFMAVGIncrease ? '#6BC100' : '#FF9203'}]]}>{Math.abs(fmLastWeekAvg)}</Text>
                                {isFMAVGIncrease ? <FMUpImg width={wp('4%')} height={wp('4%')} style={Platform.isPad ? [upDownImgStyle,{width:wp('2%'),tintColor:isFMAVGIncrease ? '#6BC100' : '#FF9203'}] : [upDownImgStyle]}/> : <FMDownImg width={wp('4%')} height={wp('4%')}/>}
                                <Text style={[Platform.isPad ? timeTextStyleiPad : timeTextStyle]}>{' % From last week'}</Text>
                            </View>
                        </View>

                    </View>

                </View>

            </View> : <View>

                <Text style={[activityHeaderTextStyle,{marginBottom:hp('1%')}]}>{'Daily Behavior'}</Text>
                <View style = {[tyleActivityStyle,{...CommonStyles.shadowStyle,width:wp('92%'),justifyContent:'center',minHeight: hp("15%")}]}>
                    <Text style={[tryLaterTextStyle]}>{Constant.NO_DATA_AVAILABLE}</Text>
                </View>

            </View>} 

        </View>

        </View> : null}

            {(petPermissionsData && petPermissionsData.isSleepGraph) && (dashboardPetsData && (!dashboardPetsData.isDeviceMissing && dashboardPetsData.isDeviceSetupDone)) ? <View style = {{width:wp('93.5%'),justifyContent:'center',alignSelf:'center',marginBottom:hp('2%')}}>
                
                <View style = {{justifyContent:'space-between'}}>

                    {isSleepData ? <View>

                        <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('90%'),marginBottom:hp('1%')}}>
                            <Text style={[activityHeaderTextStyle]}>{'Sleep Behavior'}</Text>
                            <TouchableOpacity style={{alignItems:'center'}} onPress={() => {goalVisualizationActionLoc(2)}}>
                                <RightArrowBtnImg style={[questArrowImgStyle,{}]}/>
                            </TouchableOpacity>
                        </View>

                        <View style = {[tyleActivityStyle,{...CommonStyles.shadowStyle,marginRight:hp('0.5%'),minHeight: hp("17%")}]}>

                            <View style={{flexDirection:'row'}}>
                        
                                <View style={{flex:1.6,minHeight: hp("17%")}}>
                                
                                    <PieChart
                                        sort={(a,b) => b.value - a.value}
                                        padAngle={0}
                                        style={{ height:Platform.isPad ? hp("20%") : hp("18%"),width: Platform.isPad ? wp("40%") : wp("40%")}}
                                        data={sleepData}
                                        spacing={0.1}
                                        startAngle={0  }
                                        endAngle={ Math.PI * 2 }
                                        outerRadius={'70%'}>
                                            <Gradient1 ></Gradient1>
                                            <Gradient2 ></Gradient2>
                                            <View style={{height: Platform.isPad ? 180 : 105, width: Platform.isPad ? 180 : 105,justifyContent:'center',alignItems:'center'}}>
                                                <Text style={[timeCenterTextStyle,{}]}>{convertMinsToTime(daySleepValue+nightSleepValue) }</Text>
                                            </View>
                                    </PieChart>
                                    
                                </View>

                                <View style={{flex:1.2,marginTop:  hp('2%')}}>

                                    <View style={{flexDirection:'row',alignItems:'center'}}>
                                        <View style={{width:wp('1.5%'),aspectRatio:1,backgroundColor:'#6BC100',borderRadius:50}}></View>
                                        <Text style={[Platform.isPad ? timeTextStyleiPad : timeTextStyle]}>{' Night Sleep'}</Text>
                                    </View>

                                    <Text style={[Platform.isPad ? timeTextStyle1iPad :timeTextStyle1 ]}>{nightSleepValue && nightSleepValue > 0 ? convertMinsToTime1(nightSleepValue) : '---'}</Text>
                                    <View style={{flexDirection:'row',alignItems:'center',marginTop:hp('1%')}}>
                                        <View style={{width:wp('1.5%'),aspectRatio:1,backgroundColor:'#FF9203',borderRadius:50}}></View>
                                        <Text style={[Platform.isPad ? timeTextStyleiPad : timeTextStyle]}>{' Day Sleep'}</Text>
                                    </View>

                                    <Text style={[Platform.isPad ? timeTextStyle1iPad : timeTextStyle1]}>{daySleepValue && daySleepValue > 0 ? convertMinsToTime1(daySleepValue) : '---'}</Text>

                                    <View style={{flexDirection:'row',width: Platform.isPad ? wp('35%') : wp('30%'),marginTop:hp("0.5%"),alignItems:'center' }}>
                                        <Text style={[Platform.isPad ? timeTextStyle2iPad : timeTextStyle2,{color: isSleepAVGIncrease ? '#6BC100' : '#FF9203'}]}>{Math.abs(sleepLastWeekAvg)}</Text>
                                        {isSleepAVGIncrease ? <FMUpImg width={wp('4%')} height={wp('4%')} style={Platform.isPad ? [upDownImgStyle,{width:wp('2%'),tintColor:isSleepAVGIncrease ? '#6BC100' : '#FF9203'}] : [upDownImgStyle]}/> : <FMDownImg width={wp('4%')} height={wp('4%')} style={Platform.isPad ? [upDownImgStyle,{width:wp('2%'),tintColor:isSleepAVGIncrease ? '#6BC100' : '#FF9203'}] : [upDownImgStyle]}/>}
                                        <Text style={[Platform.isPad ? timeTextStyleiPad : timeTextStyle]}>{' % From last week'}</Text>
                                    </View>
                                </View>
                                        
                            </View>

                        </View>

                    </View> : 
                    <View>

                        <Text style={[activityHeaderTextStyle,{marginBottom:hp('1%')}]}>{'Sleep Behavior'}</Text>
                        <View style = {[tyleActivityStyle,{...CommonStyles.shadowStyle,width:wp('92%'),justifyContent:'center',minHeight: hp("15%")}]}>
                            <Text style={[tryLaterTextStyle]}>{Constant.NO_DATA_AVAILABLE}</Text>
                        </View>
                    </View>}

                </View>

            </View> : null}

            {(petPermissionsData && petPermissionsData.isFmGoalSet) && (dashboardPetsData && dashboardPetsData.isDeviceSetupDone) && (dashboardPetsData && (!dashboardPetsData.isDeviceMissing && dashboardPetsData.isDeviceSetupDone)) ?  <View style = {{width:wp('93%'),justifyContent:'center',marginBottom:hp('2%'),alignSelf:'center'}}>

                <View style = {{justifyContent:'space-between'}}>
                    <Text style={[activityHeaderTextStyle,{marginBottom:hp('1%')}]}>{'Forward Motion Goal'}</Text>

                   <View style = {[tyleActivityStyle,{...CommonStyles.shadowStyle,width:wp('92%'),minHeight: hp("17%"),justifyContent:'center'}]}>

                        <View style={{flexDirection:'row'}}>
                        
                            {goalSetAchievedValue !== 0 ? <View style={{flex:1.6,height:hp("14%"),marginLeft: Platform.isPad ? wp("11%") : wp("7%"),alignitems:'center',justifyContent:'center'}}>

                                <ProgressCircle
                                    strokeWidth={Platform.isPad ? 18 : 16}
                                    style={{ height:Platform.isPad ? hp("14%") : hp("18%"),width: Platform.isPad ? wp("18%") : wp("25%")}}
                                    progress={ goalSetValue }
                                    progressColor={colorValue1}
                                    backgroundColor={colorValue2}
                                >

                                <View style={{height:hp("14%"), width: Platform.isPad ? wp("10%") : wp("18%"),justifyContent:'center',alignItems:'center'}}>
                                    <Text style={[fMCenterTextStyle,{}]}>{fmPercentage+"%"}</Text>
                                </View>
                                    
                                </ProgressCircle>
    
                            </View> : <View style={{flex:1.6,height:hp("14%"),justifyContent:'center'}}>
                                <Text style={[tryLaterTextStyle,{width:wp("35%"),textAlign:'center'}]}>{Constant.NO_DATA_AVAILABLE}</Text>
                            </View>}

                            <View style={{flex:1,justifyContent:'center'}}>

                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Text style={[Platform.isPad ? timeTextStyleiPad : timeTextStyle]}>{'Goal Set'}</Text>
                                </View>

                                <Text style={[Platform.isPad ? timeTextStyle1iPad : timeTextStyle1]}>{actualGoalSetValue && actualGoalSetValue > 0 ? goalSetText : '---'}</Text>

                                {goalSetAchievedValue !== 0 ? <View style={{flexDirection:'row',alignItems:'center',marginTop:hp('1%')}}>
                                    <Text style={[Platform.isPad ? timeTextStyleiPad : timeTextStyle]}>{'Achieved'}</Text>
                                </View> : null}

                                <Text style={[Platform.isPad ? timeTextStyle1iPad : timeTextStyle1]}>{convertMinsToTime1(goalSetAchievedValue)}</Text>
                            </View>

                            <View style={{flex:1.2,alignItems:'center',justifyContent:'center',marginTop:Platform.isPad ? hp('-2.5%') : hp('-1%')}}>

                                <TouchableOpacity onPress={() => {setGoelAction()}}>
                                    <View style={[Platform.isPad ? circleViewStyleiPad : circleViewStyle]}>
                                        <Text style={[plusTextStyle2]}>{'+'}</Text>
                                    </View>
                                </TouchableOpacity>

                                <Text style={[setGoalTextStyle]}>{'Set/Change goal'}</Text>
                            </View>
                                
                        </View>

                    </View>
                </View>

            </View> : null}

            {petPermissionsData && petPermissionsData.isWeightPer ? <View style = {{width:wp('93.5%'),marginBottom:hp('2.5%'),alignSelf:'center'}}>

            <Text style={[activityHeaderTextStyle,{marginBottom:hp('1%')}]}>{'Weight'}</Text>

                {isWeightData ? <View style = {[tyleActivityStyle,{...CommonStyles.shadowStyle,width:wp('92%'),minHeight: Platform.isPad || Platform.OS === "android" ? hp("38%") : hp("33%"),justifyContent:'center',alignItems:'center'}]}>
                    <View style = {{flexDirection:'row',width:wp('88%'),justifyContent:'space-between',alignitems:'center'}}>

                    <Text style={[activityHeaderTextStyle]}>{''}</Text>
                    <View style={[wgtTabViewStyle,{}]}>

                        <View style={{flexDirection:'row',alignSelf:'center',height:hp('3.2%'),width:wp('48.5%'),justifyContent:'space-between'}}>
                            
                            <TouchableOpacity style={[tabItemWeight === 0 ? [tabViewEnableBtnStyle,CommonStyles.shadowStyleLight,{height:hp('2.5%'),width:wp('22%'),borderRadius: Platform.isPad ? 10 : 7}] : [tabViewBtnStyle,{width:wp('22%')}]]} onPress={() => {updateWHistory(0,'lbs')}}>
                                <Text style={[tabBtnTextStyle,{marginRight:hp('0.2%')}]}>{'Lbs'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[tabItemWeight === 1 ? [tabViewEnableBtnStyle,CommonStyles.shadowStyleLight,{height:hp('2.5%'),backgroundColor:'white',width:wp('22%'),borderRadius: Platform.isPad ? 10 : 7}] : [tabViewBtnStyle,{width:wp('22%')}]]} onPress={() => {updateWHistory(1,'Kgs')}}>
                                <Text style={[tabBtnTextStyle]}>{'Kgs'}</Text>
                            </TouchableOpacity>
                            
                        </View>

                    </View>

                    </View>

                    <View style ={{marginLeft:wp('-7%')}}>
                        <LineChart
                            verticalLabelRotation={0}
                            data={{
                                labels: weightLabels,
                                datasets: [
                                    {
                                        data: weightData1,
                                        color: (opacity = 1) => `#6BC100`,
                                        strokeWidth: 2
                                    },
                                    {
                                        data: idealWeightData,
                                        color: (opacity = 1) => `#FF9203`,
                                        strokeWidth: 2,
                                        hidePointsAtIndex : [1]
                                    }
                                ]
                            }}
                            width={Platform.isPad ? Dimensions.get("window").width - 60 : Dimensions.get("window").width - 25 }
                            height={Platform.isPad ? 320 : 170}
                            yAxisInterval={1}
                            chartConfig={{
                                backgroundColor: "white",
                                backgroundGradientFrom: "white",
                                backgroundGradientTo: "white",
                                decimalPlaces: 0,
                                barPercentage: 1.5,
                                color: (opacity = 1) => `white`,
                                labelColor: (opacity = 1) => `black`,
                                style: { borderRadius: 16,justifyContent:'center'},
                                // linejoinType : 'round',
                                // Linejoin : 'bevel',
                                propsForDots: {
                                    r: Platform.isPad ? "8" : "4",
                                },
                                
                            }}
                            // bezier
                            style={{marginVertical: 8,borderRadius: 16 }}
                            // renderDots={({ value, getColor }) => {Toast.show(value + ' '+weightHistoryUnits, Toast.LONG);}}
                            onDataPointClick={({ value, getColor }) => {Toast.show(value + ' '+weightHistoryUnits, Toast.LONG);}}
                            withShadow={false}
                            withInnerLines={false}
                            withDots={true}
                            
                        />
                    </View>

                    <View style={{flexDirection:'row',marginTop: Platform.isPad ? hp('0%') : hp('1.5%')}}>

                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <View style={{width: Platform.isPad ? wp('2%') : wp('2.5%'),aspectRatio:1,backgroundColor:'#6BC100',borderRadius:50}}></View>
                            <Text style={[Platform.isPad ? weightLabelTextStyle : weightLabelTextStyle]}>{' Weight'}</Text>
                        </View>
                        
                        <View style={{flexDirection:'row',alignItems:'center',marginLeft: wp('1.5%')}}>
                            <View style={{width: Platform.isPad ? wp('2%') : wp('2.5%'),aspectRatio:1,backgroundColor:'#FF9203',borderRadius:50}}></View>
                            <Text style={[Platform.isPad ? weightLabelTextStyle : weightLabelTextStyle]}>{' Ideal Weight'}</Text>
                        </View>

                    </View>

                </View> : 
                <View style = {[tyleActivityStyle,{...CommonStyles.shadowStyle,width:wp('93.5%'),minHeight: hp("15%"),alignItems:'flex-start'}]}>
                    <Text style={[activityHeaderTextStyle]}>{''}</Text>
                    <View style={{alignItems:'center',justifyContent:'center',width:wp('93.5%'),height: hp("12%"),}}>
                    <Text style={[tryLaterTextStyle]}>{Constant.NO_DATA_AVAILABLE}</Text>
                    </View>
                </View>}

            </View> : null}

            {petPermissionsData && petPermissionsData.isFoodHistory ? <View style = {[tyleActivityStyle,{...CommonStyles.shadowStyle,width:wp('92%'),minHeight:hp('8%'),justifyContent:'center',marginBottom:hp('2%'),alignItems:'center',alignSelf:'center'}]}>

                <View style = {{flexDirection:'row', justifyContent:'space-between',width:wp('85%')}}>

                    <View style = {{flex:0.7, justifyContent:'center'}}>
                        <HomeFoodImg width = {wp("12%")} height = {hp("5%")} resizeMode = {'contain'}/> 
                    </View>

                    <View style = {{flex:3,justifyContent:'center'}}>
                        <Text style={[activityFoodTextStyle]}>{'Recommended Food for Today'}</Text>
                            {foodHistoryObj && foodHistoryObj.dietName ? <View style = {{justifyContent:'center',marginTop:hp('0.5%')}}>
                                <Text style={[activityFoodTextStyle1]}>{foodHistoryObj ? foodHistoryObj.dietName : ''}</Text>
                                {petPermissionsData && petPermissionsData.isFeedingReq && (foodHistoryObj.recommendedRoundedCups > 0 || foodHistoryObj.recommendedRoundedGrams > 0) ? <Text style={[activityFoodTextStyle1]}>{foodHistoryObj && foodHistoryObj.unitId === 4 ? foodHistoryObj.recommendedRoundedCups+' ('+foodHistoryObj.recommendedAmountCups +') ' +foodHistoryObj.unit: foodHistoryObj.recommendedRoundedGrams + ' '+foodHistoryObj.unit}</Text> : null}
                            </View> : null}
                    </View>

                    <View style = {{flex:0.3,justifyContent:'center'}}>

                        <TouchableOpacity style={{alignItems:'center'}} onPress={() => {navFoodRecommand()}}>
                            <RightArrowBtnImg style={[questArrowImgStyle,{}]}/>
                        </TouchableOpacity>
                    </View>

                </View>

            </View> : null}

            <View style = {{}}>

                <ImageBackground style={quickselctionViewStyle} resizeMode="stretch" source={require("../../../../assets/images/dashBoardImages/png/quicActionsBk.png")}>

                    {(petPermissionsData && petPermissionsData.isTimerEnable) && !isModularityService ? <View style={quickActionsInnerViewStyle}>
                        <TouchableOpacity style={{alignItems:'center'}} onPress={() => {setQuickSetupAction('Timer')}}>
                            <DashTimerImg width = {wp('5%')} height = {hp('3%')} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('3.5%')}] :[quickbtnInnerImgStyle]}/>
                            <Text style={quickbtnInnerTextStyle}>{"TIMER"}</Text>
                        </TouchableOpacity>                          
                    </View> : (isModularityService ? <View style={quickActionsInnerViewStyle}><ActivityIndicator size="small" color="gray"/></View> : null)}

                    {(petPermissionsData && petPermissionsData.isObsEnable) && !isModularityService ? <View style={quickActionsInnerViewStyle}>
                        <TouchableOpacity style={{alignItems:'center'}} onPress={() => {setQuickSetupAction('Quick Video')}}>
                            <DashQuickVideoImg width = {wp('5%')} height = {hp('3%')} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle,{width:wp('5%')}]}/>
                            <Text style={quickbtnInnerTextStyle}>{"QUICK VIDEO"}</Text>
                        </TouchableOpacity>                          
                    </View> : (isModularityService ? <View style={quickActionsInnerViewStyle}><ActivityIndicator size="small" color="gray"/></View> : null)}

                    <View style={quickActionsInnerViewStyle}>
                        <TouchableOpacity style={{alignItems:'center'}} onPress={() => {setQuickSetupAction('Chat')}}>
                            <DashChatImg width = {wp('5%')} height = {hp('3%')} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle]}/>
                            <Text style={quickbtnInnerTextStyle}>{"CHAT"}</Text>
                        </TouchableOpacity>                          
                    </View>

                    <View style={quickActionsInnerViewStyle}>
                        <TouchableOpacity style={{alignItems:'center'}} onPress={() => {setQuickSetupAction('Support')}}>
                            <DashChatQSettingsImg width = {wp('5%')} height = {hp('3%')} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle]}/>
                            <Text style={quickbtnInnerTextStyle}>{"SUPPORT"}</Text>
                        </TouchableOpacity>                          
                    </View>

                </ImageBackground>

            </View>
        </View>

    );
}
  
  export default DashboardActivityUI;