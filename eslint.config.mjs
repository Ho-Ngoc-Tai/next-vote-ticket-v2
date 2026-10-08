import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  // Next.js recommended + core-web-vitals rules (flat config ready)
  ...nextCoreWebVitals,

  // Custom project rules
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "react-hooks/exhaustive-deps": "off", // tắt rule cảnh báo useEffect
      "@typescript-eslint/no-explicit-any": "off",
      // chặn biến khai báo mà không dùng
      "no-unused-vars": "warn",

      // chặn import không dùng
      "unused-imports/no-unused-imports": "error",

      // chặn biến không dùng (ngoại trừ arg bắt đầu bằng _)
      "unused-imports/no-unused-vars": ["error", { vars: "all", args: "after-used", argsIgnorePattern: "^_" }],

      // option thêm: cấm console.log và debugger
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      // CTLF
      "linebreak-style": 0,
    },
  },

  // Ignore build artefacts (recommended by Next.js docs)
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
