"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const core = __importStar(require("@actions/core"));
const tmp = __importStar(require("tmp-promise"));
const yaml = __importStar(require("js-yaml"));
const deployableFinder = __importStar(require("./deployable-finder"));
const inputs_1 = __importDefault(require("./inputs"));
const source_map_support_1 = __importDefault(require("source-map-support"));
async function main() {
    source_map_support_1.default.install();
    const deployable = await deployableFinder.findDeployable((0, inputs_1.default)().resources);
    await deployable.setup();
    await deployable.check();
    if ((0, inputs_1.default)().event === "deployment") {
        const configuration = yaml.load((0, inputs_1.default)().configuration);
        await tmp.withFile(async (clusterConfigurationFile) => {
            await fs.promises.writeFile(clusterConfigurationFile.path, yaml.dump(configuration));
            for (const context of configuration.contexts) {
                await deployable.deploy(clusterConfigurationFile.path, context.name);
            }
        });
    }
}
main().catch(error => core.setFailed(error.stack || error));
//# sourceMappingURL=index.js.map