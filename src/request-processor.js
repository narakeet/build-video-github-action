'use strict';
const pause = require('./pause'),
	path = require('path'),
	url = require('url'),
	POLLING_INTERVAL = 5000,
	DEFAULT_URL = 'https://api.narakeet.com/video/build';
module.exports = function RequestProcessor (restApi) {
	const self = this,
		startTask = async function (apiUrl, apiKey, event) {
			try {
				const result = await restApi.postJSON(
					apiUrl,
					event,
					{
						'x-api-key': apiKey
					}
				);
				console.log('got task id', result.taskId);
				console.log('got status URL', result.statusUrl);
				return result;
			} catch (e) {
				if (e.error) {
					throw new Error(e.error);
				}
				throw e;
			}
		},
		pollForFinished = async function (statusUrl, interval) {
			try {
				await pause(interval);
				const result = await restApi.getJSON(statusUrl);
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
		saveResults = async function (task, taskResponse, resultFile) {
			const videoUrl = taskResponse.result,
				remoteName = path.basename(url.parse(videoUrl).pathname),
				filename = resultFile || remoteName;
			console.log('downloading from', taskResponse.result, 'to', filename);
			await restApi.downloadToFile(taskResponse.result, filename);
			return {
				videoUrl: taskResponse.result,
				videoFile: filename
			};
		};
	self.run = async function (params) {
		const {apiUrl, apiKey, source, repository, token, sha, resultFile} = params,
			event = {
				source,
				repository,
				token,
				repositoryType: 'github',
				sha
			},
			api = apiUrl || DEFAULT_URL,
			task = await startTask(api, apiKey, event),
			taskResponse = await pollForFinished(task.statusUrl, POLLING_INTERVAL);
		if (taskResponse.succeeded) {
			return await saveResults(task, taskResponse, resultFile);
		} else {
			throw new Error(JSON.stringify(taskResponse));
		}
	};

};
