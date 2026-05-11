#!/usr/bin/env python3
"""
project_intel.py — General-purpose project intelligence generator.
Produces PROJECT_INTEL.md from any Spring Boot / Next.js project root.
Run: python project_intel.py [project_root]
"""

import os
import re
import json
import sys
from pathlib import Path
from typing import Optional

ROOT = (Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()).resolve()
OUT = ROOT / "PROJECT_INTEL.md"

# ─── helpers ──────────────────────────────────────────────────────────────────

def read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""

def find(base: Path, pattern: str):
    return sorted(base.rglob(pattern))

def first_group(pattern: str, text: str, default="") -> str:
    m = re.search(pattern, text)
    return m.group(1).strip() if m else default

def all_groups(pattern: str, text: str) -> list[str]:
    return [m.strip() for m in re.findall(pattern, text)]

def strip_annotations(s: str) -> str:
    return re.sub(r"@\w+(?:\([^)]*\))?\s*", "", s).strip()

# ─── Spring Boot analysis ──────────────────────────────────────────────────────

def java_dirs(root: Path) -> list[Path]:
    dirs = []
    for candidate in ["isg-backend/src/main/java", "backend/src/main/java", "src/main/java"]:
        p = root / candidate
        if p.exists():
            dirs.append(p)
    return dirs

def parse_class_name(text: str) -> str:
    return first_group(r"public\s+(?:class|interface|record|enum)\s+(\w+)", text)

def parse_request_mapping(text: str) -> str:
    """Extract class-level @RequestMapping value (before any method definitions)."""
    # Only look before the first method definition to avoid picking up method-level annotations
    class_body_start = re.search(r'public\s+(?:class|interface)\s+\w+', text)
    scope = text[:class_body_start.end() + 400] if class_body_start else text[:600]
    m = re.search(r'@RequestMapping\s*\(\s*(?:value\s*=\s*)?\"([^\"]+)\"', scope)
    if m:
        return "/" + m.group(1).strip("/")
    return ""

def parse_endpoints(text: str, class_path: str) -> list[dict]:
    """
    Find method-level @GetMapping / @PostMapping / etc. and pair with the
    public method that immediately follows.  Skips class-level @RequestMapping.
    """
    endpoints = []
    # Match @GetMapping("path") or @GetMapping, NOT class-level @RequestMapping
    combined = re.compile(
        r'@(Get|Post|Put|Patch|Delete)Mapping'
        r'(?:\s*\(\s*(?:value\s*=\s*)?\"([^\"]*)\"\s*\)|\s*\(\s*\)|\s+)'
        r'(?:(?:\s*@\w+(?:\([^)]*\))?)*\s*)'   # optional more annotations
        r'(?:public\s+)?([\w<>,\[\] ]+?)\s+(\w+)\s*\(',
        re.DOTALL,
    )
    for m in combined.finditer(text):
        verb = m.group(1).upper()
        sub_path = (m.group(2) or "").strip("/")
        ret = m.group(3).strip()
        method_name = m.group(4)
        if sub_path:
            full_path = class_path.rstrip("/") + "/" + sub_path
        else:
            full_path = class_path or "/"
        full_path = re.sub(r"/+", "/", full_path)
        endpoints.append({
            "method": verb,
            "path": full_path,
            "java_method": method_name,
            "returns": ret,
        })
    return endpoints

def parse_entity(text: str) -> dict:
    fields = []
    # JPA column fields
    field_pat = re.compile(
        r'(?:@Column[^;]*?)?'
        r'(?:@(?:Id|GeneratedValue|ManyToOne|OneToMany|ManyToMany|OneToOne|JoinColumn|Enumerated)[^;]*?)*'
        r'private\s+([\w<>, ]+?)\s+(\w+)\s*;',
        re.DOTALL
    )
    for m in field_pat.finditer(text):
        fields.append({"type": m.group(1).strip(), "name": m.group(2)})
    relationships = []
    for ann in ["@ManyToOne", "@OneToMany", "@ManyToMany", "@OneToOne"]:
        if ann in text:
            relationships.append(ann.lstrip("@"))
    return {"fields": fields, "relationships": list(set(relationships))}

