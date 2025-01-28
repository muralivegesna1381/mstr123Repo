import React, { useState, useEffect, useRef } from 'react';
import * as Queries from "../../../config/apollo/queries";
import { useQuery } from "@apollo/react-hooks";
import * as Constant from "../../../utils/constants/constant";
import * as DataStorageLocal from "../../../utils/storage/dataStorageLocal";
import { View } from 'react-native';
import AlertComponent from "../../../utils/commonComponents/alertComponent";
import CommonStyles from "../../../utils/commonStyles/commonStyles";
import * as Apolloclient from './../../../config/apollo/apolloConfig';
import storage from '@react-native-firebase/storage';
import * as firebaseHelper from '../../../utils/firebase/firebaseHelper';
import * as apiRequest from './../../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../../utils/getServicesData/apiMethodManger.js';

var RNFS = require('react-native-fs');

const CaptureBFIUpload = ({ navigation, route, ...props }) => {

    const { loading, data: captureBFIUploadData } = useQuery(Queries.UPLOAD_CAPTURE_BFI_BACKGROUND, { fetchPolicy: "cache-only" });
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popAlert, set_popAlert] = useState(undefined);
    const [popRightBtnTitle, set_popRightBtnTitle] = useState(undefined);
    let isFirebaseUploadDone = useRef([])

    let totalImages = useRef(0)
    let completedImages = useRef(0)
    let displayCompletedImages = useRef(0)

    useEffect(() => {

        if (captureBFIUploadData && captureBFIUploadData.data.__typename === 'UploadCaptureBFIBackground') {
            checkInternetStatus();
        }

    }, [captureBFIUploadData]);

    const checkInternetStatus = async () => {
        var mediaData = await DataStorageLocal.getDataFromAsync('CaptureImagesData')
        mediaData = JSON.parse(mediaData);

        if (mediaData) {
            var jsonArrayMedia = [];
            for (let i = 0; i < mediaData['petBfiImages'].length; i++) {
                if (mediaData['petBfiImages'][i].localFileURL) {
                    jsonArrayMedia.push({ localFileURL: mediaData['petBfiImages'][i].localFileURL.replace("file://file:///", "file:///"), position: i, type: "ORIGINAL" })
                }
                if (mediaData['petBfiImages'][i].localthmbURl) {
                    jsonArrayMedia.push({ localFileURL: mediaData['petBfiImages'][i].localthmbURl.replace("file://file:///", "file:///"), position: i, type: "THUMB" })
                }
            }
            //default set as 1
            displayCompletedImages.current = displayCompletedImages.current + 1
            totalImages.current = jsonArrayMedia.length

            Apolloclient.client.writeQuery({
                query: Queries.UPLOAD_CAPTURE_BFI_BACKGROUND_STATUS, data: {
                    data: {
                        questName: '',
                        statusUpload: 'Please Wait... ',
                        fileName: '',
                        uploadProgress: '',
                        progressTxt: '',
                        stausType: 'Uploading',
                        mediaTYpe: '',
                        internetType: 'notWi-Fi',
                        uploadMode: 'backGround',
                        __typename: 'UploadCaptureBFIBackgroundStatus'
                    }
                },
            });

            let uploadProcess = await DataStorageLocal.getDataFromAsync(Constant.CAPTURED_BFI_UPLOAD_PROCESS_STARTED);
            uploadProcess = JSON.parse(uploadProcess);
            if (!uploadProcess) {
                startUploadingProcess();
            }
        }

    };

    const startUploadingProcess = async () => {

        let mediaData = await DataStorageLocal.getDataFromAsync("CaptureImagesData");
        mediaData = JSON.parse(mediaData);

        var jsonArrayMedia = [];
        isFirebaseUploadDone.current = []

        for (let i = 0; i < mediaData['petBfiImages'].length; i++) {
            if (mediaData['petBfiImages'][i].localFileURL) {
                jsonArrayMedia.push({ localFileURL: mediaData['petBfiImages'][i].localFileURL.replace("file://file:///", "file:///"), position: i, type: "ORIGINAL" })
            }
            if (mediaData['petBfiImages'][i].localthmbURl) {
                jsonArrayMedia.push({ localFileURL: mediaData['petBfiImages'][i].localthmbURl.replace("file://file:///", "file:///"), position: i, type: "THUMB" })
            }
        }

        await DataStorageLocal.saveDataToAsync(Constant.CAPTURED_BFI_UPLOAD_PROCESS_STARTED, JSON.stringify(false));

        if (completedImages.current < totalImages.current) {
            uploadImageToFB(mediaData, jsonArrayMedia[completedImages.current].localFileURL, jsonArrayMedia[completedImages.current].position, jsonArrayMedia[completedImages.current].type, jsonArrayMedia)
        }

    };

    const uploadImageToFB = async (mediaData, filePath, pos, type, jsonArrayMedia) => {

        let fileName = "BFI_Score_App_Images/" + filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length)
        let reference = storage().ref(fileName);
        let task = reference.putFile(filePath);
        task.on('state_changed', taskSnapshot => {
            let progress = Math.round((taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100);
            if (progress === 0) progress = 1
            Apolloclient.client.writeQuery({
                query: Queries.UPLOAD_CAPTURE_BFI_BACKGROUND_STATUS, data: {
                    data: {
                        questName: "",
                        statusUpload: 'Uploading BFI Photos is in-progress',
                        fileName: "....",
                        uploadProgress: progress + '%',
                        progressTxt: 'Completed',
                        stausType: 'Uploading',
                        mediaTYpe: '',
                        internetType: 'wifi',
                        uploadMode: 'backGround',
                        __typename: 'UploadCaptureBFIBackgroundStatus'
                    }
                },
            })
        });

        await task.then(() => {

            storage().ref(fileName).getDownloadURL().then(async (downloadURL) => {
                if (type === "ORIGINAL") {
                    displayCompletedImages.current = displayCompletedImages.current + 1
                    mediaData['petBfiImages'][pos].fbFileURL = downloadURL
                }
                else {
                    mediaData['petBfiImages'][pos].fbThumbURL = downloadURL
                }

                completedImages.current = completedImages.current + 1
                if (completedImages.current < totalImages.current) {
                    uploadImageToFB(mediaData, jsonArrayMedia[completedImages.current].localFileURL, jsonArrayMedia[completedImages.current].position, jsonArrayMedia[completedImages.current].type, jsonArrayMedia)
                } else {
                    completedImages.current = 0
                    totalImages.current = 0

                    //service call before
                    Apolloclient.client.writeQuery({
                        query: Queries.UPLOAD_CAPTURE_BFI_BACKGROUND_STATUS, data: {
                            data: {
                                questName: "",
                                statusUpload: 'Please wait.. ',
                                fileName: "",
                                uploadProgress: "done",
                                progressTxt: 'Finishing',
                                stausType: 'Uploading',
                                mediaTYpe: '',
                                internetType: 'wifi',
                                uploadMode: 'backGround',
                                __typename: 'UploadCaptureBFIBackgroundStatus'
                            }
                        },
                    })

                    var petBfiImages = [];
                    for (let i = 0; i < mediaData['petBfiImages'].length; i++) {
                        var item = mediaData['petBfiImages'][i]
                        if (item.localFileURL) {
                            let filename = "BFI_Score_App_Images/" + item.localFileURL.substring(item.localFileURL.lastIndexOf('/') + 1, item.localFileURL.length)
                            var jsonFullBody = {
                                imagePositionId: item.imagePositionId, imagePosition: item.imageType, imageName: filename,
                                imageUrl: item.fbFileURL, thumbnailUrl: item.fbThumbURL, description: ""
                            };
                            petBfiImages.push(jsonFullBody)
                        }
                    }
                    var submitRequest = { petParentId: mediaData.petParentId, petId: mediaData.petId, "petBfiImages": petBfiImages };
                    let apiMethod = apiMethodManager.SAVE_BFI_IMAGES;
                    let apiService = await apiRequest.postData(apiMethod,submitRequest,Constant.SERVICE_JAVA,navigation);
                        
                    if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
                        
                        await UpdateApolloQuery();
                        createPopup(Constant.ALERT_INFO, Constant.CAPTURED_SUBMIT_IMAGES_SUCCESS, 'OK', true);
                            
                    } else if(apiService && apiService.isInternet === false) {
            
                        createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, 'OK', false, true);
                            
                    } else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
            
                        createPopup(Constant.ALERT_DEFAULT_TITLE, apiService.error.errorMsg , 'OK', true);
                        firebaseHelper.logEvent(firebaseHelper.event_capture_bfi_submit_api, firebaseHelper.screen_capture_bfi, "Capture BFI Service failed", 'Service error : ' + apiService.error.errorMsg);
                        
                    } else {
            
                        UpdateApolloQuery()
                        createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.CAPTURED_SUBMIT_IMAGES_FAIL, 'OK', true);
                        firebaseHelper.logEvent(firebaseHelper.event_capture_bfi_submit_api, firebaseHelper.screen_capture_bfi, "Capture BFI Service failed", "Service Status:");
            
                    }
                
                }

            });

        }).catch((error) => {
        });

    };

    const UpdateApolloQuery = async () => {

        await DataStorageLocal.removeDataFromAsync(Constant.CAPTURED_BFI_UPLOAD_PROCESS_STARTED)
        await DataStorageLocal.removeDataFromAsync('CaptureImagesData');
        //service call after
        Apolloclient.client.writeQuery({
            query: Queries.UPLOAD_CAPTURE_BFI_BACKGROUND_STATUS, data: {
                data: {
                    questName: "",
                    statusUpload: '',
                    fileName: "",
                    uploadProgress: "",
                    progressTxt: '',
                    stausType: 'Uploading Done',
                    mediaTYpe: '',
                    internetType: 'wifi',
                    uploadMode: 'backGround',
                    __typename: 'UploadCaptureBFIBackgroundStatus'
                }
            },
        })

        Apolloclient.client.writeQuery({
            query: Queries.UPLOAD_CAPTURE_BFI_BACKGROUND,
            data: { data: { bfiData: '', __typename: 'UploadCaptureBFIBackground' } },
        })

    }

    const createPopup = (title, msg, rTitle, isPopup) => {

        set_popAlert(title);
        set_popUpMessage(msg);
        set_popRightBtnTitle(rTitle);
        set_isPopUp(isPopup);

    };

    const popOkBtnAction = async () => {
        createPopup('', '', "OK", false)

        var mediaData = await DataStorageLocal.getDataFromAsync('CaptureImagesData2')
        if (mediaData) {
            mediaData = JSON.parse(mediaData)

            //copy storage2 data to existing storage
            await DataStorageLocal.saveDataToAsync('CaptureImagesData', JSON.stringify(mediaData));

            var mediaData = await DataStorageLocal.getDataFromAsync('CaptureImagesData')
            mediaData = JSON.parse(mediaData)

            //remove storage2 data once copy done
            await DataStorageLocal.removeDataFromAsync('CaptureImagesData2');

            //trigger background process again
            Apolloclient.client.writeQuery({
                query: Queries.UPLOAD_CAPTURE_BFI_BACKGROUND,
                data: { data: { bfiData: 'checkForBFIUploads', __typename: 'UploadCaptureBFIBackground' } },
            })
        }

    };

    return (
        <>
            {isPopUp ? <View style={CommonStyles.customPopUpGlobalStyle}>
                <AlertComponent
                    header={popAlert}
                    message={popUpMessage}
                    isLeftBtnEnable={false}
                    isRightBtnEnable={true}
                    leftBtnTilte={'NO'}
                    rightBtnTilte={popRightBtnTitle}
                    popUpRightBtnAction={() => popOkBtnAction()}
                />
            </View> : null}
        </>

    );

};
export default CaptureBFIUpload;