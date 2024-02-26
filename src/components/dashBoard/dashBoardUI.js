import React, { useState, useEffect,useRef } from 'react';
import {View,ScrollView,Text,Image,TouchableOpacity,ImageBackground,Linking,ActivityIndicator,FlatList,Platform,Dimensions} from 'react-native';
import DashBoardStyles from './dashBoardStyles';
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import PetsSelectionCarousel from "./../../utils/petsSelectionCarousel/petsSelectionCarousel";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import LeaderBoardService from './../pointTracking/leaderBoard/leaderBoardService';
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import Highlighter from 'react-native-highlight-words';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import DashboardActivityUI from "./dashboardUIComponents/dashboardActivityUI";
import DashboardTasksUI from "./dashboardUIComponents/dashboardTasksUI";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import DashboardFTUserUI from './dashboardUIComponents/dashboardFTUserUI';

let deviceAGL = require("../../../assets/images/dashBoardImages/svg/deviceMissingAGL.svg");
let deviceHPN = require("../../../assets/images/dashBoardImages/svg/devicePendingHPN.svg");
let cptureImgDog = require('./../../../assets/images/dashBoardImages/svg/dog-bfi.svg');
let cptureImgCat = require('./../../../assets/images/dashBoardImages/svg/captureCta.svg');
let body_Con_Dog = require('./../../../assets/images/dashBoardImages/svg/body_condition.svg');
let body_Con_Cat = require('./../../../assets/images/dashBoardImages/svg/body_condition_cat.svg');
let weight_dog = require('./../../../assets/images/dashBoardImages/svg/dog-weight.svg')
let weight_Cat = require('./../../../assets/images/dashBoardImages/svg/weight_Cat.svg')


