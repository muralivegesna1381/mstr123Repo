import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import AlertComponent from '../../utils/commonComponents/alertComponent';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import TextInputComponent from '../../utils/commonComponents/textInputComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import Fonts from '../../utils/commonStyles/fonts';
import * as Constant from "./../../utils/constants/constant";

import DownArrowImg from "./../../../assets/images/otherImages/svg/downArrowGrey.svg";
import SearchImg from "./../../../assets/images/otherImages/svg/searchIcon.svg";
let xImg = require('./../../../assets/images/otherImages/png/xImg.png');

const RegisterAccountUi = ({ route, ...props }) => {

    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);
    const [firstName, set_firstName] = useState('');
    const [secondName, set_secondName] = useState('');
    const [primaryEmail, set_primaryEmail] = useState('');
    const [secondaryEmail, set_secondaryEmail] = useState('');
    const [phNumber, set_phNumber] = useState('');
    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isDropdown, set_isDropdown] = useState(false);
    // const [countryCode, set_countryCode] = useState('+1');
    const [enableNotiUI, set_enableNotiUI] = useState(false);
    const [isSearchView, set_isSearchView] = useState(false);
    const [searchText, set_searchText] = useState(undefined);
    const [countryISDCodes, set_countryISDCodes] = useState(undefined);
    const [filteredData, setFilteredData] = useState([]);
    const [isdCodeID, set_isdCodeID] = useState(undefined);
    const [isdCode, set_isdCode] = useState('');
    const isdCodeUseRef = useRef(undefined)

    /**
     * setting values to local variables
     */
    useEffect(() => {

        set_firstName(props.firstName);
        set_secondName(props.secondName);
        set_isLoading(props.isLoading);
        set_popUpMessage(props.popUpMessage);
        set_isPopUp(props.isPopUp);

    }, [props.firstName, props.secondName, props.isLoading, props.popUpMessage, props.isPopUp]);

    useEffect(() => {
        if (props.countryISDCodes) {
            set_countryISDCodes(props.countryISDCodes)
            setFilteredData(props.countryISDCodes);

            // Find the object with code +1 to set as default
            const result = props.countryISDCodes.find(item => item.countryCode === 'USA');
            if (result) {
                set_isdCode(result.code)
                set_isdCodeID(result.isdCodeId)
                isdCodeUseRef.current = result.isdCodeId
            }
        }

    }, [props.countryISDCodes]);


    /**
     * When Pet parent submit the details, these details will be sent to Component class
     */
    const nextButtonAction = () => {

        let phoneTemp = phNumber.replace(/\D/g, "");
        let phoneTemp1 = phoneTemp.substring(0, 3);
        phoneTemp1 = "(" + phoneTemp1 + ")";
        let phoneTemp2 = phoneTemp.substring(3, 6);
        let phoneTemp3 = phoneTemp.substring(6, phoneTemp.length);
        phoneTemp3 = "-" + phoneTemp3;
        // props.submitAction(primaryEmail,countryCode + phoneTemp1 + phoneTemp2 + phoneTemp3,firstName,secondName,secondaryEmail,isNotification);
        props.submitAction(primaryEmail, phoneTemp1 + phoneTemp2 + phoneTemp3, firstName, secondName, secondaryEmail, enableNotiUI, isdCodeID);
    };

    // When user clicks on backbutton, navigates to previous screen
    const backBtnAction = () => {
        props.navigateToPrevious();
    }

    /**
     * @param {*} email 
     * This will check the email formate.
     * When valid, next button will enable
     * Checks phone number length, should be 10.
     * When valid, saves the user entered email for backend validation
     */
    const validateEmail = (email, val) => {

        var emailValid = /\S+@\S+\.\S+/;

        if (val === 'primary') {
            set_primaryEmail(email.replace(/ /g, ''));
            if (email === secondaryEmail) {
                set_isNxtBtnEnable(false);
                return;
            }
        } else if (val === 'secondary') {
            set_secondaryEmail(email.replace(/ /g, ''));
            if (emailValid.test(email.replace(/ /g, ''))) {
                set_enableNotiUI(true);
            } else {
                set_enableNotiUI(false);
            }

            if ((email.length < 1 || (email.length > 1 && emailValid && emailValid.test(email.replace(/ /g, '')) && phNumber.length > 9 && primaryEmail !== email))) {
                set_isNxtBtnEnable(true);
                return;
            } else {
                set_isNxtBtnEnable(false);
                return;
            }
        }

        if (emailValid.test(email.replace(/ /g, '')) && phNumber.length > 9 && isdCodeUseRef.current) {
            set_isNxtBtnEnable(true);
        } else {
            set_isNxtBtnEnable(false);
        }

    }

    const validatePhone = (phNumber) => {
        set_phNumber(phNumber);
        var emailValid = /\S+@\S+\.\S+/;
        if (emailValid.test(primaryEmail) && phNumber.length > 9 && primaryEmail !== secondaryEmail && isdCodeUseRef.current) {
            set_isNxtBtnEnable(true);
        } else {
            set_isNxtBtnEnable(false);
        }
    }

    // setting country code
    const actionOnRow = (item) => {
        set_isSearchView(false);
        set_isdCodeID(item.isdCodeId)
        isdCodeUseRef.current = item.isdCodeId
        set_isdCode(item.code)

        validatePhone(phNumber)
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

    /**
     * This method triggers when user clicks on Popup Button.
     */
    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    }

    return (
        <View style={[CommonStyles.mainComponentStyle]}>

            <View style={CommonStyles.headerView}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Pet Parent Profile'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <KeyboardAwareScrollView>

                <View style={{ alignItems: 'center', justifyContent: 'center' }}>

                    <View style={{ marginTop: hp('5%'), width: wp('80%') }} >

                        <Text style={CommonStyles.headerTextStyle}>{'Hi,'}</Text>
                        <Text style={CommonStyles.headerTextStyle}>{firstName + ' ' + secondName}</Text>

                        <Text style={[CommonStyles.subHeaderTextStyle, { marginTop: hp('2%') }]}>{'Please enter your preferred Email ID and Mobile Number which shall be used for login and communication.'}</Text>

                        <View style={{ marginTop: hp('4%') }} >

                            <TextInputComponent
                                inputText={primaryEmail}
                                labelText={firstName + "'s " + "Primary Email*"}
                                isEditable={true}
                                maxLengthVal={50}
                                autoCapitalize={'none'}
                                setValue={(textAnswer) => {
                                    validateEmail(textAnswer, 'primary')
                                }}
                            />

                        </View>

                        <View style={{ marginTop: hp('4%') }} >

                            <TextInputComponent
                                inputText={secondaryEmail}
                                labelText={firstName + "'s " + "Secondary Email (Optional)"}
                                isEditable={true}
                                maxLengthVal={50}
                                autoCapitalize={'none'}
                                setValue={(textAnswer) => {
                                    validateEmail(textAnswer, 'secondary')
                                }}
                            />

                        </View>

                        {enableNotiUI ? <View style={{ marginTop: hp('2%') }}>
                            <Text style={styles.hintTextStyleEnable}>{'All the notifications will be sent to this email along with your primary email.'}</Text>
                        </View> : null}

                        <View style={{ marginTop: hp('2%'), flexDirection: 'row', width: wp('80%') }} >

                            <View>

                                <TouchableOpacity style={styles.cBtnStyle} onPress={() => { set_isSearchView(true) }}>
                                    <Text style={styles.cTextStyle}>{isdCode}</Text>
                                    <DownArrowImg style={styles.downArrowStyle} />
                                </TouchableOpacity>

                            </View>

                            <View style={{ width: wp("60%") }}>
                                <TextInputComponent
                                    inputText={phNumber}
                                    labelText={firstName + "'s " + "Phone*"}
                                    isEditable={true}
                                    widthValue={wp('60%')}
                                    maxLengthVal={10}
                                    keyboardType={'numeric'}
                                    autoCapitalize={false}
                                    setValue={(textAnswer) => {
                                        validatePhone(textAnswer)
                                    }}
                                />
                            </View>

                        </View>
                    </View>

                </View>
            </KeyboardAwareScrollView>

            {!isDropdown ? <View style={CommonStyles.bottomViewComponentStyle}>

                <BottomComponent
                    rightBtnTitle={'NEXT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable={true}
                    rigthBtnState={isNxtBtnEnable}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}
                    leftButtonAction={async () => backBtnAction()}
                />

            </View> : null}

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={'Alert'}
                    message={popUpMessage}
                    isLeftBtnEnable={false}
                    isRightBtnEnable={true}
                    leftBtnTilte={'Cancel'}
                    rightBtnTilte={'OK'}
                    popUpRightBtnAction={() => popOkBtnAction()}
                />
            </View> : null}

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

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

        </View>
    );
}

export default RegisterAccountUi;

const styles = StyleSheet.create({

    downArrowStyle: {
        width: wp('4%'),
        height: hp('4%'),
        resizeMode: 'contain',
        tintColor: '#707070',
        marginLeft: wp('2%'),
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
        fontSize: Fonts.fontMedium,
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

    hintTextStyleEnable: {
        fontSize: Fonts.fontXSmall,
        fontFamily: 'Barlow-Regular',
        color: 'black',
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
        fontSize: Fonts.fontMedium,
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