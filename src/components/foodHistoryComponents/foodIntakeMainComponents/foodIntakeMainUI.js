import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Platform } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as Constant from "../../../utils/constants/constant";
import LoaderComponent from '../../../utils/commonComponents/loaderComponent';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import DatePicker from 'react-native-date-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import moment from "moment";
import FoodHistoryComponent from './../foodHComponents/foodHistoryComponent'
import CalendarPicker from 'react-native-calendar-picker';

import RButtonImg from "./../../../../assets/images/otherImages/svg/right_Arrow.svg";
import CalenderButtonImg from "./../../../../assets/images/otherImages/svg/calender.svg";
import DropDownImg from "./../../../../assets/images/otherImages/svg/dropDownDate.svg";
import NoLogsDogImg from "./../../../../assets/images/dogImages/noRecordsDog.svg";
import NoLogsCatImg from "./../../../../assets/images/dogImages/noRecordsCat.svg";

const FoodIntakeMainUI = ({ route, ...props }) => {

    const [datePickerDate1, set_datePickerDate1] = useState(new Date());
    const [minimumDate, set_minimumDate] = useState(new Date('1900-01-01'));
    const [datePickerDate, set_datePickerDate] = useState(moment(new Date()).format('YYYY-MM-DD'));
    const [fCalenderSdate, set_fCalenderSdate] = useState(undefined);
    const [fCalenderedate, set_fCalenderedate] = useState(undefined);
    const minDate = new Date(2023, 1, 1);
    const maxDate = new Date(2050, 6, 3);
    const [selectedDietName, set_selectedDietName] = useState("");
    const [selectedDietId, set_selectedDietId] = useState(0);

    let fStartDate = useRef(undefined);
    let fEndDate = useRef(undefined)
//YYYY-MM-DD
    React.useEffect(() => {

        if (props.tabSelection && props.tabSelection === 1) {
            set_fCalenderedate(moment(new Date()).format('YYYY-MM-DD'))
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 6);
            set_fCalenderSdate(moment(new Date(lastWeek)).format('YYYY-MM-DD'))
        }
        
    }, [props.foodArray, props.datePickerDate, props.tabSelection]);

    // Next btn Action
    const nextButtonAction = () => {
        props.nextButtonAction();
    }

    // Back button Action
    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    // Popup Action
    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const dateSelectionAction = (date) => {
        props.dateSelectionAction(date);
    }

    const editAction = (item) => {
        props.editAction(item);
    };

    // Done btn action in Filter popup view
    const doneAction = (date) => {

        datePickerDate1 ? set_datePickerDate(moment(datePickerDate1).format('YYYY-MM-DD')) : set_datePickerDate(moment(new Date()).format('YYYY-MM-DD'));
        props.doneAction(datePickerDate1);
    };

    // Cancel action to dismiss the filter view
    const cancelAction = () => {
        props.cancelAction();
    };

    const dateTopBtnAction = () => {
        props.dateTopBtnAction();
    };

    const tabBarBtnAction = (value) => {
        props.tabBarBtnAction(value);
    };

    const updateLoader = (value) => {
        props.updateLoader(value);
    };

    const updatePopup = (value) => {
        props.updatePopup(value);
    };

    const doneCalenderBtnAction = () => {

        set_fCalenderSdate(fStartDate.current)
        set_fCalenderedate(fEndDate.current)
        props.doneCalenderBtnAction(fStartDate.current, fEndDate.current);
        fStartDate.current = null;
        fEndDate.current = null;
    };

    const updateFoodHistoryService = () => {
        props.updateFoodHistoryService();
    };

    const cancelCalenderBtnAction = () => {
        props.cancelCalenderBtnAction();
    };

    const setDietInfo = (dietId, dietName) => {
        set_selectedDietName(dietName);
        set_selectedDietId(dietId);
    }

    // Render the records in the flat list
    const renderItem = ({ item, index }) => {

        return (
            <View style={[styles.cellBackViewStyle, { ...CommonStyles.shadowStyle, flexDirection: 'row' }]}>

                {item.foodIntakeHistory && item.foodIntakeHistory.length > 0 ? <TouchableOpacity disabled={false} style={{ minHeight: item.foodIntakeHistory && item.foodIntakeHistory.length === 1 ? hp('2%') : hp('18%') ,flexDirection:'row'}} onPress={() => { editAction(item) }}>

                    <View>
                        <View style={{ width: wp('80%') }}>

                        <View style={[styles.cellSubViewStyle, { borderBottomWidth: Platform.isPad ? 0.5 : 1 }]}>

                            <View style={{  width: wp('45%')}}>
                                <Text numberOfLines={2} style={[styles.recFoodTexStyle]}>{item.foodIntakeHistory[0].dietName}</Text>
                            </View>

                            {item.foodIntakeHistory[0].quantityUnitName ?
                                <View style={{  width: wp('20%'), justifyContent: 'flex-start'}}>
                                    <Text style={[styles.tinyTexStyle, { opacity: 1 }]}>{'Consumed'}</Text>

                                    <Text style={[styles.texStyle1, {}]}>{item.foodIntakeHistory[0].quantityConsumed ? item.foodIntakeHistory[0].quantityConsumed : '0'}
                                        <Text style={[styles.tinyTexStyle, { flex: 0.5, opacity: 1 }]}>
                                            {" " + item.foodIntakeHistory[0].quantityUnitName}</Text></Text>
                                </View> : null}
                            <Text style={[styles.perTexStyle, {  }]}>{item.foodIntakeHistory[0].percentConsumed === 0 || item.foodIntakeHistory[0].percentConsumed > 0 || item.foodIntakeHistory[0].percentConsumed ? item.foodIntakeHistory[0].percentConsumed + '%' : ''}</Text>
                        </View>

                    </View>

                    {item.foodIntakeHistory.length > 1 ? <View style={{ width: wp('80%') }}>

                        <View style={[styles.cellSubViewStyle, { borderBottomWidth: Platform.isPad ? 0.5 : 1 }]}>

                            <View style={{width: wp('40%') }}>
                                <Text numberOfLines={2} style={[styles.recFoodTexStyle]}>{item.foodIntakeHistory[1].dietName}</Text>
                            </View>

                            <View style={{  width: wp('25%'), justifyContent: 'flex-start'}}>
                                
                            </View>
                            <Text style={[styles.perTexStyle, { width: wp('20%') }]}>{item.foodIntakeHistory[1].percentConsumed ? item.foodIntakeHistory[1].percentConsumed + '%' : ''}</Text>
                        </View>

                    </View> : null}

                    </View>

                    <View style={{ justifyContent: 'center', alignItems: 'center', width: wp('10%') }}>
                        <RButtonImg style={[styles.imageStyle, {}]}/>
                    </View>

                </TouchableOpacity> : null}

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
                    title={'Food Intake'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={[styles.middleView, { height: props.tabSelection === 0 ? hp('77%') : hp('90%') }]}>

                <View style={[CommonStyles.tabViewStyle, { marginTop: wp('2%') }]}>

                    <TouchableOpacity style={[props.tabSelection === 0 ? CommonStyles.tabViewEnableBtnStyle : CommonStyles.tabViewBtnStyle]} onPress={() => { tabBarBtnAction(0) }}>
                        <Text style={[CommonStyles.tabBtnTextStyle,{fontSize : Platform.isPad && 20 }]}>{'Intake'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[props.tabSelection === 1 ? CommonStyles.tabViewEnableBtnStyle : CommonStyles.tabViewBtnStyle]} onPress={() => { tabBarBtnAction(1) }}>
                        <Text style={[CommonStyles.tabBtnTextStyle, { fontSize : Platform.isPad && 20,marginRight: hp('0.2%') }]}>{'History'}</Text>
                    </TouchableOpacity>

                </View>

                <View style={{ marginTop: hp('2%') }}>

                    {props.tabSelection === 0 ? <TouchableOpacity style={[CommonStyles.dateBtnStyle, {}]} onPress={() => { dateTopBtnAction() }}>
                        {props.tabSelection === 0 ? <Text style={[CommonStyles.dateBtnTextStyle,{fontSize : Platform.isPad && 20 }]}>{props.datePickerDate ? moment(new Date(props.datePickerDate)).format('MM-DD-YYYY') : 'Date'}</Text> :
                            <Text style={[CommonStyles.dateBtnTextStyle,{fontSize : Platform.isPad && 20 }]}>{fCalenderSdate && fCalenderSdate ? (fCalenderSdate === fCalenderedate ? fCalenderSdate : fCalenderSdate + (fCalenderedate ? " to " + fCalenderedate : "")) : (fCalenderSdate ? fCalenderSdate : "Date")}</Text>}
                        <CalenderButtonImg width={Platform.isPad ? wp('4%') : wp('6%')} style={[CommonStyles.searchCalImageStyle]} />
                    </TouchableOpacity> :
                        <View style={{ flexDirection: 'row', width: wp('93%'), justifyContent: 'space-between' }}>
                            <TouchableOpacity style={{ height: hp('4%')}} onPress={() => { dateTopBtnAction() }}>
                                <View style={{ flexDirection: 'column', }}>

                                    <View style={{ flexDirection: 'row', justifyContent:'space-between',alignItems:'center'}}>
                                        <Text style={[styles.selectedDateStyle, { color: 'black' }]}>{"Select Date"}</Text>
                                    </View>

                                    <View style={{flexDirection:'row'}}>

                                        <Text style={[styles.selectedDateStyle,{marginTop: hp('0.5%')}]}>{fCalenderSdate && fCalenderSdate ?
                                            (fCalenderSdate === fCalenderedate ? moment(fCalenderSdate, 'YYYY-MM-DD').format("DD MMM YYYY") 
                                            : moment(fCalenderSdate, 'YYYY-MM-DD').format("DD MMM YYYY") + (fCalenderedate ? " - " + moment(fCalenderedate, 'YYYY-MM-DD').format("DD MMM YYYY") : "")) 
                                            : (fCalenderSdate ? moment(fCalenderSdate, 'YYYY-MM-DD').format("DD MMM YYYY") : "Date")}</Text>
                                        <DropDownImg width={Platform.isPad ? wp('4%') : wp('4%')} height={hp('1%')} style={{marginLeft: hp('1%')}}/>

                                    </View>

                                </View>
                            </TouchableOpacity>
                            
                        </View>
                    }

                </View>

                <KeyboardAwareScrollView>

                    {props.tabSelection === 0 ? <View style={{ marginTop: hp('2%') }}>
                        {props.foodArray ? <FlatList
                            style={[styles.flatListStyle]}
                            data={props.foodArray ? props.foodArray : undefined}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => "" + index}
                        /> : (!props.isLoading ? <View style={{ justifyContent: 'center', alignItems: 'center', height: hp('58%') }}>
                            {props.petObj && props.petObj.speciesId && parseInt(props.petObj.speciesId) === 1 ? <NoLogsDogImg style={[styles.nologsDogStyle]}/> : <NoLogsCatImg style={[styles.nologsDogStyle]}/>}
                            {/* <Text style={CommonStyles.noRecordsTextStyle}>{obsMessage}</Text> */}
                            <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_INTAKES_FOUND}</Text>
                        </View> : null)}
                    </View> :

                        <View>
                            <FoodHistoryComponent
                                setLoaderValue={(isLoader) => { updateLoader(isLoader) }}
                                updatePopup={(value) => { updatePopup(value) }}
                                petId={props.petObj ? props.petObj.petID : null}
                                fCalenderSdate={fCalenderSdate}
                                fCalenderedate={fCalenderedate}
                                setDietInfo={setDietInfo}
                                selectdCategoryUnit={props.selectdCategoryUnit}

                            />
                        </View>}

                </KeyboardAwareScrollView>

            </View>

            {!props.isDateVisible && props.tabSelection === 0 ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'ADD NEW INTAKE'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable={true}
                    rigthBtnState={true}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}
                    leftButtonAction={async () => backBtnAction()}
                />
            </View> : null}

            {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={props.popupAlert}
                    message={props.popupMsg}
                    isLeftBtnEnable={false}
                    isRightBtnEnable={true}
                    leftBtnTilte={'Cancel'}
                    rightBtnTilte={'OK'}
                    popUpRightBtnAction={() => popOkBtnAction()}
                />
            </View> : null}

            {props.isDateVisible && props.tabSelection === 1 ? <View style={[CommonStyles.popSearchViewStyle, { height: hp('50%'), justifyContent: 'center' }]}>

                <View style={CommonStyles.datePickerMViewStyle}>

                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginBottom: hp('2%'), marginHorizontal: wp('5%') }}>
                        <TouchableOpacity style={CommonStyles.dteTouchBtnStyle} onPress={() => cancelCalenderBtnAction()}>
                            <Text style={CommonStyles.doneTexStyle}>{'Cancel'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={CommonStyles.dteTouchBtnStyle} onPress={() => doneCalenderBtnAction()}>
                            <Text style={CommonStyles.doneTexStyle}>{'Done'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={CommonStyles.datePickerSubViewStyle}>
                        <CalendarPicker
                            startFromMonday={true}
                            allowRangeSelection={true}
                            minDate={minDate}
                            maxDate={new Date()}
                            // maxDate={maxDate}
                            selectedEndDate={new Date()}
                            allowBackwardRangeSelect={true}
                            todayBackgroundColor="#808080"
                            selectedDayColor="#7300e6"
                            selectedDayTextColor="#FFFFFF"
                            nextTitleStyle={{ fontFamily: 'Barlow-Regular' }}
                            previousTitleStyle={{ fontFamily: 'Barlow-Regular' }}
                            selectedRangeStartStyle={{ backgroundColor: "#008000" }}
                            selectedRangeEndStyle={{ backgroundColor: "#008000" }}
                            nextTitle='Next'
                            previousTitle='Previous'
                            width={370}
                            height={370}
                            textStyle={{ fontFamily: 'Barlow-Regular', color: '#000000', }}
                            onDateChange={(date, type) => {
                                if (type === 'START_DATE' && date) {
                                    fStartDate.current = moment(date).format('YYYY-MM-DD')
                                } else if (type === 'END_DATE' && date) {
                                    fEndDate.current = moment(date).format('YYYY-MM-DD')
                                }

                            }}
                            maxRangeDuration={6}
                        />
                    </View>
                </View>

            </View> : null}

            {props.isDateVisible && props.tabSelection === 0 ? <View style={[CommonStyles.popSearchViewStyle, { height: hp('45%'), justifyContent: 'center' }]}>

                <View style={styles.datePickerMViewStyle}>

                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginBottom: hp('2%') }}>
                        <TouchableOpacity style={styles.dteTouchBtnStyle} onPress={() => cancelAction()}>
                            <Text style={CommonStyles.doneTexStyle}>{'Cancel'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={CommonStyles.dteTouchBtnStyle} onPress={() => doneAction()}>
                            <Text style={CommonStyles.doneTexStyle}>{'Done'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.datePickerSubViewStyle}>
                        <DatePicker
                            date={datePickerDate1 ? datePickerDate1 : new Date()}
                            onDateChange={(date) => { set_datePickerDate1(date) }}
                            mode={"date"}
                            textColor={'black'}
                            theme = {'light'}
                            maximumDate={new Date()}
                            minimumDate={minimumDate ? new Date(minimumDate) : new Date('1900-01-01')}
                            style={styles.datePickeStyle}
                        />
                    </View>
                </View>

            </View> : null}

            {props.isLoading ? <LoaderComponent isLoader={true} loaderText={'Please wait..'} isButtonEnable={false} /> : null}

        </View>
    );
}

