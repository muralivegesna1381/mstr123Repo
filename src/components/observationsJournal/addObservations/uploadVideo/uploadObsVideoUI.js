import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, FlatList, ImageBackground, Platform } from 'react-native';
import BottomComponent from "../../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../../utils/commonComponents/headerComponent';
import fonts from '../../../../utils/commonStyles/fonts'
import CommonStyles from '../../../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../../../utils/commonComponents/loaderComponent';
import AlertComponent from './../../../../utils/commonComponents/alertComponent';
import * as Constant from "./../../../../utils/constants/constant";

import FailedImg from "./../../../../../assets/images/otherImages/svg/failedXIcon.svg";
import DefaultDogImg from "./../../../../../assets/images/otherImages/png/defaultDogIcon_dog.png";
import EditMediaImg from "./../../../../../assets/images/otherImages/svg/editMedia.svg";
import VideoImg from "./../../../../../assets/images/dashBoardImages/png/quickVideo.png";

const UploadObsVideoUI = ({ route, ...props }) => {

  const [isLoading, set_isLoading] = useState(false);
  const [loaderMsg, set_loaderMsg] = useState(undefined);
  const [mediaArray, set_mediaArray] = useState([]);
  const [thumbnailImage, set_thumbnailImage] = useState('');
  const [imagePath, set_imagePath] = useState(undefined);
  const [videoPath, set_videoPath] = useState(undefined);
  const [imgName, set_imgName] = useState(undefined);
  const [videoName, set_videoName] = useState(undefined);
  const [isMediaSelection, set_isMediaSelection] = useState(false);
  const [optionsArray, set_optionsArray] = useState([]);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [popUpleftBtnEnable, set_popUpleftBtnEnable] = useState(true);

  useEffect(() => {

    set_imagePath(props.imagePath);
    set_videoPath(props.videoPath);
    set_videoName(props.videoName);
    set_imgName(props.imgName);
    set_thumbnailImage(props.thumbnailImage);
    set_optionsArray(props.optionsArray);
    set_mediaArray(props.mediaArray)

  }, [props.imagePath, props.videoPath, props.imgName, props.videoName, props.thumbnailImage, props.optionsArray, props.mediaArray]);

  useEffect(() => {

    set_isLoading(props.isLoading);
    set_loaderMsg(props.loaderMsg);
    set_isMediaSelection(props.isMediaSelection);

  }, [props.isLoading, props.loaderMsg, props.isMediaSelection]);

  useEffect(() => {
    set_isPopUp(props.isPopUp);
    set_popUpMessage(props.popUpMessage);
    set_popUpAlert(props.popUpAlert);
    set_popUpleftBtnEnable(props.popUpleftBtnEnable);
  }, [props.isPopUp, props.popUpMessage, props.popUpAlert, props.popUpleftBtnEnable]);


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

  const removeMedia = (item) => {
    props.removeMedia(item);
  };

  const redirectToMediaEdit = (item, index) => {
    props.redirectToMediaEdit(item, index);
  };

  const selectMediaAction = () => {
    props.selectMediaAction();
  };

  const actionOnRow = (item) => {
    props.actionOnRow(!isMediaSelection, item);
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
        <Text style={[CommonStyles.headerTextStyle, { marginTop: hp("8%"), marginBottom: hp("5%") }]}>{'What’s '}
          <Text style={CommonStyles.headerTextStyleBold}>{props.selectedPet ? props.selectedPet.petName : ''}</Text><Text style={CommonStyles.headerTextStyle}>{' been up to lately?'}</Text></Text>
        <View style={styles.videoUIStyle}>

          {mediaArray && mediaArray.length > 0 ? <View style={{ height: hp('30%') }}>

            <FlatList
              style={styles.flatcontainer}
              data={mediaArray}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity disabled={true} onPress={() => actionOnRow(item)}>
                  <View style={styles.flatview}>
                    <Text numberOfLines={0} style={[styles.name]}>{item.fileName}</Text>
                    {mediaArray.length > 0 && mediaArray[index].fileType === 'video' ?
                      (mediaArray[index].localThumbImg ?
                        <ImageBackground source={{ uri: mediaArray[index].localThumbImg }} style={styles.media} imageStyle={{ borderRadius: 5 }}>

                          <TouchableOpacity style={styles.imageBtnStyle} onPress={() => removeMedia(item)}>
                          <FailedImg width={Platform.isPad? wp("4%") : wp("6%")} height={Platform.isPad? hp("9%") : hp("7%")} style={styles.imageBtnStyle1}/>
                          </TouchableOpacity>

                        </ImageBackground> : 
                        
                        <ImageBackground source={DefaultDogImg} style={styles.media} imageStyle={{ borderRadius: 5 }}>

                          <TouchableOpacity style={styles.imageBtnStyle} onPress={() => removeMedia(item)}>
                          <FailedImg width={Platform.isPad? wp("4%") : wp("6%")} height={Platform.isPad? hp("9%") : hp("7%")} style={styles.imageBtnStyle1}/>
                          </TouchableOpacity>

                        </ImageBackground>

                      ) :
                      (mediaArray.length > 0 && mediaArray[index].filePath && mediaArray[index].filePath !== '' ?
                        <ImageBackground source={{ uri: Platform.OS === 'ios' ? mediaArray[index].filePath : mediaArray[index].localThumbImg }} style={styles.media} imageStyle={{ borderRadius: 5 }}>

                          <TouchableOpacity style={styles.imageBtnStyle} onPress={() => removeMedia(item)}>
                          <FailedImg width={Platform.isPad? wp("4%") : wp("6%")} height={Platform.isPad? hp("9%") : hp("7%")} style={styles.imageBtnStyle1}/>
                          </TouchableOpacity>

                        </ImageBackground> :

                        <ImageBackground source={{ uri: mediaArray[index].fbFilePath }} style={styles.media} imageStyle={{ borderRadius: 5 }}>

                          <TouchableOpacity style={styles.imageBtnStyle} onPress={() => removeMedia(item)}>
                          <FailedImg width={Platform.isPad? wp("4%") : wp("6%")} height={Platform.isPad? hp("9%") : hp("7%")} style={styles.imageBtnStyle1}/>
                          </TouchableOpacity>

                        </ImageBackground>)

                    }

                    {mediaArray.length > 0 && mediaArray[index].filePath && mediaArray[index].filePath !== '' ?
                      <TouchableOpacity onPress={() => redirectToMediaEdit(item, index)}>
                        <EditMediaImg style={styles.editMedia}/>
                      </TouchableOpacity> : null}

                  </View>
                </TouchableOpacity>
              )}
              enableEmptySections={true}
              keyExtractor={(item, index) => index}
            />
          </View> : <View style={{ height: hp('30%'), alignItems: 'center', justifyContent: 'center' }}><Image source={VideoImg} style={styles.noMedia} /></View>}

          <TouchableOpacity style={styles.videoBtnStyle} onPress={() => selectMediaAction()}>
            <Text style={styles.btnTextStyle}>{props.mediaType === 0 ? 'UPLOAD PHOTOS' : 'UPLOAD VIDEOS'}</Text>
          </TouchableOpacity>

        </View>

        <View style={{ width: wp('80%'),marginTop: hp('3%'), alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.btnTextStyle1}>{Constant.OBSERVATION_WITHOUT_MEDIA_TEXT}</Text>
        </View>

      </View>

      {!isMediaSelection ? <View style={CommonStyles.bottomViewComponentStyle}>
        <BottomComponent
          rightBtnTitle={'REVIEW'}
          leftBtnTitle={'BACK'}
          isLeftBtnEnable={true}
          rigthBtnState={true}
          isRightBtnEnable={true}
          rightButtonAction={async () => nextButtonAction()}
          leftButtonAction={async () => backBtnAction()}
        />
      </View> : null}

      {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
        <AlertComponent
          header={popUpAlert}
          message={popUpMessage}
          isLeftBtnEnable={popUpleftBtnEnable}
          isRightBtnEnable={true}
          leftBtnTilte={'NO'}
          rightBtnTilte={popUpleftBtnEnable ? 'YES' : "OK"}
          popUpRightBtnAction={() => popOkBtnAction()}
          popUpLeftBtnAction={() => popCancelBtnAction()}
        />
      </View> : null}

      {isMediaSelection ? <View style={[styles.popSearchViewStyle]}>
        <FlatList
          style={styles.flatcontainer}
          data={optionsArray}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => actionOnRow(item)}>
              <View style={styles.flatview}>
                <Text numberOfLines={2} style={[styles.name]}>{item}</Text>
              </View>
            </TouchableOpacity>
          )}
          enableEmptySections={true}
          keyExtractor={(item, index) => index}
        />

      </View> : null}

      {isLoading ? <LoaderComponent isLoader={false} loaderText={loaderMsg} isButtonEnable={false} /> : null}
    </View>
  );
}

