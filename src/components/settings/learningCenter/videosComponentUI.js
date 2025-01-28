import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, FlatList, Linking, ImageBackground} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as Constant from "./../../../utils/constants/constant";

import GradientImg from "../../../../assets/images/otherImages/svg/filterGradientImg.svg";
import FilterImg from "../../../../assets/images/otherImages/svg/filterIcon.svg";
import NoLogsDogImg from "./../../../../assets/images/dogImages/noRecordsDog.svg";
import FilterBckImg from "../../../../assets/images/otherImages/png/bgTimerFilter.png";
import CloseImg from "../../../../assets/images/otherImages/svg/timerCloseIcon.svg";
import CameraImg from "./../../../../assets/images/otherImages/svg/cameraImg.svg";
import RightArrowImg from "../../../../assets/images/otherImages/svg/rightArrowBlack.svg";

const FILTER_ID = 1;

const VideosComponentUI = ({ route, ...props }) => {

  const [videosList, set_videosList] = useState([]);
  const [filterVideosList, set_filterVideosList] = useState([]);
  const [dropDownPostion, set_DropDownPostion] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isListOpen, set_isListOpen] = useState(false);
  const [categoryArray, set_categoryArray] = useState(undefined);
  const [dropCatText, set_dropCatText] = useState(undefined);
  const [selectedCatagoryArray, set_selectedCatagoryArray] = useState([]);

  const [isCListOpen, set_isCListOpen] = useState(false);
  const [isAppListOpen, set_isAppListOpen] = useState(false);
  const [apptext, set_appText] = useState(undefined);
  const [assetTypeText, set_assetTypeText] = useState(undefined);
  const [assetModelText, set_assetModelText] = useState(undefined);
  const [appsArray, set_appsArray] = useState([]);
  const [assetsTypeArray, set_assetsTypeArray] = useState([]);
  const [isAssetListOpen, set_isAssetListOpen] = useState(false);
  const [isAssetModelListOpen, set_isAssetModelListOpen] = useState(false);
  const [assetsModelArray, set_assetsModelArray] = useState([]);
  const [noRecordsFound, set_noRecordsFound] = useState(false);
  const [isAppsListOpen, set_isAppsListOpen] = useState(false);
  const [assetSensorModels, set_assetSensorModels] = useState(undefined);
  const [assetBeaconsModels, set_assetBeaconsModels] = useState(undefined);

  let trace_tutorial_videos_Screen;

  useEffect(() => {

    tutorialVideosSessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_tutorial_videos_guides);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_tutorial_videos_guides, "User in Videos guide Screen", ''); 

     return () => {
       tutorialVideosSessionStop();
     };
 
   }, []);

  useEffect(() => {

    set_videosList(props.videosList);
    set_filterVideosList(props.videosList);
    set_selectedCatagoryArray(props.videosList);

    if (props.videosList && props.videosList.length > 0) {
      getFiterTypeData(props.videosList);
    }

  }, [props.videosList]);

  const getFiterTypeData = (videosArray) => {

    let tempArray = [];
    let appArray = [];
    let assetTypeArray = [];
    let assetModelArray = [];
    let sensorModels = [];
    let beaconsModels = []

    for (let i = 0; i < videosArray.length; i++) {

      tempArray.push(videosArray[i].categoryName);

      if (videosArray[i].categoryId === 1) {
        appArray.push(videosArray[i].subCategoryName)
      }

      if (videosArray[i].categoryId === 2) {
        assetTypeArray.push(videosArray[i].assetType);
        if(videosArray[i].assetType === "Beacon") {
          beaconsModels.push(videosArray[i].assetModel);
        } else if(videosArray[i].assetType === "Sensor") {
          sensorModels.push(videosArray[i].assetModel);
        }
      }

    }

    const uniqueNames = Array.from(new Set(tempArray));
    const uniqueAppArray = Array.from(new Set(appArray));
    const uniqueAssetType = Array.from(new Set(assetTypeArray));
    const uniqueAssetModel = Array.from(new Set(assetModelArray));

    const uniqueAssetSensors = Array.from(new Set(sensorModels));
    const uniqueAssetBeacons = Array.from(new Set(beaconsModels));
    
    set_categoryArray(uniqueNames.sort((a, b) => a.localeCompare(b)));
    set_appsArray(uniqueAppArray.sort((a, b) => a.localeCompare(b)));
    set_assetsTypeArray(uniqueAssetType.sort((a, b) => a.localeCompare(b)));
    set_assetsModelArray(uniqueAssetModel.sort((a, b) => a.localeCompare(b)));
    set_assetSensorModels(uniqueAssetSensors.sort((a, b) => a.localeCompare(b)));
    set_assetBeaconsModels(uniqueAssetBeacons.sort((a, b) => a.localeCompare(b)));

  };

  const btnAction = (item) => {
    if (item.urlOrAnswer) {
      Linking.openURL(item.urlOrAnswer);
    }
  };

  const actionOnRow = (item) => {

    if (isCListOpen) {
      set_isCListOpen(false);
      set_isAppListOpen(false);
      set_isAppsListOpen(false)
      set_dropCatText(item);
      set_assetModelText(undefined);
      set_assetTypeText(undefined);
      set_appText(undefined);
    } else {
      if(isAppsListOpen) {
        set_appText(item);
        set_isAppsListOpen(false);
      }
    }

    if (isAppListOpen) {
      set_isAppListOpen(false);
      set_appText(item);
    }

    if (isAssetListOpen) {
      set_isAssetListOpen(false);
      set_assetTypeText(item);
      set_appText(undefined);
      if(item === "Sensor") {
        set_assetsModelArray(assetSensorModels)
      } else if(item === "Beacon") {
        set_assetsModelArray(assetBeaconsModels)
      }
    }

    if (isAssetModelListOpen) {
      set_isAssetModelListOpen(false);
      set_assetModelText(item);
    }

  };

  const searchAction = () => {

     if (dropCatText && apptext) {
      let data = [];
      data = videosList.filter((item) => item.categoryName.includes(dropCatText.toString()) && item.subCategoryName.includes(apptext.toString())).map(({ titleOrQuestion, urlOrAnswer, thumbnailUrl }) => ({ titleOrQuestion, urlOrAnswer, thumbnailUrl }));
      set_filterVideosList(data);
      set_isCListOpen(false);
      set_isAppListOpen(false);
      set_isListOpen(false);
      if(data && data.length > 0) {
        set_noRecordsFound(false);
      } else {
        set_noRecordsFound(true);
      }
      
    }

    if (dropCatText && assetTypeText && assetModelText) {
      let data = [];
      data = videosList.filter((item) => item.categoryName.includes(dropCatText.toString()) && item.assetType.includes(assetTypeText.toString()) && item.assetModel.includes(assetModelText.toString())).map(({ titleOrQuestion, urlOrAnswer, thumbnailUrl }) => ({ titleOrQuestion, urlOrAnswer, thumbnailUrl }));
      set_filterVideosList(data);
      set_isCListOpen(false);
      set_isAppListOpen(false);
      set_isListOpen(false);
      if(data && data.length > 0) {
        set_noRecordsFound(false);
      } else {
        set_noRecordsFound(true);
      }
    }

  };

  const resetAction = (value) => {

    set_isCListOpen(false);
    set_isAppListOpen(false);
    set_isAssetListOpen(false);
    set_isAssetModelListOpen(false);
    set_isAppsListOpen(false);

    if(value !== FILTER_ID) {
      set_appText(undefined);
      set_dropCatText(undefined);
      set_assetTypeText(undefined);
      set_assetModelText(undefined);
      set_noRecordsFound(false);
      set_filterVideosList(videosList);
    }
    
  };

  const assignAssetModel = () => {

    let modelsArray = []
    if(videosList.length > 0) {

      if(assetTypeText === 'Sensor') {

        for (let i = 0; i < videosList.length; i++) {
          if(videosList[i].assetType === "Sensor") {
            modelsArray.push(videosList[i].assetModel);
          } 
        }

      } else {
        if(assetTypeText === 'Beacon') {
          for (let i = 0; i < videosList.length; i++) {
            if(videosList[i].assetType === "Beacon") {
              modelsArray.push(videosList[i].assetModel);
            } 
          }
        }
      }      
      
    }
    // set_assetsModelArray(modelsArray);
    set_isAssetModelListOpen(true);
    set_isCListOpen(false);
    set_isAppListOpen(false);
    set_isAppsListOpen(false);
    set_isAssetListOpen(false);
  };

  const assetTypeAction = () => {
    set_isAssetListOpen(!isAssetListOpen);
    set_isAssetModelListOpen(false);
    set_assetModelText(undefined);
  };

  const subCategoryTypeAction = () => {

    if(dropCatText === 'App') {
      set_isCListOpen(false);
      set_isAppsListOpen(true);
    }

  }

  const tutorialVideosSessionStart = async () => {
    trace_tutorial_videos_Screen = await perf().startTrace('t_Tutorial_Videos_Screen');
  };

  const tutorialVideosSessionStop = async () => {
    await trace_tutorial_videos_Screen.stop();
  };

  const renderFAQItem = ({ item, index }) => {
    return (
      <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10 }}>
        <TouchableOpacity key={index} style={{ padding: 1 }} onPress={() => { btnAction(item) }}>

          <View style={{ padding: 5, backgroundColor: "white", flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View>
              {item.thumbnailUrl ? <Image source={{ uri: item.thumbnailUrl }} style={styles.imgStyle} /> : <CameraImg style={styles.imgStyle}/>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.textStyle}>{item.titleOrQuestion}</Text>
            </View>
            <View style={{ marginRight: wp("1%"), width: wp('10%'), height: wp('10%'), backgroundColor: '#f6f5f8', alignItems: 'center', justifyContent: 'center', borderRadius: 15 }}>
              <RightArrowImg style={{ marginLeft: wp("2%"), marginRight: wp("1%"), width: wp('3%'), height: wp('3%') }}/>
            </View>
          </View>

        </TouchableOpacity>
        <View style={{ backgroundColor: '#707070', height: 0.5, marginTop: 10 }}></View>

      </View>
    );
  };
  return (

    <View style={{ flex: 1 }}>

      <View style={styles.mainViewStyle}>

        <GradientImg width={wp('90%')} height={hp('5%')} style={[styles.filterBtnStyle]}/>

        <TouchableOpacity style={[styles.filterBtnStyle, {position:'absolute'}]} onPress={() => { {set_isListOpen(!isListOpen),resetAction(1)} }}>

          <View onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            const postionDetails = { x: layout.x, y: layout.y, width: layout.width, height: layout.height, };
            set_DropDownPostion(postionDetails);
          }} style={[styles.SectionStyle]}>

            <Text style={styles.hTextextStyle}>{'Filter'}</Text>
            <FilterImg style={[styles.filterIconStyle]}/>

          </View>
        </TouchableOpacity>

      </View>
      {!noRecordsFound ? <FlatList
        data={filterVideosList}
        renderItem={renderFAQItem}
        keyExtractor={(item, index) => "" + index}
      /> : <View style={{justifyContent:'center',alignItems:'center',height:hp('58%')}}>
       
          <NoLogsDogImg style= {[styles.nologsDogStyle]}/>
          <Text style={CommonStyles.noRecordsTextStyle}>{Constant.NO_RECORDS_LOGS}</Text>
          <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
          
    </View>}

      {isListOpen ? <View style={[styles.filterListStyle, { top: dropDownPostion.y + dropDownPostion.height },]}>

        <ImageBackground style={[styles.filterListStyle, { alignItems: 'center', justifyContent: 'center' }]} imageStyle={{ borderRadius: 25 }} source={FilterBckImg}>

          <TouchableOpacity style={styles.filterAppBtnStyle} onPress={() => { set_isCListOpen(!isCListOpen), set_isAppListOpen(false) }}>

            <Text style={styles.hTextextStyle}>{dropCatText ? dropCatText : 'Select Category*'}</Text>

          </TouchableOpacity>

          {dropCatText === 'App' ? <TouchableOpacity style={styles.filterAppBtnStyle} onPress={() => {subCategoryTypeAction()}}>

            <Text style={styles.hTextextStyle}>{apptext ? apptext : 'Select Sub Category*'}</Text>

          </TouchableOpacity> : null}

          {dropCatText === 'Assets' ? <TouchableOpacity style={styles.filterAppBtnStyle} onPress={() => { assetTypeAction()}}>

            <Text style={styles.hTextextStyle}>{assetTypeText ? assetTypeText : 'Select Asset Type*'}</Text>

          </TouchableOpacity> : null}

          {assetTypeText ? <TouchableOpacity style={styles.filterAppBtnStyle} onPress={() => { assignAssetModel() }}>

            <Text style={styles.hTextextStyle}>{assetModelText ? assetModelText : 'Select Asset Model*'}</Text>

          </TouchableOpacity> : null}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp("80%"), }}>

          <TouchableOpacity style={styles.filtersubmitBtnStyle} onPress={() => { resetAction(0) }}>
              <Text style={styles.hTextextStyle}>{'RESET'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.filtersubmitBtnStyle,{backgroundColor: '#CCE8B0',}]} onPress={() => { searchAction() }}>
              <Text style={styles.hTextextStyle}>{'SUBMIT'}</Text>
            </TouchableOpacity>

          </View>

          <View style={[styles.dropCloseImgStyle]}>

            <TouchableOpacity onPress={() => {set_isListOpen(false),resetAction(1)}}>
              <CloseImg height={hp("5%")} width={wp("10%")}/>
            </TouchableOpacity>

          </View>

        </ImageBackground>

      </View> : null}

      {isCListOpen || isAppListOpen || isAssetListOpen || isAssetModelListOpen || isAppsListOpen ? <View style={[styles.popSearchViewStyle]}>
        <FlatList
          style={styles.flatcontainer}
          data={isCListOpen ? categoryArray : (isAssetListOpen ? assetsTypeArray : (isAssetModelListOpen ? assetsModelArray : (isAppsListOpen ? appsArray : [])))}
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
    </View>
  );
}

