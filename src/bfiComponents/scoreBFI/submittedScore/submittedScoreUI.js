import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, FlatList, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import fonts from '../../../utils/commonStyles/fonts';
import * as Constant from "../../../utils/constants/constant";
import perf from '@react-native-firebase/perf';

import EditImg from "./../../../../assets/images/bfiGuide/svg/edit.svg";
import NoRecodsFoundImg from "./../../../../assets/images/dogImages/noRecordsDog.svg";

const SubmittedScoreUI = ({ route, ...props }) => {

  const [isRecords, set_isRecords] = useState(true);
  const [dataArray, set_dataArray] = useState(undefined);

  var screenName = useRef('Scores');
  let trace_submitted_scores_Screen;

  // Setting the instructions data to the UI
  useEffect(() => {
    if (props.instructions) {
      set_dataArray(props.instructions);
    }
    if (props.petName) {
      screenName.current = props.petName + '\'s Scores';
    }
  }, [props.instructions, props.petName]);


  //Android Physical back button action
  useEffect(() => {
    initialSessionStart();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      initialSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  const backBtnAction = () => {
    props.navigateToPrevious();
  };

  const handleBackButtonClick = () => {
    backBtnAction();
    return true;
  };

  const infoBtnAction = () => {
    props.infoBtnAction();
  }

  const navigateToScorePage = (item, index) => {
    props.navigateToScorePage(item, index);
  }


  const initialSessionStart = async () => {
    trace_submitted_scores_Screen = await perf().startTrace('t_insubmittedScoresScreen');
  };

  const initialSessionStop = async () => {
    await trace_submitted_scores_Screen.stop();
  };

  const renderItem = ({ item, index }) => {
    return (
      <View>
        <TouchableOpacity>
          <View style={styles.item}>
            <View style={{ flexDirection: 'row', width: wp('80%'), justifyContent: 'space-between', alignItems: 'center', marginVertical: wp('2%'), width: wp('60%'), height: hp('3%') }}>

              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.textStyle}>{item.scoreDate}</Text>
                <Text style={styles.textStyle}>{item.scoreTime}</Text>
              </View>

              <View style={{ flexDirection: 'row' }}>
                <View style={Platform.isPad === true ? [styles.scoreItemBgTab] : [styles.scoreItemBg]}>
                  <item.scoreImg width ={wp("8%")} height ={hp("4%")} style={[styles.ratingImage2, {}]}/>
                  <Text style={Platform.isPad === true ? [styles.textStyleWhiteTab] : [styles.textStyleWhite]}>{item.scoreValue}</Text>
                </View>

                {item.editScore ?
                  <TouchableOpacity onPress={() => { navigateToScorePage(item, index); }}>
                    <EditImg width={wp('3%')} height={hp('3%')} style={[styles.editImageStyle, {}]}/>
                  </TouchableOpacity> : null}
              </View>

            </View>
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
          title={screenName.current}
          isInfoEnable={true}
          infoBtnAction={() => infoBtnAction()}
          backBtnAction={() => backBtnAction()}
        />
      </View>


      <View style={{ flex: 1, marginBottom: hp('1%'), marginTop: hp('2%'), alignSelf: 'center' }}>
        {isRecords ? <FlatList
          data={dataArray}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${index}`} />
          :
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp("15%"), }}>
            <NoRecodsFoundImg style={[CommonStyles.nologsDogStyle]}/>
            <Text style={[CommonStyles.noRecordsTextStyle, { marginTop: hp("2%") }]}>{Constant.NO_RECORDS_LOGS}</Text>
            <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
          </View>}

      </View>
    </View>
  );
}

export default SubmittedScoreUI;

const styles = StyleSheet.create({

  mainComponentStyle: {
    flex: 1,
    backgroundColor: 'white'
  },

  item: {
    flexDirection: "row",
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: wp('80%'),
    marginBottom: hp('0.5%'),
    borderWidth: 1,
    borderColor: '#EAEAEA',
    height: hp('6%'),
    borderRadius: 5,
    flex: 1
  },

  textStyle: {
    fontSize: fonts.fontMedium,
    marginLeft: wp('3%'),
    // //marginRight: wp('3%'),
    ...CommonStyles.textStyleSemiBold
  },

  scoreItemBgTab: {
    marginLeft: wp('8%'),
    justifyContent: 'center',
    alignItems: 'center',
  },

  ratingImage2: {
    height: hp("5%"),
    width: wp("8%"),
    position: "absolute",
    marginLeft: wp("3.5%"),
    marginTop: hp("-1.2%"),
    alignContent: "flex-end",
  },

  editImageStyle: {
    aspectRatio: 1,
    height: hp('3%'),
  },

  scoreItemBg: {
    marginLeft: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },

  textStyleWhite: {
    color: "#FFFFFF",
    fontSize: fonts.fontSmall,
    ...CommonStyles.textStyleBold,
    marginLeft: wp('5.5%'),
    marginRight: wp('6%')
  },

  textStyleWhiteTab: {
    color: "#FFFFFF",
    fontSize: fonts.fontXMedium,
    ...CommonStyles.textStyleBold,
    marginLeft: wp('5.5%'),
    marginRight: wp('6%')
  },

});