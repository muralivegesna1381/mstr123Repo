import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TextInput, Keyboard, FlatList, Image, BackHandler, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import TextInputComponent from '../../../utils/commonComponents/textInputComponent';
import * as DataStorageLocal from "../../../utils/storage/dataStorageLocal";
import * as Constant from "../../../utils/constants/constant";
import * as firebaseHelper from '../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import LoaderComponent from '../../../utils/commonComponents/loaderComponent';
import BuildEnv from './../../../config/environment/environmentConfig';
import fonts from '../../../utils/commonStyles/fonts'
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';

import RightArrowImg from "./../../../../assets/images/otherImages/svg/downArrowGrey.svg";
import SearchImg from "./../../../../assets/images/otherImages/svg/searchIcon.svg";
import DownArrowImg from "../../../../assets/images/otherImages/svg/downArrowGrey.svg";
let xImg = require('./../../../../assets/images/otherImages/png/xImg.png');

const Environment = JSON.parse(BuildEnv.Environment());

let trace_inPetNameScreen;

const PetFoodInfoComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [petFoodAmount, set_petFoodAmount] = useState(undefined);
    const [petFoodAmountUnits, set_petFoodAmountUnits] = useState('Cups');
    const [deviceNo, set_deviceNo] = useState(undefined);
    const [deviceType, set_deviceType] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isLoading, set_isLoading] = useState(false);
    const [petName, set_petName] = useState(undefined);

    const [petParentObj, set_petParentObj] = useState(undefined);
    const [isParentAddress, set_isParentAddress] = useState(false);
    const [petParentAddress, set_petParentAddress] = useState({});
    var totalRecordsData = useRef([]);
    const [isSearchView, set_isSearchView] = useState(false);
    const [searchText, set_searchText] = useState(undefined);
    const [dietArray, set_dietsArray] = useState(undefined);
    const [filterDietArray, set_filterDietArray] = useState(undefined);
    const [dietName, set_dietName] = useState(undefined);
    const [dietID, set_dietID] = useState(undefined);
    const [isDropdown, set_isDropdown] = useState(false);
    const [speciesId, set_speciesId] = useState('');

    let isLoadingdRef = useRef(0);
    let sJosnObj = useRef();
    let foodAmountRef = useRef(0)

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

    }, [route.params?.deviceNumber, route.params?.deviceType]);

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

            set_petFoodAmount(sJson1.foodIntake);
            foodAmountRef.current = sJson1.foodIntake;
            set_petName(sJson1.petName);
            set_dietName(sJson1.dietName);
            set_dietID(sJson1.brandId);
            set_petFoodAmountUnits(sJson1.dietAmountType === 1 ? 'Cups' : "Grams");
            set_speciesId(sJson1.speciesId);

            if (sJson1.dietName && sJson1.dietAmountType) {
                set_isBtnEnable(true)
            }


        } else {
            sJosnObj.current = {};
        }
    };

    const getPetParentAddress = async () => {

        set_isLoading(true);
        isLoadingdRef.current = 1;

        let apiMethodManage = apiMethodManager.GET_USER_PROFILE;
        let apiService = await apiRequest.getData(apiMethodManage,'',Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
            if(apiService.data.user && apiService.data.user.address) {
                set_petParentAddress(apiService.data.user.address);
                set_isParentAddress(true);
            }

        } else if(apiService && apiService.isInternet === false) {

            firebaseHelper.logEvent(firebaseHelper.event_SOB_petName_PPAddress_API, firebaseHelper.screen_SOB_petName, "Fetching Pet Parent Address in SOB Pet Name screen", 'Internet : false');

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            firebaseHelper.logEvent(firebaseHelper.event_SOB_petName_PPAddress_API, firebaseHelper.screen_SOB_petName, "Fetching Pet Parent Address in SOB Pet Name screen", 'error : ' + apiService.error.errorMsg);
        
        } else {

            firebaseHelper.logEvent(firebaseHelper.event_SOB_petName_PPAddress_API, firebaseHelper.screen_SOB_petName, "Fetching Pet Parent Address in SOB Pet Name screen", 'Service Status : false');

        }

    };

    const nextButtonAction = async () => {
        //Diet Units 1 - cup, 2 - grams
        sJosnObj.current.dietName = dietName;
        sJosnObj.current.brandId = dietID;
        sJosnObj.current.foodIntake = petFoodAmount;
        const units = petFoodAmountUnits === "Cups" ? 1 : 2
        sJosnObj.current.dietAmountType = units;
        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));
        //navigation.navigate('PetAgeComponent');
        if (sJosnObj.current && !sJosnObj.current.isSkip) {
            navigation.navigate('PetLocationComponent', { isFrom: 'pLocation' });
        } else {
            navigation.navigate('PetAddressComponent', { isFrom: 'feedingPrefs' });
        }
    };

    const backBtnAction = async () => {
        navigation.pop()
    };

    const validateFoodData = (foodAmount) => {
        if (parseFloat(foodAmountRef.current) > 0 && dietName) {
            set_isBtnEnable(true)
        } else {
            set_isBtnEnable(false)
        }
    };

    const onCancel = () => {
        Keyboard.dismiss();
        set_searchText(undefined);
        set_isSearchView(false);
        //set_filterBreedsArray(breedsArray);
    };

    const actionOnRow = (item) => {
        //Captures diet name and diet id after selecting the diet from the list/
        set_dietID(item.brandId)
        set_dietName(item.brandName)
        set_isSearchView(false)

        if (item.brandName && parseFloat(foodAmountRef.current) > 0) {
            set_isBtnEnable(true)
        }
    };
    const actionOnRowDietUnit = (item) => {
        //Captures diet name and diet id after selecting the diet from the list/
        if (item != "Cancel") {

            if(petFoodAmountUnits !== item) {
                set_petFoodAmount("");
                foodAmountRef.current = 0;
                set_isBtnEnable(false);
            }
            
            set_petFoodAmountUnits(item);
        }
        set_isDropdown(false);

        if (dietName && parseFloat(foodAmountRef.current) > 0) {
            set_isBtnEnable(true);
        } 
    };

    const searchFilterFunction = (text) => {
        set_searchText(text);
        const newData = dietArray.filter(function (item) {
            const itemData = item ? item.brandName.toUpperCase() : "".toUpperCase();
            const textData = text.toUpperCase();
            return itemData.indexOf(textData) > -1;
        });

        set_filterDietArray(newData);
    };

    const onCancelSearch = async () => {
        set_searchText(undefined);
        searchFilterFunction("");
        set_filterDietArray(dietArray);
        Keyboard.dismiss();
    };

    const getDietList = async () => {
        totalRecordsData.current = []
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        fetch(Environment.uri + "petBfi/getPetFoodBrands/" + speciesId, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
        }).then(response => response.json())
            .then(data => {
                if (data && data.response.petFoodBrands.length > 0) {
                    set_dietsArray(data.response.petFoodBrands)
                    set_filterDietArray(data.response.petFoodBrands)
                    set_isLoading(false);
                    set_isSearchView(true);
                } else {
                    set_isLoading(false);
                }
            })
            .catch(error => {});
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
                    <View style={{ height: hp('60%'), marginTop: hp('8%'), }}>

                        <View style={{ width: wp('80%'), height: hp('40%') }}>
                            <Text style={CommonStyles.headerTextStyle}>{'What is'}</Text>
                            <Text style={CommonStyles.headerTextStyle}>{petName + "'s" + ' primary food'}</Text>
                            <Text style={CommonStyles.headerTextStyle}>{'brand and amount per day'}</Text>

                            <View style={{ width: wp('80%'), marginTop: hp('5%'), alignItems: 'center' }}>
                                <TouchableOpacity style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: "#D8D8D8", borderRadius: hp("0.5%"), width: wp("80%"), }} onPress={() => { getDietList(); }}>
                                    <View>
                                        <View style={[styles.SectionStyle]}>
                                            <Text style={styles.placeTextStyle}>{"Select your pet's food brand"}</Text>
                                            {dietName ? <Text style={styles.breedTextStyle}>{dietName}</Text> : null}
                                        </View>
                                    </View>
                                    <View style={{ justifyContent: 'center' }}>
                                        <RightArrowImg style={styles.imageStyle}/>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={{ marginTop: hp('2%'), flexDirection: 'row', width: wp('80%') }} >
                                <View style={{ width: wp("50%") }}>
                                    <TextInputComponent
                                        inputText={petFoodAmount}
                                        labelText={'Amount per day'}
                                        isEditable={true}
                                        widthValue={wp('50%')}
                                        maxLengthVal={6}
                                        keyboardType={'numeric'}
                                        autoCapitalize={false}
                                        setValue={(text) => {
                                            if (text.includes(".")) {
                                                var weightSplit = text.split('.')
                                                var decimalValue = weightSplit[1]
                                                if (decimalValue.length > 2) {
                                                    decimalValue = weightSplit[1].substring(0, 2)
                                                }
                                                var finalValue = weightSplit[0] + "." + decimalValue
                                                foodAmountRef.current = finalValue
                                                set_petFoodAmount(finalValue)
                                                validateFoodData()
                                            } else {
                                                foodAmountRef.current = text
                                                set_petFoodAmount(text)
                                                validateFoodData()
                                            }
                                        }}
                                    />
                                </View>
                                <View style={{ width: wp("30%") }}>
                                    <TouchableOpacity style={styles.cBtnStyle} onPress={() => { set_isDropdown(!isDropdown) }}>
                                        <Text style={styles.cTextStyle}>{petFoodAmountUnits}</Text>
                                        <DownArrowImg style={styles.downArrowStyle}/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
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

            {isSearchView ? <View style={styles.popSearchViewStyle}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: wp('100%'), alignSelf:'center' }}>
                    <View style={styles.topView}>
                        <SearchImg width={wp('3%')} height={hp('3%')} style={styles.searchImageStyle}/>
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
                        {searchText && searchText.length > 0 ? <TouchableOpacity onPress={onCancelSearch} style={styles.topButtonView} >
                            <Text style={[styles.name, { color: "black", }]} > {"CLEAR"}</Text>
                        </TouchableOpacity> : null}
                    </View>
                    <TouchableOpacity onPress={onCancel} style={[styles.topButtonView, { marginLeft: wp('2%') }]} >
                        <Image source={xImg} style={styles.xImageStyle} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    style={styles.flatcontainer}
                    data={filterDietArray}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => actionOnRow(item)}>
                            <View style={styles.flatview}>
                                <Text numberOfLines={2} style={[styles.name]}>{item.brandName}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    enableEmptySections={true}
                    keyExtractor={(item) => item.brandName}
                />

            </View> : null}

            {isDropdown ? <View style={[styles.popSearchViewStyleAmount]}>
                <FlatList
                    style={styles.flatcontainer}
                    data={['Cups', 'Grams', 'Cancel']}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => actionOnRowDietUnit(item)}>
                            <View style={styles.flatviewDietUnits}>
                                <Text numberOfLines={2} style={[styles.name]}>{item}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    enableEmptySections={true}
                    keyExtractor={(item, index) => index}
                />

            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={false} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

        </View>
    );
}

