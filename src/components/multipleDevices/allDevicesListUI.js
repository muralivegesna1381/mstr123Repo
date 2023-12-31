import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image,FlatList,ImageBackground,BackHandler,ActivityIndicator,Platform} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import AlertComponent from './../../utils/commonComponents/alertComponent';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import DeviceInfo from 'react-native-device-info';
import * as Constant from "./../../utils/constants/constant";

let tickImg = require('./../../../assets/images/otherImages/png/tick.png');

const  AllDevicesUI = ({route, ...props }) => {

    const [imgLoader, set_imgLoader] = useState(false);
    const [isRecords, set_isRecords] = useState(true);

    // Android Physical back button action
    useEffect(() => {      
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };

    },[]);

    // Setting the Devices to the UI
    useEffect(() => {

      if(props.devices) {

        if(props.devices.length > 0) {
          set_isRecords(true);
        } else {
          set_isRecords(false);
        }

      }
    }, [props.devices]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const handleBackButtonClick = () => {
      backBtnAction();
      return true;
    };

    // Caliculates the batter percentage for each Device
    const calculateBatteryPercentage = (item) => {
        let batteryLevel = item ? item.replace("%", "") : item;
        let _batteryflex = batteryLevel / 100;
        return _batteryflex;
    };

    // Saves the Device type and navigates to Configuration process
    const itemAction = async (item,index) => {
      props.itemAction(item,index);
    };

    const addButtonAction = () => {
      props.addButtonAction();
    };

    const renderItem = ({item, index }) => {

      return (

        <TouchableOpacity disabled = {true} key={index} onPress={() => {itemAction(item,index)}}>

          {item.deviceNumber ? <View style={{alignItems:'center'}}>

            <View style={styles.dataViewStyle}>

              {<View style={{flexDirection:'row',width:wp('80%'),marginTop: hp("1%"),marginBottom: hp("1%"),justifyContent:'center'}}>

                {item && item.photoUrl && item.photoUrl !=='' ? <ImageBackground  onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => set_imgLoader(false)} 
                source={{ uri: item.photoUrl }} borderRadius = {5} style={[styles.imgStyle,{flex:0.5,}]}>

                  {imgLoader === true && item && item.photoUrl ? (
                    <View style={CommonStyles.spinnerStyle}>
                      <ActivityIndicator size="small" color="#37B57C"/>
                    </View>
                  ) : null}
                  </ImageBackground> : <ImageBackground source={require("./../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg")} style={styles.imgStyle}></ImageBackground>}
                  <View style={{flexDirection:'column',flex:2}}>
                    {<Text style={[styles.deviceName,{ color: "black" },]}>{item.isDeviceSetupDone && item.battery && item.petName && item.petName.length > 15 ? item.petName.slice(0,15) + '...' : (item.petName && item.petName.length > 22 ? item.petName.slice(0,22) + '...' : item.petName)}</Text>}
                    <Text style={[styles.deviceName,{ color: "black" ,},]}>{item.deviceNumber}</Text>
                    {!item.isDeviceSetupDone ? <View style={{flexDirection:'column', }}>
                      <Text style={[styles.deviceName,{ color: "red" },]}>{'Setup Pending'}</Text>
                    </View> : (item.isFirmwareVersionUpdateRequired && item.isDeviceSetupDone ? (
                                    <View style={{flexDirection: "row",alignItems: "center",}}>
                                      <Image source={tickImg} style={styles.setupUpdateImgStyles}/>
                                      <Text style={[styles.subHeaderStyle,{color: "#37B57C", marginRight: hp("1%"),}]}>{"Update Available "}</Text>
                                    </View>
                                  ) : null)}
                  </View>  
                  {item.isDeviceSetupDone && item.battery ? <View style={{height:50,width: DeviceInfo.isTablet()? wp("18%"): wp("25%"),backgroundColor: "#F5F7FB",alignItems: "center",
                                      justifyContent: "center", borderRadius: 10,flexDirection: "row",alignSelf:'center'}}>

                    <ImageBackground style={{flexDirection: "row",flex: 1,marginLeft: hp("1%"),height:hp("2.5%"),}} resizeMode="stretch" source={require("../../../assets/images/otherImages/png/batterybg.png")}>
                      <View style={{backgroundColor: "gray",borderRadius: 2,flex: calculateBatteryPercentage(item.battery),margin: Platform.isPad ? 5 : 3,marginRight: 8,}}/>
                    </ImageBackground>

                    <Text style={[styles.batteryName,{marginRight:wp('1%'),marginLeft:wp('1%')}]}>{item.battery ? Math.round(Number(item.battery))  + '%'  : ''}</Text>
                                    
                  </View> : <View style = {{alignSelf:'center'}}><Text style={[styles.deviceName,{ color: "black" },]}>{'---'}</Text></View>}
                      {/* <View style={{flex:0.3,justifyContent:'center',alignItems:'center'}}>
                                <Image style={styles.moreImgStyels} source={require("./../../../assets/images/otherImages/svg/rightArrowLightImg.svg")}/>
                            </View> */}
              </View>}

            </View>

          </View> : null}

        </TouchableOpacity>
      );

    };

    return (
        <View style={[styles.mainComponentStyle]}>

          <View style={[CommonStyles.headerView]}>
            <HeaderComponent
              isBackBtnEnable={true}
              isSettingsEnable={false}
              isChatEnable={false}
              isTImerEnable={false}
              isTitleHeaderEnable={true}
              title={'List of Devices'}
              backBtnAction = {() => backBtnAction()}
            />
            </View>

            <View style={{flex:1,marginBottom:hp('1%'),marginTop:hp('3%'),alignSelf:'center'}}>

                {isRecords ? <FlatList
                  data={props.devices ? props.devices : undefined}
                  showsVerticalScrollIndicator={false}
                  renderItem={ renderItem }
                  keyExtractor={(item, index) => `${index}`}
                /> : <View style={{justifyContent:'center', alignItems:'center',marginTop: hp("15%"),}}>
                  <Image style= {[CommonStyles.nologsDogStyle]} source={require("./../../../assets/images/dogImages/noRecordsDog.svg")}></Image>
                  <Text style={[CommonStyles.noRecordsTextStyle,{marginTop: hp("2%")}]}>{Constant.NO_RECORDS_LOGS}</Text>
                  <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
              </View> }
                
            </View>  

            {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
              <AlertComponent
                header = {Constant.ALERT_NETWORK}
                message={Constant.NETWORK_STATUS}
                isLeftBtnEnable = {false}
                isRightBtnEnable = {true}
                leftBtnTilte = {'NO'}
                rightBtnTilte = {"OK"}
                popUpRightBtnAction = {() => popOkBtnAction()}
              />
            </View> : null}

         </View>
    );
  }
  
  export default AllDevicesUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
      flex:1,
      backgroundColor:'white'
    },

    dataViewStyle : {
      minHeight:hp('8%'),
      width:wp('90%'),
      marginTop: hp("2%"),
      borderRadius:5,
      borderColor:'#EAEAEA',
      borderWidth:1,
      justifyContent:'center',
      alignItems:'center'
    },

    imgStyle: {
      height: hp("5%"),
      width: wp("11%"),
      alignSelf: "center",
      resizeMode: "contain",
      borderRadius: 5,
      overflow: "hidden",
      marginRight: hp("1%"),
      borderColor:'red',
    },

    deviceName: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontMedium,
      // textAlign: "justify",
      margin:wp("0.5%"),
    },

    setupUpdateImgStyles: {
      height: hp("2%"),
      width: hp("2%"),
      alignSelf: "center",
      marginRight: hp("1%"),
    },

    subHeaderStyle: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontSmall,
      textAlign: "justify",
      margin:wp("0.5%"),
    },

  });