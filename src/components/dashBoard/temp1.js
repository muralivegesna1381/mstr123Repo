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
import moment from "moment";
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import Highlighter from 'react-native-highlight-words';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import { VIDEO_PATH_OBSERVATION } from '../../utils/constants/constant';

let imageScoreDogImg = require("../../../assets/images/otherImages/png/imageScaleDogBckImg.png");
let imageScoreCatImg = require("../../../assets/images/otherImages/png/imageScaleCatBckImg.png");
let eatingDogBckImg = require("../../../assets/images/otherImages/png/eatingDogBackImg.png");
let eatingCatBckImg = require("../../../assets/images/otherImages/png/eatingCatBackImg.png");
let dogSetupMissingImg = require("../../../assets/images/dogImages/dogImg5.svg");
let catSetupMissingImg = require("../../../assets/images/dogImages/catImg5.svg");

const  DashBoardUI = ({route, ...props }) => {

    const [questUploadStatus, set_questUploadStatus] = useState(undefined);
    const [dashboardViewArray, set_dashboardViewArray] = useState([{'id':2, 'name':'Tasks'}]);
    const [dbrdFeatureArray, set_dbrdFeatureArray] = useState([]);

    const[activeItem, set_activeItem] = useState(0);
    const [tabItem, set_tabItem] = useState(1);
    const carouselRef = useRef(null);
    const carouselFeatureRef = useRef(null);
    const tabItemRef = useRef(1);

    useEffect(() => {
        set_questUploadStatus(props.questUploadStatus);
    }, [props.questUploadStatus,props.isPopLeft]);

    useEffect(() => {
    }, [props.defaultPetObj]);

    useEffect(() => {

        prepareSliderWidgets(props.isCaptureImages,props.isEatingEnthusiasm,props.isImageScoring,props.isPetWeight,props.weight,props.weightUnit);

    }, [props.isCaptureImages,props.isEatingEnthusiasm,props.isImageScoring,props.isPetWeight,props.weight,props.weightUnit]);

    const prepareSliderWidgets = (isCaptureImages,isEatingEnthusiasm,isImageScoring,isPetWeight,weight,weightUnit) => {

        let tempArr = [];
        let obj;

        if(!isCaptureImages) {
            
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
      }

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
        tilesViewStyle,
        sensorSelView,
        petDetailsView,
        questionnaireView,
        petDHeaderTextStyle,
        petDSubHeaderTextStyle,
        actyHeaderTextStyle,
        questionnaireTextStyle,
        sensorHeader2,
        sensorSubHeader2,
        sensorSubHeader4,
        actySubHeaderTextStyle,
        buttonstyle,
        btnTextStyle,
        openButtonstyle,
        openBtnTextStyle,
        missingTextStyle,
        missingTextStyle1,
        missingBackViewStyle,
        indexTextStyle,
        detailsImgsStyle,
        detailsBubImgStyle,
        missingDogImgStyle,
        missingCatImgStyle,
        qstButtonstyle,
        qstbtnImgStyle,
        wtbtnImgStyle,
        qstPointsHeaderTextStyle,
        quickselctionViewStyle,
        quickActionsInnerViewStyle,
        quickbtnInnerImgStyle,
        quickbtnInnerTextStyle,
        firmwareAlertStyle,
        eatingScoreViewStyle,
        eatingScoreSubViewStyle,
        enthusasticTextStyle,
        enthusiasticBtnStyle,
        imgScoreTextStyle,
        progressStyle,
        name,
        flatcontainer,
        meterialViewStyle,
        flatcontainer1,
        backdrop,
        playIconStyle,
        backdrop1,
        alertTextStyle,
        sensorSubHeader3,
        questHTextStyle,
        questSHTextStyle,
        questCountTextStyle,
        authIconStyle,
        tabViewStyle,
        tabViewBtnStyle,
        dashboardViewStyle,
        carouselViewStyle,
        tyleViewStyle,
        tylebckViewStyle,
        questBackViewStyle,
        questArrowStyle,
        questBackStyle,
        questHeaderTextStyle,
        questArrowImgStyle,
        questSubHeaderTextStyle,
        tabBtnTextStyle,
        questDogImgStyle,
        questFoodImgStyle,
        sliderTextStyle,
        tabViewEnableBtnStyle,
        tyleActivityStyle,
        activityHeaderTextStyle,
        foodImgImgStyle,
        activityFoodTextStyle,
        activityFoodTextStyle1
    } = DashBoardStyles;

    const renderDashboardItem = ({item, index}) => {

        return (
            <View style={[dashboardViewStyle,{backgroundColor:item.id === 1 ? 'white':'white'}]}>
                {item.id === 1 ? renderActivityView() : renderTasksView()}
            </View>
        );
    }

    const renderFeatureItems = () => {

        if(dbrdFeatureArray) {
            return dbrdFeatureArray.map((item,index) => {
                return (
                   <>
                        <View style ={[tyleViewStyle,{backgroundColor:item.bColor,borderColor:item.brColor,alignItems:'flex-end',marginRight: index === dbrdFeatureArray.length - 1 ? wp('0%') : wp('3%')}]}>

                        <View style={{flex:3,marginLeft:wp('3%'),height:hp('10%'),justifyContent:'center',}}>
                            <View style={{justifyContent:'center',}}>
                                <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text1}</Text>
                                <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text2}</Text>
                                <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text3}</Text>
                            </View>
                            
                            <TouchableOpacity onPress={() => {featureActions(item)}}>
                                <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={[questArrowImgStyle,{tintColor : item.brColor,marginTop:hp('0.5%')}]}></Image>
                            </TouchableOpacity>

                        </View>

                        <View style={{flex:1,justifyContent:'flex-end',justifyContent:'flex-end',marginBottom:item.id === 3 ? hp('1.2%') : hp('2.5%')}}>
                            <Image source={item.imgPath} style={[questDogImgStyle,{marginLeft:wp('-4%')}]}></Image>
                        </View>

                    </View>
                   </>
                 )
            });
        }

        return (

            <View style = {{flexDirection:'row',height:hp('15%'),marginTop:hp('1%')}}>

                {activeItem === index ? <View style ={[tyleViewStyle,{backgroundColor:item.bColor,borderColor:item.brColor,alignItems:'flex-end',height:hp('11%'),}]}>

                    <View style={{flex:3,marginLeft:wp('3%'),height:hp('11%'),justifyContent:'center'}}>
                        <View style={{}}>
                            <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text1}</Text>
                            <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text2}</Text>
                            <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text3}</Text>
                        </View>
                        
                        <TouchableOpacity onPress={() => {featureActions(item)}}>
                            <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={[questArrowImgStyle,{tintColor : item.brColor,marginTop:hp('0.5%'),}]}></Image>
                        </TouchableOpacity>

                    </View>

                    <View style={{flex:1,justifyContent:'flex-end',justifyContent:'flex-end',marginBottom:item.id === 3 ? hp('1.2%') : hp('2.5%')}}>
                        <Image source={item.imgPath} style={[questDogImgStyle,{marginLeft:wp('-4%')}]}></Image>
                    </View>

                </View> : <View style ={[tyleViewStyle,{backgroundColor:item.bColor,borderColor:item.brColor,alignItems:'flex-end',height:hp('11.9%'),marginTop:hp('-0.6%'),}]}>

                <View style={{flex:3,marginLeft:wp('3%'),height:hp('11%'),justifyContent:'center',}}>
                    <View style={{justifyContent:'center',}}>
                        <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text1}</Text>
                        <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text2}</Text>
                        <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text3}</Text>
                    </View>
                    
                    <TouchableOpacity onPress={() => {featureActions(item)}}>
                        <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={[questArrowImgStyle,{tintColor : item.brColor,marginTop:hp('0.5%')}]}></Image>
                    </TouchableOpacity>

                </View>

                <View style={{flex:1,justifyContent:'flex-end',justifyContent:'flex-end',marginBottom:item.id === 3 ? hp('1.2%') : hp('2.5%')}}>
                    <Image source={item.imgPath} style={[questDogImgStyle,{marginLeft:wp('-4%')}]}></Image>
                </View>

            </View>}

            </View>

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
    
            <View style = {{justifyContent:'center',marginBottom:hp('10%')}}>

                <ScrollView showsVerticalScrollIndicator={false}>

                    {props.isImageScoring || props.isEatingEnthusiasm || (!props.isDeviceMissing && props.isDeviceSetupDone) ? <View style={tylebckViewStyle}>

                        {/* <View style={{zIndex: 999}}>
                            <Carousel
                                ref={carouselFeatureRef}
                                data={dbrdFeatureArray}
                                renderItem={renderFeatureItems}
                                sliderWidth={wp('90%')}
                                itemWidth={wp('46%')} 
                                itemHeight={hp('13.5%')} 
                                sliderHeight={hp('13.5%')}
                                layout={'default'}
                                // layoutCardOffset={`18`}
                                activeSlideAlignment = {'start'}
                                firstItem={0}
                                hasParallaxImages={true}
                                onSnapToItem={data => renderScrollFeatureItem(data)}
                                inactiveSlideOpacity = {1}
                                useScrollView={true}
                                enableSnap = {true}
                            />
                        </View>
                        
                        {getPagination()}  */}
                        <ScrollView snapToAlignment={"start"} style={{width:wp('93.5%'), alignSelf:'center'}} horizontal = {true} showsHorizontalScrollIndicator={false}>

                            {renderFeatureItems()}

                            {/* {props.defaultPetObj && parseInt(props.defaultPetObj.speciesId) === 1 ? <View style ={[tyleViewStyle,{backgroundColor:'#FFF7ED',borderColor:'#F5B054',alignItems:'flex-end',marginRight:hp('2%')}]}>

                                <View style={{flex:2,justifyContent:'center',marginBottom:wp('2%')}}>
                                    <Text style={[sliderTextStyle,{color:'#F5B054'}]}>{'Capture'}</Text>
                                    <Text style={[sliderTextStyle,{color:'#F5B054'}]}>{'Images for'}</Text>
                                    <Text style={[sliderTextStyle,{color:'#F5B054'}]}>{'Scoring'}</Text>
                                    <TouchableOpacity onPress={() => {captureImages()}}>
                                        <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={[questArrowImgStyle,{tintColor : '#F5B054'}]}></Image>
                                    </TouchableOpacity>
                                </View>

                                <View style={{flex:1,justifyContent:'flex-end',marginBottom:hp('1.5%')}}>
                                    <Image source={require('./../../../assets/images/dashBoardImages/svg/dog-bfi.svg')} style={[questDogImgStyle,]}></Image>
                                </View>

                            </View> : null}

                            {props.isImageScoring ? <View style ={[tyleViewStyle,{backgroundColor:'#F5F9FC',borderColor:'#2A97C7',marginRight:hp('2%')}]}>

                                <View style={{flex:2,justifyContent:'center',marginLeft:wp('2%')}}>
                                    <Text style={[sliderTextStyle,{color:'#548EC9'}]}>{'Score your'}</Text>
                                    <Text style={[sliderTextStyle,{color:'#548EC9'}]}>{'Pet Based'}</Text>
                                    <Text style={[sliderTextStyle,{color:'#548EC9'}]}>{'On the scale'}</Text>
                                    <TouchableOpacity onPress={() => {imageScoreAction()}}>
                                        {props.isPetWeight ? <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={[questArrowImgStyle,{tintColor : '#548EC9'}]}></Image> : null}
                                    </TouchableOpacity>
                                </View>

                                <View style={{flex:1,justifyContent:'flex-end',height:hp('9%'),marginRight:wp('2%')}}>
                                    <Image source={require('./../../../assets/images/dashBoardImages/svg/dog-weight.svg')} style={[questDogImgStyle,]}></Image>
                                </View>
                                
                            </View> : null}

                            {props.isEatingEnthusiasm ? <View style ={[tyleViewStyle,{backgroundColor:'#f3fcfa',borderColor:'#1cd281',alignItems:'flex-end',marginRight:hp('2%')}]}>

                                <View style={{flex:3.5,justifyContent:'center',marginLeft:wp('2%'),marginBottom:hp('1%')}}>
                                    <Text style={[sliderTextStyle,{color:'#2AC779'}]}>{'How enthusiastic'}</Text>
                                    <Text style={[sliderTextStyle,{color:'#2AC779'}]}>{'is your pet at'}</Text>
                                    <Text style={[sliderTextStyle,{color:'#2AC779'}]}>{'mealtime'}</Text>
                                    <TouchableOpacity onPress={() => {enthusiasticAction()}}>
                                        <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={[questArrowImgStyle,{tintColor : '#2AC779'}]}></Image>
                                    </TouchableOpacity>
                                </View>

                                <View style={{flex:1,justifyContent:'flex-end',marginLeft:wp('-40%'),marginBottom:hp('0.5%')}}>
                                    <Image source={require('./../../../assets/images/dashBoardImages/svg/slider-food.svg')} style={[questFoodImgStyle]}></Image>
                                </View>
                                
                            </View> : null}

                            {!props.isDeviceMissing && props.isDeviceSetupDone ? <View style ={[tyleViewStyle,{backgroundColor:'#F5F9FC',borderColor:'#2A97C7'}]}>

                                <View style={{flex:2,justifyContent:'center',marginLeft:wp('2%')}}>
                                    <Text style={[sliderTextStyle,{color:'#548EC9'}]}>{'Is your pet'}</Text>
                                    <Text style={[sliderTextStyle,{color:'#548EC9'}]}>{'Fluffy or Fit?'}</Text>
                                    <Text style={[sliderTextStyle,{marginVertical:5}]}>{props.weight ? props.weight + ' ' + (props.weightUnit? props.weightUnit : '' ) : '------'}</Text>
                                    <TouchableOpacity onPress={() => {weightAction()}}>
                                        {props.isPetWeight ? <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={[questArrowImgStyle,{tintColor : '#548EC9'}]}></Image> : null}
                                    </TouchableOpacity>
                                </View>

                                <View style={{flex:1,justifyContent:'flex-end',height:hp('9%'),marginRight:wp('2%')}}>
                                    <Image source={require('./../../../assets/images/dashBoardImages/svg/dog-weight.svg')} style={[questDogImgStyle,]}></Image>
                                </View>
                                
                            </View> : null} */}

                        </ScrollView> 

                    </View> : null}

                    {/* {props.isQuestionnaireEnable && props.questionnaireData && props.questionnaireData.length > 0 ? <View style={questBackViewStyle}>

                        <View style={{flexDirection:'row'}}>
                            <View style={[questBackStyle]}>

                                <View style={{justifyContent:'center'}}>
                                    <Text style={[questHeaderTextStyle]}>{'Questionnaires'}</Text>
                                </View>

                                <View style = {{flexDirection:'row'}}>
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

                                <TouchableOpacity style={{width:wp("15%"),}} onPress={() => {quickQuestionnaireAction()}}>
                                    <Image source={require('./../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={questArrowImgStyle}></Image>
                                </TouchableOpacity>
                    
                            </View>

                        </View>
                        
                    </View> : null} */}
                    {dbrdFeatureArray && dbrdFeatureArray.length > 2 ? <View>
                        {getPagination()}
                    </View> : null}

                    {props.isQuestionnaireEnable && props.questionnaireData && props.questionnaireData.length > 0 ? <View style={Platform.isPad ? [questBackViewStyle,{marginTop:hp('2%'),}] : [questBackViewStyle,{marginTop:hp('-1%'),}]}>

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

                    </View> : (props.isPTLoading ? <View style={{height:hp('3%'),justifyContent:'center',marginTop:hp('1%')}}><ActivityIndicator size="small" color="gray"/></View> : null)} 

                    {!props.isDeviceMissing && props.isDeviceSetupDone ? <View>

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
        <View style={[mainComponentStyle]}>

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

                    <View style={[CommonStyles.petsSelViewHeaderStyle]}>

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

                    <View>

                        {/* {!props.isDeviceMissing && props.isDeviceSetupDone ? <View style={tabViewStyle}>

                            <TouchableOpacity style={[tabItemRef.current === 0 ? tabViewEnableBtnStyle : tabViewBtnStyle]} onPress={() => {tabItemRef.current = 0,carouselRef.current.snapToItem(0)}}>
                                <Text style={[tabBtnTextStyle]}>{'Activity'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[tabItemRef.current === 1 ? tabViewEnableBtnStyle : tabViewBtnStyle]} onPress={() => {tabItemRef.current = 1,carouselRef.current.snapToItem(1);}}>
                                <Text style={[tabBtnTextStyle,{marginRight:hp('0.2%')}]}>{'Tasks'}</Text>
                            </TouchableOpacity>
                                
                        </View> : null} */}

                        {!props.isDeviceMissing && props.isDeviceSetupDone ? <View style={{alignItems:'center'}}>

                            {/* <FlatList
                                data={dashboardViewArray}
                                showsVerticalScrollIndicator={false}
                                renderItem={renderTasksView}
                                enableEmptySections={true}
                                horizontal = {true}
                                keyExtractor={(item) => item.titleOrQuestion}
                            /> */}

                            {/* <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                                {tabItem && tabItem === 1 ? renderActivityView() : renderTasksView()}
                            </ScrollView> */}
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

                        </View> : (props.isDeviceMissing || !props.isDeviceSetupDone ? <View style={{width:wp('90%'), alignSelf:'center',justifyContent:'center'}}>

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

                {props.isDeceased ? null :(props.isDeviceMissing || !props.isDeviceSetupDone || props.isFirstUser ? <View style={CommonStyles.bottomViewComponentStyle}>
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