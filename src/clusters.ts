import * as core from "@actions/core";
import * as kubernetesConfiguration from "./kubernetes-configuration.js";

interface HardCodedCluster {
	server: string;
	certificateAuthorityData: string;
	audience: string;
}

const hardCodedClusters: Record<string, HardCodedCluster> = {
	neo: {
		server: "https://kube-neo.pxd.io:6443",
		certificateAuthorityData: "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUJpRENDQVMrZ0F3SUJBZ0lRUzhXOWVyNlNOQ04reTRkU05heEJHVEFLQmdncWhrak9QUVFEQWpBVk1STXcKRVFZRFZRUUtFd3ByZFdKbGNtNWxkR1Z6TUI0WERUSTJNRGd3TnpBNU5EQXlOVm9YRFRNMk1EZ3dOREE1TkRBeQpOVm93RlRFVE1CRUdBMVVFQ2hNS2EzVmlaWEp1WlhSbGN6QlpNQk1HQnlxR1NNNDlBZ0VHQ0NxR1NNNDlBd0VICkEwSUFCQ0tGNjRUaEJ0QytOeVRrbU1xemdWRWZpS1ZOd0t5a29OR3JreTJzYi85b0RTbWhEdExzaWxsYnpiMWUKbFBLWUNoc083ZzFuZjJDNmp0MkhESFcxVXBHallUQmZNQTRHQTFVZER3RUIvd1FFQXdJQ2hEQWRCZ05WSFNVRQpGakFVQmdnckJnRUZCUWNEQVFZSUt3WUJCUVVIQXdJd0R3WURWUjBUQVFIL0JBVXdBd0VCL3pBZEJnTlZIUTRFCkZnUVU2RGNDby9oZEg3QkNqdjhHR21IM0x4a2NJdTh3Q2dZSUtvWkl6ajBFQXdJRFJ3QXdSQUlnWjJxV0wzVEUKQkZwMlZwTGhTQTNRdG9EZWRVTDdocTBxdGlXeUJUUW1LaUlDSUJWYmVHRnFZSnlreDFvSnhvVzRrSk9zOG92eApQakhOK3VaZzR6YVR0K2lpCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K",
	},
};

export function isHardCoded(name:string): boolean {
	return Object.hasOwn(hardCodedClusters, name);
}

export async function configuration(name:string): Promise<kubernetesConfiguration.KubernetesConfiguration> {
	const cluster = hardCodedClusters[name];
	if (!cluster) {
		throw new Error(`${name} is not a hard-coded cluster.`);
	}
	const token = await core.getIDToken(cluster.server);
	core.setSecret(token);
	return {
		apiVersion: "v1",
		kind: "Config",
		clusters: [
			{
				name: name,
				cluster: {
					server: cluster.server,
					"certificate-authority-data": cluster.certificateAuthorityData,
				},
			},
		],
		contexts: [
			{
				name: name,
				context: {
					cluster: name,
					user: name,
				},
			},
		],
		users: [
			{
				name: name,
				user: {
					token: token,
				},
			},
		],
	};
}
