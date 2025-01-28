import React, { useState, useEffect,useRef } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,FlatList,Image} from 'react-native';
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

const  UpdatePetParentAddressUI = ({route, ...props }) => {

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

    if(props.petParentAddress){

      set_addLine1(props.petParentAddress.address1);
      set_addLine2(props.petParentAddress.address2);
      set_state(props.petParentAddress.state);
      set_city(props.petParentAddress.city);
      set_zipCode(props.petParentAddress.zipCode);
      set_country(props.petParentAddress.country);

      addLine1Ref.current = props.petParentAddress.address1;
      addLine2Ref.current = props.petParentAddress.address2;
      cityRef.current = props.petParentAddress.city;
      stateRef.current = props.petParentAddress.state;
      zipCodeRef.current = props.petParentAddress.zipCode;
      countryRef.current = props.petParentAddress.country;

    }
    
    
  }, [props.petParentAddress]);

    const nextButtonAction = () => {
      props.submitAction(addLine1Ref.current,addLine2Ref.current,cityRef.current,stateRef.current,zipCodeRef.current,countryRef.current);
    };

    const backBtnAction = () => {
      props.navigateToPrevious();
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
            title={'Address'}
            backBtnAction = {() => backBtnAction()}
          />
        </View>

        
        <View style={{marginTop:hp('4%'),width:wp('100%'),height:hp('5%'),zIndex:999}}>

          <GooglePlacesComponent
            setValue={(address) => {
              getAddress(address)
            }}
          />

        </View>
        
        <KeyboardAwareScrollView showsVerticalScrollIndicator={true} style={{marginBottom:150,marginTop:hp('4%')}} enableOnAndroid={true} scrollEnabled={true}>
        
          {props.petParentAddress ? <View style={{width:wp('100%'),height:hp('70%'),alignItems:'center'}}>

                <View style={{}} >

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
                    labelText = {'City*' } 
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
                    labelText = {'Zip code*'} 
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
                    rightBtnTitle = {'SUBMIT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {props.addressMOBJ ? true : false}
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
  
  export default UpdatePetParentAddressUI;