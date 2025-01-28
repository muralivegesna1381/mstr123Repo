import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import fonts from './../../../utils/commonStyles/fonts'
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../../utils/constants/constant";
import moment from 'moment';
import DatePicker from 'react-native-date-picker'

import DogCatImg from "./../../../../assets/images/dogImages/dogCatImg.svg";
import GradientImg from "../../../../assets/images/otherImages/svg/filterGradientImg.svg";
import FilterImg from "../../../../assets/images/otherImages/svg/filterIcon.svg";
import FilterBckImg from "../../../../assets/images/otherImages/png/bgTimerFilter.png";
import CloseImg from "../../../../assets/images/otherImages/svg/timerCloseIcon.svg";

const TimerLogsUI = ({ route, ...props }) => {

    const [dropDownPostion, set_DropDownPostion] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [isListOpen, set_ListOpen] = useState(false);
    const [categoryArray, set_categoryArray] = useState([
        { key: 1, label: "Running" },
        { key: 2, label: "Walking" },
        { key: 3, label: "Fetch" },
        { key: 4, label: "Rope Tug" },],);
    const [isCateListOpen, set_isCateListOpen] = useState(false);
    const [categoryText, set_categoryText] = useState(undefined);
    const [isPetListOpen, set_isPetListOpen] = useState(false);
    const [petNameText, set_petNameText] = useState(undefined);
    const [petsArray, set_petsArray] = useState(undefined);
    const [timerLogsArray, set_timerLogsArray] = useState(undefined);
    const [filterLogsArray, set_filterLogsArray] = useState(undefined);
    const [noLogsShow, set_noLogsShow] = useState(true);
    const [fromDate, set_fromDate] = useState(undefined);
    const [toDate, set_toDate] = useState(undefined);
    const [datePickerDate, set_datePickerDate] = useState(new Date());
    const [datePickerDateTo, set_datePickerDateTo] = useState(new Date());
    const [isFromDate, set_isFromDate] = useState(false);
    const [isToDate, set_isToDate] = useState(false);

    useEffect(() => {

        set_timerLogsArray(props.timerLogsArray);
        set_petsArray(props.timerPets);
        set_filterLogsArray(props.timerLogsArray);
        set_noLogsShow(props.noLogsShow);

    }, [props.timerLogsArray, props.isLoading, props.timerPets, props.noLogsShow]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const filterData = async () => {
        let data = [];
        if (toDate && fromDate) {
            var fromDateParts = fromDate.split('-');
            var fromDateFormat = fromDateParts[2] + "-" + fromDateParts[0] + "-" + fromDateParts[1] + "T00:00:00";;
            var fromDateParse = new Date(moment.utc(fromDateFormat).toDate()).getTime();

            var toDateparts = toDate.split('-');
            var toDateFormate = toDateparts[2] + "-" + toDateparts[0] + "-" + toDateparts[1] + "T23:59:00";;
            var toDateParse = new Date(moment.utc(toDateFormate).toDate()).getTime();
        }

        if (toDate && fromDate && categoryText && petNameText) {
            const filteredTimerLogs = timerLogsArray.filter(item => {
                var timerCreatedDate = new Date(moment.utc(item.timerDate).toDate()).getTime();
                if (item.category == categoryText &&
                    item.petName == petNameText &&
                    fromDateParse <= timerCreatedDate &&
                    toDateParse >= timerCreatedDate) return item;

            })
            data = filteredTimerLogs.map(({ category, duration, petName, timerDate }) => ({ category, duration, petName, timerDate }));

        } else if (toDate && fromDate && petNameText) {
            const filteredTimerLogs = timerLogsArray.filter(item => {
                var timerCreatedDate = new Date(moment.utc(item.timerDate).toDate()).getTime();
                if (item.petName == petNameText &&
                    fromDateParse <= timerCreatedDate &&
                    toDateParse >= timerCreatedDate) return item;

            })
            data = filteredTimerLogs.map(({ category, duration, petName, timerDate }) => ({ category, duration, petName, timerDate }));

        } else if (toDate && fromDate && categoryText) {
            const filteredTimerLogs = timerLogsArray.filter(item => {
                var timerCreatedDate = new Date(moment.utc(item.timerDate).toDate()).getTime();
                if (item.category == categoryText &&
                    fromDateParse <= timerCreatedDate &&
                    toDateParse >= timerCreatedDate) return item;

            })
            data = filteredTimerLogs.map(({ category, duration, petName, timerDate }) => ({ category, duration, petName, timerDate }));

        } else if (toDate && fromDate) {
            const filteredTimerLogs = timerLogsArray.filter(item => {
                var timerCreatedDate = new Date(moment.utc(item.timerDate).toDate()).getTime();
                if (fromDateParse <= timerCreatedDate &&
                    toDateParse >= timerCreatedDate) return item;

            })
            data = filteredTimerLogs.map(({ category, duration, petName, timerDate }) => ({ category, duration, petName, timerDate }));

        } else if (petNameText && categoryText) {
            set_noLogsShow(false);
            const filteredTimerLogs = timerLogsArray.filter(item => {
                if (item.category == categoryText &&
                    item.petName == petNameText) return item;
            })
            data = filteredTimerLogs.map(({ category, duration, petName, timerDate }) => ({ category, duration, petName, timerDate }));

        } else if (petNameText) {
            set_noLogsShow(false);
            const filteredTimerLogs = timerLogsArray.filter(item => {
                if (item.petName == petNameText) return item;
            })
            data = filteredTimerLogs.map(({ category, duration, petName, timerDate }) => ({ category, duration, petName, timerDate }));

        } else if (categoryText) {
            set_noLogsShow(false);
            const filteredTimerLogs = timerLogsArray.filter(item => {
                if (item.category == categoryText) return item;
            })
            data = filteredTimerLogs.map(({ category, duration, petName, timerDate }) => ({ category, duration, petName, timerDate }));
        }

        set_ListOpen(false);

        if (data.length < 1) {
            set_noLogsShow(true);
        } else {
            set_noLogsShow(false);
        }
        set_filterLogsArray(data);
        set_isFromDate(false);
        set_isToDate(false);
    };

    const convertLocalDateToUTCDate = (date, toUTC) => {
        date = new Date(date);
        var localTime = date.getTime();
        var localTime1 = date.getDate();
        var localTime2 = date.getYear();
        date = localTime;
        date = new Date(date);
        return date;
    }

    const restFilter = () => {
        set_filterLogsArray(timerLogsArray);
        //   set_ListOpen(false);
        set_categoryText(undefined);
        set_petNameText(undefined);
        set_noLogsShow(false);
        set_isCateListOpen(false);
        set_isPetListOpen(false);
        set_isFromDate(false);
        set_isToDate(false);
        set_fromDate(undefined);
        set_toDate(undefined);
        set_datePickerDate(new Date());
        set_datePickerDateTo(new Date());
    };

    const closeAction = () => {
        set_ListOpen(!isListOpen)
        set_isPetListOpen(false);
        set_isCateListOpen(false);
        set_isToDate(false);
        set_isFromDate(false);
    }

    const renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity key={index} style={{ padding: 1 }} onPress={() => { }}>
                <View style={styles.cellBackViewStyle}>
                    <Text style={[styles.tdTextextStyle, { flex: 1, marginLeft: wp('2%') }]}>{index + 1}</Text>
                    <Text style={[styles.tdTextextStyle, { flex: 1.8 }]}>{item && item.petName.length > 10 ? item.petName.slice(0, 10) + '...' : item.petName}</Text>
                    <Text style={[styles.tdTextextStyle, { flex: 2 }]}>{item ? item.category : ''}</Text>
                    <Text style={[styles.tdTextextStyle, { flex: 1.8 }]}>{item ? item.duration : ''}</Text>
                    <Text style={[styles.tdTextextStyle, { flex: 2 }]}>{item ? moment(moment.utc(item.timerDate).toDate()).local().format('MM-DD-YYYY HH:mm:ss') : ''}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const actionOnRow = (item) => {
        ///// Captures breed name and breed id after selecting the breed from the list ////
        if (isCateListOpen) {

            set_categoryText(item.label);
            set_isCateListOpen(!isCateListOpen);

        } else {
            set_petNameText(item.petName);
            set_isPetListOpen(!isPetListOpen);
        }

    };

    const doneAction = (value) => {

        if (value === 'From') {
            datePickerDate ? set_fromDate(moment(datePickerDate).format('MM-DD-YYYY')) : moment(new Date()).format('MM-DD-YYYY');
        } else if (value === 'To') {
            datePickerDateTo ? set_toDate(moment(datePickerDateTo).format('MM-DD-YYYY')) : moment(new Date()).format('MM-DD-YYYY');
        }

        set_isFromDate(false);
        set_isToDate(false);

    };

    const cancelAction = () => {

        if (!fromDate) {
            set_fromDate(undefined);
        }

        if (!toDate) {
            set_toDate(undefined);
        }
        set_isFromDate(false);
        set_isToDate(false);

    };

    const setDateselected = (date) => {
        set_datePickerDate(date);
    }

    return (
        <View style={[CommonStyles.mainComponentStyle, { alignItems: 'center' }]}>
            <View style={[CommonStyles.headerView, {}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Timer'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ alignItems: 'center' }}>

                {timerLogsArray && timerLogsArray.length > 0 ? <View style={styles.mainViewStyle}>

                    <GradientImg width={wp('90%')} height={hp('5%')} style={[styles.filterBtnStyle]}/>
                    <TouchableOpacity style={[styles.filterBtnStyle,{position:'absolute'}]} onPress={() => { set_ListOpen(!isListOpen) }}>

                        <View onLayout={(event) => {
                            const layout = event.nativeEvent.layout;
                            const postionDetails = { x: layout.x, y: layout.y, width: layout.width, height: layout.height, };
                            set_DropDownPostion(postionDetails);
                        }} style={[styles.SectionStyle]}>

                            <Text style={styles.hTextextStyle}>{'Filter'}</Text>
                            <FilterImg style={[styles.filterIconStyle]}/>
                        </View>
                    </TouchableOpacity>

                </View> : null}

                <View style={styles.listViewStyle}>

                    {!noLogsShow && timerLogsArray && timerLogsArray.length > 0 ? <View style={styles.headingView}>

                        <Text style={[styles.hTextextStyle, { flex: 1, marginLeft: wp('2%') }]}>{'S.No'}</Text>
                        <Text style={[styles.hTextextStyle, { flex: 1.8 }]}>{'Pet Name'}</Text>
                        <Text style={[styles.hTextextStyle, { flex: 2 }]}>{'Category'}</Text>
                        <Text style={[styles.hTextextStyle, { flex: 2 }]}>{'Duration'}</Text>
                        <Text style={[styles.hTextextStyle, { flex: 2 }]}>{'Date'}</Text>

                    </View> : null}

                    {!noLogsShow ? <View>
                        <FlatList
                            data={filterLogsArray}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => "" + index}
                        />
                    </View> : (props.isLoading === false ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp("15%"), }}>
                        <DogCatImg style={[CommonStyles.nologsDogStyle, { width: wp("45%"), height: hp("25%"), resizeMode: 'contain' }]}/>
                        <Text style={[CommonStyles.noRecordsTextStyle]}>{Constant.NO_RECORDS_LOGS}</Text>
                        <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
                    </View> : null)}

                </View>

                {isListOpen ? <View style={[styles.timerFilterListStyle, { top: dropDownPostion.y + dropDownPostion.height },]}>

                    <ImageBackground style={{ alignItems: "center", justifyContent: "center", }} imageStyle={{ borderRadius: 25 }} source={FilterBckImg}>

                        <TouchableOpacity style={styles.filterViewBtnStyle} onPress={() => {
                            set_isFromDate(!isFromDate);
                            set_isPetListOpen(false);
                            set_isCateListOpen(false);
                            set_isToDate(false);
                        }}>
                            <Text style={fromDate ? [styles.dropTextStyle, { color: 'black' }] : [styles.dropTextStyle]}>{fromDate ? fromDate.toString() : 'From Date'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity disabled={fromDate ? false : true} style={styles.filterViewBtnStyle} onPress={() => {
                            set_isFromDate(false);
                            set_isPetListOpen(false);
                            set_isCateListOpen(false);
                            set_isToDate(!isToDate);
                        }}>
                            <Text style={toDate ? [styles.dropTextStyle, { color: 'black' }] : [styles.dropTextStyle]}>{toDate ? toDate.toString() : 'To Date'}</Text>
                        </TouchableOpacity>

                        {props.timerPets && props.timerPets.length > 1 ? <TouchableOpacity style={styles.filterViewBtnStyle} onPress={() => {
                            set_isPetListOpen(!isPetListOpen);
                            set_isCateListOpen(false);
                            set_isFromDate(false);
                            set_isToDate(false);
                        }}>
                            <View>
                                <Text style={petNameText ? [styles.dropTextStyle, { color: 'black' }] : [styles.dropTextStyle]}>{petNameText ? petNameText : 'Pet Name'}</Text>
                            </View>
                        </TouchableOpacity> : null}

                        <TouchableOpacity style={styles.filterViewBtnStyle} onPress={() => {
                            set_isCateListOpen(!isCateListOpen);
                            set_isPetListOpen(false);
                            set_isFromDate(false);
                            set_isToDate(false);
                        }}>

                            <View>
                                <Text style={categoryText ? [styles.dropTextStyle, { color: 'black' }] : [styles.dropTextStyle]}>{categoryText ? categoryText : 'Category'}</Text>
                            </View>

                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', width: wp("90%"), justifyContent: 'space-between' }}>

                            <TouchableOpacity style={styles.filterRestBtnStyle} onPress={() => { restFilter() }}>
                                <Text style={styles.dropBtnTextextStyle}>{'RESET'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.filterSubmitBtnStyle} disabled={categoryText || petNameText || (fromDate && toDate) ? false : true} onPress={() => { filterData() }}>
                                <Text style={styles.dropBtnTextextStyle}>{'SUBMIT'}</Text>
                            </TouchableOpacity>

                        </View>

                        <View style={[styles.dropCloseImgStyle]}>

                            <TouchableOpacity onPress={() => closeAction()}>
                                <CloseImg height={hp("5%")} width={wp("10%")}/>
                            </TouchableOpacity>

                        </View>

                    </ImageBackground>

                </View> : null}

            </View>

            {isPetListOpen || isCateListOpen ? <View style={[styles.popSearchViewStyle]}>
                <FlatList
                    style={styles.flatcontainer}
                    data={isPetListOpen ? petsArray : (isCateListOpen ? categoryArray : categoryArray)}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => actionOnRow(item)}>
                            <View style={styles.flatview}>
                                <Text numberOfLines={2} style={[styles.name]}>{isPetListOpen ? item.petName : (isCateListOpen ? item.label : '')}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    enableEmptySections={true}
                    keyExtractor={(item, index) => index}
                />

            </View> : null}

            {isFromDate ? <View style={[styles.popSearchViewStyle, { height: hp('45%'), justifyContent: 'center' }]}>

                <View style={styles.datePickerMViewStyle}>

                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginBottom: hp('2%') }}>
                        <TouchableOpacity style={{ backgroundColor: 'white', height: hp('4%'), width: wp('35%'), borderRadius: 5, alignItems: 'center', justifyContent: 'center' }} onPress={() => cancelAction()}>
                            <Text style={styles.doneTexStyle}>{'Cancel'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ backgroundColor: 'white', height: hp('4%'), width: wp('35%'), borderRadius: 5, alignItems: 'center', justifyContent: 'center' }} onPress={() => doneAction('From')}>
                            <Text style={styles.doneTexStyle}>{'Done'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.datePickerSubViewStyle}>
                        <DatePicker
                            date={datePickerDate}
                            onDateChange={(date) => setDateselected(date)}
                            mode={"date"}
                            textColor={'black'}
                            theme = {'light'}
                            maximumDate={new Date()}
                            minimumDate={fromDate && datePickerDate ? datePickerDate : new Date('1900-01-01')}
                            style={styles.datePickeStyle}
                        />
                    </View>
                </View>

            </View> : null}

            {isToDate ? <View style={[styles.popSearchViewStyle, { height: hp('45%'), justifyContent: 'center' }]}>

                <View style={styles.datePickerMViewStyle}>

                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginBottom: hp('2%') }}>
                        <TouchableOpacity style={{ backgroundColor: 'white', height: hp('4%'), width: wp('35%'), borderRadius: 5, alignItems: 'center', justifyContent: 'center' }} onPress={() => cancelAction()}>
                            <Text style={styles.doneTexStyle}>{'Cancel'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ backgroundColor: 'white', height: hp('4%'), width: wp('35%'), borderRadius: 5, alignItems: 'center', justifyContent: 'center' }} onPress={() => doneAction('To')}>
                            <Text style={styles.doneTexStyle}>{'Done'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.datePickerSubViewStyle}>
                        <DatePicker
                            date={datePickerDateTo}
                            onDateChange={(date) => set_datePickerDateTo(date)}
                            mode={"date"}
                            textColor={'black'}
                            maximumDate={new Date()}
                            minimumDate={fromDate && datePickerDate ? datePickerDate : new Date('1900-01-01')}
                            style={styles.datePickeStyle}
                        />
                    </View>
                </View>

            </View> : null}
            {props.isLoading === true ? <LoaderComponent isLoader={true} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}
        </View>
    );
}

