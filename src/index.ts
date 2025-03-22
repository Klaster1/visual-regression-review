#!/usr/bin/env node

import getPort from "get-port";
import { parseArgs } from "node:util";
import { server } from "./server/index.ts";

const args = parseArgs({
  args: process.argv.slice(2),
  options: {
    path: {
      type: "string",
      alias: "p",
    },
  },
});

const port = await getPort({ port: 4300 });

if (!args.values.path) {
  console.error("Missing path argument");
  process.exit(1);
}

const path = args.values.path;

server(port, path);

console.log(
  `Comparing visual regression for ${path} at http://localhost:${port}/`
);
