import * as Queries from "./../../config/apollo/queries";
import * as Apolloclient from './../../config/apollo/apolloConfig';
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as Constant from "./../../utils/constants/constant";

export async function authoriseCheck () {
    //Apolloclient.client.writeQuery({ query: Queries.LOG_OUT_APP_ERROR, data: { data: { isLogOutError: 'logOutError', __typename: 'LogOutAppError' } }, });
    await clearData();
}

export async function clearData () {

    Apolloclient.client.writeQuery({ query: Queries.LOG_OUT_APP, data: { data: { isLogOut: 'logOut', __typename: 'LogOutApp' } }, });
    await DataStorageLocal.saveDataToAsync(Constant.IS_MULTIPLE_LOGIN, 'multipleLogin');
    await DataStorageLocal.removeDataFromAsync(Constant.IS_USER_LOGGED_INN);
    //await DataStorageLocal.removeDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    await DataStorageLocal.removeDataFromAsync(Constant.APP_TOKEN);
    await DataStorageLocal.removeDataFromAsync(Constant.CLIENT_ID);
    await DataStorageLocal.removeDataFromAsync(Constant.PET_ID);
    await DataStorageLocal.removeDataFromAsync(Constant.MODULATITY_OBJECT);
    await DataStorageLocal.removeDataFromAsync(Constant.TIMER_PETS_ARRAY);
    await DataStorageLocal.removeDataFromAsync(Constant.TIMER_SELECTED_PET);
    await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT);
    await DataStorageLocal.removeDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
    await DataStorageLocal.removeDataFromAsync(Constant.POINT_TRACKING_PETS_ARRAY);
    await DataStorageLocal.removeDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
   // await DataStorageLocal.removeDataFromAsync(Constant.IS_FIRST_TIME_USER);
    await DataStorageLocal.removeDataFromAsync(Constant.QUESTIONNAIRE_SELECTED_PET);
    await DataStorageLocal.removeDataFromAsync(Constant.OBS_SELECTED_PET);
    // await DataStorageLocal.removeDataFromAsync(Constant.USER_EMAIL_LOGIN);
    // await DataStorageLocal.removeDataFromAsync(Constant.USER_PSD_LOGIN);
    // await DataStorageLocal.removeDataFromAsync(Constant.FCM_TOKEN);
    await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_ARRAY);
    await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_CURRENT);
    await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
    await DataStorageLocal.removeDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
    await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
    await DataStorageLocal.removeDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);

    //////// New ////////
    await DataStorageLocal.removeDataFromAsync(Constant.TOTAL_PETS_ARRAY);
    // await DataStorageLocal.removeDataFromAsync(Constant.USER_PSD_LOGIN);
    // await DataStorageLocal.removeDataFromAsync(Constant.FCM_TOKEN);
    await DataStorageLocal.removeDataFromAsync(Constant.USER_EMAIL_LOGIN_TEMP);
    await DataStorageLocal.removeDataFromAsync(Constant.SAVE_SOB_PETS);
    await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
    // await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
    await DataStorageLocal.removeDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
    await DataStorageLocal.removeDataFromAsync(Constant.TIMER_DATA_FLOW_OBJ);
    await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS);
    await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_MILLISECONDS);
    await DataStorageLocal.removeDataFromAsync(Constant.SENOSR_INDEX_VALUE);
    await DataStorageLocal.removeDataFromAsync(Constant.MULTY_SENSOR_INDEX);

    await DataStorageLocal.removeDataFromAsync(Constant.VIDEO_PATH_OBSERVATION);
    await DataStorageLocal.removeDataFromAsync(Constant.DELETE_IMG);
    await DataStorageLocal.removeDataFromAsync(Constant.DELETE_VIDEO);
    await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_ARRAY);
    await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_CURRENT);
    await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
    await DataStorageLocal.removeDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
    await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
    await DataStorageLocal.removeDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);
    await DataStorageLocal.removeDataFromAsync(Constant.CONFIGURED_WIFI_LIST);
    await DataStorageLocal.removeDataFromAsync(Constant.BEACON_INSTANCE_ID);
    await DataStorageLocal.removeDataFromAsync(Constant.QUEST_VIDEO_UPLOAD_PROCESS_STARTED);
    await DataStorageLocal.removeDataFromAsync(Constant.QUEST_UPLOAD_DATA);
    await DataStorageLocal.removeDataFromAsync(Constant.SELECTED_QUESTIONNAIRE);
    await DataStorageLocal.removeDataFromAsync(Constant.ANSWERED_SECTIONS);

    await DataStorageLocal.removeDataFromAsync(Constant.USER_ROLE_CAPTURE_IMGS);
    await DataStorageLocal.removeDataFromAsync(Constant.IMAGES_UPLOAD_PROCESS_STARTED);
    await DataStorageLocal.removeDataFromAsync(Constant.IMAGE_UPLOAD_DATA);
    await DataStorageLocal.removeDataFromAsync(Constant.QUETIONNAIRE_PERMISSION);
    await DataStorageLocal.removeDataFromAsync(Constant.CONFIG_SENSOR_OBJ);
    await DataStorageLocal.removeDataFromAsync(Constant.MENU_ID);
    await DataStorageLocal.removeDataFromAsync(Constant.BFIINSTRUCTIONSDATA);
    await DataStorageLocal.removeDataFromAsync(Constant.TIMER_DIMENTIONS);
    await DataStorageLocal.removeDataFromAsync(Constant.TIMER_DIMENTIONS_DEVICE);
    await DataStorageLocal.removeDataFromAsync(Constant.FH_SELECTED_PET);
    await DataStorageLocal.removeDataFromAsync(Constant.FH_PETS_ARRAY);
    await DataStorageLocal.removeDataFromAsync(Constant.QUESTIONNAIRE_SELECTED_PET);
}