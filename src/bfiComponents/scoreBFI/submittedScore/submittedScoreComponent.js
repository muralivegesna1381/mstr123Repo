import React, { useEffect, useRef, useState } from 'react';
import SubmittedScoreUI from './submittedScoreUI';
import moment from 'moment';
import * as firebaseHelper from '../../../utils/firebase/firebaseHelper';

import BFI20Img from "./../../../../assets/images/bfiGuide/svg/ic_bfi_bg_20.svg";
import BFI30Img from "./../../../../assets/images/bfiGuide/svg/ic_bfi_bg_30.svg";
import BFI40Img from "./../../../../assets/images/bfiGuide/svg/ic_bfi_bg_40.svg";
import BFI50Img from "./../../../../assets/images/bfiGuide/svg/ic_bfi_bg_50.svg";
import BFI60Img from "./../../../../assets/images/bfiGuide/svg/ic_bfi_bg_60.svg";
import BFI70Img from "./../../../../assets/images/bfiGuide/svg/ic_bfi_bg_70.svg";
import BFIOtherImg from "./../../../../assets/images/bfiGuide/svg/ic_bfi_bg_other.svg";

const SubmittedScoreComponent = ({ navigation, route, ...props }) => {

  const [instructions, set_instructions] = useState(undefined);
  const [data, setData] = useState([]);

  var dataMain = useRef([]);
  var isEditTrue = useRef(false);
  var petName = useRef([]);
  var scoreImg = useRef([]);
  let localDeviceDate = moment(new Date(new Date())).utcOffset("+00:00").format("YYYY-MM-DD")

  useEffect(() => {

    if (route.params?.imagesArray) {
      firebaseHelper.reportScreen(firebaseHelper.screen_submitted_scores);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_submitted_scores, "User in Submitted scores Screen", '');
      dataMain.current = route.params?.imagesArray
      setData(route.params?.imagesArray)
      getInstructionsData();
    }

    if (route.params?.petName) {
      petName.current = route.params?.petName
    }
  }, [route.params?.imagesArray, route.params?.petName]);

  const infoBtnAction = () => {
    navigation.navigate("InstructionsPage", {
      instructionType: 2,
    });
  };


  const navigateToScorePage = (item, index) => {
    navigation.navigate("BFIScoreMain", { bfiInfoData: [dataMain.current[index]], petName: petName.current, isEditable: true, from: 'setImages' });
  };

  const navigateToPrevious = () => {
    navigation.pop();
  };

 

  //Getting instructions values from backend
  const getInstructionsData = async (instructionValue) => {
    //setting array based on instruction type recieved
    let tempArray = [];
    for (let k = 0; k < dataMain.current.length; k++) {

      if (dataMain.current[k].bfiScore) {
        switch (dataMain.current[k].bfiScore) {

          case "20":
            scoreImg.current = BFI20Img;
            break;
          case "30":
            scoreImg.current = BFI30Img;
            break;
          case "40":
            scoreImg.current = BFI40Img;
            break;
          case "50":
            scoreImg.current = BFI50Img;
            break;
          case "60":
            scoreImg.current = BFI60Img;
            break;
          case "70":
            scoreImg.current = BFI70Img;
            break;
          default:
            scoreImg.current = BFIOtherImg;
            break;
        }
        if (dataMain.current[k].submittedOn) {
          const tempArr = dataMain.current[k].submittedOn.split('T')
          if (localDeviceDate == tempArr[0])
            isEditTrue.current = true;
          else
            isEditTrue.current = false;

          let tempObj = {
            scoreDate: tempArr[0],
            scoreTime: tempArr[1],
            scoreValue: dataMain.current[k].bfiScore,
            editScore: isEditTrue.current,
            scoreImg: scoreImg.current,
          }
          tempArray.push(tempObj);
        }

      }

    }
    set_instructions(tempArray);
  };


  return (
    <SubmittedScoreUI
      instructions={instructions}
      petName={petName.current}
      navigateToPrevious={navigateToPrevious}
      infoBtnAction={infoBtnAction}
      navigateToScorePage={navigateToScorePage}
    />
  );
}

export default SubmittedScoreComponent;