const  DashBoardUI = ({route, ...props }) => {

    const [dashboardViewArray, set_dashboardViewArray] = useState([{'id':0, 'name':'Activity'},{'id':1, 'name':'Tasks'}]);
    const [dbrdFeatureArray, set_dbrdFeatureArray] = useState([]);
    const[activeItem, set_activeItem] = useState(0);
    const[goalSetValue, set_goalSetValue] = useState(0);
    const [tabItem, set_tabItem] = useState(0);
    const carouselRef = useRef(null);
    const carouselFeatureRef = useRef(null);
    const tabItemRef = useRef(0);
    // const tabItemWeightRef = useRef(0);
    const [isScrollEndReached, set_isScrollEndReached] = useState(null);
    const [showSearch, set_showSearch] = useState(false);
    const [adjustTop, set_adjustTop] = useState('');
    const flatDBRef = useRef(null);

    useEffect(() => {
        set_tabItem(tabItem)
        prepareSliderWidgets(props.isCaptureImages,props.isEatingEnthusiasm,props.isImageScoring,props.isPetWeight,props.weight,props.weightUnit,props.defaultPetObj);
        checkForSearchAvailable();
    }, [props.isCaptureImages,props.isEatingEnthusiasm,props.isImageScoring,props.isPetWeight,props.weight,props.weightUnit,props.defaultPetObj]);

    useEffect(() => {
        checkTimerDimentions();
    }, [props.isDeviceMissing, props.isFmGoalSet, props.isFmGraph ,props.isWeightPer, props.isSleepGraph]);

    useEffect(() => {
        checkTimerDimentionsDevice();
    }, [props.isDeviceMissing, props.isDeviceSetupDone]);

    const prepareSliderWidgets = async (isCaptureImages,isEatingEnthusiasm,isImageScoring,isPetWeight,weight,weightUnit,dPet) => {

        let tempArr = [];
        let obj;
        let isCapture = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_CAPTURE_IMGS);
        // set_dbrdFeatureArray([]);
        if(isCapture && parseInt(isCapture) === 67 && dPet && parseInt(dPet.speciesId) === 1) {
            
            obj = {'id':1, 'action':'Capture Images', 'text1':'Capture','text2':'Images For','text3':'Scoring','bColor':'#FFF7ED','brColor':'#F5B054','imgPath': dPet && parseInt(dPet.speciesId) === 1 ? cptureImgDog : cptureImgCat}
            tempArr.push(obj);
        } 
        if(isImageScoring) {
            
            obj = {'id':2, 'action':'Score Pet', 'text1':'Score your','text2':'pets body','text3':'condition','bColor':'#F1F0FD','brColor':'#5A02FF','imgPath': dPet && dPet.speciesId && parseInt(dPet.speciesId)=== 1 ? body_Con_Dog : body_Con_Cat}
            tempArr.push(obj);
        } 
        
        if(isEatingEnthusiasm) {
            obj = {'id':3, 'action':'Eating Enthusiasim', 'text1':'How enthusiastic','text2':'is your pet at','text3':'mealtime?','bColor':'#F5FCFA','brColor':'#2AC779','imgPath':require('./../../../assets/images/dashBoardImages/svg/slider-food.svg')}
            tempArr.push(obj);
        } 
        if(isPetWeight) {
            
            obj = {'id':4, 'action':'Pet Weight', 'text1':'Is your Pet','text2':'Fluffy or Fit?','text3':weight ? weight + ' ' + (weightUnit ? weightUnit : '' ) : '------','bColor':'#F5F9FC','brColor':'#2A97C7','imgPath': dPet && dPet.speciesId && parseInt(dPet.speciesId) === 1 ? weight_dog : weight_Cat}
            tempArr.push(obj);
        }
        
        setTimeout(() => {  
            set_isScrollEndReached(false);
            flatDBRef?.current?.scrollToIndex({
                animated: true,
                index: 0,
            });
        }, 500)
        set_dbrdFeatureArray(tempArr);

    };

    const checkForSearchAvailable = async () => {

        let userRoleDetails = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_DETAILS);
        userRoleDetails = JSON.parse(userRoleDetails);
    
        if(userRoleDetails && (userRoleDetails.RoleName === "Hill's Vet Technician" || userRoleDetails.RoleName === "External Vet Technician")) {
          set_showSearch(true)
        } else {
          set_showSearch(false);
        }
    
    }

    const checkTimerDimentions = async () => {

        if((!props.isDeviceMissing) && (props.isFmGoalSet || props.isFmGraph || props.isWeightPer || props.isSleepGraph)){
            await DataStorageLocal.saveDataToAsync(Constant.TIMER_DIMENTIONS,'adjust');
            set_adjustTop(true);
        } else {
            await DataStorageLocal.saveDataToAsync(Constant.TIMER_DIMENTIONS,'');
            set_adjustTop(false);
        }
    };

    const checkTimerDimentionsDevice = async () => {

        if(props.isDeviceMissing || !props.isDeviceSetupDone){
            await DataStorageLocal.saveDataToAsync(Constant.TIMER_DIMENTIONS_DEVICE,'deviceStat');
        } else {
            await DataStorageLocal.saveDataToAsync(Constant.TIMER_DIMENTIONS_DEVICE,'');
        }
    }
    
    const editPetAction = (item) => {
        props.editPetAction(item);
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    const refreshDashBoardDetails = (pObject) => {
        props.refreshDashBoardDetails('swiped',pObject);
    };

    const menuAction = () => {
        props.menuAction();
    };

    const quickSetupAction = (value) => {
        props.quickSetupAction(value);
    };

    // Question button action
    const quickQuestionnaireAction = () => {
        props.quickQuestionnaireAction();
    };

    // Based on title navigates to particular feature
    const nextButtonAction = (value) => {
        props.setupDeviceAction(value);       
    };

    const internetBtnAction = async () => {
        props.internetBtnAction();
    };

    const internetQuestBtnAction = async () => {
        props.internetQuestBtnAction();
    };

    // Removes the typeahead list after selecting the pet in search
    const selectedPetAction = (item) => {
        props.selectedPetAction(item);
    };

    const renderScrollItem = (index) => {
        tabItemRef.current = index;
        carouselRef.current.snapToItem(index);
        set_tabItem(index)
    };

    const renderScrollFeatureItem = (index) => {
        // set_tabItem(index+1)
        set_activeItem(index);
        carouselFeatureRef.current.snapToItem(index);
    };

    const foodRecommand = () => {
        props.foodRecommand();
    };

    const featureActions = (item) => {
        props.featureActions(item);
    };

    const goalSetAction = () => {
        props.goalSetAction(goalSetValue);
    };

    const goalVisualizationAction = (value) => {
        props.goalVisualizationAction(value);
    };

    const deviceSetupMissingActions = (value) => {
        props.deviceSetupMissingActions(value);
    };

    // DashBoard page Styles
    const {
        mainComponentStyle,
        headerView,
        buttonstyle,
        btnTextStyle,
        progressStyle,
        alertTextStyle,
        dashboardViewStyle,
        questArrowImgStyle,
        uploadTextStyle,
        uploadSubTextStyle,
        tabViewStyle,
        tabViewBtnStyle,
        tabViewEnableBtnStyle,
        tabBtnTextStyle,
        devTextStyle,
        devMissImgStyle,
        devTextStyle1,
        tabBtnTextStyleiPad
    } = DashBoardStyles;

    const renderDashboardItem = ({item, index}) => {

        return (
            <View style={[dashboardViewStyle,{backgroundColor:item.id === 1 ? 'white':'white',marginTop:hp('4%'),}]}>
                { item.id === 0 ? renderActivityView() : renderTasksView()}
            </View>
        );
    }

    const renderUploads = () => {

        return (

            <View>

               <View style={{width:wp('100%'),marginBottom:hp('1%'),minHeight:Platform.isPad ? hp('12%') : hp('10%'),alignItems:'center',justifyContent:'center',backgroundColor:'#818588'}}>

                    {props.obsVideoUploadStatus ? <View style={{width:wp('100%'),alignitems:'center'}}>

                        {props.obsVideoInternetType === "cellular" ? <View style={{width:wp('90%'),flexDirection:'row'}}>

                            <View style={{width:wp('60%'),justifyContent:'center',alignitems:'center'}}>
                                 <Text style={alertTextStyle}>{'Media cannot be uploaded on cellular network. Please switch to Wi-Fi and try again.'}</Text>                               
                            </View>

                            <View style={{width:wp('30%'),height:hp('6%'),alignItems:'center',justifyContent:'center'}}>
                                <TouchableOpacity style= {{width:wp('25%'),height:hp('4%'),backgroundColor:'red',alignItems:'center',justifyContent:'center',borderRadius:5}} onPress={() => {internetBtnAction()}}>
                                    <Text style={alertTextStyle}>{'TRY AGAIN'}</Text>
                                </TouchableOpacity>
                            </View>

                        </View> : 
                                            
                        <View style={{width:wp('90%'),height:hp('10%'),flexDirection:'row',alignSelf:'center',justifyContent:'center',}}>

                                    <View style={{width:wp('60%'),justifyContent:'center'}}>
                                        <Text style={[uploadTextStyle,{color:'white'}]}>{'Observation : '+(props.obsVideoText && props.obsVideoText.length > 15 ? props.obsVideoText.replace('/r','/').slice(0, 15)+"..." : props.obsVideoText)}</Text>
                                        <Text style={[uploadSubTextStyle,{color:'white',marginTop:hp('1%')}]}>{props.obsVideoUploadStatus + " "+ props.obsVideoFileName}</Text>
                                    </View>

                                    <View style={{width:wp('30%'),alignItems:'center',justifyContent:'center'}}>

                                        <View style={{width:wp('12%'),aspectRatio:1,backgroundColor:'#000000AA',borderRadius:100,borderColor:'#6BC100',borderWidth:2,alignItems:'center',justifyContent:'center'}}>
                                            <Text style={progressStyle}>{props.obsVideoUploadProgress}</Text>
                                        </View>

                                        <Text style={{color:'white'}}>{props.obsVideoProgressTxt}</Text>
                                                
                                    </View>

                                </View>}

                            </View> : null}

                    {props.obsImgUploadStatus ? <View style={{width:wp('100%'),alignitems:'center'}}>

                                {props.internetType === "cellular" ? <View style={{width:wp('90%'),flexDirection:'row'}}>

                                    <View style={{width:wp('60%'),justifyContent:'center',alignitems:'center'}}>
                                        <Text style={alertTextStyle}>{'Media cannot be uploaded on cellular network. Please switch to Wi-Fi and try again.'}</Text>                               
                                    </View>

                                    <View style={{width:wp('30%'),height:hp('6%'),alignItems:'center',justifyContent:'center'}}>
                                        <TouchableOpacity style= {{width:wp('25%'),height:hp('4%'),backgroundColor:'red',alignItems:'center',justifyContent:'center',borderRadius:5}} onPress={() => {internetBtnAction()}}>
                                            <Text style={alertTextStyle}>{'TRY AGAIN'}</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View> : 
                                            
                                <View style={{width:wp('90%'),height:hp('10%'),flexDirection:'row',alignSelf:'center',justifyContent:'center',}}>

                                    <View style={{width:wp('60%'),justifyContent:'center'}}>
                                        <Text style={[uploadTextStyle,{color:'white'}]}>{'Observation : '+(props.obsImgText && props.obsImgText.length > 15 ? props.obsImgText.replace('/r','/').slice(0, 15)+"..." : props.obsImgText)}</Text>
                                        <Text style={[uploadSubTextStyle,{color:'white',marginTop:hp('1%')}]}>{props.obsImgUploadStatus + " "+ props.obsImgFileName}</Text>
                                    </View>

                                    <View style={{width:wp('30%'),alignItems:'center',justifyContent:'center'}}>

                                        <View style={{width:wp('12%'),aspectRatio:1,backgroundColor:'#000000AA',borderRadius:100,borderColor:'#6BC100',borderWidth:2,alignItems:'center',justifyContent:'center'}}>
                                            <Text style={progressStyle}>{props.obsImgUploadProgress}</Text>
                                        </View>

                                        <Text style={{color:'white'}}>{props.obsImgProgressTxt}</Text>
                                                
                                    </View>

                                </View>}

                            </View> : null}

                    {props.questUploadStatus ? <View style={{width:wp('100%'),alignitems:'center'}}>

                                {props.questInternetType === "cellular" ? <View style={{width:wp('90%'),flexDirection:'row'}}>

                                    <View style={{width:wp('60%'),justifyContent:'center',alignitems:'center'}}>
                                        <Text style={alertTextStyle}>{'Questionnaire Media cannot be uploaded on cellular network. Please switch to Wi-Fi and try again.'}</Text>                               
                                    </View>

                                    <View style={{width:wp('30%'),height:hp('6%'),alignItems:'center',justifyContent:'center'}}>
                                        <TouchableOpacity style= {{width:wp('25%'),height:hp('4%'),backgroundColor:'red',alignItems:'center',justifyContent:'center',borderRadius:5}} onPress={() => {internetQuestBtnAction()}}>
                                            <Text style={alertTextStyle}>{'TRY AGAIN'}</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View> 
                                            
                                : 
                                            
                                <View style={{width:wp('90%'),height:hp('10%'),flexDirection:'row',alignSelf:'center',justifyContent:'center',}}>

                                    <View style={{width:wp('60%'),justifyContent:'center'}}>
                                        <Text style={[uploadTextStyle,{color:'white'}]}>{'Questionnaire : '+(props.questText && props.questText.length > 15 ? props.questText.replace('/r','/').slice(0, 15)+"..." : props.questText)}</Text>
                                        <Text style={[uploadSubTextStyle,{color:'white',marginTop:hp('1%')}]}>{props.questUploadStatus + " "+ props.questFileName}</Text>
                                    </View>

                                    <View style={{width:wp('30%'),alignItems:'center',justifyContent:'center'}}>

                                        <View style={{width:wp('12%'),aspectRatio:1,backgroundColor:'#000000AA',borderRadius:100,borderColor:'#6BC100',borderWidth:2,alignItems:'center',justifyContent:'center'}}>
                                            <Text style={progressStyle}>{props.questUploadProgress}</Text>
                                        </View>

                                        <Text style={{color:'white'}}>{props.questProgressTxt}</Text>
                                                
                                    </View>

                                </View>}

                            </View> : null}

                            {props.bfiUploadStatus ? <View style={{width:wp('100%'),height:Platform.isPad ? hp('12%') : hp('10%'),alignItems:'center',justifyContent:'center',backgroundColor:'#818588',marginBottom: props.bfiUploadStatus ? hp('0%') : hp('1%')}}>
                        <View style={{width:wp('90%'),height:hp('6%'),flexDirection:'row'}}>
 
                            <View style={{width:wp('60%'),height:hp('6%'),justifyContent:'center'}}>
                                <Text style={[uploadSubTextStyle,{color:'white',marginTop:hp('1%')}]}>{props.bfiUploadStatus + " "+ props.bfiFileName}</Text>
                            </View>
 
                            <View style={{width:wp('30%'),height:hp('6%'),alignItems:'center',justifyContent:'center'}}>
 
                                <View style={{width:wp('12%'),aspectRatio:1,backgroundColor:'#000000AA',borderRadius:100,borderColor:'#6BC100',borderWidth:2,alignItems:'center',justifyContent:'center'}}>
                                    <Text style={progressStyle}>{props.bfiUploadProgress}</Text>
                                </View>
 
                                <Text style={{color:'white'}}>{props.bfiProgressText}</Text>
                                        
                            </View>
 
                        </View>
 
                    </View> : null}

                        </View>

            </View>
        );
    }

    const renderActivityView = () => {

        return (

            <View style = {{justifyContent:'center',alignItems:'center',width:wp('100%'),height: Platform.OS === 'android' ? (props.isTimer ? hp('58%') :(props.isDeviceMissing || !props.isDeviceSetupDone ? hp('63%') : (showSearch ? hp('70%') : hp('75%')))) : (props.isTimer ? (Platform.isPad ? hp('53%') : hp('55%')) : (props.isDeviceMissing || !props.isDeviceSetupDone ?(Platform.isPad ? hp('65%') : hp('58%')) : (showSearch ? hp('66%') : hp('71%')))), marginTop: Platform.isPad ? (props.isTimer ? hp('11.8%') : hp('-1%')) : (props.isTimer ? hp('9%') : hp('-1%'))}}>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    {props.obsVideoUploadStatus || props.obsImgUploadStatus || props.questUploadStatus || props.bfiUploadStatus ? renderUploads() : null}
                    <DashboardActivityUI
                        behVisualData = {props.behVisualData}
                        weightHistoryData1 = {props.weightHistoryData}
                        isDeviceSetupDone = {props.isDeviceSetupDone}
                        isDeviceMissing = {props.isDeviceMissing}
                        isTimerEnable = {props.isTimerEnable}
                        isObsEnable ={props.isObsEnable}
                        obsVideoUploadStatus = {!props.obsVideoUploadStatus}
                        obsImgUploadStatus = {props.obsImgUploadStatus}
                        questUploadStatus = {props.questUploadStatus}
                        isModularityService = {props.isModularityService}
                        isFmGoalSet = {props.isFmGoalSet}
                        isFmGraph = {props.isFmGraph}
                        isWeightPer = {props.isWeightPer}
                        isFoodHistory = {props.isFoodHistory}
                        isFeedingReq = {props.isFeedingReq}
                        isSleepGraph = {props.isSleepGraph}
                        foodHistoryObj = {props.foodHistoryObj}
                        setGoelAction = {()=> {goalSetAction()}}
                        setQuickSetupAction = {(value)=> {quickSetupAction(value)}}
                        goalVisualizationAction = {(value)=> {goalVisualizationAction(value)}}
                        navFRecommand = {()=> {foodRecommand()}}
                    />

                </ScrollView>
            </View>
            
        )
    }

    const renderTasksView = () => {

        return (
 
            <View style = {{justifyContent:'center',alignItems:'center',width:wp('100%'),height: Platform.OS === 'android' ? (props.isTimer ? hp('55%') : (props.isDeviceMissing || !props.isDeviceSetupDone ? hp('68%') : (showSearch ? hp('70%') : hp('75%')))) : (props.isTimer ? (Platform.isPad ? (showSearch ? hp('50%') : hp('60%')) : (showSearch ? hp('50%') : hp('60%'))) : 
            (!props.isDeviceSetupDone ? (props.isDeviceMissing ? (Platform.isPad ? hp('63%') : hp('75%')) : (Platform.isPad ? hp('65%') : hp('68%'))) : (showSearch ? hp('67%') : (Platform.isPad ? hp('78%') :hp('70%'))))), marginTop: Platform.isPad ? (props.isTimer ? (showSearch ? hp('14%') : hp('11.8%')) : hp('-1%')) : (props.isTimer ? (showSearch ? (!props.isDeviceSetupDone ? (props.isDeviceMissing ? hp('11.8%') : (adjustTop ? hp('11.3%') : hp('5.8%'))) : hp('11.5%')): hp('11%')) : hp('-1%'))}}>
                
                <ScrollView showsVerticalScrollIndicator={false}>

                {props.obsVideoUploadStatus || props.obsImgUploadStatus || props.questUploadStatus || props.bfiUploadStatus ? renderUploads() : null}
                    <DashboardTasksUI
                        isScrollEndReachedProp = {props.isScrollEndReached}
                        dbrdFeatureArrayProp = {dbrdFeatureArray}
                        isDeviceSetupDone = {props.isDeviceSetupDone}
                        isDeviceMissing = {props.isDeviceMissing}
                        isTimerEnable = {props.isTimerEnable}
                        isObsEnable ={props.isObsEnable}
                        obsVideoUploadStatus = {!props.obsVideoUploadStatus}
                        obsImgUploadStatus = {props.obsImgUploadStatus}
                        questUploadStatus = {props.questUploadStatus}
                        isModularityService = {props.isModularityService}
                        questionnaireData = {props.questionnaireData}
                        questSubmitLength = {props.questSubmitLength}
                        isQuestionnaireEnable = {props.isQuestionnaireEnable}
                        questionnaireDataLength = {props.questionnaireDataLength}
                        isPTEnable = {props.isPTEnable}
                        leaderBoardPetId = {props.leaderBoardPetId}
                        campagainName = {props.campagainName}
                        campagainArray = {props.campagainArray}
                        currentCampaignPet = {props.currentCampaignPet}
                        isSwipedModularity = {props.isSwipedModularity}
                        leaderBoardArray = {props.leaderBoardArray}
                        isPTDropdown = {props.isPTDropdown}
                        enableLoader = {props.enableLoader}
                        ptActivityLimits = {props.ptActivityLimits}
                        isPTLoading = {props.isPTLoading}
                        bfiUploadStatus = {props.bfiUploadStatus}
                        leaderBoardCurrent = {props.leaderBoardCurrent}
                        showSearch = {showSearch}
                        setQuickSetupAction = {(value)=> {quickSetupAction(value)}}
                        quickQuestionnaireAction = {() => quickQuestionnaireAction()}
                        featureActions = {(item)=> featureActions(item)}
                        
                    />
                   
                </ScrollView>

            </View>
    
        );
    }

    return (

        <View style={[mainComponentStyle,{backgroundColor : props.isFirstUser ? "#F5F7F9" : 'white'}]}>

            <View style={[headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={false}
                    isSettingsEnable={true}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'DASHBOARD'}
                    headerColor = {props.isFirstUser ? '#F5F7F9' : 'white'}
                    moduleName = {'firstTimeUser'}
                    timerBtnAction = {() => timerBtnAction()}
                    settingsBtnAction = {() => menuAction()}
                />
            </View>

            {props.isFirstUser ? 
                
                <DashboardFTUserUI
                    firstName = {props.firstName}
                    secondName = {props.secondName}
                />
                    
                : 
                
                <View style = {{height: props.isFirstUser ? hp('75%') : hp('90%')}}>

                    <View style={[CommonStyles.petsSelViewHeaderStyle,{zIndex : props.isLoading ? 0 : 999}]}>

                        <PetsSelectionCarousel
                            petsArray={props.petsArray}
                            isSwipeEnable = {true}
                            defaultPet = {props.defaultPetObj}
                            activeSlides = {props.activeSlide}
                            isFromScreen = {'Dashboard'}
                            dismissSearch = {props.isSearchDropdown}
                            setValue={(pObject) => { refreshDashBoardDetails(pObject)}}
                            selectedPetAction={(pObject) => { selectedPetAction(pObject)}}
                            editPetAction = {editPetAction}
                        />

                    </View>

                    <View style={{alignItems:'center'}}>

                        {!props.isDeviceMissing && !props.isDeviceSetupDone ? <View style = {{height:hp('6%'),width:wp('92.7%'),backgroundColor:'#FFEDED',marginBottom: hp('1%'),borderRadius:15,borderColor:'#F55454',borderWidth:0.5,alignitems:'center',}}>
                            
                            <TouchableOpacity style={{flexDirection:'row'}} onPress={() => {deviceSetupMissingActions(16)}}>
                                <View style={{justifyContent:'center',height:hp('6%'),width:wp('15%'),alignitems:'center',alignSelf:'center'}}>
                                    <Image source={props.devModel && (props.devModel==='AGL2' || props.devModel==='CMAS') ? deviceAGL : deviceHPN} style={Platform.isPad ? [devMissImgStyle,{alignSelf:'center'}] :[devMissImgStyle,{alignSelf:'center'}]}/>
                                </View>
                                <View style={{justifyContent:'center'}}>
                                    <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('73%')}}>
                                        <Text style={[devTextStyle,{color: 'red'}]}>{'SENSOR SETUP PENDING'}</Text>
                                        <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={Platform.isPad ? [questArrowImgStyle ,{width: wp("5%"),height: hp("1.5%"),tintColor:'red'}] : [questArrowImgStyle, {height: hp("1%"),tintColor:'red'}]}></Image>                                  
                                    </View>
                                    <Text style={[devTextStyle,{}]}>{'Struggling with setup? Check out the tutorials.'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View> : null}

                        {props.isDeviceMissing ? <View style = {{height:hp('6%'),width:wp('92.7%'),backgroundColor:'#FFEDED',marginBottom: hp('1%'),borderRadius:15,borderColor:'#F55454',borderWidth:0.5,alignitems:'center',flexDirection:'row'}}>
                            <TouchableOpacity style={{flexDirection:'row'}} onPress={() => {deviceSetupMissingActions(17)}}>
                                <View style={{justifyContent:'center',marginLeft:hp('2%')}}>
                                    <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('85%')}}>
                                        <Text style={[devTextStyle,{color: 'red'}]}>{'DEVICE MISSING'}</Text>
                                        
                                            <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={Platform.isPad ? [questArrowImgStyle ,{width: wp("5%"),height: hp("1.5%"),tintColor:'red'}] : [questArrowImgStyle, {height: hp("1%"),tintColor:'red'}]}></Image>
                                        
                                    </View>
                                    <Text style={[devTextStyle1,{}]}>{'Trouble adding a sensor? Check out the tutorials.'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View> : null}

                        {(!props.isDeviceMissing) && props.isFmGoalSet || props.isFmGraph || props.isWeightPer || props.isSleepGraph  || props.isFoodHistory ? <View style={[tabViewStyle,{marginBottom:hp('-2%')}]}>

                            <View style={{flexDirection:'row',alignSelf:'center',height:hp('3%'),width:wp('92.7%'),justifyContent:'space-between'}}>

                                <TouchableOpacity style={[tabItem === 0 ? [tabViewEnableBtnStyle,CommonStyles.shadowStyle,{backgroundColor:'white',borderRadius: Platform.isPad ? 10 : 7}] : tabViewBtnStyle]} onPress={() => {tabItemRef.current = 0,carouselRef.current.snapToItem(0),set_tabItem(0)}}>
                                    <Text style={[Platform.isPad ? tabBtnTextStyleiPad :  tabBtnTextStyle]}>{'Activity'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[tabItem === 1 ? [tabViewEnableBtnStyle,CommonStyles.shadowStyle,{borderRadius: Platform.isPad ? 10 : 7}] : tabViewBtnStyle]} onPress={() => {tabItemRef.current = 1,carouselRef.current.snapToItem(1),set_tabItem(1);}}>
                                    <Text style={[Platform.isPad ? tabBtnTextStyleiPad :  tabBtnTextStyle]}>{'Tasks'}</Text>
                                </TouchableOpacity>
                            </View>
                                
                        </View> : 
                        <View style={[dashboardViewStyle,{marginTop:hp('1.5%'),}]}>
                            { renderTasksView()}
                        </View>}

                        <View style={{alignItems:'center',marginTop: props.isTimer || props.uploadStatus || props.questUploadStatus ? hp('1%') : hp('0%')}}>

                                <View style={{width:wp('100%')}}>
                                    <Carousel
                                        ref={carouselRef}
                                        data={dashboardViewArray}
                                        renderItem={renderDashboardItem}
                                        sliderWidth={wp('100%')}
                                        itemWidth={wp('100%')} 
                                        showthumbs = {false}
                                        layout={'default'}
                                        activeSlideAlignment = {'start'}
                                        firstItem={tabItemRef.current}
                                        hasParallaxImages={true}
                                        onSnapToItem={data => renderScrollItem(data)}
                                        inactiveSlideOpacity = {1}
                                        useScrollView={true}
                                        enableSnap = {true}
                                        scrollEnabled = {false}
                                    />

                                </View>
                            
                        </View>

                        {props.isDeceased ? <View style={{width:wp('90%'),height:hp('50%'), alignSelf:'center',justifyContent:'center'}}>
                            
                            <View style={[buttonstyle]}>
                                <Text style={[btnTextStyle,{color:'black',textAlign:'center'}]}>{'Some App features are restricted for this pet. \nPlease reach out to the customer support for more details.'}</Text>
                            </View>

                        </View> : null}

                    </View>

                </View>}

                {props.isDeceased ? null :(props.isFirstUser ? <View style={[CommonStyles.bottomViewComponentStyle,{height:Platform.OS === 'android' ? hp('10%') : hp('13%')}]}>
                    <BottomComponent
                        rightBtnTitle = {props.buttonTitle}
                        isLeftBtnEnable = {false}
                        rigthBtnState = {true}
                        isRightBtnEnable = {true}
                        rightButtonAction = {async () => nextButtonAction(props.buttonTitle)}
                    />
                </View> : null)}    

                {props.isPopUp ? <View style={[CommonStyles.customPopUpStyle,{zIndex:999}]}>
                    <AlertComponent
                        header = {props.popUpAlert}
                        message={props.popUpMessage}
                        isLeftBtnEnable = {props.isPopLeft}
                        isRightBtnEnable = {true}
                        leftBtnTilte = {'NO'}
                        rightBtnTilte = {props.popUpRBtnTitle}
                        popUpRightBtnAction = {() => popOkBtnAction()}
                        popUpLeftBtnAction = {() => popCancelBtnAction()}
                    />
            </View> : null}
                {props.isLoading === true ? <LoaderComponent style = {{zIndex:999}} isLoader={false} loaderText = {props.loaderMsg} isButtonEnable = {false} /> : null} 
        </View>
    );
  }
  
  export default DashBoardUI;