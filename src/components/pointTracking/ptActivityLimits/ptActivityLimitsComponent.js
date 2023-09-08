import React, { useState, useEffect } from 'react';
import { View, BackHandler, Text, StyleSheet, FlatList} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import fonts from './../../../utils/commonStyles/fonts'

const PTActivityLimitsComponent  = ({ navigation,route, ...props }) => {

    const [ptActivityLimits, set_ptActivityLimits] = useState(undefined);
    const [title, set_title] = useState('Pet parent is encouraged to record observations, Images, videos which are identified as activities under an ACTIVE campaign, will be enabled by the HPN team in WCT Mobile App.\n\nPet parent is allowed to submit any number of activities of their pets that are relevant to the campaign, but only a limited number of submissions will be approved and campaign points will be awarded to pet parents.\n\nThe cut-off for each activity submission is decided by the HPN team.');
    const [fromScreen, set_fromScreen] = useState(undefined);

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    useEffect(() => {

        if (route.params?.ptActivityLimits) {
            set_ptActivityLimits(route.params?.ptActivityLimits);
        }

    }, [route.params?.ptActivityLimits]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const backBtnAction = () => {

        if(fromScreen === 'settings'){
            navigation.navigate('LearningCenterComponent');
        } else {
            navigation.navigate('DashBoardService');
        }
        
    };

    const renderItem = ({ item, index }) => {
        return (
  
            <View style={[styles.cellBackViewStyle]}>
                <Text style={[styles.textStyle]}>{item.activityName}</Text>
                <Text style={[styles.textStyle,{...CommonStyles.textStyleSemiBold,}]}>{item.eligibilityLimit}</Text>
            </View>
  
        );
    };

    return (

        <View style={[CommonStyles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView, {}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Activity Limits'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ width: wp('90%'), height: hp('70%'), alignSelf: 'center' }}>


                <View style={{marginTop: hp('5%'), alignSelf: 'center' }}>
                    <Text style={[styles.headerStyle,]}>{title}</Text>
                </View>

                {ptActivityLimits ? <View style={[styles.pointsBckViewStyle]}>
                    <FlatList
                        style={{marginBottom: hp('1%'), }}
                        nestedScrollEnabled={true}
                        data={ptActivityLimits}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => "" + index}
                    />
                </View> : null}

            </View>

        </View>
    );
}

export default PTActivityLimitsComponent;

const styles = StyleSheet.create({

    headerStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color:'black',
    },

    cellBackViewStyle : {
        borderRadius:5,
        height: hp("6%"),
        width: wp("80%"),
        justifyContent:'center',
        borderBottomWidth : 0.5,  
        flexDirection : 'row',
        justifyContent : 'space-between',
        alignItems : 'center'
    },

    pointsBckViewStyle : {
        borderColor:'#D5D5D5',
        borderWidth : 2,
        borderRadius:5,
        borderStyle: 'dashed',
        marginTop: hp('5%'), 
        alignSelf: 'center' ,
        width: wp("90%"),
        height: hp("32%"),
        alignItems:'center',
    },

    textStyle : {
        color:'black',
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleRegular,
        marginLeft:wp('2%'), 
    },

})