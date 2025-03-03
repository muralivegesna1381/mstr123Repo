import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import PetReviewUI from './petReviewUI';
import * as DataStorageLocal from './../../../utils/storage/dataStorageLocal';
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';
import * as AppPetsData from '../../../utils/appDataModels/appPetsModel.js';
import * as UserDetailsModel from "./../../../utils/appDataModels/userDetailsModel.js";
import { constants } from 'buffer';
import * as modularPermissions from '../../../utils/appDataModels/modularPermissionsModel.js';

let trace_in_petReview_Screen;
let trace_Submit_SOB_Details_Api_Complete;
const DUPLICATE_PET = 5;

const PetReviewComponent = ({ navigation, route, ...props }) => {

  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpTitle, set_popUpTitle] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popLeftTitle, set_popLeftTitle] = useState(false);
  const [popRightTitle, set_popRightTitle] = useState(false);
  const [isLftBtnEnable, set_isLftBtnEnable] = useState(false);
  const [sobJson, set_sobJson] = useState(undefined);
  const [isLoading, set_isLoading] = useState(false);
  const [email, set_email] = useState(undefined);
  const [name, set_name] = useState(undefined);
  const [phNo, set_phNo] = useState(undefined);
  const [isdCodeID, set_isdCodeID] = useState(undefined);
  const [petId, set_petId] = useState(undefined);
  const [petsArray, set_petsArray] = useState(undefined);
  const [defaultPet, set_defaultPet] = useState(undefined);
  const [firstName, set_firstName] = useState(undefined);
  const [lastName, set_lastName] = useState(undefined);
  const [isSOBSubmitted, set_isSOBSubmitted] = useState(false);
  const [petAddress, set_petAddress] = useState(undefined);
  const [petAddressObj, set_petAddressObj] = useState(undefined);
  const [date, set_Date] = useState(new Date());
  const [isWithoutDevice, set_isWithoutDevice] = useState(false);
  const [feedingText, set_feedingText] = useState('--');

  let petIdRef = useRef();
  let petParentIDRef = useRef();
  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);
  let finalJson = useRef(undefined);

  useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_SOB_Review);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_Review, "User in SOB Pet Review selection Screen", '');
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

  const stopFBTrace = async () => {
    await trace_Submit_SOB_Details_Api_Complete.stop();
  };

  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  const initialSessionStart = async () => {
    trace_in_petReview_Screen = await perf().startTrace('t_inSOBReviewScreen');
  };

  const initialSessionStop = async () => {
    await trace_in_petReview_Screen.stop();
  };

  const getSOBDetails = async () => {

    let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
    sJson = JSON.parse(sJson);
    if (sJson) {
      set_sobJson(sJson);
      if(sJson.isWithourDevice) {
        set_isWithoutDevice(sJson.isWithourDevice);
      }
      
      if(sJson.petParentObj) {
        set_name(sJson.petParentObj.fullName);
        set_firstName(sJson.petParentObj.firstName);
        set_lastName(sJson.petParentObj.lastName);
        set_email(sJson.petParentObj.email);
        set_phNo(sJson.petParentObj.phoneNumber);
        set_isdCodeID(sJson.petParentObj.isdCodeId? sJson.petParentObj.isdCodeId :0)
      }

      if(sJson.eatTimeArray) {
        let temp = ''
        for (let i = 0; i < sJson.eatTimeArray.length; i++) {
          if(i === sJson.eatTimeArray.length-1) {
            temp = temp + sJson.eatTimeArray[i].feedingPreference
          } else {
            temp = temp + sJson.eatTimeArray[i].feedingPreference+', '
          }
          
        }
      set_feedingText(temp)
      }

      let userRole = UserDetailsModel.userDetailsData.userRole.RoleId;
      //for representive provide pet parent info as what they entered
      if (parseInt(userRole) === 9) {
        let petParentData = await DataStorageLocal.getDataFromAsync(Constant.PET_PARENT_DATA);
        petParentData = JSON.parse(petParentData)
        set_name(petParentData.firstName + " " + petParentData.lastName);
        set_firstName(petParentData.firstName);
        set_lastName(petParentData.lastName);
        set_email(petParentData.email);
        set_phNo(petParentData.phoneNumber);
        set_isdCodeID(petParentData.IsdCodeId)
      }

      if (sJson.isSameAddress === 'same') {
        set_petAddressObj(sJson.petParentObj.address);
        let tempLine2 = sJson.petParentObj.address.address2 && sJson.petParentObj.address.address2 !== '' ? sJson.petParentObj.address.address2 + ', ' : '';
        let address = sJson.petParentObj.address.address1 + ', '
                + tempLine2
                + sJson.petParentObj.address.city + ', '
                + sJson.petParentObj.address.state+ ', '
                + sJson.petParentObj.address.country+ ', '
                + sJson.petParentObj.address.zipCode;
        set_petAddress(address);
      } else if(sJson.isSameAddress === 'notSame' && sJson.petLocationNew && Object.keys(sJson.petLocationNew).length !== 0) {
        set_petAddressObj(sJson.petLocationNew);
        let tempLine2 = sJson.petLocationNew.address2 && sJson.petLocationNew.address2 !== '' ? sJson.petLocationNew.address2 + ', ' : '';
        let address = sJson.petLocationNew.address1 + ', '
                + tempLine2
                + sJson.petLocationNew.city + ', '
                + sJson.petLocationNew.state+ ', '
                + sJson.petLocationNew.country+ ', '
                + sJson.petLocationNew.zipCode;
        set_petAddress(address);
      }
    }
  };

  const submitAction = async () => {
    if (email) {
      jsonSerivceAPICall();
    } else {
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.PET_CREATE_UNSUCCESS_MSG, true, 1, 'CANCEL', 'OK', false);
    }
  };

  const setDefaultPet = async (pets, petId) => {

    let obj = findArrayElementByPetId(pets, petId);
    set_defaultPet(obj);

    if(obj && obj.devices && obj.devices.length > 0) {
      AppPetsData.petsData.isDeviceSetupDone = obj.devices[0].isDeviceSetupDone;
      AppPetsData.petsData.isDeviceMissing = false;
    } else {
      AppPetsData.petsData.isDeviceSetupDone = true;
      AppPetsData.petsData.isDeviceMissing = true;
    }
    AppPetsData.petsData.totalPets = pets;
    AppPetsData.petsData.defaultPet = obj;

    let modularity = modularPermissionsData = {
      "isFmGraph" : false,
      "isFmDataService" : false,
      "isFmGoalSet" : false,
      "isSleepGraph" : false,
      "isPetWeight" : false,
      "isEatingEnthusiasm" : false,
      "isImageScoring" : false,
      "ptExists" : false,
      "isWeightPer" : false,
      "isQuestionnaireEnable" : false,
      "isObsEnable" : false,
      "isTimerEnable" : false,
      "isFoodHistory" : false,
      "isFeedingReq" : false,
      "isTimer" : false,
      "isPTEnable" : false
    }

    modularPermissions.modularPermissionsData = modularity;

  };

  function findArrayElementByPetId(pets, petId) {
    return pets.find((element) => {
      return element.petID === petId;
    })
  };

  const getUserPets = async () => {
    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    getSOBPets(clientId);
  };

  const getSOBPets = async (client) => {

    set_isLoading(true);
    isLoadingdRef.current = 1;

    let apiMethod = apiMethodManager.GET_PETPARENT_PETS + client;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    set_isLoading(false);
    isLoadingdRef.current = 0;
        
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {

      if(apiService.data.petDevices.length > 0){

        if (sobJson.deviceNo && sobJson.deviceNo && sobJson.deviceNo === '' ) {
          sendFeedingPrefsToBackend(); 
        } else {
          await setDefaultPet(apiService.data.petDevices, petIdRef.current);
          set_petsArray(apiService.data.petDevices);
          sendFeedingPrefsToBackend();   
        }
          
      } 
            
    } else if(apiService && apiService.isInternet === false) {

      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 1, 'CANCEL', 'OK', false);
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

      createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, true, 1, 'CANCEL', 'OK', false);
    
    } else {

      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.PET_CREATE_UNSUCCESS_MSG, true, 1, 'CANCEL', 'OK', false);

    }

  };

  const jsonSerivceAPICall = async () => {

    var todayDate = new Date();
    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api, firebaseHelper.screen_SOB_Review, "Initiating the Onboarding Pet Api : " + clientId, '');

    if (sobJson) {

      let spayedVal = sobJson.isNeutered === "YES" ? true : false;
      let unknownVal = sobJson.knownAge ? true : false;
      let sensorType = sobJson.deviceType ? sobJson.deviceType : "";
      let deviceNo = sobJson.deviceNo ? sobJson.deviceNo : ""

      var finalJSON = {
        About: {
          PetID: "",
          PetName: sobJson.petName,
          PetBirthday: sobJson.petAge,
          PetGender: sobJson.gender,
          IsNeutered: spayedVal + "",
          PetWeight: sobJson.weight + "",
          WeightUnit: sobJson.weightType,
          PetBFI: "",
          PetAge: "",
          IsMixed: "false",
          PetBreedID: sobJson.breedId + "",
          PetBreedName: sobJson.breedName,
          PetMixBreed: "",
          IsUnknown: unknownVal + "",
          ExtPatientID: "",
          ExtPatientIDValue: "",
          PetAddress: petAddressObj,
          IsPetWithPetParent: sobJson.isPetWithPetParent,//sobJson.isPetWithPetParent === 0 ? 'false' : 'true',
          brandId: sobJson.brandId,
          foodIntake: sobJson.foodIntake,
          feedUnit: sobJson.dietAmountType,
        },
        Plan: {
          PlanTypeID: "55",
          IsFree: "false",
          IsPickup: "false",
          IsApplyCoupon: "false",
          IsJoinCompetition: "false",
          DiagnosisData: [
            {
              DiagnosisTypeID: "3677",
              DiagnosisOrder: "1",
              DiagnosisTypeName: "None",
              DiagnosisDateTime: null,
              TreatmentCount: "0",
              Treatment: [],
            },
          ],
        },

        Goals: {
          GoalData: [],
        },

        Device: {
          SensorAssigned: false,
          SensorNumber: sobJson.deviceNo ? sobJson.deviceNo : '',
          BasestationNumber: null,
          DeviceAddDate: todayDate.toString(),
          DeviceType: sensorType ? "Sensor" + "###" + sensorType : '',
        },

        Client: {
          ClientID: clientId + "",
          ClientEmail: email,
          ClientFullName: name,
          ClientFirstName: firstName,
          ClientLastName: lastName,
          ClientPhone: phNo,
          IsdCodeId:isdCodeID
        },

        Billing: {
          Token: "",
          CustomerID: "",
          SubscriptionID: "",
          IsFree: false,
        },

        BillingAddress: {
          ClientShippingAddressID: null,
          Address1: "",
          Address2: "",
          ClientID: null,
          StateCode: "",
          City: "",
          ZipCode: "",
          Country: null,
          CountryCode: "US",
          FullName: "",
        },

        Products: [],

        ProductSubscription: {
          SubscriptionFrequency: "",
          FirstShippentInterval: "",
          EstimateOrderTotal: "",
          EstitmateOrderTax: "0",
          EstimatedOrderShipping: "",
        },
      };

    }
    finalJson.current = finalJSON;
    ////// JSON preparation, all the data entered by user is validated and then preparing the JSON ////////  
    /////// Sending this JSON to backend service API ///////
    set_isLoading(true);
    isLoadingdRef.current = 1;
    validateDuplicatePet(clientId);

  };

  const validateDuplicatePet = async (clientId) => {

    let duplicateJson = {
      petName: sobJson.petName,
      breedId: sobJson.breedId,
      gender: sobJson.gender,
      petParentId: clientId
    }

    let apiMethod = apiMethodManager.VALIDATE_DUPLICATE_PET;
    let apiService = await apiRequest.postData(apiMethod,duplicateJson,Constant.SERVICE_JAVA,navigation);
    set_isLoading(false);
    isLoadingdRef.current = 0;
        
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      sobRequest();

    } else if(apiService && apiService.isInternet === false) {

      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 1, 'CANCEL', 'OK', false);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Validate_Pet_fail, firebaseHelper.screen_SOB_Review, "SOB Review Validate Pet fail", 'Internet : false');
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
      createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, true, DUPLICATE_PET, 'NO', 'YES', true);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Validate_Pet_fail, firebaseHelper.screen_SOB_Review, "SOB Review Validate Pet fail", 'error : ' + apiService.error.errorMsg);
    
    } else {
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.PET_CREATE_UNSUCCESS_MSG, true, 1, 'CANCEL', 'OK', false);

    }

  };

  const sobRequest = async () => {

    let apiMethod = apiMethodManager.COMPLETE_ONBOARD_INFO;
    let apiService = await apiRequest.postData(apiMethod,finalJson.current,Constant.SERVICE_MIGRATED,navigation);
    set_isLoading(false);
    isLoadingdRef.current = 0;
    stopFBTrace();
        
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      
      if (apiService.data) {

          set_petId(apiService.data.petID);
          petIdRef.current = apiService.data.petID;
          petParentIDRef.current = apiService.data.petParentId;
          
        if (sobJson.deviceNo && sobJson.deviceNo && sobJson.deviceNo === '' ) {

        } else {
          set_isSOBSubmitted(true);
          saveFirstTimeUser(false);
          getUserPets();
        }

      } else {
        createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true, 1, 'CANCEL', 'OK', false);
      }
      
    } else if(apiService && apiService.isInternet === false) {

      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 1, 'CANCEL', 'OK', false);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api_fail, firebaseHelper.screen_SOB_Review, "Onboarding Api fail", 'Internet : false');
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

      set_isSOBSubmitted(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, true, 1, 'CANCEL', 'OK', true);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api_fail, firebaseHelper.screen_SOB_Review, "Onboarding Api fail", 'error : '+apiService.error.errorMsg);
      
    } else {

      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api_fail, firebaseHelper.screen_SOB_Review, "Onboarding Api fail", 'Service Status : false');
      set_isSOBSubmitted(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.PET_CREATE_UNSUCCESS_MSG, true, 1, 'CANCEL', 'OK', true);

    }

  };

  const sendFeedingPrefsToBackend = async () => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let tempArray = []

    if (sobJson) {
      for (let i = 0; i < sobJson.eatTimeArray.length; i++) {
        tempArray.push(sobJson.eatTimeArray[i].feedingPreferenceId)
      }
    }

    let obj = {
      "petId": petIdRef.current,
      "userId": clientId,
      "petFeedingPreferences": tempArray
    };

    let apiMethod = apiMethodManager.ADD_FEEDING_PREFERENCES;
    let apiService = await apiRequest.postData(apiMethod,obj,Constant.SERVICE_JAVA,navigation);
    set_isLoading(false);
    isLoadingdRef.current = 0;
        
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
      
      let type = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_PET_BFI);
      if (type === Constant.IS_FROM_PET_BFI) {
        createPopup('Congratulations', Constant.PET_CREATE_SUCCESS_MSG_FROM_BFI, true, 1, 'CANCEL', 'OK', false);
      } else {
        createPopup('Congratulations', Constant.PET_CREATE_SUCCESS_MSG, true, 1, 'CANCEL', 'OK', false);
        
      }
      
    } else if(apiService && apiService.isInternet === false) {

      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 1, 'CANCEL', 'OK', false);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Feeding_Pref_fail, firebaseHelper.screen_SOB_Review, "SOB Feeding Pref Api fail", 'Internet : false');
            
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

      set_isSOBSubmitted(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.PET_CREATE_UNSUCCESS_MSG, true, 1, 'CANCEL', 'OK', false);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Feeding_Pref_fail, firebaseHelper.screen_SOB_Review, "SOB Feeding Pref Api fail", 'error : ' + apiService.error.errorMsg);
    
    } else {
      set_isSOBSubmitted(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.PET_CREATE_UNSUCCESS_MSG, true, 1, 'CANCEL', 'OK', false);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Feeding_Pref_fail, firebaseHelper.screen_SOB_Review, "SOB Feeding Pref Api fail", 'Service Status : false');

    }

  };

  const navigateToPrevious = () => {
    if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
      firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_SOB_Review, "User clicked on back button to navigate to DeviceValidationComponent", '');
      navigation.pop();
    }
  };

  const createPopup = (title, msg, isPop, popId, pLftTitle, pRgtTitle, isLeftBtn) => {
    set_popUpTitle(title);
    set_popUpMessage(msg);
    set_isPopUp(isPop);
    popIdRef.current = popId;
    set_popLeftTitle(pLftTitle);
    set_popRightTitle(pRgtTitle);
    set_isLftBtnEnable(isLeftBtn)
  };

  const popOkBtnAction = () => {

    if (popIdRef.current === DUPLICATE_PET) {
      set_isLoading(true);
      isLoadingdRef.current = 1;
      sobRequest();
      createPopup('', '', false, 0, '', '', false);
      return
    }

    if (popUpMessage === Constant.PET_CREATE_SUCCESS_MSG) {

      if(isWithoutDevice) {
        updateDashboardData(petsArray);
      } else {
        createPopup('Thank You','Would you like to setup your pet now?',true,1,'LATER','YES',true); 
      }
      
    } else if (popUpMessage === 'Would you like to setup your pet now?') {

      if (popRightTitle === 'YES') {
        savePetsForDashBoardAfterNotiSetting(petsArray);
      } else {
        createPopup('', '', false, 0, '', '', false);
      }
    }else if (popUpMessage === Constant.PET_WITHOUT_SENSOR_MSG) {

      updateDashboardData(petsArray);

    }
    else if (popUpMessage === Constant.PET_CREATE_SUCCESS_MSG_FROM_BFI) {
      //navigate to capture images screen once onboarding success
      navigation.navigate('PetImageCaptureComponent', {
        petID: petId,
        isFromOnboarding: true,
        petParentId:petParentIDRef.current
        
      });
    }
    else {
      createPopup('', '', false, 0, '', '', false);
    }

  };

  const popCancelBtnAction = () => {

    if (popIdRef.current === DUPLICATE_PET) {
      createPopup('', '', false, 0, '', '', false);
      return
    }
    removeOnboardData();
    updateDashboardData(petsArray);
  };

  const updateDashboardData = (petsArray) => {
    navigation.navigate("DashBoardService", { loginPets: petsArray });
  };

  const saveFirstTimeUser = async (value) => {
    AppPetsData.petsData.isFirstUser = value;
  };

  const savePetsForDashBoardAfterNotiSetting = async (arrayPet) => {

    removeOnboardData();
    await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE, '' + 0);

    if (defaultPet.devices[0].deviceModel && defaultPet.devices[0].deviceModel.includes("HPN1")) {
      await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION, 'HPN1Sensor');
    } else {
      await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION, 'Sensor');
    }
    await DataStorageLocal.saveDataToAsync(Constant.SAVE_SOB_PETS, JSON.stringify(arrayPet));

    let devObj = {
      pObj : defaultPet, 
      petItemObj : defaultPet.devices[0],
      actionType : 1,
      isReplaceSensor : 0,
      isForceSync : 0,
      syncDeviceNo : '',
      syncDeviceModel : '',
      configDeviceNo: defaultPet.devices[0].deviceNumber,
      configDeviceModel : defaultPet.devices[0].deviceModel,
      reasonId : '',
      petName : defaultPet.petName,
      deviceNo : defaultPet.devices[0].deviceNumber,
      isDeviceSetupDone : defaultPet.devices[0].isDeviceSetupDone,
      petID: defaultPet.petID,
      isFirmwareReq : defaultPet.devices[0].isFirmwareVersionUpdateRequired
    }

    await DataStorageLocal.saveDataToAsync(Constant.CONFIG_SENSOR_OBJ, JSON.stringify(devObj));
    await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(defaultPet));
    navigation.navigate('SensorInitialComponent', { defaultPetObj: defaultPet });

  };

  const removeOnboardData = async () => {
    await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
  }

  return (
    <PetReviewUI
      sobJson={sobJson}
      name={name}
      phNo={phNo}
      email={email}
      isLoading={isLoading}
      isPopUp={isPopUp}
      popUpMessage={popUpMessage}
      popUpTitle={popUpTitle}
      popLeftTitle={popLeftTitle}
      popRightTitle={popRightTitle}
      isSOBSubmitted={isSOBSubmitted}
      isLftBtnEnable={isLftBtnEnable}
      petAddress={petAddress}
      feedingText = {feedingText}
      popOkBtnAction={popOkBtnAction}
      popCancelBtnAction={popCancelBtnAction}
      navigateToPrevious={navigateToPrevious}
      submitAction={submitAction}
    />
  );

}

export default PetReviewComponent;