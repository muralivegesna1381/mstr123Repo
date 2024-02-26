// @flow
//import { getBundleId } from '../../utils/device.info';

// ///////Migrated Service////////
export const GCPUAT = {
  uri: 'https://wms-uat3-ygue7fpaba-uc.a.run.app/wearables_mobile_services/app/',
  deviceConnectUrl: "tst.wearablesclinicaltrials.com",
  bfiImageClassfication: 'https://orientation-classifier.uat.wearablesclinicaltrials.com/image_classification',
  isHPN1Bcon: true,
};

const bundleId = "GCPUAT";

export let env = "";

if (bundleId === "GCPUAT") {
  env = "GCPUAT";
}

const Base = {
  Environment: function () {
    if (env === "GCPUAT") return JSON.stringify(GCPUAT);
  },
};

export default Base;
