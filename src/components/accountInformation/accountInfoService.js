import React, { useState, useRef } from 'react';
import { View, BackHandler, NativeModules } from 'react-native';
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
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as clearAPIDAta from './../../utils/dataComponent/savedAPIData.js';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js"
import * as ClearAppModelData from "./../../utils/appDataModels/clearAppDataModel.js";

var PushNotification = require("react-native-push-notification");

let trace_inAccountService_Screen;

let POP_AUTHENTICATION = 1;
let POP_REMOVE_AUTHENTICATION = 3;
let POP_LOG_OUT = 2;
let POP_DELETE_ACCOUNT = 4;
let POP_AUTO_LOGOUT_ACCOUNT = 5;

const Environment = JSON.parse(BuildEnv.Environment());

const AccountInfoService = ({ navigation, route, ...props }) => {

  const [email, set_email] = useState(undefined);
  const [fullName, set_fullName] = useState(undefined);
  const [phoneNo, set_phoneNo] = useState(undefined);
  const [phoneNoDisplay, set_phoneNoDisplay] = useState(undefined);
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
  const [userRole, set_userRole] = useState(undefined);
  const [roleName, set_roleName] = useState(undefined);
  const [clientId, set_clientId] = useState(undefined);
  const [preferredFoodRecUnit, set_preferredFoodRecUnit] = useState(undefined);
  const [preferredFoodRecTime, set_preferredFoodRecTime] = useState(undefined);
  const [preferredWeightUnit, set_preferredWeightUnit] = useState(undefined);
  const [accntObj, set_accntObj] = useState(undefined);
  const [isFeeding, set_isFeeding] = useState(false);
  const [isdCode, set_isdCode] = useState(undefined);
  const [isdCodeId, set_isdCodeId] = useState(undefined);

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
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_account_main, "User in Accounts Screen", '');
      deviceAuthenticationType();
      getUserData();
      getUserRoles();
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
    let userRole = UserDetailsModel.userDetailsData.userRole.RoleId;
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

  const getUserRoles = async () => {

    let userRoleDetails = UserDetailsModel.userDetailsData.userRole;

    if (userRoleDetails) {
      set_roleName(userRoleDetails.RoleName)
      set_clientId(userRoleDetails.ClientID)
    }

    if (userRoleDetails && userRoleDetails.RolePermissions && userRoleDetails.RolePermissions.length > 0) {
      let userFR = false
      for (let role = 0; role < userRoleDetails.RolePermissions.length; role++) {
        if (userRoleDetails.RolePermissions[role].menuId === 75) {
          userFR = true;
          break;
        }
      }
      set_isFeeding(userFR);
    }

  }

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

      if (available) {
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
    let apiMethodManage = apiMethodManager.GET_USER_PROFILE;
    let apiService = await apiRequest.getData(apiMethodManage, '', Constant.SERVICE_JAVA, navigation);
    set_isLoading(false);
    isLoadingdRef.current = 0;

    if (apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      setAccountDetails(apiService.data)
    } else if (apiService && apiService.isInternet === false) {

      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, false, 'OK', true, 0);
      return;

    } else if (apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

      createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, false, 'OK', true, 0);
      firebaseHelper.logEvent(firebaseHelper.event_account_main_api_fail, firebaseHelper.screen_account_main, "Account Api Failed", 'error : ' + apiService.error.errorMsg);

    } else {

      firebaseHelper.logEvent(firebaseHelper.event_account_main_api_fail, firebaseHelper.screen_account_main, "Account Api Failed", 'error : Status false');
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, false, 'OK', true, 0);

    }

  };

  const setAccountDetails = (acctDetailsObj) => {

    set_accntObj(acctDetailsObj.user);
    savePetParent(acctDetailsObj.user);
    set_email(acctDetailsObj.user.email);
    set_fullName(acctDetailsObj.user.fullName);
    set_firstName(acctDetailsObj.user.firstName);
    set_secondName(acctDetailsObj.user.lastName);
    set_phoneNo(acctDetailsObj.user.phoneNumber ? acctDetailsObj.user.phoneNumber : "")
    set_phoneNoDisplay((acctDetailsObj.user.isdCode ? acctDetailsObj.user.isdCode : "") + ("-") + (acctDetailsObj.user.phoneNumber ? acctDetailsObj.user.phoneNumber : ""));
    set_isNotification(acctDetailsObj.user.notifyToSecondaryEmail);
    set_secondaryEmail(acctDetailsObj.user.secondaryEmail);
    set_isdCode(acctDetailsObj.user.isdCode)
    set_isdCodeId(acctDetailsObj.user.isdCodeId)
    if (acctDetailsObj.user.address && Object.keys(acctDetailsObj.user.address).length !== 0) {
      set_pAddressObj(acctDetailsObj.user.address);
      let tempLine2 = acctDetailsObj.user.address.address2 && acctDetailsObj.user.address.address2 !== '' ? acctDetailsObj.user.address.address2 + ', ' : '';
      let address = acctDetailsObj.user.address.address1 + ', '
        + tempLine2
        + acctDetailsObj.user.address.city + ', '
        + acctDetailsObj.user.address.state + ', '
        + acctDetailsObj.user.address.country + ', '
        + acctDetailsObj.user.address.zipCode;
      set_pAddress(address);
    }

    set_preferredFoodRecUnit(acctDetailsObj.user.preferredFoodRecUnit);
    set_preferredWeightUnit(acctDetailsObj.user.preferredWeightUnit);
    set_preferredFoodRecTime(acctDetailsObj.user.preferredFoodRecTime)

  }

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
      createPopup(Constant.FAIL_MSG_ALERT, Constant.UPLOAD_OBS_LOGOUT_MSG, false, 'OK', true, 0);

    } else if (timerData && (timerData.isTimerStarted || timerData.isTimerPaused)) {

      firebaseHelper.logEvent(firebaseHelper.event_account_logout, firebaseHelper.screen_account_main, "User tried to logout when timer is running", 'Email : ' + email);
      createPopup(Constant.FAIL_MSG_ALERT, Constant.TIMER_LOGOUT_MSG, false, 'OK', true, 0);

    } else if (questData && questData.length > 0) {

      firebaseHelper.logEvent(firebaseHelper.event_account_logout, firebaseHelper.screen_account_main, "User tried to logout when Observation is being uploaded", 'Email : ' + email);
      createPopup(Constant.FAIL_MSG_ALERT, Constant.UPLOAD_QUEST_LOGOUT_MSG, false, 'OK', true, 0);

    } else {
      //Logging out Zendesk from here
      // Calling android method from here for Zendesk logout
      if (Platform.OS === 'android') {
        NativeModules.ZendeskChatModule.logOutFromZendeskWindow("logout", (convertedVal) => {
          //handle callback if needed     
        });
      }
      else {
        // Calling iOS method from here for Zendesk logout
        NativeModules.ZendeskChatbot.logOutFromZendeskMessagingWindow("logout", (value) => {
          //handle callback if needed
        });
      }

      set_isPopUpLeftTitle('CANCEL');

      let msg = id === 100 ? Constant.LOG_OUT_MSG : Constant.DELETE_USER_MSG;
      let rBtnName = id === 100 ? "LOG OUT" : "ACCEPT";
      let pId = id === 100 ? 2 : 4;
      createPopup(Constant.ALERT_DEFAULT_TITLE, msg, true, rBtnName, true, pId);
    }
    // set_isPopUp(true);
    // popIdRef.current = 1;
  };

  // Navigations to edit Password, user name and phone number
  const btnAction = async (value) => {

    let internet = await internetCheck.internetCheck();
    firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit", 'Internet Status : ' + internet);
    if (!internet) {
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, false, "OK", true, 0);
      popIdRef.current = 1;

    } else {
      if (value === "Name") {

        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Name", 'Name : ' + fullName);
        navigation.navigate('UpdateNameService', { fullName: fullName, firstName: firstName, secondName: secondName, phoneNo: phoneNo, secondaryEmail: secondaryEmail, isNotification: isNotification, petParentAddress: pAddressObj, isdCode_Id: isdCodeId, prefObj: accntObj });

      } else if (value === "Phone Number") {

        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Phone", 'Phone : ' + phoneNo);
        navigation.navigate('UpdatePhoneService', { fullName: fullName, firstName: firstName, secondName: secondName, phoneNo: phoneNo, secondaryEmail: secondaryEmail, isNotification: isNotification, petParentAddress: pAddressObj, isdCode_Id: isdCodeId, isd_Code: isdCode, prefObj: accntObj });

      } else if (value === "Password") {

        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Password", 'Email : ' + email);
        navigation.navigate('ChangePasswordComponent');

      } else if (value === "SecondaryEmail") {

        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Secondary Email", 'Email : ' + email);
        navigation.navigate('UpdateSecondaryEmailService', { fullName: fullName, firstName: firstName, secondName: secondName, phoneNo: phoneNo, secondaryEmail: secondaryEmail, isNotification: isNotification, petParentAddress: pAddressObj, isdCode_Id: isdCodeId, prefObj: accntObj });

      } else if (value === "PetParentAddress") {

        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Address", 'Email : ' + email);
        navigation.navigate('UpdatePetParentAddressComponent', { fullName: fullName, firstName: firstName, secondName: secondName, phoneNo: phoneNo, secondaryEmail: secondaryEmail, isNotification: isNotification, petParentAddress: pAddressObj, isdCode_Id: isdCodeId, prefObj: accntObj });

      } else if (value === "PrefferedUnits") {

        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Address", 'Email : ' + email);
        navigation.navigate('UpdateFoodUnitsComponent', { prefObj: accntObj, isdCode_Id: isdCodeId });

      }
    }
  };

  const savePetParent = async (pParent) => {
    UserDetailsModel.userDetailsData.user = pParent;
  };

  // Clears all the async saved data and logs out of the app
  const popOkBtnAction = async () => {

    const rnBiometrics = new ReactNativeBiometrics();
    set_isPopUp(false);
    popIdRef.current = 0;

    if (popupType === POP_LOG_OUT) {

      await logOutUserAccount();

    } else if (popupType === POP_DELETE_ACCOUNT) {

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

    } else if (popupType === POP_AUTO_LOGOUT_ACCOUNT) {

      ClearAppModelData.clearAppPetsModel();
      ClearAppModelData.modularPermissionsModel();
      ClearAppModelData.userDetailsModel();

      AuthoriseCheck.authoriseCheck();
      navigation.popToTop();
      navigation.navigate('LoginComponent', { "isAuthEnabled": false });
      // navigation.navigate('WelcomeComponent');

    } else {
      popCancelBtnAction();
    }

  };

  const removeUserData = async () => {

    PushNotification.cancelAllLocalNotifications();
    await clearAPIDAta.clearAPIDAta();
    await DataStorageLocal.saveDataToAsync(Constant.IS_USER_LOGGEDIN, JSON.stringify(false));
    const rnBiometrics = new ReactNativeBiometrics();
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
    set_isLoading(false)
    // navigation.navigate('WelcomeComponent');
    let user = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN);
    let pd = await DataStorageLocal.getDataFromAsync(Constant.USER_PSD_LOGIN);
    navigation.popToTop();

    ClearAppModelData.clearAppPetsModel();
    ClearAppModelData.modularPermissionsModel();
    ClearAppModelData.userDetailsModel();

    if (user && pd && pd !== 'undefined') {
      navigation.navigate('LoginComponent', { "isAuthEnabled": enabled });
    } else {
      navigation.navigate('LoginComponent', { "isAuthEnabled": false });
    }

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

    if (!enabled) {
      set_isPopUpLeftTitle('NO');
      popIdRef.current = 1;
      createPopup(Constant.ALERT_NETWORK, 'Are you sure you want to enable ' + authenticationType + '?', true, "YES", true, 1);
    } else {

      set_isPopUpLeftTitle('NO');
      popIdRef.current = 1;
      createPopup(Constant.ALERT_NETWORK, 'Are you sure you want to disable ' + authenticationType + '?', true, "YES", true, 3);

    }

  };

  const deleteUserAccount = async () => {

    const rnBiometrics = new ReactNativeBiometrics();

    let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let json = {
      PetParentId: clientIdTemp,
    };
    let apiMethodManage = apiMethodManager.DELETE_USER_ACCOUNT;
    let apiService = await apiRequest.postData(apiMethodManage, json, Constant.SERVICE_MIGRATED, navigation);
    set_isLoading(false);
    isLoadingdRef.current = 0;

    if (apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
    } else if (apiService && apiService.isInternet === false) {
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, false, 'OK', true, 0);
      return;
    } else if (apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, false, 'OK', true, 0);
    }
    else if (apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error, false, 'OK', true, 0);
    } else {
    }

  };

  const logOutUserAccount = async () => {

    set_isLoading(true);
    isLoadingdRef.current = 1;

    let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let json = {
      PetParentId: clientIdTemp,
    };
    let apiMethodManage = apiMethodManager.LOGOUT_USER_ACCOUNT;
    let apiService = await apiRequest.postData(apiMethodManage, json, Constant.SERVICE_MIGRATED, navigation);
    set_isLoading(false);
    isLoadingdRef.current = 0;

    if (apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {

      if (apiService.data.responseCode) {
        await removeUserData();
      }

    } else if (apiService && apiService.isInternet === false) {
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, false, 'OK', true, 0);
    } else if (apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, false, 'OK', true, 0);
    } else {
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, false, 'OK', true, 0);
    }

  };

  const createPopup = (alertTitle, msg, isPopLeftEnable, rgtBtnName, isPopup, pType) => {

    set_popAlert(alertTitle);
    set_popUpMessage(msg);
    set_isPopUpLeft(isPopLeftEnable);
    set_popBtnName(rgtBtnName);
    set_popupType(pType);
    set_isPopUp(isPopup);

  }

  const deleteAccountAction = (value) => {
    logOutAction(value);
  };

  return (
    <AccountInfoUi
      email={email}
      phoneNo={phoneNoDisplay}
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
      secondaryEmail={secondaryEmail}
      pAddress={pAddress}
      enabled={enabled}
      authenticationType={authenticationType}
      isPopUpLeftTitle={isPopUpLeftTitle}
      bio_Enable={bio_Enable}
      userRole={userRole}
      clientId={clientId}
      preferredWeightUnit={preferredWeightUnit}
      preferredFoodRecUnit={preferredFoodRecUnit}
      preferredFoodRecTime={preferredFoodRecTime}
      isFeeding={isFeeding}
      roleName={roleName}
      navigateToPrevious={navigateToPrevious}
      logOutAction={logOutAction}
      popOkBtnAction={popOkBtnAction}
      popCancelBtnAction={popCancelBtnAction}
      btnAction={btnAction}
      deleteAccountAction={deleteAccountAction}
      selectAuthentication={selectAuthentication}
    />
  );

}

export default AccountInfoService;