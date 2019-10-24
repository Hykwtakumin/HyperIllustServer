import * as Debug from "debug";
import { IDebugger } from "debug";

export type Logger = {
  debug: IDebugger;
  error: IDebugger;
  info: IDebugger;
  warn: IDebugger;
  throwError: (msg: string | Error) => void;
};
export const logger = (namespace: string): Logger => {
  return {
    debug: Debug(`drawwiki:${namespace}`),
    error: Debug(`drawwiki:error:${namespace}`),
    info: Debug(`drawwiki:info:${namespace}`),
    warn: Debug(`drawwiki:warn:${namespace}`),
    throwError: msg => {
      throw new Error(`${namespace}: ${msg}`);
    }
  };
};
