#!/usr/bin/env node

import express from "express";
import { readdirSync } from "node:fs";
import { rename, unlink } from "node:fs/promises";
import { resolve } from "node:path";

interface Result {
  name: string;
  referenceFile: string;
  diffFile: string | null;
  currentFile: string | null;
}

export const server = (port: number, path: string) => {
  express()
    .use(express.json())
    .get("/", (req, res) => {
      res.sendFile("./client/index.html", {
        root: resolve(import.meta.dirname, ".."),
      });
    })
    .get("/files/:file", async (req, res) => {
      res.sendFile(`${req.params.file}`, {
        root: path,
      });
    })
    .get("/results", (req, res) => {
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

      res.json(results);
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
