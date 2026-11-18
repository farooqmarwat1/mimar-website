// `npm run build`: `next build`, on webpack instead of Turbopack when the server cannot run Next's
// native compiler.
//
// Hostinger's Web Apps let you pick only "npm run build" as the build command. Their servers run
// glibc 2.28, but Next's native SWC needs 2.29, so Next falls back to its WebAssembly compiler,
// which does not support Turbopack. So this script looks at the glibc version and adds --webpack
// there. Vercel and normal Linux/macOS/Windows machines are unchanged (plain `next build`).
//
//   NEXT_BUILD_WEBPACK=1  always use webpack      NEXT_BUILD_WEBPACK=0  never use webpack
//   node scripts/build.mjs --print                print the command instead of running it
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const MIN_GLIBC = [2, 29];

export function glibcVersion() {
  try {
    return process.report.getReport().header.glibcVersionRuntime || null;
  } catch {
    return null;
  }
}

export function needsWebpack(env = process.env, glibc = glibcVersion()) {
  if (env.NEXT_BUILD_WEBPACK === "1") return true;
  if (env.NEXT_BUILD_WEBPACK === "0") return false;
  if (!glibc) return false; // not glibc (macOS, Windows, musl): the native compiler is fine
  const [major, minor] = glibc.split(".").map(Number);
  if (!Number.isFinite(major) || !Number.isFinite(minor)) return false;
  return major < MIN_GLIBC[0] || (major === MIN_GLIBC[0] && minor < MIN_GLIBC[1]);
}

// Runs only as `node scripts/build.mjs`; importing it (the unit test) has no side effects.
if (/build\.mjs$/.test(process.argv[1] ?? "")) {
  const webpack = needsWebpack();
  const args = ["build", ...(webpack ? ["--webpack"] : [])];
  const glibc = glibcVersion();
  if (process.argv.includes("--print")) {
    console.log(`next ${args.join(" ")}`);
    process.exit(0);
  }
  if (webpack) console.log(`[build] using webpack (glibc ${glibc ?? "unknown"}, NEXT_BUILD_WEBPACK=${process.env.NEXT_BUILD_WEBPACK ?? "unset"})`);
  const next = createRequire(import.meta.url).resolve("next/dist/bin/next");
  const result = spawnSync(process.execPath, [next, ...args], { stdio: "inherit" });
  process.exit(result.status ?? 1);
}
