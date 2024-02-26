import React, { useState, useEffect } from 'react';
import * as Constant from "../../utils/constants/constant";
import AllDevicesUI from './allDevicesListUI';
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import perf from '@react-native-firebase/perf';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';

let trace_inAllDevicesScreen;

const AllDevicesListComponent = ({navigation, route, ...props }) => {

    const [petObj, set_petObj] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [devices, set_devices] = useState(undefined);
    const [isListView, set_isListView] = useState(false);
    const [petItemObj, set_petItemObj] = useState(undefined);
    const [optionsArray, set_optionsArray] = useState([]);

    React.useEffect(() => {

        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_All_Devices_Set);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_All_Devices_Set, "User in All Devices Screen", '');
        return () => {
          initialSessionStop();
        };
    }, []);

     useEffect(() => {
        prepareDevices();
    }, []);

    const initialSessionStart = async () => {
        trace_inAllDevicesScreen = await perf().startTrace('t_inAllDevicesScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inAllDevicesScreen.stop();
    };

    const prepareDevices = async () => {

        let allPets = await DataStorageLocal.getDataFromAsync(Constant.ALL_PETS_ARRAY);
        allPets = JSON.parse(allPets)
        let tempArray = [];

        if(allPets) {
            for (let i = 0; i < allPets.length; i++) {
                if(allPets[i].devices && allPets[i].devices.length > 0) {
                    for (let k = 0; k < allPets[i].devices.length; k++) {
                        let tempObj = {
                            petName : allPets[i].petName,
                            petpetID : allPets[i].petID,
                            photoUrl : allPets[i].photoUrl,
                            battery : allPets[i].devices[k].battery,
                            deviceModel : allPets[i].devices[k].deviceModel,
                            deviceNumber : allPets[i].devices[k].deviceNumber,
                            isDeviceSetupDone : allPets[i].devices[k].isDeviceSetupDone,
                            lastSync : allPets[i].devices[k].lastSeen,
                            isFirmwareVersionUpdateRequired : allPets[i].devices[k].isFirmwareVersionUpdateRequired,
                        }
                        tempArray.push(tempObj);
                    }
                }
            }
        }
        set_devices(tempArray);
    };

    const navigateToPrevious = () => {  
        navigation.pop();
    };

    const popOkBtnAction = () => {
        set_isPopUp(false);
    };

    const itemAction = async (item,index) => {
        
        let tempOptions = optionsArray;

        if(item.isDeviceSetupDone) {

            if(item.deviceModel.includes('HPN')){
                tempOptions = [
                    {'id':Constant.SENSOR_CHANGE_WIFI, 'name':'Add Wi-Fi Network'},
                    {'id':Constant.SENSOR_WIFI_LIST, 'name':'WiFi List'},
                    {'id':Constant.SENSOR_FSYNC, 'name':'Force Sync'},
                    {'id':Constant.SENSOR_REPLACE, 'name':'Replace Sensor'},
                    {'id':Constant.DROPDOWN_CANCEL, 'name':'Cancel'}
                ]
            } else {

                tempOptions = [
                    {'id':Constant.SENSOR_CHANGE_WIFI, 'name':'Change Wi-Fi Network'},
                    {'id':Constant.SENSOR_FSYNC, 'name':'Force Sync'},
                    {'id':Constant.SENSOR_FIRMWARE, 'name':'Firmware'},
                    {'id':Constant.SENSOR_ERASE, 'name':'Erase Data'},
                    {'id':Constant.SENSOR_RESTORE, 'name':'Restore Factory Settings'},
                    {'id':Constant.SENSOR_REPLACE, 'name':'Replace Sensor'},
                    {'id':Constant.DROPDOWN_CANCEL, 'name':'Cancel'},
                ]
            }
        } else {

            tempOptions = [
                {'id':Constant.SENSOR_ADD_WIFI, 'name':'Add Wi-Fi Network'},
                {'id':Constant.SENSOR_REPLACE, 'name':'Replace Sensor'},
                {'id':Constant.DROPDOWN_CANCEL, 'name':'Cancel'},
            ]
            
        }
        set_optionsArray(tempOptions)
        set_isListView(!isListView);   
        set_petItemObj(item);    
    };

    const actionOnOptiontype = async (item) => {

        set_isListView(!isListView); 

        if(item.id === 9) {
            return;
        }

        let petsArray = await DataStorageLocal.getDataFromAsync(Constant.ALL_PETS_ARRAY);
        petsArray = JSON.parse(petsArray);
        let configurePet;
        for (let i = 0; i < petsArray.length; i++) {

            configurePet = await petsArray[i].devices.filter(item => item.deviceNumber === petItemObj.deviceNumber);
            if(configurePet && configurePet.length > 0) {
                configurePet = petsArray[i]
                break;
            }

        }

        let devObj = {
            pObj : configurePet, 
            petItemObj : petItemObj,
            actionType :item.id,
            isReplaceSensor : item.id === Constant.SENSOR_REPLACE ? 1 : 0,
            isForceSync : 0,
            syncDeviceNo : '',
            syncDeviceModel : '',
            configDeviceNo: petItemObj.deviceNumber,
            configDeviceModel : petItemObj.deviceModel,
            reasonId : '',
            petName : petItemObj.petName,
            deviceNo : petItemObj.deviceNumber,
            isDeviceSetupDone : petItemObj.isDeviceSetupDone,
            petID:configurePet.petID,
            isFirmwareReq : petItemObj.isFirmwareVersionUpdateRequired
        }

        await DataStorageLocal.saveDataToAsync(Constant.CONFIG_SENSOR_OBJ, JSON.stringify(devObj));

        if(item.id === Constant.SENSOR_REPLACE) {
            navigation.navigate('ReplaceSensorComponent');
        } else {

            if(petItemObj.deviceModel === 'AGL2' || petItemObj.deviceModel === 'CMAS') {

                if(!petItemObj.isFirmwareVersionUpdateRequired && item.id === Constant.SENSOR_FIRMWARE) {
                    set_isPopUp(true);
                    return;
                } 

            } 
            navigation.navigate('SensorInitialComponent');
        }

    };

    return (
      
        <AllDevicesUI 
            petObj = {petObj}
            isPopUp = {isPopUp}
            devices = {devices}
            isListView = {isListView}
            optionsArray = {optionsArray}
            navigateToPrevious = {navigateToPrevious}
            popOkBtnAction = {popOkBtnAction}
            itemAction = {itemAction}
            actionOnOptiontype = {actionOnOptiontype}
        />
    );

  }
  
  export default AllDevicesListComponent;