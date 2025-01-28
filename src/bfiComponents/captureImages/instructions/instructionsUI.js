import React, { useEffect, useState } from 'react';
import { BackHandler, FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import fonts from '../../../utils/commonStyles/fonts';
import * as Constant from "../../../utils/constants/constant";
import ImageView from "react-native-image-viewing";
import perf from '@react-native-firebase/perf';

import NoLogsDogImg from "./../../../../assets/images/dogImages/noRecordsDog.svg";

const InstructionsUI = ({ route, ...props }) => {
  const [isRecords, set_isRecords] = useState(true);
  const [dataArray, set_dataArray] = useState(undefined);
  const [imgLoader, set_imgLoader] = useState(true);
  const [isImageView, set_isImageView] = useState(false);
  const [images, set_images] = useState([]);
  const [currentImageViewPos, set_CurrentImageViewPos] = useState(0);
  let urlArr = []
  let trace_instructions_Screen;
  
  //Android Physical back button action
  useEffect(() => {
    initialSessionStart();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      initialSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  // Setting the instructions data to the UI
  useEffect(() => {
    if (props.instructions) {
      set_dataArray(props.instructions);
      if (props.instructions.length > 0) {
        set_isRecords(true);
      } else {
        set_isRecords(false);
      }
    }
  }, [props.instructions]);

  const initialSessionStart = async () => {
    trace_instructions_Screen = await perf().startTrace('t_inBFIInstructionsScreen');
  };

  const initialSessionStop = async () => {
    await trace_instructions_Screen.stop();
  };


  //Preview screen to show the instructions images
  const viewImage = (position) => {
    for (let i = 0; i < dataArray.length; i++) {
      let tempObj = {
        uri: dataArray[i].photoUrl,
      }
      urlArr.push(tempObj)
    }
    //tempArr.current = urlArr;
    set_CurrentImageViewPos(position)

    set_images(urlArr);
    set_isImageView(true);
  }

  const backBtnAction = () => {
    props.navigateToPrevious();
  };

  const handleBackButtonClick = () => {
    backBtnAction();
    return true;
  };

  const renderItem = ({ item, index }) => {
    return (
      <View>
        <TouchableOpacity onPress={()=>{
                  viewImage(index)
        }}>
          <View style={styles.item}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{
                width: wp('10%'), aspectRatio: 1, alignItems: 'center', justifyContent: "flex-start", flex: 0.5
              }} >
                <ImageBackground style={[styles.ratingImage1]} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => set_imgLoader(false)} source={{ uri: item.photoUrl }}>
                  {imgLoader === true && item && item.photoUrl ? (<View style={[CommonStyles.spinnerStyle]}><ActivityIndicator size="large" color="#37B57C" /></View>) : null}
                </ImageBackground>

              </View>

              <View style={{ flex: 2.5 }}>
                <Text style={styles.textStyle}>{item.instruction}</Text></View>
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
          title={'Instructions'}
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
            <NoLogsDogImg style={[CommonStyles.nologsDogStyle]}/>
            <Text style={[CommonStyles.noRecordsTextStyle, { marginTop: hp("2%") }]}>{Constant.NO_RECORDS_LOGS}</Text>
            <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
          </View>}

          {isImageView ? <ImageView style={styles.videoViewStyle}
        images={images}
        imageIndex={currentImageViewPos}
        visible={isImageView}
        animationType="slide"
        onRequestClose={() => set_isImageView(false)}
      /> : null}

      </View>
    </View>
  );
}

export default InstructionsUI;

const styles = StyleSheet.create({

  mainComponentStyle: {
    flex: 1,
    backgroundColor: 'white'
  },
  item: {
    flexDirection: "row",
    alignItems: 'flex-start',
    width: wp('85%'),
    marginBottom: hp('2.5%'),

  },
  ratingImage1: {
    resizeMode: 'contain',
    marginLeft: hp('2%'),
    marginRight: hp('1%'),
    aspectRatio: 1,
    height: hp('7%'),
    marginTop: hp("0.5%")
  },

  textStyle: {
    color: '#000',
    fontSize: fonts.fontXSmall,
    fontFamily: 'Barlow-Regular',
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
    flex: 1,
  },

});