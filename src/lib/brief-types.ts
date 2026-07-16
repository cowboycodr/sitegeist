export type BenchmarkBrief = {
	schemaVersion: number;
	briefId: string;
	id: number;
	slug: string;
	artifactDirectory: string;
	title: string;
	category: string;
	tagline: string;
	description: string;
	content: {
		eyebrow: string;
		primaryAction: string;
		secondaryAction: string;
	};
	requirements: {
		responsive: boolean;
		accessible: boolean;
		runtimeNetwork: boolean;
		standaloneStaticBuild: boolean;
	};
};
