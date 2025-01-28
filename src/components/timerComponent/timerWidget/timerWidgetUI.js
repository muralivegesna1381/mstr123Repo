import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Platform} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as UserDetailsModel from "./../../../utils/appDataModels/userDetailsModel.js";

const  TimerWidgetUI = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [activityText, set_activityText] = useState(undefined);
    const [showSearch, set_showSearch] = useState(false);
    const [adjustTimer, set_adjustTimer] = useState('');
    const [adjustTimerDev, set_adjustTimerDev] = useState('');

    useEffect(() => {
        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_petName(props.petName);
        set_activityText(props.activityText);
    }, [props.isPopUp,props.popUpMessage,props.petName,props.activityText]);
    
    useEffect(() => {
        getUserMenu();
    }, [props.isTimerPaused,props.isTimerVisible]);

    useEffect(() => {

    }, [props.isPopUp,props.popUpMessage,props.isPopLftBtn,props.popRightBtnTitle,props.poplftBtnTitle,props.popAlert]);

    useEffect(() => {
        checkTimerDimentions();
        checkTimerDimentionsDevice();
    }, [props.seconds]);

    const getUserMenu = async () => {

        let userRoleDetails = UserDetailsModel.userDetailsData.userRole;
        if(userRoleDetails && (userRoleDetails.RoleName === "Hill's Vet Technician")) {
            set_showSearch(true);
        } else {
            set_showSearch(false);
        }
    };

    const checkTimerDimentions = async () => {

        let adjust = await DataStorageLocal.getDataFromAsync(Constant.TIMER_DIMENTIONS);
        if(adjust && adjust === 'adjust') {
            set_adjustTimer('adjust')
        } else {
            set_adjustTimer('')
        }
        
    }

    const checkTimerDimentionsDevice = async () => {

        let adjust = await DataStorageLocal.getDataFromAsync(Constant.TIMER_DIMENTIONS_DEVICE);
        if(adjust === "deviceStat" ){
            set_adjustTimerDev(adjust)
        } else {
            set_adjustTimerDev('')
        }
    }

    const stopBtnAction = () => {
        props.stopBtnAction();
    }

    const pauseBtnAction = (value) => {
        props.pauseBtnAction(!value);
    }

    const timerLogsBtnAction = () => {
        props.timerLogsBtnAction();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    return (
        <>
        {props.isTimerVisible === true ? 
            <View style={{
                position: 'absolute',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#2E2E2E',//'#242A37',
                width: wp('100%'),
                height: Platform.isPad ? hp('14%') : hp('12%'),
                bottom: hp('45%'),
                // top:showSearch ? hp('27%') : (adjustTimer === 'adjust' ? (Platform.isPad ? hp('27.0%') : (adjustTimerDev === 'deviceStat' ? hp('33%') : hp('26%'))) : (adjustTimerDev === 'deviceStat' ? hp('27.5%') : hp('20.5%'))),}}>
                top:showSearch ? (adjustTimer === 'adjust' ? (adjustTimerDev === 'deviceStat' ? hp('39.5%') : hp('32.5%')) : (adjustTimerDev === 'deviceStat' ? hp('34%') : hp('27%'))) : (Platform.isPad ? (adjustTimer === 'adjust' ? (adjustTimerDev === 'deviceStat' ? hp('33%') : hp('26.0%')) : (adjustTimerDev === 'deviceStat' ? hp('27.5%') : hp('20.5%'))) : 
                (adjustTimer === 'adjust' ? (adjustTimerDev === 'deviceStat' ? hp('33.0%') : hp('26.0%')) : (adjustTimerDev === 'deviceStat' ? hp('28.5.0%') : hp('20.5%'))))}}>

                <View>

                    <View style={{height: hp('3%'),flexDirection:'row',marginTop: Platform.isPad ? hp('1%') : hp('0%')}}>
                        <Text style={styles.petTextStyle}>{petName}</Text>
                        <Text style={styles.petTextStyle}>{' : '}</Text>
                        <Text style={styles.petTextStyle}>{activityText}</Text>
                    </View>

                    <View style={{width:wp('90%'),flexDirection:'row',}}>

                        <View style={styles.timerTextViewStyle}>

                            <Text style={styles.timerTextStyle}>{props.hours}</Text>
                            <Text style={styles.timerTextStyle}>{' : '}</Text>
                            <Text style={styles.timerTextStyle}>{props.minutes}</Text>
                            <Text style={styles.timerTextStyle}>{' : '}</Text>
                            <Text style={styles.timerTextStyle}>{props.seconds}</Text>

                        </View>

                        <View style={{flexDirection:'row',flex:1}}>
                            <View>
                                <TouchableOpacity style={[styles.btnsBckStyle,{backgroundColor:'#c91010',width: Platform.isPad ? wp('10%') : wp('13%')}]} onPress={() => {stopBtnAction()}}>
                                    <Text style={[styles.btnTextStyle,{color:"white"}]}>{'STOP'}</Text>
                                </TouchableOpacity>                               
                            </View>

                            <View>
                                <TouchableOpacity style={[styles.btnsBckStyle,{width: Platform.isPad ? wp('10%') : wp('13%')}]} onPress={() => {pauseBtnAction(props.isTimerPaused)}}>
                                    <Text style={[styles.btnTextStyle,{color:"white"}]}>{!props.isTimerPaused ? 'PAUSE' : 'RESUME'}</Text>
                                </TouchableOpacity>
                            </View>

                            <View>
                                <TouchableOpacity style={[styles.btnsBckStyle,{backgroundColor:'#18cfac',width: Platform.isPad ? wp('10%') : wp('13%')}]} onPress={() => {timerLogsBtnAction()}}>
                                    <Text style={[styles.btnTextStyle,{color:"white"}]}>{'TIMER LOGS'}</Text>
                                </TouchableOpacity>                              
                            </View>

                        </View>

                        </View>
                        
                </View>
                
         </View> :<View></View>}

         {props.isPopUp ? <View style={CommonStyles.customPopUpGlobalStyle}>
            <AlertComponent
                header = {props.popAlert}
                message={props.popUpMessage}
                isLeftBtnEnable = {props.isPopLftBtn}
                isRightBtnEnable = {true}
                leftBtnTilte = {props.poplftBtnTitle}
                rightBtnTilte = {props.popRightBtnTitle}
                popUpRightBtnAction = {() => popOkBtnAction()}
                popUpLeftBtnAction = {() => popCancelBtnAction()}
            />
        </View> : null}
        </>
    );
  }
  export default TimerWidgetUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2E2E2E',
        width: wp('100%'),
        height: hp('10%'),
        bottom: hp('45%'),
        top:hp('24%'),
    },

    timerTextViewStyle : {
        flexDirection:'row',
        // justifyContent:'center',
        alignItems:'center',
        flex:1,
        marginRight:wp('8%')
    },

    timerTextStyle : {
        fontSize: fonts.fontXXXXLarge,
        ...CommonStyles.textStyleBold,
        color: '#6ac100', 
    },

    petTextStyle : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
        color: 'white', 
    },

    btnsBckStyle : {
        width : wp('13%'),
        aspectRatio:1,
        backgroundColor:'#6ac100',
        borderRadius:wp('15%'),
        justifyContent:'center',
        alignItems:'center',
        margin:wp('1%'),
    },

    btnTextStyle : {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleExtraBold,
        color: '#6ac100', 
        textAlign:'center'
    },

  });