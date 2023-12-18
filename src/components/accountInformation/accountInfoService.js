import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler,NativeModules } from 'react-native';
import AccountInfoUi from './accountInfoUI';
import * as Queries from "./../../config/apollo/queries";
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as Constant from "./../../utils/constants/constant";
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import VersionNumber from 'react-native-version-number';
import BuildEnv from "./../../config/environment/environmentConfig";
import * as Apolloclient from './../../config/apollo/apolloConfig';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';

var PushNotification = require("react-native-push-notification");

let trace_inAccountService_Screen;
let trace_Account_API_Complete;

let POP_AUTHENTICATION = 1;
let POP_REMOVE_AUTHENTICATION = 3;
let POP_LOG_OUT = 2;
let POP_DELETE_ACCOUNT = 4;

const Environment = JSON.parse(BuildEnv.Environment());

const AccountInfoService = ({ navigation, route, ...props }) => {

  const [email, set_email] = useState(undefined);
  const [fullName, set_fullName] = useState(undefined);
  const [phoneNo, set_phoneNo] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [isPopUpLeft, set_isPopUpLeft] = useState(false);
  const [isPopUpLeftTitle, set_isPopUpLeftTitle] = useState('Cancel');
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popAlert, set_popAlert] = useState(undefined);
  const [isLoading, set_isLoading] = useState(false);
  const [popBtnName, set_popBtnName] = useState(undefined);
  const [date, set_Date] = useState(new Date());
  const [versionNumber, set_VersionNumber] = useState("");
  const [buildVersion, set_buildVersion] = useState("");
  const [enviName, set_enviName] = useState("");
  const [firstName, set_firstName] = useState('');
  const [secondName, set_secondName] = useState('');
  const [secondaryEmail, set_secondaryEmail] = useState('');
  const [isNotification, set_isNotification] = useState(false);
  const [pAddress, set_pAddress] = useState(undefined);
  const [pAddressObj, set_pAddressObj] = useState(undefined);
  const [authenticationType, set_authenticationType] = useState(undefined);
  const [enabled, set_enabled] = useState(false);
  const [popupType, set_popupType] = useState(0);
  const [bio_Enable, set_bio_Enable] = useState(false);
  const [userRole, set_userRole] = useState(undefined)

  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);

  //Fetches the Userdata from backend
  React.useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    getDetailsDeviceDetails();
    getUserRole();
    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_account_main);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_dashboard, "User in Accounts Screen", '');
      deviceAuthenticationType();
      getUserData();
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

  }, []);

  const getUserRole = async () => {
    let userRole = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_ID);
    set_userRole(userRole);
  };

  // Android physical backbutton
  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  const initialSessionStart = async () => {
    trace_inAccountService_Screen = await perf().startTrace('t_inAccountsMainScreen');
  };

  const initialSessionStop = async () => {
    await trace_inAccountService_Screen.stop();
  };

  const stopFBTrace = async () => {
    await trace_Account_API_Complete.stop();
  };

  const deviceAuthenticationType = async () => {

    const rnBiometrics = new ReactNativeBiometrics();
    rnBiometrics.isSensorAvailable().then((resultObject) => {

      const { available, biometryType } = resultObject
      let type = undefined;
      if (available && biometryType === BiometryTypes.TouchID) {
        set_authenticationType('Touch ID');
        type = 'TouchId'
      } else if (available && biometryType === BiometryTypes.FaceID) {
        set_authenticationType('Face ID');
        type = 'FaceId';
      } else if (available && biometryType === BiometryTypes.Biometrics) {
        set_authenticationType('Touch ID');
        type = 'BioMetrics';
      } else {
        set_authenticationType(undefined);
      }

      if(available) {
        set_bio_Enable(true);
        rnBiometrics.biometricKeysExist().then((resultObject) => {
          const { keysExist } = resultObject
          if (keysExist) {
            set_enabled(true);
          } else {
            set_enabled(false);
          }
        })
      } else {
        set_bio_Enable(false);
      }
    })
 
   };

  // Fetching the user data from backend by passing the clien id
  const getUserData = async () => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    firebaseHelper.logEvent(firebaseHelper.event_account_main_api, firebaseHelper.screen_account_main, "Initiated the user details Api ", 'Client ID : ' + clientIdTemp);

    let json = {
      ClientID: "" + clientIdTemp,
    };

    trace_Account_API_Complete = await perf().startTrace('t_GetClientInfo_API');
    let userDetailsServiceObj = await ServiceCalls.getClientInfo(json, token);

    set_isLoading(false);
    isLoadingdRef.current = 0;
    stopFBTrace();

    if (userDetailsServiceObj && userDetailsServiceObj.logoutData) {
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if (userDetailsServiceObj && !userDetailsServiceObj.isInternet) {
      set_popAlert(Constant.ALERT_NETWORK);
      set_popUpMessage(Constant.NETWORK_STATUS);
      set_isPopUpLeft(false);
      set_popBtnName("OK");
      set_isPopUp(true);
      set_popupType(0);
      return;
    }

    if (userDetailsServiceObj && userDetailsServiceObj.statusData) {

      if (userDetailsServiceObj.responseData) {
        savePetParent(userDetailsServiceObj.responseData);
        set_email(userDetailsServiceObj.responseData.email);
        set_fullName(userDetailsServiceObj.responseData.fullName);
        set_firstName(userDetailsServiceObj.responseData.firstName);
        set_secondName(userDetailsServiceObj.responseData.lastName);
        set_phoneNo(userDetailsServiceObj.responseData.phoneNumber);
        set_isNotification(userDetailsServiceObj.responseData.notifyToSecondaryEmail);
        set_secondaryEmail(userDetailsServiceObj.responseData.secondaryEmail);
        if(userDetailsServiceObj.responseData.address && Object.keys(userDetailsServiceObj.responseData.address).length !== 0 ) {
            set_pAddressObj(userDetailsServiceObj.responseData.address);
            let tempLine2 = userDetailsServiceObj.responseData.address.address2 && userDetailsServiceObj.responseData.address.address2 !== '' ? userDetailsServiceObj.responseData.address.address2 + ', ' : '';
            let address = userDetailsServiceObj.responseData.address.address1 + ', ' 
            + tempLine2
            + userDetailsServiceObj.responseData.address.city + ', ' 
            + userDetailsServiceObj.responseData.address.state+ ', '
            + userDetailsServiceObj.responseData.address.country+ ', '
            + userDetailsServiceObj.responseData.address.zipCode;
            set_pAddress(address);
        }
        
      }

    } else {
      firebaseHelper.logEvent(firebaseHelper.event_account_main_api_fail, firebaseHelper.screen_account_main, "Account Api Failed", 'error : Status false');
    }

    if (userDetailsServiceObj && userDetailsServiceObj.error) {
      firebaseHelper.logEvent(firebaseHelper.event_account_main_api_fail, firebaseHelper.screen_account_main, "Account Api Failed", 'error : Service error');
    }

  };

  const getDetailsDeviceDetails = () => {
    set_VersionNumber("App Version : " + VersionNumber.appVersion);
    set_buildVersion("Build Version : " + VersionNumber.buildVersion);
    set_enviName(Environment.deviceConnectUrl.substring(0, 3));
  };

  const navigateToPrevious = () => {

    if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
      navigation.pop();
    }

  };

  // Log out of the app
  const logOutAction = async (id) => {
    
    let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
    timerData = JSON.parse(timerData);

    let obsData = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
    obsData = JSON.parse(obsData);

    let questData = await DataStorageLocal.getDataFromAsync(Constant.QUEST_UPLOAD_DATA);
    questData = JSON.parse(questData);
    
    if (obsData && obsData.length > 0) {

      firebaseHelper.logEvent(firebaseHelper.event_account_logout, firebaseHelper.screen_account_main, "User tried to logout when Observation is being uploaded", 'Email : ' + email);
      set_popAlert('Sorry!');
      set_popUpMessage(Constant.UPLOAD_OBS_LOGOUT_MSG);
      set_isPopUpLeft(false);
      set_popBtnName("OK");
      set_popupType(0);

    } else if (timerData && (timerData.isTimerStarted || timerData.isTimerPaused)) {
      
      firebaseHelper.logEvent(firebaseHelper.event_account_logout, firebaseHelper.screen_account_main, "User tried to logout when timer is running", 'Email : ' + email);
      set_popAlert('Sorry!');
      set_popUpMessage(Constant.TIMER_LOGOUT_MSG);
      set_isPopUpLeft(false);
      set_popBtnName("OK");
      set_popupType(0);

    } else if(questData && questData.length > 0) {

      firebaseHelper.logEvent(firebaseHelper.event_account_logout, firebaseHelper.screen_account_main, "User tried to logout when Observation is being uploaded", 'Email : ' + email);
      set_popAlert('Sorry!');
      set_popUpMessage(Constant.UPLOAD_QUEST_LOGOUT_MSG);
      set_isPopUpLeft(false);
      set_popBtnName("OK");
      set_popupType(0);

    } else {
       //Logging out Zendesk from here
      // Calling android method from here for Zendesk logout
      if(Platform.OS === 'android') {
        NativeModules.ZendeskChatModule.logOutFromZendeskWindow("logout" ,(convertedVal) => {
             //handle callback if needed     
        });
      }
      else{
         // Calling iOS method from here for Zendesk logout
        NativeModules.ZendeskChatbot.logOutFromZendeskMessagingWindow( "logout", (value) => {
           //handle callback if needed
        });
      }
      set_popAlert('Alert');
      set_isPopUpLeft(true);
      set_isPopUpLeftTitle('CANCEL');
      set_popUpMessage(id === 100 ? Constant.LOG_OUT_MSG : Constant.DELETE_USER_MSG );
      set_popBtnName(id === 100 ? "LOG OUT" : "ACCEPT");
      set_popupType(id === 100 ? 2 : 4);
    }
    set_isPopUp(true);
    popIdRef.current = 1;
  };

  // Navigations to edit Password, user name and phone number
  const btnAction = async (value) => {

    let internet = await internetCheck.internetCheck();
    firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit", 'Internet Status : ' + internet);
    if (!internet) {
      set_popAlert(Constant.ALERT_NETWORK);
      set_popUpMessage(Constant.NETWORK_STATUS);
      set_isPopUpLeft(false);
      set_isPopUp(true);
      set_popupType(0);
      popIdRef.current = 1;

    } else {
      if (value === "Name") {

        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Name", 'Name : ' + fullName);
        navigation.navigate('UpdateNameService', { fullName: fullName, firstName: firstName, secondName: secondName, phoneNo: phoneNo, secondaryEmail : secondaryEmail, isNotification:isNotification, petParentAddress : pAddressObj});

      } else if (value === "Phone Number") {

        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Phone", 'Phone : ' + phoneNo);
        navigation.navigate('UpdatePhoneService', { fullName: fullName, firstName: firstName, secondName: secondName, phoneNo: phoneNo, secondaryEmail : secondaryEmail, isNotification:isNotification, petParentAddress : pAddressObj});

      } else if (value === "Password") {

        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Password", 'Email : ' + email);
        navigation.navigate('ChangePasswordComponent');

      } else if (value === "SecondaryEmail") {

        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Secondary Email", 'Email : ' + email);
        navigation.navigate('UpdateSecondaryEmailService', {fullName: fullName, firstName: firstName, secondName: secondName, phoneNo: phoneNo, secondaryEmail : secondaryEmail, isNotification:isNotification, petParentAddress : pAddressObj});

      } else if (value === "PetParentAddress") {

        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Address", 'Email : ' + email);
        navigation.navigate('UpdatePetParentAddressComponent', {fullName: fullName, firstName: firstName, secondName: secondName, phoneNo: phoneNo, secondaryEmail : secondaryEmail, isNotification:isNotification, petParentAddress : pAddressObj });
        
      }
    }
  };

  const savePetParent = async (pParent) => {
    await DataStorageLocal.saveDataToAsync(Constant.PET_PARENT_OBJ,JSON.stringify(pParent));
  };

  // Clears all the async saved data and logs out of the app
  const popOkBtnAction = async () => {

    const rnBiometrics = new ReactNativeBiometrics();
    set_isPopUp(false);
    popIdRef.current = 0;

    if (popupType === POP_LOG_OUT) {

      set_isLoading(true);
      rnBiometrics.biometricKeysExist().then(async (resultObject) => {
        const { keysExist } = resultObject
        
        if (keysExist) {
          // await DataStorageLocal.saveDataToAsync(Constant.IS_USER_LOGGED_OUT,JSON.stringify(true));
        } else {
          // await DataStorageLocal.saveDataToAsync(Constant.IS_USER_LOGGED_OUT,JSON.stringify(false));
          await DataStorageLocal.removeDataFromAsync(Constant.USER_EMAIL_LOGIN);
          await DataStorageLocal.removeDataFromAsync(Constant.USER_PSD_LOGIN);
          await DataStorageLocal.removeDataFromAsync(Constant.FCM_TOKEN);
        }
      })

      firebaseHelper.logEvent(firebaseHelper.event_account_logout, firebaseHelper.screen_account_main, "User logged out", 'Email : ' + email);
      Apolloclient.client.writeQuery({ query: Queries.LOG_OUT_APP, data: { data: { isLogOut: 'logOut', __typename: 'LogOutApp' } }, });
      removeUserData();
      setTimeout(async () => {  
        
        set_isLoading(false)
        // navigation.navigate('WelcomeComponent');
        let user = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN);
        let pd = await DataStorageLocal.getDataFromAsync(Constant.USER_PSD_LOGIN);
        if(user && pd && pd !== 'undefined') {
          navigation.navigate('LoginComponent',{"isAuthEnabled" : enabled}); 
        } else {
          navigation.navigate('LoginComponent',{"isAuthEnabled" : false}); 
        }
        
      },2000)

    }else if (popupType === POP_DELETE_ACCOUNT) {

      deleteUserAccount();

    } else if (popupType === POP_AUTHENTICATION) {

      popCancelBtnAction();
      set_enabled(true);
      rnBiometrics.biometricKeysExist().then((resultObject) => {
        const { keysExist } = resultObject

          if (keysExist) {
          } else {
            rnBiometrics.createKeys().then((resultObject) => {
              const { publicKey } = resultObject
              sendPublicKeyToServer(publicKey)
            })
          }
      })

    } else if (popupType === POP_REMOVE_AUTHENTICATION) {

      popCancelBtnAction();
      set_enabled(false);
      rnBiometrics.deleteKeys().then((resultObject) => {
        const { keysDeleted } = resultObject
      })

    } else {
      popCancelBtnAction();
    }

  };

  const removeUserData = async () => {

    PushNotification.cancelAllLocalNotifications();
      
    await DataStorageLocal.removeDataFromAsync(Constant.DEFAULT_PET_OBJECT);
      await DataStorageLocal.removeDataFromAsync(Constant.APP_TOKEN);
      await DataStorageLocal.removeDataFromAsync(Constant.CLIENT_ID);
      await DataStorageLocal.removeDataFromAsync(Constant.PET_ID);
      await DataStorageLocal.removeDataFromAsync(Constant.MODULATITY_OBJECT);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_SELECTED_PET);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT);
      await DataStorageLocal.removeDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.POINT_TRACKING_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.IS_FIRST_TIME_USER);
      await DataStorageLocal.removeDataFromAsync(Constant.QUESTIONNAIRE_SELECTED_PET);
      await DataStorageLocal.removeDataFromAsync(Constant.OBS_SELECTED_PET);
      await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_CURRENT);
      await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
      await DataStorageLocal.removeDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
      await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
      await DataStorageLocal.removeDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);

      //////// New ////////
      await DataStorageLocal.removeDataFromAsync(Constant.TOTAL_PETS_ARRAY);
      // await DataStorageLocal.removeDataFromAsync(Constant.USER_PSD_LOGIN);
      // await DataStorageLocal.removeDataFromAsync(Constant.FCM_TOKEN);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_EMAIL_LOGIN_TEMP);
      await DataStorageLocal.removeDataFromAsync(Constant.SAVE_SOB_PETS);
      await DataStorageLocal.removeDataFromAsync(Constant.SAVE_FIRST_NAME);
      await DataStorageLocal.removeDataFromAsync(Constant.SAVE_SECOND_NAME);
      await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
      await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
      await DataStorageLocal.removeDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_DATA_FLOW_OBJ);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_MILLISECONDS);
      await DataStorageLocal.removeDataFromAsync(Constant.SENOSR_INDEX_VALUE);
      await DataStorageLocal.removeDataFromAsync(Constant.MULTY_SENSOR_INDEX);

      await DataStorageLocal.removeDataFromAsync(Constant.VIDEO_PATH_OBSERVATION);
      await DataStorageLocal.removeDataFromAsync(Constant.DELETE_IMG);
      await DataStorageLocal.removeDataFromAsync(Constant.DELETE_VIDEO);
      await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_CURRENT);
      await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
      await DataStorageLocal.removeDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
      await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
      await DataStorageLocal.removeDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);
      await DataStorageLocal.removeDataFromAsync(Constant.CONFIGURED_WIFI_LIST);
      await DataStorageLocal.removeDataFromAsync(Constant.BEACON_INSTANCE_ID);

      await DataStorageLocal.removeDataFromAsync(Constant.PET_PARENT_OBJ);
      await DataStorageLocal.removeDataFromAsync(Constant.QUEST_VIDEO_UPLOAD_PROCESS_STARTED);
      await DataStorageLocal.removeDataFromAsync(Constant.QUEST_UPLOAD_DATA);
      await DataStorageLocal.removeDataFromAsync(Constant.SELECTED_QUESTIONNAIRE);
      await DataStorageLocal.removeDataFromAsync(Constant.ANSWERED_SECTIONS);
      await DataStorageLocal.removeDataFromAsync(Constant.CTW_QUESTIONNAIRE);

      await DataStorageLocal.removeDataFromAsync(Constant.ALL_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_ROLE_ID);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_ROLE_DETAILS);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_ROLE_CAPTURE_IMGS);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_ID);
    
  };

  // Popup cancel action
  const popCancelBtnAction = (value) => {
    set_popAlert(undefined);
    set_popUpMessage(undefined);
    set_isPopUpLeft(false);
    set_isPopUp(false);
    popIdRef.current = 0;
    set_popupType(0);
  };

  const selectAuthentication = () => {

    if(!enabled){
      set_popAlert(Constant.ALERT_DEFAULT_TITLE);
      set_popUpMessage('Are you sure you want to enable ' + authenticationType + '?');
      set_isPopUpLeft(true);
      set_isPopUpLeftTitle('NO');
      set_isPopUp(true);
      popIdRef.current = 1;
      set_popupType(1);
      set_popBtnName('YES');
  } else {

    set_popAlert(Constant.ALERT_DEFAULT_TITLE);
    set_popUpMessage('Are you sure you want to disable ' + authenticationType + '?');
    set_isPopUpLeft(true);
    set_isPopUpLeftTitle('NO');
    set_isPopUp(true);
    popIdRef.current = 1;
    set_popupType(3);
    set_popBtnName('YES');
  }

  };

  const deleteUserAccount = async () => {

    const rnBiometrics = new ReactNativeBiometrics();
    set_isLoading(true);
    isLoadingdRef.current = 1;
    let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    // firebaseHelper.logEvent(firebaseHelper.event_delete_account_main_api, firebaseHelper.screen_account_main, "Initiated the user Account delete Api ", 'Client ID : ' + clientIdTemp);
    let json = {
      PetParentId: clientIdTemp,
    };
    let userDetailsServiceObj = await ServiceCalls.deleteUserAccount(json, token);
    set_isLoading(false);
    isLoadingdRef.current = 0;

    if (userDetailsServiceObj && userDetailsServiceObj.logoutData) {
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if (userDetailsServiceObj && !userDetailsServiceObj.isInternet) {
      set_popAlert(Constant.ALERT_NETWORK);
      set_popUpMessage(Constant.NETWORK_STATUS);
      set_isPopUpLeft(false);
      set_popBtnName("OK");
      set_isPopUp(true);
      set_popupType(0);
      return;
    }

    if (userDetailsServiceObj && userDetailsServiceObj.statusData) {
      Apolloclient.client.writeQuery({ query: Queries.LOG_OUT_APP, data: { data: { isLogOut: 'logOut', __typename: 'LogOutApp' } }, });
      removeUserData();
      await DataStorageLocal.removeDataFromAsync(Constant.USER_EMAIL_LOGIN);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_PSD_LOGIN);
      await DataStorageLocal.removeDataFromAsync(Constant.FCM_TOKEN);
      await rnBiometrics.deleteKeys().then((resultObject) => {
        const { keysDeleted } = resultObject
      });

      navigation.navigate('LoginComponent',{"isAuthEnabled" : false}); 

    } else {

      set_popAlert(Constant.ALERT_DEFAULT_TITLE);
      set_popUpMessage(Constant.SERVICE_FAIL_MSG);
      set_isPopUpLeft(false);
      set_popBtnName("OK");
      set_isPopUp(true);
      set_popupType(0);
      firebaseHelper.logEvent(firebaseHelper.event_delete_account_main_api_fail, firebaseHelper.screen_account_main, "Delete Account Api Failed", 'error : Status false');
    }

    if (userDetailsServiceObj && userDetailsServiceObj.error) {
      set_popAlert(Constant.ALERT_DEFAULT_TITLE);
      set_popUpMessage(Constant.SERVICE_FAIL_MSG);
      set_isPopUpLeft(false);
      set_popBtnName("OK");
      set_isPopUp(true);
      set_popupType(0);
      firebaseHelper.logEvent(firebaseHelper.event_delete_account_main_api_fail, firebaseHelper.screen_account_main, "Delete Account Api Failed", 'error : Service error');
    }

  };

  const deleteAccountAction = (value) => {
    logOutAction(value);
  };

  return (
    <AccountInfoUi
      email={email}
      phoneNo={phoneNo}
      fullName={fullName}
      firstName={firstName}
      secondName={secondName}
      popAlert={popAlert}
      popUpMessage={popUpMessage}
      isPopUp={isPopUp}
      popBtnName={popBtnName}
      isLoading={isLoading}
      isPopUpLeft={isPopUpLeft}
      versionNumber={versionNumber}
      buildVersion={buildVersion}
      enviName={enviName}
      secondaryEmail = {secondaryEmail}
      pAddress = {pAddress}
      enabled = {enabled}
      authenticationType = {authenticationType}
      isPopUpLeftTitle = {isPopUpLeftTitle}
      bio_Enable = {bio_Enable}
      userRole = {userRole}
      navigateToPrevious={navigateToPrevious}
      logOutAction={logOutAction}
      popOkBtnAction={popOkBtnAction}
      popCancelBtnAction={popCancelBtnAction}
      btnAction={btnAction}
      deleteAccountAction = {deleteAccountAction}
      selectAuthentication = {selectAuthentication}
    />
  );

}

export default AccountInfoService;