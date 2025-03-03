import React, { useState, useRef } from 'react';
import { Modal, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import FoodHistoryUI from './foodHistoryUI.js';
import * as DataStorageLocal from "../../../utils/storage/dataStorageLocal.js";
import * as Constant from "../../../utils/constants/constant.js";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import Fonts from '../../../utils/commonStyles/fonts'
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';
import moment from 'moment';
import * as AppPetsData from '../../../utils/appDataModels/appPetsModel.js';

import CanceImg from "./../../../../assets/images/otherImages/svg/canceRedIcon.svg";

const FoodHistoryComponent = ({ setLoaderValue, updatePopup, fCalenderSdate, fCalenderedate, petId, setDietInfo, selectdCategoryUnit, route, ...props }) => {

  const [noLogsShow, set_noLogsShow] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fIntakeHistoryServiceObj, setfIntakeHistoryServiceObj] = useState(undefined);
  const [chartData, set_ChartData] = useState(undefined);
  const [stakedChartData, set_stackedChartData] = useState(undefined);
  const [dietList, set_dietList] = useState(undefined);
  const [selectedDatModel, set_SelectedDataModel] = useState(undefined);
  const [selectedIndex, set_SelectedIndex] = useState(undefined);
  const [petObj, set_petObj] = useState(undefined);

  let stakedChartDataRef = useRef(0);
  let chartDataRef = useRef(undefined);
  let dietDisplayName = useRef(undefined);

  React.useEffect(() => {

    getPetDetails()
    if (fCalenderSdate && fCalenderedate) {
      getFoodIntakeHistoryApi(petId, fCalenderSdate, fCalenderedate)
    } else if (fCalenderSdate) {

      getFoodIntakeHistoryApi(petId, fCalenderSdate, fCalenderedate)
    }
    
  }, [fCalenderSdate, fCalenderedate, selectdCategoryUnit]);

  const getPetDetails = async () => {
    let defaultPet = AppPetsData.petsData.defaultPet;
    if(defaultPet) {
      set_petObj(defaultPet)
    }
    
  }

  const getFoodIntakeHistoryApi = async (petId, fCalenderSdate, fCalenderEdate) => {

    let endDate = fCalenderEdate ? fCalenderEdate : fCalenderSdate
    setLoaderValue(true);
    let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let apiMethod = apiMethodManager.GET_INTAKE_STUDYDIET + petId + "&petParentId=" + client + "&dietId=0" + "&fromDate=" + fCalenderSdate + "&toDate=" + endDate;
    let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,'');
    setLoaderValue(false);
    set_ChartData([])
    setfIntakeHistoryServiceObj(undefined)
    chartDataRef.current = []
    set_stackedChartData([]);
    stakedChartDataRef.current = [];
        
      if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
        
        if (apiService.data && apiService.data.foodIntakeHistory) {

          setfIntakeHistoryServiceObj(apiService.data.foodIntakeHistory)
  
          if (apiService.data != null && apiService.data != undefined) {
            var list = [];
            if (apiService.data.dietList) {
              set_dietList(apiService.data.dietList);
            }
          }
          if (apiService.data != null) {
            if (apiService.data.dietList.length > 0) {
              
              let dietId = apiService.data.dietList[0].dietId;
              let dietName = apiService.data.dietList[0].dietName;
              dietDisplayName.current = dietName
              setDietInfo(dietId, dietName);
            }
          }
          if (apiService.data != null && apiService.data != undefined) {
            var list = [];
            if (apiService.data.foodIntakeHistory) {
              for (var index = 0; index < apiService.data.foodIntakeHistory.length; index++) {
  
                var date1 = apiService.data.foodIntakeHistory[index].intakeDate;
                let intakeDate = moment(date1).format("MMM DD")
                let dietSelectedIndex = index;
  
                if (apiService.data.foodIntakeHistory[index].intakeComparision.length > 0) {
                  var intakeComparision = apiService.data.foodIntakeHistory[index].intakeComparision[0];
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
  
          if (apiService.data != null && apiService.data != undefined) {
            var list = [];
  
            if (apiService.data.foodIntakeHistory) {
              for (var index = 0; index < apiService.data.foodIntakeHistory.length; index++) {
                var date1 = apiService.data.foodIntakeHistory[index].intakeDate;
                let intakeDate = moment(date1).format("MMM DD")
                let dietSelectedIndex = index;
                const dietNames = ["study diet", 'wet food', 'dry food', 'purchased food', 'human food', 'treats', 'other']
                var stacks = [];
                const colors = ["#32AA4C", '#54D86F', '#82E596', '#B7F2C3', '#FF8A00', '#FDB35B', '#FFD4A1']
  
                for (var dietIndex = 0; dietIndex < dietNames.length; dietIndex++) {
  
                  if (apiService.data.foodIntakeHistory[index].intakeDistribution.length == 0) {
  
                    var temp2 = {
                      value: 0,
                      color: colors[dietIndex],
                    };
                  }
                  else {
                    var distList = apiService.data.foodIntakeHistory[index].intakeDistribution;
  
                    if (dietIndex == 0) {
                      let dietId = -1;
                      if (apiService.data.dietList.length > 0) {
  
                        for (let dId = 0; dId < apiService.data.dietList.length; dId++) {
                          dietId = apiService.data.dietList[dId].dietId;
                          var arrList = distList.filter(item => item.dietId == dietId);
                          if (arrList.length > 0) {
                            if (arrList[0].percentConsumed != 0) {
                              var temp1 = {
                                value: arrList[0].percentConsumed,
                                color: colors[dietIndex],
                                label: apiService.data.dietList[dId].dietName
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
          set_noLogsShow(true);
        }
          
      } else if(apiService && apiService.isInternet === false) {
        updatePopup({ title: Constant.ALERT_NETWORK, msg: Constant.NETWORK_STATUS, isPop: true })
        return;
      } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
        updatePopup({ title: Constant.ALERT_DEFAULT_TITLE, msg: apiService.error.errorMsg, isPop: true })
          
      } else {
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
                  <CanceImg width={wp('6%')} height = {hp('6%')}/>
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
        petObj = {petObj}
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