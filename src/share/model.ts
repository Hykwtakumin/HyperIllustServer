import { isString } from "util";

/*ISO8601 format*/
export const ISO_DATE_REGEXP = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/;

export function isISO8601String(value: any): boolean {
  return isString(value) && !!value.match(ISO_DATE_REGEXP);
}

export function unwrapDate(date: string | Date) {
  if (date === null || date === void 0) return null;
  if (date instanceof Date) return date;
  if (typeof date === "string" && isISO8601String(date)) return new Date(date);
  throw new Error(`failed to unwrap date-like object: ${date}`);
}

export type DateLike = string | Date | null;

//これはメタデータにあたる
//こっちもS3に挙げると一石二鳥
export type HyperIllust = {
  id: string;
  name?: string;
  desc?: string;
  sourceKey: string;
  sourceURL: string;
  size?: number;
  referredIllusts?: string[];
  referIllusts?: string[];
  importedIllsts?: string[];
  importIllusts?: string[];
  createdAt: DateLike;
  updatedAt: DateLike;
  owner: string;
  projectName?: string;
  serializedPath?: string[];
  isForked: boolean;
  origin?: string;
  version: number;
};

export type HyperIllustUser = {
  id: string;
  name: string;
  createdAt: DateLike;
  updatedAt: DateLike;
};

export type HyperIllustParams = {
  sourceKey: string;
  sourceURL: string;
  name: string;
  desc?: string;
  size?: number;
  referredIllusts?: string[];
  referreIllusts?: string[];
  importedIllsts?: string[];
  importIllusts?: string[];
  owner: HyperIllustUser;
  projectName?: string;
  serializedPath?: string[];
  isForked: boolean;
  origin?: string;
};

export type UserParams = {
  name: string;
};
