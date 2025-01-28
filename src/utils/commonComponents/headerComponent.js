import React, { useEffect } from 'react';
import {StyleSheet,Text,TouchableOpacity, View,Image} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';

import BackBtnImg from "../../../assets/images/otherImages/svg/backButtonImg.svg";
import HeaderIcon from "../../../assets/images/otherImages/svg/headerPetIcon.svg";
import MenuImg from "../../../assets/images/sideMenuImages/svg/menuMainImg.svg";
import NotificationImg from "../../../assets/images/otherImages/svg/notificationEmptyImg.svg";
import NotificationRedImg from "../../../assets/images/otherImages/svg/notificationRedImg.svg";

const HeaderComponent = ({navigation, route,isChatEnable, isInfoEnable,isTImerEnable,isSettingsEnable,isBackBtnEnable,isNotificationsEnable,isNotitficationCount,title,isTitleHeaderEnable,moduleName,headerColor,...props }) => {

    const notificationAction = () => {
        props.notificationAction();
    }

    const timerBtnAction = () => {
        props.timerBtnAction();
    }

    const settingsBtnAction = () => {
        props.settingsBtnAction();
    }

    const backBtnAction = () => {
        props.backBtnAction();
    }

    const infoBtnAction = () => {
        props.infoBtnAction();
    }

    return (

        <View style={{flex:1,backgroundColor:headerColor}}>
            <View style={[styles.headerView]}>
                <View style={{flexDirection:'row', bottom:5, position:'absolute'}}>

                    {isSettingsEnable ? <View style={{justifyContent:'center',marginLeft:wp('2%')}}>
                        <TouchableOpacity onPress = {() => settingsBtnAction()}>
                            <MenuImg style={styles.menuImgStyle}/>
                        </TouchableOpacity>
                    </View> : null}

                    <View style={{justifyContent:'center'}}>
                        <TouchableOpacity onPress = {() => backBtnAction()} style={{flexDirection:'row',alignItems:'center',}} disabled = {isBackBtnEnable ? false : true}>
                            {isBackBtnEnable ? <View style={styles.backBtnEnableStyle}><BackBtnImg/></View> : null}
                            <View ><HeaderIcon style={{marginLeft: isBackBtnEnable ? wp("1%") : wp("3%"),marginRight: wp("2%"), width:wp('5%'),aspectRatio:1,resizeMode:''}}/></View>
                        </TouchableOpacity>
                    </View>

                    {isTitleHeaderEnable ? <View style={[styles.headerSelectionView]}><Text style={[styles.titleStyle]}>{title}</Text></View> : null}

                    <View style={{flex:1.5,justifyContent:'center',alignItems:'center',}}>
                    
                    {<View style={{flexDirection:'row',}}>

                        {isTImerEnable ? <TouchableOpacity onPress = {() => timerBtnAction()}>
                            <Image source={require("../../../assets/images/chatImages/minimizeChat.svg")} style={{marginRight: wp("2%"),width:wp('6%'),height:wp('6%')}}/>
                        </TouchableOpacity> : null}

                        {isNotificationsEnable ? <TouchableOpacity style = {{width:wp('20%'),alignItems:'center'}} onPress = {() => notificationAction()}>
                            {isNotitficationCount ? <NotificationRedImg/> : <NotificationImg/>}
                        </TouchableOpacity> : null}

                        {isInfoEnable ? <TouchableOpacity onPress = {() => infoBtnAction()}>
                            <Image source={require("../../../assets/images/bfiGuide/svg/info.svg")} style={{marginLeft: wp("3%"), marginRight: wp("3%"),width:wp('6%'),height:wp('6%')}}/>
                        </TouchableOpacity> : null}

                    </View>}
                    
                    </View>

                </View>
            </View>
            {moduleName === 'hide' ? null : <View style={[styles.separatorViewStyle,{backgroundColor: '#dedede'}]}></View>}
        </View>

        
    );
};

export default HeaderComponent;

const styles = StyleSheet.create({

    headerView : {
        justifyContent:'center',
        flex:1,
    },

    headerSelectionView : {
        flex:6,
        minHeight:hp('4%'),
        flexDirection:'row',
        alignItems:'center',
    },

    backBtnDisableStyle : {
        marginLeft: wp("2%"),
        width:wp('8%'),
        height:wp('8%'),
        resizeMode:'contain'
    },

    backBtnEnableStyle : {
        marginLeft: wp("4%"),
        width:wp('5%'),
        height:wp('4%'),
        resizeMode:'contain',
    },

    titleStyle : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleBold,
        textAlign:'center',
        marginLeft: wp("2%"),       
    },

    separatorViewStyle : {
        height:hp('0.1%'),
        width:wp('100%'),
         bottom:0
    },

    menuImgStyle : {
        flex:1,
        marginLeft: wp("2%"),
        marginRight: wp("2%"),
        width:wp('6%'),
        height:wp('6%')
    }

});