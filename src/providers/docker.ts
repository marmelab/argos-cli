import type { GenericStat, Provider } from "../types";

const computeGenericStats = (stats: DockerStatsJSON[]): GenericStat[] => {
    const result: GenericStat[] = [];
    if (stats.length === 0) {
        return result;
    }

    let computed: GenericStat = {
        date: new Date(stats[0].read),
        cpu: {
            availableSystemCpuUsage: 0,
            currentUsageInUserMode: 0,
            currentUsageInKernelMode: 0,
        },
        io: { currentBytes: 0 },
        network: {
            currentReceived: 0,
            currentTransmitted: 0,
        },
        memory: { usage: 0 },
    };

    for (const [i, stat] of stats.entries()) {
        if (i > 0) {
            computed = computeGenericStat(computed, stats[i - 1], stat);
        }
        result.push(computed);
    }

    return result;
};

export const docker: Provider<DockerStatsJSON> = {
    computeGenericStats,
};

const computeGenericStat = (
    previousComputed: GenericStat,
    previousStat: DockerStatsJSON,
    stat: DockerStatsJSON,
): GenericStat => {
    // the energy consumption of a chip corresponds to its number of builtin cpu
    const toSeconds = (cpu_time: number) =>
        cpu_time / (stat.cpu_stats.online_cpus * 1000000000); // Normalize to 1 cpu

    const date = new Date(stat.read);

    const computeCurrentDelta = (previousStatValue: number, newStatValue: number) =>
        Math.abs(newStatValue - previousStatValue);

    const currentUsageInUserMode = toSeconds(
        computeCurrentDelta(
            stat.precpu_stats.cpu_usage.usage_in_usermode,
            stat.cpu_stats.cpu_usage.usage_in_usermode,
        ),
    );

    const currentUsageInKernelMode = toSeconds(
        computeCurrentDelta(
            stat.precpu_stats.cpu_usage.usage_in_kernelmode,
            stat.cpu_stats.cpu_usage.usage_in_kernelmode,
        ),
    );

    const currentReceived = computeCurrentDelta(
        previousStat.networks.eth0.rx_bytes,
        stat.networks.eth0.rx_bytes,
    );

    const currentTransmitted = computeCurrentDelta(
        previousStat.networks.eth0.tx_bytes,
        stat.networks.eth0.tx_bytes,
    );

    const currentBytes = computeCurrentDelta(
        sumBlkioStats(previousStat.blkio_stats.io_service_bytes_recursive),
        sumBlkioStats(stat.blkio_stats.io_service_bytes_recursive),
    );

    const availableSystemCpuUsage = toSeconds(
        computeCurrentDelta(
            stat.precpu_stats.system_cpu_usage,
            stat.cpu_stats.system_cpu_usage,
        ),
    );

    const usage = Math.max(previousComputed.memory.usage, stat.memory_stats.usage);

    const computed = {
        date,
        cpu: {
            availableSystemCpuUsage,
            currentUsageInUserMode,
            currentUsageInKernelMode,
        },
        io: { currentBytes },
        network: { currentReceived, currentTransmitted },
        memory: { usage },
    };

    return computed;
};

// exported for tests
export const sumBlkioStats = (blkioStats: BlkioStatEntry[]): number => {
    const blkioStatsByMajorAndMinor = new Map<string, number>([]);

    for (const blkioStat of blkioStats) {
        if (blkioStat.op === "Total") {
            blkioStatsByMajorAndMinor.set(
                [blkioStat.major, blkioStat.minor].toString(),
                blkioStat.value,
            );
        }
    }

    return [...blkioStatsByMajorAndMinor.values()].reduce(
        (previousValue, currentValue) => {
            return previousValue + currentValue;
        },
        0,
    );
};

/*
 * Raw Docker Metrics
 */
// https://github.com/moby/moby/blob/c1d090fcc88fa3bc5b804aead91ec60e30207538/api/types/stats.go#L172-L181
export type DockerStatsJSON = Stats & {
    name: string;
    id: string;
    networks: Record<string, NetworkStats>;
};

