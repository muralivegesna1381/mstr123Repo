import React, { useState, useEffect,useRef } from 'react';
import {View,StyleSheet,Text} from 'react-native';
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

const  PetAddressEditUI = ({route, ...props }) => {

  const [addLine1, set_addLine1] = useState(undefined);
  const [addLine2, set_addLine2] = useState(undefined);
  const [city, set_city] = useState(undefined);
  const [state, set_state] = useState(undefined);
  const [zipCode, set_zipCode] = useState(undefined);
  const [country, set_country] = useState(undefined);

  let addLine1Ref = useRef('');
  let addLine2Ref = useRef('');
  let cityRef = useRef('');
  let zipCodeRef = useRef('');
  let stateRef = useRef('');
  let countryRef = useRef('');

  useEffect(() => {    

    addValues(props.addLine1,props.addLine2,props.city,props.state,props.zipCode,props.country,props.isNxtBtnEnable);
    
  }, [props.addLine1,props.addLine2,props.city,props.state,props.zipCode,props.country,props.isNxtBtnEnable,props.invalidAddress]);

  const addValues = (add1,add2,cityName,stateName,postal,countryName,isNext) => {
    set_addLine1(add1);
    set_addLine2(add2);
    set_city(cityName);
    set_state(stateName);
    set_zipCode(postal);
    set_country(countryName);

    addLine1Ref.current = add1;
    addLine2Ref.current = add2;
    cityRef.current = cityName;
    stateRef.current = stateName;
    zipCodeRef.current = postal;
    countryRef.current = countryName;
  };

    const nextButtonAction = () => {
      props.submitAction(addLine1Ref.current,addLine2Ref.current,cityRef.current,stateRef.current,zipCodeRef.current,countryRef.current);
    };

    const backBtnAction = () => {
      props.navigateToPrevious();
    };

    const getAddress = (address) => {
      props.getAddress(address);
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

            <View style={{width: wp("80%"),marginTop:hp('2%'),marginBottom:!props.isPetWithPP ? hp('3%') : hp('0%'),alignSelf:'center',justifyContent:'center',zIndex:999}}>
               
              {props.isEditable ? <View style={{width:wp('80%'),marginBottom:hp('1%')}}>
                <Text style={CommonStyles.headerTextStyle}>{"Lets get to"}</Text>
                <Text style={CommonStyles.headerTextStyle}>{"know your pet location"}</Text>
              </View> : <View style={{width:wp('80%'),marginBottom:hp('1%'),}}>
                <Text style={CommonStyles.headerTextStyle}>{Constant.CHANGE_ADDRESS_LATER_HEADER}</Text>
              </View>}

               {!props.isPetWithPP ? <View style={{marginBottom:hp('2%')}}>
                <GooglePlacesComponent
                    invalidAddress = {props.invalidAddress}
                    setValue={(address) => {
                      getAddress(address)
                    }}
                />
               </View> : null}

            </View>
            
            <KeyboardAwareScrollView>
              
            <View style={{width:wp('100%'),height:hp('70%'),alignItems:'center',marginBottom:hp('20%')}}>

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

            </View>           
            </KeyboardAwareScrollView>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SUBMIT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {!props.addressMOBJ && !props.isPetWithPP ? false : true}
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
  
  export default PetAddressEditUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'           
    },

  });