'use strict';
require('dotenv').config();
const axios = require('axios'),
	AxiosRestApi = require('../src/axios-rest-api'),
	restApi = new AxiosRestApi(axios),
	RequestProcessor = require('../src/request-processor'),
	requestProcessor = new RequestProcessor(restApi),
	params = {
		apiUrl: process.env['API_URL'],
		apiKey: process.env['API_KEY'],
		source: process.env['SOURCE_PATH'],
		repository: process.env['GITHUB_REPOSITORY'],
		token: process.env['GITHUB_TOKEN'],
		sha: process.env['GITHUB_SHA'],
		resultFile: process.env['RESULT_FILE']
	};

console.log('params', params);
requestProcessor.run(params).then(result => {
	console.log(result);
}).catch(e => {
	console.error(e);
});
