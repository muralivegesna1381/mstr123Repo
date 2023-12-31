import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Image} from 'react-native';
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import fonts from './../../../utils/commonStyles/fonts'
import SelectPetComponent from './../../../utils/selectPetComponent/selectPetComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';

const  TimerPetSelectionUI = ({route, ...props }) => {

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
                    title={'Timer'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            <View style={styles.petSelViewComponentStyle}>
                <SelectPetComponent 
                petsArray = {petsArray}
                defaultPetObj = {defaultPetObj}
                selectedIndex = {selectedIndex}
                selectedPName = {props.selectedPName}
                selectPetAction = {selectPetAction}
                />
            </View>

            <View style={styles.petImgStyle}>
                <Image source={require("./../../../../assets/images/dogImages/dogImgCat.svg")} style={styles.dogImgStyle}/>               
            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
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
  
  export default TimerPetSelectionUI;

  const styles = StyleSheet.create({

    petSelViewComponentStyle : {
        height:hp('54%'),
        width:wp('100%'),
    },

    petImgStyle : {
        height:hp('18%'),
        width:wp('100%'),
        justifyContent:'center',
        alignItems:'center'
    },

    dogImgStyle : {
        width:wp('70%'),
        // height:hp('70%'),
        resizeMode:'contain',
    }

  });