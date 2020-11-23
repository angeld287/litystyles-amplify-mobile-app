import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { Platform } from "react-native";
import PushNotification from "react-native-push-notification";

class NotificationManager {
    configure = (onRegister, onNotification, onOpenNotification) => {
      PushNotification.configure({
        onRegister: function (token) {
          console.log("[NotificationManager] onRegister token: ", token);
          onRegister(token)
        },
      
        onNotification: function (notification) {
            console.log("[NotificationManager] onRegister token: ", notification);

            if (Platform.OS === "ios") {
                if (notification.data.openedInForeground) {
                    notification.userInteraction = true
                }
            }else{
                notification.userInteraction = true
            }

            if (notification.userInteraction) {
                onOpenNotification(notification);
            } else {
                onNotification(notification);
            }

            if (Platform.OS === "ios") {
                if (notification.data.openedInForeground) {
                    notification.finish("backgroundFetchResultNoData");
                }
            }else{
                notification.finish("backgroundFetchResultNoData");
            }
        },
      });
    }
  
    _buildAndroidNotification = (id, title, message, data = {} , options = {} ) => {
      return {
        id: id,
        autoCancel: true,
        largeIcon: options.largeIcon || "ic_launcher",
        smallIcon: options.smallIcon || "ic_launcher",
        bigText: message || '',
        subText: title || '',
        vibrate: options.vibrate || false,
        vibration: options.vibration || 300,
        priority:  options.vibration || "high",
        importance:  options.importance || "high",
        data: data,
      }
    }
  
    _buildIOSNotification = (id, title, message, data = {} , options = {} ) => {
      return {
        alertAction: options.alertAction || "View",
        category: options.category || "",
        userInfo: {
          id: id,
          item: data,
        }
      }
    }
  
    showNotification = (id, title, message, data = {} , options = {} ) => {
      PushNotification.localNotification({ 
          ...this._buildAndroidNotification(id, title, message, data, options),
          ...this._buildIOSNotification(id, title, message, data, options),
          title: title, 
          message: message, 
          vibrate: true,
          vibration: 300,
          data: 'data',
      });
    }
  
    cancelAllLocalNotification = () => {
      if (Platform.OS === "ios") {
        PushNotificationIOS.removeAllDeliveredNotifications();
      } else {
        PushNotification.cancelAllLocalNotifications();
      }
    }
  
    unregister = () => {
      PushNotification.unregister();
    }
  }

  export const notificationManager = new NotificationManager();