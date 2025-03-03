import React, { useState, useEffect,useRef } from 'react';
import {View,ScrollView,Text,TouchableOpacity,Platform} from 'react-native';
import DashBoardStyles from './dashBoardStyles';
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import PetsSelectionCarousel from "./../../utils/petsSelectionCarousel/petsSelectionCarousel";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import DashboardActivityUI from "./dashboardUIComponents/dashboardActivityUI";
import DashboardTasksUI from "./dashboardUIComponents/dashboardTasksUI";
import DashboardFTUserUI from './dashboardUIComponents/dashboardFTUserUI';
import * as AppPetsData from '../../utils/appDataModels/appPetsModel.js';
import * as modularPermissions from '../../utils/appDataModels/modularPermissionsModel.js';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";

import DeviceAglImg from "./../../../assets/images/dashBoardImages/svg/deviceMissingAGL.svg";
import DeviceHPNIMG from "./../../../assets/images/dashBoardImages/svg/devicePendingHPN.svg";
import CptureDogImg from "./../../../assets/images/dashBoardImages/svg/dog-bfi.svg";
import CptureCatImg from "./../../../assets/images/dashBoardImages/svg/captureCta.svg";
import BodyConDitionDogImg from "./../../../assets/images/dashBoardImages/svg/body_condition.svg";
import BodyConDitionCatImg from "./../../../assets/images/dashBoardImages/svg/body_condition_cat.svg";
import WeightDogImg from "./../../../assets/images/dashBoardImages/svg/dog-weight.svg";
import WeightCatImg from "./../../../assets/images/dashBoardImages/svg/weight_Cat.svg";
import SliderFoodImg from "./../../../assets/images/dashBoardImages/svg/slider-food.svg";
import RightArrowImg from "./../../../assets/images/dashBoardImages/svg/arrow-black-right.svg";

