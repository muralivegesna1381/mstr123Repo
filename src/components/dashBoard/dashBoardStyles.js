import {StyleSheet} from 'react-native';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import fonts from './../../utils/commonStyles/fonts';

/**
  * All the Styles for Dashboard Page are  declared here
  * These styles are imported in DashBoardUI class
*/

const DashBoardStyles = StyleSheet.create({

    mainComponentStyle : {
        width:wp('100%'),
        flex:1,
        backgroundColor:'white'
    },

    headerView : {
        backgroundColor:'#F5F7F9',
        width:wp('100%'),
        height:hp('12%'),
        justifyContent:'center',
    },

    firstTimeUserStyle : {
        width:wp('80%'),
        height:hp('70%'),
        backgroundColor : '#F5F7F9',
        alignSelf:'center',
        justifyContent:'center',
        marginTop:wp('10%'),
    },

    ftTopViewStyle : {
        flex:1,
        justifyContent:'center'
    },

    ftdownViewStyle : {
        flex:2,
    },

    ftHeaderHeader1 : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
        color: 'black', 
    },

    ftHeaderHeader2 : {
        fontSize: fonts.fontXXXLarge,
        ...CommonStyles.textStyleBold,
        color: 'black', 
    },

    ftHeaderHeader3 : {
        fontSize: fonts.fontXXXLarge,
        ...CommonStyles.textStyleRegular,
        color: '#93939C', 
    },

    ftHeaderHeader4 : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        color: 'black', 
        marginTop:wp('4%'),
        marginBottom:wp('4%'),
    },

    ftytLnksHeaderHeader : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleMedium,
        color: 'black', 
        flex:2,
        marginLeft: wp("2%"),
        marginRight: wp("2%"),
    },

    ytLinkViewStyle : {
        width:wp('80%'),
        height:hp('10%'),
        marginBottom:wp('2%'),
        borderBottomColor:'#707070',
        borderBottomWidth:0.2,
        flexDirection:'row',
        alignItems:'center',
        
    },

    youTubeThumbs : {
        flex:1,
        marginRight: wp("2%"),
        width:wp('25%'),
        height:hp('8%'),
        borderRadius:15
    },

    leadeBoardStyle : {
        height:hp('35%'),
        width:wp('100%'),
    },

    buttonstyle : {
        justifyContent: "center",
        alignItems:'center',
    },

    btnTextStyle: {
        color: '#DE1111',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleBold,
    },

    missingTextStyle : {
        textAlign:'center',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
    },

    missingTextStyle1 : {
        textAlign:'center',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        marginTop:hp('1%'),
    },

    missingBackViewStyle : {
        width:wp('80%'), 
        justifyContent:'center', 
        alignItems:'center', 
        alignSelf:'center',
        marginTop:hp('1%'),
    },

    missingDogImgStyle : {
        width:wp('15%'),
        resizeMode:'contain',
        alignSelf:'center',
    },

    missingCatImgStyle : {
        // marginTop:hp('1%'),
        // width:wp('70%'),
        height:wp('25%'),
        aspectRatio:1,
        resizeMode:'contain',
        alignSelf:'center',
    },

    quickselctionViewStyle : {
        width:wp('93.5%'),
        height:hp('7%'),
        borderRadius:5,
        alignSelf:'center',
        justifyContent:'center',
        flexDirection:'row',
        backgroundColor:'#BEEEFF',
    },

    quickActionsInnerViewStyle : {
        justifyContent:'center',
        alignItems:'center',
        minHeight:hp('1%'),
        flex:1
    },

    quickbtnInnerImgStyle : {
        width:wp('5%'),
        height:hp('3%'),
        resizeMode:'contain',
    },

    upDownImgStyle : {
        width:wp('4%'),
        height:hp('1.5%'),
        resizeMode:'contain',
    },

    quickbtnInnerTextStyle : {
        fontSize: 11,
        ...CommonStyles.textStyleBold,
        color: 'black', 
        alignSelf:'center',
        marginTop:wp('0.5%'),
    },
  
    flatcontainer: {
        width: wp("90%"),
        marginTop: hp("2%"),
        // flex:1,
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontSmall,
        textAlign: "left",
        color: "black",
        marginLeft: hp("1%"),
        marginRight: hp("1%"),
        marginTop: hp("1%"),
    },

    meterialViewStyle : {
        width:wp('26%'),
        height:hp('14%'),
        borderRadius:5,
        margin:  hp('1%'),
        alignSelf:'flex-start'
    },

    backdrop: {
        height: hp("8%"),
        width: wp("26%"),
        justifyContent:'center',
        resizeMode: "contain",
    },

    backdrop1: {
        height: hp("8%"),
        width: wp("26%"),
        justifyContent:'center',
        resizeMode: "stretch",
    },

    playIconStyle : {      
        width: wp("6%"),
        height: hp("6%"),
        alignSelf: "center",       
        resizeMode: "contain",
    },

    progressStyle : {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleSemiBold,
        color: 'white', 
    },

    alertTextStyle: {
        color: 'white',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleSemiBold,
        textAlign: "center",
    },

    questCountTextStyle : {
        fontSize: 28,
        ...CommonStyles.textStyleBold,
        color: '#6BC100', 
        marginBottom:hp('0.5%'), 
        marginLeft:hp('0.5%'), 
    },

    questCountTextStyleiPad : {
        fontSize: 40,
        ...CommonStyles.textStyleBold,
        color: '#6BC100', 
        marginBottom:hp('0.5%'), 
        marginLeft:hp('0.5%'), 
    },

    dashboardViewStyle : {
        height:hp('100%'), 
        width:wp('100%'), 
    },

    tylebckViewStyle : {
        height:hp('11%'), 
        width:wp('93.5%'), 
        alignSelf:'center',
        flexDirection:'row', 
        marginBottom:hp('1%'),
        marginTop:hp('0.5%'),
    },

    tyleViewStyle : {
        height:hp('11%'), 
        width:wp('45.2%'), 
        borderWidth:1,
        borderRadius:10,
        flexDirection:'row',
    },

    questBackViewStyle : {
        height:hp('7%'), 
        width:wp('93.5%'), 
        alignItems:'center',
        justifyContent:'center',
        borderRadius:10,
        shadowColor: '#132533',
        shadowOffset: { width: 1, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 3, 
        elevation: 3,
        alignSelf:'center',
        marginBottom:hp('1%'),
        backgroundColor:'white',
    },

    questBackStyle : {
        height: hp("7%"),
        width: wp("10%"),
        justifyContent:'center',
        flex:3
    },

    questArrowStyle : {
        aspectRatio:1,
        justifyContent:'center',
        flex:0.5
    },

    questDogImgStyle : {
        height: hp("5.5%"),
        aspectRatio:1,
        resizeMode: "contain",
    },

    questHeaderTextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleMedium,
        color: 'black', 
    },

    questSubHeaderTextStyle : {
        fontSize: 16,
        ...CommonStyles.textStyleSemiBold,
        color: 'black', 
    },

    questSubHeaderTextStyleiPad : {
        fontSize: 24,
        ...CommonStyles.textStyleSemiBold,
        color: 'black', 
    },

    // questCountTextStyle : {
    //     fontSize: fonts.fontXLarge,
    //     ...CommonStyles.textStyleBold,
    //     color: '#6BC100', 
    // },

    sliderTextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: 'black', 
    },

    tyleActivityStyle : {
        width: wp("91%"),
        backgroundColor:'white',
        borderRadius:5,
        alignItems:'center'
    },

    activityHeaderTextStyle : {
        fontSize: 16,
        ...CommonStyles.textStyleSemiBold,
        color: 'black', 
        marginLeft: wp("2%")
    },

    activityFoodTextStyle : {
        fontSize: fonts.fontTiny,
        ...CommonStyles.textStyleLight,
        color: 'black', 
    },

    activityFoodTextStyle1 : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleRegular,
        color: 'black', 
    },

    uploadTextStyle : {
        fontSize: fonts.fontTiny,
        ...CommonStyles.textStyleSemiBold,
        color: 'white', 
    },

    uploadSubTextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleRegular,
        color: 'white', 
    },

    tabViewStyle : {
        width:wp('94%'),
        height:hp('4.5%'),
        backgroundColor:'#7676801F',
        alignSelf:'center',
        borderRadius:5,
        alignItems:'center',
        justifyContent:'center',
    },

    tabViewEnableBtnStyle : {
        width:wp('45%'),
        height:hp('3.5%'),
        backgroundColor:'white',
        // marginLeft:hp('0.2%'),
        justifyContent:'center',
        alignSelf:'center',
        alignItems:'center',
    },

    tabViewBtnStyle : {
        width:wp('45%'),
        height:hp('3.5%'),
        backgroundColor:'transparent',
        // marginLeft:hp('0.2%'),
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
    },

    tabBtnTextStyle : {
        fontSize: 16,
        ...CommonStyles.textStyleMedium,
        color: 'black',         
    },

    tabBtnTextStyleiPad : {
        fontSize: 24,
        ...CommonStyles.textStyleMedium,
        color: 'black',         
    },

    timeTextStyle : {
        fontSize: 14,
        ...CommonStyles.textStyleLight,
        color: 'black', 
    },

    timeTextStyleiPad : {
        fontSize: 18,
        ...CommonStyles.textStyleLight,
        color: 'black', 
    },
    
    timeTextStyle1 : {
        fontSize: 16.5,
        ...CommonStyles.textStyleRegular,
        color: 'black', 
    },

    timeTextStyle1iPad : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        color: 'black', 
    },

    timeTextStyle2 : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: '#6BC100', 
    },

    timeTextStyle2iPad : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: '#6BC100', 
    },

    tryLaterTextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleRegular,
        color: '#7F7F81', 
    },

    timeCenterTextStyle : {
        fontSize: fonts.fontTiny,
        ...CommonStyles.textStyleSemiBold,
        color: 'black', 
    },

    fMCenterTextStyle : {
        fontSize: fonts.fontXMedium,
        ...CommonStyles.textStyleSemiBold,
        color: 'black', 
    },

    weightLabelTextStyle : {
        fontSize: fonts.fontTiny,
        ...CommonStyles.textStyleSemiBold,
        color: 'black', 
    },

    circleViewStyle : {
        justifyContent:'center',
        alignItems:'center',
        width:wp('12%'),
        aspectRatio:1,
        borderRadius:100,
        borderWidth:1,
        borderColor:'#6BC100',
        marginBottom:hp('1%'),
    },

    circleViewStyleiPad : {
        justifyContent:'center',
        alignItems:'center',
        width:wp('8%'),
        aspectRatio:1,
        borderRadius:100,
        borderWidth:1,
        borderColor:'#6BC100',
        marginBottom:hp('1%'),
        alignSelf:'center',
    },

    plusTextStyle2 : {
        fontSize: fonts.fontXXXXLarge0,
        ...CommonStyles.textStyleLight,
        color: '#6BC100',   
        marginTop:hp('-0.5%'),    
    },

    setGoalTextStyle : {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleRegular,
        color: 'black', 
    },

    wgtTyleActivityStyle : {
        // height: hp("5%"),
        width: wp("24.5%"),
        shadowColor: '#132533',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 2, 
        elevation: 5,
        backgroundColor:'white',
        borderRadius:10,
        alignItems:'center'
    },
    
    wgtTabViewStyle : {
        width:wp('50%'),
        // height:hp('4%'),
        backgroundColor:'#7676801F',
        alignSelf:'center',
        borderRadius:5,
        alignItems:'center',
        justifyContent:'center',
    },

    devTextStyle : {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleBold,
        color: 'black',      
    },

    devTextStyle1 : {
        fontSize: fonts.fontTiny,
        ...CommonStyles.textStyleBold,
        color: 'black',      
    },

    devMissImgStyle : {
        width:wp('8%'),
        // height:hp('5%'),
        resizeMode:'contain',
    },
    
});

export default DashBoardStyles;