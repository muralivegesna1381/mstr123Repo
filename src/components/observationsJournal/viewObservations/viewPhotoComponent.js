import React, {useState,useEffect} from 'react';
import {StyleSheet,View} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import Video from 'react-native-video';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../../utils/constants/constant";

const ViewPhotoComponent = ({navigation, route, ...props }) => {

    const [mediaURL, set_mediaURL] = useState('');
    const [images, set_images] = useState([]);
    const [isLoading, set_isLoading] = useState(true);
    const [fromScreen, set_fromScreen] = useState('');

    useEffect(() => {

        if(route.params?.mediaURL && route.params?.mediaType){
            if(route.params?.mediaType==='video'){

                set_mediaURL(route.params?.mediaURL);

            } else {
                let img = {uri : route.params?.mediaURL}
                set_images([img]);
            }
            
        }

        if(route.params?.fromScreen){
            set_fromScreen(route.params?.fromScreen);
        }

    }, [route.params?.mediaURL,route.params?.mediaType,route.params?.photoURL, route.params?.fromScreen]);

    const backBtnAction = () => {

        // if(fromScreen === 'questionnaire') {
        //     navigation.navigate('QuestionnaireQuestionsService');
        // } else {
        //     navigation.navigate('ViewObservationService');
        // }

        navigation.pop()
        
    };

    const onLoadAction = () => {
        set_isLoading(false)
    }

return (

        <View style={styles.mainComponentStyle}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Video'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{flex:1}}>
                <View style = {styles.videoViewStyle}>
                    {mediaURL ? <Video
                        source={{uri:mediaURL}}
                        rate={1.0}
                        volume={1.0}
                        muted={false}
                        resizeMode={'contain'}
                        // repeat = {isLoading}
                        style={styles.videoStyle}
                        controls={true}
                        fullscreen={true}
                        fullscreenOrientation = {'landscape'}
                        onLoad = {() => onLoadAction()}
                        // onLoadStart = {set_isLoading(false)}
                        // poster={photoURL}

                    /> : null}
                </View>
                
            </View>
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 
        </View>

    );
};

export default ViewPhotoComponent;

const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white',
    },

    videoViewStyle : {
        width:wp('100%'),
        height:hp('65%'),
        justifyContent:'center',
        alignItems:'center',
    },

    videoStyle : {
        width:wp('100%'),
        minHeight:hp('30%'),       
    },

});