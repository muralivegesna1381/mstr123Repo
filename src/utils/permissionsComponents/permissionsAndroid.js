import { BluetoothStatus } from "react-native-bluetooth-status";
import { PERMISSIONS, check, request } from 'react-native-permissions'
import { PermissionsAndroid,Platform } from 'react-native';
import RNAndroidLocationEnabler from "react-native-android-location-enabler";

export async function checkCameraPermissions () {
    
    try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "App Camera Permission",
            message:"App needs access to your camera ",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return 'Camera granted'
        } else {
          return 'Camera not granted'
        }
      } catch (err) {}
};

export async function checkMediaPermissions(){

  if(Platform.Version >=33){
    try {
      
      const granted = await PermissionsAndroid.request(
        "android.permission.READ_MEDIA_VIDEO",
        {
          title: "App Gallery Permission",
          message:"App needs access to your gallery ",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {

        return 'Gallery granted'    
      } else {
        return 'Gallery not granted'
      }
    } catch (err) {}
    
  }
  else{
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "App Gallery Permission",
          message:"App needs access to your gallery ",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {

        return 'Gallery granted'    
      } else {
        return 'Gallery not granted'
      }
    } catch (err) {}

  }


};

export async function checkBLEPermissions () {

  if(Platform.Version >= 31){

    const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
    await PermissionsAndroid.requestMultiple([ PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]);
    
    const bleScan = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
    if(bleScan === PermissionsAndroid.RESULTS.GRANTED) {
      return true
    }
    return false;

  }else if (Platform.Version >= 29) {

      const bleScan = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (bleScan === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false
      }

      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000,fastInterval: 5000,}).then((data) => {
      }).catch((err) => {});
    }
    else if(Platform.Version >= 23) {

      const bleScan = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
      if (bleScan === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false
      }

      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000,})
        .then((data) => {})
        .catch((err) => {});
    }
    
  
};