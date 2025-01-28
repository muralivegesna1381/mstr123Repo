import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import AlertComponent from '../../utils/commonComponents/alertComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import TextInputComponent from '../../utils/commonComponents/textInputComponent';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import * as Constant from "../../utils/constants/constant";
import LoaderComponent from '../../utils/commonComponents/loaderComponent';

const UpdateSecondaryEmailUI = ({ route, ...props }) => {

    const [email, set_email] = useState(undefined);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popAlert, set_popAlert] = useState(undefined);
    const [btnEnable, set_btnEnable] = useState(undefined);
    const [isNotification, set_isNotification] = useState(false);
    const [isEmailValid, set_isEmailValid] = useState(false);
    const [enableRemoveBtn, set_enableRemoveBtn] = useState(false);

    let isNotiEnable = useRef(false);

    // Setting the Existing valuse from component class
    useEffect(() => {

        if(props.secondaryEmail) {
            setTimeout(() => {  
                set_isEmailValid(true);
            }, 500)
        }
        setEmail(props.secondaryEmail);
        setNotificationDefault(props.isNotification);
        set_enableRemoveBtn(props.enableRemoveBtn);

    }, [props.secondaryEmail,props.isNotification,props.enableRemoveBtn]);

    // Updates the Popup alert values
    useEffect(() => {
        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popAlert(props.popAlert);
    }, [props.popUpMessage, props.isPopUp, props.popAlert, props.isLoading]);

    // Navigation to previous screen
    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    // Initiates the service call to update the User name
    const rightButtonAction = async () => {
        //props.UpdateAction(email,isNotiEnable.current);
        props.UpdateAction(email,true);
    };

    // Popup btn actions
    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    // Enabling the submit button and setting first name
    const setEmail = (value) => {

        set_email(value);
        const emailValid = /\S+@\S+\.\S+/;
        if (value.length > 0 && (emailValid.test(value.replace(/ /g, ''))) && props.secondaryEmail !== value) {
            set_btnEnable(true);
            set_enableRemoveBtn(false);
        } else {
            set_btnEnable(false); 
            
            if(value.length > 0 && (emailValid.test(value.replace(/ /g, '')))) {
                set_enableRemoveBtn(true);  
            } else {
                set_enableRemoveBtn(false);  
            }
                   
        }

        if (value.length > 0 && (emailValid.test(value.replace(/ /g, '')))) {
            set_isEmailValid(true);           
        } else {
            set_isEmailValid(false);           
        }

    };

    const setNotificationDefault = (value) => {
        setTimeout(() => {  
            set_isNotification(value);
            isNotiEnable.current = value;
        }, 500)
    };

    const changeIsNotification = () => {
        isNotiEnable.current = !isNotiEnable.current;
        set_isNotification(!isNotification);
    };

    const removeButtonAction = () => {
        props.removeButtonAction();
    };

    const popUpLeftBtnAction = () => {
        props.popUpLeftBtnAction()
    };

    return (

        <View style={[styles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView, {}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Update Secondary Email'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <KeyboardAwareScrollView>

                <View style={{ alignItems: 'center', justifyContent: 'center', height: hp('70%') }} >

                    <View style={{ marginBottom: hp('2%'), }}>
                        <TextInputComponent
                            inputText={email}
                            labelText={'Secondary Email'}
                            isEditable={true}
                            maxLengthVal={50}
                            autoCapitalize={'none'}
                            setValue={(textAnswer) => {
                                setEmail(textAnswer);
                            }}
                        />
                    </View>

                    {btnEnable ? <View style={{width: wp('80%') }}>
                        <Text style={styles.hintTextStyleEnable }>{'Notifications will now be sent to the updated email, including your primary email.'}</Text>
                    </View> : (isEmailValid ? <View style={{width: wp('80%') }}>
                        <Text style={styles.hintTextStyleEnable }>{'Notifications are enabled to this email including your primary email.'}</Text>
                    </View> : null)}

                </View>

            </KeyboardAwareScrollView>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'SUBMIT'}
                    leftBtnTitle={'REMOVE'}
                    rigthBtnState={btnEnable}
                    isLeftBtnEnable={enableRemoveBtn ? true : false}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => rightButtonAction()}
                    leftButtonAction={async () => removeButtonAction()}
                ></BottomComponent>
            </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={props.popAlert}
                    message={props.popUpMessage}
                    isLeftBtnEnable={props.isPopLeft}
                    isRightBtnEnable={true}
                    leftBtnTilte={'NO'}
                    rightBtnTilte={props.popRightBtnTitle}
                    popUpRightBtnAction={() => popOkBtnAction()}
                    popUpLeftBtnAction={() => popUpLeftBtnAction()}
                />
            </View> : null}

            {props.isLoading === true ? <LoaderComponent isLoader={true} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

        </View>
    );
}

export default UpdateSecondaryEmailUI;

const styles = StyleSheet.create({

    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white'
    },

});