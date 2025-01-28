import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TextInput, Keyboard, TouchableOpacity, Image, FlatList, BackHandler } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';

import RightArrowImg from "./../../../../assets/images/otherImages/svg/downArrowGrey.svg";
import SearchImg from "./../../../../assets/images/otherImages/svg/searchIcon.svg";

let xImg = require('./../../../../assets/images/otherImages/png/xImg.png');

let trace_inPetBreedScreen;
let trace_PetBreed_API_Complete;

const PetBreedComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [isPopUp, set_isPopUp] = useState(false);
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [breedName, set_breedName] = useState(undefined);
    const [breedId, set_breedId] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [isSearchView, set_isSearchView] = useState(false);
    const [speciesId, set_speciesId] = useState('');
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [popupAlert, set_popupAlert] = useState(undefined);
    const [searchText, set_searchText] = useState(undefined);
    const [breedsArray, set_breedsArray] = useState(undefined);
    const [filterBreedsArray, set_filterBreedsArray] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let sJosnObj = useRef({});

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_petBreed);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_petBreed, "User in SOB Pet Breed selection Screen", '');
            getSOBDetails();
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
    }, [navigation]);

    useEffect(() => {

        if (route.params?.sobJson) {
            sJosnObj.current = route.params?.sobJson;
            set_petName(route.params?.sobJson.petName);
        }

    }, [route.params?.sobJson]);

    useEffect(() => {
        if (route.params?.breedItem) {
            set_breedName(route.params?.breedItem.breedName);
            set_breedId(route.params?.breedItem.breedId);
            set_isBtnEnable(true);
        }

    }, [route.params?.breedItem]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetBreedScreen = await perf().startTrace('t_inSOBPetBreedScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetBreedScreen.stop();
    };

    const getBreedDetailsNew = async (id) => {

        trace_PetBreed_API_Complete = await perf().startTrace('t_getPetBreeds_API');
        set_isLoading(true);
        isLoadingdRef.current = 1;

        let apiMethod = apiMethodManager.GET_PET_BREEDS + id;
        let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        stopFBTrace();
                
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
                
            if(apiService.data.petBreedList) {
                set_breedsArray(apiService.data.petBreedList);
                set_filterBreedsArray(apiService.data.petBreedList);
            } else {
                createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
                firebaseHelper.logEvent(firebaseHelper.event_SOB_petBreed_api_fail, firebaseHelper.screen_SOB_petBreed, "Gettind breeds from backend Api Fail", 'No data found');
            }
        
        } else if(apiService && apiService.isInternet === false) {

            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true);
            firebaseHelper.logEvent(firebaseHelper.event_SOB_petBreed_api_fail, firebaseHelper.screen_SOB_petBreed, "Gettind breeds from backend Api Fail", 'Internet : false');

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true);              
            firebaseHelper.logEvent(firebaseHelper.event_SOB_petBreed_api_fail, firebaseHelper.screen_SOB_petBreed, "Gettind breeds from backend Api Fail", 'error : '+apiService.error.errorMsg);
            
        } else {

            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true);
            firebaseHelper.logEvent(firebaseHelper.event_SOB_petBreed_api_fail, firebaseHelper.screen_SOB_petBreed, "Gettind breeds from backend Api Fail", 'Service Status : false');

        }
            
    };

    const stopFBTrace = async () => {
        await trace_PetBreed_API_Complete.stop();
    };

    const getSOBDetails = async () => {

        let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson = JSON.parse(sJson);
        if (sJson) {

            sJosnObj.current = sJson;
            set_petName(sJson.petName);
            if (sJson.breedName && sJson.breedId) {
                set_isBtnEnable(true);
                set_breedId(sJson.breedId);
                set_breedName(sJson.breedName);
            }

            set_speciesId(sJson.speciesId);
            if (sJson.speciesId) {
                firebaseHelper.logEvent(firebaseHelper.event_SOB_petBreed_api, firebaseHelper.screen_SOB_petBreed, "Gettind breeds from backend Api Initiated", 'Species Id : ' + sJson.speciesId);
                getBreedDetailsNew(sJson.speciesId);
            }

        }
    };

    const nextButtonAction = async () => {
        sJosnObj.current.breedId = breedId;
        sJosnObj.current.breedName = breedName;
        firebaseHelper.logEvent(firebaseHelper.event_SOB_petBreed_submit_btn, firebaseHelper.screen_SOB_petBreed, "User selected Pet Breed", 'Breed Id : ' + breedId);
        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));
        navigation.navigate('PetAgeComponent');
        //navigation.navigate('PetFoodInfoComponent');
    };

    const backBtnAction = () => {
        if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_SOB_petBreed, "User clicked on back button to navigate to PetNeuteredComponent", '');
            navigation.navigate('PetNeuteredComponent');
        }
    };

    const selectBreed = () => {
        set_isSearchView(!isSearchView);
    };

    const actionOnRow = (item) => {
        ///// Captures breed name and breed id after selecting the breed from the list ////
        set_breedId(item.breedId);
        set_breedName(item.breedName);
        Keyboard.dismiss();
        set_isSearchView(!isSearchView);
        set_searchText(undefined);
        set_filterBreedsArray(breedsArray);
        set_isBtnEnable(true);
    };

    const onCancelSearch = async () => {
        set_searchText(undefined);
        searchFilterFunction("");
        set_filterBreedsArray(breedsArray);
        Keyboard.dismiss();
    };

    const searchFilterFunction = (text) => {
        set_searchText(text);
        const newData = breedsArray.filter(function (item) {
            const itemData = item ? item.breedName.toUpperCase() : "".toUpperCase();
            const textData = text.toUpperCase();
            return itemData.indexOf(textData) > -1;
        });

        set_filterBreedsArray(newData);
    };

    const createPopup = (title,msg,isPop) => {
        set_popupAlert(title);
        set_popupMsg(msg);
        set_isPopUp(isPop);
        popIdRef.current = 1;
    };

    const popOkBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
    };

    const onCancel = () => {
        Keyboard.dismiss();
        set_searchText(undefined);
        set_isSearchView(false);
        set_filterBreedsArray(breedsArray);
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

            <View style={{ width: wp('80%'), height: hp('70%'), alignSelf: 'center', marginTop: hp('8%') }}>
                <Text style={CommonStyles.headerTextStyle}>{'What breed is ' + petName + '?'}</Text>
                <View style={{ width: wp('80%'), marginTop: hp('5%'), alignItems: 'center' }}>

                    <TouchableOpacity style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: "#D8D8D8", borderRadius: hp("0.5%"), width: wp("80%"), }} onPress={() => { selectBreed(); }}>

                        <View>
                            <View style={[styles.SectionStyle]}>
                                <Text style={styles.placeTextStyle}>{"Select your pet's breed*"}</Text>
                                {breedName ? <Text style={styles.breedTextStyle}>{breedName}</Text> : null}

                            </View>
                        </View>

                        <View style={{ justifyContent: 'center' }}>
                            <RightArrowImg width={wp('5%')} height={hp('5%')}/>
                        </View>

                    </TouchableOpacity>
                </View>
                
            </View>

            {!isSearchView ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'NEXT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable={true}
                    rigthBtnState={isBtnEnable}
                    isRightBtnEnable={true}
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
                    leftBtnTilte={'Cancel'}
                    rightBtnTilte={'OK'}
                    popUpRightBtnAction={() => popOkBtnAction()}
                />
            </View> : null}
            {isSearchView ? <View style={styles.popSearchViewStyle}>
                <View style={{flexDirection:'row',alignItems:'center',width:wp('90%'),}}>
                    <View style={styles.topView}>
                        <SearchImg width={wp('3%')} height={hp('3%')} style={styles.searchImageStyle} />
                        <TextInput
                            style={styles.textInputStyle}
                            onChangeText={(text) => searchFilterFunction(text)}
                            value={searchText}
                            underlineColorAndroid="transparent"
                            placeholder="Search here"
                            returnKeyLabel="Search"
                            returnKeyType="search"
                            onSubmitEditing={Keyboard.dismiss}
                        />
                        {searchText && searchText.length> 0 ? <TouchableOpacity onPress={onCancelSearch} style={styles.topButtonView} >
                            <Text style={[styles.name, { color: "black", }]} > {"CLEAR"}</Text>
                        </TouchableOpacity> : null}
                    </View>
                    <TouchableOpacity onPress={onCancel} style={[styles.topButtonView,{marginLeft:wp('2%')}]} >
                        <Image source={xImg} style={styles.xImageStyle} />
                    </TouchableOpacity>
                </View>
                
                <FlatList
                    style={styles.flatcontainer}
                    data={filterBreedsArray}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => actionOnRow(item)}>
                            <View style={styles.flatview}>
                                <Text numberOfLines={2} style={[styles.name]}>{item.breedName}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    enableEmptySections={true}
                    keyExtractor={(item) => item.breedName}
                />

            </View> : null}
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText={'Please wait..'} isButtonEnable={false} /> : null}
        </View>
    );
}

