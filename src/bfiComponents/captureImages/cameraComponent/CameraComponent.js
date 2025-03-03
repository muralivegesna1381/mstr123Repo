import AsyncStorage from "@react-native-community/async-storage";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Image, PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import fonts from '../../../utils/commonStyles/fonts';
import ImagePicker from 'react-native-image-crop-picker';

const CameraComponent = ({ navigation, route, ...props }) => {
    const camera = useRef(null);
    const [cameraFlip, set_CameraFlip] = useState('back');
    const [cameraFlash, set_CameraFlash] = useState('off');
    const [cameraHDR, set_CameraHDR] = useState(false);
    const [cameraZoom, set_cameraZoom] = useState(false);
    const [cameraZoomValue, set_cameraZoomValue] = useState(1);
    const [cameraNightMode, set_cameraNightMode] = useState(false);
    const [fullBodyFlip, set_fullBodyFlip] = useState(false);

    const device = useCameraDevice('back')
    // const supportsCameraFlipping = useMemo(() => devices.back != null && devices.front != null, [devices.back, devices.front]);
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
            // navigation.navigate('PetImageCaptureComponent', {
            //     indexPos: route.params?.indexPos,
            //     imagePath: photoPath,
            //     imageCroppedPath: photoPath
            // })

            ImagePicker.openCropper({
                path: 'file://' + photo.path,
                // width: 400,
                // height: 500,
                compressImageQuality: 1,
            }).then(image => {
                navigation.navigate('PetImageCaptureComponent', {
                    indexPos: route.params?.indexPos,
                    imagePath: photoPath,
                    imageCroppedPath: image.path
                })

            }).catch((error) => {
                // navigation.pop()
                navigation.navigate('PetImageCaptureComponent', {
                    indexPos: route.params?.indexPos,
                    imagePath: photo.path,
                    imageCroppedPath: photo.path
                })
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

    const updateZoomValue = (flag) => {
        if (flag) set_cameraZoomValue(cameraZoomValue + 0.25)
        else set_cameraZoomValue(cameraZoomValue - 0.25)
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
                    enableZoomGesture={false}
                    hdr={cameraHDR}
                    zoom={cameraZoomValue}
                    lowLightBoost={cameraNightMode}
                />

                <View style={styles.captionFrame}>
                    <View style={{ flexDirection: 'row', width: wp('95%'), height: hp('5%') }}>
                        {route.params?.indexPos === 5 ? <View style={{ alignItems: 'flex-start' }}>
                            <TouchableOpacity onPress={() => { set_fullBodyFlip(!fullBodyFlip) }}>
                                <Image style={styles.imageCloseStyle} source={require('./../../../../assets/images/bfiGuide/png/ic_flip.png')} />
                            </TouchableOpacity>
                        </View> : null}
                        <View style={{ alignItems: 'flex-end', flex: 1 }}>
                            <TouchableOpacity onPress={() => { navigation.pop() }}>
                                <Image style={styles.imageCloseStyle} source={require('./../../../../assets/images/otherImages/png/xImg.png')} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Image style={styles.imageStyleFrame} source={fullBodyFlip ? require('./../../../../assets/images/bfiGuide/png/dog_frame_fullbody2.png') : frameImgArray[route.params?.indexPos]} />
                </View>

                <View style={styles.caption}>
                    <View style={[styles.cameraComponent]}>
                        {/* {supportsCameraFlipping && (
                            <TouchableOpacity onPress={() => { onFlipCameraPressed() }}>
                                <Image style={styles.imageStyle} source={require('./../../../../assets/images/bfiGuide/svg/ic_camera.svg')} />
                            </TouchableOpacity>)} */}

                        {cameraFlip === 'back' && supportsFlash ?
                            <TouchableOpacity onPress={() => { onFlashPressed() }}>
                                <Image style={styles.imageStyle} source={cameraFlash === "on" ? require('./../../../../assets/images/bfiGuide/svg/flash.svg') : require('./../../../../assets/images/bfiGuide/svg/flash_off.svg')} />
                            </TouchableOpacity> : null}

                        <TouchableOpacity onPress={() => { set_CameraHDR((h) => !h) }}>
                            <Image style={styles.imageStyle} source={cameraHDR ? require('./../../../../assets/images/bfiGuide/svg/hdr.svg') : require('./../../../../assets/images/bfiGuide/svg/hdr_off.svg')} />
                        </TouchableOpacity>

                        {cameraZoomValue < 6 ? <TouchableOpacity onPress={() => { updateZoomValue(true) }}>
                            <Image style={styles.imageStyle} source={require('./../../../../assets/images/bfiGuide/png/zoom_plus.png')} />
                        </TouchableOpacity> : null}

                        {cameraZoomValue > 1 ? <TouchableOpacity onPress={() => { updateZoomValue(false) }}>
                            <Image style={styles.imageStyle} source={require('./../../../../assets/images/bfiGuide/png/zoom_minus.png')} />
                        </TouchableOpacity> : null}

                        <TouchableOpacity onPress={() => { set_cameraNightMode(!cameraNightMode) }}>
                            <Image style={styles.imageStyle} source={cameraNightMode ? require('./../../../../assets/images/bfiGuide/svg/moon.svg') : require('./../../../../assets/images/bfiGuide/svg/moon_off.svg')} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerText}>Please place your pet in camera frame</Text>
                    <TouchableOpacity onPress={() => { rightButtonAction() }}>
                        <Image style={styles.imageCameraDoneStyle} source={require('./../../../../assets/images/bfiGuide/png/camera_done.png')} />
                    </TouchableOpacity>
                </View>
            </View >

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
        bottom: hp('0.2%'), //Here is the trick
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp('2%'),
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
        height: hp('70%'),
        resizeMode: 'contain',
        marginTop: hp('-3%')
    },

    textStyle: {
        textAlign: 'center',
        fontSize: 16,
        marginVertical: 10,
    },

    cameraComponent: {
        flexDirection: "row",
        marginBottom: hp('0.5%')
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
        aspectRatio: 1,
        height: hp('3.5%'),
        resizeMode: 'contain',
        marginHorizontal: wp('3.5%'),
        tintColor: 'white'
    },

    imageCloseStyle: {
        aspectRatio: 1,
        height: hp('4%'),
        resizeMode: 'contain', paddingHorizontal: wp("7%"),
        tintColor: '#FFFFFF'
    },

    imageCameraDoneStyle: {
        width: wp('16%'),
        height: hp('16%'),
        resizeMode: 'contain',
        bottom: hp('2%'),
        marginHorizontal: wp('3%'),
    },

});