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
exports.Helm = void 0;
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const toolCache = __importStar(require("@actions/tool-cache"));
const inputs_1 = __importDefault(require("./../inputs"));
const helmVersion = "3.6.3";
const helmExpectedSHA256 = "07c100849925623dc1913209cd1a30f0a9b80a5b4d6ff2153c609d11b043e262";
class Helm {
    constructor(path) {
        this.path = path;
    }
    async matches() {
        const chartFile = path.join(this.path, "Chart.yaml");
        return await fs.promises.access(chartFile, fs.constants.F_OK).then(() => true).catch(() => false);
    }
    async setup() {
        const archive = await toolCache.downloadTool(`https://get.helm.sh/helm-v${helmVersion}-linux-amd64.tar.gz`);
        const hash = crypto.createHash("sha256");
        hash.update(await fs.promises.readFile(archive));
        if (hash.digest("hex") !== helmExpectedSHA256) {
            throw new Error(`Helm archive should have had hash ${helmExpectedSHA256}, but instead it was ${hash}.`);
        }
        const extracted = await toolCache.extractTar(archive);
        const binaryDirectory = await toolCache.cacheDir(extracted, "helm", helmVersion);
        core.addPath(path.join(binaryDirectory, "linux-amd64"));
        await exec.exec("helm", ["dependency", "update", this.path]);
    }
    async check() {
        await exec.exec("helm", [
            "lint",
            "--strict",
            this.path,
        ]);
    }
    async deploy(clusterConfigurationPath, contextName) {
        const commitSHA = process.env.GITHUB_SHA;
        await exec.exec("helm", [
            "--kubeconfig", clusterConfigurationPath,
            "--kube-context", contextName,
            "--namespace", (0, inputs_1.default)().namespace,
            "upgrade",
            "--install",
            (0, inputs_1.default)().namespace,
            this.path,
            "--create-namespace",
            "--wait",
            "--set", `commitSHA=${commitSHA}`,
        ]);
    }
}
exports.Helm = Helm;
//# sourceMappingURL=helm.js.map