import moment from 'moment';
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, ImageBackground, Keyboard, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import ImageView from "react-native-image-viewing";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import AlertComponent from '../../utils/commonComponents/alertComponent';
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import fonts from '../../utils/commonStyles/fonts';
import * as Constant from "../../utils/constants/constant";

import NoRecordsImg from "./../../../assets/images/dogImages/noRecordsDog.svg";
import DropDownImg from "./../../../assets/images/otherImages/svg/dropDownDate.svg";
import ObsVideoImg from "./../../../assets/images/otherImages/svg/observationVideoLogo.svg";
import RightArrowImg from "./../../../assets/images/otherImages/svg/rightArrowLightImg.svg";
import SearchImg from "./../../../assets/images/otherImages/svg/searchIcon.svg";


const MediaUI = ({ navigation, route, ...props }) => {
  const [btnValue, set_btnValue] = useState('Observations');
  const [searchTextEff, set_searchTextEff] = useState('');
  const [isDateVisible, set_isDateVisible] = useState(false);
  let fStartDate = useRef(undefined);
  let fEndDate = useRef(undefined)

  let fStartDate_cal = useRef(undefined);
  let fEndDate_cal = useRef(undefined)

  let isKeyboard = useRef(false);
  const minDate = new Date(2023, 1, 1);
  const [fCalenderSdate, set_fCalenderSdate] = useState(undefined);
  const [fCalenderedate, set_fCalenderedate] = useState(undefined);
  const [isImageView, set_isImageView] = useState(false);
  const [currentImageViewPos, set_CurrentImageViewPos] = useState(0);
  const [images, set_images] = useState([]);
  var pageNum = useRef(1);

  useEffect(() => {
    getLastweekDate();
  }, []);

  const getLastweekDate = async () => {
    const currentDate = moment(); // today's date
    const previousDate = moment().subtract(30, 'days'); // previous dates

    fStartDate.current = previousDate.format('YYYY-MM-DD');
    fEndDate.current = currentDate.format('YYYY-MM-DD');

    if (fStartDate.current && fEndDate.current) {
      set_fCalenderSdate(previousDate.format('DD MMM YY'));
      set_fCalenderedate(currentDate.format('DD MMM YY'));
    }
  }

  const popOkBtnAction = () => {
    props.popOkBtnAction();
  };

  const backBtnAction = async () => {
    props.backBtnAction();
  };

  const getPetsMediaData = async (type, searchText) => {
    set_isDateVisible(false)
    pageNum.current = 1
    Keyboard.dismiss()
    props.getPetsMediaData(type, pageNum.current, searchText, fStartDate.current, fEndDate.current)
  }

  const clearSearchValues = () => {
    pageNum.current = 1
    props.getPetsMediaData(btnValue, pageNum.current, "", fStartDate.current, fEndDate.current)
  };

  const fetchMoreData = () => {
    pageNum.current = pageNum.current + 1;
    props.getPetsMediaData(btnValue, pageNum.current, searchTextEff, fStartDate.current, fEndDate.current)
  }

  const doneCalenderBtnAction = () => {

    fStartDate.current = undefined
    fEndDate.current = undefined

    fStartDate.current = fStartDate_cal.current
    fEndDate.current = fEndDate_cal.current

    set_fCalenderSdate(moment(fStartDate.current, 'YYYY-MM-DD').format('DD MMM YY'))
    set_fCalenderedate(moment(fEndDate.current, 'YYYY-MM-DD').format('DD MMM YY'))

    if (fStartDate.current || fEndDate.current) {
      pageNum.current = 1
      props.getPetsMediaData(btnValue, pageNum.current, searchTextEff, fStartDate.current, fEndDate.current)
    }
    set_isDateVisible(false)

    fStartDate_cal.current = undefined
    fEndDate_cal.current = undefined
  };

  const cancelCalenderBtnAction = () => {
    set_isDateVisible(false)
  };

  const MediaItem = ({ thumbnailUrl, uri, isVideo }) => {
    const [imgLoader, set_imgLoader] = useState(true);

    return (
      <TouchableOpacity style={styles.mediaItem}>
        <ImageBackground
          source={{ uri: thumbnailUrl }}
          onLoadStart={() => set_imgLoader(true)}
          onLoadEnd={() => set_imgLoader(false)}
          style={[styles.ratingImage1]}
          imageStyle={{ borderRadius: 5 }}>

          {isVideo ? <ObsVideoImg style={[styles.videoLogoStyle]} /> : null}

          {imgLoader && (
            <ActivityIndicator
              size="small"
              color="grey"
              style={[styles.loaderStyle]} // Custom style for positioning the loader
            />
          )}
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const mediaItems = [
      ...(item.videos && item.videos.length > 0 ? item.videos : []),
      ...(item.photos && item.photos.length > 0 ? item.photos : []),
      ...(item.petBfiImages && item.petBfiImages.length > 0 ? item.petBfiImages : [])
    ];

    const formattedDate = item.modifiedDate
      ? moment(moment.utc(item.modifiedDate).toDate()).local().format('MM-DD-YYYY')
      : item.petBfiImgCapturedOn
        ? moment(moment.utc(item.petBfiImgCapturedOn)).local().format('MM-DD-YYYY')
        : 'N/A';


    return (
      <TouchableOpacity onPress={() => { props.navigateToMediaDetailPage(item) }}>
        {mediaItems.length > 0 ?
          <View style={{}}>
            <Text style={styles.behaviorName}>{item.petName}</Text>
            <View style={styles.horizontalContainer}>
              <View style={{ width: wp('50%') }}>
                <FlatList
                  data={mediaItems}
                  horizontal
                  keyExtractor={(item, index) => {
                    try {
                      // Check if it's a video or photo and return a unique key
                      if (item.observationVideoId) {
                        return item.observationVideoId.toString();
                      } else if (item.observationPhotoId) {
                        return item.observationPhotoId.toString();
                      } else if (item.imagePositionId) {
                        return item.imagePositionId.toString();
                      }
                      return `${index}`;
                    } catch (error) {
                      return `${Math.random()}`;
                    }
                  }}
                  renderItem={({ item: mediaItem }) => {
                    // Use the common MediaItem component for both video and photo
                    if (mediaItem.videoUrl && mediaItem.videoThumbnailUrl) {
                      // Render observation video thumbnail
                      return <MediaItem thumbnailUrl={mediaItem.videoThumbnailUrl} uri={mediaItem.videoUrl} isVideo={true} />;
                    } else if (mediaItem.filePath) {
                      // Render observation photo thumbnail
                      return <MediaItem thumbnailUrl={mediaItem.filePath} uri={mediaItem.filePath} isVideo={false} />;
                    } else if (mediaItem.thumbnailUrl) {
                      // Render bfi photo thumbnail
                      return <MediaItem thumbnailUrl={mediaItem.imageUrl} uri={mediaItem.imageUrl} isVideo={false} />;
                    }
                  }}
                />
              </View>

              {/* Date and Right Arrow Section */}
              <View style={{ width: wp('35%'), flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 10 }}>
                <Text style={styles.dateText}>{formattedDate}</Text>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <RightArrowImg width={wp("5%")} height={hp("1.5%")} style={styles.rightArrow} />
                </View>
              </View>
            </View>
            {/* Divider */}
            <View style={styles.divider} />
          </View> : undefined}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={[styles.mainComponentStyle]}>

        <View style={[CommonStyles.headerView, {}]}>
          <HeaderComponent
            isBackBtnEnable={true}
            isSettingsEnable={false}
            isTitleHeaderEnable={true}
            isInfoEnable={true}
            title={"Media"}
            backBtnAction={() => backBtnAction()}
          />
        </View>

        <View style={styles.innerContainer}>
          <View style={[styles.tabViewStyle, { marginTop: wp('2%') }]}>

            <TouchableOpacity style={[btnValue === 'Observations' ? styles.tabViewEnableBtnStyle : styles.tabViewBtnStyle]} onPress={async () => {
              set_searchTextEff('')
              set_btnValue("Observations")
              await getLastweekDate();
              getPetsMediaData("Observations", "");
            }}>
              <Text style={[CommonStyles.tabBtnTextStyle]}>{'Observations'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[btnValue === 'BFI' ? styles.tabViewEnableBtnStyle : styles.tabViewBtnStyle]} onPress={async () => {
              set_searchTextEff('')
              set_btnValue("BFI")
              await getLastweekDate();
              getPetsMediaData("BFI", "");
            }}>
              <Text style={[CommonStyles.tabBtnTextStyle, { marginRight: hp('0.2%') }]}>{'BFI'}</Text>
            </TouchableOpacity>

          </View>
        </View>

        <View style={{ flexDirection: 'row', marginLeft: wp('5%'), marginTop: hp('2.5%'), width: wp('90%') }}>
          <View style={[CommonStyles.searchBarStyle, { width: wp('46%'), marginTop: hp('0%') }]}>
            <View style={[CommonStyles.searchInputContainerStyle, { width: wp('45%') }]}>
              <SearchImg width={wp('3%')} height={hp('4%')} style={{ marginLeft: wp('2%') }} />
              <TextInput
                style={CommonStyles.searchTextInputStyle}
                underlineColorAndroid="transparent"
                placeholder="Search a pet"
                placeholderTextColor="#7F7F81"
                returnKeyType='search'
                autoCapitalize="none"
                value={searchTextEff}
                onFocus={() => {
                  isKeyboard.current = true
                  set_isDateVisible(false)
                }
                }
                clearButtonMode='always'
                onSubmitEditing={(event) => {
                  set_searchTextEff(event.nativeEvent.text)
                  getPetsMediaData(btnValue, event.nativeEvent.text)
                }}
                onChangeText={(name) => {
                  set_searchTextEff(name)
                  if (name.length == 0) {
                    clearSearchValues()
                  }
                }}
              />
            </View>
          </View>

          <TouchableOpacity style={{
            width: wp('35%'), marginLeft: wp('4%'), position: 'absolute', right: 0,
          }} onPress={() => {
            Keyboard.dismiss()
            set_isDateVisible(!isDateVisible)
          }}>
            <View style={{ flexDirection: "column", width: wp('35%') }}>

              <Text style={styles.dateTextStyle}>
                {fCalenderSdate && fCalenderedate ? 'Date range' : 'Select Date range'}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>

                {fCalenderSdate && fCalenderedate ? (
                  <>
                    <Text style={[styles.dateTextStyle, { color: 'grey', fontSize: fonts.fontSmall }]}>
                      {fCalenderSdate} {fCalenderedate && fCalenderedate !== null && fCalenderedate !== 'Invalid date' ? `- ${fCalenderedate}` : ''}
                    </Text>

                    <DropDownImg
                      width={Platform.isPad ? wp('3%') : wp('3%')}
                      height={hp('0.8%')}
                      style={{ marginLeft: hp('1%') }}
                    />
                  </>
                ) : null}
              </View>
            </View>

          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp('2%'), marginRight: wp('5%') }}>
          <Text style={[styles.hTextextStyle, { flex: 3, marginLeft: wp('8%') }]}>{'Pet Name'}</Text>
          <Text style={[styles.hTextextStyle, { flex: 1.4, }]}>{btnValue === 'Observations' ? 'Modified Date' : 'Submitted Date'}</Text>
        </View>

        <View style={{ flex: 1, marginBottom: hp('2%'), marginLeft: wp('8%'), marginRight: wp('3%') }}>
          {props.data && props.data.length > 0 ?
            <FlatList
              data={props.data}
              showsVerticalScrollIndicator={true}
              renderItem={renderItem}
              keyExtractor={(mediaItem) => {
                const key = `${Math.random().toString()}`;
                return key;
              }}
              onEndReachedThreshold={1}
              onEndReached={() => {
                fetchMoreData();
              }}
            /> :
            (
              !props.isLoading ? (
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp("15%") }}>
                  <NoRecordsImg style={[CommonStyles.nologsDogStyle]} />
                  <Text style={[CommonStyles.noRecordsTextStyle, { marginTop: hp("2%") }]}>
                    {Constant.NO_RECORDS_LOGS}
                  </Text>
                  <Text style={[CommonStyles.noRecordsTextStyle1]}>
                    {Constant.NO_RECORDS_LOGS1}
                  </Text>
                </View>
              ) : null
            )
          }

        </View>

        {
          props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
            <AlertComponent
              header={props.popUpAlert}
              message={props.popUpMessage}
              isLeftBtnEnable={false}
              isRightBtnEnable={true}
              leftBtnTilte={'NO'}
              rightBtnTilte={'OK'}
              popUpRightBtnAction={() => popOkBtnAction()}
            />
          </View> : null
        }

        {props.isLoading === true ? <LoaderComponent isLoader={false} loaderText={Constant.DEFAULT_LOADER_MSG} isButtonEnable={false} /> : null}

        {
          isDateVisible ? <View style={[CommonStyles.popSearchViewStyle, { height: hp('50%'), justifyContent: 'center' }]}>

            <View style={CommonStyles.datePickerMViewStyle}>

              <View style={{ flexDirection: "row", justifyContent: 'space-between', marginBottom: hp('2%'), marginHorizontal: wp('5%') }}>
                <TouchableOpacity style={CommonStyles.dteTouchBtnStyle} onPress={() => cancelCalenderBtnAction()}>
                  <Text style={CommonStyles.doneTexStyle}>{'Cancel'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={CommonStyles.dteTouchBtnStyle} onPress={() => doneCalenderBtnAction()}>
                  <Text style={CommonStyles.doneTexStyle}>{'Done'}</Text>
                </TouchableOpacity>
              </View>

              <View style={CommonStyles.datePickerSubViewStyle}>
                <CalendarPicker
                  startFromMonday={true}
                  allowRangeSelection={true}
                  minDate={minDate}
                  maxDate={new Date()}
                  selectedStartDate={moment(fStartDate.current).toDate()} // Set custom start date
                  selectedEndDate={fEndDate.current ? moment(fEndDate.current).toDate() : null} // Set custom end date
                  allowBackwardRangeSelect={true}
                  todayBackgroundColor="#808080"
                  selectedDayColor="#CDE8B1"
                  selectedDayTextColor="black"
                  nextTitleStyle={{ fontFamily: 'Barlow-SemiBold' }}
                  previousTitleStyle={{ fontFamily: 'Barlow-SemiBold' }}
                  selectedRangeStartStyle={{ backgroundColor: "#6BC100" }}
                  selectedRangeEndStyle={{ backgroundColor: "#6BC100" }}
                  nextTitle='Next'
                  previousTitle='Previous'
                  width={370}
                  height={370}
                  textStyle={{ fontFamily: 'Barlow-SemiBold', color: '#000000', }}
                  onDateChange={(date, type) => {
                    if (type === 'START_DATE' && date) {
                      fStartDate_cal.current = moment(date).format('YYYY-MM-DD')
                    } else if (type === 'END_DATE' && date && fStartDate_cal.current !== moment(date).format('YYYY-MM-DD')) {
                      fEndDate_cal.current = moment(date).format('YYYY-MM-DD')
                      if (fStartDate_cal.current === undefined) {
                        fStartDate_cal.current = fStartDate.current
                      }
                    }
                  }}
                  maxRangeDuration={30}
                />
              </View>
            </View>

          </View> : null
        }

        {
          isImageView ? <ImageView style={styles.videoViewStyle}
            images={images}
            imageIndex={currentImageViewPos}
            visible={isImageView}
            animationType="slide"
            onRequestClose={() => set_isImageView(false)}
          /> : null
        }

      </View >
    </TouchableWithoutFeedback>
  );
}

