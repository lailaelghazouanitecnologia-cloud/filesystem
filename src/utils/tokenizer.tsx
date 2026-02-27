import React from "react";

/* ------------------------------------------------------------------ */
/*  Lightweight tokenizer — zero dependencies, covers the common      */
/*  patterns across JS/TS/Python/Rust/Go/HTML/CSS/JSON/Shell/SQL      */
/* ------------------------------------------------------------------ */

export type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "operator"
  | "punctuation"
  | "function"
  | "type"
  | "property"
  | "tag"
  | "attr"
  | "plain";

interface Token {
  type: TokenType;
  value: string;
}

/* --- keyword sets ------------------------------------------------- */

const KW = new Set([
  // JS / TS
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "do", "switch", "case", "break", "continue", "new", "delete", "typeof",
  "instanceof", "in", "of", "class", "extends", "super", "this", "import",
  "export", "from", "default", "async", "await", "yield", "try", "catch",
  "finally", "throw", "void", "true", "false", "null", "undefined",
  // TS extras
  "interface", "type", "enum", "implements", "declare", "readonly", "as",
  "is", "keyof", "namespace", "module",
  // Python
  "def", "lambda", "with", "as", "pass", "raise", "except", "global",
  "nonlocal", "assert", "del", "print", "elif", "None", "True", "False",
  "self", "and", "or", "not",
  // Rust
  "fn", "pub", "mod", "use", "crate", "impl", "trait", "struct", "enum",
  "match", "loop", "move", "mut", "ref", "where", "unsafe", "extern",
  "static", "dyn", "async", "await",
  // Go
  "func", "package", "range", "defer", "go", "chan", "select", "map",
  "fallthrough", "goto",
  // General
  "abstract", "final", "override", "private", "protected", "public",
  // Shell
  "then", "fi", "done", "esac", "echo", "exit",
  // SQL
  "SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE",
  "DROP", "ALTER", "TABLE", "INTO", "VALUES", "SET", "JOIN", "ON",
  "AND", "OR", "NOT", "NULL", "ORDER", "BY", "GROUP", "HAVING", "LIMIT",
  // CSS at-rules
  "@import", "@media", "@keyframes",
  // HTML
  "DOCTYPE",
]);

const TYPES = new Set([
  "string", "number", "boolean", "any", "void", "never", "unknown", "object",
  "String", "Number", "Boolean", "Array", "Object", "Map", "Set", "Promise",
  "Record", "Partial", "Required", "Readonly", "Pick", "Omit",
  "i32", "i64", "u32", "u64", "f32", "f64", "usize", "isize", "bool",
  "str", "Vec", "Option", "Result", "Box", "Rc", "Arc",
  "int", "float", "complex", "list", "dict", "tuple", "set", "frozenset",
  "int8", "int16", "int32", "int64", "uint8", "uint16", "uint32", "uint64",
  "float32", "float64", "byte", "rune", "error",
  "React", "JSX", "ReactNode", "FC", "Component",
]);

/* --- tokenize ----------------------------------------------------- */

