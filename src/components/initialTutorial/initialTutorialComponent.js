import React, { useState, useRef, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Dimensions,Platform} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import Carousel, {Pagination} from 'react-native-snap-carousel';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import VersionNumber, { appVersion } from 'react-native-version-number';
import * as apiRequest from './../../utils/getServicesData/apiServiceManager.js';
import * as apiMethodManager from './../../utils/getServicesData/apiMethodManger.js';
import LoaderComponent from './../../utils/commonComponents/loaderComponent';

import StarImg from "./../../../assets/images/tutorialImages/star.svg";
import Tutorial1Img from "./../../../assets/images/tutorialImages/tutorial1.svg";
import Tutorial2Img from "./../../../assets/images/tutorialImages/tutorial2.svg";
import Tutorial3Img from "./../../../assets/images/tutorialImages/tutorial3.svg";

const { height, width } = Dimensions.get('window');
let trace_inInitialTutorialScreen;

const  InitialTutorialComponent = ({navigation,route, ...props }) => {

    const data = [
        // {key: 1, imagePath: Tutorial1Img, tittle:"Know What Your Pet is Up to", message:"See how active your pet is by tracking the time and distance for moderate to high-intensity activities like running, walking, fetching etc."},
        {key: 2, imagePath: Tutorial2Img, tittle:"Activity Goals", message:"Give your pets a healthy life by customising goals for their activities."},
        {key: 2, imagePath: Tutorial3Img, tittle:"Activity Goals", message:"Monitor your pet's weight, record your pet's observations and participate in campaigns."}
    ];

    const [activeSlide, setActiveSlide] = useState(0);
	const carouselRef = useRef(null);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);

    useEffect(() => {
        removeAuthentication();
        firebaseHelper.reportScreen(firebaseHelper.screen_appInitial_tutorial);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_appInitial_tutorial, "User in App Initial Tutorial Screen", '');
        initialSessionStart();
        return () => {
          initialSessionStop();
        };
    }, []);

    const removeAuthentication = () => {

        const rnBiometrics = new ReactNativeBiometrics();
        rnBiometrics.deleteKeys().then((resultObject) => {
            const { keysDeleted } = resultObject
        });

    };

    const initialSessionStart = async () => {
        trace_inInitialTutorialScreen = await perf().startTrace('t_inInitialTutorialScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inInitialTutorialScreen.stop();
    };
    // Navigates to Welcome screen
    const nxtButtonAction = async () => {
        removeAuthentication();
        firebaseHelper.logEvent(firebaseHelper.event_next_success, firebaseHelper.screen_appInitial_tutorial, "User clicked Skip button ", '');
        await DataStorageLocal.saveDataToAsync(Constant.IS_USER_SKIPPED,JSON.stringify(true));
        set_isLoading(true);
        set_loaderMsg('Please Wait...');
        let appStatus = await getAppUpdateStatus(); 
        navigation.navigate('LoginComponent',{"isAuthEnabled" : false, appStatus : appStatus}); 
        // navigation.navigate('WelcomeComponent');
    };

    const getAppUpdateStatus = async () => {

        let deviceAppVersion = VersionNumber.buildVersion;
        let osValue = Platform.OS === 'ios' ? 1 : 2;
    
        let apiMethod = apiMethodManager.APP_UPDATE_STATUS + osValue + '/' + deviceAppVersion;
        let apiService = await apiRequest.getData(apiMethod,'',Constant.SERVICE_JAVA,navigation);
        set_isLoading(false);
        if(apiService && apiService.data && apiService.data !== null && Object.keys(apiService.data).length !== 0) {
          return apiService.data;
        }  else if(apiService && apiService.error !== null && Object.keys(apiService.error).length !== 0) {
          return undefined;  
        } else {
          return undefined;
        }
    
    };

    // Render Image and Text in flatlist
    const _renderItem = ({item, index}) => {
	 
        return (

            <View style={styles.containerStyle}>

                <Text style={styles.headerTextStyle}>{item.tittle}</Text> 
                <Text style={styles.textStyle}>{item.message}</Text> 
                <item.imagePath style={styles.petImageStyle}/>
                
            </View>
        );

    };

    // Pagination button actions
    const getPagination = () => (

		<Pagination
			dotsLength={data.length}
            activeDotIndex={activeSlide}
            containerStyle={styles.paginationContainerStyle}
			dotElement={ <CarouselPaginationBar carouselRef={carouselRef} />}
			inactiveDotElement={ <CarouselPaginationBar width={width / 9} carouselRef={carouselRef} inactive/>}
		/>
	);

    const CarouselPaginationBar = props => {

        return (

          <TouchableOpacity style={styles.starBgStyle}  onPress={() => {carouselRef.current.snapToItem(props.index);}}>
            <View backgroundColor={ props.inactive ? '#242A37' : '#37B57C'} style={styles.starBgStyle}>             
              <StarImg style={{width: wp('3%'),height: wp('3%'),}}/>        
            </View>
          </TouchableOpacity>

        );
      };

    return (
        <View style={[styles.mainComponentStyle]}>

            <Carousel
				ref={carouselRef}
				data={data}
				renderItem={_renderItem}
				sliderWidth={wp('100%')}
				sliderHeight={hp('75%')}
				itemWidth={width}
                currentIndex = {activeSlide}
				activeSlideAlignment={'start'}
				onSnapToItem={index => setActiveSlide(index)}
			/>

            <View style={styles.buttonsContainer}>
      
                <TouchableOpacity style={styles.buttonStyle} onPress={() => {nxtButtonAction()}}>
                    <Text style={styles.skipButtonStyle}>Skip</Text>
                </TouchableOpacity>

                {getPagination()}

            </View>
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {loaderMsg} isButtonEnable = {false} /> : null} 
        </View>
    );
  }
  
  export default InitialTutorialComponent;

  const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'          
    },

    headerTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontLarge,
        color:'#1E1E1E',
        textAlign: 'left',
        width:wp('70%'),
        marginTop: hp('2%'),
        alignSelf: 'flex-start'
    },

    textStyle : {
        ...CommonStyles.textStyleLight,
        fontSize: fonts.fontNormal,
        color:'#1E1E1E',
        textAlign: 'left',
        width:wp('70%'),
        marginTop: hp('1%'),
        marginBottom: wp('10%'),
        alignSelf: 'flex-start'
    },

    containerStyle: {
        width:wp('80%'),
        height:hp('72%'),
        alignItems: 'center',
        justifyContent:'center',
        alignSelf:'center'
    },

    buttonsContainer: {
        flexDirection: 'row',
        width: wp('100%'),
        height: hp('8%'),
        alignItems: 'center', 
        justifyContent:'center',
        justifyContent: 'space-between',
        marginBottom: wp('10%'),
    },

    buttonStyle: {
        marginLeft: wp('9%'), 
    },
       
    skipButtonStyle: {
        ...CommonStyles.textStyleBold,
        color:'#1E1E1E',
        fontSize: fonts.fontLarge,
    },

    starBgStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp('6%'),
        height: wp('6%'),
        marginHorizontal: 4,
        borderRadius: wp('5%'),
    },

    paginationContainerStyle: { 
      alignSelf: 'flex-end',
      marginRight: wp('2%'),
      alignSelf: 'center',
    },

  });