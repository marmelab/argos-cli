import axios from "axios";
import * as fs from "fs";
import type { Meta, StatsJSON } from "./types";

axios.defaults.headers.post["Content-Type"] = "application/json";

const uploadRawStats = async (
    url: string,
    meta: Meta,
    rawStats: StatsJSON[],
): Promise<void> => {
    const response = await axios.post<number>(
        `${url}/projects/${meta.project}/revisions/${meta.revision}/samples/${meta.sample}/containers/${meta.container}/stats`,
        rawStats,
    );
    console.log(`${response.data} stats uploaded`);
};

export const upload = async (args: { paths: string[]; url: string }): Promise<void> => {
    for (const path of args.paths) {
        if (/\.json$/.test(path) === false) {
            throw new Error("not a JSON file");
        }
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
        await uploadRawStats(args.url, meta, rawStats);
    }

    console.log(`Send terminated`);
};
