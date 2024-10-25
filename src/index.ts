#!/usr/bin/env node

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

interface Result {
  fixture: string;
  test: string;
  name: string;
  referenceFile: string;
  diffFile: string | null;
  currentFile: string | null;
  platform: string;
}

const port = await getPort({ port: 4300 });

if (!args.values.path) {
  console.error("Missing path argument");
  process.exit(1);
}

const path = args.values.path;

express()
  .use(express.json())
  .get("/", (req, res) => {
    res.sendFile("index.html", { root: resolve(import.meta.dirname, "..") });
  })
  .get("/files/:file", async (req, res) => {
    res.sendFile(`${req.params.file}`, {
      root: path,
    });
  })
  .get("/results", (req, res) => {
    const regex =
      /(?<fixture>.*?)__(?<test>.*?)__(?<name>.*?).(?<type>reference|current|diff).png/;
    /** @type {Result[]} */
    const files = readdirSync(`${path}`);
    const results = files.flatMap((file, index, all) => {
      const match = file.match(regex);
      if (!match) return [];
      const { fixture, test, name, type } = match?.groups as any;
      if (type !== "reference") return [];
      const referenceFile = file;
      const diffFile =
        all.find((f) => f.includes(`${fixture}__${test}__${name}.diff.png`)) ??
        null;
      const currentFile =
        all.find((f) =>
          f.includes(`${fixture}__${test}__${name}.current.png`)
        ) ?? null;
      return [
        {
          fixture,
          test,
          name,
          referenceFile,
          diffFile,
          currentFile,
          platform: "tmp",
        },
      ];
    });

    res.json(results);
  })
  .post("/approvals", async (req, res) => {
    /**
     * @type {Result}
     */
    const approval = req.body;
    await unlink(`${path}/${approval.diffFile}`);
    await unlink(`${path}/${approval.referenceFile}`);
    await rename(
      `${path}/${approval.currentFile}`,
      `${path}/${approval.referenceFile}`
    );
    res.status(201).end();
  })
  .listen(port);

console.log(
  `Comparing visual regression for ${path} at http://localhost:${port}/`
);
