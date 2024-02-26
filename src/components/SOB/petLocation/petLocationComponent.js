import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ImageBackground, TouchableOpacity, BackHandler,Platform } from 'react-native';
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
import Fonts from './../../../utils/commonStyles/fonts'

let trace_inPetLocation_Selection_Screen;

const PetLocationComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [pAddress, set_pAddress] = useState(undefined);
    const [pAddressObj, set_pAddressObj] = useState(undefined);
    const [editPetParent, set_editPetParent] = useState(undefined);

    let addressType = useRef(0);
    let sJosnObj = useRef({});

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_petLocation_selection_screen);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_petLocation_selection_screen, "User in SOB Pet Location selection Screen", '');
            if (route.params?.isFrom) {
                set_isFromScreen(route.params?.isFrom);
                prepareLocationDetails(route.params?.isFrom, route.params?.petObject);
            }
            
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            focus();
            unsubscribe();
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, [route.params?.isFrom, route.params?.petObject]);

    const prepareLocationDetails = (isNavi,petObject) => {

        if(isNavi === 'petEdit') {
            getPetEditDetails(petObject);
        } else {
            getSOBDetails();
        }
        
    };

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetLocation_Selection_Screen = await perf().startTrace('t_inSOBPetLocationSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetLocation_Selection_Screen.stop();
    };

    const getSOBDetails = async () => {

        let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson = JSON.parse(sJson);
        if (sJson) {

            sJosnObj.current = sJson;
            set_petName(sJson.petName);
            set_pAddressObj(sJson.petParentObj);

            if(sJson.petParentObj && sJson.petParentObj.address && Object.keys(sJson.petParentObj.address).length !== 0 ) {

                let tempLine2 = sJson.petParentObj.address.address2 && sJson.petParentObj.address.address2 !== '' ? sJson.petParentObj.address.address2 + ', ' : '';
                let address = sJson.petParentObj.address.address1 + ', ' 
                + tempLine2
                + sJson.petParentObj.address.city + ', ' 
                + sJson.petParentObj.address.state+ ', '
                + sJson.petParentObj.address.country+ ', '
                + sJson.petParentObj.address.zipCode;

                set_pAddress(address);
            }
            if (sJson.isSameAddress) {
                set_isBtnEnable(true);
                set_selectedIndex(sJson.isSameAddress === 'same' ? 0 : (sJson.isSameAddress === 'notSame' ? 1 : 3));
                addressType.current = sJson.isSameAddress;
            }
        }
    };

    const getPetEditDetails = async (petObject) => {

        let pParentObj = await DataStorageLocal.getDataFromAsync(Constant.PET_PARENT_OBJ);
        pParentObj = JSON.parse(pParentObj);
        if(petObject) {
            set_petName(petObject.petName);
        }
        
        if(pParentObj && Object.keys(pParentObj.address).length !== 0) {

            let address = '';
            if(pParentObj.address.address2 && pParentObj.address.address2 !== '') {
                address = pParentObj.address.address1 + ', ' 
                + pParentObj.address.city + ', ' 
                + pParentObj.address.state+ ', '
                + pParentObj.address.country+ ', '
                + pParentObj.address.zipCode;
            } else {
                address = pParentObj.address.address1 + ', ' 
                + pParentObj.address.address2 + ', '
                + pParentObj.address.city + ', ' 
                + pParentObj.address.state+ ', '
                + pParentObj.address.country+ ', '
                + pParentObj.address.zipCode;
            }

            set_pAddress(address);
        }
        set_editPetParent(pParentObj);
    };

    const nextButtonAction = async () => {
        prepareDetails(pAddressObj);
    };

    const prepareDetails = async (adressObj) => {

        let ppAddress = {}
        if(addressType.current === 'same') {
            ppAddress = sJosnObj.current.petParentObj.address;
        } else {
            ppAddress = sJosnObj.current.petLocationNew;
        }
        firebaseHelper.logEvent(firebaseHelper.event_SOB_PLocation_Selection_btn, firebaseHelper.screen_SOB_petLocation_selection_screen, "User in SOB Pet Location selection Screen", 'isPetWithPetParent : ' + addressType.current);
        await updateJsonObj(ppAddress);
 
    };

    const updateJsonObj = async (pLocValue) => {
        sJosnObj.current.isSkip = false;
        sJosnObj.current.petLocation = pLocValue;
        sJosnObj.current.petLocationNew = sJosnObj.current.petLocationNew;
        sJosnObj.current.isSameAddress = addressType.current;
        sJosnObj.current.isPetParentAddress = addressType.current === 'same' ? true : false;
        sJosnObj.current.isPetWithPetParent = addressType.current === 'same' ? 1 : 0;
        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));
        navigation.navigate('PetAddressComponent',{isFrom:'pLocation'});
    }

    const backBtnAction = () => {

        if(isFromScreen === 'petEdit'){
            navigation.navigate('PetEditComponent');
        } else {
            navigation.pop()
        }
        
    };

    const selectAddressAction = (typeAddress, index) => {
        set_isBtnEnable(true);
        set_selectedIndex(index);
        addressType.current = typeAddress;
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
                    title={'Pet Address'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ width: wp('100%'), height: hp('70%'), alignItems: 'center' }}>

                <View style={{ width: wp('80%'), marginTop: hp('8%') }}>
                    <Text style={CommonStyles.headerTextStyle}>{"Is " + petName + "'s " + "address same as your address?"}</Text>

                </View>

                <View style={{ flexDirection: 'row', marginTop: hp('8%') }}>

                    <TouchableOpacity onPress={() => selectAddressAction('same', 0)}>
                        <View style={selectedIndex === 0 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../../assets/images/otherImages/png/right.png")}
                                    style={Platform.isPad ? [styles.petImgStyle, {width: wp("6%")}] : [styles.petImgStyle]}
                                    resizeMode='contain'
                                >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'YES'}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => selectAddressAction('notSame', 1)}>
                        <View style={selectedIndex === 1 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../../assets/images/otherImages/png/wrong.png")}
                                    style={Platform.isPad ? [styles.petImgStyle, {width: wp("6%")}] : [styles.petImgStyle]}
                                    resizeMode='contain'
                                >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'NO'}</Text>
                        </View>
                    </TouchableOpacity>

                </View>

                {pAddress ? <View style={{ flexDirection: 'row',marginTop: hp('2%')  }}>
                        <View style={[styles.backViewStyle,{minHeight: hp('6%')}]}>
                            <Text style={styles.headerTextStyle}>{"Your Address : "}</Text>
                            <Text style={styles.subHeaderTextStyle}>{pAddress}</Text>
                        </View>
                        
                    </View> : null}

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

export default PetLocationComponent;

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
    },

});