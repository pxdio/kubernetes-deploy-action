import * as deployable from "./deployables/deployable";
import * as helm from "./deployables/helm";

const deployables = [
	helm.Helm,
];

export async function findDeployable(path:string): Promise<deployable.Deployable> {
	const deployable = deployables.map(deployable => new deployable(path)).find(deployable => deployable.matches());
	if (!deployable) {
		throw `Could not find any deployable artifacts in ${path}.`;
	}
	return deployable;
}
