import * as fs from "fs";
import { safeLoad } from "js-yaml";
import * as async from "../async";
import { gatherStats } from "../gatherStats";

export const run = async (args: {
    path: string;
    revision: string;
    samples: number;
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

        const childProcesses = config.containers.map((container) => {
            return gatherStats(container, (stats) => {
                async.writeFile(`${directory}/${container}.json`, stats);
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

        await async.copyFile(config.timeline, `${directory}/timeline.txt`);

        childProcesses.forEach((childProcess) => {
            // timeout is there to be sure we retrieve the end of the stream
            setTimeout(() => {
                childProcess.kill();
            }, 5000);
        });
    }
};
