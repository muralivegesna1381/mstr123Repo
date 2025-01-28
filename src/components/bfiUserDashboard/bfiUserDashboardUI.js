import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import Fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import * as Constant from "./../../utils/constants/constant";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import fonts from './../../utils/commonStyles/fonts';

import RightArrowBtnImg from "./../../../assets/images/dashBoardImages/svg/right-arrow.svg";

const BFIUserDashboardUI = ({ navigation, route, ...props }) => {

    const menuAction = () => {
        props.menuAction();
    };

    const featureActions = (value) => {
        props.featureActions(value);
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const popOkCancelAction = () => {
        props.popOkCancelAction();
    };

    return (

        <View style={styles.mainComponentStyle}>

            <View style={[CommonStyles.headerView, {}]}>
                <HeaderComponent
                    isBackBtnEnable={false}
                    isSettingsEnable={true}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'DASHBOARD'}
                    headerColor={'white'}
                    settingsBtnAction={() => menuAction()}
                />
            </View>

            {props.bfiUploadStatus ?
                <View style={{ width: wp('100%'), height: Platform.isPad ? hp('12%') : hp('10%'), alignItems: 'center', justifyContent: 'center', backgroundColor: '#818588', marginBottom: props.bfiUploadStatus ? hp('0%') : hp('1%') }}>
                    <View style={{ width: wp('90%'), height: hp('6%'), flexDirection: 'row' }}>

                        <View style={{ width: wp('60%'), height: hp('6%'), justifyContent: 'center' }}>
                            <Text style={[styles.uploadSubTextStyle, { color: 'white', marginTop: hp('1%') }]}>{props.bfiUploadStatus + " " + props.bfiFileName}</Text>
                        </View>

                        <View style={{ width: wp('30%'), height: hp('6%'), alignItems: 'center', justifyContent: 'center' }}>

                            <View style={{ width: wp('12%'), aspectRatio: 1, backgroundColor: '#000000AA', borderRadius: 100, borderColor: '#6BC100', borderWidth: 2, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={styles.progressStyle}>{props.bfiUploadProgress}</Text>
                            </View>

                            <Text style={{ color: 'white' }}>{props.bfiProgressText}</Text>

                        </View>

                    </View>

                </View> : null}

            <View style={styles.mainViewStyle}>

                <View style={{ width: wp('80%'), marginTop: hp('10%'), marginBottom: hp('6%') }}>
                    <Text style={CommonStyles.headerTextStyle}>{'Please select one of the'}</Text>
                    <Text style={CommonStyles.headerTextStyle}>{'option to proceed'}</Text>
                </View>

                <TouchableOpacity onPress={() => { featureActions(1) }}>

                    <View style={[styles.tyleViewStyle]}>

                        <View style={{ width: wp('75%'), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flex: 3, height: hp('10%'), justifyContent: 'center', }}>
                                <View style={{ justifyContent: 'center', }}>
                                    <Text style={[styles.sliderTextStyle]}>{'Capture BFI Photos'}</Text>
                                    <Text style={[styles.subHeaderTextStyle]}>{'Get ready to snap that perfect pet pics! Ensure your furry friend is right in the frame and click away.'}</Text>
                                </View>

                            </View>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <RightArrowBtnImg style={[styles.questArrowImgStyle, { tintColor: 'black' }]}/>
                            </View>
                        </View>

                    </View>

                </TouchableOpacity>

                <TouchableOpacity onPress={() => { featureActions(2) }}>

                    <View style={[styles.tyleViewStyle, { marginTop: hp('2%') }]}>

                        <View style={{ width: wp('75%'), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flex: 3, height: hp('10%'), justifyContent: 'center', }}>
                                <View style={{ justifyContent: 'center', }}>
                                    <Text style={[styles.sliderTextStyle,]}>{'Score BFI'}</Text>
                                    <Text style={[styles.subHeaderTextStyle,]}>{Constant.BFISCORE_INST}</Text>
                                </View>

                            </View>

                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <RightArrowBtnImg style={[styles.questArrowImgStyle, { tintColor: 'black' }]}/>
                            </View>

                        </View>

                    </View>

                </TouchableOpacity>

            </View>

            {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={props.popUpAlert}
                    message={props.popUpMessage}
                    isLeftBtnEnable={props.isPopLeft}
                    isRightBtnEnable={true}
                    leftBtnTilte={'NO'}
                    rightBtnTilte={props.popUpRBtnTitle}
                    popUpRightBtnAction={() => popOkBtnAction()}
                    popUpLeftBtnAction={() => popOkCancelAction()}
                />
            </View> : null}

        </View>

    );
};

export default BFIUserDashboardUI;

const styles = StyleSheet.create({

    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white',
    },

    mainViewStyle: {
        height: hp('87%'),
        width: wp('100%'),
        // justifyContent:'center',
        alignItems: 'center',
    },

    tyleViewStyle: {
        height: hp('15%'),
        width: wp('80%'),
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#EAEAEA'
    },

    sliderTextStyle: {
        fontSize: Fonts.fontXMedium,
        ...CommonStyles.textStyleSemiBold,
        color: 'black',
    },

    subHeaderTextStyle: {
        fontSize: Fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: '#7F7F81',
        marginTop: hp('1%')
    },

    questArrowImgStyle: {
        height: hp("4%"),
        width: wp("8%"),
        resizeMode: "contain",
    },
    uploadSubTextStyle: {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleRegular,
        color: 'white',
    },

    progressStyle: {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleSemiBold,
        color: 'white',
    },

});