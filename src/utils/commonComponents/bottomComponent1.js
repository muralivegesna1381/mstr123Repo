import React, { useEffect } from 'react';
import {StyleSheet,Text,TouchableOpacity, View,} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';

const BottomComponent1 = ({navigation, topBtnTitle, bottomBtnTitle, isDelete, bottomBtnEnable,...props }) => {

    const topButtonAction = () => {
        props.topButtonAction();
    }

    const bottomButtonAction = () => {
        props.bottomButtonAction();
    }

    return (

        <View style={[styles.mainComponentStyle]}>
            <TouchableOpacity style={[styles.topButtonstyle]} onPress={() => {topButtonAction()}}>
                <Text style={[styles.topBtnTextStyle]}>{topBtnTitle}</Text>
            </TouchableOpacity>

            {bottomBtnEnable ? <TouchableOpacity style={[styles.bottomButtonstyle,{backgroundColor:isDelete ? 'red' : '#E8E8EA'}]} onPress={() => {bottomButtonAction()}}>
                <Text style={[styles.bottomBtnTextStyle,{color:isDelete ? 'white' : 'black'}]}>{bottomBtnTitle}</Text>
            </TouchableOpacity> : null}
            
        </View>
    );
};

export default BottomComponent1;

const styles = StyleSheet.create({

    mainComponentStyle : {
        width:wp('100%'),
        height:hp('100%'),
        backgroundColor:'white',
        position:"absolute",
        shadowColor:'grey',
        shadowRadius:100,
        shadowOpacity:0.8,
        elevation:15,
        shadowOffset:{width:5,height:5},
        padding:20,
        alignItems:'center',
        flexDirection:"column" ,
    },

    topButtonstyle: {
        backgroundColor:'#CCE8B0',
         width: wp("80%"),
        height: hp("6%"),
        borderRadius: hp("0.5%"),
        justifyContent: "center",
        alignItems:'center',
        borderColor:'#6BC100',
        borderWidth:1.0,
        marginVertical:wp('2%'),
      },
    
      bottomButtonstyle : {
        backgroundColor:'#E8E8EA',
        width: wp("80%"),
        height: hp("6%"),
        borderRadius: hp("0.5%"),
        justifyContent: "center",
        alignItems:'center',
        borderWidth:1.0,
        marginVertical:wp('2%'),
      },

      topBtnTextStyle: {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
      },

      bottomBtnTextStyle: {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
    },

});