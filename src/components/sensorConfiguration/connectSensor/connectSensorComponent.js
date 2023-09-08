import React, { useState, useEffect, useRef } from 'react';
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

    let sensorType = useRef(undefined);
    let sensorNumber = useRef(undefined);
    let isLoadingdRef = useRef(0);
    let pheriId = useRef(undefined);
    let sensorIndex = useRef(undefined);
    let defaultPetObj = useRef(undefined);
    let retryCount = useRef(0);
    const navigation = useNavigation();

    useEffect(() => {   
        
        getDefaultPet();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
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
        let defaultObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT,);
        defaultObj = JSON.parse(defaultObj);
        defaultPetObj.current = defaultObj

        sensorIndex.current = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);
        let devNumber = defaultObj.devices[parseInt(sensorIndex.current)].deviceNumber;
        let deviceType =  defaultObj.devices[parseInt(sensorIndex.current)].deviceModel;

        sensorType.current = deviceType;
        sensorNumber.current = devNumber;

        firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_connect_sensor, "Connection with Sensor - No of Attemts : "+retryCount.current+1, 'Device Number : '+sensorNumber.current);
        firebaseHelper.logEvent(firebaseHelper.event_Sensor_type, firebaseHelper.screen_connect_sensor, "Device Number : "+devNumber, 'Device Type : '+deviceType);

        SensorHandler.getInstance();
        await SensorHandler.getInstance().getSensorType();
        await SensorHandler.getInstance().clearPeriID();
        if(Platform.OS==='ios'){
            setTimeout(() => {  
                SensorHandler.getInstance().startScan(devNumber,handleSensorCallback); 
            }, 1000)
        } else {
            SensorHandler.getInstance().startScan(devNumber,handleSensorCallback); 
        }
    };

    const handleSensorCallback = async ({ data, error }) => {

        if(error) {
            firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_connect_sensor, "Connection with Sensor Fail", 'Nearby Ble Devices : '+error);
        }
        if(data && data.status === 200){

            firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_connect_sensor, "Connection with Sensor sucess", 'Device Number : '+sensorNumber.current);
            if(defaultPetObj.current){

                if(!defaultPetObj.current.devices[parseInt(sensorIndex.current)].isDeviceSetupDone && (defaultPetObj.current.devices[parseInt(sensorIndex.current)].deviceModel==='CMAS' || defaultPetObj.current.devices[parseInt(sensorIndex.current)].deviceModel==='AGL2')){
                    set_isFirstTime(true);
                    pheriId.current = data.peripheralId;
                    const writeVal = [3];
                    writeData(writeVal);
                } else {
                    set_isLoading(false);
                    set_isFirstTime(false);
                    isLoadingdRef.current = 0;
                    navigation.navigate('SensorWiFiListComponent',{periId:data.peripheralId,defaultPetObj:defaultPetObj.current,isFromScreen:'connectSensor',devNumber:sensorNumber.current});
                }
                
            } else {
                set_isFirstTime(false);
                retryConnecting();
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

    const writeData = (command) => {

        SensorHandler.getInstance().writeDataToSensor(bleUUID.COMM_SERVICE,bleUUID.COMMAND_CHAR,command,
          ({ data, error }) => {

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
            navigation.navigate("FindSensorComponent");  
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
            popOkBtnAction = {popOkBtnAction}
            nextBtnAction = {nextBtnAction}
            navigateToPrevious = {navigateToPrevious}
        />
    );

  }
  
  export default ConnectSensorComponent;