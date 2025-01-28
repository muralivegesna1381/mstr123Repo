import analytics from '@react-native-firebase/analytics';
import * as Constant from "../../utils/constants/constant";
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";

let isAnalyticsEnabled = true;

/////////////////////////// Screens //////////////////////////
export const screen_appInitial = 'App_Initial_Page';
export const screen_appInitial_tutorial = 'App_Initial_Tutorial_Page';
export const screen_login = 'Login_Page';
export const screen_forgrotPassword = 'FPassword_Page';
export const screen_otp = 'OTP_Page';
export const screen_pswd = 'Password_Page';
export const screen_change_password = 'Change_Password_Page';
export const screen_change_name = 'Change_Password_Page';
export const screen_change_secondary_email = 'Change_Password_Page';
export const screen_change_phone = 'Change_Password_Page';
export const screen_dashboard = 'Dboard_Page';
export const screen_observations = 'Obs_List_Page';
export const screen_quick_video = 'Obs_Quick_Video_Page';
export const screen_view_observations = 'View_Obs_Page';
export const screen_add_observations_date = 'Add_Obs_Date_Page';
export const screen_add_observations_pets = 'Add_Obs_Pets_Selection_Page';
export const screen_add_observations_text_beh = 'Add_Obs_Text_Behavior_Page';
export const screen_add_observations_media = 'Add_Obs_Media_Page';
export const screen_add_observations_review = 'Add_Obs_Review_Page';
export const screen_menu = 'Menu_Page';
export const screen_questionnaire_study = 'Quest_Study_Page';
export const screen_questionnaire_questions = 'Quest_Questions_Page';
export const screen_account_main = 'Account_Main_Page';
export const screen_timer_main = 'Timer_Main_Page';
export const screen_timer_activity = 'Timer_Activity_Page';
export const screen_timer_pets = 'Timer_Pets_Page';
export const screen_timer_time_duration = 'Timer_Time_Duration_Page';
export const screen_timer_logs = 'Timer_Logs_Page';
export const screen_timer_widget = 'Timer_Widet_Page';
export const screen_campaign = 'Campaign_Page';
export const screen_pet_edit = 'Pet_Edit_Page';
export const screen_SOB_petName = 'SOB_Pet_Name_Page';
export const screen_SOB_petGender = 'SOB_Pet_Gender_Page';
export const screen_SOB_petNeutered = 'SOB_Pet_Neutered_Page';
export const screen_SOB_petBreed = 'SOB_Pet_Breed_Page';
export const screen_SOB_petAge = 'SOB_Pet_Age_Page';
export const screen_SOB_petWeight = 'SOB_Pet_Weight_Page';
export const screen_SOB_petFeeding = 'SOB_Pet_Feeding_Pref_Page';
export const screen_SOB_petType = 'SOB_Pet_Type_Page';
export const screen_SOB_sensorType = 'SOB_Sensor_Type_Page';
export const screen_SOB_deviceNumber = 'SOB_Device_Number_Page';
export const screen_SOB_Review = 'SOB_Device_Review_Page';
export const screen_support = 'Support_Page';
export const screen_learning_center = 'Learning_Center_Page';
export const screen_app_orientation = 'App_Orientation_Page';
export const screen_chatbot = 'Chatbot_Page';
export const screen_eating_enthusiasm = 'Eating_Enthusiasm_Page';
export const screen_eating_enthusiasm_date = 'Eating_Enthusiasm_Date_Page';
export const screen_eating_enthusiasm_time = 'Eating_Enthusiasm_Time_Page';
export const screen_image_based_score = 'Img_based_scoring_Page';
export const screen_image_based_score_measurements = 'Img_based_scoring_measure_Page';
export const screen_image_based_score_image_upload = 'Img_based_scoring_Img_Upload_Page';
export const screen_Senosor_Initial = 'Sensor_Initial_Page';
export const screen_Sensor_charge_confirm = 'Sensor_Charge_Confirm_Page';
export const screen_sensor_select_screen = 'Sensor_Select_Action_Page';
export const screen_find_sensor = 'Find_Sensor_Page';
export const screen_connect_sensor = 'Connect_Sensor_Page';
export const screen_sensor_nearby_wifi = 'Sensor_NearBy_WIFI_Page';
export const screen_sensor_add_manually = 'Sensor_Add_Maually_Page';
export const screen_sensor_pn_noti_initial = 'Sensor_Push_Noti_Instruct_Page';
export const screen_sensor_pn_noti = 'Sensor_Push_Noti_Permission_Page';
export const screen_sensor_command_component = 'Sensor_Cmd_Settings_Page';
export const screen_sensor_firmware = 'Sensor_Firmware_Page';
export const screen_sensor_connect_common = 'Sensor_Connect_Common_Page';
export const screen_sensor_HPN1_WiFi = 'Sensor_HPN1_Config_WiFi_Lst_Page';
export const screen_sensor_write_details = 'Sensor_Wrte_Dtls_Page';
export const screen_multipleDevices = 'Multiple_Devices_Page';
export const screen_rewards = 'Reward_Points_Page';
export const screen_leaderBoard = 'LeaderBoard_Page';
export const screen_pet_history_weight = 'Pet_Weight_History_Page';
export const screen_pet_weight_enter = 'Enter_Pet_Weight_New_Page';
export const screen_auto_questionnaire_questions = 'Automated_checkin_Quest_Page';
export const screen_feedback = 'Feedback_Page';
export const screen_send_feedback = 'Send_Feedback_Page';
export const screen_view_feedback = 'View_Feedback_Page';
export const screen_privacy = 'View_Privacy_Page';
export const screen_settings = 'View_Settings_Page';
export const screen_faqs = 'View_Faqs_Page';
export const screen_user_guides = 'View_User_Guides_Page';
export const screen_tutorial_videos_guides = 'View_Tutorial_Videos_Page';
export const screen_register_account = 'Register_Account_Page';
export const screen_register_parent_profile_account = 'Register_Parent_Profile_Page';
export const screen_register_parent_address = 'Register_Parent_Address_Page';
export const screen_beacons_locations = 'Beacons_Locations_Page';
export const screen_beacons_list = 'Beacons_List_Page';
export const screen_connect_beacons = 'Connect_Beacons_Page';
export const screen_beacons_instructions = 'Beacons_Instructions_Page';
export const screen_beacons_range_screen = 'Beacons_Range_Config_Page';
export const screen_pdfViewer_screen = 'PDF_Viewer_Page';
export const screen_edit_parent_address = 'Edit_Parent_Address_Page';
export const screen_petParent_address = 'PetParent_Address_Page';
export const screen_pet_address = 'Pet_Address_Page';
export const screen_SOB_petLocation_selection_screen = 'SOB_Pet_Location_Select_Page';
export const screen_petLocation_selection_screen = 'Pet_Address_Edit_Confirm_Page';
export const screen_petAddress_EditComponent_screen = 'Pet_Address_Edit_Page';
export const screen_add_observations_Category = 'Obs_Category_Page';
export const screen_PP_Food_Units = 'PP_Food_Units_Accounts_Page';
export const screen_behavior_Visualization = 'Behavior_Visualization_Page';
export const screen_D_Tutorial_Units = 'Device_Tutorial_Page';
export const screen_Goal_Inst = 'Goal_Instructions_Page';
export const screen_Goal_Set = 'Goal_Set_Page';
export const screen_All_Devices_Set = 'All_Devices_Page';
export const screen_New_Replace_Sensor_Req = 'New_Replace_Sensor_Req_Page';
export const screen_Replace_Sensor = 'Replace_Sensor_Page';
export const screen_Replace_Sync_Sensor = 'Replace_Sync_Sensor_Page';
export const screen_Food_Pet_Sel = 'Food_Pet_Selection_Page';
export const screen_Food_Intake = 'Food_Intake_Page';
export const screen_Food_Intake_List_Sel = 'Food_Intake_List_Page';
export const screen_capture_bfi = 'capture_bfi_Page';
export const screen_bfi_pet_information = 'bfi_pet_information_Page';
export const screen_bfi_pet_list = 'bfi_pet_list_Page';
export const screen_bfi_instrutions = 'bfi_instructions_Page';
export const screen_bfi_review = 'bfi_review_Page';
export const screen_submitted_scores = 'bfi_submitted_score_Page';
export const screen_bfi_scoring_Instructions = 'bfi_scoring_instructions_Page';
export const screen_bfi_pet_list_scoring = 'bfi_pet_list_scoring_Page';
export const screen_bfi_submitted_images = 'bfi_submitted_images_Page';

