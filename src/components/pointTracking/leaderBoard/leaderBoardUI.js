import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,ImageBackground,FlatList,SafeAreaView,ActivityIndicator,Platform} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from './../../../utils/commonStyles/fonts'
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import AlertComponent from './../../../utils/commonComponents/alertComponent';

import DefaultPetImg from "../../../../assets/images/otherImages/png/defaultDogIcon_dog.png";
import DownArrowImg from "../../../../assets/images/otherImages/svg/downArrowGrey.svg";
import UpArrowImg from "../../../../assets/images/otherImages/svg/upArrow.svg";
import EyeImg from "../../../../assets/images/dashBoardImages/svg/eye.svg";
import InfoImg from "../../../../assets/images/dashBoardImages/svg/info.svg";
import RightArrowImg from "../../../../assets/images/otherImages/svg/rightArrowLightImg.svg";

const  LeaderBoardUI = ({route, ...props }) => {

  const [leaderBoardPetId, set_leaderBoardPetId] = useState(undefined);
  const [leaderBoardArray, set_leaderBoardArray] = useState([]);
  const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
  const [campagainArray, set_campagainArray] = useState([]);
  const [campagainName, set_campagainName] = useState("");
  const [isPetInTop, set_isPetInTop] = useState(false);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [dropDownPostion, set_DropDownPostion] = useState({x: 0,y: 0,width: 0,height: 0});
  const [isListOpen, set_isListOpen] = useState(false);
  const [enableLoader, set_enableLoader] = useState (true);
  const [imgLoaderLeft, set_imgLoaderLeft] = useState(true);
  const [imgLoaderMiddle, set_imgLoaderMiddle] = useState(true);
  const [imgLoaderRight, set_imgLoaderRight] = useState(true);
    
  useEffect(() => {

    set_leaderBoardPetId(props.leaderBoardPetId);
    set_leaderBoardArray(props.leaderBoardArray);
    set_leaderBoardCurrent(props.leaderBoardCurrent);
    set_campagainArray(props.campagainArray);
    set_campagainName(props.campagainName);
    set_enableLoader(props.enableLoader);
    set_isListOpen(props.isListOpen)
    if(props.leaderBoardCurrent){
      if(props.leaderBoardArray && props.leaderBoardArray.length>0){

        for(let i=0 ; i < props.leaderBoardArray.length ; i++){
          if(i < 3 && props.leaderBoardArray[i].petId === props.leaderBoardCurrent.petId){
            set_isPetInTop(true);
            return;
          } else {
            set_isPetInTop(false);
          }
              
        }
      }
    } 
  }, [props.leaderBoardPetId,props.leaderBoardArray, props.leaderBoardCurrent, props.campagainArray, props.campagainName,props.enableLoader]);

  useEffect(() => {
    set_isPopUp(props.isPopUp);
    set_popUpMessage(props.popUpMessage);
    set_popUpAlert(props.popUpAlert);
  }, [props.isPopUp,props.popUpMessage,props.popUpAlert,props.isLoading]);

  useEffect(() => {
    set_isListOpen(props.isListOpen)
  }, [props.isListOpen]);

  const campaignBtnAction = () => {
    props.campaignBtnAction();
  };

  const rewardPointsBtnAction = () => {
    props.rewardPointsBtnAction();
  };

  const campaignDropAction = () => {
    set_isListOpen(!isListOpen);
  };

  const popOkBtnAction = () => {
    props.popOkBtnAction();
  };

  const popCancelBtnAction = () => {
  };

  const getCampaign = (item) => {
    props.getCampaign(item);
    set_isListOpen(false);
  };

  const showPointsView = () => {
    props.showPointsView()
  };
   
  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity key={index} style={{ padding: 1, alignItems:'center'}} onPress={() => {getCampaign(item)}}>

        <View style={campagainName === item.campaignName ? [styles.cellBackViewStyle,{backgroundColor:'#6BC100'}] : [styles.cellBackViewStyle]}>
          <Text style={[styles.dropDownTextStyle,{color:campagainName === item.campaignName ? 'white' : 'black'}]}>{item.campaignName.length > 50 ? item.campaignName.slice(0,50) + '..' : item.campaignName}</Text>
        </View>

      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.mainComponentStyle]}>

      {!props.isLoading ? <View style={[styles.mainComponentStyle]}>

        <View style={[styles.topComStyle]}>
            
          <View onLayout={(event) => {const layout = event.nativeEvent.layout;
            const postionDetails = {x: layout.x,y: layout.y,width: layout.width,height: layout.height,};
              set_DropDownPostion(postionDetails);
            }}  style={isListOpen ? [styles.dropViewStyle1] : [styles.dropViewStyle]}>
            <TouchableOpacity style={[styles.dropViewStyle,{flexDirection:'row'}]} disabled={campagainArray && campagainArray.length > 1 ? false : true} onPress={() => {campaignDropAction()}}>
              {props.ptActivityLimits ? <Text style={[styles.campaignHeaderStyle,{color:leaderBoardArray && leaderBoardArray.length > 0 ? 'black' : 'grey'}]}>{campagainArray && campagainArray.length > 1 ? (campagainName && campagainName.length > 25 ? campagainName.slice(0,25) + '...' : campagainName) : (campagainName && campagainName.length > 30 ? campagainName.slice(0,30) + '...' : campagainName)}</Text>
              : <Text style={[styles.campaignHeaderStyle,{color:leaderBoardArray && leaderBoardArray.length > 0 ? 'black' : 'grey'}]}>{campagainName && campagainName.length > 22 ? campagainName.slice(0,22) + '...' : campagainName}</Text>}
              {campagainArray && campagainArray.length > 1 ? <View>{isListOpen ? <UpArrowImg style={Platform.isPad ? [styles.rightArrowStyle,{width:wp('2.5%')}] : [styles.rightArrowStyle]}/> : <DownArrowImg style={Platform.isPad ? [styles.rightArrowStyle,{width:wp('2.5%')}] : [styles.rightArrowStyle]}/>}</View> : null}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.viewBtnStyle} onPress={() => {campaignBtnAction()}}>
            <EyeImg width={Platform.isPad ? wp('4%') :wp('6%')} height={hp('5%')}/>
          </TouchableOpacity>

          {props.ptActivityLimits ? <TouchableOpacity style={[styles.viewBtnStyle]} onPress={() => {showPointsView()}}>
            <InfoImg width={Platform.isPad ? wp('4%') :wp('5%')} height={hp('5%')}/>
          </TouchableOpacity> : null}

        </View>

        {leaderBoardArray && leaderBoardArray.length > 0 ? 
          
          <View style={Platform.isPad ? [styles.middleComStyle, {width:wp('85%'),}] : [styles.middleComStyle,{marginTop:hp('-3%'),}]}>
        
            <View style={{flexDirection:'row',width:wp('68%'),minHeight:hp('18%'),alignItems:'center',justifyContent:'space-between'}}>

              {leaderBoardArray && leaderBoardArray.length > 1 ? <View>

                  {leaderBoardArray[1].petPhotoUrl ? 
                  <View style = {{width:wp('15%'),aspectRatio:1,borderRadius: 100,borderColor:'#05e3f6',borderWidth:1.5, justifyContent:'center',alignItems:'center'}}>
                    <ImageBackground source={{uri:leaderBoardArray[1].petPhotoUrl}} onLoadStart={() => set_imgLoaderLeft(true)} onLoadEnd={() => {
                        set_imgLoaderLeft(false)}} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad,{}] : [styles.leaderBoardPetStyle,{alignItems:'center',justifyContent:'center'}]} imageStyle={{ borderRadius: 100}}>
                      {imgLoaderLeft ? <View style={{alignItems:'center',justifyContent:'center'}}>{enableLoader ? <ActivityIndicator size="small" color="gray"/> : null}</View> : null}
                      <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('5%')}] : [styles.rankViewStyle,{marginTop:hp('0.3%')}]}>
                        <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad,{color:'#4BE0F3'}] : [styles.rankTextStyle,{color:'#4BE0F3'}]}>{leaderBoardArray && leaderBoardArray.length > 1 && leaderBoardArray[1].rank ? leaderBoardArray[1].rank : ''}</Text>
                      </View>
                    </ImageBackground>
                  </View>

                   : 

                    <View style = {{width:wp('15%'),aspectRatio:1,borderRadius: 100,borderColor:'#05e3f6',borderWidth:1.5, justifyContent:'center'}}>
                      <ImageBackground source={DefaultPetImg} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad] : [styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 100}}>
                        <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('5%')}] : [styles.rankViewStyle,{marginTop:hp('0.3%')}]}>
                          <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad,{color:'#4BE0F3'}] : [styles.rankTextStyle,{color:'#4BE0F3'}]}>{leaderBoardArray[1].rank ? leaderBoardArray[1].rank : ''}</Text>
                        </View>
                      </ImageBackground>
                    </View>
                  }
                    
                  <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                    <Text style={Platform.isPad ? [styles.petNameStyle,{textTransform: 'uppercase'}] : [styles.petNameStyle,{textTransform: 'uppercase'}]}>{leaderBoardArray && leaderBoardArray.length > 1 ? (leaderBoardArray[1].petName.length > 12 ? leaderBoardArray[1].petName.slice(0,12)+'...' : leaderBoardArray[1].petName) : ''}</Text>
                    <Text style={styles.petPointsStyle}>{leaderBoardArray && leaderBoardArray.length > 1 ? leaderBoardArray[1].points : ''}</Text>
                  </View>
                </View> : <View style={[styles.leaderBoardPetStyle]}></View>}

                {leaderBoardArray && leaderBoardArray.length > 0 ? <View style={{alignItems:'center',}}>

              {leaderBoardArray[0].petPhotoUrl ? <View style = {{width:wp('18%'),aspectRatio:1,borderRadius: 100,borderColor:'#51c710',borderWidth:1, justifyContent:'center',marginTop:wp('-3%')}}>
                
                <ImageBackground catche={'only-if-cached'} source={{uri:leaderBoardArray[0].petPhotoUrl}} onLoadStart={() => set_imgLoaderMiddle(true)} onLoadEnd={() => {
                  set_imgLoaderMiddle(false)}} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad1,{}] : [styles.leaderBoardPetStyle,{width:wp('16%'),}]} imageStyle={{ borderRadius: 100}}>
                {imgLoaderMiddle ? <View style={{alignItems:'center',justifyContent:'center',flex:1}}>{enableLoader ? <ActivityIndicator size="small" color="gray"/> : null}</View> : null}
                  <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('5%'),marginTop:hp('1.5%'),right:wp('-1.5%')}] : [styles.rankViewStyle,{marginTop:hp('1.5%'),right:wp('-1.5%')}]}>
                    <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad,{color:'#6BC000'}] : [styles.rankTextStyle,{color:'#6BC000'}]}>{leaderBoardArray && leaderBoardArray.length > 0 && leaderBoardArray[0].rank}</Text>
                  </View>
              </ImageBackground>
              </View> 
              
              :

              <View style = {{width:wp('18%'),aspectRatio:1,borderRadius: 100,borderColor:'#51c710',borderWidth:1, justifyContent:'center'}}>
                <ImageBackground source={DefaultPetImg} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad] : [styles.leaderBoardPetStyle,{width:wp('16%'),}]} imageStyle={{ borderRadius: 100}}>
                  <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('5%'),marginTop:hp('1.5%'),right:wp('-1.5%')}] : [styles.rankViewStyle,{marginTop:hp('1.5%'),right:wp('-1.5%')}]}>
                    <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad,{color:'#6BC000'}] : [styles.rankTextStyle,{color:'#6BC000'}]}>{leaderBoardArray[0].rank ? leaderBoardArray[0].rank : ''}</Text>
                  </View>
                </ImageBackground>
              </View>

              }
              <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                <Text style={[styles.petNameStyle,{textTransform: 'uppercase'}]}>{leaderBoardArray && leaderBoardArray.length > 0 ? (leaderBoardArray[0].petName.length > 12 ? leaderBoardArray[0].petName.slice(0,12)+'...' : leaderBoardArray[0].petName) : ''}</Text>
                <Text style={styles.petPointsStyle}>{leaderBoardArray && leaderBoardArray.length>0 ? leaderBoardArray[0].points : ''}</Text>
              </View>
                
              </View> : <View style={[styles.leaderBoardPetStyle]}></View>}

              {leaderBoardArray && leaderBoardArray.length > 2 ? <View style={{alignItems:'center'}}>
                {leaderBoardArray[2].petPhotoUrl ? 
                
                <View style = {{width:wp('15%'),aspectRatio:1,borderRadius: 100,borderColor:'#f6af50',borderWidth:1.5, justifyContent:'center'}}>
                    <ImageBackground catche={'only-if-cached'} source={{uri : leaderBoardArray[2].petPhotoUrl}} onLoadStart={() => set_imgLoaderRight(true)} onLoadEnd={() => {
                          set_imgLoaderRight(false)}} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad,{}] : [styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 100 }}>
                            {imgLoaderRight ? <View style={{alignItems:'center',justifyContent:'center',flex:1}}>{enableLoader ? <ActivityIndicator size="small" color="gray"/> : null}</View> : null}
                            <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('5%'),}] : [styles.rankViewStyle,{marginTop:hp('0.3%')}]}>
                              <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle,{color : '#EAA850'}]}>{leaderBoardArray[2].rank}</Text>
                            </View>
                  </ImageBackground>
                </View>
                 :
                 <View style = {{width:wp('15%'),aspectRatio:1,borderRadius: 100,borderColor:'#f6af50',borderWidth:1.5, justifyContent:'center'}}>
                  <ImageBackground source={DefaultPetImg} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad] : [styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 100}}>
                    <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('5%')}] : [styles.rankViewStyle,,{marginTop:hp('0.3%')}]}>
                      <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad,{color : '#EAA850'}] : [styles.rankTextStyle,{color : '#EAA850'}]}>{leaderBoardArray[2].rank ? leaderBoardArray[2].rank : ''}</Text>
                    </View>
                  </ImageBackground>
                 </View>
                }
                <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                  <Text style={Platform.isPad ? [styles.petNameStyle,{textTransform: 'uppercase'}] : [styles.petNameStyle,{textTransform: 'uppercase'}]}>{leaderBoardArray && leaderBoardArray.length > 2 ? (leaderBoardArray[2].petName.length > 12 ? leaderBoardArray[2].petName.slice(0,12)+'...' : leaderBoardArray[2].petName) : ''}</Text>
                  <Text style={styles.petPointsStyle}>{leaderBoardArray && leaderBoardArray.length>0 ? leaderBoardArray[2].points : ''}</Text>
                </View>
              </View> : <View style={[styles.leaderBoardPetStyle]}></View>}

            </View>

        </View> : 

        <View style={Platform.isPad ? [styles.middleComStyle, {width:wp('85%'),}] : [styles.middleComStyle,{marginTop:hp('-3%'),}]}>

          <View style={{alignItems:'center',flexDirection:'row',flexDirection:'row',width:wp('68%'),alignItems:'center',justifyContent:'space-between'}}>

            <View>

              <View style = {{width:wp('15%'),aspectRatio:1,borderRadius: 100,borderColor:'#05e3f6',borderWidth:1.5, justifyContent:'center'}}>
                <ImageBackground source={DefaultPetImg} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad] : [styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 100}}>
                  <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('5%')}] : [styles.rankViewStyle,{top:-5,right:-5}]}>
                    <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle]}>{'2'}</Text>
                  </View>
                </ImageBackground>
              </View>
 
              <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                <Text style={[styles.petNameStyle,{color:'grey'}]}>{'Please wait..'}</Text>
                  <Text style={[styles.petPointsStyle,{color:'grey'}]}>{'--'}</Text>
                </View>
            </View>

            <View>
              
              <View style = {{width:wp('18%'),aspectRatio:1,borderRadius: 100,borderColor:'#51c710',borderWidth:1.5, justifyContent:'center',marginTop:wp('-5%')}}>
                <ImageBackground source={DefaultPetImg} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad] : [styles.leaderBoardPetStyle,{width:wp('16%')}]} imageStyle={{ borderRadius: 100}}>
                  <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('5%')}] : [styles.rankViewStyle]}>
                    <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle]}>{'1'}</Text>
                  </View>
                </ImageBackground>
              </View>
                    
              <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                <Text style={[styles.petNameStyle,{color:'grey'}]}>{'Please wait..'}</Text>
                <Text style={[styles.petPointsStyle,{color:'grey'}]}>{'--'}</Text>
              </View>

            </View>

            <View>
              
              <View style = {{width:wp('15%'),aspectRatio:1,borderRadius: 100,borderColor:'#f6af50',borderWidth:1.5, justifyContent:'center'}}>
               <ImageBackground source={DefaultPetImg} style={Platform.isPad === true ? [styles.leaderBoardPetStyleiPad] : [styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 100}}>
                  <View style={Platform.isPad === true ?  [styles.rankViewStyle,{width:wp('5%')}] : [styles.rankViewStyle]}>
                    <Text style={Platform.isPad === true ? [styles.rankTextStyleiPad] : [styles.rankTextStyle]}>{'2'}</Text>
                  </View>
                </ImageBackground>
              </View>
                    
              <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                <Text style={[styles.petNameStyle,{color:'grey'}]}>{'Please wait..'}</Text>
                <Text style={[styles.petPointsStyle,{color:'grey'}]}>{'--'}</Text>
              </View>
            </View>

            </View>

        </View>}

        <View style={styles.bottomView}>

          {!isPetInTop && leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 ? <TouchableOpacity style={styles.bottomComStyle} onPress={async () => {rewardPointsBtnAction();}}>

            <ImageBackground style={[styles.rewardBackImgStyle]} imageStyle={{borderTopLeftRadius:5,borderTopRightRadius:5}} source={require("../../../../assets/images/pointTracking/png/ptBackground.png")}>
              <View style={{width:wp('65%'),flexDirection:'row',justifyContent:'space-between',}}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                  <View>
                    {leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 && leaderBoardCurrent.petPhotoUrl && leaderBoardCurrent.petPhotoUrl!=="" ? 
                      <ImageBackground style={Platform.isPad ? [styles.rewardImgStyle,{width:wp('6%')}]: [styles.rewardImgStyle]} imageStyle={{borderRadius:100, borderColor:'black',borderWidth:2 }} source={{uri: leaderBoardCurrent.petPhotoUrl}}></ImageBackground>
                      : <ImageBackground style={Platform.isPad ? [styles.rewardImgStyle,{width:wp('6%')}]: [styles.rewardImgStyle]} imageStyle={{borderRadius:100, borderColor:'black',borderWidth:2 }} source={DefaultPetImg}></ImageBackground>}
                  </View>
                  <View style={{marginLeft:wp('4%'),justifyContent:'center',height:hp('4%')}}>
                    <Text style={[styles.petNameStyle,{textTransform: 'uppercase'}]}>{leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 ? leaderBoardCurrent.petName.length > 20 ? leaderBoardCurrent.petName.slice(0, 20) + "..." : leaderBoardCurrent.petName : ''}</Text>
                    <Text style={[styles.rewardPointsStyle,{}]}>{leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 ? leaderBoardCurrent.points : ''}</Text>
                  </View>
                </View>

                <View style={{alignContent:"center",justifyContent:'center'}}>
                  <RightArrowImg width={wp('3%')} height={hp('3%')}/>
                </View>
              </View>
            </ImageBackground>

          </TouchableOpacity>

          :
            <TouchableOpacity style={styles.bottomComStyle} onPress={async () => {rewardPointsBtnAction();}}>

              <ImageBackground style={[styles.rewardBackImgStyle]} imageStyle={{borderTopLeftRadius:5,borderTopRightRadius:5}} source={require("../../../../assets/images/pointTracking/png/ptBackground.png")}>
                  <View style={{width:wp('55%'),flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <Text style={[styles.petNameStyle,{textTransform: 'uppercase'}]}>{'Reward Points'}</Text>
                    <View style={{justifyContent:'flex-end'}}>
                        <RightArrowImg width={wp('3%')} height={hp('3%')}/>            
                    </View>
                  </View>
              </ImageBackground>
    
            </TouchableOpacity>
          }

        </View>

        {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
          <AlertComponent
            header = {popUpAlert}
            message={popUpMessage}
            isLeftBtnEnable = {false}
            isRightBtnEnable = {true}
            leftBtnTilte = {'Cancel'}
            rightBtnTilte = {'TRY AGAIN'}
            popUpRightBtnAction = {() => popOkBtnAction()}
            popUpLeftBtnAction = {() => popCancelBtnAction()}
          />
        </View> : null}

        {isListOpen ? <View style={[styles.filterListStyle,{ top: dropDownPostion.y + dropDownPostion.height+8 },]}>

          <SafeAreaView style={{flex: 1}}>
            <FlatList
              nestedScrollEnabled={true}
              data={campagainArray}
              renderItem={renderItem}
              keyExtractor={(item, index) => "" + index}
            />           
          </SafeAreaView>
                
        </View> : null}

        </View> : 
        <View style={[styles.mainComponentStyle,{alignItems:'center',justifyContent:'center'}]}>
          <ActivityIndicator size="large" color="gray"/>
          <Text style={[styles.textStyle]}>{'Please wait..'}</Text>
        </View>}
      </View>
    );
  }
  
  export default LeaderBoardUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
      flex:1,
      alignItems:'center' ,
      
    },

    topComStyle : {
      // flex:0.6,
      flexDirection:'row',
      alignItems:'center',
      width:wp('93.5%'),
      height: hp("6%"),
      justifyContent:'space-between',
      // marginBottom:hp('1%'),
      marginTop:hp('1%'), 
    },

    campaignHeaderStyle : {
      fontSize: fonts.fontXSmall,
      ...CommonStyles.textStyleRegular,
      color:'black',
      marginLeft:wp('2%'), 
      textAlign:'left',
      flex : 1         
    },

    filterListStyle: {
      position: "absolute",
      width: wp("69.5%"),
      height: hp("15%"),
      backgroundColor: "#C9D6DD",
      borderBottomEndRadius : 5,
      borderBottomLeftRadius : 5,
      alignSelf:'baseline',
    },

    dropViewStyle : {
      backgroundColor:'#ECEFF0',
      height:hp('4%'),
      justifyContent:'space-between',
      alignItems:'center',
      borderRadius:5,
      flex : 1
    },

    dropViewStyle1 : {
      backgroundColor:'#ECEFF0',
      width:wp('70%'),
      height:hp('4%'),
      justifyContent:'space-between',
      alignItems:'center',
      borderTopLeftRadius : 5,
      borderTopRightRadius : 5,
      flex : 1
    },

    viewBtnStyle : {
      width:wp('10%'),
      height:hp('4%'),
      borderWidth:1,
      borderRadius:5,
      borderColor:'#D8D8D8',
      backgroundColor:'#ECEFF0',
      justifyContent:'center',
      alignItems:'center',
      marginLeft: wp('2%'),
      // alignSelf:'center'
    },

    middleComStyle : {
      width:wp('75%'),
      alignItems:'center',
      height:hp('23%'),
      justifyContent:'center',
    },

    bottomView : {
      width:wp('75%'),
      alignItems:'center',
      height:hp('5%'),
    },

    petNameStyle : {
      color:'black',
      fontSize: fonts.fontSmall,
      ...CommonStyles.textStyleBold,
    },

    petPointsStyle : {
      color:'black',
      fontSize: fonts.fontLarge,
      ...CommonStyles.textStyleBold,
    },

    bottomComStyle : {
      width:wp('68%'),
      height:hp('7%'),
      justifyContent:'center',
      alignItems:'center',
      bottom:0,
      position:'absolute',
    },

    leaderBoardPetStyle : {
      // resizeMode: 'contain',
      width:wp('13%'),
      aspectRatio:1,
      alignSelf:'center',           
    },

    leaderBoardPetStyleiPad : {
      // resizeMode: 'contain',
      width:wp('14%'),
      aspectRatio:1,
      alignSelf:'center',           
    },

    leaderBoardPetStyleiPad1 : {
      // resizeMode: 'contain',
      width:wp('17%'),
      aspectRatio:1,
      alignSelf:'center',           
    },

    leaderBoardPetStyleTop : {
      resizeMode: 'contain',
      width:wp('18%'),
      aspectRatio:1,
      alignSelf:'center',           
    },

    leaderBoardPetStyle1 : {
      resizeMode: 'contain',          
      width:wp('18%'),
      aspectRatio:1,
      alignSelf:'center',
      marginTop:wp('5%'),     
    },

    rewardImgStyle : {
      resizeMode: 'contain',          
      width:wp('10%'),
      aspectRatio:1,
      alignSelf:'center', 
    },

    rewardImgArrowStyle : {
      resizeMode:'contain',          
      height:hp('2%'), 
      aspectRatio:1        
    },

    eyeIconStyle : {
      resizeMode:'contain',          
      width:wp('5%'),
      height:hp('5%'),
      // tintColor:'green'
    },

    infoIconStyle : {
      resizeMode:'contain',          
      width:wp('4%'),
      height:hp('4%'),
      // tintColor:'green'
    },

    rightArrowStyle : {
      resizeMode:'contain',          
      width:wp('4%'),
      height:hp('3%'),
      tintColor:'black',
      marginLeft:wp('1%'), 
      marginRight:wp('2%'),
    },

    rewardBackImgStyle : {
      resizeMode:'cover',          
      width:wp('75%'),
      height:hp('6%'),
      justifyContent:'center',
      alignItems:'center'
    },

    rewardPointsStyle : {
      color:'black',
      fontSize: fonts.fontXLarge,
      ...CommonStyles.textStyleExtraBoldItalic,
    },

    rankViewStyle : {
      width:wp('6%'),
      aspectRatio:1,
      backgroundColor:'#F5F9FC',
      borderRadius:50,
      alignSelf:'flex-end',
      borderColor:'#00000029',
      borderWidth:1,
      top:-13,
      position:'absolute',
      justifyContent:'center',
      alignItems:'center'
    },

    rankTextStyle : {
      color:'black',
      fontSize: fonts.fontSmall,
      ...CommonStyles.textStyleExtraBold,
    },

    rankTextStyleiPad : {
      color:'black',
      fontSize: fonts.fontXSmall,
      ...CommonStyles.textStyleExtraBoldItalic,
      marginTop:wp('-1%'),
    },

    dropDownTextStyle : {
      color:'black',
      fontSize: fonts.fontXSmall,
      ...CommonStyles.textStyleSemiBold,
      marginLeft:wp('1%'), 
    },

    cellBackViewStyle : {
      marginBottom:wp('1%'),
      marginTop:wp('1%'),  
      borderRadius:5,
      height: hp("4%"),
      width: wp("55%"),
      justifyContent:'center',
    },

    pointAccumViewBtnStyle : {
      height:hp('4%'),
      justifyContent:'center',
      alignItems:'center',
      flex : 0.3,
    },

    pointsAccumImgStyle : {
      resizeMode:'contain',          
      width:wp('10%'),
      height:hp('5%'),   
      borderRadius:10, 
    },

    pointsAccumPopStyle : {  
      position: 'absolute',
      right: 10,
      top: hp('7%'),
      width:wp('40%'),
      minheight:hp('8%'), 
      zIndex: 1,
      // backgroundColor:'green',
      borderRadius:5,
    },

    pointsAccumPopImgStyle : {
      resizeMode:'stretch',              
    },

    pointsAccumTextStyle : {
      color:'white',
      fontSize: fonts.fontXSmall,
      ...CommonStyles.textStyleRegular,
      marginBottom:hp('1%'),
      marginTop:hp('1%'), 
      marginLeft:wp('2%'),
      marginRight:wp('2%'),
    },

    textStyle : {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontNormal,
      color:'black',
      marginTop : hp('2%'),
      marginBottom : hp('2%'),
      textAlign:'center'
    },

  });