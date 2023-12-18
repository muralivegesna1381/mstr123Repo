import AsyncStorage from "@react-native-community/async-storage";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Image, PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import fonts from '../../../utils/commonStyles/fonts';

const CameraComponent = ({ navigation, route, ...props }) => {
    const camera = useRef(null);
    const [cameraFlip, set_CameraFlip] = useState('back');
    const [cameraFlash, set_CameraFlash] = useState('off');
    const [cameraHDR, set_CameraHDR] = useState(false);
    const [cameraZoom, set_cameraZoom] = useState(false);
    const [cameraNightMode, set_cameraNightMode] = useState(false);

    const devices = useCameraDevices()
    const device = devices[cameraFlip];

    const supportsCameraFlipping = useMemo(() => devices.back != null && devices.front != null, [devices.back, devices.front]);
    const supportsFlash = device?.hasFlash ?? false;

    const [frameImgArray, set_frameImgArray] = useState([
        require('../../../../assets/images/bfiGuide/png/dog_frame_front.png'),
        require('../../../../assets/images/bfiGuide/png/dog_frame_back.png'),
        require('../../../../assets/images/bfiGuide/png/dog_frame_top.png'),
        require('../../../../assets/images/bfiGuide/png/dog_frame_side_left.png'),
        require('../../../../assets/images/bfiGuide/png/dog_frame_side_right.png'),
        require('../../../../assets/images/bfiGuide/png/dog_frame_fullbody.png')
    ]);

    const onFlipCameraPressed = useCallback(() => {
        set_CameraFlip((p) => (p === 'back' ? 'front' : 'back'));
    }, []);

    const onFlashPressed = useCallback(() => {
        set_CameraFlash((f) => (f === 'off' ? 'on' : 'off'));
    }, []);

    const capturePhoto = async () => {
        if (camera.current !== null) {
            //Get Path from camera
            const photo = await camera.current.takePhoto({});
            const photoPath = 'file://' + photo.path
            AsyncStorage.setItem("CAMERA_PATH", photoPath);
            navigation.navigate('PetImageCaptureComponent', {
                indexPos: route.params?.indexPos,
                imagePath: photoPath
            })
        }
    };

    const requestAndroidCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Camera Permission",
                    message: "App needs access to your camera",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            } else {
            }
        } catch (err) {
            console.warn(err);
        }
    };

    // Android Physical back button action
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    }, []);

    useEffect(() => {
        if (Platform.OS === 'android') {
            requestAndroidCameraPermission();
        }
    }, []);

    const rightButtonAction = async () => {
        capturePhoto()
    };

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const backBtnAction = () => {
        navigation.pop()
    };

    if (device == null) { return <Text>Loading</Text> }
    else {
        return (

            <View style={styles.container}>

                <Camera
                    ref={camera}
                    style={StyleSheet.absoluteFill}
                    isActive={true}
                    photo={true}
                    orientation="portrait"
                    device={device}
                    torch={cameraFlash}
                    enableZoomGesture={true}
                    hdr={cameraHDR}
                    lowLightBoost={cameraNightMode}
                />
                <View style={styles.captionFrame}>
                    <Image style={styles.imageStyleFrame} source={frameImgArray[route.params?.indexPos]} />
                </View>

                <View style={styles.caption}>
                    <View style={[styles.cameraComponent]}>
                        {supportsCameraFlipping && (
                            <TouchableOpacity onPress={() => { onFlipCameraPressed() }}>
                                <Image style={styles.imageStyle} source={require('./../../../../assets/images/bfiGuide/png/ic_camera.png')} />
                            </TouchableOpacity>)}

                        {supportsFlash && (
                            <TouchableOpacity onPress={() => { onFlashPressed() }}>
                                <Image style={styles.imageStyle} source={require('./../../../../assets/images/bfiGuide/png/flash.png')} />
                            </TouchableOpacity>)}

                        <TouchableOpacity onPress={() => { set_CameraHDR((h) => !h) }}>
                            <Image style={styles.imageStyle} source={require('./../../../../assets/images/bfiGuide/png/hdr.png')} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { set_cameraZoom(!cameraZoom) }}>
                            <Image style={styles.imageStyle} source={require('./../../../../assets/images/bfiGuide/png/hands.png')} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { set_cameraNightMode(!cameraNightMode) }}>
                            <Image style={styles.imageStyle} source={require('./../../../../assets/images/bfiGuide/png/night_mode.png')} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerText}>Please place your pet in camera frame</Text>
                    <TouchableOpacity onPress={() => { rightButtonAction() }}>
                        <Image style={styles.imageCameraDoneStyle} source={require('./../../../../assets/images/bfiGuide/png/camera_done.png')} />
                    </TouchableOpacity>
                </View>
            </View>

        )
    }
};

export default CameraComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#000',
        //paddingVertical: 50,
    },

    caption: {
        width: wp('100%'),
        height: hp('15%'),
        position: 'absolute', //Here is the trick
        bottom: hp('1%'), //Here is the trick
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp('2%')
    },
    headerText: {
        color: '#ffffff',
        fontSize: fonts.fontMedium,
        fontFamily: 'Barlow-SemiBold',
    },

    camera: {
        height: hp('90%'),
        width: wp('90%'),
        alignSelf: 'center',
        marginVertical: hp('10%'),
    },

    captionFrame: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp('7%')
    },

    imageStyleFrame: {
        width: wp('90%'),
        height: hp('75%'),
        resizeMode: 'contain',
        marginHorizontal: wp('10%'),
    },

    textStyle: {
        textAlign: 'center',
        fontSize: 16,
        marginVertical: 10,
    },

    cameraComponent: {
        flexDirection: "row"
    },

    mainComponentStyle: {
        marginVertical: hp('2%'),
        flexDirection: "row"
    },
    rightButtonstyleEnable: {
        backgroundColor: "#1f53b8",
        flex: 1,
        height: hp("7%"),
        borderRadius: wp("1%"),
        justifyContent: "center",
        alignItems: 'center',
        // borderWidth:0.5,
        marginHorizontal: wp('2%'),
    },

    rightButtonstyleDisable: {
        backgroundColor: "grey",
        flex: 1,
        height: hp("7%"),
        borderRadius: hp("0.5%"),
        justifyContent: "center",
        alignItems: 'center',
        borderColor: 'black',
        borderWidth: 1.0,
        marginHorizontal: wp('2%'),
    },

    leftButtonstyle: {
        backgroundColor: "#6b778e",
        flex: 1,
        height: hp("7%"),
        borderRadius: hp("0.5%"),
        justifyContent: "center",
        alignItems: 'center',
        borderColor: 'black',
        borderWidth: 1.0,
        marginHorizontal: wp('2%'),
    },

    rightBtnTextStyle: {
        color: 'white',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleBold,
    },

    leftBtnTextStyle: {
        color: 'white',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleBold,
    },

    imageStyle: {
        width: wp('6%'),
        height: hp('6%'),
        resizeMode: 'contain',
        marginHorizontal: wp('3%')
    },

    imageCameraDoneStyle: {
        width: wp('16%'),
        height: hp('16%'),
        resizeMode: 'contain',
        bottom: hp('2%'),
        marginHorizontal: wp('3%'),
    },

});