/////////////////////////// Events //////////////////////////

/////////////////////////// Initial Page //////////////////////////
export const event_initial_internet_check = 'IPage_InternetCheck';
export const event_initial_background_upload = 'IPage_ObsUpload_Check';
export const event_initial_quest_background_upload = 'IPage_QuestUpload_Check';
export const event_initial_user_logged_status = 'IPage_Login_Status';
export const event_initial_login_success = 'IPage_Login_Success';
export const event_initial_login_fail = 'IPage_Login_Fail';
export const event_initial_Pets_success = 'IPage_Pets_Success';
export const event_initial_Pets_fail = 'IPage_Pets_Fail';
export const event_initial_modular_success = 'IPage_Modular_Success';
export const event_initial_default_pet = 'IPage_Default_Pet';
export const event_initial_user_status = 'IPage_User_Status';
export const event_initial_user_details_success = 'IPage_User_Details_Success';
export const event_initial_user_details_fail = 'IPage_User_Details_Fail';

export const event_next_success = 'Tutorial_Skip_Btn_Trigr';

/////////////////////////// Login Page //////////////////////////
export const event_login = 'Login_Action_Trigr';
export const event_login_fail = 'Login_Fail';
export const event_login_success = 'Login_Success';
export const event_login_getPets_success = 'Login_GetPets_Success';
export const event_login_getPets_fail = 'Login_GetPets_Fail';
export const event_login_getModularity_success = 'Login_GetModularity_Success';
export const event_login_getModularity_fail = 'Login_GetPets_Fail';
export const event_login_user_details_success = 'Login_User_Details_API_Success';
export const event_login_user_details_fail = 'Login_User_Details_API_Fail';
export const event_login_forgotPswd = 'Login_FPassword_Trigr';
export const event_login_registration = 'Login_Register_Trigr';
export const event_login_Authentication = 'Login_Auth_Type_Trigr';

/////////////////////////// Forgot Password Page //////////////////////////
export const event_forgot_password = 'FPassword_Action_Trigr';
export const event_forgot_password_api_success = 'FPassword_Api_Success';
export const event_forgot_password_api_fail = 'FPassword_Api_Fail';

/////////////////////////// OTP Page //////////////////////////
export const event_OTP = 'OTP_Action_Trigger';
export const event_otp_api_success = 'OTP_Api_Success';
export const event_OTP_api_fail = 'OTP_Api_Fail';

/////////////////////////// Password Page //////////////////////////
export const event_password = 'Password_Action_Trigr';
export const event_password_api_success = 'Password_Api_Success';
export const event_password_api_fail = 'Password_Api_Fail';

