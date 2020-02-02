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
	}
