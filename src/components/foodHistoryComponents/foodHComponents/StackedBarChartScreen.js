import React, { useState, useEffect,useRef,PropsWithChildren } from 'react';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import Fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import {StyleSheet,Text,View,Platform} from 'react-native';
import { BarChart, yAxisSides } from "react-native-gifted-charts";
 
const StackedBarChartScreen = ({stakedChartData,route, ...props }) => {
  
  const displayModelSheet = () => {
    props.displayModelSheet();
  };

  const stacks= [
    {
      label: '22 Sep',
      onPress: (() => {}),
    
      stacks: [
        {
          value: 15,
          color: '#32AA4C',
        },
        {
          value: 20,
          color: '#54D86F',
        },
       
        {
          value: 10,
          color: '#82E596',
        },
        {
          value: 20,
          color: '#B7F2C3',
        },
        {
          value: 15,
          color: '#FF8A00',
        },
        {
          value: 10,
          color: '#FDB35B',
        }, 
        {
          value: 10,
          color: '#FFD4A1',
        },
      ],
    },
    // Only positive values
    {
      label: '23 Sep',
      onPress: (() => {}),

      stacks: [
        {
          value: 5,
          color: '#32AA4C',
        },
        {
          value: 20,
          color: '#54D86F',
        },
       
        {
          value: 8,
          color: '#82E596',
        },
        {
          value: 20,
          color: '#B7F2C3',
        },
        {
          value: 15,
          color: '#FF8A00',
        },
        {
          value: 7,
          color: '#FDB35B',
        }, 
        {
          value: 10,
          color: '#FFD4A1',
        },
      ],
    },
     {
      label: '24 Sep',
      onPress: (() => {}),

      stacks: [
       
        {
          value: 15,
          color: '#32AA4C',
        },
        {
          value: 20,
          color: '#54D86F',
        },
       
        {
          value: 10,
          color: '#82E596',
        },
        {
          value: 20,
          color: '#B7F2C3',
        },
        {
          value: 15,
          color: '#FF8A00',
        },
        {
          value: 10,
          color: '#FDB35B',
        }, 
        {
          value: 10,
          color: '#FFD4A1',
        },
        
      ],
    },
    {
     label: '25 Sep',
     onPress: (() => {}),

     stacks: [
      
      {
        value: 20,
        color: '#32AA4C',
      },
      {
        value:8,
        color: '#54D86F',
      },
     
      {
        value: 10,
        color: '#82E596',
      },
      {
        value: 5,
        color: '#B7F2C3',
      },
      {
        value: 15,
        color: '#FF8A00',
      },
      {
        value: 4,
        color: '#FDB35B',
      }, 
      {
        value: 2,
        color: '#FFD4A1',
      },
       
     ],
   },
   {
    label: '26 Sep',
    stacks: [
     
      {
        value: 16,
        color: '#32AA4C',
      },
      {
        value: 14,
        color: '#54D86F',
      },
     
      {
        value: 12,
        color: '#82E596',
      },
      {
        value: 15,
        color: '#B7F2C3',
      },
      {
        value: 15,
        color: '#FF8A00',
      },
      {
        value: 10,
        color: '#FDB35B',
      }, 
      {
        value: 2,
        color: '#FFD4A1',
      },
      
    ],
  },
  {
   label: '27 Sep',
   stacks: [
    
    {
      value: 0,
      color: '#32AA4C',
    }
     
   ],
 } 
  ];

  return(
   
    <View style={{ }}>


      <View style={{ justifyContent: 'center',width:wp('80%'),alignSelf:'center',marginBottom:hp('3%') }}>
        <Text numberOfLines={1} style={styles.headerStyle}>Intake Distribution</Text>
      </View>
      
      <View style={{flexDirection:'row'}}>

      <View style={{ alignItems: 'center', justifyContent: 'center',width:20 }}>
        <Text numberOfLines={1} style={{width:250,textAlign:'center',transform: [{ rotate: '-90deg'}]}}>PERCENTAGE</Text>
      </View>
      
       <BarChart
          xAxisLabelTextStyle={{color: 'black', textAlign: 'left',fontSize: 10}}
          yAxisTextStyle={{fontSize: 10}}
          yAxisLabelWidth={20}
          // yAxisSide={yAxisSides.RIGHT}
          xAxisColor={'#D0D0D3'}
          yAxisColor={'#D0D0D3'}
          barWidth={Platform.isPad ? 85 : 25}
          height={250}
          disableScroll={true}
          adjustToWidth={true}
          minValue={0}
          maxValue={100}
          stepValue={10}
          stackData={stakedChartData}
          noOfSections={10}
        
        />
      </View>
       

       <View style={{ flexDirection: 'column' , marginTop:20,width:wp('80%'),alignSelf:'center'}}>

        <View style={{ flexDirection: 'row' , marginTop:10}}>
          <View style={{ flexDirection: 'row' , marginRight:10, alignItems:'center',justifyContent:'center'}}>
            <View style={{ width:26, backgroundColor:'#32AA4C' , height:15, marginRight:10, borderRadius:4}}></View>
            <Text style={[CommonStyles.fhTextStyle1]}>Study Diet</Text>
          </View>
          <View style={{ flexDirection: 'row',marginRight:10, alignItems:'center',justifyContent:'center'}}>
            <View style={{ width:26, backgroundColor:'#54D86F' , height:15, marginRight:10, borderRadius:4}}></View>
            <Text style={CommonStyles.fhTextStyle1}>Wet food</Text>
          </View>
          <View style={{ flexDirection: 'row',marginRight:10, alignItems:'center',justifyContent:'center'}}>
            <View style={{ width:26, backgroundColor:'#82E596' , height:15, marginRight:10, borderRadius:4}}></View>
            <Text style={CommonStyles.fhTextStyle1}>Dry food</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row' , marginTop:10}}>
             
              
          <View style={{ flexDirection: 'row', marginRight:10, alignItems:'center',justifyContent:'center'}}>
            <View style={{ width:26, backgroundColor:'#B7F2C3' , height:15, marginRight:10, borderRadius:4}}></View>
            <Text style={CommonStyles.fhTextStyle1}>Purchased Food</Text>
          </View>

          <View style={{ flexDirection: 'row', marginRight:10 , alignItems:'center',justifyContent:'center'}}>
            <View style={{ width:26, backgroundColor:'#FF8A00' , height:15, marginRight:10, borderRadius:4}}></View>
            <Text style={CommonStyles.fhTextStyle1}>Human Food</Text>
          </View>
          
        </View>
              
        <View style={{ flexDirection: 'row' , marginTop:10}}>
          <View style={{ flexDirection: 'row', marginRight:10, alignItems:'center',justifyContent:'center'}}>
            <View style={{ width:26, backgroundColor:'#FDB35B' , height:15, marginRight:10, borderRadius:4}}></View>
            <Text style={CommonStyles.fhTextStyle1}>Treats</Text>
          </View>
          <View style={{ flexDirection: 'row', marginRight:10, alignItems:'center',justifyContent:'center', }}>
            <View style={{ width:24, backgroundColor:'#FFD4A1' , height:15, marginRight:10, borderRadius:4}}></View>
            <Text style={CommonStyles.fhTextStyle1}>Other</Text>
          </View>
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

  headerStyle: {
    ...CommonStyles.textStyleBold,
    fontSize: Fonts.fontMedium,
    color: 'black',
  },
     
});


export default StackedBarChartScreen;