const  DashBoardUI = ({route, ...props }) => {

    const [dashboardViewArray, set_dashboardViewArray] = useState([{'id':0, 'name':'Activity'},{'id':1, 'name':'Tasks'}]);
    const [dbrdFeatureArray, set_dbrdFeatureArray] = useState([]);
    const[activeItem, set_activeItem] = useState(0);
    const [tabItem, set_tabItem] = useState(0);
    const [dashboardPetsData, set_dashboardPetsData] = useState(undefined);
    const [petPermissionsData, set_petPermissionsData] = useState(undefined);
    const carouselRef = useRef(null);
    const carouselFeatureRef = useRef(null);
    const tabItemRef = useRef(0);
    const [isScrollEndReached, set_isScrollEndReached] = useState(null);
    const [showSearch, set_showSearch] = useState(false);
    const [adjustTop, set_adjustTop] = useState('');
    const flatDBRef = useRef(null);

    useEffect(() => {
        set_tabItem(tabItem)
        checkForSearchAvailable();
        checkTimerDimentionsDevice();
        checkTimerDimentions();
        prepareSliderWidgets();
    }, [props.tempPermissions, props.changeInPetObj, props.petType]);

    // useEffect(() => {
    //     checkTimerDimentionsDevice();
    // }, [props.isDeviceMissing, props.isDeviceSetupDone]);

    // useEffect(() => {
    //     checkTimerDimentionsDevice();
    // }, [dashboardPetsData]);

    const prepareSliderWidgets = async () => {

        
        // set_petPermissionsData(undefined);
        let tempArr = [];
        let permissions = modularPermissions.modularPermissionsData;
        let defaultPet = AppPetsData.petsData.defaultPet;
        set_dashboardPetsData(AppPetsData.petsData)
        set_petPermissionsData(modularPermissions.modularPermissionsData);
        
        let obj;
        let isCapture = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_CAPTURE_IMGS);
        // set_dbrdFeatureArray([]);
        if(isCapture && parseInt(isCapture) === 67 && defaultPet && parseInt(defaultPet.speciesId) === 1) {
            
            obj = {'id':1, 'action':'Capture Images', 'text1':'Capture','text2':'Images For','text3':'Scoring','bColor':'#FFF7ED','brColor':'#F5B054','imgPath': defaultPet && parseInt(defaultPet.speciesId) === 1 ? CptureDogImg : CptureCatImg}
            tempArr.push(obj);
        } 
        if(permissions.isImageScoring) {
            
            obj = {'id':2, 'action':'Score Pet', 'text1':'Score your','text2':'pets body','text3':'condition','bColor':'#F1F0FD','brColor':'#5A02FF','imgPath': defaultPet && defaultPet.speciesId && parseInt(defaultPet.speciesId)=== 1 ? BodyConDitionDogImg : BodyConDitionCatImg}
            tempArr.push(obj);
        } 
        
        if(permissions.isEatingEnthusiasm) {
            obj = {'id':3, 'action':'Eating Enthusiasim', 'text1':'How enthusiastic','text2':'is your pet at','text3':'mealtime?','bColor':'#F5FCFA','brColor':'#2AC779','imgPath':SliderFoodImg}
            tempArr.push(obj);
        } 
        if(permissions.isPetWeight) {
            
            obj = {'id':4, 'action':'Pet Weight', 'text1':'Is your Pet','text2':'Fluffy or Fit?','text3':defaultPet && defaultPet.weight ? defaultPet.weight + ' ' + (defaultPet && defaultPet.weightUnit ? defaultPet.weightUnit : '' ) : '------','bColor':'#F5F9FC','brColor':'#2A97C7','imgPath': defaultPet && defaultPet.speciesId && parseInt(defaultPet.speciesId) === 1 ? WeightDogImg : WeightCatImg}
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

        let userRoleDetails = UserDetailsModel.userDetailsData.userRole;
    
        if(userRoleDetails && (userRoleDetails.RoleName === "Hill's Vet Technician" || userRoleDetails.RoleName === "External Vet Technician")) {
          set_showSearch(true)
        } else {
          set_showSearch(false);
        }
    
    }

    const checkTimerDimentions = async () => {
        //if((!props.isDeviceMissing) && (props.isFmGoalSet || props.isFmGraph || props.isWeightPer || props.isSleepGraph)){
        if((dashboardPetsData && !dashboardPetsData.isDeviceMissing) && (petPermissionsData.isFmGoalSet || petPermissionsData.isFmGraph || petPermissionsData.isWeightPer || petPermissionsData.isSleepGraph)){
            await DataStorageLocal.saveDataToAsync(Constant.TIMER_DIMENTIONS,'adjust');
            set_adjustTop(true);
        } else {
            await DataStorageLocal.saveDataToAsync(Constant.TIMER_DIMENTIONS,'');
            set_adjustTop(false);
        }
    };

    const checkTimerDimentionsDevice = async () => {

        if((dashboardPetsData && dashboardPetsData.isDeviceMissing) || (dashboardPetsData && !dashboardPetsData.isDeviceSetupDone)){
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
        props.goalSetAction();
    };

    const goalVisualizationAction = (value) => {
        props.goalVisualizationAction(value);
    };

    const deviceSetupMissingActions = (value) => {
        props.deviceSetupMissingActions(value);
    };

    const notificationAction = () => {
        props.notificationAction();
    }

    // DashBoard page Styles
    const {
        mainComponentStyle,
        headerView,
        buttonstyle,
        btnTextStyle,
        progressStyle,
        alertTextStyle,
        dashboardViewStyle,
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
                                 <Text style={alertTextStyle}>{Constant.MEDIA_UPLOAD_CELLULAR_MSG}</Text>                               
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
                                        <Text style={alertTextStyle}>{Constant.MEDIA_UPLOAD_CELLULAR_MSG}</Text>                               
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
                                        <Text style={alertTextStyle}>{Constant.QUESTIONNAIRE_MEDIA_UPLOAD_CELLULAR_MSG}</Text>                               
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

            <View style = {{justifyContent:'center',alignItems:'center',width:wp('100%'),height: Platform.OS === 'android' ? (petPermissionsData && petPermissionsData.isTimer ? hp('58%') :((dashboardPetsData && dashboardPetsData.isDeviceMissing) || (dashboardPetsData && !dashboardPetsData.isDeviceSetupDone) ? hp('63%') : (showSearch ? hp('70%') : hp('75%')))) : (petPermissionsData && petPermissionsData.isTimer ? (Platform.isPad ? hp('53%') : hp('55%')) : ((dashboardPetsData && dashboardPetsData.isDeviceMissing) || (dashboardPetsData && !dashboardPetsData.isDeviceSetupDone) ?(Platform.isPad ? hp('65%') : hp('58%')) : (showSearch ? hp('66%') : hp('71%')))), marginTop: Platform.isPad ? (petPermissionsData && petPermissionsData.isTimer ? hp('11.8%') : hp('-1%')) : (petPermissionsData && petPermissionsData.isTimer ? hp('9%') : hp('-1%'))}}>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    {props.obsVideoUploadStatus || props.obsImgUploadStatus || props.questUploadStatus || props.bfiUploadStatus ? renderUploads() : null}
                    <DashboardActivityUI
                        behVisualData = {props.behVisualData}
                        weightHistoryData1 = {props.weightHistoryData}
                        obsVideoUploadStatus = {!props.obsVideoUploadStatus}
                        obsImgUploadStatus = {props.obsImgUploadStatus}
                        questUploadStatus = {props.questUploadStatus}
                        isModularityService = {props.isModularityService}
                        foodHistoryObj = {props.foodHistoryObj}
                        petPermissionsData = {petPermissionsData}
                        dashboardPetsData = {dashboardPetsData}
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
 
            <View style = {{justifyContent:'center',alignItems:'center',width:wp('100%'),height: Platform.OS === 'android' ? (petPermissionsData && petPermissionsData.isTimer ? hp('55%') : ((dashboardPetsData && dashboardPetsData.isDeviceMissing) || (dashboardPetsData && !dashboardPetsData.isDeviceSetupDone) ? hp('68%') : (showSearch ? hp('70%') : hp('75%')))) : (petPermissionsData && petPermissionsData.isTimer ? (Platform.isPad ? (showSearch ? hp('50%') : hp('60%')) : (showSearch ? hp('50%') : hp('60%'))) : 
            ((dashboardPetsData && !dashboardPetsData.isDeviceSetupDone) ? ((dashboardPetsData && dashboardPetsData.isDeviceMissing) ? (Platform.isPad ? hp('63%') : hp('75%')) : (Platform.isPad ? hp('65%') : hp('68%'))) : (showSearch ? hp('67%') : (Platform.isPad ? hp('78%') :hp('70%'))))), marginTop: Platform.isPad ? (petPermissionsData && petPermissionsData.isTimer ? (showSearch ? hp('14%') : hp('11.8%')) : hp('-1%')) : (petPermissionsData && petPermissionsData.isTimer ? (showSearch ? ((dashboardPetsData && !dashboardPetsData.isDeviceSetupDone) ? ((dashboardPetsData && dashboardPetsData.isDeviceMissing) ? hp('11.8%') : (adjustTop ? hp('11.3%') : hp('5.8%'))) : hp('11.5%')): hp('11%')) : hp('-1%'))}}>
                
                <ScrollView showsVerticalScrollIndicator={false}>

                {props.obsVideoUploadStatus || props.obsImgUploadStatus || props.questUploadStatus || props.bfiUploadStatus ? renderUploads() : null}
                    <DashboardTasksUI
                        isScrollEndReachedProp = {props.isScrollEndReached}
                        dbrdFeatureArrayProp = {dbrdFeatureArray}
                        obsVideoUploadStatus = {!props.obsVideoUploadStatus}
                        obsImgUploadStatus = {props.obsImgUploadStatus}
                        questUploadStatus = {props.questUploadStatus}
                        isModularityService = {props.isModularityService}
                        questionnaireData = {props.questionnaireData}
                        questSubmitLength = {props.questSubmitLength}
                        isQuestionnaireEnable = {petPermissionsData && petPermissionsData.isQuestionnaireEnable}
                        questionnaireDataLength = {props.questionnaireDataLength}
                        petPermissionsData = {petPermissionsData}
                        dashboardPetsData = {dashboardPetsData}
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

        <View style={[mainComponentStyle,{backgroundColor : dashboardPetsData && dashboardPetsData.isFirstUser ? "#F5F7F9" : 'white'}]}>

            <View style={[headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={false}
                    isSettingsEnable={true}
                    isNotificationsEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    isNotitficationCount = {props.isNotificationCount ? true : false}
                    title={'DASHBOARD'}
                    headerColor = {dashboardPetsData && dashboardPetsData.isFirstUser ? '#F5F7F9' : 'white'}
                    moduleName = {dashboardPetsData && dashboardPetsData.isFirstUser ? '' : 'hide'}
                    timerBtnAction = {() => timerBtnAction()}
                    settingsBtnAction = {() => menuAction()}
                    notificationAction = {() => notificationAction()}
                />
            </View>

            {dashboardPetsData && dashboardPetsData.isFirstUser ? <DashboardFTUserUI firstName = {props.firstName} secondName = {props.secondName}/>
                    
                : <View style = {{height: dashboardPetsData && dashboardPetsData.isFirstUser ? hp('75%') : hp('90%')}}>

                    <View style={[CommonStyles.petsSelViewHeaderStyle,{zIndex : props.isLoading ? 0 : 999}]}>

                        <PetsSelectionCarousel
                            isSwipeEnable = {true}
                            defaultPet = {dashboardPetsData && dashboardPetsData.defaultPet ? dashboardPetsData.defaultPet : undefined}
                            petsArray = {dashboardPetsData && dashboardPetsData.totalPets ? dashboardPetsData.totalPets : undefined}
                            activeSlides = {props.activeSlide}
                            isFromScreen = {'Dashboard'}
                            dismissSearch = {props.isSearchDropdown}
                            setValue={(pObject) => { refreshDashBoardDetails(pObject)}}
                            selectedPetAction={(pObject) => { selectedPetAction(pObject)}}
                            editPetAction = {editPetAction}
                        />

                    </View>

                    <View style={{alignItems:'center'}}>

                        {(dashboardPetsData && !dashboardPetsData.isDeviceMissing) && (dashboardPetsData && !dashboardPetsData.isDeviceSetupDone) ? <View style = {{height:hp('6%'),width:wp('92.7%'),backgroundColor:'#FFEDED',marginBottom: hp('1%'),borderRadius:15,borderColor:'#F55454',borderWidth:0.5,alignitems:'center',}}>
                            
                            <TouchableOpacity style={{flexDirection:'row'}} onPress={() => {deviceSetupMissingActions(16)}}>
                                <View style={{justifyContent:'center',height:hp('6%'),width:wp('15%'),alignitems:'center',alignSelf:'center'}}>
                                    {props.devModel && (props.devModel==='AGL2' || props.devModel==='CMAS') ? <DeviceAglImg width = {wp('9%')} style={Platform.isPad ? [devMissImgStyle,{alignSelf:'center'}] :[devMissImgStyle,{alignSelf:'center'}]}/> : <DeviceHPNIMG width = {wp('9%')} style={Platform.isPad ? [devMissImgStyle,{alignSelf:'center'}] :[devMissImgStyle,{alignSelf:'center'}]}/>}
                                </View>
                                <View style={{justifyContent:'center'}}>
                                    <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('73%')}}>
                                        <Text style={[devTextStyle,{color: 'red'}]}>{'SENSOR SETUP PENDING'}</Text>
                                        <RightArrowImg fill={'red'} width={wp("5%")} height={hp("1.5%")}/>                                 
                                    </View>
                                    <Text style={[devTextStyle,{}]}>{Constant.SETUP_SENSOR_TUTORIAL_TEXT}</Text>
                                </View>
                            </TouchableOpacity>
                        </View> : null}

                        {(dashboardPetsData && dashboardPetsData.isDeviceMissing) ? <View style = {{height:hp('6%'),width:wp('92.7%'),backgroundColor:'#FFEDED',marginBottom: hp('1%'),borderRadius:15,borderColor:'#F55454',borderWidth:0.5,alignitems:'center',flexDirection:'row'}}>
                            <TouchableOpacity style={{flexDirection:'row'}} onPress={() => {deviceSetupMissingActions(17)}}>
                                <View style={{justifyContent:'center',marginLeft:hp('2%')}}>
                                    <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('85%')}}>
                                        <Text style={[devTextStyle,{color: 'red'}]}>{'DEVICE MISSING'}</Text>
                                        <RightArrowImg fill={'red'} width={wp("5%")} height={hp("1.5%")}/>                                        
                                    </View>
                                    <Text style={[devTextStyle1,{}]}>{Constant.ADD_SENSOR_TUTORIAL_TEXT}</Text>
                                </View>
                            </TouchableOpacity>
                        </View> : null}

                        {((dashboardPetsData && !dashboardPetsData.isDeviceMissing)) && ( petPermissionsData && petPermissionsData.isFmGoalSet) ||(petPermissionsData && petPermissionsData.isFmGraph) || (petPermissionsData && petPermissionsData.isWeightPer )|| (petPermissionsData && petPermissionsData.isSleepGraph) || (petPermissionsData && petPermissionsData.isFoodHistory) ? <View style={[tabViewStyle,{marginBottom:hp('-2%')}]}>

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

                        <View style={{alignItems:'center',marginTop: petPermissionsData && petPermissionsData.isTimer || props.uploadStatus || props.questUploadStatus ? hp('1%') : hp('0%')}}>

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

                        {dashboardPetsData && dashboardPetsData.isDeceased ? <View style={{width:wp('90%'),height:hp('50%'), alignSelf:'center',justifyContent:'center'}}>
                            
                            <View style={[buttonstyle]}>
                                <Text style={[btnTextStyle,{color:'black',textAlign:'center'}]}>{Constant.DECEASED_PET_INFO_DASHBOARD}</Text>
                            </View>

                        </View> : null}

                    </View>

                </View>}

                {dashboardPetsData && dashboardPetsData.isDeceased ? null :(dashboardPetsData && dashboardPetsData.isFirstUser ? <View style={[CommonStyles.bottomViewComponentStyle,{height:Platform.OS === 'android' ? hp('10%') : hp('13%')}]}>
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