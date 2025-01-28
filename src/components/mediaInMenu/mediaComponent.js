import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import MediaUI from './mediaUI';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inMediaScreen;

const MediaComponent = ({ navigation, route, ...props }) => {
  const [isLoading, set_isLoading] = useState(false);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [data_Observations, setData_Observations] = useState([]);
  const [date, set_Date] = useState(new Date());

  var searchText = useRef('');
  var stopPagination = useRef(false);
  var totalRecords_observations = useRef([]);

  useEffect(() => {
    getLastweekDate();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      mediaScreenStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_media_screen);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_media_screen, "User in Media Main Screen", ''); 
    });
    
    const unsubscribe = navigation.addListener('blur', () => {
      mediaScreenStop();
    });

    return () => {
      focus();
      unsubscribe();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };

  }, []);

  const mediaScreenStart = async () => {
    trace_inMediaScreen = await perf().startTrace('t_inMediaMainScreen');
  };

  const mediaScreenStop = async () => {
    await trace_inMediaScreen.stop();
  };

  const getLastweekDate = () => {
    const currentDate = moment(); // today's date
    const previousDate = moment().subtract(30, 'days'); // previous dates

    const startDate = previousDate.format('YYYY-MM-DD');
    const endDate = currentDate.format('YYYY-MM-DD');

    getPetsMediaData('Observations', 1, "", startDate, endDate)
  }

  const getPetsMediaData = async (type, pageNumber, searchTextEff, startDate, endDate) => {
    if (pageNumber === 1) {
      totalRecords_observations.current = []
      setData_Observations([])
    }

    getMediaObservations(type, pageNumber, searchTextEff, startDate, endDate)

  }

  const getMediaObservations = async (type, pageNumber, searchTextEff, startDate, endDate) => {
    if (pageNumber === 1) {
      stopPagination.current = false
    }
    if (stopPagination.current) return

    try {
      set_isLoading(true);
      let clientID = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);

      let apiMethod = ''
      if (type === 'Observations') {
        apiMethod += apiMethodManager.GET_PET_MEDIA_OBSERVATIONS + clientID + "/" + pageNumber + "/10";
      } else {
        apiMethod += apiMethodManager.GET_PET_MEDIA_BFI + clientID + "/" + pageNumber + "/10";
      }
      if (searchTextEff && searchTextEff !== null && searchTextEff !== undefined) {
        apiMethod += "?searchText=" + searchTextEff
      } else {
        apiMethod += "?searchText=" + ""
      }

      if (startDate && startDate !== null && startDate !== undefined) {
        apiMethod += "&fromDate=" + startDate;
      }

      if (endDate && endDate !== null && endDate !== undefined) {
        apiMethod += "&toDate=" + endDate;
      } else {
        apiMethod += "&toDate=" + startDate;
      }

      let apiService = await apiRequest.getData(apiMethod, '', Constant.SERVICE_JAVA, navigation);
      set_isLoading(false);

      if (apiService?.data?.petObservations?.length > 0) {
        totalRecords_observations.current.push(...apiService.data.petObservations);
        setData_Observations(totalRecords_observations.current);

        //if particular page having lessthen 10 records no need do pagination
        if (apiService.data.petObservations.length < 10) {
          stopPagination.current = true;
        }
      }
      else if (apiService?.data?.pets?.length > 0) {
        totalRecords_observations.current.push(...apiService.data.pets);
        setData_Observations(totalRecords_observations.current);

        //if particular page having lessthen 10 records no need do pagination
        if (apiService.data.pets.length < 10) {
          stopPagination.current = true;
        }
      }
      else {
        if (totalRecords_observations.current.length === 0) {
          setData_Observations([]); // Clear the data
        } else {
          stopPagination.current = true;
        }
      }

    } catch (error) {
    } finally {
      set_isLoading(false);
    }
  }

  const handleBackButtonClick = () => {
    backBtnAction();
    return true;
  };

  const clearSearchValues = () => {
    searchText.current = ''
    totalRecords_observations.current = []
  };

  const backBtnAction = () => {
    navigation.pop()
  };

  const createPopup = (title, msg, isPop) => {
    set_popUpAlert(title);
    set_popUpMessage(msg);
    set_isPopUp(isPop)
  };

  const popOkBtnAction = () => {
    createPopup('', '', false);
  };

  const showVideo = (mediaPath) => {
    navigation.navigate('ViewPhotoComponent', { mediaURL: mediaPath, mediaType: 'video' });
  }

  const navigateToMediaDetailPage = (model) => {
    navigation.navigate('MediaDetailPageScreen', { mediaData: model });
  }

  return (
    <MediaUI
      isLoading={isLoading}
      popUpMessage={popUpMessage}
      popUpAlert={popUpAlert}
      isPopUp={isPopUp}
      popOkBtnAction={popOkBtnAction}
      backBtnAction={backBtnAction}
      clearSearchValues={clearSearchValues}
      getPetsMediaData={getPetsMediaData}
      data={data_Observations}
      showVideo={showVideo}
      navigateToMediaDetailPage={navigateToMediaDetailPage}
    />
  );

}

export default MediaComponent;