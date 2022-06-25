export interface Deployable {
	matches(): Promise<boolean>;
	setup(): Promise<void>;
	check(): Promise<void>;
	deploy(clusterConfigurationPath:string, contextName:string): Promise<void>;
}
