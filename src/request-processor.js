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
				console.log('posting to', apiUrl);
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
					throw e.error;
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
		downloadResults = async function (remoteUrl, propertyPrefix, defaultFileName) {
			if (!remoteUrl) {
				return {};
			}
			const remoteName = path.basename(url.parse(remoteUrl).pathname),
				filename = defaultFileName || remoteName,
				result = {};
			console.log('downloading from', remoteUrl, 'to', filename);
			await restApi.downloadToFile(remoteUrl, filename);
			result[propertyPrefix + '-url'] = remoteUrl;
			result[propertyPrefix + '-file'] = filename;
			return result;
		},
		saveResults = async function (task, taskResponse, resultFile) {
			const videoResults = await downloadResults(taskResponse?.result, 'video', resultFile),
				srtResults = await downloadResults(taskResponse?.subtitles?.srt, 'srt'),
				vttResults = await downloadResults(taskResponse?.subtitles?.vtt, 'vtt'),
				posterResults = await downloadResults(taskResponse?.poster, 'poster');
			return Object.assign(videoResults, srtResults, vttResults, posterResults);
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
