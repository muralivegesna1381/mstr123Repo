import {StyleSheet,Text,TouchableOpacity, View,FlatList} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';

const DropdownComponent = ({navigation, topBtnTitle, bottomBtnTitle, isDelete, bottomBtnEnable,dataArray,headerText,...props }) => {

    const actionOnOptiontype = (item) => {
        props.actionOnOptiontype(item);
    }

    return (

        <View style={[styles.mainComponentStyle]}>

            <View style={[CommonStyles.droDownViewStyle,{}]}>
                <View style = {[CommonStyles.dropDownFlatview,{height: hp("5%"),}]}>
                    <Text style={[CommonStyles.dropDownHeaderTextStyle]}>{headerText}</Text>
                </View>

                <FlatList
                    style={CommonStyles.dropDownFlatcontainer}
                    data={dataArray}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (

                    <TouchableOpacity onPress={() => actionOnOptiontype(item)}>
                        <View style={CommonStyles.dropDownFlatview}>
                            <Text style={[CommonStyles.dropDownTextStyle]}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>

                    )}
                    enableEmptySections={true}
                    keyExtractor={(item) => item.name}
                />
            </View>
            
        </View>
    );
};

export default DropdownComponent;

const styles = StyleSheet.create({

    mainComponentStyle : {
        width: wp('100%'),
        height: hp('100%'),
        justifyContent: "center",
        alignItems: "center",
    },

});