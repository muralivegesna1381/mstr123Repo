import React from 'react';
import { SafeAreaView, View, } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InitialScreenComponent from '../components/appInitialization/initialScreenComponet';
import InitialTutorialComponent from '../components/initialTutorial/initialTutorialComponent';
import LoginComponent from '../components/loginComponents/loginComponent';
import DashBoardService from "../components/dashBoard/dashBoardService";
import OTPComponent from "../components/otpComponent/otpComponent";
import PswdComponent from "../components/pswdComponent/pswdComponent"
import ForgotPasswordComponent from '../components/forgotPassword/forgotPasswordComponent';
import PetParentProfileComponent from '../components/registration/petParentProfileComponent';
import RegisterAccountComponent from '../components/registration/registerAccountComponent';
import ObservationsListComponent from '../components/observationsJournal/observationsList/observationsListComponent';
import ObservationComponent from '../components/observationsJournal/addObservations/observation/observationComponent';
import ViewObservationService from '../components/observationsJournal/viewObservations/viewObservationService';
import CampaignService from "../components/pointTracking/campaign/campaignService"
import RewardPointsService from '../components/pointTracking/rewardPoints/rewardPointsService';
import AppOrientationComponent from '../components/settings/appOrientation/appOrientationComponent';
import SupportComponent from '../components/settings/support/supportComponent';
import LearningCenterComponent from '../components/settings/learningCenter/learningCenterComponent';
import PrivacyComponent from '../components/settings/privacy/privacyComponent';
import AccountInfoService from '../components/accountInformation/accountInfoService';
import UpdateNameService from '../components/accountInformation/updateNameService';
import UpdatePhoneService from '../components/accountInformation/updatePhoneService'
import updateSecondaryEmailService from '../components/accountInformation/updateSecondaryEmailService'
import TimerComponent from '../components/timerComponent/timer/timerComponent';
import TimerPetSelectionComponent from './../components/timerComponent/timerPetSelection/timerPetSelectionComponent';
import SelectPetComponent from '../utils/selectPetComponent/selectPetComponent';
import TimerActivityComponent from '../components/timerComponent/timerActivity/timerActivityComponent';
import ApproxTimeComponent from '../components/timerComponent/approxTime/approxTimeComponent';
import FindSensorComponent from '../components/sensorConfiguration/findSensor/findSensorComponent';
import ConnectSensorComponent from '../components/sensorConfiguration/connectSensor/connectSensorComponent';
import SensorWiFiListComponent from '../components/sensorConfiguration/sensorWiFiList/sensorWiFiListComponent';
import MenuComponent from '../components/menu/menuComponent';
import QuestionnaireStudyComponent from '../components/questionnaire/questionnairStudy/questionnaireStudyService';
import QuestionnaireQuestionsService from '../components/questionnaire/questionnaireQuestions/questionnaireQuestionsService';
import DeviceValidationComponent from '../components/SOB/deviceNumberValidation/deviceValidationComponent';
import PetNameComponent from '../components/SOB/petProfiles/petNameComponent';
import PetGenderComponent from '../components/SOB/petProfiles/petGenderComponent';
import PetNeuteredComponent from '../components/SOB/petProfiles/petNeuteredComponent';
import PetBreedComponent from '../components/SOB/petProfiles/petBreedComponent';
import PetAgeComponent from '../components/SOB/petAgeWeight/petAgeComponent';
import PetWeightComponent from '../components/SOB/petAgeWeight/petWeightComponent';
import PetReviewComponent from '../components/SOB/PetReview/petReviewComponent';
import SelectSensorActionComponent from '../components/sensorConfiguration/selectSensorAction/selectSensorActionComponent';
import AddOBSSelectPetComponent from '../components/observationsJournal/addObservations/addObsSelectedPet/addOBSSelectePetComponent';
import SelectDateComponent from '../components/observationsJournal/addObservations/selectDateComponent/selectDateComponent';
import UploadObsVideoComponent from '../components/observationsJournal/addObservations/uploadVideo/uploadObsVideoComponent';
import ObsReviewComponent from '../components/observationsJournal/addObservations/observationReview/obsReviewComponent';
import ChangePasswordComponent from '../components/accountInformation/changePasswordComponent';
import SensorInitialComponent from '../components/sensorConfiguration/sensorInstructions/sensorInitialsComponent';
import WriteDetailsToSensorComponent from '../components/sensorConfiguration/writeDetailsToSensor/writeDetailsToSensorComponent';
import SensorInitialPNQComponent from '../components/sensorConfiguration/sensorPNQuestionnaire/sensorInitialPNQComponent';
import EraseSensorDataComponent from '../components/sensorConfiguration/eraseSensorData/eraseSensorDataComponent';
import SensorCommandComponent from '../components/sensorConfiguration/sensorCommandComponent/sensorCommandsComponent';
import SensorPNQComponent from '../components/sensorConfiguration/sensorPNQuestionnaire/sensorPNQComponent';
import SensorTypeComponent from '../components/SOB/sensorType/sensorTypeComponent';
import SensorChargeConfirmationComponent from '../components/sensorConfiguration/sensorInstructions/SensorChargeConfirmationComponent';
import TimerLogsComponent from '../components/timerComponent/timerLogs/timerLogsComponent';
import FeedbackComponent from '../components/Feedback/feedbackComponent';
import SensorFirmwareComponent from '../components/sensorConfiguration/sensorFirmware/sensorFirmwareComponent';
import ManualNetworkComponent from '../components/sensorConfiguration/manualNetwork/manualNetworkComponent';
import PetTypeComponent from '../components/SOB/petType/petTypeComponent';
import PetEditComponent from '../components/petEdit/petEditComponent';
import ViewPhotoComponent from '../components/observationsJournal/viewObservations/viewPhotoComponent';
import QuickVideoComponent from '../components/observationsJournal/addObservations/quickVideo/quickVideoComponent';
import PetWeightHistoryComponent from '../components/petWeight/petWeightHistoryComponet';
import EnterWeightComponent from '../components/petWeight/enterWeightComponent';
import SendFeedbackComponent from '../components/Feedback/sendFeedbackComponent';
import EatingEnthusiasticComponent from '../components/eatingEnthusiastic/eatingEnthusiasticComponent';
import SelectDateEnthusiasmComponent from '../components/eatingEnthusiastic/selectDateEnthusiasmComponent';
import ImageScoringMainComponent from '../components/imageScoring/imageScoringMainComponent';
import ScoringImagePickerComponent from '../components/imageScoring/scoringImagePickerComponent';
import SelectBSCScoringComponent from '../components/imageScoring/SelectBSCScoringComponent';
import PetFeedingPreferencesComponentUI from '../components/SOB/petFeedingPreferences/petFeedingPreferences';
import WifiListHPN1Component from '../components/sensorConfiguration/wifiListHPN1/wifiListHPN1Component';
import CheckinQuestionnaireComponent from '../components/checkinQuestionnaire/checkinQuestionnaireComponent';
import ChatBotComponent from '../components/chatbot/chatBotComponent';
import ViewFeedbackComponent from '../components/Feedback/viewFeedbackComponent';
import BeaconsInitialComponent from '../components/beacons/beaconsInitialComponent';
import ConnectBeaconsComponent from '../components/beacons/connectBeacons/connectBeaconsComponent';
import BeaconsListComponent from '../components/beacons/beaconsList/beaconsListComponent';
import BeaconsLocationComponent from '../components/beacons/beaconsLocations/beaconsLocationComponent';
import BeaconsRangeComponent from '../components/beacons/beaconsRange/beaconsRangeComponent';
import PDFViewerComponent from '../components/pdfViewerComponent/pdfViewerComponent';
import ConnectSensorCommonComponent from '../components/sensorConfiguration/wifiListHPN1/connectSensorCommonComponent';
import PetParentAddressComponent from '../components/registration/petParentAddressComponent';
import UpdatePetParentAddressComponent from '../components/accountInformation/updatePetParentAddressComponent';
import PetLocationComponent from '../components/SOB/petLocation/petLocationComponent';
import PetAddressComponent from '../components/petAddress/petAddressComponent';
import PetAddressEditConfirmComponent from '../components/petEdit/petAddressEditConfirmComponent';
import PetAddressEditComponent from '../components/petEdit/petAddressEditComponent';
import PTActivityLimitsComponent from '../components/pointTracking/ptActivityLimits/ptActivityLimitsComponent';
import AllDevicesListComponent from '../components/multipleDevices/allDevicesListComponent';
import CategorySelectComponent from '../components/observationsJournal/addObservations/categoryComponents/categorySelectComponent';
import BFIUserDashboardComponent from '../components/bfiUserDashboard/bfiUserDashbaordComponent';
import GoalSetComponent from '../components/goalSetComponents/goalSetComponent';
import ReplaceSensorComponent from '../components/sensorConfiguration/replaceSensor/replaceSensorComponent';
import ReplaceSyncRequestComponent from '../components/sensorConfiguration/replaceSensor/replaceSyncRequestComponent';
import NewReplaceSensorRequestComponent from '../components/sensorConfiguration/replaceSensor/newReplaceSensorRequestComponent';
import BehaviorVisualizationComponent from '../components/behaviorVisualizationComponents/behaviorVisualizationComponent';
import PetListBFIScoringScreen from './../bfiComponents/scoreBFI/petListBFIScoringScreen'
import PetSubmittedImagesScreen from './../bfiComponents/scoreBFI/petSubmittedImagesScreen'
import PetImageCaptureComponent from '../bfiComponents/captureImages/petImageCaptureComponent';
import PetListComponent from '../bfiComponents/captureImages/petList/petListComponent';
import PetInformationComponent from '../bfiComponents/captureImages/petInformation/petInformationComponent';
import CameraComponent from '../bfiComponents/captureImages/cameraComponent/CameraComponent';
import BFIScoreMain from '../bfiComponents/scoreBFI/BFIScoringMain';
import InstructionsPage from '../bfiComponents/captureImages/instructions/instructionsComponent'
import ReviewComponent from '../bfiComponents/reviewScreen/reviewScreen';
import PetFoodInfoComponent from '../components/SOB/petProfiles/petFoodInfoComponent';
import SubmittedScoreComponent from '../bfiComponents/scoreBFI/submittedScore/submittedScoreComponent';
import BFIScoreInstructions from '../bfiComponents/scoreBFI/bfiScoreInstructionsComponent';
import ParentProfileComponent from '../components/SOB/petParentProfile/ParentProfileComponent';
import DeviceTutorialComponent from '../components/deviceTutorialComponents/deviceTutorialComponent';
import FoodIntakeComponent from '../components/foodHistoryComponents/foodIntakeComponents/foodIntakeComponent';
import FoodIntakeMainComponent from '../components/foodHistoryComponents/foodIntakeMainComponents/foddIntakeMainComponent';
import UpdateFoodUnitsComponent from '../components/accountInformation/updateFoodUnitsComponent';
import FoodHistoryPetSelectionComponent from '../components/foodHistoryComponents/foodHistoryPetSelection/foodHistoryPetSelectionComponent';
import GoalInstructionsComponent from '../components/goalSetComponents/goalInstructionsComponent';
import NotificationsComponent from '../components/notifications/notificationsComponent';
import MediaComponent from '../components/mediaInMenu/mediaComponent';
import MediaDetailPageScreen from '../components/mediaInMenu/mediaDetailPageScreen';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="InitialScreenComponent"
      screenOptions={{ gestureEnabled: false }}>

      <Stack.Screen name="InitialScreenComponent" component={InitialScreenComponent} options={{ headerShown: false }} />

      <Stack.Screen name="LoginComponent" component={LoginComponent} options={{ headerShown: false }} />

      <Stack.Screen name="DashBoardService" component={DashBoardService} options={{ headerShown: false }} />

      <Stack.Screen name="OTPComponent" component={OTPComponent} options={{ headerShown: false }} />

      <Stack.Screen name="PswdComponent" component={PswdComponent} options={{ headerShown: false }} />

      <Stack.Screen name="ForgotPasswordComponent" component={ForgotPasswordComponent} options={{ headerShown: false }} />

      <Stack.Screen name="PetParentProfileComponent" component={PetParentProfileComponent} options={{ headerShown: false }} />

      <Stack.Screen name="RegisterAccountComponent" component={RegisterAccountComponent} options={{ headerShown: false }} />

      <Stack.Screen name="ObservationsListComponent" component={ObservationsListComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ObservationComponent" component={ObservationComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ViewObservationService" component={ViewObservationService} options={{ headerShown: false, }} />

      <Stack.Screen name="CampaignService" component={CampaignService} options={{ headerShown: false, }} />

      <Stack.Screen name="RewardPointsService" component={RewardPointsService} options={{ headerShown: false, }} />

      <Stack.Screen name="AppOrientationComponent" component={AppOrientationComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SupportComponent" component={SupportComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="LearningCenterComponent" component={LearningCenterComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PrivacyComponent" component={PrivacyComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="AccountInfoService" component={AccountInfoService} options={{ headerShown: false, }} />

      <Stack.Screen name="UpdateNameService" component={UpdateNameService} options={{ headerShown: false, }} />

      <Stack.Screen name="UpdatePhoneService" component={UpdatePhoneService} options={{ headerShown: false, }} />

      <Stack.Screen name="TimerComponent" component={TimerComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SelectPetComponent" component={SelectPetComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="TimerActivityComponent" component={TimerActivityComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="TimerPetSelectionComponent" component={TimerPetSelectionComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ApproxTimeComponent" component={ApproxTimeComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="FindSensorComponent" component={FindSensorComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ConnectSensorComponent" component={ConnectSensorComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SensorWiFiListComponent" component={SensorWiFiListComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="MenuComponent" component={MenuComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="QuestionnaireStudyComponent" component={QuestionnaireStudyComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="QuestionnaireQuestionsService" component={QuestionnaireQuestionsService} options={{ headerShown: false, }} />

      <Stack.Screen name="DeviceValidationComponent" component={DeviceValidationComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetNameComponent" component={PetNameComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetGenderComponent" component={PetGenderComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetNeuteredComponent" component={PetNeuteredComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetBreedComponent" component={PetBreedComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetAgeComponent" component={PetAgeComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetWeightComponent" component={PetWeightComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetReviewComponent" component={PetReviewComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ChatBotComponent" component={ChatBotComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SelectSensorActionComponent" component={SelectSensorActionComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="AddOBSSelectPetComponent" component={AddOBSSelectPetComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SelectDateComponent" component={SelectDateComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="UploadObsVideoComponent" component={UploadObsVideoComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ObsReviewComponent" component={ObsReviewComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ChangePasswordComponent" component={ChangePasswordComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="UpdateSecondaryEmailService" component={updateSecondaryEmailService} options={{ headerShown: false, }} />

      <Stack.Screen name="SensorInitialComponent" component={SensorInitialComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="WriteDetailsToSensorComponent" component={WriteDetailsToSensorComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SensorInitialPNQComponent" component={SensorInitialPNQComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="EraseSensorDataComponent" component={EraseSensorDataComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SensorCommandComponent" component={SensorCommandComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SensorPNQComponent" component={SensorPNQComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SensorTypeComponent" component={SensorTypeComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SensorChargeConfirmationComponent" component={SensorChargeConfirmationComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="TimerLogsComponent" component={TimerLogsComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="FeedbackComponent" component={FeedbackComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SensorFirmwareComponent" component={SensorFirmwareComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ManualNetworkComponent" component={ManualNetworkComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetTypeComponent" component={PetTypeComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetEditComponent" component={PetEditComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ViewPhotoComponent" component={ViewPhotoComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="QuickVideoComponent" component={QuickVideoComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetWeightHistoryComponent" component={PetWeightHistoryComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="EnterWeightComponent" component={EnterWeightComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SendFeedbackComponent" component={SendFeedbackComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="EatingEnthusiasticComponent" component={EatingEnthusiasticComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SelectDateEnthusiasmComponent" component={SelectDateEnthusiasmComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ImageScoringMainComponent" component={ImageScoringMainComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ScoringImagePickerComponent" component={ScoringImagePickerComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SelectBSCScoringComponent" component={SelectBSCScoringComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetFeedingPreferencesComponentUI" component={PetFeedingPreferencesComponentUI} options={{ headerShown: false, }} />

      <Stack.Screen name="WifiListHPN1Component" component={WifiListHPN1Component} options={{ headerShown: false, }} />

      <Stack.Screen name="CheckinQuestionnaireComponent" component={CheckinQuestionnaireComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="InitialTutorialComponent" component={InitialTutorialComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ViewFeedbackComponent" component={ViewFeedbackComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="BeaconsInitialComponent" component={BeaconsInitialComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ConnectBeaconsComponent" component={ConnectBeaconsComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="BeaconsListComponent" component={BeaconsListComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="BeaconsLocationComponent" component={BeaconsLocationComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="BeaconsRangeComponent" component={BeaconsRangeComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PDFViewerComponent" component={PDFViewerComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ConnectSensorCommonComponent" component={ConnectSensorCommonComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetParentAddressComponent" component={PetParentAddressComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="UpdatePetParentAddressComponent" component={UpdatePetParentAddressComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetLocationComponent" component={PetLocationComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetAddressComponent" component={PetAddressComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetAddressEditConfirmComponent" component={PetAddressEditConfirmComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetAddressEditComponent" component={PetAddressEditComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PTActivityLimitsComponent" component={PTActivityLimitsComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="AllDevicesListComponent" component={AllDevicesListComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="CategorySelectComponent" component={CategorySelectComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="BFIUserDashboardComponent" component={BFIUserDashboardComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="GoalSetComponent" component={GoalSetComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ReplaceSensorComponent" component={ReplaceSensorComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="ReplaceSyncRequestComponent" component={ReplaceSyncRequestComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="NewReplaceSensorRequestComponent" component={NewReplaceSensorRequestComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="BehaviorVisualizationComponent" component={BehaviorVisualizationComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetListBFIScoringScreen" component={PetListBFIScoringScreen} options={{ headerShown: false, }} />

      <Stack.Screen name="PetSubmittedImagesScreen" component={PetSubmittedImagesScreen} options={{ headerShown: false, }} />

      <Stack.Screen name="PetImageCaptureComponent" component={PetImageCaptureComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetListComponent" component={PetListComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetInformationComponent" component={PetInformationComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="CameraComponent" component={CameraComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="InstructionsPage" component={InstructionsPage} options={{ headerShown: false, }} />

      <Stack.Screen name="BFIScoreMain" component={BFIScoreMain} options={{ headerShown: false, }} />

      <Stack.Screen name="ReviewComponent" component={ReviewComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="PetFoodInfoComponent" component={PetFoodInfoComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="SubmittedScoreComponent" component={SubmittedScoreComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="BFIScoreInstructions" component={BFIScoreInstructions} options={{ headerShown: false, }} />

      <Stack.Screen name="ParentProfileComponent" component={ParentProfileComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="DeviceTutorialComponent" component={DeviceTutorialComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="FoodIntakeComponent" component={FoodIntakeComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="FoodIntakeMainComponent" component={FoodIntakeMainComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="UpdateFoodUnitsComponent" component={UpdateFoodUnitsComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="FoodHistoryPetSelectionComponent" component={FoodHistoryPetSelectionComponent} options={{ headerShown: false, }} />

      <Stack.Screen name="GoalInstructionsComponent" component={GoalInstructionsComponent} options={{ headerShown: false, }}/>
      
      <Stack.Screen name="NotificationsComponent" component={NotificationsComponent} options={{ headerShown: false, }} />
      
      <Stack.Screen name="MediaComponent" component={MediaComponent} options={{ headerShown: false, }} />
      
      <Stack.Screen name="MediaDetailPageScreen" component={MediaDetailPageScreen} options={{ headerShown: false, }}/>
      
    </Stack.Navigator>

  );
};

function AppNavigator() {
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}

export default AppNavigator;