/////////////////////////// Account Main Page //////////////////////////
export const event_account_edit_action = 'Account_Edit_Trigr';
export const event_account_logout = 'Account_Logout_Trigr';
export const event_account_main_api = 'Account_Main_Api_Trigr';
export const event_account_main_api_success = 'Account_Main_Api_Success';
export const event_account_main_api_fail = 'Account_Main_Api_Fail';

/////////////////////////// Change Password Page //////////////////////////
export const event_change_password = 'Change_Password_Trigr';
export const event_change_password_api_success = 'Change_Password_Api_Success';
export const event_change_password_api_fail = 'Change_Password_Api_Fail';

/////////////////////////// Change Name Page //////////////////////////
export const event_change_name = 'Change_Name_Trigr';
export const event_change_name_api_success = 'Change_Name_Api_Success';
export const event_change_name_api_fail = 'Change_Name_Api_Fail';

/////////////////////////// Change Phone Page //////////////////////////
export const event_change_phone = 'Change_Phone_Trigr';
export const event_change_phone_api_success = 'Change_Phone_Api_Success';
export const event_change_phone_api_fail = 'Change_Phone_Api_Fail';

/////////////////////////// Accounts Food Units Page //////////////////////////
export const event_get_foodUnits_api_fail = 'Get_Food_Units_Api_Fail';
export const event_update_foodUnits_api_fail = 'Update_Food_Units_Api_Fail';

/////////////////////////// Dashboard Page //////////////////////////
export const event_dashboard_timer_widget = 'Dboard_Timer_Widget_Trigr';
export const event_dashboard_Android_bk = 'Dboard_Android_Back_Btn_Trigr';
export const event_dashboard_Timer_Quick = 'Dboard_Timer_Quick_Btn_Trigr';
export const event_dashboard_ChatBot = 'Dboard_Chatbot_Btn_Trigr';
export const event_dashboard_Menu = 'Dboard_Menu_Btn_Trigr';
export const event_dashboard_Quick_Video = 'Dboard_Quick_Video_Btn_Trigr';
export const event_dashboard_Pet_Edit = 'Dboard_Pet_Edit_Btn_Trigr';
export const event_dashboard_Support = 'Dboard_Support_Btn_Trigr';
export const event_dashboard_getPets_success = 'Dboard_Getpets_Success_Trigr';
export const event_dashboard_getPets_fail = 'Dboard_Getpets_Fail_Trigr';
export const event_dashboard_getModularity_success = 'Dboard_Modularity_Success_Trigr';
export const event_dashboard_getModularity_fail = 'Dboard_Modularity_Fail_Trigr';
export const event_dashboard_getQuestionnaire_success = 'Dboard_Get_Quest_Success_Trigr';
export const event_dashboard_getQuestionnaire_fail = 'Dboard_Get_Quest_Fail_Trigr';
export const event_dashboard_getCampaign_success = 'Dboard_Get_Campaign_Success_Trigr';
export const event_dashboard_getCampaign_fail = 'Dboard_Get_Campaign_Fail_Trigr';
export const event_dashboard_getLeaderboard_success = 'Dboard_Get_Lboard_Success_Trigr';
export const event_dashboard_getLeaderboard_fail = 'Dboard_Get_Lboard_Fail_Trigr';
export const event_dashboard_petSwipe = 'Dboard_Pet_Swipe_Trigr';
export const event_dashboard_sensor_setup = 'Dboard_Sensor_Trigr';
export const event_dashboard_onBoaring = 'Dboard_Onboard_Pet_Trigr';
export const event_dashboard_Questionnaire = 'Dboard_Questionnaire_Trigr';
export const event_dashboard_editpet = 'Dboard_Edit_Pet_Trig';
export const event_dashboard_devices_selection = 'Dboard_Devices_Btn_Trigr';
export const event_dashboard_firmwareUpdate = 'Dboard_Firmware_Update_Trigr';
export const event_dashboard_enthusiasm = 'Dboard_Enthusiasm_Trigr';
export const event_dashboard_imageScoring = 'Dboard_IScoring_Trigr';
export const event_dashboard_defaultPet_modularity = 'Dboard_DefaultPet_Modularity';
export const event_dashboard_getMeterials_Api = 'Dboard_Get_Meterials_Api';
export const event_dashboard_getMeterials_success = 'Dboard_Get_Meterials_Api_Success';
export const event_dashboard_getMeterials_fail = 'Dboard_Get_Meterials_Api_Fail';
export const event_dashboard_defaultPet_Status = 'Dboard_Get_default_pet_status';
export const event_dashboard_CaptureImages_selection = 'Dboard_Cap_Images_Btn_Trigr';
export const event_dashboard_Features_selection = 'Dboard_Features_Btn_Trigr';
export const event_dashboard_Food_Rec = 'Dboard_Food_Rec_Btn_Trigr';
export const event_dashboard_Goal_Set = 'Dboard_Goal_Set_Btn_Trigr';
export const event_dashboard_Goal_Vis = 'Dboard_Goal_Visualization_Btn_Trigr';
export const event_dBoard_getVisual_fail = 'Dboard_GetVisualization_Api_Fail';
export const event_dBoard_getPet_Wgt_History_fail = 'Dboard_Get_Pet_Wgt_Hist_Api_Fail';
export const event_dBoard_Get_Permi_Pets_fail = 'Dboard_Get_Pet_Prmsions_Api_Fail';
export const event_dBoard_Food_Intake_fail = 'Dboard_Get_Food_Intake_Api_Fail';

