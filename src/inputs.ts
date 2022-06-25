import * as core from "@actions/core";

export class Inputs {
	event = core.getInput("event", {required: true});
	resources = core.getInput("resources", {required: true});
	namespace = core.getInput("namespace", {required: this.event === "deployment"});
	configuration = core.getInput("configuration", {required: this.event === "deployment"});
}

export default function get():Inputs {
	return new Inputs();
}
