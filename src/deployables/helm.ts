import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as toolCache from "@actions/tool-cache";
import * as deployable from "./deployable";
import inputs from "./../inputs";

const helmVersion = "3.6.3";
const helmExpectedSHA256 = "07c100849925623dc1913209cd1a30f0a9b80a5b4d6ff2153c609d11b043e262";

export class Helm implements deployable.Deployable {
	path: string;

	constructor(path: string) {
		this.path = path;
	}

	async matches(): Promise<boolean> {
		const chartFile = path.join(this.path, "Chart.yaml");
		return await fs.promises.access(chartFile, fs.constants.F_OK).then(() => true).catch(() => false);
	}

	async setup(): Promise<void> {
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

	async check(): Promise<void> {
		await exec.exec("helm", [
			"lint",
			"--strict",
			this.path,
		]);
	}

	async deploy(clusterConfigurationPath:string, contextName:string): Promise<void> {
		await exec.exec("helm", [
			"--kubeconfig", clusterConfigurationPath,
			"--kube-context", contextName,
			"--namespace", inputs().namespace,
			"upgrade",
			"--install",
			inputs().namespace,
			this.path,
			"--create-namespace",
			"--wait",
		]);
	}
}
