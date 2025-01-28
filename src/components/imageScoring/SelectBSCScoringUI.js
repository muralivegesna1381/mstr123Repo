import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant"
import AlertComponent from '../../utils/commonComponents/alertComponent';

import RightArrowImg from "./../../../assets/images/otherImages/svg/rightArrowLightImg.svg";
import BFIDogImg from "./../../../assets/images/scoreImages/bfiDogImgIcon.svg";
import BCSDogImg from "./../../../assets/images/scoreImages/bcsDogIcon.svg";
import StoolDogImg from "./../../../assets/images/scoreImages/stollDogScoringIcon.svg";
import HWPDogImg from "./../../../assets/images/scoreImages/hwpDogIcon.svg";
import BFICatImg from "./../../../assets/images/scoreImages/bfiCatImgIcon.svg";
import BCSCatImg from "./../../../assets/images/scoreImages/bcsCatIcon.svg";
import StoolCatImg from "./../../../assets/images/scoreImages/stollCatScoringIcon.svg";
import HWPCatImg from "./../../../assets/images/scoreImages/hwpCatIcon.svg";

const SelectBSCScoringUI = ({ route, ...props }) => {

    const [scoringArray, set_scoringArray] = useState([]);
    const [scoreObj, set_scoreObj] = useState(undefined);

    useEffect(() => {
        set_scoringArray(props.scoringArray);
    }, [props.scoringArray]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    }

    const selectActivityAction = (item, index) => {
        set_scoreObj(item);
        props.selectActivityAction(item, index);
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const renderItem = ({ item, index }) => {
        return (
            <View>

                <TouchableOpacity onPress={() => selectActivityAction(item, index, item.scoringType)}>

                    <View style={[styles.cellBckView]}>

                        {item.scoringTypeId === 1 ? 
                            (props.defaultPetObj && props.defaultPetObj.speciesId && parseInt(props.defaultPetObj.speciesId) === 1 ? <BCSDogImg style= {[styles.leftImgIconStyle]}/> : <BCSCatImg style= {[styles.leftImgIconStyle]}/>) : 
                            (item.scoringTypeId === 2 ? (props.defaultPetObj && props.defaultPetObj.speciesId && parseInt(props.defaultPetObj.speciesId) === 1 ? <BFIDogImg style= {[styles.leftImgIconStyle]}/> : <BFICatImg style= {[styles.leftImgIconStyle]}/>)
                             : (item.scoringTypeId === 3 ? (props.defaultPetObj && props.defaultPetObj.speciesId && parseInt(props.defaultPetObj.speciesId) === 1 ? <StoolDogImg style= {[styles.leftImgIconStyle]}/> : <StoolCatImg style= {[styles.leftImgIconStyle]}/>)
                              : (props.defaultPetObj && props.defaultPetObj.speciesId && parseInt(props.defaultPetObj.speciesId) === 1 ? <HWPDogImg style= {[styles.leftImgIconStyle]}/> : <HWPCatImg style= {[styles.leftImgIconStyle]}/>)))}
                        <View style={{ flex: 5, }}>
                            <Text style={[styles.headerTextStyle]}>{item.imageScaleName}</Text>
                            <Text style={[styles.subHeaderTextStyle]}>{item.scoringType}</Text>
                        </View>

                        <RightArrowImg style={styles.arrowImgStyels}/>

                    </View>

                </TouchableOpacity>

            </View>
        );
    };

    return (
        <View style={[styles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Image Based Scoring'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ height: hp('85%'), width: wp('90%'), alignSelf: 'center' , }}>

                <View style={{ alignItems: 'center', justifyContent: 'space-between' }}>

                    <View style={{ marginTop: hp('5%') }}>

                       {scoringArray && scoringArray.length > 0 ? <FlatList
                            data={scoringArray}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => "" + index}
                        /> : (props.isLoading === false ? <View style={{justifyContent:'center',alignItems:'center',height:hp('58%')}}>
                            <Text style={CommonStyles.noRecordsTextStyle}>{"You're all caught up!"}</Text>
                            <Text style={[styles.noRecordsTextStyle1]}>{'Please visit this space regularly to answer the image-based questions.'}</Text>
                        </View> : null)}

                    </View>
                </View>
            </View>

            {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={props.popupAlert}
                    message={props.popupMsg}
                    isLeftBtnEnable={false}
                    isRightBtnEnable={true}
                    leftBtnTilte={'NO'}
                    rightBtnTilte={"OK"}
                    popUpRightBtnAction={() => popOkBtnAction()}
                />
            </View> : null}

            {props.isLoading === true ? <LoaderComponent isLoader={false} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

        </View>
    );
}

export default SelectBSCScoringUI;

const styles = StyleSheet.create({

    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white'
    },

    headerTextStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        color: 'black',
        marginLeft: hp("2%"),
    },

    subHeaderTextStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXSmall,
        color: 'black',
        marginLeft: hp("2%"),
        opacity: 0.6,
        marginTop: hp("1%")
    },

    leftImgIconStyle : {
        width: wp("15%"),
        aspectRatio: 1,
        resizeMode:'contain',
        marginLeft: hp("1%"),
    },

    cellBckView: {
        width: wp('85%'),
        height: hp('10%'),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        marginBottom: hp("2%"),
        marginRight: hp("1%"),
        marginLeft: hp("1%"),
        borderRadius: 5,
        flexDirection: 'row'
    },

    arrowImgStyels: {
        height: hp("2%"),
        width: wp("2%"),
        resizeMode: "contain",
        overflow: "hidden",
        flex: 1
    },

    noRecordsTextStyle1 : {
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-Regular',
        color: 'black', 
        marginTop:hp('1%'),
        textAlign:'center'
    },

});