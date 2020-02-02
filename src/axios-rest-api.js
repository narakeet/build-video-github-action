'use strict';
const fs = require('fs');
module.exports = function AxiosRestApi(axios) {
	const self = this;
	self.downloadToFile = async function (fileUrl, filePath) {
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
	};
	self.postJSON = async function (url, data, headers) {
		try {
			const response = await axios.post(url, data, {headers: headers});
			return response.data;
		} catch (error) {
			if (error.response) {
				throw new Error(error.response.data);
			}
			throw error;
		}
	};
	self.getJSON = async function (url) {
		try {
			const response = await axios.get(url);
			return response.data;
		} catch (error) {
			if (error.response) {
				throw new Error(error.response.data);
			}
			throw error;
		}
	};
};
