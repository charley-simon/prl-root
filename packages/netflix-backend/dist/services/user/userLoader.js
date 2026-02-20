"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadUsers = loadUsers;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const compiler_1 = require("@sinclair/typebox/compiler");
const user_schema_1 = require("../../schemas/users/user.schema");
const UserValidator = compiler_1.TypeCompiler.Compile(user_schema_1.UserSchema);
function loadUsers(dataPath) {
    const filePath = path_1.default.join(dataPath, 'users.json');
    const raw = fs_1.default.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(raw);
    const users = [];
    for (const item of json) {
        if (!UserValidator.Check(item)) {
            console.error(UserValidator.Errors(item));
            throw new Error('Invalid user data');
        }
        users.push(item);
    }
    return users;
}
