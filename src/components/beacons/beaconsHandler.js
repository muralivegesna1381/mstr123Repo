import React, { useState, useEffect } from "react";
import { NativeEventEmitter,NativeModules,AppState,Dimensions,Platform,PermissionsAndroid,Alert,} from "react-native";
import BleManager from "react-native-ble-manager";
import { BluetoothStatus } from "react-native-bluetooth-status";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import * as Constant from "./../../utils/constants/constant";

var Buffer = require("buffer/").Buffer;

const window = Dimensions.get("window");

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const delayTime = 500;

var beaconsArray = [];

class BeaconsHandler {
  static beaconsSharedInstance = null;

  static getInstanceforBeacons() {

    if (this.beaconsSharedInstance === null) {
      this.beaconsSharedInstance = new BeaconsHandler();
    }

    return this.beaconsSharedInstance;
  }

  constructor() {

    /**
     *  Binding sensor listner methods
     */

    this.handleDiscoverPeripheralBeacon = this.handleDiscoverPeripheralBeacon.bind(this);
    this.handleStopScanBeacons = this.handleStopScanBeacons.bind(this);
    this.handleUpdateValueForCharacteristicBeacons = this.handleUpdateValueForCharacteristicBeacons.bind(this);
    this.handleDisconnectedPeripheralBeacons = this.handleDisconnectedPeripheralBeacons.bind(this);
    // this.handleAppStateChangeBeacons = AppState.addEventListener("change",this.handleAppStateChangeBeacons);
    this.beaconPeripheralId = "";
    this.scanningSuccess = false;
    this.beaconCancelConnectTimer = null;
    this.beaconSensorCallBack = null;
    this.callBack = null;
    this.beaconReturnConnectTimer = null;

    this.addBeaconBleListners();
  }

  /**
   *  Addiing Sensor event listners
   *  Requesting Sensor releated permissions
   *  Enable Sensor releated settings
   *  Checking sensor setting status in IOS
   */
  addBeaconBleListners = () => {
    BleManager.start({ showAlert: true }).then(() => {
    });

    // this.handleAppStateBeacon = AppState.addEventListener(
    //   "change",
    //   this.handleAppStateChangeBeacons
    // );
    this.handlerDiscoverBeacon = bleManagerEmitter.addListener("BleManagerDiscoverPeripheral",this.handleDiscoverPeripheralBeacon);

    this.handlerDisconnectBeacons = bleManagerEmitter.addListener("BleManagerDisconnectPeripheral",this.handleDisconnectedPeripheralBeacons);
    this.handlerUpdateBeacons = bleManagerEmitter.addListener("BleManagerDidUpdateValueForCharacteristic",this.handleUpdateValueForCharacteristicBeacons);

  };

  /**
   *  removing listeners from memory
   */
  removeBeaconsBleListners = () => {

    if (this.beaconsSharedInstance != null) {
      this.handlerDiscoverBeacon.remove();
      this.beaconsSharedInstance = null;
    }

  };

  showAlertWithMessage = (tittle, message) => {
    Alert.alert(
      tittle,
      message,
      [
        {
          text: "OK",
          onPress: () => {
          },
        },
      ],
      { cancelable: false }
    );
  };

  // handleAppStateChangeBeacons = (nextAppState) => {
  // };

  handleDiscoverPeripheralBeacon(peripheral) {
    if (peripheral.advertising.localName==='RBDot') {
      this.checkForServerDevice(peripheral);
    }
  }

  /**
   * This method is called after bluetooth scanning is completed
   */
  handleStopScanBeacons() {
    
    if (this.scanningSuccess === true) {
      //this.connectToSensor();
      
    } else {
      this.beaconSensorCallBack({ error: "unable to connect" });
    }
  }

  /**
   * This method gets called when sensor device is disconnected
   */
  handleDisconnectedPeripheralBeacons(data) {
  }

  handleUpdateValueForCharacteristicBeacons(data) {
  }

  /**
   *  start scanning bluetooth devices
   */
  startScanBeacons = (callback) => {
    this.scanningSuccess = false;
    this.beaconSensorCallBack = callback;

    if (this.beaconPeripheralId !== "") {
      BleManager.isPeripheralConnected(this.beaconPeripheralId, []).then(
        (isConnected) => {

          if (isConnected) {
            callback({ data: { status: 200, beaconPeripheralId: this.beaconPeripheralId },});
          } else {
            BleManager.scan([], 60, true, { numberOfMatches: 1 });
          }
        }
      );
    } else {
      BleManager.scan([], 60, true, { numberOfMatches: 1 });
    }
  };

  setPeripharalId = (pId) => {
    this.beaconPeripheralId = pId;
  };

