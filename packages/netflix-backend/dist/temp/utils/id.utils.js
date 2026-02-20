"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInternalId = generateInternalId;
// src/utils/id.utils.ts
const uuid_1 = require("uuid");
// Namespace fixe pour ton app — génère le tien avec uuidv4() une seule fois
const APP_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
// Même input → toujours même UUID (déterministe)
function generateInternalId(providerName, externalId) {
    return (0, uuid_1.v5)(`${providerName}:${externalId}`, APP_NAMESPACE);
}
