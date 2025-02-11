import React, { useState, useEffect,useRef } from 'react';
import { View, BackHandler } from 'react-native';
import NotificationsUI from './notificationsUI.js';
import * as Constant from "./../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import moment from 'moment';
import * as AppPetsData from '../../utils/appDataModels/appPetsModel.js';
import { enableScreens } from 'react-native-screens';

let trace_inNotificationScreen;
const MARK_ALL_READ = 100;

const NotificationsComponent = ({ navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [alertTitle, set_alertTitle] = useState('');
    const [date, set_Date] = useState(new Date());
    const [notificationsArray, set_notificationsArray] = useState([]);
    const [fCalenderSdate, set_fCalenderSdate] = useState(new Date());
    const [fCalenderedate, set_fCalenderedate] = useState(new Date());
    const [minDate, set_minDate] = useState(new Date());
    const [isDateVisible, set_isDateVisible] = useState(undefined);
    const [isLeftBtnEnable, set_isLeftBtnEnable] = useState(false);
    const [popType, set_popType] = useState(0);
    const [notificationUpdate, set_notificationUpdate] = useState(null);
    const [showMarkBtn, set_showMarkBtn] = useState(false);
    const [isDateFilterApplied, set_isDateFilterApplied] = useState(false);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let pageNo = useRef(1);
    let totalNotificationsRef = useRef([]);
    let totalNotificationsCount = useRef(20);
    let notificationsSDate = useRef(new Date().getDate() - 30);
    let notificationsEDate = useRef(new Date());

    React.useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        updateNotificationFlow();
        prepareDates();

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            notificationStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_add_notification_screen);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_add_notification_screen, "User in Notification Screen", ''); 
        });

        const unsubscribe = navigation.addListener('blur', () => {
            notificationStop();
        });

        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
            focus();
            unsubscribe();
        };
        
    }, [route?.params.isNotificationCount]);

    const notificationStart = async () => {
        trace_inNotificationScreen = await perf().startTrace('t_inNotificationScreen');
    };
    
    const notificationStop = async () => {
        await trace_inNotificationScreen.stop();
    };

    const updateNotificationFlow = async () => {
        await DataStorageLocal.removeDataFromAsync(Constant.IS_FROM_NOTIFICATION);
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const checkNotificationCount = (notficationArray) => {

        if(notficationArray && notficationArray.length > 0) {

            if(notficationArray[0].data && notficationArray[0].data.length > 0 && notficationArray[0].data[0].unReadCount > 0) {
                set_showMarkBtn(true);
            } else {
                set_showMarkBtn(false);
            }

        }

    }

    // navigate back to the screen from where this screen is called
    const navigateToPrevious = async () => {
        navigation.goBack();
    };

    const prepareDates = () => {
        var tempDte = new Date();
        tempDte.setDate(tempDte.getDate() - 30);
        set_minDate(tempDte)
        set_fCalenderSdate(tempDte)
        notificationsSDate.current = moment(tempDte).format('YYYY-MM-DD');
        notificationsEDate.current = moment(new Date()).format('YYYY-MM-DD');
        totalNotificationsRef.current = [];
        getNotifications(pageNo.current,totalNotificationsCount.current,notificationsSDate.current,notificationsEDate.current);
    };

    const getNotifications = async (pageNo,count,startDate, endDate) => {

        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        set_isLoading(true);
        let apiMethod = apiMethodManager.GET_NOTIFICATIONS + client + "/" + pageNo + "/" + count +'?searchText='+''+'&fromDate='+startDate+'&toDate='+endDate;
        let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
    
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
          
          if (apiService.data.notifications && apiService.data.notifications.length > 0) {
            prepareNotificationsData(apiService.data.notifications);
            if(apiService.data.notifications[0].unReadCount > 0) {
                set_showMarkBtn(true);
            } else {
                set_showMarkBtn(false);
            }
            
          } else {
            prepareNotificationsData(apiService.data.notifications);
          }
          
        } else if(apiService && apiService.isInternet === false) {
          
          createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, true, false,0);
          return;
                
        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true,false,0); 
        } else {
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,false,0); 
        }
    };

    const prepareNotificationsData = async (notificationArray) => {

        if(totalNotificationsRef.current && totalNotificationsRef.current.length > 0) {
            totalNotificationsRef.current = [...totalNotificationsRef.current ,...notificationArray]
        } else {
            totalNotificationsRef.current = notificationArray
        }

        const groupByCategory = totalNotificationsRef.current.reduce((group, sections) => {
            const { notificationSentOn } = sections;
            group[moment(moment(notificationSentOn).toDate()).local().format('DD-MM-YY')] = group[moment(moment(notificationSentOn).toDate()).local().format('DD-MM-YY')] ?? [];
            group[moment(moment(notificationSentOn).toDate()).local().format('DD-MM-YY')].push(sections);
            return group;
        }, {});
            
        const groupArrays = Object.keys(groupByCategory).map(title => {
            return {
                title,
                data: groupByCategory[title]
            };
        });

        totalNotificationsCount.current = totalNotificationsRef.current.length;
        notificationsSDate.current = groupArrays && groupArrays.length > 1 ? groupArrays[groupArrays.length - 1].title : new Date();
        notificationsEDate.current =  groupArrays && groupArrays.length > 0 ? groupArrays[0].title : new Date();
        if(groupArrays && groupArrays.length === 0) {
            set_showMarkBtn(false);
        }
        set_notificationsArray(groupArrays);
        
    };

    const updateNotificationStatus = async (type,item) => {

        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        set_isLoading(true);
        let method = '?markAllAs='+''+'&markAs='+''+'&notificationId='+''
        if (type === 'all') {
            method = '?markAllAs='+'read'+'&markAs='+''+'&notificationId='+'';
        } else {
            method = '?markAllAs='+''+'&markAs='+'read'+'&notificationId='+item.notificationId;
        }
        let apiMethod = apiMethodManager.UPDATE_NOTIFICATION_STATUS + client + method;
        let apiService = await apiRequest.putData(apiMethod,'',Constant.SERVICE_JAVA);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        
        if(apiService && apiService.status) {
        
            if(type === 'all') {
                totalNotificationsRef.current = [];
                set_showMarkBtn(false)
                await getNotifications(pageNo.current,totalNotificationsCount.current,'','');
            } else {
                markNotificationRead(item);
            }
          
        } else if(apiService && apiService.isInternet === false) {

            set_isLoading(false);
            createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,false,0);
            return;

        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
            set_isLoading(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true,false,0); 
        } else {
            set_isLoading(false);
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,false,0); 
        }

    };

    const actionOnNotification = async (item) => {

        item.notificationType = 2
        let defaultPet = AppPetsData.petsData.defaultPet;
        if(item.notificationNameId === 1 || item.notificationNameId === 2 || item.notificationNameId === 6){
            ///ASSET DISCONNECTION NOTIFICATION - Navigate to Sensor List page
            navigation.navigate('AllDevicesListComponent',{petObject:defaultPet});
            await updateNotificationStatus("single",item);
            set_isLoading(false);
        } else if(item.notificationNameId === 7 || item.notificationNameId === 10){
            //PET FEEDING PREFERENCES NOTIFICATION- Navigate to Feeding Pet List page
            let foodPets = await permissionPetsAPI(11);

            if(foodPets && foodPets.length > 0) {

                let isPet = await findArrayElementByPetId(foodPets,item.petId);
                let tempPet = defaultPet;
                if(isPet){
                    tempPet = isPet
                    await DataStorageLocal.saveDataToAsync(Constant.FH_SELECTED_PET, JSON.stringify(isPet));
                } else {
                    tempPet = foodPets[0]
                    await DataStorageLocal.saveDataToAsync(Constant.FH_SELECTED_PET, JSON.stringify(foodPets[0]));
                }
                
                await DataStorageLocal.saveDataToAsync(Constant.FH_PETS_ARRAY, JSON.stringify(foodPets));
                navigation.navigate("FoodHistoryPetSelectionComponent",{petsArray:foodPets,defaultPetObj:tempPet});
                set_isLoading(false);
                await updateNotificationStatus("single",item);
                
            }

        } else if(item.notificationNameId === 11){
            //STUDY QUESTIONNAIRE NOTIFICATION- Navigate to Questionnaire List page
            let questPets = await permissionPetsAPI(2);        
            if(questPets && questPets.length > 0) {
            
                let isPet = await findArrayElementByPetId(questPets,item.petId);
                let tempPet = defaultPet;
                if(isPet){
                    tempPet = isPet
                    await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(isPet));
                } else {
                    tempPet = questPets[0]
                    await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(questPets[0]));
                }
    
                await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIR_PETS_ARRAY, JSON.stringify(questPets));
                navigation.navigate("QuestionnaireStudyComponent",{defaultPetObj:tempPet});
                await updateNotificationStatus("single",item);
                set_isLoading(false);
            } else {
                await DataStorageLocal.removeDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
                // createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.DETAILS_FETCH_FAIL,true,false,0);
            }

        } else {
            await updateNotificationStatus("single",item);
            markNotificationRead(item);
        }
    };

    const markNotificationRead = (item) => {

        let notficationArray = notificationsArray;
        let index = notficationArray.findIndex(obj => obj.title === moment(moment.utc(item.notificationSentOn).toDate()).local().format('DD-MM-YY'));
        if(index >= 0) {
            let notication = notficationArray[index];
            let index1 = notication.data.findIndex(obj => obj.notificationId === item.notificationId);
            notication.data[index1].isRead = 1

            if(notication.data[0].unReadCount > 0) {
                notication.data[0].unReadCount = notication.data[0].unReadCount - 1
            }
            
            notficationArray[index].data = notication.data;
            set_notificationsArray(notficationArray)
            checkNotificationCount(notficationArray);
        }
        if(notificationUpdate === 'update') {
            set_notificationUpdate('reUpdate');
        } else if(notificationUpdate === 'reUpdate') {
            set_notificationUpdate('autoUpdate');
        } else {
            set_notificationUpdate('update');
        }
    };

    const permissionPetsAPI = async (mId) => {

        let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        set_isLoading(true);
        isLoadingdRef.current = 1;
  
        let apiMethod = apiMethodManager.GET_PERMISSION_PETS + clientId + '/' + mId;
        let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        isLoadingdRef.current = 0;
  
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
              
          if(apiService.data.pets && apiService.data.pets.length > 0) {
            return apiService.data.pets;
          } else {
            createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.DETAILS_FETCH_FAIL,true,false,0);
          }
              
        } else if(apiService && apiService.isInternet === false) {
  
          createPopup(Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,true,false,0);
          return;
  
        } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
  
          createPopup(Constant.ALERT_DEFAULT_TITLE,apiService.error.errorMsg,true,false,0);
              
        } else {
  
          createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,true,false,0);
  
        }
  
    };

    function findArrayElementByPetId(array, petId) {
        return array.find((element) => {
          return element.petID === petId;
        })
    };

    const selectDateRangeBtnAction = () => {
        set_isDateVisible(!isDateVisible);
    };

    const cancelCalenderBtnAction = () => {
        set_isDateVisible(!isDateVisible);
    };

    const doneCalenderBtnAction = async (fStartDate, fEndDate) => {
        
        set_isDateVisible(!isDateVisible);
        totalNotificationsRef.current = [];
        pageNo.current = 1;
        if(fStartDate && fEndDate) {
            await getNotifications(1, 20,moment(fStartDate).format('YYYY-MM-DD'),moment(fEndDate).format('YYYY-MM-DD'));
            set_isDateFilterApplied(true);
            set_fCalenderSdate(moment(fStartDate));
            set_fCalenderedate(fEndDate);
        }else if(fStartDate) {
            getNotifications(1, 20,moment(fStartDate).format('YYYY-MM-DD'),moment(fStartDate).format('YYYY-MM-DD'));
            set_isDateFilterApplied(true);
            set_fCalenderSdate(fStartDate);
            set_fCalenderedate(fStartDate);
        }
    };

    const markAllRead = () => {
        createPopup(Constant.ALERT_DEFAULT_TITLE,Constant.MARK_ALL_READ,true,true,100);
    };

    const createPopup = (title,msg,isPop,isLeftBtnEnable,popTypeValue) => {
        set_alertTitle(title);
        set_popUpMessage(msg);
        set_isPopUp(isPop);
        set_isLeftBtnEnable(isLeftBtnEnable);
        set_popType(popTypeValue);
        
    };

    // By setting false, Popup will dissappear from the screen
    const popOkBtnAction = async (value) => {

        if(popType === MARK_ALL_READ) {
            createPopup('','',false,true,0);
            pageNo.current = 1;
            totalNotificationsCount.current = 20;
            set_isLoading(true);
            await updateNotificationStatus("all",'');

        }
        createPopup('','',false,true,0);
    };

    const popCancelBtnAction = (value) => {
        createPopup('','',false,true,0);
    };

    const notificationsOnEndReached = () => {
        pageNo.current = pageNo.current + 1;
        let endDate = fCalenderedate ? fCalenderedate : fCalenderSdate;
        getNotifications(pageNo.current,20,moment(fCalenderSdate).format('YYYY-MM-DD'),moment(endDate).format('YYYY-MM-DD'));
    };

    return (
        <NotificationsUI
            isLoading={isLoading}
            popUpMessage={popUpMessage}
            isPopUp={isPopUp}
            alertTitle={alertTitle}
            notificationsArray = {notificationsArray}
            notificationUpdate = {notificationUpdate}
            fCalenderSdate = {fCalenderSdate}
            fCalenderedate = {fCalenderedate}
            isDateVisible = {isDateVisible}
            minDate = {minDate}
            isLeftBtnEnable = {isLeftBtnEnable}
            showMarkBtn = {showMarkBtn}
            isDateFilterApplied = {isDateFilterApplied}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction={popOkBtnAction}
            actionOnNotification = {actionOnNotification}
            selectDateRangeBtnAction = {selectDateRangeBtnAction}
            cancelCalenderBtnAction = {cancelCalenderBtnAction}
            doneCalenderBtnAction = {doneCalenderBtnAction}
            markAllRead = {markAllRead}
            popCancelBtnAction = {popCancelBtnAction}
            notificationsOnEndReached = {notificationsOnEndReached}
        />
    );

}

export default NotificationsComponent;