import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,Image,TouchableOpacity,ActivityIndicator,FlatList, ImageBackground} from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import fonts from '../../utils/commonStyles/fonts'
import CommonStyles from '../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant"
import AlertComponent from '../../utils/commonComponents/alertComponent';

import RadioBtnSelected from "./../../../assets/images/scoreImages/eRadioSelected.svg";
import RadioBtnUnSelected from "./../../../assets/images/scoreImages/eRadioUnSel.svg";

const EatingEnthusiasticUI = ({route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [eatingEntArray, set_eatingEntArray] = useState([]);
    const [selectedIndex, set_selectedIndex] = useState({enthusiasmScaleId: 0, enthusiasmScaleValue: '0', imageUrl: '', speciesId: 0});
    const [specieId, set_specieId] = useState("1");
    const [imgLoader, set_imgLoader] = useState(false);

    // Setting the values from props to local variables
    useEffect(() => {
        set_isLoading(props.isLoading);
        set_popUpMessage(props.popupMsg);
        set_isPopUp(props.isPopUp);
        set_eatingEntArray(props.eatingEntArray);
        set_specieId(props.specieId);
    }, [props.isLoading,props.eatingEntArray,props.isPopUp,props.popupMsg,props.specieId]);

    // Next btn action
    const nextButtonAction = () => {
      props.submitAction(selectedIndex);
    };

    // Back btn Action
    const backBtnAction = () => {
      props.navigateToPrevious();
    };

    // Popup btn Action
    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    // Selects the index value 
    const selectAction = (value, item) => {
        set_selectedIndex(item);
    };

    const _renderObservations = (item,index) => {

        return (
           <>
            <TouchableOpacity style={styles.tableContentViewStyle} onPress={() => { selectAction('MOST ENTHUSED', item)}}>
                {selectedIndex && parseInt(selectedIndex.enthusiasmScaleValue ) - 1 === index ? <RadioBtnSelected style={[styles.btnSelectStyle]}/> : <RadioBtnUnSelected style={[styles.btnSelectStyle]}/>}
                <Text style={[styles.desTextStyle]}>{item.enthusiasmScaleValue}</Text>
                <ImageBackground style= {[styles.dogStyle]} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => set_imgLoader(false)} resizeMode='contain' source={{uri:item.imageUrl}}>
                {imgLoader === true && item && item.imageUrl ? (<View style={[CommonStyles.spinnerStyle]}><ActivityIndicator size="large" color="#37B57C"/></View>) : null}
                </ImageBackground>
            </TouchableOpacity>
           
           </>
         )

    };

    return (
        <View style={[CommonStyles.mainComponentStyle]}>

          <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Eating Enthusiasm'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{width:wp('100%'),height:hp('75%'),alignItems:'center',justifyContent:'center'}}>

                {eatingEntArray && eatingEntArray.length > 0 ? <View style={{marginTop:hp('2%'),width:wp('80%'),}}>
                    <Text style={[styles.headerTextStyle]}>{specieId === "1" ? 'Thinking about the last meal you fed your dog, how would you rank your dog’s enjoyment of or enthusiasm for eating their food.' : 'Thinking about the last meal you fed your cat, how would you rank your cat’s enjoyment of or enthusiasm for eating their food.'}</Text>
                </View> : null}

                {eatingEntArray && eatingEntArray.length > 0 ? <FlatList
                  style={styles.flatcontainer}
                  data={eatingEntArray}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item,index}) => (_renderObservations(item,index))}
                  keyExtractor={(item,index) => "" + index}
                /> :
                <View style={{justifyContent:'center',alignItems:'center',height:hp('58%')}}>
                    <Text style={CommonStyles.noRecordsTextStyle}>{"You're all caught up!"}</Text>
                    <Text style={[styles.noRecordsTextStyle1]}>{'Please visit this space regularly to answer the image-based questions.'}</Text>
                </View> 
                }

            </View>
            
            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {parseInt(selectedIndex.enthusiasmScaleValue ) - 1 >= 0 ? true : false}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                />
            </View>  

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {"OK"}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={false} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 

         </View>
    );
  }
  
  export default EatingEnthusiasticUI;

  const styles = StyleSheet.create({

    flatcontainer: {
        width: "100%",
    },

    headerTextStyle : {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
    },

    tableContentViewStyle : {
        width:wp('90%'),
        height:hp('12%'),
        borderBottomColor:'#E7F0FC',
        borderBottomWidth:1,
        flexDirection:'row',
        alignItems:'center',
        alignSelf:'center',
    },

    dogStyle : {
        width:wp('20%'),
        height:hp('10%'),
        justifyContent:'center',
        flex:1
    },

    btnSelectStyle: {
        width: wp('5%'),
        height: hp('3%'),
        resizeMode: 'contain',
        flex:0.2
    },

    desTextStyle : {
        ...CommonStyles.textStyleMedium,
        fontSize: fonts.fontNormal,
        textAlign: "left",
        color: "black",
        flex:2.0,
        marginLeft: wp('5%'),
    },

    noRecordsTextStyle1 : {
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-Regular',
        color: 'black', 
        marginTop:hp('1%'),
        textAlign:'center'
    },

  });
