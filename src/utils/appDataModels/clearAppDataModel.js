import * as AppPetsData from '../../utils/appDataModels/appPetsModel.js';
import * as modularPermissions from '../../utils/appDataModels/modularPermissionsModel.js';
import * as UserDetailsModel from "./../../utils/appDataModels/userDetailsModel.js";
import * as ObservationModel from "./../../components/observationsJournal/observationModel/observationModel.js";

export async function clearAppPetsModel () {
    
    let petsData = {
        "totalPets" : undefined,
        "defaultPet" : undefined,
        "isDeviceMissing" : undefined,
        "isDeceased" : undefined,
        "isDeviceSetupDone" : true,
        "isFirstUser" : undefined,
        "showSearch" : undefined,
        "deviceModel" : undefined,
    }
    AppPetsData.petsData = petsData;
};

export async function modularPermissionsModel () {
    
    let modularPermissionsData = {
        "isFmGraph" : false,
        "isFmDataService" : false,
        "isFmGoalSet" : false,
        "isSleepGraph" : false,
        "isPetWeight" : false,
        "isEatingEnthusiasm" : false,
        "isImageScoring" : false,
        "ptExists" : false,
        "isWeightPer" : false,
        "isQuestionnaireEnable" : false,
        "isObsEnable" : false,
        "isTimerEnable" : false,
        "isFoodHistory" : false,
        "isFeedingReq" : false,
        "isTimer" : false,
        "isPTEnable" : false
    }

    modularPermissions.modularPermissionsData = modularPermissionsData;
    
};

export async function clearObservationData () {
    let observationData = {
        "selectedPet" : undefined, 
        "fromScreen" : String, 
        "isPets" : Boolean, 
        "isEdit" : Boolean,
        "obsText" : String,
        "obserItem" : undefined,
        "selectedDate" : String,
        "mediaArray" : [],
        "behaviourItem" : undefined,
        "observationId" : Number,
        "ctgNameId" : Number,
        "ctgName" : String,
        "quickVideoFileName" : String,
        "quickVideoDateFile" : String,
    }
    ObservationModel.observationData = observationData;
};

export async function userDetailsModel () {
    
    let userDetailsData = {
        "user" : Object,
        "userRole" : Object
    }
    UserDetailsModel.userDetailsData = userDetailsData;
}