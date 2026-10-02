import { FlatCompat } from "@eslint/eslintrc";
import { globalIgnores } from "eslint/config";
const compat = new FlatCompat({baseDirectory: import.meta.dirname});
const config = [globalIgnores([".next/**", "next-env.d.ts", "coverage/**"]), ...compat.extends("next/core-web-vitals", "next/typescript")];
export default config;
