#!/usr/bin/env python3
"""Fix HTML-like tags in markdown files that break VitePress build."""

import os
import re
import glob

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "docs", "claude-code")

def fix_content(content):
    # Fix malformed links like [CLAUDE.md](<http://CLAUDE.md>)
    # These should just be `CLAUDE.md`
    content = re.sub(r'\[([^\]]+)\]\(<http://\1>\)', r'`\1`', content)

    # Fix other malformed links like [text](<http://text>)
    content = re.sub(r'\[([^\]]+)\]\(<([^)]+)>\)', r'[\1](\2)', content)

    # Fix bare <http://...> that aren't in code blocks
    content = re.sub(r'<(http://[^>]+)>', r'\1', content)

    # Fix angle bracket tags in non-code context that Vue might parse
    # Common patterns: <path>, <command>, <url>, <server-name>, <arg>, etc.
    # Replace <word> with `word` when not inside code blocks
    # But be careful not to break legitimate HTML or code blocks

    # Split by code blocks
    parts = content.split('```')
    for i in range(0, len(parts), 2):  # Only process even indices (non-code)
        if i < len(parts):
            # Replace <word> patterns that look like placeholders
            # Match <word> or <word-hyphen> but not HTML tags like <br>, <div>, etc.
            parts[i] = re.sub(
                r'<([a-zA-Z][a-zA-Z0-9_-]*?)(?=>)',
                lambda m: f'`<{m.group(1)}`' if not m.group(1) in ('br', 'hr', 'b', 'i', 'em', 'strong', 'code', 'pre', 'p', 'div', 'span', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody') else m.group(0),
                parts[i]
            )
            # Actually this is too complex. Let me take a simpler approach.
            # Just replace <word> with &lt;word&gt; for common placeholder patterns
            parts[i] = re.sub(
                r'<([a-zA-Z][a-zA-Z0-9_-]*)>',
                lambda m: f'&lt;{m.group(1)}&gt;' if m.group(1) not in ('br', 'hr', 'b', 'i', 'em', 'strong', 'code', 'pre', 'p', 'div', 'span', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'sup', 'sub', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6') else f'<{m.group(1)}>',
                parts[i]
            )

    content = '```'.join(parts)

    return content

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    content = fix_content(content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    files = glob.glob(os.path.join(OUTPUT_DIR, "*.md"))
    fixed = 0
    for f in files:
        if process_file(f):
            print(f"  Fixed: {os.path.basename(f)}")
            fixed += 1
        else:
            print(f"  OK: {os.path.basename(f)}")

    print(f"\nDone: {fixed} files fixed out of {len(files)}")

if __name__ == '__main__':
    main()
