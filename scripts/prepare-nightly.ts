import { execSync } from "child_process";
import fs from "fs-extra";
import path from "node:path";
import { TAURI_APP_DIR, cwd } from "./utils/env";
import { consola } from "./utils/logger";

const TAURI_DEV_APP_CONF_PATH = path.join(
  TAURI_APP_DIR,
  "tauri.nightly.conf.json",
);
const PACKAGE_JSON_PATH = path.join(cwd, "package.json");
const WXS_PATH = path.join(TAURI_APP_DIR, "templates", "nightly.wxs");
const NSI_PATH = path.join(TAURI_APP_DIR, "templates", "nightly.nsi");

async function main() {
  const tauriConf = await fs.readJSON(TAURI_DEV_APP_CONF_PATH);
  const packageJson = await fs.readJSON(PACKAGE_JSON_PATH);
  const wxsFile = await fs.readFile(WXS_PATH, "utf-8");
  const nsiFile = await fs.readFile(NSI_PATH, "utf-8");

  consola.debug("Get current git short hash");
  const GIT_SHORT_HASH = execSync("git rev-parse --short HEAD")
    .toString()
    .trim();
  consola.debug(`Current git short hash: ${GIT_SHORT_HASH}`);

  const version = `${tauriConf.package.version}-alpha+${GIT_SHORT_HASH}`;
  // 1. update wxs version
  consola.debug("Write raw version to wxs");
  const modifiedWxsFile = wxsFile.replace(
    "{{version}}",
    tauriConf.package.version,
  );
  await fs.writeFile(WXS_PATH, modifiedWxsFile);
  consola.debug("wxs updated");
  // 2. update nsi version
  consola.debug("Write raw version to nsi");
  const modifiedNsiFile = nsiFile.replace(
    "{{version}}",
    tauriConf.package.version,
  );
  await fs.writeFile(NSI_PATH, modifiedNsiFile);
  consola.debug("nsi updated");
  // 3. update tauri version
  consola.debug("Write tauri version to tauri.nightly.conf.json");
  tauriConf.package.version = version;
  await fs.writeJSON(TAURI_DEV_APP_CONF_PATH, tauriConf, { spaces: 2 });
  consola.debug("tauri.nightly.conf.json updated");
  // 4. update package version
  consola.debug("Write tauri version to package.json");
  packageJson.version = version;
  await fs.writeJSON(PACKAGE_JSON_PATH, packageJson, { spaces: 2 });
  consola.debug("package.json updated");
}

main();
