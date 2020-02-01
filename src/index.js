'use strict';
const core = require('@actions/core'),
	axios = require('axios'),
	fs = require('fs'),
	path = require('path'),
	url = require('url'),
	apiRequest = require('minimal-request-promise'),
	POLLING_INTERVAL = 5000,
	safeParse = (content) => {
		try {
			return JSON.parse(content);
		} catch (e) {
			return false;
		}
	},
	startTask = async function (apiUrl, apiKey, event) {
		try {
			const response = await apiRequest.post(apiUrl, {
					headers: {
						'Content-Type': 'application/json',
						'x-api-key': apiKey
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
			await pause(interval);
			const response = await apiRequest.get(statusUrl),
				result = safeParse(response.body);
			console.log(result);
			if (result && result.finished) {
				return result;
			} else {
				return pollForFinished(statusUrl, interval);
			}
		} catch (e) {
			console.error('network request failed', e);
			return pollForFinished(statusUrl, interval);
		}
	},
	downloadToFile = async function (fileUrl, filePath) {
		console.log('downloading from', fileUrl, 'to', filePath);
		const writer = fs.createWriteStream(filePath),
			response = await axios({
				method: 'get',
				url: fileUrl,
				responseType: 'stream'
			});
		response.data.pipe(writer);
		return new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
	},
	saveResults = async function (task, taskResponse) {
		const videoUrl = taskResponse.result,
			remoteName = path.basename(url.parse(videoUrl).pathname),
			filename = core.getInput('result-file') || remoteName;
		core.setOutput('video-url', taskResponse.result);
		core.setOutput('video-file', filename);
		await downloadToFile(taskResponse.result, filename);
	},
	run = async function () {
		const apiUrl = core.getInput('api-url'),
			apiKey = core.getInput('videopuppet-api-key'),
			event = {
				source: core.getInput('source-path'),
				repository: process.env['GITHUB_REPOSITORY'],
				token: core.getInput('github-token'),
				repositoryType: 'github',
				sha: process.env['GITHUB_SHA']
			},
			task = await startTask(apiUrl, apiKey, event),
			taskResponse = await pollForFinished(task.statusUrl, POLLING_INTERVAL);

		if (taskResponse.succeeded) {
			await saveResults(task, taskResponse);
		} else {
			core.setFailed(JSON.stringify(taskResponse));
		}
	};
run().catch(e => {
	console.error(e);
	core.setFailed(e.body || e.message || String(e));
});
