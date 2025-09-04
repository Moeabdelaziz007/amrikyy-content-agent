#!/usr/bin/env python3
"""
Project Report Generator

Generates a comprehensive report about repository files and statuses.
- File/directory inventory summary (counts, sizes)
- Breakdown by extension (and inferred language)
- Largest files
- Git status (modified, untracked, etc.) when inside a git repo
- Workspace/package summaries from package.json files
- Presence of key config/test/infra directories

Usage:
  python3 scripts/project_report.py --format md --output PROJECT_REPORT.md

Options:
  --root PATH Root directory to scan (default: repo root deduced from this script)
  --format {text,json,md} Output format (default: text)
  --output FILE Write report to a file (default: stdout)
  --include-node-modules Include node_modules/.next/dist/etc in the scan (default: excluded)

This script is dependency-free and portable across platforms.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
# noinspection PyInterpreter
from typing import Dict, Iterable, List, Optional, Tuple

# Common heavy directories to exclude by default
DEFAULT_EXCLUDES = {
    ".git",
    "node_modules",
    ".next",
    "build",
    "dist",
    "__pycache__",
    ".terraform",
    ".vercel",
    "test-results",
    ".idea",
    ".DS_Store",
}

# Map common file extensions to languages for reporting
EXT_LANG_MAP = {
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".mjs": "JavaScript",
    ".cjs": "JavaScript",
    ".json": "JSON",
    ".md": "Markdown",
    ".py": "Python",
    ".kt": "Kotlin",
    ".java": "Java",
    ".go": "Go",
    ".rs": "Rust",
    ".sh": "Shell",
    ".yml": "YAML",
    ".yaml": "YAML",
    ".toml": "TOML",
    ".lock": "Lockfile",
    ".css": "CSS",
    ".scss": "SCSS",
    ".sass": "SASS",
    ".html": "HTML",
    ".env": "Env",
}


def human_size(n: int) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]
    size = float(n)
    for u in units:
        if size < 1024.0:
            return f"{size:.2f} {u}"
        size /= 1024.0
    return f"{size:.2f} PB"


@dataclass
class FileStat:
    path: Path
    size: int
    mtime: float


@dataclass
class PackageSummary:
    path: Path
    name: Optional[str]
    private: Optional[bool]
    scripts: List[str]
    dependencies_count: int
    dev_dependencies_count: int


@dataclass
class GitStatus:
    is_git_repo: bool
    by_code: Dict[str, int]
    entries: List[Tuple[str, str]]  # (code, path)


def detect_repo_root(script_path: Path) -> Path:
    # Assume script is at repo_root/scripts/project_report.py -> repo_root is the parent of scripts
    scripts_dir = script_path.parent
    repo_root = scripts_dir.parent
    return repo_root


def should_exclude(path_parts: Iterable[str], excludes: set) -> bool:
    return any(part in excludes for part in path_parts)


def scan_files(root: Path, excludes: set) -> Tuple[List[FileStat], int, int]:
    files: List[FileStat] = []
    dir_count = 0
    file_count = 0
    for dirpath, dirnames, filenames in os.walk(root):
        # Apply excludes to surnames in-place to prune traversal
        parts = Path(dirpath).parts
        if should_exclude(parts, excludes):
            dirnames[:] = []
            continue
        # prune child directories that match excludes
        dirnames[:] = [d for d in dirnames if d not in excludes]
        dir_count += 1
        for fname in filenames:
            if fname in excludes:
                continue
            fpath = Path(dirpath) / fname
            try:
                stat = fpath.stat()
            except (OSError, FileNotFoundError):
                continue
            file_count += 1
            files.append(FileStat(path=fpath.relative_to(root), size=stat.st_size, mtime=stat.st_mtime))
    return files, dir_count, file_count


def summarize_extensions(files: List[FileStat]) -> Tuple[Dict[str, int], Dict[str, int]]:
    ext_counts: Dict[str, int] = Counter()
    ext_sizes: Dict[str, int] = Counter()
    for fs in files:
        ext = fs.path.suffix.lower()
        ext_counts[ext] += 1
        ext_sizes[ext] += fs.size
    return dict(ext_counts), dict(ext_sizes)


def summarize_languages(ext_counts: Dict[str, int], ext_sizes: Dict[str, int]) -> Tuple[Dict[str, int], Dict[str, int]]:
    lang_counts: Dict[str, int] = Counter()
    lang_sizes: Dict[str, int] = Counter()
    for ext, cnt in ext_counts.items():
        lang = EXT_LANG_MAP.get(ext, ext.lstrip(".").upper() or "(no ext)")
        lang_counts[lang] += cnt
    for ext, size in ext_sizes.items():
        lang = EXT_LANG_MAP.get(ext, ext.lstrip(".").upper() or "(no ext)")
        lang_sizes[lang] += size
    return dict(lang_counts), dict(lang_sizes)


def top_largest(files: List[FileStat], n: int = 20) -> List[FileStat]:
    return sorted(files, key=lambda f: f.size, reverse=True)[:n]


def len(param):
    pass


def list(param):
    pass


def sorted(param):
    pass


def collect_package_summaries(root: Path, excludes: set) -> List[PackageSummary]:
    summaries: List[PackageSummary] = []
    for dirpath, dirnames, filenames in os.walk(root):
        parts = Path(dirpath).parts
        # prune traversal of excluded directories
        if any(part in excludes for part in parts):
            dirnames[:] = []
            continue
        dirnames[:] = [d for d in dirnames if d not in excludes]
        if "package.json" in filenames and "node_modules" not in dirpath:
            p = Path(dirpath) / "package.json"
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
            except Exception:
                data = {}
            summaries.append(
                PackageSummary(
                    path=p.relative_to(root),
                    name=data.get("name"),
                    private=data.get("private"),
                    scripts=sorted(list((data.get("scripts") or {}).keys())),
                    dependencies_count=len((data.get("dependencies") or {})),
                    dev_dependencies_count=len((data.get("devDependencies") or {})),
                )
            )
    return summaries


def collect_git_status(root: Path) -> GitStatus:
    try:
        # Check if inside a git repo
        proc = subprocess.run([
            "git",
            "rev-parse",
            "--is-inside-work-tree",
        ], cwd=root, capture_output=True, text=True)
        if proc.returncode != 0 or proc.stdout.strip() != "true":
            return GitStatus(is_git_repo=False, by_code={}, entries=[])
        proc2 = subprocess.run(["git", "status", "--porcelain"], cwd=root, capture_output=True, text=True)
        entries: List[Tuple[str, str]] = []
        by_code: Dict[str, int] = Counter()
        for line in proc2.stdout.splitlines():
            if not line.strip():
                continue
            code = line[:2].strip()
            path = line[3:].strip()
            entries.append((code, path))
            by_code[code] += 1
        return GitStatus(is_git_repo=True, by_code=dict(by_code), entries=entries)
    except FileNotFoundError:
        # git not installed
        return GitStatus(is_git_repo=False, by_code={}, entries=[])


def detect_key_paths(root: Path) -> Dict[str, bool]:
    keys = {
        "has_nextjs_app": (root / "apps" / "web").exists(),
        "has_api": (root / "apps" / "api").exists(),
        "has_firebase_functions": (root / "functions" / "content_agent").exists(),
        "has_firebase_json": (root / "firebase.json").exists(),
        "has_firestore_rules": (root / "firestore.rules").exists(),
        "has_infra_terraform": (root / "infra" / "terraform").exists(),
        "has_tests_unit": (root / "tests" / "unit").exists(),
        "has_tests_e2e": (root / "tests" / "e2e").exists(),
        "has_docker_compose": (root / "docker-compose.yml").exists(),
        "has_readme": (root / "README.md").exists(),
    }
    return keys


def format_text_report(
    root: Path,
    files: List[FileStat],
    dir_count: int,
    file_count: int,
    ext_counts: Dict[str, int],
    ext_sizes: Dict[str, int],
    lang_counts: Dict[str, int],
    lang_sizes: Dict[str, int],
    largest: List[FileStat],
    pkgs: List[PackageSummary],
    git: GitStatus,
    keys: Dict[str, bool],
) -> str:
    total_size = sum(f.size for f in files)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    lines: List[str] = []
    lines.append(f"Project Report")
    lines.append(f"Generated: {ts}")
    lines.append(f"Root: {root}")
    lines.append("")
    lines.append("Summary:")
    lines.append(f"- Directories scanned: {dir_count}")
    lines.append(f"- Files scanned: {file_count}")
    lines.append(f"- Total size: {human_size(total_size)}")
    lines.append("")

    # Languages
    lines.append("By Language (files):")
    for lang, cnt in sorted(lang_counts.items(), key=lambda x: (-x[1], x[0])):
        size_lang = lang_sizes.get(lang, 0)
        lines.append(f"- {lang}: {cnt} files, {human_size(size_lang)}")
    lines.append("")

    # Extensions
    lines.append("Top Extensions (by files):")
    for ext, cnt in sorted(ext_counts.items(), key=lambda x: -x[1])[:20]:
        lines.append(f"- {ext or '(no ext)'}: {cnt}")
    lines.append("")

    # Largest files
    lines.append("Largest Files:")
    for fs in largest:
        lines.append(f"- {fs.path} — {human_size(fs.size)}")
    lines.append("")

    # Packages
    lines.append("Packages (package.json):")
    for p in sorted(pkgs, key=lambda p: str(p.path)):
        lines.append(
            f"- {p.path} — name={p.name or '?'} private={p.private if p.private is not None else '?'} "
            f"scripts={len(p.scripts)} deps={p.dependencies_count} devDeps={p.dev_dependencies_count}"
        )
    if not pkgs:
        lines.append("- (none)")
    lines.append("")

    # Key paths
    lines.append("Key Components:")
    for k, v in sorted(keys.items()):
        lines.append(f"- {k}: {'present' if v else 'absent'}")
    lines.append("")

    # Git status
    if git.is_git_repo:
        lines.append("Git Status (porcelain):")
        total_changes = sum(git.by_code.values())
        lines.append(f"- Changes: {total_changes}")
        for code, cnt in sorted(git.by_code.items(), key=lambda x: -x[1]):
            lines.append(f"  - {code}: {cnt}")
        # list some entries
        max_list = 30
        lines.append(f"- Sample entries (up to {max_list}):")
        for code, path in git.entries[:max_list]:
            lines.append(f"  - {code} {path}")
    else:
        lines.append("Git Status: not a git repo or git not available")

    return "\n".join(lines)


def format_md_report(
    root: Path,
    files: List[FileStat],
    dir_count: int,
    file_count: int,
    ext_counts: Dict[str, int],
    ext_sizes: Dict[str, int],
    lang_counts: Dict[str, int],
    lang_sizes: Dict[str, int],
    largest: List[FileStat],
    pkgs: List[PackageSummary],
    git: GitStatus,
    keys: Dict[str, bool],
) -> str:
    total_size = sum(f.size for f in files)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    out: List[str] = []
    out.append(f"# Project Report")
    out.append("")
    out.append(f"- Generated: {ts}")
    out.append(f"- Root: `{root}`")
    out.append("")

    out.append("## Summary")
    out.append("")
    out.append(f"- Directories scanned: {dir_count}")
    out.append(f"- Files scanned: {file_count}")
    out.append(f"- Total size: {human_size(total_size)}")
    out.append("")

    out.append("## Languages")
    out.append("")
    for lang, cnt in sorted(lang_counts.items(), key=lambda x: (-x[1], x[0])):
        size_lang = lang_sizes.get(lang, 0)
        out.append(f"- {lang}: {cnt} files, {human_size(size_lang)}")
    out.append("")

    out.append("## Top Extensions")
    out.append("")
    for ext, cnt in sorted(ext_counts.items(), key=lambda x: -x[1])[:20]:
        out.append(f"- {ext or '(no ext)'}: {cnt}")
    out.append("")

    out.append("## Largest Files")
    out.append("")
    for fs in largest:
        out.append(f"- `{fs.path}` — {human_size(fs.size)}")
    out.append("")

    out.append("## Packages (package.json)")
    out.append("")
    if pkgs:
        for p in sorted(pkgs, key=lambda p: str(p.path)):
            out.append(
                f"- `{p.path}` — name=**{p.name or '?'}** private={p.private if p.private is not None else '?'} "
                f"scripts={len(p.scripts)} deps={p.dependencies_count} devDeps={p.dev_dependencies_count}"
            )
    else:
        out.append("- (none)")
    out.append("")

    out.append("## Key Components")
    out.append("")
    for k, v in sorted(keys.items()):
        out.append(f"- {k}: {'present' if v else 'absent'}")
    out.append("")

    out.append("## Git Status")
    out.append("")
    if git.is_git_repo:
        total_changes = sum(git.by_code.values())
        out.append(f"- Changes: {total_changes}")
        for code, cnt in sorted(git.by_code.items(), key=lambda x: -x[1]):
            out.append(f"  - `{code}`: {cnt}")
        max_list = 50
        if git.entries:
            out.append("")
            out.append("### Entries (sample)")
            for code, path in git.entries[:max_list]:
                out.append(f"- `{code}` {path}")
    else:
        out.append("- Not a git repo or git not available")

    return "\n".join(out)


def build_json_report(
    root: Path,
    files: List[FileStat],
    dir_count: int,
    file_count: int,
    ext_counts: Dict[str, int],
    ext_sizes: Dict[str, int],
    lang_counts: Dict[str, int],
    lang_sizes: Dict[str, int],
    largest: List[FileStat],
    pkgs: List[PackageSummary],
    git: GitStatus,
    keys: Dict[str, bool],
) -> str:
    data = {
        "generated": datetime.now().isoformat(timespec="seconds"),
        "root": str(root),
        "summary": {
            "directories": dir_count,
            "files": file_count,
            "total_size": sum(f.size for f in files),
        },
        "extensions": {
            "counts": ext_counts,
            "sizes": ext_sizes,
        },
        "languages": {
            "counts": lang_counts,
            "sizes": lang_sizes,
        },
        "largest_files": [
            {"path": str(f.path), "size": f.size} for f in largest
        ],
        "packages": [
            {
                "path": str(p.path),
                "name": p.name,
                "private": p.private,
                "scripts": p.scripts,
                "dependencies_count": p.dependencies_count,
                "dev_dependencies_count": p.dev_dependencies_count,
            }
            for p in pkgs
        ],
        "git_status": {
            "is_git_repo": git.is_git_repo,
            "by_code": git.by_code,
            "entries": [
                {"code": code, "path": path} for code, path in git.entries
            ],
        },
        "key_components": keys,
    }
    return json.dumps(data, indent=2)


def generate_report(root: Path, include_node_modules: bool, fmt: str) -> str:
    excludes = set(DEFAULT_EXCLUDES)
    if include_node_modules:
        # If including node_modules, still exclude some meta-folders
        excludes = {".git", "__pycache__", ".DS_Store", ".idea"}

    files, dir_count, file_count = scan_files(root, excludes)
    ext_counts, ext_sizes = summarize_extensions(files)
    lang_counts, lang_sizes = summarize_languages(ext_counts, ext_sizes)
    largest = top_largest(files, n=25)
    pkgs = collect_package_summaries(root, excludes)
    git = collect_git_status(root)
    keys = detect_key_paths(root)

    if fmt == "json":
        return build_json_report(root, files, dir_count, file_count, ext_counts, ext_sizes, lang_counts, lang_sizes, largest, pkgs, git, keys)
    elif fmt == "md":
        return format_md_report(root, files, dir_count, file_count, ext_counts, ext_sizes, lang_counts, lang_sizes, largest, pkgs, git, keys)
    else:
        return format_text_report(root, files, dir_count, file_count, ext_counts, ext_sizes, lang_counts, lang_sizes, largest, pkgs, git, keys)


def main():
    parser = argparse.ArgumentParser(description="Generate a repository project report")
    parser.add_argument("--root", type=str, default=None, help="Root folder to scan (default: repo root)")
    parser.add_argument("--format", dest="fmt", choices=["text", "json", "md"], default="text", help="Output format")
    parser.add_argument("--output", type=str, default=None, help="Output file path (default: stdout)")
    parser.add_argument("--include-node-modules", action="store_true", help="Include heavy directories like node_modules/.next/dist")

    args = parser.parse_args()

    script_path = Path(__file__).resolve()
    default_root = detect_repo_root(script_path)
    root = Path(args.root).resolve() if args.root else default_root

    report = generate_report(root, include_node_modules=args.include_node_modules, fmt=args.fmt)

    if args.output:
        out_path = Path(args.output)
        out_path.write_text(report, encoding="utf-8")
        print(f"Report written to {out_path}")
    else:
        print(report)


if __name__ == "__main__":
    main()