// https://github.com/moby/moby/blob/c1d090fcc88fa3bc5b804aead91ec60e30207538/api/types/stats.go#L117-L141
type NetworkStats = {
    rx_bytes: number;
    rx_packets: number;
    rx_errors: number;
    rx_dropped: number;
    tx_bytes: number;
    tx_packets: number;
    tx_errors: number;
    tx_dropped: number;
};

// https://github.com/moby/moby/blob/c1d090fcc88fa3bc5b804aead91ec60e30207538/api/types/stats.go#L153-L170
type Stats = {
    // Common stats
    read: string;
    preread: string;

    // Linux specific stats, not populated on Windows.
    pids_stats: PidsStats;
    blkio_stats: BlkioStats;

    // Windows specific stats, not populated on Linux.
    // NumProcs     uint32       `json:"num_procs"`
    num_procs?: number;
    // StorageStats StorageStats `json:"storage_stats,omitempty"`

    // Shared stats

    cpu_stats: CPUStats;
    precpu_stats: CPUStats;
    memory_stats: MemoryStats;
};

// https://github.com/moby/moby/blob/c1d090fcc88fa3bc5b804aead91ec60e30207538/api/types/stats.go#L143-L150
type PidsStats = {
    current: number;
    limit?: number;
};

// https://github.com/moby/moby/blob/c1d090fcc88fa3bc5b804aead91ec60e30207538/api/types/stats.go#L93-L107
type BlkioStats = {
    io_service_bytes_recursive: BlkioStatEntry[];
    io_serviced_recursive: BlkioStatEntry[];
    io_queue_recursive: BlkioStatEntry[];
    io_service_time_recursive: BlkioStatEntry[];
    io_wait_time_recursive: BlkioStatEntry[];
    io_merged_recursive: BlkioStatEntry[];
    io_time_recursive: BlkioStatEntry[];
    sectors_recursive: BlkioStatEntry[];
};

// https://github.com/moby/moby/blob/c1d090fcc88fa3bc5b804aead91ec60e30207538/api/types/stats.go#L84-L91
export type BlkioStatEntry = {
    major: number;
    minor: number;
    op: string;
    value: number;
};

// https://github.com/moby/moby/blob/c1d090fcc88fa3bc5b804aead91ec60e30207538/api/types/stats.go#L42-L55
type CPUStats = {
    cpu_usage: CPUUsage;
    system_cpu_usage: number;
    online_cpus: number;
    throttling_data: ThrottlingData;
};

// https://github.com/moby/moby/blob/c1d090fcc88fa3bc5b804aead91ec60e30207538/api/types/stats.go#L57-L82
type MemoryStats = {
    usage: number;
    max_usage: number;
    stats: Record<string, number>;
    failcnt: number;
    limit: number;
};

// https://github.com/moby/moby/blob/c1d090fcc88fa3bc5b804aead91ec60e30207538/api/types/stats.go#L18-L40
type CPUUsage = {
    // Total CPU time consumed.
    // Units: nanoseconds (Linux)
    // Units: 100's of nanoseconds (Windows)
    total_usage: number;

    // Total CPU time consumed per core (Linux). Not used on Windows.
    // Units: nanoseconds.
    percpu_usage: number[];

    // Time spent by tasks of the cgroup in kernel mode (Linux).
    // Time spent by all container processes in kernel mode (Windows).
    // Units: nanoseconds (Linux).
    // Units: 100's of nanoseconds (Windows). Not populated for Hyper-V Containers.
    usage_in_kernelmode: number;

    // Time spent by tasks of the cgroup in user mode (Linux).
    // Time spent by all container processes in user mode (Windows).
    // Units: nanoseconds (Linux).
    // Units: 100's of nanoseconds (Windows). Not populated for Hyper-V Containers
    usage_in_usermode: number;
};

// ThrottlingData stores CPU throttling stats of one running container.
// Not used on Windows.
type ThrottlingData = {
    /** Number of periods with throttling active */
    periods: number;
    /** Number of periods when the container hits its throttling limit. */
    throttled_periods: number;
    /** Aggregate time the container was throttled for in nanoseconds. */
    throttled_time: number;
};
