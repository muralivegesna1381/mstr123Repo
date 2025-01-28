import React, { useEffect, useState } from 'react';
import * as Constant from "../../../utils/constants/constant";
import * as DataStorageLocal from '../../../utils/storage/dataStorageLocal';
import BuildEnv from './../../../config/environment/environmentConfig';
import InstructionsUI from './instructionsUI';
import * as firebaseHelper from '../../../utils/firebase/firebaseHelper';

const Environment = JSON.parse(BuildEnv.Environment());

const InstructionsPage = ({ navigation, route, ...props }) => {

  const [instructions, set_instructions] = useState(undefined);
  const [instructionType, set_instructionType] = useState(0);
  
  useEffect(() => {
    //setting instruction type based on screen instructions is triggered from
    // 1 is from camera related sceens and 2 is from scoring related screens
    firebaseHelper.reportScreen(firebaseHelper.screen_bfi_instrutions);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_bfi_instrutions, "User in instructions Screen", '');
    if (route.params?.instructionType) {
      set_instructionType(route.params?.instructionType)
    }
    getInstructionsData(route.params?.instructionType);
    //Android Physical back button action
    
  }, [route.params?.instructionType]);

  const navigateToPrevious = () => {
    navigation.pop();
  };

  //Getting instructions values from backend
  const getInstructionsData = async (instructionValue) => {
    //setting array based on instruction type recieved
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    let tempArray = [];
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ClientToken: token,
      },
    };
    fetch(Environment.uri + "petBfi/getPetBfiInstructions/" + instructionValue,
      options,)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.response.petBfiInstructions.length > 0) {
          for (let k = 0; k < data.response.petBfiInstructions.length; k++) {
            let tempObj = {
              instructionId: data.response.petBfiInstructions[k].instructionId,
              instruction: data.response.petBfiInstructions[k].instruction,
              instructionType: data.response.petBfiInstructions[k].instructionType,
              instructionOrder: data.response.petBfiInstructions[k].instructionOrder,
              photoUrl: data.response.petBfiInstructions[k].imageUrl,

            }
            tempArray.push(tempObj);
          }
          set_instructions(tempArray);
        }
        else{
          firebaseHelper.logEvent(firebaseHelper.event_instructions_api, firebaseHelper.screen_bfi_instrutions, "Instructions Service failed", 'Service error');
        }
      })
      .catch((error) => {
        //error block happens when there is something wring with the service
        firebaseHelper.logEvent(firebaseHelper.event_instructions_api, firebaseHelper.screen_bfi_instrutions, "Instructions Service failed", 'Service error : error');

      });
  };

  return (
    <InstructionsUI
      instructions={instructions}
      navigateToPrevious={navigateToPrevious}
    />
  );
}

export default InstructionsPage;