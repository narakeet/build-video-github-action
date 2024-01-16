'use strict';
const core = require('@actions/core'),
	axios = require('axios'),
	AxiosRestApi = require('./axios-rest-api'),
	restApi = new AxiosRestApi(axios),
	RequestProcessor = require('./request-processor'),
	requestProcessor = new RequestProcessor(restApi);

requestProcessor.run({
	apiUrl: core.getInput('api-url'),
	apiKey: core.getInput('api-key'),
	source: core.getInput('source-path'),
	repository: process.env['GITHUB_REPOSITORY'],
	token: core.getInput('github-token'),
	sha: process.env['GITHUB_SHA'],
	resultFile: core.getInput('result-file')
}).then(result => {
	Object.keys(result).forEach((key) => core.setOutput(key, result[key]));
}).catch(e => {
	console.error(e);
	if (typeof e === 'string') {
		core.setFailed(e);
	} else {
		core.setFailed(JSON.stringify(e));
	}
});
