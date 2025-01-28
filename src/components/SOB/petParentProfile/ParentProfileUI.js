import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import TextInputComponent from '../../../utils/commonComponents/textInputComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import Fonts from '../../../utils/commonStyles/fonts';

import DownArrowImg from "../../../../assets/images/otherImages/svg/downArrowGrey.svg";

const ParentProfileUI = ({ route, ...props }) => {

    const [firstName, set_firstName] = useState('');
    const [secondName, set_secondName] = useState('');
    const [primaryEmail, set_primaryEmail] = useState('');
    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);
    const [countryCode, set_countryCode] = useState('+1');
    const [phNumber, set_phNumber] = useState('');
    const [isDropdown, set_isDropdown] = useState(false);

    const nextButtonAction = () => {
        props.submitAction(firstName, secondName, primaryEmail, phNumber);
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
    }

    const validateFirstName = (first) => {
        set_firstName(first);
        if (firstName.length > 0 && secondName.length > 0 && emailValid.test(primaryEmail.replace(/ /g, '')) && phNumber.length > 9) {
            set_isNxtBtnEnable(true);
        } else {
            set_isNxtBtnEnable(false);
        }
    }

    const validateSecondName = (second) => {
        set_secondName(second);
        if (firstName.length > 0 && secondName.length > 0 && emailValid.test(primaryEmail.replace(/ /g, '')) && phNumber.length > 9) {
            set_isNxtBtnEnable(true);
        } else {
            set_isNxtBtnEnable(false);
        }
    }

    const validateEmail = (email, val) => {
        var emailValid = /\S+@\S+\.\S+/;
        set_primaryEmail(email.replace(/ /g, ''));
        if (firstName.length > 0 && secondName.length > 0 && emailValid.test(primaryEmail.replace(/ /g, '')) && phNumber.length > 9) {
            set_isNxtBtnEnable(true);
        } else {
            set_isNxtBtnEnable(false);
        }
    }

    const validatePhone = (phNumber) => {
        set_phNumber(phNumber);
        var emailValid = /\S+@\S+\.\S+/;
        if (firstName.length > 0 && secondName.length > 0 && emailValid.test(primaryEmail.replace(/ /g, '')) && phNumber.length > 9) {
            set_isNxtBtnEnable(true);
        } else {
            set_isNxtBtnEnable(false);
        }
    }

    const actionOnRow = (item) => {
        set_countryCode(item);
        set_isDropdown(!isDropdown);
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
                    title={'Pet Parent Profile'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <KeyboardAwareScrollView>
                <View style={{ width: wp('100%'), height: hp('70%'), alignItems: 'center' }}>

                    <View style={{ width: wp('80%'), marginTop: hp('8%') }}>
                        <Text style={CommonStyles.headerTextStyle}>{'Let’s get to'}</Text>
                        <Text style={CommonStyles.headerTextStyle}>{'know about Pet Parent'}</Text>

                        <View style={{ marginTop: hp('4%') }} >
                            <TextInputComponent
                                inputText={firstName}
                                labelText={'First Name*'}
                                isEditable={true}
                                maxLengthVal={20}
                                autoCapitalize={'none'}
                                setValue={(textAnswer) => {
                                    validateFirstName(textAnswer)
                                }}
                            />
                        </View>

                        <View style={{ marginTop: hp('2%') }} >
                            <TextInputComponent
                                inputText={secondName}
                                labelText={'Last Name*'}
                                isEditable={firstName.length > 0 ? true : false}
                                maxLengthVal={20}
                                autoCapitalize={'none'}
                                setValue={(textAnswer) => {
                                    validateSecondName(textAnswer)
                                }}
                            />
                        </View>

                        <View style={{ marginTop: hp('2%') }} >
                            <TextInputComponent
                                inputText={primaryEmail}
                                labelText={"Primary Email*"}
                                isEditable={true}
                                maxLengthVal={50}
                                autoCapitalize={'none'}
                                setValue={(textAnswer) => {
                                    validateEmail(textAnswer, 'primary')
                                }}
                            />
                        </View>

                        <View style={{ marginTop: hp('2%'), flexDirection: 'row', width: wp('80%') }} >

                            <View>

                                <TouchableOpacity style={styles.cBtnStyle} onPress={() => { set_isDropdown(!isDropdown) }}>
                                    <Text style={styles.cTextStyle}>{countryCode}</Text>
                                    <DownArrowImg style={styles.downArrowStyle}/>
                                </TouchableOpacity>

                            </View>

                            <View style={{ width: wp("60%") }}>
                                <TextInputComponent
                                    inputText={phNumber}
                                    labelText={"Phone*"}
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
                        <Text style={CommonStyles.hintTextStyle}>{"Quick Note: Please enter the requested data accurately to link your pets to their parents. Mistakes can result in new records and syncing issues."}</Text>
                    </View>

                </View>
            </KeyboardAwareScrollView>

            {isDropdown ? <View style={[styles.popSearchViewStyle]}>
                <FlatList
                    style={styles.flatcontainer}
                    data={['+1', '+44']}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => actionOnRow(item)}>
                            <View style={styles.flatview}>
                                <Text numberOfLines={2} style={[styles.name]}>{item}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    enableEmptySections={true}
                    keyExtractor={(item, index) => index}
                />

            </View> : null}

            {!isDropdown ?
                <View style={CommonStyles.bottomViewComponentStyle}>
                    <BottomComponent
                        rightBtnTitle={'NEXT'}
                        leftBtnTitle={'BACK'}
                        isLeftBtnEnable={false}
                        rigthBtnState={isNxtBtnEnable}
                        isRightBtnEnable={true}
                        rightButtonAction={async () => nextButtonAction()}
                        leftButtonAction={async () => backBtnAction()}
                    />
                </View> : null}
        </View>
    );
}

export default ParentProfileUI;

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
        alignItems: 'center'
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontNormal,
        textAlign: "left",
        color: "black",
    },

    popSearchViewStyle: {
        height: hp("25%"),
        width: wp("95%"),
        backgroundColor: '#DCDCDC',
        bottom: 0,
        position: 'absolute',
        alignSelf: 'center',
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,

    },

    hintTextStyleEnable: {
        fontSize: Fonts.fontXSmall,
        fontFamily: 'Barlow-Regular',
        color: 'black',
    },

});