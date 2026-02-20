"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyIntegrator = void 0;
class CompanyIntegrator {
    async integrate(company, logoFile) {
        return {
            id: company.id,
            name: company.name,
            origin_country: company.origin_country,
            logo: logoFile || ''
        };
    }
}
exports.CompanyIntegrator = CompanyIntegrator;
