import React, { useState, useEffect,useRef } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image,FlatList,ImageBackground,BackHandler,ActivityIndicator,Platform,TextInput} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import AlertComponent from './../../utils/commonComponents/alertComponent';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import DeviceInfo from 'react-native-device-info';
import * as Constant from "./../../utils/constants/constant";
import DropdownComponent from '../../utils/commonComponents/dropDownComponent';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';

import SearchImg from "./../../../assets/images/otherImages/svg/searchIcon.svg";
import NoLogsDogImg from "./../../../assets/images/dogImages/noRecordsDog.svg";
import DefaultDogImg from "./../../../assets/images/otherImages/png/defaultDogIcon_dog.png";
let tickImg = require('./../../../assets/images/otherImages/png/tick.png');

const  AllDevicesUI = ({route, ...props }) => {

    const [imgLoader, set_imgLoader] = useState(false);
    const [isRecords, set_isRecords] = useState(true);
    const [petName, set_petName] = useState(undefined);
    const [filterArray, set_filterArray] = useState(undefined);
    const [isListOpen, set_ListOpen] = useState(false);
    let isKeyboard = useRef(false);
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
        set_filterArray(props.devices)
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

    const actionOnOptiontype = (item) => {
      props.actionOnOptiontype(item);
    };

    const filterPets = (pName) => {

      if (isKeyboard.current === true) {
        set_petName(pName)
        if (pName && pName.length > 0) {
          set_ListOpen(true);
        } else {
          set_ListOpen(false);
        }

        let nestedFilter = props.devices;
        const devArray = nestedFilter.filter(type => (type.petName.toString().toUpperCase().includes(pName.toUpperCase()) || type.deviceNumber.toUpperCase().includes(pName.toUpperCase())));
  
        if (devArray && devArray.length > 0) {
          set_filterArray(devArray)
        } else {
          set_filterArray(undefined)
        }
      }
    };

    const checkforFirmwareUpadte = (item) => {

      let firmwareCheck = false;
      if(item.deviceModel === 'AGL2' || item.deviceModel === 'CMAS') {

        if(item.firmware && item.firmware !== '' && item.firmwareNew && item.firmwareNew !== '') {
          if(parseFloat(item.firmware) < parseFloat(item.firmwareNew)) {
              firmwareCheck = true;
          }

        }

        return firmwareCheck;

      } 

    }

    const renderItem = ({item, index }) => {

      return (

        <TouchableOpacity key={index} onPress={() => {itemAction(item,index)}}>

          {item.deviceNumber ? <View style={{alignItems:'center'}}>

            <View style={styles.dataViewStyle}>

              {<View style={{flexDirection:'row',width:wp('80%'),marginTop: hp("1%"),marginBottom: hp("1%"),justifyContent:'center'}}>

                {item && item.photoUrl && item.photoUrl !=='' ? <ImageBackground onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => set_imgLoader(false)} 
                source={{ uri: item.photoUrl }} borderRadius = {100} resizeMode='cover' style={[styles.imgStyle,{width: Platform.isPad ? wp("10%") : wp("15%"),}]}>

                  {imgLoader === true && item && item.photoUrl ? (
                    <View style={CommonStyles.spinnerStyle}>
                      <ActivityIndicator size="small" color="#37B57C"/>
                    </View>
                  ) : null}

                  </ImageBackground> : <ImageBackground source={DefaultDogImg} borderRadius = {100} resizeMode='cover' style={[styles.imgStyle,{width: Platform.isPad ? wp("10%") : wp("15%"),}]}></ImageBackground>}
          
                  <View style={{flexDirection:'column',flex:2}}>

                    {<Text style={[styles.deviceName,{ color: "black" },]}>{item.isDeviceSetupDone && item.battery && item.petName && item.petName.length > 15 ? item.petName.slice(0,15) + '...' : (item.petName && item.petName.length > 22 ? item.petName.slice(0,22) + '...' : item.petName)}</Text>}
                    <Text style={[styles.deviceName,{ color: "black" ,},]}>{item.deviceNumber}</Text>
                    {!item.isDeviceSetupDone ? <View style={{flexDirection:'column', }}>
                      <Text style={[styles.deviceName,{ color: "red" },]}>{'Setup Pending'}</Text>
                    </View> : (item.isFirmwareVersionUpdateRequired && item.isDeviceSetupDone ? (
                        <View style={{flexDirection: "row",alignItems: "center",}}>
                          {checkforFirmwareUpadte(item) ? <Image source={tickImg} style={styles.setupUpdateImgStyles}/> : null}
                          {checkforFirmwareUpadte(item) ? <Text style={[styles.subHeaderStyle,{color: "#37B57C", marginRight: hp("1%"),}]}>{"Update Available "}</Text> : null}
                        </View>
                        
                      ) : null)}
                      

                  </View>  

                  {item.isDeviceSetupDone && item.battery ? <View style={{height:hp("4%"),width: DeviceInfo.isTablet()? wp("16%"): wp("25%"),backgroundColor: "#F5F7FB",alignItems: "center",
                    justifyContent: "center", borderRadius: 10,flexDirection: "row",alignSelf:'center'}}>

                    <ImageBackground style={{flexDirection: "row",marginLeft: hp("1%"),flex: 1,height:hp("2.5%"),}} resizeMode="stretch" source={require("../../../assets/images/otherImages/png/batterybg.png")}>
                      <View style={{backgroundColor: "gray",borderRadius: 2,flex: calculateBatteryPercentage(item.battery),margin: Platform.isPad ? 5 : 3,marginRight: 8,}}/>
                    </ImageBackground>

                    <Text style={[styles.batteryName,{marginRight:wp('1%'),marginLeft:wp('1%')}]}>{item.battery ? Math.round(Number(item.battery))  + '%'  : ''}</Text>
                                    
                  </View> : <View style = {{alignSelf:'center'}}><Text style={[styles.deviceName,{ color: "black" },]}>{'---'}</Text></View>}
                      <View style={{flex:0.15,justifyContent:'center',alignItems:'center',marginLeft: wp("2%"),width: wp("3.5%"),}}>
                        <View style={{width: wp("1.5%"),aspectRatio:1,backgroundColor:'#707070',borderRadius:50}}></View>
                        <View style={{width: wp("1.5%"),aspectRatio:1,backgroundColor:'#707070',borderRadius:50,marginTop: hp("0.2%")}}></View>
                        <View style={{width: wp("1.5%"),aspectRatio:1,backgroundColor:'#707070',borderRadius:50,marginTop: hp("0.2%")}}></View>
                      </View>
              </View>}

              <View style={{width:wp('80%'),marginBottom:hp('1%')}}>
                {item.lastSync ? <Text style={[styles.subHeaderStyle,{}]}>{"Last Sync: " + item.lastSync}</Text> : null}
              </View>

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
            title={'List of Sensors'}
            backBtnAction = {() => backBtnAction()}
          />
        </View>

        <View style={{flex:1,marginBottom:hp('1%'),marginTop:hp('1%'),alignSelf:'center'}}>

          {props.showSearch ? <View style={Platform.isPad ? [CommonStyles.searchBarStyle, { borderRadius: 10,width: wp('90%') }] : [CommonStyles.searchBarStyle,{width: wp('90%'),}]}>

            <View style={[CommonStyles.searchInputContainerStyle]}>
              <SearchImg width={ wp("3%")} height={ hp("4%")} style={[CommonStyles.searchImageStyle]}/>
              <TextInput style={[CommonStyles.searchTextInputStyle]}
                underlineColorAndroid="transparent"
                placeholder="Search by pet or device number"
                placeholderTextColor="#7F7F81"
                autoCapitalize="none"
                value={petName}
                onFocus={() => isKeyboard.current = true}
                onChangeText={(name) => { filterPets(name) }}
              />
            </View>

          </View> : null}

          {isRecords ? <FlatList
            data={filterArray ? filterArray : undefined}
            showsVerticalScrollIndicator={false}
            renderItem={ renderItem }
            keyExtractor={(item, index) => `${index}`}
          /> : <View style={{justifyContent:'center', alignItems:'center',marginTop: hp("15%"),}}>
            <NoLogsDogImg style= {[CommonStyles.nologsDogStyle]}/>
            <Text style={[CommonStyles.noRecordsTextStyle,{marginTop: hp("2%")}]}>{Constant.NO_RECORDS_LOGS}</Text>
            <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
          </View>}
                
        </View>  

        {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
          <AlertComponent
            header = {Constant.ALERT_DEFAULT_TITLE}
            message={Constant.FIRMWARE_UPTO_DATE}
            isLeftBtnEnable = {false}
            isRightBtnEnable = {true}
            leftBtnTilte = {'NO'}
            rightBtnTilte = {"OK"}
            popUpRightBtnAction = {() => popOkBtnAction()}
          />
        </View> : null}

        {props.isListView ? <View style={[CommonStyles.customPopUpStyle]}>

          <DropdownComponent
            dataArray = {props.optionsArray}
            headerText={'Select Action'}
            actionOnOptiontype ={actionOnOptiontype}
          />
        
        </View> : null}
        {props.isLoading === true ? <LoaderComponent isLoader={true} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}
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
      width: wp("10%"),
      aspectRatio:1,
      overflow: "hidden",
      marginRight: hp("1%"),
    },

    deviceName: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontMedium,
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