/////////////////////////// Timer Main Page //////////////////////////
export const event_timer_go_action = 'Timer_Main_Go_Btn_Trig';
export const event_timer_logs_action = 'Timer_Main_Logs_Btn_Trig';
export const event_timer_api_success = 'Timer_Api_Success';
export const event_timer_api_fail = 'Timer_Api_Fail';
export const event_timer_api = 'Timer_Api';
export const event_timer_activity = 'Timer_Activity_Trig';
export const event_timer_selected_pet = 'Timer_selected_pet_Trig';
export const event_timer_selected_time = 'Timer_selected_Time_Trig';
export const event_timer_minimize_time = 'Timer_Minimize_Btn_Trig';
export const event_timer_widget_pause_resume_action = 'Timer_Pause_Resume_Btn_Trig';
export const event_timer_widget_logs_action = 'Timer_Logs_Btn_Trig';
export const event_timer_widget_stop_action = 'Timer_Stop_Btn_Trig';
export const event_timer_widget_stop_confirm_action = 'Timer_Stp_Confirm_Btn_Trig';
export const event_timer_widget_api_success = 'Timer_Widget_Api_Success';
export const event_timer_Widget_api_fail = 'Timer_Widget_Api_Fail';
export const event_timer_Widget_api = 'Timer_Widget_Api';

/////////////////////////// Pet Edit Page //////////////////////////
export const event_pet_img_choose_action = 'Choose_Pet_Img_Trigger';
export const event_pet_img_selection_done = 'Selction_Pet_Image_Done';
export const event_pet_img_selection_cancel = 'Selction_Pet_Image_Cancel';
export const event_pet_img_api_success = 'Pet_Img_Api_Success';
export const event_pet_img_api_fail = 'Pet_Img_Api_Fail';

/////////////////////////// Observations List Page //////////////////////////
export const event_observations_new_btn = 'Obs_Add_Action_Trigger';
export const event_observations_view_btn = 'Obs_View_Action_Trigger';
export const event_observation_list_api = 'Obs_List_Api';
export const event_observation_list_api_success = 'Obs_List_Api_Success';
export const event_observation_list_api_fail = 'Obs_List_Api_Fail';
export const event_observation_list_Swipe_Action = 'Obs_List_Swipe_Trig';
export const event_behaviors_api = 'Get_Behaviors_Api';
export const event_behaviors_api_success = 'Get_Behaviors_Api_Success';
export const event_behaviors_api_fail = 'Get_Behaviors_Api_Fail';
export const event_delete_observation_api = 'Delete_Obs_Api';
export const event_delete_observation_api_success = 'Delete_Obs_Api_Success';
export const event_delete_observation_api_fail = 'Delete_Obs_Api_Fail';
export const event_edit_observation_Action = 'Edit_Obs_Trig';
export const event_observation_quick_video = 'Obs_Quick_Vid_Pet';
export const event_observation_quick_video_action = 'Obs_Quick_Vid_Trig';
export const event_observation_quick_video_media_action = 'Obs_Quick_Vid_Media_Trig';
export const event_observation_quick_video_delete_media_action = 'Obs_Quick_Vid_Delete_Media_Trig';

/////////////////////////// Add Observations Flow //////////////////////////
export const event_add_observations_pet_selection = 'Add_Obs_Pet_select_Trigger';
export const event_add_observations_txtBeh_api = 'Add_Obs_Txt_Behavior_Api';
export const event_add_observations_txtBeh_api_success = 'Add_Obs_Txt_Behavior_Api_Success';
export const event_add_observations_txtBeh_api_fail = 'Add_Obs_Txt_Behavior_Api_Fail';
export const event_add_observations_txtBeh_submit = 'Add_Obs_Txt_Behavior_Submit_Trig';
export const event_add_observations_date_submit = 'Add_Obs_Date_Submit_Trig';
export const event_add_observations_media_submit = 'Add_Obs_Media_Submit_Trig';
export const event_add_observations_review_submit = 'Add_Obs_Review_Submit_Trig';
export const event_add_observations_review_submit_nomedia = 'Add_Obs_Rev_Submit_NoMedia_Trig';
export const event_add_observations_review_submit_media = 'Add_Obs_Rev_Submit_Media_Trig';
export const event_add_observations_review_submit_multimedia = 'Add_Obs_Rev_Submit_MMedia_Trig';
export const event_add_observations_api_success = 'Add_Obs_Api_Success';
export const event_add_observations_api_fail = 'Add_Obs_Api_Fail';

