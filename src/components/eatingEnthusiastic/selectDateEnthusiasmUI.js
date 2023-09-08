import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text} from 'react-native';
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import DatePicker from 'react-native-date-picker'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import AlertComponent from '../../utils/commonComponents/alertComponent';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant";

const SelectDateEnthusiasmUI = ({ route, ...props }) => {

  const [selectedDate, set_selectedDate] = useState(new Date());
  const [minimumDate, set_minimumDate] = useState(new Date())

  // Sets the min date to last 7 days for selection
  useEffect(() => {

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    set_minimumDate(new Date(lastWeek));
    if(props.eatingObj && props.eatingObj.eDate!==''){
      set_selectedDate(new Date(props.eatingObj.eDate));

    } else {
      set_selectedDate(new Date());
    }

  }, [props.eatingObj]);

  // Nxt btn Action
  const nextButtonAction = () => {
    props.submitAction(selectedDate);
  };

  // Navigates to previous screen
  const backBtnAction = () => {
    props.navigateToPrevious();
  };

  const popOkBtnAction = () => {
    props.popOkBtnAction()
  }

  return (
    <View style={[styles.mainComponentStyle]}>

      <View style={[CommonStyles.headerView]}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isChatEnable={false}
          isTImerEnable={false}
          isTitleHeaderEnable={true}
          title={'Eating Enthusiasm'}
          backBtnAction={() => backBtnAction()}
        />
      </View>

      <View style={{ width: wp('90%'), height: hp('70%'), alignSelf: 'center', }}>
        
        <View style={styles.datePickerMViewStyle}>

          <View style={{ marginTop: hp('5%'), marginBottom: hp('5%'), alignItems:'center' ,}}>
            <Text style={[styles.headerTextStyle]}>{'Select the date and time for scale selection'}</Text>
          </View>

          <View style={[styles.datePickerSubViewStyle,{marginTop: hp('3%')}]}>
            <DatePicker
              date={selectedDate}
              onDateChange={(date) => set_selectedDate(date)}
              mode={"datetime"}
              textColor={'black'}
              maximumDate={new Date()}
              minimumDate = {minimumDate}
              style={styles.datePickeStyle}
            />
          </View>

        </View>

      </View>

      <View style={CommonStyles.bottomViewComponentStyle}>
        <BottomComponent
          rightBtnTitle={'SUBMIT'}
          leftBtnTitle={'BACK'}
          isLeftBtnEnable={true}
          rigthBtnState={true}
          isRightBtnEnable={true}
          rightButtonAction={async () => nextButtonAction()}
          leftButtonAction={async () => backBtnAction()}
        />
      </View>

      {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
        <AlertComponent
          header={props.popupAlert}
          message={props.popupMsg}
          isLeftBtnEnable={false}
          isRightBtnEnable={true}
          leftBtnTilte={'NO'}
          rightBtnTilte={"OK"}
          popUpRightBtnAction={() => popOkBtnAction()}
        />
      </View> : null}
      {props.isLoading === true ? <LoaderComponent isLoader={false} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

    </View>
  );
}

export default SelectDateEnthusiasmUI;

const styles = StyleSheet.create({

  mainComponentStyle: {
    flex: 1,
    backgroundColor: 'white'
  },

  datePickerMViewStyle: {
    alignSelf: 'center',
    borderRadius: 5,
    justifyContent:'center',
    height: hp('50%'),
    backgroundColor : "white"
  },

  datePickerSubViewStyle: {
    width: wp('85%'),
    height: hp('30%'),
    alignSelf: 'center',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },

  datePickeStyle: {
    backgroundColor: 'white',
    width: wp('85%'),
    height: hp('25%'),
  },

  headerTextStyle: {
    ...CommonStyles.textStyleBold,
    fontSize: fonts.fontNormal,
    textAlign: "left",
    color: "black",
  },

});