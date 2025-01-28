import { BluetoothStatus } from "react-native-bluetooth-status";
import { PERMISSIONS, check, request } from 'react-native-permissions'

export async function checkBlePermissions () {
    const isEnabled = await BluetoothStatus.state();
    return isEnabled;
};

export async function checkCameraPermissions () {
    const res = await check(PERMISSIONS.IOS.CAMERA);
    if(res.toUpperCase() === 'GRANTED' || res.toUpperCase() === 'UNAVAILABLE') {
        return true;
    } 
    return false;
};

export async function checkGalleryPermissions () {
    const res = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    const res1 = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);
    const res2 = await check(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
    return res;
};


