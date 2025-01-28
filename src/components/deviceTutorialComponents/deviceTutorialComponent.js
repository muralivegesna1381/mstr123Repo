import React, { useState, useEffect,useRef } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,BackHandler,Linking,FlatList,Image,ImageBackground,Platform} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import * as Constant from "./../../utils/constants/constant";
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import Highlighter from 'react-native-highlight-words';
import * as AppPetsData from '../../utils/appDataModels/appPetsModel.js';

import DogSetupMissingImg from "../../../assets/images/dogImages/dogImg5.svg";
import CatSetupMissingImg from "../../../assets/images/dogImages/catImg5.svg";

let trace_dt_Screen;

let popId = 1;

const  DeviceTutorialComponent = ({route, ...props }) => {

    const navigation = useNavigation();
    const [popupMessage, set_popupMessage] = useState(undefined);
    const [popupAlert, set_popupAlert] = useState(undefined)
    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [petObj, set_petObj] = useState(undefined);
    const [petName, set_petName] = useState(undefined)
    const [typeId, set_typeId] = useState(undefined);
    const [valueType, set_valueType] = useState(undefined)
    const [supportMetialsArray, set_supportMetialsArray] = useState(undefined);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {
        
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_D_Tutorial_Units);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_D_Tutorial_Units, "User in Device Tutorial Screen", '');
        return () => {
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    
    }, []);

    useEffect(() => {

        if(route.params?.id) {
            set_typeId(route.params?.id);
            getsupportMeterials(route.params?.id);
        }

        if(route.params?.value) {
            set_valueType(route.params?.value);
        }

        if(route.params?.petName) {
            set_petName(route.params?.petName)
            
        }
    }, [route.params?.petName,route.params?.value,route.params?.id]);

    const initialSessionStart = async () => {
        trace_dt_Screen = await perf().startTrace('t_inDeviceTutorialScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_dt_Screen.stop();
    };

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const nextButtonAction = async () => {

        if(valueType === 'AddDevice') {
            navigation.navigate('SensorTypeComponent',{value:'AddDevice', petName : petObj.petName});
        } else {
            navigation.navigate('SensorInitialComponent', { defaultPetObj: petObj });
        }

    };

    /**
   * When default pet is having setup Pending or device missing,
   * Dashboard shows the pdf or videos related to abouve status.
   * This service call fetches the required meterials and loads the data in the dashboard.
   * Setup Pending id = 16 and Device missing id = 17
   * @param {*} id 
   */
    const getsupportMeterials = async (id) => {

        let defaultPet = AppPetsData.petsData.defaultPet;
        set_petObj(defaultPet)
        set_isLoading(true);
        isLoadingdRef.current = 1;

        let apiMethod = apiMethodManager.GET_APP_SUPPORT_DOCS + id;
        let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0; 
        
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
            if(apiService.data.supportMaterials){
                fetchSupportDocs(apiService.data.supportMaterials);
            } else {
              set_supportMetialsArray([]);
            }
            
        } else if(apiService && apiService.isInternet === false) {
            createPopup(true,Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,1,0);
               
        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
            set_isLoading(false);
            createPopup(true,Constant.ALERT_NETWORK,apiService.error.errorMsg,1,0);
            firebaseHelper.logEvent(firebaseHelper.event_get_Support_Met_api_fail, firebaseHelper.screen_D_Tutorial_Units, "Get Support Meterials Api Failed : ", 'Service Status : ' + apiService.error.errorMsg);
            
        } else if(apiService && apiService.logoutError !== null) {
            
        }else {
            firebaseHelper.logEvent(firebaseHelper.event_get_Support_Met_api_fail, firebaseHelper.screen_D_Tutorial_Units, "Get Support Meterials Api Failed : ", 'Service Status : false');
        }
    
    };

    const fetchSupportDocs = (sDocs) => {

        let dataArray = [];
        if (sDocs.userGuides && sDocs.userGuides.length > 0) {

            for (let i = 0; i < sDocs.userGuides.length; i++) {
                dataArray.push(sDocs.userGuides[i]);
            }

        }

        if (sDocs.videos && sDocs.videos.length > 0) {

            for (let i = 0; i < sDocs.videos.length; i++) {
                dataArray.push(sDocs.videos[i]);
            }

        }
        set_supportMetialsArray(dataArray);
    }

    const backBtnAction = () => {

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            navigation.pop();  
        }
    };

    const popOkBtnAction = () => {

        if(popId === 1) {
            popIdRef.current = 0;
            backBtnAction();
        }

        createPopup(false,'','',0,0);
        
    };

    const createPopup = (isPop,title,msg,refId,id) => {
        set_isPopUp(isPop);
        set_popupAlert(title)
        set_popupMessage(msg);
        popId = id;
        popIdRef.current = refId;      
    };

    function replaceCommaLine(data) {
        let dataToArray = data.split('#').map(item => item.trim());
        return dataToArray.join("\n");
    };

    const actionOnRow = (item,index) => {
        if(item.urlOrAnswer){

            if(item.materialTypeId === 3){
                navigation.navigate('PDFViewerComponent',{'pdfUrl' : item.urlOrAnswer,'title':item.titleOrQuestion})
            } else {
                Linking.openURL(item.urlOrAnswer);
            }
            
          }
    };

    const renderMeterials = ({ item, index }) => {

        return (

            <View>

                <TouchableOpacity onPress={() => actionOnRow(item,index)}>
                    <View style={styles.meterialViewStyle}>
                        {item.materialTypeId === 1 ? 
                        (item.thumbnailUrl ? <ImageBackground source={{uri:item.thumbnailUrl}} style={styles.backdrop} imageStyle={{borderRadius:5}}>
                            <Image source={require('./../../../assets/images/otherImages/svg/play.svg')} style={styles.playIconStyle}></Image>
                        </ImageBackground> : 
                        
                        <ImageBackground source={require("./../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg")} style={styles.backdrop} imageStyle={{borderRadius:5}}>
                            {item.materialTypeId === 1 ? <Image source={require('./../../../assets/images/otherImages/svg/play.svg')} style={styles.playIconStyle}></Image> : null}
                        </ImageBackground> )
                        : 
                        <ImageBackground source={require("./../../../assets/images/otherImages/svg/pdf.svg")} style={styles.backdrop1} imageStyle={{borderRadius:5}}></ImageBackground>}

                        <Text numberOfLines={2} style={[styles.name]}>{item.titleOrQuestion && item.titleOrQuestion.length>35 ? item.titleOrQuestion.slice(0,35)+'...' : item.titleOrQuestion}</Text>
                    </View>
                </TouchableOpacity>

            </View>
            
        );
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
                    title={'Support Materials'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{width:wp('90%'), alignSelf:'center',justifyContent:'center',marginTop: hp("5%"),}}>

                {petObj && petObj.speciesId && parseInt(petObj.speciesId) === 1 ? <DogSetupMissingImg style={[styles.missingDogImgStyle,{height:Platform.isPad ? wp('25%') : wp('35%')}]}/> : <CatSetupMissingImg style={[styles.missingCatImgStyle,{height:Platform.isPad ? wp('25%') : wp('35%')}]}/>}
                   
                <View style={[styles.buttonstyle]}>
                    <Text style={[styles.btnTextStyle]}>{valueType === 'AddDevice' ? 'DEVICE MISSING' : valueType === 'SetupPending' ? 'SETUP PENDING' : ''}</Text>
                </View>

                <View style={styles.missingBackViewStyle}>
                        
                    <Text style={styles.missingTextStyle}>{valueType === 'AddDevice' ? Constant.DEVICE_MISSING_DASHBOARD : Constant.DEVICE_PENDING_DASHBAORD}</Text>
                    {supportMetialsArray && supportMetialsArray.length > 0 ? <Text style={styles.missingTextStyle1} onPress={ ()=>                    
                        Linking.openURL(replaceCommaLine('mailto:support@wearablesclinicaltrials.com?subject=Support&body='))}>{<Highlighter
                            highlightStyle={{color: 'blue',textDecorationLine: 'underline'}}
                            searchWords={['wearables support']}
                            textToHighlight={replaceCommaLine('If you are facing any difficulty in setting your sensor up, please go through the below items or contact wearables support.')}
                    />}</Text> : null}

                    <FlatList
                        style={styles.flatcontainer}
                        data={supportMetialsArray}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderMeterials}
                        enableEmptySections={true}
                        keyExtractor={(item) => item.titleOrQuestion}
                        numColumns={3}
                    />

                </View>

            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>  

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popupAlert}
                    message={popupMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}


            {isLoading ? <LoaderComponent isLoader={true} loaderText = {'Please wait..'} isButtonEnable = {false} /> : null}  
            
         </View>
    );
  }
  
  export default DeviceTutorialComponent;

  const styles = StyleSheet.create({

    buttonstyle : {
        justifyContent: "center",
        alignItems:'center',
    
    },

    missingDogImgStyle : {
        width:wp('20%'),
        resizeMode:'contain',
        alignSelf:'center',
    },

    missingCatImgStyle : {
        // marginTop:hp('1%'),
        // width:wp('70%'),
        height:wp('35%'),
        aspectRatio:1,
        resizeMode:'contain',
        alignSelf:'center',
    },

    missingBackViewStyle : {
        width:wp('80%'), 
        justifyContent:'center', 
        alignItems:'center', 
        alignSelf:'center',
        marginTop:hp('1%'),
    },

    missingTextStyle : {
        textAlign:'center',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
    },

    missingTextStyle1 : {
        textAlign:'center',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        marginTop:hp('1%'),
    },

    flatcontainer: {
        width: wp("90%"),
        height: hp("35%"),
        marginTop: hp("2%"),
    },

    meterialViewStyle : {
        width:wp('26%'),
        height:hp('14%'),
        borderRadius:5,
        margin:  hp('1%'),
        alignSelf:'flex-start'
    },

    backdrop: {
        height: hp("8%"),
        width: wp("26%"),
        justifyContent:'center',
        resizeMode: "contain",
    },

    backdrop1: {
        height: hp("8%"),
        width: wp("26%"),
        justifyContent:'center',
        resizeMode: "stretch",
    },

    playIconStyle : {      
        width: wp("6%"),
        height: hp("6%"),
        alignSelf: "center",       
        resizeMode: "contain",
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontSmall,
        textAlign: "left",
        color: "black",
        marginLeft: hp("1%"),
        marginRight: hp("1%"),
        marginTop: hp("1%"),
    },

    btnTextStyle: {
        color: '#DE1111',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleBold,
    },

  });