import { GraphBuilder } from '../builders/GraphBuilder';
export const templates = {
    recommendations(config) {
        const builder = new GraphBuilder();
        config.entities.forEach(entity => builder.addEntity(entity));
        if (config.userLikes) {
            builder.connect('Users', 'Products', {
                through: config.userLikes,
                weight: 5
            });
        }
        if (config.productCategories) {
            builder.connect('Products', 'Categories', {
                through: config.productCategories,
                weight: 3
            });
        }
        if (config.productCategories) {
            builder.connect('Categories', 'Products', {
                through: config.productCategories,
                weight: 3
            });
        }
        return builder.build();
    },
    social(config) {
        const builder = new GraphBuilder();
        builder.addEntity('Users').addEntity('Posts').addEntity('Groups');
        builder.connect('Users', 'Users', {
            through: 'friendships',
            weight: 2,
            bidirectional: true
        });
        builder.connect('Users', 'Posts', {
            through: 'user_posts',
            weight: 3
        });
        builder.connect('Users', 'Groups', {
            through: 'user_groups',
            weight: 4,
            bidirectional: true
        });
        return builder.build();
    },
    orgChart(config) {
        const builder = new GraphBuilder();
        builder.addEntity('Employees');
        builder.connect('Employees', 'Employees', {
            through: 'reports_to',
            weight: 1
        });
        if (config.departments) {
            builder.addEntity('Departments');
            builder.connect('Employees', 'Departments', {
                through: 'employee_departments',
                weight: 2
            });
        }
        return builder.build();
    },
    transport(config) {
        const builder = new GraphBuilder();
        builder.addEntity('Stations');
        builder.connect('Stations', 'Stations', {
            through: 'direct_connections',
            weight: config.defaultTravelTime || 2
        });
        if (config.includeTransfers) {
            builder.connect('Stations', 'Stations', {
                through: 'transfers',
                weight: config.defaultTransferTime || 5
            });
        }
        return builder.build();
    },
    knowledgeBase(config) {
        const builder = new GraphBuilder();
        builder.addEntity('Concepts').addEntity('Documents');
        builder.connect('Concepts', 'Concepts', {
            through: 'related_concepts',
            weight: 3,
            bidirectional: true
        });
        builder.connect('Documents', 'Concepts', {
            through: 'document_concepts',
            weight: 2
        });
        builder.connect('Concepts', 'Documents', {
            through: 'document_concepts',
            weight: 2
        });
        return builder.build();
    },
    musicians(config) {
        const builder = new GraphBuilder();
        builder.addEntity('Artists').addEntity('Tracks');
        builder.connect('Artists', 'Tracks', {
            through: 'created',
            weight: 2
        });
        builder.connect('Tracks', 'Tracks', {
            through: 'samples',
            weight: 5
        });
        builder.connect('Artists', 'Artists', {
            through: 'collaborated_with',
            weight: 3,
            bidirectional: true
        });
        if (config.includeGenres) {
            builder.addEntity('Genres');
            builder.connect('Artists', 'Genres', {
                through: 'artist_genres',
                weight: 4
            });
            builder.connect('Tracks', 'Genres', {
                through: 'track_genres',
                weight: 4
            });
        }
        return builder.build();
    }
};
//# sourceMappingURL=index.js.map