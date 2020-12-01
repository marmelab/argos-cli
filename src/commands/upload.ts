import axios from "axios";
import * as fs from "fs";
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
    for (const path of args.paths) {
        if (/\.json$/.test(path) && fs.existsSync(path)) {
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

            const {
                stats,
                intervals,
            }: { stats: StatsJSON[]; intervals: IntervalJSON[] } = JSON.parse(
                fs.readFileSync(path, "utf8"),
            );
            if (stats?.length > 0 && intervals?.length >= 0) {
                await uploadRawStats(args.url, meta, stats, intervals);
            }
        }
    }

    console.log(`Send terminated`);
};
