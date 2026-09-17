import type { NextConfig } from "next";
import {contentSecurityPolicy} from "./src/domain/content-security-policy";
const config: NextConfig = {reactStrictMode:true, poweredByHeader:false, images:{remotePatterns:[]}, async headers(){return [{source:"/:path*",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"X-Frame-Options",value:"DENY"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"Permissions-Policy",value:"camera=(), geolocation=(), microphone=(self)"},{key:"Content-Security-Policy",value:contentSecurityPolicy({supabaseUrl:process.env.NEXT_PUBLIC_SUPABASE_URL,development:process.env.NODE_ENV==="development"})}]}]}};
export default config;
