import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Platform} from 'react-native';
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import SelectPetComponent from './../../../utils/selectPetComponent/selectPetComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../../utils/commonComponents/loaderComponent';

import DogCatImg from "./../../../../assets/images/dogImages/dogImgCat.svg";

const  TimerPetSelectionUI = ({route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [isLoading, set_isLoading] = useState(true);

    useEffect(() => {
        stopLoading();
    }, []);

    useEffect(() => {
        set_petsArray(props.petsArray);
        set_defaultPetObj(props.defaultPetObj);
        set_selectedIndex(props.selectedIndex);
    }, [props.petsArray,props.defaultPetObj,props.selectedIndex]);

    const stopLoading = () => {
        setTimeout(() => {
            set_isLoading(false)
        }, 2000);
    }

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
                    title={'Timer'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            <View style={[styles.petSelViewComponentStyle,{backgroundColor:'red',height: petsArray && petsArray.length < 9 ? hp('60%') : hp('75%')}]}>
                <SelectPetComponent 
                    petsArray = {petsArray}
                    defaultPetObj = {props.selectedPet ? props.selectedPet : defaultPetObj}
                    selectedIndex = {selectedIndex}
                    selectedPName = {props.selectedPName}
                    isKeboard = {props.isKeboard}
                    selectPetAction = {selectPetAction}
                />
            </View>

            {petsArray && petsArray.length < 9 ? <View style={[styles.petImgStyle,{bottom:hp('14%'),position:'absolute'}]}>
                <DogCatImg style={styles.dogImgStyle}/>             
            </View> : null}

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

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {"Please Wait..."} isButtonEnable = {false} /> : null}  

         </View>
    );
  }
  
  export default TimerPetSelectionUI;

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

  });