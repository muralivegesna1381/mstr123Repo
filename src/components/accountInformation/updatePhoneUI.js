import React, { useEffect, useState, useRef } from 'react';
import { FlatList, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import AlertComponent from '../../utils/commonComponents/alertComponent';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import TextInputComponent from '../../utils/commonComponents/textInputComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import fonts from '../../utils/commonStyles/fonts';
import * as Constant from "../../utils/constants/constant";
import Fonts from './../../utils/commonStyles/fonts';

import DownArrowImg from "./../../../assets/images/otherImages/svg/downArrowGrey.svg";
import SearchImg from "./../../../assets/images/otherImages/svg/searchIcon.svg";
let xImg = require('./../../../assets/images/otherImages/png/xImg.png');


const UpdatePhoneUI = ({ route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popAlert, set_popAlert] = useState(undefined);
    const [phnNo, set_phNo] = useState(undefined);
    const [isDropdown, set_isDropdown] = useState(false);
    const [isSearchView, set_isSearchView] = useState(false);
    const [searchText, set_searchText] = useState(undefined);
    const [countryISDCodes, set_countryISDCodes] = useState(undefined);
    const [filteredData, setFilteredData] = useState([]);
    const [isdCode, set_isdCode] = useState(undefined);
    const [isdCodeID, set_isdCodeID] = useState(undefined);
    const isdCodeUseRef = useRef(undefined)

    // Setting the Existing valuse from component class
    useEffect(() => {
        if (props.phnNo) {
            let ph = (props.phnNo).replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, '');
            if (ph && ph.length > 10) {
                if (ph.length > 11) {
                    set_phNo(ph.substring(2, 12));
                } else {
                    set_phNo(ph.substring(1, 11));
                }
            } else {
                set_phNo(ph);
            }
        }

        if (props.countryISDCodes) {
            set_countryISDCodes(props.countryISDCodes)
            setFilteredData(props.countryISDCodes);
        }

        if (props.isdCode) {
            set_isdCode(props.isdCode)
        }
        if (props.isdCodeId) {
            set_isdCodeID(props.isdCodeId)
            isdCodeUseRef.current = props.isdCodeId
        }

    }, [props.phnNo, props.countryISDCodes, props.isdCode, props.isdCodeId]);


    // Updates the Popup alert values
    useEffect(() => {
        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popAlert(props.popAlert);
    }, [props.popUpMessage, props.isPopUp, props.popAlert, props.isLoading]);

    // Navigation to previous screen
    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    // Initiates the service call to update the User Phone number and country code
    const rightButtonAction = async () => {
        props.UpdateAction(phnNo, isdCode, isdCodeID);
    };

    // Popup btn actions
    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    // setting the Phonenumber
    const setPhoneNumber = (value) => {
        set_phNo(value);
    };

    // setting country code
    const actionOnRow = (item) => {
        set_isSearchView(false);
        set_isdCodeID(item.isdCodeId)
        isdCodeUseRef.current = item.isdCodeId
        set_isdCode(item.code)
    };

    const searchFilterFunction = (text) => {
        set_searchText(text);
        if (text) {
            const filtered = countryISDCodes?.filter(item =>
                item.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(countryISDCodes);
        }
    };

    const onCancelSearch = async () => {
        set_searchText(undefined);
        searchFilterFunction("");
        setFilteredData(countryISDCodes);
        Keyboard.dismiss();
    };
    const onCancel = () => {
        Keyboard.dismiss();
        set_searchText(undefined);
        set_isSearchView(false);
        setFilteredData(countryISDCodes);
    };


    return (
        <View style={[styles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView, {}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Update Phone'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <KeyboardAwareScrollView>

                <View style={{ alignItems: 'center', justifyContent: 'center', height: hp('70%'), width: wp('80%'), flexDirection: 'row', alignSelf: 'center' }} >

                    <View>

                        <TouchableOpacity style={styles.cBtnStyle} onPress={() => {
                            //set_isDropdown(!isDropdown)
                            set_isSearchView(true)
                        }}>
                            <Text style={styles.cTextStyle}>{isdCode}</Text>
                            <DownArrowImg width={wp('4%')} height={hp('4%')} style={styles.downArrowStyle} />
                        </TouchableOpacity>

                    </View>

                    <View>
                        <TextInputComponent
                            inputText={phnNo}
                            labelText={'Phone*'}
                            isEditable={true}
                            widthValue={wp('60%')}
                            keyboardType="numeric"
                            maxLengthVal={10}
                            setValue={(textAnswer) => {
                                setPhoneNumber(textAnswer);
                            }}
                        />
                    </View>

                </View>

            </KeyboardAwareScrollView>

            {!isDropdown ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'SUBMIT'}
                    leftBtnTitle={''}
                    rigthBtnState={phnNo && phnNo.length > 9 && isdCodeUseRef.current ? true : false}
                    isLeftBtnEnable={false}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => rightButtonAction()}

                ></BottomComponent>
            </View> : null}

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={props.popAlert}
                    message={props.popUpMessage}
                    isLeftBtnEnable={false}
                    isRightBtnEnable={true}
                    leftBtnTilte={'Cancel'}
                    rightBtnTilte={'OK'}
                    popUpRightBtnAction={() => popOkBtnAction()}
                />
            </View> : null}

            {props.isLoading === true ? <LoaderComponent isLoader={true} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

            {isSearchView ? <View style={styles.popPhoneSearchViewStyle}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: wp('100%'), alignSelf: 'center' }}>
                    <View style={styles.topView}>
                        <SearchImg width={wp('3%')} height={hp('3%')} style={styles.searchImageStyle} />
                        <TextInput
                            style={styles.textInputStyle}
                            onChangeText={(text) => searchFilterFunction(text)}
                            value={searchText}
                            underlineColorAndroid="transparent"
                            placeholder="Search here"
                            returnKeyLabel="Search"
                            returnKeyType="search"
                            onSubmitEditing={Keyboard.dismiss}
                        />
                        {searchText && searchText.length > 0 ? <TouchableOpacity onPress={onCancelSearch} style={styles.topButtonView} >
                            <Text style={[styles.name, { color: "black", }]} > {"CLEAR"}</Text>
                        </TouchableOpacity> : null}
                    </View>
                    <TouchableOpacity onPress={onCancel} style={[styles.topButtonView, { marginLeft: wp('2%') }]} >
                        <Image source={xImg} style={styles.xImageStyle} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    style={styles.flatcontainer}
                    data={filteredData}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => actionOnRow(item)}>
                            <View style={styles.flatview}>
                                <Text style={[styles.name, { flex: 1 }]} numberOfLines={2}>{item.name}</Text>
                                <Text style={[styles.name, { flex: 0.3 }]} numberOfLines={2}>{item.countryCode}</Text>
                                <Text style={[styles.name, { flex: 0.4 }]} numberOfLines={2}>{`[${item.code}]`}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    enableEmptySections={true}
                    keyExtractor={(item) => item.brandName}
                />

            </View> : null}
        </View>
    );
}

