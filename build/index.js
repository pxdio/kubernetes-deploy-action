import * as fs from "fs";
import * as core from "@actions/core";
import * as tmp from "tmp-promise";
import * as yaml from "js-yaml";
import * as deployableFinder from "./deployable-finder.js";
import inputs from "./inputs.js";
import sourceMapSupport from "source-map-support";
async function main() {
    sourceMapSupport.install();
    const deployable = await deployableFinder.findDeployable(inputs().resources);
    await deployable.setup();
    await deployable.check();
    if (inputs().isDeployment()) {
        if (inputs().configuration !== "") {
            const configuration = yaml.load(inputs().configuration);
            await tmp.withFile(async (clusterConfigurationFile) => {
                await fs.promises.writeFile(clusterConfigurationFile.path, yaml.dump(configuration));
                for (const context of configuration.contexts) {
                    await deployable.deploy(clusterConfigurationFile.path, context.name);
                }
            });
        }
        else if (inputs().clusters !== "") {
            const clusters = inputs().clusters.split(/\s+/m);
            for (const cluster of clusters) {
                await deployable.deploy(undefined, cluster);
            }
        }
        else {
            throw new Error("No clusters or configuration provided for deployment.");
        }
    }
}
main().catch(error => core.setFailed(error.stack || error));
//# sourceMappingURL=index.js.map