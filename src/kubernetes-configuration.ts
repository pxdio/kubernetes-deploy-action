interface KubernetesCluster {
	name: string;
	cluster: {
		server: string;
		"certificate-authority-data": string;
	};
}

interface KubernetesContext {
	name: string;
	context?: {
		cluster: string;
		user: string;
	};
}

interface KubernetesUser {
	name: string;
	user: {
		token: string;
	};
}

export interface KubernetesConfiguration {
	apiVersion?: string;
	kind?: string;
	clusters?: KubernetesCluster[];
	contexts: KubernetesContext[];
	users?: KubernetesUser[];
}
