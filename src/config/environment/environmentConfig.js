// @flow
//import { getBundleId } from '../../utils/device.info';

export const PROD = {
    uri: "https://mobileservices.wearablesclinicaltrials.com/wearables_mobile_services/app/",
    deviceConnectUrl: "prd.wearablesclinicaltrials.com",
    isHPN1Bcon: false,
};

  const bundleId = 'PROD';
  
  export let env = "";
  if (bundleId === "PROD") {
    env = "PROD";
  } 
  
  const Base = {
    Environment: function() {
      if (env === "PROD") return JSON.stringify(PROD);
    },
  };
  
  export default Base;
  
  