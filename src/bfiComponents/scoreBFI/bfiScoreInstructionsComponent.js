import React, { useState, useEffect,useRef } from "react"
import { View, Image, FlatList, Text, TouchableOpacity,StyleSheet,BackHandler} from "react-native"
import { widthPercentageToDP as wp, heightPercentageToDP as hp,} from "react-native-responsive-screen";
import CommonStyles from '../../utils/commonStyles/commonStyles';
import fonts from '../../utils/commonStyles/fonts';
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import LoaderComponent from "../../utils/commonComponents/loaderComponent";
import * as Constant from "../../utils/constants/constant";
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import * as AuthoriseCheck from '../../utils/authorisedComponent/authorisedComponent';
import * as ServiceCalls from '../../utils/getServicesData/getServicesData.js';
import AlertComponent from '../../utils/commonComponents/alertComponent';
import * as firebaseHelper from '../../utils/firebase/firebaseHelper';

const BFIScoreInstructions = ({navigation, route, ...props }) => {
  const imageColorArr=[
    '#00A650',
    '#FFCF00',
    '#FAA61A',
    '#F47920',
    '#ED1C24',
    '#C9252B',
  ]
  const backgroundColorArr=[
    '#E5F6ED',
    '#FFFAE5',
    '#FFF2DC',
    '#FEF1E8',
    '#FDE7E8',
    '#F7DEDF',
  ]
  const dogImgData=[
    require("./../../../assets/images/bfiBcsImages/20.svg"),
    require("./../../../assets/images/bfiBcsImages/30.svg"),
    require("./../../../assets/images/bfiBcsImages/40.svg"),
    require("./../../../assets/images/bfiBcsImages/50.svg"),
    require("./../../../assets/images/bfiBcsImages/60.svg"),
   require("./../../../assets/images/bfiBcsImages/70.svg"),
  ]
  const [popupMessage, set_popupMessage] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [isDetailsView, set_isDetailsView] = useState(false);
  var mainData = useRef([]);
  const [flatListData, set_FlatListData] = useState([])
  const [isLoading, set_isLoading] = useState(false);
  var instructionArray = useRef([]);
  let trace_instructions_Screen;

  //Android Physical back button action
  useEffect(() => {
    initialSessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_bfi_scoring_Instructions);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_bfi_scoring_Instructions, "User in scoring instructions Screen", '');

   getBFIInstructionsDataFromLocal();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      initialSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };

  }, []);

  const getBFIInstructionsDataFromLocal = async() =>{
    let data = await DataStorageLocal.getDataFromAsync(Constant.BFIINSTRUCTIONSDATA);
    data = JSON.parse(data)
    if(data === undefined || data === ''|| data === null){
      getBfiImageScoresData(1);
    }
    else{
      let obj;
      for(let i=0;i<data.bfiImageScores.length; i++){
       if(data.bfiImageScores[i].score === '<20' || data.bfiImageScores[i].score === '>70' || data.bfiImageScores[i].score === 'N/A' ){
       }
       else{
         obj = data.bfiImageScores[i];
         mainData.current.push(obj)
       }
     }
     set_FlatListData(mainData.current)
    } 
  };

  const handleBackButtonClick = () => {
    backBtnAction();
    return true;
  };

  const backBtnAction = () => {
    navigation.pop()
  };
  const createPopup = (aTitle, msg, rBtnTitle, isPopLeft, isPop) => {
    set_popupMessage(msg);
    set_isPopUp(isPop);
  };

  const initialSessionStart = async () => {
    trace_instructions_Screen = await perf().startTrace('t_inScoreInstructionsScreen');
  };

  const initialSessionStop = async () => {
    await trace_instructions_Screen.stop();
  };

  //Getting instructions values from backend
  const getBfiImageScoresData = async (speciesId) => {
    //setting array based on instruction type recieved
    set_isLoading(true);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    let serviceCallsObj = await ServiceCalls.getBfiImageScores(token);
    if (serviceCallsObj && serviceCallsObj.logoutData) {
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }
    if (serviceCallsObj && !serviceCallsObj.isInternet) {
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, 'OK', false, true);
      return;
    }
    if (serviceCallsObj && serviceCallsObj.statusData) {
      set_isLoading(false);
      if (serviceCallsObj.responseData.bfiImageScores.length > 0) {
        await DataStorageLocal.saveDataToAsync(Constant.BFIINSTRUCTIONSDATA, JSON.stringify(serviceCallsObj.responseData));
        let obj;
        for(let i=0;i<serviceCallsObj.responseData.bfiImageScores.length; i++){
         if(serviceCallsObj.responseData.bfiImageScores[i].score === '<20' || serviceCallsObj.responseData.bfiImageScores[i].score === '>70' || serviceCallsObj.responseData.bfiImageScores[i].score === 'N/A' ){
         }
         else{
           obj = serviceCallsObj.responseData.bfiImageScores[i];
           mainData.current.push(obj)
         }
        }
        set_FlatListData(mainData.current)
      }
      } else {
      set_isLoading(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.CAPTURED_SUBMIT_IMAGES_FAIL, 'OK', false, true);
      firebaseHelper.logEvent(firebaseHelper.event_score_instructions_api, firebaseHelper.screen_bfi_scoring_Instructions, "getBfiImageScores_api Service failed", 'Service Status : false');
    }

    if (serviceCallsObj && serviceCallsObj.error) {
      let errors = serviceCallsObj.error.length > 0 ? serviceCallsObj.error[0].code : ''
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_score_instructions_api , firebaseHelper.screen_bfi_scoring_Instructions, "getBfiImageScores_api Service failed", 'Service error : ' + errors);
    }
  };


  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={ ()=>{
        instructionArray.current = item.instructions
        set_isDetailsView(true);
      }
      }
      style={[styles.item1, {backgroundColor: backgroundColorArr[index]}  ]}>
       <View style= {{backgroundColor : imageColorArr[index], height: hp('15%'), width: wp('15%'),marginRight:wp('1%')}}/>
        <View style={{ flexDirection: "column"}}>
              <Text style={styles.textBigStyleGreenHeader} >{item.score}</Text>
              <Text style={styles.textStyleHeaderSmall} >{item.range.replace("Body Fat", "")}</Text>
              <Text style={styles.textStyleHeaderSmall} >Body fat</Text>
          </View> 
        <Image style={[styles.ratingImage1]} source={ dogImgData[index] } />
        <Image style={[ styles.arrowImage1]} source={require("./../../../assets/images/otherImages/svg/arrow.svg")} />

      </TouchableOpacity>
    );
   
  }

  const addDescView = (descArr) =>{
    for(let i=0; i<descArr.length;i++){
      return(
        <View>
        <View style={{ width: wp('100%'),justifyContent: 'center' }}>
             {descArr[0] ? <Text style={[styles.detailsSubTxtStyle]}>{descArr[0]}</Text> :null} 
             {descArr[1] ? <Text style={[styles.detailsSubTxtStyle]}>{descArr[1]}</Text> :null} 
             {descArr[2] ? <Text style={[styles.detailsSubTxtStyle]}>{descArr[2]}</Text> :null} 
            </View>
       </View>
      );       
     }
  }

  const renderItemBottomView = ({ item, index }) => {   
    return (
     <View>
      <View style={{ width: wp('100%'), justifyContent: 'center' }}>
            <Text style={[styles.detailsTxtStyle]}>{item.header}</Text>
           {
             addDescView(item.description) 
           }
          </View>
     </View>
    );
   
  }

  return (
    <View style={[styles.mainComponentStyle]}>  
        <View style={CommonStyles.headerView}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isChatEnable={false}
          isTImerEnable={false}
          isTitleHeaderEnable={true}
          title={'BFI Scoring instructions'}
          headerColor = {'white'}
          backBtnAction = {() => backBtnAction()}
        />
      </View>
      <View style={{ marginBottom: hp('1%'), alignSelf: 'center' }}>
        <FlatList data={flatListData} 
        renderItem={renderItem} 
        keyExtractor={(item, index) => `${index}`}
        />
      </View>
      {isDetailsView === true ? <View style={[styles.popSearchViewStyle]}>
        <View style={{ width: wp('85%'), height: hp('5%'), alignItems: 'flex-end'}}>
          <TouchableOpacity onPress={() => set_isDetailsView(false)}>
            <Image style={styles.closeBtnStyle} source={require("./../../../assets/images/otherImages/svg/failedXIcon.svg")}></Image>
          </TouchableOpacity>  
        </View>
        <View style={{width: wp('100%'),marginBottom: hp('1%'), alignSelf: 'center' }}>
          <FlatList 
          data={instructionArray.current} 
          renderItem={renderItemBottomView} 
          keyExtractor={item => item.order}
        />
          </View>

      </View> : null}
      {isLoading === true ? (
        <LoaderComponent
          isLoader={false}
          loaderText={"Please wait.."}
          isButtonEnable={false}
        />
      ) : null}

      {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
        <AlertComponent
          header={'Alert'}
          message={popupMessage}
          isLeftBtnEnable={false}
          isRightBtnEnable={true}
          leftBtnTilte={'NO'}
          rightBtnTilte={'OK'}
          popUpRightBtnAction={() => popOkBtnAction()}
        />
      </View> : null}
    </View>
  )
}
export default BFIScoreInstructions;

