import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function columnIndex(reference: string) {
  return reference.replace(/\d/g, "").split("").reduce((total, character) => total * 26 + character.charCodeAt(0) - 64, 0) - 1;
}

function columnName(index: number) {
  let result = "";
  for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26)) result = String.fromCharCode(((value - 1) % 26) + 65) + result;
  return result;
}

export function readSimpleXlsx(buffer: ArrayBuffer): Array<Record<string, string>> {
  const archive = unzipSync(new Uint8Array(buffer));
  const worksheet = archive["xl/worksheets/sheet1.xml"];
  if (!worksheet) throw new Error("El libro no contiene una primera hoja compatible.");
  const shared = archive["xl/sharedStrings.xml"]
    ? [...new DOMParser().parseFromString(strFromU8(archive["xl/sharedStrings.xml"]), "application/xml").querySelectorAll("si")].map((item) => item.textContent ?? "")
    : [];
  const document = new DOMParser().parseFromString(strFromU8(worksheet), "application/xml");
  const matrix = [...document.querySelectorAll("row")].map((row) => {
    const values: string[] = [];
    row.querySelectorAll("c").forEach((cell) => {
      const index = columnIndex(cell.getAttribute("r") ?? "A1");
      const raw = cell.querySelector("v")?.textContent ?? cell.querySelector("is t")?.textContent ?? "";
      values[index] = cell.getAttribute("t") === "s" ? shared[Number(raw)] ?? "" : raw;
    });
    return values;
  });
  const headers = matrix.shift()?.map((value, index) => value || `columna_${index + 1}`) ?? [];
  return matrix.filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

export function writeSimpleXlsx(rows: Array<Record<string, string>>): Uint8Array {
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const matrix = [headers, ...rows.map((row) => headers.map((header) => String(row[header] ?? "")))];
  const sheetRows = matrix.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndexValue) => `<c r="${columnName(columnIndexValue)}${rowIndex + 1}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`).join("")}</row>`).join("");
  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`),
    "xl/workbook.xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Territorio" sheetId="1" r:id="rId1"/></sheets></workbook>`),
    "xl/_rels/workbook.xml.rels": strToU8(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`),
    "xl/worksheets/sheet1.xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`),
  };
  return zipSync(files, { level: 6 });
}
