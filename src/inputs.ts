import * as core from "@actions/core";

export class Inputs {
	configuration = core.getInput("configuration", {required: true});
	resources = core.getInput("resources", {required: true});
	namespace = core.getInput("namespace", {required: true});
}

export default function get():Inputs {
	return new Inputs();
}
