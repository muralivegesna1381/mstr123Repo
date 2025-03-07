import React, {useState,useEffect,useRef} from 'react';
import {Text, View,StyleSheet,BackHandler,Platform, Image} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import BleManager from "react-native-ble-manager";
import Highlighter from "react-native-highlight-words";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as PermissionsiOS from './../../../utils/permissionsComponents/permissionsiOS';
import * as CheckPermissionsAndroid from './../../../utils/permissionsComponents/permissionsAndroid';

import HPN1SensorImg from "./../../../../assets/images/sensorImages/png/hpn1SensorIcon.png";
import SensorInstImg from "./../../../../assets/images/sensorImages/svg/sensorInstBleIcon.svg";
import ConfigSensorMenuImg from "./../../../../assets/images/otherImages/svg/configsensorMenu.svg";
import SensorBatteryImg from "./../../../../assets/images/sensorImages/svg/sensorInstBatteryIcon.svg";
import SensorInstWiFiImg from "./../../../../assets/images/sensorImages/svg/sensorInstWifiIcon.svg";

let trace_inSensorsChargecreen;

const SensorChargeConfirmationComponent = ({navigation, route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [setupStatus, set_setupStatus] = useState(undefined);
    const [sensorType, set_sensorType] = useState(undefined)
    const [date, set_Date] = useState(new Date());
    
    let popIdRef = useRef(0);
    let actionType = useRef();
    let isFirmwareReq = useRef();

    useEffect(() => {

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_Sensor_charge_confirm);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_Sensor_charge_confirm, "User in Sensor Charge Confirmation Screen", ''); 
      });

      const unsubscribe = navigation.addListener('blur', () => {
        initialSessionStop();
      });

        return () => {
          focus();
          unsubscribe();
          initialSessionStop();
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        }; 

    }, []);

    useEffect(() => {
      getSensorType(); 
    }, []);

    const getSensorType = async (defPet) => {

      let configObj = await DataStorageLocal.getDataFromAsync(Constant.CONFIG_SENSOR_OBJ);
      configObj = JSON.parse(configObj);

      if(configObj) {
        if(configObj.isForceSync === 1) {
          set_sensorType(configObj.deviceModel);
        } else {
          set_sensorType(configObj.configDeviceModel);
        }
        set_setupStatus(configObj.isDeviceSetupDone);
        actionType.current = configObj.actionType;
        isFirmwareReq.current = configObj.isFirmwareReq;
        firebaseHelper.logEvent(firebaseHelper.event_Sensor_type, firebaseHelper.screen_Sensor_charge_confirm, "Getting Sensor Type", 'Device Type : '+configObj.configDeviceModel);
      }

    }
  
    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
      trace_inSensorsChargecreen = await perf().startTrace('t_inSensorChargeConfirmScreen');
    };

    const initialSessionStop = async () => {
      await trace_inSensorsChargecreen.stop();
    };

    const nextButtonAction = async () => {
      checkBleState();
    };

    const backBtnAction = () => {

      if(popIdRef.current === 0){
        navigation.navigate('SensorInitialComponent');
      }
        
    };

    const checkBleState = async () => {

      if(Platform.OS === 'ios') {

          let permissions = await PermissionsiOS.checkBlePermissions();
          if(permissions) {
            navigateTosensorAction();
          } else {
            showBleFailed(Constant.BLE_PERMISSIONS_ENABLED_HIGH,Constant.BLE_PERMISSIONS_ENABLED);
          }
          return;
        
      }  else {

        let permissions = await CheckPermissionsAndroid.checkBLEPermissions();
        if(permissions) {
          BleManager.enableBluetooth().then(() => {
            navigateTosensorAction();

          }).catch((error) => {
            showBleFailed(Constant.BLE_PERMISSIONS_ENABLED_HIGH_ANDROID,Constant.BLE_PERMISSIONS_ENABLED_ANDROID);
          });
          
        } else {
          showBleFailed(Constant.BLE_PERMISSIONS_ENABLED_HIGH_ANDROID,Constant.BLE_PERMISSIONS_ENABLED_ANDROID);
        }
        
      }
         
    };

    const navigateTosensorAction = async () => {

      firebaseHelper.logEvent(firebaseHelper.event_sensor_ble_status, firebaseHelper.screen_Sensor_charge_confirm, "Checking Bluetooth Status", 'Ble Status : Enabled');
      navigation.navigate('FindSensorComponent');

    };

    const showBleFailed = async (hMsg,msg) => {

      firebaseHelper.logEvent(firebaseHelper.event_sensor_ble_status, firebaseHelper.screen_Sensor_charge_confirm, "Checking Bluetooth Status", 'Ble Status : Disabled');
      let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
      searchWords={[hMsg]}
      textToHighlight={
        msg
      }/>
      set_popUpMessage(high);
      set_isPopUp(true);
      popIdRef.current = 1;

    };

    const popOkBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpMessage(undefined);       
    };

    const popCancelBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpMessage('Is your sensor charged and pulled out of charging?');
    };

