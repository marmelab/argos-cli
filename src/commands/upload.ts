import axios from "axios";
import * as fs from "fs";
import * as readline from "readline";
import type { Meta, StatsJSON, IntervalJSON } from "../types";

axios.defaults.headers.post["Content-Type"] = "application/json";

const uploadRawStats = async (
    url: string,
    meta: Meta,
    rawStats: StatsJSON[],
    intervals: IntervalJSON[],
): Promise<void> => {
    const response = await axios.post<number>(
        `${url}/projects/${meta.project}/revisions/${meta.revision}/samples/${meta.sample}/containers/${meta.container}/stats`,
        { stats: rawStats, intervals },
    );
    console.log(`${response.data} stats uploaded`);
};

export const upload = async (args: { paths: string[]; url: string }): Promise<void> => {
    const intervals: IntervalJSON[] = [];
    const timelinePath = args.paths.find((path) => /timeline.txt$/.test(path));
    if (timelinePath) {
        const file = readline.createInterface({
            input: fs.createReadStream(timelinePath),
            crlfDelay: Infinity,
        });
        for await (const line of file) {
            intervals.push(JSON.parse(line));
        }
    }

    for (const path of args.paths) {
        if (/\.json$/.test(path)) {
            const [container, sample, revision, project] = path
                .replace(".json", "")
                .split("/")
                .reverse();
            const meta: Meta = {
                container,
                project,
                revision,
                sample: parseInt(sample, 10),
            };

            const rawStats: StatsJSON[] = JSON.parse(fs.readFileSync(path, "utf8"));
            await uploadRawStats(args.url, meta, rawStats, intervals);
        }
    }

    console.log(`Send terminated`);
};
