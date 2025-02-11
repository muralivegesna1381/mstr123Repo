import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, FlatList, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View,Platform } from 'react-native';
import ImageView from "react-native-image-viewing";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import BottomComponent from '../../utils/commonComponents/bottomComponent';
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import fonts from '../../utils/commonStyles/fonts';
import * as Constant from "../../utils/constants/constant";
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import perf from '@react-native-firebase/perf';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'

import IsScrollStartImg from "./../../../assets/images/bfiGuide/svg/left_indicater.svg";
import IsScrollEndImg from "./../../../assets/images/bfiGuide/svg/right_indicater.svg";
import ArrowLeftImg from "./../../../assets/images/bfiGuide/svg/arrow-black-left.svg";
import ArrowRightImg from "./../../../assets/images/bfiGuide/svg/arrow-black-right.svg"
import EyeInstructionImg from "./../../../assets/images/bfiGuide/svg/eye-instructions.svg";
import BFIEmptyImg from "./../../../assets/images/bfiGuide/svg/ic_bfi_empty_bg.svg";

const BFIScoreMain = ({ route, navigation }) => {

  const [images, set_images] = useState([]);
  const [imagesFullview, set_imagesFullview] = useState([]);
  const [isImageView, set_isImageView] = useState(false);
  const [currentImageViewPos, set_CurrentImageViewPos] = useState(0);
  const [currentBFISelected, set_CurrentBFISelected] = useState(-1);
  const [bfiImageScoreId, set_BfiImageScoreId] = useState(undefined);
  const [isDataValid, set_isDataValid] = useState(false);
  const [isLoading, set_isLoading] = useState(false);
  const [petName, setPetName] = useState('');
  const [imgLoader, set_imgLoader] = useState(false);
  const [popupMessage, set_popupMessage] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [isScrollEndReached, set_isScrollEndReached] = useState(false);
  const [descriptionEnable, set_descriptionEnable] = useState(false);
  const [descriptionText, set_descriptionText] = useState(undefined);
  const [petBfiImagesSId, set_petBfiImagesSId] = useState(undefined);

  var imagePositionStyle = styles.imageStyle;

  var scoringSessionStartDate = useRef(undefined);
  var scoringSessionEndDate = useRef(undefined);
  var petBfiImagesSetId = useRef(undefined);
  let hashmapScoreIDsData = useRef(new Map())
  var previousScore = useRef(undefined);
  var descText = useRef(undefined)

  const [petImgArray, set_petImgArray] = useState([
    require('./../../../assets/images/bfiGuide/png/ic_bfi_bg_20.png'),
    require('./../../../assets/images/bfiGuide/png/ic_bfi_bg_30.png'),
    require('./../../../assets/images/bfiGuide/png/ic_bfi_bg_40.png'),
    require('./../../../assets/images/bfiGuide/png/ic_bfi_bg_50.png'),
    require('./../../../assets/images/bfiGuide/png/ic_bfi_bg_60.png'),
    require('./../../../assets/images/bfiGuide/png/ic_bfi_bg_70.png'),
    require('./../../../assets/images/bfiGuide/png/ic_bfi_bg_other.png'),
    require('./../../../assets/images/bfiGuide/png/ic_bfi_bg_other.png'),
    require('./../../../assets/images/bfiGuide/png/ic_bfi_bg_other.png')
  ]);

  const [bfiScoresList, setBFIScoresList] = useState([
    { name: '<20', checked: false },
    { name: '20', checked: false },
    { name: '30', checked: false },
    { name: '40', checked: false },
    { name: '50', checked: false },
    { name: '60', checked: false },
    { name: '70', checked: false },
    { name: '>70', checked: false },
    { name: 'N/A', checked: false },
  ]);

  let trace_bfiScoreSubmit_Screen;

  //Android Physical back button action
  useEffect(() => {
    //start session time
    let startDate = moment(new Date(new Date())).utcOffset("+00:00").format("YYYY-MM-DDTHH:mm:ss")
    scoringSessionStartDate.current = startDate;

    getScoreIDs()
    initialSessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_bfi_pet_information);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_submit_bfiScore, "score BFI Screen entered", '');

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      initialSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };

  }, []);

  const initialSessionStart = async () => {
    trace_bfiScoreSubmit_Screen = await perf().startTrace('t_inBFIScoreSubmitScreen');
  };

  const initialSessionStop = async () => {
    await trace_bfiScoreSubmit_Screen.stop();
  };

  useEffect(() => {
    
    if (route.params?.from === "setImages" && route.params?.bfiInfoData && route.params?.bfiInfoData.length > 0) {
      let tempArray = [];
      petBfiImagesSetId.current = route.params?.bfiInfoData[0].petBfiImagesSetId;
      if (route.params?.isEditable) {
        set_descriptionEnable(true)
        previousScore.current = route.params?.bfiInfoData[0].bfiScore
      }
      for (let i = 0; i < route.params?.bfiInfoData[0].petBfiImages.length; i++) {
        let tempObj = {
          uri: route.params?.bfiInfoData[0].petBfiImages[i].imageUrl,
        }
        tempArray.push(tempObj);
      }
      set_imagesFullview(tempArray)

      set_images(route.params?.bfiInfoData[0].petBfiImages)
    }
    else if (route.params?.bfiInfoData && route.params?.bfiInfoData.length > 0) {
      let tempArray = [];
      petBfiImagesSetId.current = route.params?.bfiInfoData[0].petBfiImagesSetId
      if (route.params?.isEditable) {
        previousScore.current = route.params?.bfiInfoData[0].bfiScore
        set_descriptionEnable(true)
      }

      if (route.params?.bfiInfoData[0].petBfiImages) {
        for (let i = 0; i < route.params?.bfiInfoData[0].petBfiImages.length; i++) {
          let tempObj = {
            uri: route.params?.bfiInfoData[0].petBfiImages[i].imageUrl,
          }
          tempArray.push(tempObj);
        }
        set_imagesFullview(tempArray)
        set_images(route.params?.bfiInfoData[0].petBfiImages)
      }

    }

    if (route.params?.petName) {
      setPetName(route.params?.petName)
    }
  }, [route.params?.bfiInfoData, route.params?.petName]);

  const handleBackButtonClick = () => {
    backBtnAction();
    return true;
  };

  const selectPreviousScore = () => {
    if (previousScore.current) {
      setBFIScoresList(bfiScoresList.map(bfiObject =>
        bfiObject.name === previousScore.current ? { ...bfiObject, checked: true } : bfiObject
      ));
      const pos = bfiScoresList.findIndex(obj => obj.name === previousScore.current);
      hashmapScoreIDsData.current.forEach(function (value, key) {
        if (key === previousScore.current) {
          set_BfiImageScoreId(value)
        }
      })
      set_CurrentBFISelected(pos)
      set_isDataValid(true)
    }
  }

  const backBtnAction = () => {
    navigation.pop()
  };

  const nextButtonAction = () => {

    if (descriptionEnable && descriptionText === undefined) {
      createPopup("", Constant.SCORE_EDIT_REASON, 'OK', false, true);
    }
    else {
      firebaseHelper.logEvent(firebaseHelper.event_score_submit_btn_clicked, firebaseHelper.screen_submit_bfiScore, "BFI Screen submit action clicked", "");
      set_isLoading(true);
      submitBFIScore()
    }

  };

  const viewImage = (position) => {
    set_CurrentImageViewPos(position)
    set_isImageView(true);
  }

  const updateSelectedItem = (item, index) => {
    setBFIScoresList(bfiScoresList.map(bfiObject =>
      bfiObject.name === item.name ? { ...bfiObject, checked: true } : bfiObject
    ));
    set_CurrentBFISelected(index)
    set_isDataValid(true)
    set_BfiImageScoreId(hashmapScoreIDsData.current.get(item.name))
  };

  const popOkBtnAction = () => {
    set_isPopUp(false);
    set_popupMessage(undefined);
  };

  //Prepare capture images submit request
  const submitBFIScore = async () => {

    let endDate = moment(new Date(new Date())).utcOffset("+00:00").format("YYYY-MM-DDTHH:mm:ss")
    scoringSessionEndDate.current = endDate;

    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);

    var submitScoreReq = {
      petBfiImageSetId: petBfiImagesSetId.current,
      bfiImageScoreId: bfiImageScoreId,
      description: descriptionText,
      startTime: scoringSessionStartDate.current,
      endTime: scoringSessionEndDate.current,
      createdBy: clientId
    };

    let apiMethod = apiMethodManager.SUBMIT_BFI_SCORE;
    let apiService = await apiRequest.postData(apiMethod,submitScoreReq,Constant.SERVICE_JAVA,navigation);
    set_isLoading(false);
                    
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
                    
      if(apiService.status) {
        navigation.navigate("ReviewComponent", { isFromScreen: 'bfiScore' });
      }

    } else if(apiService && apiService.isInternet === false) {
        
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, 'OK', false, true);
                        
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
        
      createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg, 'OK', false, true);
      firebaseHelper.logEvent(firebaseHelper.event_bfi_score_submit_api, firebaseHelper.screen_submit_bfiScore, "savePetBfiImages Service failed", 'Service error : ' + apiService.error.errorMsg);

    } else {
        
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SCORE_UNABLE_TO_SUBMIT, 'OK', false, true);
      firebaseHelper.logEvent(firebaseHelper.event_bfi_score_submit_api, firebaseHelper.screen_submit_bfiScore, "savePetBfiImages Service failed", 'Service Status : false');
        
    }

  }

  //flat list start listener
  const handleStartReached = (event) => {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.x === 0) set_isScrollEndReached(false)
  };

  // flat list end listener
  const handleEndReached = () => {
    set_isScrollEndReached(true)
  };

  const infoBtnAction = () => {
    navigation.navigate("InstructionsPage", {
      instructionType: 2,
    });
  }

  const createPopup = (aTitle, msg, rBtnTitle, isPopLeft, isPop) => {
    set_popupMessage(msg);
    set_isPopUp(isPop);
  };

  /**
    * Service call to fetch the ScoreID's
    */
  const getScoreIDs = async () => {
    
    set_isLoading(true)

    let apiMethod = apiMethodManager.GET_BFI_SCORES;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
    set_isLoading(false);
                    
    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
                    
      if (apiService.data.bfiImageScores.length > 0) {
        hashmapScoreIDsData.current.clear()
        
        for (let i = 0; i < apiService.data.bfiImageScores.length; i++) {
          const score = apiService.data.bfiImageScores[i].score
          const scoreID = apiService.data.bfiImageScores[i].bfiImageScoreId

          //Add Data to hashmap with score and ScoreID
          hashmapScoreIDsData.current.set(score, scoreID)

          selectPreviousScore()
        }
      }

    } else if(apiService && apiService.isInternet === false) {
        
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, 'OK', false, true);
                        
    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
        
      firebaseHelper.logEvent(firebaseHelper.event_getscore_ids_api, firebaseHelper.screen_submit_bfiScore, "savePetBfiImages Service failed", 'Service error : ' + apiService.error.errorMsg);

    } else {
        
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.CAPTURED_SUBMIT_IMAGES_FAIL, 'OK', false, true);
      firebaseHelper.logEvent(firebaseHelper.event_getscore_ids_api, firebaseHelper.screen_submit_bfiScore, "savePetBfiImages Service failed", 'Service Status : false');
        
    }

  };

  //submitted captured images view
  const horizontalRenderItem = ({ item, index }) => {
    if (item.imagePositionId === '3' || item.imagePositionId === '4' || item.imagePositionId === '5' || item.imagePositionId === '6') {
      imagePositionStyle = styles.imageStyleLandScape
    }
    else
      imagePositionStyle = styles.imageStyle

    return (
      <TouchableOpacity onPress={() => { viewImage(index) }}>
        <ImageBackground style={[imagePositionStyle]} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => set_imgLoader(false)} source={{ uri: item.imageUrl }}>
          {imgLoader === true && item && item.imageUrl ? (<View style={[CommonStyles.spinnerStyle]}><ActivityIndicator size="large" color="#37B57C" /></View>) : null}
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => { updateSelectedItem(item, index) }}>
        <View style={styles.flatListContainer}>
          {index > -1 && index === currentBFISelected ?
            <ImageBackground height= {Platform.isPad ? wp('15%') : wp('20%')} width= {Platform.isPad ? wp('15%') : wp('20%')} style={styles.listItemBg} source={petImgArray[currentBFISelected]} >
              <Text style={styles.itemTextStyleActive}>{item.name}</Text>
            </ImageBackground>
            :
            <View style= {{alignItems:'center',justifyContent:'center'}}>
              <BFIEmptyImg height= {Platform.isPad ? wp('15%') : wp('20%')} width= {Platform.isPad ? wp('15%') : wp('20%')} style={styles.listItemBg}/>
              <Text style={[styles.itemTextStyleInActive,{position:'absolute'}]}>{item.name}</Text>
            </View>
           
          }
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container]}>
      <View style={[CommonStyles.headerView, {}]}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isTitleHeaderEnable={true}
          title={'BFI Scoring'}
          isInfoEnable={true}
          infoBtnAction={() => infoBtnAction()}
          backBtnAction={() => backBtnAction()}
        />
      </View>

      <KeyboardAwareScrollView>
        <Text style={styles.petNameTextStyleBFIApp}>{petName}</Text>

       {images && images.length > 0 ?
        <View style={{ flexDirection: 'row', height: hp('15%'), marginLeft: wp('2%'), marginRight: wp('3%'), }}>
          <FlatList
            horizontal
            data={images}
            showsHorizontalScrollIndicator={false}
            onScroll={handleStartReached}
            onEndReached={handleEndReached}
            keyExtractor={({ imagePositionId }, index) => index}
            renderItem={horizontalRenderItem} />
        </View> : null}

      {images.length > 3 ? <View style={styles.headerViewStyleView}>
        <View style={{ flexDirection: 'row' }}>
          <ArrowLeftImg width = {wp('6%')} height={hp('2%')} style={{marginHorizontal: wp('2%')}}/>
          {!isScrollEndReached ? <IsScrollEndImg width = { wp('6%')} height = {hp('2%')}/> : <IsScrollStartImg width = { wp('6%')} height = {hp('2%')}/>}
          <ArrowRightImg width = {wp('6%')} height={hp('2%')} style={{marginHorizontal: wp('2%')}}/>
        </View>
      </View>
        : null}

      <View style={styles.scrollContainer}>

        <View style={styles.headerViewStyleBFIApp}>
          <FlatList
            nestedScrollEnabled={true}
            data={bfiScoresList}
            renderItem={renderItem}
            extraData={bfiScoresList}
            keyExtractor={item => item.name}
            numColumns={'3'}
          />
        </View>

        {descriptionEnable ?

          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.textInputStyle}
              maxLength={100}
              multiline={true}
              placeholder={'Reason to edit score*'}
              underlineColorAndroid="transparent"
              placeholderTextColor="#808080"
              value={descriptionText}
              onChangeText={async (text) => { set_descriptionText(text) }}
            />
          </View>
          : null}

        <TouchableOpacity onPress={() => {
          navigation.navigate("BFIScoreInstructions")
        }}>

          <View style={styles.headerViewStyleView}>
            <View style={{ flexDirection: 'row', marginBottom: hp("20%") }}>
              <EyeInstructionImg style={styles.eyeImageStyle}/>
              <Text style={styles.viewTextStyleBFIApp}>{'View BFI Chart and Instructions'}</Text>
            </View>
          </View>
        </TouchableOpacity>

      </View>
      </KeyboardAwareScrollView>
      <View style={CommonStyles.bottomViewComponentStyle}>
        <BottomComponent
          rightBtnTitle={'Submit'}
          isLeftBtnEnable={false}
          rigthBtnState={isDataValid}
          isRightBtnEnable={true}
          rightButtonAction={async () => nextButtonAction()}
        />
      </View>

      {isImageView ? <ImageView style={styles.videoViewStyle}
        images={imagesFullview}
        imageIndex={currentImageViewPos}
        visible={isImageView}
        animationType="slide"
        onRequestClose={() => set_isImageView(false)}
      /> : null}

      {isLoading === true ? <LoaderComponent isLoader={false} loaderText={'Please wait..'} isButtonEnable={false} /> : null}

      {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
        <AlertComponent
          header={'Alert'}
          message={popupMessage}
          isLeftBtnEnable={false}
          isRightBtnEnable={true}
          leftBtnTilte={'NO'}
          rightBtnTilte={'OK'}
          popUpRightBtnAction={() => popOkBtnAction()}
        />
      </View> : null}
    </View>
  );
};

