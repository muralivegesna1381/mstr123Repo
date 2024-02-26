import React from 'react';
import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import fonts from './fonts'

const CommonStyles = StyleSheet.create({

    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white'
    },

    textInputStyle: {
        flex: 1,
        color: 'black',
        height: hp('8%'),
        paddingLeft: wp('2%'),
        fontSize: fonts.fontMedium,
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
        backgroundColor: 'white',
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

    headerTextStyle: {
        fontSize: fonts.fontXLarge,
        fontFamily: 'Barlow-Regular',
        color: 'black',
    },

    headerTextStyle1: {
        fontSize: fonts.fontXLarge,
        fontFamily: 'Barlow-Medium',
        color: 'black',
    },

    headerTextStyleBold: {
        fontSize: fonts.fontXLarge,
        fontFamily: 'Barlow-SemiBold',
        color: 'black',
    },

    subHeaderTextStyle: {
        fontSize: fonts.fontNormal,
        fontFamily: 'Barlow-Regular',
        color: 'black',
        opacity: 0.7
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
        color: 'black'
    },

    hideOpenIconStyle: {
        width: wp('6%'),
        height: hp('6%'),
        resizeMode: 'contain',
        marginRight: wp('2%'),
        tintColor: 'black'
    },

    authIconStyle: {
        width: wp('6%'),
        height: hp('6%'),
        resizeMode: 'contain',
        marginRight: wp('2%'),
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
        fontSize: fonts.fontLarge,
        color: 'black'
    },

    bottomViewComponentStyle: {
        height: hp('13%'),
        width: wp('100%'),
        backgroundColor: 'white',
        position: "absolute",
        bottom: 0,
        shadowColor: 'black',
        shadowOffset: { width: 10, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 3,
    },

    headerView: {
        backgroundColor: 'white',
        width: wp('100%'),
        height: hp('12%'),
        justifyContent: 'center',
    },

    petsSelViewHeaderStyle: {
        backgroundColor: 'transparent',
        width: wp('100%'),
        //  minHeight:hp('12%'),
        borderRadius: 5,
        justifyContent: 'center',
    },

    noRecordsTextStyle: {
        fontSize: fonts.fontLarge,
        fontFamily: 'Barlow-SemiBold',
        color: 'black',
        marginTop: hp('2%'),
    },

    hintTextStyle: {
        fontSize: fonts.fontTiny,
        fontFamily: 'Barlow-SemiBold',
        color: 'grey',
        marginTop: hp('2%'),
    },

    noRecordsTextStyle1: {
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-Regular',
        color: 'black',
        marginTop: hp('1%'),
    },

    nologsDogStyle: {
        width: wp('25%'),
        aspectRatio: 1,
        resizeMode: 'contain',
    },

    questImageStyles: {
        width: wp('25%'),
        aspectRatio: 1,
        resizeMode: 'contain',
        marginTop: hp('1%'),
        marginBottom: hp('1%'),
        alignSelf: 'center',
        justifyContent: 'center',
    },

    questImagesBtnStyle: {
        width: wp('25%'),
        alignSelf: 'center'
    },

    tilesBtnStyle: {
        height: hp('4%'),
        aspectRatio: 1,
        backgroundColor: '#cbe8b0',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderColor: '#6fc309',
        borderWidth: 1.0,
        marginLeft: wp('2%'),
    },

    tilesBtnLftStyle: {
        height: hp('4%'),
        aspectRatio: 1,
        backgroundColor: '#E7E7E9',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 1.0,
    },

    tilesBtnTextStyle: {
        fontFamily: 'Barlow-Bold',
        fontSize: fonts.fontXSmall,
        color: 'black',
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
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: hp('-8%')
    },

    submitQSTNotAnsweredTextStyle: {
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-Regular',
        color: 'red',
    },

    mediaSubViewStyle: {
        width: wp('25%'),
        height: hp('2%'),
        backgroundColor: '#6BC105',
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomEndRadius: 5,
        borderBottomStartRadius: 5
    },

    mediaViewTextStyle: {
        fontFamily: 'Barlow-Bold',
        fontSize: fonts.fontTiny,
        color: 'white',
    },

    optionMediaViewTextStyle: {
        fontFamily: 'Barlow-SemiBold',
        fontSize: fonts.fontXTiny,
        color: 'white',
    },

    optionsmediaSubViewStyle: {
        width: wp('12%'),
        height: hp('2%'),
        backgroundColor: '#6BC105',
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomEndRadius: 5,
        borderBottomStartRadius: 5
    },

    searchBarStyle: {
        width: wp('94%'),
        height: hp('5%'),
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: hp("1%"),
        marginBottom: hp("0.5%"),
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#dedede',
        borderRadius: 5,
    },

    searchTextInputStyle: {
        flex: 1,
        color: 'black',
        height: hp('5%'),
        paddingLeft: wp('2%'),
        fontSize: 15,
        fontFamily: 'Barlow-Regular',
        // alignSelf:'center',
        justifyContent: 'center',
        alignItems: 'center',
    },

    shadowStyleDrop: {
        shadowColor: '#132533',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 3,
    },

    dropDownFlatcontainer: {
        flex: 1,
    },

    dropDownTextStyle: {
        fontFamily: 'Barlow-Regular',
        fontSize: fonts.fontXMedium,
        // textAlign: "left",
        color: "black",
    },

    dropDownHeaderTextStyle: {
        fontFamily: 'Barlow-Regular',
        fontSize: fonts.fontXSmall,
        // textAlign: "left",
        color: "black",
    },

    shadowStyleLight: {
        shadowColor: '#132533',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },

    optionsQuestImagesBtnStyle: {
        width: wp('18%'),
        alignSelf: 'center',
        justifyContent: 'center',
        alignContent: 'center',
    },

    questOptionImageStyles: {
        width: wp('12%'),
        aspectRatio: 1,
        resizeMode: 'contain',
        marginTop: hp('1%'),
        marginBottom: hp('1%'),
        alignSelf: 'center',
        justifyContent: 'center',
    },

    noRecTexStyle: {
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-SemiBold',
        color: 'black',
    },

    noRecSubTextStyle: {
        fontSize: fonts.fontSmall,
        fontFamily: 'Barlow-Medium',
        color: 'black',
    },

    searchSubTexStyle: {
        fontSize: fonts.fontXSmall,
        fontFamily: 'Barlow-Medium',
        color: 'black',
        opacity: 0.6
    },

    searchIconStyle: {
        aspectRatio: 1,
        height: hp('4.5%'),
        marginLeft: hp('2%'),
    },

    captureImageLable: {
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-SemiBold',
        marginLeft: wp('2%'),
        marginBottom: wp('2%'),
        alignSelf: 'flex-start',
        bottom: 0,
        position: 'absolute',
        color: '#000',
    },

    headerTextStyleBFIApp: {
        fontSize: fonts.fontLarge,
        fontFamily: 'Barlow-SemiBold',
        color: "black",
    },

    headerViewStyleBFIApp: {
        width: wp("90%"),
        marginBottom: hp("1.5%"),
        borderRadius: hp("0.5%"),
        justifyContent: "center",
        alignContent: 'center',
        alignSelf: 'center',
        marginTop: hp("3%"),
        backgroundColor: 'white',
    },

    searchInputContainerStyle: {
        flexDirection: 'row',
        width: wp('89%'),
        height: hp('3.5%'),
        borderRadius: 5,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',

    },

    searchFilterListStyle: {
        top: 55,
        position: "absolute",
        width: wp("93.5%"),
        minHeight: hp("5%"),
        maxHeight: hp("35%"),
        borderRadius : 5,
        alignSelf:'center',
        backgroundColor:'white',
        alignItems:'center',
        justifyContent:'center',      
    },

    searchCellBackViewStyle : {
        borderBottomColor:'#EAEAEA',
        borderBottomWidth:1,
        alignItems:'center',
        justifyContent:'center',
        height: hp("8%"),
    },

    searchTexStyle : {
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-SemiBold',
        color: 'black',     
    },

    // searchIconStyle : {      
    //     aspectRatio:1,
    //     height:hp('4%'),
    //     marginLeft:hp('2%'), 
    // },

    searchImageStyle : {
        height: hp("4%"),
        width: wp("3%"),
        resizeMode:'contain',
        marginLeft:hp('2%'), 
    },

    searchNologsDogStyle : {
        height: hp("5%"),
        width: wp("14%"),
        resizeMode:'stretch',
        marginLeft:hp('2%'), 
        marginTop:hp('1%'), 
        marginBottom:hp('1%'), 
    },

    tabViewStyle : {
        width:wp('94%'),
        height:hp('3.5%'),
        backgroundColor:'#7676801F',
        alignSelf:'center',
        borderRadius:7,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
    },

    tabViewEnableBtnStyle : {
        width:wp('46%'),
        height:hp('3%'),
        backgroundColor:'white',
        borderRadius:7,
        marginLeft:hp('0.2%'),
        justifyContent:'center',
        alignItems:'center',
        shadowColor: '#132533',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 5, 
        elevation: 3,
    },

    tabViewBtnStyle : {
        width:wp('46%'),
        height:hp('3.5%'),
        backgroundColor:'transparent',
        marginLeft:hp('0.2%'),
        justifyContent:'center',
        alignItems:'center'
    },

    tabBtnTextStyle : {
        fontSize: 16,
        fontFamily: 'Barlow-SemiBold',
        color: 'black', 
    },

    shadowStyle : {
        shadowColor: '#132533',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8, 
        elevation: 5, 
    },

    droDownViewStyle : {
        minHeight: hp("35%"),
        width: wp("100%"),
        backgroundColor:'#EEEEEE',
        bottom:0,
        position:'absolute',
        alignSelf:'center',
        borderTopRightRadius:15,
        borderTopLeftRadius:15,
        alignItems: "center",
      },
  
      dropDownFlatview: {
        height: hp("5.5%"),
        marginBottom: hp("0.3%"),
        alignContent: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width:wp('100%'),
        alignItems: "center",
      },

    //   dropDownHeaderTextStyle: {
    //     fontFamily: 'Barlow-Regular',
    //     fontSize: fonts.fontTiny,
    //     // textAlign: "left",
    //     color: "black",
    //   },

      popSearchViewStyle : {
        height: hp("30%"),
        width: wp("100%"),
        backgroundColor:'#DCDCDC',
        bottom:0,
        position:'absolute',
        alignSelf:'center',
        borderTopRightRadius:15,
        borderTopLeftRadius:15, 
    },

    datePickerMViewStyle : {
        alignSelf:'center',
        borderRadius:5,
        marginBottom:hp('2%')
    },
  
    datePickerSubViewStyle : {
        width: wp('100%'),
        height: hp('40%'),
        alignSelf:'center',
        backgroundColor:'#f9f9f9',
        alignItems:'center',
        justifyContent:'center', 
        borderRadius:10,     
    },

    datePickeStyle : {
        backgroundColor:'white',
        width: wp('70%'),
        height: hp('25%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 1,
    },

    doneTexStyle : {
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-Medium',
        color: 'black',     
    },

    dateBtnStyle : {
        width:wp('93%'),
        height:hp('4%'),
        borderRadius:5,
        borderWidth:1,
        borderColor:'#A0A0A0',
        justifyContent:'center',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },

    dateBtnTextStyle : {
        fontSize: 15,
        fontFamily: 'Barlow-SemiBold',
        color: '#A0A0A0', 
        marginLeft:hp('2%'),              
    },

    dteTouchBtnStyle : {
        backgroundColor:'white',
        height: hp('4%'),
        width: wp('35%'),
        borderRadius:5,
        alignItems:'center',
        justifyContent:'center'
    },

    searchCalImageStyle: {
        height: hp('6%'),
        width: wp('6%'),
        resizeMode: "contain",
        marginRight:hp('1%')
    },

    searchDropShadowStyle : {
        shadowColor: '#132533',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 15, 
        elevation: 3,
    },

    fhTextStyle1 : {
        fontSize: 14,
        fontFamily: 'Barlow-SemiBold',
        // color: '#A0A0A0', 
        // marginLeft:hp('2%'),              
    },

    // shadowStyle : {
    //     shadowColor: '#132533',
    //     shadowOffset: { width: 2, height: 2 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 5, 
    //     elevation: 3,
    // },
    
    // droDownViewStyle : {
    //     // height: hp("50%"),
    //     width: wp("100%"),
    //     backgroundColor:'#EEEEEE',
    //     bottom:0,
    //     position:'absolute',
    //     alignSelf:'center',
    //     borderTopRightRadius:15,
    //     borderTopLeftRadius:15,
    //     alignItems: "center",
    //   },
  
    //   dropDownFlatview: {
    //     height: hp("5.5%"),
    //     marginBottom: hp("0.3%"),
    //     alignContent: "center",
    //     justifyContent: "center",
    //     borderBottomColor: "grey",
    //     borderBottomWidth: wp("0.05%"),
    //     width:wp('100%'),
    //     alignItems: "center",
    //   },

});

export default CommonStyles;