export default VideosComponentUI;

const styles = StyleSheet.create({

  filterListStyle: {
    position: "absolute",
    width: wp("100%"),
    minHeight: hp("10%"),
    borderRadius: 15,
    alignSelf: 'center',
    marginTop: hp('0.6%'),
  },

  mainViewStyle: {
    width: wp('90%'),
    height: hp('8%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: wp('2%'),
    marginTop: wp('2%'),
    alignSelf: 'center'
  },

  filterBtnStyle: {
    width: wp('90%'),
    height: hp('5%'),
    borderRadius: 5,
    borderColor: '#dedede',
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  filterAppBtnStyle: {
    width: wp('80%'),
    height: hp('5%'),
    borderRadius: 5,
    borderColor: '#dedede',
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    margin: wp('2%'),
    backgroundColor: 'white',
  },

  SectionStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: hp("8%"),
    width: wp("80%"),
    borderRadius: hp("0.5%"),
    alignSelf: "center",
  },

  hTextextStyle: {
    fontSize: fonts.fontXSmall,
    ...CommonStyles.textStyleSemiBold,
    color: 'black',
  },

  filterIconStyle: {
    width: wp('4%'),
    height: hp('4%'),
    resizeMode: 'contain',
    marginLeft: hp('2%'),
  },

  flatcontainer: {
    flex: 1,
  },

  flatview: {
    height: hp("8%"),
    marginBottom: hp("0.3%"),
    alignSelf: "center",
    justifyContent: "center",
    borderBottomColor: "grey",
    borderBottomWidth: wp("0.1%"),
    width: wp('90%'),
  },

  name: {
    ...CommonStyles.textStyleSemiBold,
    fontSize: fonts.fontMedium,
    textAlign: "center",
    color: "black",
  },

  popSearchViewStyle: {
    minHeight: hp("15%"),
    maxHeight: hp("40%"),
    width: wp("95%"),
    backgroundColor: '#DCDCDC',
    bottom: 0,
    position: 'absolute',
    alignSelf: 'center',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },

  filtersubmitBtnStyle: {
    width: wp('35%'),
    height: hp('5%'),
    borderRadius: 5,
    borderColor: '#dedede',
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: hp('1%'),
    backgroundColor: 'white',
  },

  dropCloseImgStyle: {
    bottom: -10,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },

  imgStyle: {
    marginRight: wp("5%"),
    width: wp('10%'),
    aspectRatio: 1,
    resizeMode: 'contain',
    borderRadius: 5,
    borderWidth : 1,
    borderColor:'#45a934'
  },

});