export default TimerLogsUI;

const styles = StyleSheet.create({

    mainViewStyle: {
        width: wp('90%'),
        height: hp('5%'),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: wp('2%'),
        marginTop: wp('5%')
    },

    headingView: {
        width: wp('90%'),
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp('2%'),
    },

    bannerViewStyle: {
        width: wp('100%'),
        height: hp('6%'),
        alignSelf: 'center',
        backgroundColor: '#2E2E2E',
        marginBottom: wp('2%'),
        justifyContent: 'center',
    },

    listViewStyle: {
        width: wp('90%'),
        height: hp('75%'),
        alignSelf: 'center'
    },

    hTextextStyle: {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: 'black',
    },

    dropBtnTextextStyle: {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleBold,
        color: 'black',
    },

    dropTextStyle: {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: '#7F7F81',
        marginLeft: wp('3%'),
    },

    tdTextextStyle: {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleMedium,
        color: 'black',
        marginRight: wp('1%'),
    },

    filterBtnStyle: {
        width: wp('90%'),
        height: hp('5%'),
        borderRadius: 5,
        borderColor: '#dedede',
        borderWidth: 0.5,
        alignItems: 'center',
        justifyContent: 'center'
    },

    SectionStyle: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: hp("8%"),
        width: wp("80%"),
        borderRadius: hp("0.5%"),
        alignSelf: "center",
    },

    timerFilterListStyle: {
        position: "absolute",
        width: wp("100%"),
        minHeight: hp("40%"),
        borderRadius: 15,
        alignSelf: 'center',
        marginTop: hp("1.0%"),
    },

    filterViewBtnStyle: {
        width: wp("85%"),
        height: wp("10%"),
        backgroundColor: 'white',
        marginBottom: wp("1%"),
        marginTop: wp("1%"),
        borderRadius: 5,
        justifyContent: "center",
        borderColor: '#EAEAEA',
        borderWidth: 0.5,
    },

    filterSubmitBtnStyle: {
        width: wp("35%"),
        height: wp("10%"),
        backgroundColor: '#CCE8B0',
        marginTop: wp("2%"),
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: "center",
        borderWidth: 0.5,
        borderColor: '#6BC100'
    },

    filterRestBtnStyle: {
        width: wp("35%"),
        height: wp("10%"),
        backgroundColor: '#E7E7E9',
        marginTop: wp("2%"),
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: "center",
        borderWidth: 0.5,
        borderColor: '#323232'
    },

    cellBackViewStyle: {
        flexDirection: 'row',
        marginBottom: wp('1%'),
        marginTop: wp('1%'),
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 5,
        backgroundColor: 'white',
        minHeight: wp("10%"),
        alignItems: 'center',
        justifyContent: 'center',
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
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "center",
        color: "black",
    },

    bannerTexStyle: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontXSmall,
        textAlign: "center",
        color: "white",
        marginLeft: hp('2%'),
        marginRight: hp('2%')
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

    datePickerMViewStyle: {
        alignSelf: 'center',
        borderRadius: 5,
        marginBottom: hp('2%')
    },

    datePickerSubViewStyle: {
        width: wp('80%'),
        height: hp('30%'),
        alignSelf: 'center',
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        justifyContent: 'center',
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

    doneTexStyle: {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleMedium,
        color: 'black',
    },

    filterIconStyle: {
        width: wp('4%'),
        height: hp('4%'),
        resizeMode: 'contain',
        marginLeft: hp('2%'),
    },

    dropCloseImgStyle: {
        bottom: -10,
        alignItems: 'center',
        justifyContent: 'flex-end'
    },

});