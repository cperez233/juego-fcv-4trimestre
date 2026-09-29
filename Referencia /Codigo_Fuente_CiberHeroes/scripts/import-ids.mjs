import fs from "fs";

const src = "C:/Users/ramiroavila/Downloads/ingreso - Hoja 1.csv";
const out = "public/data/identificaciones.csv";

const raw = fs.readFileSync(src, "utf8");
const ids = [
  ...new Set(
    raw
      .split(/\r?\n/)
      .map((l) => l.trim().replace(/^"|"$/g, ""))
      .filter((l) => /^\d{4,15}$/.test(l))
  ),
];
ids.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

fs.mkdirSync("public/data", { recursive: true });
fs.writeFileSync(out, "identificacion\n" + ids.join("\n") + "\n");
console.log("OK", ids.length, "ids ->", out);
console.log("sample:", ids.slice(0, 5).join(", "));
