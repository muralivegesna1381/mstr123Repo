// @flow

import gql from "graphql-tag";


export const GET_USER_LOGIN = gql`
  mutation login {
    login(input: $input)
      @rest(type: "login", method: "POST", path: "migrated/ClientLogin") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_PETPARENT_PETS_INFO = gql`
  query PetParentPetsInfo {

    PetParentPetsInfo(input:$input)  @rest(type: "PetParentPetsInfo",method: "GET", path: "getPetDevicesByPetParent/{args.input}") {
        response
        status
      }
     
}`;

export const GET_MODULARITY_INFO = gql`
  query PetModularityInfo {

    PetModularityInfo(input:$input)  @rest(type: "PetModularityInfo",method: "GET", path: "pets/getMobileAppConfigs/{args.input}") {
        response
        status
      }
     
}`;

export const SEND_EMAIL_VERIFICATON_CODE = gql`
  mutation SendEmailVerificationCode {
    SendEmailVerificationCode(input: $input)@rest(type: "SendEmailVerificationCode" method: "POST" path: "migrated/SendEmailVerificationCode") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

// export const GET_USER_VERIFICATION_ACCOUNT = gql`
//   mutation verificationCode {
//     verificationCode(input: $input)@rest(type: "verificationCode" method: "POST" path: "migrated/CheckClientSMSCode") {
//       success
//       errors
//       warnings
//       responseCode
//       responseMessage
//       result
//     }
//   }
// `;

export const GET_USER_EMAIL_VERIFICATION_CODE = gql`
  mutation emailVerification {
    emailVerification(input: $input)
      @rest(
        type: "emailVerification"
        method: "POST"
        path: "SendEmailVerificationCode"
      ) {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

// export const GET_USER_CREATE_PASSWORD = gql`
//   mutation createPassword {
//     createPassword(input: $input)@rest(type: "createPassword" method: "POST" path: "migrated/SetClientPasswordBySMSCode") {
//       success
//       errors
//       warnings
//       responseCode
//       responseMessage
//       result
//     }
//   }
// `;

// export const Manage_ClientInfo = gql`
//   mutation ManageClientInfo {
//     ManageClientInfo(input: $input)@rest(type: "ManageClientInfo" method: "POST" path: "migrated/ManageClientInfo") {
//       success
//       errors
//       warnings
//       responseCode
//       responseMessage
//       result
//     }
//   }
// `;

export const GET_BEHAVIORS = gql`
  query getBehaviors {
    getBehaviors(input: $input)
      @rest(type: "getBehaviors", method: "POST", path: "migrated/GetBehaviors") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

// export const UPLOAD_OBSERVATIONS_DATA = gql`
//   mutation uploadOBSData {
//     uploadOBSData(input: $input)
//       @rest(type: "uploadOBSData", method: "POST", path: "UploadObservation") {
//       success
//       errors
//       warnings
//       responseCode
//       responseMessage
//       result
//     }
//   }
// `;

export const GET_CLIENT_INFO = gql`
  query ClientInfo {
    ClientInfo(input: $input)
      @rest(type: "ClientInfo", method: "POST", path: "migrated/GetClientInfo") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const CHANGE_USER_INFO = gql`
  mutation changeUserInfo {
    changeUserInfo(input: $input)
      @rest(type: "changeUserInfo", method: "POST", path: "migrated/ChangeClientInfo") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const CHANGE_USER_PASSWORD = gql`
  mutation changeUserpswd {
    changeUserpswd(input: $input)
      @rest(type: "changeUserPassword" method: "POST" path: "migrated/ChangePassword") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const SEND_TIMER_DETAILS = gql`
mutation SendTimerDetails {
    SendTimerDetails(input: $input)@rest(type: "SendTimerDetails"  method: "POST" path: "migrated/ManagePetTimerLog") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const DEVICE_VALIDATION = gql`
  mutation deviceValidation {
    deviceValidation(input: $input)
      @rest(type: "deviceValidation", method: "POST", path: "migrated/ValidateDeviceNumber") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_BREED_DETAILS = gql`
  query breedDetails {
    breedDetails(input: $input)
      @rest(type: "breedDetails", method: "GET", path: "migrated/GetPetBreedItems") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const ON_BOARD_PET = gql`
  mutation onBoardPet {
    onBoardPet(input: $input)
      @rest(type: "onBoardPet", method: "POST", path: "migrated/CompleteOnboardingInfo") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_SENSOR_STATUS_UPDATE = gql`
  mutation sensorUpdate {
    sensorUpdate(input: $input)
      @rest(type: "sensorUpdate", method: "POST", path: "migrated/UpdateSensorSetupStatus") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const SEND_SENSOR_NOTIFICATION_SETTINGS = gql`
  mutation sendSensorNotifications {
    sendSensorNotifications(input: $input)
      @rest(type: "sendSensorNotifications", method: "POST", path: "migrated/ManageSensorChargingNotificationSettings") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_TIMER_DETAILS = gql`
  query timerLogs {
    timerLogs(input: $input)
      @rest(type: "timerLogs", method: "POST", path: "migrated/GetPetTimerLog") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const SEND_FEEDBACK = gql`
  mutation sendFeedback {
    sendFeedback(input: $input)
      @rest(type: "sendFeedback" method: "POST" path: "migrated/ManageMobileAppScreensFeedback") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_PET_EATINGENTHUSIASIME_SCALE = gql`
  mutation getPetEatingEnthusiasmScale {
    getPetEatingEnthusiasmScale(input: $input)
      @rest(type: "getPetEatingEnthusiasmScale" method: "GET" path: "pets/getPetEatingEnthusiasmScale") {
        response
        status
    }
  }
`;

export const GET_PET_FEEDING_TIME = gql`
  mutation getPetFeedingTime {
    getPetFeedingTime(input: $input)
      @rest(type: "getPetFeedingTime" method: "GET" path: "pets/getPetFeedingTime/") {
        response
        status
    }
  }
`;

export const ADD_PET_FEEDING_TIME = gql`
  mutation addPetFeedingTime {
    addPetFeedingTime(input: $input)
      @rest(type: "addPetFeedingTime" method: "POST" path: "pets/addPetFeedingTime") {
        response
        status
    }
  }
`;

export const GET_FEEDBACK_QUESTIONNAIRE_BYPETID = gql`
  mutation getFeedbackQuestionnaireByPetId {
    getFeedbackQuestionnaireByPetId(input: $input)
      @rest(type: "getFeedbackQuestionnaireByPetId" method: "GET" path: "getFeedbackQuestionnaireByPetId/{args.input}") {
        response
        status
    }
  }
`;

export const SAVE_QUESTION_ANSWERS = gql`
  mutation saveQuestionAnswers {
    saveQuestionAnswers(input: $input)
      @rest(type: "saveQuestionAnswers" method: "POST" path: "saveQuestionAnswers") {
        response
        status
    }
  }
`;

export const GET_FEEDBACK_BEPETPARENT = gql`
  mutation getFeedbackByPetParent {
    getFeedbackByPetParent(input: $input)
      @rest(type: "getFeedbackByPetParent" method: "GET" path: "getFeedbackByPetParent/{args.input}") {
        response
        status
    }
  }
`;

export const ADD_PET_IMAGESCORING = gql`
  mutation addPetImageScoring {
    addPetImageScoring(input: $input)
      @rest(type: "addPetImageScoring" method: "POST" path: "pets/addPetImageScoring") {
        response
        status
    }
  }
`;

export const GET_PET_IMAGESCORING_SCALES = gql`
  mutation getPetImageScoringScales {
    getPetImageScoringScales(input: $input)
      @rest(type: "getPetImageScoringScales" method: "GET" path: "pets/getPetImageScoringScales/{args.input}") {
        response
        status
    }
  }
`;

export const GET_PET_BEHAVIORS = gql`
  mutation getPetBehaviors {
    getPetBehaviors(input: $input)
      @rest(type: "getPetBehaviors" method: "GET" path: "pets/getPetBehaviors/{args.input}") {
        response
        status
    }
  }
`;

export const SAVE_PET_OBSERVATION = gql`
  mutation savePetObservation {
    savePetObservation(input: $input)
      @rest(type: "savePetObservation" method: "POST" path: "pets/savePetObservation") {
        response
        status
    }
  }
`;

///////// Local Queries /////////
export const TIMER_START_QUERY = gql`
  query TimerStartQuery {
    data {
      timerStart
    }
  }
`;

export const TIMER_WIDGET_QUERY = gql`
  query TimerWidgetQuery {
    data {
      screenName
      stopTimerInterval
    }
  }
`;

export const DASHBOARD_TIMER_WIDGET = gql`
  query DashboardTimerWidget {
    data {
      timerStatus
      timerBtnActions
    }
  }
`;

export const LOG_OUT_APP = gql`
  query LogOutApp {
    data {
      isLogOut
    }
  }
`;

export const LOG_OUT_APP_ERROR = gql`
  query LogOutAppError {
    data {
      isLogOutError
    }
  }
`;

export const LOG_OUT_APP_NAVI = gql`
  query LogOutAppNavi {
    data {
      isLogOutNavi
    }
  }
`;

export const DASHBOARD_PT_WIDGET = gql`
  query DashboardPTWidget {
    data {
      isPTNavigation
    }
  }
`;

export const UPLOAD_VIDEO_BACKGROUND = gql`
  query UploadVideoBackground {
    data {
      obsData
    }
  }
`;

export const UPLOAD_VIDEO_BACKGROUND_STATUS = gql`
  query UploadVideoBackgroundStatus {
    data {
      statusUpload
      stausType
      mediaTYpe
      observationName
      fileName
      uploadProgress
      progressTxt
      internetType
    }
  }
`;

export const UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND = gql`
  query UploadQuestionnaireVideoBackground {
    data {
      questData
    }
  }
`;

export const UPLOAD_IMAGE_BACKGROUND = gql`
  query UploadImageBackground {
    data {
      imageData
    }
  }
`;

export const UPLOAD_VIDEOS_BACKGROUND = gql`
  query UploadVideosBackground {
    data {
      videoData
    }
  }
`;

export const UPDATE_PETS_PERMISSIONS = gql`
  query UpdatePetPermissions {
    data {
      petPermission
    }
  }
`;

export const UPLOAD_QUESTIONNAIRE_VIDEO_BACKGROUND_STATUS = gql`
  query UploadQuestionnaireVideoBackgroundStatus {
    data {
      statusUpload
      stausType
      mediaTYpe
      questName
      fileName
      uploadProgress
      progressTxt
      internetType
      uploadMode
    }
  }
`;

export const IMAGE_UPLOAD_BACKGROUND_STATUS = gql`
  query imageUploadBackgroundStatus {
    data {
      statusUpload
      stausType
      mediaTYpe
      obsImgName
      fileName
      uploadProgress
      progressTxt
      internetType
      uploadMode
    }
  }
`;

export const VIDEO_UPLOAD_BACKGROUND_STATUS = gql`
  query videoUploadBackgroundStatus {
    data {
      statusUpload
      stausType
      mediaTYpe
      obsVidName
      fileName
      uploadProgress
      progressTxt
      internetType
      uploadMode
    }
  }
`;

export const UPDATE_DASHBOARD_DATA = gql`
  query UpdateDashboardData {
    data {
      isRefresh
    }
  }
`;


export const UPLOAD_CAPTURE_BFI_BACKGROUND = gql`
  query UploadCaptureBFIBackground {
    data {
      bfiData
    }
  }
`;

export const UPLOAD_CAPTURE_BFI_BACKGROUND_STATUS = gql`
  query UploadCaptureBFIBackgroundStatus {
    data {
      statusUpload
      stausType
      mediaTYpe
      questName
      fileName
      uploadProgress
      progressTxt
      internetType
      uploadMode
    }
  }
`;

