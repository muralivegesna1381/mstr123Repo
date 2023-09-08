import React,{useEffect, useState} from 'react';
import {View,StyleSheet,Text, ImageBackground,ActivityIndicator,TouchableOpacity} from 'react-native';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import DatePicker from 'react-native-date-picker'
import CommonStyles from './../../../../utils/commonStyles/commonStyles';
import * as Constant from "./../../../../utils/constants/constant";
import ImageView from "react-native-image-viewing";
// import DatePicker from 'react-native-modern-datepicker';

const QstDatePickerComponent = ({value,setValue,questionImageUrl,status_QID,isAnsSubmitted, route,...props}) => {

    const [selectedDate, set_selectedDate] = useState(new Date());
    const [imgLoader, set_imgLoader] = useState(true);
    const [isImageView, set_isImageView] = useState(false);
    const [images, set_images] = useState([]);

    useEffect(() => { 
        if(value){
            set_selectedDate(new Date(value));
        }
    },[value]);

    useEffect(() => {     

        if(questionImageUrl && questionImageUrl !== ''){
          let img = {uri : questionImageUrl};
          set_images([img]);
      }
        
      },[questionImageUrl]);

    const selectAction = (dateValue) => {
        set_selectedDate(dateValue);
        setValue(dateValue)
    };

    return(
        <View style={styles.container}>

          <View style={{width: wp('80%'), minHeight: !isAnsSubmitted && status_QID === 'Submitted' ? hp('5%') : hp('25%'),marginBottom: hp('2%')}}>

          {questionImageUrl ? <View>
            <TouchableOpacity style = {CommonStyles.questImagesBtnStyle} onPress={() => set_isImageView(true)}>
              <ImageBackground source={{uri : questionImageUrl}} style={[CommonStyles.questImageStyles]} imageStyle = {{borderRadius:10}}
                    onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {set_imgLoader(false)}}>
                      {imgLoader ? <ActivityIndicator size="large" color="gray"/> : null}
                      {!imgLoader ? <View style={CommonStyles.mediaSubViewStyle}>
                        <Text style={CommonStyles.mediaViewTextStyle}>{'VIEW'}</Text>
                    </View> : null}
                    </ImageBackground>
                    
            </TouchableOpacity>
          </View> : null}

              {!isAnsSubmitted && status_QID === 'Submitted' ? <View style={{height: hp('5%'),alignItems:'center',justifyContent:'center'}}>
            <Text style={CommonStyles.submitQSTNotAnsweredTextStyle}>{Constant.QUESTIONS_NOT_ANSWERED}</Text>
            </View> : <View pointerEvents = {status_QID === 'Submitted' ? 'none' : 'auto'} style={{borderWidth:1,borderRadius:5,borderColor:'grey',width: wp('75%'),alignSelf:'center',alignItems:'center'}}>

                    <DatePicker 
                        date={selectedDate} 
                        onDateChange={(date) => {selectAction(date)}} 
                        mode = {"date"} 
                        textColor = {'black'} 
                        maximumDate = {new Date()}
                        style={styles.datePickeStyle}
                    />

              </View>}
             

            {/* {status_QID === 'Submitted' ? null : <View style={{flexDirection:'row', justifyContent:'flex-end',width: wp('75%'),marginTop: hp('2%')}}>
              
              <TouchableOpacity style={CommonStyles.tilesBtnLftStyle} onPress={() => selectAction('REVERT')}>
                  <ImageBackground source={require("./../../../../../assets/images/otherImages/png/wrong.png")} style={CommonStyles.tilesBtnImgStyle} resizeMode='contain'></ImageBackground>
              </TouchableOpacity>

              <TouchableOpacity style={CommonStyles.tilesBtnStyle} onPress={() => selectAction('SUBMIT')}>
                  <ImageBackground source={require("./../../../../../assets/images/otherImages/png/right.png")} style={CommonStyles.tilesBtnImgStyle} resizeMode='contain'></ImageBackground>
              </TouchableOpacity>

            </View>} */}

          </View>

          {isImageView ? <ImageView
                images={images}
                imageIndex={0}
                visible={isImageView}
                onRequestClose={() => set_isImageView(false)}
            /> : null}

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

    datePickeStyle : {
        backgroundColor:'white',
        width: wp('70%'),
        height: hp('25%'),
        // alignSelf:'center'
    },

});