export default BFIScoreMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  textContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    marginBottom: hp('1%')
  },

  SectionStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8D8D8",
    width: wp("80%"),
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: hp("1%"),
    height: hp('8%'),
  },

  textInputStyle: {
    ...CommonStyles.fontXMedium,
    fontSize: fonts.fontNormal,
    flex: 1,
    marginLeft: "5%",
    marginRight: "5%",
    color: "black",
    fontFamily: 'Barlow-Regular',
  },

  scrollContainer: {
    flex: 1,
    marginBottom: hp('15%'),

  },
  imageStyle: {
    width: wp("22%"),
    height: hp("15%"),
    borderRadius: 5,
    resizeMode: "cover",
    marginLeft: wp("2%"),
    backgroundColor: "#D9D9D9"
  },
  imageStyleLandScape: {
    width: wp("45%"),
    height: hp("15%"),
    borderRadius: 5,
    resizeMode: "contain",
    marginLeft: wp("2%"),
    backgroundColor: "#D9D9D9"
  },
  petNameTextStyleBFIApp: {
    fontSize: fonts.fontLarge,
    fontFamily: 'Barlow-SemiBold',
    color: "black",
    marginLeft: wp('4%'),
    marginVertical: hp('1%')
  },
  eyeImageStyle: {
    width: wp('5%'),
    height: hp('3%'),
    tintColor: "#6BC100",
  },
  viewTextStyleBFIApp: {
    fontSize: fonts.fontMedium,
    fontFamily: 'Barlow-SemiBold',
    color: "#6BC100",
    paddingLeft: 5,
  },
  headerViewStyleBFIApp: {
    alignItems: 'center',
    // paddingHorizontal: 30,
    marginVertical: hp('2%'),
    justifyContent:'center',
    alignItems:'center',
    width: wp('90%'),
    alignSelf:'center'
  },
  headerViewStyleView: {
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  flatListContainer: {
    flexGrow: 1, justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextStyleActive: {
    alignSelf: 'center',
    fontSize: fonts.fontXLarge,
    fontFamily: 'Barlow-SemiBold',
    color: '#FFFFFF',
    justifyContent: 'center',
    //marginTop: wp('5%'),
  },
  itemTextStyleInActive: {
    alignSelf: 'center',
    // marginTop: wp('5%'),
    fontSize: fonts.fontXLarge,
    fontFamily: 'Barlow-Bold',
    color: '#000000',
  },
  listItemBg: {
    height: Platform.isPad ? wp('15%') : wp('20%'),
    width: Platform.isPad ? wp('15%') : wp('20%'),
    margin: Platform.isPad ? wp('2.5%') : wp('4%'),
    justifyContent: 'center',
    alignItems: 'center'
  },
});
