import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity,Platform } from 'react-native';
import BottomComponent from "../../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../../utils/commonComponents/headerComponent';
import fonts from '../../../../utils/commonStyles/fonts'
import CommonStyles from '../../../../utils/commonStyles/commonStyles';

import VideoObsImg from "./../../../../../assets/images/otherImages/svg/videoIconObs.svg";
import PhotoObsImg from "./../../../../../assets/images/otherImages/svg/photoIconObs.svg";

const CategorySelectUI = ({ route, ...props }) => {

    const nextButtonAction = async () => {
       props.nextButtonAction();
    };

    const backBtnAction = () => {
        props.backBtnAction();
    };

    const selectCategory = (categoryType, index) => {
        props.selectCategory(categoryType, index);
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    }

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
            <View style={[CommonStyles.headerView, {}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Observations'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ width: wp('100%'), height: hp('70%'), alignItems: 'center' }}>

                <View style={{ width: wp('85%'), marginTop: hp('8%') }}>
                    <Text style={CommonStyles.headerTextStyle}>{'Please select one to proceed'}</Text>
                </View>

                <View style={{ flexDirection: 'row', marginTop: hp('8%'),width: wp('90%'),justifyContent: 'center'  }}>

                    <TouchableOpacity onPress={() => selectCategory('Photos', 0)}>
                        <View style={props.selectedIndex === 0 ? [styles.activityBckView] : [styles.unActivityBckView]}>
                            <PhotoObsImg width={ wp("8%")} height={Platform.isPad ? hp('7%') : hp('6%')} style={[styles.petImgStyle]}/>
                            <Text style={[styles.name]}>{'Photos'}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => selectCategory('Videos', 1)}>
                        <View style={props.selectedIndex === 1 ? [styles.activityBckView] : [styles.unActivityBckView]}>
                            <VideoObsImg width={ wp("8%")} height={Platform.isPad ? hp('7%') : hp('6%')} style={[styles.petImgStyle]}/>
                            <Text style={[styles.name]}>{'Videos'}</Text>
                        </View>
                    </TouchableOpacity>

                </View>

            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'NEXT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable={true}
                    rigthBtnState={props.isBtnEnable}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}
                    leftButtonAction={async () => backBtnAction()}
                />
            </View>

        </View>
    );
}

export default CategorySelectUI;

const styles = StyleSheet.create({

    activityBckView: {
        width: wp('35%'),
        height: hp('15%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#96B2C9',
        marginBottom: hp("2%"),
        marginRight: hp("1%"),
        marginLeft: hp("1%"),
        borderRadius: 5,
        backgroundColor: '#F6FAFD'
    },

    unActivityBckView: {
        width: wp('35%'),
        height: hp('15%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        marginBottom: hp("2%"),
        marginRight: hp("1%"),
        marginLeft: hp("1%"),
        borderRadius: 5,
        backgroundColor: 'white'
    },

    name: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        textAlign: "center",
        color: 'black',
        marginTop: hp("1%"),
    },

    petImgStyle: {
        width: wp("10%"),
        aspectRatio: 1,
    },

    imgBckViewStyle: {
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 1,
        width: hp("6%"),
        height: hp("6%"),
        alignItems: 'center',
        justifyContent: 'center'
    },

});