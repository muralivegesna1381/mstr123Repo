import React, { useState, useEffect, useRef } from 'react';
import {View,StyleSheet,Text,TextInput,Keyboard,TouchableOpacity,Image,FlatList} from 'react-native';
import BottomComponent from "../../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../../utils/commonComponents/headerComponent';
import fonts from '../../../../utils/commonStyles/fonts'
import AlertComponent from '../../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../../utils/commonStyles/commonStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import LoaderComponent from './../../../../utils/commonComponents/loaderComponent';

let downArrowImg = require('./../../../../../assets/images/otherImages/svg/downArrowGrey.svg');
let searchImg = require('./../../../../../assets/images/otherImages/svg/searchIcon.svg');
let xImg = require('./../../../../../assets/images/otherImages/png/xImg.png');

const  ObservationUI = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [obsText, set_obsText] = useState(undefined);
    const [nxtBtnEnable, set_nxtBtnEnable] = useState(false);
    const [behavioursData, set_behavioursData] = useState(undefined);
    const [obserItem, set_obserItem] = useState("");
    const [isSearchView, set_isSearchView] = useState(false);
    const [searchText, set_searchText] = useState(undefined);
    const [fileterArray, set_fileterArray] = useState(undefined);
    const [isBehTypeView, set_isBehTypeView] = useState(false);
    const [behaviorText, set_behaviorText] = useState(undefined);

    let filterRef = useRef();
    
    useEffect(() => {
      set_isPopUp(props.isPopUp);
    }, [props.isFromScreen, props.isPopUp]);

    useEffect(() => {

      set_behavioursData(props.behavioursData);
      set_obsText(props.obsText);
      set_behaviorText(props.behName);
      set_nxtBtnEnable(props.nxtBtnEnable);
      set_obserItem(props.obserItem);

      if(props.behavioursData){
        set_behavioursData(props.behavioursData);
        set_fileterArray(props.behavioursData);
        filterRef.current = props.behavioursData
      }
      
    }, [props.behavioursData,props.obsText,props.behName,props.nxtBtnEnable,props.obserItem,props.behType]);

    const nextButtonAction = () => {
      props.submitAction(obsText,obserItem);
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    function selectBehaviourDrop() {
      set_isSearchView(true);
      set_isBehTypeView(false);
      set_searchText(undefined);
      Keyboard.dismiss();
    };

    const actionOnRow = (item) => {
      Keyboard.dismiss();
      set_isSearchView(!isSearchView);
      set_isBehTypeView(false);
      set_behaviorText(item.behaviorName);
      set_obserItem(item);
      set_fileterArray(behavioursData)

      if(obsText && obsText.length>0 && item.behaviorName){
        set_nxtBtnEnable(true);
      } else {
        set_nxtBtnEnable(false);
      }
    };

    const actionOnBehtype = (item) => {
      Keyboard.dismiss();
      set_isSearchView(false);
      set_isBehTypeView(false);
      set_behTypeText(item);
      set_behaviorText(undefined);
      set_nxtBtnEnable(false);
    };

    const validateObsText = (val) => {

      var str = val;
      var trimmedStr = str.trimStart();
      set_obsText(trimmedStr);
      if(trimmedStr && trimmedStr.length > 0 && behaviorText){
        set_nxtBtnEnable(true);
      } else {
        set_nxtBtnEnable(false);
      }
      
    };

    const onCancelSearch = async () => {
      set_searchText(undefined);
      searchFilterFunction("");
      set_fileterArray(behavioursData);
      Keyboard.dismiss();
    };

    const searchFilterFunction = (text) => {

      set_searchText(text);
      let newData;
      newData = behavioursData.filter(function(item) {
        const itemData = item ? item.behaviorName.toUpperCase() : "".toUpperCase();
        const textData = text.toUpperCase();          
        return itemData.indexOf(textData) > -1;
      });

      filterRef.current = newData;
      set_fileterArray(newData);
    };

    const onCancel = () => {

      Keyboard.dismiss();
      set_searchText(undefined);
      set_isSearchView(false);
      set_isBehTypeView(false);
      set_fileterArray(behavioursData);
  
    };
    
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

        <View style={{width: wp('80%'),height: hp('70%'),marginTop: hp("8%"),alignSelf:'center'}}>
          <KeyboardAwareScrollView  bounces={true} showsVerticalScrollIndicator={false} enableOnAndroid={true} scrollEnabled={true} scrollToOverflowEnabled={true} enableAutomaticScroll={true}>
            <Text style={[CommonStyles.headerTextStyle,{marginBottom: hp("2%")}]}>{'Record observation/behavior'}</Text>
            <View style={styles.SectionStyle}>

              <TextInput
                style={styles.textInputStyle}
                maxLength={300}
                multiline={true}
                placeholder={'Tell us your observation (Max : 300 characters)*'}
                underlineColorAndroid="transparent"
                placeholderTextColor="#808080"
                value={obsText}
                onChangeText={async (text) => {validateObsText(text)}}
              />  
            </View> 

            <View style={{width: wp('80%'),marginTop: hp('1%'),alignItems:'center'}}>

              <TouchableOpacity style={{flexDirection:'row',borderWidth: 0.5,borderColor: "#D8D8D8",borderRadius: hp("0.5%"),width: wp("80%")}} onPress={() => {selectBehaviourDrop();}}>

                <View>
                  <View style={[styles.SectionStyle1,{}]}>
                    <View style={{flexDirection:'column',}}>
                      <Text style={styles.dropTextLightStyle}>{'Select Behavior*'}</Text>
                      {behaviorText ? <Text style={[styles.dropTextStyle]}>{behaviorText}</Text> : null}
                    </View>                            
                  </View>
                </View>

                <View style={{justifyContent:'center'}}>
                  <Image source={downArrowImg} style={styles.imageStyle} />
                </View>
     
              </TouchableOpacity>

            </View>
          </KeyboardAwareScrollView>
        </View>

        {!isSearchView && !isBehTypeView ? <View style={CommonStyles.bottomViewComponentStyle}>
          <BottomComponent
            rightBtnTitle = {'NEXT'}
            leftBtnTitle = {'BACK'}
            isLeftBtnEnable = {true}
            rigthBtnState = {nxtBtnEnable}
            isRightBtnEnable = {true}
            rightButtonAction = {async () => nextButtonAction()}
            leftButtonAction = {async () => backBtnAction()}
          />
        </View> : null}  

        {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
          <AlertComponent
            header = {props.popUpAlert}
            message={props.popUpMessage}
            isLeftBtnEnable = {false}
            isRightBtnEnable = {true}
            leftBtnTilte = {'Cancel'}
            rightBtnTilte = {'OK'}
            popUpRightBtnAction = {() => popOkBtnAction()}
          />
        </View> : null}

        {isSearchView ? <View style={styles.popSearchViewStyle}>

          <View style={{flexDirection:'row',alignItems:'center',width:wp('90%'),}}>
            <View style={styles.topView}>
              <Image source={searchImg} style={styles.searchImageStyle} />
                <TextInput
                  style={styles.textInputStyle}
                  onChangeText={(text) => searchFilterFunction(text)}
                  value={searchText}
                  underlineColorAndroid="transparent"
                  placeholder="Search here"
                  returnKeyLabel="Search"
                  returnKeyType="search"
                  onSubmitEditing={Keyboard.dismiss}
                />
                {searchText && searchText.length> 0 ? <TouchableOpacity onPress={onCancelSearch} style={styles.topButtonView} >
                  <Text style={[styles.name, { color: "black", }]} > {"CLEAR"}</Text>
                </TouchableOpacity> : null}
                      
            </View>

            <TouchableOpacity onPress={onCancel} style={[styles.topButtonView,{marginLeft:wp('2%')}]} >
              <Image source={xImg} style={styles.xImageStyle} />
            </TouchableOpacity>
          </View>

          <FlatList
            style={styles.flatcontainer}
            data={filterRef.current}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => actionOnRow(item)}>
                <View style={styles.flatview}>
                  <Text numberOfLines={2} style={[styles.name]}>{item.behaviorName}</Text>
                </View>
              </TouchableOpacity>)}
            enableEmptySections={true}
            keyExtractor={(item) => item.behaviorName}
          />
              
        </View> : null}
        {props.isLoading === true ? <LoaderComponent isLoader={true} loaderText = {props.loaderMsg} isButtonEnable = {false} /> : null} 
      </View>
    );
  }
  
  export default ObservationUI;

  const styles = StyleSheet.create({

    textInputStyle: {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontNormal,
      flex: 1,
      marginLeft: "5%",
      marginRight: "5%",
      color: "black",
    },

    SectionStyle: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#D8D8D8",
      width: wp("80%"),
      borderRadius: 5,
      alignSelf: "center",
      marginBottom: hp("1%"),
      height:hp('15%'),
    },

    SectionStyle1: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      minHeight: hp("8%"),
      width: wp("70%"),
      borderRadius: hp("0.5%"),
      alignSelf: "center",
    },

    imageStyle: {
      margin: "4%",
      height: 20,
      width: 20,
      resizeMode: "contain",
    },

    xImageStyle: {
      width: wp("8%"),
      height: wp("8%"),
      resizeMode: "contain",
    },

    dropTextStyle : {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontNormal,
      color:'black',
      width: wp("60%"),
      alignSelf:'flex-start',
      marginBottom: hp("1%"),
      marginTop: hp("1%"),
    },

    dropTextLightStyle : {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontMedium,
      color:'grey',
      width: wp("60%"),
      alignSelf:'flex-start',
      marginTop: hp("1%"),     
    },

    topView: {
      height: hp("5%"),
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:'white',
      marginTop: hp("2%"),
      marginBottom: hp("2%"),
      width: wp("80%"),
      borderRadius:10,
      justifyContent:'space-between'     
    },

    popSearchViewStyle : {
      height: hp("80%"),
      width: wp("100%"),
      backgroundColor:'#DCDCDC',
      bottom:0,
      position:'absolute',
      alignSelf:'center',
      borderTopRightRadius:15,
      borderTopLeftRadius:15,
      alignItems: "center",
    },

    flatcontainer: {
      flex: 1,
    },

    flatview: {
      height: hp("8%"),
      marginBottom: hp("0.3%"),
      alignContent: "center",
      justifyContent: "center",
      borderBottomColor: "grey",
      borderBottomWidth: wp("0.1%"),
      width:wp('90%'),
      alignItems: "center",
    },

    name: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontMedium,
      textAlign: "left",
      color: "black",
    },

    searchImageStyle : {
      height: hp("2%"),
      width: wp("2%"),
      flex:0.2,
      resizeMode:'contain',
      marginLeft: hp("2%"),
    },

    topButtonView: {
      alignContent: "center",
      justifyContent: "center",
      height: hp("5%"),
      marginRight: hp("2%"),
    },

  });