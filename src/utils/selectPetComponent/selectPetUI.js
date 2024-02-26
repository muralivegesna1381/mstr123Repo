import React, { useState, useEffect, useRef } from 'react';
import {View,StyleSheet,Text,TouchableWithoutFeedback,FlatList, ImageBackground,ActivityIndicator,TouchableOpacity,Image,Keyboard,TextInput,Platform} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";

let defaultPetImg = require( "./../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg");
let searchImg = require('./../../../assets/images/otherImages/svg/searchIcon.svg');
let noLogsDogImg = require("./../../../assets/images/dogImages/noRecordsDog.svg");

const  SelectPetUI = ({route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [selectIndex, set_selectIndex] = useState(undefined);
    const [imgLoader, set_imgLoader] = useState([]);
    const [petName, set_petName] = useState(undefined);
    const [isListOpen, set_ListOpen] = useState(false);
    const [filterArray, set_filterArray] = useState(undefined);
    const [showSearch, set_showSearch] = useState(false);

    let isKeyboard = useRef(false);
    const flatListRef = React.useRef();
    let pNameSearch = useRef(undefined);
    let selectedPetSearch = useRef(undefined);
    let disableKeyboard = useRef(undefined)

    useEffect(() => {

        if(props.isKeboard === false || props.isKeboard === undefined) {
            hideKeyboard();
        }

        set_petsArray(props.petsArray);
        set_selectIndex(props.selectedIndex);
        if(props.selectedIndex && props.selectedPName) {
            scrollToIndexInitial(props.selectedIndex,props.selectedPName,props.petsArray);
        }
        checkForSearchAvailable()
    }, [props.petsArray,props.selectedIndex,props.isKeboard]);

    const checkForSearchAvailable = async () => {

        let userRoleDetails = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_DETAILS);
        userRoleDetails = JSON.parse(userRoleDetails);
    
        if(userRoleDetails && (userRoleDetails.RoleName === "Hill's Vet Technician" || userRoleDetails.RoleName === "External Vet Technician")) {
          set_showSearch(true)
        } else {
          set_showSearch(false)
        }
    
    }

    const hideKeyboard = () => {

        set_ListOpen(false);
        set_filterArray(undefined);
        set_petName('');
        pNameSearch.current = '';
        isKeyboard.current = false;
        disableKeyboard.current = true;
        Keyboard.dismiss();
        
    };

    const selectPetAction = (item,index) => {
        set_selectIndex(index);
        hideKeyboard();
        props.selectPetAction(selectedPetSearch.current);
    };

    // Scrolls to selected pet
    const scrollToIndexInitial = (index,pName,pArray) => {

        setTimeout(() => {  
            set_ListOpen(false);
            set_filterArray(undefined);
            set_petName('');
            pNameSearch.current = pName;
            isKeyboard.current = false;
            Keyboard.dismiss();
            scrollToIndexSearch(pArray); 
        }, 1000); 

    };

    // Filtes the pets based on Typing the petname
    const filterPets = (pName) => {

        if(isKeyboard.current === true) {
          set_petName(pName)
          if(pName && pName.length > 0) {
            set_ListOpen(true);
          } else {
            set_ListOpen(false);
          }
      
          let newData;
          newData = props.petsArray.filter(function(item) {
            const itemData = item ? item.petName.toUpperCase() : "".toUpperCase();
            const textData = pName.toUpperCase();
            return itemData.indexOf(textData) > -1;
          });
      
          if(newData && newData.length > 0) {
            set_filterArray(newData)
          } else {
            set_filterArray(undefined)
          }
        }
      };
    
      // clears the list after selection from pets list
      const selectedSearchPetAction = async (item,index) => {
        set_ListOpen(false);
        set_filterArray(undefined);
        set_petName('');
        pNameSearch.current = item.petName;
        isKeyboard.current = false;
        Keyboard.dismiss();
        scrollToIndexSearch(petsArray);
      };

      // Scrolls to selected pet from search
      const scrollToIndexSearch = (pArray) => {

        setTimeout(() => {

            if(pArray) {
                var temp = pArray.findIndex(item => item.petName === pNameSearch.current);
                let indexNew = parseInt(temp / 3);
                flatListRef.current.scrollToIndex({ index: indexNew });
                var temp1 = pArray.filter(item => item.petName === pNameSearch.current);
                set_selectIndex(temp);
                selectedPetSearch.current = temp1[0]
                selectPetAction(temp1,temp);
            }
            
        }, 100);

      };
    
    // Renders the pets list after typing the petname
    const renderSearchItems = ({ item, index }) => {
        return (
    
            <View style={[CommonStyles.searchCellBackViewStyle,{}]}>
                
                {<TouchableOpacity style={{width:wp('90%'),height:hp('5%'),justifyContent:'center'}} onPress={() => {selectedSearchPetAction(item,index)}}>
                    <View style = {{flexDirection:'row',height: hp("6%"),alignItems:'center'}}>
                        <View>
                            {item && item.photoUrl ? <ImageBackground resizeMode='stretch' style={CommonStyles.searchIconStyle} imageStyle={{ borderRadius: 5}} source={{uri:item.photoUrl}} ></ImageBackground>
                            : <ImageBackground imageStyle={{ borderRadius: 5}} resizeMode='contain' style={CommonStyles.searchIconStyle} source={defaultPetImg} ></ImageBackground> }
                        </View>
                        <View style = {{marginLeft:hp('1%')}}>
                            <Text style={CommonStyles.searchTexStyle} >{item.petName}</Text>
                            <Text style={CommonStyles.searchSubTexStyle} >{item.petBreed}</Text>
                        </View>
                    </View>
                    
                </TouchableOpacity>}   
    
            </View>
        );
    };

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
            
            {petsArray && petsArray.length > Constant.NO_OF_SELECTED_PETS && showSearch ? <View style={CommonStyles.searchBarStyle}>
                            
                <View style={[CommonStyles.searchInputContainerStyle]}>
                    <Image source={searchImg} style={CommonStyles.searchImageStyle} />
                    <TextInput style={CommonStyles.searchTextInputStyle}
                        underlineColorAndroid="transparent"
                        placeholder="Search a pet"
                        placeholderTextColor="#7F7F81"
                        autoCapitalize="none"
                        value = {petName}
                        onFocus={ () => isKeyboard.current = true}
                        onChangeText={(name) => {filterPets(name)}}
                    />
                </View> 
            </View> : null}

            <View style= {{height:hp('8%'), width:wp('90%'), marginTop: petsArray && petsArray.length > Constant.NO_OF_SELECTED_PETS && showSearch ? wp('0%') : wp('5%'), alignSelf:'center'}}>
                <View style={{alignItems:'center'}}>
                    <View style={{width:wp('90%')}}>
                        <Text style={CommonStyles.headerTextStyle}>{'Please select your pet'}</Text>
                    </View>
                </View>

            <View style={{width:wp('90%'),minHeight:hp('65%'),alignSelf:'center'}}>

                <FlatList
                    ref={flatListRef}
                    style={styles.flatcontainer}
                    data={petsArray}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    keyboardShouldPersistTaps="handled" 
                    renderItem={({ item, index }) => (
                        <TouchableWithoutFeedback  onPress={() =>  {selectedPetSearch.current = item, selectPetAction(item, index)}}>
                            <View style={{justifyContent:'space-between'}}>
                                <View style={styles.flatview}>

                                    <View style={{borderRadius:15}}>
                                      {item.photoUrl && item.photoUrl !=="" ? <ImageBackground source={{uri:item.photoUrl}} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {
                                        set_imgLoader(false)}} style={styles.petImgStyle}>
                                        {imgLoader ? <View style={styles.petImgStyle}><ActivityIndicator size='small' color="grey"/></View> : null}
                                        </ImageBackground> 
                                        : <ImageBackground source={defaultPetImg} style={styles.petImgStyle}></ImageBackground>}
                                    </View>

                                    <ImageBackground source={selectIndex === index ? require("../../../assets/images/otherImages/svg/radioBtnGreen.svg") : require("../../../assets/images/otherImages/svg/radioBtnUnSelectedImg.svg")} style={styles.selectionImgStyle}/>

                                    <View>
                                        <Text style={[styles.name]}>{item.petName.length> 9 ? item.petName.slice(0, 9)+"..."  : item.petName }</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                    keyExtractor={(item) => item.petName}
                    numColumns={3}
                    onScrollToIndexFailed={(error)=>{}}
                    />
                    
                </View>

            </View>

        {isListOpen ? <View style={[CommonStyles.searchFilterListStyle,{...CommonStyles.shadowStyleDrop,top: Platform.isPad ? 70 : 50}]}>
            {filterArray && filterArray.length > 0 ? <FlatList
                data={filterArray}
                renderItem={renderSearchItems}
                keyExtractor={(item, index) => "" + index}
            /> : <View style={{flexDirection:'row',alignItems:'center',width: wp("90%"),}}>
                <Image style= {[CommonStyles.searchNologsDogStyle]} source={noLogsDogImg}></Image>
                <View>
                    <Text style={CommonStyles.noRecTexStyle} >{Constant.NO_RECORDS_LOGS}</Text>
                    <Text style={CommonStyles.noRecSubTextStyle} >{Constant.NO_RECORDS_LOGS1}</Text>
                </View>                           
            </View>}
        </View> : null} 

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