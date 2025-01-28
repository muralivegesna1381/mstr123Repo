import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, BackHandler,Platform } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

import YesTickImg from "./../../../../assets/images/otherImages/svg/yesTick.svg";
import NoTickImg from "./../../../../assets/images/otherImages/svg/noXImg.svg";

let trace_inPetNeturedScreen;

const PetNeuteredComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [isNeutered, set_isNeutered] = useState(undefined);
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [petName, set_petName] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    let sJosnObj = useRef({});
    
    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_petNeutered);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_petNeutered, "User in SOB Pet Neutered selection Screen", '');
            getSOBDetails();
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            focus();
            initialSessionStop();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    }, [navigation]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetNeturedScreen = await perf().startTrace('t_inSOBPetNeuteredScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetNeturedScreen.stop();
    };

    const getSOBDetails = async () => {

        let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson = JSON.parse(sJson);
        if (sJson) {
            sJosnObj.current = sJson;
            set_petName(sJson.petName);
            if (sJson.isNeutered) {
                set_isBtnEnable(true);
                set_selectedIndex(sJson.isNeutered === 'YES' ? 0 : 1);
                set_isNeutered(sJson.isNeutered);
            }
        }
    };

    const nextButtonAction = async () => {
        sJosnObj.current.isNeutered = isNeutered;
        firebaseHelper.logEvent(firebaseHelper.event_SOB_petNeutered_submit_btn, firebaseHelper.screen_SOB_petNeutered, "User selected Pet Neutered", 'Neutered : ' + isNeutered);
        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));
        navigation.navigate('PetBreedComponent');
    };

    const backBtnAction = () => {
        navigation.navigate('PetGenderComponent');
    };

    const selectIsNeuteredAction = (isNeut, index) => {
        set_isBtnEnable(true);
        set_selectedIndex(index);
        set_isNeutered(isNeut);
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
                    title={'Pet Profile'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ width: wp('100%'), height: hp('70%'), alignItems: 'center' }}>

                <View style={{ width: wp('80%'), marginTop: hp('8%') }}>
                    <Text style={CommonStyles.headerTextStyle}>{sJosnObj.current && sJosnObj.current.gender === 'Male' ? 'Is ' + petName + ' Neutered?' : 'Is ' + petName + ' Spayed?'}</Text>
                </View>

                <View style={{ flexDirection: 'row', marginTop: hp('8%') }}>

                    <TouchableOpacity onPress={() => selectIsNeuteredAction('YES', 0)}>
                        <View style={selectedIndex === 0 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <YesTickImg width={Platform.isPad ? wp("6%") : wp("8%")} />
                            </View>

                            <Text style={[styles.name]}>{'YES'}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => selectIsNeuteredAction('NO', 1)}>
                        <View style={selectedIndex === 1 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <NoTickImg width={Platform.isPad ? wp("6%") : wp("8%")}/>
                            </View>

                            <Text style={[styles.name]}>{'NO'}</Text>
                        </View>
                    </TouchableOpacity>

                </View>

            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'NEXT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable={true}
                    rigthBtnState={isBtnEnable}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}
                    leftButtonAction={async () => backBtnAction()}
                />
            </View>

        </View>
    );
}

export default PetNeuteredComponent;

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