def parse_record(text: str) -> list[str]:
    m = re.search(r'public\s+record\s+\w+\s*\(([^)]+)\)', text, re.DOTALL)
    if not m:
        return []
    params = m.group(1)
    parts = [p.strip() for p in params.split(",")]
    return [re.sub(r'\s+', ' ', p) for p in parts if p]

def parse_service_methods(text: str) -> list[str]:
    methods = []
    pat = re.compile(
        r'(?:@Transactional[^)]*\))?\s*'
        r'public\s+([\w<>,\[\] ]+?)\s+(\w+)\s*\(([^)]*)\)',
        re.DOTALL
    )
    for m in pat.finditer(text):
        ret = m.group(1).strip()
        name = m.group(2)
        params = re.sub(r'\s+', ' ', m.group(3).strip())
        # skip constructors disguised as methods and getters/setters
        if name[0].isupper() or name.startswith(("get", "set", "is")) and len(name) < 30:
            continue
        methods.append(f"{ret} {name}({params})")
    return methods

def analyze_spring(root: Path) -> dict:
    result = {
        "controllers": [],
        "services": [],
        "entities": [],
        "dtos": [],
        "repositories": [],
        "security": {},
        "config": {},
    }
    java_roots = java_dirs(root)
    if not java_roots:
        return result

    for jr in java_roots:
        for jf in find(jr, "*.java"):
            text = read(jf)
            name = parse_class_name(text)
            if not name:
                continue
            rel = jf.relative_to(jr)

            # Controller
            if "@RestController" in text or "@Controller" in text:
                class_path = parse_request_mapping(text)
                endpoints = parse_endpoints(text, class_path)
                deps = all_groups(r'private\s+final\s+(\w+)\s+\w+', text)
                result["controllers"].append({
                    "name": name,
                    "base_path": class_path,
                    "endpoints": endpoints,
                    "deps": deps,
                    "file": str(rel),
                })

            # Service
            elif "@Service" in text:
                methods = parse_service_methods(text)
                deps = all_groups(r'private\s+final\s+(\w+)\s+\w+', text)
                result["services"].append({
                    "name": name,
                    "methods": methods,
                    "deps": deps,
                    "file": str(rel),
                })

            # Entity
            elif "@Entity" in text:
                entity = parse_entity(text)
                result["entities"].append({
                    "name": name,
                    "fields": entity["fields"],
                    "relationships": entity["relationships"],
                    "file": str(rel),
                })

            # DTO / Record
            elif "record " in text and ("Dto" in name or "Request" in name or "Response" in name):
                params = parse_record(text)
                result["dtos"].append({
                    "name": name,
                    "fields": params,
                    "file": str(rel),
                })

            # Repository
            elif "Repository" in text and ("interface" in text or "extends" in text):
                result["repositories"].append({
                    "name": name,
                    "file": str(rel),
                })

    # application.yml / application.properties
    for conf_name in ["application.yml", "application.yaml", "application.properties"]:
        for candidate in ["isg-backend/src/main/resources", "backend/src/main/resources", "src/main/resources"]:
            conf = root / candidate / conf_name
            if conf.exists():
                result["config"]["app_config"] = conf_name
                txt = read(conf)
                # Extract env var placeholders
                envs = re.findall(r'\$\{(\w+)(?::[^}]*)?\}', txt)
                result["config"]["env_vars"] = sorted(set(envs))
                break

    # pom.xml dependencies
    pom = root / "isg-backend" / "pom.xml"
    if not pom.exists():
        pom = root / "backend" / "pom.xml"
    if not pom.exists():
        pom = root / "pom.xml"
    if pom.exists():
        txt = read(pom)
        deps = re.findall(r'<artifactId>([^<]+)</artifactId>', txt)
        # deduplicate, filter out the project itself and maven plugins
        seen = set()
        clean = []
        skip = {"maven-compiler-plugin", "spring-boot-maven-plugin", "lombok", "maven-surefire-plugin"}
        for d in deps:
            if d not in seen and not d.startswith(("aciktim", "backend")) and d not in skip:
                seen.add(d)
                # skip test variants (contain -test)
                if "-test" not in d:
                    clean.append(d)
        result["config"]["dependencies"] = clean[:25]

    return result

