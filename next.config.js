// Dynamically sets standalone mode for Docker builds via DOCKER_BUILD=true

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  ...(process.env.DOCKER_BUILD === 'true' && {
    output: 'standalone',
  }),
};

if (process.env.DOCKER_BUILD === 'true') {
  console.log(' Building with standalone output for Docker');
}

module.exports = nextConfig;
