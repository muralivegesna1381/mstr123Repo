import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback, ImageBackground, FlatList, TouchableOpacity, Image, BackHandler } from 'react-native';
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import fonts from './../../../utils/commonStyles/fonts'
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import * as DataStorageLocal from './../../../utils/storage/dataStorageLocal';
import * as Constant from "./../../../utils/constants/constant";
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import AlertComponent from './../../../utils/commonComponents/alertComponent';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';
import * as ServiceCalls from './../../../utils/getServicesData/getServicesData.js';

let trace_inPetFeedTimeScreen;
let trace_FeedingTime_API_Complete;
let tickImg = require("./../../../../assets/images/otherImages/svg/feedingTick.svg");
let notTickImg = require("./../../../../assets/images/otherImages/svg/feedingTickEmpty.svg");

const PetFeedingPreferencesComponentUI = ({ navigation, route, ...props }) => {

    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [timeArray, set_timeArray] = useState([]);
    const [popupAlert, set_popupAlert] = useState(undefined);
    const [selectedIndexArray, set_selectedIndexArray] = useState([]);
    const [isDetailsView, set_isDetailsView] = useState(false);
    const [date, set_Date] = useState(new Date());
    const [isParentAddress, set_isParentAddress] = useState(false);

    var selectedItems = useRef([]);
    var tempAnswersArray = useRef([]);
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let sJosnObj = useRef({});

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_petFeeding);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_petFeeding, "User in SOB Pet Feeding selection Screen", '');
            getPetFeedingTime();
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

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetFeedTimeScreen = await perf().startTrace('t_inSOBPetFeedTimeSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetFeedTimeScreen.stop();
    };

    const getSOBDetails = async () => {

        let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson = JSON.parse(sJson);
        let tempArray = []

        if(sJson) {
            sJosnObj.current = sJson;
            if (sJson.isPetParentAddress) {
                set_isParentAddress(true);
            }
    
            if (sJson.eatTimeArray.length) {
                for (let i = 0; i < sJson.eatTimeArray.length; i++) {
                    tempArray.push(sJson.eatTimeArray[i].feedingPreferenceId)
                    tempAnswersArray.current.push(sJson.eatTimeArray[i]);
                }
    
                selectedItems.current = tempArray;
                if (tempArray.length > 0) {
                    set_isNxtBtnEnable(true);
                } else {
                    set_isNxtBtnEnable(false);
                }
            }
        }
        
    };

    const getPetFeedingTime = async () => {

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

        if (token) {

            trace_FeedingTime_API_Complete = await perf().startTrace('t_getPetFeedingPreferences_API');
            set_isLoading(true);
            isLoadingdRef.current = 1;

            let getPetFeedServiceObj = await ServiceCalls.getPetFeedingPreferences(token);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            stopFBTrace();
            
            if(getPetFeedServiceObj && getPetFeedServiceObj.logoutData){
                firebaseHelper.logEvent(firebaseHelper.event_SOB_petFeeding_api_fail, firebaseHelper.screen_SOB_petFeeding, "Gettind Feeding preferences from backend Api Fail", 'Unautherised');
                AuthoriseCheck.authoriseCheck();
                navigation.navigate('WelcomeComponent');
                return;
            }
                
            if(getPetFeedServiceObj && !getPetFeedServiceObj.isInternet){
                createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
                firebaseHelper.logEvent(firebaseHelper.event_SOB_petFeeding_api_fail, firebaseHelper.screen_SOB_petFeeding, "Gettind Feeding preferences from backend Api Fail", 'Internet : false');
                return;
            }
          
            if(getPetFeedServiceObj && getPetFeedServiceObj.statusData){

                if(getPetFeedServiceObj.responseData) {
                    set_timeArray(getPetFeedServiceObj.responseData);
                    getSOBDetails();
                } else {
                    firebaseHelper.logEvent(firebaseHelper.event_SOB_petFeeding_api_fail, firebaseHelper.screen_SOB_petFeeding, "Gettind Feeding preferences from backend Api Succes", 'No data recieved');
                    createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
                }
                               
            } else {

                firebaseHelper.logEvent(firebaseHelper.event_SOB_petFeeding_api_fail, firebaseHelper.screen_SOB_petFeeding, "Gettind Feeding preferences from backend Api Fail", 'Service Status : false');
                createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
                
            }
          
            if(getPetFeedServiceObj && getPetFeedServiceObj.error) {
                createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true); 
                let errors = getPetFeedServiceObj.error.length > 0 ? getPetFeedServiceObj.error[0].code : '';
                firebaseHelper.logEvent(firebaseHelper.event_SOB_petFeeding_api_fail, firebaseHelper.screen_SOB_petFeeding, "Gettind Feeding preferences from backend Api Fail", 'error : '+errors);
            }
        }
    };

    const stopFBTrace = async () => {
        await trace_FeedingTime_API_Complete.stop();
    };

    const nextButtonAction = async () => {

        sJosnObj.current.eatTimeArray = tempAnswersArray.current;
        sJosnObj.current.isSkip = sJosnObj.current && sJosnObj.current.petParentObj && sJosnObj.current.petParentObj.address && Object.keys(sJosnObj.current.petParentObj.address).length > 0 ? false : true;
        sJosnObj.current.isSameAddress = sJosnObj.current.isSkip ? 'notSame' : sJosnObj.current.isSameAddress;
        sJosnObj.current.isPetWithPetParent = 0;
        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));

        if(sJosnObj.current && !sJosnObj.current.isSkip) {
            navigation.navigate('PetLocationComponent',{isFrom : 'pLocation'}); 
        } else {
            navigation.navigate('PetAddressComponent',{isFrom : 'feedingPrefs'});
        }
        
    };

    const backBtnAction = () => {

        if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
            navigation.navigate('PetWeightComponent');
        }
    }

    const createPopup = (title,msg,isPop) => {
        set_popupAlert(title);
        set_popupMsg(msg);
        set_isPopUp(isPop);
        popIdRef.current = 1;
    };

    const popOkBtnAction = () => {

        if (popupAlert === 'EATING ENTHUSIASM') {
            navigation.navigate('DashBoardService');
        }

        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popupMsg(undefined);

    };

    const selectAlertAction = (index, item) => {
        set_isDetailsView(!isDetailsView);
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

            <View style={{ height: hp('70%'), width: wp('90%'), alignSelf: 'center' }}>

                <View style={{ marginTop: hp('5%'), minHeight: hp('5%') }}>
                    <Text style={[CommonStyles.headerTextStyle]}>{'How many times do you feed your pet ' + (sJosnObj.current && sJosnObj.current.speciesId === 2 ? 'cat' : 'dog') + ' food?'}</Text>
                </View>

                <View style={{ width: wp('90%'), minHeight: hp('60%'), alignItems: 'center' }}>

                    <FlatList
                        style={styles.flatcontainer}
                        data={timeArray}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (

                            <TouchableWithoutFeedback onPress={() => {

                                if (selectedItems.current.includes(item.feedingPreferenceId)) {

                                    selectedItems.current = selectedItems.current.filter(item1 => item1 !== item.feedingPreferenceId);
                                    var index = tempAnswersArray.current.findIndex(e => e.feedingPreferenceId === item.feedingPreferenceId);

                                    if (index != -1) {
                                        tempAnswersArray.current.splice(index, 1);
                                    } 

                                    index = tempAnswersArray.current.findIndex(e => e.feedingPreferenceId === 6);
                                    selectedItems.current = selectedItems.current.filter(item1 => item1 !== 6);
                                    if (index != -1) {
                                        tempAnswersArray.current.splice(index, 1);
                                    } 

                                } else {

                                    if (item.feedingPreferenceId === 6) {
                                        tempAnswersArray.current = [];
                                        selectedItems.current = [];
                                    } else {
                                        var index = tempAnswersArray.current.findIndex(e => e.feedingPreferenceId === 6);
                                        selectedItems.current = selectedItems.current.filter(item1 => item1 !== 6);
                                        if (index != -1) {
                                            tempAnswersArray.current.splice(index, 1);
                                        } 
                                    }
                                    tempAnswersArray.current.push(item);
                                    selectedItems.current.push(item.feedingPreferenceId);

                                }

                                tempAnswersArray.current = Array.from(new Set(tempAnswersArray.current));
                                set_selectedIndexArray(tempAnswersArray.current);

                                if (tempAnswersArray.current.length > 0) {
                                    set_isNxtBtnEnable(true);
                                } else {
                                    set_isNxtBtnEnable(false);
                                }

                            }}>

                                <View style={{ justifyContent: 'space-between', alignContent: 'center' }}>
                                    <View style={selectedItems.current.includes(item.feedingPreferenceId) ? [styles.activityBckView] : [styles.unActivityBckView]}>
                                        <View style={{ flexDirection: 'row', flex: 1, width: wp('38%'), justifyContent: 'center', alignItems: 'center' }}>

                                            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                                            </View>

                                            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                <ImageBackground source={selectedItems.current.includes(item.feedingPreferenceId) ? tickImg : notTickImg} style={[styles.petImgStyle, {}]} resizeMode='contain'></ImageBackground>
                                            </View>

                                            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                {item.feedingPreferenceId === 6 ? <View style={{ width: wp('10%'), height: hp('5%'), justifyContent: 'center', alignItems: 'center' }}>
                                                    <TouchableOpacity onPress={() => { selectAlertAction() }}>
                                                        <Image style={styles.detailsBtnStyle} source={require("./../../../../assets/images/scoreImages/eAlert.svg")}></Image>
                                                    </TouchableOpacity>
                                                </View> : null}
                                            </View>

                                        </View>
                                        <Text style={[styles.name]}>{item.feedingPreference}</Text>

                                    </View>
                                </View>
                            </TouchableWithoutFeedback>

                        )}
                        keyExtractor={(item) => item.feedingPreferenceId}
                        numColumns={2}
                    />

                </View>

            </View>

            {!isDetailsView ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'NEXT'}
                    isLeftBtnEnable={true}
                    isRightBtnEnable={true}
                    leftBtnTitle={'BACK'}
                    rigthBtnState={isNxtBtnEnable}
                    rightButtonAction={async () => nextButtonAction()}
                    leftButtonAction={async () => backBtnAction()}
                />
            </View> : null}

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={popupAlert}
                    message={popupMsg}
                    isLeftBtnEnable={false}
                    isRightBtnEnable={true}
                    leftBtnTilte={'NO'}
                    rightBtnTilte={"OKAY"}
                    popUpRightBtnAction={() => popOkBtnAction()}
                />
            </View> : null}

            {isDetailsView ? <View style={styles.popSearchViewStyle}>

                <View style={{ width: wp('85%'), height: hp('8%'), alignItems: 'flex-end', marginTop: hp('2%') }}>

                    <TouchableOpacity onPress={() => set_isDetailsView(false)}>
                        <Image style={styles.closeBtnStyle} source={require("./../../../../assets/images/otherImages/png/xImg.png")}></Image>
                    </TouchableOpacity>

                    <View style={{ width: wp('85%'), minHeight: hp('15%'), justifyContent: 'center', marginTop: hp('2%'), }}>
                        <Text style={styles.detailsTxtStyle}>{'Free fed / free feeding is the practice of leaving an unlimited amount of food in the bowl for your pet to graze on throughout the day.'}</Text>
                    </View>

                </View>

            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={false} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

        </View>
    );
}

