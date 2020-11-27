import axios from "axios";

axios.defaults.headers.post["Content-Type"] = "application/json";

export const drop = async (args: { project: string; url: string }): Promise<void> => {
    const response = await axios.post<number>(
        `${args.url}/projects/${args.project}/drop`,
    );
    console.log(`${response.data} stats dropped`);
};
