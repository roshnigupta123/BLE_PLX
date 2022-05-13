import 'react-native-gesture-handler';
import React,{useState} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { BleManager } from 'react-native-ble-plx'
import {RootNavigator} from './src/navigation';
const _BleManager = new BleManager();

const App = () => {
const [devices, setDevices] = useState([]);
const [displayText, setDisplaText] = useState('hi')
const [connectedDevice, setConnectedDevice] = useState([]);
const [characteristics, getCharacteristics] = useState([]);

  const startScan = () => {
    console.log('scan')
    _BleManager.startDeviceScan(null, {
      allowDuplicates: false,
    },
      async (error, device) => {
        setDisplaText('Scanning...');
        if (error) {
          _BleManager.stopDeviceScan();
        }
        console.log(device);
        // if (device.localName == 'Test' || device.name == 'Test') {
        //   setDevices([...devices, device]);
        //   _BleManager.stopDeviceScan();
        // }

        if (device) {
          setDevices([...devices, device]);
          _BleManager.stopDeviceScan();
        }else{
          console.log('devices not avaliable')
        }
      });
  };
  
  
  const connectDevice = device => {
    _BleManager.stopDeviceScan();

    device
    .connect()
    .then((deviceData) => {
      _BleManager.onDeviceDisconnected(
        deviceData.id,
        (connectionError, connectionData) => {
          if (connectionError) {
            console.log(connectionError);
          }
          console.log('Device is disconnected');
          console.log(connectionData);
        },
      );
      return device.discoverAllServicesAndCharacteristics();
    })
     .catch((error) => {
      console.log('mm',error);
    })
    // .then(async (deviceObject) => {
    //   console.log('deviceObject');
    //   console.log(deviceObject);
    //   device.monitorCharacteristicForService(
    //     Enum.bleConnectionInfo.customServiceUUID,
    //     Enum.bleConnectionInfo.readCharacteristicUUID,
    //     (error, characteristic) => {
    //       if (error) {
    //         console.log('Error in monitorCharacteristicForService');
    //         console.log(error.message);
    //         return;
    //       }
    //       console.log(characteristic.uuid, characteristic.value);
    //     });
    //     },
    //   )
    // .catch((error) => {
    //   console.log('mm',error);
    // });



    _BleManager.connectToDevice(device.id).then(async device => {
      await device.discoverAllServicesAndCharacteristics();
      _BleManager.stopDeviceScan();
      setDisplaText(`Device connected\n with ${device.name}`);
      setConnectedDevice(device);
      setDevices([]);
      device.services().then(async service => {
        for (const ser of service) {
          ser.characteristics().then(characteristic => {
            getCharacteristics([...characteristics, characteristic]);
          });
        }
      })
      .catch((error) => {
        console.log('error===>', error);
      });
    })
    .catch((error) => {
      console.log('first error===>', error);
    });
    
  };
  
  const disconnectDevice = () => {
    connectedDevice.cancelConnection();
    console.log("disconnect devices")
  };

  const disconnect = async (id) => {
    console.log('clear', await _BleManager.cancelDeviceConnection(id))
    await _BleManager.cancelDeviceConnection(id);
};

  return (
    
    // <View style={styles.mainContainer}>
    //   {devices.length == 0 ? (
    //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //       <TouchableOpacity
    //         activeOpacity={0.6}
    //         onPress={startScan}
    //         style={styles.circleView}>
    //         <Text style={styles.boldTextStyle}>{displayText}</Text>
    //       </TouchableOpacity>
    //     </View>
    //   ) :
    //    Object.keys(connectedDevice).length != 0 ? (
    //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //       <Text style={{ marginBottom: 12, textAlign: 'center' }}>
    //         Tap button to disconnect device.
    //       </Text>
    //       <TouchableOpacity
    //         activeOpacity={0.6}
    //         onPress={disconnectDevice}
    //         style={styles.circleView}>
    //         <Text style={styles.boldTextStyle}>{displayText}</Text>
    //       </TouchableOpacity>
    //     </View>
    //   ) :
    //    (
    //     <FlatList
    //       style={{ flex: 1 }}
    //       data={devices}
    //       keyExtractor={item => item.id.toString()}
    //       renderItem={items => (
    //        <View>
    //         <TouchableOpacity
    //           activeOpacity={0.6}
    //           onPress={() => connectDevice(items.item)}
    //           style={{
    //             width: '100%',
    //             paddingVertical: 10,
    //             paddingHorizontal: 12,
    //             borderWidth: 1,
    //             borderRadius: 10,
    //           }}>
    //           <Text style={{ color: 'black', fontSize: 18 }}>
    //             {items.item.name}
    //           </Text>
    //         </TouchableOpacity>
    //        <TouchableOpacity
    //        activeOpacity={0.6}
    //        onPress={()=>disconnect(items.item.id)}
    //        style={styles.circleView}>
    //        <Text style={styles.boldTextStyle}>{'disconnect'}</Text>
    //      </TouchableOpacity>
    //         </View>
    //       )}
    //     />
    //   )}
    // </View>
    <RootNavigator />
  )
};

export default App;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 10,
  },
  circleView: {
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: 250,
    borderRadius: 150,
    borderWidth: 1,
  },
  boldTextStyle: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});