import React, { useState, useEffect } from 'react';
import {StyleSheet,View,Platform} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import { TextInput } from 'react-native-paper';

const FsTextInputComponent = ({navigation, route,inputText,labelText,setValue,isEditable,maxLengthVal,keyboardType,autoCapitalize,widthValue,isSecure,isBackground,...props }) => {

    const [widthTextInput, set_widthTextInput] = useState(wp('80%'));
    const [isSecureText, set_isSecureText] = useState(undefined);
    const [backgroundColor, set_backgroundColor] = useState('transparent');
    const [autoCapitalizeValue, set_autoCapitalizeValue] = useState("none");
    useEffect (() => {
        if(widthValue){
            set_widthTextInput(widthValue)
        }
            
         set_isSecureText(isSecure);
         set_backgroundColor(isBackground);
         set_autoCapitalizeValue(autoCapitalize);

    },[widthValue,isSecure,isBackground,autoCapitalize]);
    
    return (

        <View style={[styles.mainComponentStyle]}>

            <View style={[styles.textInputContainerStyle,{width:widthTextInput,height: Platform.OS === 'android' ? hp('7.0%'): hp('5.5%')}]} >

                <TextInput
                    label = {labelText}
                    value ={ inputText}
                    editable = {isEditable}
                    maxLength = {maxLengthVal}
                    keyboardType = {keyboardType}
                    autoCapitalize= {autoCapitalizeValue}
                    backgroundColor = {isBackground}
                    onChangeText={async (text) => {
                        var trimmedStr = text.trimStart();
                        setValue(trimmedStr);
                    }}
                    // mode="outlined"
                    secureTextEntry = {isSecureText}
                    underlineColor={'transparent'}
                    style = {[styles.textInputStyle,{width:widthTextInput,height: Platform.OS === 'android' ? hp('7.0%'): hp('5.5%')}]}
                    activeUnderlineColor = {'#7F7F81'}
                    // selectionColor={'transparent'} 
                    theme={{
                        colors: {
                            label : 'grey',
                            background:'transparent',
                            // text: 'green',
                            primary: 'transparent',
                            // placeholder: 'green'
                        },
                       
                    }}

                   
                ></TextInput>
                
            </View>
            
        </View>
    );
};

export default FsTextInputComponent;

const styles = StyleSheet.create({

    mainComponentStyle : {

    },

    textInputStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: 14,
        color:'#6BC100',
        width:wp('35%'),
        backgroundColor: 'transparent',
    },

    textInputContainerStyle: {
        flexDirection: 'row',
        borderRadius: wp('1%'),
        borderWidth: 1,
        borderColor: '#dedede',
        backgroundColor:'transparent',
    },

});