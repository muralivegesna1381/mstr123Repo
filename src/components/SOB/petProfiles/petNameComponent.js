import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Image, BackHandler } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import TextInputComponent from './../../../utils/commonComponents/textInputComponent';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../../utils/getServicesData/getServicesData.js';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';

let trace_inPetNameScreen;

const PetNameComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [petFirstName, set_petFirstName] = useState(undefined);
    const [petLastName, set_petLastName] = useState(undefined);
    const [deviceNo, set_deviceNo] = useState(undefined);
    const [deviceType, set_deviceType] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isLoading, set_isLoading] = useState(false);
    const [isfromPetBFIOnBoarding, set_isfromPetBFIOnBoarding] = useState(false);
    const [isFrom, set_isFrom] = useState(undefined)


    const [petParentObj, set_petParentObj] = useState(undefined);
    const [isParentAddress, set_isParentAddress] = useState(false);
    const [petParentAddress, set_petParentAddress] = useState({});

    let isLoadingdRef = useRef(0);
    let sJosnObj = useRef();

    React.useEffect(() => {

        getPetParentAddress();

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            getSOBDetails();
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_petName);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_petName, "User in SOB Pet Name selection Screen", '');
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

    }, []);

    useEffect(() => {

        if (route.params?.deviceNumber) {
            set_deviceNo(route.params?.deviceNumber);
        }

        if (route.params?.deviceType) {
            set_deviceType(route.params?.deviceType);
        }

        if (route.params?.isFrom) {
            set_isFrom(route.params?.isFrom);
        }

    }, [route.params?.deviceNumber, route.params?.deviceType, route.params?.isFrom]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetNameScreen = await perf().startTrace('t_inSOBPetNameScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetNameScreen.stop();
    };

    const getSOBDetails = async () => {
        let sJson1 = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson1 = JSON.parse(sJson1);
        if (sJson1) {
            sJosnObj.current = sJson1;
        } else {
            sJosnObj.current = {};
        }

        //get type of onboarding
        let type = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_PET_BFI);
        if (type === Constant.IS_FROM_PET_BFI) {
            set_isfromPetBFIOnBoarding(true)
        } else {
            set_isfromPetBFIOnBoarding(false)
        }


    };

    const getPetParentAddress = async () => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

        let json = {
            ClientID: "" + clientIdTemp,
        };

        let userDetailsServiceObj = await ServiceCalls.getClientInfo(json, token);
        set_isLoading(false);
        isLoadingdRef.current = 0;

        if (userDetailsServiceObj && userDetailsServiceObj.logoutData) {
            firebaseHelper.logEvent(firebaseHelper.event_SOB_petName_PPAddress_API, firebaseHelper.screen_SOB_petName, "Fetching Pet Parent Address in SOB Pet Name screen", 'Unautherised');
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }

        if (userDetailsServiceObj && !userDetailsServiceObj.isInternet) {
            firebaseHelper.logEvent(firebaseHelper.event_SOB_petName_PPAddress_API, firebaseHelper.screen_SOB_petName, "Fetching Pet Parent Address in SOB Pet Name screen", 'Internet : false');
            return;
        }

        if (userDetailsServiceObj && userDetailsServiceObj.statusData) {

            if (userDetailsServiceObj.responseData) {
                set_petParentObj(userDetailsServiceObj.responseData);
                if(userDetailsServiceObj.responseData.address && Object.keys(userDetailsServiceObj.responseData.address).length !== 0) {
                    set_petParentAddress(userDetailsServiceObj.responseData.address);
                    set_isParentAddress(true);
                }
            } else {
                firebaseHelper.logEvent(firebaseHelper.event_SOB_petName_PPAddress_API, firebaseHelper.screen_SOB_petName, "Fetching Pet Parent Address in SOB Pet Name screen", 'No data found');
            }

        } else {
            firebaseHelper.logEvent(firebaseHelper.event_SOB_petName_PPAddress_API, firebaseHelper.screen_SOB_petName, "Fetching Pet Parent Address in SOB Pet Name screen", 'Service Status : false');
        }

        if (userDetailsServiceObj && userDetailsServiceObj.error) {
            let errors = userDetailsServiceObj.error.length > 0 ? userDetailsServiceObj.error[0].code : '';
            firebaseHelper.logEvent(firebaseHelper.event_SOB_petName_PPAddress_API, firebaseHelper.screen_SOB_petName, "Fetching Pet Parent Address in SOB Pet Name screen", 'error : ' + errors);
        }
    };

    const nextButtonAction = async () => {

        let last = petLastName ? ' ' + petLastName : '';
        sJosnObj.current.petName = petFirstName + last;
        sJosnObj.current.petParentObj = petParentObj;
        sJosnObj.current.isPetParentAddress = isParentAddress;
        sJosnObj.current.isPetWithPetParent = sJosnObj.current ? sJosnObj.current.isPetWithPetParent : 0;
        sJosnObj.current.isSkip = sJosnObj.current ? sJosnObj.current.isSkip : !isParentAddress;
        firebaseHelper.logEvent(firebaseHelper.event_SOB_petName_submit_btn, firebaseHelper.screen_SOB_petName, "User entered the Pet name", 'PetName : ' + petFirstName + last);

        //Skip Dog/Cat Selection. for pet BFI right now we are going with only dog
        let type = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_PET_BFI);
        if (type === Constant.IS_FROM_PET_BFI) {
            sJosnObj.current.speciesName = "Canine";
            sJosnObj.current.speciesId = "1";
            await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));
            navigation.navigate('PetGenderComponent');
        } else {
            await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));
            navigation.navigate('PetTypeComponent');
        }


    };

    const backBtnAction = async () => {
        await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
        navigation.pop()
        // if(isFrom === 'Dashboard') {
        //     navigation.navigate('DashBoardService');
        // } else {
        //     navigation.navigate('MenuComponent');
        // }
        
    };

    const validatePetName = (pFName, pLName) => {
        set_petFirstName(pFName);
        set_petLastName(pLName);
        if (pFName && pFName.length > 0) {
            set_isBtnEnable(true);
        } else {
            set_isBtnEnable(false);
        }
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
                    title={'Pet Profile'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ width: wp('100%'), height: hp('70%'), justifyContent: 'center', alignItems: 'center' }}>
                <KeyboardAwareScrollView bounces={true} showsVerticalScrollIndicator={false} enableOnAndroid={true} scrollEnabled={true} scrollToOverflowEnabled={true} enableAutomaticScroll={true}>
                    <View style={{ height: hp('80%'), marginTop: hp('8%'), }}>

                        <View style={{ width: wp('80%'), height: hp('40%') }}>
                            <Text style={CommonStyles.headerTextStyle}>{'Lets get to know'}</Text>
                            <Text style={CommonStyles.headerTextStyle}>{'your pet'}</Text>

                            <View style={{ marginTop: hp('4%') }} >

                                <TextInputComponent
                                    inputText={petFirstName}
                                    labelText={'Pet First Name*'}
                                    isEditable={true}
                                    maxLengthVal={20}
                                    autoCapitalize={'none'}
                                    setValue={(textAnswer) => {
                                        validatePetName(textAnswer, petLastName)
                                    }}
                                />

                            </View>

                            <View style={{ marginTop: hp('2%') }} >

                                <TextInputComponent
                                    inputText={petLastName}
                                    labelText={'Pet Last Name'}
                                    isEditable={true}
                                    maxLengthVal={20}
                                    autoCapitalize={'none'}
                                    setValue={(textAnswer) => {
                                        validatePetName(petFirstName, textAnswer)
                                    }}
                                />

                            </View>

                        </View>

                        {!isfromPetBFIOnBoarding ?
                            <View style={{ height: hp('20%'), width: wp('80%'), alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                                <Image style={styles.dogImgStyels} source={require("./../../../../assets/images/dogImages/dogImg7.svg")} />
                                <Image style={styles.catStyels} source={require("./../../../../assets/images/dogImages/cat.svg")} />
                            </View> :

                            <View style={{ height: hp('15%'), width: wp('80%'), alignItems: 'center', justifyContent: 'center' }}>
                                <Image style={styles.dogImgStyels} source={require("./../../../../assets/images/dogImages/dogImg7.svg")} />
                                <Text style={CommonStyles.noRecordsTextStyle1}>{"Note: Pet BFI is your go-to feature! But hey, cat lovers, hold your paws – this ones not for your feline friends"}</Text>
                            </View>
                        }

                    </View>

                </KeyboardAwareScrollView>
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

            {isLoading === true ? <LoaderComponent isLoader={false} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

        </View>
    );
}

export default PetNameComponent;

const styles = StyleSheet.create({

    dogImgStyels: {
        width: hp("15%"),
        height: hp('20%'),
        resizeMode: "contain",
        overflow: "hidden",
    },

    catStyels: {
        width: hp("20%"),
        height: hp('20%'),
        resizeMode: "contain",
        overflow: "hidden",
        marginTop: hp('5%'),
    }

});