// @flow
//import { getBundleId } from '../../utils/device.info';

export const PROD = {
  uri: "https://mobileservices.wearablesclinicaltrials.com/wearables_mobile_services/app/",
  deviceConnectUrl: "prd.wearablesclinicaltrials.com",
  isHPN1Bcon: false,
};

//////////GCP DEV /////////////
export const GCPDEV = {
  uri: "https://wms-bfi-urgent-req-dev-ygue7fpaba-uc.a.run.app/wearables_mobile_services/app/",
  deviceConnectUrl: "tst.wearablesclinicaltrials.com", //"prd.jetpatch.net",
  isHPN1Bcon: true,
};

//////GCP QA ///////////
export const GCPQA = {
  uri: "https://wms-bfi-urgent-req-qa-ygue7fpaba-uc.a.run.app/wearables_mobile_services/app/",
  deviceConnectUrl: "tst.wearablesclinicaltrials.com",//"prd.jetpatch.net",//lab.wearablesclinicaltrials.com
  isHPN1Bcon: true,
};

// ///////Migrated Service////////
export const GCPCLOUDUAT = {
  uri: 'https://wms-bfi-urgent-req-uat-ygue7fpaba-uc.a.run.app/wearables_mobile_services/app/',
  deviceConnectUrl: "tst.wearablesclinicaltrials.com",
  isHPN1Bcon: true,
};

// const bundleId = 'PROD';
// const bundleId = 'GCPDEV';
// const bundleId = "GCPQA";
const bundleId = "GCPCLOUDUAT";

export let env = "";
if (bundleId === "PROD") {
  env = "PROD";
} else if (bundleId === "GCPDEV") {
  env = "GCPDEV";
} else if (bundleId === "GCPQA") {
  env = "GCPQA";
} else if (bundleId === "GCPCLOUDUAT") {
  env = "GCPCLOUDUAT";
}

const Base = {
  Environment: function () {
    if (env === "PROD") return JSON.stringify(PROD);
    else if (env === "GCPDEV") return JSON.stringify(GCPDEV);
    else if (env === "GCPQA") return JSON.stringify(GCPQA);
    else if (env === "GCPCLOUDUAT") return JSON.stringify(GCPCLOUDUAT);
  },
};

export default Base;