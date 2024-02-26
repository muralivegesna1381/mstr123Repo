import React, { useState, useEffect,useRef } from 'react';
import {View,Text,FlatList, TouchableOpacity,StyleSheet, Image} from 'react-native';
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

const  PetParentAddressUi = ({route, ...props }) => {

  const [addLine1, set_addLine1] = useState(undefined);
  const [addLine2, set_addLine2] = useState(undefined);
  const [city, set_city] = useState(undefined);
  const [state, set_state] = useState(undefined);
  const [zipCode, set_zipCode] = useState(undefined);
  const [country, set_country] = useState(undefined);
  const [allAnswered, set_allAnswered] = useState(false);
  const [isPrelude, set_isPrelude] = useState(false);

  let addLine1Ref = useRef('');
  let addLine2Ref = useRef('');
  let cityRef = useRef('');
  let zipCodeRef = useRef('');
  let stateRef = useRef('');
  let countryRef = useRef('');

  useEffect(() => {

    if(props.parentObj){

      set_addLine1(props.parentObj.PetParentAddress.address1);
      set_addLine2(props.parentObj.PetParentAddress.address2);
      set_city(props.parentObj.PetParentAddress.city);
      set_state(props.parentObj.PetParentAddress.state);
      set_country(props.parentObj.PetParentAddress.country);
      set_zipCode(props.parentObj.PetParentAddress.zipCode);

      addLine1Ref.current = props.parentObj.PetParentAddress.address1;
      addLine2Ref.current = props.parentObj.PetParentAddress.address2;
      cityRef.current = props.parentObj.PetParentAddress.city;
      stateRef.current = props.parentObj.PetParentAddress.state;
      zipCodeRef.current = props.parentObj.PetParentAddress.zipCode;
      countryRef.current = props.parentObj.PetParentAddress.country;
      set_allAnswered(true);
    }

    if(props.addressMOBJ) {

      set_addLine1(props.addressMOBJ.address1);
      set_addLine2(props.addressMOBJ.address2);
      set_city(props.addressMOBJ.city);
      set_state(props.addressMOBJ.state);
      set_country(props.addressMOBJ.country);
      set_zipCode(props.addressMOBJ.zipCode);

      addLine1Ref.current = props.addressMOBJ.address1;
      addLine2Ref.current = props.addressMOBJ.address2;
      cityRef.current = props.addressMOBJ.city;
      stateRef.current = props.addressMOBJ.state;
      zipCodeRef.current = props.addressMOBJ.zipCode;
      countryRef.current = props.addressMOBJ.country;

    }

    if(props.isPrelude) {
      set_allAnswered(true);
      set_isPrelude(props.isPrelude);
    }
        
  }, [props.parentObj,props.isPrelude,props.addressMOBJ]);

    const nextButtonAction = () => {
      props.submitAction(isPrelude);
    };

    const backBtnAction = () => {
      props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
      props.popOkBtnAction();
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
            title={'Pet Parent Profile'}
            backBtnAction = {() => backBtnAction()}
          />
        </View>

        <View style={{width:wp('80%'),marginTop:hp('4%'), alignSelf:'center'}}>
          <Text style={CommonStyles.headerTextStyle}>{"Let's get to"}</Text>
          <Text style={CommonStyles.headerTextStyle}>{"know your location"}</Text>
        </View>
            
        <View style={{marginTop:hp('2%'),width:wp('100%'),height:hp('5%'),zIndex:999}}>

          <GooglePlacesComponent
            setValue={(address) => {
              getAddress(address)
            }}
          />

        </View>

        <KeyboardAwareScrollView showsVerticalScrollIndicator={true} enableOnAndroid={true} scrollEnabled={true}>

          {props.addressMOBJ ? <View style={{width:wp('100%'),height:hp('70%'),alignItems:'center',marginBottom:hp('10%')}}>

              <View style={{marginTop:hp('4%')}} >

                <TextInputComponent 
                  inputText = {addLine1} 
                  labelText = {'Address line 1*'} 
                  isEditable = {false}
                  maxLengthVal = {50}
                  isBackground = {'#dedede'}
                  autoCapitalize = {'none'}
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
                />

              </View>  
                
          </View> : null}       
        </KeyboardAwareScrollView>

        <View style={CommonStyles.bottomViewComponentStyle}>
          <BottomComponent
            rightBtnTitle = {'NEXT'}
            leftBtnTitle={'BACK'}
            isLeftBtnEnable = {true}
            rigthBtnState = {props.isPrelude || props.addressMOBJ ? true : false}
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
  
  export default PetParentAddressUi;