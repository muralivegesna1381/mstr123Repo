import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import BottomComponent from '../../../utils/commonComponents/bottomComponent';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import fonts from '../../../utils/commonStyles/fonts';

let dogFoodBowlImage = require("./../../../../assets/images/dogImages/dogFoodBowl.svg");

const ReviewSubmissionComponent = ({ route, navigation }) => {

  useEffect(() => {

  }, []);

  const nextButtonAction = async () => {
    navigation.navigate('FoodIntakeComponent', { isBfiListRefresh: true });
  };

  const backBtnAction = async () => {
    navigation.navigate("FoodIntakeMainComponent");
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

        <Image style={[styles.ratingImage]} source={dogFoodBowlImage} />
        <View style={CommonStyles.headerViewStyleBFIApp}>
          <Text style={styles.headerTextStyleBFIApp}>{"Thank you for Submission"}</Text>
          <Text style={styles.headerSubTextStyleBFIAppNormal}>{'Would you like to submit'}</Text>
          <Text style={styles.headerSubTextStyleBFIAppNormal}>{'another food intake'}</Text>
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

export default ReviewSubmissionComponent;

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
    fontSize: fonts.fontNormal,
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
