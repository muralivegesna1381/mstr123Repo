import { useNavigation } from "@react-navigation/native";
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ImageView from "react-native-image-viewing";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import CommonStyles from "../../utils/commonStyles/commonStyles";
import * as Constant from "../../utils/constants/constant";
import fonts from './../../utils/commonStyles/fonts';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

import DefaultDogImg from "../../../assets/images/otherImages/png/defaultDogIcon_dog.png";
import ObsVideoImg from "../../../assets/images/otherImages/svg/observationVideoLogo.svg";

let trace_inMediaDetailsScreen;

const MediaDetailPageScreen = ({ route, ...props }) => {
    const navigation = useNavigation();
    const [mediaObject, set_mediaObject] = useState(undefined);
    const [petName, setPetName] = useState(undefined);
    const [behvText, set_behvText] = useState(undefined);
    const [observationDate, set_observationDate] = useState(undefined);
    const [submittedDate, set_submittedDate] = useState(undefined);
    const [dateLabelName, set_dateLableName] = useState(undefined);
    const [isImageView, set_isImageView] = useState(false);
    const [images, set_images] = useState([]);
    const [mediaArray, set_mediaArray] = useState([]);
    const [date, set_Date] = useState(new Date());

    useEffect(() => {
    
        const focus = navigation.addListener("focus", () => {
          set_Date(new Date());
          mediaScreenStart();
          firebaseHelper.reportScreen(firebaseHelper.screen_media_details_screen);
          firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_media_details_screen, "User in Media Details Screen", ''); 
        });
        
        const unsubscribe = navigation.addListener('blur', () => {
          mediaScreenStop();
        });
    
        return () => {
          focus();
          unsubscribe();
        };
    
      }, []);

    useEffect(() => {
        if (route.params?.mediaData) {
            set_mediaObject(route.params?.mediaData)
            prepareObservation(route.params?.mediaData)
        }

    }, [route.params?.mediaData]);

    const mediaScreenStart = async () => {
        trace_inMediaDetailsScreen = await perf().startTrace('t_inMediaDetailsScreen');
      };
    
      const mediaScreenStop = async () => {
        await trace_inMediaDetailsScreen.stop();
      };

    const backBtnAction = () => {
        navigation.pop()
    };

    const viewAction = (item) => {
        if (item.type === 'image') {
            if (item.filePath !== '') {
                let img = { uri: item.filePath };
                set_images([img]);
                set_isImageView(true);
            }
        } else {
            if (item.videoUrl !== '') {
                navigation.navigate('ViewPhotoComponent', { mediaURL: item.videoUrl, mediaType: item.type });
            }
        }

    };

    const prepareObservation = (obsObject) => {
        if (obsObject) {
            set_mediaObject(obsObject);
            let tempArray = [];
            if (obsObject.photos && obsObject.photos.length > 0) {
                for (let i = 0; i < obsObject.photos.length; i++) {
                    if (obsObject.photos[i].filePath !== '') {
                        let pObj = {
                            fileName: obsObject.photos[i].fileName,
                            filePath: obsObject.photos[i].filePath,
                            isDeleted: obsObject.photos[i].isDeleted,
                            observationPhotoId: obsObject.photos[i].observationPhotoId,
                            type: 'image'
                        }
                        tempArray.push(pObj);
                    }
                }
            }
            if (obsObject.petBfiImages && obsObject.petBfiImages.length > 0) {
                for (let i = 0; i < obsObject.petBfiImages.length; i++) {
                    if (obsObject.petBfiImages[i].imageUrl !== '') {
                        let pObj = {
                            fileName: obsObject.petBfiImages[i].imageName,
                            filePath: obsObject.petBfiImages[i].imageUrl,
                            isDeleted: '',
                            observationPhotoId: obsObject.petBfiImages[i].imagePositionId,
                            type: 'image'
                        }
                        tempArray.push(pObj);
                    }
                }
            }

            if (obsObject.videos && obsObject.videos.length > 0) {
                for (let i = 0; i < obsObject.videos.length; i++) {
                    let pObj = {
                        videoName: obsObject.videos[i].videoName,
                        videoUrl: obsObject.videos[i].videoUrl,
                        isDeleted: obsObject.videos[i].isDeleted,
                        observationVideoId: obsObject.videos[i].observationVideoId,
                        type: 'video',
                        videoStartDate: obsObject.videos[i].videoStartDate,
                        videoEndDate: obsObject.videos[i].videoEndDate,
                        videoThumbnailUrl: obsObject.videos[i].videoThumbnailUrl
                    }
                    tempArray.push(pObj);
                }
            }

            set_mediaArray(tempArray);

            const formattedDate = obsObject.modifiedDate
                ? moment(moment.utc(obsObject.modifiedDate).toDate()).local().format('MM-DD-YYYY')
                : obsObject.petBfiImgCapturedOn
                    ? moment(moment.utc(obsObject.petBfiImgCapturedOn)).local().format('MM-DD-YYYY')
                    : 'N/A';


            const submittedDate = obsObject.observationDateTime
                ? moment(moment.utc(obsObject.observationDateTime).toDate()).local().format('MM-DD-YYYY')
                : '';


            set_dateLableName(obsObject.modifiedDate ? 'Modified Date' : 'Submitted Date')

            set_submittedDate(formattedDate)
            set_observationDate(submittedDate)

            setPetName(obsObject.petName)

            set_behvText(obsObject.behaviorName)
        }
    }

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
            <View style={[CommonStyles.headerView, {}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'View Media'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={styles.middleViewStyle}>
                <View style={[styles.dataViewStyle, { height: hp('12%'), }]}>
                    <View style={styles.viewStyle}>
                        <TextInput
                            style={styles.textInputStyle}
                            multiline={true}
                            underlineColorAndroid="transparent"
                            value={petName}
                            editable={false}
                        />
                    </View>
                </View>

                {observationDate && observationDate.length > 1 ?
                    <View style={styles.dataViewStyle}>
                        <View style={styles.viewStyle}>
                            <Text style={styles.labelTextStyles}>{'Selected Date'}</Text>
                            <Text style={styles.selectedDataTextStyles}>{observationDate}</Text>
                        </View>
                    </View> : undefined}

                <View style={styles.dataViewStyle}>
                    <View style={styles.viewStyle}>
                        <Text style={styles.labelTextStyles}>{dateLabelName}</Text>
                        <Text style={styles.selectedDataTextStyles}>{submittedDate}</Text>
                    </View>
                </View>

                {behvText && behvText.length > 1 ?
                    <View style={[styles.dataViewStyle, { minHeight: hp('11%'), flexDirection: 'row' }]}>
                        <View style={[styles.viewStyle, {}]}>
                            <Text style={styles.labelTextStyles}>{'Behavior'}</Text>
                            <Text style={[styles.selectedDataTextStyles, { flex: 3 }]}>{behvText}</Text>
                        </View>
                    </View> : null}

                {mediaArray && mediaArray.length > 0 ? <View style={styles.videoUIStyle}>
                    <View style={{ height: hp('35%') }}>
                        <FlatList
                            style={styles.flatcontainer}
                            data={mediaArray}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                            renderItem={({ item, index }) => (
                                <TouchableOpacity onPress={() => viewAction(item)}>
                                    <View style={styles.flatview}>
                                        <Text style={[styles.name]}>{item.type === 'image' ? item.fileName : item.videoName}</Text>

                                        {item.type === 'image' ?
                                            <ImageBackground source={{ uri: item.filePath }} style={styles.media} imageStyle={{ borderRadius: 5 }}></ImageBackground> :
                                            (item.videoUrl && item.videoUrl !== '' ? (item.videoThumbnailUrl && item.videoThumbnailUrl !== '' ?
                                                <ImageBackground source={{ uri: item.videoThumbnailUrl }} style={styles.media} imageStyle={{ borderRadius: 5 }}>
                                                    {item.type === 'video' ? <ObsVideoImg style={[styles.videoLogoStyle]} /> : null}

                                                </ImageBackground> : <ImageBackground source={DefaultDogImg} style={styles.media} imageStyle={{ borderRadius: 5 }}>
                                                    {item.type === 'video' ? <ObsVideoImg style={[styles.videoLogoStyle, {}]} /> : null}

                                                </ImageBackground>) : null)}
                                    </View>
                                </TouchableOpacity>
                            )}
                            enableEmptySections={true}
                            keyExtractor={(item, index) => index}
                        />
                    </View>

                </View> : null}

            </View>

            {isImageView ? <ImageView style={styles.videoViewStyle}
                images={images}
                imageIndex={0}
                visible={isImageView}
                onRequestClose={() => set_isImageView(false)}
            /> : null}

            {props.isLoading === true ? <LoaderComponent isLoader={true} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

        </View>
    );
}

export default MediaDetailPageScreen;

const styles = StyleSheet.create({

    middleViewStyle: {
        flex: 1,
        alignItems: 'center',
    },

    dataViewStyle: {
        height: hp('6%'),
        width: wp('80%'),
        marginTop: hp("2%"),
        borderRadius: 5,
        borderColor: '#EAEAEA',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    labelTextStyles: {
        ...CommonStyles.textStyleMedium,
        fontSize: fonts.fontMedium,
        color: 'black',
        flex: 1,
        alignSelf: 'center'
    },

    selectedDataTextStyles: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        color: 'black',
        flex: 1,
        marginTop: hp("1%"),
        marginBottom: hp("1%"),
        textAlign: 'right'
    },

    textInputStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        flex: 1,
        width: wp('60%'),
        color: "black",
    },

    viewStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: wp('70%'),
        minHeight: hp('8%'),
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },

    videoUIStyle: {
        minHeight: hp('10%'),
        width: wp('80%'),
        borderColor: '#D5D5D5',
        borderWidth: 2,
        borderRadius: 5,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp("2%"),
    },

    flatcontainer: {
        width: wp("80%"),
    },

    flatview: {
        minHeight: hp("8%"),
        alignSelf: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width: wp('70%'),
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    media: {
        width: wp('10%'),
        aspectRatio: 1,
        resizeMode: 'contain',
        alignItems: 'center',
        justifyContent: 'center',
    },

    videoLogoStyle: {
        width: wp("4%"),
        height: hp("3%"),
        resizeMode: "contain",
        overflow: "hidden",
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
        width: wp('50%'),
        marginTop: hp("1%"),
        marginBottom: hp("1%"),
    },

});