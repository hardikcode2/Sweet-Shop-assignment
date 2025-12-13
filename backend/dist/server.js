"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const init_1 = require("./db/init");
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = (0, app_1.createApp)();
async function start() {
    await (0, init_1.initDb)();
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
}
start();
