import React, { useState, useEffect,useRef } from 'react';
import {Platform,BackHandler} from 'react-native';
import PetEditUI from './petEditUI';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import { PermissionsAndroid } from 'react-native';
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import BuildEnv from './../../config/environment/environmentConfig';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import Highlighter from "react-native-highlight-words";
import * as ImagePicker from 'react-native-image-picker';
import PhotoEditor from 'react-native-photo-editor';
import * as PermissionsiOS from './../../utils/permissionsComponents/permissionsiOS';
import * as CheckPermissionsAndroid from './../../utils/permissionsComponents/permissionsAndroid';
import * as Apolloclient from './../../config/apollo/apolloConfig';
import * as Queries from "../../config/apollo/queries";
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";

var RNFS = require('react-native-fs');
const Environment = JSON.parse(BuildEnv.Environment());
const axios = require('axios').default;
let trace_inPetEditScreen;

const PetEditComponent = ({navigation, route, ...props }) => {

    const [petObj, set_petObj] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [isEdit, set_isEdit] = useState(false);
    const [imagePathNew, set_imagePathNew] = useState(undefined);
    const [addressObj, set_addressObj] = useState(undefined);
    const [address, set_address] = useState('');
    const [petParentObj, set_petParentObj] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [isPopLftBtnEnable, set_isPopLftBtnEnable] = useState(undefined);
    const [isPopRBtnTitle, set_isPopRBtnTitle] = useState('YES');
    const [isMediaSelection, set_isMediaSelection] = useState(false);

    let isLoadingdRef = useRef(0);
    
    useEffect(() => {

      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_pet_edit);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_pet_edit, "User in Edit Pet Screen", '');
      
      if(Platform.OS==='android'){
        requestCameraPermission();
      } 
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
        initialSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };
  
    }, []);

     useEffect(() => {

        if(route.params?.petObject){
          set_imagePathNew(route.params?.petObject.photoUrl);
          set_petObj(route.params?.petObject);
          if(route.params?.petObject.petAddress && Object.keys(route.params?.petObject.petAddress).length !== 0) {

            set_addressObj(route.params?.petObject.petAddress);

            let tempLine2 = route.params?.petObject.petAddress.address2 && route.params?.petObject.petAddress.address2 !== '' ? route.params?.petObject.petAddress.address2+", "  : '';
              let tempAdd = route.params?.petObject.petAddress.address1 + ', ' 
              + tempLine2
              + route.params?.petObject.petAddress.city + ', ' 
              + route.params?.petObject.petAddress.state+ ', '
              + route.params?.petObject.petAddress.country+ ', '
              + route.params?.petObject.petAddress.zipCode;
              set_address(tempAdd);

          } else if(route.params?.petObject && route.params?.petObject.isPetWithPetParent) {
            getPetParentAddressAsync(); 
          }  
            
        }

    }, [route.params?.petObject]);

    const initialSessionStart = async () => {
      trace_inPetEditScreen = await perf().startTrace('t_inPetEditScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inPetEditScreen.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const requestCameraPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "App Camera Permission",
            message:"App needs access to your camera ",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        } else {
        }
      } catch (err) {}
    };

    const navigateToPrevious = () => {  

      // if(isLoadingdRef.current === 0){
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_pet_edit, "User clicked on back button to navigate to DashBoardService", '');
        navigation.navigate('DashBoardService');
      // }
        
    };

    const editButtonAction = () => {  
      set_isEdit(true);   
    };

    const actionOnRow = async (item) => {

      set_isEdit(false);
      if (item === 'GALLERY') {
            // set_isLoading(true);
            // isLoadingdRef.current = 1;
        if(Platform.OS === 'ios') {
          chooseImage()
        } else {
          chooseImage();
        }
      } if (item === 'CAMERA') {

        if(Platform.OS === 'android') {

          let androidPer = await CheckPermissionsAndroid.checkCameraPermissions();
      
          if(androidPer === 'Camera not granted') {
            let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
              searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED_ANDROID]}
              textToHighlight={Constant.CAMERA_PERMISSION_MSG_ANDROID}/>
            set_popUpMessage(high);
            set_popUpAlert('Alert');
            set_isPopUp(true); 
            return;
          }
      
        } else {
      
          let camPermissions = await DataStorageLocal.getDataFromAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED);
          if(camPermissions && camPermissions === 'isFirstTime') {
            await DataStorageLocal.saveDataToAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED,'existingUser');
          } else {
      
            let permissions = await PermissionsiOS.checkCameraPermissions();
            if(!permissions) {
              
              let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
              searchWords={[Constant.CAMERA_PERMISSION_MSG_HIGHLIGHTED]}
              textToHighlight={
                Constant.CAMERA_PERMISSION_MSG
              }/>
              set_popUpMessage(high);
              set_popUpAlert('Alert');
              set_isPopUp(true); 
              return;                   
            } 
      
          }
          
        }
            
        set_isLoading(true);
        chooseCamera();
      }
    };

    const chooseMultipleMedia = async () => {

      set_isLoading(true);
      isLoadingdRef.current = 1;
      firebaseHelper.logEvent(firebaseHelper.event_pet_img_choose_action, firebaseHelper.screen_pet_edit, "User clicked on Update pet Image button", '');
      try {
        var response = await MultipleImagePicker.openPicker({
          selectedAssets: [],
          // isExportThumbnail: true,
          maxVideo: 0,
          usedCameraButton: true,
          singleSelectedMode: true,
          isCrop: false,
          isCropCircle: false,
          mediaType : "image",
          singleSelectedMode: true,
          selectedColor: '#f9813a',
          haveThumbnail: true,
          maxSelectedAssets: 1,
          allowedPhotograph : true,
          allowedVideoRecording : false,
          preventAutomaticLimitedAccessAlert : true,
          isPreview:true
        });
  
        if(response && response.path){
            firebaseHelper.logEvent(firebaseHelper.event_pet_img_selection_done, firebaseHelper.screen_pet_edit, "User selected/picked the Image", '');
            set_imagePathNew(response.path);
            // addEditedImg(response.path);
            saveImage(response.path);
        } else {
          set_isLoading(false);
          isLoadingdRef.current = 0;
        }
      } catch (e) {
        firebaseHelper.logEvent(firebaseHelper.event_pet_img_selection_cancel, firebaseHelper.screen_pet_edit, "User clicked on cancel button in Image library", '');
        set_isLoading(false);
        isLoadingdRef.current = 0;
      }
    };

    const chooseCamera = async () => {

      let options = {
        mediaType: 'photo',
        durationLimit: 1200,
        videoQuality: "medium", // 'low', 'medium', or 'high'
        allowsEditing: true, //Allows Video for trimming
        storageOptions: {
          skipBackup: true,
          path: "Wearables",
        },
      };
      ImagePicker.launchCamera(options, async (response) => {
    
        if (response.didCancel) {
          set_isLoading(false);
          isLoadingdRef.current = 0;
        } else if (response.error) {
          set_isLoading(false);
          isLoadingdRef.current = 0;
        } else {
          set_isLoading(false);
          isLoadingdRef.current = 0;
          set_imagePathNew(response.assets[0].uri);
          saveImage(response.assets[0].uri);
        }
      });
    
    };

    const saveImage =  async (fileUrl) => {

      set_isLoading(true);
      isLoadingdRef.current = 1;
      var formdata = new FormData();
      const fileType = fileUrl[fileUrl.length - 1];
      let token1 = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
      let client1 = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
      formdata.append("petId", petObj.petID);
      formdata.append("petParentId", client1);
      formdata.append("FileExtension", "jpg");
      formdata.append("file", {
        uri: fileUrl,
        name: "image.jpg",
        type: `image/${fileType}`,
        path: fileUrl,
      });

      axios({
        method: "POST",
        url: Environment.uri + apiMethodManager.UPLOAD_PET_PHOTO,
        data: formdata,
        headers: { "Content-Type": "multipart/form-data", "ClientToken": token1 },
      }).then((res) => {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        //updateDashboardData();
      }).catch((err) => {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        firebaseHelper.logEvent(firebaseHelper.event_pet_img_api_fail, firebaseHelper.screen_pet_edit, "Updating pet image failed", 'Pet Id : '+petObj.petID);
      })

    };

    const chooseImage = () => {

      //set_isLoading(true);
      ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        selectionLimit: 1,
        durationLimit:1200,
        includeExtra : true,
      },
      async (response) => {
        if(response && response.errorCode === 'permission') {
          set_isLoading(false);
          let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
            searchWords={[Constant.GALLERY_PERMISSION_MSG_HIGHLIGHTED]}
            textToHighlight={
              Constant.GALLERY_PERMISSION_MSG
            }/>
            set_popUpMessage(high);
            set_popUpAlert('Alert');
            set_isPopRBtnTitle('OK');
            set_isPopUp(true); 
            return
        }
        if (response.didCancel) {
          set_isLoading(false);
          isLoadingdRef.current = 0;
        } else if (response.error) {
          set_isLoading(false);
        } else {
          if(response && response.assets){
              set_imagePathNew(response.assets[0].uri);
              // addEditedImg(response.assets[0].uri);
              set_isLoading(false);
              isLoadingdRef.current = 0;
              saveImage(response.assets[0].uri);
          } else {
              set_isLoading(false);
              isLoadingdRef.current = 0;
          }

        }

      },)

    };

    const addEditedImg = async (uri) => {
  
      let fileName = uri.split('/').pop();
      let newPath = `${RNFS.DocumentDirectoryPath}/${fileName}`; 
      RNFS.copyFile(uri, newPath).then((success) => {

        setTimeout(() => {
          PhotoEditor.Edit({
            path: newPath,
                  // colors : ['#000000', '#808080', '#a9a9a9'],
            hiddenControls : ['share','sticker'],
            onDone : imagePath => {
              if(Platform.OS === 'ios') {
                set_imagePathNew(imagePath);
              } else {
                set_imagePathNew(uri);
              }
                saveImage(imagePath);
              },
              onCancel : () => {
                saveImage(uri);
              }
          });
        },700,

        );}).catch((err) => {});

    };

    const updateDashboardData = () => {
      firebaseHelper.logEvent(firebaseHelper.event_pet_img_api_success, firebaseHelper.screen_pet_edit, "User successfully updated the pet image", 'Pet Id : '+petObj.petID);
      Apolloclient.client.writeQuery({query: Queries.UPDATE_DASHBOARD_DATA,data: {data: { isRefresh:'refresh',__typename: 'UpdateDashboardData'}},});
    };

    const getPetParentAddress = async () => {

      set_isLoading(true);
      isLoadingdRef.current = 1;

      let apiMethodManage = apiMethodManager.GET_USER_PROFILE;
      let apiService = await apiRequest.getData(apiMethodManage,'',Constant.SERVICE_JAVA,navigation);
      set_isLoading(false);
      isLoadingdRef.current = 0;
        
      if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
        if(apiService.data.user) {
          set_petParentObj(apiService.data.user);
          savePetParent(apiService.data.user);  
          setPetAddress(apiService.data.user);               
        }

      }

    };

    const savePetParent = async (pParent) => {
      UserDetailsModel.userDetailsData.user = pParent;
    };

    const getPetParentAddressAsync = async () => {

      let pParentObj = UserDetailsModel.userDetailsData.user;

      if(pParentObj) {
        set_petParentObj(pParentObj);
        setPetAddress(pParentObj);
      } else {
        getPetParentAddress();
      }

    };

    const setPetAddress = (objAddress) => {

      if(objAddress && objAddress.petParentAddress && Object.keys(objAddress.petParentAddress).length !== 0 ) {

        set_addressObj(objAddress.petParentAddress);
        let tempLine2 = objAddress.petParentAddress.address2 && objAddress.petParentAddress.address2 !== '' ? objAddress.petParentAddress.address2 + ', ' : '';
        let tempAdd = objAddress.petParentAddress.address1 + ', ' 
              + tempLine2
              + objAddress.petParentAddress.city + ', ' 
              + objAddress.petParentAddress.state+ ', '
              + objAddress.petParentAddress.country+ ', '
              + objAddress.petParentAddress.zipCode;
              set_address(tempAdd);
      }

    }

    const editAddress = async() => {

      let pParentObj = UserDetailsModel.userDetailsData.user;
      
      if(pParentObj && pParentObj.address && Object.keys(pParentObj.address).length !==0){
        navigation.navigate('PetAddressEditConfirmComponent',{petObject : petObj, petParentObj:pParentObj});
      }  else {
        ///////// Navigate to Address component //////
        navigation.navigate('PetAddressEditComponent',{petObj : petObj, petParentObj:pParentObj,isFromScreen:'petEdit',isPetWithPetParent:false,isEditable : true});
      }
      
    };

    const popOkBtnAction = () => {
      set_popUpMessage('');
      set_popUpAlert('Alert');
      set_isPopRBtnTitle('OK');
      set_isPopUp(false);
      isLoadingdRef.current = 0; 
    };

    return (
        <PetEditUI 
            petObj = {petObj}
            isLoading = {isLoading}
            isEdit = {isEdit}
            imagePathNew = {imagePathNew}
            address = {address}
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            isPopUp = {isPopUp}
            isPopLftBtnEnable = {isPopLftBtnEnable}
            isPopRBtnTitle = {isPopRBtnTitle}
            editButtonAction = {editButtonAction}
            navigateToPrevious = {navigateToPrevious}
            actionOnRow = {actionOnRow}
            editAddress = {editAddress}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default PetEditComponent;