import * as child_process from "child_process";
import * as fs from "fs";
import * as util from "util";

export const exec = util.promisify(child_process.exec);

export const mkdir = util.promisify(fs.mkdir);

export const writeFile = util.promisify(fs.writeFile);

export const copyFile = util.promisify(fs.copyFile);