export default FoodIntakeMainUI;

const styles = StyleSheet.create({

    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
    },

    middleView: {
        width: wp('95%'),
        height: hp('73%'),
        alignItems: 'center',
    },

    dateBtnStyle: {
        width: wp('93%'),
        height: hp('4%'),
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#A0A0A0',
        justifyContent: 'center'
    },

    dateBtnTextStyle: {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleSemiBold,
        color: '#A0A0A0',
        marginLeft: hp('2%'),
    },

    selectedDateStyle: {
        fontSize: 16,
        ...CommonStyles.textStyleSemiBold,
        color: '#A0A0A0',
        marginLeft: hp('2%'),
    },

    flatListStyle: {
        width: wp('95%'),
    },

    recFoodTexStyle: {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: 'black',
        marginRight: hp('0.5%'),
    },

    dateTexStyle: {
        fontSize: fonts.fontTiny,
        ...CommonStyles.textStyleBold,
        color: 'grey',
        margin: hp('0.5%'),
    },

    tinyTexStyle: {
        fontSize: fonts.fontTiny,
        ...CommonStyles.textStyleRegular,
        color: 'grey',
    },

    texStyle1: {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleBold,
        color: 'black',
        marginRight: hp('0.5%'),
    },

    perTexStyle: {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
        color: '#54D86F',
    },

    cellBackViewStyle: {
        marginBottom: wp('2%'),
        borderRadius: 6,
        backgroundColor: 'white',
        width: wp('93%'),
        minHeight: hp('9%'),
        alignSelf: 'center',
    },

    cellSubViewStyle: {
        width: wp('75%'),
        minHeight: hp('8%'),
        alignSelf: 'center',
        borderBottomWidth: 0.2,
        borderBottomColor: 'grey',
        flexDirection: 'row',
        alignItems: 'center',
    },

    imageStyle: {
        height: hp('2%'),
        width: wp('2%'),
        resizeMode: "contain",
    },


    dteTouchBtnStyle: {
        backgroundColor: 'white',
        height: hp('4%'),
        width: wp('35%'),
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },

    datePickerMViewStyle: {
        alignSelf: 'center',
        borderRadius: 5,
        marginBottom: hp('2%')
    },

    datePickerSubViewStyle: {
        width: wp('90%'),
        height: hp('30%'),
        alignSelf: 'center',
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },

    datePickeStyle: {
        backgroundColor: 'white',
        width: wp('70%'),
        height: hp('25%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 1,
    },

    tabViewEnableBtnStyle: {
        width: wp('20%'),
        height: hp('2.5%'),
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    tabViewBtnStyle: {
        width: wp('20%'),
        height: hp('2.5%'),
        marginLeft: hp('0.2%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },

    tabViewStyle: {
        width: wp('80%'),
        height: hp('2.5%'),
        backgroundColor: '#1C4D72',
        alignSelf: 'center',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

});