'use strict';
const core = require('@actions/core'),
	apiRequest = require('minimal-request-promise'),
	run = async function () {
		const apiUrl = core.getInput('api-url'),
			event = JSON.stringify({
				source: core.getInput('source-path'),
				repository: process.env['GITHUB_REPOSITORY'],
				token: core.getInput('github-token'),
				repositoryType: 'github',
				sha: process.env['GITHUB_SHA']
			}),
			response = await apiRequest.post(apiUrl, {
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(event)
			});
		console.log('got result', response.body);
	};
run()
	.catch(e => {
		console.error(e);
		core.setFailed(e.message || e);
	});
