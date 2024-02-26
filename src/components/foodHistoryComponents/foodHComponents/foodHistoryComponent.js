import React, { useState, useEffect, useRef } from 'react';
import { BackHandler, Pressable, Modal, Text, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import FoodHistoryUI from './foodHistoryUI.js';
import * as DataStorageLocal from "../../../utils/storage/dataStorageLocal.js";
import * as Constant from "../../../utils/constants/constant.js";
import * as firebaseHelper from '../../../utils/firebase/firebaseHelper.js';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from '../../../utils/authorisedComponent/authorisedComponent.js';
import * as ServiceCalls from '../../../utils/getServicesData/getServicesData.js';
import moment from "moment";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import Fonts from '../../../utils/commonStyles/fonts'

const FoodHistoryComponent = ({ setLoaderValue, updatePopup, fCalenderSdate, fCalenderedate, petId, setDietInfo, selectdCategoryUnit, route, ...props }) => {

  const [noLogsShow, set_noLogsShow] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fIntakeHistoryServiceObj, setfIntakeHistoryServiceObj] = useState(undefined);
  const [chartData, set_ChartData] = useState(undefined);
  const [stakedChartData, set_stackedChartData] = useState(undefined);
  const [dietList, set_dietList] = useState(undefined);
  const [selectedDatModel, set_SelectedDataModel] = useState(undefined);
  const [selectedIndex, set_SelectedIndex] = useState(undefined);

  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);
  let stakedChartDataRef = useRef(0);
  let chartDataRef = useRef(undefined);
  let dietDisplayName = useRef(undefined);

  React.useEffect(() => {

    if (fCalenderSdate && fCalenderedate) {
      getFoodIntakeHistoryApi(petId, fCalenderSdate, fCalenderedate)
    } else if (fCalenderSdate) {

      getFoodIntakeHistoryApi(petId, fCalenderSdate, fCalenderedate)
    }

  }, [fCalenderSdate, fCalenderedate, selectdCategoryUnit]);

  const getFoodIntakeHistoryApi = async (petId, fCalenderSdate, fCalenderEdate) => {

    setLoaderValue(true);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let fIntakeHistoryServiceObj = await ServiceCalls.getFoodIntakeHistoryApi(petId, client, moment(fCalenderSdate, 'MM-DD-YYYY').format("YYYY-MM-DD"), fCalenderedate == undefined ? moment(fCalenderSdate, 'MM-DD-YYYY').format("YYYY-MM-DD") : moment(fCalenderEdate, 'MM-DD-YYYY').format("YYYY-MM-DD"), token);
    
    setLoaderValue(false);
    set_ChartData([])
    setfIntakeHistoryServiceObj(undefined)
    chartDataRef.current = []
    set_stackedChartData([]);
    stakedChartDataRef.current = [];

    if (fIntakeHistoryServiceObj && fIntakeHistoryServiceObj.logoutData) {
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if (fIntakeHistoryServiceObj && !fIntakeHistoryServiceObj.isInternet) {
      updatePopup({ title: Constant.ALERT_NETWORK, msg: Constant.NETWORK_STATUS, isPop: true })
      return;
    }

    if (fIntakeHistoryServiceObj && fIntakeHistoryServiceObj.statusData) {
      if (fIntakeHistoryServiceObj.responseData) {

        setfIntakeHistoryServiceObj(fIntakeHistoryServiceObj)

        if (fIntakeHistoryServiceObj != null && fIntakeHistoryServiceObj != undefined) {
          var list = [];
          if (fIntakeHistoryServiceObj.responseData.dietList) {
            set_dietList(fIntakeHistoryServiceObj.responseData.dietList);
          }
        }
        if (fIntakeHistoryServiceObj != null) {
          if (fIntakeHistoryServiceObj.responseData.dietList.length > 0) {
            
            let dietId = fIntakeHistoryServiceObj.responseData.dietList[0].dietId;
            let dietName = fIntakeHistoryServiceObj.responseData.dietList[0].dietName;
            dietDisplayName.current = dietName
            setDietInfo(dietId, dietName);
          }
        }
        if (fIntakeHistoryServiceObj != null && fIntakeHistoryServiceObj != undefined) {
          var list = [];
          if (fIntakeHistoryServiceObj.responseData.foodIntakeHistory) {
            for (var index = 0; index < fIntakeHistoryServiceObj.responseData.foodIntakeHistory.length; index++) {

              var date1 = fIntakeHistoryServiceObj.responseData.foodIntakeHistory[index].intakeDate;
              let intakeDate = moment(date1).format("MMM DD")
              let dietSelectedIndex = index;

              if (fIntakeHistoryServiceObj.responseData.foodIntakeHistory[index].intakeComparision.length > 0) {
                var intakeComparision = fIntakeHistoryServiceObj.responseData.foodIntakeHistory[index].intakeComparision[0];
                let temp1 = {
                  quantityRecommended: selectdCategoryUnit == "grams" ? intakeComparision.quantityRecommended : intakeComparision.quantityRecommendedCups,
                  quantityConsumed: selectdCategoryUnit == "grams" ? intakeComparision.quantityConsumed : intakeComparision.quantityConsumedCups,
                  value: selectdCategoryUnit == "grams" ? intakeComparision.quantityRecommended : intakeComparision.quantityRecommendedCups,
                  frontColor: selectdCategoryUnit == "grams" ? '#54D86F' : '#5496D8',
                  spacing: 0,
                  label: intakeDate,
                  dietName : intakeComparision.dietName,
                  onPress: () => onPressBarChart("barchart", intakeDate, dietSelectedIndex, temp1),
                }
                let temp2 = {
                  value: selectdCategoryUnit == "grams" ? intakeComparision.quantityConsumed : intakeComparision.quantityConsumedCups,
                  frontColor: selectdCategoryUnit == "grams" ? '#FF8A00' : '#0C379A',
                  quantityRecommended: selectdCategoryUnit == "grams" ? intakeComparision.quantityRecommended : intakeComparision.quantityRecommendedCups,
                  quantityConsumed: selectdCategoryUnit == "grams" ? intakeComparision.quantityConsumed : intakeComparision.quantityConsumedCups,
                  dietName : intakeComparision.dietName,
                  onPress: () => onPressBarChart("barchart", intakeDate, dietSelectedIndex, temp2)
                };

                list.push(temp1, temp2);
              } else {

                let temp1 = {
                  quantityRecommended: 0,
                  quantityConsumed: 0,
                  value: 0,
                  frontColor: '#54D86F',
                  spacing: 0,
                  label: intakeDate,
                  dietName : '',
                  onPress: () => onPressBarChart("barchart", intakeDate, dietSelectedIndex, temp1),
                }
                let temp2 = {
                  value: 0, quantityRecommended: 0,
                  quantityConsumed: 0, frontColor: '#FF8A00', 
                  dietName : '',
                  onPress: () => onPressBarChart("barchart", intakeDate, dietSelectedIndex, temp2)
                };

                list.push(temp1, temp2);
              }
            }
          }
        }
        chartDataRef.current = list;
        set_ChartData(list);

        if (fIntakeHistoryServiceObj != null && fIntakeHistoryServiceObj != undefined) {
          var list = [];

          if (fIntakeHistoryServiceObj.responseData.foodIntakeHistory) {
            for (var index = 0; index < fIntakeHistoryServiceObj.responseData.foodIntakeHistory.length; index++) {
              var date1 = fIntakeHistoryServiceObj.responseData.foodIntakeHistory[index].intakeDate;
              let intakeDate = moment(date1).format("MMM DD")
              let dietSelectedIndex = index;
              const dietNames = ["study diet", 'wet food', 'dry food', 'purchased food', 'human food', 'treats', 'other']
              var stacks = [];
              const colors = ["#32AA4C", '#54D86F', '#82E596', '#B7F2C3', '#FF8A00', '#FDB35B', '#FFD4A1']

              for (var dietIndex = 0; dietIndex < dietNames.length; dietIndex++) {

                if (fIntakeHistoryServiceObj.responseData.foodIntakeHistory[index].intakeDistribution.length == 0) {

                  var temp2 = {
                    value: 0,
                    color: colors[dietIndex],
                  };
                }
                else {
                  var distList = fIntakeHistoryServiceObj.responseData.foodIntakeHistory[index].intakeDistribution;

                  if (dietIndex == 0) {
                    let dietId = -1;
                    if (fIntakeHistoryServiceObj.responseData.dietList.length > 0) {

                      for (let dId = 0; dId < fIntakeHistoryServiceObj.responseData.dietList.length; dId++) {
                        dietId = fIntakeHistoryServiceObj.responseData.dietList[dId].dietId;
                        var arrList = distList.filter(item => item.dietId == dietId);
                        if (arrList.length > 0) {
                          if (arrList[0].percentConsumed != 0) {
                            var temp1 = {
                              value: arrList[0].percentConsumed,
                              color: colors[dietIndex],
                              label: fIntakeHistoryServiceObj.responseData.dietList[dId].dietName
                            };
                            stacks.push(temp1);
                          }
                        }
                      }
                    }

                  } else {
                    var arrList = distList.filter(item => item.dietName.toLowerCase() == dietNames[dietIndex].toLowerCase());
                    if (arrList.length > 0) {
                      if (arrList[0].percentConsumed != 0) {
                        var temp1 = {
                          value: arrList[0].percentConsumed,
                          color: colors[dietIndex],
                          label: dietNames[dietIndex]
                        };
                        stacks.push(temp1);
                      }
                    }
                  }
                }

              }
              if (stacks.length > 0) {
                let temp3 = {
                  label: intakeDate,
                  stacks: stacks,
                  onPress: () => onPress("stackedchart", intakeDate, dietSelectedIndex, temp3),
                };
                list.push(temp3);
              } else {
                let temp3 = {
                  label: intakeDate,
                  stacks: [{
                    value: 0,
                    color: '#32AA4C',
                  }],
                  onPress: () => onPress("stackedchart", intakeDate, dietSelectedIndex, temp3),
                };
                list.push(temp3);
              }
            }

          }
          set_stackedChartData(list);
          stakedChartDataRef.current = list;
        }
        // set_noLogsShow(false);             
      } else {
        // set_noLogsShow(true);
      }
    } else {
      updatePopup({ title: Constant.ALERT_DEFAULT_TITLE, msg: Constant.SERVICE_FAIL_MSG, isPop: true })
    }

    if (stakedChartDataRef.current.length == 0 && chartDataRef.current.length == 0) {
      set_noLogsShow(true);
    } else {
      set_noLogsShow(false);
    }

    if (fIntakeHistoryServiceObj && fIntakeHistoryServiceObj.error) {
      let errors = fIntakeHistoryServiceObj.error.length > 0 ? fIntakeHistoryServiceObj.error[0].code : '';
      updatePopup({ title: Constant.ALERT_DEFAULT_TITLE, msg: Constant.SERVICE_FAIL_MSG, isPop: true })
    }

  };

  const displayModelSheet = () => {
    setModalVisible(true)
  }

  const onPressBarChart = (type, label, selectIndex, temp1) => {

    let obj = {
      "type": type,
      "sDate": label,
      "quantityConsumed": temp1.quantityConsumed,
      "quantityRecommended": temp1.quantityRecommended,
      "dietName": temp1.dietName
    }
    set_SelectedDataModel(obj);
    setModalVisible(true)
  }


  const onPress = (type, label, selectIndex, tenp1) => {

    if (type == "stackedchart") {
      if (stakedChartDataRef.current.length < selectIndex) {
        return;
      }

      set_SelectedIndex(selectIndex);
      let model = stakedChartDataRef.current[selectIndex];

      var stacksList = [];
      for (let index = 0; index < model.stacks.length; index++) {
        let stack = model.stacks[index];
        if (stack.value != 0) {
          stacksList.push(stack);
        }
      }
      let obj = {
        "type": type,
        "sDate": model.label,
        "stacksList": stacksList
      }
      set_SelectedDataModel(obj);
      setModalVisible(true)
    } else {

      if (chartDataRef.current.length < selectIndex) {
        return;
      }

      set_SelectedIndex(selectIndex);
      let model = chartDataRef.current[selectIndex];

      let obj = {
        "type": type,
        "sDate": model.label,
        "quantityConsumed": model.quantityConsumed,
        "quantityRecommended": model.quantityRecommended,
        "dietName": dietDisplayName1.current
      }
      set_SelectedDataModel(obj);
      setModalVisible(true)
    }

  }

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', marginBottom: hp('2%') }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp('70%'), alignItems:'center' }}>

                {<GetDate selectedDatModel={selectedDatModel} />}

                <TouchableOpacity style={{}} onPress={() => {
                  setModalVisible(false);
                  set_SelectedDataModel(undefined);
                }}>
                  <Image resizeMode = {'contain'} style={{ width: wp('6%'),height: hp('6%'),}} source={require("./../../../../assets/images/otherImages/svg/canceRedIcon.svg")}></Image>
                </TouchableOpacity>
              </View>
            </View>

            {<CreateLoop selectedDatModel={selectedDatModel} selectdCategoryUnit={selectdCategoryUnit} />}

          </View>
        </View>
      </Modal>
      <FoodHistoryUI
        displayModelSheet={displayModelSheet}
        chartData={chartData}
        noLogsShow={noLogsShow}
        stakedChartData={stakedChartData}
        selectdCategoryUnit={selectdCategoryUnit}
      />
    </View>
  );

}

