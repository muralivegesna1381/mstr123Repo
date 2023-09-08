import React, { useState, useEffect } from 'react';
import {View} from 'react-native';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import LearningSegmentControlUI from './learningSegmentControlUI';
import FAQsComponentUI from './faqsComponentUI'
import VideosComponentUI from './videosComponentUI';
import UserGuidesComponentUI from './userGuidesComponentUI'
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../../utils/constants/constant"
import AlertComponent from './../../../utils/commonComponents/alertComponent';
import CommonStyles from './../../../utils/commonStyles/commonStyles';

const SegmentType = {
  Faqs : "FAQs",
  Videos : "Videos",
  UserGuides : "User Guides",
}

const  LearningCenterUI = ({route, ...props }) => {

  const [selectionSegmentType, set_selectionSegmentType] = useState(SegmentType.Faqs);
  const [faqsArray, set_faqsArray] = useState(undefined);
  const [videosArray, set_videosArray] = useState(undefined);
  const [userGuidesArray, set_userGuidesArray] = useState(undefined);

  useEffect(() => {

    set_faqsArray(props.faqsArray);
    set_videosArray(props.videosArray);
    set_userGuidesArray(props.userGuidesArray);

  }, [props.faqsArray,props.videosArray,props.userGuidesArray]);

  const backBtnAction = () => {
    props.navigateToPrevious();
  };

  const segmentClicked = (segmentType) => {
    set_selectionSegmentType(segmentType)
  };

  const popOkBtnAction = () => {
    props.popOkBtnAction();
  };

  return (
    <View style={[CommonStyles.mainComponentStyle]}>

      <View style={[CommonStyles.headerView,{}]}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isChatEnable={false}
          isTImerEnable={false}
          isTitleHeaderEnable={true}
          title={'Learning Center'}
          backBtnAction = {() => backBtnAction()}
        />
      </View>
            
      {props.isLoading === false ? <LearningSegmentControlUI  
        selectionSegmentType = {selectionSegmentType}
        SegmentType = {SegmentType}
        segmentClicked = {segmentClicked}
      /> : null}

      {props.isLoading === false && selectionSegmentType == SegmentType.Faqs ? <FAQsComponentUI        
        faqsList = {faqsArray}   
      /> : null }

      {selectionSegmentType == SegmentType.Videos ?  <VideosComponentUI        
        videosList = {videosArray}   
      /> : null }

      {selectionSegmentType == SegmentType.UserGuides ?  <UserGuidesComponentUI        
        userGuidesList = {userGuidesArray}   
      /> : null }

      {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
        <AlertComponent
          header = {props.popUpAlert}
          message={props.popupMsg}
          isLeftBtnEnable = {false}
          isRightBtnEnable = {true}
          leftBtnTilte = {'NO'}
          rightBtnTilte = {"OK"}
          popUpRightBtnAction = {() => popOkBtnAction()}
        />
      </View> : null}

      {props.isLoading === true ? <LoaderComponent isLoader={false} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 

    </View>
  );
}
  
  export default LearningCenterUI;