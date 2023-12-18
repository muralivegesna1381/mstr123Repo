import React, { useState, useEffect } from 'react';
import PetInformationUI from './petInformationUI';
import * as DataStorageLocal from './../../../utils/storage/dataStorageLocal';
import * as Constant from './../../../utils/constants/constant';
import * as ServiceCalls from './../../../utils/getServicesData/getServicesData.js';

const PetInformationComponent = ({ navigation, route, ...props }) => {

    const [petObj, set_petObj] = useState(undefined);
    const [devices, set_devices] = useState(undefined);
    const [email, set_email] = useState(undefined);
    const [fullName, set_fullName] = useState(undefined);

    useEffect(() => {
        if (route.params?.petData) {
            set_petObj(route.params?.petData)
        }
        getUserData()

    }, [route.params?.petData]);

    const navigateToPrevious = () => {
        navigation.navigate('PetListComponent');
    };

    const nextButtonAction = () => {
        navigation.navigate('PetImageCaptureComponent', {
            petID: petObj.petID,
            petParentId: petObj.petParentId
        });
    };

    // Fetching the user data from backend by passing the clien id
    const getUserData = async () => {
        let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let json = {
            ClientID: "" + clientIdTemp,
        };

        let userDetailsServiceObj = await ServiceCalls.getClientInfo(json, token);

        if (userDetailsServiceObj && userDetailsServiceObj.logoutData) {
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
            return;
        }

        if (userDetailsServiceObj && userDetailsServiceObj.statusData) {
            if (userDetailsServiceObj.responseData) {
                set_email(userDetailsServiceObj.responseData.email);
                set_fullName(userDetailsServiceObj.responseData.fullName);
            }
        }
    };

    return (
        <PetInformationUI
            petObj={petObj}
            email={email}
            fullName={fullName}
            devices={devices}
            navigateToPrevious={navigateToPrevious}
            nextButtonAction={nextButtonAction}
        />
    );

}

export default PetInformationComponent;