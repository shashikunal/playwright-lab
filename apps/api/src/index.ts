import { createApp } from "./app.js";
import { readEnv } from "./env.js";

const env = readEnv();
const app = createApp(env);

app.listen(env.port, "127.0.0.1", () => {
  console.log(`API listening on http://127.0.0.1:${env.port}`);
});