export default MediaUI;

const styles = StyleSheet.create({
  mainComponentStyle: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  innerContainer: {
    width: wp("100%"),
    marginTop: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
  },
  tabViewStyle: {
    width: wp('90%'),
    height: hp('4%'),
    backgroundColor: '#7676801F',
    alignSelf: 'center',
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabViewEnableBtnStyle: {
    width: wp('43%'),
    height: hp('3.5%'),
    backgroundColor: 'white',
    borderRadius: 7,
    marginLeft: hp('0.2%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#132533',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },

  tabViewBtnStyle: {
    width: wp('43%'),
    height: hp('3.5%'),
    backgroundColor: 'transparent',
    marginLeft: hp('0.2%'),
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnTextStyle: {
    ...CommonStyles.textStyleBold,
    fontSize: fonts.fontMedium,
    color: "#6BC105",
    textAlign: "center",
  },
  btnDisableTextStyle: {
    ...CommonStyles.textStyleBold,
    fontSize: fonts.fontMedium,
    color: "black",
    textAlign: "center",
  },
  dateTextStyle: {
    ...CommonStyles.textStyleSemiBold,
    fontSize: fonts.fontXSmall,
    color: "#000000",
  },
  behaviorName: {
    fontSize: fonts.fontXSmall, ...CommonStyles.textStyleMedium, color: 'black', marginTop: hp('1.5%')
  },
  noRecords: {
    fontSize: fonts.fontXMedium, ...CommonStyles.textStyleRegular, color: 'black',
    marginTop: hp('1.5%'), marginVertical: hp('3%'), textAlign: 'center'
  },
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('1.5%'),
  },
  mediaItem: {
    marginRight: wp('2%'),
  },
  ratingImage1: {
    resizeMode: 'contain',
    aspectRatio: 1,
    height: hp('8%'),
    alignSelf: 'center',
    justifyContent: 'center'
  },
  dateText: {
    fontSize: fonts.fontXSmall, ...CommonStyles.textStyleMedium, color: 'black', marginHorizontal: hp('2%')
  },
  rightArrow: {
    height: hp("1%"),
    width: wp("1%"),
    resizeMode: "contain",
    overflow: "hidden",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: hp('1%'),
  },
  hTextextStyle: {
    fontSize: fonts.fontXSmall,
    ...CommonStyles.textStyleSemiBold,
    color: 'black',
    textAlign: 'left'
  },
  videoLogoStyle: {
    width: wp("4%"),
    height: hp("3%"),
    resizeMode: 'contain',
    position: 'absolute',
    bottom: 0,
    right: 0,
    overflow: 'hidden',
  },
  videoViewStyle: {
    flex: 1,
    justifyContent: 'center'
  },
});