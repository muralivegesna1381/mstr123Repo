import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, Text, ActivityIndicator, TextInput, FlatList, Keyboard, Platform } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import Carousel, { Pagination } from 'react-native-snap-carousel';
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';
import * as Constant from "../../utils/constants/constant";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";

import PetEditImg from "./../../../assets/images/otherImages/svg/petEditCarasoul.svg";
import DefaultPetImg from "./../../../assets/images/otherImages/png/defaultDogIcon_dog.png";
import SearchImg from "./../../../assets/images/otherImages/svg/searchIcon.svg";
import NoLogsDogImg from "./../../../assets/images/dogImages/noRecordsDog.svg";

const PetsSelectionCarousel = ({ route,defaultPet, petsArray,setValue, setSlideValue, isSwipeEnable, activeSlides, isFromScreen, selectedPetAction, dismissSearch, ...props }) => {

  const [ndexValue, set_indexValue] = useState(0);
  const [imgLoader, set_imgLoader] = useState(true);
  const [indexCount, set_indexCount] = useState(0);
  const carouselRef = useRef(null);
  const [petName, set_petName] = useState(undefined);
  const [isListOpen, set_ListOpen] = useState(false);
  const [filterArray, set_filterArray] = useState(undefined);
  const [showSearch, set_showSearch] = useState(false);
  let isKeyboard = useRef(false);

  React.useLayoutEffect(() => {

    if (defaultPet && petsArray && petsArray.length > 0) {
      let ind = getIndex(petsArray, defaultPet.petID);
      set_indexValue(ind);
    }

    if(petsArray && petsArray.length > 5) {
      checkForSearchAvailable();
    }

  }, [defaultPet, petsArray]);

  useEffect(() => {
  }, [activeSlides]);

  useEffect(() => {

    removeSearch()

  }, [dismissSearch]);

  const checkForSearchAvailable = async () => {

    let userRoleDetails = UserDetailsModel.userDetailsData.userRole;

    if(userRoleDetails && (userRoleDetails.RoleName === "Hill's Vet Technician" || userRoleDetails.RoleName === "External Vet Technician")) {
      set_showSearch(true)
    } else {
      set_showSearch(false)
    }

  }

  const renderScrollItem = (item) => {

    if(petsArray && petsArray.length > 0) {
      let ind = getIndex(petsArray, carouselRef.current.props.data[item].petID);
      if (activeSlides === ind && petsArray.length > 1) { } else {
        setValue(carouselRef.current.props.data[item]);
        carouselRef.current.snapToItem(ind);
      }
      set_indexCount(ind);

    }

  };

  const editPetAction = (item) => {
    props.editPetAction(item);
  };

  function getIndex(arr, petID) {
    return arr.findIndex(obj => obj.petID === petID);
  };

  // Filters the pet records from Array
  const filterPets = (pName) => {

    if (isKeyboard.current === true) {
      set_petName(pName)
      if (pName && pName.length > 0) {
        set_ListOpen(true);
      } else {
        set_ListOpen(false);
      }

      let newData = petsArray.filter(function (item) {
        const itemData = item ? item.petName.toUpperCase() : "".toUpperCase();
        const textData = pName.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });

      if (newData && newData.length > 0) {
        set_filterArray(newData)
      } else {
        set_filterArray(undefined)
      }
    }
  };

  // Removes the typeahead list after selecting the pet in search
  const selectedPetAction1 = (item) => {
    set_ListOpen(false);
    set_filterArray(undefined);
    set_petName('');
    isKeyboard.current = false;
    Keyboard.dismiss();
    selectedPetAction(item);
  };

  const removeSearch = () => {
    set_ListOpen(false);
    set_filterArray(undefined);
    set_petName('');
    isKeyboard.current = false;
    Keyboard.dismiss();
  }

  const renderSearchItems = ({ item, index }) => {
    return (

      <View style={CommonStyles.searchCellBackViewStyle}>

        {<TouchableOpacity style={{ width: wp('90%'), height: hp('5%'), justifyContent: 'center' }} onPress={() => { selectedPetAction1(item) }}>
          <View style={{ flexDirection: 'row', height: hp("6%"), alignItems: 'center' }}>
            <View>
              {item && item.photoUrl ? <ImageBackground resizeMode='stretch' style={CommonStyles.searchIconStyle} imageStyle={{ borderRadius: 5 }} source={{ uri: item.photoUrl }} ></ImageBackground>
                : <ImageBackground imageStyle={{ borderRadius: 5 }} resizeMode='contain' style={CommonStyles.searchIconStyle} source={DefaultPetImg} ></ImageBackground>}
            </View>
            <View style={{ marginLeft: hp('1%') }}>
              <Text style={CommonStyles.searchTexStyle} >{item.petName}</Text>
              <Text style={CommonStyles.searchSubTexStyle} >{item.petBreed}</Text>
            </View>
          </View>

        </TouchableOpacity>}

      </View>
    );
  };

  const renderItem = ({ item, index }) => {

    return (

      <TouchableOpacity disabled={!isSwipeEnable} style={styles.petComponentStyle} onPress={() => { renderScrollItem(index) }}>
        {index === activeSlides ?
          <ImageBackground source={require("./../../../assets/images/otherImages/png/ActiveSlider.png")} style={styles.gradientImgStyle} imageStyle={{ borderRadius: Platform.isPad ? 10 : 10, borderColor: 'white', borderWidth: 0.5 }}>

            <ImageBackground source={DefaultPetImg} style={[styles.backdrop, {}]} imageStyle={{ borderRadius: 8, borderColor: 'white', borderWidth: 0.5 }}>
              {item.photoUrl && item.photoUrl !== "" ? <ImageBackground source={{ uri: item.photoUrl }} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {
                set_imgLoader(false)
              }} style={[styles.backdrop, {}]} imageStyle={{ borderRadius: 5 }}>
                {imgLoader ? <ActivityIndicator size='small' color="grey" /> : null}
              </ImageBackground> :
                <ImageBackground source={DefaultPetImg} style={[styles.backdrop, {}]} imageStyle={{ borderRadius: 5 }}></ImageBackground>}
            </ImageBackground>

            <View style={{ height: hp("8%"), alignSelf: 'center', flex: 2, justifyContent: 'center' }}>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text numberOfLines={1} style={[styles.petTitle]}>{item.petName && item.petName.length > 25 ? (Platform.isPad ? item.petName.slice(0, 25).toUpperCase() + "..." : item.petName.slice(0, 15).toUpperCase() + "...")  : item.petName.toUpperCase()}</Text>
              </View>

              <View>
                {item.petBreed ? <Text numberOfLines={1} style={[styles.petSubTitle]}>{item.petBreed && item.petBreed.length > 20 ? item.petBreed.slice(0, 20) + "..." : item.petBreed}</Text> : null}
                <Text style={[styles.genderTitle,]}>{item.speciesId === '1' ? 'Dog ' : 'Cat '}<Text>{item.gender ? '- ' + item.gender : item.gender}</Text></Text>
              </View>

            </View>

            {index === activeSlides && isFromScreen === "Dashboard" ?
              <TouchableOpacity style={styles.editPetBtnStyle} onPress={() => { editPetAction(item) }}>
                <PetEditImg width={Platform.isPad ? wp("4%") : wp("6%")} height={hp("6%")} style={{ marginTop: Platform.isPad ? hp("-1%") : hp("-1.64%"),marginRight: Platform.isPad ? hp("-1%") : wp("-0.02%"), alignSelf:'flex-end' }}/>
              </TouchableOpacity> : null}

          </ImageBackground> :

          <View style={{ flexDirection: 'row', flex: 1 }}>

            <ImageBackground source={require("./../../../assets/images/otherImages/png/unActiveSlider.png")} style={[styles.gradientImgStyle, { height: hp('7.6%'), marginTop: hp('-0.3%') }]} imageStyle={{ borderRadius: Platform.isPad ? 10 : 10 }}>

            <ImageBackground source={DefaultPetImg} style={[styles.backdrop, {}]} imageStyle={{ borderRadius: 8, borderColor: 'white', borderWidth: 0.5 }}>
                {item.photoUrl && item.photoUrl !== "" ? <ImageBackground source={{ uri: item.photoUrl }} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {
                  set_imgLoader(false)
                }} style={index === activeSlides ? [styles.backdrop, {}] : [styles.backdrop]} imageStyle={{ borderRadius: 5 }}>
                  {imgLoader ? <ActivityIndicator size="small" color="grey" /> : null}
                </ImageBackground> :
                  <ImageBackground source={DefaultPetImg} style={index === activeSlides ? [styles.backdrop, {}] : [styles.backdrop]} imageStyle={{ borderRadius: 5 }}></ImageBackground>}

              </ImageBackground>

              <View style={{ height: hp("9%"), alignSelf: 'center', flex: 2, justifyContent: 'center' }}>

                <Text style={[styles.petTitle]}>{item.petName && item.petName.length > 15 ? item.petName.slice(0, 15).toUpperCase() + "..." : item.petName.toUpperCase()}</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                  <View>
                    <Text numberOfLines={1} style={[styles.petSubTitle]}>{item.petBreed && item.petBreed.length > 20 ? item.petBreed.slice(0, 20) + "..." : item.petBreed}</Text>
                    <Text style={[styles.genderTitle,]}>{item.speciesId === '1' ? 'Dog ' : 'Cat '}<Text style={[styles.genderTitle,]}>{item.gender ? '- ' + item.gender : item.gender}</Text></Text>
                  </View>

                </View>

              </View>
            </ImageBackground>

          </View>}

      </TouchableOpacity>
    );
  };

  return (

    <View style={{ justifyContent: 'center' }}>
      
      {petsArray && petsArray.length > Constant.NO_OF_PETS && showSearch ? <View style={Platform.isPad ? [CommonStyles.searchBarStyle, { borderRadius: 10 }] : [CommonStyles.searchBarStyle]}>

        <View style={[CommonStyles.searchInputContainerStyle]}>
          {/* <Image source={searchImg} style={Platform.isPad ? [CommonStyles.searchImageStyle, { width: wp("3%"), }] : [CommonStyles.searchImageStyle]} /> */}
          <SearchImg width={wp("3%")} height={hp("4%")}/>
          <TextInput style={CommonStyles.searchTextInputStyle}
            underlineColorAndroid="transparent"
            placeholder="Search a pet"
            placeholderTextColor="#7F7F81"
            autoCapitalize="none"
            value={petName}
            onFocus={() => isKeyboard.current = true}
            onChangeText={(name) => { filterPets(name) }}
          />
        </View>

      </View> : null}

      <View style={styles.mainComponentStyle}>

          <View style={[styles.imageViewStyle]}>
            <Carousel
              ref={carouselRef}
              data={petsArray}
              renderItem={renderItem}
              sliderWidth={wp('100%')}
              itemWidth={wp('48%')}
              layout={'default'}
              activeSlideAlignment={'start'}
              firstItem={activeSlides}
              hasParallaxImages={true}
              onSnapToItem={data => renderScrollItem(data)}
              scrollEnabled={isSwipeEnable}
              inactiveSlideOpacity={1}
              useScrollView={true}
              enableSnap={true}
            />
            {/* {getPagination()}  */}
          </View>

      </View>

      {isListOpen ? <View style={Platform.isPad ? [CommonStyles.searchFilterListStyle, { top: Platform.isPad ? 65 : 80, ...CommonStyles.searchDropShadowStyle}] : [CommonStyles.searchFilterListStyle, {...CommonStyles.searchDropShadowStyle}]}>
        {filterArray && filterArray.length > 0 ?
          <FlatList
            data={filterArray}
            renderItem={renderSearchItems}
            keyExtractor={(item, index) => "" + index}
          /> :
          <View style={{ flexDirection: 'row', alignItems: 'center', width: wp("90%"), }}>
            <NoLogsDogImg width = {wp('14%')} height = {hp('5%')} style={[CommonStyles.searchNologsDogStyle]}/>
            <View>
              <Text style={CommonStyles.noRecTexStyle} >{Constant.NO_RECORDS_LOGS}</Text>
              <Text style={CommonStyles.noRecSubTextStyle} >{Constant.NO_RECORDS_LOGS1}</Text>
            </View>
          </View>}
      </View> : null}

    </View>

  );


}

