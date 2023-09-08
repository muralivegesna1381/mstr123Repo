import React,{useEffect,useState} from 'react';
import {View,TextInput,StyleSheet,ImageBackground,ActivityIndicator,Text,TouchableOpacity} from 'react-native';
import fonts from './../../../../utils/commonStyles/fonts';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../../../utils/commonStyles/commonStyles';
import * as Constant from './../../../../utils/constants/constant';
import ImageView from "react-native-image-viewing";

const questionnaireTextInputComponent = ({textAnswer,setValue,maxLength,isMultiLineText,placeholder,status_QID,questionImageUrl,isAnsSubmitted, route,...props}) => {

    const [imgLoader, set_imgLoader] = useState(true);
    const [isImageView, set_isImageView] = useState(false);
    const [images, set_images] = useState([]);
    const [questionImage, set_questionImage] = useState('');

    useEffect(() => {     

        if(questionImageUrl && questionImageUrl !== ''){
            
            set_questionImage(questionImageUrl);
          let img = {uri : questionImageUrl};
          set_images([img]);
        }
        
    },[questionImageUrl]);
    /**
     * Textinput UI
     * Based on Multiline, this component will be Text Area / TextInput
     */
    return(
        <View>

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

            {!isAnsSubmitted && status_QID === 'Submitted' ? <View>
            <Text style={CommonStyles.submitQSTNotAnsweredTextStyle}>{Constant.QUESTIONS_NOT_ANSWERED}</Text>
            </View> : <View style={[styles.SectionStyle,{minHeight: isMultiLineText ? hp("5%") : hp("5%"),}]}>
                <TextInput
                    style={styles.textInputStyle}
                    maxLength={ maxLength}
                    multiline={isMultiLineText}
                    placeholder={placeholder}
                    underlineColorAndroid="transparent"
                    placeholderTextColor="#808080"
                    value={textAnswer}
                    onChangeText={async (text) => {
                        //setValue(_questionId,text);
                        setValue(text.trimStart(),undefined);
                    }}
                    editable={status_QID==="Submitted" ? false : true}
                />        
            </View>}

            {isImageView ? <ImageView
                images={images}
                imageIndex={0}
                visible={isImageView}
                onRequestClose={() => set_isImageView(false)}
            /> : null}
        </View>

    )
}
export default questionnaireTextInputComponent;

const styles = StyleSheet.create({

    textInputStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontMedium,
        width: wp("75%"),
        minHeight: hp("3%"),
        marginLeft: "5%",
        color: "black", 
    },

    SectionStyle: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 0.5,
        borderColor: "#D8D8D8",
        width: wp("80%"),
        borderRadius: hp("1%"),
        alignSelf: "center",
        marginBottom: hp("1%"),
    },

});