'use strict';

import config from 'config';
import * as mongoose from './mongoose';
import * as express from './express';

export function start(){
	const port = config.get('port');
	mongoose.connect((db) => {
		const app = express.init(db);
		app.listen(port);
		console.log("App listening on port " + port);	
	});
}

