#!/usr/bin/env python3
"""Build index.html from data/network.json.

Usage:  python3 tools/build.py
Edit data/network.json (members, advisors, contacts) and re-run; no other tooling needed.
"""
import json
import html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "data" / "network.json").read_text(encoding="utf-8"))
OUT = ROOT / "index.html"


def esc(s):
    return html.escape(s or "", quote=True)


def nav_links(numbered=False):
    out = []
    for i, n in enumerate(DATA["nav"], 1):
        cur = ' aria-current="page"' if n.get("current") else ""
        num = f'<span class="n">{i:02d}</span>' if numbered else ""
        out.append(f'<li><a href="{esc(n["href"])}"{cur}>{num}{esc(n["label"])}</a></li>')
    return "\n".join(out)


def advisors():
    parts = []
    for i, a in enumerate(DATA["advisors"]):
        lines = "\n".join(f"<li>{esc(l)}</li>" for l in a["lines"])
        parts.append(f'''
      <article class="adv" data-reveal style="--d:{i * 90}ms">
        <div>
          <p class="eyebrow-sm">{esc(a["group"])}</p>
          <div class="adv-photo"><img src="{esc(a["photo"])}" alt="{esc(a["name"])}" width="453" height="566" loading="lazy" decoding="async"></div>
        </div>
        <div>
          <h2>{esc(a["name"])}</h2>
          <ul class="adv-list">
{lines}
          </ul>
        </div>
      </article>''')
    return "\n".join(parts)


def gen_strip():
    btns = []
    for i, g in enumerate(DATA["members"]):
        btns.append(f'''
        <button class="gen" role="tab" id="gen-{esc(g["slug"])}" data-gen="{esc(g["slug"])}" aria-selected="{'true' if i == 0 else 'false'}" aria-controls="genpanel-{esc(g["slug"])}" tabindex="{0 if i == 0 else -1}">
          <div class="gen-bar"><span style="--d:{i * 140}ms"></span></div>
          <div class="gen-txt" style="--d:{i * 140 + 200}ms">
            <p class="gen-n">{i:02d}</p>
            <p class="gen-l">{esc(g["gen"])}</p>
          </div>
        </button>''')
    return "\n".join(btns)


def member_card(m, i):
    role = f'<span class="role">{esc(m["role"])}</span>' if m.get("role") else ""
    careers = ""
    if m.get("careers"):
        careers = '<ul class="mcard-careers">' + "".join(f"<li>{esc(c)}</li>" for c in m["careers"]) + "</ul>"
    return f'''
          <li class="mcard" data-reveal style="--d:{min(i, 11) * 55}ms">
            <div class="mcard-photo"><img src="{esc(m["photo"])}" alt="{esc(m["name"])}" width="453" height="545" loading="lazy" decoding="async"></div>
            <div class="mcard-body">
              <h4 class="mcard-name"><span>{esc(m["name"])}</span>{role}</h4>
              <p class="mcard-dept">{esc(m["dept"])}</p>
              {careers}
            </div>
          </li>'''


def gen_panels():
    parts = []
    for i, g in enumerate(DATA["members"]):
        cards = "\n".join(member_card(m, j) for j, m in enumerate(g["members"]))
        parts.append(f'''
      <div class="gen-panel" id="genpanel-{esc(g["slug"])}" role="tabpanel" aria-labelledby="gen-{esc(g["slug"])}" data-gen="{esc(g["slug"])}"{'' if i == 0 else ' hidden'}>
        <div class="gen-title"><span class="n">{i:02d}</span><h3>{esc(g["gen"])}</h3></div>
        <ul class="members">
{cards}
        </ul>
      </div>''')
    return "\n".join(parts)


def contacts():
    rows = []
    for c in DATA["footer"]["contacts"]:
        val = c["value"]
        if "@" in val:
            val_html = f'<a href="mailto:{esc(val)}">{esc(val)}</a>'
        else:
            val_html = f'<a href="tel:{esc(val.replace("-", ""))}">{esc(val)}</a>'
        name = f'<dd class="nm">{esc(c["name"])}</dd>' if c.get("name") else '<dd class="nm"></dd>'
        rows.append(f'<dt>{esc(c["role"])}</dt>{name}<dd>{val_html}</dd>')
    return "\n".join(rows)


