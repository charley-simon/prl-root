"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeopleIntegrator = void 0;
class PeopleIntegrator {
    async integrate(person, profileFile) {
        return {
            id: person.id,
            name: person.name,
            profile: profileFile || '',
            known_for_department: person.known_for_department
        };
    }
}
exports.PeopleIntegrator = PeopleIntegrator;
