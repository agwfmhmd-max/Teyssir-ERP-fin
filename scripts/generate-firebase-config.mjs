import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "public/erp/firebase-config.js");

const env = (name) => process.env[name] ?? "";
const config = {
  apiKey: env("VITE_FIREBASE_API_KEY"),
  authDomain: env("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: env("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("VITE_FIREBASE_APP_ID"),
  measurementId: env("VITE_FIREBASE_MEASUREMENT_ID"),
};

if (!config.apiKey || !config.projectId) {
  throw new Error(
    "Firebase configuration is missing. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID (plus the remaining VITE_FIREBASE_* variables) before running Vite.",
  );
}

await mkdir(dirname(output), { recursive: true });
await writeFile(
  output,
  `// AUTO-GENERATED FILE - DO NOT COMMIT.\nwindow.TEYSSIR_FIREBASE_CONFIG = ${JSON.stringify(config, null, 2)};\n`,
  "utf8",
);

console.log("Generated public/erp/firebase-config.js from VITE_FIREBASE_* environment variables.");
