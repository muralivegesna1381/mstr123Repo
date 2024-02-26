import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,Image,ImageBackground} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let dogImage = require("./../../../../assets/images/sensorImages/png/sensor-phone.png");
let dogImageHPN = require("./../../../../assets/images/sensorImages/png/hpn1ReplaceImg.png");
let trace_inSyncSensorScreen;

const ReplaceSyncRequestComponent = ({navigation,route, ...props }) => {

    const [deviceNo, set_deviceNo] = useState(undefined);
    const [deviceModal, set_deviceModal] = useState(undefined);

    useEffect(() => {

        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_Replace_Sync_Sensor);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_Replace_Sync_Sensor, "User in Replace Sync Sensor Screen", '');
        if(route.params?.deviceNo) {
            set_deviceNo(route.params?.deviceNo);
            set_deviceModal(route.params?.deviceModel);
        }

        return () => {
          initialSessionStop();
        };

    }, [route.params?.deviceNo,route.params?.deviceModel]);

    const initialSessionStart = async () => {
        trace_inSyncSensorScreen = await perf().startTrace('t_inReplaceSyncSensorScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inSyncSensorScreen.stop();
    };

    const backBtnAction = () => {
        navigation.pop();
    };

    const nextBtnAction = () => {
        navigation.navigate('SensorInitialComponent')
    };

    return (
        <View style={[CommonStyles.mainComponentStyle,{alignItems:'center'}]}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Replace Sesnor'}
                    headerColor = {'#F5F7F9'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

        <View>

            <View style={{width:wp('80%'),marginTop:hp('5%'),}}>
                <Text style={CommonStyles.headerTextStyle}>{'Please bring your sensor'}</Text>
                <Text style={CommonStyles.headerTextStyle}>{'closer to your mobile'}</Text>
            </View>

            <View style={{width:wp('80%'),marginTop:hp('1%'),flexDirection:'row'}}>
                <Text style={styles.leftTextStyle}>{'Device Number : '}</Text>
                <Text style={styles.leftTextStyle}>{deviceNo}</Text>
            </View>

            {deviceModal && deviceModal.includes("HPN") ? <View style={{width:wp('80%'),marginTop:hp('8%'),justifyContent:'center',alignItems:'center'}}>
                <Image style={[styles.senosrImgStyle]} resizeMode='contain' source={dogImageHPN}></Image>
            </View> : <View style={{width:wp('80%'),marginTop:hp('8%'),justifyContent:'center',alignItems:'center'}}>
                <Image style={[styles.senosrImgStyle]} resizeMode='contain' source={dogImage}></Image>
            </View>}
         
        </View>  

        {<View style={CommonStyles.bottomViewComponentStyle}>
            <BottomComponent
                rightBtnTitle = {'NEXT'}
                leftBtnTitle = {'BACK'}
                isLeftBtnEnable = {true}
                rigthBtnState = {true}
                isRightBtnEnable = {true}
                rightButtonAction = {async () => nextBtnAction()}
                leftButtonAction = {async () => backBtnAction()}
            />
        </View>}

    </View>
    );
  }
  
  export default ReplaceSyncRequestComponent;

  const styles = StyleSheet.create({

    headingView : {
        width:wp('85%'),
        height:hp('6%'),
        flexDirection:'row',
        alignItems : 'center',
    },

    leftTextStyle : {
        fontSize: fonts.fontXMedium,
        ...CommonStyles.textStyleBold,
        color: 'black',     
    },

    senosrImgStyle : {
        aspectRatio:1,
        height:hp('45%'),
    }

  });