const sendNotifications = async (object) => {
    fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=AAAAGXkaVm0:APA91bE9f2Sjustn6ToI8DDgel6uR_J5QS-_abyZ84F1EnVlvH7vpfQ5t2eWHgiwb3WH8Aea8tHIel4BOWs2gpQ0eNuA0dATvSUjkFNLqCMGmJapAjd0hgAgJscq4O90W0PG-1-fO50o'
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