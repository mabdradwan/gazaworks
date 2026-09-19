import type { NextConfig } from "next";
const config: NextConfig = {
  reactStrictMode:true,
  poweredByHeader:false,
  images:{remotePatterns:[]},
  async headers(){
    return [{
      source:"/:path*",
      headers:[
        {key:"X-Content-Type-Options",value:"nosniff"},
        {key:"X-Frame-Options",value:"DENY"},
        {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
        {key:"Permissions-Policy",value:"camera=(), geolocation=(), microphone=(self)"},
        {key:"Content-Security-Policy",value:"default-src 'self'; img-src 'self' data: blob: https://d2g8igdw686xgo.cloudfront.net https://cloudfront-eu-central-1.images.arcpublishing.com https://ultrapal.ultrasawt.com https://www.aljazeera.net https://ortadoguhabercom.teimg.com; media-src 'self' blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' data: https://cdn.jsdelivr.net; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"}
      ]
    }];
  }
};
export default config;
