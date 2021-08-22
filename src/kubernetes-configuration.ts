interface KubernetesContext {
	name: string;
}

export interface KubernetesConfiguration {
	contexts: KubernetesContext[];
}
