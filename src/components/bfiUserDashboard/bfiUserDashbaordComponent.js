import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import * as Constant from "../../utils/constants/constant";
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import BFIUserDashboardUI from './bfiUserDashboardUI.js';
import RNExitApp from 'react-native-exit-app';
import { useQuery } from "@apollo/react-hooks";
import * as Apolloclient from './../../config/apollo/apolloConfig';
import * as Queries from "./../../config/apollo/queries";

const BFIUserDashboardComponent = ({ navigation, route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [popUpRBtnTitle, set_popUpRBtnTitle] = useState(undefined);
    const [isPopupLeft, set_isPopupLeft] = useState(false);
    const { loading: captureBFILoading, data: captureBFIData } = useQuery(Queries.UPLOAD_CAPTURE_BFI_BACKGROUND_STATUS, { fetchPolicy: "cache-only" });

    const [bfiUploadStatus, set_bfiUploadStatus] = useState(undefined);
    const [bfiFileName, set_bfiFileName] = useState(undefined);
    const [bfiUploadProgress, set_bfiUploadProgress] = useState(undefined);
    const [bfiProgressText, set_bfiProgressText] = useState(undefined);

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        removeLoginDetails();
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    useEffect(() => {

        if (captureBFIData && captureBFIData.data.__typename === 'UploadCaptureBFIBackgroundStatus') {
            if (captureBFIData.data.stausType === 'Uploading Done') {
                set_bfiUploadStatus(undefined);
            } else {
                set_bfiUploadStatus(captureBFIData.data.statusUpload);
            }
            if (captureBFIData.data.fileName) {
                set_bfiFileName(captureBFIData.data.fileName);
            } else {
                set_bfiFileName('');
            }
            if (captureBFIData.data.uploadProgress) {
                set_bfiUploadProgress(captureBFIData.data.uploadProgress);
            }
            if (captureBFIData.data.progressTxt) {
                set_bfiProgressText(captureBFIData.data.progressTxt);
            }
        }

    }, [captureBFIData]);


    const removeLoginDetails = () => {
        Apolloclient.client.writeQuery({ query: Queries.LOG_OUT_APP, data: { data: { isLogOut: 'logOut', __typename: 'LogOutApp' } }, });
    }

    const handleBackButtonClick = () => {
        set_popUpAlert('Exit App');
        set_popUpMessage(Constant.ARE_YOU_SURE_YOU_WANT_EXIT);
        set_popUpRBtnTitle('YES');
        set_isPopupLeft(true);
        set_isPopUp(true);
        return true;
    };

    const menuAction = async () => {

        let internet = await internetCheck.internetCheck();
        if (!internet) {
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, "OK", false, true);
        } else {
            navigation.navigate('MenuComponent', {});
        }

    };

    const featureActions = async (value) => {

        let internet = await internetCheck.internetCheck();

        if (internet) {
            if (value === 1) {
                navigation.navigate('PetListComponent');
            } else {
                navigation.navigate('PetListBFIScoringScreen');
            }
        } else {
            createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, "OK", false, true);
        }

    };

    const createPopup = (aTitle, msg, rBtnTitle, isPopLeft, isPop) => {
        set_popUpAlert(aTitle);
        set_popUpMessage(msg);
        set_popUpRBtnTitle(rBtnTitle);
        set_isPopupLeft(isPopLeft);
        set_isPopUp(isPop);
    };

    const clearPopup = () => {

        set_isPopUp(false);
        set_popUpAlert(undefined);
        set_popUpMessage(undefined);
        set_popUpRBtnTitle('OK');
        set_isPopupLeft(false);

    };

    const popOkBtnAction = () => {
        if(popUpMessage===Constant.ARE_YOU_SURE_YOU_WANT_EXIT){
          RNExitApp.exitApp();
        }
        clearPopup();
    };

    const popOkCancelAction = () => {
        clearPopup();
    };

    return (

        <BFIUserDashboardUI
            popUpMessage={popUpMessage}
            popUpAlert={popUpAlert}
            popUpRBtnTitle={popUpRBtnTitle}
            isPopLeft={isPopupLeft}
            isPopUp={isPopUp}
            bfiUploadStatus={bfiUploadStatus}
            bfiUploadProgress={bfiUploadProgress}
            bfiFileName={bfiFileName}
            bfiProgressText={bfiProgressText}
            menuAction={menuAction}
            featureActions={featureActions}
            popOkBtnAction={popOkBtnAction}
            popOkCancelAction={popOkCancelAction}
        />

    );

}

export default BFIUserDashboardComponent;