# ─── Next.js / TypeScript analysis ───────────────────────────────────────────

def find_frontend(root: Path) -> Optional[Path]:
    for candidate in ["isg-frontend", "frontend", "web", "client", "app", "."]:
        p = root / candidate
        pkg = p / "package.json"
        if pkg.exists():
            txt = read(pkg)
            if "next" in txt:
                return p
    return None

def parse_routes(fe_root: Path) -> list[dict]:
    routes = []
    app_dir = fe_root / "app"
    if not app_dir.exists():
        app_dir = fe_root / "src" / "app"
    if not app_dir.exists():
        return routes

    for page in find(app_dir, "page.tsx") + find(app_dir, "page.ts") + find(app_dir, "page.jsx"):
        rel = page.relative_to(app_dir)
        parts = list(rel.parts[:-1])  # strip filename
        route = "/" + "/".join(parts) if parts else "/"
        text = read(page)
        # Extract default export component name
        comp = first_group(r'export\s+default\s+(?:function\s+)?(\w+)', text)
        # Detect API calls
        api_calls = list(set(re.findall(r'(?:api|axios|fetch)\s*[.(][^;"\n]{5,60}', text)))[:5]
        routes.append({"route": route, "component": comp, "api_calls": api_calls})
    return routes

def parse_components(fe_root: Path) -> list[dict]:
    comps = []
    for comp_dir in ["components", "src/components"]:
        base = fe_root / comp_dir
        if not base.exists():
            continue
        for f in find(base, "*.tsx") + find(base, "*.jsx"):
            text = read(f)
            name = first_group(r'export\s+(?:default\s+)?(?:function|const)\s+(\w+)', text)
            if not name:
                continue
            # Props interface
            props = first_group(r'(?:interface|type)\s+\w*Props\w*\s*[={]\s*\{([^}]+)\}', text)
            prop_list = []
            if props:
                prop_list = [p.strip() for p in props.split(";") if p.strip()][:8]
            # API calls
            api_calls = list(set(re.findall(r'(?:api\.|axios\.|fetch\(|useSWR\(|useQuery\()[^;"\n]{5,60}', text)))[:4]
            rel = f.relative_to(fe_root)
            comps.append({
                "name": name,
                "file": str(rel),
                "props": prop_list,
                "api_calls": api_calls,
            })
    return comps

def parse_contexts_hooks(fe_root: Path) -> list[dict]:
    items = []
    for search_dir in ["context", "contexts", "hooks", "src/context", "src/hooks"]:
        base = fe_root / search_dir
        if not base.exists():
            continue
        for f in find(base, "*.tsx") + find(base, "*.ts"):
            text = read(f)
            exported = re.findall(r'export\s+(?:const|function|default function)\s+(\w+)', text)
            state_vars = re.findall(r'const\s+\[(\w+),\s*set\w+\]\s*=\s*useState', text)
            items.append({
                "file": str(f.relative_to(fe_root)),
                "exports": exported,
                "state": state_vars[:6],
            })
    return items

def parse_api_lib(fe_root: Path) -> dict:
    result = {}
    for candidate in ["lib/api.ts", "lib/api.js", "utils/api.ts", "src/lib/api.ts"]:
        f = fe_root / candidate
        if f.exists():
            text = read(f)
            base_url = first_group(r'baseURL[:\s]+["\']([^"\']+)', text)
            interceptors = re.findall(r'interceptors\.\w+\.use', text)
            result = {"file": candidate, "base_url": base_url, "interceptors": interceptors}
            break
    return result

def parse_fe_dependencies(fe_root: Path) -> dict:
    pkg = fe_root / "package.json"
    if not pkg.exists():
        return {}
    try:
        data = json.loads(read(pkg))
    except Exception:
        return {}
    deps = list(data.get("dependencies", {}).keys())
    dev_deps = list(data.get("devDependencies", {}).keys())
    return {"deps": deps[:20], "devDeps": dev_deps[:10]}

