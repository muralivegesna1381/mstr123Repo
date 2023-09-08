// @flow
//import { getBundleId } from '../../utils/device.info';

  //////GCP CLOUD RUN PROD URL ///////////
  export const PROD = {
    uri: "https://mobileservices.wearablesclinicaltrials.com/wearables_mobile_services/app/",
    deviceConnectUrl: "prd.wearablesclinicaltrials.com",
  };

  const bundleId = "PROD";
  
  export let env = "";
  if (bundleId === "PROD") {
    env = "PROD";
  } 
  
  const BaseJava = {
    EnvironmentJava: function() {
      if (env === "PROD") return JSON.stringify(PROD);
    },
  };
  
  export default BaseJava;
  
  