const CreateLoop = ({ selectedDatModel, selectdCategoryUnit, ...props }) => {
  
  var myloop = [];

  if (selectedDatModel == undefined) {
    return <View></View>
  }
  if (selectedDatModel.type == "barchart") {
    return <View style={{ width: wp('70%'), flexDirection: 'column' }}>
      <View style={{ width: wp('70%'), flexDirection: 'row', justifyContent: 'space-between', }}>
        <Text style={[styles.recFoodTexStyle]}>{selectedDatModel.dietName}</Text>
      </View>
      <View style={[styles.separatorViewStyle, { backgroundColor: '#dedede', marginBottom: 10, marginTop: 10 }]} />
      <View style={{ width: wp('70%'), flexDirection: 'row', justifyContent: 'space-between', }}>
        <Text style={[styles.recFoodTexStyle]}>Recommend Quantity</Text>
        {selectdCategoryUnit == "grams" ?
          <Text style={[styles.recFoodTexStyle, { color: '#54D86F' }]}>{selectedDatModel.quantityRecommended} Grams</Text> :
          <Text style={[styles.recFoodTexStyle, { color: '#54D86F' }]}>{selectedDatModel.quantityRecommended} Cups</Text>}
      </View>
      <View style={[styles.separatorViewStyle, { backgroundColor: '#dedede', marginBottom: 10, marginTop: 10 }]} />
      <View style={{ width: wp('70%'), flexDirection: 'row', justifyContent: 'space-between', }}>
        <Text style={[styles.recFoodTexStyle]}>Consumed Quantity</Text>
        {selectdCategoryUnit == "grams" ?
          <Text style={[styles.recFoodTexStyle, { color: '#54D86F' }]}>{selectedDatModel.quantityConsumed} Grams</Text> :
          <Text style={[styles.recFoodTexStyle, { color: '#54D86F' }]}>{selectedDatModel.quantityConsumed} Cups</Text>}
      </View>
    </View>
  }
  if (selectedDatModel.stacksList == undefined || selectedDatModel.stacksList.length == 0) {
    return <View></View>
  }

  // Outer loop to create parent
  for (let i = 0; i < selectedDatModel.stacksList.length; i++) {
    myloop.push(
      <View style={{ width: wp('70%'), flexDirection: 'column', }}>

        <View style={{ width: wp('70%'), flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[styles.recFoodTexStyle, { textTransform: 'capitalize' }]}>{selectedDatModel.stacksList[i].label}</Text>
          <Text style={[styles.recFoodTexStyle, { color: '#54D86F' }]}>{selectedDatModel.stacksList[i].value}%</Text>
        </View>
        <View style={[styles.separatorViewStyle, { backgroundColor: '#dedede', marginBottom: 10, marginTop: 10 }]} />

      </View>

    );
  }

  return myloop
}
const GetDate = ({ selectedDatModel, ...props }) => {
  
  var myloop = [];

  if (selectedDatModel == undefined) {
    return <View></View>
  }
  if (selectedDatModel.sDate == undefined) {
    return <View></View>
  }

  // Outer loop to create parent
  myloop.push(
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
      <Text style={styles.recFoodTexStyle}>Date: {selectedDatModel.sDate}</Text>

    </View>
  );

  return myloop
}
renderButtons = () => {

  return selectedDatModel.stacksList.map((item) => {
    return (
      <Text style={textStyle}>
        {item.label}
      </Text>
    );
  });
}


const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 22,
  },
  textStyle: {
    fontSize: fonts.fontXLarge,
    ...CommonStyles.textStyleBold,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  separatorViewStyle: {
    height: hp('0.1%'),
    width: wp('70%'),
    bottom: 0
  },
  subHeaderTextStyle: {
    ...CommonStyles.textStyleBold,
    fontSize: Fonts.fontNormal,
    color: 'black',
  },
  recFoodTexStyle: {
    fontSize: Fonts.fontXSmall,
    ...CommonStyles.textStyleSemiBold,
    color: 'black',
    marginRight: hp('0.5%'),
  },
});


export default FoodHistoryComponent;