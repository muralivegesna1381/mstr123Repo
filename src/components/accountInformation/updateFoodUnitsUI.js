import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TextInput,NativeModules,Platform,TouchableOpacity,Image,FlatList} from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import fonts from '../../utils/commonStyles/fonts'
import AlertComponent from '../../utils/commonComponents/alertComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant"

let hidePswdImg = require('../../../assets/images/otherImages/png/hide-password.png');
let showPsdImg = require('../../../assets/images/otherImages/png/show-password.png');
let failedImg = require('../../../assets/images/otherImages/svg/failedXIcon.svg');
let tickImg = require('../../../assets/images/otherImages/png/tick.png');
let downArrowImg = require('./../../../assets/images/otherImages/svg/downArrowGrey.svg');
let xImg = require('./../../../assets/images/otherImages/png/xImg.png');

const  UpdateFoodUnitsUI = ({route, ...props }) => {

    const [pswdValue, set_pswdValue] = useState(undefined);
    const [confirmPswdValue, set_confirmPswdValue] = useState(undefined);
    const [isHidePassword, set_isHidePassword] = useState(true);
    const [isConfirmHidePassword, set_isConfirmHidePassword] = useState(true);
    const [isPopUp, set_isPopUp] = useState(false);
    const [regNumVal, set_regNumVal] = useState(false);
    const [regULVal, set_regULVal] = useState(false);
    const [regSPCVal, set_regSPCVal] = useState(false);
    const [psdLengthVal, set_psdLengthVal] = useState(false);
    const [enableConfirmPsd, set_enableConfirmPsd] = useState(false);
    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);
    const [currentPsdEncrypt, set_currentPsdEncrypt] = useState(undefined);
    const [newPsdEncrypt, set_newPsdEncrypt] = useState(undefined);
    const [isMatchPsd, set_isMatchPsd] = useState(false);

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    

    useEffect(() => {

      set_isPopUp(props.isPopUp);
      set_isLoading(props.isLoading);
      set_popUpTitle(props.popUpTitle);
      set_popUpMessage(props.popUpMessage);

    }, [props.isPopUp, props.popUpMessage, props.popUpTitle, props.isLoading]);

    // Initiates the service call to update the new password
    const nextButtonAction = () => {
      props.submitAction(currentPsdEncrypt,newPsdEncrypt);
    };

    // back button action
    const backBtnAction = () => {
      props.navigateToPrevious();
    }

    // popup ok button action
    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const selectPrefTime = (value) => {
        props.selectPrefTime(value);
    };

    const actionOnDropDown = (item,value) => {
        props.actionOnDropDown(item,value);
    };

    const onCancel = () => {
        props.onCancel();
    };

    return (
        <View style={[styles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Preferences'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View>

                <KeyboardAwareScrollView bounces={true} showsVerticalScrollIndicator={false} enableOnAndroid={true} scrollEnabled={true} scrollToOverflowEnabled={true} enableAutomaticScroll={true}>

                    <View style={{width:wp('100%'),height:hp('70%'),alignItems:'center',marginTop:hp('15%')}}>
                        <View style={{width:wp('80%'),minHeight:hp('8%')}}>
                            <TouchableOpacity style={{flexDirection:'row',borderWidth: 0.5,borderColor: "#D8D8D8",borderRadius: hp("0.5%"),width: wp("80%"),marginTop: hp('2%')}} onPress={() => {selectPrefTime(1)}}>

                                <View style={[styles.SectionStyle1,{}]}>
                                    <View style={{flexDirection:'column',}}>
                                        <Text style={styles.dropTextLightStyle}>{'Food Recommendation Unit'}</Text>
                                        {<Text style={[styles.dropTextStyle]}>{props.unitsText ? props.unitsText : 'Grams'}</Text>}
                                    </View>                            
                                </View>

                                <View style={{justifyContent:'center'}}>
                                    <Image source={downArrowImg} style={styles.imageStyle} />
                                </View>
     
                            </TouchableOpacity>
                            
                        </View>

                        <View style={{width:wp('80%'),minHeight:hp('8%')}}>
                            <TouchableOpacity style={{flexDirection:'row',borderWidth: 0.5,borderColor: "#D8D8D8",borderRadius: hp("0.5%"),width: wp("80%"),marginTop: hp('2%')}} onPress={() => {selectPrefTime(2);}}>

                                <View style={[styles.SectionStyle1,{}]}>
                                    <View style={{flexDirection:'column',}}>
                                        <Text style={styles.dropTextLightStyle}>{'Food Recommendation Time'}</Text>
                                        {<Text style={[styles.dropTextStyle]}>{props.prefTimeText ? props.prefTimeText : '7:00'}</Text>}
                                    </View>                            
                                </View>

                                <View style={{justifyContent:'center'}}>
                                    <Image source={downArrowImg} style={styles.imageStyle} />
                                </View>
     
                            </TouchableOpacity>
                            
                        </View>

                        <View style={{width:wp('80%'),minHeight:hp('8%')}}>
                            <TouchableOpacity style={{flexDirection:'row',borderWidth: 0.5,borderColor: "#D8D8D8",borderRadius: hp("0.5%"),width: wp("80%"),marginTop: hp('2%')}} onPress={() => {selectPrefTime(3)}}>

                                <View style={[styles.SectionStyle1,{}]}>
                                    <View style={{flexDirection:'column',}}>
                                        <Text style={styles.dropTextLightStyle}>{'Pet Weight Unit'}</Text>
                                        {<Text style={[styles.dropTextStyle]}>{props.weightUnitsText ? props.weightUnitsText : 'Pounds'}</Text>}
                                    </View>                            
                                </View>

                                <View style={{justifyContent:'center'}}>
                                    <Image source={downArrowImg} style={styles.imageStyle} />
                                </View>
     
                            </TouchableOpacity>
                            
                        </View>

                    </View>

                </KeyboardAwareScrollView>
                
            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SUBMIT'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                />
            </View>   

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {props.popUpTitle}
                    message={props.popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'CANCEL'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {props.isPrefUnitsView || props.isUnitsView || props.isWeightView ? <View style={[styles.popSearchViewStyle,{height: props.isPrefUnitsView ? hp("40%") : hp("25%"),}]}>

                <TouchableOpacity onPress={onCancel} style={[styles.topButtonView,{flexDirection:'row'}]} >
                    {/* <Image source={xImg} style={styles.xImageStyle} /> */}
                    <View style = {{width: wp("75%"),alignItems:'center'}}><Text style={[styles.headerText]}>{props.isPrefUnitsView ? 'Select Time' : (props.isWeightView ? 'Select Weight Units' : 'Select Units')}</Text></View>
                    <Text style={[styles.name,{width: wp("15%"),marginBottom: hp("1.5%"),}]}>{'Cancel'}</Text>
                </TouchableOpacity>

                <FlatList
                    style={styles.flatcontainer}
                    data={props.isPrefUnitsView ? props.prefTimeArray : (props.isWeightView ? props.whtUnitsArray : props.unitsArray)}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                    <TouchableOpacity onPress={() => actionOnDropDown(item,props.isPrefUnitsView ? 2 : (props.isWeightView ? 3 : 1))}>
                        <View style={styles.flatview}>
                        <Text numberOfLines={2} style={[styles.name]}>{props.isPrefUnitsView ? item : item.unit}</Text>
                        </View>
                    </TouchableOpacity>)}
                    enableEmptySections={true}
                    keyExtractor={(item) => item.unit}
                />
            
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.DEFAULT_UPDATE_LOADER_MSG} isButtonEnable = {false} /> : null} 

         </View>
    );
  }
  
  export default UpdateFoodUnitsUI;

  const styles = StyleSheet.create({
    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'
            
    },

    SectionStyle1: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        minHeight: hp("8%"),
        width: wp("70%"),
        borderRadius: hp("0.5%"),
        alignSelf: "center",
    },

    dropTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        color:'black',
        width: wp("60%"),
        alignSelf:'flex-start',
        marginBottom: hp("1%"),
        marginTop: hp("1%"),
        textTransform : "capitalize"
      },
  
      dropTextLightStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontMedium,
        color:'grey',
        width: wp("60%"),
        alignSelf:'flex-start',
        marginTop: hp("1%"),     
      },

      imageStyle: {
        margin: "4%",
        height: 20,
        width: 20,
        resizeMode: "contain",
      },

      popSearchViewStyle : {
        height: hp("80%"),
        width: wp("100%"),
        backgroundColor:'#DCDCDC',
        bottom:0,
        position:'absolute',
        alignSelf:'center',
        borderTopRightRadius:15,
        borderTopLeftRadius:15,
        alignItems: "center",
      },
  
      flatcontainer: {
        flex: 1,
      },
  
      flatview: {
        height: hp("6%"),
        marginBottom: hp("0.3%"),
        alignContent: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width:wp('90%'),
        alignItems: "center",
      },
  
      name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
      },

      xImageStyle: {
        width: wp("8%"),
        height: wp("8%"),
        resizeMode: "contain",
      },

      topButtonView: {
        alignItems: "flex-end",
        justifyContent: 'center',
        height: hp("6%"),
        marginRight: hp("2%"),
        width: wp("90%"),
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
      },
  
    headerText: {
        color: '#4A4A4A',
        marginLeft:hp('7%'),
        // paddingLeft:wp('5%'),
        fontSize:fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        marginBottom: hp("1.5%"),

    },

    textInputContainerStyle: {
        flexDirection: 'row',
        width: wp('80%'),
        height: hp('7%'),
        borderRadius: hp('0.5%'),
        borderWidth: 1,
        marginTop: hp('2%'),
        borderColor: '#dedede',
        backgroundColor:'white',
        marginRight: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
    },

      hideOpenIconStyle : {
        width: wp('6%'),
        height: hp('6%'),
        resizeMode: 'contain',
        marginRight:wp('5%'),
        tintColor:'black'
    },

    validateIconStyle : {
        width: wp('3%'),
        height: hp('3%'),
        resizeMode: 'contain',
        marginLeft:hp('1%'),
        marginRight:wp('1%'),
    },

    validateTextStyle : {
        fontSize: fonts.fontXSmall,
        fontWeight:'normal',
        color: '#898989', 
        ...CommonStyles.textStyleRegular
        
      },

  });