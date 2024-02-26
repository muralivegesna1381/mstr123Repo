import React, { useState, useEffect,useRef,PropsWithChildren } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image,FlatList,Platform,Dimensions} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as Constant from "../../../utils/constants/constant";
import DatePicker from 'react-native-date-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import moment from "moment";
import StackedBarChartScreen from "./StackedBarChartScreen";
import GroupBarChartScreen from "./GroupBarChartScreen";

let noLogsDogImg = require("./../../../../assets/images/dogImages/noRecordsDog.svg");
let noLogsCatImg = require("./../../../../assets/images/dogImages/noRecordsCat.svg");

const  FoodHistoryUI = ({chartData,stakedChartData,selectdCategoryUnit, route, ...props }) => {

    const [datePickerDate1, set_datePickerDate1] = useState(new Date());
    const [minimumDate, set_minimumDate] = useState(new Date('1900-01-01'));
    const [datePickerDate, set_datePickerDate] = useState(moment(new Date()).format('MM-DD-YYYY'));

    const Tooltips = ({ x, y, data }) => {

        return data1.map((item, index) => (
          <Text
            key={index}
            x={x("kk h")}
            y={y("item.milimeters") - 15}
            fontSize={15}
            fontWeight="lighter"
            stroke="#fff"
            fill="#fff"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {`${"item.milimeters"}mm`}
          </Text>
        ));
      };
      
    // model sheet Action
    const displayModelSheet = () => {
        props.displayModelSheet();
      };


    return (
        <View style={[styles.mainComponentStyle]}>

            <View style={styles.middleView}>

                <KeyboardAwareScrollView horizontal={false}>

                    {!props.noLogsShow ? <View>

                        <View style={{ marginTop:hp('2%'),flexDirection:'row'}}>

                            <View   style={{width:wp('95%'),}}>
                                <GroupBarChartScreen chartData={chartData} selectdCategoryUnit = {selectdCategoryUnit}></GroupBarChartScreen>
                            </View>

                        </View>

                        <View style={{ marginTop:hp('4%'),flexDirection:'row'}}>

                            <View   style={{width:wp('95%'),}}>
                                <StackedBarChartScreen stakedChartData = {stakedChartData} displayModelSheet={displayModelSheet}></StackedBarChartScreen>
                            </View>

                        </View>
                    </View> : (!props.isLoading ? <View style={{justifyContent:'center',alignItems:'center',height:hp('58%')}}>
                        <Image style= {[styles.nologsDogStyle]} source={props.petObj && props.petObj.speciesId && parseInt(props.petObj.speciesId) === 1 ? noLogsDogImg : noLogsCatImg}></Image>
                        {/* <Text style={CommonStyles.noRecordsTextStyle}>{obsMessage}</Text> */}
                        <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
                      </View> : null)}

                    {/* <View style={{ marginTop:hp('2%'),flexDirection:'row'}}>


                        <View>
                            <StackedBarChart
                                style={{width:wp('85%'), minHeight:hp('25%'),zIndex: 1}}
                                keys={ keys }
                                colors={ colors }
                                data={ data1 }
                                spacingInner={0.3}
                                spacingOuter={0.1}
                                showGrid={ false }
                                yAccessor={({ item }) => print(item.value)}
                                contentInset={ {} } > 
                                <Grid Horizontal={false} vertical={true}/>
                                <Tooltips />

                            </StackedBarChart>
                        </View>

                        <View>
                            <YAxis
                                data={data}
                                style={{ width:wp('8%'),minHeight:hp('25%') }}
                                contentInset={verticalContentInset}
                                svg={axesSvg}
                            />
                        </View>

                    </View>

                    <View style={{marginTop: hp('1%')}}>
                        <XAxis
                            style={{ width:wp('85%'), height:hp('5%'),marginRight: wp('8%'), }}
                            data={data1}
                            formatLabel={(value, index) => data1[index].month}
                            contentInset={{ left:20, right:20 }}
                            svg={axesSvg}
                        />
                    </View>

                    <View>
                        <PureChart type={'bar'}
                            data={data2}
                            width={wp('40%')}
                            height={hp('30%')}
                            showEvenNumberXaxisLabel = {false}
                            defaultColumnWidth={Platform.isPad ? 90 : 28}
                            // xAxisColor={'red'} 
                            // yAxisColor={'red'}
                            // numberOfYAxisGuideLine={5}
                            backgroundColor={'white'} labelColor={'yello'} 
                            style={{ borderColor: 'white', borderWidth: 1, width: wp('80%') }}
                            customValueRenderer={(index, point) => {
                                if (index % 2 === 0) return null
                                return (
                                    <Text style={[styles.textStyle,{textAlign: 'center'}]}>{point.y}</Text>
                                )
                            }}
                           
                        />

                         <View style={{marginTop: hp('1%')}}>
                            <XAxis
                                style={{ width: Platform.isPad ? wp('80%') : wp('85%'), height:hp('5%'),marginLeft: wp('8%'), }}
                                data={data1}
                                formatLabel={(value, index) => data1[index].month}
                                contentInset={{ left:20, right:20 }}
                                svg={{fontSize: Platform.isPad ? fonts.fontSmall : fonts.fontTiny, ...CommonStyles.textStyleBold,fill: 'grey' }}
                            />
                        </View>

                    </View> */}

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