import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import DeviceValidationUI from './deviceValidationUI';
import * as Queries from "./../../../config/apollo/queries";
import * as Constant from "./../../../utils/constants/constant";
import * as internetCheck from "./../../../utils/internetCheck/internetCheck"
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import moment from "moment";
import * as ApolloClient from "./../../../config/apollo/apolloConfig";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../../utils/getServicesData/getServicesData.js';

let trace_indeviceValidationScreen;
let trace_ValidateDeviceNumber_API_Complete;
let trace_Validate_DeviceNumber_API_Complete;

const DeviceValidationComponent = ({ navigation, route, ...props }) => {

  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpTitle, set_popUpTitle] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popupLeftBtnEnable, set_popupLeftBtnEnable] = useState(false);
  const [deviceNo, set_deviceNo] = useState(undefined);
  const [isDeviceValidated, set_isDeviceValidated] = useState(false);
  const [isLoading, set_isLoading] = useState(false);
  const [deviceType, set_deviceType] = useState(undefined);
  const [petId, set_petId] = useState(undefined);
  const [date, set_Date] = useState(new Date());
  const [isFromType, set_isFromType] = useState(undefined);

  let petIdRef = useRef();
  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);
  let sJosnObj = useRef({});
  
  React.useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_SOB_deviceNumber);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_deviceNumber, "User in Device Validation Screen", '');
      getPetIdValue();
      getSOBDetails();
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

  useEffect(() => {

    if (route.params?.value) {
      set_isFromType(route.params?.value);
    }

    if (route.params?.sensorType) {
      set_deviceType(route.params?.sensorType);
    }

  }, [route.params?.value, route.params?.deviceType]);

  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  const initialSessionStart = async () => {
    trace_indeviceValidationScreen = await perf().startTrace('t_inDeviceValidationScreen');
  };

  const initialSessionStop = async () => {
    await trace_indeviceValidationScreen.stop();
  };

  const stopDeviceFBTrace = async () => {
    await trace_Validate_DeviceNumber_API_Complete.stop();
  };

  const getSOBDetails = async () => {

    let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
    sJson = JSON.parse(sJson);

    if (sJson) {
      sJosnObj.current = sJson;
      set_deviceType(sJson.deviceType);
      if (sJson.deviceNo) {

        set_deviceNo(sJson.deviceNo);
        set_isDeviceValidated(true);

      }
    }
  };

  const navigateToReview = async () => {
    sJosnObj.current.deviceNo = deviceNo;
    await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));
    firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_submit, firebaseHelper.screen_SOB_deviceNumber, "User entered Device Number", 'Device Number : ' + deviceNo);
    navigation.navigate('PetReviewComponent');
  };

  const getPetIdValue = async () => {
    let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    petObj = JSON.parse(petObj);
    if (petObj) {
      set_petId(petObj.petID);
      petIdRef.current = petObj.petID;
    }
  };

  const submitAction = async () => {
    let internet = await internetCheck.internetCheck();
    if (!internet) {
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,false,1);
    } else {
      if (deviceType && deviceType.includes('HPN1')) {

        // if (isFromType === 'AddDevice') {
        //   assigntheSensor();
        // } else {
          // navigateToReview();
          validateDeviceInitiation();
        // }

      } else {
        validateDeviceInitiation();
      }
    }
  }

  const navigateToPrevious = () => {
    if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
      firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_SOB_deviceNumber, "User clicked on back button to navigate to SensorTypeComponent", '');
      navigation.navigate('SensorTypeComponent');
    }
  };

  const popOkBtnAction = async (value) => {

    createPopup(undefined,undefined,false,false,0);

    if (value === "CONFIGURE") {
      let defaultPet = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
      defaultPet = JSON.parse(defaultPet);
      // updateDashboardDataOnConfigure()
      if (defaultPet && defaultPet.devices.length > 0) {

        for (let i = 0; i < defaultPet.devices.length; i++) {

          if (defaultPet.devices[i].deviceNumber && defaultPet.devices[i].deviceNumber !== '') {

            if (defaultPet.devices[i].deviceModel && defaultPet.devices[i].deviceModel.includes('HPN1')) {

              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION, 'HPN1Sensor');
              await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE, "" + i);

            } else {

              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION, 'Sensor');
              await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE, "" + i);

            }

          }

        }

      }

      navigation.navigate('SensorInitialComponent', { defaultPetObj: defaultPet });
    }

  };

  const popCancelBtnAction = () => {
    createPopup('','',false,false,0);
    updateDashboardData();
  };

  const updateDashboardData = () => {
    navigation.navigate("DashBoardService");
  };

  const updateDashboardDataOnConfigure = () => {
    ApolloClient.client.writeQuery({ query: Queries.UPDATE_DASHBOARD_DATA, data: { data: { isRefresh: 'refresh', __typename: 'UpdateDashboardData' } }, });
  };

  const validateDeviceNo = (dNo) => {

    set_deviceNo(dNo.toUpperCase());
    if (deviceType.includes('HPN1')) {
      if (dNo.length > 18) {
        set_isDeviceValidated(true);
      } else {
        set_isDeviceValidated(false);
      }

    } else {
      if (dNo.length === 7) {
        validateSensor(dNo.toUpperCase());
      } else {
        set_isDeviceValidated(false);
      }
    }

  };

  /* User entered device number is validated through pre-defined validations
     * On success the device number will be validated again through service API
     * The abouve API validation is to check that the user entered Device number is associated to the current user ot not
     * if not an alert message will be shown to user
     */
  const validateSensor = (deviceNo) => {
    
    var value = deviceNo;
    var tempValue;

    var thisIsValid = true;
    if (value.length == 0) {
      thisIsValid = false;
    }

    if (thisIsValid) {

      tempValue = value.replace(/_/g, "").replace(/-/g, "");
      if (new RegExp(/[^0-9A-F]/g).test(tempValue)) {
        thisIsValid = false;
      }
    }

    if (thisIsValid) {
      if (value.replace(/_/g, "").length != 7) {
        thisIsValid = false;
      }
    }

    if (thisIsValid) {
      var lastChar = tempValue.substr(tempValue.length - 1, 1);
      tempValue = "0C8A87" + tempValue.substr(0, tempValue.length - 1);

      var hex;
      var sum = 0;
      var n = 16;
      var checkedChar = "";

      for (var i = tempValue.length - 1; i >= 0; i--) {
        var currentValue = 0;
        var codePoint = parseInt(tempValue.substr(i, 1), n);
        if ((i + 1) % 2 == 0) {
          hex = (codePoint * 2).toString(n);
          for (var j = 0; j < hex.length; j++) {
            if (isFinite(hex.substr(j, 1))) {
              currentValue += parseInt(hex.substr(j, 1));
            } else {
              currentValue += parseInt(hex.substr(j, 1), n);
            }
          }
        } else {
          currentValue += codePoint;
        }
        sum += currentValue;
      }
      if (sum % 16 > 0) {
        checkedChar = 16 - (sum % 16);
      } else {
        checkedChar = 0;
      }

      if (checkedChar.toString(n).toUpperCase() != lastChar) {
        thisIsValid = false;
      }
    }

    if (thisIsValid) {
      set_isDeviceValidated(true);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_Sequence_validation, firebaseHelper.screen_SOB_deviceNumber, "Validating Device number sequence", 'Validated : Valid Device Number');
    } else {
      firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_Sequence_validation, firebaseHelper.screen_SOB_deviceNumber, "Validating Device number sequence", 'Validated : InValid Device Number');
      set_isDeviceValidated(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE,"Please enter Valid Device Number (DN)",true,false,1);
    }

  };

  const validateDeviceInitiation = async () => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let clientID = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_api, firebaseHelper.screen_SOB_deviceNumber, "Checks the Device number from backend Initialising : " + deviceNo, 'Client Id : ' + clientID);
    let json = {
      SensorNumber: "" + deviceNo,
      ClientID: "" + clientID,
    };
    trace_Validate_DeviceNumber_API_Complete = await perf().startTrace('t_ValidateDeviceNumber_API');
    validateDeviceFromBackend(json,token)

  };

  const validateDeviceFromBackend = async (json,token) => {

    let vDeviceServiceObj = await ServiceCalls.validateDeviceNumber(json,token);
    set_isLoading(false);
    isLoadingdRef.current = 0;
    stopDeviceFBTrace();

    if(vDeviceServiceObj && vDeviceServiceObj.logoutData){
      firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Device number Api fail", 'error : Duplicate login');
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }
      
    if(vDeviceServiceObj && !vDeviceServiceObj.isInternet){
      firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Device number Api fail", 'error : No Internet connection');
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,false,1);
      return;
    }

    if(vDeviceServiceObj && vDeviceServiceObj.statusData){
      
      if(vDeviceServiceObj.responseData && vDeviceServiceObj.responseData.error){
        createPopup(Constant.ALERT_DEFAULT_TITLE,vDeviceServiceObj.responseData.message,true,false,1);
      } else {

        firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_api_success, firebaseHelper.screen_SOB_deviceNumber, "Device number Api Success", '');
        if (isFromType === 'AddDevice') {
          assigntheSensor();
        } else {
          navigateToReview();
        }
        
      }
      
    } else {
      firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Device number Api fail", 'error : ');
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,false,1);
    }

    if(vDeviceServiceObj && vDeviceServiceObj.error) {
      firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Device number Api fail", 'error : ');
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,false,1);
    }

  };

  const assigntheSensor = async () => {

    let clientID = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    petObj = JSON.parse(petObj);
    let newDate = moment(new Date()).format("YYYY-MM-DD")
    var finalJSON = {
      "petId": petObj.petID,
      "petParentId": clientID,
      "deviceNumber": deviceNo,
      "deviceType": "Sensor" + "###" + deviceType,
      "assignedDate": newDate
    };

    firebaseHelper.logEvent(firebaseHelper.event_SOB_device_numbe_missing_assign, firebaseHelper.screen_SOB_deviceNumber, "Assigning the Device number Device missing Flow : " + deviceNo, 'pet Id : ' + petObj.petID);
    configurePetBackendAPI(finalJSON,petObj.petID);
  };

  const configurePetBackendAPI = async (json,petid) => {

    trace_ValidateDeviceNumber_API_Complete = await perf().startTrace('t_AssignSensorToPet_API');
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);;

    let assignSensorServiceObj = await ServiceCalls.assignSensorToPet(json,token);
    stopFBTrace();

    if(assignSensorServiceObj && assignSensorServiceObj.logoutData){
      firebaseHelper.logEvent(firebaseHelper.event_SOB_device_numbe_missing_assign_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Assigning the Device number Device missing Api Fail", 'Unautherised');
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }
      
    if(assignSensorServiceObj && !assignSensorServiceObj.isInternet){
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,false,1);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_device_numbe_missing_assign_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Assigning the Device number Device missing Api Fail", 'Internet : false');
      return;
    }

    if(assignSensorServiceObj && assignSensorServiceObj.statusData){
      getDefaultPet(petid);
    } else {
      set_isLoading(false);
      if(assignSensorServiceObj.responseData && assignSensorServiceObj.responseData[0].message !== '' && assignSensorServiceObj.responseData[0].message) {
        createPopup(Constant.ALERT_DEFAULT_TITLE,data.errors[0].message,true,false,1);
        firebaseHelper.logEvent(firebaseHelper.event_SOB_device_numbe_missing_assign_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Assigning the Device number Device missing Api Fail", 'error : ' + assignSensorServiceObj.responseData[0].message);
      } else {
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,false,1);
        firebaseHelper.logEvent(firebaseHelper.event_SOB_device_numbe_missing_assign_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Assigning the Device number Device missing Api Fail", 'error : ' + Constant.SERVICE_FAIL_MSG);
      }
    }

    if(assignSensorServiceObj && assignSensorServiceObj.error) {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,false,1);
      let errors = assignSensorServiceObj.error.length > 0 ? assignSensorServiceObj.error[0].code : '';
      firebaseHelper.logEvent(firebaseHelper.event_SOB_device_numbe_missing_assign_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Assigning the Device number Device missing Api Fail", 'error : '+errors);
    }

  };

  const getDefaultPet = async (petid) => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);

    let getPetsServiceObj = await ServiceCalls.getPetParentPets(client,token);
    set_isLoading(false);
    isLoadingdRef.current = 0;

    if(getPetsServiceObj && getPetsServiceObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }
    
    if(getPetsServiceObj && !getPetsServiceObj.isInternet){
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,false,1);
      return;
    }

    if(getPetsServiceObj && getPetsServiceObj.statusData && getPetsServiceObj.responseData){
      setDefaultPet(getPetsServiceObj.responseData,petid);
      createPopup('Congratulations!',Constant.SENSOR_ASSIGN_PET_SUCCESS_MSG,true,true,1);
    } else {
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.PET_CREATE_UNSUCCESS_MSG,true,false,1);                 
    }

    if(getPetsServiceObj && getPetsServiceObj.error) {
      set_isSOBSubmitted(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.PET_CREATE_UNSUCCESS_MSG,true,false,1);
    }

  };

  const setDefaultPet = async (pets, petId) => {
    let obj = findArrayElementByPetId(pets, petId);
    await DataStorageLocal.saveDataToAsync(Constant.DEFAULT_PET_OBJECT, JSON.stringify(obj));
    await DataStorageLocal.saveDataToAsync(Constant.TOTAL_PETS_ARRAY, JSON.stringify(pets));
  };

  function findArrayElementByPetId(pets, petId) {
    return pets.find((element) => {
      return element.petID === petId;
    })
  };

  const stopFBTrace = async () => {
    await trace_ValidateDeviceNumber_API_Complete.stop();
  };

  const createPopup = (title,msg,isPop,isLftBtn,popId) => {
    set_popUpTitle(title);
    set_popUpMessage(msg);
    set_isPopUp(isPop);
    set_popupLeftBtnEnable(isLftBtn)
    popIdRef.current = popId;
  };

  return (
    <DeviceValidationUI
      isDeviceValidated={isDeviceValidated}
      deviceNo={deviceNo}
      deviceType={deviceType}
      isLoading={isLoading}
      isPopUp={isPopUp}
      popUpMessage={popUpMessage}
      popUpTitle={popUpTitle}
      popupLeftBtnEnable={popupLeftBtnEnable}
      popOkBtnAction={popOkBtnAction}
      navigateToPrevious={navigateToPrevious}
      submitAction={submitAction}
      validateDeviceNo={validateDeviceNo}
      popCancelBtnAction={popCancelBtnAction}
    />
  );

}

export default DeviceValidationComponent;