import yargs from "yargs";
import { run } from "./commands/run";
import { upload } from "./commands/upload";
import { drop } from "./commands/drop";

yargs(process.argv.slice(2))
    .scriptName("argos")
    .command<Parameters<typeof run>[0]>(
        "run <path>",
        "",
        (yargs) => {
            yargs
                .positional("path", {
                    type: "string",
                })
                .option("revision", {
                    alias: "r",
                    demandOption: true,
                    type: "string",
                })
                .option("samples", {
                    alias: "s",
                    default: 1,
                    type: "number",
                })
                .option("socketMode", {
                    alias: "m",
                    default: "unix",
                    type: "string",
                })
                .example([
                    ["$0 run ./my_project.yml -r my_revision", ""],
                    ["$0 run ./my_project.yml -r my_revision -t 2", ""],
                    ["$0 run ./my_project.yml -r my_revision -t 2 -m windows", ""],
                ]);
        },
        run,
    )
    .command<Parameters<typeof upload>[0]>(
        "upload <paths...>",
        "",
        (yargs) => {
            yargs
                .positional("paths", {})
                .option("url", {
                    alias: "u",
                    default: "http://localhost:3001",
                    type: "string",
                })
                .example([
                    ["$0 upload data/my_project/my_revision-*.json", ""],
                    ["$0 upload data/**/*.json -- -u http://example.com", ""],
                ]);
        },
        upload,
    )
    .command<Parameters<typeof drop>[0]>(
        "drop <project>",
        "",
        (yargs) => {
            yargs
                .positional("project", { type: "string" })
                .option("url", {
                    alias: "u",
                    default: "http://localhost:3001",
                    type: "string",
                })
                .example([
                    ["$0 drop my_project", ""],
                    ["$0 drop my_project -- -u http://example.com", ""],
                ]);
        },
        drop,
    )
    .strict()
    .version(false)
    .help().argv;
