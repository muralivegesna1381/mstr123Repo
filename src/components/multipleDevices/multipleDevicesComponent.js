import React, { useState, useEffect } from 'react';
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import * as Constant from "./../../utils/constants/constant";
import MultipleDevicesUI from './multipleDevicesUI';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import perf from '@react-native-firebase/perf';

let trace_inMultipleDevicesScreen;

const MultipleDevicesComponent = ({navigation, route, ...props }) => {

    const [petObj, set_petObj] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [date, set_Date] = useState(new Date());
    const [isFrom, set_isFrom] = useState(undefined);

    React.useEffect(() => {

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_multipleDevices);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_multipleDevices, "User in Multiple Devices Screen", ''); 
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });
  
        return () => {
          focus();
          unsubscribe();
          initialSessionStop();
        };
    }, []);

    // Setting the default pet object to show the sensors associated with it
     useEffect(() => {

        if(route.params?.petObject){
          set_petObj(route.params?.petObject);
        }

        if(route.params?.isFrom){
            set_isFrom(route.params?.isFrom);
        }

    }, [route.params?.petObject, route.params?.isFrom]);

    const initialSessionStart = async () => {
        trace_inMultipleDevicesScreen = await perf().startTrace('t_inMultipleDevicesScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inMultipleDevicesScreen.stop();
    };

    // Navigates to previous screen
    const navigateToPrevious = () => { 
        navigation.pop();
    };

    const addButtonAction = async () => {

        let internet = await internetCheck.internetCheck();
        if(!internet){
            set_isPopUp(true);
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_add_device_btn_trigger, firebaseHelper.screen_multipleDevices, "User clicked on Add button to add New Device", '');
            navigation.navigate('SensorTypeComponent',{value:'AddDevice',petName : petObj ? petObj.petName : ''});
        }

    };

    const popOkBtnAction = () => {
        set_isPopUp(false);
    };

    const itemAction = async (item,index) => {

        if(item.deviceModel && (item.deviceModel.includes("HPN1") || item.deviceModel.includes("hpn1"))){
            await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,'HPN1Sensor');
          } else {
            await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,'Sensor');
          }
    
          firebaseHelper.logEvent(firebaseHelper.event_device_selection_trigger, firebaseHelper.screen_multipleDevices, "User selected the device to configure", 'Device Number : '+item.deviceNumber);
          await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE, ""+index);
          navigation.navigate('SensorInitialComponent',{defaultPetObj:petObj,isFromScreen:'multipleDevices'});

    }

    return (
      
        <MultipleDevicesUI 
            petObj = {petObj}
            isPopUp = {isPopUp}
            navigateToPrevious = {navigateToPrevious}
            addButtonAction = {addButtonAction}
            popOkBtnAction = {popOkBtnAction}
            itemAction = {itemAction}
        />
    );

  }
  
  export default MultipleDevicesComponent;