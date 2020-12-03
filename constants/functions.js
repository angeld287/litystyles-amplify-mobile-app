const sendNotifications = async (object) => {
    fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=AAAAd-I4wFI:APA91bGEnWMecuwzNUCeBUTde5HwEYP9eHEtXjhkHHgh7ivKX9yQnyQyxtaRcO5Ny_TLbyQFPoN5bYMEkUClfPr_ql8oDsK1OSw9yC0TCu7-Npjhn-871rJ-rfUW7JIti4EQwkkxu-3r'
        },
        body: JSON.stringify({
                to: object.to,
                priority: 'high',
                notification: {
                    title: object.title,
                    body: object.body,
                    subtitle: object.body,
                    sound: 'default',
                    android_channel_id: 'littystyles_notification_channel_id'
                },
                data: {
                    title: "Notification title",
                    message: "Notification message",
                    naviateto: object.naviateto,
                }
            })
    }).then(/* r => console.log('Notificacion Enviada: ', r) */).catch((e) => { // Error response
        console.log(e);
    });
}

export {
    sendNotifications
}