// What kind of file a path names, by its extension only (the creator never
// reads files). One place for it: intake rules pick files by kind, extraction
// says media needs a transcript, the capability map describes the material.

const EXTENSIONS = {
  text: ["md", "markdown", "txt", "text", "csv", "tsv", "json", "jsonl", "yaml", "yml", "xml", "html", "htm", "rtf", "org", "rst", "tex", "log",
    "js", "mjs", "cjs", "ts", "tsx", "jsx", "py", "rb", "go", "rs", "java", "c", "h", "cpp", "cs", "swift", "kt", "php", "sh", "sql", "css"],
  pdf: ["pdf"],
  document: ["doc", "docx", "odt", "pages", "epub", "ppt", "pptx", "key", "odp", "xls", "xlsx", "numbers", "ods"],
  audio: ["mp3", "wav", "m4a", "aac", "flac", "ogg", "oga", "opus", "aiff", "aif", "wma"],
  video: ["mp4", "mov", "m4v", "mkv", "avi", "webm", "wmv", "flv", "mpg", "mpeg", "3gp"],
  image: ["png", "jpg", "jpeg", "gif", "webp", "heic", "heif", "bmp", "tif", "tiff", "svg"],
};

export const KINDS = [...Object.keys(EXTENSIONS), "other"];

const KIND_OF_EXTENSION = new Map(
  Object.entries(EXTENSIONS).flatMap(([kind, extensions]) => extensions.map((extension) => [extension, kind])),
);

// "notes/a.MD" → "md"; no extension (or a dotfile like ".env") → "".
export function extensionOf(path) {
  const name = String(path).split("/").at(-1);
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

// → one of KINDS.
export const kindOf = (path) => KIND_OF_EXTENSION.get(extensionOf(path)) ?? "other";

export const isMedia = (path) => ["audio", "video"].includes(kindOf(path));
