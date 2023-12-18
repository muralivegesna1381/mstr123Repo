import AsyncStorage from "@react-native-community/async-storage";
import CameraRoll from "@react-native-community/cameraroll";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, ImageBackground, NativeModules, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, BackHandler } from 'react-native';
import RNFS from 'react-native-fs';
import ImageView from "react-native-image-viewing";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import CommonStyles from '../../utils/commonStyles/commonStyles';
import fonts from '../../utils/commonStyles/fonts';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "../../utils/constants/constant";
import * as PermissionsiOS from '../../utils/permissionsComponents/permissionsiOS';
import moment from 'moment';
import { Image } from 'react-native-compressor';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import RotatePhoto from 'react-native-rotate-photo';
import storage from '@react-native-firebase/storage';
import BuildEnv from './../../config/environment/environmentConfig';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as ServiceCalls from '../../utils/getServicesData/getServicesData.js';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import * as Apolloclient from './../../config/apollo/apolloConfig';
import * as Queries from "./../../config/apollo/queries";

let retakeIcon = require("./../../../assets/images/bfiGuide/svg/re-take.svg");

const Environment = JSON.parse(BuildEnv.Environment());

const PetImageCaptureComponent = ({ route, navigation, props }) => {

  const [index, set_index] = useState(0);
  const [isDataValid, setIsDataValid] = React.useState(true);

  const [petID, setPetID] = useState(undefined);
  const [petParentId, set_PetParentId] = useState(undefined);
  const [isFromOnBoarding, set_isFromOnBoarding] = useState(false);

  const [petCurrentImage, setPetCurrentImage] = useState(undefined);

  const [petFrontImage, setPetFrontImage] = useState(undefined);
  const [petBackImage, setPetBackImage] = useState(undefined);
  const [petTopImage, setPetTopImage] = useState(undefined);
  const [petRightSideImage, setPetRightSideImage] = useState(undefined);
  const [petLeftSideImage, setPetLeftSideImage] = useState(undefined);
  const [petFullBody, setPetFullBody] = useState(undefined);

  const [petFrontThumbImage, setPetFrontThumbImage] = useState(undefined);
  const [petBackThumbImage, setPetBackThumbImage] = useState(undefined);
  const [petTopThumbImage, setPetTopThumbImage] = useState(undefined);
  const [petRightSideThumbImage, setPetRightSideThumbImage] = useState(undefined);
  const [petLeftSideThumbImage, setPetLeftSideThumbImage] = useState(undefined);
  const [petFullBodyThumb, setPetFullBodyThumb] = useState(undefined);

  const [images, set_images] = useState([]);
  const [isImageView, set_isImageView] = useState(false);
  const [isLoading, set_isLoading] = useState(false);
  const [loaderText, set_loaderText] = useState(undefined);
  const [isCameraPermissionON, set_isCameraPermissionON] = useState(false);

  const [popUpAlert, set_popUpAlert] = useState('Alert');
  const [popupMessage, set_popupMessage] = useState(undefined);
  const [popLeftTitle, set_popLeftTitle] = useState(undefined);
  const [popRightTitle, set_popRightTitle] = useState(undefined);
  const [popupLftBtnEnable, set_popupLftBtnEnable] = useState(false);
  const [isAsyncPending, setIsAsyncPending] = useState(false);
  const [completedProgress, setCompletedProgress] = useState('0');
  const [statusTitle, set_StatusTitle] = useState(undefined);
  const [statusSubject, set_StatusSubject] = useState(undefined);

  const [isPopUp, set_isPopUp] = useState(false);
  var rotation = 0;
  let isLoadingdRef = useRef(0);

  var totalRecordsData = useRef([]);

  const [dogImgArray, set_dogImgArray] = useState([
    require('./../../../assets/images/bfiGuide/svg/ic_front.svg'),
    require('./../../../assets/images/bfiGuide/svg/ic_back.svg'),
    require('./../../../assets/images/bfiGuide/svg/ic_top.svg'),
    require('./../../../assets/images/bfiGuide/svg/ic_side_left.svg'),
    require('./../../../assets/images/bfiGuide/svg/ic_side_right.svg'),
    require('./../../../assets/images/bfiGuide/svg/ic_full_body.svg')
  ]);

  let indexNew = useRef(0)
  let imgsRef = useRef(undefined)
  let hashmapMediaData = useRef(new Map())
  let isFirebaseUploadDone = useRef([])
  let hashmapImageSigmentationStatus = useRef(new Map())

  let status_inprogress = "IN_PROGRESS"
  let status_match = "MATCH"
  let status_not_mtach = "NOT_MATCH"

  const [instArray, set_instArray] = useState([
    { id: 1, title: 'Front' },
    { id: 2, title: 'Rear' },
    { id: 3, title: 'Top' },
    { id: 4, title: 'Side-Left' },
    { id: 5, title: 'Side-Right' },
    { id: 6, title: 'Full Body' },
  ]);

  useEffect(() => {
    //Update when coming from camera component
    if (route.params?.indexPos) {
      indexNew.current = route.params?.indexPos
      set_index(indexNew.current);
    }
    if (route.params?.imagePath) {
      //Rotate Top,Left and Right Side image
      //set_isLoading(true);
      set_loaderText(Constant.LOADING_MSG_IMAGE_PROCESSING)
      if (route.params?.indexPos === 2 || route.params?.indexPos === 3 || route.params?.indexPos === 4 || route.params?.indexPos === 5) {
        rotateImage(route.params?.imagePath)
      } else {
        savePhotoInLocalGallery(route.params?.imagePath)
      }
    }
  }, [route.params?.indexPos, route.params?.imagePath]);

  useEffect(() => {
    checkCameraPermissions();

    set_popUpAlert("Information")
    set_popupMessage(Constant.CAMERA_SCREEN_INFO_MSG)
    set_popRightTitle('Ok');
    set_isPopUp(true);
    set_popupLftBtnEnable(false)

    // hashmapImageSigmentationStatus.current.set(instArray[5].title, status_not_mtach)
    // hashmapImageSigmentationStatus.current.set(instArray[4].title, status_not_mtach)
    // hashmapImageSigmentationStatus.current.set(instArray[3].title, status_not_mtach)
    // hashmapImageSigmentationStatus.current.set(instArray[2].title, status_not_mtach)

    // updateWidgetData()

    // if (totalRecordsData.current.length === 0)
    //   getPetImagePositions()


    updateParentID()

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  const updateParentID = async () => {
    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let userRole = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_ID);
    if (userRole === '7') {
      set_PetParentId(clientId)
    }
  }

  const handleBackButtonClick = () => {
    backBtnAction();
    return true;
  };

  const rotateImage = (sourceImage) => {
    RotatePhoto.createRotatedPhoto(sourceImage, 2000, 2000, "JPEG", 100, 270, null)
      .then(response => {
        savePhotoInLocalGallery(response.uri)
      })
      .catch(err => {
      });
  }

  const savePhotoInLocalGallery = async (localPath) => {
    var promise = CameraRoll.save(localPath, {
      type: "photo",
      album: "BFIScoring",
      filename: "image" + moment(new Date()).format('MMDDYYYYhhmmss'),
    });
    promise.then(async function (result) { }).catch(function (error) { });

    moveToNativeFunctions(localPath)
  }

  useEffect(() => {
    if (route.params?.petID) {
      setPetID(route.params?.petID)
    }
    if (route.params?.petParentId) {
      set_PetParentId(route.params?.petParentId)
    }
    if (route.params?.isFromOnboarding) {
      set_isFromOnBoarding(route.params?.isFromOnboarding)
    }
  }, [route.params?.petID, route.params?.petParentId, route.params.isFromOnboarding]);

  const checkCameraPermissions = async () => {
    if (Platform.OS === 'ios') {
      let permissonFirst = await AsyncStorage.getItem('iOSFirstTime');
      if (permissonFirst && permissonFirst === 'firstTime') {
        await AsyncStorage.setItem('iOSFirstTime', 'existingUser');
        set_isCameraPermissionON(true)
      } else {
        let permissions = await PermissionsiOS.checkCameraPermissions();
        set_isCameraPermissionON(true)
        if (!permissions) {
          Alert.alert('', Constant.CAMERA_PERMISSION_MSG, [
            { text: 'OK', onPress: () => { } },],
            { cancelable: false },
          );
        }
      }
    } else {
      set_isCameraPermissionON(true)
    }
  }

  useEffect(() => {
    if (petFrontImage || petBackImage || petTopImage || petLeftSideImage || petRightSideImage || petFullBody) {

      //Add Data to hashmap with image position and Data
      hashmapMediaData.current.set(indexNew.current, petCurrentImage)
    }

  }, [petFrontImage, petBackImage, petTopImage, petLeftSideImage, petRightSideImage, petFullBody]);

  const scanDocument = async (position) => {
    indexNew.current = position

    if (isCameraPermissionON === false) {
      checkCameraPermissions()
      return
    }

    navigation.navigate('CameraComponent', { indexPos: position, })
  };

  const moveToNativeFunctions = (imagePath) => {
    RNFS.readFile(imagePath, 'base64')
      .then(imageBase64 => {
        if (Platform.OS === 'android') {
          NativeModules.ImageBlueIdentification.checkIsImageBlur(imageBase64, (value) => {
            checkBlurStatus(value, imagePath, imageBase64)
          });
        }
        else {
          NativeModules.RNOpenCvLibrary.checkForBlurryImage(imageBase64, (error, dataArray) => {
            checkBlurStatus(dataArray[0], imagePath, imageBase64)
          });
        }
      });
  };

  const checkBlurStatus = (value, imagePath, imageBase64) => {
    if (value == false) {
      //Object Detection using ML-Kit
      if (Platform.OS === "android") {
        set_isLoading(true);
        NativeModules.ImageObjectDetection.getImageLabellingData(imageBase64, (value) => {
          set_isLoading(false);
          handleNativeObjectDetection(value, imagePath)
        });
      } else {
        //ios image labelling validation
        set_isLoading(true);
        NativeModules.ObjectDetection.imageObjectDetection(imageBase64, (value) => {
          handleNativeObjectDetection(value, imagePath)
        });
      }
    } else {
      set_isLoading(false);
      //Image is Blur
      set_isLoading(false);
      clearImageLables()

      set_popupMessage(Constant.CAPTURED_BLURRY_IMAGES)
      set_popRightTitle('Re-Take');
      set_popLeftTitle('Cancel');
      set_isPopUp(true);
      set_popupLftBtnEnable(true)
    }
  };

  const clearImageLables = () => {
    setPetCurrentImage(undefined)
    if (indexNew.current === 0) setPetFrontImage(undefined)
    else if (indexNew.current === 1) setPetBackImage(undefined)
    else if (indexNew.current === 2) setPetTopImage(undefined)
    else if (indexNew.current === 3) setPetLeftSideImage(undefined)
    else if (indexNew.current === 4) setPetRightSideImage(undefined)
    else if (indexNew.current === 5) setPetFullBody(undefined)
  }

  const handleNativeObjectDetection = (value, imagePath) => {
    if (value === true) {
      //Update UI 
      setPetCurrentImage(imagePath)

      if (indexNew.current === 0) setPetFrontImage(imagePath)
      else if (indexNew.current === 1) setPetBackImage(imagePath)
      else if (indexNew.current === 2) setPetTopImage(imagePath)
      else if (indexNew.current === 3) setPetLeftSideImage(imagePath)
      else if (indexNew.current === 4) setPetRightSideImage(imagePath)
      else if (indexNew.current === 5) setPetFullBody(imagePath)

      //compress and update thumbnail
      compressImage(imagePath)

    } else {
      set_isLoading(false);
      set_popupMessage(Constant.CAPTURE_DOG_IMAGE)
      set_popRightTitle('Re-Take');
      set_popLeftTitle('Cancel');
      set_isPopUp(true);
      set_popupLftBtnEnable(true)
    }
  }

  const compressImage = async (imgPath) => {
    const result = await Image.compress(imgPath, {
      compressionMethod: 'auto'
    });

    if (Platform.OS === 'ios') {
      if (indexNew.current === 0 || indexNew.current === 1) {
        //Rotate the image 270 degress for front and back images
        rotation = 270;
      }
      else {
        //Remaining images are to be rotated 90 degrees
        rotation = 90;
      }
    }
    RotatePhoto.createRotatedPhoto(result, 2000, 2000, "JPEG", 100, rotation, null)
      .then(response => {
        updateThumnailPath(response.uri)
      })
      .catch(err => {
      });
  };

  const updateThumnailPath = async (compressPath) => {

    submitToImageClasification(compressPath)

    if (indexNew.current === 0) setPetFrontThumbImage(compressPath)
    else if (indexNew.current === 1) setPetBackThumbImage(compressPath)
    else if (indexNew.current === 2) setPetTopThumbImage(compressPath)
    else if (indexNew.current === 3) setPetLeftSideThumbImage(compressPath)
    else if (indexNew.current === 4) setPetRightSideThumbImage(compressPath)
    else if (indexNew.current === 5) setPetFullBodyThumb(compressPath)

    var promise = CameraRoll.save(compressPath, {
      type: "photo",
      album: "BFIScoring",
      filename: "image" + moment(new Date()).format('MMDDYYYYhhmmss'),
    });

    promise.then(async function (result) {
      //set_isLoading(false);


    }).catch(function (error) { set_isLoading(false); });
  }

  const submitToImageClasification = (imagePath) => {

    //display widget
    setIsAsyncPending(true)

    //by default update as in-progress
    updateWidgetStatus(instArray[indexNew.current].title, status_inprogress)

    //set_isLoading(true)
    isLoadingdRef.current = 1;
    RNFS.readFile(imagePath, 'base64')
      .then(imageBase64 => {
        var mlModelreq = {
          imgBase64: imageBase64,
          imgType: instArray[indexNew.current].title,
          fileName: imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.length)
        };
        const options = {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(mlModelreq),
        };
        //http://34.107.175.16/image_classification
        //https://orientation-classification-service-uathxnywea-uc.a.run.app/image_classification
        fetch("https://orientation-classification-uat.ctepl.com/image_classification", options)
          .then(response => response.json())
          .then(data => {
            console.log("data", data)
            let imageType = data.imgType
            if (data && data.dog_orientation) {
              if ((indexNew.current === 0 && data.dog_orientation !== "Front") ||
                (indexNew.current === 1 && data.dog_orientation !== "Rear") ||
                (indexNew.current === 2 && data.dog_orientation !== "Top") ||
                (indexNew.current === 3 && data.dog_orientation !== "Side-Left") ||
                (indexNew.current === 4 && data.dog_orientation !== "Side-Right") ||
                (indexNew.current === 5 && !['Full Body', 'Side-Left', 'Side-Right'].includes(data.dog_orientation))
              ) {
                //show widget with status as not match
                updateWidgetStatus(imageType, status_not_mtach)
                //handleResponse(Constant.CAPTURED_ORIENTATION_ERROR_MESSAGE)
              } else {
                //show widget with status as match
                updateWidgetStatus(imageType, status_match)
              }
            } else {
              //error case update as match to close widget and show alert
              updateWidgetStatus(instArray[indexNew.current].title, status_match)
              handleResponse(Constant.CAPTURED_ORIENTATION_ERROR_MESSAGE)
            }
          })
          .catch(error => {
            //error case update as match to close widget and show alert
            updateWidgetStatus(instArray[indexNew.current].title, status_match)
            firebaseHelper.logEvent(firebaseHelper.event_image_classification_api_fails, firebaseHelper.screen_capture_bfi, "Image Classification Service failed", 'Service error : ' + error);
            handleResponse(Constant.CAPTURED_SUBMIT_IMAGES_FAIL)
          }).finally(() => {
            isLoadingdRef.current = 0;
            set_isLoading(false)
            updateWidgetData()
          });
      });
  };

  const updateWidgetStatus = async (key, value) => {
    hashmapImageSigmentationStatus.current.set(key, value)
    updateWidgetData()
  }

  const handleResponse = (message) => {
    set_isPopUp(true)
    set_popupMessage(message)
    set_popRightTitle('Re-Capture');
    set_popLeftTitle('Ignore');
    set_popupLftBtnEnable(true)
  }

  const backBtnAction = () => {
    if (isLoadingdRef.current === 0) {
      if (isFromOnBoarding) {
        navigation.navigate("PetListComponent");
      } else {
        navigation.pop()
      }
    }
  };

  const infoBtnAction = () => {
    navigation.navigate("InstructionsPage", {
      instructionType: 1,
    });
  }

  const validateNextAction = () => {
    if (hashmapMediaData.current.has(5) && (hashmapMediaData.current.has(3) || hashmapMediaData.current.has(4))) {
      firebaseHelper.logEvent(firebaseHelper.event_capture_bfi_submitted_api, firebaseHelper.screen_capture_bfi, "CaptureBFI Submit action clicked", '');
      nextButtonAction()
    } else {
      set_popupMessage(true)
      set_popupMessage(Constant.BFI_CAPTURE_IMG_VALIDATION)
      set_popRightTitle('OK');
      set_isPopUp(true);
      set_popupLftBtnEnable(false)
    }
  }

  const nextButtonAction = async () => {
    //clear old data
    isFirebaseUploadDone.current = []
    //isLoadingdRef.current = 1
    //set_loaderText(Constant.LOADER_WAIT_MESSAGE)
    //set_isLoading(true)

    var jsonArray = [];
    var jsonFullBody = { localFileURL: petFullBody, localthmbURl: petFullBodyThumb, imageType: 'Full Body', imagePositionId: 6, fbFileURL: undefined, fbThumbURL: undefined };
    var jsonFrontObject = { localFileURL: petFrontImage, localthmbURl: petFrontThumbImage, imageType: 'Front', imagePositionId: 1, fbFileURL: undefined, fbThumbURL: undefined };
    var jsonBackObject = { localFileURL: petBackImage, localthmbURl: petBackThumbImage, imageType: 'Rear', imagePositionId: 2, fbFileURL: undefined, fbThumbURL: undefined };
    var jsonTopObject = { localFileURL: petTopImage, localthmbURl: petTopThumbImage, imageType: 'Top', imagePositionId: 5, fbFileURL: undefined, fbThumbURL: undefined };
    var jsonLeftSideObject = { localFileURL: petLeftSideImage, localthmbURl: petLeftSideThumbImage, imageType: 'Side-Left', imagePositionId: 3, fbFileURL: undefined, fbThumbURL: undefined };
    var jsonRightSideObject = { localFileURL: petRightSideImage, localthmbURl: petRightSideThumbImage, imageType: 'Side-Right', imagePositionId: 4, fbFileURL: undefined, fbThumbURL: undefined };

    jsonArray.push(jsonFullBody);
    jsonArray.push(jsonFrontObject);
    jsonArray.push(jsonBackObject);
    jsonArray.push(jsonTopObject);
    jsonArray.push(jsonLeftSideObject);
    jsonArray.push(jsonRightSideObject);

    var submitRequest = { petParentId: petParentId, petId: petID, "petBfiImages": jsonArray };

    //check already background processing happening or not
    let uploadProcess = await DataStorageLocal.getDataFromAsync(Constant.CAPTURED_BFI_UPLOAD_PROCESS_STARTED);

    //If Yes Store Data in backup : CaptureImagesData2
    if (uploadProcess) {
      await DataStorageLocal.saveDataToAsync('CaptureImagesData2', JSON.stringify(submitRequest));
    } else {
      await DataStorageLocal.saveDataToAsync('CaptureImagesData', JSON.stringify(submitRequest));
    }

    // var mediaData = await DataStorageLocal.getDataFromAsync('CaptureImagesData')
    // mediaData = JSON.parse(mediaData)

    Apolloclient.client.writeQuery({
      query: Queries.UPLOAD_CAPTURE_BFI_BACKGROUND,
      data: { data: { bfiData: 'checkForBFIUploads', __typename: 'UploadCaptureBFIBackground' } },
    })

    navigation.navigate("ReviewComponent", { isFromScreen: 'capture_image' });
  };

  const previousBtnAction = () => {
    indexNew.current = indexNew.current - 1
    set_index(index - 1);
  };

  const viewCaptureImageAction = (imagePath) => {
    imgsRef.current = undefined

    set_images([])
    let img = { uri: imagePath };
    imgsRef.current = [img]
    set_images([img]);
    set_isImageView(true);
  };

  const retakeImageAction = () => {
    scanDocument(indexNew.current)
  };

  const popOkBtnAction = () => {
    if (popupMessage === Constant.CAPTURED_BLURRY_IMAGES || popupMessage === Constant.CAPTURE_DOG_IMAGE) {
      scanDocument(indexNew.current)
      set_isPopUp(false);
      set_popupMessage(undefined);
    } if (popupMessage === Constant.CAPTURED_ORIENTATION_ERROR_MESSAGE) {
      clearImageLables()
      set_isPopUp(false);
      set_popupMessage(undefined);
      scanDocument(indexNew.current)
    } else {
      set_popUpAlert("Alert")
      set_isPopUp(false);
      set_popupMessage(undefined);
    }
  };

  const popCancelBtnAction = () => {
    set_isPopUp(false);
    set_popupMessage(undefined);
  }

  const callGoogleVIsionApi = async (base64, imagePath) => {
    set_isLoading(true)
    let googleVisionRes = await fetch("https://vision.googleapis.com/v1/images:annotate?key=" + Config.GOOGLE_CLOUD_VISION_API_KEY, {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "requests": [
          {
            "image": {
              "content": base64
            },
            features: [
              { type: "LANDMARK_DETECTION", maxResults: 10 },
              { type: "FACE_DETECTION", maxResults: 5 },
              { type: "OBJECT_LOCALIZATION", maxResults: 5 },
              { type: "LOGO_DETECTION", maxResults: 5 },
              { type: "LABEL_DETECTION", maxResults: 5 },
              { type: "DOCUMENT_TEXT_DETECTION", maxResults: 5 },
              { type: "SAFE_SEARCH_DETECTION", maxResults: 5 },
              { type: "IMAGE_PROPERTIES", maxResults: 5 },
              { type: "CROP_HINTS", maxResults: 5 },
            ],
          }
        ]
      })
    });
    await googleVisionRes.json().then(googleVisionRes => {
      if (!googleVisionRes.error) {
        set_isLoading(false)
        var status = googleVisionRes.responses[0].labelAnnotations.some(objectData => objectData.description === 'Dog'); // true
        status = googleVisionRes.responses[0].labelAnnotations.some(objectData => objectData.description === 'Dog breed'); // true

        //Testing console log
        googleVisionRes.responses[0].labelAnnotations.map((object, index) => {

        })
        const noOccurence = googleVisionRes.responses[0].localizedObjectAnnotations.filter(obj => obj.name === "Dog").length;
        if (noOccurence > 1) {
          clearImageLables()
          Alert.alert('', "Sorry Seems to be multiple Pets captured in single frame, Please capture another image", [
            { text: 'Cancel', onPress: () => { } },
            { text: 'Re-Take', onPress: () => retakeImageAction() }],
            { cancelable: false },
          );
        } else {
          handleNativeObjectDetection(status, imagePath)
        }
      } else {
        Alert.alert('', googleVisionRes.error.message, [
          { text: 'OK', onPress: () => { } },],
          { cancelable: false },
        );
      }
    }).catch((error) => { })
  }

  const createPopup = (aTitle, msg, rBtnTitle, isPopLeft, isPop) => {
    set_popUpAlert(aTitle);
    set_popupMessage(msg);
    set_popRightTitle(rBtnTitle);
    set_popupLftBtnEnable(isPopLeft);
    set_isPopUp(isPop);
  };

  const updateWidgetData = async () => {
    let pendingCount = 0
    let pendingData = []
    let notMatchData = []
    let matchData = []
    hashmapImageSigmentationStatus.current.forEach(function (value, key) {
      //console.log("key", key, "value", value,)
      if (value === status_inprogress) {
        pendingData.push(key)
        pendingCount = pendingCount + 1
        setIsDataValid(false)
      } else if (value === status_not_mtach) {
        notMatchData.push(key)
        setIsDataValid(true)
      } else {
        setIsDataValid(true)
        matchData.push(key)
      }
    })
    setCompletedProgress(hashmapImageSigmentationStatus.current.size - pendingCount + "/6")

    if (pendingData.length > 0) {
      set_StatusTitle(pendingData.toString())
      set_StatusSubject(Constant.LOADING_MSG_IMAGE_PROCESSING)
      setIsAsyncPending(true)
    } else if (notMatchData.length > 0) {
      set_StatusTitle(notMatchData.toString())
      set_StatusSubject(Constant.CAPTURED_ORIENTATION_ERROR_MESSAGE)
      setIsAsyncPending(true)
    } else if (matchData.length === hashmapImageSigmentationStatus.current.size) {
      setIsAsyncPending(false)
    }
  }

  const getPetImagePositions = async () => {
    set_isLoading(true);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    let serviceCallsObj = await ServiceCalls.getCaptureBFIImageOrientationPositions(token);

    if (serviceCallsObj && serviceCallsObj.logoutData) {
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
      return;
    }

    if (serviceCallsObj && !serviceCallsObj.isInternet) {
      set_isLoading(false);
      createPopup(Constant.ALERT_NETWORK, Constant.NETWORK_STATUS, 'OK', false, true);
      return;
    }

    if (serviceCallsObj && serviceCallsObj.statusData) {
      set_isLoading(false);
      if (serviceCallsObj && serviceCallsObj.responseData && serviceCallsObj.responseData.length > 0) {
        if (serviceCallsObj.responseData.length > 0) {
          for (let i = 0; i < serviceCallsObj.responseData.length; i++) {
            totalRecordsData.current.push(serviceCallsObj.responseData[i]);
          }
          set_isLoading(false);
        }
      }
    } else {
      set_isLoading(false);
      createPopup(Constant.ALERT_DEFAULT_TITLE, Constant.SERVICE_FAIL_MSG, 'OK', false, true);
      firebaseHelper.logEvent(firebaseHelper.event_get_capture_image_pos, firebaseHelper.screen_capture_bfi, "getPetImagePositions Service failed", 'Service Status : false');
    }

    if (serviceCallsObj && serviceCallsObj.error) {
      let errors = serviceCallsObj.error.length > 0 ? serviceCallsObj.error[0].code : ''
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_get_capture_image_pos, firebaseHelper.screen_capture_bfi, "getPetImagePositions Service failed", 'Service error : ' + errors);
    }
  };

  return (
    <View style={[styles.mainContainer]}>
      <View style={[CommonStyles.headerView, {}]}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isTitleHeaderEnable={true}
          isInfoEnable={true}
          infoBtnAction={() => infoBtnAction()}
          title={'Capture Images'}
          backBtnAction={() => backBtnAction()}
        />
      </View>

      {isAsyncPending ?
        <View style={{ width: wp('100%'), height: hp('15%'), alignItems: 'center', justifyContent: 'center', backgroundColor: '#818588', marginBottom: wp('2%') }}>
          <View style={{ width: wp('90%'), height: hp('10%'), flexDirection: 'row' }}>

            <View style={{ width: wp('65%'), height: hp('10%'), justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontSize: fonts.fontXSmall, fontFamily: 'Barlow-Medium' }}>{'Status of : ' + statusTitle}</Text>
              <Text style={{ color: 'white', marginTop: hp('0.5%'), fontSize: fonts.fontXSmall, fontFamily: 'Barlow-Regular' }}>{statusSubject}</Text>
            </View>

            <View style={{ width: wp('30%'), height: hp('10%'), alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: wp('12%'), aspectRatio: 1, backgroundColor: '#000000AA', borderRadius: 100, borderColor: '#6BC100', borderWidth: 2, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.progressStyle}>{completedProgress}</Text>
              </View>
              <Text style={{ color: 'white' }}>{'Completed'}</Text>
            </View>
          </View>
        </View> : null}

      <ScrollView>
        <View style={[styles.container]}>
          <TouchableOpacity onPress={() => { scanDocument(5) }}>
            <View style={[styles.imageItemLarge]}>
              {petFullBody ?
                <TouchableOpacity onPress={() => { viewCaptureImageAction(petFullBody) }}>
                  <ImageBackground style={styles.imageStyleLandScape} resizeMode="contain" source={{ uri: petFullBody }} />
                </TouchableOpacity> :
                <ImageBackground style={styles.infoImageStyle1} resizeMode='contain' source={dogImgArray[5]}></ImageBackground>
              }
              {!petFullBody ?
                < Text style={[CommonStyles.captureImageLable]}>{instArray[5].title}</Text>
                : <View style={[styles.viewBtnStyle]}>
                  <TouchableOpacity onPress={() => { scanDocument(5) }}>
                    <ImageBackground style={styles.viewTextStyle} resizeMode="contain" source={retakeIcon} />
                  </TouchableOpacity>
                </View>
              }
            </View>
          </TouchableOpacity>



          <TouchableOpacity onPress={() => { scanDocument(3) }}>
            <View style={[styles.imageItemLarge]}>
              {petLeftSideImage ?
                <TouchableOpacity onPress={() => { viewCaptureImageAction(petLeftSideImage) }}>
                  <ImageBackground style={styles.imageStyleLandScape} resizeMode="contain" source={{ uri: petLeftSideImage }} />
                </TouchableOpacity> :
                <ImageBackground style={styles.infoImageStyle1} resizeMode='contain' source={dogImgArray[3]}></ImageBackground>
              }
              {!petLeftSideImage ?
                < Text style={[CommonStyles.captureImageLable]}>{instArray[3].title}</Text>
                : <TouchableOpacity style={[styles.viewBtnStyle]} onPress={() => { scanDocument(3) }}>
                  <ImageBackground style={styles.viewTextStyle} resizeMode="contain" source={retakeIcon} />
                </TouchableOpacity>
              }
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { scanDocument(4) }}>
            <View style={[styles.imageItemLarge]}>
              {petRightSideImage ?
                <TouchableOpacity onPress={() => { viewCaptureImageAction(petRightSideImage) }}>
                  <ImageBackground style={styles.imageStyleLandScape} source={{ uri: petRightSideImage }} />
                </TouchableOpacity> :
                <ImageBackground style={styles.infoImageStyle1} resizeMode='contain' source={dogImgArray[4]}></ImageBackground>
              }
              {!petRightSideImage ?
                <Text style={[CommonStyles.captureImageLable]}>{instArray[4].title}</Text>
                : <TouchableOpacity style={[styles.viewBtnStyle]} onPress={() => { scanDocument(4) }}>
                  <ImageBackground style={styles.viewTextStyle} resizeMode="contain" source={retakeIcon} />
                </TouchableOpacity>}

            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { scanDocument(2) }}>
            <View style={[styles.imageItemLarge]}>
              {petTopImage ?
                <TouchableOpacity onPress={() => { viewCaptureImageAction(petTopImage) }}>
                  <ImageBackground style={[styles.imageStyleLandScape]} source={{ uri: petTopImage }} />
                </TouchableOpacity> :
                <ImageBackground style={[styles.infoImageStyle1, { width: wp('25%'), }]} resizeMode='contain' source={dogImgArray[2]}></ImageBackground>
              }
              {!petTopImage ?
                <Text style={[CommonStyles.captureImageLable]}>{instArray[2].title}</Text>
                : <TouchableOpacity style={[styles.viewBtnStyle, {

                }]} onPress={() => { scanDocument(2) }}>
                  <ImageBackground style={styles.viewTextStyle} resizeMode="contain" source={retakeIcon} />
                </TouchableOpacity>}
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => { scanDocument(0) }}>
              <View style={[styles.imageItemSmall]}>
                {petFrontImage ?
                  <TouchableOpacity onPress={() => { viewCaptureImageAction(petFrontImage) }}>
                    <ImageBackground style={styles.imageStyle} resizeMode="contain" source={{ uri: petFrontImage }}>
                    </ImageBackground>
                  </TouchableOpacity> :
                  <ImageBackground style={styles.infoImageStyle} resizeMode='contain' source={dogImgArray[0]}></ImageBackground>}

                {!petFrontImage ?
                  <Text style={[CommonStyles.captureImageLable]}>{instArray[0].title}</Text>
                  : <TouchableOpacity style={[styles.viewBtnStylePortrait, {}]} onPress={() => { scanDocument(0) }}>
                    <ImageBackground style={styles.viewTextStyleFront} resizeMode="contain" source={retakeIcon} /></TouchableOpacity>}

              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { scanDocument(1) }}>
              <View style={[styles.imageItemSmall]}>
                {petBackImage ?
                  <TouchableOpacity onPress={() => { viewCaptureImageAction(petBackImage) }}>
                    <ImageBackground style={styles.imageStyle} resizeMode="contain" source={{ uri: petBackImage }} >
                    </ImageBackground>
                  </TouchableOpacity> :
                  <ImageBackground style={styles.infoImageStyle} resizeMode='contain' source={dogImgArray[1]}></ImageBackground>
                }
                {!petBackImage ?
                  <Text style={[CommonStyles.captureImageLable]}>{instArray[1].title}</Text>
                  : <TouchableOpacity style={[styles.viewBtnStylePortrait]} onPress={() => { scanDocument(1) }}>
                    <ImageBackground style={styles.viewTextStyleFront} resizeMode="contain" source={retakeIcon} /></TouchableOpacity>}
              </View>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView >

      <View style={CommonStyles.bottomViewComponentStyle}>
        <BottomComponent
          rightBtnTitle={'Submit'}
          rigthBtnState={isDataValid}
          isRightBtnEnable={true}
          rightButtonAction={async () => validateNextAction()}
          leftButtonAction={async () => previousBtnAction()}
        />
      </View>

      {
        isImageView ? <ImageView style={styles.videoViewStyle}
          images={imgsRef.current}
          imageIndex={0}
          visible={isImageView}
          onRequestClose={() => set_isImageView(false)}
        /> : null
      }

      {isLoading === true ? <LoaderComponent isLoader={false} loaderText={loaderText} isButtonEnable={false} /> : null}

      {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
        <AlertComponent
          header={popUpAlert}
          message={popupMessage}
          isLeftBtnEnable={popupLftBtnEnable}
          isRightBtnEnable={true}
          leftBtnTilte={popLeftTitle}
          rightBtnTilte={popRightTitle}
          popUpRightBtnAction={() => popOkBtnAction()}
          popUpLeftBtnAction={() => popCancelBtnAction()}
        />
      </View> : null}

    </View >

  );
};