export default PetBreedComponent;

const styles = StyleSheet.create({

    SectionStyle: {
        justifyContent: "center",
        minHeight: hp("8%"),
        width: wp("70%"),
        borderRadius: hp("0.5%"),
        alignSelf: "center",
    },

    textInputStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontMedium1,
        flex: 2.5,
        marginLeft: hp("2%"),
        marginRight: hp("2%"),
        height: hp("5%"),
        color: "black",
    },

    xImageStyle: {
        width: wp("8%"),
        height: wp("8%"),
        resizeMode: "contain",
      },

    breedTextStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        marginLeft: hp("2%"),
        color: "black",
        marginBottom: hp("1%"),
        marginTop: hp("1%"),
    },

    placeTextStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        marginLeft: hp("2%"),
        color: "#7F7F81",
        marginTop: hp("1%"),
    },

    popSearchViewStyle: {
        height: hp("85%"),
        width: wp("100%"),
        backgroundColor: '#DCDCDC',
        bottom: 0,
        position: 'absolute',
        alignSelf: 'center',
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        alignItems: "center",
    },

    topView: {
        height: hp("5%"),
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: 'white',
        marginTop: hp("2%"),
        marginBottom: hp("2%"),
        width: wp("80%"),
        borderRadius: 10,
        justifyContent: 'space-between'
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
    },

    topButtonView: {
        alignContent: "center",
        justifyContent: "center",
        height: hp("5%"),
        marginRight: hp("2%"),
    },

    flatcontainer: {
        flex: 1,
    },

    flatview: {
        height: hp("8%"),
        marginBottom: hp("0.3%"),
        alignContent: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width: wp('90%'),
    },

    searchImageStyle: {
        height: hp("2%"),
        width: wp("2%"),
        flex: 0.2,
        resizeMode: 'contain',
        marginLeft: hp("2%"),
    }

});