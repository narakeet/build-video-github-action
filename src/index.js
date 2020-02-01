'use strict';
const core = require('@actions/core'),
	apiRequest = require('minimal-request-promise'),
	run = async function () {
		try {
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
		} catch (error) {
			console.error(error);
			core.setFailed(error.message || error);
		}
	};
run();
