import React, { useEffect, useState, useRef } from 'react';
import { BackHandler, FlatList, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View, Keyboard, ActivityIndicator } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import fonts from '../../../utils/commonStyles/fonts';
import * as Constant from "../../../utils/constants/constant";
import LoaderComponent from '../../../utils/commonComponents/loaderComponent';

let searchImg = require('./../../../../assets/images/otherImages/svg/searchIcon.svg');
let defaultPetImg = require("./../../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg");

const PetListUI = ({ route, ...props }) => {
  const [isRecords, set_isRecords] = useState(true);
  const [petName, set_petName] = useState(undefined);
  const [isListOpen, set_ListOpen] = useState(false);
  const [filterArray, set_filterArray] = useState(undefined);
  let isKeyboard = useRef(false);
  const [imgLoader, set_imgLoader] = useState(true);
  const [searchTextEff, set_searchTextEff] = useState('');
  const [onEndReached, setOnEndReachedCalled] = useState(false);
  var pageNum = useRef(1);

  //Android Physical back button action
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  useEffect(() => {
    if (props.devices) {
      set_filterArray(props.devices);
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

  const renderItem = ({ item, index }) => {
    return (
      <View>
        <TouchableOpacity onPress={() => { itemAction(item, index) }}>
          <View style={styles.item}>
            <View style={{ flex: 3 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: fonts.fontMedium, fontFamily: 'Barlow-SemiBold', color: 'black' }}>{item.petName}</Text>
              </View>

              <View style={styles.listItemView}>
                <View style={{ flex: 0.8, }}>
                  <Text style={[styles.textStyle]} >{item.petAge ? item.petAge.replace("yrs", ".").replace("mos", '').replace(/\s+/g, '') + 'yrs' : 'N/A'}</Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.textStyle, { marginLeft: hp('1%'), }]}>{item.petBreed ? (item.petBreed.length > 14 ? item.petBreed.slice(0, 14) + "..." : item.petBreed) : ""}</Text>
                </View>
                <View style={{ flex: 0.8, alignItems: 'center' }}>
                  <Text style={[styles.textStyle,]} >{item.weight ? item.weight + 'lbs' : 'N/A'}</Text>
                </View>
              </View>

            </View>

            <ImageBackground source={defaultPetImg} style={[styles.ratingImage1]} imageStyle={{ borderRadius: 15 }}>
              {item.photoUrl && item.photoUrl !== "" ?
                <ImageBackground source={{ uri: item.photoUrl }} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {
                  set_imgLoader(false)
                }} style={[styles.ratingImage1]} imageStyle={{ borderRadius: 15 }}>
                  {imgLoader ? <ActivityIndicator size='small' color="grey" /> : null}
                </ImageBackground> :
                <ImageBackground source={defaultPetImg} style={[styles.ratingImage1]} imageStyle={{ borderRadius: 15 }}></ImageBackground>}
            </ImageBackground>
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

      <View style={CommonStyles.searchBarStyle}>
        <View style={[CommonStyles.searchInputContainerStyle]}>
          <Image source={searchImg} style={CommonStyles.searchImageStyle} />
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
                getPetsData()
              }
            }}
          />
        </View>
      </View>

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
            <Image style={[CommonStyles.nologsDogStyle]} source={require("./../../../../assets/images/dogImages/noRecordsDog.svg")}></Image>
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

      {props.isLoading === true ? <LoaderComponent isLoader={false} loaderText={props.loaderMsg} isButtonEnable={false} /> : null}
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