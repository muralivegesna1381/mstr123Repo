import AsyncStorage from "@react-native-community/async-storage";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, ImageBackground, NativeModules, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, BackHandler, FlatList } from 'react-native';
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
import { Image } from 'react-native-compressor';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import RotatePhoto from 'react-native-rotate-photo';
import BuildEnv from './../../config/environment/environmentConfig';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as Apolloclient from './../../config/apollo/apolloConfig';
import * as Queries from "./../../config/apollo/queries";
import * as ImagePicker from 'react-native-image-picker';
import Highlighter from "react-native-highlight-words";
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";
import perf from '@react-native-firebase/perf';

import RetakeImg from "./../../../assets/images/bfiGuide/svg/re-take.svg";
import PetFrontImg from "./../../../assets/images/bfiGuide/svg/ic_front.svg";
import PetBackImg from "./../../../assets/images/bfiGuide/svg/ic_back.svg";
import PetTopImg from "./../../../assets/images/bfiGuide/svg/ic_top.svg";
import PetSideLeftImg from "./../../../assets/images/bfiGuide/svg/ic_side_left.svg";
import PetSideRightImg from "./../../../assets/images/bfiGuide/svg/ic_side_right.svg";
import PetFullBodyImg from "./../../../assets/images/bfiGuide/svg/ic_full_body.svg";

const Environment = JSON.parse(BuildEnv.Environment());

