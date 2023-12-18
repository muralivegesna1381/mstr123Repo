import React, { useState, useEffect } from 'react';
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

let imageScoreDogImg = require("../../../assets/images/otherImages/png/imageScaleDogBckImg.png");
let imageScoreCatImg = require("../../../assets/images/otherImages/png/imageScaleCatBckImg.png");
let eatingDogBckImg = require("../../../assets/images/otherImages/png/eatingDogBackImg.png");
let eatingCatBckImg = require("../../../assets/images/otherImages/png/eatingCatBackImg.png");
let dogSetupMissingImg = require("../../../assets/images/dogImages/dogImg5.svg");
let catSetupMissingImg = require("../../../assets/images/dogImages/catImg5.svg");

const  DashBoardUI = ({route, ...props }) => {

    const [questUploadStatus, set_questUploadStatus] = useState(undefined);

    useEffect(() => {
        set_questUploadStatus(props.questUploadStatus);
    }, [props.questUploadStatus,props.isPopLeft]);

    useEffect(() => {
    }, [props.defaultPetObj]);

    // edit pet Action
    const editPetAction = (item) => {
        props.editPetAction(item);
    };

    // Popups actions
    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    const refreshDashBoardDetails = (pObject) => {
        props.refreshDashBoardDetails('swiped',pObject);
    };

    // Menu action
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

    // Checks the Internet check actions
    const internetBtnAction = async () => {
        props.internetBtnAction();
    };

    const internetQuestBtnAction = async () => {
        props.internetQuestBtnAction();
    };

    const devicesSelectionAction = () => {
        props.devicesSelectionAction();
    };

    // Removes the typeahead list after selecting the pet in search
    const selectedPetAction = (item) => {
        props.selectedPetAction(item);
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
    } = DashBoardStyles;

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
                                {/* <Image source={require("./../../../assets/images/otherImages/svg/rightArrowLightImg.svg")} style={{marginLeft: wp("1%"), marginRight: wp("1%"),width:wp('3%'),aspectRatio:1}}/> */}

                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => Linking.openURL('https://youtu.be/zg9aCENCOt4')}>
                            <View style={ytLinkViewStyle}>
                            
                                <Image source={require("./../../../assets/images/otherImages/svg/hpn1First.svg")} style={youTubeThumbs}/>
                                <Text style={[ftytLnksHeaderHeader]}>{'How to Charge the Sensor'}</Text>
                                {/* <Image source={require("./../../../assets/images/otherImages/svg/rightArrowLightImg.svg")} style={{marginLeft: wp("1%"), marginRight: wp("1%"),width:wp('3%'),aspectRatio:1}}/> */}

                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => Linking.openURL('https://youtu.be/ykwPApENJMw')}>
                            <View style={ytLinkViewStyle}>
                            
                                <Image source={require("./../../../assets/images/otherImages/svg/hpn1First.svg")} style={youTubeThumbs}/>
                                <Text style={[ftytLnksHeaderHeader]}>{'How to Setup the Sensor'}</Text>
                                {/* <Image source={require("./../../../assets/images/otherImages/svg/rightArrowLightImg.svg")} style={{marginLeft: wp("1%"), marginRight: wp("1%"),width:wp('3%'),aspectRatio:1}}/> */}

                            </View>
                        </TouchableOpacity>

                    </View>

                </View> : 
                
                <View>

                    <View style={[CommonStyles.petsSelViewHeaderStyle,{zIndex : props.isLoading ? 0 : 999}]}>

                        <PetsSelectionCarousel
                            petsArray={props.petsArray}
                            isSwipeEnable = {true}
                            defaultPet = {props.defaultPetObj}
                            activeSlides = {props.activeSlide}
                            isFromScreen = {'Dashboard'}
                            dismissSearch = {props.isSearchDropdown}
                            setValue={(pObject) => {
                                refreshDashBoardDetails(pObject);
                            }}
                            selectedPetAction={(pObject) => {
                                selectedPetAction(pObject);
                            }}
                            editPetAction = {editPetAction}
                        />

                    </View>

                    <View style={{marginBottom:hp('5%'),height:hp('75%')}}>

                        <ScrollView>

                            <View style={{marginTop: props.isTimer ? (Platform.isPad ? hp('14%') : hp('11.5%')) : hp('0%'), marginBottom: props.isTimer || !props.isDeviceSetupDone || props.isDeviceMissing ? hp('18%') : hp('18%'),}}>

                                {props.uploadStatus ? <View style={{width:wp('100%'),height:hp('10%'),alignItems:'center',justifyContent:'center',backgroundColor:'#818588'}}>

                                    {props.internetType === "cellular" ? 
                                    
                                    <View style={{width:wp('90%'),flexDirection:'row'}}>

                                        <View style={{width:wp('60%'),justifyContent:'center',alignitems:'center'}}>
                                            <Text style={alertTextStyle}>{'Media cannot be uploaded on cellular network. Please switch to Wi-Fi and try again.'}</Text>                               
                                        </View>

                                        <View style={{width:wp('30%'),height:hp('6%'),alignItems:'center',justifyContent:'center'}}>
                                            <TouchableOpacity style= {{width:wp('25%'),height:hp('4%'),backgroundColor:'red',alignItems:'center',justifyContent:'center',borderRadius:5}} onPress={() => {internetBtnAction()}}>
                                            <Text style={alertTextStyle}>{'TRY AGAIN'}</Text>
                                            </TouchableOpacity>
                                        </View>

                                    </View> 
                                    
                                    : 
                                    
                                    <View style={{width:wp('90%'),height:hp('6%'),flexDirection:'row'}}>

                                        <View style={{width:wp('60%'),height:hp('6%'),justifyContent:'center'}}>
                                            <Text style={{color:'white'}}>{'Observation : '+(props.observationText && props.observationText.length > 15 ? props.observationText.replace('/r','/').slice(0, 15)+"..." : props.observationText)}</Text>
                                            <Text style={{color:'white',marginTop:hp('1%')}}>{props.uploadStatus + " "+ props.fileName}</Text>
                                        </View>

                                        <View style={{width:wp('30%'),height:hp('6%'),alignItems:'center',justifyContent:'center'}}>

                                            <View style={{width:wp('12%'),aspectRatio:1,backgroundColor:'#000000AA',borderRadius:100,borderColor:'#6BC100',borderWidth:2,alignItems:'center',justifyContent:'center'}}>
                                                <Text style={progressStyle}>{props.uploadProgress}</Text>
                                            </View>

                                            <Text style={{color:'white'}}>{props.progressTxt}</Text>
                                        
                                        </View>

                                    </View>}

                                </View> : null}

                                {questUploadStatus ? <View style={{width:wp('100%'),height:hp('10%'), marginTop:props.questUploadStatus ? hp('0.1%') : hp('0.1%'),alignItems:'center',justifyContent:'center',backgroundColor:'#2E2E2E'}}>

                                    {props.questInternetType === "cellular" ? 
                                    
                                    <View style={{width:wp('90%'),flexDirection:'row'}}>

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
                                            <Text style={{color:'white'}}>{'Questionnaire : '+(props.questText && props.questText.length > 15 ? props.questText.replace('/r','/').slice(0, 15)+"..." : props.questText)}</Text>
                                            <Text style={{color:'white',marginTop:hp('1%')}}>{props.questUploadStatus + " "+ props.questFileName}</Text>
                                        </View>

                                        <View style={{width:wp('30%'),height:hp('6%'),alignItems:'center',justifyContent:'center'}}>

                                            <View style={{width:wp('12%'),aspectRatio:1,backgroundColor:'#000000AA',borderRadius:100,borderColor:'#6BC100',borderWidth:2,alignItems:'center',justifyContent:'center'}}>
                                                <Text style={progressStyle}>{props.questUploadProgress}</Text>
                                            </View>

                                            <Text style={{color:'white'}}>{props.questProgressTxt}</Text>
                                        
                                        </View>

                                    </View>}

                                </View> : null}

                                {props.isPTEnable && !props.isDeviceMissing && props.isDeviceSetupDone? <View style={leadeBoardStyle}>
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
                                                <Image source={require("../../../assets/images/dashBoardImages/svg/dashTimerIcon.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle]}/>
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

                                    {!props.isDeviceMissing && props.isDeviceSetupDone ? <View style={[sensorSelView]}>
                            <View style={{flex:1.7,justifyContent:'center',alignItems:'center',height:hp('8%'),}}>

                                <Text style={sensorHeader2}>{'SENSOR'}</Text>
                                {props.deviceNumber && props.deviceNumber.length < 10 ? <Text style={[sensorSubHeader2,]}>{props.deviceNumber}</Text> 
                                : (props.deviceNumber ? <View>
                                    <Text style={[sensorSubHeader4]}>{props.deviceNumber.substring(0,9)}</Text>
                                    <Text style={[sensorSubHeader4,]}>{props.deviceNumber.substring(9,props.deviceNumber.length)}</Text>
                                </View> : null)}

                            </View>

                            <View style={{flex:1.7,justifyContent:'center',alignItems:'center'}}>
                                
                                <TouchableOpacity style={{alignItems:'center'}} disabled={props.isFirmwareUpdate ? false : true} onPress={() => {firmwareUpdateAction('firmwareUpdate')}}>
                                    
                                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>  
                                        <View style={{alignItems:'center',justifyContent:'space-between'}}>
                                            <Text style={sensorHeader2}>{'FIRMWARE'}</Text>
                                            <Text style={[sensorSubHeader2,{}]}>{props.firmware ? props.firmware : '--'}</Text>
                                        </View> 
                                        {props.isFirmwareUpdate ? <Image source={require("../../../assets/images/otherImages/svg/firmwareAlert.svg")} style={[firmwareAlertStyle,{}]}/> : null}
                                    </View>
                                </TouchableOpacity>
                                
                            </View> 

                            <View style={{flex:1.7,justifyContent:'center',alignItems:'center'}}>
                                <Text style={sensorHeader2}>{'LAST SYNC'}</Text>
                                <Text style={props.lastSeen && props.lastSeen.length > 10 ? [sensorSubHeader3,{}] : [sensorSubHeader2,{}]}>{props.lastSeen ? props.lastSeen : '--'}</Text>
                            </View>

                            {props.isDeviceSetupDone ? <View style={{flex:1.7,alignItems:'center',justifyContent:'center'}}>

                                    {<View style={{justifyContent:'space-between',alignItems:'center',}}>
                                        <Text style={sensorHeader2}>{'BATTERY'}</Text>
                                        <Text style={[sensorSubHeader2,{color: props.battery && parseInt(props.battery) < 20 ? 'red' : '#6fc309'}]}>{props.battery ? props.battery + "%" : "--"}</Text>
                                    </View>}
                                
                            </View> : null}

                            {props.defaultPetObj && props.devicesCount > 1 ? <TouchableOpacity style={{width:wp("12%"),height:hp("7%"),justifyContent:'center',alignItems:'center',}} onPress={() => {devicesSelectionAction()}}>
                                    <View style={{width:wp("8%"),height:hp("3.5%"),backgroundColor:'#E0DCDC',justifyContent:'center',alignItems:'center',marginRight: hp("1%"),marginLeft: hp("1%"),borderRadius:5}}>
                                        <Image source={require("../../../assets/images/otherImages/svg/rightArrowLightImg.svg")} style={{marginLeft: wp("1%"), marginRight: wp("1%"),width:wp('2%'),height:hp('2%')}}/>
                                    </View>
                                        
                                    </TouchableOpacity> : null}

                            </View> : null}

                                    {!props.isDeviceMissing && props.isDeviceSetupDone ? <View style={[petDetailsView]}>
                                        <View style={{flexDirection:'row', marginTop:hp('1%'),justifyContent:'space-between'}}>

                                            <View style={tilesViewStyle}>
                                                <View style={detailsBubImgStyle}>
                                                    <Image source={require("../../../assets/images/dashBoardImages/svg/birthday.svg")} style={Platform.isPad ? [detailsImgsStyle, {height:hp('4%'),}] : [detailsImgsStyle]}/>
                                                </View>

                                                <View style={{justifyContent:'center'}}>
                                                    <Text style={petDHeaderTextStyle}>{"BIRTH DAY"}</Text>
                                                    <Text style={props.birthday ? [petDSubHeaderTextStyle,{width:wp('25%')}] : [petDSubHeaderTextStyle,{width:wp('25%'),color:'grey'}]}>{props.birthday ? moment(new Date(props.birthday)).format("MM-DD-YYYY") : '------'}</Text>
                                                </View>

                                            </View>

                                            <View style={[tilesViewStyle,]}>

                                                <View style={{flexDirection:'row',flex:2}}>
                                                    <View style={[detailsBubImgStyle,{}]}>
                                                        <Image source={require("../../../assets/images/dashBoardImages/svg/weight.svg")} style={Platform.isPad ? [detailsImgsStyle, {height:hp('4%'),}] : [detailsImgsStyle]}/>
                                                    </View>

                                                    <View style={{justifyContent:'center'}}>
                                                        <Text style={petDHeaderTextStyle}>{"WEIGHT"}</Text>
                                                        <Text style={props.weight ? [petDSubHeaderTextStyle] : [petDSubHeaderTextStyle,{color:'grey'}]}>{props.weight ? props.weight + ' ' + (props.weightUnit? props.weightUnit : '' ) : '------'}</Text>
                                                    </View>
                                                </View>

                                                {props.isPetWeight ? <TouchableOpacity style={{width:wp("13%"),height:hp("7%"),justifyContent:'center',alignContent:'center',flex:0.8}} onPress={() => {weightAction()}}>
                                                    {/* <View style={[qstButtonstyle,{alignSelf:'flex-start'}]}> */}
                                                        <Image source={require("../../../assets/images/dashBoardImages/svg/greenRightArrowBtnImg.svg")} style={Platform.isPad ? [wtbtnImgStyle,{alignSelf:'center',width: hp("5%"),height: hp("5%"),}] :[wtbtnImgStyle,{alignSelf:'center'}]}/>
                                                    {/* </View> */}
                                                    
                                                </TouchableOpacity> : null}

                                            </View>

                                        </View>

                                        {props.isEatingEnthusiasm ? <View>

                                            <ImageBackground style={Platform.isPad ? [eatingScoreViewStyle,{height:hp('20%')}] : [eatingScoreViewStyle]} resizeMode="stretch" source={props.defaultPetObj && props.defaultPetObj.speciesId && parseInt(props.defaultPetObj.speciesId) === 1 ? eatingDogBckImg : eatingCatBckImg}>

                                                <View style={eatingScoreSubViewStyle}>
                                                
                                                    <View>
                                                        <Text style={enthusasticTextStyle}>{'HOW'}</Text>
                                                        <Text style={enthusasticTextStyle}>{'ENTHUSIASTIC'}</Text>
                                                        <Text style={enthusasticTextStyle}>{'IS YOUR PET WHILE'}</Text>
                                                        <Text style={enthusasticTextStyle}>{'HAVING THEIR FOOD ?'}</Text>
                                                    </View>
                                                    <View>
                                                        <TouchableOpacity style={[enthusiasticBtnStyle,{}]} onPress={() => {enthusiasticAction()}}>
                                                            <Text style={[sensorSubHeader2,{color:'black'}]}>{'TELL US NOW'}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                    
                                            </ImageBackground>

                                        </View> : null}

                                        {props.isImageScoring ? <View>

                                            <ImageBackground style={Platform.isPad ? [eatingScoreViewStyle,{height:hp('20%')}] : [eatingScoreViewStyle]} resizeMode="stretch" source={props.defaultPetObj && props.defaultPetObj.speciesId && parseInt(props.defaultPetObj.speciesId) === 1 ? imageScoreDogImg : imageScoreCatImg}>

                                                <View style={eatingScoreSubViewStyle}>
                                                
                                                    <View>
                                                        <Text style={imgScoreTextStyle}>{'SCORE YOUR'}</Text>
                                                        <Text style={imgScoreTextStyle}>{'PET BASED'}</Text>
                                                        <Text style={imgScoreTextStyle}>{'ON THE SCALE'}</Text>
                                                    </View>
                                                    <View>
                                                        <TouchableOpacity style={[enthusiasticBtnStyle,{}]} onPress={() => {imageScoreAction()}}>
                                                            <Text style={[sensorSubHeader2,{color:'black'}]}>{'START NOW'}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                    
                                            </ImageBackground>

                                        </View> : null}

                                    </View> : null}

                                    {props.isQuestionnaireEnable && props.questionnaireData && props.questionnaireData.length > 0 ? <View style={[questionnaireView]}>

                                        <View style={{flexDirection:'row',justifyContent:'space-between', alignItems:'center'}}>
                                            <Text style={[actyHeaderTextStyle,{alignSelf:'center'}]}>{"QUESTIONNAIRE"}</Text>
                                            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                            
                                                {!props.isModularityService ? <TouchableOpacity disabled = {true} style={{width:wp("15%"),}} onPress={() => {quickQuestionnaireAction()}}>
                                                    <View  style={[qstButtonstyle,{flexDirection:'row',justifyContent:'center',alignItems:'center',width:wp("15%"),}]}>
                                                        
                                                    </View>
                                                </TouchableOpacity> : <View><ActivityIndicator size="small" color="gray"/></View>}
                                            </View>

                                        </View>

                                        <View style={{}}>

                                            <View style={{backgroundColor:'white',width:wp('90%'),height:hp('8%'),marginTop:wp('1%'),borderRadius:5, alignItems:'center',justifyContent:'center'}}>

                                                <View style={{width:wp('80%'),height:hp('8%'),flexDirection:'row',alignItems:'center'}}>
                                                    <View style={{flex:2}}>
                                                        <Text style={[questHTextStyle]}>{'COMPLETED'}</Text>
                                                        <Text style={[questSHTextStyle]}>{'QUESTIONNAIRES'}</Text>
                                                    </View>

                                                    <View style={{width:wp('10%'),height:hp('6%'),justifyContent:'center'}}>

                                                        <ImageBackground source={require("./../../../assets/images/otherImages/svg/recBlue.svg")} style={[qstbtnImgStyle,{justifyContent:'center',alignItems:'center'}]}>
                                                            <Text style={[questCountTextStyle,{color:'#48D2FF'}]}>{props.questSubmitLength < 10 && props.questSubmitLength !== 0 ? '0'+props.questSubmitLength : props.questSubmitLength}</Text>
                                                        </ImageBackground>

                                                    </View>
                                                </View>

                                            </View>

                                            {props.questionnaireDataLength > 0 ? <View style={{backgroundColor:'white',width:wp('90%'),height:hp('8%'),marginTop:wp('1%'),borderRadius:5, flexDirection:'row', alignItems:'center',justifyContent:'center'}}>

                                            <View style={{width:wp('80%'),height:hp('8%'),flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>

                                                <View style={{width:wp('43%'),height:hp('8%'),justifyContent:'center'}}>
                                                    <Text style={[questHTextStyle]}>{'OPEN'}</Text>
                                                    <Text style={[questSHTextStyle]}>{'QUESTIONNAIRES'}</Text>
                                                </View>

                                                <View style= {{flexDirection:'row',width:wp('40%'),alignItems:'center', justifyContent:'flex-end'}}>

                                                    <View style={{alignItems:'center'}}>
                                                        <ImageBackground source={require("./../../../assets/images/otherImages/svg/recGreen.svg")} style={[qstbtnImgStyle,{justifyContent:'center',alignItems:'center',}]}>
                                                            <Text style={[questCountTextStyle,]}>{props.questionnaireDataLength < 10 && props.questionnaireDataLength !== 0 ? '0'+props.questionnaireDataLength : props.questionnaireDataLength}</Text>
                                                        </ImageBackground>
                                                    </View>

                                                    <TouchableOpacity style={{}} onPress={() => {quickQuestionnaireAction()}}>
                                                        <View style={[qstButtonstyle,{flexDirection:'row',justifyContent:'center',alignItems:'center',width:wp("15%"),}]}>
                                                            <Image source={require("../../../assets/images/dashBoardImages/svg/greenRightArrowBtnImg.svg")} style={[qstbtnImgStyle,{width: hp("6%"),height: hp("6%"),}]}/>
                                                        </View>
                                                    </TouchableOpacity> 
                                                    
                                                </View> 
                                                    
                                            </View> 

                                            </View> : null}

                                            {props.questionnaireDataLength > 0 ? <View style={{flexDirection:'row', justifyContent:'space-between',backgroundColor:'white'}}>
                                                <View style={{flexDirection:'row',flex:1}}>
                                                    <Text style={[indexTextStyle]}>{"1  "}</Text>
                                                    <View style={{justifyContent:'center'}}>
                                                        <Text style={questionnaireTextStyle}>{props.questionnaireData[0].questionnaireName && props.questionnaireData[0].questionnaireName.length > 23 ? props.questionnaireData[0].questionnaireName.slice(0, 23) + "..." : props.questionnaireData[0].questionnaireName}</Text>
                                                        <Text style={actySubHeaderTextStyle}>{'Due by: '+ props.questionnaireData[0].endDate ? moment(new Date(props.questionnaireData[0].endDate)).format("MM-DD-YYYY")  : ''}</Text>
                                                    </View>
                                                </View>

                                                {!props.isModularityService ? <TouchableOpacity style={[openButtonstyle]} onPress={() => {quickQuestionAction(props.questionnaireData[0])}}>
                                                    <Text style={props.questionnaireData[0].status === "Elapsed" ? [openBtnTextStyle,{color:'red'}] : [openBtnTextStyle]}>{props.questionnaireData[0].status.toUpperCase()}</Text>
                                                </TouchableOpacity> : <View style={[openButtonstyle]}><ActivityIndicator size="small" color="gray"/></View>}

                                            </View> : null}
                                        </View>

                                        

                                    </View> : (props.isQuestLoading ? <View style={[questionnaireView,{alignItems:'center',justifyContent:'center'}]}>
                                        <ActivityIndicator size="large" color="gray"/>
                                    </View> : null)}

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

                        </ScrollView>

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