export default PetsSelectionCarousel;

const styles = StyleSheet.create({

  mainComponentStyle: {
    justifyContent: 'center',
    minHeight: hp('12%'),
    width: wp('100%'),
    minHeight: hp('8%'),
    marginLeft: wp('1%'),
  },

  petComponentStyle: {
    flexDirection: 'row',
    height: hp('8%'),
  },

  backdrop: {
    resizeMode: 'contain',
    marginLeft: hp('1%'),
    marginRight: hp('1%'),
    aspectRatio: 1,
    height: hp('5%'),
    alignSelf: 'center',
    justifyContent: 'center'
  },

  genderTitle: {
    ...CommonStyles.textStyleSemiBold,
    fontSize: fonts.fontTiny,
    color: 'white',
  },

  petTitle: {
    ...CommonStyles.textStyleExtraBold,
    fontSize: fonts.fontSmall,
    color: 'white',
  },

  petSubTitle: {
    ...CommonStyles.textStyleSemiBold,
    fontSize: fonts.fontTiny,
    color: 'white',
  },

  imageViewStyle: {
    width: wp('100%'),
    alignSelf: 'flex-start',
    marginLeft: wp('2%'),
    marginTop: hp('0.5%'),

  },

  editPetBtnStyle: {
    width: wp("8%"),
    aspectRatio: 1,
  },

  editImgStyle: {
    resizeMode: 'contain',
    overflow: 'hidden',
    alignSelf: 'flex-end',     
  },

  gradientImgStyle: {
    resizeMode: 'contain',
    height: hp('7%'),
    width: wp('49%'),
    flexDirection: 'row',
  },

});