import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { BleManager } from 'react-native-ble-plx'

const BluetoothTest = () => {
  const [isBtConnected, setBtConnected] = useState(false)

  const [device, setDevice] = useState()

  const [isConnected, setIsConnected] = useState(false)

  var manager = new BleManager()

  useEffect(() => {
    const subscription = manager.onStateChange(
      state =>
        state === 'PoweredOn'
          ? scanAndConnect() &
            // subscription.remove() &
            console.log('Bluetooth on') &
            setBtConnected(true)
          : console.log('Bluetooth Off') & setBtConnected(false),
      true
    )
   
    return () => manager.destroy()
  }, [])

  const scanAndConnect = () => {
    manager.startDeviceScan(null, null, (error, device) => {
      console.log('startDeviceScan')
      // Handle error (scanning will be stopped automatically)
      if (error) {
        console.log(error)
      } else if (device) {
        // Check if it is a device you are looking for
        if (device) {
          console.log({device})
          // Stop scanning as it's not necessary if you are scanning for one device.
          manager.stopDeviceScan()

          // Connect
          device
            .connect()
            .then(() => {
              // Log connection
              device
                .isConnected()
                .then(bool =>
                  console.log(' Device Connected', bool, device.name)
                )

              manager
                .isDeviceConnected(device.id)
                .then(bool =>
                  console.log(' Manager Connected', bool, device.name)
                )

              return device.discoverAllServicesAndCharacteristics()
            })
            .then(() => {
              setDevice(device)
              setIsConnected(true)
              console.log('Device Connected')
            })
            .catch((e)=>{
             console.log('e',e)
            })
            .catch((e)=>{
              console.log('e',e)
             })
          // const sub = device.onDisconnected((error, device) => {
          //   console.log('disconnected')
          //   setIsConnected(false)
          //   setDevice(null)
          //   sub.remove()
          // })
        }
      }
    })
  }

  return (
    <View>
      {isConnected
        ? <TouchableOpacity
            onPress={() => {
              device
                .cancelConnection()
                .then(cancelled => console.log(cancelled))
                .catch(error => console.log(error))

              // Another way of disconnecting, not working neither
              // manager
              //   .cancelDeviceConnection(device.id)
              //   .then(cancelled => console.log(cancelled))
              //   .catch(error => console.log(error))

              setIsConnected(false)
            }}
          >
            <Text>Disconnect</Text>
          </TouchableOpacity>
        : <TouchableOpacity
            onPress={() => 
              // scanAndConnect()
              {
              device.connect().then(device => {
                console.log({device})
                setDevice(device)})
              .catch((e)=>{console.log(e)})

              setIsConnected(true)
            }
          }
          >
            <Text>Connect</Text>
          </TouchableOpacity>}
    </View>
  )
}

export default BluetoothTest