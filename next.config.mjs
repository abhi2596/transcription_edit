/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
            serverActionsBodySizeLimit: '100mb',
      },
};

export default nextConfig;
