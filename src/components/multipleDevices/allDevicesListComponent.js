import React, { useState, useEffect } from 'react';
import * as Constant from "../../utils/constants/constant";
import AllDevicesUI from './allDevicesListUI';
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import perf from '@react-native-firebase/perf';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as AppPetsData from '../../utils/appDataModels/appPetsModel.js';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";

let trace_inAllDevicesScreen;

const AllDevicesListComponent = ({navigation, route, ...props }) => {

    const [petObj, set_petObj] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [devices, set_devices] = useState(undefined);
    const [isListView, set_isListView] = useState(false);
    const [petItemObj, set_petItemObj] = useState(undefined);
    const [optionsArray, set_optionsArray] = useState([]);
    const [showSearch, set_showSearch] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [reasonsArray, set_reasonsArray] = useState([{reasonId:1, reasonName:'Defective', reasonSubName:'For charging or hardware issue'},
    {reasonId:2, reasonName:'Damaged', reasonSubName:'Due to breakage or water immersion'},
    {reasonId:3, reasonName:'Upgraded', reasonSubName:'For sensor version upgrades'}])

    React.useEffect(() => {

        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_All_Devices_Set);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_All_Devices_Set, "User in All Devices Screen", '');
        return () => {
          initialSessionStop();
        };
    }, []);

     useEffect(() => {
       // prepareDevices();
        getDashBoardPets();
        getReplaceReasonsAPI();
    }, []);

    const initialSessionStart = async () => {
        trace_inAllDevicesScreen = await perf().startTrace('t_inAllDevicesScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inAllDevicesScreen.stop();
    };

    const getDashBoardPets = async () => {

        set_isLoading(true);
        let clientID = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let apiMethod = apiMethodManager.GET_PETPARENT_PETS + clientID;
        let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA);
        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
        
            if(apiService.data.petDevices.length > 0){
                prepareDevices(apiService.data.petDevices);
            }
 
        } else if(apiService && apiService.isInternet === false) {

            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
            return;

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,'OK', false,true);
            
        } else {

            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,'OK', false,true);

        }
    
      };

    const prepareDevices = async (petsArray) => {

        let userRoleDetails = UserDetailsModel.userDetailsData.userRole;
    
        if(userRoleDetails && (userRoleDetails.RoleName === "Hill's Vet Technician" || userRoleDetails.RoleName === "External Vet Technician")) {
          set_showSearch(true)
        } else {
          set_showSearch(false);
        }

        let allPets = petsArray;
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
                            firmware : allPets[i].devices[k].firmware,
                            firmwareNew : allPets[i].devices[k].firmwareNew,
                            studyId : allPets[i].studyId
                        }
                        tempArray.push(tempObj);
                    }
                }
            }
        }
        if(tempArray.length > 0) {
            set_devices(tempArray.sort( (a, b) => (a.petName.toUpperCase() > b.petName.toUpperCase()) ? 1 : -1));
        }
        set_isLoading(false);
        
    };

    const prepareReasons = (rData) => {

        let tempReasons = rData;
        if(tempReasons && tempReasons.length > 0) {
          for (let reason = 0; reason < tempReasons.length; reason++) {
  
            if(tempReasons[reason].reasonId === 1) {
                tempReasons[reason].reasonSubName = 'For charging or hardware issue'
            } else if(tempReasons[reason].reasonId === 2) {
                tempReasons[reason].reasonSubName = 'Due to breakage or water immersion'
            } else if(tempReasons[reason].reasonId === 3) {
                tempReasons[reason].reasonSubName = 'For sensor version upgrades'
            } else {
                tempReasons[reason].reasonSubName = ''
            }
  
          }
  
        }
  
        set_reasonsArray(tempReasons)
  
      };
  
      const getReplaceReasonsAPI = async () => {

        let apiMethod = apiMethodManager.GET_REASONS_REPLACE;
        let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA);
        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
        
            if(apiService.data.reasons) {
                prepareReasons(apiService.data.reasons);
            }
            
        } else if(apiService && apiService.isInternet === false) {

            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
            return;

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,'OK', false,true);
            
        } else {

            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,'OK', false,true);

        }
    
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

        if((item && parseInt(item.studyId) === 2901) || (item && parseInt(item.studyId) === 0)) {
            let remainingItems = tempOptions.filter((item) => {return item.id !== Constant.SENSOR_REPLACE});
            tempOptions = remainingItems;
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

        let petsArray = AppPetsData.petsData.totalPets;
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
            isFirmwareReq : petItemObj.isFirmwareVersionUpdateRequired,
            firmware : petItemObj.firmware,
            firmwareNew : petItemObj.firmwareNew,
        }

        let firmwareCheck = false;

        if(petItemObj.firmware && petItemObj.firmware !== '' && petItemObj.firmwareNew && petItemObj.firmwareNew !== '') {
            if(parseFloat(petItemObj.firmware) < parseFloat(petItemObj.firmwareNew)) {
                firmwareCheck = true;
            }

        }

        await DataStorageLocal.saveDataToAsync(Constant.CONFIG_SENSOR_OBJ, JSON.stringify(devObj));
        let replacePetObj = await petsArray.filter(item => item.petID === devObj.petID);

        if(replacePetObj && replacePetObj.length > 0) {
            await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(replacePetObj[0]));
        } else {
            let defaultPet = AppPetsData.petsData.defaultPet;
            await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(defaultPet));
        }
        if(item.id === Constant.SENSOR_REPLACE) {
            navigation.navigate('ReplaceSensorComponent',{reasonsArray : reasonsArray});
        } else {

            if(petItemObj.deviceModel === 'AGL2' || petItemObj.deviceModel === 'CMAS') {

                if(!petItemObj.isFirmwareVersionUpdateRequired && item.id === Constant.SENSOR_FIRMWARE) {
                    
                    set_isPopUp(true);
                    return;
                } else if(petItemObj.isFirmwareVersionUpdateRequired && item.id === Constant.SENSOR_FIRMWARE) {
                    if(!firmwareCheck) {
                        set_isPopUp(true);
                        return;
                    }
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
            showSearch = {showSearch}
            isLoading = {isLoading}
            navigateToPrevious = {navigateToPrevious}
            popOkBtnAction = {popOkBtnAction}
            itemAction = {itemAction}
            actionOnOptiontype = {actionOnOptiontype}
        />
    );

  }
  
  export default AllDevicesListComponent;