const styles = StyleSheet.create({

    mainComponentStyle: {
      flex: 1,
      backgroundColor: 'white'
    },
    detailsSubTxtStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontXSmall,
        color: "black",
        marginLeft: wp('5%'),
       marginTop: hp('0.25%'),
    },
    ratingImage1: {
      resizeMode: 'contain',
      aspectRatio: 1,
      height: hp('10%'),
      marginLeft:wp('20%'),
      marginRight:wp('5%'),
      alignSelf: 'center',
      justifyContent: 'center'
    },
    arrowImage1: {
      resizeMode: 'contain',
      height: hp('2%'),
      width: wp('5%'),
      marginRight:wp('1%'),
      alignSelf: 'center',
      justifyContent: 'flex-end',
      flex:1
    },
    textStyleHeaderSmall: {
      ...CommonStyles.textStyleSemiBold,
      color: "#000",
      fontSize: fonts.fontSmall,
      marginLeft : hp("3%"),
    },
    detailsTxtStyle: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        color: "black",
        marginTop:hp('1%'),
        marginLeft: wp('5%')
      },
    popSearchViewStyle: {
        height: hp("60%"),
        width: wp("100%"),
        backgroundColor: '#EDEDED',
        bottom: 0,
        position: 'absolute',
        alignSelf: 'center',
        alignItems: "center",
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
      },
    textBigStyleGreenHeader: {
      ...CommonStyles.textStyleBold,
      color: "#000",
      fontSize: fonts.fontXXXXLarge,
      marginTop: hp("2%"),
      marginLeft : hp("3%"),
    },
    item1: {
        flexDirection: "row",
        borderColor: '#9f9f9f',
        minHeight: hp('15%'),
        width: wp('100%'),
        flex:1,
      },
  
    textStyle: {
      ...CommonStyles.textStyleBlack,
      color: "#000",
      fontSize: fonts.fontMedium,
      textAlign: "justify",
      textAlign: "left",  
      marginLeft: hp("2%"),
      marginRight: hp("2%"),
    },
  
    closeBtnStyle: {
        width: wp('6%'),
        height: hp('6%'),
        resizeMode: 'contain',
      },
    
  });
  