import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, ImageBackground, TouchableOpacity, ActivityIndicator,TextInput,ScrollView,Platform } from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import fonts from '../../utils/commonStyles/fonts'
import CommonStyles from '../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant"
import AlertComponent from '../../utils/commonComponents/alertComponent';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import ImageView from "react-native-image-viewing";

const ImageScoringMainUI = ({ route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [isDetailsView, set_isDetailsView] = useState(false);
    const [title, set_title] = useState(undefined);
    const [scoringName, set_scoringName] = useState(undefined);
    const [clasificationId, set_clasificationId] = useState(0);
    const [dataArray, set_dataArray] = useState([]);
    const [descriptionText, set_descriptionText] = useState(undefined);
    const [imgLabelText, set_imgLabelText] = useState(undefined);
    const [imgLoader, set_imgLoader] = useState(false);
    const [enableBtn, set_enableBtn] = useState(false);
    const [imgURl, set_imgURL] = useState(undefined);
    const [isImgShow, set_isImgShow] = useState(undefined);
    const [imgWidth, set_imgWidth] = useState(100);
    const [imgHeight, set_imgHeight] = useState(100)
    const [images, set_images] = useState([]);
    const [isImageView, set_isImageView] = useState(false);

    const ratio = 882 / 1233;

    // setting the Measurements obj
    useEffect(() => {

        set_isLoading(props.isLoading);
        set_popUpMessage(props.popupMsg);
        set_isPopUp(props.isPopUp);
        set_isDetailsView(props.isDetailsView);
        if (props.scoreObj) {
            
            let tempArray = [];
            for (let i = 0; i < props.scoreObj.scoringScaleDetails.length; i++){
                let tempObj = {
                    "description": props.scoreObj.scoringScaleDetails[i].description,
                    "imageLabel": props.scoreObj.scoringScaleDetails[i].imageLabel,
                    "imagePath": props.scoreObj.scoringScaleDetails[i].imagePath,
                    "imageScoringDetailsId": props.scoreObj.scoringScaleDetails[i].imageScoringDetailsId,
                    "txtValue" : undefined,
                    "unitName" : props.scoreObj.scoringScaleDetails[i].unitName
                };
                tempArray.push(tempObj);
            }
            set_dataArray(tempArray);
            set_title(props.scoreObj.scoringType);
            set_clasificationId(props.scoreObj.classificationId)
            set_scoringName(props.scoreObj.imageScaleName)
        }

    }, [props.isLoading, props.isPopUp, props.popupMsg, props.isDetailsView, props.scoreObj,props.popupAlert]);

    const nextButtonAction = () => {
        props.submitAction(dataArray);
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const selectImageAction = (index, item) => {
        set_selectedIndex(index);
        set_enableBtn(true);
        set_isDetailsView(false);
        props.selectImageAction(item);
    };

    const selectAlertAction = (index, item) => {
        set_isImgShow(false);
        set_isDetailsView(true);
        set_imgURL(undefined);
        set_imgLabelText(item.imageLabel);
        set_descriptionText(item.description);
    };

    const imageViewBtnAction = (index, item) => {
        // set_images(['https://storage.googleapis.com/wearables-portal-media/UAT/GCloud/WPortal/ImageScoring/1686060677404.JPG?GoogleAccessId=wms-sa@ct-wearables-portal-pf.iam.gserviceaccount.com&Expires=1692031749&Signature=KKHAdIFWyuCI5%2BW1q1aLV7uNkUPHqFi5NWaODquIoi6KB%2F1Q%2FdPrOthuvcywaM8DYhjrqPMdQmBMRSoRKqeVeVMj39CkPf2RIqNkOfaujYXah9TyXbD9TThtXJURtVX0Lt%2BCeD0lweL%2FZ8XtkOQz0u%2FQpPPpAPewcmK%2BIk5ACbwS8IWwVaO40aGvql4nhs%2BJ2quAcNwTvhBB4PxGmB94i5n0kdxRHh1y7S8P649Rm8BzOBYJz7elNvdG8xTKI98ajHiSDp43%2B%2BFxVKWVNxkNtZFC48OnGtvhzLBZIUEQIVS29lS3qtXy2Uq5EhRDmOo63htp8vPpTOj3ytP8ouy0VA%3D%3D']);
        // set_isImageView(true);
        set_isImgShow(true);
        set_isDetailsView(true);
        set_imgURL(item.imagePath);
        getImageDimensions(item.imagePath);
    };

    const textBoxTouchAction = () => {
        set_isImgShow(false);
        set_isDetailsView(false);
        set_imgURL(undefined);
        set_descriptionText(undefined);
    }

    const enterValue = async (item,index,value) => {

        const validated = value.match(/^(\d*\.{0,1}\d{0,2}$)/);
        if(validated){

            let val = value;
            let temp = await deleteValue(dataArray,dataArray[index].imageScoringDetailsId);

            let tempObj = {
                "description": props.scoreObj.scoringScaleDetails[index].description,
                "imageLabel": props.scoreObj.scoringScaleDetails[index].imageLabel,
                "imagePath": props.scoreObj.scoringScaleDetails[index].imagePath,
                "imageScoringDetailsId": props.scoreObj.scoringScaleDetails[index].imageScoringDetailsId,
                "txtValue" : val,
                "unitName":props.scoreObj.scoringScaleDetails[index].unitName
            };

            let temp1 = addValueAfter(temp,index,tempObj);
            set_dataArray(temp1);

            for (let i = 0; i < temp1.length; i++){
                if (temp1[i].txtValue && temp1[i].txtValue!==''){
                    set_enableBtn(true)
                } else {
                    set_enableBtn(false);
                    return;
                }
            }
        }
    };

    const deleteValue = async (tempArray,id) => {
        let tempArray1 = tempArray;
        const tasks = tempArray1.filter(task => task.imageScoringDetailsId !== id);
        let temp = tasks;
        return temp;
    };

    function addValueAfter(array, index, updateObjervations) {
        return [
            ...array.slice(0, index),
            updateObjervations,
            ...array.slice(index)
        ];
    };

    const getImageDimensions = (url) => {
 
        Image.getSize(url, (Width, Height) => {
          set_imgWidth(Width);     
          set_imgHeight(Height);
        }, (errorMsg) => {
        });
     
      }
     

    const _renderItems = () => {

        if(dataArray) {

            return dataArray.map((item,index) => {

                return (

                    <View>

                        <TouchableOpacity disabled={clasificationId === 2 ? true : false} onPress={() => selectImageAction(index, item)}>
        
                            <View style={{borderBottomWidth:5,borderBottomColor:'white',backgroundColor: index % 2 ? "#EDF6EE" : "#F3F8E9", minHeight: clasificationId === 2 ? hp('20%') : hp('15%')}}>
        
                                <View style={[styles.dogStyle]}>
            
                                    {clasificationId !== 2 ? <View style={Platform.isPad ? [styles.cellSubViewStyle1,{height: hp('20%')}] : [styles.cellSubViewStyle1]}>
            
                                        {item.score ? <View style={[styles.numTxtStyle]}>
                                            <Text style={[styles.scoreTextStyle]}>{item.score}</Text>
                                        </View> : null}

                                        {clasificationId !== 2 ? <View style={[styles.cellSubViewStyle4]}>
                                            <Image style={styles.btnSelectStyle} source={selectedIndex === index ? require("./../../../assets/images/scoreImages/eRadioSelected.svg") : require("./../../../assets/images/scoreImages/eRadioUnSel.svg")}></Image>
                                        </View> : null}
            
                                    </View> : null}
            
                                    <View style={[styles.cellSubViewStyle2,{marginLeft : clasificationId === 2 ? wp('5%') : wp('0%')}]}>
                                        <Text style={[styles.descTxtStyle]}>{item.description && item.description.length > 70 ? item.description.slice(0, 70) + '..' : item.description}</Text>
                                        <TouchableOpacity style={{flexDirection:'row'}} onPress={() => { selectAlertAction(index, item) }}>
                                                <Text style={[styles.moreDetailsTextStyle,{textDecorationLine: 'underline'}]}>{'More details'}</Text>
                                                <Text style={[styles.moreDetailsTextStyle,]}>{'..'}</Text>
                                        </TouchableOpacity>
                                        <Text style={[styles.bodyTxtStyle, { textTransform: 'uppercase' }]}>{item.imageLabel && item.imageLabel.length > 15 ? item.imageLabel.slice(0, 15) + '..' : item.imageLabel}</Text>
                                    </View>
            
                                   {item && item.imagePath&& item.imagePath !== '' ? <TouchableOpacity onPress={() => { imageViewBtnAction(index, item)}}>
                                        <View style={[styles.cellSubViewStyle3]}>
                                            {imgLoader ? <View style={styles.scoringImgStyle}><ActivityIndicator size = "small" color = "red" /></View> :
                                                <ImageBackground onLoadStart={() => set_imgLoader(false)} onLoadEnd={() => { set_imgLoader(false)}} style={styles.scoringImgStyle} imageStyle={{ borderRadius: 5 }} source={{ uri: item.imagePath }}>
                                                    <View style={{width:wp('25%'),height:hp('2.5%'),backgroundColor:'#70A7A0',alignItems:'center',justifyContent:'center'}}>
                                                        <Text style={[styles.viewTextStyle,{color:'white'}]}>{'VIEW'}</Text>
                                                    </View>
                                                </ImageBackground>}
                                        </View>
                                    </TouchableOpacity> : null}
            
                                </View>
            
                                {clasificationId === 2 ? <View style={[styles.cellSubViewStyle5]}>
            
                                    <View style={{flex:2,height: hp('6%'),}}>
                                        <TextInput style={CommonStyles.textInputStyle}
                                            underlineColorAndroid="transparent"
                                            placeholder="Enter value here*"
                                            placeholderTextColor="#7F7F81"
                                            autoCapitalize="none"
                                            value = {item.txtValue}
                                            keyboardType = {'numeric'}
                                            onTouchStart={()=>  textBoxTouchAction()}
                                            onChangeText={(value) => {enterValue(item,index,value)}}
                                        />
                                    </View>
            
                                    <View style={{flex:1,height: hp('4%'),alignItems:'center',justifyContent:'center',backgroundColor:'#EAEAEA',}}>
                                        <Text style={[styles.scoreTextStyle]}>{item.unitName}</Text>   
                                    </View>
            
                                </View> :null}
        
                            </View>
                        </TouchableOpacity>
                </View>
            )
            });
        }
    };

    return (

        <View style={[CommonStyles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView, {}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={title}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ width: wp('100%'), height: hp('75%'), alignItems: 'center'}}>

                <View style={{ marginTop: hp('2%'), width: wp('90%') }}>
                    <Text style={[styles.headerTextStyle]}>{scoringName}</Text>
                    <Text style={[styles.subHeaderTextStyle]}>{"Please select your pet's " + title}</Text>
                </View>

                <KeyboardAwareScrollView>
                    <View style={{ marginTop: hp('2%'), marginBottom: hp('6%') }}>
                        {_renderItems()}
                    </View>
                </KeyboardAwareScrollView>
                    
            </View>

            {!isDetailsView ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={clasificationId===2 ? "SUBMIT" : 'NEXT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable={true}
                    rigthBtnState={enableBtn ? true : false}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}
                    leftButtonAction={async () => backBtnAction()}
                />
            </View> : null}

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={props.popupAlert}
                    message={popUpMessage}
                    isLeftBtnEnable={false}
                    isRightBtnEnable={true}
                    leftBtnTilte={'NO'}
                    rightBtnTilte={"OK"}
                    popUpRightBtnAction={() => popOkBtnAction()}
                // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isDetailsView ? <View style={isImgShow ? [styles.popSearchViewStyle,{height: Platform.isPad ? hp('60%') : hp('50%')}] : [styles.popSearchViewStyle]}>

            {!isImgShow ? <View style={{ width: wp('85%'), height: hp('8%'), alignItems: 'flex-end', marginTop: hp('2%') }}>

                <View style={{flexDirection:'row',justifyContent:'space-between',width: wp('85%')}}>
                    <Text style={[styles.detailsTxtStyle, { textTransform: 'uppercase' }]}>{imgLabelText}</Text>
                    <TouchableOpacity onPress={() => set_isDetailsView(false)}>
                        <Image style={styles.closeBtnStyle} source={require("./../../../assets/images/otherImages/png/xImg.png")}></Image>
                    </TouchableOpacity>
                </View>
                
                <View style={{ width: wp('85%'), minHeight: hp('15%'), justifyContent: 'center', marginTop: hp('1%') }}>
                    <ScrollView>
                        <Text style={styles.detailsSubTxtStyle}>{descriptionText}</Text>
                    </ScrollView>
                </View>
                
            </View> : 
            <View style={{ width: wp('85%'), height: hp('8%'), marginTop: hp('1%')}}>
                <TouchableOpacity style={{alignSelf:'flex-end'}} onPress={() => set_isDetailsView(false)}>
                    <Image style={styles.closeBtnStyle} source={require("./../../../assets/images/otherImages/png/xImg.png")}></Image>
                </TouchableOpacity>

                {/* <ScrollView > */}
                <View style={{alignSelf:'center',}}>
                    <ImageBackground style={{width:wp('90%'),height:hp('40%'), borderRadius: 5,marginBottom: hp('5%') }} resizeMode='contain' source={{ uri: imgURl }}></ImageBackground>
                </View>
                {/* </ScrollView> */}

                
            </View>}
            </View> : null}

            {isImageView ? <ImageView style = {styles.videoViewStyle}
                images={images}
                imageIndex={0}
                visible={isImageView}
                onRequestClose={() => set_isImageView(false)}
            /> : null}

            {isLoading === true ? <LoaderComponent isLoader={false} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

        </View>
    );
}

export default ImageScoringMainUI;

const styles = StyleSheet.create({

    headerTextStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontNormal,
        textAlign: "left",
        color: "black",
    },

    subHeaderTextStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        textAlign: "left",
        color: "black",
        marginTop: hp('1%'),
    },

    dogStyle: {
        width: wp('90%'),
        minHeight: hp('15%'),
        alignItems: 'center',
        flexDirection: 'row'
    },

    popSearchViewStyle: {
        height: hp("30%"),
        width: wp("100%"),
        backgroundColor: '#70A7A0',
        bottom: 0,
        position: 'absolute',
        alignSelf: 'center',
        alignItems: "center",
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
    },

    closeBtnStyle: {
        width: wp('4%'),
        height: hp('3%'),
        resizeMode: 'contain',
        tintColor: 'white'
    },

    cellSubViewStyle1: {
        height: hp('15%'),
        flex: 0.8,
        justifyContent: 'center',
        alignItems: 'center'
    },

    cellSubViewStyle2: {
        minHeight: hp('15%'),
        flex: 2.5,
        justifyContent: 'center',
    },

    cellSubViewStyle3: {
        height: hp('15%'),
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',  
        marginRight: wp('2%'),     
    },

    cellSubViewStyle4: {
        height: hp('15%'),
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',       
    },

    cellSubViewStyle5: {
        height: hp('4%'),
        width: wp('50%'),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'white',
        marginLeft: wp('4%'),
        marginTop: wp('-2%'),
        marginBottom: wp('1%'),
        flexDirection:'row',
        borderWidth:1,
        borderRadius:5,
        borderColor:'#EAEAEA'
    },

    btnSelectStyle: {
        width: wp('5%'),
        height: hp('3%'),
        resizeMode: 'contain',
        margin: 10
    },

    numTxtStyle: {
        width: wp('5%'),
        aspectRatio: 1,
        alignSelf: 'center',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
        flex:0.5
    },

    scoreTextStyle: {
        ...CommonStyles.textStyleExtraBold,
        fontSize: fonts.fontMedium,
        color: "black",
    },

    viewTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontXSmall,
        color: "white",
    },

    descTxtStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontXSmall,
        color: "black",
        marginTop: hp('1%'),
        marginRight: wp('1%'),
    },

    bodyTxtStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXSmall,
        color: "black",
        marginTop: hp('1%'),
        marginBottom: hp('2%'),
    },

    detailsBtnStyle: {
        width: wp('5%'),
        height: hp('5%'),
        resizeMode: 'contain',
    },

    detailsTxtStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontNormal,
        color: "white",
        marginBottom: hp('1%'),
    },

    detailsSubTxtStyle: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        color: "white",
        marginTop: hp('2%'),
    },

    scoringImgStyle: {
        width: wp('25%'),
        aspectRatio: 1,
        resizeMode: 'contain',
        justifyContent:'flex-end'
    },

    moreDetailsTextStyle : {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontXSmall,
        color: "black",
        marginTop: hp('1%'),
    }

});
