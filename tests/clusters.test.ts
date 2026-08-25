import * as core from "@actions/core";
import * as clusters from "./../src/clusters";

describe("test clusters.isHardCoded(...)", () => {
	it("should recognise hard-coded clusters", () => {
		expect(clusters.isHardCoded("neo")).toBe(true);
	});

	it("should not recognise other clusters", () => {
		expect(clusters.isHardCoded("other")).toBe(false);
	});

	it("should not recognise inherited object properties", () => {
		expect(clusters.isHardCoded("constructor")).toBe(false);
	});
});

describe("test clusters.configuration(...)", () => {
	it("should authenticate with an OIDC token", async () => {
		const getIDToken = jest.spyOn(core, "getIDToken").mockResolvedValue("token");
		const setSecret = jest.spyOn(core, "setSecret").mockImplementation(() => undefined);

		const configuration = await clusters.configuration("neo");

		expect(getIDToken).toHaveBeenCalledWith("https://kube-neo.pxd.io:6443");
		expect(setSecret).toHaveBeenCalledWith("token");
		expect(configuration.clusters).toHaveLength(1);
		expect(configuration.clusters![0].cluster.server).toBe("https://kube-neo.pxd.io:6443");
		expect(Buffer.from(configuration.clusters![0].cluster["certificate-authority-data"], "base64").toString())
			.toContain("-----BEGIN CERTIFICATE-----");
		expect(configuration.contexts).toEqual([{name: "neo", context: {cluster: "neo", user: "neo"}}]);
		expect(configuration.users).toEqual([{name: "neo", user: {token: "token"}}]);
	});

	it("should reject clusters that are not hard-coded", async () => {
		await expect(clusters.configuration("other")).rejects.toThrow("other is not a hard-coded cluster.");
	});
});