export default UpdatePhoneUI;

const styles = StyleSheet.create({

    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white'
    },

    downArrowStyle: {
        resizeMode: 'contain',
        tintColor: '#707070',
        marginLeft: wp('1.5%'),
    },

    cBtnStyle: {
        backgroundColor: '#EAEAEA',
        height: hp('8%'),
        width: wp('20%'),
        borderRadius: wp('1%'),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },

    cTextStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: Fonts.fontNormal,
        color: '#7F7F81',
    },

    flatcontainer: {
        flex: 1,
    },

    flatview: {
        height: hp("8%"),
        marginBottom: hp("0.3%"),
        alignSelf: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width: wp('90%'),
        alignItems: 'center',
        flexDirection: 'row',
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontXMedium,
        textAlign: "left",
        color: "black",
    },

    popPhoneSearchViewStyle: {
        height: hp("85%"),
        width: wp("100%"),
        backgroundColor: '#DCDCDC',
        bottom: 0,
        position: 'absolute',
        alignSelf: 'center',
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        alignItems: "center",
    },


    topView: {
        height: hp("5%"),
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: 'white',
        marginTop: hp("2%"),
        marginBottom: hp("2%"),
        width: wp("80%"),
        borderRadius: 10,
        justifyContent: 'space-between'
    },
    searchImageStyle: {
        height: hp("2%"),
        width: wp("2%"),
        flex: 0.2,
        resizeMode: 'contain',
        marginLeft: hp("2%"),
    },
    textInputStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontMedium,
        flex: 2.5,
        marginLeft: hp("2%"),
        marginRight: hp("2%"),
        height: hp("5%"),
        color: "black",
    },
    topButtonView: {
        alignContent: "center",
        justifyContent: "center",
        height: hp("5%"),
        marginRight: hp("2%"),
    },
    xImageStyle: {
        width: wp("8%"),
        height: wp("8%"),
        resizeMode: "contain",
    },
    detailsContainer: {
        flexDirection: 'row', // Align items in a row
        justifyContent: 'space-between', // Space between items
    },

});