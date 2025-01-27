import type { Primitive } from "zod";

export type LiteralString = "" | (string & Record<never, never>);

export type OmitId<T extends { id: unknown }> = Omit<T, "id">;

export type Prettify<T> = Omit<T, never>;

export type PrettifyDeep<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K]
    : T[K] extends object
      ? T[K] extends Array<any>
        ? T[K]
        : T[K] extends Date
          ? T[K]
          : PrettifyDeep<T[K]>
      : T[K];
} & {};

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type LiteralUnion<LiteralType, BaseType extends Primitive> =
  | LiteralType
  | (BaseType & Record<never, never>);

export type DeepPartial<T> = T extends Function
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;
