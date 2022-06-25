import * as fs from "fs";
import * as path from "path";
import * as tmp from "tmp-promise";
import * as helm from "./../../src/deployables/helm";

describe("test Helm.matches(...)", () => {
	it("should not match directories without a Helm chart", async () => {
		await tmp.withDir(async resource => {
			const deployable = new helm.Helm(resource.path);
			expect(await deployable.matches()).toBe(false);
		});
	});

	it("should match directories with a Helm chart", async () => {
		await tmp.withDir(async resource => {
			const deployable = new helm.Helm(resource.path);
			await fs.promises.writeFile(path.join(resource.path, "Chart.yaml"), "");
			expect(await deployable.matches()).toBe(true);
		}, {unsafeCleanup: true});
	});
});
