import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export async function clearBiosmetricsData () {
    
    rnBiometrics.deleteKeys().then((resultObject) => {
        const { keysDeleted } = resultObject
    })
};

export async function keyExists () {

    let keyexists = await rnBiometrics.biometricKeysExist().then((resultObject) => {
        const { keysExist } = resultObject
        if (keysExist) {
            return true
        } else {
            return true
        }
    })

    return keyexists;
};

export async function createKeys () {

    let keyexists = await rnBiometrics.biometricKeysExist().then((resultObject) => {
        const { keysExist } = resultObject
        if (keysExist) {
            return true
        } else {
          rnBiometrics.createKeys().then((resultObject) => {
            const { publicKey } = resultObject
            sendPublicKeyToServer(publicKey)
          })
        }
    })

    return keyexists;
};

export async function biosmetricsStatus () {
    
    let status = await rnBiometrics.isSensorAvailable().then((resultObject) => {
        const { available, biometryType } = resultObject
        if (available && biometryType === BiometryTypes.TouchID) {
            return {status: available, type:BiometryTypes.TouchID};
        } else if (available && biometryType === BiometryTypes.FaceID) {
            return {status: available, type:BiometryTypes.FaceID};
        } else if (available && biometryType === BiometryTypes.Biometrics) {
            return {status: available, type:BiometryTypes.Biometrics};
        } 

        return null;

    })

    return status;
};