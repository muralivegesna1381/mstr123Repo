import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, ImageBackground, TouchableOpacity, BackHandler, FlatList,Platform } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';

import DogImg from "./../../../../assets/images/otherImages/svg/sobDogIcon.svg";
import CatImg from "./../../../../assets/images/otherImages/svg/catPet.svg";

let trace_inPetTypeScreen;

const PetTypeComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [petType, set_petType] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isLoading, set_isLoading] = useState(false);
    const [speciesId, set_speciesId] = useState(false);
    const [speciesArray, set_speciesArray] = useState([]);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [popupAlert, set_popupAlert] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let sJosnObj = useRef({});

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_petType);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_petType, "User in SOB Pet Specie type selection Screen", '');
            getSpecies();
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

    const initialSessionStart = async () => {
        trace_inPetTypeScreen = await perf().startTrace('t_inSOBPetTypeSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetTypeScreen.stop();
    };

    const getSOBDetails = async () => {
        let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson = JSON.parse(sJson);
        if (sJson) {
            sJosnObj.current = sJson;
            set_petName(sJson.petName);
            if (sJson.speciesId) {
                set_isBtnEnable(true);
                set_selectedIndex(sJson.speciesId === 1 ? 0 : 1);
                set_speciesId(sJson.speciesId);
                set_petType(sJson.speciesName);
            }
        }
    };

    const getSpecies = async () => {

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN)
        set_isLoading(true);
        isLoadingdRef.current = 1;

        let apiMethod = apiMethodManager.GET_PET_SPECIES;
        let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
                
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
                
            if(apiService.data.species) {
                set_speciesArray(apiService.data.species);
                getSOBDetails();
            } else {
                createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,1);
                firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Species_API, firebaseHelper.screen_SOB_petType, "SOB Getting Species Api fail", 'No data found'); 
            }
        
        } else if(apiService && apiService.isInternet === false) {

            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,1);
            firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Species_API, firebaseHelper.screen_SOB_petType, "SOB Getting Species Api fail", 'Internet : false'); 

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true,1);     
            firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Species_API, firebaseHelper.screen_SOB_petType, "SOB Getting Species Api fail", 'error : '+apiService.error.errorMsg); 
            
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_SOB_review_Species_API, firebaseHelper.screen_SOB_petType, "SOB Getting Species Api fail", 'Service Status : false'); 
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,1);

        }

    };

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const nextButtonAction = async () => {
        sJosnObj.current.speciesName = petType;
        sJosnObj.current.speciesId = speciesId;        
        firebaseHelper.logEvent(firebaseHelper.event_SOB_petType_submit, firebaseHelper.screen_SOB_petType, "User Selected Type of the pet : " + petType, 'Species Id : ' + speciesId);
        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));
        navigation.navigate('PetGenderComponent');
    };

    const backBtnAction = () => {
        navigation.navigate('PetNameComponent');
    };

    const selectGenderAction = async (index, item) => {
        if(sJosnObj.current && (item.speciesId !== sJosnObj.current.speciesId)) {
            sJosnObj.current.breedId = '';
            sJosnObj.current.breedName = '';
            await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sJosnObj.current));
        } 
        
        set_isBtnEnable(true);
        set_selectedIndex(index);
        set_petType(item.speciesName);
        set_speciesId(item.speciesId);

    };

    const createPopup = (title,msg,isPop,pId) => {
        set_popupAlert(title);
        set_popupMsg(msg);
        set_isPopUp(isPop);
        popIdRef.current = pId;
    };

    const popOkBtnAction = () => {
        createPopup('','',false,0);   
    };

    const renderItem = ({ item, index }) => {
        return (

            <TouchableOpacity onPress={() => selectGenderAction(index, item)}>
                <View style={selectedIndex === index ? [styles.activityBckView] : [styles.unActivityBckView]}>

                    <View style={styles.imgBckViewStyle}>
                        {item.speciesName === 'Canine' ? <DogImg width={Platform.isPad ? wp("4%") : wp("8%")} height={Platform.isPad ? hp("4%") : hp("8%")}/> : <CatImg width={Platform.isPad ? wp("4%") : wp("8%")} height={Platform.isPad ? hp("4%") : hp("8%")}/>}
                    </View>

                    <Text style={[styles.name]}>{item.speciesName === 'Canine' ? 'Dog' : "Cat"}</Text>
                </View>
            </TouchableOpacity>
        );
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

            <View style={{ width: wp('100%'), height: hp('70%'), alignItems: 'center' }}>

                <View style={{ width: wp('80%'), marginTop: hp('8%') }}>
                    <Text style={CommonStyles.headerTextStyle}>{'What kind of pet is '}</Text>
                    {petName ? <Text style={CommonStyles.headerTextStyle}>{petName + '?'}</Text> : null}

                </View>

                <View style={{ marginTop: hp('5%') }}>
                    <FlatList
                        data={speciesArray}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => "" + index}
                        numColumns={2}
                    />
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

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText={'Please wait..'} isButtonEnable={false} /> : null}
        </View>
    );
}

export default PetTypeComponent;

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

});