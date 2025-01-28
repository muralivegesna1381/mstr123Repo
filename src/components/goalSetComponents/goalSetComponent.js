import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,BackHandler,TouchableOpacity} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import GoalSetSliderComponent from "./../goalSetComponents/goalSetSliderComponent"
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';

import EyeImg from "./../../../assets/images/bfiGuide/svg/eye-instructions.svg"

const POP_SUCCESS = 1;
let trace_goalSet_Screen;

const  GoalSetComponent = ({navigation,route, ...props }) => {
   
    const [timeValue, set_timeValue] = useState('');
    const [actualTimeValue, set_actualTimeValue] = useState(undefined);
    const [showTimeValue, set_showTimeValue] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(Constant.DASHBOARD_LOADING_MSG);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [popUpRBtnTitle, set_popUpRBtnTitle] = useState(undefined);
    const [petObject, set_petObject] = useState();
    const [popId, set_popId] = useState(0);

    //setting firebase helper
    useEffect(() => {
        
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_Goal_Set);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_Goal_Set, "User in Goal Set Screen", '');
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
         return () => {
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };

    } , []);

    // setting the feedback item to view
    useEffect(() => {

        if(route.params?.goalSetValue) {
            set_actualTimeValue(route.params?.goalSetValue);
            if(route.params?.goalSetValue > 60) {
                let temp = convertMinsToTime(route.params?.goalSetValue/60);
                set_showTimeValue(temp)
                set_timeValue(route.params?.goalSetValue/60);
            } else {
                set_showTimeValue(parseInt(route.params?.goalSetValue )> 0 ? route.params?.goalSetValue : 30)
                set_timeValue(route.params?.goalSetValue);
            } 
        }

        if(route.params?.petObject) {
            set_petObject(route.params?.petObject);
        }
        
    }, [route.params?.goalSetValue,route.params?.petObject]);

    const initialSessionStart = async () => {
        trace_goalSet_Screen = await perf().startTrace('t_inGoalSetScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_goalSet_Screen.stop();
    };

    // App Visualisation Service API
    const savePetGaol = async (petId) => {

        set_isLoading(true);
        let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);

        let obj =  {
            "petParentId": clientId,
            "goalDurationInMins": actualTimeValue,
            "petId": petObject.petID,
            "userId": null
        }

        let apiMethod = apiMethodManager.SAVE_FORWARD_MOTION;
        let apiService = await apiRequest.putData(apiMethod,obj,Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
            
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
            
            if(apiService.data.message) {
                createPopup(apiService.data.message,Constant.ALERT_INFO,'OK', true,1);
            }
                
        } else if(apiService && apiService.isInternet === false) {
            createPopup(Constant.NETWORK_STATUS,Constant.ALERT_NETWORK,'OK', true,0);
        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {

            firebaseHelper.logEvent(firebaseHelper.event_save_GoalSet_api_fail, firebaseHelper.screen_Goal_Set, "Save ForwardMotion Goal Api Failed  : ", 'Service Status : '+apiService.error.errorMsg);
            createPopup(apiService.error.errorMsg,Constant.ALERT_DEFAULT_TITLE,'OK', true,0);
            
        } else {

            createPopup(Constant.SERVICE_FAIL_MSG,Constant.ALERT_DEFAULT_TITLE,'OK', true,0);
            firebaseHelper.logEvent(firebaseHelper.event_save_GoalSet_api_fail, firebaseHelper.screen_Goal_Set, "Save ForwardMotion Goal Api Failed : ", 'Service Status : false');

        }

    };

    const instructionAction = () => {
        navigation.navigate('GoalInstructionsComponent')
    }

    // Next btn Action
    const nextButtonAction = () => {
        savePetGaol();
    };

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    // Naigates to previous screen
    const backBtnAction = () => {
        navigation.pop();
    };

    const createPopup = (msg,title,rBtnTitle,isPopup,popId) => {
        set_popUpMessage(msg);
        set_popUpAlert(title);
        set_popUpRBtnTitle(rBtnTitle);
        set_isPopUp(isPopup);
        set_popId(popId);
    };

    const popOkBtnAction = () => {
        if(POP_SUCCESS === popId) {
            backBtnAction();
        }
        createPopup('','','',false,0);
    };

    const updateSliderValue = (value) => {

        if(value) {
            set_actualTimeValue(value);
            value = convertMinsToTime(value);
        }

        set_showTimeValue(value)

    };

    const convertMinsToTime = (mins) => {

        let hours = Math.floor(mins / 60);
        let minutes = mins % 60;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        if(hours === 0) {
            return `${minutes}m`;
        }

        if(minutes === 0 || minutes === '00') {
            return `${hours}h`;
        }

        return `${hours}h ${minutes}m`;
    };

    return (
        <View style={[styles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Set Activity Goal'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.middleViewStyle}>

                <View style={{alignItems:'center'}}>
                    <View style={{marginTop: hp("5%"),alignItems:'center'}}>
                        <Text style={[styles.headerTextStyle,{}]}>{'Set a Forward Motion Goal for'}</Text>
                        <Text style={[styles.headerTextStyle,{}]}>{petObject ? petObject.petName : ''}</Text>
                    </View>

                    <View style={{marginTop: hp("5%"),}}>
                        <Text style={styles.labelTextStyles}>{'Great! Let’s get started!'}</Text>
                    </View>

                    <View style={{marginTop: hp("2%"),}}>
                        <Text style={styles.goalTextStyles}>{showTimeValue}</Text>
                    </View>

                    <View style={{marginTop: hp("-2%"),}}>
                        <GoalSetSliderComponent
                            value={timeValue}
                            minValue = {30}
                            maxValue = {240}
                            breakValue = {10}
                            setValue={(value) => {updateSliderValue(value,)}}
                        /> 
                    </View>
                </View>

                <TouchableOpacity onPress={() => {instructionAction()}}>
                    <View style={styles.headerViewStyleView}>
                        <View style={{ flexDirection: 'row' }}>
                        <EyeImg style={styles.imgStyle}/>
                        <Text style={styles.viewTextStyleBFIApp}>{'View Instructions'}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SET GOAL'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View> 

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                    <AlertComponent
                        header = {popUpAlert}
                        message={popUpMessage}
                        isLeftBtnEnable = {false}
                        isRightBtnEnable = {true}
                        leftBtnTilte = {'NO'}
                        rightBtnTilte = {popUpRBtnTitle}
                        popUpRightBtnAction = {() => popOkBtnAction()}
                        // popUpLeftBtnAction = {() => popCancelBtnAction()}
                    />
            </View> : null}
                {isLoading === true ? <LoaderComponent isLoader={false} loaderText = {loaderMsg} isButtonEnable = {false} /> : null} 
            
        </View>
    );
  }
  
  export default GoalSetComponent;

  const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'           
    },

    middleViewStyle : {
        alignItems:'center',
        marginTop: hp("5%"),
        height:hp('65%'),
        justifyContent:'space-between'
    }, 

    labelTextStyles : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXSmall,
        color:'black',
        alignSelf:'center',
    },

    goalTextStyles : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXXXXLarge,
        color:'black',
    },

    headerTextStyle : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontLarge,
        color:'black',
        marginTop:hp('1%'),
        marginBottom:hp('1%'),
        marginLeft:hp('2%'),
        marginRight:hp('2%'),
        textAlign:"left"
    },

    imgStyle: {
        width: wp('5%'),
        height: hp('3%'),
        tintColor: "#6BC100",
        alignSelf:'center'
    },

    viewTextStyleBFIApp: {
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-SemiBold',
        color: "#6BC100",
        paddingLeft: 5,
    },

    headerViewStyleView: {
        justifyContent: 'center',
        alignItems: 'center',
    },

  });