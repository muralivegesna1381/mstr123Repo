import React, { useState, useEffect,useRef } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image,FlatList,ImageBackground} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import fonts from './../../../utils/commonStyles/fonts'
import AlertComponent from './../../../utils/commonComponents/alertComponent';
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import TextInputComponent from './../../../utils/commonComponents/textInputComponent';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import DropdownComponent from '../../../utils/commonComponents/dropDownComponent';

let downArrowImg = require('./../../../../assets/images/otherImages/svg/downArrowGrey.svg');
let radioCheckImg = require('./../../../../assets/images/otherImages/svg/radioBtnSelectedImg.svg');
let radioUnCheckImg = require('./../../../../assets/images/otherImages/svg/radioBtnUnSelectedImg.svg');

const ReplaceSensorUI = ({route, ...props }) => {

    const [newDeviceNo, set_newDeviceNo] = useState(undefined);
    // const [reasonArray, set_reasonArray] = useState([]);
    const [sensorTypeArray, set_sensorTypeArray] = useState([
        {id:1, name:'AGL2'},
        {id:2, name:'CMAS'},
        {id:3, name:'HPN1'},
        {id:4, name:'Cancel'}
    ]);
    const [sensorType, set_sensorType] = useState(null);
    const [selectedIndex, set_selectedIndex] = useState(null);
    let newDeviceNoRef = useRef(undefined);

    useEffect(() => {

        // if(props.deviceNumberNew) {
            newDeviceNoRef.current = props.deviceNumberNew
            set_newDeviceNo(props.deviceNumberNew)
        // }
       
    }, [props.isLoading,props.deviceNumberNew]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const validateNewDevice = (value) => {
        
        props.validateNewDeviceCode(value,sensorType,selectedIndex);
        
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    }

    const nextBtnAction = () => {
        props.nextBtnAction(newDeviceNo,sensorType);
    };

    const updateReason = (item, index) => {

        props.updateReason(item, index)

    };

    const selectSensorTypeDrop = () => {
        props.selectSensorTypeDrop();
    };

    const actionOnOptiontype = (value) => {
        props.actionOnOptiontype(value);
    };

    const renderItems = ({item, index}) => {

        return (

            <View style={[styles.optionsViewStyle,{}]}>

                <TouchableOpacity onPress={() => {updateReason(item,index)}}>
                    <View style={styles.optionsSubViewStyle}>
                        <View>
                            <Image style= {[styles.iconImgStyle]} source={props.selectedIndex === index ? radioCheckImg : radioUnCheckImg}></Image>
                        </View>
                        <View style={{marginLeft:hp('1%')}}>
                            <Text style={[styles.headerTextStyle]}>{item.reasonName}</Text>
                            <Text style={[styles.subHeaderTextStyle]}>{item.reasonSubName}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

            </View>
        )

    }

    return (
        <View style={[CommonStyles.mainComponentStyle,{alignItems:'center'}]}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Replace Sensor'}
                    headerColor = {'#F5F7F9'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

        <View  style={{marginBottom:hp('26%')}}>

            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator = {false}>

                <View style={{marginTop:hp('5%')}}>
                    <View style={styles.viewStyle}>
                        <View style={styles.subViewStyle}>
                            <Text style={[styles.leftTextStyle,{flex:1}]}>{'Sensor Number'}</Text>
                            <View Style={{flex:1}}>
                                <Text style={[styles.rightTextStyle,{textAlign:'right'}]}>{props.deviceNumber && props.deviceNumber.length > 9 ? props.deviceNumber.slice(0,9) : props.deviceNumber}</Text>
                                {props.deviceNumber && props.deviceNumber.length > 9 ? <Text style={[styles.rightTextStyle,{textAlign:'right'}]}>{props.deviceNumber.slice(9,props.deviceNumber.length)}</Text> : null}
                            </View>
                        </View>
                    </View>

                    <View style={styles.viewStyle}>

                        <View style={styles.subViewStyle}>
                            <Text style={[styles.leftTextStyle,{flex:1}]}>{'Pet Name'}</Text>
                            <Text numberOfLines = {0}style={[styles.rightTextStyle,{fontSize: fonts.fontMedium,flex:1.5,textAlign:'right'}]}>{props.petName ? props.petName : '--'}</Text>
                        </View>
                        
                    </View>
                </View>

                <View>

                    <TouchableOpacity style={{flexDirection:'row',borderWidth: 0.5,borderColor: "#D8D8D8",borderRadius: hp ("0.5%"),width: wp("80%"),marginTop: hp('2%')}} onPress={() => {selectSensorTypeDrop();}}>

                        <View>
                            <View style={[styles.SectionStyle1,{}]}>
                                <View style={{flexDirection:'column',}}>
                                    <Text style={[styles.dropTextLightStyle,{}]}>{'Select Sensor Type*'}</Text>
                                    {props.sensorType ? <Text style={[styles.dropTextStyle]}>{props.sensorType}</Text> : null}
                                </View>                            
                            </View>
                        </View>

                        <View style={{justifyContent:'center'}}>
                            <Image source={downArrowImg} style={styles.imageStyle} />
                        </View>
     
                    </TouchableOpacity>

                </View>

                <View style={{marginTop:hp('2%')}} >
                    <TextInputComponent 
                        inputText = {newDeviceNo} 
                        labelText = {'New Sensor Number*'} 
                        isEditable = {props.sensorType ? true : false}
                        maxLengthVal = {props.sensorType && props.sensorType.includes('HPN') ? 19 : 7}
                        setValue={(textAnswer) => {validateNewDevice(textAnswer)}}
                    />
                </View> 

                <View style={{marginTop:hp('2%')}} >

                    <Text style={[styles.leftTextStyle]}>{'Reason for Replacement'}</Text>
                    <FlatList
                        data={props.reasonsArray}
                        renderItem={renderItems}
                        showsHorizontalScrollIndicator = {false}
                        showsVerticalScrollIndicator = {false}
                        keyExtractor={(item) => item.subHeader}
                    >

                    </FlatList>

                </View>

            </KeyboardAwareScrollView>
         
        </View>  

        {<View style={CommonStyles.bottomViewComponentStyle}>
            <BottomComponent
                rightBtnTitle = {'NEXT'}
                leftBtnTitle = {'BACK'}
                isLeftBtnEnable = {true}
                rigthBtnState = {props.nextBtnEnable ? true : false}
                isRightBtnEnable = {true}
                rightButtonAction = {async () => nextBtnAction()}
                leftButtonAction = {async () => backBtnAction()}
            />
        </View>}

        {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
            <AlertComponent
                header = {props.popupAlert}
                message={props.popupMessage}
                isLeftBtnEnable = {props.isPopLeftBtnEnable}
                isRightBtnEnable = {true}
                leftBtnTilte = {'NO'}
                rightBtnTilte = {'YES'}
                popUpRightBtnAction = {() => popOkBtnAction()}
                popUpLeftBtnAction = {() => popCancelBtnAction()}
            />
        </View> : null}

        {props.isSensorType ? <View style={[CommonStyles.customPopUpStyle]}>

            <DropdownComponent
                dataArray = {sensorTypeArray}
                headerText = {'Select Sensor Type'}
                actionOnOptiontype ={actionOnOptiontype}
            />
    
        </View> : null}

        {props.isLoading ? <LoaderComponent isLoader={true} loaderText = {'Please wait..'} isButtonEnable = {false} /> : null} 

    </View>
    );
  }
  
  export default ReplaceSensorUI;

  const styles = StyleSheet.create({

    headingView : {
        width:wp('85%'),
        height:hp('6%'),
        flexDirection:'row',
        alignItems : 'center',
    },

    leftTextStyle : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        color: 'black',     
    },

    rightTextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: 'black',     
        // margin:hp('1%'), 
        numberOfLines:2
    },

    viewStyle : {
        width:wp('80%'),
        minHeight:hp('6%'),
        borderWidth:1,
        borderRadius:5,
        borderColor:'#dedede',
        marginTop:hp('2%'),
    },

    subViewStyle : {
        width:wp('70%'),
        minHeight:hp('6%'),
        flexDirection:'row',
        alignSelf : 'center',
        justifyContent:'space-between',
        alignItems:'center',
        marginTop:1,
        marginBottom:1
    },

    optionsViewStyle : {
        width:wp('80%'),
        height:hp('10%'),
        borderWidth:1,
        borderRadius:5,
        borderColor:'#dedede',
        marginTop:hp('2%'),
        justifyContent:'center'
    },

    optionsSubViewStyle : {
        width:wp('70%'),
        height:hp('6%'),
        flexDirection:'row',
        alignSelf : 'center',
        alignItems:'center',
        
    },

    iconImgStyle : {
        width:wp('8%'),
        height:hp('8%'),
        resizeMode:'contain',
        tintColor:'green'
    },

    headerTextStyle : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleSemiBold,
        color: 'black',     
    },

    subHeaderTextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleMedium,
        color: 'grey',     
    },

    dropTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontMedium,
        color:'black',
        width: wp("60%"),
        alignSelf:'flex-start',
        marginBottom: hp("1%"),
        marginTop: hp("1%"),
      },
  
      dropTextLightStyle : {
        ...CommonStyles.textStyleMedium,
        fontSize: fonts.fontMedium,
        color:'#747374',
        width: wp("60%"),
        alignSelf:'flex-start',
        marginTop: hp("1%"),     
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

  });