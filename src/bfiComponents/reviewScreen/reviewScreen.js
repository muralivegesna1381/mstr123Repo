import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, BackHandler } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import CommonStyles from '../../utils/commonStyles/commonStyles';
import fonts from '../../utils/commonStyles/fonts';
import BottomComponent from '../../utils/commonComponents/bottomComponent';
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import * as Constant from "../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';

const ReviewComponent = ({ route, navigation }) => {

  const [isFromScreen, set_isFromScreen] = useState(undefined);
  let trace_bfi_review_Screen;

  useEffect(() => {

    initialSessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_bfi_review);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_bfi_review, "BFI Review Screen entered", '');

    if (route.params?.isFromScreen) {
      set_isFromScreen(route.params?.isFromScreen);
    }

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      initialSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };

  }, [route.params?.isFromScreen]);

  const handleBackButtonClick = () => {
    backBtnAction();
    return true;
  };

  const initialSessionStart = async () => {
    trace_bfi_review_Screen = await perf().startTrace('t_inBFIReviewScreen');
  };

  const initialSessionStop = async () => {
    await trace_bfi_review_Screen.stop();
  };

  const nextButtonAction = async () => {
    if (isFromScreen === 'bfiScore') {
      navigation.navigate('PetListBFIScoringScreen', { isBfiListRefresh: true });
    } else {
      //send flag to hit pets api call. incase new pet added
      let firstUser = await DataStorageLocal.getDataFromAsync(Constant.IS_FIRST_TIME_USER);
      navigation.navigate('PetListComponent', { isFirstUser: firstUser });
    }

  };

  const backBtnAction = async () => {
    //change logic as per role
    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let userDetails = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_DETAILS);
    userDetails = JSON.parse(userDetails)

    if (clientId && clientId > 0) {
      navigation.navigate("DashBoardService");
    } else {
      if (userDetails && userDetails.RolePermissions) {
        let hasBFIImgCapture = false;
        let hasBFIScore = false;

        for (let i = 0; i < userDetails.RolePermissions.length; i++) {
          if (userDetails.RolePermissions[i].menuId === 67) {
            hasBFIImgCapture = true;
          }

          if (userDetails.RolePermissions[i].menuId === 68) {
            hasBFIScore = true;
          }
        }

        if (hasBFIScore && hasBFIImgCapture) {
          // Representative Dashboard
          navigation.navigate("BFIUserDashboardComponent");
        } else if (hasBFIScore) {
          // Veterinerian
          navigation.navigate("PetListBFIScoringScreen");
        } else if (hasBFIImgCapture) {
          // Only Capture
          navigation.navigate("DashBoardService");
        }
      }
    }
  };

  return (
    <View style={styles.container}>

      <View style={[CommonStyles.headerView]}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isChatEnable={false}
          isTImerEnable={false}
          isTitleHeaderEnable={true}
          title={''}
          backBtnAction={() => backBtnAction()}
        />
      </View>

      <View style={[styles.container]}>

        <Image style={[styles.ratingImage]} source={isFromScreen === 'bfiScore' ? require('./../../../assets/images/bfiGuide/svg/review_score_bfi.svg')
          : require('./../../../assets/images/bfiGuide/svg/review_capture_images.svg')} />
        <View style={CommonStyles.headerViewStyleBFIApp}>
          <Text style={styles.headerTextStyleBFIApp}>{isFromScreen === 'bfiScore' ? "Thank you for Scoring" : 'Thank you for capturing'}</Text>
          <Text style={styles.headerSubTextStyleBFIAppNormal}>{isFromScreen === 'bfiScore' ? 'Do you want to score for ' : 'No worries! We\'re processing your pet pics. You\'ll be notified soon.'}</Text>
          <Text style={styles.headerSubTextStyleBFIAppNormal}>{isFromScreen === 'bfiScore' ? 'another set of pictures' : 'Want to take more pics?'}</Text>
        </View>
      </View>

      <View style={CommonStyles.bottomViewComponentStyle}>
        <BottomComponent
          rightBtnTitle={'Yes'}
          leftBtnTitle={'No'}
          isLeftBtnEnable={true}
          rigthBtnState={true}
          isRightBtnEnable={true}
          rightButtonAction={async () => nextButtonAction()}
          leftButtonAction={async () => backBtnAction()}
        />
      </View>
    </View>

  );
};

export default ReviewComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center'
  },

  textInputContainerStyle: {
    flexDirection: 'row',
    marginTop: hp('2%'),
    borderColor: '#dedede',
    backgroundColor: 'white',
  },

  headerTextStyleBFIApp: {
    fontSize: fonts.fontLarge,
    ...CommonStyles.textStyleSemiBold,
    textAlign: 'center',
    marginTop: hp('5%'),
    marginBottom: hp('2%'),
    color: 'black'
  },

  headerSubTextStyleBFIApp: {
    fontSize: fonts.fontNormal,
    ...CommonStyles.textStyleRegular,
    textAlign: 'center',
    opacity: 0.5
    // marginTop: hp('2%'),
  },
  headerSubTextStyleBFIAppNormal: {
    fontSize: fonts.fontMedium,
    ...CommonStyles.textStyleLight,
    textAlign: 'center',
    marginHorizontal: wp('5%'),
  },

  ratingImage: {
    height: wp('45%'),
    width: wp('45%'),
    resizeMode: 'contain'
  }

});
