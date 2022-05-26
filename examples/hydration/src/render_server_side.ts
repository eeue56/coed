import express from "express";
import { readFileSync } from "fs";
import { initalModel, view } from ".";
import { flatRender } from "../../../build/coed";

function main() {
    const app = express();
    const port = 3000;

    app.get("/", (req, res) => {
        const index = readFileSync("./index.html", "utf-8");
        const rendered = flatRender(view(initalModel));
        const result = index.replace(
            `<div id="root"></div>`,
            `<div id="root">${rendered}</div>`
        );
        res.send(result);
    });

    app.use(express.static("public"));

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
}

main();
