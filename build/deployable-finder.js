import * as helm from "./deployables/helm.js";
const deployables = [
    helm.Helm,
];
export async function findDeployable(path) {
    const deployable = deployables.map(deployable => new deployable(path)).find(deployable => deployable.matches());
    if (!deployable) {
        throw `Could not find any deployable artifacts in ${path}.`;
    }
    return deployable;
}
//# sourceMappingURL=deployable-finder.js.map