/////////////////////////// SOB Flow //////////////////////////
export const event_SOB_petName_submit_btn = 'SOB_Pet_Name_Submit_Trig';
export const event_SOB_petGender_submit_btn = 'SOB_Pet_Gender_Submit_Trig';
export const event_SOB_petNeutered_submit_btn = 'SOB_Pet_Neuter_Submit_Trig';
export const event_SOB_petBreed_submit_btn = 'SOB_Pet_Breed_Submit_Trig';
export const event_SOB_petBreed_api = 'SOB_Pet_Breed_Api_Trig';
export const event_SOB_petBreed_api_success = 'SOB_Pet_Breed_Api_Success';
export const event_SOB_petBreed_api_fail = 'SOB_Pet_Breed_Api_Fail';
export const event_SOB_petAge_submit_button = 'SOB_Pet_Age_Submit_Trig';
export const event_SOB_petWeight_submit_button = 'SOB_Pet_Weight_Submit_Trig';
export const event_SOB_petFeeding_api_success = 'SOB_Pet_Feeding_Api_Success';
export const event_SOB_petFeeding_api_fail = 'SOB_Pet_Feeding_Api_Fail';
export const event_SOB_petFeeding_submit = 'SOB_Pet_Feeding_Submit_Trig';
export const event_SOB_petType_submit = 'SOB_Pet_Type_Submit_Trig';
export const event_SOB_sensorType_submit = 'SOB_Sensor_Type_Submit_Trig';
export const event_SOB_device_number_submit = 'SOB_DN_Submit_Trig';
export const event_SOB_device_number_api = 'SOB_DN_Api';
export const event_SOB_device_number_api_fail = 'SOB_DN_Api_fail';
export const event_SOB_device_number_api_success = 'SOB_DN_Api_Success';
export const event_SOB_device_number_Sequence_validation = 'SOB_DN_Sequence_Validate';
export const event_SOB_device_numbe_missing_assign = 'SOB_DN_Missing_Assign';
export const event_SOB_device_numbe_missing_assign_api_success = 'SOB_DN_Missing_Assign_Api_Success';
export const event_SOB_device_numbe_missing_assign_api_fail = 'SOB_DN_Missing_Assign_Api_Fail';
export const event_SOB_review_api_fail = 'SOB_Review_Api_Fail';
export const event_SOB_review_api_Success = 'SOB_Review_Api_Success';
export const event_SOB_review_api = 'SOB_Review_Api';
export const event_SOB_review_userData_api_fail = 'SOB_Review_UsrData_Api_Fail';
export const event_SOB_review_userData_api_Success = 'SOB_Review_UsrData_Api_Success';
export const event_SOB_petName_PPAddress_API = 'SOB_Pet_Name_PPAddress_API';
export const event_SOB_review_Validate_Pet_fail = 'SOB_Review_Valdate_Pet_Api';
export const event_SOB_review_Feeding_Pref_fail = 'SOB_Review_Feed_pref_Api';
export const event_SOB_review_Species_API = 'SOB_Review_Species_Api';
export const event_SOB_Without_Sensor_submit = 'SOB_Sensor_Without_Sensor_Trig';

/////////////////////////// Sensor Flow //////////////////////////
export const event_Sensor_type = 'Sensor_type';
export const event_sensor_ble_status = 'Sensor_Ble_Status';
export const event_sensor_setupStatus = 'Sensor_Setup_Status';
export const event_sensor_action_Type = 'Sensor_Action_Type_Trigger';
export const event_sensor_connection_status = 'Sensor_Connection_Status';
export const event_sensor_connection_mail = 'Sensor_Connec_Status_Report_Mail';
export const event_sensor_connection = 'Sensor_Connection';
export const event_sensor_wifi_command = 'Sensor_Nby_WiFi_Initiate_Cmd';
export const event_sensor_hpn1_config_no_wifi = 'Sensor_HPN1_Config_WiFi_Cnt';
export const event_sensor_hpn1_wifi_max_limit = 'Sensor_HPN1_Config_WiFi_Max_Lmt';
export const event_sensor_HPN1_readWIFISystemStatus_fail = "Sensor_HPN1_ReadWIFISysStatus_fail";
export const event_sensor_nearby_wifi_count = 'Sensor_Nby_WiFi_Cnt';
export const event_sensor_nearby_wifi_count_fail = 'Sensor_Nby_WiFi_Cnt_fail';
export const event_sensor_nearby_wifi_list_count_final = 'Sensor_Nby_WiFi_Lst_Cnt_Final';
export const event_sensor_nearby_wifi_list_fetch_completed = 'Sensor_Nby_WiFi_Fetch_Complete';
export const event_sensor_nearby_wifi_list_fetch_fail = 'Sensor_Nby_WiFi_Nms_Fetch_fail';
export const event_sensor_stop_scanning = 'Sensor_Stop_Scan_Btn_Trig';
export const event_sensor_refresh_scanning = 'Sensor_Refresh_Scan_Btn_Trig';
export const event_sensor_HPN1_max_limit_btn = 'Sensor_HPN1_Max_Lmt_Btn_Trig';
export const event_sensor_configure_btn_action = 'Sensor_Config_Submit_Trig';
export const event_sensor_select_max_ssid_length = 'Sensor_SSID_Max_Length_Submit_Trig';
export const event_sensor_HPN1_duplicate_SSID_btn_action = 'Sensor_HPN1_Duplicate_SSID_Btn_Trig';
export const event_sensor_add_manual_btn_action = 'Sensor_Add_Manual_Btn_Trigger';
export const event_sensor_submit_btn_action = 'Sensor_Add_Manual_Submit_Btn_Trigger';
export const event_sensor_pnq_intst_next_btn_action = 'Sensor_PNQ_Intstruct_Next_Btn_Trig';
export const event_sensor_pnq_next_btn_action = 'Sensor_PNQ_Selt_Next_Btn_Trig';
export const event_sensor_PNP_api_fail = 'Sensor_PNP_Api_Fail';
export const event_sensor_PNP_api_Success = 'Sensor_PNP_Api_Success';
export const event_sensor_PNP_api = 'Sensor_PNP_Api';
export const event_command_btn_action = 'Sensor_Command_Button_Trig';
export const event_command_success = 'Sensor_Command_Success';
export const event_command_fail = 'Sensor_Command_Fail';
export const event_firmware_details = 'Sensor_Firmware_Details';
export const event_firmware_battery = 'Sensor_Firmware_Battery';
export const event_firmware_update_action_Trigger = 'Sensor_Firmware_Update_Btn_Trig';
export const event_firmware_update_success = 'Sensor_Firmware_Update_Success';
export const event_firmware_update_fail = 'Sensor_Firmware_Update_Fail';
export const event_sensor_HPN1_configured_WiFi_list = 'Sensor_HPN1_Config_WiFi_List';
export const event_sensor_HPN1_configured_WiFi_delete_action = 'Sensor_HPN1_Config_WiFi_Del_Trigr';
export const event_sensor_HPN1_configured_WiFi_delete_index = 'Sensor_HPN1_Config_WiFi_Del_Index';
export const event_sensor_HPN1_configured_WiFi_delete_index_confirm = 'Sensor_HPN1_Cong_WiFi_Del_Index_Cnfrm';
export const event_sensor_HPN1_initiate_command_write_details = 'Sensor_HPN1_Initiate_Cmmd_Write_Dtls';
export const event_sensor_HPN1_SSID_write_status = 'Sensor_HPN1_SSID_Write_Status';
export const event_sensor_HPN1_SSID_write = 'Sensor_HPN1_SSID_Write';
export const event_sensor_HPN1_SSID_write_fail = "Sensor_HPN1_SSID_Write_Fail";
export const event_sensor_HPN1_pswd_write = 'Sensor_HPN1_Pswd_Write';
export const event_sensor_HPN1_pswd_write_fail = 'Sensor_HPN1_Pswd_Write_Fail';
export const event_sensor_HPN1_security_write = 'Sensor_HPN1_Security_Write';
export const event_sensor_HPN1_security_write_fail = 'Sensor_HPN1_Security_Write_Fail';
export const event_sensor_HPN1_write_details_confirm = 'sensor_HPN1_Write_Detls_Cnfrm';
export const event_sensor_HPN1_write_details_confirm_fail = 'Sensor_HPN1_write_Dtls_Cnfrm_Fail';
export const event_sensor_write_details_navi = 'Sensor_Wrte_Dtls_Navigation';
export const event_sensor_write_details_try_action = 'Sensor_Wrte_Dtls_Try_btn_Trigr';
export const event_sensor_aglCmas_write_sequence = 'Sensor_AglCmas_Write_Sequence';
export const event_sensor_aglCmas_write_sequence_fail = 'Sensor_AglCmas_Write_Sequence_Fail';
export const event_sensor_aglCmas_eventLog = 'Sensor_AglCmas_EventLog';
export const event_sensor_write_details_api = 'Sensor_Wrte_Dtls_Api';
export const event_sensor_write_details_api_success = 'Sensor_Wrte_Dtls_Api_Success';
export const event_sensor_write_details_api_fail = 'Sensor_Wrte_Dtls_Api_Fail';
export const event_sensor_write_details_getPets_api = 'Sensor_Write_Dtls_GPets_Api';
export const event_sensor_write_details_getPets_api_success = 'Sensor_Wrte_Dtls_GPets_Api_Success';
export const event_sensor_write_details_getPets_api_fail = 'Sensor_Wrte_Dtls_GPets_Api_Fail';
export const event_sensor_Replace_Update_details_api_fail = 'Sensor_Update_Replace_Dtls_Api_Fail';

