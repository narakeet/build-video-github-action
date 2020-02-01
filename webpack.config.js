'use strict';
const path = require('path'),
	target = process.env.npm_package_main,
	distDir = path.dirname(target),
	distFile = path.basename(target),
	webpackMode = process.env.npm_package_config_buildenv; // development or production
if (!webpackMode) {
	throw 'package config buildenv is not defined, aborting';
}
if (!target) {
	throw 'package main is not defined, aborting';
}
console.log('=====> webpack building', distDir, distFile, webpackMode);
module.exports = {
	entry: path.resolve(__dirname, 'src', 'index.js'),
	target: 'node',
	mode: webpackMode,
	performance: {
		hints: false
	},
	output: {
		filename: distFile,
		path: path.resolve(__dirname, distDir)
	}
};
