import React, { useState, useEffect } from 'react';
import {Linking} from 'react-native';
import SupportUI from './supportUI';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

const SupportComponent = ({navigation, route, ...props }) => {

    const [arraySupport, set_arraySupport] = useState([
        {'id' : 1, 'header' : 'Learning Center', 'subheader' : 'Find intelligent answers instantly', 'img' : require("./../../../../assets/images/otherImages/svg/learningCenterImg.svg")}, 
        {'id' : 2, 'header' : 'Email', 'subheader' : 'Get solutions beamed to you inbox', 'img' : require("./../../../../assets/images/otherImages/svg/emailImg.svg")},
        {'id' : 3, 'header' : 'Phone', 'subheader' : 'Talk to us!', 'img' : require("./../../../../assets/images/otherImages/svg/phoneSupportImg.svg")},
        {'id' : 4, 'header' : 'Privacy Policy', 'subheader' : 'Legal', 'img' : require("./../../../../assets/images/otherImages/svg/privacyIcon.svg")},
        {'id' : 5, 'header' : 'Terms of service', 'subheader' : 'Legal', 'img' : require("./../../../../assets/images/otherImages/svg/termsIcon.svg")},
        {'id' : 6, 'header' : 'Chat', 'subheader' : 'appo', 'img' : require("./../../../../assets/images/otherImages/svg/chatSupport.svg")},
        {'id' : 7, 'header' : 'App orientation', 'subheader' : '', 'img' : require("./../../../../assets/images/otherImages/svg/app-or.svg")},
    ]);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [popUpId, set_popUpId] = useState(undefined);

    let trace_Support_Screen;

  useEffect(() => {

    supportSessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_support);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_support, "User in Support Screen", ''); 
     return () => {
       supportSessionStop();
     };
 
   }, []);

   const popActions = (msg,title,value,id) => {
     set_popUpMessage(msg);
     set_popUpTitle(title);
     set_isPopUp(value);
     set_popUpId(id);
   }
    /**
     * User will be navigated to previous page
     */
    const navigateToPrevious = () => {  
        navigation.navigate('DashBoardService');
    };

    const supportSessionStart = async () => {
        trace_Support_Screen = await perf().startTrace('t_Support_Screen');
    };
    
    const supportSessionStop = async () => {
        await trace_Support_Screen.stop();
    };

    const popCancelBtnAction = () => {
        popActions('','',false,undefined);
    };
  
    const popOkBtnAction = () => {
        popActions('','',false,undefined);
    }

    /**
     * 
     * @param {*} item 
     * User will be navigated to selected features (Chat, Learning Center, Email, Phone)
     */
    const selectSupportAction = (item) => {

        firebaseHelper.logEvent(firebaseHelper.event_support_menu_trigger, firebaseHelper.screen_support, "User selected support action", 'Option : ' + item.header);
         if(item.id === 1){
            navigation.navigate("LearningCenterComponent");
        } else if(item.id === 2){
            Linking.openURL("mailto:support@wearablesclinicaltrials.com?subject=Support Request&body=Description");
        } else if(item.id === 3){

            Linking.openURL("tel:8664145861");

        } else if(item.id === 4){
            Linking.openURL('https://www.colgatepalmolive.co.uk/legal-privacy-policy/privacy-policy');
        } else if(item.id===5){
            // Linking.openURL('https://firebasestorage.googleapis.com/v0/b/ct-wearables-portal-prod.appspot.com/o/TermsandConditions%2FTerms%20of%20Service%20-%20Wearables%20Clinical%20App.pdf?alt=media&token=e159a0fd-721c-468c-a4b6-e448e310176e');
            navigation.navigate('PDFViewerComponent', { 'pdfUrl': 'https://firebasestorage.googleapis.com/v0/b/ct-wearables-portal-prod.appspot.com/o/TermsandConditions%2FTerms%20of%20Service%20-%20Wearables%20Clinical%20App.pdf?alt=media&token=e159a0fd-721c-468c-a4b6-e448e310176e', 'title': 'Terms of service', "fromScreen": 'support' })
        }
        else if(item.id === 6){
            navigation.navigate('ChatBotComponent');
        }else if(item.id === 7){
            navigation.navigate("AppOrientationComponent");
        }
        
    }

    return (
        <SupportUI 
            arraySupport = {arraySupport}
            isPopUp = {isPopUp}
            popUpMessage = {popUpMessage}
            popUpTitle = {popUpTitle}
            selectSupportAction = {selectSupportAction}
            navigateToPrevious = {navigateToPrevious}
            popCancelBtnAction = {popCancelBtnAction}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default SupportComponent;