export function tokenize(code: string, lang: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = code.length;

  const isIdStart = (c: string) => /[a-zA-Z_$@]/.test(c);
  const isIdChar = (c: string) => /[a-zA-Z0-9_$]/.test(c);
  const isDigit = (c: string) => /[0-9]/.test(c);
  const isOp = (c: string) => "=+-*/<>!&|^~%?:".includes(c);
  const isPunc = (c: string) => "(){}[];,.".includes(c);

  const isHtmlLike = ["html", "xml", "svg", "jsx", "tsx"].includes(lang);

  while (i < len) {
    const ch = code[i];

    // --- line comment: // or #
    if (
      (ch === "/" && code[i + 1] === "/") ||
      (ch === "#" && !isHtmlLike)
    ) {
      const start = i;
      while (i < len && code[i] !== "\n") i++;
      tokens.push({ type: "comment", value: code.slice(start, i) });
      continue;
    }

    // --- block comment /* ... */
    if (ch === "/" && code[i + 1] === "*") {
      const start = i;
      i += 2;
      while (i < len && !(code[i] === "*" && code[i + 1] === "/")) i++;
      i += 2;
      tokens.push({ type: "comment", value: code.slice(start, i) });
      continue;
    }

    // --- HTML comment <!-- ... -->
    if (isHtmlLike && ch === "<" && code.slice(i, i + 4) === "<!--") {
      const start = i;
      i += 4;
      while (i < len && code.slice(i, i + 3) !== "-->") i++;
      i += 3;
      tokens.push({ type: "comment", value: code.slice(start, i) });
      continue;
    }

    // --- strings: " ' `
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      const start = i;
      i++;
      while (i < len && code[i] !== quote) {
        if (code[i] === "\\") i++;
        i++;
      }
      i++; // closing quote
      tokens.push({ type: "string", value: code.slice(start, i) });
      continue;
    }

    // --- HTML/JSX tags
    if (isHtmlLike && ch === "<") {
      const start = i;
      i++;
      if (code[i] === "/") i++;
      // tag name
      let tagStart = i;
      while (i < len && isIdChar(code[i])) i++;
      const tagName = code.slice(tagStart, i);
      if (tagName) {
        tokens.push({ type: "punctuation", value: code.slice(start, tagStart) });
        tokens.push({ type: "tag", value: tagName });
        // attributes
        while (i < len && code[i] !== ">" && !(code[i] === "/" && code[i + 1] === ">")) {
          if (code[i] === '"' || code[i] === "'") {
            const q = code[i];
            const qs = i;
            i++;
            while (i < len && code[i] !== q) { if (code[i] === "\\") i++; i++; }
            i++;
            tokens.push({ type: "string", value: code.slice(qs, i) });
          } else if (isIdStart(code[i])) {
            const as = i;
            while (i < len && isIdChar(code[i])) i++;
            tokens.push({ type: "attr", value: code.slice(as, i) });
          } else {
            tokens.push({ type: "punctuation", value: code[i] });
            i++;
          }
        }
        // closing > or />
        if (i < len) {
          if (code[i] === "/" && code[i + 1] === ">") {
            tokens.push({ type: "punctuation", value: "/>" });
            i += 2;
          } else {
            tokens.push({ type: "punctuation", value: ">" });
            i++;
          }
        }
        continue;
      }
      // not a tag, just a <
      tokens.push({ type: "operator", value: "<" });
      i = start + 1;
      continue;
    }

    // --- numbers
    if (isDigit(ch) || (ch === "." && i + 1 < len && isDigit(code[i + 1]))) {
      const start = i;
      if (ch === "0" && (code[i + 1] === "x" || code[i + 1] === "b" || code[i + 1] === "o")) {
        i += 2;
        while (i < len && /[0-9a-fA-F_]/.test(code[i])) i++;
      } else {
        while (i < len && (isDigit(code[i]) || code[i] === "." || code[i] === "_")) i++;
        if (i < len && (code[i] === "e" || code[i] === "E")) {
          i++;
          if (i < len && (code[i] === "+" || code[i] === "-")) i++;
          while (i < len && isDigit(code[i])) i++;
        }
      }
      tokens.push({ type: "number", value: code.slice(start, i) });
      continue;
    }

    // --- identifiers & keywords
    if (isIdStart(ch)) {
      const start = i;
      while (i < len && isIdChar(code[i])) i++;
      const word = code.slice(start, i);

      if (KW.has(word)) {
        tokens.push({ type: "keyword", value: word });
      } else if (TYPES.has(word)) {
        tokens.push({ type: "type", value: word });
      } else if (i < len && code[i] === "(") {
        tokens.push({ type: "function", value: word });
      } else if (start > 0 && code[start - 1] === ".") {
        tokens.push({ type: "property", value: word });
      } else {
        tokens.push({ type: "plain", value: word });
      }
      continue;
    }

    // --- operators
    if (isOp(ch)) {
      const start = i;
      while (i < len && isOp(code[i])) i++;
      tokens.push({ type: "operator", value: code.slice(start, i) });
      continue;
    }

    // --- punctuation
    if (isPunc(ch)) {
      tokens.push({ type: "punctuation", value: ch });
      i++;
      continue;
    }

    // --- whitespace & other
    const start = i;
    while (i < len && !isIdStart(code[i]) && !isDigit(code[i]) && !isOp(code[i])
      && !isPunc(code[i]) && code[i] !== '"' && code[i] !== "'" && code[i] !== "`"
      && code[i] !== "/" && code[i] !== "#" && code[i] !== "<") {
      i++;
    }
    if (i === start) i++; // safety
    tokens.push({ type: "plain", value: code.slice(start, i) });
  }

  return tokens;
}

/* --- map extension to lang hint ----------------------------------- */

const extToLang: Record<string, string> = {
  ts: "ts", tsx: "tsx", js: "js", jsx: "jsx",
  py: "py", rs: "rs", go: "go", java: "java",
  c: "c", cpp: "cpp", h: "c",
  rb: "rb", php: "php", swift: "swift", kt: "kt",
  css: "css", html: "html", xml: "xml", svg: "svg",
  sql: "sql", sh: "sh", bash: "sh",
  json: "json", yaml: "yaml", yml: "yaml", toml: "toml",
  md: "md", txt: "txt",
  dockerfile: "sh", makefile: "sh",
  gitconfig: "ini", bashrc: "sh",
  ini: "ini", cfg: "ini", env: "sh",
};

export function getLang(ext: string, filename: string): string {
  if (ext && extToLang[ext]) return extToLang[ext];
  const lower = filename.toLowerCase();
  if (lower.includes("dockerfile")) return "sh";
  if (lower.includes("bashrc") || lower.includes("gitconfig")) return "sh";
  return "txt";
}

/* --- React component: highlighted source -------------------------- */

export function Highlighted({ code, lang }: { code: string; lang: string }) {
  const tokens = tokenize(code, lang);
  return (
    <>
      {tokens.map((tok, i) => (
        tok.type === "plain"
          ? <span key={i}>{tok.value}</span>
          : <span key={i} className={`tok-${tok.type}`}>{tok.value}</span>
      ))}
    </>
  );
}
