'use strict';
const core = require('@actions/core'),
	fs = require('fs');

try {
	const githubToken = core.getInput('github-token'),
		sourcePath = core.getInput('source-path');
	console.log('sourcePath', sourcePath);
	console.log('repository', process.env['GITHUB_SHA']);
	console.log('event', fs.readFileSync(process.env['GITHUB_EVENT_PATH'], 'utf8'));
	console.log('githubToken', githubToken.length);
} catch (error) {
	core.setFailed(error.message);
}