def parse_env_example(fe_root: Path) -> list[str]:
    for name in [".env.example", ".env.local.example", ".env"]:
        f = fe_root / name
        if f.exists():
            lines = [l.strip() for l in read(f).splitlines() if l.strip() and not l.startswith("#")]
            return lines[:20]
    return []

def analyze_nextjs(root: Path) -> dict:
    fe_root = find_frontend(root)
    if not fe_root:
        return {}
    return {
        "fe_root": str(fe_root.relative_to(root)) if fe_root != root else ".",
        "routes": parse_routes(fe_root),
        "components": parse_components(fe_root),
        "contexts_hooks": parse_contexts_hooks(fe_root),
        "api_lib": parse_api_lib(fe_root),
        "dependencies": parse_fe_dependencies(fe_root),
        "env_vars": parse_env_example(fe_root),
    }

# ─── Docker / infra analysis ──────────────────────────────────────────────────

def analyze_infra(root: Path) -> dict:
    result = {}
    dc = root / "docker-compose.yml"
    if not dc.exists():
        dc = root / "docker-compose.yaml"
    if dc.exists():
        text = read(dc)
        services = re.findall(r'^  (\w+):', text, re.MULTILINE)
        ports = re.findall(r'"?(\d+:\d+)"?', text)
        result["docker_compose"] = {"services": services, "ports": ports}
    return result

# ─── Markdown renderer ────────────────────────────────────────────────────────

