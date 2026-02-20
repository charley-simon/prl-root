"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsEvents = exports.engineEvents = exports.userEvents = exports.StatsEventType = exports.EngineEventType = exports.UserEventType = void 0;
const events_1 = require("events");
var UserEventType;
(function (UserEventType) {
    UserEventType["FileAdded"] = "file-added";
    UserEventType["MovieClicked"] = "movie-clicked";
})(UserEventType || (exports.UserEventType = UserEventType = {}));
var EngineEventType;
(function (EngineEventType) {
    EngineEventType["SnapshotReady"] = "snapshot-ready";
    EngineEventType["EnrichmentDone"] = "enrichment-done";
    EngineEventType["DowngradePerformed"] = "downgrade-performed";
    EngineEventType["HousekeepingDone"] = "housekeeping-done";
})(EngineEventType || (exports.EngineEventType = EngineEventType = {}));
var StatsEventType;
(function (StatsEventType) {
    StatsEventType["MovieViewed"] = "movie-viewed";
    StatsEventType["StatsPersisted"] = "stats-persisted";
})(StatsEventType || (exports.StatsEventType = StatsEventType = {}));
exports.userEvents = new events_1.EventEmitter();
exports.engineEvents = new events_1.EventEmitter();
exports.statsEvents = new events_1.EventEmitter();
