import { getCmsConfig } from "./src/lib/cms-server";
async function main() {
  const configs = await getCmsConfig();
  console.log(JSON.stringify(configs, null, 2));
}
main();
