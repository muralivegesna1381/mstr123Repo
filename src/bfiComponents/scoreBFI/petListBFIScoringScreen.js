//This page shows the pet list along with scored and yet to score sections
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import BuildEnv from "../../config/environment/environmentConfig";
import HeaderComponent from "../../utils/commonComponents/headerComponent";
import LoaderComponent from "../../utils/commonComponents/loaderComponent";
import CommonStyles from "../../utils/commonStyles/commonStyles";
import fonts from "../../utils/commonStyles/fonts";
import * as Constant from "../../utils/constants/constant";
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import AlertComponent from '../../utils/commonComponents/alertComponent';
let searchImg = require("./../../../assets/images/otherImages/svg/searchIcon.svg");
let defaultPetImg = require("./../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg");
import RNExitApp from 'react-native-exit-app';
import * as firebaseHelper from '../../utils/firebase/firebaseHelper';

const PetListBFIScoringScreen = ({ route, navigation }) => {
  const [isLoading, set_isLoading] = useState(true);
  const [data, setData] = useState([]);
  const [pageRecords, set_PageRecords] = useState(10);
  const [btnValue, set_btnValue] = useState(0);
  const Environment = JSON.parse(BuildEnv.Environment());
  const [onEndReached, setOnEndReachedCalled] = useState(false);
  const [isRecords, set_isRecords] = useState(false);
  const [filterArray, set_filterArray] = useState(undefined);
  const [imgLoader, set_imgLoader] = useState(false);
  const [searchTextEff, set_searchTextEff] = useState('');
  const [popupMessage, set_popupMessage] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [date, set_Date] = useState(undefined);
  const [userRole, set_UserRole] = useState(undefined);

  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [popUpRBtnTitle, set_popUpRBtnTitle] = useState(undefined);
  const [isPopupLeft, set_isPopupLeft] = useState(false);

  let isKeyboard = useRef(false);
  var totalRecordsData = useRef([]);
  var pageNum = useRef(1);
  var isScored = useRef(false);
  var searchText = useRef('')
  let trace_pet_list_scoring_Screen;


  //Need to refresh screen when user wants to score another set of images from review screen
  useEffect(() => {
    initialSessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_bfi_pet_list_scoring);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_bfi_pet_list_scoring, "User in Pet list scoring Screen", '');

    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      clearData();
      getPetsData();

      getUserRole()
    });
    return () => {
      focus();
    };

  }, []);

  const getUserRole = async () => {
    let userRole = await DataStorageLocal.getDataFromAsync(Constant.MENU_ID);
    set_UserRole(userRole)
  }

  const initialSessionStart = async () => {
    trace_pet_list_scoring_Screen = await perf().startTrace('t_inPetListScoringScreen');
  };

  const initialSessionStop = async () => {
    await trace_pet_list_scoring_Screen.stop();
  };

  //Android Physical back button action
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      initialSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  const backBtnAction = async () => {
    
    let userRole = await DataStorageLocal.getDataFromAsync(Constant.MENU_ID);

    if (Platform.OS === "android" && userRole === '68') {
      set_popUpAlert('Exit App');
      set_popupMessage(Constant.ARE_YOU_SURE_YOU_WANT_EXIT);
      set_popUpRBtnTitle('YES');
      set_isPopupLeft(true);
      set_isPopUp(true);
      return true
    } else {
      navigation.pop()
    }
  };
  const infoBtnAction = () => {
    //info action to navigate to instructions page
    navigation.navigate("InstructionsPage", {
      instructionType: 2,
    });
  };
  const handleBackButtonClick = () => {
    backBtnAction();
    return true
  };
  //to clear all the data in the screen
  const clearData = (clearSearchData) => {
    totalRecordsData.current = [],
      setData([]),
      pageNum.current = 1,
      set_filterArray(undefined)
    if (clearSearchData) {
      set_searchTextEff(undefined)
      searchText.current = undefined;
    }
    Keyboard.dismiss();

  };

  const fetchMoreData = () => {
    if (isLoading === false && onEndReached === false) {
      pageNum.current = pageNum.current + 1;
      getPetsData();
    }
  };

  const menuAction = () => {
    navigation.navigate('MenuComponent', {});
  };

  const filterPets = (pName) => {
    if (isKeyboard.current === true) {
      let newData = data.filter(function (item) {
        const itemData = item ? item.petName.toUpperCase() : "".toUpperCase();
        const textData = pName.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });

      if (newData && newData.length > 0) {
        set_filterArray(newData);
        set_isRecords(false);
      } else {
        set_filterArray(undefined);
        set_isRecords(true);
      }
    }
  };


  //Getting instructions values from backend
  const getPetBFIImages = async (petID, petImgSets, petName) => {
    //setting array based on instruction type recieved
    set_isLoading(true);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ClientToken: token,
      },
    };
    fetch(Environment.uri + "petBfi/getPetBfiImages/" + petID + "?petBfiImageSetIds=" + petImgSets + "&isScored=" + isScored.current,
      options,)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.response.pets.length > 0) {
          set_isLoading(false);
          if (isScored.current) {
            navigation.navigate("SubmittedScoreComponent", {
              imagesArray: data.response.pets[0].petBfiInfos,
              petName: petName
            });
          }
          else {
            if (data.response.pets[0].petBfiInfos.length > 1) {
              //go to submitted images screeen
              navigation.navigate("PetSubmittedImagesScreen", {
                imagesArray: data.response.pets[0].petBfiInfos,
                petName: petName
              });
            } else {
              //goto Scoring screen
              navigation.navigate("BFIScoreMain", { bfiInfoData: data.response.pets[0].petBfiInfos, petName: petName });
            }
          }
        }
        else {
          set_isLoading(false);
          set_popupMessage('Unable to fetch the data, Please try again later')
          firebaseHelper.logEvent(firebaseHelper.event_getPetBfiImages_api, firebaseHelper.screen_bfi_pet_list_scoring, "getPetBfiImages Service failed", 'Service error');
        }
      })
      .catch((error) => {
        //error block happens when there is something wring with the service
        firebaseHelper.logEvent(firebaseHelper.event_getPetBfiImages_api, firebaseHelper.screen_bfi_pet_list_scoring, "getPetBfiImages Service failed", 'Service error'+ error.message);
        set_isLoading(false);
        set_popupMessage('Unable to fetch the records, Please try again later')
      });
  };

  //getting pets data from service call
  const getPetsData = async () => {
    set_isRecords(false);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    set_isLoading(true);
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ClientToken: token,
      },
    };
    var url_data = '';
    if (searchText.current) {
      url_data = Environment.uri + "petBfi/getBfiPets/" + pageNum.current + "/" + pageRecords + "?searchText=" + searchText.current + "&isScored=" + isScored.current;
    }
    else {
      url_data = Environment.uri + "petBfi/getBfiPets/" + pageNum.current + "/" + pageRecords + "?isScored=" + isScored.current;
    }
    fetch(url_data,
      options,)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.response.pets.length > 0) {
          // set_isRecords(true);
          let obj;
          for (let i = 0; i < data.response.pets.length; i++) {
            obj = data.response.pets[i];
            if (data.response.pets[i].bfiScore !== undefined) {
              switch (data.response.pets[i].bfiScore) {
                case "20":
                  obj.scoreImg = require("./../../../assets/images/bfiGuide/svg/ic_bfi_bg_20.svg");
                  break;
                case "30":
                  obj.scoreImg = require("./../../../assets/images/bfiGuide/svg/ic_bfi_bg_30.svg");
                  break;
                case "40":
                  obj.scoreImg = require("./../../../assets/images/bfiGuide/svg/ic_bfi_bg_40.svg");
                  break;
                case "50":
                  obj.scoreImg = require("./../../../assets/images/bfiGuide/svg/ic_bfi_bg_50.svg");
                  break;
                case "60":
                  obj.scoreImg = require("./../../../assets/images/bfiGuide/svg/ic_bfi_bg_60.svg");
                  break;
                case "70":
                  obj.scoreImg = require("./../../../assets/images/bfiGuide/svg/ic_bfi_bg_70.svg");
                  break;
                default:
                  obj.scoreImg = require("./../../../assets/images/bfiGuide/svg/ic_bfi_bg_other.svg");
                  break;
              }
            }
            totalRecordsData.current.push(obj);
          }
          setData(totalRecordsData.current);
          set_isLoading(false);
        } else {
          firebaseHelper.logEvent(firebaseHelper.event_getBfiPets_api, firebaseHelper.screen_bfi_pet_list_scoring, "getBfiPets_api Service failed", 'Service error');
          if (totalRecordsData.current.length === 0)
            set_isRecords(true);
          set_isLoading(false);
        }
      })
      .catch((error) => {
        firebaseHelper.logEvent(firebaseHelper.event_getBfiPets_api, firebaseHelper.screen_bfi_pet_list_scoring, "getBfiPets_api Service failed", 'Service error'+ error.message);
        set_popupMessage('Unable to fetch the records, Please try again later')
        set_isRecords(true);
        set_isLoading(false);
      });
  };

  const popOkBtnAction = () => {
    if (popupMessage === Constant.ARE_YOU_SURE_YOU_WANT_EXIT) {
      RNExitApp.exitApp();
    }
    set_isPopUp(false);
    set_popupMessage(undefined);
  };

  const popCancelBtnAction = () => {
    set_isPopUp(false);
  }

  const renderPetItem = ({ item, index }) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            if (isScored.current) {
              getPetBFIImages(item.petID, item.petBfiImageSetIds, item.petName)
            }
            else {
              getPetBFIImages(item.petID, item.petBfiImageSetIds, item.petName)
            }
          }}>
          <View style={styles.item}>
            <View style={styles.innerItem}>
              <View style={styles.rowView}>
                <Text style={styles.normalText}>{item.petName}</Text>
              </View>

              <View
                style={styles.innerItem1}>
                <View style={{ flex: 0.8 }}>
                  <Text style={[styles.textStyle]}>
                    {item.petAge ? item.petAge.replace("yrs", ".").replace("mos", "").replace(/\s+/g, "") + "Yrs" : "N/A"}
                  </Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.textStyle, { marginLeft: hp("1%") }]}>
                    {item.petBreed.length > 14 ? item.petBreed.slice(0, 14) + "..." : item.petBreed}
                  </Text>
                </View>
                <View
                  style={{ flex: 0.8, alignItems: "center", marginRight: wp("1.5%"), }}>
                  <Text style={[styles.textStyle,]} >{item.weight ? item.weight + item.weightUnit : 'N/A'}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.ratingImageView]}>
              <ImageBackground source={defaultPetImg} style={[styles.ratingImage1]} imageStyle={{ borderRadius: 15 }}>
                {item.photoUrl && item.photoUrl !== "" ?
                  <ImageBackground source={{ uri: item.photoUrl }} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {
                    set_imgLoader(false)
                  }} style={[styles.ratingImage1]} imageStyle={{ borderRadius: 15 }}>
                    {imgLoader ? <ActivityIndicator size='small' color="grey" /> : null}
                  </ImageBackground> :
                  <ImageBackground source={defaultPetImg} style={[styles.ratingImage1]} imageStyle={{ borderRadius: 15 }}></ImageBackground>}
              </ImageBackground>


              {isScored.current ? (
                <View
                  style={Platform.isPad === true ? [styles.scoreItemBgTab] : [styles.scoreItemBg]}>
                  <ImageBackground resizeMode="contain" style={[styles.ratingImage2, {}]}
                    source={item.scoreImg}
                  />
                  <Text style={Platform.isPad === true ? [styles.textStyleWhiteTab] : [styles.textStyleWhite]}>{item.bfiScore}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[CommonStyles.headerView, {}]}>
        <HeaderComponent
          isBackBtnEnable={userRole === "68" ? false : true}
          isSettingsEnable={userRole === "68" ? true : false}
          isTitleHeaderEnable={true}
          isInfoEnable={true}
          title={"Score BFI"}
          infoBtnAction={() => infoBtnAction()}
          backBtnAction={() => backBtnAction()}
          settingsBtnAction={() => menuAction()}
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
            value={searchText.current}
            onFocus={() => isKeyboard.current = true}
            clearButtonMode='always'
            onSubmitEditing={(event) => {
              set_searchTextEff(event.nativeEvent.text)
              searchText.current = event.nativeEvent.text;
              clearData(false);
              getPetsData();
            }}
            onChangeText={(name) => {
              set_searchTextEff(name)
              searchText.current = name;
              if (data.length < 10) {
                filterPets(name)
              }
              if (name.length == 0) {
                clearData(true);
                getPetsData();
              }
            }}
          />
        </View>
      </View>

      <View style={styles.innerContainer}>
        <View style={styles.tabViewStyle}>
          <TouchableOpacity
            style={btnValue === 0 ? [styles.tabButtonStyle] : [styles.tabButtonDisabledStyle, { borderLeftWidth: 1 }]}
            onPress={() => {
              set_btnValue(0),
                isScored.current = false,
                clearData(true);
              getPetsData();
            }}>
            <Text
              style={btnValue === 0
                ? [styles.btnTextStyle]
                : [styles.btnDisableTextStyle]
              }>
              {"Yet to Score"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={btnValue === 1 ? [styles.tabButtonStyle] : [styles.tabButtonDisabledStyle, { borderRightWidth: 1 }]}
            onPress={() => {
              set_btnValue(1),
                isScored.current = true,
                clearData(true);
              getPetsData();

            }}>
            <Text style={btnValue === 1 ? [styles.btnTextStyle] : [styles.btnDisableTextStyle]}>{"Scored"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {
        isRecords ? (
          <View style={styles.noRecordsContainer}>
            <Image style={[CommonStyles.nologsDogStyle]} source={require("./../../../assets/images/dogImages/noRecordsDog.svg")}></Image>
            <Text style={[CommonStyles.noRecordsTextStyle, { marginTop: hp("2%") }]}>{Constant.NO_RECORDS_LOGS}</Text>
            <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
          </View>
        ) : (
          <View style={styles.flatListView}>
            <FlatList
              data={filterArray ? filterArray : data}
              onEndReachedThreshold={1}
              keyExtractor={({ id }, index) => index}
              renderItem={renderPetItem}
              onMomentumScrollBegin={() => {
                setOnEndReachedCalled(false);
              }}
              onEndReached={() => {
                if (!onEndReached) {
                  fetchMoreData(); // LOAD MORE DATA
                  setOnEndReachedCalled(true);
                }
              }}
            />
          </View>
        )
      }
      {
        isLoading === true ? (
          <LoaderComponent
            isLoader={false}
            loaderText={"Please wait.."}
            isButtonEnable={false}
          />
        ) : null
      }

      {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
        <AlertComponent
          header={'Alert'}
          message={popupMessage}
          isLeftBtnEnable={isPopupLeft}
          isRightBtnEnable={true}
          leftBtnTilte={'NO'}
          rightBtnTilte={popUpRBtnTitle}
          popUpRightBtnAction={() => popOkBtnAction()}
          popUpLeftBtnAction={() => popCancelBtnAction()}
        />
      </View> : null}
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  noRecordsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp("15%"),
  },
  flatListView: {
    marginTop: hp("0.5%"),
    marginBottom: hp("30%")
  },
  tabViewStyle: {
    height: hp("6%"),
    width: wp("80%"),
    flexDirection: "row",
    marginBottom: hp("2%"),
  },
  tabButtonStyle: {
    height: hp("5%"),
    width: wp("40%"),
    backgroundColor: "#CCE8B0",
    borderRadius: 5,
    borderColor: "#6BC105",
    borderWidth: 1,
    justifyContent: "center",
  },
  tabButtonDisabledStyle: {
    height: hp("5%"),
    width: wp("40%"),
    backgroundColor: "white",
    borderRadius: 5,
    borderColor: "#EAEAEA",
    borderBottomWidth: 1,
    borderTopWidth: 1,
    justifyContent: "center",
  },
  btnTextStyle: {
    ...CommonStyles.textStyleBold,
    fontSize: fonts.fontNormal,
    color: "#6BC105",
    textAlign: "center",
  },
  btnDisableTextStyle: {
    ...CommonStyles.textStyleRegular,
    fontSize: fonts.fontNormal,
    color: "black",
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#9f9f9f",
    minHeight: hp("8%"),
    width: wp("85%"),
    alignSelf: "center",
    marginTop: hp("1.5%"),
  },
  innerItem: {
    flex: 3
  },
  rowView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  normalText: {
    fontSize: fonts.fontMedium,
    fontFamily: "Barlow-SemiBold",
    color: "black",
    ...CommonStyles.textStyleBold,
  },
  innerItem1: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("1.5%"),
    marginTop: hp("1%"),
  },
  scoreItemBg: {
    alignSelf: "flex-end",
    right: wp('0.5%'),
    marginTop: hp('-8.5%'),
  },

  scoreItemBgTab: {
    alignSelf: "flex-end",
    right: wp('2%'),
    marginTop: hp('-8%'),
  },
  innerContainer: {
    width: wp("100%"),
    marginTop: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
  },
  ratingImageView: {
    height: hp("8%"),
    width: wp("15%"),
  },

  imageWithScore: {
    width: wp("15%"),
    aspectRatio: 1,
    marginTop: wp("2%"),
    flex: 0.5,
    alignSelf: "center",
  },

  imageNoScore: {
    width: wp("15%"),
    aspectRatio: 1,
    marginTop: wp("2%"),
    flex: 0.8,
    alignSelf: "center",
  },

  ratingImage2: {
    height: hp('5%'),
    width: wp("9%"),
    position: "absolute",
    marginLeft: wp("3.5%"),
    marginTop: hp("-0.3%"),
    alignContent: "flex-end",
  },


  textStyle: {
    textAlign: "left",
    color: "#7F7F81",
    fontSize: fonts.fontXSmall,
    fontFamily: "Barlow-Regular",
  },
  textStyleWhite: {
    color: "#FFFFFF",
    fontSize: fonts.fontXSmall,
    ...CommonStyles.textStyleBold,
    marginTop: hp('1%'),
    marginLeft: wp('5.5%'),
  },

  textStyleWhiteTab: {
    color: "#FFFFFF",
    fontSize: fonts.fontMedium,
    ...CommonStyles.textStyleBold,
    marginTop: hp('1%'),
    marginLeft: wp('6%'),
  },

  ratingImage1: {
    resizeMode: 'contain',
    marginLeft: hp('1%'),
    marginRight: hp('1%'),
    aspectRatio: 1,
    height: hp('7.2%'),
    alignSelf: 'center',
    justifyContent: 'center'
  },


});

export default PetListBFIScoringScreen;
