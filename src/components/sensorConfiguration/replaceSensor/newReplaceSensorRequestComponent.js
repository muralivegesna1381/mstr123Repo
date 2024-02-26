import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,Image,ImageBackground} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import fonts from './../../../utils/commonStyles/fonts'
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import * as DataStorageLocal from "../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import perf from '@react-native-firebase/perf';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';

let dogImage = require("./../../../../assets/images/sensorImages/png/sensor-phone.png");
let dogImageHPN = require("./../../../../assets/images/sensorImages/png/hpn1ReplaceImg.png");
let trace_inNewRepScreen;

const NewReplaceSensorRequestComponent = ({navigation,route, ...props }) => {

    const [newDeviceNumber, set_newDeviceNumber] = useState('');
    const [configureObj, set_configureObj] = useState(undefined);
    const [deviceModal, set_deviceModal] = useState(undefined);

    useEffect(() => {
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_New_Replace_Sensor_Req);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_New_Replace_Sensor_Req, "User in Replace Sensor Request Screen", '');
        getNewDeviceNumber();
        return () => {
          initialSessionStop();
        };
    }, []);

    const initialSessionStart = async () => {
        trace_inNewRepScreen = await perf().startTrace('t_inNewReplaceSensorRequestScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inNewRepScreen.stop();
    };

    const getNewDeviceNumber = async () => {

        let configureObj = await DataStorageLocal.getDataFromAsync(Constant.CONFIG_SENSOR_OBJ);
        configureObj = JSON.parse(configureObj);
        if(configureObj) {
            set_newDeviceNumber(configureObj.configDeviceNo);
            set_configureObj(configureObj);
            set_deviceModal(configureObj.configDeviceModel);
        }

    }

    const backBtnAction = () => {
        
        if(configureObj && configureObj.isReplaceSensor === 1 && (configureObj.isForceSync === 0 || configureObj.isForceSync === 2)) {
            navigation.navigate('FindSensorComponent');
        } else {
            navigation.navigate('ReplaceSensorComponent');
        }  
    };

    const nextBtnAction = async () => {

        if(configureObj && configureObj.isReplaceSensor === 1 && configureObj.isForceSync === 0) {
            navigation.navigate('SensorInitialComponent');
        } else {
            set_configureObj(configureObj);
            navigation.navigate('ConnectSensorComponent');
        }  

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
                <Text style={CommonStyles.headerTextStyle}>{'Please bring your New sensor closer to your mobile'}</Text>
            </View>

            <View style={{width:wp('80%'),marginTop:hp('1%'),flexDirection:'row'}}>
                <Text style={styles.leftTextStyle}>{'Sensor Number : '}</Text>
                <Text style={styles.leftTextStyle}>{newDeviceNumber}</Text>
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
  
  export default NewReplaceSensorRequestComponent;

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