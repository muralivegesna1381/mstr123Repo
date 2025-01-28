import React, { useState, useEffect } from 'react';
import {StyleSheet,View,} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';
import { TextInput } from 'react-native-paper';

const TextInputComponent = ({navigation, route,inputText,labelText,setValue,isEditable,maxLengthVal,keyboardType,autoCapitalize,widthValue,isSecure,isBackground,multiline,...props }) => {

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

        <View>

            <View style={[styles.textInputContainerStyle,{width:widthTextInput}]} >

                <TextInput
                    label = {labelText}
                    value ={ inputText}
                    editable = {isEditable}
                    maxLength = {maxLengthVal}
                    keyboardType = {keyboardType}
                    numberOfLines={2}
                    autoCapitalize= {autoCapitalizeValue}
                    onChangeText={async (text) => {
                        var trimmedStr = text.trimStart();
                        setValue(trimmedStr);
                    }}
                    // mode="outlined"
                    secureTextEntry = {isSecureText}
                    underlineColor={'transparent'}
                    multiline={multiline}
                    style = {[styles.textInputStyle,{width:widthTextInput,backgroundColor: backgroundColor ? backgroundColor : 'transparent'}]}
                    activeUnderlineColor = {'#7F7F81'}
                    selectionColor={'transparent'} 
                    theme={{ colors: { onSurfaceVariant: 'grey' } }}
                    // backgroundColor = {isBackground}
                    disabled = {isEditable ? false : true}
                    textColor = {'black'}
                />
                
            </View>
            
        </View>
    );
};

export default TextInputComponent;

const styles = StyleSheet.create({
    
    textInputStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontMedium,
        color:'black',
        width: wp('80%'),
        // flex:1,
        height: hp('9%'),

    },

    textInputContainerStyle: {
        flexDirection: 'row',
        width: wp('80%'),
        height: hp('8%'),
        borderRadius: wp('1%'),
        borderWidth: 1,
        borderColor: '#dedede',
        backgroundColor:'white',
        alignItems: 'center',
        justifyContent: 'center',
    },

});