import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground } from 'react-native';
import BottomComponent from "../../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../../utils/commonComponents/headerComponent';
import fonts from '../../../../utils/commonStyles/fonts'
import CommonStyles from '../../../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../../../utils/commonComponents/loaderComponent';
import AlertComponent from './../../../../utils/commonComponents/alertComponent';

import EditImg from "./../../../../../assets/images/otherImages/svg/editMedia.svg";
import FailedImg from "./../../../../../assets/images/otherImages/svg/failedXIcon.svg";

const QuickVideoUI = ({ route, ...props }) => {

  const [isLoading, set_isLoading] = useState(false);
  const [loaderMsg, set_loaderMsg] = useState(undefined);
  const [thumbnailImage, set_thumbnailImage] = useState('');
  const [imagePath, set_imagePath] = useState(undefined);
  const [videoPath, set_videoPath] = useState(undefined);
  const [imgName, set_imgName] = useState(undefined);
  const [videoName, set_videoName] = useState(undefined);
  const [isMediaSelection, set_isMediaSelection] = useState(false);

  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);

  useEffect(() => {

    set_imagePath(props.imagePath);
    set_videoPath(props.videoPath);
    set_videoName(props.videoName);
    set_imgName(props.imgName);
    set_thumbnailImage(props.thumbnailImage);

  }, [props.imagePath, props.videoPath, props.imgName, props.videoName, props.thumbnailImage]);

  useEffect(() => {

    set_isLoading(props.isLoading);
    set_loaderMsg(props.loaderMsg);
    set_isMediaSelection(props.isMediaSelection);

  }, [props.isLoading, props.loaderMsg, props.isMediaSelection]);

  useEffect(() => {

    set_isPopUp(props.isPopUp);
    set_popUpMessage(props.popUpMessage);
    set_popUpAlert(props.popUpAlert);

  }, [props.isPopUp, props.popUpMessage, props.popUpAlert]);

  const nextButtonAction = () => {
    props.submitAction();
  };

  const backBtnAction = () => {
    props.navigateToPrevious();
  };

  const popOkBtnAction = () => {
    props.popOkBtnAction(false);
  };

  const popCancelBtnAction = () => {
    props.popCancelBtnAction();
  };

  const removeVideo = () => {
    props.removeVideo();
  };

  const removeImage = () => {
    props.removeImage();
  };

  const selectMediaAction = () => {
    props.selectMediaAction();
  };

  const redirectToMediaEdit = () => {
    props.redirectToMediaEdit();
  };

  return (
    <View style={[CommonStyles.mainComponentStyle]}>
      <View style={[CommonStyles.headerView, {}]}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isChatEnable={false}
          isTImerEnable={false}
          isTitleHeaderEnable={true}
          title={'Observations'}
          backBtnAction={() => backBtnAction()}
        />
      </View>

      <View style={{ width: wp('80%'), height: hp('70%'), alignSelf: 'center' }}>
        <Text style={[CommonStyles.headerTextStyle, { marginTop: hp("8%"), marginBottom: hp("5%") }]}>{'Show us how '}
          <Text style={CommonStyles.headerTextStyleBold}>{props.selectedPet ? props.selectedPet.petName : ''}</Text><Text style={CommonStyles.headerTextStyle}>{' looks today in a video'}</Text></Text>

        <View style={styles.videoUIStyle}>

          <View style={styles.mediaContainerStyle}>
            <Text numberOfLines={2} style={[styles.name]}>{props.videoName}</Text>

            {videoPath ? <ImageBackground source={{ uri: thumbnailImage }} style={styles.media} imageStyle={{ borderRadius: 5 }}>
              <TouchableOpacity style={styles.imageBtnStyle} onPress={() => removeVideo()}>
                <FailedImg width={wp("5%")} height={hp("5%")} style={styles.imageBtnStyle1}/>
              </TouchableOpacity>
            </ImageBackground> : null}

            {videoPath ? <TouchableOpacity onPress={() => redirectToMediaEdit()}>
              <EditImg style={styles.editMedia}/>
            </TouchableOpacity> : null}

          </View>

          <TouchableOpacity style={styles.videoBtnStyle} onPress={() => selectMediaAction()}>
            <Text style={styles.btnTextStyle}>{'RECORD VIDEO'}</Text>
          </TouchableOpacity>

        </View>
      </View>

      <View style={CommonStyles.bottomViewComponentStyle}>
        <BottomComponent
          rightBtnTitle={'NEXT'}
          leftBtnTitle={'BACK'}
          isLeftBtnEnable={true}
          rigthBtnState={videoPath ? true : false}
          isRightBtnEnable={true}
          rightButtonAction={async () => nextButtonAction()}
          leftButtonAction={async () => backBtnAction()}
        />
      </View>
      {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
        <AlertComponent
          header={popUpAlert}
          message={popUpMessage}
          isLeftBtnEnable={props.isPopLftBtnEnable}
          isRightBtnEnable={true}
          leftBtnTilte={'NO'}
          rightBtnTilte={props.isPopRBtnTitle}
          popUpRightBtnAction={() => popOkBtnAction()}
          popUpLeftBtnAction={() => popCancelBtnAction()}
        />
      </View> : null}

      {isLoading === true ? <LoaderComponent isLoader={false} loaderText={loaderMsg} isButtonEnable={false} /> : null}
    </View>
  );
}

export default QuickVideoUI;

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  media: {
    width: wp('15%'),
    aspectRatio: 1,
    resizeMode: 'contain',
    margin: wp('1.3%'),
  },

  videoUIStyle: {
    height: hp('30%'),
    width: wp('80%'),
    borderColor: '#D5D5D5',
    borderWidth: 2,
    borderRadius: 5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },

  mediaContainerStyle: {
    height: hp('20%'),
    width: wp('70%'),
    borderColor: '#D5D5D5',
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center'
  },

  videoBtnStyle: {
    height: hp('5%'),
    width: wp('60%'),
    backgroundColor: '#DEEAD0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5
  },

  btnTextStyle: {
    ...CommonStyles.textStyleBold,
    fontSize: fonts.fontXSmall,
    color: '#778D5E',
  },

  imageBtnStyle: {
    width: wp('8%'),
    aspectRatio: 1,
    alignSelf: 'flex-end',
    marginRight: wp('-1%'),
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },

  imageBtnStyle1: {
    width: wp('6%'),
    height: hp('6%'),
    resizeMode: 'contain'
  },

  editMedia: {
    width: wp('7%'),
    aspectRatio: 1,
    marginLeft: wp('3%'),
    resizeMode: 'contain'
  },

  name: {
    ...CommonStyles.textStyleSemiBold,
    fontSize: fonts.fontMedium,
    textAlign: "left",
    color: "black",
    flex: 1
  },

});