import React, { useState, useEffect, useRef } from 'react';
import {View,StyleSheet,Text,TouchableWithoutFeedback,FlatList, ImageBackground,ActivityIndicator} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';

let defaultPetImg = require( "./../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg");

const  SelectPetUI = ({route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [selectIndex, set_selectIndex] = useState(undefined);
    const [imgLoader, set_imgLoader] = useState([]);
    const flatListRef = React.useRef();
    let indexArray = useRef([]);

    useEffect(() => {
        set_petsArray(props.petsArray);
        set_selectIndex(props.selectedIndex);
        if(props.selectedIndex && props.selectedPName) {
            scrollToIndexInitial(props.selectedIndex,props.selectedPName,props.petsArray);
        }
        
    }, [props.petsArray,props.selectedIndex]);

    const selectPetAction = (item,index) => {
        set_selectIndex(index);
        props.selectPetAction(item);
    };

    const onloadStarting = (index) => {
        indexArray.current.push(index);
        set_imgLoader(true);
    };

    const onloadEnding = (index) => {
        
        var index1 = indexArray.current.findIndex(e => e === index);
        if (index1 != -1) {
            indexArray.current.splice(index1, 1);
        }
        set_imgLoader(false);
    };

      // Scrolls to selected pet
    const scrollToIndexInitial = (index,pName,pArray) => {

        setTimeout(() => {  
            scrollToIndexSearch(pArray); 
        }, 1000); 

    };

    // Scrolls to selected pet from search
    const scrollToIndexSearch = (pArray) => {

        setTimeout(() => {

            if(pArray) {
                var temp = pArray.findIndex(item => item.petName === props.selectedPName);
                let indexNew = parseInt(temp / 3);
                flatListRef.current.scrollToIndex({ index: indexNew });
            }
            
        }, 100);

      };

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
            
            <View style= {{height:hp('10%'), width:wp('90%'),alignSelf:'center'}}>
                <View style={{alignItems:'center',marginTop:hp('6%')}}>
                    <View style={{width:wp('90%')}}>
                        <Text style={CommonStyles.headerTextStyle}>{'Please select your pet'}</Text>
                    </View>
                </View>

            <View style={{width:wp('90%'),minHeight:hp('45%'),alignSelf:'center'}}>

                <FlatList
                    ref={flatListRef}
                    style={styles.flatcontainer}
                    data={petsArray}
                    showsVerticalScrollIndicator={false}
                    // ListEmptyComponent={() => <ActivityIndicator size='small' color={"blue"}/>}
                    removeClippedSubviews={true}
                    renderItem={({ item, index }) => (
                        <TouchableWithoutFeedback  onPress={() => 
                            selectPetAction(item, index)
                        }>
                            <View style={{justifyContent:'space-between'}}>
                                <View style={styles.flatview}>

                                    <View style={{borderRadius:15}}>
                                    {item.photoUrl && item.photoUrl !=="" ? <ImageBackground source={{uri:item.photoUrl}} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {
                            set_imgLoader(false)}} style={styles.petImgStyle}>
                                {imgLoader ? <View style={styles.petImgStyle}><ActivityIndicator size='small' color="grey"/></View> : null}
                            </ImageBackground> 
                                    : <ImageBackground source={defaultPetImg} style={styles.petImgStyle}></ImageBackground>}
                                    </View>

                                    <ImageBackground
                                            source={selectIndex === index ? require("../../../assets/images/otherImages/svg/radioBtnGreen.svg") : require("../../../assets/images/otherImages/svg/radioBtnUnSelectedImg.svg")}
                                            style={styles.selectionImgStyle}
                                    />

                                <View >

                                <Text style={[styles.name]}>{item.petName.length> 9 ? item.petName.slice(0, 9)+"..."  : item.petName }</Text>

                                </View>
                            </View>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                    keyExtractor={(item) => item.petName}
                    numColumns={3}
                    />
                    
                </View>

            </View>

         </View>
    );
  }
  
  export default SelectPetUI;

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