import {View} from 'react-native';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';

const  PrivacyUi = ({route, ...props }) => {

  const backBtnAction = () => {
    props.navigateToPrevious();
  };

  return (
    <View style={[CommonStyles.mainComponentStyle]}>
      <View style={[CommonStyles.headerView,{}]}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isChatEnable={false}
          isTImerEnable={false}
          isTitleHeaderEnable={true}
          title={'Privacy'}
          backBtnAction = {() => backBtnAction()}
        />
      </View>

    </View>
  );
}
  
  export default PrivacyUi;