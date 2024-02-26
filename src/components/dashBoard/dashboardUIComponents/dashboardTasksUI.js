import React, { useState, useEffect, useRef } from 'react';
import {View,TouchableOpacity,Text,Image,Platform,ScrollView,ImageBackground,FlatList,ActivityIndicator} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import DashBoardStyles from './../dashBoardStyles';
import LeaderBoardService from './../../pointTracking/leaderBoard/leaderBoardService';

let leftSignImg = require("../../../../assets/images/dashBoardImages/svg/leftSign.svg");
let rightSignImg = require("../../../../assets/images/dashBoardImages/svg/rightSign.svg");

const  DashboardTasksUI = ({
    isTimerEnable,
    setQuickSetupAction,
    obsVideoUploadStatus,
    obsImgUploadStatus,
    questUploadStatus,
    isDeviceMissing,
    isDeviceSetupDone,
    dbrdFeatureArrayProp,
    uploadStatus,
    isTimer,
    isScrollEndReachedProp,
    questionnaireData,
    questSubmitLength,
    isQuestionnaireEnable,
    questionnaireDataLength,
    isPTEnable,
    leaderBoardArray,
    leaderBoardPetId,
    campagainName,
    campagainArray,
    currentCampaignPet,
    isSwipedModularity,
    isPTDropdown,
    enableLoader,
    ptActivityLimits,
    isPTLoading,
    isModularityService,
    isObsEnable,
    leaderBoardCurrent,
    bfiUploadStatus,
    quickQuestionnaireAction,
    featureActions,
    showSearch,
    route, ...props
}) => {

    const [isScrollEndReached, set_isScrollEndReached] = useState(false);

    const flatDBRef = useRef(null);

    useEffect(() => {

    }, [dbrdFeatureArrayProp]);

    const handleEndReached = (event) => {
        set_isScrollEndReached(true); 
    };
    
    //flat list start listener
    const handleStartReached = (event) => {
        const { contentOffset } = event.nativeEvent;
        if (contentOffset.x === 0) {
            set_isScrollEndReached(false); 
        }
    };

    // DashBoard page Styles
    const {
        leadeBoardStyle,
        quickselctionViewStyle,
        quickActionsInnerViewStyle,
        quickbtnInnerImgStyle,
        quickbtnInnerTextStyle,
        questCountTextStyle,
        questCountTextStyleiPad,
        tyleViewStyle,
        tylebckViewStyle,
        questBackViewStyle,
        questArrowStyle,
        questBackStyle,
        questHeaderTextStyle,
        questArrowImgStyle,
        questSubHeaderTextStyle,
        questSubHeaderTextStyleiPad,
        questDogImgStyle,
        sliderTextStyle,
    } = DashBoardStyles;

    const renderFeatureItems = ({item,index}) => {

        return (
                
            <TouchableOpacity onPress={() => {featureActions(item)}}>
                                            
                <View style ={[tyleViewStyle,{backgroundColor:item.bColor,borderColor:item.brColor,alignItems:'flex-end',marginRight: index === dbrdFeatureArrayProp.length - 1 ? wp('0%') : wp('3%')}]}>
                
                    <View style={{flex:3,marginLeft:wp('3%'),height:hp('10%'),justifyContent:'center',}}>
                        <View style={{justifyContent:'center',}}>
                            <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text1}</Text>
                            <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text2}</Text>
                            <Text style={[sliderTextStyle,{color:item.brColor}]}>{item.text3}</Text>
                        </View>
                                                    
                        <Image source={require('./../../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={[questArrowImgStyle,{tintColor : item.brColor,marginTop:hp('0.5%')}]}></Image>
                
                    </View>
                
                    <View style={{flex:1,justifyContent:'flex-end',justifyContent:'flex-end',marginBottom:item.id === 3 ? hp('1.2%') : hp('2.5%')}}>
                        <Image source={item.imgPath} style={[questDogImgStyle,{marginLeft:wp('-4%')}]}></Image>
                    </View>
                
                </View>
                                            
            </TouchableOpacity>
                                            
        )
    }

    return (
                    
        <ScrollView showsVerticalScrollIndicator={false}>

            {(dbrdFeatureArrayProp.length > 0) ? <View style={[tylebckViewStyle,{alignItems:'center', marginTop: (isTimer && (!uploadStatus) && (!questUploadStatus) ? hp('2%') : hp('0%')),}]}>

                <View style ={{flexDirection:'row'}}>
                    <FlatList
                        ref={flatDBRef}
                        data={dbrdFeatureArrayProp}
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

            </View> : null}

            {dbrdFeatureArrayProp && dbrdFeatureArrayProp.length > 2 ? <View>
                        {/* {getPagination()} */}
                <View style = {{flexDirection:'row',width:wp('93.5%'),alignSelf:'center',justifyContent:'center', marginTop:Platform.isPad ? hp('1%') : hp('0.5%')}}>
                    {<Image source={require('./../../../../assets/images/dashBoardImages/svg/arrow-black-left.svg')} style={Platform.isPad ? [questArrowImgStyle ,{width: wp("5%"),height: hp("1.5%"),tintColor:'black',marginRight:wp('1.5%')}] : [questArrowImgStyle,{tintColor:'black',marginRight:wp('1.5%')}]}></Image>}
                    <Image source={!isScrollEndReached ? leftSignImg : rightSignImg} style={Platform.isPad ? [questArrowImgStyle ,{width: wp("5%"),height: hp("1.5%"),tintColor:'black',marginRight:wp('1.5%')}] : [questArrowImgStyle,{tintColor:'black'}]}></Image>
                    { <Image source={require('./../../../../assets/images/dashBoardImages/svg/arrow-black-right.svg')} style={Platform.isPad ? [questArrowImgStyle ,{width: wp("5%"),height: hp("1.5%"),tintColor:'black',marginLeft:wp('1.5%'),marginRight:wp('0.5%')}] : [questArrowImgStyle,{tintColor:'black',marginLeft:wp('1.5%')}]}></Image>}
                </View>
            </View> : null}

            {isQuestionnaireEnable && questionnaireData && questionnaireData.length > 0 ? <View style={Platform.isPad ? [questBackViewStyle,{marginTop:hp('4%'),}] : [questBackViewStyle,{marginTop:dbrdFeatureArrayProp.length > 0 ? (dbrdFeatureArrayProp.length > 2 ? hp('1%') : hp('2%')) : hp('2%')}]}>

                <View style={{flexDirection:'row'}}>
                    <View style={[questBackStyle,{justifyContent:'center'}]}>

                        <View style={{justifyContent:'center',marginLeft: wp("2%")}}>
                            <Text style={[questHeaderTextStyle]}>{'Questionnaires'}</Text>
                        </View>

                        <View style = {{flexDirection:'row',marginLeft: wp("2%")}}>
                            <View style = {{flexDirection:'row',marginRight: wp("12%"),}}> 
                                <Text style={Platform.isPad ? [questCountTextStyleiPad,] : [questCountTextStyle,]}>{questionnaireDataLength < 10 && questionnaireDataLength !== 0 ? '0'+questionnaireDataLength : questionnaireDataLength}</Text>
                                <View style={{justifyContent:'flex-end',marginBottom: hp("1%")}}>
                                    <Text style={Platform.isPad ? [questSubHeaderTextStyleiPad,{color:'#6BC100',marginLeft: wp("1%")}] : [questSubHeaderTextStyle,{color:'#6BC100',marginLeft: wp("1%")}]}>{'Open'}</Text>
                                </View>
                            </View>
                            <View style = {{flexDirection:'row'}}> 
                                <Text style={Platform.isPad ? [questCountTextStyleiPad,{color:'#FF9202'}] : [questCountTextStyle,{color:'#FF9202'}]}>{questSubmitLength < 10 && questSubmitLength !== 0 ? '0'+questSubmitLength : questSubmitLength}</Text>
                                <View style={{justifyContent:'flex-end',marginBottom: hp("1%")}}>
                                    <Text style={Platform.isPad ? [questSubHeaderTextStyleiPad,{color:'#FF9202',marginLeft: wp("1%")}] : [questSubHeaderTextStyle,{color:'#FF9202',marginLeft: wp("1%")}]}>{'Completed'}</Text>
                                </View>
                            </View>
                        </View>

                    </View>

                    <View style={questArrowStyle}>

                        <TouchableOpacity style={{width:wp("15%"),marginTop : Platform.isPad ? hp("1%") : hp("1.6%")}} onPress={() => {quickQuestionnaireAction()}}>
                            <Image source={require('./../../../../assets/images/dashBoardImages/svg/right-arrow.svg')} style={Platform.isPad ? [questArrowImgStyle ,{width: wp("5%"),height: hp("1.5%"),}] : [questArrowImgStyle, {marginLeft: wp("-2%"),}]}></Image>
                        </TouchableOpacity>
                    
                    </View>

                </View>
                        
            </View> : null}

            {isPTEnable ? <View style={Platform.isPad ? [leadeBoardStyle,{height:hp('38%'),}] : [leadeBoardStyle]}>
                <LeaderBoardService
                    leaderBoardArray = {leaderBoardArray}
                    leaderBoardPetId = {leaderBoardPetId}
                    leaderBoardCurrent = {leaderBoardCurrent}
                    campagainName = {campagainName}
                    campagainArray = {campagainArray}
                    currentCampaignPet = {currentCampaignPet}
                    isSwipedModularity = {isSwipedModularity}
                    isPTDropdown = {isPTDropdown}
                    enableLoader = {enableLoader}
                    ptActivityLimits = {ptActivityLimits}
                ></LeaderBoardService>

            </View> : (isPTLoading ? <View style={{height:hp('3%'),justifyContent:'center'}}><ActivityIndicator size="small" color="gray"/></View> : null)} 

            <View style={{marginTop : isTimer ? hp('2%') : hp('0%')}}>

                <ImageBackground style={quickselctionViewStyle} resizeMode="stretch" source={require("../../../../assets/images/dashBoardImages/png/quicActionsBk.png")}>

                    {isTimerEnable && !isModularityService ? <View style={quickActionsInnerViewStyle}>
                        <TouchableOpacity style={{alignItems:'center'}} onPress={() => {setQuickSetupAction('Timer')}}>
                            <Image source={require("../../../../assets/images/dashBoardImages/svg/dashTimerIcon.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle]}/>
                            <Text style={[quickbtnInnerTextStyle]}>{"TIMER"}</Text>
                        </TouchableOpacity>                          
                    </View> : (isModularityService ? <View style={quickActionsInnerViewStyle}><ActivityIndicator size="small" color="gray"/></View> : null)}

                    {isObsEnable && !isModularityService ? <View style={quickActionsInnerViewStyle}>
                        <TouchableOpacity style={{alignItems:'center'}} onPress={() => {setQuickSetupAction('Quick Video')}}>
                            <Image source={require("../../../../assets/images/dashBoardImages/svg/dashQuickVideo.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle,{width:wp('5%')}]}/>
                            <Text style={quickbtnInnerTextStyle}>{"QUICK VIDEO"}</Text>
                        </TouchableOpacity>                          
                    </View> : (isModularityService ? <View style={quickActionsInnerViewStyle}><ActivityIndicator size="small" color="gray"/></View> : null)}

                    <View style={quickActionsInnerViewStyle}>
                        <TouchableOpacity style={{alignItems:'center'}} onPress={() => {setQuickSetupAction('Chat')}}>
                            <Image source={require("../../../../assets/images/dashBoardImages/svg/chatIcon.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle]}/>
                            <Text style={quickbtnInnerTextStyle}>{"CHAT"}</Text>
                        </TouchableOpacity>                          
                    </View>

                    <View style={quickActionsInnerViewStyle}>
                        <TouchableOpacity style={{alignItems:'center'}} onPress={() => {setQuickSetupAction('Support')}}>
                            <Image source={require("../../../../assets/images/dashBoardImages/svg/chatQuickIcon.svg")} style={Platform.isPad ? [quickbtnInnerImgStyle,{width:wp('4%')}] :[quickbtnInnerImgStyle]}/>
                            <Text style={quickbtnInnerTextStyle}>{"SUPPORT"}</Text>
                        </TouchableOpacity>                          
                    </View>

                </ImageBackground>

            </View>

        </ScrollView>

    );
}
  
  export default DashboardTasksUI;