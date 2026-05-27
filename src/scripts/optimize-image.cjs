#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

function usage() {
  console.log(`Usage:
  node src/scripts/optimize-image.cjs <input> [output] [--width 1200] [--quality 82]

Examples:
  node src/scripts/optimize-image.cjs image.png public/gen-ai/thumb.webp
  node src/scripts/optimize-image.cjs image.jpg --width 1200 --quality 78`);
}

function parseArgs(argv) {
  const args = {
    input: null,
    output: null,
    width: 1200,
    quality: 82,
  };

  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--help" || value === "-h") {
      args.help = true;
    } else if (value === "--width" || value === "-w") {
      args.width = Number(argv[++i]);
    } else if (value === "--quality" || value === "-q") {
      args.quality = Number(argv[++i]);
    } else {
      positional.push(value);
    }
  }

  args.input = positional[0] || null;
  args.output = positional[1] || null;
  return args;
}

function defaultOutput(input) {
  const parsed = path.parse(input);
  return path.join(parsed.dir, `${parsed.name}.webp`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    return;
  }

  if (!args.input) {
    usage();
    process.exitCode = 2;
    return;
  }

  if (!Number.isInteger(args.width) || args.width < 1) {
    throw new Error("--width must be a positive integer");
  }

  if (!Number.isInteger(args.quality) || args.quality < 1 || args.quality > 100) {
    throw new Error("--quality must be an integer between 1 and 100");
  }

  const input = path.resolve(args.input);
  const output = path.resolve(args.output || defaultOutput(input));

  if (!fs.existsSync(input)) {
    throw new Error(`Input file not found: ${input}`);
  }

  fs.mkdirSync(path.dirname(output), { recursive: true });

  const before = fs.statSync(input).size;
  const image = sharp(input, { animated: false }).rotate();
  const metadata = await image.metadata();

  await image
    .resize({
      width: Math.min(args.width, metadata.width || args.width),
      withoutEnlargement: true,
    })
    .webp({
      quality: args.quality,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(output);

  const after = fs.statSync(output).size;
  const saved = before > 0 ? ((before - after) / before) * 100 : 0;

  console.log(`${input} -> ${output}`);
  console.log(`${before} bytes -> ${after} bytes (${saved.toFixed(1)}% saved)`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
