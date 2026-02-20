"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieEvents = void 0;
const events_1 = require("events");
// Événements liés aux films : ajout ou mise à jour
exports.movieEvents = new events_1.EventEmitter();
