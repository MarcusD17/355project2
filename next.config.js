/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        config.resolve.alias['@/app/firebase-config'] = '@/app/firebase-config.ts';
        return config;
    },
};

module.exports = nextConfig;