import React, { useState, useEffect } from 'react';
import PetInformationUI from './petInformationUI';

const PetInformationComponent = ({ navigation, route, ...props }) => {

    const [petObj, set_petObj] = useState(undefined);
    const [devices, set_devices] = useState(undefined);
    const [email, set_email] = useState(undefined);
    const [fullName, set_fullName] = useState(undefined);
    const [birthDay, set_birthDay] = useState('--')

    useEffect(() => {

        if (route.params?.petData) {
            set_petObj(route.params?.petData);
            if(route.params?.petData.birthday) {

                const words = route.params?.petData.birthday.split(' ');
                if(words && words.length > 0) {
                    var replaced = words[0].replace(/\//g, '-');
                    set_birthDay(replaced);
                }
    
            }
        }

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

    return (
        <PetInformationUI
            petObj={petObj}
            email={email}
            fullName={fullName}
            devices={devices}
            birthDay = {birthDay}
            navigateToPrevious={navigateToPrevious}
            nextButtonAction={nextButtonAction}
        />
    );

}

export default PetInformationComponent;