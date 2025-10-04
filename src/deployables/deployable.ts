export interface Deployable {
	matches(): Promise<boolean>;
	setup(): Promise<void>;
	check(): Promise<void>;
	deploy(clusterConfigurationPath:string | undefined, contextName:string): Promise<void>;
}
