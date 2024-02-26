import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Image,Platform} from 'react-native';
import BottomComponent from "../../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../../utils/commonComponents/headerComponent';
import SelectPetComponent from '../../../../utils/selectPetComponent/selectPetComponent';
import AlertComponent from './../../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../../utils/commonStyles/commonStyles';

const  AddOBSSelectPetUI = ({route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);

    // Setting local variables
    useEffect(() => {
        set_petsArray(props.petsArray);
    }, [props.petsArray, props.selectedIndex,props.fromScreen]);

    useEffect(() => {
        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popUpAlert(props.popUpAlert);

    }, [props.isPopUp,props.popUpMessage,props.popUpAlert]);

    // Button actions
    const nextButtonAction = () => {
      props.submitAction();
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
      };

    const selectPetAction = (item) => {
        props.selectPetAction(item);
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
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
                    title={'Observations'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.petSelViewComponentStyle}>
                <SelectPetComponent 
                petsArray = {petsArray}
                selectedIndex = {props.selectedIndex}
                selectedPName = {props.selectedPName}
                selectPetAction = {selectPetAction}
                />
            </View>

            {petsArray && petsArray.length > 6 ? null : <View style={[styles.petImgStyle]}>
                <Image source={require("./../../../../../assets/images/dogImages/petobsImg.svg")} style={styles.dogImgStyle}/>
            </View>}

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

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpAlert}
                    message={popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'TRY AGAIN'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null} 

         </View>
    );
  }
  
  export default AddOBSSelectPetUI;

  const styles = StyleSheet.create({

    petSelViewComponentStyle : {
        height:hp('54%'),
        width:wp('100%'),
    },

    petImgStyle : {
        height:hp('18%'),
        width:wp('100%'),
        justifyContent:'center',
        alignItems:'center',
        bottom:90,
        position:'absolute'
    },

    dogImgStyle : {
        resizeMode:'contain',
        width:Platform.isPad ? wp('50%') : wp('60%'),
        height:Platform.isPad ? hp('25%') : hp('20%'),
        bottom: Platform.OS === 'ios' ? (Platform.isPad ? 100 : 15) : 5,
    }

  });