import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import Fonts from '../../utils/commonStyles/fonts'
import AlertComponent from '../../utils/commonComponents/alertComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "../../utils/constants/constant";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import fonts from './../../utils/commonStyles/fonts'

let authImg = require("./../../../assets/images/otherImages/svg/app-or.svg");
let tickImg = require("./../../../assets/images/otherImages/png/checked.png");

const AccountInfoUi = ({ route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [email, set_email] = useState(undefined);
    const [fullName, set_fullName] = useState(undefined);
    const [phoneNo, set_phoneNo] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [secondaryEmail, set_secondaryEmail] = useState(undefined);

    //Updating user details in UI
    useEffect(() => {
        set_phoneNo(props.phoneNo);
        set_email(props.email);
        set_secondaryEmail(props.secondaryEmail);
        set_fullName(props.fullName);
        set_isPopUp(props.isPopUp);
        set_isLoading(props.isLoading);
    }, [props.email, props.fullName, props.phoneNo, props.isPopUp, props.isLoading, props.secondaryEmail]);

    useEffect(() => {
    }, [props.versionNumber, props.buildVersion, props.enviName]);

    // Backbutton Action
    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    // Logs out of the app
    const rightButtonAction = async () => {
        props.logOutAction();
    };

    // Popup ok button action
    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    // based on the field, it navigates to edit the information of the pet parent
    const btnAction = (value) => {
        props.btnAction(value);
    };

    // Popup cancel button action
    const popCancelBtnAction = (value) => {
        props.popCancelBtnAction();
    };

    const selectAuthentication = () => {
        props.selectAuthentication();
    };

    return (
        
        <View style={[styles.mainComponentStyle]}>
            <View style={[CommonStyles.headerView, {}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Account'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

                <View style={{ alignItems: 'center', width: wp('100%'), height: hp('72%')}}>
                
                    {props.bio_Enable ? <View style={[styles.renderBckView]}>

                      <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={() => selectAuthentication()}>

                        <View style={{minHeight: hp('10%'),flex:1, alignItems:'center',justifyContent:'center'}}>
                          <Image source={authImg} style={[styles.imgStyle]}/>
                        </View>

                        <View style={{minHeight: hp('10%'),flex:4,justifyContent:'center' }}>
                          <Text style={[styles.headerText]}>{props.authenticationType}</Text>
                          {<Text style={[styles.subHeaderText]}>{'Enable/Disable '+props.authenticationType+' to access Wearables Mobile App'}</Text>}  
                        </View>

                        {props.enabled ? <View style={{minHeight: hp('10%'),flex:1,alignItems:'center',justifyContent:'center'}}>
                          <Image source={tickImg} style={[styles.tickImgStyle]}/>
                        </View> : null}

                      </TouchableOpacity>
                      
                    </View> : null}

                    <View style={{ marginTop: hp('2%'),height: props.bio_Enable ? hp('55%') : hp('75%')}}>
                    <KeyboardAwareScrollView>
                        <TouchableOpacity onPress={() => btnAction("Name")}>

                            <View style={{ flexDirection: 'row' }}>
                                <View style={styles.backViewStyle}>
                                    <Text style={styles.headerTextStyle}>{'Name'}</Text>
                                    <Text style={fullName ? [styles.subHeaderTextStyle] : [styles.subHeaderTextStyle, { color: 'grey' }]}>{fullName ? fullName : '------'}</Text>
                                </View>
                                <View style={{ justifyContent: 'center' }}>
                                    <Image source={require("./../../../assets/images/otherImages/svg/editImg.svg")} style={{ width: wp('5%'), height: hp('5%'), resizeMode: 'contain' }} />
                                </View>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => btnAction("Email")}>

                            <View style={styles.backViewStyle}>
                                <Text style={styles.headerTextStyle}>{'Email'}</Text>
                                <Text style={email ? [styles.subHeaderTextStyle] : [styles.subHeaderTextStyle, { color: 'grey' }]}>{email ? email : '------'}</Text>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => btnAction("SecondaryEmail")}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={styles.backViewStyle}>
                                    <Text style={styles.headerTextStyle}>{'Secondary Email'}</Text>
                                    <Text style={secondaryEmail ? [styles.subHeaderTextStyle] : [styles.subHeaderTextStyle, { color: 'grey' }]}>{secondaryEmail ? secondaryEmail : '------'}</Text>

                                </View>
                                <View style={{ justifyContent: 'center' }}>
                                    <Image source={require("./../../../assets/images/otherImages/svg/editImg.svg")} style={{ width: wp('5%'), height: hp('5%'), resizeMode: 'contain' }} />
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => btnAction("Phone Number")}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={styles.backViewStyle}>
                                    <Text style={styles.headerTextStyle}>{'Mobile'}</Text>
                                    <Text style={phoneNo ? [styles.subHeaderTextStyle] : [styles.subHeaderTextStyle, { color: 'grey' }]}>{phoneNo ? phoneNo : '------'}</Text>
                                </View>
                                <View style={{ justifyContent: 'center' }}>
                                    <Image source={require("./../../../assets/images/otherImages/svg/editImg.svg")} style={{ width: wp('5%'), height: hp('5%'), resizeMode: 'contain' }} />
                                </View>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => btnAction("Password")}>

                            <View style={{ flexDirection: 'row' }}>
                                <View style={styles.backViewStyle}>
                                    <Text style={styles.headerTextStyle}>{'Password'}</Text>
                                    <Text style={styles.subHeaderTextStyle}>{'------'}</Text>
                                </View>
                                <View style={{ justifyContent: 'center' }}>
                                    <Image source={require("./../../../assets/images/otherImages/svg/editImg.svg")} style={{ width: wp('5%'), height: hp('5%'), resizeMode: 'contain' }} />
                                </View>
                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => btnAction("PetParentAddress")}>

                            <View style={{ flexDirection: 'row' }}>
                                <View style={[styles.backViewStyle,{minHeight: hp('8%')}]}>
                                    <Text style={styles.headerTextStyle}>{'Address'}</Text>
                                    <Text style={styles.subHeaderTextStyle}>{props.pAddress ? props.pAddress : '------'}</Text>
                                </View>
                                <View style={{ justifyContent: 'center' }}>
                                    <Image source={require("./../../../assets/images/otherImages/svg/editImg.svg")} style={{ width: wp('5%'), height: hp('5%'), resizeMode: 'contain' }} />
                                </View>
                            </View>

                        </TouchableOpacity>

                        <View style={{alignItems:'center',marginTop: hp('4%'),}}>
                        <Text style={styles.subHeaderTextStyle}>{props.versionNumber}</Text>
                        <Text style={styles.subHeaderTextStyle}>{props.buildVersion}<Text style={styles.subHeaderTextStyle}>{props.enviName === 'tst' ? " (Testing)" : ""}</Text></Text>
                    </View>
                        </KeyboardAwareScrollView>
                    </View>

                </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'LOG OUT'}
                    leftBtnTitle={''}
                    rigthBtnState={true}
                    isLeftBtnEnable={false}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => rightButtonAction()}

                ></BottomComponent>
            </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={props.popAlert}
                    message={props.popUpMessage}
                    isLeftBtnEnable={props.isPopUpLeft ? true : false}
                    isRightBtnEnable={true}
                    leftBtnTilte={props.isPopUpLeftTitle}
                    rightBtnTilte={props.popBtnName}
                    popUpRightBtnAction={() => popOkBtnAction()}
                    popUpLeftBtnAction={() => popCancelBtnAction()}
                />
            </View> : null}
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}
        </View>
    );
}

export default AccountInfoUi;

const styles = StyleSheet.create({
    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white'
    },

    backViewStyle: {
        minHeight: hp('8%'),
        width: wp('80%'),
        marginBottom: wp('3%'),
        justifyContent: 'center',
    },

    headerTextStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: Fonts.fontXSmall,
        color: '#7F7F81',
    },

    subHeaderTextStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: Fonts.fontMedium,
        color: 'black',
        marginTop: wp('2%'), 
    },

    renderBckView : {
        width:wp('85%'),
        minHeight: hp('10%'),
        backgroundColor:'#f5f7f9',
        borderRadius: 15,
        marginBottom:wp('3%'),
        justifyContent:'center',   
        marginTop: hp('2%')  
    },

    imgStyle : {
        width: wp('10%'),
        aspectRatio:1,
        resizeMode: 'contain',
        marginLeft:hp('3%'),
        marginRight:wp('5%'),
    },

    headerText : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontLarge,
        color:'black',
      },
  
      subHeaderText : {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        color:'grey',
        marginBottom:hp('1.5%')
      },
  
      tickImgStyle : {
        width: wp('8%'),
        height: wp('8%'),
        resizeMode: 'contain',
  
      },

});