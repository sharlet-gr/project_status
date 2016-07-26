import config from 'config';
import mongoose from 'mongoose';

export function connect(cb){
	const db = mongoose.connect(config.db.uri, config.db.options,  (err) => {
		if(err)
			console.log(err);
		if(cb) cb(db);
	});
}