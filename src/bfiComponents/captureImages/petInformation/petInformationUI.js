import moment from 'moment';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, BackHandler,ScrollView } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import fonts from '../../../utils/commonStyles/fonts';

const PetInformationUI = ({ navigation, route, ...props }) => {

    // Android Physical back button action
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

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const nextButtonAction = () => {
        props.nextButtonAction();
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
                    title={'Pet Information'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>
            <ScrollView>
            <View style={styles.middleViewStyle}>

                <View style={{ marginTop: hp('2%'), marginLeft: wp('5%') }}>
                    <Text style={CommonStyles.headerTextStyle1}>{'Pet Info'}</Text>
                </View>

                <View style={{ alignItems: 'center', marginBottom: hp('5%') }}>
                    <View style={styles.dataViewStyle}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp('80%'), }}>
                            <Text style={styles.labelTextStyles}>{'Pet Name'}</Text>
                            <Text style={styles.selectedDataTextStyles}>{props.petObj ? props.petObj.petName : null}</Text>
                        </View>

                    </View>

                    <View style={styles.dataViewStyle}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp('80%'), }}>
                            <Text style={styles.labelTextStyles}>{'Gender'}</Text>
                            <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.gender ? props.petObj.gender : '--'}</Text>
                        </View>
                    </View>

                    <View style={styles.dataViewStyle}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp('80%'), }}>
                            <Text style={styles.labelTextStyles}>{'Date of birth'}</Text>
                            <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.birthday ? (props.petObj.birthday ? moment(new Date(props.petObj.birthday)).format("MM-DD-YYYY") : '--') : '--'}</Text>
                        </View>
                    </View>

                    <View style={styles.dataViewStyle}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp('80%'), }}>
                            <Text style={styles.labelTextStyles}>{'Breed'}</Text>
                            <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.petBreed ? props.petObj.petBreed : '--'}</Text>
                        </View>
                    </View>

                    <View style={styles.dataViewStyle}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp('80%'), }}>
                            <Text style={styles.labelTextStyles}>{'Weight'}</Text>
                            <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.weight ? props.petObj.weight + (props.petObj.weightUnit ? ' ' + props.petObj.weightUnit : '') : '--'}</Text>
                        </View>
                    </View>

                    <View style={styles.dataViewStyle}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp('80%'), }}>
                            <Text style={styles.labelTextStyles}>{'Food Brand'}</Text>
                            <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.brandName ? props.petObj.brandName : '--'}</Text>
                        </View>
                    </View>

                    <View style={styles.dataViewStyle}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp('80%'), }}>
                            <Text style={styles.labelTextStyles}>{'Food Quantity'}</Text>
                            <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.foodIntake ? props.petObj.foodIntake + " " + (props.petObj.feedUnit === 1 ? "Cups" : "Grams") : '--'}</Text>
                        </View>
                    </View>

                </View>


                <View style={{ marginLeft: wp('6%') }}>
                    <Text style={CommonStyles.headerTextStyle1}>{'Pet parent info'}</Text>
                </View>
                <View style={{ alignItems: 'center', marginBottom: hp('18%') }}>
                    <View style={styles.dataViewStyle}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp('80%'), }}>
                            <Text style={styles.labelTextStyles}>{'Name'}</Text>
                            <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.petParentName ? props.petObj.petParentName : '--'}</Text>
                        </View>
                    </View>

                    <View style={styles.dataViewStyle}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp('80%'), }}>
                            <Text style={styles.labelTextStyles}>{'Email'}</Text>
                            <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.petParentEmail ? props.petObj.petParentEmail : '--'}</Text>
                        </View>
                    </View>
                </View>

            </View>
            </ScrollView>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'NEXT'}
                    isLeftBtnEnable={false}
                    rigthBtnState={true}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}
                />
            </View>
        </View>
    );
}

export default PetInformationUI;

const styles = StyleSheet.create({

    middleViewStyle: {
        flex: 1,
    },

    imageStyles: {
        width: wp('100%'),
        height: hp('30%'),
        resizeMode: 'cover',
        justifyContent: 'flex-end',
    },

    dataViewStyle: {
        minHeight: hp('6%'),
        width: wp('90%'),
        marginTop: hp("2%"),
        borderRadius: 5,
        borderColor: '#EAEAEA',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    labelTextStyles: {
        ...CommonStyles.textStyleMedium,
        fontSize: fonts.fontMedium,
        color: 'black',
        flex: 1,
        alignSelf: 'center'
    },

    selectedDataTextStyles: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        color: 'black',
        flex: 1.5,
        textAlign: 'right'
    },

    flatview: {
        height: hp("8%"),
        alignSelf: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width: wp('90%'),
        alignItems: 'center',
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
    },

    popSearchViewStyle: {
        height: hp("30%"),
        width: wp("95%"),
        backgroundColor: '#DCDCDC',
        bottom: 0,
        position: 'absolute',
        alignSelf: 'center',
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
    },

    viewImgview: {
        height: hp("3.5%"),
        width: wp("25%"),
        justifyContent: "center",
        backgroundColor: "#cbe8b0",
        alignItems: 'center',
        alignSelf: 'flex-end',
        borderRadius: 5,
        marginRight: wp("1%"),
    },

});