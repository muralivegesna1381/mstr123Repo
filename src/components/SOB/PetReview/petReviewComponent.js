import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import PetReviewUI from './petReviewUI';
import * as DataStorageLocal from './../../../utils/storage/dataStorageLocal';
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../../utils/getServicesData/getServicesData.js';

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
  const [petId, set_petId] = useState(undefined);
  const [petsArray, set_petsArray] = useState(undefined);
  const [defaultPet, set_defaultPet] = useState(undefined);
  const [firstName, set_firstName] = useState(undefined);
  const [lastName, set_lastName] = useState(undefined);
  const [isSOBSubmitted, set_isSOBSubmitted] = useState(false);
  const [petAddress, set_petAddress] = useState(undefined);
  const [petAddressObj, set_petAddressObj] = useState(undefined);
  const [date, set_Date] = useState(new Date());

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
      if (sJson.petParentObj) {
        set_name(sJson.petParentObj.fullName);
        set_firstName(sJson.petParentObj.firstName);
        set_lastName(sJson.petParentObj.lastName);
        set_email(sJson.petParentObj.email);
        set_phNo(sJson.petParentObj.phoneNumber);
      }

      let userRole = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_ID);
      //for representive provide pet parent info as what they entered
      if (userRole === '9') {
        let petParentData = await DataStorageLocal.getDataFromAsync(Constant.PET_PARENT_DATA);
        petParentData = JSON.parse(petParentData)
        set_name(petParentData.firstName + " " + petParentData.lastName);
        set_firstName(petParentData.firstName);
        set_lastName(petParentData.lastName);
        set_email(petParentData.email);
        set_phNo(petParentData.phoneNumber);
      }

      console.log("coming to same before: ",sJson.petParentObj)
      if (sJson.isSameAddress === 'same') {
        console.log("coming to same",sJson.petParentObj.address)
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
    await DataStorageLocal.saveDataToAsync(Constant.DEFAULT_PET_OBJECT, JSON.stringify(obj));

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
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

    let serviceCallsObj = await ServiceCalls.getPetParentPets(client, token);

    set_isLoading(false);
    isLoadingdRef.current = 0;

    if (serviceCallsObj && serviceCallsObj.logoutData) {
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if (serviceCallsObj && !serviceCallsObj.isInternet) {
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 1, 'CANCEL', 'OK', false);
      return;
    }

    if (serviceCallsObj && serviceCallsObj.statusData) {

      if (serviceCallsObj.responseData) {
        await setDefaultPet(serviceCallsObj.responseData, petIdRef.current);
        set_petsArray(serviceCallsObj.responseData);
        sendFeedingPrefsToBackend();
      }

    } else {
      set_isSOBSubmitted(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.PET_CREATE_UNSUCCESS_MSG, true, 1, 'CANCEL', 'OK', false);
    }

    if (serviceCallsObj && serviceCallsObj.error) {
      set_isSOBSubmitted(false);
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
          SensorNumber: deviceNo,
          BasestationNumber: null,
          DeviceAddDate: todayDate.toString(),
          DeviceType: "Sensor" + "###" + sensorType,
        },

        Client: {
          ClientID: clientId + "",
          ClientEmail: email,
          ClientFullName: name,
          ClientFirstName: firstName,
          ClientLastName: lastName,
          ClientPhone: phNo,
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

    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    let duplicateJson = {
      petName: sobJson.petName,
      breedId: sobJson.breedId,
      gender: sobJson.gender,
      petParentId: clientId
    }
    let duplicatePetServiceObj = await ServiceCalls.validateDuplicatePet(duplicateJson, token);

    if (duplicatePetServiceObj && duplicatePetServiceObj.logoutData) {
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Validate_Pet_fail, firebaseHelper.screen_SOB_Review, "SOB Review Validate Pet fail", 'Unatherised');
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if (duplicatePetServiceObj && !duplicatePetServiceObj.isInternet) {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 1, 'CANCEL', 'OK', false);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Validate_Pet_fail, firebaseHelper.screen_SOB_Review, "SOB Review Validate Pet fail", 'Internet : false');
      return;
    }

    if (duplicatePetServiceObj && duplicatePetServiceObj.statusData) {
      trace_Submit_SOB_Details_Api_Complete = await perf().startTrace('t_CompleteOnboardingInfo_API');
      sobRequest();
    } else {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      createPopup(Constant.ALERT_DEFAULT_TITLE, duplicatePetServiceObj.responseData, true, DUPLICATE_PET, 'NO', 'YES', true);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Validate_Pet_fail, firebaseHelper.screen_SOB_Review, "SOB Review Validate Pet fail", 'Service call : false');
    }

    if (duplicatePetServiceObj && duplicatePetServiceObj.error) {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.PET_CREATE_UNSUCCESS_MSG, true, 1, 'CANCEL', 'OK', true);
      let errors = duplicatePetServiceObj.error.length > 0 ? duplicatePetServiceObj.error[0].code : '';
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Validate_Pet_fail, firebaseHelper.screen_SOB_Review, "SOB Review Validate Pet fail", 'error : ' + errors);
    }

  };

  const sobRequest = async () => {

    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

    let onBoardPetServiceObj = await ServiceCalls.completeOnboardingInfo(finalJson.current, token);
    console.log("onBoardPetServiceObj prblm-->",onBoardPetServiceObj)
    set_isLoading(false);
    isLoadingdRef.current = 0;
    stopFBTrace();
    if (onBoardPetServiceObj && onBoardPetServiceObj.logoutData) {
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api_fail, firebaseHelper.screen_SOB_Review, "Onboarding Api Fail", 'Unautherised');
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if (onBoardPetServiceObj && !onBoardPetServiceObj.isInternet) {
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 1, 'CANCEL', 'OK', false);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api_fail, firebaseHelper.screen_SOB_Review, "Onboarding Api fail", 'Internet : false');
      return;
    }

    if (onBoardPetServiceObj && onBoardPetServiceObj.statusData) {

      if (onBoardPetServiceObj.responseData) {

        set_petId(onBoardPetServiceObj.responseData.petID);
        petIdRef.current = onBoardPetServiceObj.responseData.petID;
        petParentIDRef.current = onBoardPetServiceObj.responseData.petParentId;
        console.log("onBoardPetServiceObj",onBoardPetServiceObj)
        console.log("petParentIDRef.current",petParentIDRef.current)
        saveFirstTimeUser(false);
        set_isSOBSubmitted(true);
        getUserPets();

      } else {
        createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, true, 1, 'CANCEL', 'OK', false);
      }

    } else {
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api_fail, firebaseHelper.screen_SOB_Review, "Onboarding Api fail", 'Service Status : false');
      set_isSOBSubmitted(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.PET_CREATE_UNSUCCESS_MSG, true, 1, 'CANCEL', 'OK', true);
    }

    if (onBoardPetServiceObj && onBoardPetServiceObj.error) {
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api_fail, firebaseHelper.screen_SOB_Review, "Onboarding Api fail", 'error : Service error');
      set_isSOBSubmitted(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.PET_CREATE_UNSUCCESS_MSG, true, 1, 'CANCEL', 'OK', true);
    }

  };

  const sendFeedingPrefsToBackend = async () => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
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

    let feedPrefServiceObj = await ServiceCalls.addPetFeedingPreferences(obj, token);
    set_isLoading(false);
    isLoadingdRef.current = 0;

    if (feedPrefServiceObj && feedPrefServiceObj.logoutData) {
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Feeding_Pref_fail, firebaseHelper.screen_SOB_Review, "SOB Feeding Pref Api fail", 'Unautherised');
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if (feedPrefServiceObj && !feedPrefServiceObj.isInternet) {
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, 1, 'CANCEL', 'OK', false);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Feeding_Pref_fail, firebaseHelper.screen_SOB_Review, "SOB Feeding Pref Api fail", 'Internet : false');
      return;
    }

    if (feedPrefServiceObj && feedPrefServiceObj.statusData) {
      //change message based on onboarding type
      let type = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_PET_BFI);
      if (type === Constant.IS_FROM_PET_BFI) {
        createPopup('Congratulations', Constant.PET_CREATE_SUCCESS_MSG_FROM_BFI, true, 1, 'CANCEL', 'OK', false);
      } else {
        createPopup('Congratulations', Constant.PET_CREATE_SUCCESS_MSG, true, 1, 'CANCEL', 'OK', false);
      }
    } else {
      set_isSOBSubmitted(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.PET_CREATE_UNSUCCESS_MSG, true, 1, 'CANCEL', 'OK', false);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Feeding_Pref_fail, firebaseHelper.screen_SOB_Review, "SOB Feeding Pref Api fail", 'Service Status : false');
    }

    if (feedPrefServiceObj && feedPrefServiceObj.error) {
      set_isSOBSubmitted(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.PET_CREATE_UNSUCCESS_MSG, true, 1, 'CANCEL', 'OK', false);
      let errors = feedPrefServiceObj.error.length > 0 ? feedPrefServiceObj.error[0].code : '';
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Feeding_Pref_fail, firebaseHelper.screen_SOB_Review, "SOB Feeding Pref Api fail", 'error : ' + errors);
    }

  };

  const navigateToPrevious = async () => {
    navigation.pop()
    // if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
    //   firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_SOB_Review, "User clicked on back button to navigate to DeviceValidationComponent", '');
    //   navigation.navigate('DeviceValidationComponent');

    //   //redirect to address screen/Device validation based on condition
    //   let type = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_PET_BFI);
    //   if (type === Constant.IS_FROM_PET_BFI) {
    //     navigation.navigate('PetAddressComponent');
    //   } else {
    //     navigation.navigate('DeviceValidationComponent');
    //   }
    // }
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
      createPopup('Thank You', 'Would you like to setup your pet now?', true, 1, 'LATER', 'YES', true);
    }
    else if (popUpMessage === 'Would you like to setup your pet now?') {
      if (popRightTitle === 'YES') {
        savePetsForDashBoardAfterNotiSetting(petsArray);
      } else {
        createPopup('', '', false, 0, '', '', false);
      }
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
    await DataStorageLocal.saveDataToAsync(Constant.IS_FIRST_TIME_USER, JSON.stringify(value));
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
      popOkBtnAction={popOkBtnAction}
      popCancelBtnAction={popCancelBtnAction}
      navigateToPrevious={navigateToPrevious}
      submitAction={submitAction}
    />
  );

}

export default PetReviewComponent;