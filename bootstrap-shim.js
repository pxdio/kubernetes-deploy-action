"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "build", "index.js");
try {
	if (!fs.existsSync(target)) {
		console.log("::group::This is a development build! For greater reliability and faster startup time, please use a tagged release.");
		childProcess.execFileSync("npm", ["run", "bootstrap"], {stdio: "inherit", cwd: __dirname});
		console.log("::endgroup::");
	}
	childProcess.execFileSync(process.execPath, [target], {stdio: "inherit"});
}
catch (error) {
	if (!error.status) {
		throw error;
	}
	process.exitCode = error.status;
}