//Support page
export const event_support_menu_trigger = 'Support_Page_Menu_Trigr';

//Learning center page
export const event_Learning_center_page_api = 'L_Center_Page_Api';
export const event_Learning_center_page_api_success = 'L_Center_Page_Api_Success';
export const event_Learning_center_page_api_failure = 'L_Center_Page_Api_Fail';

//App orientation Page
export const event_app_orientation_start_trigger = 'App_Orient_Begin_Trigr';
export const event_app_orientation_finish = 'App_Orient_Finish';
export const event_app_orientation_interrupted = 'App_Orient_Interrupted';

//Chatbot page
export const event_chat_request_trigger = 'Cbot_Session_Begin_Trigr';
export const event_chat_message_sent_trigger = 'Cbot_Message_Sent_Trigr';
export const event_chat_minimize_trigger = 'Cbot_minimize_Trigr';
export const event_chat_session_end_trigger = 'Cbot_Session_End_Trigr';

//Image based scoring
export const event_image_scoring_button_trigger = 'Image_Scoring_Btn_Select_Trigr';
export const event_image_scoring_pet_image_scoring_scales_api = 'IScoring_PetIScoring_Score_Api';
export const event_image_scoring_pet_image_scoring_scales_api_success = 'IScoring_PetIScoring__Api_Success';
export const event_image_scoring_pet_image_scoring_scales_api_failure = 'IScoring_PetScoring_Score_Api_Fail';
export const event_image_scoring_measurement_button_trigger = 'I_Scoring_Measure_Button_Trigr';
export const event_image_scoring_imagepicker_trigger = 'I_Scoring_IPicker_Trigger';
export const event_image_scoring_imagepicker_selected_trigger = 'I_Scoring_IPicker_Select_Trigr';
export const event_image_scoring_imagepicker_cancelled_trigger = 'I_Scoring_IPicker_Cancelled_Trigr';
export const event_image_scoring_image_upload_api = 'I_Scoring_ImageUpload_Api';
export const event_image_scoring_image_upload_api_success = 'I_Scoring_ImageUpload_Api_Success';
export const event_image_scoring_image_upload_api_fail = 'I_Scoring_ImageUpload_Api_Fail';
export const event_image_scoring_page_final_api = 'IScoring_Page_Api';
export const event_image_scoring_page_api_final_success = 'IScoring_Page_Final_Api_Success';
export const event_image_scoring_page_api_final_failure = 'IScoring_Page_Final_Api_Fail';

