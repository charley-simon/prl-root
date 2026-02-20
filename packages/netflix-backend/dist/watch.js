"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // charge automatiquement .env à la racine
const watcher_1 = require("./workers/watcher");
(0, watcher_1.startWatcher)();
