import React, { useState, useEffect } from 'react';
import { View, BackHandler } from 'react-native';
import PetParentProfileUi from "./petParentProfileUI"
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";

let trace_inPetParentProfileScreen;

const PetParentProfileComponent = ({ navigation, route, ...props }) => {

    const [isFrom, set_isFrom] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    React.useEffect(() => {
        
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_register_parent_profile_account);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_register_parent_profile_account, "User in Registering account Pet Parent name Screen", '');
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

    useEffect(() => {
        if (route.params?.isFrom) {
            set_isFrom(route.params?.isFrom);
        }
    }, [route.params?.isFrom]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetParentProfileScreen = await perf().startTrace('t_inPetParentProfileScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetParentProfileScreen.stop();
    };

    const navigateToPrevious = async () => {
        if (isFrom === 'welcomeScreen') {
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_register_parent_profile_account, "User clicked on back button to navigate to WelcomeComponent ", '');
            navigation.navigate('WelcomeComponent');
        } else {

            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_register_parent_profile_account, "User clicked on back button to navigate to LoginComponent ", '');
            let userEmail = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN);
            let userPsd = await DataStorageLocal.getDataFromAsync(Constant.USER_PSD_LOGIN);
            const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
            
            rnBiometrics.biometricKeysExist().then((resultObject) => {
                const { keysExist } = resultObject
                if (keysExist && userEmail && userPsd && userPsd !== 'undefined') {
                navigation.navigate('LoginComponent',{"isAuthEnabled" : true});                  
                } else {
                navigation.navigate('LoginComponent',{"isAuthEnabled" : false});
                }
            })
        }
    }

    const submitAction = (fName, sName) => {
        firebaseHelper.logEvent(firebaseHelper.event_registration_account_Profile_action, firebaseHelper.screen_register_parent_profile_account, "User entered the name and navigated to Register Account Screen", '');
        navigation.navigate('RegisterAccountComponent', { firstName: fName, secondName: sName });
    }

    return (
        <PetParentProfileUi
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
        />
    );

}

export default PetParentProfileComponent;