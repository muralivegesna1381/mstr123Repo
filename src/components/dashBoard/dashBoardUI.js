import React, { useState, useEffect,useRef } from 'react';
import {View,ScrollView,Text,Image,TouchableOpacity,ImageBackground,Linking,ActivityIndicator,FlatList,Platform} from 'react-native';
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

let dogSetupMissingImg = require("../../../assets/images/dogImages/dogImg5.svg");
let catSetupMissingImg = require("../../../assets/images/dogImages/catImg5.svg");
let leftSignImg = require("../../../assets/images/dashBoardImages/svg/leftSign.svg");
let rightSignImg = require("../../../assets/images/dashBoardImages/svg/rightSign.svg");

const  DashBoardUI = ({route, ...props }) => {

    const [dashboardViewArray, set_dashboardViewArray] = useState([{'id':2, 'name':'Tasks'}]);
    const [dbrdFeatureArray, set_dbrdFeatureArray] = useState([]);

    const[activeItem, set_activeItem] = useState(0);
    const [tabItem, set_tabItem] = useState(1);
    const carouselRef = useRef(null);
    const carouselFeatureRef = useRef(null);
    const tabItemRef = useRef(1);
    const [isScrollEndReached, set_isScrollEndReached] = useState(null);
    const flatDBRef = useRef(null);

    useEffect(() => {

        prepareSliderWidgets(props.isCaptureImages,props.isEatingEnthusiasm,props.isImageScoring,props.isPetWeight,props.weight,props.weightUnit,props.defaultPetObj);

    }, [props.isCaptureImages,props.isEatingEnthusiasm,props.isImageScoring,props.isPetWeight,props.weight,props.weightUnit,props.defaultPetObj]);

    const prepareSliderWidgets = async (isCaptureImages,isEatingEnthusiasm,isImageScoring,isPetWeight,weight,weightUnit,dPet) => {

        let tempArr = [];
        let obj;
        let isCapture = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_CAPTURE_IMGS);
        // set_dbrdFeatureArray([]);
        if(isCapture && parseInt(isCapture) === 67 && dPet && parseInt(dPet.speciesId) === 1) {
            
            obj = {'id':1, 'action':'Capture Images', 'text1':'Capture','text2':'Images For','text3':'Scoring','bColor':'#FFF7ED','brColor':'#F5B054','imgPath':require('./../../../assets/images/dashBoardImages/svg/dog-bfi.svg')}
            tempArr.push(obj);
        } 
        if(isImageScoring) {
            
            obj = {'id':2, 'action':'Score Pet', 'text1':'Score your','text2':'pets body','text3':'condition','bColor':'#F1F0FD','brColor':'#5A02FF','imgPath':require('./../../../assets/images/dashBoardImages/svg/body_condition.svg')}
            tempArr.push(obj);
        } 
        
        if(isEatingEnthusiasm) {

            obj = {'id':3, 'action':'Eating Enthusiasim', 'text1':'How enthusiastic','text2':'is your pet at','text3':'mealtime?','bColor':'#F5FCFA','brColor':'#2AC779','imgPath':require('./../../../assets/images/dashBoardImages/svg/slider-food.svg')}
            tempArr.push(obj);
        } 
        if(isPetWeight) {
            
            obj = {'id':4, 'action':'Pet Weight', 'text1':'Is your Pet','text2':'Fluffy or Fit?','text3':weight ? weight + ' ' + (weightUnit ? weightUnit : '' ) : '------','bColor':'#F5F9FC','brColor':'#2A97C7','imgPath':require('./../../../assets/images/dashBoardImages/svg/dog-weight.svg')}
            tempArr.push(obj);
        }

        
        setTimeout(() => {  
            // set_isFirstLoad(false);
            set_isScrollEndReached(false);
            flatDBRef?.current?.scrollToIndex({
                animated: true,
                index: 0,
            });
            // if(tempArr.length < 2) {
            //     set_isScrollEndReached(false)
            // }
        }, 500)
        set_dbrdFeatureArray(tempArr);

    };

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

     // Firmware button action
     const firmwareUpdateAction = () => {
        props.firmwareUpdateAction();
    };

    // Edit Weight button action
    const weightAction = () => {
        props.weightAction();
    };

    // EnthusiasticAction button action
    const enthusiasticAction = () => {
        props.enthusiasticAction('EatingEnthusiasticComponent');
    };

    // Imagebase scoring button action
    const imageScoreAction = () => {
        props.imageScoreAction();
    };

    // Questionnaire button action
    const quickQuestionAction = (item) => {        
        props.quickQuestionAction(item);       
    };

    // Question button action
    const quickQuestionnaireAction = () => {
        props.quickQuestionnaireAction();
    };

    // Based on title navigates to particular feature
    const nextButtonAction = (value) => {
        props.setupDeviceAction(value);       
    };

    function replaceCommaLine(data) {
        let dataToArray = data.split('#').map(item => item.trim());
        return dataToArray.join("\n");
    };

    const actionOnRow = (item,index) => {
        props.supportBtnAction(item);      
    };

    const internetBtnAction = async () => {
        props.internetBtnAction();
    };

    const internetQuestBtnAction = async () => {
        props.internetQuestBtnAction();
    };

    const devicesSelectionAction = () => {
        props.devicesSelectionAction();
    };

    const renderScrollItem = (index) => {
        set_tabItem(index+1)
        tabItemRef.current = index;
        carouselRef.current.snapToItem(index);
    };

    const renderScrollFeatureItem = (index) => {
        // set_tabItem(index+1)
        set_activeItem(index);
        carouselFeatureRef.current.snapToItem(index);
    };

    const captureImages = () => {
        props.captureImages();
    };

    const foodRecommand = () => {
        props.foodRecommand();
    };

    const featureActions = (item) => {
        props.featureActions(item);
    };

        // flat list end listener
    const handleEndReached = (event) => {

        // if(!isFirstLoad) {
        //     set_isScrollEndReached(true); 
        // }
        set_isScrollEndReached(true); 
    };
    
    //flat list start listener
    const handleStartReached = (event) => {
        const { contentOffset } = event.nativeEvent;
        if (contentOffset.x === 0) {
            set_isScrollEndReached(false); 
        }
    };

    const getPagination = () => {

        return (
            <Pagination
              dotsLength={dbrdFeatureArray ? dbrdFeatureArray.length : 0}
              activeDotIndex={activeItem}
              containerStyle={{marginTop:-25}}
              dotStyle={{
                  width: 8,
                  height: 8,
                  borderRadius: 5,
                  marginHorizontal: -5,
                  backgroundColor: '#29C779'
              }}
              inactiveDotStyle={{
                width: 8,
                height: 8,
                borderRadius: 5,
                marginHorizontal: -5,
                backgroundColor: 'grey'
              }}
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.9}
            />
        );
    };

    // DashBoard page Styles
    const {
        mainComponentStyle,
        headerView,
        firstTimeUserStyle,
        ftTopViewStyle,
        ftdownViewStyle,
        ftHeaderHeader1,
        ftHeaderHeader2,
        ftHeaderHeader3,
        ftHeaderHeader4,
        ftytLnksHeaderHeader,
        ytLinkViewStyle,
        youTubeThumbs,
        leadeBoardStyle,
        buttonstyle,
        btnTextStyle,
        missingTextStyle,
        missingTextStyle1,
        missingBackViewStyle,
        missingDogImgStyle,
        missingCatImgStyle,
        quickselctionViewStyle,
        quickActionsInnerViewStyle,
        quickbtnInnerImgStyle,
        quickbtnInnerTextStyle,
        progressStyle,
        name,
        flatcontainer,
        meterialViewStyle,
        flatcontainer1,
        backdrop,
        playIconStyle,
        backdrop1,
        alertTextStyle,
        questCountTextStyle,
        dashboardViewStyle,
        tyleViewStyle,
        tylebckViewStyle,
        questBackViewStyle,
        questArrowStyle,
        questBackStyle,
        questHeaderTextStyle,
        questArrowImgStyle,
        questSubHeaderTextStyle,
        questDogImgStyle,
        sliderTextStyle,
        tyleActivityStyle,
        activityHeaderTextStyle,
        foodImgImgStyle,
        activityFoodTextStyle,
        activityFoodTextStyle1,
        uploadTextStyle,
        uploadSubTextStyle
    } = DashBoardStyles;

    const renderDashboardItem = ({item, index}) => {

        return (
            <View style={[dashboardViewStyle,{backgroundColor:item.id === 1 ? 'white':'white'}]}>
                {item.id === 1 ? renderActivityView() : renderTasksView()}
            </View>
        );
    }

    const renderFeatureItems = ({item,index}) => {

        return (

            <TouchableOpacity onPress={() => {featureActions(item)}}>
                            
                <View style ={[tyleViewStyle,{backgroundColor:item.bColor,borderColor:item.brColor,alignItems:'flex-end',marginRight: index === dbrdFeatureArray.length - 1 ? wp('0%') : wp('3%')}]}>

                    <View style={{flex:3,marginLeft:wp('3%'),height:hp('10%'),justifyContent:'center',}}>
                        <View style={{justifyContent:'center',}}>
                            <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text1}</Text>
                            <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text2}</Text>
                            <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text3}</Text>
                        </View>
                                    
                        <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={[questArrowImgStyle,{tintColor : item.brColor,marginTop:hp('0.5%')}]}></Image>

                    </View>

                    <View style={{flex:1,justifyContent:'flex-end',justifyContent:'flex-end',marginBottom:item.id === 3 ? hp('1.2%') : hp('2.5%')}}>
                        <Image source={item.imgPath} style={[questDogImgStyle,{marginLeft:wp('-4%')}]}></Image>
                    </View>

                </View>
                            
            </TouchableOpacity>
                            
        )
    }

    const renderActivityView = () => {

        return (
    
            <View style = {{marginBottom:hp('27%'),alignItems:'center',marginTop:hp('2%')}}>

                <ScrollView showsVerticalScrollIndicator={false}>

                    <View style = {{width:wp('90%'),justifyContent:'center'}}>

                    <Text style={[activityHeaderTextStyle]}>{'Daily Behavior'}</Text>
                    <View style = {{flexDirection:'row', justifyContent:'space-between',marginTop:hp('2%')}}>
                        <View style = {tyleActivityStyle}>

                        </View>

                        <View style = {tyleActivityStyle}>

                        </View>
                    </View>

                </View>

                <View style = {{width:wp('90%'),justifyContent:'center',marginTop:hp('2%')}}>

                    <Text style={[activityHeaderTextStyle]}>{'Forward Motion Goal'}</Text>
                    <View style = {{flexDirection:'row', justifyContent:'space-between',marginTop:hp('2%')}}>
                        <View style = {[tyleActivityStyle,{width:wp('90%')}]}>

                        </View>
                    </View>

                </View>

                <View style = {{width:wp('90%'),justifyContent:'center',marginTop:hp('2%')}}>

                    <Text style={[activityHeaderTextStyle]}>{'Weight'}</Text>
                    <View style = {{flexDirection:'row', justifyContent:'space-between',marginTop:hp('2%')}}>
                        <View style = {[tyleActivityStyle,{width:wp('90%'),height:hp('25%')}]}>

                        </View>
                    </View>

                </View>

                <View style = {[tyleActivityStyle,{width:wp('90%'),height:hp('6%'),justifyContent:'center',marginTop:hp('2%'),alignItems:'center'}]}>

                    <View style = {{flexDirection:'row', justifyContent:'space-between',width:wp('85%')}}>

                        <View style = {{flex:1,height:hp('6%'),alignItems:'center'}}>
                            <Image source={require('./../../../assets/images/dashBoardImages/svg/home-food.svg')} style={[foodImgImgStyle,{}]}></Image>
                        </View>

                        <View style = {{flex:3,height:hp('6%'),justifyContent:'center'}}>
                            <Text style={[activityFoodTextStyle]}>{'Recommended Food for Today'}</Text>
                            <Text style={[activityFoodTextStyle1]}>{'500 Grms'}</Text>
                        </View>

                        <View style = {{flex:0.7,height:hp('6%'),justifyContent:'center'}}>

                        <TouchableOpacity style={{alignItems:'center'}} onPress={() => {foodRecommand()}}>
                            <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={[questArrowImgStyle,{}]}></Image>
                        </TouchableOpacity>
                        </View>

                    </View>

                </View>

                {!props.isDeviceMissing && props.isDeviceSetupDone ? <View style = {{marginTop:hp('2%')}}>

                        <ImageBackground style={quickselctionViewStyle} resizeMode="stretch" source={require("../../../assets/images/dashBoardImages/png/quickGradient.png")}>

                            {props.isTimerEnable && !props.isModularityService ? <View style={quickActionsInnerViewStyle}>
                                <TouchableOpacity style={{alignItems:'center'}} onPress={() => {quickSetupAction('Timer')}}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/dashTimerIcon.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('2%')}] :[quickbtnInnerImgStyle]}/>
                                    <Text style={quickbtnInnerTextStyle}>{"TIMER"}</Text>
                                </TouchableOpacity>                          
                            </View> : (props.isModularityService ? <View style={quickActionsInnerViewStyle}><ActivityIndicator size="small" color="gray"/></View> : null)}

                            {props.isObsEnable && !props.isModularityService ? <View style={quickActionsInnerViewStyle}>
                                <TouchableOpacity style={{alignItems:'center'}} onPress={() => {quickSetupAction('Quick Video')}}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/dashQuickVideo.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle]}/>
                                    <Text style={quickbtnInnerTextStyle}>{"QUICK VIDEO"}</Text>
                                </TouchableOpacity>                          
                            </View> : (props.isModularityService ? <View style={quickActionsInnerViewStyle}><ActivityIndicator size="small" color="gray"/></View> : null)}

                            {!props.isDeviceMissing && props.isDeviceSetupDone ? <View style={quickActionsInnerViewStyle}>
                                <TouchableOpacity style={{alignItems:'center'}} onPress={() => {quickSetupAction('Chat')}}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/chatIcon.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle]}/>
                                    <Text style={quickbtnInnerTextStyle}>{"CHAT"}</Text>
                                </TouchableOpacity>                          
                            </View> :  null}

                            <View style={quickActionsInnerViewStyle}>
                                <TouchableOpacity style={{alignItems:'center'}} onPress={() => {quickSetupAction('Support')}}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/chatQuickIcon.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle]}/>
                                    <Text style={quickbtnInnerTextStyle}>{"SUPPORT"}</Text>
                                </TouchableOpacity>                          
                            </View>

                        </ImageBackground>

                    </View> : null}
                </ScrollView>

            </View>
    
        );
    }

    const renderTasksView = () => {

        return (
    
            <View style = {{justifyContent:'center',marginBottom: hp('12%'),marginTop:Platform.isPad ? (props.isTimer ? hp('-2%') : hp('-1%')) : hp('-1.5%')}}>

                <ScrollView showsVerticalScrollIndicator={false}>

                    {props.uploadStatus ? <View style={{width:wp('100%'),height:Platform.isPad ? hp('12%') : hp('10%'),alignItems:'center',justifyContent:'center',backgroundColor:'#818588',marginBottom: props.questUploadStatus ? hp('0%') : hp('1%')}}>

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
                                    
                        <View style={{width:wp('90%'),height:hp('6%'),flexDirection:'row'}}>

                            <View style={{width:wp('60%'),height:hp('6%'),justifyContent:'center'}}>
                                <Text style={[uploadTextStyle,{color:'white'}]}>{'Observation : '+(props.observationText && props.observationText.length > 15 ? props.observationText.replace('/r','/').slice(0, 15)+"..." : props.observationText)}</Text>
                                <Text style={[uploadSubTextStyle,{color:'white',marginTop:hp('1%')}]}>{props.uploadStatus + " "+ props.fileName}</Text>
                            </View>

                            <View style={{width:wp('30%'),height:hp('6%'),alignItems:'center',justifyContent:'center'}}>

                                <View style={{width:wp('12%'),aspectRatio:1,backgroundColor:'#000000AA',borderRadius:100,borderColor:'#6BC100',borderWidth:2,alignItems:'center',justifyContent:'center'}}>
                                    <Text style={progressStyle}>{props.uploadProgress}</Text>
                                </View>

                                <Text style={{color:'white'}}>{props.progressTxt}</Text>
                                        
                            </View>

                        </View>}

                    </View> : null}

                    {props.questUploadStatus ? <View style={{width:wp('100%'),marginBottom:hp('1%'),height:Platform.isPad ? hp('12%') : hp('10%'),alignItems:'center',justifyContent:'center',backgroundColor:'#2E2E2E'}}>

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
                                    
                        <View style={{width:wp('90%'),height:hp('6%'),flexDirection:'row'}}>

                            <View style={{width:wp('60%'),height:hp('6%'),justifyContent:'center'}}>
                                <Text style={[uploadTextStyle,{color:'white'}]}>{'Questionnaire : '+(props.questText && props.questText.length > 15 ? props.questText.replace('/r','/').slice(0, 15)+"..." : props.questText)}</Text>
                                <Text style={[uploadSubTextStyle,{color:'white',marginTop:hp('1%')}]}>{props.questUploadStatus + " "+ props.questFileName}</Text>
                            </View>

                            <View style={{width:wp('30%'),height:hp('6%'),alignItems:'center',justifyContent:'center'}}>

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

                    {(!props.isDeviceMissing && props.isDeviceSetupDone && dbrdFeatureArray.length > 0) ? <View style={[tylebckViewStyle,{alignItems:'center',marginTop: props.questUploadStatus || props.questUploadStatus ? hp('0.5%'): (props.isTimer && (!props.uploadStatus) && props.isTimer && (!props.questUploadStatus) ? hp('1%') : hp('0.5%')),}]}>

                        {/* <ScrollView snapToAlignment={"start"} style={{width:wp('93.5%'), alignSelf:'center'}} horizontal = {true} showsHorizontalScrollIndicator={false}> */}

                            <View style ={{flexDirection:'row'}}>
                                {/* {renderFeatureItems()} */}
                                <FlatList
                                    // style={{backgroundcolor:'green'}}
                                    ref={flatDBRef}
                                    data={dbrdFeatureArray}
                                    horizontal = {true}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    renderItem={renderFeatureItems}
                                    onScroll={handleStartReached}
                                    onEndReached={handleEndReached}
                                    enableEmptySections={true}
                                    keyExtractor={(item) => item.titleOrQuestion}
                                />
                            </View>

                        {/* </ScrollView>  */}

                    </View> : null}

                    {dbrdFeatureArray && dbrdFeatureArray.length > 2 ? <View>
                        {/* {getPagination()} */}
                        <View style = {{flexDirection:'row',width:wp('93.5%'),alignSelf:'center',justifyContent:'center', marginTop:Platform.isPad ? hp('1%') : hp('0.5%')}}>
                            {<Image source={require('./../../../assets/images/dashBoardImages/svg/arrow-black-left.svg')} style={Platform.isPad ? [questArrowImgStyle ,{width: wp("5%"),height: hp("1.5%"),tintColor:'black',marginRight:wp('1.5%')}] : [questArrowImgStyle,{tintColor:'black',marginRight:wp('1.5%')}]}></Image>}
                            <Image source={!isScrollEndReached ? leftSignImg : rightSignImg} style={Platform.isPad ? [questArrowImgStyle ,{width: wp("5%"),height: hp("1.5%"),tintColor:'black',marginRight:wp('1.5%')}] : [questArrowImgStyle,{tintColor:'black'}]}></Image>
                            { <Image source={require('./../../../assets/images/dashBoardImages/svg/arrow-black-right.svg')} style={Platform.isPad ? [questArrowImgStyle ,{width: wp("5%"),height: hp("1.5%"),tintColor:'black',marginLeft:wp('1.5%'),marginRight:wp('0.5%')}] : [questArrowImgStyle,{tintColor:'black',marginLeft:wp('1.5%')}]}></Image>}
                        </View>
                    </View> : null}

                    {props.isQuestionnaireEnable && props.questionnaireData && props.questionnaireData.length > 0 ? <View style={Platform.isPad ? [questBackViewStyle,{marginTop:hp('4%'),}] : [questBackViewStyle,{marginTop:dbrdFeatureArray.length > 0 ? (dbrdFeatureArray.length > 2 ? hp('1%') : hp('2%')) : hp('2%')}]}>

                        <View style={{flexDirection:'row'}}>
                            <View style={[questBackStyle,{justifyContent:'center'}]}>

                                <View style={{justifyContent:'center',marginLeft: wp("2%")}}>
                                    <Text style={[questHeaderTextStyle]}>{'Questionnaires'}</Text>
                                </View>

                                <View style = {{flexDirection:'row',marginLeft: wp("2%")}}>
                                    <View style = {{flexDirection:'row',marginRight: wp("12%"),}}> 
                                        <Text style={[questCountTextStyle,]}>{props.questionnaireDataLength < 10 && props.questionnaireDataLength !== 0 ? '0'+props.questionnaireDataLength : props.questionnaireDataLength}</Text>
                                        <View style={{justifyContent:'flex-end',marginBottom: hp("0.5%")}}>
                                            <Text style={[questSubHeaderTextStyle,{color:'#6BC100',marginLeft: wp("1%")}]}>{'Open'}</Text>
                                        </View>
                                    </View>
                                    <View style = {{flexDirection:'row'}}> 
                                    <Text style={[questCountTextStyle,{color:'#FF9202'}]}>{props.questSubmitLength < 10 && props.questSubmitLength !== 0 ? '0'+props.questSubmitLength : props.questSubmitLength}</Text>
                                        <View style={{justifyContent:'flex-end',marginBottom: hp("0.5%")}}>
                                            <Text style={[questSubHeaderTextStyle,{color:'#FF9202',marginLeft: wp("1%")}]}>{'Completed'}</Text>
                                        </View>
                                    </View>
                                </View>

                            </View>

                            <View style={questArrowStyle}>

                                <TouchableOpacity style={{width:wp("15%"),marginTop : Platform.isPad ? hp("1%") : hp("1.6%")}} onPress={() => {quickQuestionnaireAction()}}>
                                    <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={Platform.isPad ? [questArrowImgStyle ,{width: wp("5%"),height: hp("1.5%"),}] : [questArrowImgStyle, {marginLeft: wp("-2%"),}]}></Image>
                                </TouchableOpacity>
                    
                            </View>

                        </View>
                        
                    </View> : null}

                    {props.isPTEnable && !props.isDeviceMissing && props.isDeviceSetupDone? <View style={Platform.isPad ? [leadeBoardStyle,{height:hp('38%'),}] : [leadeBoardStyle]}>
                        <LeaderBoardService
                            leaderBoardArray = {props.leaderBoardArray}
                            leaderBoardPetId = {props.leaderBoardPetId}
                            leaderBoardCurrent = {props.leaderBoardCurrent}
                            campagainName = {props.campagainName}
                            campagainArray = {props.campagainArray}
                            currentCampaignPet = {props.currentCampaignPet}
                            isSwipedModularity = {props.isSwipedModularity}
                            isPTDropdown = {props.isPTDropdown}
                            enableLoader = {props.enableLoader}
                            ptActivityLimits = {props.ptActivityLimits}
                        ></LeaderBoardService>

                    </View> : (props.isPTLoading ? <View style={{height:hp('3%'),justifyContent:'center'}}><ActivityIndicator size="small" color="gray"/></View> : null)} 

                    {!props.isDeviceMissing && props.isDeviceSetupDone ? <View style={{marginTop: Platform.isPad ? hp('1.5%') : hp('1%')}}>

                        <ImageBackground style={quickselctionViewStyle} resizeMode="stretch" source={require("../../../assets/images/dashBoardImages/png/quickGradient.png")}>

                            {props.isTimerEnable && !props.isModularityService ? <View style={quickActionsInnerViewStyle}>
                                <TouchableOpacity style={{alignItems:'center'}} onPress={() => {quickSetupAction('Timer')}}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/dashTimerIcon.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle]}/>
                                    <Text style={[quickbtnInnerTextStyle]}>{"TIMER"}</Text>
                                </TouchableOpacity>                          
                            </View> : (props.isModularityService ? <View style={quickActionsInnerViewStyle}><ActivityIndicator size="small" color="gray"/></View> : null)}

                            {props.isObsEnable && !props.isModularityService ? <View style={quickActionsInnerViewStyle}>
                                <TouchableOpacity style={{alignItems:'center'}} onPress={() => {quickSetupAction('Quick Video')}}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/dashQuickVideo.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle,{width:wp('5%')}]}/>
                                    <Text style={quickbtnInnerTextStyle}>{"QUICK VIDEO"}</Text>
                                </TouchableOpacity>                          
                            </View> : (props.isModularityService ? <View style={quickActionsInnerViewStyle}><ActivityIndicator size="small" color="gray"/></View> : null)}

                            {!props.isDeviceMissing && props.isDeviceSetupDone ? <View style={quickActionsInnerViewStyle}>
                                <TouchableOpacity style={{alignItems:'center'}} onPress={() => {quickSetupAction('Chat')}}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/chatIcon.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle]}/>
                                    <Text style={quickbtnInnerTextStyle}>{"CHAT"}</Text>
                                </TouchableOpacity>                          
                            </View> :  null}

                            <View style={quickActionsInnerViewStyle}>
                                <TouchableOpacity style={{alignItems:'center'}} onPress={() => {quickSetupAction('Support')}}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/chatQuickIcon.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle]}/>
                                    <Text style={quickbtnInnerTextStyle}>{"SUPPORT"}</Text>
                                </TouchableOpacity>                          
                            </View>

                        </ImageBackground>

                    </View> : null}

                </ScrollView>

            </View>
    
        );
    }

    const renderMeterials = ({ item, index }) => {
        return (

            <View style={flatcontainer1}>

                <TouchableOpacity onPress={() => actionOnRow(item,index)}>
                    <View style={meterialViewStyle}>
                        {item.materialTypeId === 1 ? 
                        (item.thumbnailUrl ? <ImageBackground source={{uri:item.thumbnailUrl}} style={backdrop} imageStyle={{borderRadius:5}}>
                            <Image source={require('./../../../assets/images/otherImages/svg/play.svg')} style={playIconStyle}></Image>
                        </ImageBackground> : 
                        
                        <ImageBackground source={require("./../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg")} style={backdrop} imageStyle={{borderRadius:5}}>
                            {item.materialTypeId === 1 ? <Image source={require('./../../../assets/images/otherImages/svg/play.svg')} style={playIconStyle}></Image> : null}
                        </ImageBackground> )
                        : 
                        <ImageBackground source={require("./../../../assets/images/otherImages/svg/pdf.svg")} style={backdrop1} imageStyle={{borderRadius:5}}>
                        </ImageBackground>}

                        <Text numberOfLines={2} style={[name]}>{item.titleOrQuestion && item.titleOrQuestion.length>35 ? item.titleOrQuestion.slice(0,35)+'...' : item.titleOrQuestion}</Text>
                    </View>
                </TouchableOpacity>

            </View>
            
        );
    };

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
                
                <View style={firstTimeUserStyle}>

                    <View style={ftTopViewStyle}>
                        <Text style={ftHeaderHeader1}>{'Welcome'}</Text>
                        <Text style={ftHeaderHeader2}>{props.firstName}</Text>
                        <Text style={ftHeaderHeader3}>{props.secondName}</Text>
                        <Text style={[ftHeaderHeader4]}>{'In order to get the most benefit from this app, we recommend onboarding your pet. Please watch the below videos to learn how to onboard your pet'}</Text>
                    </View>

                    <View style={ftdownViewStyle}>

                        <TouchableOpacity onPress={() => Linking.openURL('https://youtube.com/shorts/E8WP3Gt2Uek?feature=share')}>
                            <View style={ytLinkViewStyle}>
                                
                                <Image source={require("./../../../assets/images/otherImages/png/fUserMultiplePets.png")} style={youTubeThumbs}/>
                                <Text style={[ftytLnksHeaderHeader]}>{'How to Set Up Multiple Pets'}</Text>

                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => Linking.openURL('https://youtu.be/zg9aCENCOt4')}>
                            <View style={ytLinkViewStyle}>
                            
                                <Image source={require("./../../../assets/images/otherImages/svg/hpn1First.svg")} style={youTubeThumbs}/>
                                <Text style={[ftytLnksHeaderHeader]}>{'How to Charge the Sensor'}</Text>

                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => Linking.openURL('https://youtu.be/ykwPApENJMw')}>
                            <View style={ytLinkViewStyle}>
                            
                                <Image source={require("./../../../assets/images/otherImages/svg/hpn1First.svg")} style={youTubeThumbs}/>
                                <Text style={[ftytLnksHeaderHeader]}>{'How to Setup the Sensor'}</Text>

                            </View>
                        </TouchableOpacity>

                    </View>

                </View> : 
                
                <View style = {{height:props.isDeviceMissing || !props.isDeviceSetupDone || props.isFirstUser ? hp('75%') : hp('90%')}}>

                    <View style={[CommonStyles.petsSelViewHeaderStyle,{marginBottom:hp('1%')}]}>

                        <PetsSelectionCarousel
                            petsArray={props.petsArray}
                            isSwipeEnable = {true}
                            defaultPet = {props.defaultPetObj}
                            activeSlides = {props.activeSlide}
                            isFromScreen = {'Dashboard'}
                            setValue={(pObject) => {
                                refreshDashBoardDetails(pObject);
                            }}
                            editPetAction = {editPetAction}
                        />

                    </View>

                    <View style={{marginTop: props.isTimer ? (Platform.isPad ? hp('14%') : hp('11.5%')) : hp('0%'), marginBottom: !props.isDeviceSetupDone || props.isDeviceMissing ? hp('18%') : hp('1%'),}}>

                        
                        {/* {!props.isDeviceMissing && props.isDeviceSetupDone ? <View style={tabViewStyle}>

                            <TouchableOpacity style={[tabItemRef.current === 0 ? tabViewEnableBtnStyle : tabViewBtnStyle]} onPress={() => {tabItemRef.current = 0,carouselRef.current.snapToItem(0)}}>
                                <Text style={[tabBtnTextStyle]}>{'Activity'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[tabItemRef.current === 1 ? tabViewEnableBtnStyle : tabViewBtnStyle]} onPress={() => {tabItemRef.current = 1,carouselRef.current.snapToItem(1);}}>
                                <Text style={[tabBtnTextStyle,{marginRight:hp('0.2%')}]}>{'Tasks'}</Text>
                            </TouchableOpacity>
                                
                        </View> : null} */}

                        {!props.isDeviceMissing && props.isDeviceSetupDone ? <View style={{alignItems:'center',marginTop:props.isTimer || props.uploadStatus || props.questUploadStatus ? hp('1%') : hp('0%')}}>

                            {/* <Carousel
                                ref={carouselRef}
                                data={dashboardViewArray}
                                renderItem={renderDashboardItem}
                                sliderWidth={wp('100%')}
                                itemWidth={wp('100%')} 
                                // itemHeight={hp('100%')}
                                // sliderHeight={hp('100%')}
                                showthumbs = {false}
                                layout={'default'}
                                activeSlideAlignment = {'start'}
                                firstItem={tabItemRef.current}
                                hasParallaxImages={true}
                                onSnapToItem={data => renderScrollItem(data)}
                                inactiveSlideOpacity = {1}
                                useScrollView={true}
                                enableSnap = {true}
                            /> */}
                            {renderTasksView()}
                        </View> : null}

                        {props.isDeceased ? <View style={{width:wp('90%'),height:hp('50%'), alignSelf:'center',justifyContent:'center'}}>
                            
                            <View style={[buttonstyle]}>
                                <Text style={[btnTextStyle,{color:'black',textAlign:'center'}]}>{'Some App features are restricted for this pet. \nPlease reach out to the customer support for more details.'}</Text>
                            </View>

                        </View> : (props.isDeviceMissing || !props.isDeviceSetupDone ? <View style={{width:wp('100%'), alignSelf:'center'}}>

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
                            <Image source={props.defaultPetObj && props.defaultPetObj.speciesId && parseInt(props.defaultPetObj.speciesId) === 1 ? dogSetupMissingImg : catSetupMissingImg} style={props.defaultPetObj && props.defaultPetObj.speciesId && parseInt(props.defaultPetObj.speciesId) === 1 ? [missingDogImgStyle] : [missingCatImgStyle]}/>
                            <View style={[buttonstyle]}>
                               <Text style={[btnTextStyle]}>{props.isDeviceMissing ? 'DEVICE MISSING' : !props.isDeviceSetupDone ? 'SETUP PENDING' : ''}</Text>
                            </View>

                            <View style={missingBackViewStyle}>
                        
                                <Text style={missingTextStyle}>{props.deviceStatusText}</Text>
                                {props.supportMetialsArray && props.supportMetialsArray.length > 0 ? <Text style={missingTextStyle1} onPress={ ()=>                    
                                    Linking.openURL(replaceCommaLine('mailto:support@wearablesclinicaltrials.com?subject=Support&body='))}>{<Highlighter
                                    highlightStyle={{color: 'blue',textDecorationLine: 'underline'}}
                                    searchWords={['wearables support']}
                                    textToHighlight={replaceCommaLine('If you are facing any difficulty in setting your sensor up, please go through the below items or contact wearables support.')}
                                />}</Text> : null}

                                <FlatList
                                    style={flatcontainer}
                                    data={props.supportID && props.supportID === 16 ? props.supportSPendingArray : props.supportDMissingArray}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={renderMeterials}
                                    enableEmptySections={true}
                                    keyExtractor={(item) => item.titleOrQuestion}
                                    numColumns={3}
                                />

                            </View>

                        </View> : null)}

                    </View>

                </View>}

                {props.isDeceased ? null :(props.isDeviceMissing || !props.isDeviceSetupDone || props.isFirstUser ? <View style={[CommonStyles.bottomViewComponentStyle,{height:Platform.OS === 'android' ? hp('10%') : hp('13%')}]}>
                    <BottomComponent
                        rightBtnTitle = {props.buttonTitle}
                        isLeftBtnEnable = {false}
                        rigthBtnState = {true}
                        isRightBtnEnable = {true}
                        rightButtonAction = {async () => nextButtonAction(props.buttonTitle)}
                    />
                </View> : null)}    

                {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
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
                {props.isLoading === true ? <LoaderComponent isLoader={false} loaderText = {props.loaderMsg} isButtonEnable = {false} /> : null} 
        </View>
    );
  }
  
  export default DashBoardUI;