///////////// Point Tracking Module /////////////////
export const event_campaign_button_trigger = 'Campaign_Btn_Select_Trigr';
export const event_getTotal_points_button_trigger = 'Rewards_GetTotal_Pnts_Btn_Trigr';
export const event_getRewardsDetails_api_success = 'Get_RewardsDetails_Api_Success';
export const event_getRewardsDetails_api_fail = 'Get_RewardsDetails_Api_Fail';
export const event_getTotalListofPoints_api_success = 'Get_TotalListPoints_Api_Success';
export const event_getTotalListofPoints_api_fail = 'Get_TotalListPoints_Api_Fail';
export const event_getRewardsRedeemedDetailsService_api_success = 'Get_RRedeemedDetails_Api_Success';
export const event_getRewardsRedeemedDetailsService_api_fail = 'Get_RRedeemedDtlsService_Api_Fail';
export const event_getRewardsDetails_api = 'Get_RewardsDetails_Api';
export const event_getTotalListofPoints_api = 'Get_TotalListofPoints_Api';
export const event_getRewardsRedeemedDetailsService_api = 'Get_RRedeemedDtlsService_Api';
export const event_campaign_Action_trigger = 'Cmpgn_Btn_Select_Trigger';
export const event_reward_points_Action_trigger = 'R_Points_Btn_Select_Trigr';
export const event_leaderBoard_api_success = 'LBoard_Api_Success';
export const event_leaderBoard_api_fail = 'LBoard_Api_Fail';

///////////// Pet Weight /////////////////
export const event_pet_weight_history_button_trigger = 'Pet_Wght_Btn_Select_Trigr';
export const event_pet_weight_history_api = 'Get_Pet_Wght_Hstry_Api';
export const event_pet_weight_history_api_success = 'Get_Pet_Wght_Hstry_Api_Success';
export const event_pet_weight_history_api_fail = 'Get_Pet_Wght_Hstry_Api_Fail';
export const event_pet_weight_new_api = 'Get_Pet_Weight_New_Api';
export const event_pet_weight_new_api_success = 'Get_Pet_Weight_New_Api_Success';
export const event_pet_weight_new_api_fail = 'Get_Pet_Weight_New_Api_Fail';

///////////// Questionnaire Study //////////////
export const event_questionnaire_study_pet_swipe_button_trigger = 'Qst_Stdy_Pet_Swipe_Btn_Trigr';
export const event_questionnaire_study_question_button_trigger = 'Qst_Stdy_Question_Btn_Trigr';
export const event_questionnaire_study_api = 'Quest_Study_Api';
export const event_questionnaire_study_api_success = 'Quest_Study_Api_Success';
export const event_questionnaire_study_api_fail = 'Quest_Study_Api_Fail';
export const event_questionnaire_questions_submit_api = 'Quest_Questions_Sbt_Api';
export const event_questionnaire_questions_submit_api_success = 'Qst_Questions_Sbt_Api_Success';
export const event_questionnaire_questions_submit_api_fail = 'Qst_Questions_Sbt_Api_Fail';

///////////// Questionnaire Automated checkin //////////////
export const event_automated_checkin_questionnaire_api = 'Auto_Checkin_Quest_Api';
export const event_automated_checkin_questionnaire_api_success = 'A_Checkin_Quest_Api_Success';
export const event_automated_checkin_questionnaire_api_fail = 'Auto_Checkin_Quest_Api_Fail';

//Eating enthusiasm
export const event_get_pet_eating_enthusiasm_scale_api = 'E_Enthusiasm_Scale_Api';
export const event_get_pet_eating_enthusiasm_scale_api_success = 'E_Enthusiasm_Scale_Api_Success';
export const event_get_pet_eating_enthusiasm_scale_api_failure = 'E_Enthusiasm_Scale_Api_Fail';
export const event_pet_eating_enthusiasm_scale_selection_trigger = 'E_Enthus_Scale_Selected_Trigr';
export const event_get_scale_selection_value = 'E_Enthus_Date_Page_Scale_Value';
export const event_get_pet_feeding_time_api = 'Get_Pet_Feeding_Time_Api';
export const event_get_pet_feeding_time_api_success = 'Get_Pet_Feeding_Time_Success';
export const event_get_pet_feeding_time_api_failure = 'Get_Pet_Feeding_Time_Fail';
export const event_submit_pet_feeding_time_api = 'Submit_Pet_Feeding_Time_Api';
export const event_submit_pet_feeding_time_api_success = 'Submit_Pet_Feeding_Time_Success';
export const event_submit_pet_feeding_time_api_failure = 'Submit_Pet_Feeding_Time_Fail';

//Eating enthusiasm
export const event_add_device_btn_trigger = 'Add_Device_Action_Trigr';
export const event_device_selection_trigger = 'Device_Select_Action_Trigr';

/////////////// Feedback Module ////////////////////
export const event_feedback_details_api = 'Feedback_Details_Api';
export const event_feedback_details_api_success = 'Feedback_Dtls_Api_Success';
export const event_feedback_details_api_failure = 'Feedback_Dtls_Api_Fail';

export const event_send_feedback_details_api = 'Send_Feedback_Api';
export const event_send_feedback_details_api_success = 'Send_Feedback_Api_Success';
export const event_send_feedback_details_api_failure = 'Send_Feedback_Api_Fail';

///////////Registeration/////////////////
export const event_registration_account_action = 'Rgst_Acnt_Button_Trigr';
export const event_registration_account_api = 'Rgst_Acnt_Api';
export const event_registration_account_api_success = 'Rgst_Acnt_Api_Success';
export const event_registration_account_api_fail = 'Rgst_Acnt_Api_Fail';
export const event_registration_otp_api = 'Rgst_Acnt_OTP_Api';
export const event_registration_otp_api_success = 'Rgst_Acnt_OTP_Api_Success';
export const event_registration_otp_api_fail = 'Rgst_Acnt_OTP_Api_Fail';
export const event_registration_account_Profile_action = 'Rgst_Acnt_PP_Profile_Btn_Trigr';
export const event_registration_account_Address_action = 'Rgst_Acnt_PP_Address_Submit_Trigr';
export const event_registration_Address_api_success = 'Rgst_Acnt_PP_Address_Api_Success';
export const event_registration_Address_api_fail = 'Rgst_Acnt_PP_Address_Api_Fail';

