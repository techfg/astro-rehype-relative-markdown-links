import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { rehype } from "rehype";
import { visit } from "unist-util-visit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import astroRehypeRelativeMarkdownLinks from "./index.mjs";

function testSetupRehype(options = {}) {
  return (tree, file) => {
    visit(tree, "element", (node) => {
      const fileInHistory = path.resolve(__dirname, __filename);

      if (!file.history.includes(fileInHistory)) {
        file.history.push(fileInHistory);
      }
    });
  };
}

test("astroRehypeRelativeMarkdownLinks", async (t) => {
  await t.test("should transform file paths that exist", async () => {
    const input = '<a href="./fixtures/test.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures/test">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  await t.test("should transform index.md file paths that exist", async () => {
    const input = '<a href="./fixtures/index.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="/fixtures">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  await t.test(
    "should transform encoded file paths that exist with capital letters",
    async () => {
      const input = '<a href="./fixtures/test%20with%20SPACE.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/fixtures/test-with-space">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );

  await t.test(
    "should keep query and fragment for file paths that exist",
    async () => {
      const input = '<a href="./fixtures/test.md?q=q#hash">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/fixtures/test?q=q#hash">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );

  await t.test(
    "should prefix base to output on file paths that exist",
    async () => {
      const input = '<a href="./fixtures/test.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, {
          contentPath: "src",
          basePath: "/testBase",
        })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/testBase/fixtures/test">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );

  await t.test(
    "should not replace path if relative file does not exist",
    async () => {
      const input = '<a href="./fixtures/does-not-exist.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="./fixtures/does-not-exist.md">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );

  await t.test(
    "should transform file paths that exist with non alphanumeric characters",
    async () => {
      const input = '<a href="./fixtures/test%20(non-alpha).md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="/fixtures/test-non-alpha">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );

  await t.test("should not replace absolute path if file exists", async () => {
    const absolutePath = path.resolve("./fixtures/test.md");
    const input = `<a href="${absolutePath}">foo</a>`;
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected = `<html><head></head><body><a href="${absolutePath}">foo</a></body></html>`;

    assert.equal(actual, expected);
  });

  await t.test(
    "should not replace absolute path if file does not exist",
    async () => {
      const absolutePath = `${path.dirname(path.resolve("./fixtures/test.md"))}/does-not-exist.md`;
      const input = `<a href="${absolutePath}">foo</a>`;
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected = `<html><head></head><body><a href="${absolutePath}">foo</a></body></html>`;

      assert.equal(actual, expected);
    },
  );

  await t.test(
    "should not transform index.md file paths if file does not exist",
    async () => {
      const input = '<a href="./fixtures/does-not-exist/index.md">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="./fixtures/does-not-exist/index.md">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );

  await t.test("should not replace path if .md directory exists", async () => {
    const input = '<a href="./fixtures/dir-exists.md">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/dir-exists.md">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  await t.test("should not replace path if .mdx directory exists", async () => {
    const input = '<a href="./fixtures/dir-exists.mdx">foo</a>';
    const { value: actual } = await rehype()
      .use(testSetupRehype)
      .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
      .process(input);

    const expected =
      '<html><head></head><body><a href="./fixtures/dir-exists.mdx">foo</a></body></html>';

    assert.equal(actual, expected);
  });

  await t.test(
    "should not replace path if .md directory does not exist",
    async () => {
      const input = '<a href="./fixtures/dir-does-not-exist.md/">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="./fixtures/dir-does-not-exist.md/">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );

  await t.test(
    "should not replace path if .mdx directory does not exist",
    async () => {
      const input = '<a href="./fixtures/dir-does-not-exist.mdx/">foo</a>';
      const { value: actual } = await rehype()
        .use(testSetupRehype)
        .use(astroRehypeRelativeMarkdownLinks, { contentPath: "src" })
        .process(input);

      const expected =
        '<html><head></head><body><a href="./fixtures/dir-does-not-exist.mdx/">foo</a></body></html>';

      assert.equal(actual, expected);
    },
  );
});
