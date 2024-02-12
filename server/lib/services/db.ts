'use strict';

import { connect } from 'mongoose';

const options = {
	connectTimeoutMS: 30000,
	socketTimeoutMS: 30000
};

export default async function init() {
	await connect(process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGO_URL || '', options);
}
