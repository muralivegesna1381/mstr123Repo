import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,BackHandler,TouchableOpacity,FlatList,Linking} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

import ImgRef from "./../../../assets/images/otherImages/svg/document-link.svg";
import Inst1Img from "./../../../assets/images/otherImages/svg/inst-1.svg";
import Inst2Img from "./../../../assets/images/otherImages/svg/inst-2.svg";
import Inst3Img from "./../../../assets/images/otherImages/svg/inst-3.svg";
import Inst4Img from "./../../../assets/images/otherImages/svg/inst-4.svg";
import Inst5Img from "./../../../assets/images/otherImages/svg/inst-5.svg";

const POP_SUCCESS = 1;
let trace_gInst_Screen;

const  GoalInstructionsComponent = ({navigation,route, ...props }) => {
   
    const [instArray, set_instArray] = useState(
        [
            {
                "instruction" : 'The goal setting sider allows you to slide the slider on the scale from left to right, i.e., from starting 30mins, 40mins,_____4hrs.',
                "instructionId" : 1,
                "instructionImg" : Inst1Img
            },
            {
                "instruction" : 'The forward motion goal can be modified multiple times in a day.',
                "instructionId" : 2,
                "instructionImg" : Inst2Img
            },
            {
                "instruction" : 'The latest forward motion goal set will be taken into consideration.',
                "instructionId" : 3,
                "instructionImg" : Inst3Img
            },
            {
                "instruction" : "Ideally, it is suggested to define just a forward motion goal to monitor the pet's activity.",
                "instructionId" : 4,
                "instructionImg" : Inst4Img
            },
            {
                "instruction" : "Forward motion goal-setting history data is not maintained in the mobile app.",
                "instructionId" : 5,
                "instructionImg" : Inst5Img
            },
        ]
    )

    //setting firebase helper
    useEffect(() => {
        
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_Goal_Inst);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_Goal_Inst, "User in Goal Instructions Screen", '');
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
         return () => {
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };

    } , []);

    const instructionAction = (value) => {

        if(value === 1) {
            Linking.openURL('https://www.petobesityprevention.org/articlesandnews/beingactivewithyourdo');
        } else {
            Linking.openURL('https://www.hillspet.com/dog-care/play-exercise');
        }

    }

    const initialSessionStart = async () => {
        trace_gInst_Screen = await perf().startTrace('t_inGoalInstructionsScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_gInst_Screen.stop();
    };

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    // Naigates to previous screen
    const backBtnAction = () => {
        navigation.pop();
    };

    const renderItem = ({ item, index }) => {
        return (
            <View style={{flexDirection:'row',width:wp('85%'),minHeight: ( hp('10%')),alignSelf:'center'}}>
                <item.instructionImg style={styles.imgStyle} />
                <Text style={styles.textStyle}>{item.instruction}</Text>
            </View>
        );
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
                    title={'Instructions'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.middleViewStyle}>

                <View style={{alignItems:'center' }}>
                    <View style={{ height:hp('50%'),}}>
                        <FlatList
                            data={instArray}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => "" + index}
                        /> 
                    </View>

                    <View style={{width:wp('85%'),alignSelf:'center' }}>

                        <View style={{width:wp('85%'),minHeight:hp('5%'),alignSelf:'center'}}>
                            <Text style={styles.textStyle1}>{'Looking for ways to keep your dog active?'}</Text>
                            <Text style={[styles.textStyle1,{}]}>{'Read below for helpful information & articles'}</Text>
                        </View>
                        <View style={{flexDirection:'row',marginTop:hp('2%'),}}>
                            <TouchableOpacity onPress={() => {instructionAction(1)}}>
                                <ImgRef style={styles.imgStyle1}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={{marginLeft:hp('2%'),}} onPress={() => {instructionAction(2)}}>
                                <ImgRef style={styles.imgStyle1}/>
                            </TouchableOpacity>
                        </View>
                        
                        
                    </View>
                </View>

            </View>
            
        </View>
    );
  }
  
  export default GoalInstructionsComponent;

  const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'           
    },

    middleViewStyle : {
        alignItems:'center',
        marginTop: hp("5%"),
        height:hp('90%'),
        // justifyContent:'center'
    }, 

    textStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontXSmall,
        color:'black',
        marginLeft:hp('1%'),
        flex:6,
    },

    textStyle1 : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXSmall,
        color:'black',
        marginLeft:hp('1%'),
        flex:6
    },

    imgStyle: {
        width: wp('15%'),
        aspectRatio:1,
        flex:1
    },

    imgStyle1: {
        width: wp('12%'),
        height:hp('12%'),
        marginLeft:hp('1%'),
    },

    headerViewStyleView: {
        justifyContent: 'center',
        alignItems: 'center',
    },

  });