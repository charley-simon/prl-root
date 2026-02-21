export class GraphBuilder {
    constructor() {
        this.relations = [];
        this.entities = new Set();
    }
    addEntity(name) {
        this.entities.add(name);
        return this;
    }
    connect(from, to, options = {}) {
        const { through, weight = 1, bidirectional = false } = options;
        const via = through || `${from}-${to}`;
        this.relations.push({
            name: `${from}-${to}-${this.relations.length}`,
            fromEntity: from,
            toEntity: to,
            via,
            weight
        });
        if (bidirectional) {
            this.relations.push({
                name: `${to}-${from}-${this.relations.length}`,
                fromEntity: to,
                toEntity: from,
                via,
                weight
            });
        }
        return this;
    }
    build() {
        return {
            relations: this.relations
        };
    }
    static async fromDatabase(config) {
        const builder = new DatabaseGraphBuilder(config);
        return builder.build();
    }
    static async fromCSV(filepath, config) {
        const builder = new CSVGraphBuilder(filepath, config);
        return builder.build();
    }
    static async fromJSON(filepath, config) {
        const builder = new JSONGraphBuilder(filepath, config);
        return builder.build();
    }
    static fromData() {
        return new DataGraphBuilder();
    }
}
class DatabaseGraphBuilder {
    constructor(config) {
        this.config = config;
    }
    async build() {
        throw new Error('Database builder not yet implemented. Use GraphBuilder instance methods for now.');
    }
}
class CSVGraphBuilder {
    constructor(filepath, config) {
        this.filepath = filepath;
        this.config = config;
    }
    async build() {
        throw new Error('CSV builder not yet implemented. Use GraphBuilder instance methods for now.');
    }
}
class JSONGraphBuilder {
    constructor(filepath, config) {
        this.filepath = filepath;
        this.config = config;
    }
    async build() {
        throw new Error('JSON builder not yet implemented. Use GraphBuilder instance methods for now.');
    }
}
class DataGraphBuilder extends GraphBuilder {
    constructor() {
        super(...arguments);
        this.nodes = new Map();
    }
    addNodes(type, data, config) {
        this.nodes.set(type, data);
        this.addEntity(type);
        return this;
    }
    linkBy(from, to, fn, options = {}) {
        const fromNodes = this.nodes.get(from) || [];
        const toNodes = this.nodes.get(to) || [];
        fromNodes.forEach(fromNode => {
            toNodes.forEach(toNode => {
                if (fn(fromNode, toNode)) {
                    this.connect(from, to, options);
                }
            });
        });
        return this;
    }
}
//# sourceMappingURL=GraphBuilder.js.map