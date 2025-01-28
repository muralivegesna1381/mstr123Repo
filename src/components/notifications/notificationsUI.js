import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text,FlatList,TouchableOpacity,Platform,SectionList } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant"
import AlertComponent from '../../utils/commonComponents/alertComponent';
import Fonts from './../../utils/commonStyles/fonts'
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';

import RightArrowImg from "./../../../assets/images/otherImages/svg/rightArrowLightImg.svg";
import CalenderButtonImg from "./../../../assets/images/otherImages/svg/calender.svg";
import DropDownImg from "./../../../assets/images/otherImages/svg/dropDownDate.svg";

const NotificationsUI = ({ route, ...props }) => {

    let fStartDate = useRef(undefined);
    let fEndDate = useRef(undefined)
    const [firstScroll,setFirst] = useState(null)

    const currrentY = useRef(null);

    React.useEffect(() => {
        
    }, [props.notificationsArray,props.notificationUpdate]);

    /**
     *  When user clicks on Back button on Header this method triggers the component class
     */
    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const actionOnNotification = (item) => {
        props.actionOnNotification(item);
    };

    const selectDateRangeBtnAction = () => {
        props.selectDateRangeBtnAction();
    };

    const cancelCalenderBtnAction = () => {
        fStartDate.current=undefined;
        fEndDate.current=undefined;
        props.cancelCalenderBtnAction();
    };

    const doneCalenderBtnAction = () => {
        props.doneCalenderBtnAction(fStartDate.current, fEndDate.current);
        fStartDate.current=undefined;
        fEndDate.current=undefined;
    };

    const markAllRead = () => {
        props.markAllRead();
    };

    /**
     * This method triggers when user clicks on Popup Button.
     */
    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    const notificationsOnEndReached = () => {
        props.notificationsOnEndReached();
    };

    const RenderItem = ({ notificationItem,index }) => {
        return (

            <View style={{flexDirection:'row'}}>

                <View style={{flex:0.2,justifyContent:'center',alignItems:'center'}}>
                    <Text style={[styles.messageTextStyle]}>{moment(moment.utc(notificationItem.notificationSentOn).toDate()).local().format('HH:mm')}</Text>
                </View>

                <TouchableOpacity disabled = {notificationItem.isRead ? true : false} style={styles.cellBackViewStyle} key={index} onPress={() => { actionOnNotification(notificationItem) }}>
                    <View style ={{marginTop: hp('1%'),marginLeft: hp('1%'),marginBottom: hp('1%'),flex:1.6}}>
                        <Text numberOfLines={2} style={notificationItem.isRead ? [styles.textStyle,{color:'grey'}] : [styles.textStyle]}>{notificationItem.notificationSubject}</Text>
                        <Text style={notificationItem.isRead ? [styles.messageTextStyle,{color:'grey',marginRight: hp('2%')}] : [styles.messageTextStyle]}>{notificationItem.notificationText}</Text>
                    </View>
                    {!notificationItem.isRead ? <View style = {{width: wp('8%'),flex:0.2, justifyContent:'center',alignItems:'center',alignSelf:'center'}}>
                        <RightArrowImg width={wp('2%')} height={hp('2%')} style={styles.imgStyle}/>
                    </View> : null}
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
                    title={'Message Center'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ width: wp('100%'), alignItems: 'center', }}>

                {<View style={{width: wp('90%'),marginTop: hp('2%'), flexDirection:'row' }}>

                    <TouchableOpacity style={{ width: wp('60%'),height: hp('8%')}} onPress={() => { selectDateRangeBtnAction() }}>

                        <View style={{ flexDirection: 'row', justifyContent:'space-between',alignItems:'center'}}>
                            <Text style={[styles.selectedDateStyle, { color: 'black' }]}>{"Date Range"}</Text>
                        </View>

                        <View style={{flexDirection:'row'}}>

                            <Text style={[styles.selectedDateStyle,{marginTop: hp('0.5%')}]}>{props.fCalenderSdate && props.fCalenderSdate ?
                            (props.fCalenderSdate === props.fCalenderedate ? moment(props.fCalenderSdate, 'MM-DD-YY').format("DD MMM YY") +  '     ' 
                                : moment(props.fCalenderSdate, 'MM-DD-YY').format("DD MMM YY") + (props.fCalenderedate ? " - " + moment(props.fCalenderedate, 'MM-DD-YY').format("DD MMM YY") : "")) 
                                : (props.fCalenderSdate ? moment(props.fCalenderSdate, 'MM-DD-YY').format("DD MMM YY") : "Date")}
                            </Text>
                            <DropDownImg width={Platform.isPad ? wp('4%') : wp('4%')} height={hp('1%')} style={{marginLeft: hp('1%')}}/>

                        </View>
                    </TouchableOpacity>

                    <View>
                    {props.showMarkBtn ? <TouchableOpacity style={{ width: wp('35%'),height: hp('4%')}} onPress={() => { markAllRead() }}>
                        <Text style={[styles.selectedDateStyle, { color: 'red' }]}>{"Mark all as read"}</Text>
                    </TouchableOpacity> : null}

                    {/* {!props.showMarkBtn ? <TouchableOpacity style={{ width: wp('35%'),height: hp('4%')}} onPress={() => { markAllRead() }}>
                        <Text style={[styles.selectedDateStyle, { color: 'red' }]}>{"Reset dates"}</Text>
                    </TouchableOpacity> : null} */}
                    </View>

                </View>}

                {props.notificationsArray && props.notificationsArray.length > 0 ? <View style={styles.recordListStyle}>

                    <SectionList
                        sections={props.notificationsArray}
                        keyExtractor={(item, index) => index}
                        renderItem={({ item }) => <RenderItem notificationItem={item} />}
                        renderSectionHeader={({ section: { title } }) => (
                            <View style={{width: wp('90%'),alignItems:'center'}}><Text style={styles.header}>{title ? moment(title, 'DD-MM-YYYY').format("DD MMM YYYY") : ''}</Text></View>
                        )}
                        onEndReached={() => {notificationsOnEndReached()}}
                    />
                    </View> : <View style={{justifyContent:'center',alignItems:'center',height:hp('58%'),width:wp('80%')}}>
                        <Text style={CommonStyles.noRecordsTextStyle}>{"No notifications available"}</Text>
                        <Text style={[styles.noRecordsTextStyle]}>{'Please visit this space regularly to check the recent notifications'}</Text>
                    </View> }

            </View>

            {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={props.alertTitle}
                    message={props.popUpMessage}
                    isLeftBtnEnable={props.isLeftBtnEnable}
                    isRightBtnEnable={true}
                    leftBtnTilte={'Cancel'}
                    rightBtnTilte={'OK'}
                    popUpRightBtnAction={() => popOkBtnAction()}
                    popUpLeftBtnAction={() => popCancelBtnAction()}
                />
            </View> : null}

            {props.isDateVisible ?  <View style={[CommonStyles.popSearchViewStyle, { height: hp('50%'), justifyContent: 'center' }]}>

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
                        minDate={props.minDate}
                        maxDate={new Date()}
                        selectedStartDate={moment(props.fCalenderSdate).toDate()} // Set custom start date
                        selectedEndDate={moment(props.fCalenderedate).toDate()} 
                        allowBackwardRangeSelect={true}
                        todayBackgroundColor="#808080"
                        selectedDayColor="#CDE8B1"
                        selectedDayTextColor="black"
                        nextTitleStyle={{ fontFamily: 'Barlow-SemiBold' }}
                        previousTitleStyle={{ fontFamily: 'Barlow-SemiBold' }}
                        selectedRangeStartStyle={{ backgroundColor: "#6BC100" }}
                        selectedRangeEndStyle={{ backgroundColor: "#6BC100" }}
                        nextTitle='Next'
                        previousTitle='Previous'
                        width={370}
                        height={370}
                        textStyle={{ fontFamily: 'Barlow-SemiBold', color: 'black', }}
                        onDateChange={(date, type) => {
                            if (type === 'START_DATE' && date) {
                                fStartDate.current = date;// moment(date).format('YYYY-MM-DD');
                            } else if (type === 'END_DATE' && date) {
                                fEndDate.current = date;//moment(date).format('YYYY-MM-DD');
                            }

                        }}
                        maxRangeDuration={30}
                    />

              </View>
                    
                </View>

            </View> : null}

            {props.isLoading === true ? <LoaderComponent isLoader={true} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

        </View>
    );
}

export default NotificationsUI;

const styles = StyleSheet.create({

    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white'
    },

    cellBackViewStyle: {
        flexDirection: 'row',
        marginBottom: hp('1%'),
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 5,
        backgroundColor: 'white',
        minHeight: hp("6%"),
        justifyContent: 'center',
        flex:1
    },

    textStyle: {
        fontSize: Fonts.fontSmall,
        ...CommonStyles.textStyleSemiBold,
        color: 'black',
    },

    messageTextStyle: {
        fontSize: Fonts.fontSmall,
        ...CommonStyles.textStyleRegular,
        color: 'black',
        marginTop: hp('0.5%'),
    },

    recordListStyle: {
        width: wp('90%'),
        marginBottom: hp('35%'),
    },

    imgStyle : {
        // alignSelf:'center',
        // justifyContent:'center',
        // backgroundColor:'red'

    },

    noRecordsTextStyle : {
        fontSize: Fonts.fontMedium,
        fontFamily: 'Barlow-Regular',
        color: 'black', 
        marginTop:hp('1%'),
        textAlign:'center'
    },

    selectedDateStyle: {
        fontSize: 16,
        ...CommonStyles.textStyleSemiBold,
        color: '#A0A0A0',
        marginLeft: hp('2%'),
    },

    header: {
        fontSize: 16,
        ...CommonStyles.textStyleSemiBold,
        color: 'black',
        alignSelf:'center',
        marginTop:hp('1%'),
        marginLeft:hp('7%'),
        marginBottom:hp('1%'),
        backgroundColor:'#CDE8B1',
       width: wp('75%'),
        textAlign:'center'
    },


});