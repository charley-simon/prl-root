"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseFileProvider = void 0;
// src/providers/BaseFileProvider.ts  (pour tests / offline / replay)
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class BaseFileProvider {
    constructor(basePath) {
        this.basePath = basePath;
    }
    async read(filePath) {
        const fullPath = path_1.default.join(this.basePath, filePath);
        const raw = await fs_1.default.readFileSync(fullPath, 'utf-8');
        return JSON.parse(raw);
    }
}
exports.BaseFileProvider = BaseFileProvider;
