import React, { useState, useRef } from 'react';
import {View,StyleSheet,Text,FlatList,TouchableOpacity,TextInput,Platform,Image} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';
import * as AppKeys from "./../../utils/appKeys/appKeys.js";

import SearchImg from "./../../../assets/images/otherImages/svg/searchIcon.svg";
import FailedImg from "../../../assets/images/otherImages/svg/clear_white_icon.svg";

const failedImg = require('./../../../assets/images/otherImages/png/wrong.png')
const  GooglePlacesComponent = ({isBackBtnEnable,route,setValue,invalidAddress, ...props }) => {

    const [placeName, set_placeName] = useState(undefined);
    const [isListOpen, set_isListOpen] = useState(false);
    const [placesArray, set_placesArray] = useState(undefined);

    let isShowSearch = useRef(undefined);

    const getGooglePlaces = async (searchText) => {

        set_placeName(searchText);

        // await fetch("https://maps.googleapis.com/maps/api/place/autocomplete/json?key=" + AppKeys.GOOGLE_PLACES_KEY + "&input=" + searchText + "&components=country:us|country:uk|country:ca",
        await fetch("https://maps.googleapis.com/maps/api/place/autocomplete/json?key=" + AppKeys.GOOGLE_PLACES_KEY + "&input=" + searchText,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "ClientToken": ''
                },
            }
        ).then((response) => response.json()).then(async (data) => {

            if (data) {

                if(data.predictions && data.predictions.length > 0) {

                    if(isShowSearch.current) {
                        set_isListOpen(true);
                    } else {
                        set_isListOpen(false);
                    }
                    
                } else {
                    set_isListOpen(false);
                }
                set_placesArray(data.predictions);   
    
            } else {
            }
    
        }).catch((error) => {
        });

    };

    const selectedPlaceAction = (item) => {
        
        isShowSearch.current = false;
        set_placeName(item.description)
        setValue(item.description)
        set_placesArray(undefined)
        if(isListOpen === false) {
            set_isListOpen(null);
        } else {
            set_isListOpen(undefined);
        }
        // hideKeyboard()
    };
    
    // Renders the pets list after typing the petname
    const renderSearchItems = ({ item, index }) => {
        return (
    
            <View style={[CommonStyles.searchCellBackViewStyle,{width: wp("80%"),height: hp("6.5%"),}]}>
                
                {<TouchableOpacity style={{width:wp('70'),justifyContent:'center'}} onPress={() => {selectedPlaceAction(item,index)}}>
                    <View style = {{flexDirection:'row',alignItems:'center'}}>
                        <View style = {{marginLeft:hp('1%')}}>
                            <Text numberOfLines={2} style={[CommonStyles.searchTexStyle,{fontSize: fonts.fontXSmall,}]} >{item.description}</Text>
                        </View>
                    </View>
                    
                </TouchableOpacity>}   
    
            </View>
        );
    };

    return (
        
        <View style={[CommonStyles.mainComponentStyle]}>
            
            {<View style={[CommonStyles.searchBarStyle,{width:wp('80%'),height:hp('5.5%'),}]}>
                            
                <View style={[CommonStyles.searchInputContainerStyle,{width: wp('79%'),height:hp('5%')}]}>
                    
                    <SearchImg width={Platform.isPad ? wp("2.5%") : wp("3%")} height={hp("4%")} style = {{marginLeft : wp('2%')}}/>
                    <TextInput style={[CommonStyles.searchTextInputStyle,{height:hp('5%'),width:wp('15%')}]}
                        underlineColorAndroid="transparent"
                        placeholder="Enter your door address to search..."
                        placeholderTextColor="#7F7F81"
                        autoCapitalize="none"
                        value = {placeName}
                        autoCorrect = {false}
                        onFocus={ () => isShowSearch.current = true}
                        // clearButtonMode="while-editing"
                        onChangeText={(placeName) => {getGooglePlaces(placeName)}}
                        onKeyPress={({ nativeEvent }) => {nativeEvent.key === 'Backspace' ? isShowSearch.current = true : null}}
                    />

                    {<TouchableOpacity onPress={() => {set_placeName(undefined),set_isListOpen(undefined)}} style={{width: wp("4%"),marginRight: wp("4%"),alignItems:'center'}}>
                        <Image source={failedImg} style={[CommonStyles.searchImageStyle,{ width: Platform.isPad ? wp("1.5%") : wp("3%"),height : hp("2.5%"),tintColor:'grey', }]}></Image>
                    </TouchableOpacity> }

                </View> 

            </View>}

        {isListOpen ? <View style={[CommonStyles.searchFilterListStyle,{...CommonStyles.shadowStyleDrop,top: Platform.isPad ? 80 : 60,zIndex:999,width: wp("80%"),}]}>
            {placesArray && placesArray.length > 0 ? <FlatList
                data={placesArray.slice(0,5)}
                renderItem={renderSearchItems}
                keyExtractor={(item, index) => "" + index}
            /> : null}
        </View> : null} 

        </View>
    );
  }
  
  export default GooglePlacesComponent;

  const styles = StyleSheet.create({

    flatcontainer: {
        width: wp('90%'),
        marginTop: hp("2%"),
        flex:1,              
    },

    flatview: {
        width:wp('28%'),
        height:hp('15%'),
        alignItems:'center',
        marginBottom: hp("2%"),
        margin: hp("0.5%"),
        borderWidth : 1,
        borderColor : '#96B2C9',
        borderRadius : 5,
        backgroundColor : "#F6FAFD"       
    },

    name: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXSmall,
        textAlign: "center",
        color:'black',
    },
    
    petImgStyle: {
        width: hp("11%"),
        height:hp('9%'),
        resizeMode: "contain",
        borderRadius: 5,
        overflow: 'hidden',
        alignItems:'center',
        margin: hp("1%"),
    },

    selectionImgStyle : {
        width: hp("3%"),
        aspectRatio:1,
        resizeMode: "contain",
        marginTop: hp("-2%"),
    },

  });