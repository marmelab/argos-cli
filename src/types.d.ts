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

export type Provider<S> = {
    computeGenericStats: (stats: S[]) => GenericStat[];
};

/*
 * given a chronologically ordered list of GenericStat
 * an entry of index i gives statistics about the period between entry[i-1] and entry[i]
 * entry[0] contains no information: fields are null except date
 * entry[1] contains cpu, io, network and memory usage between entry[0].date and entry[1].date
 */
export type GenericStat = {
    date: Date;
    cpu: {
        availableSystemCpuUsage: number; // in seconds (corresponds to entry[i].date - entry[i-1].date)
        currentUsageInUserMode: number;
        currentUsageInKernelMode: number;
    };
    io: {
        currentBytes: number; // disk inputs and outputs in bytes
    };
    network: {
        currentReceived: number; // network inputs in bytes
        currentTransmitted: number; // network outputs in bytes
    };
    memory: { usage: number }; // max of memory usage in bytes
};