  getConnectedPeripheralDevices = () => {
    BleManager.getConnectedPeripherals([]).then((results) => {

      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
      }
    });
  };

  /**
   *  checks for alloted device from scanned devices
   */
  checkForServerDevice(peripheral) {

    if(peripheral.advertising.serviceUUIDs){

        if(peripheral.advertising.serviceUUIDs[0] === 'F0CEC428-2EBB-47AB-A753-0CE09E9FE64B' || peripheral.advertising.serviceUUIDs[0] === 'f0cec428-2ebb-47ab-a753-0ce09e9fe64b'|| peripheral.advertising.localName === 'RBDot'){
          this.setPeripharalId(peripheral.id);
          beaconsArray.push(peripheral.id);
          this.scanningSuccess = true;
              
          setTimeout(() => {
            BleManager.stopScan().then(() => {

              if(beaconsArray.length>0){
                const uniqueNames = Array.from(new Set(beaconsArray));
                this.beaconSensorCallBack({ data: uniqueNames});
              }

            });
          }, 500);
        }
    }

  }

  /**
   *  Tries to establish connection with sensor device
   *
   */
  connectToBeacon = async (beaconPeripheralId,callback) => {
    this.beaconPeripheralId=beaconPeripheralId;
    this.beaconSensorCallBack = callback;

    if (Platform.OS === "ios") {
      this.beaconCancelConnectTimer = setTimeout(this.cancelConnectionBeacon, 50000);
    }
    
    BleManager.connect(this.beaconPeripheralId).then(() => {
        if (Platform.OS === "ios") {
          clearTimeout(this.beaconCancelConnectTimer);
        }
        this.beaconSensorCallBack({
          data: { status: 200, beaconPeripheralId: this.beaconPeripheralId },
        });
      })
      .catch((error) => {
        this.beaconSensorCallBack({ error: "unable to connect" });
      });
  };

  cancelConnectionBeacon = () => {
    
    if(this.beaconPeripheralId){

      BleManager.disconnect(this.beaconPeripheralId);
    }

    clearTimeout(this.beaconCancelConnectTimer);
  };

  disconnectAllBeacons = (beaconId) => {

    BleManager.disconnect(beaconId);
  }

  readDataFromBeacon = async (serviceId, characterId,uuid,beaconType) => {
    
    let data = {status: 202, sensorData: '', id:uuid, beaconType:beaconType};

    let isConnected = await BleManager.isPeripheralConnected(uuid, []);
        if(isConnected === true){
          data = await this.readDataB(serviceId, characterId, uuid,beaconType);
        }else {
          if (Platform.OS === "ios") {
            this.beaconCancelConnectTimer = setTimeout(
              this.cancelConnectionBeacon,
              5000
            );
          }

          try {
             this.beaconReturnConnectTimer = setTimeout(
                data = { status: 205, sensorData: '', id:uuid, beaconType:beaconType},
                50000
              );
              clearTimeout(this.beaconReturnConnectTimer);
            await BleManager.connect(uuid);

            if (Platform.OS === "ios") {
              clearTimeout(this.beaconCancelConnectTimer);
              this.beaconCancelConnectTimer=null;
              
            }
             data = await this.readDataB(serviceId, characterId,uuid, beaconType);

        } catch {
          if (Platform.OS === "ios") {
            clearTimeout(this.beaconCancelConnectTimer);
            this.beaconCancelConnectTimer=null;
          }
           data = { status: 201, sensorData: '', id:uuid, beaconType:beaconType};            
            return data; 
        }

        }

        return data;
  };

  readDataB = async (serviceId, characterId,uuid,beaconType) => {

    let pheripheralInfo = await BleManager.retrieveServices(uuid);
    let characterStics = await BleManager.read(uuid, serviceId, characterId);
    let data = { status: 200, sensorData: characterStics, id:uuid, beaconType:beaconType};
    return data;

  };

  writeDataToBeacon= (serviceId, characterId, bName, uuid,callback) => {
    this.callBack = callback;
    setTimeout(() => {
      BleManager.isPeripheralConnected(uuid, [])
        .then((isConnected) => {
          if (isConnected === true) {
            this.writeDataBeacon(serviceId, characterId, bName, uuid,this.callBack);
          } else {
            if (Platform.OS === "ios") {
              this.beaconCancelConnectTimer = setTimeout(
                this.cancelConnectionBeacon,
                50000
              );
            }
            //
            BleManager.connect(uuid)
              .then(() => {
                if (Platform.OS === "ios") {
                  clearTimeout(this.beaconCancelConnectTimer);
                }
                this.writeDataBeacon(serviceId, characterId, bName, uuid,this.callBack);
                //this.beaconSensorCallBack({data:{status:200}})
              })
              .catch((error) => {
                this.callBack({ error: "unable to connect" });
              });
          }
        })
        .catch((error) => {
          this.callBack({ error: "isPeripheralConnected error" });
        });
    }, 1500);
  };

  /**
   *  Retrieve sensor services before write data
   *  Write data to Sensor device
   */
  writeDataBeacon = (serviceId, characterId, bName, uuid,callback) => {
    this.callBack = callback;
    setTimeout(() => {
      BleManager.retrieveServices(uuid)
        .then(async (peripheralInfo) => {
          //const command =  [1];
          setTimeout(() => {

            BleManager.write(
              uuid,
              serviceId,
              characterId,
              bName,             
              100000
            )
              .then((characteristic) => {
                this.callBack({ data: { status: 200, character:characteristic } });
              })
              .catch((error) => {
                this.callBack({ data: { status: 200, error:error } });
              });
          }, 1500);
        })
        .catch((error) => {
          this.callBack({ error: "unable to connect" });
        });
    }, 1500);
  };

  clearBeaconTImeoutAfterWrite = (pID) => {
    BleManager.disconnect(pID);
  }

  clearBeaconArray = () => {

    beaconsArray=[];
  }

  removeBleListners = () => {
    this.handlerDiscoverBeacon.remove();
    // this.handlerStop.remove();
    this.handlerDisconnectBeacons.remove();
    this.handlerUpdateBeacons.remove();
    if (this.beaconsSharedInstance != null) {
      this.beaconsSharedInstance = null;
    }
  };

}

export default BeaconsHandler;
