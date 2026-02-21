import type { Graph } from '..';
export declare class GraphBuilder {
    private relations;
    private entities;
    addEntity(name: string): this;
    connect(from: string, to: string, options?: {
        through?: string;
        where?: Record<string, any>;
        weight?: number;
        bidirectional?: boolean;
    }): this;
    build(): Graph;
    static fromDatabase(config: DatabaseConfig): Promise<Graph>;
    static fromCSV(filepath: string, config: CSVConfig): Promise<Graph>;
    static fromJSON(filepath: string, config?: JSONConfig): Promise<Graph>;
    static fromData(): DataGraphBuilder;
}
export type DatabaseConfig = {
    type: 'postgres' | 'mysql' | 'mongodb';
    connection: string;
    tables?: Record<string, TableConfig>;
    collections?: Record<string, CollectionConfig>;
    relations: RelationConfig[];
};
export type TableConfig = {
    id: string;
    label?: string;
};
export type CollectionConfig = {
    id: string;
    label?: string;
};
export type RelationConfig = {
    from: string;
    to: string;
    through?: string;
    on?: string[];
    where?: Record<string, any>;
    weight?: number;
};
export type CSVConfig = {
    id: string;
    parent?: string;
    label?: string;
    weight?: string | number;
    delimiter?: string;
};
export type JSONConfig = {
    nodes?: string;
    edges?: string;
    nodeId?: string;
    edgeFrom?: string;
    edgeTo?: string;
    edgeWeight?: string;
};
declare class DataGraphBuilder extends GraphBuilder {
    private nodes;
    addNodes(type: string, data: any[], config: {
        id: string;
        label: string;
    }): this;
    linkBy(from: string, to: string, fn: (fromNode: any, toNode: any) => boolean, options?: {
        weight?: number;
    }): this;
}
export {};
//# sourceMappingURL=GraphBuilder.d.ts.map