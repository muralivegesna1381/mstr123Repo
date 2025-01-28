import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import * as ImagePicker from 'react-native-image-picker';
import CameraRoll from "@react-native-community/cameraroll";

export async function getMediaFromGallery() {

    ImagePicker.launchImageLibrary({
        mediaType: mediaType === 0 ? 'photo' : 'video',
        includeBase64: false,
        selectionLimit: mediaType === 0 ? 7 - mediaSize : 5 - mediaSize,
        durationLimit: 1200,
        includeExtra: true,
      }, async (response) => {
  
          if (response && response.errorCode === 'permission') {

          } else if (response.didCancel) {
            
          } else if (response.error) {
           
          } else {
  
          }
  
    },)
};

export async function getMediaFromCamera() {

    ImagePicker.launchImageLibrary({
        mediaType: mediaType === 0 ? 'photo' : 'video',
        includeBase64: false,
        selectionLimit: mediaType === 0 ? 7 - mediaSize : 5 - mediaSize,
        durationLimit: 1200,
        includeExtra: true,
      }, async (response) => {
  
          if (response && response.errorCode === 'permission') {

          } else if (response.didCancel) {
            
          } else if (response.error) {
           
          } else {
  
          }
  
    },)
};