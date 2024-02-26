import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, FlatList, Platform } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import moment from "moment";
import LoaderComponent from '../../../utils/commonComponents/loaderComponent';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import DatePicker from 'react-native-date-picker';
import FsTextInputComponent from '../foodHistoryCustomComponents/fsTextInputComponent';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import QuestionnaireSliderComponent from "./../../questionnaire/questionnaireCustomComponents/customComponents/questionnaireSliderComponent";

import downButtonImg from "./../../../../assets/images/otherImages/svg/downArrowGrey.svg";
import upButtonImg from "./../../../../assets/images/otherImages/svg/upArrow.svg";
import rSelectedImg from "./../../../../assets/images/otherImages/svg/radioBtnSelectedImg.svg";
import rUnSelectedImg from "./../../../../assets/images/otherImages/svg/radioBtnUnSelectedImg.svg";
import calenderButtonImg from "./../../../../assets/images/otherImages/svg/calender.svg";
import plusImg from "./../../../../assets/images/otherImages/svg/plusFIN.svg";
import minusImg from "./../../../../assets/images/otherImages/svg/minusFIN.svg";

const FoodIntakeUI = ({ route, ...props }) => {

    const [isToDate, set_isToDate] = useState(false);
    const [datePickerDate, set_datePickerDate] = useState('');
    const [datePickerDate1, set_datePickerDate1] = useState(new Date());
    const [indexArray1, set_indexArray1] = useState([]);
    const [expandedIndex, set_expandedIndex] = useState(-1);
    const [isItemAdded, set_isItemAdded] = useState(-1);
    const [minimumDate, set_minimumDate] = useState('1900-01-01');
    const [isEdit, set_isEdit] = useState(-1);
    const [foodHistoryIntakeObj, set_foodHistoryIntakeObj] = useState(undefined);
    const [isDateVisible, set_isDateVisible] = useState(false);
    const [isFeedbackExpand, set_isFeedbackExpand] = useState(true);
    const [indexArray2, set_indexArray2] = useState([]);

    var indexArray = useRef([]);
    var indexArray3 = useRef([]);

    // Setting the props values to UI
    useEffect(() => {

        if (props.selectedDate) {
            set_datePickerDate(moment(props.selectedDate).format('MM-DD-YYYY'));
        }

        set_isEdit(props.isEdit);
        set_isItemAdded(props.isItemAdded);
        set_foodHistoryIntakeObj(props.foodHistoryIntakeObj);
        // set_isDateVisible(props.isDateVisible);
    }, [props.noLogsShow, props.isPopUp, props.isEdit, props.isItemAdded, props.foodHistoryIntakeObj, props.isOtherFood, props.isDateVisible]);

    useEffect(() => {
        getLastweekDate();
    }, []);

    const getLastweekDate = () => {

        // const lastWeek = new Date();
        // lastWeek.setDate(lastWeek.getDate() - 7);
        // set_minimumDate(new Date(lastWeek));

    };

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
    }

    // Done btn action in Filter popup view
    const doneAction = (value) => {

        datePickerDate1 ? set_datePickerDate(moment(datePickerDate1).format('MM-DD-YYYY')) : set_datePickerDate(moment(new Date()).format('MM-DD-YYYY'));
        set_isToDate(undefined)
        foodHistoryIntakeObj.selectedDate = datePickerDate1;
        set_isDateVisible(false);
        props.dateSelectAction(datePickerDate1);

    };

    // Cancel action to dismiss the filter view
    const cancelAction = () => {
        set_isDateVisible(false);
    };

    const cancelDrop = () => {
        props.cancelDrop();
    }

    const updateOtherFoodItems = (textValue, id, index, parentItemIndex) => {

        props.updateOtherFoodItems(textValue, id, index, parentItemIndex);
    };

    const updateRecFoodData = (textValue, id, index) => {
        props.updateRecFoodData(textValue, id, index);
    };

    const addDeleteAction = (value, item, index, parentItem) => {
        props.addDeleteAction(value, item, index, parentItem);
    };

    const enableOtherFoodAction = (value) => {
        props.enableOtherFoodAction(value);
    };

    const actionOnOptiontype = (value,item) => {
        props.actionOnOptiontype(value,item);
    };

    const updateOtherUnitsActions = (value,item, index, parentItemIndex, pArray) => {
        props.updateOtherUnitsActions(value,item, index, parentItemIndex, pArray);
    };

    const selectFeedbackOptionsAction = (item, index, parentItemIndex) => {
        props.selectFeedbackOptionsAction(item, index, parentItemIndex)
    };

    const dateTopBtnAction = () => {
        // props.dateTopBtnAction();
        set_isDateVisible(true);
    };

    const upDateFeedbackOtherTextAction = (item, index,value) => {

        props.upDateFeedbackOtherTextAction(item, index,value)
    };

    const renderFeedbackOptionsItem = ({ item, index }, parentItemIndex) => {

        return (
            <View style={{ width: wp('90%'), alignItems: 'center', justifyContent: 'center' }}>

                <TouchableOpacity onPress={() => { selectFeedbackOptionsAction(item, index, parentItemIndex) }} style={{ width: wp('80%'), alignSelf: 'center', flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={item.selctedIndex === index + 1 ? rSelectedImg : rUnSelectedImg} style={[styles.rImageStyle, { width: Platform.isPad ? wp('3%') : wp('5%'), tintColor: 'green' }]} />
                    <Text numberOfLines={2} style={[styles.foddOptionsTextStyle, {}]}>{item.description}</Text>
                </TouchableOpacity>

            </View>
        );
    };

    // Render the records in the flat list
    const renderFeedbackItem = ({ item, index }) => {

        return (

            <View style={[{ width: wp('90%'), marginBottom: hp('2%'), borderWidth: 1, borderColor: '#EAEAEA', alignSelf: 'center' }]}>

                <TouchableOpacity onPress={() => {
                    set_indexArray2([]);
                    if (indexArray3.current.includes(index)) {
                        var temp = indexArray3.current.filter(item => item !== index);
                        indexArray3.current = temp;
                        set_indexArray2(temp)
                    } else {
                        indexArray3.current.push(index);
                        set_indexArray2(indexArray3.current);
                    }
                    expandedIndex === index ? set_expandedIndex(-1) : set_expandedIndex(index);
                }}>

                    {<View style={{ width: wp('80%'), height: indexArray3.current.includes(index) ? hp('5%') : hp('5%'), marginTop: hp('1%'), alignSelf: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                        <Text numberOfLines={2} style={[styles.feedQTexStyle, {}]}>{item.feedbackCategory}</Text>
                        {<Image source={indexArray3.current.includes(index) ? upButtonImg : downButtonImg} style={[styles.imageStyle, { width: Platform.isPad ? wp('2.5%') : wp('4%') }]} />}
                    </View>}

                </TouchableOpacity>

                {item.feedbackOptions && indexArray3.current.includes(index) ? <View>

                    <View>

                        <FlatList
                            style={[styles.flatListStyle, {marginBottom: hp('1%'),marginTop: hp('2%')}]}
                            data={item.feedbackOptions ? item.feedbackOptions : undefined}
                            renderItem={(childData) => renderFeedbackOptionsItem(childData, index)}
                            keyExtractor={(item, index) => "" + index}
                        />

                    </View>

                     {item.isOthers ? <View style={{ width: wp('80%'), alignSelf: 'center', alignItems: 'center', marginBottom: hp('1%'), }}>

                            <FsTextInputComponent
                                inputText={item.otherText ? item.otherText.toString() : ''}
                                labelText={'Enter feedback'}
                                isEditable={true}
                                widthValue={wp('80%')}
                                maxLengthVal={200}
                                autoCapitalize={"none"}
                                setValue={(textAnswer) => { upDateFeedbackOtherTextAction(item, index,textAnswer) }}
                            />

                        </View> : null}

                </View> : null}

            </View>
        );
    };

    const renderItemSUbCategories = ({ item, index }, parentItemIndex, pArray) => {

        return (

            <View style={styles.cellOtherBackViewStyle}>

                {<View style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>

                    {item.FOOD_NAME && item.PERCENT_CONSUMED && index < 4 && pArray && pArray.length - 1 === index ?
                        <TouchableOpacity onPress={() => { addDeleteAction(2, item, index, parentItemIndex) }} style={[styles.editBtnStyle, { width: Platform.isPad ? wp('4%') : wp('6%') }]}>
                            {/* <Text style={[styles.editBtnTextStyle, { color: 'white' }]}>{'+'}</Text> */}
                            <Image source={plusImg} style={[styles.rImageStyle, { width: Platform.isPad ? wp('3.5%') : wp('5%')}]} />
                        </TouchableOpacity> : null}

                    {pArray && pArray.length > 1 ?
                        <TouchableOpacity onPress={() => { addDeleteAction(1, item, index, parentItemIndex) }} style={[styles.editBtnStyle]}>
                            {/* <Text style={[styles.editBtnTextStyle, {}]}>{'-'}</Text> */}
                            <Image source={minusImg} style={[styles.rImageStyle, { width: Platform.isPad ? wp('3.5%') : wp('5%')}]} />
                        </TouchableOpacity> : null}

                </View>}

                <View style={{ marginBottom: hp('1%'), }}>

                    <View style = {{width: wp('85%'),flexDirection: 'row',alignSelf: 'center', alignItems: 'center',justifyContent: 'space-between'}}>

                        <View style={{ width: wp('85%'), alignSelf: 'center', alignItems: 'center', marginTop: hp('1%'), }}>

                            <FsTextInputComponent
                                inputText={item.FOOD_NAME ? item.FOOD_NAME.toString() : ''}
                                labelText={'Food Name'}
                                isEditable={true}
                                widthValue={wp('85%')}
                                maxLengthVal={100}
                                autoCapitalize={"none"}
                                setValue={(textAnswer) => { updateOtherFoodItems(textAnswer, 1, index, parentItemIndex) }}
                            />

                        </View>

                    </View>

                    <View style={{ width: wp('85%'), justifyContent: 'space-between', alignSelf: 'center', marginTop: hp('1%') }}>

                        <View style={{ width: wp('85%'), flexDirection: 'row', alignItems: 'center',marginTop: hp('1%') }}>

                            <FsTextInputComponent
                                inputText={item.PERCENT_CONSUMED ? item.PERCENT_CONSUMED.toString() : ''}
                                labelText={'Consumed Percentage'}
                                isEditable={true}
                                widthValue={wp('85%')}
                                maxLengthVal={5}
                                autoCapitalize={"none"}
                                keyboardType={'number-pad'}
                                setValue={(textAnswer) => { updateOtherFoodItems(textAnswer, 2, index, parentItemIndex) }}
                            />
                            <View style={{ width: wp('10%'), height: hp('4%'), marginLeft: wp('-11.5%'), backgroundColor: '#7676801F', borderRadius: 5 }}>
                                <TouchableOpacity disabled = {true} onPress={() => { updateOtherUnitsActions(item, index, parentItemIndex, pArray) }}>
                                    <View style={{ width: wp('3%'), height: hp('4%'), alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', alignSelf: 'center' }}>
                                        <Text numberOfLines={2} style={[styles.foodGrmsTextStyle, { color: 'grey', opacity: 0.8 }]}>%</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                    
                </View>
            </View>
        )

    };

    const renderOtherFoods = ({ item, index }) => {

        return (

            <View style={[styles.otherFoodRenderView, {...CommonStyles.shadowStyle}]}>

                <TouchableOpacity onPress={() => {
                    set_indexArray1([]);
                    if (indexArray.current.includes(index)) {
                        var temp = indexArray.current.filter(item => item !== index);
                        indexArray.current = temp;
                        set_indexArray1(temp)
                    } else {
                        indexArray.current.push(index);
                        set_indexArray1(indexArray.current);
                    }
                    expandedIndex === index ? set_expandedIndex(-1) : set_expandedIndex(index);
                }}>

                    <View style={{ width: wp('90%'), alignSelf: 'center', }}>

                        <View style={{ flexDirection: 'row' }}>

                            <View style={{ flex: 2 }}>
                                <Text style={[styles.recFoodTexStyle, {}]}>{item.otherFoodType}</Text>
                            </View>

                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                {item.percentageRecord > 0 ? <Text adjustsFontSizeToFit style={[styles.otherFoodRenderTexStyle, {}]}>{'Intake  '}<Text adjustsFontSizeToFit style={[styles.otherFoodRenderTexStyle, { color: '#22d367' }]}>{item.percentageRecord + '%'}</Text></Text> : null}
                            </View>

                            <View style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center' }}>
                                {<Image source={indexArray.current.includes(index) ? upButtonImg : downButtonImg} style={[styles.imageStyle, { width: Platform.isPad ? wp('2.5%') : wp('4%') }]} />}
                            </View>

                        </View>

                        <View style={{ width: wp('65%') }}>
                            <Text style={[styles.otherFoodRenderTexStyle, { marginTop: hp('-0.2%'), marginBottom: hp('1%') }]}>{item.description}</Text>
                        </View>

                    </View>

                </TouchableOpacity>

                {indexArray.current.includes(index) ? <View style={[styles.collapsedBodyStyle]}>

                    <FlatList
                        style={styles.flatListStyle}
                        data={item.foofDetails ? item.foofDetails : undefined}
                        renderItem={(childData) => renderItemSUbCategories(childData, index, item.foofDetails)}
                        keyExtractor={(childData, index) => "" + index}
                    />
                </View> : null}

            </View>
        )

    };

    // Render the records in the flat list
    const renderItem = ({ item, index }) => {

        return (
            <View style={[styles.cellBackViewStyle, CommonStyles.shadowStyle]}>

                <View style={{ justifyContent: 'space-between', flexDirection: 'row', width: wp('91%'), alignSelf: 'center' }}>
                    <Text numberOfLines={2} style={[styles.recFoodTexStyle, {}]}>{item ? item.dietName : ''}</Text>

                    {
                        item && (item.FOOD_CONSUMED === 0 || item.FOOD_CONSUMED > 0 || item.FOOD_CONSUMED) && item.FOOD_CONSUMED.toString().length != 0 ? <Text numberOfLines={2} style={[styles.recFoodTexStyle, {}]}>{props.recommendedPercentage}%</Text> : <Text></Text>
                    }
                </View>

                <View style={{ flexDirection: 'row', width: wp('90%'), justifyContent: 'space-between', alignItems: 'center', marginTop: hp('1%'),alignSelf:'center'}}>

                    <View style={{ width: wp('38%') }}>

                        <FsTextInputComponent
                            inputText={item.FOOD_OFFERED === 0 || item.FOOD_OFFERED > 0 || item.FOOD_OFFERED ? item.FOOD_OFFERED.toString() : ''}
                            labelText={'Offered*'}
                            isEditable={true}
                            widthValue={wp('38%')}
                            maxLengthVal={5}
                            autoCapitalize={"none"}
                            keyboardType={'decimal-pad'}
                            setValue={(textAnswer) => { updateRecFoodData(textAnswer, 1, index) }}
                        />

                    </View>
                    <View style={{ width: wp('50%'), flexDirection: 'row', alignItems: 'center' }}>

                        <FsTextInputComponent
                            inputText={item.FOOD_CONSUMED === 0 || item.FOOD_OFFERED > 0 || item.FOOD_OFFERED ? item.FOOD_CONSUMED.toString() : ''}
                            labelText={'Consumed*'}
                            isEditable={item.FOOD_OFFERED ? true : false}
                            widthValue={wp('50%')}
                            maxLengthVal={5}
                            autoCapitalize={"none"}
                            keyboardType={'decimal-pad'}
                            setValue={(textAnswer) => { updateRecFoodData(textAnswer, 2, index) }}
                        />

                        <View style={{ width: wp('20%'), height: hp('4%'), marginLeft: wp('-21.5%'), backgroundColor: '#7676801F', borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                            <Text numberOfLines={2} style={[styles.foodGrmsTextStyle, { color: 'grey', opacity: 0.5 }]}>{item.FEED_UNITS && item.FEED_UNITS === 4 ? 'cup' : 'gram'}</Text>
                        </View>
                    </View>

                </View>

                {item.FOOD_OFFERED === 0 || item.FOOD_OFFERED > 0 || item.FOOD_OFFERED ? <View style={{width: wp('93%'),height: hp('8%'),alignSelf:'center'}}>
                    <View style={{width: wp('88%'),justifyContent:'space-between',marginTop: hp('1%'),position:'absolute',flexDirection:'row',alignSelf:'center'}}>
                        <Text style={[styles.barPercentTextStyle, { color: 'black', zIndex:999}]}>{'Consumed Percentage'}</Text>
                        <Text style={[styles.barPercentTextStyle, { color: 'black', zIndex:999}]}>{item.PERCENT_VALUE === 0 || item.PERCENT_VALUE > 0 || item.PERCENT_VALUE ? item.PERCENT_VALUE +'%' : ''}</Text>
                    </View>
                    <View style={{}}>

                        <QuestionnaireSliderComponent
                            value={item.PERCENT_VALUE === 0 || item.PERCENT_VALUE > 0 || item.PERCENT_VALUE ? item.PERCENT_VALUE : 0}
                            minValue = {0}
                            maxValue = {100}
                            breakValue = {1}
                            isContinuousScale = {true}
                            desc = {''}
                            status_QID = {''}
                            questionImageUrl = {undefined}
                            ceilDescription = {''}
                            floorDescription = {''}
                            isAnsSubmitted = {false}
                            setValue={(value) => {
                                updateRecFoodData(value, 4, index)
                            }}
                        /> 

                    </View>
                    
                </View> : null}

                {(item.recommendedRoundedGrams && item.recommendedRoundedGrams > 0) || (item.recommendedRoundedCups && item.recommendedRoundedCups > 0) ? <View style={{ width: wp('83%'), flexDirection: 'row', alignItems: 'center', marginTop: hp('1%'), marginBottom: hp('1%'), alignSelf: 'center' }}>
                    <Text numberOfLines={2} style={[styles.recFoodTexStyle1, {}]}>{'Recommended Quantity'}</Text>
                    <View style={[styles.foodGrmsViewStyle, { backgroundColor: '#fff7ec' }]}>
                        <Text numberOfLines={2} style={[styles.foodGrmsTextStyle, { color: '#fc5b04',marginRight: hp('0.5%'),marginLeft: hp('0.5%') }]}>{
                            (item.FEED_UNITS && item.FEED_UNITS === 3 ? item.recommendedRoundedGrams : item.recommendedRoundedCups) +
                            ((' ') + (item.FEED_UNITS && item.FEED_UNITS === 3 ? "grams" : ' ('+item.recommendedAmountCups+') '+'cups'))
                        }</Text>
                    </View>
                </View> : null}

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

            <View style={[styles.middleView]}>

                {<View style={{ marginTop: hp('2%') }}>

                    <TouchableOpacity disabled = {!props.foodEditObj ? false : true} style={[CommonStyles.dateBtnStyle, {}]} onPress={() => { dateTopBtnAction() }}>
                        <Text style={[CommonStyles.dateBtnTextStyle]}>{datePickerDate ? datePickerDate.toString() : 'Date'}</Text>
                        <Image source={calenderButtonImg} style={[CommonStyles.searchCalImageStyle, { width: Platform.isPad ? wp('4%') : wp('6%'), }]} />
                    </TouchableOpacity>

                </View>}

                <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>

                    {props.isRecFood ? <View style={{ marginTop: hp('2%') }}>
                        <FlatList
                            style={[styles.flatListStyle]}
                            data={foodHistoryIntakeObj && foodHistoryIntakeObj.recommondedDiet ? foodHistoryIntakeObj.recommondedDiet : undefined}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => "" + index}
                        />
                    </View> : null}

                    <View style={styles.otherFoodMainViewStyle}>

                        <Text numberOfLines={2} style={[styles.confirmTextStyle, {}]}>{'Are you feeding your pet anything other than the recommended food?'}</Text>
                        <View style={styles.radioBckViewStyle}>

                            <TouchableOpacity onPress={() => enableOtherFoodAction(2)} style={{ flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={props.isOtherFood ? rSelectedImg : rUnSelectedImg} style={[styles.rImageStyle, { width: Platform.isPad ? wp('3.5%') : wp('5%'), tintColor: 'green' }]} />
                                <Text style={[styles.optTexStyle, {}]}>{'Yes'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => enableOtherFoodAction(1)} style={{ flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={props.isOtherFood ? rUnSelectedImg : rSelectedImg} style={[styles.rImageStyle, { width: Platform.isPad ? wp('3.5%') : wp('5%'), tintColor: 'green' }]} />
                                <Text style={[styles.optTexStyle, {}]}>{'No'}</Text>
                            </TouchableOpacity>

                        </View>
                    </View>

                    {props.isOtherFood ? <View style={[styles.otherFoodListViewStyle]}>

                        <View style={{width: wp('90%'),alignSelf:'center'}}>
                            <Text style={[styles.confirmTextStyle1, {}]}>{'What else are you feeding your pet?'}</Text>
                        </View>
                        <View style={{ marginTop: hp('1%') }}>

                            <FlatList
                                style={[styles.flatListStyle, {}]}
                                data={foodHistoryIntakeObj && foodHistoryIntakeObj.otherFoods ? foodHistoryIntakeObj.otherFoods : undefined}
                                renderItem={renderOtherFoods}
                                keyExtractor={(item, index) => "" + index}
                            />

                        </View>

                    </View> : null}

                    {props.isFeedback && props.isRecFood ? <View style={[styles.feedbackCellBackViewStyle, { alignItems: 'center',...CommonStyles.shadowStyle,  }]}>

                        <TouchableOpacity onPress={() => { set_isFeedbackExpand(!isFeedbackExpand) }} style={{ width: wp('90%'), height: isFeedbackExpand ? hp('5%') : hp('5%'), alignSelf: 'center', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text numberOfLines={2} style={[styles.recFoodTexStyle, {}]}>{'Feedback'}</Text>
                            {<Image source={isFeedbackExpand ? upButtonImg : downButtonImg} style={[styles.imageStyle, { width: Platform.isPad ? wp('2.5%') : wp('4%') }]} />}
                        </TouchableOpacity>

                        {isFeedbackExpand ?
                            <FlatList
                                style={[styles.flatListStyle, { marginTop: hp('1%') }]}
                                data={foodHistoryIntakeObj && foodHistoryIntakeObj.dietFeedback ? foodHistoryIntakeObj.dietFeedback : undefined}
                                renderItem={renderFeedbackItem}
                                keyExtractor={(item, index) => "" + index}
                            /> : null}

                    </View> : null}

                </KeyboardAwareScrollView>

            </View>

            {!isToDate ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'SUBMIT'}
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

            {isDateVisible ? <View style={[CommonStyles.popSearchViewStyle, { height: hp('55%'), justifyContent: 'center' }]}>

                <View style={CommonStyles.datePickerMViewStyle}>

                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginBottom: hp('2%'), width: wp('90%'), alignSelf: 'center' }}>
                        <TouchableOpacity style={CommonStyles.dteTouchBtnStyle} onPress={() => cancelAction()}>
                            <Text style={CommonStyles.doneTexStyle}>{'Cancel'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={CommonStyles.dteTouchBtnStyle} onPress={() => doneAction()}>
                            <Text style={CommonStyles.doneTexStyle}>{'Done'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={CommonStyles.datePickerSubViewStyle}>
                        <DatePicker
                            date={datePickerDate1 ? datePickerDate1 : new Date()}
                            onDateChange={(date) => { set_datePickerDate1(date) }}
                            mode={"date"}
                            textColor={'black'}
                            maximumDate={new Date()}
                            minimumDate={minimumDate ? new Date(minimumDate) : new Date('1900-01-01')}
                            style={CommonStyles.datePickeStyle}
                        />
                    </View>
                </View>

            </View> : null}

            {props.isListView || props.isOtherList ? <View style={[CommonStyles.droDownViewStyle, { height: hp("25%"), }]}>

                <View style={[CommonStyles.dropDownFlatview, { height: hp("5%"), flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={[CommonStyles.dropDownHeaderTextStyle, { flex: 1.5, textAlign: 'right' }]}>{'Select Units'}</Text>
                    <TouchableOpacity style={[styles.dteTouchBtnStyle, { flex: 1 }]} onPress={() => cancelDrop()}>
                        <Text style={[styles.doneTexStyle, { textAlign: 'right' }]}>{'Cancel'}</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    style={CommonStyles.dropDownFlatcontainer}
                    data={props.isCalDrop ? props.otherFoodUnitsArray : props.isConsumedDrop ? props.consumedUnitsArray : undefined}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => actionOnOptiontype(props.isCalDrop ? 101 : 100, item)}>
                            <View style={CommonStyles.dropDownFlatview}>
                                <Text style={[CommonStyles.dropDownTextStyle]}>{item.unit}</Text>
                            </View>
                        </TouchableOpacity>)}
                    enableEmptySections={true}
                    keyExtractor={(item) => item.name}
                />

            </View> : null}

            {props.isLoading ? <LoaderComponent isLoader={true} loaderText={'Please wait..'} isButtonEnable={false} /> : null}

        </View>
    );
}

export default FoodIntakeUI;

const styles = StyleSheet.create({

    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
    },

    headingView: {
        width: wp('100%'),
        height: hp('6%'),
        flexDirection: 'row',
        alignItems: 'center',
    },

    middleView: {
        width: wp('100%'),
        height: hp('77%'),
        alignItems: 'center',
    },

    hTextextStyle: {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: 'black',
        margin: hp('0.5%'),
    },

    recFoodTexStyle: {
        fontSize: 16,
        ...CommonStyles.textStyleBold,
        color: 'black',
        margin: hp('0.5%'),
    },

    feedQTexStyle: {
        fontSize: 16,
        ...CommonStyles.textStyleMedium,
        color: 'black',
        margin: hp('0.5%'),
        opacity: 0.7
    },

    foddOptionsTextStyle: {
        fontSize: 14,
        ...CommonStyles.textStyleMedium,
        color: '#9A9A9A',
        margin: hp('0.5%'),
        width: wp('75%'),
    },

    flatListStyle: {
        width: wp('100%'),
    },

    cellBackViewStyle: {
        marginBottom: wp('1%'),
        borderRadius: 6,
        backgroundColor: 'white',
        width: wp('93%'),
        minHeight: hp('12%'),
        alignSelf: 'center',
    },

    feedbackCellBackViewStyle: {
        marginBottom: hp('2%'),
        borderRadius: 6,
        backgroundColor: 'white',
        width: wp('93%'),
        alignSelf: 'center',
        marginTop: hp('2%'),
    },

    foodGrmsViewStyle: {
        minWidth: wp('13%'),
        height: hp('2.6%'),
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#fc5b04',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: wp('1%'),
    },

    foodGrmsTextStyle: {
        fontSize: fonts.fontTiny,
        ...CommonStyles.textStyleSemiBold,
    },

    barPercentTextStyle: {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
    },

    recFoodTexStyle1: {
        fontSize: 14,
        ...CommonStyles.textStyleSemiBold,
        color: 'black',
    },

    otherFoodMainViewStyle: {
        width: wp('90%'),
        height: hp('10%'),
        marginTop: hp('2%'),
        alignSelf: 'center'
    },

    otherFoodListViewStyle: {
        width: wp('93%'),
        marginTop: hp('2%'),
        alignSelf: 'center',
    },

    radioBckViewStyle: {
        width: wp('35%'),
        height: hp('4%'),
        marginTop: hp('1%'),
        borderRadius: 5,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#dedede',
    },

    confirmTextStyle: {
        fontSize: 16,
        ...CommonStyles.textStyleRegular,
        color: 'black',
    },

    optTexStyle: {
        fontSize: 16,
        ...CommonStyles.textStyleSemiBold,
        color: 'black',
        margin: hp('0.5%'),
    },

    confirmTextStyle1: {
        fontSize: 16,
        ...CommonStyles.textStyleSemiBold,
        color: 'grey',
    },

    otherFoodRenderView: {
        marginBottom: hp('2%'),
        minHeight: hp('7%'),
        width: wp('93%'),
        borderRadius: 5,
        backgroundColor: 'white',
        // margin: 5,
    },

    otherFoodRenderTexStyle: {
        fontSize: 14,
        ...CommonStyles.textStyleRegular,
        color: 'grey',
        margin: hp('0.5%'),
    },

    imageStyle: {
        height: hp('3%'),
        width: wp('3%'),
        resizeMode: "contain",
        tintColor: 'grey'
    },

    collapsedBodyStyle: {
        width: wp('90%'),
        minHeight: hp('10%'),
        alignItems: 'center',
        justifyContent: 'center',
    },

    cellOtherBackViewStyle: {
        marginBottom: wp('1%'),
        width: wp('90%'),
        minHeight: hp('15%'),
        alignSelf: 'center',
    },

    editBtnStyle: {
        width: wp('6%'),
        aspectRatio: 1,
        marginRight: hp('1%'),
        alignItems: 'center',
        justifyContent: 'center'
    },

    editBtnTextStyle: {
        fontSize: 25,
        ...CommonStyles.textStyleSemiBold,
        // backgroundColor:'red',
        textAlign:'center'
    },

    rImageStyle: {
        height: hp('5%'),
        width: wp('5%'),
        resizeMode: "contain",
    },

    dteTouchBtnStyle: {
        height: hp('3%'),
        width: wp('30%'),
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },

    doneTexStyle: {
        fontSize: fonts.fontSmall,
        fontFamily: 'Barlow-Medium',
        color: 'black',
    },

});