tab_keys = ["advisors", "members", "network"]
tab_labels = DATA["tabs"]
tabs_html = "\n".join(
    f'<button class="tab" role="tab" id="tab-{k}" data-tab="{k}" aria-selected="{"true" if i == 0 else "false"}" aria-controls="panel-{k}" tabindex="{0 if i == 0 else -1}"><span class="n">{i + 1:02d}</span>{esc(l)}</button>'
    for i, (k, l) in enumerate(zip(tab_keys, tab_labels))
)

site = DATA["site"]
hero = DATA["hero"]
net = DATA["network"]
foot = DATA["footer"]

page = f'''<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(site["title"])}</title>
<meta name="description" content="{esc(net["text"][:150])}">
<meta name="theme-color" content="#05070d">
<link rel="icon" href="assets/img/urc-logo.png" type="image/png">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <div id="bg" aria-hidden="true"></div>
  <div id="bg-veil" aria-hidden="true"></div>

  <header class="nav">
    <a class="brand" href="{esc(site["home"])}" aria-label="{esc(site["org"])}">
      <img src="assets/img/urc-logo.png" alt="" width="36" height="36">
      <span><span class="brand-name">URC</span><span class="brand-sub">연세대학교 도시공학과 부동산학회</span></span>
    </a>
    <nav class="nav-links" aria-label="주 메뉴"><ul style="display:contents">
{nav_links()}
    </ul></nav>
    <button class="burger" aria-label="메뉴 열기" aria-expanded="false" aria-controls="menu"><span></span><span></span><span></span></button>
  </header>
  <div class="menu" id="menu" aria-hidden="true">
    <nav aria-label="모바일 메뉴">
      <ul>
{nav_links(numbered=True)}
      </ul>
      <p class="menu-tag">{esc(site["org"])}</p>
    </nav>
  </div>

  <main>
    <section class="hero">
      <p class="eyebrow" data-reveal>URC · Network</p>
      <h1 data-reveal style="--d:80ms">{esc(hero["title"])}<span class="dot">.</span></h1>
      <p class="hero-sub" data-reveal style="--d:160ms">{esc(site["org"])}</p>
      <div class="affil" data-reveal style="--d:240ms"><img src="{esc(hero["banner"])}" alt="{esc(hero["banner_alt"])}" width="1004" height="269"></div>
    </section>

    <div class="tabs">
      <div class="tabs-inner" role="tablist" aria-label="Network">
{tabs_html}
        <span class="tab-ind" aria-hidden="true"></span>
      </div>
    </div>

    <section class="panel" id="panel-advisors" role="tabpanel" aria-labelledby="tab-advisors" data-panel="advisors">
      <div class="section-head" data-reveal>
        <p class="eyebrow">{esc(tab_labels[0])}</p>
      </div>
{advisors()}
    </section>

    <section class="panel" id="panel-members" role="tabpanel" aria-labelledby="tab-members" data-panel="members" hidden>
      <div class="section-head" data-reveal>
        <p class="eyebrow">{esc(tab_labels[1])}</p>
      </div>
      <div class="gens">
        <div class="gen-strip" role="tablist" aria-label="기수">
{gen_strip()}
        </div>
      </div>
{gen_panels()}
    </section>

    <section class="panel" id="panel-network" role="tabpanel" aria-labelledby="tab-network" data-panel="network" hidden>
      <div class="section-head" data-reveal>
        <p class="eyebrow">{esc(tab_labels[2])}</p>
      </div>
      <div class="net">
        <p class="net-text" data-reveal style="--d:80ms">{esc(net["text"])}</p>
        <div data-reveal style="--d:200ms">
          <div class="net-photo"><img src="{esc(net["photo"])}" alt="" width="1024" height="673" loading="lazy" decoding="async"></div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="foot-inner">
      <div>
        <p class="foot-org">{esc(foot["org"])}</p>
        <p class="foot-meta">{esc(foot["address"])}<br>{esc(foot["copyright"])}</p>
      </div>
      <div class="foot-contact">
        <p class="eyebrow-sm">{esc(foot["contact_title"])}</p>
        <dl>
{contacts()}
        </dl>
      </div>
    </div>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js" defer></script>
  <script src="assets/js/main.js" defer></script>
</body>
</html>
'''

OUT.write_text(page, encoding="utf-8")
print(f"wrote {OUT.relative_to(ROOT)} ({len(page):,} bytes)")
