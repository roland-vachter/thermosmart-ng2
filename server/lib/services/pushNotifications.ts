import PushNotifications from '@pusher/push-notifications-server';

const pushNotifications = new PushNotifications({
	instanceId: process.env.PUSHER_INSTANCE_ID,
	secretKey: process.env.PUSHER_SECRET_KEY,
});

export const sendPushNotification = (interests: string[], title: string, body: string) => {
	pushNotifications
		.publishToInterests(interests, {
			fcm: {
				notification: {
					title,
					body
				},
			},
		})
	.then(publishResponse => {
		console.log('Pusher notification sent:', publishResponse.publishId);
	})
	.catch(error => {
		console.error('Pusher error:', error);
	});
}
