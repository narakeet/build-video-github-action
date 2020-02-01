'use strict';
const core = require('@actions/core'),
	apiRequest = require('minimal-request-promise'),
	POLLING_INTERVAL = 5000,
	safeParse = (content) => {
		try {
			return JSON.parse(content);
		} catch (e) {
			return false;
		}
	},
	startTask = async function (apiUrl, event) {
		console.log('submitting', event);
		try {
			const response = await apiRequest.post(apiUrl, {
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(event)
				}),
				result = safeParse(response.body);
			console.log('got task id', result.taskId);
			console.log('got status URL', result.statusUrl);
			return result;
		} catch (e) {
			if (e.body) {
				const actualError = safeParse(e.body);
				throw new Error((actualError && actualError.error) || e.body);
			}
			throw e;
		}
	},
	pause = function (howLong) {
		return new Promise(resolve => setTimeout(resolve, howLong));
	},
	pollForFinished = async function (statusUrl, interval) {
		try {
			const response = await apiRequest.get(statusUrl),
				result = safeParse(response.body);
			console.log(result);
			if (result && result.finished) {
				return result;
			} else {
				await pause(interval);
				return pollForFinished(statusUrl, interval);
			}
		} catch (e) {
			console.error('network request failed', e);
			await pause(interval);
			return pollForFinished(statusUrl, interval);
		}
	},
	run = async function () {
		const apiUrl = core.getInput('api-url'),
			event = {
				source: core.getInput('source-path'),
				repository: process.env['GITHUB_REPOSITORY'],
				token: core.getInput('github-token'),
				repositoryType: 'github',
				sha: process.env['GITHUB_SHA']
			},
			task = await startTask(apiUrl, event),
			taskResponse = await pollForFinished(task.statusUrl, POLLING_INTERVAL);

		if (!taskResponse.succeeded) {
			throw new Error(taskResponse.message || 'task failed');
		}
		core.setOutput('taskId', task.taskId);
		core.setOutput('videoUrl', taskResponse.result);
	};
run().catch(e => {
	console.error(e);
	core.setFailed(e.body || e.message || String(e));
});
