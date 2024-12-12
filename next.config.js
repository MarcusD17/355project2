const path = require('path');

module.exports = {
    webpack: (config, { isServer }) => {
        console.log('Webpack Config:', JSON.stringify(config.resolve, null, 2));
        return config;
    },
};

module.exports = {
    webpack: (config) => {
        config.resolve.alias['@'] = path.resolve(__dirname, 'src');
        config.resolve.extensions.push('.ts', '.tsx', '.js', '.jsx'); // Add missing extensions
        return config;
    },
};

module.exports = {
    webpack: (config) => {
        config.resolve.alias['@'] = path.resolve(__dirname, 'src');
        config.resolve.fallback = {
            fs: false,
            path: false,
            os: false,
        };
        return config;
    },
};
