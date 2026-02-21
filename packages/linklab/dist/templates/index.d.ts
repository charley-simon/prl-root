import type { Graph } from '../types';
export declare const templates: {
    recommendations(config: RecommendationConfig): Graph;
    social(config: SocialConfig): Graph;
    orgChart(config: OrgChartConfig): Graph;
    transport(config: TransportConfig): Graph;
    knowledgeBase(config: KnowledgeConfig): Graph;
    musicians(config: MusiciansConfig): Graph;
};
export type RecommendationConfig = {
    entities: string[];
    userLikes?: string;
    productCategories?: string;
};
export type SocialConfig = {
    includePosts?: boolean;
    includeGroups?: boolean;
};
export type OrgChartConfig = {
    departments?: boolean;
};
export type TransportConfig = {
    defaultTravelTime?: number;
    defaultTransferTime?: number;
    includeTransfers?: boolean;
};
export type KnowledgeConfig = {
    includeAuthors?: boolean;
};
export type MusiciansConfig = {
    includeGenres?: boolean;
    includeInfluences?: boolean;
};
//# sourceMappingURL=index.d.ts.map