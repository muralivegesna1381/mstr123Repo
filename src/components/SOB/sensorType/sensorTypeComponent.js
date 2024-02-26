import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground,Platform } from 'react-native';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let arrowIcon = require('./../../../../assets/images/dashBoardImages/svg/right-arrow.svg')
let trace_inSensorTypeScreen;

const SensorTypeComponent = ({ navigation, route, ...props }) => {

    const [sensorType, set_sensorType] = useState(undefined);
    const [isActionSelected, set_isActionSelected] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [deviceActionType, set_deviceActionType] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [petName, set_petName] = useState('');
    const [isFromType, set_isFromType] = useState(undefined);
    let sJosnObj = useRef({});

    useEffect(() => {

        if (route.params?.value) {
            set_isFromType(route.params?.value);
        }

        if (route.params?.petName) {
            set_petName(route.params?.petName);
        }

    }, [route.params?.value,route.params?.petName]);

    React.useEffect(() => {

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_sensorType);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_sensorType, "User in SOB Sensor type selection Screen", '');
            getSOBDetails();
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            focus();
            unsubscribe();
            initialSessionStop();
        };

    }, []);

    const initialSessionStart = async () => {
        trace_inSensorTypeScreen = await perf().startTrace('t_inSOBSensorTypeSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inSensorTypeScreen.stop();
    };

    const getSOBDetails = async () => {

        let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson = JSON.parse(sJson);
        if (sJson) {
            sJosnObj.current = sJson;
            set_petName(sJson.petName)
            if (sJson.deviceType) {

                set_isActionSelected(true);
                set_deviceActionType(sJson.deviceType);
                set_sensorType(sJson.deviceType);
                set_selectedIndex(sJson.deviceType === 'CMAS' ? 1 : (sJson.deviceType === 'HPN1' ? 2 : 0));

            }
        }
    };

    const nextButtonAction = async () => {

        if (isFromType === 'AddDevice' || isFromType === 'Devices') {
            await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
            navigation.navigate('DeviceValidationComponent', { value: isFromType, sensorType: sensorType });
        } else {

            if(sJosnObj.current.deviceType !== sensorType) {
                sJosnObj.current.deviceNo = ''
            }
            sJosnObj.current.deviceType = sensorType;
            await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));
            firebaseHelper.logEvent(firebaseHelper.event_SOB_sensorType_submit, firebaseHelper.screen_SOB_sensorType, "User selected the Sensor Type", 'Device Type : ' + sensorType);
            navigation.navigate('DeviceValidationComponent');
        }

    };

    const backBtnAction = () => {

        navigation.pop();
        // if (isFromType === 'AddDevice') {
        //     navigation.navigate('DashBoardService');
        // } else if (isFromType === 'Devices') {
        //     navigation.navigate('MultipleDevicesComponent');
        // } else {
        //     navigation.navigate('PetAddressComponent');
        // }

    };

    const selectSensorAction = (sType, index) => {
        set_selectedIndex(index);
        set_isActionSelected(true);
        set_sensorType(sType);
    };

    const withoutSensorAction = async () => {
        sJosnObj.current.isWithourDevice = true;
        sJosnObj.current.deviceNo = ''
        sJosnObj.current.deviceType = '';
        set_selectedIndex(undefined)
        set_isActionSelected(false);
        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));
        navigation.navigate('PetReviewComponent');
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
                    title={'Pet Profile'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ height: hp('70%'), alignItems:'center'}}>

                <View style={{ width: wp('80%'), marginTop: hp('8%') }}>
                    <Text style={CommonStyles.headerTextStyle}>{'Please select the sensor type ' + petName + " will be wearing:"}</Text>
                </View>

                <View style={{ height: hp('70%'),marginTop: hp('3%')}}>

                    <View style={{ flexDirection: 'row', height: hp('15%')}}>

                        <TouchableOpacity onPress={() => selectSensorAction('AGL2', 0)}>
                            <View style={selectedIndex === 0 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                                <View style={styles.imgBckViewStyle}>
                                    <ImageBackground
                                        source={require("./../../../../assets/images/sensorImages/svg/sensorTypeLogo.svg")}
                                        style={Platform.isPad ? [styles.petImgStyle, {width: wp("7%"),}] : [styles.petImgStyle]}
                                        resizeMode='contain'
                                    >
                                    </ImageBackground>
                                </View>

                                <Text style={[styles.name]}>{'AGL 2'}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => selectSensorAction('CMAS', 1)}>
                            <View style={selectedIndex === 1 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                                <View style={styles.imgBckViewStyle}>
                                    <ImageBackground
                                        source={require("./../../../../assets/images/sensorImages/svg/sensorTypeLogo.svg")}
                                        style={Platform.isPad ? [styles.petImgStyle, {width: wp("7%"),}] : [styles.petImgStyle]}
                                        resizeMode='contain'
                                    >
                                    </ImageBackground>
                                </View>

                                <Text style={[styles.name]}>{'CMAS'}</Text>
                            </View>
                        </TouchableOpacity>

                    </View>

                    <View style={{ width: wp('35%'),height: hp('15%'),marginTop: hp('3%')  }}>
                        <TouchableOpacity onPress={() => selectSensorAction('HPN1', 2)}>
                            <View style={selectedIndex === 2 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                                <View style={styles.imgBckViewStyle}>
                                    <ImageBackground
                                        source={require("./../../../../assets/images/sensorImages/svg/sensorIcon.svg")}
                                        style={[styles.petImgStyle, { width: Platform.isPad ? wp("9%") : wp("15%") }]}
                                        resizeMode='contain'
                                    >
                                    </ImageBackground>
                                </View>

                                <Text style={[styles.name]}>{'HPN1'}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                </View>

            </View>

            {isFromType === 'AddDevice' ? null : <View style={{ alignSelf: 'center', justifyContent: 'space-between',}}>
                <View style={{ height: hp('5%'), bottom:15}}>
                    <TouchableOpacity style = {{flexDirection:'row',justifyContent:'center', alignItems:'center'}} onPress={() => withoutSensorAction()}>
                        <Text style={[styles.withOutDevTextStyle]}>{'Continue without sensor'}</Text>
                        <ImageBackground source={arrowIcon} style={[styles.arrowImgStyle, {}]} resizeMode='contain'></ImageBackground>
                    </TouchableOpacity>
                </View>
            </View>}

            

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'NEXT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable={true}
                    rigthBtnState={isActionSelected}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}
                    leftButtonAction={async () => backBtnAction()}
                />
            </View>

        </View>
    );
}

export default SensorTypeComponent;

const styles = StyleSheet.create({

    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white'
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

    withOutDevTextStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        textAlign: "center",
        color: '#6BC100',
        // marginTop: hp("1%"),
    },

    petImgStyle: {
        width: wp("8%"),
        aspectRatio: 1,
        resizeMode: 'contain'
    },

    arrowImgStyle: {
        width: wp("6%"),
        aspectRatio: 1,
        resizeMode: 'contain',
        marginLeft: hp("1%"),
    },

    imgBckViewStyle: {
        borderRadius: 5,
        borderColor: '#5C6D80',
        borderWidth: 1,
        width: hp("6%"),
        height: hp("6%"),
        alignItems: 'center',
        justifyContent: 'center'
    },

});