import express from "express";
import { readdirSync } from "node:fs";
import { rename, unlink } from "node:fs/promises";
import getPort from "get-port";
import { parseArgs } from "node:util";
import { resolve } from "node:path";

const args = parseArgs({
  args: process.argv.slice(2),
  options: {
    path: {
      type: "string",
      alias: "p",
    },
  },
});

type Type = "reference" | "current" | "diff";

type Platform = "linux" | "windows" | "unknown";

interface Result {
  fixture: string;
  test: string;
  name: string;
  referenceFile: string;
  diffFile: string | null;
  currentFile: string | null;
  platform: Platform;
}

const port = await getPort({ port: 4300 });

if (!args.values.path) {
  console.error("Missing path argument");
  process.exit(1);
}

const path = resolve(args.values.path);

express()
  .use(express.json())
  .get("/", (req, res) => {
    res.sendFile("./index.html", { root: "." });
  })
  .get("/files/:platform/:file", async (req, res) => {
    res.sendFile(`${path}/${req.params.platform}/${req.params.file}`, {
      root: ".",
    });
  })
  .get("/results", (req, res) => {
    const regex =
      /\[(?<fixture>.*?)\] (?<test>.*?) - (?<name>.*?).(?<type>reference|current|diff).png/;
    const platforms = readdirSync(`./e2e/${path}`);
    /** @type {Result[]} */
    const results = platforms.flatMap((platform) => {
      const files = readdirSync(`${path}/${platform}`);
      return files.flatMap((file, index, all) => {
        const match = file.match(regex);
        const { fixture, test, name, type } = match?.groups as any;
        if (type !== "reference") return [];
        const referenceFile = file;
        const diffFile =
          all.find((f) =>
            f.includes(`[${fixture}] ${test} - ${name}.diff.png`)
          ) ?? null;
        const currentFile =
          all.find((f) =>
            f.includes(`[${fixture}] ${test} - ${name}.current.png`)
          ) ?? null;
        return [
          {
            fixture,
            test,
            name,
            referenceFile,
            diffFile,
            currentFile,
            platform,
          },
        ];
      });
    });

    res.json(results);
  })
  .post("/approvals", async (req, res) => {
    /**
     * @type {Result}
     */
    const approval = req.body;
    await unlink(`${path}/${approval.platform}/${approval.diffFile}`);
    await unlink(`${path}/${approval.platform}/${approval.referenceFile}`);
    await rename(
      `${path}/${approval.platform}/${approval.currentFile}`,
      `${path}/${approval.platform}/${approval.referenceFile}`
    );
    res.status(201).end();
  })
  .listen(port);

console.log(
  `Comparing visual regression for ${path} at http://localhost:${port}/`
);