const PetImageCaptureComponent = ({ route, navigation, props }) => {

  const [index, set_index] = useState(0);
  const [isDataValid, setIsDataValid] = React.useState(true);
  const [petID, setPetID] = useState(undefined);
  const [petParentId, set_PetParentId] = useState(undefined);
  const [isFromOnBoarding, set_isFromOnBoarding] = useState(false);
  const [petCurrentImage, setPetCurrentImage] = useState(undefined);
  const [petFrontCropImage, setPetFrontCropImage] = useState(undefined);
  const [petBackCropImage, setPetBackCropImage] = useState(undefined);
  const [petTopCropImage, setPetTopCropImage] = useState(undefined);
  const [petRightSideCropImage, setPetRightSideCropImage] = useState(undefined);
  const [petLeftSideCropImage, setPetLeftSideCropImage] = useState(undefined);
  const [petFullCropBody, setPetFullCropBody] = useState(undefined);
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
  const [statusSubject, set_StatusSubject] = useState(undefined)
  const [isOpenMediaOptions, set_openMediaOptions] = useState(false);
  const [date, set_Date] = useState(new Date());
  const [isPopUp, set_isPopUp] = useState(false);

  var rotation = 0;
  let isLoadingdRef = useRef(0);
  var totalRecordsData = useRef([]);

  const [dogImgArray, set_dogImgArray] = useState([
    {"id":1, "pImg" : PetFrontImg },
    {"id":2, "pImg" : PetBackImg },
    {"id":3, "pImg" : PetTopImg },
    {"id":4, "pImg" : PetSideLeftImg },
    {"id":5, "pImg" : PetSideRightImg },
    {"id":6, "pImg" : PetFullBodyImg }
  ]);

  let indexNew = useRef(0)
  let imgsRef = useRef(undefined)
  let hashmapMediaData = useRef(new Map())
  let isFirebaseUploadDone = useRef([])
  let hashmapImageSigmentationStatus = useRef(new Map())

  let refImagePath = useRef(undefined)
  let refImageBase64 = useRef(undefined)
  let refImageCroppedPath = useRef(undefined)

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

  let trace_bfi_capture_Screen;

  useEffect(() => {

    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_capture_bfi);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_capture_bfi, "User in Capture BFI Screen", '');
    });

    checkCameraPermissions();
    updateParentID();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    return () => {
      initialSessionStop();
      focus();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  useEffect(() => {
    //Update when coming from camera component
    if (route.params?.indexPos) {
      indexNew.current = route.params?.indexPos
      set_index(indexNew.current);
    }
    if (route.params?.imagePath) {
      //Rotate Top,Left and Right Side image
      set_loaderText(Constant.LOADING_MSG_IMAGE_PROCESSING)
      if (route.params?.indexPos === 2 || route.params?.indexPos === 3 || route.params?.indexPos === 4 || route.params?.indexPos === 5) {
        rotateImage(route.params?.imagePath, route.params?.imageCroppedPath)
      } else {
        savePhotoInLocalGallery(route.params?.imagePath, route.params?.imageCroppedPath)
      }
    }

  }, [route.params?.indexPos, route.params?.imagePath, route.params?.imageCroppedPath]);

  const initialSessionStart = async () => {
    trace_bfi_capture_Screen = await perf().startTrace('t_inCaptureBFIScreen');
  };

  const initialSessionStop = async () => {
    await trace_bfi_capture_Screen.stop();
  };

  const updateParentID = async () => {
    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let userRole = UserDetailsModel.userDetailsData.userRole.RoleId;
    if (parseInt(userRole) === 7) {
      set_PetParentId(clientId)
    }
  }

  const handleBackButtonClick = () => {
    backBtnAction();
    return true;
  };

  const rotateImage = async (sourceImage, croppedPath) => {
    let rotateCroppedPath = undefined
    await RotatePhoto.createRotatedPhoto(croppedPath, 2000, 2000, "JPEG", 100, 270, null)
      .then(response => {
        rotateCroppedPath = response.uri
      })
      .catch(err => {
      });

    await RotatePhoto.createRotatedPhoto(sourceImage, 2000, 2000, "JPEG", 100, 270, null)
      .then(response => {
        savePhotoInLocalGallery(response.uri, rotateCroppedPath)
      })
      .catch(err => {
      });
  }

  const savePhotoInLocalGallery = async (localPath, croppedPath) => {
    moveToNativeFunctions(localPath, croppedPath)
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
    set_openMediaOptions(true)
  };

  const moveToNativeFunctions = (imagePath, croppedPath) => {
    RNFS.readFile(croppedPath, 'base64')
      .then(imageBase64 => {
        if (Platform.OS === 'android') {
          //checkBlurStatus(false, imagePath, imageBase64, croppedPath)
          NativeModules.ImageBlueIdentification.checkIsImageBlur(imageBase64, (value) => {
            checkBlurStatus(value, imagePath, imageBase64, croppedPath)
          });
        }
        else {
          NativeModules.RNOpenCvLibrary.checkForBlurryImage(imageBase64, (error, dataArray) => {
            checkBlurStatus(dataArray[0], imagePath, imageBase64, croppedPath)
          });
        }
      });
  };

  const checkBlurStatus = (value, imagePath, imageBase64, croppedPath) => {
    refImagePath.current = imagePath
    refImageBase64.current = imageBase64
    refImageCroppedPath.current = croppedPath

    if (value == false) {
      handleBlurResponse()
    } else {
      //Image is Blur
      set_isLoading(false);
      clearImageLables()

      set_popupMessage(Constant.CAPTURED_BLURRY_IMAGES)
      set_popRightTitle('Re-Take');
      set_popLeftTitle('Ignore');
      set_isPopUp(true);
      set_popupLftBtnEnable(true)
    }
  };

  const handleBlurResponse = () => {
    //Object Detection using ML-Kit
    if (Platform.OS === "android") {
      set_isLoading(true);
      NativeModules.ImageObjectDetection.getImageLabellingData(refImageBase64.current, (value) => {
        set_isLoading(false);
        handleNativeObjectDetection(value, refImagePath.current)
      });
    } else {
      //ios image labelling validation
      set_isLoading(true);
      NativeModules.ObjectDetection.imageObjectDetection(refImageBase64.current, (value) => {
        set_isLoading(false);
        handleNativeObjectDetection(value, refImagePath.current)
      });
    }
  }

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
      handleObjectDetectionResponse(imagePath)
    } else {
      set_isLoading(false);
      set_popupMessage(Constant.CAPTURE_DOG_IMAGE)
      set_popRightTitle('Re-Take');
      set_popLeftTitle('Ignore');
      set_isPopUp(true);
      set_popupLftBtnEnable(true)
    }
  }

  const handleObjectDetectionResponse = (imagePath) => {
    //Update UI 
    setPetCurrentImage(imagePath)

    if (indexNew.current === 0) {
      setPetFrontImage(imagePath)
      setPetFrontCropImage(refImageCroppedPath.current)
    }
    else if (indexNew.current === 1) {
      setPetBackImage(imagePath)
      setPetBackCropImage(refImageCroppedPath.current)
    }
    else if (indexNew.current === 2) {
      setPetTopImage(imagePath)
      setPetTopCropImage(refImageCroppedPath.current)
    }
    else if (indexNew.current === 3) {
      setPetLeftSideImage(imagePath)
      setPetLeftSideCropImage(refImageCroppedPath.current)
    }
    else if (indexNew.current === 4) {
      setPetRightSideImage(imagePath)
      setPetRightSideCropImage(refImageCroppedPath.current)
    }
    else if (indexNew.current === 5) {
      setPetFullBody(imagePath)
      setPetFullCropBody(refImageCroppedPath.current)
    }

    //compress and update thumbnail
    compressImage(imagePath)
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

    if(result && result.length > 10) {
      RotatePhoto.createRotatedPhoto(result, 2000, 2000, "JPEG", 100, rotation, null)
      .then(response => {
        updateThumnailPath(response.uri)
      })
      .catch(err => {
        updateThumnailPath(imgPath)
      });
    } else {
      updateThumnailPath(imgPath)
    }
    
  };

  const updateThumnailPath = async (compressPath) => {

    submitToImageClasification(compressPath)

    if (indexNew.current === 0) setPetFrontThumbImage(compressPath)
    else if (indexNew.current === 1) setPetBackThumbImage(compressPath)
    else if (indexNew.current === 2) setPetTopThumbImage(compressPath)
    else if (indexNew.current === 3) setPetLeftSideThumbImage(compressPath)
    else if (indexNew.current === 4) setPetRightSideThumbImage(compressPath)
    else if (indexNew.current === 5) setPetFullBodyThumb(compressPath)

    set_isLoading(false);
  }

  const submitToImageClasification = (imagePath) => {

    //display widget
    setIsAsyncPending(true)

    //by default update as in-progress
    updateWidgetStatus(instArray[indexNew.current].title, status_inprogress)

    set_isLoading(true)
    isLoadingdRef.current = 1;
    imagePath = imagePath.replace("file://file:///", "file:///")
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
        fetch(Environment.bfiImageClassfication, options)
          .then(response => response.json())
          .then(data => {
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
            firebaseHelper.logEvent(firebaseHelper.event_image_classification_api, firebaseHelper.screen_capture_bfi, "Image Classification Service failed", 'Service error : ' + error.message);
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
    //handle back exits if user captured some orientation
    if (hashmapImageSigmentationStatus.current.size > 0) {
      set_popupMessage(true)
      set_popupMessage(Constant.BFI_CAPTURE_SCREEN_LEAVE)
      set_popRightTitle('OK');
      set_popLeftTitle('Cancel');
      set_isPopUp(true);
      set_popupLftBtnEnable(true)
    }
    else if (isLoadingdRef.current === 0) {
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
      firebaseHelper.logEvent(firebaseHelper.event_capture_bfi_submit_click, firebaseHelper.screen_capture_bfi, "CaptureBFI Submit action clicked", '');
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
    // return

    var submitRequest = { petParentId: petParentId, petId: petID, "petBfiImages": jsonArray };

    //check already background processing happening or not
    let uploadProcess = await DataStorageLocal.getDataFromAsync(Constant.CAPTURED_BFI_UPLOAD_PROCESS_STARTED);

    //If Yes Store Data in backup : CaptureImagesData2
    if (uploadProcess) {
      await DataStorageLocal.saveDataToAsync('CaptureImagesData2', JSON.stringify(submitRequest));
    } else {
      await DataStorageLocal.saveDataToAsync('CaptureImagesData', JSON.stringify(submitRequest));
    }

    Apolloclient.client.writeQuery({
      query: Queries.UPLOAD_CAPTURE_BFI_BACKGROUND,
      data: { data: {value: new Date(), bfiData: 'checkForBFIUploads', __typename: 'UploadCaptureBFIBackground' } },
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
    } if (popupMessage === Constant.BFI_CAPTURE_SCREEN_LEAVE) {
      set_isPopUp(false);
      navigation.pop()
    } else {
      set_popUpAlert("Alert")
      set_isPopUp(false);
      set_popupMessage(undefined);
    }
  };

  const popCancelBtnAction = () => {
    if (popupMessage === Constant.CAPTURED_BLURRY_IMAGES) {
      handleBlurResponse()
      set_isPopUp(false);
      set_popupMessage(undefined);
    }
    else if (popupMessage === Constant.CAPTURE_DOG_IMAGE) {
      handleObjectDetectionResponse(refImagePath.current)
      set_isPopUp(false);
      set_popupMessage(undefined);
    }
    else {
      set_isPopUp(false);
      set_popupMessage(undefined);
    }
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
      if (value === status_inprogress) {
        pendingData.push(key)
        pendingCount = pendingCount + 1
        setIsDataValid(true);
        // setIsDataValid(false)
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

  const actionOnRow = async (item) => {
    set_openMediaOptions(false);
    if (item === 'GALLERY') {
      if (Platform.OS === 'ios') {
        chooseImage()
      } else {
        if (Platform.Version > 31) {
          chooseImage()
        } else {
          chooseMultipleMedia();
        }
      }
    }
    if (item === 'CAMERA') {
      if (isCameraPermissionON === false) {
        checkCameraPermissions()
        return
      }
      navigation.navigate('CameraComponent', { indexPos: indexNew.current, })
    }
  }

  const chooseImage = () => {
    set_popupMessage(Constant.LOADER_WAIT_MESSAGE)
    // set_isLoading(true);
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
      selectionLimit: 1,
      durationLimit: 1200,
      includeExtra: true,
    },
      async (response) => {
        set_isLoading(false);
        if (response && response.errorCode === 'permission') {
          set_isLoading(false);
          let high = <Highlighter highlightStyle={{ fontWeight: "bold", }}
            searchWords={[Constant.GALLERY_PERMISSION_MSG_HIGHLIGHTED]}
            textToHighlight={
              Constant.GALLERY_PERMISSION_MSG
            } />
          set_popupMessage(high)
          set_popUpAlert('Alert');
          set_popRightTitle('OK');
          set_isPopUp(true);
          return
        }
        if (response.didCancel) {
          set_isLoading(false);
        } else if (response.error) {
          set_isLoading(false);
        } else {
          if (response && response.assets) {
            moveToNativeFunctions(response.assets[0].uri, response.assets[0].uri)
            set_isLoading(false);
          } else {
            set_isLoading(false);
          }
        }
      },)
  };

  const chooseMultipleMedia = async () => {
    try {
      var response = await MultipleImagePicker.openPicker({
        selectedAssets: [],
        maxVideo: 0,
        usedCameraButton: true,
        singleSelectedMode: true,
        isCrop: false,
        isCropCircle: false,
        mediaType: "image",
        singleSelectedMode: true,
        selectedColor: '#f9813a',
        haveThumbnail: true,
        maxSelectedAssets: 1,
        allowedPhotograph: true,
        allowedVideoRecording: false,
        preventAutomaticLimitedAccessAlert: true,
        isPreview: true
      });

      if (response && response.path) {
        moveToNativeFunctions(response.path, response.path)
      }
    } catch (e) { } finally {
      set_isLoading(false);
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
              {petFullCropBody ?
                <TouchableOpacity onPress={() => { viewCaptureImageAction(petFullCropBody) }}>
                  <ImageBackground style={styles.imageStyleLandScape} resizeMode="contain" source={{ uri: petFullCropBody }} />
                </TouchableOpacity> : <PetFullBodyImg style={styles.infoImageStyle1}/>
               
              }
              {!petFullCropBody ?
                < Text style={[CommonStyles.captureImageLable]}>{instArray[5].title}</Text>
                : <View style={[styles.viewBtnStyle]}>
                  <TouchableOpacity onPress={() => { scanDocument(5) }}>
                    <RetakeImg style={styles.viewTextStyle} />
                  </TouchableOpacity>
                </View>
              }
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { scanDocument(3) }}>
            <View style={[styles.imageItemLarge]}>
              {petLeftSideCropImage ?
                <TouchableOpacity onPress={() => { viewCaptureImageAction(petLeftSideCropImage) }}>
                  <ImageBackground style={styles.imageStyleLandScape} resizeMode="contain" source={{ uri: petLeftSideCropImage }} />
                </TouchableOpacity> :
                <PetSideLeftImg style={styles.infoImageStyle1}/>
              }
              {!petLeftSideCropImage ?
                < Text style={[CommonStyles.captureImageLable]}>{instArray[3].title}</Text>
                : <TouchableOpacity style={[styles.viewBtnStyle]} onPress={() => { scanDocument(3) }}>
                  <RetakeImg style={styles.viewTextStyle}/>
                </TouchableOpacity>
              }
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { scanDocument(4) }}>
            <View style={[styles.imageItemLarge]}>
              {petRightSideCropImage ?
                <TouchableOpacity onPress={() => { viewCaptureImageAction(petRightSideCropImage) }}>
                  <ImageBackground style={styles.imageStyleLandScape} source={{ uri: petRightSideCropImage }} />
                </TouchableOpacity> : <PetSideRightImg style={styles.infoImageStyle1}/>
              }
              {!petRightSideCropImage ?
                <Text style={[CommonStyles.captureImageLable]}>{instArray[4].title}</Text>
                : <TouchableOpacity style={[styles.viewBtnStyle]} onPress={() => { scanDocument(4) }}>
                  <RetakeImg style={styles.viewTextStyle}/>
                </TouchableOpacity>}

            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { scanDocument(2) }}>
            <View style={[styles.imageItemLarge]}>
              {petTopCropImage ?
                <TouchableOpacity onPress={() => { viewCaptureImageAction(petTopCropImage) }}>
                  <ImageBackground style={[styles.imageStyleLandScape]} source={{ uri: petTopCropImage }} />
                </TouchableOpacity> : <PetTopImg style={[styles.infoImageStyle1, { width: wp('25%'), }]}/>
              }
              {!petTopCropImage ?
                <Text style={[CommonStyles.captureImageLable]}>{instArray[2].title}</Text>
                : <TouchableOpacity style={[styles.viewBtnStyle, {

                }]} onPress={() => { scanDocument(2) }}>
                  <RetakeImg style={styles.viewTextStyle}/>
                </TouchableOpacity>}
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => { scanDocument(0) }}>
              <View style={[styles.imageItemSmall]}>
                {petFrontCropImage ?
                  <TouchableOpacity onPress={() => { viewCaptureImageAction(petFrontCropImage) }}>
                    <ImageBackground style={styles.imageStyle} resizeMode="contain" source={{ uri: petFrontCropImage }}>
                    </ImageBackground>
                  </TouchableOpacity> : <PetFrontImg width={wp('14%')} style={[styles.infoImageStyle1]}/>}

                {!petFrontCropImage ?
                  <Text style={[CommonStyles.captureImageLable]}>{instArray[0].title}</Text>
                  : <TouchableOpacity style={[styles.viewBtnStylePortrait, {}]} onPress={() => { scanDocument(0) }}>
                    <RetakeImg style={styles.viewTextStyle}/></TouchableOpacity>}

              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { scanDocument(1) }}>
              <View style={[styles.imageItemSmall]}>
                {petBackCropImage ?
                  <TouchableOpacity onPress={() => { viewCaptureImageAction(petBackCropImage) }}>
                    <ImageBackground style={styles.imageStyle} resizeMode="contain" source={{ uri: petBackCropImage }} >
                    </ImageBackground>
                  </TouchableOpacity> :<PetBackImg width={wp('15%')} height={hp('16%')} style={[styles.infoImageStyle1]}/>
                }
                {!petBackCropImage ?
                  <Text style={[CommonStyles.captureImageLable]}>{instArray[1].title}</Text>
                  : <TouchableOpacity style={[styles.viewBtnStylePortrait]} onPress={() => { scanDocument(1) }}>
                    <RetakeImg style={styles.viewTextStyle}/></TouchableOpacity>}
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

      {isLoading === true ? <LoaderComponent isLoader={false} loaderText={'Please Wait...'} isButtonEnable={false} /> : null}

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

      {isOpenMediaOptions ? <View style={[styles.popSearchViewStyle]}>
        <FlatList
          data={['CAMERA', 'GALLERY', 'CANCEL']}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => { actionOnRow(item) }}>
              <View style={styles.flatview}>
                <Text numberOfLines={2} style={[styles.name]}>{item}</Text>
              </View>
            </TouchableOpacity>
          )}
          enableEmptySections={true}
          keyExtractor={(item, index) => index}
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

  infoImageStyle: {
    width: wp('25%'),
    height: hp('13%'),
  },

  infoImageStyle1: {
    width: wp('25%'),
    height: hp('13%'),
    marginVertical: 5
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
    borderRadius: 5,
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
    width: wp('85%'),
    height: hp('20%'),
    marginLeft: wp('1%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6FAFD',
    margin: wp('2%'),
    borderColor: '#CBCBCB',
    borderRadius: wp('2%'),
    borderWidth: 1.0,
  },

  progressStyle: {
    fontSize: fonts.fontSmall,
    ...CommonStyles.textStyleSemiBold,
    color: 'white',
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

  flatview: {
    height: hp("8%"),
    alignSelf: "center",
    justifyContent: "center",
    borderBottomColor: "grey",
    borderBottomWidth: wp("0.1%"),
    width: wp('90%'),
    alignItems: 'center',
  },

  name: {
    ...CommonStyles.textStyleSemiBold,
    fontSize: fonts.fontMedium,
    textAlign: "left",
    color: "black",
  },

});