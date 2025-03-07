import React, { useState,useRef } from 'react';
import { NativeModules, Platform,BackHandler,Linking } from 'react-native';
import LoginUI from './loginUi';
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "../../utils/constants/constant";
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import messaging from '@react-native-firebase/messaging';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import VersionNumber from 'react-native-version-number';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as AppPetsData from '../../utils/appDataModels/appPetsModel.js';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";
import * as Queries from "./../../config/apollo/queries";
import { useQuery } from "@apollo/react-hooks";
import DeviceInfo from 'react-native-device-info';

var PushNotification = require("react-native-push-notification");
let trace_inLoginScreen;
let trace_Login_Get_Pets_API_Complete;
let trace_Login_Get_UserDetails_API_Complete;

const APP_UPDATE = 100;

const LoginComponent = ({ navigation, route, ...props }) => {

  /**
   * Login API : Validates the user and returns user email, token and client Id
   * GetPetDetails : by passing the client id after login, returns the pets information.
   */

  const [clientId, set_clientId] = useState(undefined);
  const [petsArray, set_petsArray] = useState(undefined);
  const [isLoading, set_isLoading] = useState(false);
  const [loaderMsg, set_loaderMsg] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [popUpRgtBtnTitle, set_popUpRgtBtnTitle] = useState('OK');
  const [popUpisLftBtn, set_popUpisLftBtn] = useState(false);
  const [popUpisRgtBtn, set_popUpisRgtBtn] = useState(false);
  const [firstTimeUser, set_firstTimeUser] = useState(false);
  const [date, set_Date] = useState(new Date());
  const [tokenValue, set_tokenValue] = useState(undefined);
  const [isAuthEnabled, set_isAuthEnabled] = useState(undefined);
  const [authenticationType, set_authenticationType] = useState(undefined);
  const [appStatus, set_appStatus] = useState(null);
  const [popUpID, set_popUpID] = useState(0);
  const [forgotPsd, set_forgotPsd] = useState('');

  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);
  let isFirstTime = useRef(false);

  React.useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      loginSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_login);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_login, "User in Login Screen", ''); 
      if (route.params?.isAuthEnabled) {
        set_isAuthEnabled(route.params?.isAuthEnabled);
        getAuthType();
      } else {
        set_isAuthEnabled(false);
      }
      if (route.params?.appStatus) {
        set_appStatus(route.params?.appStatus);
        updateUserApp(route.params?.appStatus);
      }
      if(route?.params.isFrom && route?.params.isFrom === 'PasswordScreen') {
        set_forgotPsd('removePsd');
      }
    });

    const unsubscribe = navigation.addListener('blur', () => {
      loginSessionStop();
    });

    //loginAction("mvegesna@ctepl.com","Apple@1234")

    return () => {
      loginSessionStop();
      focus();
      unsubscribe();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };

  }, [route.params?.isAuthEnabled,route.params?.appStatus,route?.params.isFrom]);

  const loginSessionStart = async () => {
    trace_inLoginScreen = await perf().startTrace('t_inLoginScreen');
  };

  const loginSessionStop = async () => {
    trace_inLoginScreen.stop();
  };

  const stopFBTraceUserDetails = async () => {
    await trace_Login_Get_UserDetails_API_Complete.stop();
  };

  /**
   * Saving the email,Token,ClientId within the calss
   * Calling getPetDetails API using client Id
   */

  const updateUserApp = (appState) => {

    let deviceAppVersion = VersionNumber.buildVersion;
    let appVersionCheck = appState.appVersion;
    if(appVersionCheck && appVersionCheck.appVersion && (parseFloat(appVersionCheck.appVersion) > parseFloat(deviceAppVersion))) {
      if(appVersionCheck.isForceUpdate) {
        if(appVersionCheck.versionDescription) {
          createPopup(Constant.ALERT_DEFAULT_TITLE,appVersionCheck.versionDescription,'UPGRADE',true,false,true,1,100);
        } else {
          createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.APPUPDATE_FORCE_MSG,'UPGRADE',true,false,true,1,100);
        }
        
      } else {
        if(appVersionCheck.versionDescription) {
          createPopup(Constant.ALERT_APPUPDATE,appVersionCheck.versionDescription,'UPGRADE',true,true,true,1,100);
        } else {
          createPopup(Constant.ALERT_APPUPDATE,Constant.APPUPDATE_OPTIONAL_MSG,'UPGRADE',true,true,true,1,100);
        }
      }
    }

  };

  const setBasicValues = async (userDetails,userP) => {

    await DataStorageLocal.saveDataToAsync(Constant.APP_TOKEN, "" + userDetails.Token);
    await DataStorageLocal.saveDataToAsync(Constant.CLIENT_ID, "" + userDetails.ClientID);
    await DataStorageLocal.saveDataToAsync(Constant.USER_EMAIL_LOGIN, "" + userDetails.Email);
    await DataStorageLocal.saveDataToAsync(Constant.USER_PSD_LOGIN, userP);
    UserDetailsModel.userDetailsData.userRole = userDetails;
    
    if(userDetails && userDetails.RolePermissions && userDetails.RolePermissions.length > 0) {

      let capturePermission = await userDetails.RolePermissions.filter(item => parseInt(item.menuId) === 67);
      let questionnairPer = await userDetails.RolePermissions.filter(item => parseInt(item.mobileAppConfigId) === 3);

      if (questionnairPer && questionnairPer.length > 0) {
        await DataStorageLocal.saveDataToAsync(Constant.QUETIONNAIRE_PERMISSION,'available');
      } else {
        await DataStorageLocal.removeDataFromAsync(Constant.QUETIONNAIRE_PERMISSION);
      }

      if(capturePermission && capturePermission.length > 0 && capturePermission[0].menuId === 67) {
        await DataStorageLocal.saveDataToAsync(Constant.USER_ROLE_CAPTURE_IMGS, capturePermission[0].menuId.toString());
      } else {
        await DataStorageLocal.removeDataFromAsync(Constant.USER_ROLE_CAPTURE_IMGS);
      }
      
    }

    set_clientId(userDetails.ClientID);
    set_tokenValue(userDetails.Token);
    firebaseHelper.setUserId(userDetails.Email + "");
    firebaseHelper.setUserProperty(userDetails.Email + "", userDetails.ClientID + "");

    if(userDetails.ClientID > 0 ) {
      getLoginPets(userDetails.ClientID,userDetails.UserId);
    } else {

      if(userDetails.RolePermissions) {

        let hasBFIImgCapture = false;
        let hasBFIScore = false;

        for (let i = 0; i < userDetails.RolePermissions.length; i++) {

          if(userDetails.RolePermissions[i].menuId === 67) {
            hasBFIImgCapture = true;
          }

          if(userDetails.RolePermissions[i].menuId === 68) {
            
            await DataStorageLocal.saveDataToAsync(Constant.MENU_ID, userDetails.RolePermissions[i].menuId.toString());
            hasBFIScore = true;
          }

        }
        if(hasBFIScore && hasBFIImgCapture) {

          if (userDetails.RoleName === "External Vet Technician" || userDetails.RoleName === "Hill's Vet Technician") {
            getLoginPets(userDetails.ClientID,userDetails.UserId);
            return;
          }
            // Representative Dashboard
            isLoadingdRef.current = 0;
            set_isLoading(false);
            navigation.navigate("BFIUserDashboardComponent");
            Apolloclient.client.writeQuery({ query: Queries.LOG_OUT_APP, data: { data: { isLogOut: 'logOut', __typename: 'LogOutApp' } },});

        } else if(hasBFIScore) {
          // Veterinerian
          isLoadingdRef.current = 0;
          set_isLoading(false);
          navigation.navigate('PetListBFIScoringScreen');
        } else if(hasBFIImgCapture) {
          // Only Capture
          isLoadingdRef.current = 0;
          set_isLoading(false);
          navigation.navigate('PetListComponent');
        }
      }

    }

  };

  // Getting the Pets details of the user from backend
  const getLoginPets = async (client,userId) => {
    
    trace_Login_Get_Pets_API_Complete = await perf().startTrace('t_Login_Screen_Get_Pets_API');


    let apiMethod = apiMethodManager.GET_PETPARENT_PETS + client;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    stopFBTraceGetPets();
        
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {

      set_petsArray(apiService.data.petDevices);
      if(apiService.data.petDevices.length > 0){
        
        set_firstTimeUser(false);
        isFirstTime.current = false;
        saveFirstTimeUser(false,client,userId);
        saveUserLogStatus(client,userId);
        saveDefaultPet(apiService.data.petDevices);
      
      } else {

        isFirstTime.current = true;
        set_firstTimeUser(true);
        saveFirstTimeUser(true, client,userId);
        saveUserLogStatus(client,userId);   
        
      }
            
    } else if(apiService && apiService.isInternet === false) {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK', false,true);
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getPets_fail, firebaseHelper.screen_dashboard, "Dashboard Getpets Service failed", 'Service error : ' + apiService.error.errorMsg);
    
    } else {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getPets_fail, firebaseHelper.screen_dashboard, "Dashboard Getpets Service failed", 'Service Status : false');

    }

  };

  const serviceFailedData = (status) => {
    firebaseHelper.logEvent(firebaseHelper.event_login_getPets_fail, firebaseHelper.screen_login, "Login Getpets Service Fail", 'Unable to fetch Pet details' + status);
    createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,'OK',true,false,true,1,0);
  };

  const stopFBTraceGetPets = async () => {
    await trace_Login_Get_Pets_API_Complete.stop();
  };

  // Saves the User details
  const saveUserDetails = async (objUser) => {
    if (objUser) {

      UserDetailsModel.userDetailsData.user = objUser.user;

    }

    set_isLoading(false);
    isLoadingdRef.current = 0;
    if (isFirstTime.current) {
      navigation.navigate("AppOrientationComponent", { loginPets: petsArray, isFromScreen: 'LoginPage' });
    } else {
      updateDashboardData(petsArray);
    }

  };

  // Saves the pet that has Setup done as a default pet
  const saveDefaultPet = async (arrayOfAllPets) => {

    let defaultPet = AppPetsData.petsData.defaultPet;
    if (!defaultPet || defaultPet === null) {
      AppPetsData.petsData.defaultPet = arrayOfAllPets[0];
    } 
    AppPetsData.petsData.totalPets = arrayOfAllPets;
    if (isFirstTime.current) {
      navigation.navigate("AppOrientationComponent", { loginPets: arrayOfAllPets, isFromScreen: 'LoginPage' });
    } else {
      updateDashboardData(petsArray);
      // navigation.navigate("DashBoardService", { loginPets: arrayOfAllPets });
    }

  }

  // Saves the User details
  const saveUserLogStatus = async (client,userId) => {
    await DataStorageLocal.saveDataToAsync(Constant.IS_USER_LOGGED_INN, JSON.stringify(true));
    getUserDetailsDB(client,userId);
  }

  // When user has no pets, saves the status as First time user
  const saveFirstTimeUser = async (value, client,userId) => {

    AppPetsData.petsData.isFirstUser = value;
    getUserDetailsDB(client,userId);

  };

  // Api to fetch the user details
  const getUserDetailsDB = async (client,token,userId) => {

    trace_Login_Get_UserDetails_API_Complete = await perf().startTrace('t_Login_Screen_Get_UserDetails_API');

    let apiMethodManage = apiMethodManager.GET_USER_PROFILE;
    let apiService = await apiRequest.getData(apiMethodManage,'',Constant.SERVICE_JAVA,navigation);
    stopFBTraceUserDetails();
    set_isLoading(false);
    isLoadingdRef.current = 0;
    
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {

      saveUserDetails(apiService.data);     

    } else if(apiService && apiService.isInternet === false) {
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,false,'OK',true,0);

    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      firebaseHelper.logEvent(firebaseHelper.event_account_main_api_fail, firebaseHelper.screen_account_main, "Account Api Failed", 'error : '+apiService.error.errorMsg);
      
    } else {
      updateDashboardData(petsArray);

    }

  };

  /**
   * Fetching the fcm token generated from firebase
   * @param {*} email
   * @param {*} psd
   * @param {*} fcmToken (Firebase Notification)
   */
  const getFCMToken = (email, psd) => {

    // validateLogin(email, "Sprp1Cbx015NcQXmaPMyfQ==");
    if (Platform.OS === 'android') {
      //If the user is using an android device
      NativeModules.Device.getDeviceName(psd, (convertedVal) => {
        // set_psdEncrypt(convertedVal);
        validateLogin(email, convertedVal);
      });

    }
    else {
      //If the user is using an iOS device
      NativeModules.EncryptPassword.encryptPassword(psd, (value) => {
        // set_psdEncrypt(value);
        validateLogin(email, value);
      })
    }

  };

  /**
  * This Method returns the login success / failure info from Login API
  * Success : returns email,token,clientid will be saved and can be used across the app
  * User credentials will be saved for auto login feature after successfull login
  * when error a proper message will be shown to user
  */

  const validateLogin = async (email, psd) => {

    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      await DataStorageLocal.saveDataToAsync(Constant.FCM_TOKEN, fcmToken);
    }

    set_isLoading(true);
    isLoadingdRef.current = 1;
    set_loaderMsg(Constant.LOGIN_LOADER_MSG);
    let json = {
      Email: email,
      Password: psd,
      FCMToken: fcmToken,
      AppVersion : ""+VersionNumber.appVersion,
      AppOS : Platform.OS === 'ios' ? "1" : "2"
    };

    let apiMethod = apiMethodManager.LOGIN_APP;
    let apiService = await apiRequest.postData(apiMethod,json,Constant.SERVICE_MIGRATED,navigation);
                
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
   
      if(apiService.data.UserDetails && apiService.data.UserDetails.RolePermissions.length === 0) {

        firebaseHelper.logEvent(firebaseHelper.event_login_fail, firebaseHelper.screen_login, "Login Service Fail", 'Invali Credentials');
        createPopup(Constant.LOGIN_FAILED_ALERT,Constant.LOGIN_FAILED_MSG,'OK',true,false,true,1,0);
        set_isLoading(false);
        isLoadingdRef.current = 0;

      } else {

        setBasicValues(apiService.data.UserDetails,psd);

      }

    } else if(apiService && apiService.isInternet === false) {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK',true,false,true,1,0);

    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      firebaseHelper.logEvent(firebaseHelper.event_login_fail, firebaseHelper.screen_login, "Login Service Fail", 'Login service fail : '+ apiService.error.errorMsg);
      set_isLoading(false);
      isLoadingdRef.current = 0;
      createPopup(Constant.LOGIN_FAILED_ALERT,Constant.LOGIN_FAILED_MSG,'OK',true,false,true,1,0); 

    } else {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      createPopup(Constant.LOGIN_FAILED_ALERT,Constant.LOGIN_FAILED_MSG,'OK',true,false,true,1,0);
      firebaseHelper.logEvent(firebaseHelper.event_login_fail, firebaseHelper.screen_login, "Login Service Fail", 'Login service fail : '+ 'Success False');

    }

  }

  // Login Action
  const loginAction = async (email, psd) => {
    
    let internet = await internetCheck.internetCheck();
    if (!internet) {
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK',true,false,true,1,0);
    } else {

      let userEmail = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN);
      if(userEmail && userEmail !== email) {
        await removeTimer();
        await DataStorageLocal.removeDataFromAsync(Constant.ANSWERED_SECTIONS);
        await DataStorageLocal.removeDataFromAsync(Constant.CTW_QUESTIONNAIRE);
        await DataStorageLocal.removeDataFromAsync(Constant.CTW_QUESTIONNAIRE);
        const rnBiometrics = new ReactNativeBiometrics();
        rnBiometrics.deleteKeys().then((resultObject) => {
          const { keysDeleted } = resultObject
          if (keysDeleted) {
          } else {
          }
        })
      }
      firebaseHelper.logEvent(firebaseHelper.event_login, firebaseHelper.screen_login, "Login button clicked", "email: " + email);
      getFCMToken(email, psd);
    }
  };

  const removeTimer = async () => {
    PushNotification.cancelAllLocalNotifications();
    await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT);
  };

  // Navigates to Forgot psd
  const forgotPswdAction = async (userEmail) => {

    let internet = await internetCheck.internetCheck();
    firebaseHelper.logEvent(firebaseHelper.event_login_forgotPswd, firebaseHelper.screen_login, "Forgot Password button clicked", "Internet Status: " + internet.toString());
    if (!internet) {
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK',true,false,true,1,0);
    } else {

      set_forgotPsd('deletePsd');
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (userEmail) {
        if (re.test(userEmail.replace(/ /g, ''))) {
          navigation.navigate("ForgotPasswordComponent", { userEmail: userEmail });
        } else {
          navigation.navigate("ForgotPasswordComponent", { userEmail: undefined });
        }
      } else {
        navigation.navigate("ForgotPasswordComponent", { userEmail: undefined });
      }

    }

  };

  const updateDashboardData = async (petsArray) => {
    navigation.navigate("DashBoardService", { loginPets: petsArray });
  };

  // Navigates to Registration process
  const registerAction = async () => {

    let internet = await internetCheck.internetCheck();
    firebaseHelper.logEvent(firebaseHelper.event_login_registration, firebaseHelper.screen_login, "Registration button clicked", "Internet Status: " + internet.toString());
    if (!internet) {
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,'OK',true,false,true,1,0);
    } else {
      navigation.navigate("PetParentProfileComponent");
    }

  };

  const navigateToStore = () => {

    let appName = DeviceInfo.getApplicationName();

    if(Platform.OS === 'android') {
      if(appName && appName.toUpperCase() === 'WAG') {
        Linking.openURL(Constant.WAG_ANDROID_PLAYSTORE_LINK);
      } else {
        Linking.openURL(Constant.WCT_ANDROID_PLAYSTORE_LINK);
      }
    } else {
      
      if(appName && appName.toUpperCase() === 'WAG') {
        Linking.openURL(Constant.WAG_APPSTORE_LINK);
      } else {
        Linking.openURL(Constant.WCT_APPSTORE_LINK);
      }
      
    }

  };

  const createPopup = (popupAlert,popMsg,popRgtBtnTitle,isPopRgtBtn,isPopLftBtn,isPopup,popId,popuID) => {
    set_popUpAlert(popupAlert);
    set_popUpMessage(popMsg);
    set_popUpRgtBtnTitle(popRgtBtnTitle);
    set_popUpisRgtBtn(isPopRgtBtn);
    set_popUpisLftBtn(isPopLftBtn);
    set_isPopUp(isPopup);
    popIdRef.current = popId;
    set_popUpID(popuID)
  };

  // Popup Actions
  const popOkBtnAction = async () => {

    if(popUpID === APP_UPDATE) {
      navigateToStore();
      return;
    }
    createPopup('','','OK',false,false,false,0,0);
  };

  const popCancelBtnAction = async () => {
    createPopup('','','OK',false,false,false,0,0);
  };

  const handleBackButtonClick = () => {
    backBtnAction();
    return true;
  };

  const backBtnAction = () => {

    if(isLoadingdRef.current === 0 && popIdRef.current === 0){
      // firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_login, "User clicked on back button to navigate to WelcomeComponent", '');
      navigation.navigate("WelcomeComponent");
      // navigation.pop();
    }
  };

  const getAuthType = () => {
    
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
    })
  }

  const validateAuthentication = async () => {

    let userEmail = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN);
    let userPsd = await DataStorageLocal.getDataFromAsync(Constant.USER_PSD_LOGIN);
    const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
    rnBiometrics.biometricKeysExist().then((resultObject) => {
      const { keysExist } = resultObject
      if (keysExist) {
        rnBiometrics.simplePrompt({promptMessage: 'Confirm Authentication'}).then((resultObject) => {
          const { success } = resultObject

          if (success) {
            if(userEmail && userPsd) {
              firebaseHelper.logEvent(firebaseHelper.event_login_Authentication, firebaseHelper.screen_login, "User clicked on Face/Touch Id Button", 'Type : '+authenticationType);
              validateLogin(userEmail, userPsd);
            }
            
          } 
        }).catch(() => {
        })   
      } 
     })
    
  };

  return (
    <LoginUI
      isLoading={isLoading}
      loaderMsg={loaderMsg}
      popUpAlert={popUpAlert}
      isPopUp={isPopUp}
      popUpMessage={popUpMessage}
      popUpRgtBtnTitle = {popUpRgtBtnTitle}
      popUpisRgtBtn = {popUpisRgtBtn}
      popUpisLftBtn = {popUpisLftBtn}
      isAuthEnabled = {isAuthEnabled}
      authenticationType = {authenticationType}
      forgotPsd = {forgotPsd}
      loginAction={loginAction}
      forgotPswdAction={forgotPswdAction}
      registerAction={registerAction}
      popOkBtnAction={popOkBtnAction}
      popCancelBtnAction = {popCancelBtnAction}
      backBtnAction = {backBtnAction}
      validateAuthentication = {validateAuthentication}

    />
  );

}

export default LoginComponent;