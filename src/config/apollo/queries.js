// @flow

import gql from "graphql-tag";

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
      questObj
    }
  }
`;

export const UPLOAD_IMAGE_BACKGROUND = gql`
  query UploadImageBackground {
    data {
      imageData
      imgObj
    }
  }
`;

export const UPLOAD_VIDEOS_BACKGROUND = gql`
  query UploadVideosBackground {
    data {
      videoData
      vidObj
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
      data
    }
  }
`;


export const UPLOAD_CAPTURE_BFI_BACKGROUND = gql`
  query UploadCaptureBFIBackground {
    data {
      bfiData
      value
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

export const UPDATE_OBSERVATION_LIST = gql`
  query UpadateObservationList {
    data {
      obsData
    }
  }
`;

export const UPDATE_Quest_LIST = gql`
  query UpdateQuestList {
    data {
      questData
    }
  }
`;