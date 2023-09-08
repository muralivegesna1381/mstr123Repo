import React,{useEffect, useState, useRef} from 'react';
import {View,StyleSheet,Text,ImageBackground, TouchableOpacity, FlatList} from 'react-native';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';

const QstDatePickerComponent = ({setValue,status_QID,answerArray,selectedArray, route,...props}) => {

    const [answersArray,set_answersArray]=useState([]);
    var selectedAnswers = useRef([]);
    var tempAnswersArray = useRef([]);

    useEffect(() => { 

        if(selectedArray && selectedArray.length>0){
            tempAnswersArray.current=[];
            tempAnswersArray.current=JSON.parse(selectedArray);
            let temp=[];
            let check = JSON.parse(selectedArray);
            for (let i = 0; i<check.length; i++){
              temp.push(check[i].questionAnswerId);
            }
            
            selectedAnswers.current=temp;
          }
          
          set_answersArray(answerArray);

    },[answerArray]);

    const renderMeterials = ({ item, index }) => {

        return (

                <View style={selectedAnswers.current.includes(item.questionAnswerId) ? [styles.selectedView] : [styles.unSelectedView]}>

                    <TouchableOpacity disabled = {status_QID==="Submitted" ? true : false}  onPress={() => {

                            if (selectedAnswers.current.includes(item.questionAnswerId)){
                                    // selectedAnswers.current = selectedAnswers.current.filter(item => item !== item.questionAnswerId);
                                var indexSelected = selectedAnswers.current.findIndex(e => e === item.questionAnswerId);
                                if (indexSelected != -1) {
                                    selectedAnswers.current.splice(indexSelected, 1);
                                } 

                                var index = tempAnswersArray.current.findIndex(e => e.questionAnswerId === item.questionAnswerId);
                                if (index != -1) {
                                    tempAnswersArray.current.splice(index, 1);
                                }
                            }else {
                                tempAnswersArray.current.push(item);
                                selectedAnswers.current.push(item.questionAnswerId);
                            }

                            tempAnswersArray.current = Array.from(new Set(tempAnswersArray.current));
                            setValue(JSON.stringify(tempAnswersArray.current));
                        }}>
                        <ImageBackground style={styles.imgViewStyle} resizeMode="contain" imageStyle={{borderRadius:5}} source={{uri:item.questionAnswer}}>
                                            
                        </ImageBackground>
                    </TouchableOpacity>

                </View>
        );

    };

    return(
        <View style={styles.container}>

          {answersArray && answersArray.length > 0 ? <View style={{width: wp('80%'), minHeight: hp('10%'),marginBottom: hp('1%'),marginTop: hp('1%')}}>
            <FlatList
                style={styles.flatcontainer}
                data={answersArray}
                showsVerticalScrollIndicator={false}
                renderItem={renderMeterials}
                keyExtractor={(item) => item}
                numColumns={3}
            />
          </View> : null}
          
        </View>

    )
}
export default QstDatePickerComponent;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        alignItems: "center",
        justifyContent: "center",
        width:wp('80%')
    },

    selectedView : {
        backgroundColor:'green',
        width:wp('20%'),
        height:hp('8%'),
        borderRadius:5,
        justifyContent:'center',
        marginBottom:hp('1%'),
        marginRight:wp('2%'),
        borderWidth:0.5,      
    },

    unSelectedView : {
        backgroundColor:'white',
        width:wp('20%'),
        height:hp('8%'),
        borderRadius:5,
        justifyContent:'center',
        marginBottom:hp('1%'),
        marginRight:wp('2%'),
        borderWidth:0.5,    
    },

    imgViewStyle : {
        width:wp('20%'),
        height:hp('8%'),
        alignSelf:'center',
        flexDirection:'row',
        
    },

    flatcontainer: {
        flex:1,
    },

});