import process from "process";

export const development: boolean = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export default function isDev(): boolean
{
    return development;
}

export const client_id: number = !isDev() ? 40400 : 44186;
export const API_KEY: string = !isDev() ? "b4a05fcd84cc43298ce328736d00aed9" : "48d3fd8339b1411589414a981bc3cb2c";
