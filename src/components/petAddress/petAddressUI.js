import React, { useState, useEffect,useRef } from 'react';
import {View,Text,FlatList, TouchableOpacity,StyleSheet,Image} from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import TextInputComponent from '../../utils/commonComponents/textInputComponent';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import AlertComponent from '../../utils/commonComponents/alertComponent';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant";
import GooglePlacesComponent from "./../../utils/googlePlacesComponent/googlePlacesComponent";

let downArrowImg = require('./../../../assets/images/otherImages/svg/downArrowGrey.svg');

const  PetAddressUI = ({route, ...props }) => {

  const [addLine1, set_addLine1] = useState(undefined);
  const [addLine2, set_addLine2] = useState(undefined);
  const [city, set_city] = useState(undefined);
  const [state, set_state] = useState(undefined);
  const [zipCode, set_zipCode] = useState(undefined);
  const [country, set_country] = useState(undefined);
  const [allAnswered, set_allAnswered] = useState(false);
  const [isAddressChange, set_isAddressChange] = useState(false);
  const [isDropdown, set_isDropdown] = useState(false);

  let addLine1Ref = useRef('');
  let addLine2Ref = useRef('');
  let cityRef = useRef('');
  let zipCodeRef = useRef('');
  let stateRef = useRef('');
  let countryRef = useRef('');

  useEffect(() => {
    addValues(props.addLine1,props.addLine2,props.city,props.state,props.zipCode,props.country,props.allAnswered);
  }, [props.addLine1,props.addLine2,props.city,props.state,props.zipCode,props.country,props.allAnswered]);

  const addValues = (add1,add2,cityName,stateName,postal,countryName) => {
    set_addLine1(add1);
    set_addLine2(add2);
    set_city(cityName);
    set_state(stateName);
    set_zipCode(postal);
    set_country(countryName);
    set_allAnswered(props.allAnswered);
    addLine1Ref.current = add1;
    addLine2Ref.current = add2;
    cityRef.current = cityName;
    stateRef.current = stateName;
    zipCodeRef.current = postal;
    countryRef.current = countryName;
  };

    const nextButtonAction = () => {
      props.submitAction(addLine1Ref.current,addLine2Ref.current,cityRef.current,stateRef.current,zipCodeRef.current,countryRef.current,isAddressChange);
    };

    const backBtnAction = () => {
      props.navigateToPrevious();
    };

    const validateAddress = (address,value) => {

      set_isAddressChange(true);
      if(value === 1) {
        addLine1Ref.current = address ? address : '';
        set_addLine1(address ? address : '');
      } if(value === 2) {
        addLine2Ref.current = address ? address : '';
        set_addLine2(address ? address : '');
      } if(value === 3) {
        cityRef.current = address ? address : '';
        set_city(address ? address : '');
      } if(value === 4) {
        stateRef.current = address ? address : '';
        set_state(address ? address : '');
      } if(value === 5) {
        zipCodeRef.current = address ? address : '';
        set_zipCode(address ? address : '');
      } if(value === 6) {
        countryRef.current = address ? address : '';
        set_country(address ? address : '');
      }

      if(addLine1Ref.current && cityRef.current && stateRef.current && zipCodeRef.current && countryRef.current){
        set_allAnswered(true);
      } else {
        set_allAnswered(false);
      }

    };

    const popOkBtnAction = () => {
      props.popOkBtnAction()
    };

    const getAddress = (address) => {
      props.getAddress(address);
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
            title={'Pet Address'}
            backBtnAction = {() => backBtnAction()}
          />
        </View>
            
        {!props.isPetParentAddress ? <View style={{width:wp('80%'),alignSelf:'center',marginTop:hp('2%')}}>
              <Text style={CommonStyles.headerTextStyle}>{"Lets get to"}</Text>
              <Text style={CommonStyles.headerTextStyle}>{"know your pet location"}</Text>
            </View> : <View style={{width:wp('80%'),marginTop:hp('4%'),alignSelf:'center'}}>
              <Text style={CommonStyles.headerTextStyle}>{Constant.CHANGE_ADDRESS_LATER_HEADER}</Text>
        </View>}

        {!props.isPetParentAddress ? <View style={{marginTop:hp('2%'),width:wp('100%'),height:hp('5%'),zIndex:999}}>
          <GooglePlacesComponent
            setValue={(address) => {
              getAddress(address)
            }}
          />
        </View> : null}

        <KeyboardAwareScrollView showsVerticalScrollIndicator={true} style={{}} enableOnAndroid={true} scrollEnabled={true}>

          {props.addressMOBJ || props.isPetParentAddress ? <View style={{width:wp('100%'),minHeight:hp('70%'),alignItems:'center',marginBottom:hp('15%')}}>

            <View style={{marginTop:hp('4%')}} >

              <TextInputComponent 
                inputText = {addLine1} 
                labelText = {'Address line 1*'} 
                isEditable = {false}
                maxLengthVal = {50}
                autoCapitalize = {'none'}
                isBackground = {'#dedede'}
              />

            </View>  

            <View style={{marginTop:hp('2%')}} >
              <TextInputComponent 
                inputText = {addLine2} 
                labelText = {'Address line 2 (Optional)'} 
                isEditable = {false}
                maxLengthVal = {50}
                autoCapitalize = {'none'}
                isBackground = {'#dedede'}
                setValue={(textAnswer) => {validateAddress(textAnswer,2)}}
              />
            </View>  

            <View style={{marginTop:hp('2%')}} >
              <TextInputComponent 
                inputText = {city} 
                labelText = {'City*'} 
                isEditable = {false}
                maxLengthVal = {50}
                autoCapitalize = {'none'}
                isBackground = {'#dedede'}
                setValue={(textAnswer) => {validateAddress(textAnswer,3)}}
              />
            </View>  

            <View style={{marginTop:hp('2%')}} >
              <TextInputComponent 
                inputText = {state} 
                labelText = {'State*'} 
                isEditable = {false}
                maxLengthVal = {50}
                autoCapitalize = {'none'}
                isBackground = {'#dedede'}
                setValue={(textAnswer) => {validateAddress(textAnswer,4)}}
              />
            </View>  

            <View style={{marginTop:hp('2%')}} >
              <TextInputComponent 
                inputText = {country} 
                labelText = {'Country*'} 
                isEditable = {false}
                maxLengthVal = {50}
                autoCapitalize = {'none'}
                isBackground = {'#dedede'}
                />
            </View> 

            <View style={{marginTop:hp('2%')}} >

              <TextInputComponent 
                inputText = {zipCode} 
                labelText = {'Zip Code*'} 
                isEditable = {false}
                maxLengthVal = {9}
                autoCapitalize = {'none'}
                isBackground = {'#dedede'}
                setValue={(textAnswer) => {validateAddress(textAnswer,5)}}
              />
            </View>   
               
          </View> : null }          
        </KeyboardAwareScrollView>

        <View style={CommonStyles.bottomViewComponentStyle}>
          <BottomComponent
            rightBtnTitle = {props.isFromScreen === 'petEdit' ? 'SUBMIT' : 'NEXT'}
            leftBtnTitle={'BACK'}
            isLeftBtnEnable = {true}
            rigthBtnState = {props.isNxtBtnEnable ? true : false}
            isRightBtnEnable = {true}
            rightButtonAction = {async () => nextButtonAction()}
            leftButtonAction = {async () => backBtnAction()}
          />
        </View>    

        {props.isPopUp ? <View style={[CommonStyles.customPopUpStyle,{zIndex:999}]}>
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

        {props.isLoading ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 

      </View>
    );
  }
  
  export default PetAddressUI;

  const styles = StyleSheet.create({

    flatcontainer: {
      flex: 1,
    },

    flatview: {
      height: hp("8%"),
      marginBottom: hp("0.3%"),
      alignSelf: "center",
      justifyContent: "center",
      borderBottomColor: "grey",
      borderBottomWidth: wp("0.1%"),
      width:wp('90%'),
      alignItems:'center' 
    },

    name: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontNormal,
      textAlign: "left",
      color: "black",
    },

    popSearchViewStyle : {
      height: hp("25%"),
      width: wp("95%"),
      backgroundColor:'#DCDCDC',
      bottom:0,
      position:'absolute',
      alignSelf:'center',
      borderTopRightRadius:15,
      borderTopLeftRadius:15
    },

    imageStyle: {
      margin: "4%",
      height: 20,
      width: 20,
      resizeMode: "contain",
    },

  });