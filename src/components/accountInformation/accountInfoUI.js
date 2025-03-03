import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView,Platform } from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent1";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import Fonts from '../../utils/commonStyles/fonts'
import AlertComponent from '../../utils/commonComponents/alertComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "../../utils/constants/constant";
import fonts from './../../utils/commonStyles/fonts'
import DeviceInfo from 'react-native-device-info';

import AuthImg from "./../../../assets/images/otherImages/svg/app-or.svg";
import EditImg from "./../../../assets/images/otherImages/svg/editImg.svg";

let tickImg = require("./../../../assets/images/otherImages/png/checked.png");

const AccountInfoUi = ({ route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [email, set_email] = useState(undefined);
    const [fullName, set_fullName] = useState(undefined);
    const [phoneNo, set_phoneNo] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [secondaryEmail, set_secondaryEmail] = useState(undefined);
    const [appName , set_AppName] = useState('')

    //Updating user details in UI
    useEffect(() => {
        getAppName();
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

    const getAppName = () => {
        let appName = DeviceInfo.getApplicationName();
        set_AppName(appName);
    }

    // Logs out of the app
    const rightButtonAction = async () => {
        props.logOutAction(100);
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

    const deleteAccountAction = () => {
        props.deleteAccountAction(101);
    }

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

            <View style={{ alignItems: 'center', width: wp('100%'), height: hp('70%')}}>
                
                {props.bio_Enable ? <View style={[styles.renderBckView]}>

                    <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={() => selectAuthentication()}>

                        <View style={{minHeight: hp('10%'),flex:1, alignItems:'center',justifyContent:'center'}}>
                          <AuthImg width={wp('10%')} height={hp('10%')}/>
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

                <View style={{ marginTop: hp('2%'),height: props.bio_Enable ? (Platform.OS === 'android' ? hp('50%') : hp('45%')) : ((props.clientId && props.clientId > 0 ) || (props.roleName && (props.roleName === "External Vet Technician" || props.roleName === "Hill's Vet Technician")) ? hp('60%') : hp('70%'))}}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <TouchableOpacity onPress={() => btnAction("Name")}>

                            <View style={{ flexDirection: 'row' }}>
                                <View style={styles.backViewStyle}>
                                    <Text style={styles.headerTextStyle}>{'Name'}</Text>
                                    <Text style={fullName ? [styles.subHeaderTextStyle] : [styles.subHeaderTextStyle, { color: 'grey' }]}>{fullName ? fullName : '------'}</Text>
                                </View>
                                <View style={{ justifyContent: 'center' }}>
                                    <EditImg width={wp('5%')} height={hp('5%')}/>
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
                                    <EditImg width={wp('5%')} height={hp('5%')}/>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => btnAction("Phone Number")}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={styles.backViewStyle}>
                                    <Text style={styles.headerTextStyle}>{'Mobile'}</Text>
                                    <Text style={phoneNo ? [styles.subHeaderTextStyle] : [styles.subHeaderTextStyle, { color: 'grey' }]}>{phoneNo ? phoneNo : '------'}</Text>
                                </View>
                                <View style={{ justifyContent: 'center',width: wp('10%'), height: hp('10%') }}>
                                    <EditImg width={wp('5%')} height={hp('5%')}/>
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
                                    <EditImg width={wp('5%')} height={hp('5%')}/>
                                </View>
                            </View>

                        </TouchableOpacity>

                       {(props.clientId && props.clientId > 0) || (props.roleName === "External Vet Technician" || props.roleName === "Hill's Vet Technician") ? <TouchableOpacity onPress={() => btnAction("PetParentAddress")}>

                            <View style={{ flexDirection: 'row' }}>
                                <View style={[styles.backViewStyle,{minHeight: hp('8%')}]}>
                                    <Text style={styles.headerTextStyle}>{'Address'}</Text>
                                    <Text style={styles.subHeaderTextStyle}>{props.pAddress ? props.pAddress : '------'}</Text>
                                </View>
                                <View style={{ justifyContent: 'center' }}>
                                    <EditImg width={wp('5%')} height={hp('5%')}/>
                                </View>
                            </View>

                        </TouchableOpacity> : null}

                        {(props.clientId && props.clientId > 0 ) || (props.roleName === "External Vet Technician" || props.roleName === "Hill's Vet Technician") ? <TouchableOpacity onPress={() => btnAction("PrefferedUnits")}>

                            <View style={{ flexDirection: 'row' ,marginTop: hp('1%')}}>
                                <View style={[styles.backViewStyle,{minHeight: hp('6%')}]}>
                                    
                                   <View style={{width:wp('85%'), flexDirection: 'row',justifyContent:'space-between'}}>
                                        <Text style={styles.headerTextStyle}>{'Preferences'}</Text>
                                        <View style={{ justifyContent: 'center' }}>
                                            <EditImg width={wp('5%')} height={hp('5%')}/>
                                        </View>
                                   </View>
                                    <View style={{justifyContent:'space-between',marginTop: hp('0%')}}>
                                        <Text style={styles.headerTextStyle}>{'Food Recommendation Unit   '}<Text style={[styles.subHeaderTextStyle,{textTransform:'capitalize'}]}>{props.preferredFoodRecUnit ? props.preferredFoodRecUnit : '--'}</Text></Text>
                                        <Text style={styles.headerTextStyle}>{'Food Recommendation Time   '}<Text style={[styles.subHeaderTextStyle,{textTransform:'capitalize'}]}>{props.preferredFoodRecTime ? props.preferredFoodRecTime : 'N/A'}</Text></Text>
                                        <Text style={[styles.headerTextStyle,{}]}>{'Pet Weight Unit  '}<Text style={[styles.subHeaderTextStyle,{textTransform:'capitalize'}]}>{props.preferredWeightUnit ? props.preferredWeightUnit : 'N/A'}</Text></Text>
                                    </View>
                                   
                                </View>
                                
                            </View>

                        </TouchableOpacity> : null}

                        <View style={{alignItems:'center',marginTop: hp("2%"),bottom:0,alignSelf:'center',justifyContent:'center'}}>
                        <Text style={styles.subHeaderTextStyle}>{appName + ' ' + props.versionNumber}</Text>
                        {/* <Text style={styles.subHeaderTextStyle}>{props.buildVersion}<Text style={styles.subHeaderTextStyle}>{props.enviName === 'tst' ? " (Testing)" : ""}</Text></Text> */}
                        <Text style={styles.subHeaderTextStyle}>{props.buildVersion}<Text style={styles.subHeaderTextStyle}>{""}</Text></Text>
                    </View>
                </ScrollView>
                    
            </View>

        </View>

            <View style={[CommonStyles.bottomViewComponentStyle,{height: (props.clientId && props.clientId > 0 ) || (props.roleName === "External Vet Technician" || props.roleName === "Hill's Vet Technician") ? hp('25%') : hp('13%')}]}>
                <BottomComponent
                    topBtnTitle={'LOG OUT'}
                    bottomBtnTitle={'DELETE ACCOUNT'}
                    isDelete = {true}
                    bottomBtnEnable = {(props.clientId && props.clientId > 0) || (props.roleName === "External Vet Technician" || props.roleName === "Hill's Vet Technician") ? true : false}
                    topButtonAction={async () => rightButtonAction()}
                    bottomButtonAction={async () => deleteAccountAction()}
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