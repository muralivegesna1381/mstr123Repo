import React, { useState, useEffect, useRef } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image,ImageBackground,FlatList,ActivityIndicator,Platform} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../../utils/commonComponents/loaderComponent';
import moment from "moment";
import * as Constant from "./../../../utils/constants/constant";

import DefaultPetImg from  "../../../../assets/images/otherImages/png/defaultDogIcon_dog.png";
import DeniedImg from "./../../../../assets/images/pointTracking/svg/ptDeniedImg.svg";
import ApprovedImg from "./../../../../assets/images/pointTracking/svg/ptTickGreeen.svg";
import PendingImg from "./../../../../assets/images/pointTracking/svg/ptPendingImg.svg";
import NoLogsDogImg from "./../../../../assets/images/dogImages/noRecordsDog.svg";
import NoLogsCatImg from "./../../../../assets/images/dogImages/noRecordsCat.svg";
import PtPointBackGreenImg from "./../../../../assets/images/pointTracking/svg/ptPointsBckImgGreen.svg";
import PtPointBackGreyImg from "./../../../../assets/images/pointTracking/svg/ptPointsBckImgGrey.svg";
import RewardHeaderImg from "./../../../../assets/images/pointTracking/svg/rewardsHeaderBackImg.svg";

const  RewardPointsUi = ({route, ...props }) => {

    const [awardedArray, set_awardedArray] = useState([]);
    const [totalRewardPoints, set_totalRewardPoints] = useState(undefined);
    const [totalRedeemablePoints, set_totalRedeemablePoints] = useState(undefined);
    const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
    const [selectedBtn, set_selectedBtn] = useState("Awarded");
    const [imgLoader, set_imgLoader] = useState(true);
    const [redeemedArray, set_redeemedArray] = useState([]);
    const [isImgFailed, set_isImgFailed] = useState(false);

    let petImg = useRef('');
    useEffect(() => {

      if(props.petImg) {
        petImg.current = props.petImg;
      } else {
        petImg.current = '';
      }
        set_awardedArray(props.awardedArray);
        set_totalRewardPoints(props.totalRewardPoints);
        set_totalRedeemablePoints(props.totalRedeemablePoints);
        set_leaderBoardCurrent(props.leaderBoardCurrent);
    }, [props.awardedArray,props.totalRewardPoints,props.totalRedeemablePoints,props.leaderBoardCurrent,props.petImg]);

    useEffect(() => {
        set_redeemedArray(props.redeemedArray);
    }, [props.redeemedArray]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    }

    const getRewardsRedeemedDetails = () => {
        props.getRewardsRedeemedDetails();
    }

    const renderRedeemedItem = ({ item, index }) => {

      return (
        <TouchableOpacity key={index} style={{backgroundColor:'#EFEFEF', width: wp("90%"), alignSelf:'center', borderBottomWidth:0.5, borderBottomColor:'grey'}} onPress={() => { }}>
          <View style={{flexDirection: "row", width:wp('100%'), backgroundColor: "white", justifyContent:'center',alignSelf:'center',}}>
            <View style={{ flexDirection: "row",alignItems:'center',width:wp('90%'), height: hp("8%"),justifyContent:'center'}}>
              <PtPointBackGreenImg width={wp("10%")} height={hp("5%")} style={[styles.redeemImgStyle]}/>
              <Text style={[styles.actiNameStyle,{flex:1.5,marginLeft:wp('5%')}]}>{moment(item.createdDate).format("MM-DD-YYYY")}</Text>
              <View style={{flexDirection:'row',flex:1}}>
                <ApprovedImg style={[styles.statusImgStyle]}/>
                  <Text style={styles.actiNameStyle}>{'Redeemed'}</Text>
              </View>   
            </View>
          </View>
          </TouchableOpacity>
      );
    }

    const renderItem = ({ item, index }) => {

      return (
          
          <TouchableOpacity disabled={true} key={index} style={{ backgroundColor:'#EFEFEF', width: wp("90%"), alignSelf:'center', borderBottomWidth:0.5, borderBottomColor:'grey'}}onPress={() => {}}>

            <View style={{backgroundColor: "#FFFFFF",flexDirection: "row", minHeight: hp("8%")}}>

              <View style={{flex: 0.3 ,alignItems: "center",justifyContent:'center',marginRight: wp("2%"), }}>
                {item.status === 'Approved' ? <View>
                  <PtPointBackGreenImg width={wp("10%")} height={hp("5%")} style={[styles.rankImgStyle]}/>
                  <View style={{width: wp("10%"),height: hp("5%"),position:'absolute', alignItems:'center',justifyContent:'center'}}>
                    <Text style={[styles.rankText,{}]}>{item.points ? "+"+item.points : 'N/A'}</Text>
                  </View>
                </View>
                : 

                <View>
                  <PtPointBackGreyImg width={wp("10%")} height={hp("5%")} style={[styles.rankImgStyle]}/>
                  <View style={{width: wp("10%"),height: hp("5%"),position:'absolute', alignItems:'center',justifyContent:'center'}}>
                    <Text style={styles.rankText}>{item.points ? item.points : 'N/A'}</Text>
                  </View>
                </View>}
              </View>

              <View style={{ flex: 1 ,justifyContent:'center'}}>
                {item.behaviourName ? <Text style={styles.behNameStyle}>{item.behaviourName}</Text> : null}
                <Text style={styles.actiNameStyle}>{item.activityName}</Text>
              </View>

              <View style={{ flex: 1, alignItems:'flex-end',justifyContent:'center' }}>

                <Text>{moment(item.createdDate).format("MM-DD-YYYY")}</Text>
                <View style={{ flexDirection: "row", alignItems:'center' }}>
                  {item.status === "Approved" ?< ApprovedImg style={[styles.statusImgStyle]}/> : item.status === "Pending" ? <PendingImg style={[styles.statusImgStyle]}/> : <DeniedImg style={[styles.statusImgStyle]}/>}
                  <Text style={styles.actiNameStyle}>{item.status}</Text>
                </View>

              </View>

            </View>
          </TouchableOpacity>

        );
      };

    return (
      <View style={[CommonStyles.mainComponentStyle]}>
        <View style={[CommonStyles.headerView]}>
          <HeaderComponent   
            isSettingsEnable={false}
            isChatEnable={false}
            isTImerEnable={false}
            isTitleHeaderEnable={true}
            title={'Reward Points'}
            isBackBtnEnable={true}
            backBtnAction = {() => backBtnAction()}
          />
        </View>

        <View style={[styles.topContainer,{marginTop:Platform.isPad ? hp('5%') : hp('0%')}]}>

          <RewardHeaderImg style={[styles.rewardImgStyle]}/>
          <View style={{alignSelf:'center',top:91.5, position:'absolute'}}>
            {petImg.current && petImg.current !== null && petImg.current !== '' ? <ImageBackground style={styles.imgStyle} imageStyle={{borderRadius:200}} resizeMode='cover' onLoadStart={() => {set_imgLoader(true),set_isImgFailed(false)}} onLoadEnd={() => {set_imgLoader(false),set_isImgFailed(false)}}
              source={{ uri: petImg.current }} onError = {() => set_isImgFailed(true)}>
              {imgLoader ? <ActivityIndicator size='large' color="grey"/> : null}
            </ImageBackground> 
            :<ImageBackground style={[styles.imgStyle]} source={DefaultPetImg}></ImageBackground> }
          </View>

        </View>

        <View style={[styles.middleContainer,{marginTop:Platform.isPad ? hp('-3%') : hp('-7%')}]}>

          <View style={{alignItems:'center',justifyContent:'center',marginTop:Platform.isPad ? hp('5%') : hp('3%')}}>
            <Text style={styles.petNameStyle}>{leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 ? leaderBoardCurrent.petName : ''}</Text>
            <Text style={styles.noOfPointsStyle}>{selectedBtn === "Awarded" ? "Total Reward Points" : "Total Redeemable Points"}</Text>
            {selectedBtn === "Awarded" ? <Text style={[styles.petPointstyle]}>{totalRewardPoints}</Text>
            : 
            <Text style={[styles.petPointstyle]}>{totalRedeemablePoints}</Text>}
          </View>

          <View style={{alignItems: "center",flexDirection: "row",justifyContent: "center",marginTop:wp('5%'),}}>
            <TouchableOpacity style={selectedBtn === "Awarded" ? [styles.btnView, { backgroundColor: "#000000" }] : [styles.btnView]}
              onPress={async () => { set_selectedBtn("Awarded")}}>
              <Text style={selectedBtn === "Awarded" ? [styles.btnTextStyle, { color: "#6BC105" }] : [styles.btnTextStyle1]}>{"Awarded"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={selectedBtn === "Redeemed" ? [styles.btnView, { backgroundColor: "#000000" }] : [styles.btnView]}
              onPress={async () => { getRewardsRedeemedDetails(); set_selectedBtn("Redeemed");}}>
              <Text style={selectedBtn === "Redeemed" ? [styles.btnTextStyle, { color: "#6BC105" }] : [styles.btnTextStyle1]}>{"Redeemed"}</Text>
            </TouchableOpacity>
          </View>
            
        </View>

        <View style={[styles.bottomContainer]}>

          {selectedBtn === "Awarded" ? (awardedArray.length>0 ? 
                
            <View style = {{marginBottom: hp("40%")}}>
              <FlatList
                data={awardedArray}
                renderItem={renderItem}
                keyExtractor={(item, index) => "" + index}
              /> 
            </View>
                  
            : 
            (props.isLoading === false ?<View style={{justifyContent:'center', alignItems:'center',marginTop: hp("1%"),}}>
              {props.defaultPetObj && props.defaultPetObj.speciesId && parseInt(props.defaultPetObj.speciesId) === 1 ? <NoLogsDogImg style= {[CommonStyles.nologsDogStyle]}/> : <NoLogsCatImg style= {[CommonStyles.nologsDogStyle]}/>}
              <Text style={[CommonStyles.noRecordsTextStyle,{marginTop: hp("2%")}]}>{Constant.NO_RECORDS_LOGS}</Text>
              <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
            </View> : null) ) : null}

            {selectedBtn === "Redeemed" ? (redeemedArray.length>0 ? 
              <View style = {{marginBottom: wp("5%")}}>
                <FlatList
                  data={redeemedArray}
                  renderItem={renderRedeemedItem}
                  keyExtractor={(item, index) => "" + index}
                /> 
              </View>
                
            : (props.isLoading === false ?<View style={{justifyContent:'center', alignItems:'center',marginTop: hp("1%"),}}>
              {props.defaultPetObj && props.defaultPetObj.speciesId && parseInt(props.defaultPetObj.speciesId) === 1 ? <NoLogsDogImg style= {[CommonStyles.nologsDogStyle]}/> : <NoLogsCatImg style= {[CommonStyles.nologsDogStyle]}/>}
              <Text style={[CommonStyles.noRecordsTextStyle,{marginTop: hp("2%")}]}>{Constant.NO_RECORDS_LOGS}</Text>
              <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
            </View> : null) ) : null}

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
        {props.isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 
      </View>
    );
  }
  
  export default RewardPointsUi;

  const styles = StyleSheet.create({

    topContainer: {
      // flex:1,
      marginTop: hp("3%"),
    },

    middleContainer: {
      // flex:1,
      // marginTop: hp("5%"),
    },

    bottomContainer: {
      // flex:2,
      marginBottom : hp("18%"),
    },

    rewardImgStyle: {
      height: hp("30%"),
      width: wp("90%"),
      alignSelf: "center",
      resizeMode: "contain",
      borderRadius: 100,
      overflow:'hidden',
      shadowColor:'#6BC105',
      shadowRadius:5,
      shadowOpacity:0.6,
      alignItems:'center',
      justifyContent:'center' 
    },

    imgStyle: {
      width: wp("33%"),
      aspectRatio:1,
      resizeMode: "contain",
      overflow: "hidden",
      borderRadius: 100,
      justifyContent:'center'
    },
        
    petNameStyle: {
      ...CommonStyles.textStyleBold,
      textAlign: "left",
      color: "black",
      fontSize: fonts.fontLarge,
    },
        
    noOfPointsStyle: {
      ...CommonStyles.textStyleRegular,
      color: "black",
      fontSize: fonts.fontNormal,
    },
        
    btnView: {
      width: wp("30%"),
      minHeight: hp("4%"),
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
    },
        
    btnTextStyle: {
      ...CommonStyles.textStyleSemiBold,
      textAlign: "left",
      color: "black",
      fontSize: fonts.fontMedium,
    },
          
    btnTextStyle1: {
      ...CommonStyles.textStyleRegular,
      textAlign: "left",
      color: "black",
      fontSize: fonts.fontMedium,
    },
          
    rankImgStyle: {
      height: hp("5%"),
      width: wp("10%"),
      resizeMode: "contain",
      alignItems: 'center',
      justifyContent: "center",
    },

    redeemImgStyle: {
      resizeMode: "contain",
      alignItems: 'center',
      justifyContent: "center",
      marginRight: wp("2%"),    
    },
        
    statusImgStyle: {
      height: hp("3%"),
      width: wp("3%"),
      alignSelf: "center",
      resizeMode: "contain",
      marginRight: hp("1%"),
    },
        
    rankText: {
      ...CommonStyles.textStyleExtraBoldItalic,
      fontSize: fonts.fontMedium1,
      color:'white'
    },

    petPointstyle : {
      ...CommonStyles.textStyleExtraBold,
      color: "#6BC105",
      fontSize: fonts.fontXXLarge,
    },

    behNameStyle : {
      ...CommonStyles.textStyleBold,
      color: "black",
      fontSize: fonts.fontMedium,   
    },

    actiNameStyle : {       
      ...CommonStyles.textStyleRegular,
      color: "black",
      fontSize: fonts.fontMedium,            
    },

  });