import React, { useState, useEffect, useRef } from 'react';
import {BackHandler} from 'react-native';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import MenuUI from './menuUI';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as AppPetsData from '../../utils/appDataModels/appPetsModel.js';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";

import DashboardIcon from "../../../assets/images/sideMenuImages/svg/Dashboard.svg";
import AccountIcon from "../../../assets/images/sideMenuImages/svg/Account.svg";
import SupportIcon from "../../../assets/images/sideMenuImages/svg/Support.svg";
import OnboardIcon from "../../../assets/images/sideMenuImages/svg/Onboard-a-pet.svg";
import CaptureBFIIcon from "../../../assets/images/sideMenuImages/svg/Capture-BFI-Photos.svg";
import ScoreBFIIcon from "../../../assets/images/sideMenuImages/svg/Score-BFI.svg";
import DevicesIcon from "../../../assets/images/sideMenuImages/svg/Devices.svg";
import FeedbackIcon from "../../../assets/images/sideMenuImages/svg/Feedback.svg";
import QuestionnaireIcon from "../../../assets/images/sideMenuImages/svg/Questionnaire.svg";
import ObservationsIcon from "../../../assets/images/sideMenuImages/svg/Observations.svg";
import TimerIcon from "../../../assets/images/sideMenuImages/svg/Timer.svg";
import FoodIntakeIcon from "../../../assets/images/sideMenuImages/svg/Food_Intake_Menu.svg";
import BeaconsIcon from "../../../assets/images/sideMenuImages/svg/Beacons.svg";
import MediaIcon from "../../../assets/images/sideMenuImages/svg/media.svg";

let trace_inMenuScreen;

