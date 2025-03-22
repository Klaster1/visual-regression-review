#!/usr/bin/env node

import express from "express";
import { readdirSync } from "node:fs";
import { rename, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import type { Result } from "../types.ts";
import { template } from "../client/index.html.ts";

export const server = (port: number, path: string) => {
  const getResults = () => {
    const regex = /(?<name>.*?).(?<type>reference|current|diff).png/;
    const files = readdirSync(`${path}`);
    return files.flatMap((file, index, all) => {
      const match = file.match(regex);
      if (!match) return [];
      const { name, type } = match?.groups as any;
      if (type !== "reference") return [];
      const referenceFile = file;
      const diffFile = all.find((f) => f.includes(`${name}.diff.png`)) ?? null;
      if (!diffFile) return [];
      const currentFile =
        all.find((f) => f.includes(`${name}.current.png`)) ?? null;
      return [
        {
          name,
          referenceFile,
          diffFile,
          currentFile,
        },
      ];
    });
  };

  express()
    .get("/", (req, res) => {
      res.send(template(getResults()));
    })
    .post("/approvals/:resultName", async (req, res) => {
      const resultName = req.params.resultName;
      const results = getResults();
      const approval = results.find((result) => result.name === resultName);

      if (!approval) {
        res.status(404).end();
        return;
      }

      await unlink(`${path}/${approval.diffFile}`);
      await unlink(`${path}/${approval.referenceFile}`);
      await rename(
        `${path}/${approval.currentFile}`,
        `${path}/${approval.referenceFile}`
      );
      res.redirect("/");
    })
    .use(express.static(resolve(import.meta.dirname, "..", "client")))
    .get("/files/:file", async (req, res) => {
      res.sendFile(`${req.params.file}`, {
        root: path,
      });
    })

    .listen(port);
};
