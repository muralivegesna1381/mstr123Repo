import React, { useState, useEffect,useRef } from 'react';
import {BackHandler} from 'react-native';
import RewardPointsUi from './rewardPointsUI';
import * as Constant from "./../../../utils/constants/constant"
import * as DataStorageLocal from './../../../utils/storage/dataStorageLocal';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../../utils/getServicesData/getServicesData.js';

let trace_inRewardPointsScreen;

const RewardPointsService = ({navigation, route, ...props }) => {

    const [leaderBoardPetId, set_leaderBoardPetId] = useState(undefined);
    const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
    const [awardedArray, set_awardedArray] = useState([]);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [totalRewardPoints, set_totalRewardPoints] = useState(undefined);
    const [totalRedeemablePoints, set_totalRedeemablePoints] = useState(undefined);
    const [redeemedArray, set_redeemedArray] = useState([]);
    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [petImg, set_petImg] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState('Alert');

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_rewards); 
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_rewards, "User in PT Rewards Screen", '');  
      
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
        initialSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };

    }, []);

    useEffect(() => {

      if(route.params?.petId){
          set_leaderBoardPetId(route.params?.petId);
          getRewardsDetails(route.params?.petId);
          getTotalListofPoints(route.params?.petId);
          getPetImage()
        }

        if(route.params?.leaderBoardCurrent){
            set_leaderBoardCurrent(route.params?.leaderBoardCurrent);  
        }

        if(route.params?.screen){
          set_isFromScreen(route.params?.screen);
      }

      getPetImage();

    }, [route.params?.petId,route.params?.leaderBoardCurrent,route.params?.screen]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
      trace_inRewardPointsScreen = await perf().startTrace('t_inRewardPointsScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inRewardPointsScreen.stop();
    };

    const getPetImage = async () => {

      let defaultPet = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
      defaultPet = JSON.parse(defaultPet);
      set_defaultPetObj(defaultPet);
      if(defaultPet && defaultPet.photoUrl !== ''){
        set_petImg(defaultPet.photoUrl);
      } else {
        set_petImg('');
      }
      
    };

    const navigateToPrevious = () => {
      
      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        if(isFromScreen){
          firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_rewards, "User clicked on back button to navigate to CampaignService", '');
          navigation.navigate('CampaignService');
        } else {
          firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_rewards, "User clicked on back button to navigate to DashBoardService", '');
          navigation.navigate('DashBoardService');
        }
      }

    };

    const getRewardsDetails = async (id) => {

      set_isLoading(true);
      isLoadingdRef.current = 1;
      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
      
      let getRewardsServiceObj = await ServiceCalls.getPetCampaignPointsList(id,token);
      set_isLoading(false);
      isLoadingdRef.current = 0; 

      if(getRewardsServiceObj && getRewardsServiceObj.logoutData){
        firebaseHelper.logEvent(firebaseHelper.event_getRewardsDetails_api_success, firebaseHelper.screen_rewards, "Reward Details API success", 'Unautherised');  
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
        return;
      }
        
      if(getRewardsServiceObj && !getRewardsServiceObj.isInternet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
        firebaseHelper.logEvent(firebaseHelper.event_getRewardsDetails_api_success, firebaseHelper.screen_rewards, "Reward Details API success", 'Internet : false');  
        return;
      }
  
      if(getRewardsServiceObj && getRewardsServiceObj.statusData){

        if(getRewardsServiceObj.responseData && getRewardsServiceObj.responseData.length > 0){
          set_awardedArray(getRewardsServiceObj.responseData); 
        } else {
          firebaseHelper.logEvent(firebaseHelper.event_getRewardsDetails_api_success, firebaseHelper.screen_rewards, "Reward Details API success", 'Campaign List length : '+getRewardsServiceObj.responseData.length);  
          set_awardedArray([]); 
        }
        
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_getRewardsDetails_api_success, firebaseHelper.screen_rewards, "Reward Details API fail", 'Service Status : false');
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      }
  
      if(getRewardsServiceObj && getRewardsServiceObj.error) {
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
        let errors = getRewardsServiceObj.error.length > 0 ? getRewardsServiceObj.error[0].code : '';
        firebaseHelper.logEvent(firebaseHelper.event_getRewardsDetails_api_success, firebaseHelper.screen_rewards, "Reward Details API fail", 'error : '+errors);
      }

    };

    const getTotalListofPoints = async (id) => {

      set_isLoading(true);
      isLoadingdRef.current = 1;
      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

      let getTListServiceObj = await ServiceCalls.getPetCampaignPoints(id,token);
      set_isLoading(false);
      isLoadingdRef.current = 0; 

      if(getTListServiceObj && getTListServiceObj.logoutData){
        firebaseHelper.logEvent(firebaseHelper.event_getTotalListofPoints_api_fail, firebaseHelper.screen_rewards, "Total Points API Fail - Total Points Earned ", 'Unautherised');
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
        return;
      }
        
      if(getTListServiceObj && !getTListServiceObj.isInternet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
        firebaseHelper.logEvent(firebaseHelper.event_getTotalListofPoints_api_fail, firebaseHelper.screen_rewards, "Total Points API Fail - Total Points Earned ", 'Internet : false');
        return;
      }
  
      if(getTListServiceObj && getTListServiceObj.statusData){

        if(getTListServiceObj.responseData){
          set_totalRewardPoints(getTListServiceObj.responseData.totalEarnedPoints);
          set_totalRedeemablePoints(getTListServiceObj.responseData.redeemablePoints);
        }
        
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_getTotalListofPoints_api_fail, firebaseHelper.screen_rewards, "Total Points API Fail - Total Points Earned ", 'Service Status : false');
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      }
  
      if(getTListServiceObj && getTListServiceObj.error) {
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
        let errors = getTListServiceObj.error.length > 0 ? getTListServiceObj.error[0].code : '';
        firebaseHelper.logEvent(firebaseHelper.event_getTotalListofPoints_api_fail, firebaseHelper.screen_rewards, "Total Points API Fail - Total Points Earned ", 'error : ' + errors);
      }

    };

    const getRewardsRedeemedDetailsService = async (id) => {

      set_isLoading(true);
      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        
      let getRPointsServiceObj = await ServiceCalls.getPetRedemptionHistory(leaderBoardPetId,token);
      set_isLoading(false);
      isLoadingdRef.current = 0; 

      if(getRPointsServiceObj && getRPointsServiceObj.logoutData){
        firebaseHelper.logEvent(firebaseHelper.event_getRewardsRedeemedDetailsService_api_fail, firebaseHelper.screen_rewards, "Get RewardsRedeemed Details API Fail ", 'Unautherised');
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
        return;
      }
        
      if(getRPointsServiceObj && !getRPointsServiceObj.isInternet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
        firebaseHelper.logEvent(firebaseHelper.event_getRewardsRedeemedDetailsService_api_fail, firebaseHelper.screen_rewards, "Get RewardsRedeemed Details API Fail ", 'Internet : false');
        return;
      }
  
      if(getRPointsServiceObj && getRPointsServiceObj.statusData){

        if(getRPointsServiceObj.responseData){
          set_redeemedArray(getRPointsServiceObj.responseData);
        } else {
          set_redeemedArray([]);
        }
        
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_getRewardsRedeemedDetailsService_api_fail, firebaseHelper.screen_rewards, "Get RewardsRedeemed Details API Fail ", 'Service Status : false');
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
      }
  
      if(getRPointsServiceObj && getRPointsServiceObj.error) {
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
        let errors = getRPointsServiceObj.error.length > 0 ? getRPointsServiceObj.error[0].code : '';
        firebaseHelper.logEvent(firebaseHelper.event_getRewardsRedeemedDetailsService_api_fail, firebaseHelper.screen_rewards, "Get RewardsRedeemed Details API Fail ", 'error : '+errors);
      }

    };

    const createPopup = (title,msg,isPop) => {
      set_popUpAlert(title);
      set_popUpMessage(msg);
      set_isPopUp(isPop);
      popIdRef.current = 1;
    };

    const popOkBtnAction = () => {
      set_popUpMessage(undefined);
      set_isPopUp(false);
      popIdRef.current = 0;
    };

    const getRewardsRedeemedDetails = () => {
      firebaseHelper.logEvent(firebaseHelper.event_getTotal_points_button_trigger, firebaseHelper.screen_rewards, "Getting Total-Reward Points", 'Leaderboard Pet Id : '+leaderBoardPetId);
      getTotalListofPoints(leaderBoardPetId);
      getRewardsRedeemedDetailsService();
    };

    return (
      <RewardPointsUi 
        leaderBoardPetId = {leaderBoardPetId}
        leaderBoardCurrent = {leaderBoardCurrent}
        awardedArray = {awardedArray}
        isLoading = {isLoading}
        isPopUp = {isPopUp}
        popUpMessage = {popUpMessage}
        popUpAlert = {popUpAlert}
        totalRewardPoints = {totalRewardPoints}
        totalRedeemablePoints = {totalRedeemablePoints}
        redeemedArray = {redeemedArray}
        petImg = {petImg}
        defaultPetObj = {defaultPetObj}
        navigateToPrevious = {navigateToPrevious}
        popOkBtnAction = {popOkBtnAction}
        getRewardsRedeemedDetails = {getRewardsRedeemedDetails}
      />
    );

  }
  
  export default RewardPointsService;