return (

        <View style={CommonStyles.mainComponentStyle}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Sensor Setup Instructions'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.mainViewStyle}>

                <View style={styles.topViewStyle}>
                  <Text style={[styles.txtStyle]}>{'Please take a note of the below instructions before proceeding:'}</Text>
                </View>

                <View style={styles.instViewStyle}>

                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        {sensorType && sensorType.includes('HPN1') ? <Image source={HPN1SensorImg} style={styles.iconStyles}></Image> : <ConfigSensorMenuImg width={wp('10%')} height={hp('10%')} style={styles.iconStyles}/>}
                        {sensorType && sensorType.includes('HPN1') ? <Text style={[styles.instTxtStyle]}>{'The sensor should be'}<Text style={[styles.instTxtStyleBold]}>{' plugged into charging'}</Text> </Text> 
                        : <Text style={[styles.instTxtStyle]}>{'The sensor should be unplugged from charger'} </Text>} 
                    </View>

                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <SensorInstImg width={wp('10%')} height={hp('10%')}/>
                        <Text style={[styles.instTxtStyle]}>{'The phone’s '}
                        <Text style={[styles.instTxtStyleBold]}>{'Bluetooth'}
                        <Text style={[styles.instTxtStyle]}>{' should be switched on throughout the sensor configuration'}</Text> 
                        </Text> 
                        </Text>   
                    </View>

                    {sensorType && sensorType.includes('HPN1') ? null : <View style={{flexDirection:'row',alignItems:'center'}}>
                        <SensorBatteryImg width={wp('10%')} height={hp('10%')}/>
                        <Text style={[styles.instTxtStyle]}>{'The sensor should be sufficiently charged (no blinking red light)'} </Text>   
                    </View>}

                    {sensorType && sensorType.includes('HPN1') ? null : <View style={{flexDirection:'row',alignItems:'center'}}>
                        <SensorInstWiFiImg width={wp('10%')} height={hp('10%')}/>
                        <Text style={[styles.instTxtStyle]}>{'The sensor should be awake while they are being configured. Please shake the sensors while the app is writing the Wi-Fi details to the sensors'} </Text>   
                    </View>}

                    {sensorType && sensorType.includes('HPN1') ? <View style={{flexDirection:'row',alignItems:'center'}}>
                      <SensorInstWiFiImg width={wp('10%')} height={hp('10%')}/>
                      <Text style={[styles.instTxtStyle]}>{'The sensor should be within'}<Text style={[styles.instTxtStyleBold]}>{' close proximity '} </Text><Text style={[styles.instTxtStyle]}>{'(< 1-meter range) of the mobile device'} </Text></Text>   
                    </View> : null}

                </View>

            </View>
           
            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'YES'}
                    leftBtnTitle = {'NO'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}

                ></BottomComponent>
            </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

        </View>
    );
};

export default SensorChargeConfirmationComponent;

const styles = StyleSheet.create({

    mainViewStyle :{
        width:wp('100%'),
        height:hp('75%'),
    },

    topViewStyle : {
        width:wp('80%'),
        minHeight:hp('10%'),
        justifyContent:'center',
        alignSelf:'center',       
    },

    txtStyle : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleLight,
        marginRight:wp('3%'), 
    },

    instViewStyle : {
        height:hp('100%'),
        width:wp('80%'),
        marginTop:wp('5%'),
        alignItems:'center',
        alignSelf:'center',
    },

    instTxtStyle : {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        marginLeft:wp('3%'),
        flex:6,
    },

    instTxtStyleBold : {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
    },

    iconStyles : {
      width: wp('10%'),
      aspectRatio:1
    },

});