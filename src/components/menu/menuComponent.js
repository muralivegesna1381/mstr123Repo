import React, { useState, useEffect, useRef } from 'react';
import {BackHandler} from 'react-native';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import MenuUI from './menuUI';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import * as ServiceCalls from './../../utils/getServicesData/getServicesData.js';

let trace_inMenuScreen;

const  MenuComponent = ({navigation, route, ...props }) => {

  const [renderArray, set_renderArray] = useState();
  const [renderArrayFirstUser, set_renderArrayFirstUser] = useState(
    [
      {mobileAppConfigID : 0,title : 'Dashboard', iconImg : require('../../../assets/images/sideMenuImages/svg/Dashboard.svg'), nav : "DashBoardService"},     
      // {mobileAppConfigID : 5,title : 'Food Intake', iconImg : require('../../../assets/images/dashBoardImages/svg/home-food.svg'), nav : "FoodIntakeMainComponent"},       
      {mobileAppConfigID : 10,title : 'Account', iconImg : require('../../../assets/images/sideMenuImages/svg/Account.svg'), nav : "AccountInfoService"},   
      {mobileAppConfigID : 12,title : 'Support', iconImg : require('../../../assets/images/sideMenuImages/svg/Support.svg'), nav : "SupportComponent"},    
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

      let userRole = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_ID);
      let userRoleDetails = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_DETAILS);
      userRoleDetails = JSON.parse(userRoleDetails);
      let userDetails = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_DETAILS,);
      userDetails = JSON.parse(userDetails)
      let firstUser = await DataStorageLocal.getDataFromAsync(Constant.IS_FIRST_TIME_USER);
      firstUser = JSON.parse(firstUser);

      if(userDetails.ClientID > 0 ) {

        if(firstUser){

          set_isFirstUser(true);
          let tempArray = renderArrayFirstUser;
            tempArray.push(
              {mobileAppConfigID : 7,title : 'Onboard Pet', iconImg : require('../../../assets/images/sideMenuImages/svg/Onboard-a-pet.svg'), nav : "PetNameComponent"}, 
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

        if(userDetails.RolePermissions) {

          for (let i =0; i < userDetails.RolePermissions.length; i++) {

            if(userDetails.RolePermissions[i].menuId === 67 && !firstUser) {
              hasBFIImgCapture = true;
            }
  
            if(userDetails.RolePermissions[i].menuId === 68 && !firstUser) {
              hasBFIScore = true;
            }
  
          }
          if(hasBFIScore && hasBFIImgCapture) {
            // Representative
            let tempArray = renderArrayFirstUser;
            tempArray.push(
              {mobileAppConfigID: 3, title: 'Capture BFI Photos', iconImg: require('../../../assets/images/sideMenuImages/svg/Capture-BFI-Photos.svg'), nav: "PetListComponent"},
              {mobileAppConfigID: 4, title: 'Score BFI', iconImg: require('../../../assets/images/sideMenuImages/svg/Score-BFI.svg'), nav: "PetListBFIScoringScreen" },
              );
            tempArray.sort((a, b) => (a.mobileAppConfigID > b.mobileAppConfigID) ? 1 : -1)
            set_renderArray(tempArray)

          } else if(hasBFIScore) {
            // Veterinerian
            let tempArray = renderArrayFirstUser;
            tempArray.push(
              {mobileAppConfigID: 4, title: 'Score BFI', iconImg: require('../../../assets/images/sideMenuImages/svg/Score-BFI.svg'), nav: "PetListBFIScoringScreen" },
              );
            tempArray.sort((a, b) => (a.mobileAppConfigID > b.mobileAppConfigID) ? 1 : -1)
            set_renderArray(tempArray);

          } else if(hasBFIImgCapture) {
            // Only Capture
            let tempArray = renderArrayFirstUser;
            tempArray.push(
              {mobileAppConfigID: 3, title: 'Capture BFI Photos', iconImg: require('../../../assets/images/sideMenuImages/svg/Capture-BFI-Photos.svg'), nav: "PetListComponent"},
              );
            tempArray.sort((a, b) => (a.mobileAppConfigID > b.mobileAppConfigID) ? 1 : -1)
            set_renderArray(tempArray);
          } 
          // else {
          //   console.log('User Details1 ',userDetails,firstUser)
          //   if(firstUser){

          //     set_isFirstUser(true);
          //     let tempArray = renderArrayFirstUser;
          //       tempArray.push(
          //         {mobileAppConfigID : 7,title : 'Onboard Pet', iconImg : require('../../../assets/images/sideMenuImages/svg/Onboard-a-pet.svg'), nav : "PetNameComponent"}, 
          //         );
          //         tempArray.sort((a, b) => (a.mobileAppConfigID > b.mobileAppConfigID) ? 1 : -1)
          //         set_renderArray(tempArray)
          //   } else {
          //     set_isFirstUser(false);
          //     prepareMenus(userRoleDetails,userRole);
          //   }
          // }

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

      let userRoleDetails = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_DETAILS);
      userRoleDetails = JSON.parse(userRoleDetails);

      let totalPets = await DataStorageLocal.getDataFromAsync(Constant.ALL_PETS_ARRAY);
      totalPets = JSON.parse(totalPets);
      let isDogs = undefined

      if(totalPets) {
        for (let i = 0; i < totalPets.length; i++) {

          if(parseInt(totalPets[i].speciesId) === 1) {
            isDogs = true;
            break;
          }

        }
      }

      let menuItem = [
        {mobileAppConfigID : 0,title : 'Dashboard', iconImg : require('../../../assets/images/sideMenuImages/svg/Dashboard.svg'), nav : "DashBoardService"},
        {mobileAppConfigID : 7,title : 'Onboard Pet', iconImg : require('../../../assets/images/sideMenuImages/svg/Onboard-a-pet.svg'), nav : "PetNameComponent"},       
        // {mobileAppConfigID : 7,title : 'Configure Sensor', iconImg : require('../../../assets/images/sideMenuImages/svg/Config-Sensor.svg'), nav : "SensorInitialComponent"},
        {mobileAppConfigID : 8,title : 'Sensors', iconImg : require('../../../assets/images/sideMenuImages/svg/Devices.svg'),nav : "AllDevicesListComponent"}, 
        {mobileAppConfigID : 10,title : 'Account', iconImg : require('../../../assets/images/sideMenuImages/svg/Account.svg'), nav : "AccountInfoService"},
        {mobileAppConfigID : 12,title : 'Support', iconImg : require('../../../assets/images/sideMenuImages/svg/Support.svg'), nav : "SupportComponent"},
        {mobileAppConfigID : 11,title : 'Feedback', iconImg : require('../../../assets/images/sideMenuImages/svg/Feedback.svg'),nav : "FeedbackComponent"}, 
      ]

      if(userRoleDetails && (userRoleDetails.RoleName === "Hill's Vet Technician" || userRoleDetails.RoleName === "External Vet Technician")) {
        menuItem.push({mobileAppConfigID: 4, title: 'Score BFI', iconImg: require('../../../assets/images/sideMenuImages/svg/Score-BFI.svg'), nav: "PetListBFIScoringScreen" })
      } 

      if (menuDetails && menuDetails.RolePermissions && menuDetails.RolePermissions.length > 0) {
        for (let i = 0; i < menuDetails.RolePermissions.length; i++) {
          if(menuDetails.RolePermissions[i].menuId === 54) {
            menuItem.push({mobileAppConfigID : 2,title : 'Questionnaire', iconImg : require('../../../assets/images/sideMenuImages/svg/Questionnaire.svg'), nav : "QuestionnaireStudyComponent"},)
          } else if(menuDetails.RolePermissions[i].menuId === 56) {
            menuItem.push({mobileAppConfigID : 1,title : 'Observations', iconImg : require('../../../assets/images/sideMenuImages/svg/Observations.svg'), nav : "ObservationsListComponent"});
          }  else if(menuDetails.RolePermissions[i].menuId === 60) {
            menuItem.push({mobileAppConfigID : 6,title : 'Timer', iconImg : require('../../../assets/images/sideMenuImages/svg/Timer.svg'), nav : "Timer"},);
          } else if(menuDetails.RolePermissions[i].menuId === 67 && isDogs) {
            menuItem.push({mobileAppConfigID: 3, title: 'Capture BFI Photos', iconImg: require('../../../assets/images/sideMenuImages/svg/Capture-BFI-Photos.svg'), nav: "PetListComponent" },);
          }
          else if(menuDetails.RolePermissions[i].menuId === 74) {
            menuItem.push({mobileAppConfigID : 5,title : 'Food Intake', iconImg : require('../../../assets/images/sideMenuImages/svg/Food_Intake_Menu.svg'), nav : "FoodIntakeMainComponent"},       
            );
          }
        }

        if(deviceType.current && deviceType.current.includes('HPN1')) {

          if(deviceStatus.current==='SetupDone'){
            menuItem.push({mobileAppConfigID : 9,title : 'Beacons', iconImg : require('../../../assets/images/sideMenuImages/svg/Beacons.svg'), nav : "BeaconsInitialComponent"},)
          }

        }
      }

      let questPerimission = await DataStorageLocal.getDataFromAsync(Constant.QUETIONNAIRE_PERMISSION,);
      if(!questPerimission && questPer && questPer.length > 0) {

        var iArray = menuItem.filter(item => item.mobileAppConfigID === 2);
        if(iArray.length === 0) {
          menuItem.push({mobileAppConfigID : 2,title : 'Questionnaire', iconImg : require('../../../assets/images/sideMenuImages/svg/Questionnaire.svg'), nav : "QuestionnaireStudyComponent"},)
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

      let defaultPet = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
      defaultPet = JSON.parse(defaultPet);
      firebaseHelper.logEvent(firebaseHelper.event_menu, firebaseHelper.screen_menu, "Button Clicks", "Button Clicked: " + item.nav.toString());

      if(item.nav === 'ObservationsListComponent'){

        let obsPets = await permissionPetsAPI(1);
        // obsPets = await getsetupFeaturePets(obsPets);

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
        // questPets = await getsetupFeaturePets(questPets);
        
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

      } else if(item.nav === 'SensorInitialComponent'){

        navigation.navigate('MultipleDevicesComponent',{petObject:defaultPet});

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
        let isPet = await findArrayElementByPetId(foodPets,defaultPet.petID);

        if(isPet){
          await DataStorageLocal.saveDataToAsync(Constant.FH_SELECTED_PET, JSON.stringify(defaultPet));
        } else {
          await DataStorageLocal.saveDataToAsync(Constant.FH_SELECTED_PET, JSON.stringify(foodPets[0]));
        }
        
        await DataStorageLocal.saveDataToAsync(Constant.FH_PETS_ARRAY, JSON.stringify(foodPets));
        navigation.navigate("FoodHistoryPetSelectionComponent",{petsArray:foodPets,defaultPetObj:defaultPet});

      }else if(item.nav === 'PetNameComponent'){

        removeOnboardData();
        navigation.navigate("PetNameComponent");

      } else{

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

    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let userRoleDetails = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_DETAILS);
    userRoleDetails = JSON.parse(userRoleDetails);

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let permissionServiceObj = await ServiceCalls.configPermissionAPI(clientId,mId,token);
    set_isLoading(false);
    isLoadingdRef.current = 0;

    if(permissionServiceObj && permissionServiceObj.logoutData){
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if(permissionServiceObj && !permissionServiceObj.isInternet){
      createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
      return;
    }

    if(permissionServiceObj && permissionServiceObj.statusData){

      if (permissionServiceObj.responseData) {
        return permissionServiceObj.responseData
      }

      } else {
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      }

      if(permissionServiceObj && permissionServiceObj.error) {
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