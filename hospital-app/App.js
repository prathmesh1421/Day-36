import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

//  Notification Handler (REQUIRED)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {

  useEffect(() => {
    registerForPush();
  }, []);

  const registerForPush = async () => {
    if (Device.isDevice) {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        alert("Notification permission denied");
        return;
      }
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
