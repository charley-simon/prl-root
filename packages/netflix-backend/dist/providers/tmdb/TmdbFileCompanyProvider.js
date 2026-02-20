"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmdbFileCompanyProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class TmdbFileCompanyProvider {
    constructor(jsonFile, assetsDir) {
        this.jsonFile = jsonFile;
        this.assetsDir = assetsDir;
    }
    async enrich(company) {
        return company;
    }
    async getAllCompanies() {
        const raw = await fs_1.default.promises.readFile(this.jsonFile, 'utf-8');
        return JSON.parse(raw);
    }
    async getLogo(id) {
        const logoPath = path_1.default.join(this.assetsDir, `${id}-logo.png`);
        const buffer = await fs_1.default.promises.readFile(logoPath);
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
}
exports.TmdbFileCompanyProvider = TmdbFileCompanyProvider;
