import React, {useState,useEffect} from 'react';
import {StyleSheet,Text, View} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import fonts from './../../../utils/commonStyles/fonts'
import AlertComponent from './../../../utils/commonComponents/alertComponent';
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import * as Constant from "./../../../utils/constants/constant";
import ImageSequence from 'react-native-image-sequence';

const ConnectSensorUI = ({navigation, route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState();
    const [isLoading, set_isLoading] = useState(false);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [btnTitle, set_btnTitle] = useState(undefined);
    const [popupRBtnTitle, set_popupRBtnTitle] = useState(undefined);

    const cSImages = [
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni00.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni05.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni09.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni13.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni18.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni23.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni27.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni31.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni36.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni40.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni45.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni50.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni54.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni58.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni63.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni67.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni72.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni77.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni81.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni89.png"),       
        
      ];

    useEffect(() => {

        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popUpTitle(props.popUpTitle);
        set_isLoading(props.isLoading);
        set_btnTitle(props.btnTitle);
        set_popupRBtnTitle(props.popupRBtnTitle);

    }, [props.isPopUp,props.popUpMessage,props.popUpTitle,props.isLoading,props.btnTitle,props.popupRBtnTitle,props.isFirstTime]);

    const nextButtonAction = () => {
        props.nextBtnAction();
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
    }

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    }

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    }

return (

    <View style={CommonStyles.mainComponentStyle}>

        <View style={[CommonStyles.headerView,{}]}>
            <HeaderComponent
                isBackBtnEnable={!isLoading}
                isSettingsEnable={false}
                isChatEnable={false}
                isTImerEnable={false}
                isTitleHeaderEnable={true}
                title={'Sensor Setup'}
                backBtnAction = {() => backBtnAction()}
            />
        </View>

            <View style={styles.mainViewStyle}>
                <View style={styles.topViewStyle}>
                    {props.isFirstTime ? <Text style={[styles.headerFirstStyle]}>{Constant.SENSOR_FIRST_CONFG_MSG}</Text> : <Text style={styles.headerStyle}>{'Searching for '}<Text style={[styles.headerStyle]}>{'Sensor : '}</Text>
                    <Text style={[styles.headerStyle,{...CommonStyles.textStyleBold}]}>{props.deviceNumber}</Text>
                    </Text>}
                </View>

                <View style = {styles.videoViewStyle}>
                  {isLoading ? 
                    <ImageSequence
                        images={cSImages}
                        framesPerSecond={6}
                        style={styles.videoStyle}
                    /> : null}
                </View>

            </View>

           {btnTitle ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    //leftBtnTitle = {btnTitle}
                    rightBtnTitle  = {btnTitle}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {true}                   
                    isRightBtnEnable = {true}
                    rightButtonAction= {async () => nextButtonAction()}
                ></BottomComponent>
            </View> : null}

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpTitle}
                    message={popUpMessage}
                    isRightBtnEnable = {true}
                    rightBtnTilte = {popupRBtnTitle}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}

        </View>
    );
};

export default ConnectSensorUI;

const styles = StyleSheet.create({

    mainViewStyle :{
        flex:1,
        alignItems:'center',
    },

    topViewStyle : {
        width:wp('100%'),
        height:hp('8%'),
        justifyContent:'center',
    },

    headerStyle : {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        marginLeft:wp('8%'),       
    },

    headerFirstStyle : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleSemiBold,
        marginLeft:wp('2%'),
        marginRight:wp('2%'),       
    },

    videoViewStyle : {
        width:wp('100%'),
        height:hp('65%'),
        justifyContent:'center',
        alignItems:'center',
    },

    videoStyle : {
        width:wp('100%'),
        height:hp('27%'),       
    },

});