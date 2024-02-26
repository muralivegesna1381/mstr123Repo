import React, { useState, useEffect } from 'react';
import {BackHandler} from 'react-native';
import ManualNetworkUI from './manualNetworkUI';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as PermissionsiOS from './../../../utils/permissionsComponents/permissionsiOS';
import * as CheckPermissionsAndroid from './../../../utils/permissionsComponents/permissionsAndroid';
import BleManager from "react-native-ble-manager";
import Highlighter from "react-native-highlight-words";
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";

let trace_inSensorManualNetworkscreen;

const  ManualNetworkComponent = ({navigation, route, ...props }) => {

    // const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [deviceType, set_deviceType] = useState('');
    const [date, set_Date] = useState(new Date());
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    
    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        getInitialData();
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_sensor_add_manually);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_sensor_add_manually, "User in Sensor Add Manual Screen", ''); 
        });
    
        const unsubscribe = navigation.addListener('blur', () => {
              initialSessionStop();
        });

        return () => {
            initialSessionStop();
            focus();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    // useEffect(() => { 

    //     if(route.params?.defaultPetObj){
    //         set_defaultPetObj(route.params?.defaultPetObj)
    //     }

    //     if(route.params?.deviceType){
    //         set_deviceType(route.params?.deviceType);
    //     }

    // }, [route.params?.defaultPetObj,route.params?.deviceType]);
  
    const initialSessionStart = async () => {
        trace_inSensorManualNetworkscreen = await perf().startTrace('t_inSensorManualNetworkScreen');
    };
  
    const initialSessionStop = async () => {
        await trace_inSensorManualNetworkscreen.stop();
    };

    const getInitialData = async () => {
        let configObj = await DataStorageLocal.getDataFromAsync(Constant.CONFIG_SENSOR_OBJ);
        configObj = JSON.parse(configObj);
        if(configObj){
            set_deviceType(configObj.configDeviceModel);
        }
    }

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const navigateToPrevious = () => {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_back_btn_action, firebaseHelper.screen_sensor_add_manually, "User clicked on back button to navigate to Sensor WiFi list", '');
        navigation.navigate('SensorWiFiListComponent');
    }

    const submitAction = async (id,psd) => {

        if(Platform.OS === 'ios') {
            let permissions = await PermissionsiOS.checkBlePermissions();
            if(!permissions) {
                showBleFailed(Constant.BLE_PERMISSIONS_ENABLED_HIGH,Constant.BLE_PERMISSIONS_ENABLED);
                return;
            } else {
                firebaseHelper.logEvent(firebaseHelper.event_sensor_submit_btn_action, firebaseHelper.screen_sensor_add_manually, "User clicked on Submit Button action : ", 'WiFi SSID : '+id);
                // navigation.navigate('WriteDetailsToSensorComponent',{wifiName:id,wifiPsd:psd,defaultPetObj:defaultPetObj,isFromScreen:'manual'})
                navigation.navigate('WriteDetailsToSensorComponent',{wifiName:id,wifiPsd:psd,isFromScreen:'manual'});
            }
        }  else {
    
            let permissions = await CheckPermissionsAndroid.checkBLEPermissions();
            if(!permissions) {
                showBleFailed(Constant.BLE_PERMISSIONS_ENABLED_HIGH_ANDROID,Constant.BLE_PERMISSIONS_ENABLED_ANDROID);
                return;
            } else {
                BleManager.enableBluetooth().then(() => {
                    firebaseHelper.logEvent(firebaseHelper.event_sensor_submit_btn_action, firebaseHelper.screen_sensor_add_manually, "User clicked on Submit Button action : ", 'WiFi SSID : '+id);
                    // navigation.navigate('WriteDetailsToSensorComponent',{wifiName:id,wifiPsd:psd,defaultPetObj:defaultPetObj,isFromScreen:'manual'})
                    navigation.navigate('WriteDetailsToSensorComponent',{wifiName:id,wifiPsd:psd,isFromScreen:'manual'});
                }).catch((error) => {
                    showBleFailed(Constant.BLE_PERMISSIONS_ENABLED_HIGH_ANDROID,Constant.BLE_PERMISSIONS_ENABLED_ANDROID);
                    return;
                });
            }
            
        }
        
    };

    const showBleFailed = async (hMsg,msg) => {

        let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
        searchWords={[hMsg]}
        textToHighlight={
          msg
        }/>
        set_popUpMessage(high);
        set_isPopUp(true);
  
    };

    const popOkBtnAction = () => {
        set_isPopUp(false);
        set_popUpMessage('');
    };

    return (
        <ManualNetworkUI 
            deviceType={deviceType}
            popUpMessage = {popUpMessage}
            isPopUp = {isPopUp}
            popOkBtnAction = {popOkBtnAction}
            submitAction = {submitAction}
            navigateToPrevious = {navigateToPrevious}
        />
    );

  }
  
  export default ManualNetworkComponent;