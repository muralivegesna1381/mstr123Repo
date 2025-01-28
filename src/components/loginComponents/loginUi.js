import React, { useState, useEffect } from 'react';
import {View,StyleSheet,TouchableOpacity,Text,TextInput,Image,Platform} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import Fonts from '../../utils/commonStyles/fonts';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import AlertComponent from '../../utils/commonComponents/alertComponent';
import TextInputComponent from '../../utils/commonComponents/textInputComponent';
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "../../utils/constants/constant";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import * as Queries from "./../../config/apollo/queries";
import { useQuery } from "@apollo/react-hooks";
import LoginVerifyUI from "./loginVerifyUI";

import FaceImg from "./../../../assets/images/otherImages/svg/faceIDIcon.svg";
import TouchImg from "./../../../assets/images/otherImages/svg/touchIDIcon.svg";
import HideImg from "./../../../assets/images/otherImages/png/hide-password.png";
import OpenImg from "./../../../assets/images/otherImages/png/show-password.png";

const  LoginUI = ({route, ...props }) => {

  // const { loading:logOutLoading, data:logOutdata } = useQuery(Queries.LOG_OUT_APP, { fetchPolicy: "cache-only" });

    // const [userEmail, set_userEmail] = useState(undefined);
    // const [userPswd, set_userPswd] = useState(undefined);
    // const [isHidePassword, set_isHidePassword] = useState(true);
    // const [isEmailValid, set_isEmailValid] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const navigation = useNavigation();
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isUserLoggedIn, set_isUserLoggedIn] = useState(null);
    const [backBtnEnable, set_backBtnEnable] = useState(undefined);
    
    // Setting the values from login COmponent to local variables

    useEffect(() => {

      // if(props.forgotPsd) {
      //   set_userPswd(null)
      // }
      set_isUserLoggedIn(props.isUserLoggedIn);
      set_backBtnEnable(props.backBtnEnable)

    }, [props.forgotPsd,props.isUserLoggedIn,props.backBtnEnable]);

    useEffect(() => {

      set_isLoading(props.isLoading);
      set_popUpAlert(props.popUpAlert);
      set_popUpMessage(props.popUpMessage);
      set_isPopUp(props.isPopUp);

    }, [props.isLoading,props.isPopUp,props.popUpMessage,props.popUpAlert,props.popUpRgtBtnTitle,props.popUpisRgtBtn,props.popUpisLftBtn]);

    React.useEffect(() => {
      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        getUserEmail();
      });

      return () => {
        focus();
      };
    }, [navigation]);

    // getting user email details
    const getUserEmail = async () => {
      props.getUserEmail();
    };

    const rightButtonAction = async () => {
      props.loginAction(props.userEmail,props.userPswd);
    };

    const leftButtonAction = async () => {
      props.leftButtonAction();
    };

    const backBtnAction = () => {
      props.backBtnAction();
    }

    const forgotPswdAction = () => {
      props.forgotPswdAction(props.userEmail);     
    }

    const registerAction = () => {
      props.registerAction();
    }

    // Email format validation
    const validateEmail = (email) => {
      props.validateEmail(email);
    }; 
    
    // Password validation
    const validatePassword = (value) => {
      props.validatePassword(value);
    };

  const popOkBtnAction = () => {
    props.popOkBtnAction(false);
  };

  const popCancelBtnAction = () => {
    props.popCancelBtnAction();
  }

  const validateAuthentication = () => {
    props.validateAuthentication();
  };

  const anotherLoginAction = () => {
    props.anotherLoginAction();
  };

  const autoLoginAction = () => {
    props.autoLoginAction();
  };

  const hidePsdAction = () => {
    props.hidePsdAction();
  };

  return (
    <View style={[styles.mainComponentStyle]}>

      <View style={CommonStyles.headerView}>
        <HeaderComponent
          isBackBtnEnable={backBtnEnable}
          isSettingsEnable={false}
          isChatEnable={false}
          isTImerEnable={false}
          isTitleHeaderEnable={true}
          title={isUserLoggedIn ? '' : 'Login'}
          headerColor = {'white'}
          moduleName = {isUserLoggedIn ? 'hide' : ''}
          backBtnAction = {() => backBtnAction()}
        />
      </View>

      <View style={{alignItems:'center',justifyContent:'center',height: isUserLoggedIn ? hp('85%') : hp('70%')}}>

        {isUserLoggedIn ? <LoginVerifyUI 
          authenticationType = {props.authenticationType}
          isAuthEnabled = {props.isAuthEnabled}
          autoLoginAction = {autoLoginAction}
          anotherLoginAction = {anotherLoginAction}
          validateAuthentication = {validateAuthentication}
        /> : <KeyboardAwareScrollView bounces={false} showsVerticalScrollIndicator={false} enableOnAndroid={true} scrollEnabled={true} scrollToOverflowEnabled={true} enableAutomaticScroll={true}>
                    
          <View style={{width:wp('80%'),height:hp('70%'),marginTop:hp('4%')}}>
            <Text style={[CommonStyles.headerTextStyle]}>{'Login to your'}</Text>
            <Text style={[CommonStyles.headerTextStyle]}>{'Wearables'} <Text style={[CommonStyles.headerTextStyle1]}>{'Account'}</Text> </Text>

            <View style={{justifyContent:'center',marginTop:hp('4%')}}>
              {/* {props.isAuthEnabled ? <View>
                <TouchableOpacity style={[styles.authBtnStyle]} onPress={() => {validateAuthentication()}}>
                  <View style = {{flexDirection : 'row',justifyContent:'center'}}>
                    {props.authenticationType && props.authenticationType === 'Face ID' ? <View><FaceImg style={CommonStyles.authIconStyle} /></View> : <View><TouchImg style={CommonStyles.authIconStyle}/></View>}                    
                    <Text style={[styles.authTextStyle,{alignSelf:'center',color:'white',marginLeft:hp('1%')}]}>{props.authenticationType ? props.authenticationType : ''}</Text>
                  </View>
                </TouchableOpacity>
                <Text style={[CommonStyles.headerTextStyle,{alignSelf:'center',justifyContent:'center',color:'#6BC100'}]}>{'or'}</Text>
              </View> : null} */}

              <View style={{alignItems:'center',justifyContent:'center',marginTop:hp('1%')}} >

                <TextInputComponent 
                  inputText = {props.userEmail} 
                  labelText = {'Email'} 
                  isEditable = {true}
                  maxLengthVal = {50}
                  autoCapitalize = {"none"}
                  setValue={(textAnswer) => {validateEmail(textAnswer)}}
                />

              </View>

              <View style={[CommonStyles.textInputContainerStyle,{alignSelf: 'center', marginTop: hp('2%'),}]} >

                <TextInput style={CommonStyles.textInputStyle}
                  underlineColorAndroid="transparent"
                  placeholder="Password"
                  placeholderTextColor="#7F7F81"
                  autoCapitalize="none"
                  secureTextEntry={props.isHidePassword}
                  value = {props.userPswd}
                  onChangeText={(userPswd) => {validatePassword(userPswd)}}
                />

                <TouchableOpacity  onPress={() => {hidePsdAction()}}>
                  <Image source={props.isHidePassword ? HideImg : OpenImg } style={[CommonStyles.hideOpenIconStyle,{width: Platform.isPad ? wp('4%') : wp('6%'),}]}/>
                </TouchableOpacity>

              </View> 

              <TouchableOpacity style={{height:hp('5%'),width:wp('40%'),marginTop:hp('1%'),justifyContent:'center'}} onPress={() => {forgotPswdAction()}}>
                <Text style={styles.forgotPaswdTextStyle}>Forgot Password?</Text>
              </TouchableOpacity> 
            </View>    

          </View>

        </KeyboardAwareScrollView>}
                  
          <View style={{alignItems:'center',justifyContent:'center',height:hp('5%')}}>
            <TouchableOpacity style={{height:hp('5%'),justifyContent:'center'}}  onPress={() => {registerAction()}}>
              <Text style={[styles.forgotPaswdTextStyle,{color:'black'}]}>Don't have an account?
              <Text style={styles.registerTextStyle}> {"Register"}</Text></Text>
            </TouchableOpacity>  
          </View>
                
      </View> 

      {isUserLoggedIn ? null : <View style={CommonStyles.bottomViewComponentStyle}>
        <BottomComponent
          rightBtnTitle = {'LOGIN'}
          leftBtnTitle  = {'RESET'}
          rigthBtnState = {props.isEmailValid ? true : false}
          isLeftBtnEnable = {false}
          isRightBtnEnable = {true}
          rightButtonAction = {async () => rightButtonAction()}
          leftButtonAction = {async () => leftButtonAction()}
        ></BottomComponent>
      </View>} 

      {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
        <AlertComponent
          header = {popUpAlert}
          message={popUpMessage}
          isLeftBtnEnable = {props.popUpisLftBtn}
          isRightBtnEnable = {props.popUpisRgtBtn}
          leftBtnTilte = {'NO'}
          rightBtnTilte = {props.popUpRgtBtnTitle}
          popUpRightBtnAction = {() => popOkBtnAction()}
          popUpLeftBtnAction={() => popCancelBtnAction()}
        />
      </View> : null}
      {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {props.loaderMsg} isButtonEnable = {false} /> : null} 
    </View>
  );
}
  
  export default LoginUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
      flex:1,
      backgroundColor:'white',
    },

    forgotPaswdTextStyle : {
      ...CommonStyles.textStyleRegular,
      fontSize: Fonts.fontMedium,
      color:'#6BC100'
    },

    authTextStyle : {
      ...CommonStyles.textStyleMedium,
      fontSize: Fonts.fontNormal,
      color:'#6BC100'
    },

    registerTextStyle : {
      ...CommonStyles.textStyleBold,
      fontSize: Fonts.fontMedium,
      color:'#6BC100'
    },

    authBtnStyle : {
      backgroundColor:'#6BC105',
      height:hp('6%'),
      width: wp("80%"),
      marginTop: wp("2%"),
      alignItems:'center',
      justifyContent : 'center',
      borderRadius:5
    },
    
  });