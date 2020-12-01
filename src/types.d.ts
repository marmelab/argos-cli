export type Meta = {
    project: string;
    revision: string;
    sample: number;
    container: string;
};

export type IntervalJSON = {
    started: string;
    ended: string;
    elapsed: string;
    title: string;
};

// https://github.com/moby/moby/blob/c1d090fcc88fa3bc5b804aead91ec60e30207538/api/types/stats.go#L172-L181
export type StatsJSON = Stats & {
    name: string;
    id: string;
    networks: Record<string, NetworkStats>;
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
type BlkioStatEntry = {
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
