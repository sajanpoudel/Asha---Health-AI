/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Exclude the Piper build directory from being processed
    exclude: ['**/piper/**'],
  }
  
  export default nextConfig;