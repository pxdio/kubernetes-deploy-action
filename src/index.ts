import * as fs from "fs";
import * as core from "@actions/core";
import * as tmp from "tmp-promise";
import * as yaml from "js-yaml";
import * as clusters from "./clusters.js";
import * as deployableFinder from "./deployable-finder.js";
import * as kubernetesConfiguration from "./kubernetes-configuration.js";
import inputs from "./inputs.js";
import sourceMapSupport from "source-map-support";
import {Deployable} from "./deployables/deployable.js";

async function deployWithConfiguration(deployable:Deployable, configuration:kubernetesConfiguration.KubernetesConfiguration, contextNames:string[]) {
	await tmp.withFile(async clusterConfigurationFile => {
		await fs.promises.writeFile(clusterConfigurationFile.path, yaml.dump(configuration));
		for (const contextName of contextNames) {
			await deployable.deploy(clusterConfigurationFile.path, contextName);
		}
	});
}

async function main() {
	sourceMapSupport.install();

	const deployable = await deployableFinder.findDeployable(inputs().resources);
	await deployable.setup();
	await deployable.check();

	if (inputs().isDeployment()) {
		if (inputs().configuration !== "") {
			const configuration = yaml.load(inputs().configuration) as kubernetesConfiguration.KubernetesConfiguration;
			await deployWithConfiguration(deployable, configuration, configuration.contexts.map(context => context.name));
		} else if (inputs().clusters !== "") {
			const clusterNames = inputs().clusters.split(/\s+/m);
			for (const cluster of clusterNames) {
				if (clusters.isHardCoded(cluster)) {
					await deployWithConfiguration(deployable, await clusters.configuration(cluster), [cluster]);
				} else {
					await deployable.deploy(undefined, cluster);
				}
			}
		} else {
			throw new Error("No clusters or configuration provided for deployment.");
		}
	}
}

main().catch(error => core.setFailed(error.stack || error));
