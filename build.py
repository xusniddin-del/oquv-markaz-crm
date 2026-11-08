#!/usr/bin/env python3
"""Manba fayllarni bitta HTML faylga yig‘adi: dist/oquv-markaz-crm.html va Claude sahifasi uchun nusxa."""
import pathlib, re, sys
root = pathlib.Path(__file__).parent
src = root / "src"
css = (src / "style-v1.css").read_text(encoding="utf-8") + (src / "style-v2.css").read_text(encoding="utf-8")
js = "\n".join((src / f).read_text(encoding="utf-8") for f in ["1-asos.js", "2-ui.js", "3-ilova.js", "4-bolimlar.js", "5-moliya.js", "6-hodisalar.js", "8-yangi.js", "9-server.js", "7-demo.js"])
head = """<title>O‘quv Markaz CRM</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#2563EB">
<meta name="description" content="O‘quv markazlari uchun CRM: o‘quvchilar, guruhlar, davomat, to‘lovlar, qarzdorlar va hisobotlar. 14 kun bepul.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%232563EB'/%3E%3Ctext x='32' y='42' font-family='Arial' font-weight='700' font-size='26' fill='white' text-anchor='middle'%3EOM%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&family=Unbounded:wght@600;700&display=swap">
<style>""" + css + """</style>"""
body = """
<div class="ilova">
  <aside class="yon" id="yon" aria-label="Bo‘limlar"></aside>
  <div class="asosiy">
    <header class="top" id="top"></header>
    <main class="main" id="main" tabindex="-1"></main>
  </div>
</div>
<nav class="pastki" id="pastki" aria-label="Asosiy bo‘limlar"></nav>
<div class="toast-joy" id="toast" aria-live="polite"></div>
<input type="file" id="fayl-tikla" accept=".json,application/json" hidden>
<input type="file" id="fayl-import" accept=".csv,.txt,text/csv" hidden>
<script>
""" + js + """
</script>
"""
dist = root / "dist"; dist.mkdir(exist_ok=True)
toliq = '<!DOCTYPE html>\n<html lang="uz">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + head + "\n</head>\n<body>" + body + "</body>\n</html>\n"
(dist / "oquv-markaz-crm.html").write_text(toliq, encoding="utf-8")
(root / "index.html").write_text(toliq, encoding="utf-8")          # GitHub Pages sahifasi
(dist / "artifact.html").write_text(head + "\n" + body, encoding="utf-8")
print("ok", len(toliq) // 1024, "KB")
