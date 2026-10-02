import type { NextConfig } from "next";
import {contentSecurityPolicy} from "./src/domain/content-security-policy";

const development=process.env.NODE_ENV!=="production";
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
        {key:"X-DNS-Prefetch-Control",value:"off"},
        {key:"Strict-Transport-Security",value:"max-age=63072000; includeSubDomains; preload"},
        {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
        {key:"Cross-Origin-Opener-Policy",value:"same-origin-allow-popups"},
        {key:"Cross-Origin-Resource-Policy",value:"same-origin"},
        {key:"Permissions-Policy",value:"camera=(), geolocation=(), microphone=(self)"},
        {key:"Content-Security-Policy",value:contentSecurityPolicy({supabaseUrl:process.env.NEXT_PUBLIC_SUPABASE_URL,development})}
      ]
    }];
  }
};
export default config;
