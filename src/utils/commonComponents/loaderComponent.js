import React, { useState, useEffect } from 'react';
import {StyleSheet,View,Text,Image,Platform} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import CommonStyles from '../commonStyles/commonStyles';
import Fonts from '../../utils/commonStyles/fonts';

import LoaderBckView from "../../../assets/images/timerImages/svg/bgTimerFilter.svg"
import LoaderBckViewiPad from "../../../assets/images/timerImages/svg/bgTimerFilteriPad.svg"

const LoaderComponent = ({navigation, route,loaderText,isButtonEnable,heightLoader,isLoader,showLoderBox,loaderText2,...props }) => {

    const [heightL, set_heightL] = useState('100%');
    const [showLoaderBox1, set_showLoaderBox1] = useState('show');
    const [lMsg, set_lMsg] = useState('');

    useEffect (() => {
        if(heightLoader){
            set_heightL(heightLoader);
        }

        if(showLoderBox){
            set_showLoaderBox1(showLoderBox);
        }

        if(loaderText2){
            set_lMsg(loaderText2);
        }else {
            set_lMsg('');
        }
        
    },[heightLoader,showLoderBox,loaderText2]);

    return (

        <View style={[styles.mainActivity,{height:hp(heightL),zIndex:999}]}>

            {showLoaderBox1 === 'show' ? <View style={{alignItems:'center', justifyContent:'center'}}>
                { Platform.isPad ? <LoaderBckViewiPad/> : <LoaderBckView/>}
                <View style = {styles.loaderBckViewStyle}>
                    <View>                        
                        <Image source={require ('../../../assets/images/gifImages/Doganimation.gif')} style={[styles.dogStyle]}></Image>
                    </View>
                    <Text style={styles.textStyle}>{loaderText}</Text>
                </View> 
            </View>: null }
            
        </View>
        
    );
};

export default LoaderComponent;

const styles = StyleSheet.create({

    mainActivity : {
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'transparent',
        width:wp('100%'),
        height:hp('100%')
    },

    textStyle : {
        ...CommonStyles.textStyleLight,
        fontSize: Fonts.fontNormal,
        color:'black',
        marginLeft : wp('2%'),
        marginRight: wp('2%'),
        marginTop : hp('2%'),
        marginBottom : hp('2%'),
        textAlign:'center'
    },

    loaderBckViewStyle : {
        width : wp('70%'),
        minHeight : hp('20%'),
        justifyContent: "center",
        alignItems: "center",
        position:'absolute'
    },

    dogStyle: {
        width: wp('25'),
        height: hp('12%'),
        alignSelf: 'center',
        resizeMode:'contain'
    },

});