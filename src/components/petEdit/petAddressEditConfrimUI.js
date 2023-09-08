import React, { useState, useEffect, useRef } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,ImageBackground,Platform} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import Fonts from './../../utils/commonStyles/fonts'

const  PetAddressEditConfrimUI = ({route, ...props }) => {

    const [imagePathNew, set_imagePathNew] = useState(undefined);
    
    useEffect(() => {
        set_imagePathNew(props.imagePathNew);
    }, [props.imagePathNew]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const nextButtonAction = () => {
        props.nextButtonAction();
    };

    const selectAddressAction = (typeAddress, index) => {
        props.selectAddressAction(typeAddress, index);
    };

    return (

        <View style={[CommonStyles.mainComponentStyle]}>
            <View style={[CommonStyles.headerView, {}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Pet Address'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ width: wp('100%'), height: hp('70%'), alignItems: 'center' }}>

                <View style={{ width: wp('85%'), marginTop: hp('8%') }}>
                    <Text style={CommonStyles.headerTextStyle}>{"Is " + props.petName + "'s " + "address same as your address?"}</Text>
                </View>

                <View style={{ flexDirection: 'row', marginTop: hp('8%') }}>

                    <TouchableOpacity onPress={() => selectAddressAction('same', 0)}>
                        <View style={props.selectedIndex === 0 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../assets/images/otherImages/png/right.png")}
                                    style={Platform.isPad ? [styles.petImgStyle, {width: wp("6%")}] : [styles.petImgStyle]}
                                    resizeMode='contain'
                                >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'YES'}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => selectAddressAction('notSame', 1)}>
                        <View style={props.selectedIndex === 1 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../assets/images/otherImages/png/wrong.png")}
                                    style={Platform.isPad ? [styles.petImgStyle, {width: wp("6%")}] : [styles.petImgStyle]}
                                    resizeMode='contain'
                                >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'NO'}</Text>
                        </View>
                    </TouchableOpacity>

                </View>

                {props.petParentAddress ? <View style={{ flexDirection: 'row',marginTop: hp('2%') }}>
                        <View style={[styles.backViewStyle,{minHeight: hp('6%')}]}>
                            <Text style={styles.headerTextStyle}>{'Your Address : '}</Text>
                            <Text style={styles.subHeaderTextStyle}>{props.petParentAddress}</Text>
                        </View>
                        
                </View>: null}

                {props.petAddress || props.isPetWithParent ? <View style={{ flexDirection: 'row' }}>
                        <View style={[styles.backViewStyle,{minHeight: hp('6%')}]}>
                            <Text style={styles.headerTextStyle}>{'Pet Address : '}</Text>
                            <Text style={styles.subHeaderTextStyle}>{!props.petAddress && props.isPetWithParent ? 'Same as your Address' :props.petAddress}</Text>
                        </View>
                        
                </View> : null}
            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'NEXT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable={true}
                    rigthBtnState={props.isBtnEnable ? true : false}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}
                    leftButtonAction={async () => backBtnAction()}
                />
            </View>

        </View>
    );
  }
  
  export default PetAddressEditConfrimUI;

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
        width: wp("8%"),
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

    backViewStyle: {
        minHeight: hp('8%'),
        width: wp('80%'),
        marginBottom: wp('5%'),
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
        // minHeight: hp('4%'),
    },

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
        width: wp("8%"),
        aspectRatio: 1,
    },

  });