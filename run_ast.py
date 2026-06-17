import sys
import json
import os
from graphify.extract import collect_files, extract
from pathlib import Path

manifest_path = Path('graphify-out/manifest.json')
detect_path = Path('graphify-out/.graphify_detect.json')

workspace_dir = Path('.')
code_extensions = ('.js', '.jsx', '.ts', '.tsx', '.py', '.gs')
doc_extensions = ('.md', '.txt', '.html', '.css', '.json')
img_extensions = ('.png', '.jpg', '.jpeg', '.svg', '.gif')

code_files = []
doc_files = []
img_files = []
total_words = 0

# Scan workspace files
for root, dirs, files in os.walk(workspace_dir):
    # Skip build folders and node_modules
    if any(p in root for p in ['node_modules', '.next', '.git', 'graphify-out']):
        continue
    for f in files:
        fpath = Path(root) / f
        # Standardize path
        abs_path = str(fpath.resolve())
        
        if f.endswith(code_extensions):
            code_files.append(abs_path)
            # Estimate word count for code files
            try:
                content = fpath.read_text(encoding='utf-8', errors='ignore')
                total_words += len(content.split())
            except Exception:
                pass
        elif f.endswith(doc_extensions) and not f.startswith('.'):
            doc_files.append(abs_path)
            try:
                content = fpath.read_text(encoding='utf-8', errors='ignore')
                total_words += len(content.split())
            except Exception:
                pass
        elif f.endswith(img_extensions):
            img_files.append(abs_path)

# Build and write .graphify_detect.json
detect_data = {
    "files": {
        "code": code_files,
        "document": doc_files,
        "paper": [],
        "image": img_files,
        "video": []
    },
    "total_files": len(code_files) + len(doc_files) + len(img_files),
    "total_words": total_words,
    "needs_graph": True,
    "warning": None,
    "skipped_sensitive": [],
    "graphifyignore_patterns": 0
}

# Ensure directory exists
detect_path.parent.mkdir(parents=True, exist_ok=True)
detect_path.write_text(json.dumps(detect_data, indent=2), encoding='utf-8')
print(f"Generated {detect_path} successfully (Corpus: {detect_data['total_files']} files, ~{detect_data['total_words']} words).")

# Extract and save AST json
code_paths = [Path(f) for f in code_files]
if code_paths:
    try:
        result = extract(code_paths)
        Path('.graphify_ast.json').write_text(json.dumps(result, indent=2))
        print(f'AST: {len(result["nodes"])} nodes, {len(result["edges"])} edges saved to .graphify_ast.json.')
    except Exception as e:
        print(f"Error extracting AST: {e}")
        # Write dummy AST structure if direct import extraction fails due to offline/env issues
        dummy = {'nodes': [{'id': f, 'label': Path(f).name, 'type': 'file'} for f in code_files], 'edges': [], 'input_tokens': 0, 'output_tokens': 0}
        Path('.graphify_ast.json').write_text(json.dumps(dummy, indent=2))
else:
    Path('.graphify_ast.json').write_text(json.dumps({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}))
    print('No code files found - skipping AST extraction')
