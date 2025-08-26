/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // API 프록시 설정 (CORS 문제 해결)
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'http://kkssyy.ipdisk.co.kr:5700/:path*',
      },
    ];
  },
  
  // 개발 환경에서 외부 API 허용
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Center-Id, X-User-Type' },
        ],
      },
    ];
  },
}

module.exports = nextConfig