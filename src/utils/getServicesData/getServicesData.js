import NetInfo from "@react-native-community/netinfo";
import BuildEnv from './../../config/environment/environmentConfig';

const Environment = JSON.parse(BuildEnv.Environment());

export async function internetCheck() {
    let netInfo = await NetInfo.fetch(null, true);
    return netInfo.isConnected;
};

/////////////////// Migrated Java Services /////////////////////////////////
////// Wearables App login API //////
export async function loginWearablesApp(jsonValue) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/ClientLogin/v2",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": ''
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if(data && data.errors && data.errors.length && (data.errors[0].code==='WEARABLES_TKN_003' || data.errors[0].code==='WEARABLES_WEB_APP_EXCEPTION')){
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.success && data.result) {
            statusData = { status: data.success, responseCode: data.responseCode, responseMessage: data.responseMessage };
            if (data.result.UserDetails) {
                responseData = { userDetails: data.result.UserDetails }
            }

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Change Password API //////
export async function changePassword(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/ChangePassword/v2",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.success && data.result) {
            statusData = data.success;
            responseData = { key: data.result.Key, Value: data.result.Value };
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Pet Parent details API //////
export async function getClientInfo(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    // await fetch(Environment.uri + "migrated/GetClientInfo/v2",
    await fetch(Environment.uri + "getProfileInfo",//app/getProfileInfo
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            // body:JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.status.success) {

            statusData = data.status.success;
            if (data.response && data.response.user) {

                responseData = data.response.user;

            } else {
                statusData = undefined;
            }

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Change Pet Parent Details API //////
export async function changeClientInfo(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/ChangeClientInfo/v2",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.success && data.result) {
            statusData = data.success;
            responseData = data.result;
        } else {
            statusData = undefined;
            if (data.ResponseCode) {
                responseData = data.ResponseCode
            }
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Save Feedback API //////
export async function manageMobileAppScreensFeedback(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/ManageMobileAppScreensFeedback",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.success) {
            statusData = data.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Update Sensor status API //////
export async function updateSensorSetupStatus(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/UpdateSensorSetupStatus",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {
        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }
        if (data && data.success) {
            statusData = data.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Update Sensor status API //////
export async function updateReplaceSensorSetupStatus(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/replaceSensorToPet",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }
        if (data && data.status.success) {
            statusData = data.status.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// OTP API //////
/*export async function checkClientSMSCode (jsonValue,token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;
    
    let internet  = await internetCheck();
    if(!internet) {
        obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError, isInternet : internet};
        return obj;
    } 

    await fetch(Environment.uri + "migrated/CheckClientSMSCode",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : ''
        },
        body:JSON.stringify(jsonValue),
      }
    ).then((response) => response.json()).then(async (data) => {
        
        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            logoutData = true;
        } else {
            logoutData = false;
        }
        if (data && data.success && data.result.Key) {
            statusData = data.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError, isInternet : internet}
    return obj;
};*/

////// OTP API //////
/*export async function setClientPasswordBySMSCode (jsonValue,token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;
    
    let internet  = await internetCheck();
    if(!internet) {
        obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError, isInternet : internet};
        return obj;
    } 

    await fetch(Environment.uri + "migrated/SetClientPasswordBySMSCode",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : ''
        },
        body:JSON.stringify(jsonValue),
      }
    ).then((response) => response.json()).then(async (data) => {

        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            logoutData = true;
        } else {
            logoutData = false;
        }
        if (data && data.success) {
            statusData = data.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError, isInternet : internet}
    return obj;
};*/

////// Validate Sensor API //////
export async function validateDeviceNumber(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/ValidateDeviceNumber",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.success) {
            statusData = data.success;
            if (data.result) {

                if (data.result.responseCode === 'ERROR') {

                    responseData = { error: true, message: data.result.message };

                } else {
                    responseData = { error: false, message: data.result.message };;
                }

            }

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// CompleteOnboardingInfoAPI //////
export async function completeOnboardingInfo(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/CompleteOnboardingInfo",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.success) {
            statusData = data.success;
            if (data.result) {
                responseData = data.result;
            }

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

export async function validateDuplicatePet(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/validateDuplicatePet",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.status.success) {
            statusData = data.status.success;
        } else {
            statusData = data.status.success;
            if (data.errors) {
                responseData = data.errors[0].message;
            }
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Manage Pet TimerLog API //////
export async function managePetTimerLog(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/ManagePetTimerLog",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.success) {
            statusData = data.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Get Pet TimerLogs API //////
export async function getPetTimerLog(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/GetPetTimerLog/v2",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.success) {
            statusData = data.success;
            if (data.result) {
                responseData = data.result;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

/////////////////// New Java Services /////////////////////////////////

export async function getAppUpdateStatus(osId, appVersion) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "getAppLatestVersion/" + osId + '/' + appVersion,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": ''
            },
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response && data.response.appVersion) {
                responseData = data.response.appVersion;
            } else {
                responseData = undefined;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Pet Parent Pets API //////
export async function getPetParentPets(client, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "getPetDevicesByPetParent/" + client,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.petDevices;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Modularity Permissions API //////
export async function getModularityPermission(petIDArray, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/getMobileAppConfigs/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(petIDArray),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                //responseData = data.response.petMobileAppConfigs;
                responseData = data.response.mobileAppConfigs;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Campaign API //////
export async function getCampaignListByPet(petID, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "getCampaignListByPet/" + petID,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.campaigns;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Leaderboard API //////
export async function getLeaderBoardByCampaignId(campId, campaignPetId, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "getLeaderBoardByCampaignId/" + campId + "/" + campaignPetId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = { leaderBoards: data.response.leaderBoards, currentObj: data.response.currentPet };
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Campaign details API //////
export async function getPetCampaignPointsList(campId, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "getPetCampaignPointsList/" + campId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.petCampaignList;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Campaign details API //////
export async function getPetCampaignPoints(campId, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "getPetCampaignPoints/" + campId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response && data.response.petCampaign) {
                responseData = { redeemablePoints: data.response.petCampaign.redeemablePoints, totalEarnedPoints: data.response.petCampaign.totalEarnedPoints };
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Campaign details API //////
export async function getPetRedemptionHistory(petId, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "getPetRedemptionHistory/" + petId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.redemptionHistoryList;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Get App Supports API //////
export async function getAppSupportDocs(id, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "supportDocs/getAppSupportDocs/" + id, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                let dataArray = [];
                if (data.response.supportMaterials.userGuides && data.response.supportMaterials.userGuides.length > 0) {

                    for (let i = 0; i < data.response.supportMaterials.userGuides.length; i++) {
                        dataArray.push(data.response.supportMaterials.userGuides[i]);
                    }

                }

                if (data.response.supportMaterials.videos && data.response.supportMaterials.videos.length > 0) {

                    for (let i = 0; i < data.response.supportMaterials.videos.length; i++) {
                        dataArray.push(data.response.supportMaterials.videos[i]);
                    }

                }

                responseData = dataArray;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

///// Get Supports API //////
export async function getSupportDocs(token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "supportDocs/getSupportDocs", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.supportMaterials;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Get Questionnaires API //////
export async function getQuestionnaireData(petID, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "getQuestionnaireByPetId/" + petID + '?isDateSupported=true', {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.questionnaireList;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Saving Questionnaire/Automated Checking Question and Answers API //////
export async function saveQuestionAnswers(ansDict, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "saveQuestionAnswers/v2",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(ansDict),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.status) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.message;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Get Questionnaires API //////
export async function getFeedbackQuestionnaireByPetId(petID, deviceType, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "getFeedbackQuestionnaireByPetId/" + petID + '/' + deviceType + '?isDateSupported=true', {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                if (data.response.questionnaireList && data.response.questionnaireList.length > 0) {
                    responseData = data.response.questionnaireList[0];
                } else {
                    responseData = [];
                }

            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Get Questionnaires API //////
export async function getPetEatingEnthusiasmScale(sId, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/getPetEatingEnthusiasmScale?speciesId=" + sId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.eatingEnthusiasmScales;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Get PetFeedingTime API //////
export async function getPetFeedingTime(token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/getPetFeedingTime/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.petFeedingTimes;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Submit PetFeedingTime API //////
export async function addPetFeedingTime(json, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/addPetFeedingTime", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
        body: JSON.stringify(json)
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Get Feedback API //////
export async function getFeedbackByPetParent(clientId, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "getFeedbackByPetParent/" + clientId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.mobileAppFeeback;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Get ImageScoring details API //////
export async function getPetImageScoringScales(petId, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/getPetImageScoringScales/" + petId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.imageScoringScales;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Submit PetFeedingTime API //////
export async function addPetImageScoring(json, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/addPetImageScoring", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
        body: JSON.stringify(json)
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Get Behaviors details API //////
export async function getPetBehaviors(sid, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/getPetBehaviors/" + sid, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.petBehaviorList;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Submit Observation API //////
export async function savePetObservation(json, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/savePetObservation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
        body: JSON.stringify(json)
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Get Observation details API //////
export async function getPetObservations(petId, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/getPetObservations/" + petId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.petObservations;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Get Observation details API //////
export async function deleteObservations(obsId, petId, clientId, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/" + obsId + '/' + petId + '/' + clientId, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Get Pet Weight History details API //////
export async function weightHistory(petId, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/weightHistory/" + petId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.petWeightHistories;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// assignSensorToPet API //////
export async function assignSensorToPet(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "assignSensorToPet",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.status.success) {
            statusData = data.status.success;
            if (data.errors && data.errors.length > 0) {
                responseData = data.errors;
            }

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Get Pet Feeding Preferences API //////
export async function getPetFeedingPreferences(token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/getPetFeedingPreferences", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.petFeedingPreferences;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Get Pet Breeds API //////
export async function getPetBreeds(id, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/getPetBreeds/" + id, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.petBreedList;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Get Pet Species API //////
export async function getPetSpecies(token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/getPetSpecies", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.species;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Add Pet Feeding Preferences API //////
export async function addPetFeedingPreferences(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/addPetFeedingPreferences",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.status) {
            statusData = data.status.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// add/Edit Weight API //////
export async function addEditPetWeight(jsonValue, token, mtype) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + mtype,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.status.success) {
            statusData = data.status.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Pet Parent Address API //////
export async function validateAddress(jsonValue) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let invalidData = false;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "validateAddress",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": ''
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.errors && data.errors.length && data.errors[0].message === 'Invalid Address') {
            invalidData = true;
        } else {
            invalidData = false;
        }
        if (data && data.status.success) {
            statusData = data.status.success;
            responseData = data.response;

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, invalidData: invalidData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Forgot Password API //////
export async function forgotPasswordValidateEmail(jsonValue) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }
    await fetch(Environment.uri + "migrated/ForgotPasswordValidateEmail",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": ''
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.success && data.result.Key) {
            statusData = data.success;
        } else if (data.result && data.result.Value !== '') {
            responseData = data.result.Value;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

// export async function forgotPasswordValidateEmailVerificationCode (jsonValue,token) {
export async function validateOTPBackend(jsonValue, apiName) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    // await fetch(Environment.uri + "migrated/ForgotPasswordValidateEmailVerificationCode",
    await fetch(Environment.uri + "migrated/" + apiName,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": ''
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.success && data.result.Key) {
            statusData = data.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Register Email API //////
export async function registerUserValidateEmail(jsonValue) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/RegisterUserValidateEmail",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": ''
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.result && data.result.ClientID !== 0) {
            statusData = data.success;
            responseData = data.result;
        } else {
            statusData = undefined;
            responseData = data.result;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

// export async function registerUser (jsonValue,token) {
export async function createPassword(jsonValue, apiName) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    // await fetch(Environment.uri + "migrated/RegisterUser",
    await fetch(Environment.uri + "migrated/" + apiName,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": ''
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.success) {
            statusData = data.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Forgot Password API //////
export async function registerUserSendEmailVerificationCode(jsonValue) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/RegisterUserSendEmailVerificationCode",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": ''
            },
            body: JSON.stringify(jsonValue),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.success && data.result.Key) {
            statusData = data.success;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Pet Parent Address API //////
export async function updatePetInfo(finalJson, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let invalidData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/UpdatePetInfo",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(finalJson),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].message === 'Invalid Address') {
            invalidData = true;
        } else {
            invalidData = false;
        }
        if (data && data.success) {
            statusData = data.success;
            responseData = data.result.Key;

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { invalidData: invalidData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Individual Configs API //////
export async function configPermissionAPI(clientId, value, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/getPetsByPetParentIdAndMobileAppConfigId/" + clientId + '/' + value,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
        }
    ).then((response) => response.json()).then(async (data) => {

        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.status.success) {
            statusData = data.status.success;
            if (data.response && data.response.pets) {
                responseData = data.response.pets;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Delete PetParent Account API //////
export async function deleteUserAccount(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "migrated/deleteAccount", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken": token
        },
        body: JSON.stringify(jsonValue)
    }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.success) {
            statusData = data.success;

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;

};

////// Modularity Permissions API //////
export async function getPetBehaviorVisualization(petID, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/getBehaviorVisualization/" + petID,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
        }
    ).then((response) => response.json()).then(async (data) => {

        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Modularity Permissions API //////
export async function getPetWeightHistory(petID, token, toDate, fromDate) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/weightHistory/" + petID + "?" + "fromDate=" + fromDate + "&" + "toDate=" + toDate,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// saveForwardMotionGoal API //////
export async function saveForwardMotionGoal(jsonValue, token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "pets/saveForwardMotionGoal",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(jsonValue)
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Google Places API //////
export async function getGooglePlacesApi(searchText,gKey) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let invalidData = false;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    const searchOptions = {
        components: { country: ['us'] },
    }

    await fetch("https://maps.googleapis.com/maps/api/place/autocomplete/json?key=" + gKey + "&input=" + searchText + "&components=country:us|country:uk|country:ca",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": ''
            },
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data && data.errors && data.errors.length && data.errors[0].message === 'Invalid Address') {
            invalidData = true;
        } else {
            invalidData = false;
        }
        if (data) {
            statusData = true;
            responseData = data.predictions;

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, invalidData: invalidData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Get capture image orientation Positions //////
export async function getCaptureBFIImageOrientationPositions(token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "petBfi/getPetImagePositions",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
        }
    ).then((response) => response.json()).then(async (data) => {
        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.imagePositions;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

//// Submit captured images to server //////
export async function submitCaptureBFIImages(token, requestBody) {
    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "petBfi/savePetBfiImages",
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(requestBody),
        }
    ).then((response) => response.json()).then(async (data) => {

        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

//// Get BFI scores Data //////
export async function getBfiImageScores(token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "petBfi/getBfiImageScores/1",
        {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
        }
    ).then((response) => response.json()).then(async (data) => {
        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

//// Submit Selected score to server////
export async function submitBFIScore(token, request) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }

    await fetch(Environment.uri + "petBfi/savePetBfiImageScore",
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
            body: JSON.stringify(request),
        }
    ).then((response) => response.json()).then(async (data) => {
        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// Pet Parent Pets to capture BFI photos by pet parent ID //////
export async function getPetsToCaptureBfiImages(clientID, token, pageNo, searchText) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;
    let obj = undefined;

    let internet = await internetCheck();
    if (!internet) {
        obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet };
        return obj;
    }
    await fetch(Environment.uri + "petBfi/getPetsToCaptureBfiImages?petParentId=" + clientID + "&speciesId=1&pageNo=" + pageNo + "&pageLength=10&searchText=" + searchText,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ClientToken": token
            },
        }
    ).then((response) => response.json()).then(async (data) => {
        if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if (data.response) {
                responseData = data.response.pets;
            }
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    obj = { logoutData: logoutData, statusData: statusData, responseData: responseData, error: returnError, isInternet: internet }
    return obj;
};

////// foodIntakeList API //////
export async function foodIntakeListApi(petId,petParentId,intakeDate,token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet  = await internetCheck();
    if(!internet) {
        obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError, isInternet : internet};
        return obj;
    } 

    await fetch(Environment.uri + "intake/getPetIntakeList/"+petId+"/"+petParentId+"/"+intakeDate, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : token
        },
      }
    ).then((response) => response.json()).then(async (data) => {

        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            if(data.response) {
                responseData = data.response.intakes;
            }

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError,isInternet : internet}
    return obj;

};

////// getFoodIntake API //////
export async function getFoodIntakeApi(id,token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet  = await internetCheck();
    if(!internet) {
        obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError, isInternet : internet};
        return obj;
    } 

    await fetch(Environment.uri + "intake/getPetIntakeById/"+id, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : token
        },
      }
    ).then((response) => response.json()).then(async (data) => {

        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            responseData = data.response

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError,isInternet : internet}
    return obj;

};

////// getFoodIntakeConfigDataApi API //////
export async function getFoodIntakeConfigDataApi(petId,petParentId,intakeDate,token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet  = await internetCheck();
    if(!internet) {
        obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError, isInternet : internet};
        return obj;
    } 

    await fetch(Environment.uri + "intake/getPetFoodIntakeConfigData/"+petId+"/"+petParentId+"/"+intakeDate, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : token
        },
      }
    ).then((response) => response.json()).then(async (data) => {

        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            responseData = data.response;
        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError,isInternet : internet}
    return obj;

};

////// Save FoodIntake API //////
export async function saveOrUpdatePetFoodIntake(jsonValue,token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet  = await internetCheck();
    if(!internet) {
        obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError, isInternet : internet};
        return obj;
    } 

    await fetch(Environment.uri + "intake/saveOrUpdatePetFoodIntake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : token
        },
        body : JSON.stringify(jsonValue)
      }
      
    ).then((response) => response.json()).then(async (data) => {

        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError,isInternet : internet}
    return obj;

};

////// Save FoodIntake API //////
export async function getFoodIntakeHistoryApi(petId,client,fCalenderSdate, fCalenderEdate,token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet  = await internetCheck();
    if(!internet) {
        obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError, isInternet : internet};
        return obj;
    } 

    await fetch(Environment.uri + "intake/studyDietIntakeHistory?petId="+petId+"&petParentId="+client+"&dietId=0"+"&fromDate="+fCalenderSdate+"&toDate="+fCalenderEdate, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : token
        },
      //  body : JSON.stringify(jsonValue)
      }
      
    ).then((response) => response.json()).then(async (data) => {

        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            responseData = data.response;

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError,isInternet : internet}
    return obj;

};

////// Save FoodIntake API //////
export async function getFoofdUnitsApi(value,token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet  = await internetCheck();
    if(!internet) {
        obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError, isInternet : internet};
        return obj;
    } 

    await fetch(Environment.uri + "getMeasurementUnits/"+"?unitCategory="+value, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : token
        },
      }
      
    ).then((response) => response.json()).then(async (data) => {

        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            responseData = data.response;

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError,isInternet : internet}
    return obj;

};

////// Get Reasons API //////
export async function replaceSensorReasons(token) {

    let returnError = undefined;
    let statusData = undefined;
    let responseData = undefined;
    let logoutData = false;

    let internet  = await internetCheck();
    if(!internet) {
        obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError, isInternet : internet};
        return obj;
    } 

    await fetch(Environment.uri + "pets/replace-sensor-reasons", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : token
        },
      }

      ).then((response) => response.json()).then(async (data) => {

        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            logoutData = true;
        } else {
            logoutData = false;
        }

        if (data.status.success) {
            statusData = data.status.success;
            responseData = data.response;

        } else {
            statusData = undefined;
        }

    }).catch((error) => {
        returnError = error;
    });

    let obj = {logoutData : logoutData, statusData : statusData, responseData : responseData, error : returnError,isInternet : internet}
    return obj;

};