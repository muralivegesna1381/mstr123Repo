import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image, FlatList, ImageBackground,Platform} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import Fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant";

const  MenuUI = ({route, ...props }) => {

    const menuBtnAction = (item,index) => {
      props.menuBtnAction(item);
    };

    const menuHeaderBtnAction = () => {
      props.menuHeaderBtnAction();
    };

    const popOkBtnAction = () => {
      props.popOkBtnAction();
    };

    return (
        <View style={[styles.mainComponentStyle]}>

          <View style={styles.topView}>

            <TouchableOpacity style = {{width:wp('35%')}} onPress={() => menuHeaderBtnAction()}>
                <View style = {{flexDirection:'row',marginLeft:wp('5%'),alignItems:'center'}}>
                    <Image source={require('../../../assets/images/sideMenuImages/svg/menuImg.svg')} style={styles.hImgStyle} />
                    <Text style={styles.headerTextStyle}>{'Menu'}</Text>
                </View>
            </TouchableOpacity>
              
          </View>

          <View style={styles.menuView}>

            <FlatList
                style={styles.flatcontainer}
                data={props.renderArray ? props.renderArray : []}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (

                    <View style={{alignItems:'center',width: wp('30%'),}}>

                        <TouchableOpacity  onPress={() => menuBtnAction(item, index)}>
                            <View style={styles.flatview}>
                              <Image source={item.iconImg} style={Platform.isPad ? [styles.btnImgStylePad] : [styles.btnImgStyle]} />
                            </View>
                            <Text style={[styles.labelTextStyle]}>{item.title}</Text>
                        </TouchableOpacity>

                    </View> 

                )}
                keyExtractor={(item) => item.title}
                numColumns={3}
            />

          </View>

          {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
            <AlertComponent
              header = {props.popUpAlert}
              message={props.popUpMessage}
              isLeftBtnEnable = {false}
              isRightBtnEnable = {true}
              leftBtnTilte = {'NO'}
              rightBtnTilte = {'OK'}
              popUpRightBtnAction = {() => popOkBtnAction()}
                        // popUpLeftBtnAction = {() => popCancelBtnAction()}
            />
          </View> : null}

          {props.isLoading === true ? <LoaderComponent isLoader={false} loaderText = {Constant.DEFAULT_LOADER_MSG} isButtonEnable = {false} /> : null} 

        </View>
    );
  }
  
  export default MenuUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
      flex:1,
      backgroundColor:'#DFE0E9'         
    },

    topView : {
      flex : 1,
      justifyContent:'center',
    },

    menuView : {
      flex : 4,
      marginBottom :  hp('3%'),
    },

    flatcontainer: {
      width: wp('90%'),
      alignSelf:'center',      
    },

    flatview: {
      width:wp('22%'),
      aspectRatio:1,
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:'white',
      margin:  hp('1%'),
      borderRadius:5,
      marginTop :  hp('3%'),
    },

    headerTextStyle : {
      ...CommonStyles.textStyleBold,
      fontSize: Fonts.fontXLarge,
      color:'black',
      marginLeft:wp('5%'),
    },

    labelTextStyle : {
      ...CommonStyles.textStyleBold,
      fontSize: Fonts.fontSmall,
      color:'black',
      marginTop:wp('2%'),
      textAlign:'center'
    },

    btnImgStyle : {
      width:wp('20%'),
      // height:hp('10%'),
      resizeMode:'contain',
    },

    btnImgStylePad : {
      height:hp('10%'),
      width:wp('20%'),
      resizeMode:'contain',
    },

    hImgStyle : {
      width:wp('4%'),
      aspectRatio:1,
      resizeMode:'contain',
    },

  });