export default PetImageCaptureComponent;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },

  container: {
    width: wp('100%'),
    minHeight: hp('75%'),
    alignItems: 'center',
    marginBottom: hp('15%'),
    backgroundColor: 'white',
    marginTop: hp('1%')
  },
  heading: {
    fontSize: 25,
    textAlign: 'center',
    marginVertical: 10,
  },
  textStyle: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 10,
  },
  infoImageStyle: {
    width: wp('25%'),
    height: hp('13%'),
    // marginVertical: 5,
  },

  infoImageStyle1: {
    width: wp('25%'),
    height: hp('13%'),
    marginVertical: 5,
  },

  buttonTextStyle: {
    color: 'black',
    fontSize: fonts.fontMedium,
    ...CommonStyles.textStyleExtraBold,
  },

  input: {
    flexDirection: 'row',
    width: wp('80%'),
    height: hp('6%'),
    borderRadius: wp('1%'),
    borderWidth: 1,
    borderColor: '#dedede',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textInputContainerStyle: {
    flexDirection: 'row',
    margin: hp('1%'),
    borderColor: '#dedede',
    backgroundColor: 'white',
  },

  loginBtn: {
    width: "60%",
    borderRadius: 5,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1338BE",
  },
  submitBtn: {
    width: "70%",
    borderRadius: 5,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4511e",
    marginTop: 20
  },
  submitText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  imageStyle: {
    width: wp('35%'),
    height: hp('23%'),
    resizeMode: 'contain',
    alignSelf: 'center',
    borderRadius: 5,
  },
  imageStyleLandScape: {
    width: wp('60%'),
    height: hp('18%'),
    resizeMode: 'contain',
    borderRadius: 5
  },
  crossImageStyle: {
    width: wp('6%'),
    height: hp('5%'),
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    top: -15,
    right: -5,
    position: 'absolute',
    // backgroundColor: "#f4511e",
  },

  viewBtnStylePortrait: {
    width: wp('40%'),
    bottom: 0,
    height: hp('8.5%'),
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'absolute',
  },

  viewBtnStyle: {
    width: wp('85%'),
    bottom: 0,
    height: hp('10%'),
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'absolute',
  },

  viewTextStyle: {
    aspectRatio: 1,
    height: hp('7%'),
    marginEnd: wp('2%')
  },

  viewTextStyleFront: {
    aspectRatio: 1,
    height: hp('7%'),
    marginEnd: wp('2%')
  },

  mediaViewUIStyle: {
    marginTop: hp('2%'),
    height: hp('30%'),
    width: wp('90%'),
    borderColor: 'grey',
    borderWidth: 2,
    borderRadius: 5,
    borderStyle: 'dotted',
    alignItems: 'center',
    justifyContent: 'center'
  },

  imageBackViewStyle: {
    width: wp('50%'),
    height: hp('25%'),
    alignItems: 'center',
    marginTop: hp('5%')
    // justifyContent:'center'
  },

  loader: {
    width: wp('35%'),
    height: hp('10%'),
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-around',
    backgroundColor: "#add8e6",
    alignItems: 'center'
  },

  imageItemSmall: {
    width: wp('40%'),
    height: hp('25%'),
    marginLeft: wp('1%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6FAFD',
    margin: wp('3%'),
    borderColor: '#CBCBCB',
    borderRadius: wp('2%'),
    borderWidth: 1.0,
  },

  imageItemLarge: {
    width: wp('85%'), height: hp('20%'), marginLeft: wp('1%'), alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6FAFD', margin: wp('2%'),
    borderColor: '#CBCBCB',
    borderRadius: wp('2%'),
    borderWidth: 1.0,
  },

  progressStyle: {
    fontSize: fonts.fontSmall,
    ...CommonStyles.textStyleSemiBold,
    color: 'white',
  },

});