export default PetFeedingPreferencesComponentUI;

const styles = StyleSheet.create({

    activityBckView: {
        width: wp('38%'),
        height: hp('15%'),
        alignItems: 'center',
        marginBottom: hp("1%"),
        margin: hp("0.5%"),
        borderWidth: 1,
        borderColor: '#96B2C9',
        borderRadius: 5,
        backgroundColor: "#F6FAFD",
        justifyContent: 'center',
    },

    unActivityBckView: {
        width: wp('38%'),
        height: hp('15%'),
        alignItems: 'center',
        marginBottom: hp("1%"),
        margin: hp("0.5%"),
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 5,
        justifyContent: 'center',
        backgroundColor: "white",
    },

    name: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        textAlign: "center",
        color: 'black',
        marginBottom: hp("1%"),
    },

    petImgStyle: {
        width: wp("8%"),
        aspectRatio: 1,
        resizeMode: 'contain'
    },

    flatcontainer: {
        width: wp('80%'),
        marginTop: hp("2%"),
        flex: 1,
    },

    headerTextStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontNormal,
        textAlign: "left",
        color: "black",
    },

    detailsBtnStyle: {
        width: wp('5%'),
        height: hp('5%'),
        resizeMode: 'contain',
    },

    popSearchViewStyle: {
        height: hp("30%"),
        width: wp("100%"),
        backgroundColor: '#2D36AA',
        bottom: 0,
        position: 'absolute',
        alignSelf: 'center',
        alignItems: "center",
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
    },

    detailsTxtStyle: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontNormal,
        color: "white",
        marginBottom: hp('1%'),
    },

    closeBtnStyle: {
        width: wp('4%'),
        height: hp('4%'),
        resizeMode: 'contain',
        tintColor: 'white'
    },

});