import type { Options } from "./options.d.ts";

export type SplitPathFromQueryAndFragmentFn = (
  path: string,
) => [string, string | null];
export type ReplaceExtFn = (path: string, ext: string) => string;
export type IsValidRelativeLinkFn = (link: string) => boolean;
export type IsValidFile = (path: string) => boolean;
export type GenerateSlug = (pathSegments: string[]) => string;
export type ResolveSlug = (
  generatedSlug: string,
  frontmatterSlug?: unknown,
) => string;
export type ApplyTrailingSlash = (
  originalUrl: string,
  resolvedUrl: string,
  trailingSlash: Options["trailingSlash"],
) => string;
export type NormaliseAstroOutputPath = (
  initialPath: string,
  options: Options,
) => string;
export type Slash = (path: string, sep: string) => string;
export type NormalizePath = (path: string) => string;
export type ShouldProcessFile = (path: string) => boolean;
