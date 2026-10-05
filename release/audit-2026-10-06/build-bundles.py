"""Rebuild inspected asset bundles from the reconciled source, preserving load order."""
from pathlib import Path
import json, hashlib
here=Path(__file__).resolve().parent
assets=here.parent.parent/'source/theme/assets'
groups=json.loads((here/'bundles.json').read_text())
for name,paths in groups.items():
    extension=name.rsplit('.',1)[1]
    expected='wb-bundle-'+hashlib.sha256('|'.join(paths).encode()).hexdigest()[:12]+'.'+extension
    if name!=expected: raise ValueError('Bundle identifier does not match ordered inputs: '+name)
    content=('\n;\n' if extension=='js' else '\n').join('/* '+p+' */\n'+(assets/p.lstrip('/')).read_text() for p in paths)
    (assets/name).write_text(content)
print('Rebuilt',len(groups),'bundles in their inspected order.')
