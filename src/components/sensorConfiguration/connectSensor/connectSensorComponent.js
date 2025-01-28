import React, { useState, useEffect, useRef, useReducer } from 'react';
import {Platform,Linking,BackHandler} from 'react-native';
import ConnectSensorUI from './connectSensorUI';
import { useNavigation } from "@react-navigation/native";
import SensorHandler from '../sensorHandler/sensorHandler';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as bleUUID from "./../../../utils/bleManager/blemanager";
import * as CheckPermissionsIOS from './../../../utils/permissionsComponents/permissionsiOS';
import Highlighter from "react-native-highlight-words";
import * as CheckPermissionsAndroid from './../../../utils/permissionsComponents/permissionsAndroid';
import BleManager from "react-native-ble-manager";

let trace_inConnectSensorscreen;

const  ConnectSensorComponent = ({ route, ...props }) => {

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupRBtnTitle, set_popupRBtnTitle] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [btnTitle, set_btnTitle] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isFirstTime, set_isFirstTime] = useState(false);
    const [deviceNumber, set_deviceNumber] = useState(undefined);

    let sensorType = useRef(undefined);
    let deviceModal = useRef(undefined);
    let sensorNumber = useRef(undefined);
    let isLoadingdRef = useRef(0);
    let pheriId = useRef(undefined);
    let deviceNumberNew = useRef(undefined);
    let defaultPetObj = useRef(undefined);
    let statusType = useRef(undefined);
    let isFirmwareVersionUpdateRequired = useRef(false);
    let retryCount = useRef(0);
    let actionType = useRef(0);

    const navigation = useNavigation();

    useEffect(() => {   
        
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            getDefaultPet();
            firebaseHelper.reportScreen(firebaseHelper.screen_connect_sensor);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_connect_sensor, "User in Connect Sensor Screen", ''); 
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
  
    },[]);
  
    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inConnectSensorscreen = await perf().startTrace('t_inConnectSensorScreen');
    };
  
    const initialSessionStop = async () => {
        await trace_inConnectSensorscreen.stop();
    };

    const getDefaultPet = async () => {
        
        set_isLoading(true);
        isLoadingdRef.current = 1;

        let configObj = await DataStorageLocal.getDataFromAsync(Constant.CONFIG_SENSOR_OBJ);
        configObj = JSON.parse(configObj);
        if(configObj && configObj.isReplaceSensor === 1 && (configObj.isForceSync === 0 || configObj.isForceSync === 2)) {

            sensorType.current = configObj.configDeviceModel === 'HPN1' ? 'HPN1Sensor' : 'Sensor';
            sensorNumber.current = configObj.configDeviceNo;
            set_deviceNumber(configObj.configDeviceNo);
            deviceModal.current = configObj.configDeviceModel;
            statusType.current = false;
            actionType.current = configObj.actionType;

        } 
        else if(configObj.isForceSync === 1) {

            sensorType.current = configObj.syncDeviceModel === 'HPN1' ? 'HPN1Sensor' : 'Sensor';
            sensorNumber.current = configObj.syncDeviceNo;
            set_deviceNumber(configObj.syncDeviceNo);
            deviceModal.current = configObj.syncDeviceModel;
            statusType.current = false;
            actionType.current = configObj.actionType;

        } 
        else {

            sensorType.current = configObj.configDeviceModel === 'HPN1' ? 'HPN1Sensor' : 'Sensor';
            sensorNumber.current = configObj.configDeviceNo;
            set_deviceNumber(configObj.configDeviceNo);
            deviceModal.current = configObj.configDeviceModel;
            statusType.current = configObj.isDeviceSetupDone;
            actionType.current = configObj.actionType;
            isFirmwareVersionUpdateRequired.current = configObj.isFirmwareReq;

        }
        
        await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,sensorType.current);
        firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_connect_sensor, "Connection with Sensor - No of Attemts : "+retryCount.current+1, 'Device Number : '+sensorNumber.current);
        firebaseHelper.logEvent(firebaseHelper.event_Sensor_type, firebaseHelper.screen_connect_sensor, "Device Number : "+sensorNumber.current, 'Device Type : '+deviceModal.current);
        SensorHandler.getInstance();
        await SensorHandler.getInstance().getSensorType();
        await SensorHandler.getInstance().clearPeriID();
        if(Platform.OS==='ios'){
            setTimeout(() => {  
                SensorHandler.getInstance().startScan(sensorNumber.current,handleSensorCallback); 
            }, 1000)
        } else {
            SensorHandler.getInstance().startScan(sensorNumber.current,handleSensorCallback); 
        }

    };

    const handleSensorCallback = async ({ data, error }) => {

        if(error) {
            firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_connect_sensor, "Connection with Sensor Fail", 'Nearby Ble Devices : '+error);
        }
        if(data && data.status === 200){

            firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_connect_sensor, "Connection with Sensor sucess", 'Device Number : '+sensorNumber.current);

            if(actionType.current === Constant.SENSOR_CHANGE_WIFI || actionType.current === Constant.SENSOR_ADD_WIFI) {

                // if(!statusType.current && (deviceModal.current === 'CMAS' || deviceModal.current === 'AGL2')){
                    
                //     set_isFirstTime(true);
                //     setTimeout(() => {  
                //         set_isLoading(false);
                //         set_isFirstTime(true);
                //         isLoadingdRef.current = 0;
                //         navigation.navigate('SensorWiFiListComponent',{periId:pheriId.current,defaultPetObj:defaultPetObj.current,isFromScreen:'connectSensor',devNumber:sensorNumber.current});
                //     }, 3000);

                // } else {
                //     set_isLoading(false);
                //     set_isFirstTime(false);
                //     isLoadingdRef.current = 0;
                //     navigation.navigate('SensorWiFiListComponent',{periId:data.peripheralId,isFromScreen:'connectSensor'});
                // }

                if(!statusType.current && (deviceModal.current === 'CMAS' || deviceModal.current === 'AGL2')){
                    set_isFirstTime(true);
                    pheriId.current = data.peripheralId;
                    const writeVal = [3];
                    writeData(writeVal);
                } else {
                    set_isLoading(false);
                    set_isFirstTime(false);
                    isLoadingdRef.current = 0;
                    navigation.navigate('SensorWiFiListComponent',{periId:data.peripheralId,isFromScreen:'connectSensor'});
                }

            } else if(actionType.current === Constant.SENSOR_FSYNC) {
                navigation.navigate('SensorCommandComponent',{commandType:'Force Sync',naviType:'ForceSync', deviceType:sensorType.current});
            } else if(actionType.current === Constant.SENSOR_ERASE) {
                navigation.navigate('SensorCommandComponent',{commandType:'Erase Data',naviType:'EraseData'});
            } else if(actionType.current === Constant.SENSOR_FIRMWARE) {
                navigation.navigate('SensorFirmwareComponent',{commandType:'SensorFirmware',naviType:'SensorFirmware'});
            } else if(actionType.current === Constant.SENSOR_RESTORE) {
                navigation.navigate('SensorCommandComponent',{commandType:'Restore',navType:'Restore'});
            } else if(actionType.current === Constant.SENSOR_WIFI_LIST) {
                navigation.navigate('WifiListHPN1Component');
            } else if(actionType.current === Constant.SENSOR_FIRMWARE) {
                navigation.navigate('ConnectSensorCommonComponent',{commandType:'Firmware',navType:'SensorFirmware'});
            } else if(actionType.current === Constant.SENSOR_REPLACE) {

                let configObj = await DataStorageLocal.getDataFromAsync(Constant.CONFIG_SENSOR_OBJ);
                configObj = JSON.parse(configObj);
                if(configObj.isForceSync === 1) {
                    navigation.navigate('SensorCommandComponent',{commandType:'Force Sync',naviType:'ForceSync', deviceType:sensorType.current});
                } else {

                    if(!statusType.current && (deviceModal.current === 'CMAS' || deviceModal.current === 'AGL2')){
                        set_isFirstTime(true);
                        setTimeout(() => {  
                            isLoadingdRef.current = 0; 
                            set_isLoading(false);
                            navigation.navigate('SensorWiFiListComponent',{periId:data.peripheralId,defaultPetObj:defaultPetObj.current,isFromScreen:'connectSensor',devNumber:sensorNumber.current});
                        }, 3000);
                    } else {
                        set_isLoading(false);
                        set_isFirstTime(false);
                        isLoadingdRef.current = 0;
                        navigation.navigate('SensorWiFiListComponent',{periId:data.peripheralId,isFromScreen:'connectSensor'});
                    }
                        
                    // if(!statusType.current && (deviceModal.current === 'CMAS' || deviceModal.current === 'AGL2')){
                    //     set_isFirstTime(true);
                    //     pheriId.current = data.peripheralId;
                    //     const writeVal = [3];
                    //     writeData(writeVal);
                    // } else {
                    //     set_isLoading(false);
                    //     set_isFirstTime(false);
                    //     isLoadingdRef.current = 0;
                    //     navigation.navigate('SensorWiFiListComponent',{periId:data.peripheralId,isFromScreen:'connectSensor'});
                    // }
                }
                
            }

        } else {
            set_isFirstTime(false);
            retryConnecting();
        }
    };

    const retryConnecting = () => {

        set_isLoading(false);
        isLoadingdRef.current = 0;

        if (retryCount.current === 0){
            retryCount.current = retryCount.current + 1;
            set_popupRBtnTitle('OK');
            if(sensorType.current && sensorType.current.includes('HPN1')){
                set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_HPN1);
            } else {
                set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE);
            }
                
        } else if (retryCount.current === 1){
            retryCount.current = retryCount.current + 1;
            set_popupRBtnTitle('OK');
            set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_2);
        } else if (retryCount.current === 2){
            retryCount.current = 0;
            set_popupRBtnTitle('EMAIL');
            set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_3);              
        } else {
            set_popUpMessage('Unable to Connect Please try again');
        }
            
        set_popUpTitle('Alert');
        set_isPopUp(true);         
        set_btnTitle('SEARCH AGAIN...');

    };

    const writeData = async (command) => {

        await SensorHandler.getInstance().stopScanProcess(false);
        await SensorHandler.getInstance().dissconnectSensor(); 

        SensorHandler.getInstance().writeDataToSensor(bleUUID.COMM_SERVICE,bleUUID.COMMAND_CHAR,command,({ data, error }) => {

            if (data) {  
                
                setTimeout(() => {  
                    set_isLoading(false);
                    isLoadingdRef.current = 0;  
                    navigation.navigate('SensorWiFiListComponent',{periId:pheriId.current,defaultPetObj:defaultPetObj.current,isFromScreen:'connectSensor',devNumber:sensorNumber.current});
                }, 3000)
                
            } else if (error) {
                set_isLoading(false);
                isLoadingdRef.current = 0;
                retryCount.current = 0;
                set_isFirstTime(false);
                retryConnecting();        
            }
          }
        );
    };

    const nextBtnAction = async (value) => {

        if(Platform.OS === 'android') {

            let androidPer = await CheckPermissionsAndroid.checkBLEPermissions();
            if(androidPer) {

                BleManager.enableBluetooth().then(() => {
                    set_btnTitle(undefined);
                    getDefaultPet();
                }).catch((error) => {
                    let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
                    searchWords={[Constant.BLE_PERMISSIONS_ENABLED_HIGH]}
                    textToHighlight={
                        Constant.BLE_PERMISSIONS_ENABLED
                    }/>
                    set_popUpMessage(high);
                    set_isPopUp(true);
                });

            } else {
              
                let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
                searchWords={[Constant.BLE_PERMISSIONS_ENABLED_HIGH]}
                textToHighlight={
                    Constant.BLE_PERMISSIONS_ENABLED
                }/>
                set_popUpMessage(high);
                set_isPopUp(true);

            }
    
          } else {
    
            let permissions = await CheckPermissionsIOS.checkBlePermissions();
            if(permissions) {
                set_btnTitle(undefined);
                getDefaultPet();
            } else {
              
                let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
                searchWords={[Constant.BLE_PERMISSIONS_ENABLED_HIGH]}
                textToHighlight={
                    Constant.BLE_PERMISSIONS_ENABLED
                }/>
                set_popUpMessage(high);
                set_isPopUp(true);
                
            }
    
          }
        
    }

    const navigateToPrevious = () => {   

        if(isLoadingdRef.current === 0){
            SensorHandler.getInstance().dissconnectSensor();     
            // navigation.navigate("FindSensorComponent"); 
            navigation.pop(); 
        }
           
    }

    const popOkBtnAction = (value,) => {

        if(popUpMessage === Constant.SENSOR_RETRY_MESSAGE_3){
            retryCount.current = 0;
            mailToHPN();
        }
        set_isPopUp(value);
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);
    };

    const mailToHPN = () => {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_mail, firebaseHelper.screen_connect_sensor, "Connection with Sensor Fail", 'Device Number : '+sensorNumber.current);
        Linking.openURL("mailto:support@wearablesclinicaltrials.com?subject=Support Request&body='");
    };

    return (
        <ConnectSensorUI 
            isPopUp = {isPopUp}
            popUpMessage = {popUpMessage}
            popUpTitle = {popUpTitle}
            popupRBtnTitle = {popupRBtnTitle}
            isLoading = {isLoading}
            btnTitle = {btnTitle}
            isFirstTime = {isFirstTime}
            sensorNumber = {sensorNumber.current}
            deviceNumber = {deviceNumber}
            popOkBtnAction = {popOkBtnAction}
            nextBtnAction = {nextBtnAction}
            navigateToPrevious = {navigateToPrevious}
        />
    );

  }
  
  export default ConnectSensorComponent;