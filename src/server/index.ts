#!/usr/bin/env node

import express from "express";
import { readdirSync } from "node:fs";
import { rename, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import type { Result } from "../types.ts";
import { template } from "../client/index.html.ts";

export const server = (port: number, path: string) => {
  express()
    .use(express.json())
    .get("/", (req, res) => {
      const regex = /(?<name>.*?).(?<type>reference|current|diff).png/;
      const files = readdirSync(`${path}`);
      const results: Result[] = files.flatMap((file, index, all) => {
        const match = file.match(regex);
        if (!match) return [];
        const { name, type } = match?.groups as any;
        if (type !== "reference") return [];
        const referenceFile = file;
        const diffFile =
          all.find((f) => f.includes(`${name}.diff.png`)) ?? null;
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

      res.send(template(results));
    })
    .use(express.static(resolve(import.meta.dirname, "..", "client")))
    .get("/files/:file", async (req, res) => {
      res.sendFile(`${req.params.file}`, {
        root: path,
      });
    })

    .post("/approvals", async (req, res) => {
      const approval = req.body as Result;
      await unlink(`${path}/${approval.diffFile}`);
      await unlink(`${path}/${approval.referenceFile}`);
      await rename(
        `${path}/${approval.currentFile}`,
        `${path}/${approval.referenceFile}`
      );
      res.status(201).end();
    })
    .listen(port);
};
