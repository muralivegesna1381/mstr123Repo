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
            title={'Pet Address'}
            backBtnAction = {() => backBtnAction()}
          />
        </View>
            
        <KeyboardAwareScrollView showsVerticalScrollIndicator={true} style={{marginBottom:150}} enableOnAndroid={true} scrollEnabled={true}>
          <View style={{width:wp('100%'),minHeight:hp('70%'),alignItems:'center',marginBottom:hp('20%')}}>

            {!props.isPetParentAddress ? <View style={{width:wp('80%'),marginTop:hp('4%')}}>
              <Text style={CommonStyles.headerTextStyle}>{"Lets get to"}</Text>
              <Text style={CommonStyles.headerTextStyle}>{"know your pet location"}</Text>
            </View> : <View style={{width:wp('80%'),marginTop:hp('4%')}}>
              <Text style={CommonStyles.headerTextStyle}>{Constant.CHANGE_ADDRESS_LATER_HEADER}</Text>
            </View>}

            <View style={{marginTop:hp('4%')}} >

              <TextInputComponent 
                inputText = {addLine1} 
                labelText = {'Address line 1*'} 
                isEditable = {!props.isPetParentAddress}
                maxLengthVal = {50}
                autoCapitalize = {'none'}
                isBackground = {!props.isPetParentAddress ? 'transparent' : '#dedede'}
                setValue={(textAnswer) => {validateAddress(textAnswer,1)}}
              />

            </View>  

            <View style={{marginTop:hp('2%')}} >
              <TextInputComponent 
                inputText = {addLine2} 
                labelText = {'Address line 2 (Optional)'} 
                isEditable = {props.isPetParentAddress ? false : true}
                maxLengthVal = {50}
                autoCapitalize = {'none'}
                isBackground = {!props.isPetParentAddress ? 'transparent' : '#dedede'}
                setValue={(textAnswer) => {validateAddress(textAnswer,2)}}
              />
            </View>  

            <View style={{marginTop:hp('2%')}} >
              <TextInputComponent 
                inputText = {city} 
                labelText = {'City*'} 
                isEditable = {props.isPetParentAddress ? false : true}
                maxLengthVal = {50}
                autoCapitalize = {'none'}
                isBackground = {!props.isPetParentAddress ? 'transparent' : '#dedede'}
                setValue={(textAnswer) => {validateAddress(textAnswer,3)}}
              />
            </View>  

            <View style={{marginTop:hp('2%')}} >
              <TextInputComponent 
                inputText = {state} 
                labelText = {'State*'} 
                isEditable = {props.isPetParentAddress ? false : true}
                maxLengthVal = {50}
                autoCapitalize = {'none'}
                isBackground = {!props.isPetParentAddress ? 'transparent' : '#dedede'}
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
                isBackground = {!props.isPetParentAddress ? 'transparent' : '#dedede'}
                setValue={(textAnswer) => {validateAddress(textAnswer,6)}}/>
                      
                <TouchableOpacity disabled = {!props.isPetParentAddress ? false : true} style={[CommonStyles.addressCountryStyle, {}]} onPress={() => 
                  {set_isDropdown(!isDropdown)}}>
                    <Image source={downArrowImg} style={styles.imageStyle} />
                </TouchableOpacity>
            </View> 

            <View style={{marginTop:hp('2%')}} >

              <TextInputComponent 
                inputText = {zipCode} 
                labelText = {'Zip Code*'} 
                isEditable = {props.isPetParentAddress ? false : true}
                maxLengthVal = {9}
                autoCapitalize = {'none'}
                isBackground = {!props.isPetParentAddress ? 'transparent' : '#dedede'}
                setValue={(textAnswer) => {validateAddress(textAnswer,5)}}
              />
            </View>   
               
          </View>           
        </KeyboardAwareScrollView>

        <View style={CommonStyles.bottomViewComponentStyle}>
          <BottomComponent
            rightBtnTitle = {props.isFromScreen === 'petEdit' ? 'SUBMIT' : 'NEXT'}
            leftBtnTitle={'BACK'}
            isLeftBtnEnable = {true}
            rigthBtnState = {!allAnswered ? false : true}
            isRightBtnEnable = {true}
            rightButtonAction = {async () => nextButtonAction()}
            leftButtonAction = {async () => backBtnAction()}
          />
        </View>    

        {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
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

        {isDropdown ? <View style={[styles.popSearchViewStyle]}>
          <FlatList
            style={styles.flatcontainer}
            data={['United States', 'United Kingdom']}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => {set_country(item),set_isDropdown(!isDropdown),countryRef.current = item}}>
                <View style={styles.flatview}>
                  <Text numberOfLines={2} style={[styles.name]}>{item}</Text>
                </View>
              </TouchableOpacity>
            )}
            enableEmptySections={true}
            keyExtractor={(item,index) => index}/>        
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