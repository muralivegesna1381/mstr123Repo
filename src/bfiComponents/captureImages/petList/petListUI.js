import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, FlatList, ImageBackground, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import LoaderComponent from '../../../utils/commonComponents/loaderComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import fonts from '../../../utils/commonStyles/fonts';
import * as Constant from "../../../utils/constants/constant";
import * as firebaseHelper from '../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import { useNavigation } from "@react-navigation/native";

import SearchImg from "./../../../../assets/images/otherImages/svg/searchIcon.svg";
import DefaultPetImg from "./../../../../assets/images/otherImages/png/defaultDogIcon_dog.png";
import NoRecordsImg from "./../../../../assets/images/dogImages/noRecordsDog.svg";

const PetListUI = ({ route, ...props }) => {

  const navigation = useNavigation();
  const [isRecords, set_isRecords] = useState(true);
  const [filterArray, set_filterArray] = useState(undefined);
  const [imgLoader, set_imgLoader] = useState(true);
  const [searchTextEff, set_searchTextEff] = useState('');
  const [onEndReached, setOnEndReachedCalled] = useState(false);
  const [hideSearch, setHideSearch] = useState(false);
  const [date, set_Date] = useState(new Date());

  var pageNum = useRef(1);
  let isKeyboard = useRef(false);
  let trace_pet_list_Screen;

  //Android Physical back button action
  useEffect(() => {

    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_bfi_pet_information);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_bfi_pet_information, "User in BFI Pet List Screen", '');
    });

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      initialSessionStop();
      focus();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  const initialSessionStart = async () => {
    trace_pet_list_Screen = await perf().startTrace('t_inBFIPetListScreen');
  };

  const initialSessionStop = async () => {
    await trace_pet_list_Screen.stop();
  };

  useEffect(() => {

    if (props.devices) {
      set_filterArray(props.devices);
      if (props.devices.length > 0) {
        setHideSearch(false)
      }
      else {
        setHideSearch(false)

      }
      if (props.devices.length > 0) {
        set_isRecords(true);
      } else {
        set_isRecords(false);
      }
    }
  }, [props.devices]);

  const backBtnAction = () => {
    props.navigateToPrevious();
  };

  const handleBackButtonClick = () => {
    backBtnAction();
    return true;
  };

  // Saves the Device type and navigates to Configuration process
  const itemAction = async (item, index) => {
    props.navigateToCapture(item, index);
  };

  const navigateToNext = () => {
    props.navigateToNext();
  };

  const infoBtnAction = () => {
    props.infoBtnAction();
  }

  const fetchMoreData = () => {
    pageNum.current = pageNum.current + 1;
    props.pageNumberUpdated(pageNum.current);
  };

  const getPetsData = () => {
    Keyboard.dismiss()
    pageNum.current = 1
    props.doServiceCall(searchTextEff);
  };

  const clearSearchValues = () => {
    props.clearSearchValues();
  };

  const renderItem = ({ item, index }) => {
    return (
      <View>
        <TouchableOpacity onPress={() => { itemAction(item, index) }}>
          <View style={styles.item}>
            <View style={{ flex: 3 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: fonts.fontXMedium, fontFamily: 'Barlow-SemiBold', color: 'black' }}>{item.petName}</Text>
              </View>

              <View style={styles.listItemView}>
                <View style={{ flex: 0.8, }}>
                  <Text style={[styles.textStyle]} >{item.petAge ? item.petAge.replace("yrs", ".").replace("mos", '').replace(/\s+/g, '') + 'yrs' : 'N/A'}</Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.textStyle, { marginLeft: hp('1%'), }]}>{item.petBreed ? (item.petBreed.length > 14 ? item.petBreed.slice(0, 14) + "..." : item.petBreed) : ""}</Text>
                </View>
                <View style={{ flex: 0.8, alignItems: 'center' }}>
                  <Text style={[styles.textStyle,]} >{item.weight ? item.weight + item.weightUnit : 'N/A'}</Text>
                </View>
              </View>

            </View>

            {item.photoUrl && item.photoUrl !== "" ?
              <ImageBackground source={{ uri: item.photoUrl }} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {
                set_imgLoader(false)
              }} style={[styles.ratingImage1]} imageStyle={{ borderRadius: 15 }}>
                {imgLoader ? <ActivityIndicator size='small' color="grey" /> : null}
              </ImageBackground> :
              <ImageBackground source={DefaultPetImg} style={[styles.ratingImage1]} imageStyle={{ borderRadius: 15 }}></ImageBackground>}

          </View>
        </TouchableOpacity>
      </View>
    );

  };

  return (
    <View style={[styles.mainComponentStyle]}>

      <View style={[CommonStyles.headerView]}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isChatEnable={false}
          isTImerEnable={false}
          isTitleHeaderEnable={true}
          isInfoEnable={true}
          infoBtnAction={() => infoBtnAction()}
          title={'Capture BFI Photos'}
          backBtnAction={() => backBtnAction()}
        />
      </View>

      {!hideSearch ? <View style={CommonStyles.searchBarStyle}>
        <View style={[CommonStyles.searchInputContainerStyle]}>
          <SearchImg width={wp('3%')} height={hp('4%')} style={{ marginLeft: wp('2%') }} />
          <TextInput
            style={CommonStyles.searchTextInputStyle}
            underlineColorAndroid="transparent"
            placeholder="Search a pet"
            placeholderTextColor="#7F7F81"
            returnKeyType='search'
            autoCapitalize="none"
            value={searchTextEff}
            onFocus={() => isKeyboard.current = true}
            clearButtonMode='always'
            onSubmitEditing={(event) => {
              set_searchTextEff(event.nativeEvent.text)
              getPetsData();
            }}
            onChangeText={(name) => {
              set_searchTextEff(name)
              if (name.length == 0) {
                clearSearchValues()

              }
            }}
          />
        </View>
      </View> : null}

      <View style={{ flex: 1, marginBottom: hp('15%'), marginTop: hp('2%'), alignSelf: 'center' }}>
        {isRecords ?
          <FlatList
            data={filterArray ? filterArray : undefined}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${index}`}
            onEndReached={() => {
              //if (!onEndReached) {
              fetchMoreData(); // LOAD MORE DATA
              setOnEndReachedCalled(true);
              //}
            }}
          /> : <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp("15%"), }}>
            <NoRecordsImg style={[CommonStyles.nologsDogStyle]} />
            <Text style={[CommonStyles.noRecordsTextStyle, { marginTop: hp("2%") }]}>{Constant.NO_RECORDS_LOGS}</Text>
            <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
          </View>}

      </View>

      <View style={CommonStyles.bottomViewComponentStyle}>
        <BottomComponent
          rightBtnTitle={'ADD NEW PET'}
          rigthBtnState={true}
          isRightBtnEnable={true}
          rightButtonAction={async () => navigateToNext()}
        />
      </View>

      {props.isLoading === true ? <LoaderComponent isLoader={false} loaderText={Constant.DEFAULT_LOADER_MSG} isButtonEnable={false} /> : null}
    </View>
  );
}

export default PetListUI;

const styles = StyleSheet.create({

  mainComponentStyle: {
    flex: 1,
    backgroundColor: 'white'
  },

  dataViewStyle: {
    minHeight: hp('8%'),
    width: wp('90%'),
    marginTop: hp("2%"),
    borderRadius: 5,
    borderColor: '#EAEAEA',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  imgStyle: {
    height: hp("5%"),
    width: wp("11%"),
    alignSelf: "center",
    resizeMode: "contain",
    borderRadius: 5,
    overflow: "hidden",
    marginRight: hp("1%"),
    borderColor: 'red',
  },

  deviceName: {
    ...CommonStyles.textStyleSemiBold,
    fontSize: fonts.fontMedium,
    margin: wp("0.5%"),
  },

  setupUpdateImgStyles: {
    height: hp("2%"),
    width: hp("2%"),
    alignSelf: "center",
    marginRight: hp("1%"),
  },

  subHeaderStyle: {
    ...CommonStyles.textStyleSemiBold,
    fontSize: fonts.fontSmall,
    textAlign: "justify",
    margin: wp("0.5%"),
  },

  item: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#9f9f9f',
    minHeight: hp('8%'),
    width: wp('87%'),
    alignSelf: 'center',
    marginBottom: hp('2%'),
  },

  ratingImage: {
    height: hp('18%'),
    width: wp('16%'),
  },

  ratingImage1: {
    resizeMode: 'contain',
    marginLeft: hp('1%'),
    marginRight: hp('1%'),
    aspectRatio: 1,
    height: hp('7%'),
    alignSelf: 'center',
    justifyContent: 'center'
  },

  noRecordImage: {
    height: hp('50%'),
    width: wp('50%'),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    textAlign: 'left',
    color: '#7F7F81',
    fontSize: fonts.fontXSmall,
    fontFamily: 'Barlow-Regular',
  },
  listItemView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
    marginTop: hp('1%')
  },

});