export default UploadObsVideoUI;

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  media: {
    width: wp('10%'),
    aspectRatio: 1,
    resizeMode: 'contain'
  },

  editMedia: {
    width: wp('7%'),
    aspectRatio: 1,
    marginLeft: wp('4%'),
    resizeMode: 'contain'
  },

  videoUIStyle: {
    minHeight: hp('30%'),
    width: wp('80%'),
    borderColor: '#D5D5D5',
    borderWidth: 2,
    borderRadius: 5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },

  videoBtnStyle: {
    height: hp('5%'),
    width: wp('60%'),
    backgroundColor: '#DEEAD0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: hp("2%"),
    marginTop: hp("2%"),
  },

  btnTextStyle: {
    ...CommonStyles.textStyleBold,
    fontSize: fonts.fontXSmall,
    color: '#778D5E',
  },

  btnTextStyle1: {
    ...CommonStyles.textStyleMedium,
    fontSize: fonts.fontMedium,
    color: 'black',
  },

  flatcontainer: {
    width: wp("80%"),
  },

  flatview: {
    minHeight: hp("8%"),
    alignSelf: "center",
    justifyContent: "center",
    borderBottomColor: "grey",
    borderBottomWidth: wp("0.1%"),
    width: wp('90%'),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  name: {
    ...CommonStyles.textStyleSemiBold,
    fontSize: fonts.fontMedium,
    // textAlign: "center",
    color: "black",
    width: wp('50%'),
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    marginRight: hp('1%'),
  },

  popSearchViewStyle: {
    height: hp("30%"),
    width: wp("95%"),
    backgroundColor: '#DCDCDC',
    bottom: 0,
    position: 'absolute',
    alignSelf: 'center',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    alignItems: 'center'
  },

  imageBtnStyle: {
    width: wp('8%'),
    aspectRatio: 1,
    alignSelf: 'flex-end',
    marginRight: wp('-1%'),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    position:'absolute'
  },

  imageBtnStyle1: {
    width: wp('6%'),
    height: hp('6%'),
    resizeMode: 'contain',
    marginRight: wp('-1%'),
    marginTop: hp('-5%'),
  },

  imageBtnStyle2: {
    width: wp('4%'),
    height: hp('2%'),
    resizeMode: 'contain',
  },

  noMedia: {
    width: wp('30%'),
    height: hp('30%'),
    resizeMode: 'contain'
  },

});