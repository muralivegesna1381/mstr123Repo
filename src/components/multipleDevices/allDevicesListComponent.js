import React, { useState, useEffect } from 'react';
import * as Constant from "../../utils/constants/constant";
import AllDevicesUI from './allDevicesListUI';
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import perf from '@react-native-firebase/perf';

let trace_inAllDevicesScreen;

const AllDevicesListComponent = ({navigation, route, ...props }) => {

    const [petObj, set_petObj] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [devices, set_devices] = useState(undefined);

    React.useEffect(() => {
        initialSessionStart();
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

    return (
      
        <AllDevicesUI 
            petObj = {petObj}
            isPopUp = {isPopUp}
            devices = {devices}
            navigateToPrevious = {navigateToPrevious}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default AllDevicesListComponent;