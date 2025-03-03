import NetInfo from "@react-native-community/netinfo";
import BuildEnv from './../../config/environment/environmentConfig';
import * as Storage from '../../utils/storage/dataStorageLocal';
import * as Constant from "../../utils/constants/constant";
import * as Queries from "./../../config/apollo/queries";
import * as Apolloclient from './../../config/apollo/apolloConfig';

// const navigation = useNavigation();
const Environment = JSON.parse(BuildEnv.Environment());

export async function internetCheck() {
    let netInfo = await NetInfo.fetch(null, true);
    return netInfo.isConnected;
};

const getHeaders = async () => {
    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    return {
        Accept: "application/json",
        "Content-Type": "application/json",
        "ClientToken": token
    }
}

export async function apiRequest(methodName,url,reuestObj,serviceType,navigation) {

    let serviceObj = {isInternet : true, status : true, data : null, error : null, logoutError : null, appError : null};

    let isInternet = await internetCheck();
    if(!isInternet) {
        serviceObj.isInternet = false;
        return serviceObj;
    }

    return new Promise(async(resolve, reject) => {

        fetch(Environment.uri + url, {
            method :methodName,
            body: methodName === "GET" ? null : JSON.stringify(reuestObj),
            headers: await getHeaders()
        }).then(res => { return res.json()}).then(data => { 

            if(serviceType === Constant.SERVICE_MIGRATED) {

                if(data && data.success) {

                    serviceObj.data = data.result;
                    return resolve(serviceObj) 

                } else if(data && data.errors) {

                    if(data && data.errors && data.errors[0].code && data.errors[0].code === 'WEARABLES_TKN_003') {
                        Apolloclient.client.writeQuery({ query: Queries.LOG_OUT_APP, data: { data: { isLogOut: 'logOut', __typename: 'LogOutApp' } }, });
                        navigation.popToTop();
                        // navigation.navigate('WelcomeComponent');
                        navigation.navigate('LoginComponent',{"isAuthEnabled" : false}); 
                    } else {

                        if (data.errors[0].message) {
                            serviceObj.error = {errorMsg : data.errors[0].message};
                        } else {
                            serviceObj.error = {errorMsg : Constant.SERVICE_FAIL_MSG}
                        }
                        serviceObj.status = false;
                        return resolve(serviceObj) ;

                    }

                } else {
                    serviceObj.status = false
                    return resolve(serviceObj); 
                    
                }

            } else {

                if(data && data.status && data.status.success) {
                    
                    serviceObj.data = data.response;
                    return resolve(serviceObj) 
                } else if(data && data.errors) {

                    if(data && data.errors && data.errors[0].code && data.errors[0].code === 'WEARABLES_TKN_003') {
                        Apolloclient.client.writeQuery({ query: Queries.LOG_OUT_APP, data: { data: { isLogOut: 'logOut', __typename: 'LogOutApp' } }, });
                        navigation.popToTop();
                        navigation.navigate('LoginComponent',{"isAuthEnabled" : false}); 
                        // navigation.navigate('WelcomeComponent');
                    } else {

                        if (data.errors[0].message) {
                            serviceObj.error = {errorMsg : data.errors[0].message};
                        } else {
                            serviceObj.error = {errorMsg : Constant.SERVICE_FAIL_MSG}
                        }
                        serviceObj.status = false;
                        return resolve(serviceObj) ;

                    }
                                        
                } else {
                    serviceObj.status = false
                    return resolve(serviceObj); 
                }

            }
            
        }).catch(error => {
            // Handle the case where the fetch itself failed or res.ok was false
            if (error.status) {
                serviceObj.error = {errorMsg : Constant.SERVICE_FAIL_MSG};
                serviceObj.status = false;
                return reject(serviceObj);
            } else {
                serviceObj.error = {errorMsg : Constant.SERVICE_FAIL_MSG};
                serviceObj.status = false;
                return reject(serviceObj);
            }
            
        });

    });
    
}

export async function getData(url, requestObj,serviceType, navigation) {

    return await apiRequest('GET', url,requestObj,serviceType,navigation)
    
};

export async function putData(url,reuestObj,serviceType,navigation) {

    return apiRequest('PUT', url, reuestObj,serviceType,navigation)
    
};

export async function postData(url,reuestObj,serviceType,navigation) {

    return apiRequest('POST', url, reuestObj,serviceType,navigation)
    
};

export async function deleteData(url, reuestObj,serviceType,navigation) {

    return apiRequest('DELETE', url, reuestObj,serviceType,navigation)
    
};