import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Image,Platform,Text} from 'react-native';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import SelectPetComponent from '../../../utils/selectPetComponent/selectPetComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';

const  FoodHistoryPetSelectionUI = ({route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);

    useEffect(() => {
        set_petsArray(props.petsArray);
        set_defaultPetObj(props.defaultPetObj);
        set_selectedIndex(props.selectedIndex);
    }, [props.petsArray,props.defaultPetObj,props.selectedIndex]);

    const nextButtonAction = () => {
      props.submitAction();
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
      };

    const selectPetAction = (item) => {
        props.selectPetAction(item);
    }

    return (
        <View style={[CommonStyles.mainComponentStyle]}>

          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Food Intake'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            {petsArray && petsArray.length > 0 ? <View style={[styles.petSelViewComponentStyle,{backgroundColor:'red',height: petsArray && petsArray.length < 9 ? hp('60%') : hp('75%')}]}>
                <SelectPetComponent 
                    petsArray = {petsArray}
                    defaultPetObj = {defaultPetObj}
                    selectedIndex = {selectedIndex}
                    selectedPName = {props.selectedPName}
                    isKeboard = {props.isKeboard}
                    selectPetAction = {selectPetAction}
                />
            </View> : <View style={{justifyContent:'center',alignItems:'center',height:hp('58%'),width:wp('90%'),alignSelf:'center'}}>
                            {/* <Text style={CommonStyles.noRecordsTextStyle}>{"You're all caught up!"}</Text> */}
                            <Text style={[styles.noRecordsTextStyle1]}>{'Please visit this space regularly to submit the Food Intake for a pet.'}</Text>
                        </View> }

            {/* {petsArray && petsArray.length < 9 ? <View style={[styles.petImgStyle,{bottom:hp('14%'),position:'absolute'}]}>
                <Image source={require("./../../../../assets/images/dogImages/dogImgCat.svg")} style={styles.dogImgStyle}/>               
            </View> : null} */}

            <View style={[CommonStyles.bottomViewComponentStyle,{}]}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {props.nxtBtnEnable}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>   

         </View>
    );
  }
  
  export default FoodHistoryPetSelectionUI;

  const styles = StyleSheet.create({

    petSelViewComponentStyle : {
        height:hp('54%'),
        width:wp('100%'),
        backgroundColor:'red'
    },

    petImgStyle : {
        height:hp('15%'),
        width:wp('100%'),
        justifyContent:'center',
        alignItems:'center',
    },

    dogImgStyle : {
        resizeMode:'contain',
        width:Platform.isPad ? wp('50%') : wp('70%'),
        height: hp('20%'),
    },

    noRecordsTextStyle1 : {
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-Regular',
        color: 'black', 
        marginTop:hp('1%'),
        textAlign:'center'
    },

  });