"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmdbHttpCompanyProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class TmdbHttpCompanyProvider {
    constructor(token) {
        this.token = token;
    }
    async enrich(movie) {
        return movie;
    }
    get headers() {
        return { Authorization: `Bearer ${this.token}`, Accept: 'application/json' };
    }
    async getImageData(filePath) {
        const url = `https://image.tmdb.org/t/p/original${filePath}`;
        const res = await (0, node_fetch_1.default)(url);
        if (!res.ok)
            throw new Error(`Cannot fetch image ${filePath}`);
        return await res.arrayBuffer();
    }
    async saveCompaniesSnapshot(companies, jsonFile, assetsDir) {
        await fs_1.default.promises.mkdir(assetsDir, { recursive: true });
        await fs_1.default.promises.writeFile(jsonFile, JSON.stringify(companies, null, 2));
        for (const company of companies) {
            if (!company.logo_path)
                continue;
            const buffer = await this.getImageData(company.logo_path);
            const fileName = path_1.default.join(assetsDir, `${company.id}-logo.png`);
            await fs_1.default.promises.writeFile(fileName, Buffer.from(buffer));
        }
    }
}
exports.TmdbHttpCompanyProvider = TmdbHttpCompanyProvider;
