import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import fonts from './../../../utils/commonStyles/fonts'
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import AlertComponent from './../../../utils/commonComponents/alertComponent';

import SupportCatImg from "./../../../../assets/images/otherImages/svg/supportCat.svg";

const SupportUI = ({ route, ...props }) => {

  const [arraySupport, set_arraySupport] = useState(undefined);

  useEffect(() => {
    set_arraySupport(props.arraySupport);
  }, [props.arraySupport, props.isPopup, props.popUpMessage, props.popUpTitle]);

  const backBtnAction = () => {
    props.navigateToPrevious();
  };

  const selectSupportAction = (item) => {
    props.selectSupportAction(item);
  };

  const popCancelBtnAction = () => {
    props.popCancelBtnAction();
  };

  const popOkBtnAction = () => {
    props.popOkBtnAction();
  };

  const _renderSupportItems = () => {
    if (arraySupport) {
      return arraySupport.map((item, index) => {
        return (
          <>
            <View style={styles.renderStyle}>

              <View style={[styles.renderBckView]}>

                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => selectSupportAction(item)}>

                  <View style={{ minHeight: hp('10%'), flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <item.img style={[styles.imgStyle]} />
                  </View>

                  <View style={{ minHeight: hp('10%'), flex: 4, justifyContent: 'center' }}>
                    <Text style={[styles.headerText]}>{item.header}</Text>
                    {item && item.header === 'Phone' ? <Text style={[styles.subHeaderText]}>{'Mon - Fri 7 AM - 4 PM CST'}</Text> : null}
                    {item && item.id === 8 ? <Text style={[styles.subHeaderText, { marginRight: wp('2%') }]}>{item.subheader}</Text> : null}
                  </View>

                </TouchableOpacity>

              </View>

            </View>
          </>
        )
      });
    }
  };

  return (
    <View style={[CommonStyles.mainComponentStyle]}>

      <View style={[CommonStyles.headerView, {}]}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isChatEnable={false}
          isTImerEnable={false}
          isTitleHeaderEnable={true}
          title={'Support'}
          backBtnAction={() => backBtnAction()}
        />
      </View>

      <View style={{ alignItems: 'center', height: hp('90%') }}>
        <View style={{zIndex:99,width: wp('90%'),alignItems:'center'}}>
          <SupportCatImg width= {wp('100%')} height= {Platform.isPad ? hp('30%') : hp('22%')}/>
        </View>
        
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <View style={{  marginTop: hp('2%'),marginBottom: hp('5%') }}>
            {_renderSupportItems()}
          </View>
        </KeyboardAwareScrollView>
      </View>

      {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
        <AlertComponent
          header={props.popUpTitle}
          message={props.popUpMessage}
          isRightBtnEnable={true}
          rightBtnTilte={'OK'}
          leftBtnTilte={'NO'}
          isLeftBtnEnable={false}
          popUpRightBtnAction={() => popOkBtnAction()}
          popUpLeftBtnAction={() => popCancelBtnAction()}
        />
      </View> : null}

    </View>
  );
}

export default SupportUI;

const styles = StyleSheet.create({

  renderStyle: {
    width: wp('85%'),
    alignSelf: 'center'
  },

  renderBckView: {
    width: wp('85%'),
    minHeight: hp('10%'),
    backgroundColor: '#f5f7f9',
    borderRadius: 15,
    marginBottom: wp('3%'),
    justifyContent: 'center',
  },

  imgStyle: {
    width: wp('10%'),
    aspectRatio: 1,
    resizeMode: 'contain',
    marginLeft: hp('3%'),
    marginRight: wp('5%'),
  },

  headerText: {
    ...CommonStyles.textStyleBold,
    fontSize: fonts.fontLarge,
    color: 'black',
  },

  subHeaderText: {
    ...CommonStyles.textStyleSemiBold,
    fontSize: fonts.fontMedium,
    color: 'grey',
    marginBottom: hp('1.5%')
  },

  tickImgStyle: {
    width: wp('8%'),
    height: wp('8%'),
    resizeMode: 'contain',

  },

});