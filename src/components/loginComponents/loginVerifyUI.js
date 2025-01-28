import React, { useState, useEffect } from 'react';
import {View,StyleSheet,TouchableOpacity,Text} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import CommonStyles from '../../utils/commonStyles/commonStyles';
import Fonts from '../../utils/commonStyles/fonts';
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

import FaceImg from "./../../../assets/images/otherImages/svg/faceIDIcon.svg";
import DogCat from "./../../../assets/images/otherImages/svg/dog&Cat.svg";
import TouchImg from "./../../../assets/images/otherImages/svg/touchIDIcon.svg";

const  LoginVerifyUI = ({isAuthEnabled,authenticationType,route, ...props }) => {

    // Setting the values from login COmponent to local variables
    const [userName, set_userName] = useState(undefined);

    useEffect(() => {
        getUserDetails();
    }, [isAuthEnabled]);

    const getUserDetails = async () => {
        let user = await DataStorageLocal.getDataFromAsync(Constant.USER_NAME);
        user = JSON.parse(user);
        user && set_userName(user.firstName)
    };

    const autoLoginAction = async () => {
      let userId = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_login, "User clicked autologin Btn", 'userEmail : ' + (userId ? userId : ''));
      props.autoLoginAction();
    };

    const anotherLoginAction = () => {
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_login, "User clicked on different user Btn", '');
      props.anotherLoginAction();     
    };

    const validateAuthentication = () => {
        props.validateAuthentication()
    }

  return (

    <View style={[styles.mainComponentStyle]}>

        <View style={{height:hp('80%'),width:wp('80%')}}>

            <View style = {{flexDirection:'row',marginTop:hp('7%')}}>
                <Text style = {styles.headerTextStyle}>{'Welcome'}</Text>
                <Text style = {styles.userNameTextStyle}>{', '+userName}</Text>
            </View>

            <View style = {{flexDirection:'row',marginTop:hp('3%')}}>
                <Text style = {styles.textStyle}>{'Your furry friend is thrilled to have you back!'}</Text>
            </View>

            <View style = {{flexDirection:'row',marginTop:hp('2.5%')}}>
                <Text style = {styles.textStyle}>{'Share more about your pet with us and explore a world of tail-wagging tips and purr-fect advice.'}</Text>
            </View>

            <View style = {{flexDirection:'row',marginTop:hp('2.5%')}}>
                <Text style = {styles.textStyle}>{"Together, let’s create another unforgettable adventure today!"}</Text>
            </View>

            {isAuthEnabled ? <View>
                <TouchableOpacity style={[styles.authBtnStyle,{marginTop:hp('5%')}]} onPress={() => {validateAuthentication()}}>
                  <View style = {{flexDirection : 'row',justifyContent:'center'}}>
                    {authenticationType && authenticationType === 'Face ID' ? <View><FaceImg style={CommonStyles.authIconStyle} /></View> : <View><TouchImg style={CommonStyles.authIconStyle}/></View>}                    
                    <Text style={[styles.authTextStyle,{alignSelf:'center',color:'white',marginLeft:hp('1%')}]}>{authenticationType ? "Login with " + authenticationType : ''}</Text>
                  </View>
                </TouchableOpacity>
              </View> : <TouchableOpacity style={[styles.buttonstyle,{marginTop:hp('5%')}]} onPress={() => {autoLoginAction()}}>
                {<Text style={[styles.btnTextStyle]}>{'Tap Here to Login'}</Text>}
            </TouchableOpacity>}

            <View style={{justifyContent:'center',height:hp('5%'),marginTop:hp('0.5%')}}>
                <TouchableOpacity style={{height:hp('5%'),justifyContent:'center'}}  onPress={() => {anotherLoginAction()}}>
                <Text style={[styles.anotherUserTextStyle]}>{"Login as a Different user"}</Text>
                </TouchableOpacity>  
            </View>
            <View style={{height : hp("32%"),alignSelf:'center',justifyContent:'center'}}>
                <DogCat height = {hp("18%")} width = {wp("60%")}/>
            </View>
        </View>
        
    </View>
  );
}
  
  export default LoginVerifyUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
      flex:1,
      backgroundColor:'white',
    },

    headerTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: Fonts.fontLarge,
        color:'black'
    },
  
    userNameTextStyle : {
        ...CommonStyles.textStyleMedium,
        fontSize: Fonts.fontLarge,
        color:'black',
        flex:1
    },

    textStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: Fonts.fontXMedium,
        color:'black'
    },

    anotherUserTextStyle : {
        ...CommonStyles.textStyleSemiBold,
        fontSize: Fonts.fontXSmall,
        color:'#6BC100'
    },

    buttonstyle: {
        backgroundColor: "#6BC105",
        height: hp("6%"),
        width: wp("80%"),
        borderRadius: hp("0.5%"),
        justifyContent: "center",
        alignItems:'center',
    },

    btnTextStyle: {
        color: 'white',
        fontSize: Fonts.fontXMedium,
        ...CommonStyles.textStyleSemiBold,
    },

    authTextStyle : {
        ...CommonStyles.textStyleMedium,
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