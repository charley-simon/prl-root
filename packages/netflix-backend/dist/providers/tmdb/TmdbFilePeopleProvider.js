"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmdbFilePeopleProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class TmdbFilePeopleProvider {
    constructor(baseDir) {
        this.baseDir = baseDir;
    }
    async enrich(person) {
        return person;
    }
    async readJson(fileName) {
        const filePath = path_1.default.join(this.baseDir, fileName);
        const raw = await fs_1.default.promises.readFile(filePath, 'utf-8');
        return JSON.parse(raw);
    }
    async getPersonDetails(id) {
        return this.readJson(`${id}-Person-Details.json`);
    }
    async getImage(fileName) {
        const filePath = path_1.default.join(this.baseDir, 'images', 'originals', fileName);
        const buffer = await fs_1.default.promises.readFile(filePath);
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
}
exports.TmdbFilePeopleProvider = TmdbFilePeopleProvider;
