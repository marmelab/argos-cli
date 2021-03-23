import * as child_process from "child_process";

export const gatherStats = (
    container: string,
    socketPath: string,
    callback: (stats: string) => void,
): child_process.ChildProcess => {
    const childProcess = child_process.fork("getStatOfContainer.ts", [
        socketPath,
        `/containers/${container}/stats`,
    ]);
    const buffers: Buffer[] = [];
    childProcess.stdout?.on("data", (buffer) => {
        buffers.push(buffer);
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
