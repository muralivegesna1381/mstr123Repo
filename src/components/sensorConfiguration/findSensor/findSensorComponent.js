import React, {useState,useEffect,useRef} from 'react';
import {StyleSheet,Text, View,Image,BackHandler,Platform} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import BleManager, { enableBluetooth } from "react-native-ble-manager";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as CheckPermissionsAndroid from './../../../utils/permissionsComponents/permissionsAndroid';
import * as CheckPermissionsIOS from './../../../utils/permissionsComponents/permissionsiOS';
import Highlighter from "react-native-highlight-words";

let trace_inFindSensorscreen;

const FindSensorComponent = ({navigation, route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [deviceNumber, set_deviceNumber] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [fromScreen, set_fromScreen] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    
    let popIdRef = useRef(0);

    useEffect(() => {

      getDevice();

      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_find_sensor);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_find_sensor, "User in Find Sensor Screen", ''); 
      });

      const unsubscribe = navigation.addListener('blur', () => {
          initialSessionStop();
      });

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
          initialSessionStop();
          focus();
          unsubscribe();
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    useEffect(() => {    
      
      if(route.params?.fromScreen){
        set_fromScreen(route.params?.fromScreen);
      }
      
    }, [route.params?.fromScreen]);
  
    const initialSessionStart = async () => {
      trace_inFindSensorscreen = await perf().startTrace('t_inFindSensorScreen');
    };

    const initialSessionStop = async () => {
        await trace_inFindSensorscreen.stop();
    };

    const handleBackButtonClick = () => {
        backBtnAction();
          return true;
    };
    
    const getBluetoothState = async () => {

      if(Platform.OS === 'android') {

        let androidPer = await CheckPermissionsAndroid.checkBLEPermissions();
        if(androidPer) {
          BleManager.enableBluetooth().then(() => {
            onBleSuccess(true);
          }).catch((error) => {
            onBleSuccess(false);
          });
          
        } else {
          onBleSuccess(false);
        }

      } else {
        let permissions = await CheckPermissionsIOS.checkBlePermissions();
        if(permissions) {
          onBleSuccess(true);
        } else {
          onBleSuccess(false);
        }
      }
    }

    const getDevice = async () => {

      let defaultObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
      defaultObj = JSON.parse(defaultObj);
      let sensorIndex = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);
      let devNumber = defaultObj.devices[parseInt(sensorIndex)].deviceNumber;
      let petName = defaultObj.petName;
        
      firebaseHelper.logEvent(firebaseHelper.event_Sensor_type, firebaseHelper.screen_find_sensor, "Device Number : "+devNumber, 'Pet Name : '+petName);
      set_deviceNumber(devNumber);
      set_petName(petName);
    }

    const nextButtonAction = async () => {
      getBluetoothState();      
    };

    const onBleSuccess = async (value) => {

      firebaseHelper.logEvent(firebaseHelper.event_sensor_ble_status, firebaseHelper.screen_find_sensor, "Checking Ble Status", 'Ble Status : '+value);
      if(value){
        navigation.navigate('ConnectSensorComponent');
      } else {
        let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
          searchWords={[Constant.BLE_PERMISSIONS_ENABLED_HIGH]}
          textToHighlight={
            Constant.BLE_PERMISSIONS_ENABLED
          }/>
        set_popUpMessage(high);
        set_isPopUp(true);
        popIdRef.current = 1;
      }
      
  };

    const backBtnAction = () => {

      if(popIdRef.current === 0){
        if(fromScreen==='configured'){
          navigation.navigate('WifiListHPN1Component');
        } else {
          navigation.navigate('SelectSensorActionComponent');
        }
      }
  
    }

    const popOkBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpMessage(undefined);
    }

    const popCancelBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
    }

return (

    <View style={CommonStyles.mainComponentStyle}>

      <View style={[CommonStyles.headerView,{}]}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isChatEnable={false}
          isTImerEnable={false}
          isTitleHeaderEnable={true}
          title={'Device Setup'}
          backBtnAction = {() => backBtnAction()}
        />
      </View>

      <View style={styles.mainViewStyle}>

        <View style={[styles.topViewStyle]}>
          <Text style={styles.txtStyle}>{'Device Number : '}<Text style={[styles.txtStyle1]}>{deviceNumber}</Text></Text>
          <Text style={styles.txtStyle}>{'Pet Name : '}<Text style={[styles.txtStyle1]}>{petName}</Text></Text>
        </View>

        <View style={{height:hp('60%'),alignItems:'center',justifyContent:'center'}}>
          <Image style={styles.sensorImgStyels} source={require("./../../../../assets/images/sensorImages/png/bleGreenImg.png")}/>
        </View>

      </View>
            
      <View style={CommonStyles.bottomViewComponentStyle}>
        <BottomComponent
          rightBtnTitle = {'FIND SENSOR'}
          isLeftBtnEnable = {false}
          rigthBtnState = {true}
          isRightBtnEnable = {true}
          rightButtonAction = {async () => nextButtonAction()}>
        </BottomComponent>
      </View>

      {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
        <AlertComponent
          header = {'Alert'}
          message={popUpMessage}
          isLeftBtnEnable = {false}
          isRightBtnEnable = {true}
          rightBtnTilte = {'OK'}
          popUpRightBtnAction = {() => popOkBtnAction()}
          popUpLeftBtnAction = {() => popCancelBtnAction()}
        />
      </View> : null}

    </View>
  );
};

export default FindSensorComponent;

const styles = StyleSheet.create({

    mainViewStyle :{
      flex:1,
      alignItems:'center',
    },

    topViewStyle : {
      width:wp('100%'),
      height:hp('8%'),
      justifyContent:'center',
    },

    sensorImgStyels : {
      width: hp("10%"),
      aspectRatio:1,
      resizeMode: "contain",
    },

    txtStyle : {
      color: 'black',
      fontSize: fonts.fontMedium,
      ...CommonStyles.textStyleRegular,
      marginLeft:wp('8%'),
      margin:wp('1%'),
    },

    txtStyle1 : {
      color: 'black',
      fontSize: fonts.fontMedium,
      ...CommonStyles.textStyleBold,        
    },

});