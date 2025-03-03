import React, { useState,useEffect } from 'react';
import {View,StyleSheet,Text,Image} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import StackedBarChartScreen from "./StackedBarChartScreen";
import GroupBarChartScreen from "./GroupBarChartScreen";
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as Constant from "../../../utils/constants/constant";

import NOLogsDogImg from "./../../../../assets/images/dogImages/noRecordsDog.svg";
import NOLogsCatImg from "./../../../../assets/images/dogImages/noRecordsCat.svg";

const  FoodHistoryUI = ({chartData,stakedChartData,selectdCategoryUnit,noLogsShow,petObj, route, ...props }) => {
      
    useEffect(() => {
    }, []);
    // model sheet Action
    const displayModelSheet = () => {
        props.displayModelSheet();
    };

    return (
        <View style={[styles.mainComponentStyle]}>

            <View style={styles.middleView}>

                <KeyboardAwareScrollView horizontal={false}>

                    {chartData && stakedChartData ? <View>

                        <View style={{ marginTop:hp('2%'),flexDirection:'row'}}>

                            <View style={{width:wp('95%'),}}>
                                <GroupBarChartScreen chartData={chartData} selectdCategoryUnit = {selectdCategoryUnit}></GroupBarChartScreen>
                            </View>

                        </View>

                        <View style={{ marginTop:hp('4%'),flexDirection:'row'}}>

                            <View style={{width:wp('95%'),}}>
                                <StackedBarChartScreen stakedChartData = {stakedChartData} displayModelSheet={displayModelSheet}></StackedBarChartScreen>
                            </View>

                        </View>
                    </View> : (!props.isLoading ? <View style={{justifyContent:'center',alignItems:'center',height:hp('58%')}}>
                        {petObj && petObj.speciesId && parseInt(petObj.speciesId) === 1 ? <NOLogsDogImg style= {[styles.nologsDogStyle]}/> : <NOLogsCatImg style= {[styles.nologsDogStyle]}/>}
                        <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
                    </View> : null)}

                </KeyboardAwareScrollView>

            </View>  

         </View>
    );
  }
  
  export default FoodHistoryUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white',
        alignItems:'center', 
        marginTop:hp('3%')
    },

    middleView : {
        width:wp('95%'),
        height:hp('73%'),
        alignItems:'center',
        
    },

    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
      },
      sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
      },
      sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
      },
      textStyle: {
        fontSize: fonts.fontXLarge,
        ...CommonStyles.textStyleBold,
      },

  });