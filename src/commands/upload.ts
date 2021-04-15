import axios from "axios";
import * as fs from "fs";
import type { Meta, IntervalJSON, GenericStat } from "../types";
import type { DockerStatsJSON } from "../providers/docker";
import { docker } from "../providers/docker";

axios.defaults.headers.post["Content-Type"] = "application/json";

const uploadGenericStats = async (
    url: string,
    meta: Meta,
    stats: GenericStat[],
    intervals: IntervalJSON[],
): Promise<void> => {
    const response = await axios.post<number>(
        `${url}/projects/${meta.project}/revisions/${meta.revision}/samples/${meta.sample}/containers/${meta.container}/stats`,
        { stats, intervals },
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
            }: { stats: DockerStatsJSON[]; intervals: IntervalJSON[] } = JSON.parse(
                fs.readFileSync(path, "utf8"),
            );

            const genericStats = docker.computeGenericStats(stats);
            if (stats?.length > 0 && intervals?.length >= 0) {
                await uploadGenericStats(args.url, meta, genericStats, intervals);
            }
        }
    }

    console.log(`Send terminated`);
};
