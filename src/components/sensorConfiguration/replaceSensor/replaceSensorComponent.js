import React, { useState,useRef } from 'react';
import {BackHandler} from 'react-native';
import ReplaceSensorUI from './replaceSensorUI.js';
import * as DataStorageLocal from "../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../../utils/getServicesData/getServicesData.js';

const POP_SYNC = 1;
const INVALID_DEVICE = 2;
let trace_inReplaceSensorScreen;

const ReplaceSensorComponent = ({navigation, route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMessage, set_popupMessage] = useState(undefined);
    const [isPopLeftBtnEnable, set_isPopLftBtnEnable] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [popupAlert,set_popupAlert] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [deviceNumber, set_deviceNumber] = useState();
    const [deviceNumberNew, set_deviceNumberNew] = useState('');
    const [petName, set_petName] = useState(undefined);
    const [devModel, set_devModel] = useState(undefined);
    const [devModelNew, set_devModelNew] = useState(undefined);
    const [reasonId, set_reasonId] = useState(undefined);
    const [nextBtnEnable, set_nextBtnEnable] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(null);
    const [isSensorType, set_isSensorType] = useState(false);
    const [sensorType, set_sensorType] = useState(null);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let deviceNumberNewRef = useRef(undefined);
    let deviceModelNewRef = useRef(undefined);

    React.useEffect(() => {
      
      getDetails();
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_Replace_Sensor);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_Replace_Sensor, "User in Replace Sensor Screen", '');
      });

      const unsubscribe = navigation.addListener('blur', () => {
      });

      return () => {
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
          focus();
          unsubscribe();
          initialSessionStop();
        };

    }, [[]]);

    const initialSessionStart = async () => {
      trace_inReplaceSensorScreen = await perf().startTrace('t_inReplaceSensorScreen');
    };
    
    const initialSessionStop = async () => {
      await trace_inReplaceSensorScreen.stop();
    };

    const getDetails = async () => {

      let configObj = await DataStorageLocal.getDataFromAsync(Constant.CONFIG_SENSOR_OBJ);
      configObj = JSON.parse(configObj);

      if(configObj) {
        set_deviceNumber(configObj.petItemObj.deviceNumber);
        set_petName(configObj.petName);
        set_devModel(configObj.petItemObj.deviceModel);
      }

    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const navigateToPrevious = () => {  
        navigation.navigate('AllDevicesListComponent');
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
      // validateDeviceInitiation(deviceNo)
    } else {
      // set_isDeviceValidated(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE,"Please enter Valid Device Number (DN)",true,false,2);
    }

  };

    const validateNewDevice = (newDeviceNo) => {

      if(devModel.includes('HPN')) {

      } else {
        if(newDeviceNo && newDeviceNo.length > 6) {
          set_deviceNumberNew(newDeviceNo);
          deviceNumberNewRef.current = newDeviceNo;
          validateSensor(newDeviceNo.toUpperCase());
        }
      }
        
    };

    const nextBtnAction = (newDeviceNo,value) => {
      set_deviceNumberNew(newDeviceNo);
      deviceNumberNewRef.current = newDeviceNo;
      validateDeviceInitiation(newDeviceNo)
    };

    const validateDeviceInitiation = async (deviceNo) => {

      set_deviceNumberNew(deviceNo)
      deviceNumberNewRef.current = deviceNo;
      set_isLoading(true);
      isLoadingdRef.current = 1;
      let clientID = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
      let json = {
        SensorNumber: "" + deviceNo,
        ClientID: "" + clientID,
      };
      validateDeviceFromBackend(json,token,deviceNo)
  
    };
  
    const validateDeviceFromBackend = async (json,token,deviceNo) => {

      let vDeviceServiceObj = await ServiceCalls.validateDeviceNumber(json,token);
      set_isLoading(false);
      isLoadingdRef.current = 0;
      if(vDeviceServiceObj && vDeviceServiceObj.logoutData){
        firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Device number Api fail", 'error : Duplicate login');
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
        return;
      }
        
      if(vDeviceServiceObj && !vDeviceServiceObj.isInternet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,false,1);
        return;
      }
  
      if(vDeviceServiceObj && vDeviceServiceObj.statusData){
        
        if(vDeviceServiceObj.responseData && vDeviceServiceObj.responseData.error){
          createPopup(Constant.ALERT_DEFAULT_TITLE,vDeviceServiceObj.responseData.message,true,false,0);
        } else {

          if(reasonId === 3) {

            let configObj = await DataStorageLocal.getDataFromAsync(Constant.CONFIG_SENSOR_OBJ);
            configObj = JSON.parse(configObj);
            if(configObj.petItemObj.isDeviceSetupDone) {
              createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.CONFIRN_FORCE_SYNC,true,true,1);
            } else {
              replaceSensorNavi('newSensor',0,deviceNo);
            }
            
          } else {
            replaceSensorNavi('newSensor',0,deviceNo);
          }
          
        }
        
      } else {
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,false,0);
      }
  
      if(vDeviceServiceObj && vDeviceServiceObj.error) {
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,false,0);
      }
  
    };

    const createPopup = (title,msg,isPop,isLeftBtn,refId) => {
      set_popupAlert(title);
      set_popupMessage(msg);
      set_isPopUp(isPop);
      set_isPopLftBtnEnable(isLeftBtn)
      popIdRef.current = refId;
    };

    const popOkBtnAction = () => {
      
      if(popIdRef.current === POP_SYNC) {
        replaceSensorNavi('fSync',1,deviceNumberNew);
      }

      else if(popIdRef.current === INVALID_DEVICE) {
        set_nextBtnEnable(false);
        set_deviceNumberNew('');
      } else {
        set_nextBtnEnable(false);
        set_deviceNumberNew('');
      }
      createPopup('','',false,false,0);
    };

    const replaceSensorNavi = async (value,isForceSync,deviceNo) => {

      let configurePet = await DataStorageLocal.getDataFromAsync(Constant.CONFIG_SENSOR_OBJ);
      configurePet = JSON.parse(configurePet);
      configurePet.isReplaceSensor = 1;
      configurePet.isForceSync = isForceSync;
      configurePet.syncDeviceNo = deviceNumber;
      configurePet.syncDeviceModel = devModel;
      configurePet.reasonId = reasonId;
      configurePet.configDeviceNo =  deviceNumberNewRef.current;
      configurePet.configDeviceModel = deviceModelNewRef.current,

      await DataStorageLocal.saveDataToAsync(Constant.CONFIG_SENSOR_OBJ, JSON.stringify(configurePet));
      if(value === 'newSensor') {
        navigation.navigate('SensorInitialComponent');
      } else {
        navigation.navigate('ReplaceSyncRequestComponent',{deviceNo:isForceSync === 0 ? deviceNumberNew : deviceNumber,deviceModel:isForceSync === 0 ? devModelNew : devModel});
      }

    };

    const popCancelBtnAction = () => {
      replaceSensorNavi('newSensor',0);
      createPopup('','',false,false,0);     
    };

    const actionOnSensortype = (value) => {
      deviceModelNewRef.current = value;
      set_devModelNew(value);
    };

    const updateReason = (item, index) => {

      set_reasonId(item.id);
      set_selectedIndex(index);
      if(index + 1 && deviceNumberNew  && sensorType) {
        set_nextBtnEnable(true);
      } else {
        set_nextBtnEnable(false);
      }

    };

    const updateHPNDeviceNo = (value) => {
      set_deviceNumberNew(value)
    };

    const validateNewDeviceCode = (value) => {
        
      value = value.replace(/[`~!@#$%^&*()_ |+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');//(/[^\w\s]/gi, '');
      if (sensorType.includes('HPN1')) {
          
        let input = value;
        const first = input.substring(0, 4);
        const middle = input.substring(4, 7);
        const last = input.substring(7, 19);

        if (input.length > 7) {
          input = `${first}-${middle}-${last}`
        }
        else if (input.length > 4) {
          input = `${first}-${middle}`
        }
        else if (input.length >= 0) {
          input = input
        }
      
        set_deviceNumberNew(input.toUpperCase())
        // props.updateHPNDeviceNo(value)

      } else {
        // newDeviceNoRef.current = value.toUpperCase()
        set_deviceNumberNew(value.toUpperCase())
        validateNewDevice(value.toUpperCase());
      }

      if(sensorType.includes('HPN1')) {

        if(selectedIndex !== null && value.length > 16 && sensorType) {
          set_nextBtnEnable(true);
        } else {
          set_nextBtnEnable(false);
        }

      } else {

        if(selectedIndex !== null && value.length > 6 && sensorType) {
          set_nextBtnEnable(true);
        } else {
          set_nextBtnEnable(false);
        }

      }
      
    };

    const selectSensorTypeDrop = () => {
      set_isSensorType(!isSensorType);
    };

    const actionOnOptiontype = (value) => {
       
      set_isSensorType(!isSensorType);
      if(value.id !== 4) {
        if(value.name !== sensorType) {
          set_deviceNumberNew(null);
          set_nextBtnEnable(false);
        }
        deviceModelNewRef.current = value.name;
        set_sensorType(value.name);
      }
  };

    return (
      <ReplaceSensorUI 
        isLoading = {isLoading}
        isPopUp = {isPopUp}
        popupMessage = {popupMessage}
        popupAlert = {popupAlert}
        petName = {petName}
        deviceNumber = {deviceNumber}
        devModel = {devModel}
        deviceNumberNew = {deviceNumberNew}
        isPopLeftBtnEnable = {isPopLeftBtnEnable}
        nextBtnEnable = {nextBtnEnable}
        selectedIndex = {selectedIndex}
        isSensorType = {isSensorType}
        sensorType = {sensorType}
        navigateToPrevious = {navigateToPrevious}
        popOkBtnAction = {popOkBtnAction}
        validateNewDevice = {validateNewDevice}
        nextBtnAction = {nextBtnAction}
        popCancelBtnAction = {popCancelBtnAction}
        // actionOnSensortype = {actionOnSensortype}
        updateReason = {updateReason}
        updateHPNDeviceNo = {updateHPNDeviceNo}
        validateNewDeviceCode = {validateNewDeviceCode}
        selectSensorTypeDrop = {selectSensorTypeDrop}
        actionOnOptiontype = {actionOnOptiontype}
      />
    );

  }
  
  export default ReplaceSensorComponent;