def render(spring: dict, nextjs: dict, infra: dict, root: Path) -> str:
    lines = []
    project_name = root.name.upper()

    lines.append(f"# PROJECT_INTEL — {project_name}")
    lines.append(f"> Auto-generated by project_intel.py. Do not edit manually.\n")

    # ── Infrastructure ──
    if infra.get("docker_compose"):
        dc = infra["docker_compose"]
        lines.append("## Infrastructure")
        lines.append(f"- **Services**: {', '.join(dc['services'])}")
        lines.append(f"- **Ports**: {', '.join(dc['ports'])}\n")

    # ── Backend ──
    if spring.get("controllers") or spring.get("entities"):
        lines.append("## Backend (Spring Boot)\n")

        if spring.get("config"):
            cfg = spring["config"]
            if cfg.get("env_vars"):
                lines.append("### Environment Variables")
                for ev in cfg["env_vars"]:
                    lines.append(f"- `{ev}`")
                lines.append("")
            if cfg.get("dependencies"):
                lines.append("### Key Dependencies")
                lines.append(", ".join(f"`{d}`" for d in cfg["dependencies"]))
                lines.append("")

        if spring.get("entities"):
            lines.append("### Entities")
            for e in spring["entities"]:
                lines.append(f"#### `{e['name']}` — `{e['file']}`")
                if e["relationships"]:
                    lines.append(f"- Relations: {', '.join(e['relationships'])}")
                if e["fields"]:
                    lines.append("| Field | Type |")
                    lines.append("|-------|------|")
                    for f in e["fields"]:
                        lines.append(f"| `{f['name']}` | `{f['type']}` |")
                lines.append("")

        if spring.get("dtos"):
            lines.append("### DTOs / Records")
            for d in spring["dtos"]:
                params = ", ".join(d["fields"]) if d["fields"] else "—"
                lines.append(f"- **`{d['name']}`** ({d['file']}): `{params}`")
            lines.append("")

        if spring.get("repositories"):
            lines.append("### Repositories")
            for r in spring["repositories"]:
                lines.append(f"- `{r['name']}` — `{r['file']}`")
            lines.append("")

        if spring.get("services"):
            lines.append("### Services")
            for s in spring["services"]:
                lines.append(f"#### `{s['name']}` — `{s['file']}`")
                if s["deps"]:
                    lines.append(f"- Injects: {', '.join(f'`{d}`' for d in s['deps'])}")
                if s["methods"]:
                    lines.append("- Methods:")
                    for m in s["methods"][:12]:
                        lines.append(f"  - `{m}`")
                lines.append("")

        if spring.get("controllers"):
            lines.append("### API Endpoints")
            for c in spring["controllers"]:
                lines.append(f"#### `{c['name']}` — base: `{c['base_path'] or '/'}`")
                if c["deps"]:
                    lines.append(f"- Injects: {', '.join(f'`{d}`' for d in c['deps'])}")
                if c["endpoints"]:
                    lines.append("| Method | Path | Java Method | Returns |")
                    lines.append("|--------|------|-------------|---------|")
                    for ep in c["endpoints"]:
                        lines.append(
                            f"| `{ep['method']}` | `{ep['path']}` | `{ep['java_method']}` | `{ep['returns']}` |"
                        )
                lines.append("")

    # ── Frontend ──
    if nextjs:
        lines.append("## Frontend (Next.js)\n")
        lines.append(f"- **Root**: `{nextjs['fe_root']}`")

        if nextjs.get("api_lib"):
            al = nextjs["api_lib"]
            lines.append(f"- **API lib**: `{al['file']}`  base URL: `{al.get('base_url','?')}`")
            if al.get("interceptors"):
                lines.append(f"  - Interceptors: {', '.join(al['interceptors'])}")

        if nextjs.get("dependencies", {}).get("deps"):
            lines.append(f"- **Deps**: {', '.join(f'`{d}`' for d in nextjs['dependencies']['deps'])}")

        if nextjs.get("env_vars"):
            lines.append("- **Env vars**:")
            for ev in nextjs["env_vars"]:
                lines.append(f"  - `{ev}`")

        lines.append("")

        if nextjs.get("routes"):
            lines.append("### Pages / Routes")
            lines.append("| Route | Component | API Calls |")
            lines.append("|-------|-----------|-----------|")
            for r in sorted(nextjs["routes"], key=lambda x: x["route"]):
                calls = "; ".join(r["api_calls"])[:80] if r["api_calls"] else "—"
                lines.append(f"| `{r['route']}` | `{r['component']}` | {calls} |")
            lines.append("")

        if nextjs.get("contexts_hooks"):
            lines.append("### Contexts & Hooks")
            for ch in nextjs["contexts_hooks"]:
                exports = ", ".join(f"`{e}`" for e in ch["exports"][:6])
                state = ", ".join(f"`{s}`" for s in ch["state"])
                lines.append(f"- **`{ch['file']}`** exports: {exports or '—'}")
                if state:
                    lines.append(f"  - State: {state}")
            lines.append("")

        if nextjs.get("components"):
            lines.append("### Components")
            for comp in nextjs["components"]:
                lines.append(f"#### `{comp['name']}` — `{comp['file']}`")
                if comp["props"]:
                    lines.append(f"- Props: {' | '.join(comp['props'])[:120]}")
                if comp["api_calls"]:
                    lines.append(f"- API: {'; '.join(comp['api_calls'])[:120]}")
            lines.append("")

    lines.append("---")
    lines.append("*End of PROJECT_INTEL*")
    return "\n".join(lines)

# ─── main ─────────────────────────────────────────────────────────────────────

def main():
    print(f"Scanning: {ROOT}")
    spring = analyze_spring(ROOT)
    nextjs = analyze_nextjs(ROOT)
    infra = analyze_infra(ROOT)

    md = render(spring, nextjs, infra, ROOT)
    OUT.write_text(md, encoding="utf-8")

    # Stats
    ctrl_count = len(spring.get("controllers", []))
    ep_count = sum(len(c["endpoints"]) for c in spring.get("controllers", []))
    entity_count = len(spring.get("entities", []))
    route_count = len(nextjs.get("routes", []))
    comp_count = len(nextjs.get("components", []))

    print(f"\nDone! Written to: {OUT}")
    print(f"  Controllers: {ctrl_count}  Endpoints: {ep_count}")
    print(f"  Entities: {entity_count}  DTOs: {len(spring.get('dtos', []))}")
    print(f"  Services: {len(spring.get('services', []))}")
    print(f"  Routes: {route_count}  Components: {comp_count}")
    print(f"  Contexts/Hooks: {len(nextjs.get('contexts_hooks', []))}")

if __name__ == "__main__":
    main()
