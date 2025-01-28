import {View,TouchableOpacity,Text,Image,ScrollView,Linking} from 'react-native';
import DashBoardStyles from './../dashBoardStyles';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';

import HPN1FirstImg from "./../../../../assets/images/otherImages/svg/hpn1First.svg";

const  DashboardFTUserUI = ({ firstName, secondName, route, ...props}) => {

    // DashBoard page Styles
    const {
        firstTimeUserStyle,
        ftTopViewStyle,
        ftdownViewStyle,
        ftHeaderHeader1,
        ftHeaderHeader2,
        ftHeaderHeader3,
        ftHeaderHeader4,
        ftytLnksHeaderHeader,
        ytLinkViewStyle,
        youTubeThumbs,
    } = DashBoardStyles;

    return (
                    
        <ScrollView showsVerticalScrollIndicator={false}>

            <View style={firstTimeUserStyle}>

                <View style={ftTopViewStyle}>
                    <Text style={ftHeaderHeader1}>{'Welcome'}</Text>
                    <Text style={ftHeaderHeader2}>{firstName ? firstName : ''}</Text>
                    <Text style={ftHeaderHeader3}>{secondName ? secondName : ''}</Text>
                    <Text style={[ftHeaderHeader4]}>{'In order to get the most benefit from this app, we recommend onboarding your pet. Please watch the below videos to learn how to onboard your pet'}</Text>
                </View>

                <View style={ftdownViewStyle}>

                    <TouchableOpacity onPress={() => Linking.openURL('https://youtube.com/shorts/E8WP3Gt2Uek?feature=share')}>
                        <View style={ytLinkViewStyle}>
                                
                            <Image source={require("./../../../../assets/images/otherImages/png/fUserMultiplePets.png")} style={youTubeThumbs}/>
                            <Text style={[ftytLnksHeaderHeader]}>{'How to Set Up Multiple Pets'}</Text>

                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => Linking.openURL('https://youtu.be/zg9aCENCOt4')}>
                        <View style={ytLinkViewStyle}>
                            
                            <HPN1FirstImg width={wp('25%')} height={hp('9%')} style={youTubeThumbs}/>
                            <Text style={[ftytLnksHeaderHeader]}>{'How to Charge the Sensor'}</Text>

                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => Linking.openURL('https://youtu.be/ykwPApENJMw')}>
                        <View style={ytLinkViewStyle}>
                            
                            <HPN1FirstImg width={wp('25%')} height={hp('9%')} style={youTubeThumbs}/>
                            <Text style={[ftytLnksHeaderHeader]}>{'How to Setup the Sensor'}</Text>

                        </View>
                    </TouchableOpacity>

                </View>

            </View>

        </ScrollView>

    );
}
  
  export default DashboardFTUserUI;