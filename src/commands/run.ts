import * as fs from "fs";
import * as readline from "readline";
import { safeLoad } from "js-yaml";
import * as async from "../async";
import { gatherStats } from "../gatherStats";
import type { IntervalJSON } from "../types";

export const run = async (args: {
    path: string;
    revision: string;
    samples: number;
    socketPath: string;
}): Promise<void> => {
    const config = safeLoad<{
        project: string;
        containers: string[];
        pre_commands: string[];
        commands: string[];
        out_dir: string;
        timeline: string;
    }>(fs.readFileSync(args.path, "utf8"));

    fs.lstatSync(config.out_dir).isDirectory();
    for (const preCommand of config.pre_commands) {
        console.log(preCommand);
        const result = await async.exec(preCommand);
        if (result.stderr) {
            console.error(result.stderr);
        } else {
            console.log(result.stdout);
        }
    }

    for (let sample = 0; sample <= args.samples; sample++) {
        console.log(`Sample #${sample}`);

        const directory = `${config.out_dir}/${config.project}/${args.revision}/${sample}`;
        await async.mkdir(directory, { recursive: true });

        const stats: Array<{ container: string; stats: string }> = [];
        // spawn the processes before the dockers commands are executed
        const childProcesses = config.containers.map((container) => {
            return gatherStats(container, args.socketPath, (statsStringify) => {
                stats.push({ container, stats: statsStringify });
            });
        });

        for (const command of config.commands) {
            console.log(command);
            const result = await async.exec(command);
            if (result.stderr) {
                console.error(result.stderr);
            } else {
                console.log(result.stdout);
            }
        }

        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        // sleep here to be sure that the gatherStats' callback is executed
        // and also for not killing the processes before the stream is ended
        await sleep(5000);
        childProcesses.forEach((childProcess) => {
            childProcess.kill();
        });
        await sleep(1000);

        const intervals: IntervalJSON[] = [];
        const file = readline.createInterface({
            input: fs.createReadStream(config.timeline),
            crlfDelay: Infinity,
        });
        for await (const line of file) {
            intervals.push(JSON.parse(line));
        }

        stats.map(({ container, stats }) => {
            const dataJSON = JSON.stringify({
                stats: JSON.parse(stats),
                intervals,
            });
            async.writeFile(`${directory}/${container}.json`, dataJSON);
        });
    }
};
