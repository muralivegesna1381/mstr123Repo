import React, { useState, useEffect, useRef } from 'react';
import * as Constant from "../../../utils/constants/constant";
import PetListUI from './petListUI';
import * as DataStorageLocal from '../../../utils/storage/dataStorageLocal';
import * as ServiceCalls from '../../../utils/getServicesData/getServicesData.js';
import * as firebaseHelper from '../../../utils/firebase/firebaseHelper';

const PetListComponent = ({ navigation, route, ...props }) => {
    const [petObj, set_petObj] = useState(undefined);
    const [devices, set_devices] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    var pageNum = useRef(1);
    var searchText = useRef('');
    var stopPagination = useRef(false);
    var totalRecordsData = useRef([]);

    useEffect(() => {
        getDashBoardPets()
    }, []);

    /**
     * Service call to fetch the Pet details from the backend.
     */
    const getDashBoardPets = async () => {

        if (pageNum.current === 1) {
            stopPagination.current = false
        }
            
        set_isLoading(true);
        let clientID = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let serviceCallsObj = await ServiceCalls.getPetsToCaptureBfiImages(clientID, token, pageNum.current, searchText.current);

        if (serviceCallsObj && serviceCallsObj.statusData) {
            set_isLoading(false);
            if (serviceCallsObj && serviceCallsObj.responseData && serviceCallsObj.responseData.length > 0) {
                for (let i = 0; i < serviceCallsObj.responseData.length; i++) {
                    totalRecordsData.current.push(serviceCallsObj.responseData[i]);
                }
                set_devices(totalRecordsData.current)
            } else {
                //set empty for intial page
                if (totalRecordsData.current.length === 0){
                    set_devices([])
                }
                    
                else {
                    //stop pagination if no more records coming
                    stopPagination.current = true
                }
            }
        }

        if (serviceCallsObj && serviceCallsObj.error) {
            let errors = serviceCallsObj.error.length > 0 ? serviceCallsObj.error[0].code : ''
            set_isLoading(false);
            firebaseHelper.logEvent(firebaseHelper.event_get_pets_api, firebaseHelper.screen_bfi_pet_list, "CaptureBFI Getpets Service failed", 'Service error : ' + errors);
        }
    };

    const navigateToPrevious = () => {
        navigation.pop()
    };

    const navigateToNext = async () => {
        //get user role
        let userRole = await DataStorageLocal.getDataFromAsync(Constant.USER_ROLE_ID);
        //clear old existing data
        await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
        //add flag as coming from pet BFI
        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_PET_BFI, Constant.IS_FROM_PET_BFI);

        firebaseHelper.logEvent(firebaseHelper.event_add_pet_click, firebaseHelper.screen_bfi_pet_list, "CaptureBFI Add pet clicked", '');

        //Ask Pet Parent Profile Info if login as representative
        if (userRole === '9')
            navigation.navigate('ParentProfileComponent');
        else
            navigation.navigate('PetNameComponent');

    };

    const navigateToCapture = (item, index) => {
        firebaseHelper.logEvent(firebaseHelper.event_existing_pet_click, firebaseHelper.screen_bfi_pet_list, "CaptureBFI existing pet clicked", '');
        navigation.navigate('PetInformationComponent', {
            petData: item
        });
    };

    const infoBtnAction = () => {
        navigation.navigate("InstructionsPage", {
            instructionType: 1,
        });
    }

    const pageNumberUpdated = (udatedPageNum) => {
        pageNum.current = udatedPageNum
        if (stopPagination.current === false)
            getDashBoardPets()
    };

    const doServiceCall = (searchEntryText) => {
        searchText.current = searchEntryText
        totalRecordsData.current = []
        pageNum.current = 1
        getDashBoardPets()
    };

    return (
        <PetListUI
            petObj={petObj}
            devices={devices}
            isLoading={isLoading}
            navigateToPrevious={navigateToPrevious}
            navigateToCapture={navigateToCapture}
            navigateToNext={navigateToNext}
            infoBtnAction={infoBtnAction}
            pageNumberUpdated={pageNumberUpdated}
            doServiceCall={doServiceCall}
        />
    );

}

export default PetListComponent;