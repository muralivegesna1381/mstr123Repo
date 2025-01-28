// @flow
//import { getBundleId } from '../../utils/device.info';

// ///////Migrated Service////////
export const GCPUAT = {
  uri: 'https://wms-uat-725323713092.us-central1.run.app/wearables_mobile_services/app/',
  deviceConnectUrl: "tst.wearablesclinicaltrials.com",
  bfiImageClassfication: 'https://orientation-classifier.uat.wearablesclinicaltrials.com/image_classification',
  isHPN1Bcon: true,
};
// New Device connect url for Testing rudp.dev.ctepl.com
export const GCPQA = {
  uri: 'https://wms-qa-725323713092.us-central1.run.app/wearables_mobile_services/app/',
  deviceConnectUrl: "tst.wearablesclinicaltrials.com",
  bfiImageClassfication: 'https://orientation-classifier.uat.wearablesclinicaltrials.com/image_classification',
  isHPN1Bcon: true,
};

export const GCPDEV = {
  uri: 'https://wms-develop-725323713092.us-central1.run.app/wearables_mobile_services/app/',
  deviceConnectUrl: "tst.wearablesclinicaltrials.com",
  bfiImageClassfication: 'https://orientation-classifier.uat.wearablesclinicaltrials.com/image_classification',
  isHPN1Bcon: true,
};

const bundleId = "GCPUAT";
// const bundleId = "GCPQA";
// const bundleId = "GCPDEV";

export let env = "";

if (bundleId === "GCPUAT") {
  env = "GCPUAT";
} else if (bundleId === "GCPQA") {
  env = "GCPQA";
} else if (bundleId === "GCPDEV") {
  env = "GCPDEV";
}

const Base = {
  Environment: function () {
    if (env === "GCPUAT") return JSON.stringify(GCPUAT);
    else if (env === "GCPQA") return JSON.stringify(GCPQA);
    else if (env === "GCPDEV") return JSON.stringify(GCPDEV);
  },
};

export default Base;
