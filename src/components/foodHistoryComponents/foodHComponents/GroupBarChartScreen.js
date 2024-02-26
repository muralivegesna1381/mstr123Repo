import React, { useState, useEffect,useRef,PropsWithChildren } from 'react';
import {AppRegistry,StyleSheet,Text,View,Platform} from 'react-native';
import { BarChart } from "react-native-gifted-charts";
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import Fonts from '../../../utils/commonStyles/fonts'

const GroupBarChartScreen = ({chartData,selectdCategoryUnit, route, ...props }) => {

  const data = [
    {
      value: 25,
      frontColor: '#54D86F',
      spacing: 0,
      label: '22 Sep',
    },
    {value: 24, frontColor: '#FF8A00',      onPress: () => console.log("22 Sep"),
  },

    {
      value: 35,
      frontColor: '#54D86F',
      gradientColor: '#009FFF',
      spacing: 0,
      label: '23 Sep',
    },
    {value: 30, frontColor: '#FF8A00', gradientColor: '#93FCF8'},

    {
      value: 45,
      frontColor: '#54D86F',
      gradientColor: '#009FFF',
      spacing: 0,
      label: '24 Sep',
    },
    {value: 40, frontColor: '#FF8A00', gradientColor: '#93FCF8'},

    {
      value: 52,
      frontColor: '#54D86F',
      gradientColor: '#009FFF',
      spacing: 0,
      label: '25 Sep',
    },
    {value: 49, frontColor: '#FF8A00', gradientColor: '#93FCF8'},

    {
      value: 30,
      frontColor: '#54D86F',
      gradientColor: '#009FFF',
      spacing: 0,
      label: 'May',
    },
    {value: 28, frontColor: '#FF8A00', gradientColor: '#93FCF8'},
    {
      value: 30,
      frontColor: '#54D86F',
      gradientColor: '#009FFF',
      spacing: 0,
      label: '26 Sep',
    },
    {value: 28, frontColor: '#FF8A00', gradientColor: '#93FCF8'},
    {
      value: 30,
      frontColor: '#54D86F',
      gradientColor: '#009FFF',
      spacing: 0,
      label: '27 Sep',
    },
    {value: 28, frontColor: '#FF8A00', gradientColor: '#93FCF8'},
  ];
 
  return(
    <View style={{   marginBottom:0}}>
      <View style={{flexDirection:'row'}}>

        <View style={{ alignItems: 'center', justifyContent: 'center',width:20 }}><Text numberOfLines={1} style={{width:250,textAlign:'center',transform: [{ rotate: '-90deg'}]}}>{selectdCategoryUnit == "grams" ? "GRAMS": "CUPS"}</Text></View>

       <BarChart
         height={250}
          data={chartData}
          barWidth={Platform.isPad ? 45 : 15}
          initialSpacing={10}
          spacing={14}
          barBorderRadius={0}
          xAxisLabelTextStyle={{color: 'black', textAlign: 'center',fontSize: 10}}
          xAxisColor={'#D0D0D3'}
          yAxisColor={'#D0D0D3'}
        //  stepValue={10}
          // maxValue={100}
         // noOfSections={6}
          yAxisTextStyle={{fontSize: 10}}
          yAxisLabelWidth={28}
          // yAxisSide={yAxisSides.RIGHT}
          // yAxisLabelTexts={['0', '1k', '2k', '3k', '4k', '5k', '6k']}
          labelWidth={40}
           
        />
      </View>
        <View style={{ flexDirection: 'row' , marginTop:20, alignSelf:'center' }}>

          <View style={{ flexDirection: 'row' ,marginRight:10, alignItems:'center',justifyContent:'center',}}>
            <View style={{ width:20, backgroundColor:selectdCategoryUnit == "grams" ? '#54D86F' : '#5496D8' , height:20, marginRight:10, borderRadius:3}}></View>
            <Text style={[CommonStyles.fhTextStyle1]}>Recommend Quantity</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems:'center',justifyContent:'center'}}>
            <View style={{ width:20, backgroundColor:selectdCategoryUnit == "grams" ? '#FF8A00' : '#0C379A' , height:20, marginRight:10, borderRadius:3}}></View>
            <Text style={[CommonStyles.fhTextStyle1]}>Consumed Quantity</Text>
          </View>
      </View>

    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  chart: {
    flex: 1
  },
  subHeaderTextStyle: {
    ...CommonStyles.textStyleBold,
    fontSize: Fonts.fontNormal,
    color: 'black',
},
});


export default GroupBarChartScreen;