#!/usr/bin/env python3
"""Mechanical extraction of the Robbins-Madanes CORE 100&200 corpus into a
single knowledge.md (for future RAG use), plus side-saving the subset of
files that are Tony Robbins' own on-camera coaching transcripts (not
Teleclass recaps) as individual clean .txt files for the personality
pipeline to read directly.

No LLM involved - this is pure text extraction + concatenation.
"""
import os
import re
import subprocess
import sys

import pypdf

SRC_ROOT = (
    "/Users/stage/Library/CloudStorage/OneDrive-Personal/Library/Tony Robbins/"
    "Tony Robbins Classroom/CORE 100&200 by Robbins Madaness"
)
SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KNOWLEDGE_MD = os.path.join(SKILL_DIR, "knowledge.md")
TRANSCRIPTS_DIR = os.path.join(SKILL_DIR, "references", "sources", "transcripts")

SKIP_EXT = {".mp3", ".mp4", ".flv", ".jpg", ".lesson", ".ds_store"}
TEXT_EXT = {".md", ".txt"}
DOC_EXT = {".doc", ".docx"}

MODULE_ORDER = {
    "1. introduction to strategic intervention": 1,
    "2. life stages (a)": 2,
    "3. life stages (b)": 3,
    "4. finding marital passion": 4,
    "5. individual transformation": 5,
    "6. overcoming inner conflicts": 6,
    "7. group dynamics": 7,
    "8. resiliency in crisis overcoming grief": 8,
    "9. advanced negotiation skills": 9,
    "bonus modules": 10,
    "bonus module  urp educator’s kit": 11,
}


def module_sort_key(name):
    return MODULE_ORDER.get(name.lower(), 99), name


def extract_text(path):
    ext = os.path.splitext(path)[1].lower()
    try:
        if ext in TEXT_EXT:
            with open(path, "r", errors="ignore") as f:
                return f.read()
        if ext == ".pdf":
            reader = pypdf.PdfReader(path)
            return "".join((p.extract_text() or "") for p in reader.pages)
        if ext in DOC_EXT:
            out = subprocess.run(
                ["textutil", "-convert", "txt", "-stdout", path],
                capture_output=True, text=True,
            )
            return out.stdout
    except Exception as e:
        return f"[EXTRACTION FAILED: {e}]"
    return None


def clean(text):
    if not text:
        return ""
    text = text.replace("\x00", "")
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    return text.strip()


def is_personality_transcript(rel_path, filename):
    lower_path = rel_path.lower()
    lower_name = filename.lower()
    if "teleclass" in lower_path:
        return False
    return "transcript" in lower_name


def safe_name(rel_path):
    s = re.sub(r"[^a-zA-Z0-9]+", "_", rel_path)
    return s.strip("_")[:150]


def main():
    os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)

    # Walk and bucket files by (module, lesson)
    entries = []  # (module, lesson, filename, full_path, rel_path)
    for root, dirs, files in os.walk(SRC_ROOT):
        dirs.sort()
        for fn in sorted(files):
            ext = os.path.splitext(fn)[1].lower()
            if ext in SKIP_EXT or fn == ".DS_Store":
                continue
            full_path = os.path.join(root, fn)
            rel_path = os.path.relpath(full_path, SRC_ROOT)
            parts = rel_path.split(os.sep)
            module = parts[0] if len(parts) > 1 else "(root)"
            lesson = parts[1] if len(parts) > 2 else None
            entries.append((module, lesson, fn, full_path, rel_path))

    modules = sorted(set(e[0] for e in entries), key=module_sort_key)

    transcript_count = 0
    failed = []
    total_chars = 0

    with open(KNOWLEDGE_MD, "w") as out:
        out.write("# Robbins-Madanes CORE 100&200 — Knowledge Base\n\n")
        out.write(
            "Mechanically extracted from all text-bearing files in the "
            "source corpus (media files excluded). For RAG retrieval use.\n\n"
        )
        out.write("## Table of Contents\n\n")
        for m in modules:
            out.write(f"- {m}\n")
        out.write("\n---\n\n")

        for module in modules:
            out.write(f"\n\n## {module}\n\n")
            lessons = sorted(
                set(e[1] for e in entries if e[0] == module and e[1]),
                key=lambda x: x,
            )
            # files directly under module (no lesson subfolder)
            direct_files = [e for e in entries if e[0] == module and e[1] is None]
            for module_, lesson_, fn, full_path, rel_path in direct_files:
                text = clean(extract_text(full_path))
                if text is None:
                    continue
                total_chars += len(text)
                out.write(f"### {fn}\n\n{text}\n\n---\n\n")

            for lesson in lessons:
                out.write(f"\n### {lesson}\n\n")
                lesson_files = [
                    e for e in entries if e[0] == module and e[1] == lesson
                ]
                for module_, lesson_, fn, full_path, rel_path in lesson_files:
                    text = extract_text(full_path)
                    if text is None:
                        continue
                    cleaned = clean(text)
                    if "[EXTRACTION FAILED" in cleaned:
                        failed.append(rel_path)
                    total_chars += len(cleaned)
                    out.write(f"#### {fn}\n\n{cleaned}\n\n---\n\n")

                    if is_personality_transcript(rel_path, fn):
                        transcript_count += 1
                        header = (
                            f"MODULE: {module}\nLESSON: {lesson}\n"
                            f"SOURCE FILE: {fn}\n\n"
                        )
                        with open(
                            os.path.join(
                                TRANSCRIPTS_DIR, safe_name(rel_path) + ".txt"
                            ),
                            "w",
                        ) as tf:
                            tf.write(header + cleaned)

    print(f"knowledge.md written: {KNOWLEDGE_MD}")
    print(f"total extracted chars: {total_chars:,}")
    print(f"personality transcripts saved: {transcript_count}")
    if failed:
        print(f"extraction failures ({len(failed)}):")
        for f in failed:
            print("  -", f)


if __name__ == "__main__":
    main()
