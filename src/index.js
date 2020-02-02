'use strict';
const core = require('@actions/core'),
	axios = require('axios'),
	AxiosRestApi = require('./axios-rest-api'),
	restApi = new AxiosRestApi(axios),
	RequestProcessor = require('./request-processor'),
	requestProcessor = new RequestProcessor(restApi);

requestProcessor.run({
	apiUrl: core.getInput('api-url'),
	apiKey: core.getInput('videopuppet-api-key'),
	source: core.getInput('source-path'),
	repository: process.env['GITHUB_REPOSITORY'],
	token: core.getInput('github-token'),
	sha: process.env['GITHUB_SHA'],
	resultFile: core.getInput('result-file')
}).then(result => {
	core.setOutput('video-url', result.videoUrl);
	core.setOutput('video-file', result.videoFile);
}).catch(e => {
	console.error(e);
	core.setFailed(String(e));
});
