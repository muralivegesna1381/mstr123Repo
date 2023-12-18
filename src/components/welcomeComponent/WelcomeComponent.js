import React, {useState,useEffect} from 'react';
import {StyleSheet, View,Image,BackHandler} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent1 from "../../utils/commonComponents/bottomComponent1";
import fonts from '../../utils/commonStyles/fonts'
import AlertComponent from '../../utils/commonComponents/alertComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import RNExitApp from 'react-native-exit-app';

const WelcomeComponent = ({navigation, route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [date, set_Date] = useState(new Date());
    const [isLoading, set_isLoading] = useState(false);

    useEffect(() => {

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        logOutCheck();
      });
      
      return () => {
        focus();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };
    
    }, []);

    const handleBackButtonClick = () => {
      RNExitApp.exitApp();
      return true;
    }

    const logOutCheck = async () => {

      let logOut = await DataStorageLocal.getDataFromAsync(Constant.IS_MULTIPLE_LOGIN);
      if(logOut && logOut === 'multipleLogin') {
        set_isPopUp(true);
        await DataStorageLocal.removeDataFromAsync(Constant.IS_MULTIPLE_LOGIN);
      } else {
        set_isPopUp(false);
      }
    };

    const topButtonAction = async () => {

      let userEmail = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN);
      let userPsd = await DataStorageLocal.getDataFromAsync(Constant.USER_PSD_LOGIN);
      const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
      rnBiometrics.biometricKeysExist().then((resultObject) => {
        const { keysExist } = resultObject;
          if (keysExist && userEmail && userPsd && userPsd !== 'undefined') {
            navigation.navigate('LoginComponent',{"isAuthEnabled" : true});
          } else {
             navigation.navigate('LoginComponent',{"isAuthEnabled" : false});
          }
      })  
    };

    const bottomButtonAction = () => {
      navigation.navigate('PetParentProfileComponent',{isFrom:'welcomeScreen'});
    }

    const popOkBtnAction = () => {
        set_isPopUp(false);
    }

  return (

    <View style={CommonStyles.mainComponentStyle}>

      <View style={styles.mainViewStyle}>
        <View>
          <Image source={require("./../../../assets/images/otherImages/svg/appHeader.svg")} style={styles.headerearables}/>
        </View>
      </View>
            
      <View style={[styles.bottomViewComponentStyle,]}>
        <BottomComponent1
          topBtnTitle = {'LOGIN'}
          bottomBtnTitle  = {'NEW USER ?'}
          bottomBtnEnable = {true}
          topButtonAction = {async () => topButtonAction()}
          bottomButtonAction = {async () => bottomButtonAction()}
          >
        </BottomComponent1>
      </View>

      {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
        <AlertComponent
          header = {'Sorry!'}
          message={Constant.AUTO_LOGOUT_MSG}
          isLeftBtnEnable = {false}
          isRightBtnEnable = {true}
          leftBtnTilte = {'Cancel'}
          rightBtnTilte = {'OK'}
          popUpRightBtnAction = {() => popOkBtnAction()}
        />
      </View> : null}

      {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOGIN_LOADER_MSG} isButtonEnable = {false} /> : null} 

    </View>
  );
};

export default WelcomeComponent;

const styles = StyleSheet.create({

    mainViewStyle :{
      flex:1,
      alignItems:'center',
      justifyContent:'center',
      flexDirection:'row',
    },

    bottomViewComponentStyle : {       
      height:hp('25%'),
      width:wp('100%'),
      backgroundColor:'green',
      position:"absolute",
      bottom:0,
    },

    headerStyle : {
      color: 'black',
      fontSize: fonts.fontXXXXLarge,
      ...CommonStyles.textStyleBlack,       
    },

    subHeaderStyle : {
      color: 'grey',
      fontSize: fonts.fontSmall,
      ...CommonStyles.textStyleRegular,       
    },

    headerearables : {
      marginBottom: wp("25%"),
      width:wp('70%'),
      height:wp('20%'),
      resizeMode:'contain'
    },

});