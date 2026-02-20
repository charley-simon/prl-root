"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonSnapshotService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class JsonSnapshotService {
    constructor(baseDir) {
        this.baseDir = baseDir;
    }
    filePath(name) {
        return path_1.default.join(this.baseDir, name);
    }
    async save(name, data) {
        const file = this.filePath(name);
        await promises_1.default.mkdir(path_1.default.dirname(file), { recursive: true });
        await promises_1.default.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
    }
    async load(name) {
        const file = this.filePath(name);
        const raw = await promises_1.default.readFile(file, 'utf-8');
        return JSON.parse(raw);
    }
}
exports.JsonSnapshotService = JsonSnapshotService;
