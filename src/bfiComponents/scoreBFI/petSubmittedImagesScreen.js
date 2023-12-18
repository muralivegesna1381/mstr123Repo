import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CommonStyles from "../../utils/commonStyles/commonStyles";
import HeaderComponent from "../../utils/commonComponents/headerComponent";
import LoaderComponent from "../../utils/commonComponents/loaderComponent";
import ImageView from "react-native-image-viewing";
import moment from "moment";
import fonts from "../../utils/commonStyles/fonts";


const PetSubmittedImagesScreen = ({ route, navigation }) => {
  const [isLoading, set_isLoading] = useState(false);
  const [data, setData] = useState([]);
  const [imgData, setImgData] = useState([]);
  const [imgLoader, set_imgLoader] = useState(false);
  const [isImageView, set_isImageView] = useState(false);
  const [currentImageViewPos, set_CurrentImageViewPos] = useState(0);
  const [images, set_images] = useState([]);
  const [petName, setPetName] = useState('');
  const [isScrollEndReached, set_isScrollEndReached] = useState(false);

  var tempArr = useRef([])
  let urlArr = []
  var imagePositionStyle = styles.imageStyle;
  var imgPos = useRef();
  let icScrollStartReach = require('./../../../assets/images/bfiGuide/svg/left_indicater.svg');
  let icScrollEndReach = require('./../../../assets/images/bfiGuide/svg/right_indicater.svg');

  //Screen to show the subumitted images of the pet of there are multiple sets
  const viewImage = (position) => {
    let imagesArray = data[position].petBfiImages
    for (let i = 0; i < imagesArray.length; i++) {
      let tempObj = {
        uri: imagesArray[i].thumbnailUrl,
      }
      urlArr.push(tempObj)
    }
    tempArr.current = urlArr;
    set_CurrentImageViewPos(imgPos.current)
    set_images(urlArr);
    set_isImageView(true);
  }
  useEffect(() => {
    if (route.params?.petName) {
      setPetName(route.params?.petName)
    }
    if (route.params?.imagesArray) {
      var petList = [];
      setImgData(route.params?.imagesArray)
      for (var i = 0; i < route.params?.imagesArray.length; i++) {
        let tempArray = [];
        for (let j = 0; j < route.params?.imagesArray[i].petBfiImages.length; j++) {
          let tempObj = {
            imagePositionId: route.params?.imagesArray[i].petBfiImages[j].imagePositionId,
            imagePosition: route.params?.imagesArray[i].petBfiImages[j].imagePosition,
            imageName: route.params?.imagesArray[i].petBfiImages[j].imageName,
            imageUrl: route.params?.imagesArray[i].petBfiImages[j].imageUrl,
            thumbnailUrl: route.params?.imagesArray[i].petBfiImages[j].thumbnailUrl,
            index: i,
          }
          tempArray.push(tempObj);
        }
        var petBfiImages = { index: route.params?.imagesArray[i].capturedOn, "petBfiImages": tempArray };
        petList.push(petBfiImages)
      }
      setData(petList)
    }
  }, [route.params?.imagesArray]);

  //Android Physical back button action
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  const handleBackButtonClick = () => {
    backBtnAction();
    return true;
  };

  // Back button action defined here
  const backBtnAction = () => {
    navigation.navigate('PetListBFIScoringScreen');

  };

  const infoBtnAction = () => {
    navigation.navigate("InstructionsPage", {
      instructionType: 2,
    });
  };

  //flat list start listener
  const handleStartReached = (event) => {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.x === 0) set_isScrollEndReached(false)
  };
  // flat list end listener
  const handleEndReached = () => {
    set_isScrollEndReached(true)
  };
  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.renderItemViewStyle}>
        <View style={[styles.dateTextRowStyle]}>
          <Text style={styles.dateTextStyle}>{item.index ? (item.index ? moment(moment.utc(item.index).toDate()).local().format('DD MMM, YYYY   hh:mm a') : '') : ''}</Text>
          <TouchableOpacity style={[styles.rightButtonstyleEnable]} onPress={() => {
            navigation.navigate("BFIScoreMain", { bfiInfoData: imgData[index], petName: petName, from: 'setImages' });
          }}>
            <Text style={styles.smallTextStyle}>{'SCORE NOW  -->'}</Text>
          </TouchableOpacity>
        </View>
        <FlatList style={[styles.innerContainer]}
          horizontal
          data={item.petBfiImages}
          keyExtractor={({ imagePositionId }, index) => index}
          onScroll={handleStartReached}
          onEndReached={handleEndReached}
          renderItem={horizontalRenderItem}
          showsHorizontalScrollIndicator={false}
        />
        {item.petBfiImages.length > 3 ?
          <View style={styles.headerViewStyleView}>
            <View style={{ flexDirection: 'row' }}>
              <Image style={{
                width: wp('6%'), height: hp('2%'), marginHorizontal: wp('2%')
              }} resizeMode='contain' source={require('./../../../assets/images/bfiGuide/svg/arrow-black-left.svg')}></Image>
              <Image style={{
                width: wp('6%'), height: hp('2%')
              }} resizeMode='contain' source={!isScrollEndReached ? icScrollEndReach : icScrollStartReach}></Image>
              <Image style={{
                width: wp('6%'), height: hp('2%'), marginHorizontal: wp('2%')
              }} resizeMode='contain' source={require('./../../../assets/images/bfiGuide/svg/arrow-black-right.svg')}></Image>

            </View>
          </View>
          : null}
      </View>
    );
  };

  //Render item for horizontal list
  const horizontalRenderItem = ({ item, index }) => {
    if (item.imagePositionId === '3' || item.imagePositionId === '4' || item.imagePositionId === '5' || item.imagePositionId === '6') {
      imagePositionStyle = styles.imageStyleLandScape
    }
    else {
      imagePositionStyle = styles.imageStyle
    }
    return (
      <TouchableOpacity onPress={() => {
        imgPos.current = index;
        viewImage(item.index)
      }}>
        <ImageBackground style={[imagePositionStyle]} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => set_imgLoader(false)} source={{ uri: item.thumbnailUrl }}>
          {imgLoader === true && item && item.thumbnailUrl ? (<View style={[CommonStyles.spinnerStyle]}><ActivityIndicator size="large" color="#37B57C" /></View>) : null}
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[CommonStyles.headerView, {}]}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isTitleHeaderEnable={true}
          isInfoEnable={true}
          title={petName}
          infoBtnAction={() => infoBtnAction()}
          backBtnAction={() => backBtnAction()}
        />
      </View>
      <FlatList
        data={data}
        marginTop={hp('5%')}
        marginBottom={hp('5%')}
        keyExtractor={({ petBfiImagesSetId }, index) => index}
        renderItem={renderItem} />
      {isImageView ? <ImageView style={styles.videoViewStyle}
        images={images}
        imageIndex={currentImageViewPos}
        visible={isImageView}
        animationType="slide"
        onRequestClose={() => set_isImageView(false)}
      /> : null}
      {isLoading === true ? (
        <LoaderComponent
          isLoader={false}
          loaderText={"Please wait.."}
          isButtonEnable={false}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  innerContainer: {
    marginBottom: hp('1%'),
    marginTop: hp('1%')
  },
  setItemContainer: {
    flex: 1,
  },

  item: {
    borderColor: "#9f9f9f",
    height: hp("12%"),
    width: wp("35%"),
  },
  dateTextRowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
    marginTop: wp('2%'),
  },
  rightButtonstyleEnable: {
    backgroundColor: "#cbe8b0",
    //flex:1,
    height: hp("2%"),
    width: wp('18%'),
    borderRadius: hp("0.5%"),
    justifyContent: "center",
    alignItems: 'center',
    borderColor: '#6fc309',
    borderWidth: 1.0,
    //marginHorizontal:wp('2%'),
  },
  dateTextStyle: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    ...CommonStyles.textStyleSemiBold,
    color: 'black'
  },

  smallTextStyle: {
    ...CommonStyles.textStyleExtraBold,
    fontSize: fonts.fontXTiny,
    color: 'black'
  },
  ratingImage3: {
    height: wp("8%"),
    width: wp("8%"),
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: 'flex-end'
  },
  imageStyle: {
    width: wp("20%"),
    height: hp("11%"),
    borderRadius: 5,
    resizeMode: "cover",
    marginLeft: wp("2%"),
    backgroundColor: "#D9D9D9"
  },
  imageStyleLandScape: {
    width: wp("30%"),
    height: hp("12%"),
    borderRadius: 5,
    resizeMode: "contain",
    marginLeft: wp("2%"),
    backgroundColor: "#D9D9D9"
  },
  renderItemViewStyle: {
    backgroundColor: "#F4F4F4",
    height: hp('18%'),
    marginLeft: wp('2%'),
    marginRight: wp('2%'),
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    borderRadius: 10
  },
  headerViewStyleView: {
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default PetSubmittedImagesScreen;