export default PetFoodInfoComponent;

const styles = StyleSheet.create({

    SectionStyle: {
        justifyContent: "center",
        minHeight: hp("8%"),
        width: wp("70%"),
        borderRadius: hp("0.5%"),
        alignSelf: "center",
    },

    placeTextStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        marginLeft: hp("2%"),
        color: "#7F7F81",
    },

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
    },
    flatcontainer: {
        flex: 1,
    },
    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
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
    popSearchViewStyleAmount: {
        height: hp("25%"),
        width: wp("95%"),
        backgroundColor: '#DCDCDC',
        bottom: 0,
        position: 'absolute',
        alignSelf: 'center',
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,

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
    searchImageStyle: {
        height: hp("2%"),
        width: wp("2%"),
        flex: 0.2,
        resizeMode: 'contain',
        marginLeft: hp("2%"),
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
    topButtonView: {
        alignContent: "center",
        justifyContent: "center",
        height: hp("5%"),
        marginRight: hp("2%"),
    },
    xImageStyle: {
        width: wp("8%"),
        height: wp("8%"),
        resizeMode: "contain",
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

    flatviewDietUnits: {
        height: hp("8%"),
        marginBottom: hp("0.3%"),
        alignSelf: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width: wp('90%'),
        alignItems: 'center'
    },

    breedTextStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        marginLeft: hp("2%"),
        color: "black",
        marginBottom: hp("1%"),
        marginTop: hp("1%"),
    },
    cBtnStyle: {
        backgroundColor: '#EAEAEA',
        height: hp('8%'),
        width: wp('30%'),
        borderRadius: wp('1%'),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    cTextStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        color: '#000000',
    },
    downArrowStyle: {
        width: wp('4%'),
        height: hp('4%'),
        resizeMode: 'contain',
        tintColor: '#707070',
        marginLeft: wp('2%'),
    },

});