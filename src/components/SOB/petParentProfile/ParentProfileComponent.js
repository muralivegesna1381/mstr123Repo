import React, { useState, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import ParentProfileUI from "./ParentProfileUI"
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";

const ParentProfileComponent = ({ navigation, route, ...props }) => {

    const [isFrom, set_isFrom] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    let sJosnObjPetParent = useRef({});

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
        });

        const unsubscribe = navigation.addListener('blur', () => {
        });

        return () => {
            focus();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    useEffect(() => {
        if (route.params?.isFrom) {
            set_isFrom(route.params?.isFrom);
        }
    }, [route.params?.isFrom]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const navigateToPrevious = async () => {
        navigation.pop()
    }

    const submitAction = async (fName, sName, email, phnNum) => {
        sJosnObjPetParent.current.firstName = fName;
        sJosnObjPetParent.current.lastName = sName;
        sJosnObjPetParent.current.email = email;
        sJosnObjPetParent.current.phoneNumber = phnNum;
        await DataStorageLocal.saveDataToAsync(Constant.PET_PARENT_DATA, JSON.stringify(sJosnObjPetParent.current));
        navigation.navigate('PetNameComponent');
    }

    return (
        <ParentProfileUI
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
        />
    );

}

export default ParentProfileComponent;