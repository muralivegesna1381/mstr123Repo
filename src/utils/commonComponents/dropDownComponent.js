import React, { useState, useEffect } from 'react';
import {SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TouchableOpacity, View,FlatList} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';

const DropdownComponent = ({navigation, topBtnTitle, bottomBtnTitle, isDelete, bottomBtnEnable,dataArray,headerText,...props }) => {

    useEffect (() => {
    },[]);

    const topButtonAction = () => {
        props.topButtonAction();
    }

    const bottomButtonAction = () => {
        props.bottomButtonAction();
    };

    const actionOnOptiontype = (item) => {
        props.actionOnOptiontype(item);
    }

    return (

        <View style={[styles.mainComponentStyle]}>

            <View style={[CommonStyles.droDownViewStyle,{}]}>
                <View style = {[CommonStyles.dropDownFlatview,{height: hp("5%"),}]}>
                    <Text style={[CommonStyles.dropDownHeaderTextStyle]}>{headerText}</Text>
                </View>

                <FlatList
                    style={CommonStyles.dropDownFlatcontainer}
                    data={dataArray}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (

                    <TouchableOpacity onPress={() => actionOnOptiontype(item)}>
                        <View style={CommonStyles.dropDownFlatview}>
                        <Text style={[CommonStyles.dropDownTextStyle]}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>

                    )}
                    enableEmptySections={true}
                    keyExtractor={(item) => item.name}
                />
            </View>
            
        </View>
    );
};

export default DropdownComponent;

const styles = StyleSheet.create({

    mainComponentStyle : {
        width: wp('100%'),
        height: hp('100%'),
        justifyContent: "center",
        alignItems: "center",
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
        // borderColor:'red',
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