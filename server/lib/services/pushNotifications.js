const PushNotifications = require('@pusher/push-notifications-server');

let pushNotifications = new PushNotifications({
	instanceId: process.env.PUSHER_INSTANCE_ID,
	secretKey: process.env.PUSHER_SECRET_KEY,
});

exports.send = (interests, title, body) => {
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
