// Reads public/resume.pdf the way an ATS parser does (PDFKit text extraction) and checks it.
// Usage: swift .claude/skills/resume-pdf/check-ats.swift public/resume.pdf  (or: pnpm resume:check)
import Foundation
import PDFKit

let path = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "public/resume.pdf"
guard let doc = PDFDocument(url: URL(fileURLWithPath: path)) else {
  print("FAIL  cannot open \(path)"); exit(1)
}
var failures = 0
func check(_ ok: Bool, _ label: String, _ detail: String = "") {
  print((ok ? "OK    " : "FAIL  ") + label + (detail.isEmpty ? "" : "  (\(detail))"))
  if !ok { failures += 1 }
}

let text = doc.string ?? ""
let lines = text.split(separator: "\n").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }

check(doc.pageCount == 2, "2 pages", "\(doc.pageCount)")
check(text.count > 3000, "real, selectable text", "\(text.count) chars")
check(lines.first?.hasPrefix("TEO CHOONG CHING") ?? false, "name is the first line", lines.first ?? "none")
check(lines.prefix(4).contains { $0.contains("@") }, "contact details in the body, top of page 1")

// Standard section headers, each on its own line, in this order.
let headers = ["PROFESSIONAL SUMMARY", "SKILLS", "PROFESSIONAL EXPERIENCE", "EDUCATION", "CERTIFICATIONS"]
let found = headers.map { h in lines.firstIndex(of: h) }
check(!found.contains(nil), "standard section headers present",
      zip(headers, found).filter { $0.1 == nil }.map { $0.0 }.joined(separator: ", "))
let idx = found.compactMap { $0 }
check(idx == idx.sorted(), "sections in reading order")

// Role lines: "Title | Company | Mon YYYY – Mon YYYY" (or Present).
let role = try! NSRegularExpression(pattern: "^[^|]+ \\| [^|]+ \\| [A-Z][a-z]{2} \\d{4} – ([A-Z][a-z]{2} \\d{4}|Present)$")
let roles = lines.filter { role.firstMatch(in: $0, range: NSRange($0.startIndex..., in: $0)) != nil }
check(roles.count >= 5, "role lines follow Title | Company | dates", "\(roles.count) found")

// Characters that garble parsing or break CC's copy rules.
let ligatures = text.unicodeScalars.filter { (0xFB00...0xFB06).contains($0.value) }.count
check(ligatures == 0, "no ligature glyphs (ﬁ ﬂ)", "\(ligatures)")
check(!text.contains("\u{FFFD}"), "no unreadable characters")
check(!text.contains("—"), "no em dashes")

let title = (doc.documentAttributes?[PDFDocumentAttribute.titleAttribute] as? String) ?? ""
check(title.contains("Teo Choong Ching"), "PDF title metadata", title)

var links = Set<String>()
for i in 0..<doc.pageCount { for a in doc.page(at: i)!.annotations { if let u = a.url { links.insert(u.absoluteString) } } }
check(links.contains { $0.contains("designby.cc") } && links.contains { $0.contains("linkedin.com") },
      "clickable links", "\(links.count)")

print(failures == 0 ? "\nATS check passed." : "\nATS check: \(failures) failed.")
exit(failures == 0 ? 0 : 1)
