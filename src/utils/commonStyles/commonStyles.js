import React from 'react';
import {StyleSheet} from 'react-native';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import fonts from './fonts'

const CommonStyles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'          
    },
    
    textInputStyle: {
        flex: 1,
        color: 'black',
        height:hp('8%'),
        paddingLeft:wp('2%'),
        fontSize:fonts.fontMedium,
        fontFamily: 'Barlow-Regular',
    },

    textInputContainerStyle: {
        flexDirection: 'row',
        width: wp('80%'),
        height: hp('8%'),
        borderRadius: hp('0.5%'),
        borderWidth: 1,
        marginTop: hp('2%'),
        borderColor: '#dedede',
        backgroundColor:'white',
        marginRight: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
    },

    customPopUpStyle: {
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(52, 52, 52, 0.5)',
         left: 0,
         top: 0,
         right: 0,
         bottom: 0,
    },

    customPopUpGlobalStyle: {
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'transparent',
         left: 0,
         top: 0,
         right: 0,
         bottom: 0,
    },

    headerTextStyle : {
        fontSize: fonts.fontXLarge,
        fontFamily: 'Barlow-Regular',
        color: 'black', 
    },

    headerTextStyle1 : {
        fontSize: fonts.fontXLarge,
        fontFamily: 'Barlow-Medium',
        color: 'black', 
    },

    headerTextStyleBold : {
        fontSize: fonts.fontXLarge,
        fontFamily: 'Barlow-SemiBold',
        color: 'black', 
    },

    subHeaderTextStyle : {
        fontSize: fonts.fontNormal,
        fontFamily: 'Barlow-Regular',
        color: 'black', 
        opacity:0.7
    },

    textStyleSemiBold: {
        fontFamily: 'Barlow-SemiBold',
    },

    textStyleRegular: {
        fontFamily: 'Barlow-Regular',
    },

    textStyleBold: {
        fontFamily: 'Barlow-Bold',
    },

    textStyleExtraBold: {
        fontFamily: 'Barlow-ExtraBold',
    },

    textStyleExtraBoldItalic: {
        fontFamily: 'Barlow-ExtraBoldItalic',
    },

    textStyleEtalic: {
        fontFamily: 'Barlow-Italic',
    },

    textStyleMediumItalic: {
        fontFamily: 'Barlow-MediumItalic',
    },

    textStyleMedium: {
        fontFamily: 'Barlow-Medium',
    },

    textStyleBlack: {
        fontFamily: 'Poppins',
    },

    textStyleThin: {
        fontFamily: 'Barlow-Thin',
    },

    textStyleLight: {
        fontFamily: 'Barlow-Light',
        color:'black'
    },

    hideOpenIconStyle : {
        width: wp('6%'),
        height: hp('6%'),
        resizeMode: 'contain',
        marginRight:wp('2%'),
        tintColor:'black'
    },

    authIconStyle : {
        width: wp('6%'),
        height: hp('6%'),
        resizeMode: 'contain',
        marginRight:wp('2%'),
        // tintColor:'black'
    },

    spinnerStyle: {
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'transparent',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      },

      headerTextStyleLight: {
        fontFamily: 'Barlow-Light',
        fontSize:fonts.fontLarge,
        color:'black'
    },

    bottomViewComponentStyle : {
        height:hp('16%'),
        width:wp('100%'),
        backgroundColor:'white',
        position:"absolute",
        bottom:0,
        shadowColor: 'black',
        shadowOffset: { width: 10, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 25,
    },

    headerView : {
        backgroundColor:'white',
        width:wp('100%'),
        height:hp('12%'),
        justifyContent:'center',
    },

    petsSelViewHeaderStyle : {
        backgroundColor:'transparent',
        width:wp('120%'),
        //  minHeight:hp('12%'),
        borderRadius:5,
        justifyContent:'center',
    },

    noRecordsTextStyle : {
        fontSize: fonts.fontLarge,
        fontFamily: 'Barlow-SemiBold',
        color: 'black', 
        marginTop:hp('2%'),
    },

    noRecordsTextStyle1 : {
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-Regular',
        color: 'black', 
        marginTop:hp('1%'),
    },

    nologsDogStyle : {
        width:wp('25%'),
        aspectRatio:1,
        resizeMode:'contain',
    },

    questImageStyles : {
        width:wp('25%'),
        aspectRatio : 1,
        resizeMode:'contain',
        marginTop:hp('1%'),
        marginBottom:hp('1%'),
        alignSelf:'center',
        justifyContent:'center',
    },

    questImagesBtnStyle : {
        width:wp('25%'),
        alignSelf:'center'
    },

    tilesBtnStyle : {
        height:hp('4%'),
        aspectRatio:1,
        backgroundColor:'#cbe8b0',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:5,
        borderColor:'#6fc309',
        borderWidth:1.0,
        marginLeft:wp('2%'),
    },

    tilesBtnLftStyle : {
        height:hp('4%'),
        aspectRatio:1,
        backgroundColor:'#E7E7E9',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:5,
        borderColor:'black',
        borderWidth:1.0,
    },

    tilesBtnTextStyle: {
        fontFamily: 'Barlow-Bold',
        fontSize: fonts.fontXSmall,
        color:'black',
    },

    tilesBtnImgStyle: {
        width: wp("5%"),
        aspectRatio: 1,
    },

    addressCountryStyle: {
        flexDirection: 'row',
        width: wp('80%'),
        height: hp('8%'),
        borderRadius: wp('1%'),
        borderWidth: 1,
        borderColor: '#dedede',
        backgroundColor:'transparent',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop:hp('-8%')
    },

    submitQSTNotAnsweredTextStyle : {
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-Regular',
        color: 'red', 
    },

    mediaSubViewStyle : {
        width:wp('25%'),
        height:hp('2%'),
        backgroundColor:'#6BC105',
        position:'absolute',
        bottom:0,
        alignItems:'center',
        justifyContent:'center',
        borderBottomEndRadius : 5,
        borderBottomStartRadius : 5
    },
    
    mediaViewTextStyle: {
        fontFamily: 'Barlow-Bold',
        fontSize: fonts.fontTiny,
        color:'white',
    },

    optionMediaViewTextStyle: {
        fontFamily: 'Barlow-SemiBold',
        fontSize: fonts.fontXTiny,
        color:'white',
    },
    
    optionsmediaSubViewStyle : {
        width:wp('12%'),
        height:hp('2%'),
        backgroundColor:'#6BC105',
        position:'absolute',
        bottom:0,
        alignItems:'center',
        justifyContent:'center',
        borderBottomEndRadius : 5,
        borderBottomStartRadius : 5
    },

    optionsQuestImagesBtnStyle : {
        width:wp('18%'),
        alignSelf:'center',
        justifyContent:'center',
        alignContent:'center',
    },

    questOptionImageStyles : {
        width:wp('12%'),
        aspectRatio : 1,
        resizeMode:'contain',
        marginTop:hp('1%'),
        marginBottom:hp('1%'),
        alignSelf:'center',
        justifyContent:'center',
        
    },

});

export default CommonStyles;