/////////////// Beacons ///////////////////
export const event_beacons_locations_next_action = 'Beacons_Locations_Nxt_Btn_Trigr';
export const event_beacons_scan_initiated = 'Find_Nearby_Beacons_Initiated';
export const event_beacons_scan_completed = 'Find_Nearby_Beacons_Complete';
export const event_beacons_ble_status = 'Beacon_Ble_Status';
export const event_beacons_configure_submit = 'Beacon_Config_Submit_Button_Trigr';
export const event_beacons_configure_connection = 'Beacon_Config_Connection_Status';

/////////////////////////// Pet Parent Page //////////////////////////
export const event_change_PPAddress_phone = 'Change_PPAddress_Submit_Action_Trigr';
export const event_change_PPAddress_api_success = 'Change_PPAddress_Api_Success';
export const event_change_PPAddress_api_fail = 'Change_PPAddress_Api_Fail';
export const event_Pet_Parent_Address_Validate = "PParent_Address_vldte_Btn_Trigr";
export const event_Pet_Parent_Address_api_fail = "PParent_Address_vldte_Api_Fail";
export const event_Pet_Address_api_fail = "Pet_Address_validate_Api_Fail";
export const event_Pet_Address_update_api_fail = "Pet_Address_update_Api_Fail";

/////////////////////////// Change Secondary Email Page //////////////////////////
export const event_change_secondaryEmail = 'Change_SEmail_Submit_Action_Trigr';
// export const event_secondaryEmail_api_success = 'Change_SecondaryEmail_Api_Success';
export const event_secondaryEmail_api_fail = 'Change_SEmail_Api_Fail';
export const event_secondaryEmail_remove_btn = 'Chnge_SEmail_Remove_Btn_Action';
export const event_SOB_PLocation_Selection_btn = 'SOB_PLocation_Selec_Btn_Action';
export const event_PLocation_Selection_btn = 'SOB_PetAdrsEditConf_Sel_Btn_Action';

export const event_menu = 'Menu_Button_Trigger';
export const event_back_btn_action = 'Back_Button_Trigger';
export const event_screen = "screen_visit";

/////////////////////////// BFI Guide //////////////////////////
export const event_score_submit_screen_entered = 'score_submit_screen_entered';
export const event_score_submit_btn_clicked = 'score_submit_btn_clicked';
export const event_bfi_score_submit_api = 'bfi_score_submit_api';
export const event_getscore_ids_api = 'getscore_ids_api';
export const screen_submit_bfiScore = 'submit_bfiScore_Page';

export const event_add_pet_click = 'add_pet_click';
export const event_existing_pet_click = 'existing_pet_click';
export const event_existing_pet_clicked = 'existing_pet_clicked';
export const event_capture_bfi_submit_click = 'capture_bfi_Btn_Action';
export const event_capture_bfi_submit_api = 'capture_bfi_imgs_submit_api';
export const event_get_pets_api = 'get_pets_api';
export const event_get_capture_image_pos_api = 'get_capture_image_positions_api';
export const event_submit_capture_bfi = 'submit_capture_bfi';
export const event_image_classification_api = 'image_classification_api';

export const event_get_Support_Met_api_fail = 'Get_Support_Meterials_Api_Fail';
export const event_save_GoalSet_api_fail = 'Save_Goal_Set_Api_Fail';
export const event_save_Food_Inatke_api_fail = 'SaveUpdate_Food_Intake_Api_Fail';
export const event_Get_Food_Inatke_Config_api_fail = 'Get_Food_Intake_Config_Api_Fail';
export const event_Get_Food_Inatke_By_Id_api_fail = 'Get_Food_Intake_By_Id_Api_Fail';
export const event_Get_Food_Inatke_List_api_fail = 'Get_Food_Intake_List_Api_Fail';
export const event_Food_Inatke_Screen = 'Food_Intake_List_Screen';

export const event_instructions_api = 'getPetBfiInstructions_api';
export const event_score_instructions_api = 'getBfiImageScores_api';
export const event_getPetBfiImages_api = 'getPetBfiImages_api';
export const event_getBfiPets_api = 'getBfiPets_api';

/////////// Notification Screen ////////////////
export const screen_add_notification_screen = 'Notification_Screen_Page';

/////////// Media Screen ////////////////
export const screen_media_screen = 'Media_Screen_Page';
export const screen_media_details_screen = 'Media_Details_Screen_Page';

export async function setUserId(userId) {
    if (isAnalyticsEnabled) {
        await analytics().setUserId(userId)
    }
}

export async function setUserProperty(email, clientId) {
    if (isAnalyticsEnabled) {
        await analytics().setUserProperty("email", email);
        await analytics().setUserProperty("clientId", clientId);
    }
}

export async function reportScreen(screen_name) {
    if (isAnalyticsEnabled) {
        await analytics().logScreenView({
            screen_name: screen_name,
            screen_class: screen_name,
        });
    }
}

export async function logEvent(eventName, screenName, description, more_info) {
    if (isAnalyticsEnabled) {
        let email = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN);
        let parms = {
            "screenName": screenName,
            "description": description,
            "more_info": 'Email: ' + email + '\n' + more_info
        }
        await analytics().logEvent(eventName, parms)
    }
}