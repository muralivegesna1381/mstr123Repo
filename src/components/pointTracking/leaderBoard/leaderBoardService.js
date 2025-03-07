import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import LeaderBoardComponent from "./leaderBoardComponent";
import * as Apolloclient from './../../../config/apollo/apolloConfig';
import * as Queries from "../../../config/apollo/queries";
import * as internetCheck from "./../../../utils/internetCheck/internetCheck";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';

let trace_Leaderboard_API_Complete;

const  LeaderBoardService = ({route, ...props }) => {

  const navigation = useNavigation();
  const [leaderBoardArray, set_leaderBoardArray] = useState(undefined);
  const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
  const [campagainName, set_campagainName] = useState("");
  const [isLoading, set_isloading] = useState(false);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [enableLoader, set_enableLoader] = useState (false);
  const [ptActivityLimits, set_ptActivityLimits] = useState(undefined);
  const [isListOpen, set_isListOpen] = useState(false);

    useEffect(() => {
      set_leaderBoardArray(props.leaderBoardArray);
      set_leaderBoardCurrent(props.currentCampaignPet);
      set_campagainName(props.campagainName);
      set_enableLoader(props.enableLoader);
      if(props.campagainArray && props.campagainArray.length > 0) {
        set_ptActivityLimits(props.campagainArray[0].activityLimits)
      }
      
    }, [props.leaderBoardArray,props.leaderBoardCurrent,props.campagainName,props.enableLoader,props.ptActivityLimits,props.currentCampaignPet]);

    useEffect(() => {
      set_isListOpen(props.isPTDropdown);
    }, [props.isPTDropdown]);

    const campaignBtnAction = async () => {
      
      if(isListOpen === false) {
        set_isListOpen(undefined);
      } else {
        set_isListOpen(false);
      }
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_campaign_Action_trigger, firebaseHelper.screen_leaderBoard, "User Clicked btn to navigate CampaignService", 'Internet Status : ',internet);
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);  
      } else {
        updateTimer('leaderBoard');
        navigation.navigate("CampaignService", {leaderBoardArray:leaderBoardArray, leaderBoardCurrent: leaderBoardCurrent});
      }

    };

    const rewardPointsBtnAction = async () => {

      if(isListOpen === false) {
        set_isListOpen(undefined);
      } else {
        set_isListOpen(false);
      }

      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_reward_points_Action_trigger, firebaseHelper.screen_leaderBoard, "User Clicked btn to navigate Reward Points Page", 'Internet Status : ',internet);
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
      } else {
        updateTimer('leaderBoard');
        navigation.navigate('RewardPointsService',{petId : props.leaderBoardPetId, leaderBoardCurrent:leaderBoardCurrent});
      }
      
    };

    const getLeaderBoardDetails = async (campId) => {

      trace_Leaderboard_API_Complete = await perf().startTrace('t_GetLeaderBoardByCampaign_API');
      let apiMethod = apiMethodManager.GET_LEADERBOARD;
      let apiService = await apiRequest.postData(apiMethod,weightJson,Constant.SERVICE_JAVA,navigation);
      set_isloading(false);
      stopFBTrace();
        
      if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {

        firebaseHelper.logEvent(firebaseHelper.event_leaderBoard_api_success, firebaseHelper.screen_leaderBoard, "Pet GetLeaderBoardByCampaign API Success", '');
        if(leaderboardAPI.data.leaderBoards.length > 0){
          set_leaderBoardArray(leaderboardAPI.data.leaderBoards);
          set_leaderBoardCurrent(leaderboardAPI.data.currentObj);   
        } 

      } else if(apiService && apiService.isInternet === false) {

        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
        firebaseHelper.logEvent(firebaseHelper.event_leaderBoard_api_fail, firebaseHelper.screen_leaderBoard, "Pet GetLeaderBoardByCampaign API Failed", 'Internet : false');  

      } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

        createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true);
        firebaseHelper.logEvent(firebaseHelper.event_leaderBoard_api_fail, firebaseHelper.screen_leaderBoard, "Pet GetLeaderBoardByCampaign API Failed", 'error : '+apiService.error);
            
      } else {

        firebaseHelper.logEvent(firebaseHelper.event_leaderBoard_api_fail, firebaseHelper.screen_leaderBoard, "Pet GetLeaderBoardByCampaign API Failed", 'Service Status : false');
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);

      }

    };

    const stopFBTrace = async () => {
      await trace_Leaderboard_API_Complete.stop();
    };

    const updateTimer = (value) => {
      Apolloclient.client.writeQuery({
         query: Queries.TIMER_WIDGET_QUERY,
              data: {
                data: { 
                  screenName:value,stopTimerInterval:'Continue',__typename: 'TimerWidgetQuery'}
                },
      })
    };

    const createPopup = (title,msg,isPop) => {
      set_popUpAlert(title);
      set_popUpMessage(msg);
      set_isPopUp(isPop);
      popIdRef.current = 1;
    };

    const popOkBtnAction = () => {
      set_popUpAlert(undefined);
      set_popUpMessage(undefined);
      set_isPopUp(false);
    };

    const getCampaign = async (item) => {

      let internet = await internetCheck.internetCheck();
        if(!internet){
          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopUp(true);
  
        } else {
          set_ptActivityLimits(item.activityLimits)
          set_isloading(true);
          set_enableLoader(true);
          set_campagainName(item.campaignName);
          getLeaderBoardDetails(item.campaignId);
        }
    };

    const showPointsView = async () => {

      if(isListOpen === false) {
        set_isListOpen(undefined);
      } else {
        set_isListOpen(false);
      }

      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_campaign_Action_trigger, firebaseHelper.screen_leaderBoard, "User Clicked btn to navigate CampaignService", 'Internet Status : ',internet);
      if(!internet){
        createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);  
      } else {
        updateTimer('leaderBoard');
        navigation.navigate("PTActivityLimitsComponent", {ptActivityLimits:ptActivityLimits,campagainName:campagainName});
      }
      
    };

    return (
      <LeaderBoardComponent
        leaderBoardArray = {leaderBoardArray}
        leaderBoardPetId = {props.leaderBoardPetId}
        leaderBoardCurrent = {leaderBoardCurrent}
        campagainName = {campagainName}
        campagainArray = {props.campagainArray}
        popUpMessage = {popUpMessage}
        popUpAlert = {popUpAlert}
        isPopUp = {isPopUp}
        isLoading = {isLoading}
        enableLoader = {enableLoader}
        ptActivityLimits = {ptActivityLimits}
        isListOpen = {isListOpen}
        campaignBtnAction = {campaignBtnAction}
        rewardPointsBtnAction = {rewardPointsBtnAction}
        popOkBtnAction = {popOkBtnAction}
        getCampaign = {getCampaign}
        showPointsView = {showPointsView}
      />
    );

  }
  
  export default LeaderBoardService;