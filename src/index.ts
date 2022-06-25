import * as fs from "fs";
import * as core from "@actions/core";
import * as tmp from "tmp-promise";
import * as yaml from "js-yaml";
import * as deployableFinder from "./deployable-finder";
import * as kubernetesConfiguration from "./kubernetes-configuration";
import inputs from "./inputs";
import sourceMapSupport from "source-map-support";

async function main() {
	sourceMapSupport.install();

	const deployable = await deployableFinder.findDeployable(inputs().resources);
	await deployable.setup();

	const configuration = yaml.load(inputs().configuration) as kubernetesConfiguration.KubernetesConfiguration;
	await tmp.withFile(async clusterConfigurationFile => {
		await fs.promises.writeFile(clusterConfigurationFile.path, yaml.dump(configuration));
		for (const context of configuration.contexts) {
			await deployable.deploy(clusterConfigurationFile.path, context.name);
		}
	});
}

main().catch(error => core.setFailed(error.stack || error));
