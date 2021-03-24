import * as child_process from "child_process";
import * as path from "path";

export const gatherStats = (
    container: string,
    socketPath: string,
    callback: (stats: string) => void,
): child_process.ChildProcess => {
    const childProcess = child_process.fork(path.resolve(__dirname, "./getStatOfContainer"), [
        socketPath,
        `/containers/${container}/stats`,
    ]);
    const buffers: Buffer[] = [];
    childProcess.on("message", (res: {
        data: []
    }) => {
        buffers.push(Buffer.from(res.data));
    });

    childProcess.on("close", () => {
        console.log(`close ${container}:`, new Date());
        const lines: string[] = buffers
            .map((buffer) => buffer.toString())
            .join("")
            .split("\n");

        try {
            JSON.parse(lines[lines.length - 1]);
        } catch {
            lines.pop();
        }

        callback(`[${lines.join(",")}]`);
    });

    return childProcess;
};
