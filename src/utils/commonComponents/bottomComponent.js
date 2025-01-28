import React, { useEffect } from 'react';
import {StyleSheet,Text,TouchableOpacity, View,} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';

const BottomComponent = ({navigation, route,leftBtnTitle,rightBtnTitle,isLeftBtnEnable,isRightBtnEnable,rigthBtnState,...props }) => {

    useEffect (() => {
    },[]);

    const leftButtonAction = () => {
        props.leftButtonAction();
    }

    const rightButtonAction = () => {
        props.rightButtonAction();
    }

    return (

        <View style={[styles.mainComponentStyle]}>
            {isLeftBtnEnable ? <TouchableOpacity style={styles.leftButtonstyle} onPress={() => {leftButtonAction()}}>
                <Text style={[styles.leftBtnTextStyle]}>{leftBtnTitle}</Text>
            </TouchableOpacity> : null}

            {isRightBtnEnable ? <TouchableOpacity style={rigthBtnState ? [styles.rightButtonstyleEnable] : [styles.rightButtonstyleEnable,{opacity:0.4}]} disabled = {rigthBtnState ? false : true} onPress={() => {rightButtonAction()}}>
                {<Text style={[styles.rightBtnTextStyle]}>{rightBtnTitle}</Text>}
            </TouchableOpacity> : null}
            
        </View>
    );
};

export default BottomComponent;

const styles = StyleSheet.create({

    mainComponentStyle : {
        width:wp('100%'),
        height:hp('100%'),
        backgroundColor:'white',
        position:"absolute",
        padding:20,
        justifyContent:'space-between',
        flexDirection:"row" 
    },

    rightButtonstyleEnable: {
        backgroundColor: "#cbe8b0",
        flex:1,
        height: hp("7%"),
        borderRadius: hp("0.5%"),
        justifyContent: "center",
        alignItems:'center',
        borderColor:'#6fc309',
        borderWidth:1.0,
        marginHorizontal:wp('2%'),
      },
    
      leftButtonstyle : {
        backgroundColor: "#E7E7E9",
        flex:1,
        height: hp("7%"),
        borderRadius: hp("0.5%"),
        justifyContent: "center",
        alignItems:'center',
        borderColor:'black',
        borderWidth:1.0,
        marginHorizontal:wp('2%'),
      },

      rightBtnTextStyle: {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
      },

      leftBtnTextStyle: {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
    },

});