const  MenuComponent = ({navigation, route, ...props }) => {

  const [renderArray, set_renderArray] = useState();
  const [renderArrayFirstUser, set_renderArrayFirstUser] = useState(
    [
      { mobileAppConfigID: 0, title: 'Dashboard', iconImg: DashboardIcon, nav: "DashBoardService" }, 
      {mobileAppConfigID : 11,title : 'Account', iconImg : AccountIcon, nav : "AccountInfoService"},   
      {mobileAppConfigID : 13,title : 'Support', iconImg : SupportIcon, nav : "SupportComponent"},    
    ]);

    const [isFirstUser, set_isFirstUser] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);

    let deviceType = useRef(undefined);
    let deviceStatus = useRef(undefined);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

      menuSessionStart();
      getUserRoleMenus();
      firebaseHelper.reportScreen(firebaseHelper.screen_menu);  
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_menu, "User in Menu Screen", ''); 
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      const unsubscribe = navigation.addListener('blur', () => {
        menuSessionStop();
      });

      return () => {
        menuSessionStop();
        unsubscribe();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };
  
    }, []);

    useEffect(() => {
        
      if(route.params?.deviceType){         
          deviceType.current = route.params?.deviceType;
        }

        if(route.params?.isConfigured){         
          deviceStatus.current = route.params?.isConfigured;
        }

    }, [route.params?.deviceType,route.params?.isConfigured]);

    const getUserRoleMenus = async () => {

      let userRole = UserDetailsModel.userDetailsData.userRole.RoleId;
      let userRoleDetails = UserDetailsModel.userDetailsData.userRole; 
      let firstUser = AppPetsData.petsData.isFirstUser;
      if(userRoleDetails.ClientID > 0 ) {

        if(firstUser){

          set_isFirstUser(true);
          let tempArray = renderArrayFirstUser;
            tempArray.push(
              {mobileAppConfigID : 7,title : 'Onboard Pet', iconImg : OnboardIcon, nav : "PetNameComponent"}, 
              );
              tempArray.sort((a, b) => (a.mobileAppConfigID > b.mobileAppConfigID) ? 1 : -1)
              set_renderArray(tempArray)
        } else {
          set_isFirstUser(false);
          prepareMenus(userRoleDetails,userRole);
        }

      } else {

        let hasBFIImgCapture = false;
        let hasBFIScore = false;

        if(userRoleDetails.RolePermissions) {

          for (let i =0; i < userRoleDetails.RolePermissions.length; i++) {

            if(userRoleDetails.RolePermissions[i].menuId === 67 && !firstUser) {
              hasBFIImgCapture = true;
            }
  
            if(userRoleDetails.RolePermissions[i].menuId === 68 && !firstUser) {
              hasBFIScore = true;
            }
  
          }
          if(hasBFIScore && hasBFIImgCapture) {
            // Representative
            let tempArray = renderArrayFirstUser;
            tempArray.push(
              {mobileAppConfigID: 3, title: 'Capture BFI Photos', iconImg: CaptureBFIIcon, nav: "PetListComponent"},
              {mobileAppConfigID: 4, title: 'Score BFI', iconImg: ScoreBFIIcon, nav: "PetListBFIScoringScreen" },
              );
            tempArray.sort((a, b) => (a.mobileAppConfigID > b.mobileAppConfigID) ? 1 : -1)
            set_renderArray(tempArray)

          } else if(hasBFIScore) {
            // Veterinerian
            let tempArray = renderArrayFirstUser;
            tempArray.push(
              {mobileAppConfigID: 4, title: 'Score BFI', iconImg: ScoreBFIIcon, nav: "PetListBFIScoringScreen" },
              );
            tempArray.sort((a, b) => (a.mobileAppConfigID > b.mobileAppConfigID) ? 1 : -1)
            set_renderArray(tempArray);

          } else if(hasBFIImgCapture) {
            // Only Capture
            let tempArray = renderArrayFirstUser;
            tempArray.push(
              {mobileAppConfigID: 3, title: 'Capture BFI Photos', iconImg:CaptureBFIIcon, nav: "PetListComponent"},
              );
            tempArray.sort((a, b) => (a.mobileAppConfigID > b.mobileAppConfigID) ? 1 : -1)
            set_renderArray(tempArray);
          } 

        }

      }
      
    }

    const menuSessionStart = async () => {
      trace_inMenuScreen = await perf().startTrace('t_inMenuScreen');
    };
    
    const menuSessionStop = async () => {
        await trace_inMenuScreen.stop();
    };
    /**
     * Based on device type below Features will be enabled in the menu.
     * When device type is HPN1, beacons feature will be enabled.
     */
    const prepareMenus = async (menuDetails,roleId) => {

      let questPer = await DataStorageLocal.getDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
      questPer = JSON.parse(questPer);

      let userRoleDetails = UserDetailsModel.userDetailsData.userRole; 
      let totalPets = AppPetsData.petsData.totalPets;
      let isDogs = undefined;
      let isDevices = false;

      if(totalPets && totalPets.length > 0) {
        for (let i = 0; i < totalPets.length; i++) {

          if(parseInt(totalPets[i].speciesId) === 1) {
            isDogs = true;
            break;
          }

        }

        for (let i = 0; i < totalPets.length; i++) {
          if(totalPets[i] && totalPets[i].devices && totalPets[i].devices.length > 0) {
            isDevices = true;
            break;
          }
        }

      }

      let menuItem = [
        {mobileAppConfigID : 0,title : 'Dashboard', iconImg : DashboardIcon, nav : "DashBoardService"},
        {mobileAppConfigID: 7, title: 'Onboard Pet', iconImg: OnboardIcon, nav: "PetNameComponent" }, 
        {mobileAppConfigID : 10,title : 'Media', iconImg : MediaIcon, nav : "MediaComponent"}, 
        {mobileAppConfigID : 11,title : 'Account', iconImg : AccountIcon, nav : "AccountInfoService"},
        {mobileAppConfigID : 13,title : 'Support', iconImg : SupportIcon, nav : "SupportComponent"},
        {mobileAppConfigID : 12,title : 'Feedback', iconImg : FeedbackIcon,nav : "FeedbackComponent"}, 
      ]

      if (isDevices) {
        menuItem.push({mobileAppConfigID : 8,title : 'Sensors', iconImg : DevicesIcon,nav : "AllDevicesListComponent"})
      }

      if(userRoleDetails && (userRoleDetails.RoleName === "Hill's Vet Technician" || userRoleDetails.RoleName === "External Vet Technician")) {
        menuItem.push({mobileAppConfigID: 4, title: 'Score BFI', iconImg: ScoreBFIIcon, nav: "PetListBFIScoringScreen" })
      } 

      if (menuDetails && menuDetails.RolePermissions && menuDetails.RolePermissions.length > 0) {
        for (let i = 0; i < menuDetails.RolePermissions.length; i++) {
          if(menuDetails.RolePermissions[i].menuId === 54) {
            menuItem.push({mobileAppConfigID : 2,title : 'Questionnaire', iconImg : QuestionnaireIcon, nav : "QuestionnaireStudyComponent"},)
          } else if(menuDetails.RolePermissions[i].menuId === 56) {
            menuItem.push({mobileAppConfigID : 1,title : 'Observations', iconImg : ObservationsIcon, nav : "ObservationsListComponent"});
          }  else if(menuDetails.RolePermissions[i].menuId === 60) {
            menuItem.push({mobileAppConfigID : 6,title : 'Timer', iconImg : TimerIcon, nav : "Timer"},);
          } else if(menuDetails.RolePermissions[i].menuId === 67 && isDogs) {
            menuItem.push({mobileAppConfigID: 3, title: 'Capture BFI Photos', iconImg: CaptureBFIIcon, nav: "PetListComponent" },);
          }
          else if(menuDetails.RolePermissions[i].menuId === 74) {
            menuItem.push({mobileAppConfigID : 5,title : 'Food Intake', iconImg : FoodIntakeIcon, nav : "FoodIntakeMainComponent"});
          }
        }

        if(deviceType.current && deviceType.current.includes('HPN1')) {

          if(deviceStatus.current==='SetupDone'){
            menuItem.push({mobileAppConfigID : 9,title : 'Beacons', iconImg : BeaconsIcon, nav : "BeaconsInitialComponent"},)
          }

        }
      }

      let questPerimission = await DataStorageLocal.getDataFromAsync(Constant.QUETIONNAIRE_PERMISSION,);
      if(!questPerimission && questPer && questPer.length > 0) {

        var iArray = menuItem.filter(item => item.mobileAppConfigID === 2);
        if(iArray.length === 0) {
          menuItem.push({mobileAppConfigID : 2,title : 'Questionnaire', iconImg : QuestionnaireIcon, nav : "QuestionnaireStudyComponent"},)
        } 
      } 
      
      let temp = menuItem.sort((a, b) => (a.mobileAppConfigID > b.mobileAppConfigID) ? 1 : -1);
      set_renderArray(menuItem);

    };

    const handleBackButtonClick = () => {

      if(isLoadingdRef.current === 0) {
        menuHeaderBtnAction();
        return true;
      }
      
    };

    // Menu items button actions
    const menuBtnAction = async (item,index) => {

      let defaultPet = AppPetsData.petsData.defaultPet;
      firebaseHelper.logEvent(firebaseHelper.event_menu, firebaseHelper.screen_menu, "Button Clicks", "Button Clicked: " + item.nav.toString());

      if(item.nav === 'ObservationsListComponent'){

        let obsPets = await permissionPetsAPI(1);
        if(obsPets && obsPets.length > 0) {
          await DataStorageLocal.saveDataToAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY, JSON.stringify(obsPets));
          let isPet = await findArrayElementByPetId(obsPets,defaultPet.petID);
          if(isPet){
            await DataStorageLocal.saveDataToAsync(Constant.OBS_SELECTED_PET, JSON.stringify(defaultPet));
          } else {
            await DataStorageLocal.saveDataToAsync(Constant.OBS_SELECTED_PET, JSON.stringify(obsPets[0]));
          }

          navigation.navigate(item.nav);

        } else {
          await DataStorageLocal.removeDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
          createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.DETAILS_FETCH_FAIL,true);
        }

      }else if(item.nav === 'QuestionnaireStudyComponent'){
        
        let questPets = await permissionPetsAPI(2);        
        if(questPets && questPets.length > 0) {
          
            let isPet = await findArrayElementByPetId(questPets,defaultPet.petID);
            if(isPet){
              await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(defaultPet));
            } else {
              await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(questPets[0]));
            }
 
          await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIR_PETS_ARRAY, JSON.stringify(questPets));
          navigation.navigate(item.nav,{defaultPetObj:defaultPet});
        } else {
          await DataStorageLocal.removeDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
          createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.DETAILS_FETCH_FAIL,true);
        }

      } else if(item.nav === 'AllDevicesListComponent'){

        navigation.navigate('AllDevicesListComponent',{petObject:defaultPet});

      } else if(item.nav === 'Timer'){

        let timerPets = await permissionPetsAPI(5);
        if(timerPets && timerPets.length > 0) {

            let isPet = await findArrayElementByPetId(timerPets,defaultPet.petID);
            if(isPet){
              await DataStorageLocal.saveDataToAsync(Constant.TIMER_SELECTED_PET, JSON.stringify(defaultPet));
            } else {
              await DataStorageLocal.saveDataToAsync(Constant.TIMER_SELECTED_PET, JSON.stringify(timerPets[0]));
            }  
          
          await DataStorageLocal.saveDataToAsync(Constant.TIMER_PETS_ARRAY, JSON.stringify(timerPets));
          navigation.navigate('TimerComponent'); 

        } else {
          await DataStorageLocal.removeDataFromAsync(Constant.TIMER_PETS_ARRAY);
          createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.DETAILS_FETCH_FAIL,true);
        }
        

      } else if(item.nav === 'CampaignService'){

        let leaderBoardArray = await DataStorageLocal.getDataFromAsync(Constant.LEADERBOARD_ARRAY);
        leaderBoardArray = JSON.parse(leaderBoardArray);
        let leaderBoardCurrent = await DataStorageLocal.getDataFromAsync(Constant.LEADERBOARD_CURRENT);
        leaderBoardCurrent = JSON.parse(leaderBoardCurrent);
        navigation.navigate("CampaignService", {leaderBoardArray: leaderBoardArray, leaderBoardCurrent: leaderBoardCurrent});

      } else if(item.nav === 'BeaconsInitialComponent'){

        navigation.navigate("BeaconsInitialComponent");

      } else if(item.nav === 'FoodIntakeMainComponent'){

        let foodPets = await permissionPetsAPI(11);

        if(foodPets && foodPets.length > 0) {

          let isPet = await findArrayElementByPetId(foodPets,defaultPet.petID);

          if(isPet){
            await DataStorageLocal.saveDataToAsync(Constant.FH_SELECTED_PET, JSON.stringify(defaultPet));
          } else {
            await DataStorageLocal.saveDataToAsync(Constant.FH_SELECTED_PET, JSON.stringify(foodPets[0]));
          }
          
          await DataStorageLocal.saveDataToAsync(Constant.FH_PETS_ARRAY, JSON.stringify(foodPets));
          navigation.navigate("FoodHistoryPetSelectionComponent",{petsArray:foodPets,defaultPetObj:defaultPet});

        }
        
      }else if(item.nav === 'PetNameComponent'){

        removeOnboardData();
        navigation.navigate("PetNameComponent");

      }
      else if(item.nav === 'MediaComponent'){
        navigation.navigate("MediaComponent");
      }
      else {

        if(item.nav === 'DashBoardService') {
          menuHeaderBtnAction();
        } else {
          navigation.navigate(item.nav);
        }
        
      }
      
    };

    // finds out the setup done pets
    const getsetupFeaturePets = (pets) => {

      let tempArray = [];
      for (let i = 0; i < pets.length; i++) {   
        let devices = pets[i].devices;
        for (let j = 0; j < devices.length; j++) {
          if (devices.length > 0 && devices[j].isDeviceSetupDone) {
            tempArray.push(pets[i]);
          }
        }
      }

      let duplicates = getUnique(tempArray, 'petID');
      return duplicates;
    };

    // removes the duplicate objects from the Pets array
    function getUnique(petArray, index) {
      const uniqueArray = petArray.map(e => e[index]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => petArray[e]).map(e => petArray[e]);
      return uniqueArray;
    };

      // Navigates to Dashboard
    const menuHeaderBtnAction = async () => {
      navigation.pop();
    };

    const removeOnboardData = async () => {
      await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_PET_BFI)
      await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
    };

    function findArrayElementByPetId(array, petId) {
      return array.find((element) => {
        return element.petID === petId;
      })
    };

    const permissionPetsAPI = async (mId) => {

      let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
      set_isLoading(true);
      isLoadingdRef.current = 1;

      let apiMethod = apiMethodManager.GET_PERMISSION_PETS + clientId + '/' + mId;
      let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
      set_isLoading(false);
      isLoadingdRef.current = 0;

      if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
          
        if(apiService.data.pets && apiService.data.pets.length > 0) {
          return apiService.data.pets;
        } else {
          createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.DETAILS_FETCH_FAIL,true);
        }
            
      } else if(apiService && apiService.isInternet === false) {

        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
        return;

      } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

        createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true);
            
      } else {

        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);

      }

    };

    const createPopup = (title,msg,isPop) => {
      set_popUpAlert(title);
      set_popUpMessage(msg);
      set_isPopUp(isPop)
    };

    const popOkBtnAction = () => {
      createPopup('','',false);
    };  

    return (
      <MenuUI
        renderArray = {isFirstUser ? renderArrayFirstUser : renderArray}
        isLoading = {isLoading}
        popUpMessage = {popUpMessage}
        popUpAlert = {popUpAlert}
        isPopUp = {isPopUp}
        menuBtnAction = {menuBtnAction}   
        menuHeaderBtnAction = {menuHeaderBtnAction}  
        popOkBtnAction = {popOkBtnAction} 
      />
    );

  }
  
  export default MenuComponent;