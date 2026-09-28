import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if 'AnimatedPresence' in content:
        print(f"Skipping {filepath}, already has AnimatedPresence")
        return

    # Add import
    import_statement = "import { AnimatedPresence } from './AnimatedPresence';\n"
    content = content.replace("from 'lucide-react';", "from 'lucide-react';\n" + import_statement)

    # Remove `if (!isOpen) return null;`
    content = re.sub(r'if\s*\(!isOpen\)\s*return\s*null;\n*', '', content)
    content = re.sub(r'if\s*\(!isColorSchemeOpen\)\s*return\s*null;\n*', '', content)

    # Wrap the outermost return with AnimatedPresence
    # Find the main return statement of the component
    # It usually starts with `return (\n    <div`
    
    # We will look for the first `<div` after `return (` that has `animate-fadeIn` or `fixed`
    pattern = r'(return\s*\(\n\s*)<div([^>]*?animate-fadeIn[^>]*?)>'
    
    def repl(m):
        prefix = m.group(1)
        div_attrs = m.group(2)
        # remove animate-fadeIn and replace with dynamic class
        new_attrs = div_attrs.replace('animate-fadeIn', "${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}")
        return f"{prefix}<AnimatedPresence isVisible={{isOpen}} duration={{250}}>\n      {{(isClosing) => (\n    <div{new_attrs}>"

    new_content = re.sub(pattern, repl, content, count=1)
    
    if new_content == content:
        # Try a more generic pattern
        pattern2 = r'(return\s*\(\n\s*)<div([^>]*?fixed[^>]*?)>'
        def repl2(m):
            prefix = m.group(1)
            div_attrs = m.group(2)
            if 'animate-fadeIn' in div_attrs:
                div_attrs = div_attrs.replace('animate-fadeIn', "${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}")
            else:
                # Need to inject class
                if 'className="' in div_attrs:
                    div_attrs = div_attrs.replace('className="', 'className={`').replace('"', ' ${isClosing ? \'animate-fadeOut\' : \'animate-fadeIn\'}`', 1)
            return f"{prefix}<AnimatedPresence isVisible={{isOpen}} duration={{250}}>\n      {{(isClosing) => (\n    <div{div_attrs}>"
        
        new_content = re.sub(pattern2, repl2, content, count=1)

    # Also update the inner container with animate-springScaleIn
    inner_pattern = r'(className="[^"]*?animate-springScaleIn[^"]*?")'
    def inner_repl(m):
        cls = m.group(1)
        # convert to template literal
        cls = cls.replace('className="', 'className={`').replace('"', '`')
        cls = cls.replace('animate-springScaleIn', "${isClosing ? 'animate-springScaleOut' : 'animate-springScaleIn'}")
        return cls

    new_content = re.sub(inner_pattern, inner_repl, new_content)

    if new_content != content:
        # Add closing tags at the very end before `);`
        end_pattern = r'(\s*)</div>\n\s*\);\n};'
        new_content = re.sub(end_pattern, r'\1</div>\n      )}\n    </AnimatedPresence>\n  );\n};', new_content, count=1)
        
        # ColorThemeWheel specific hack
        if 'ColorThemeWheel' in filepath:
            new_content = new_content.replace('isVisible={isOpen}', 'isVisible={isColorSchemeOpen}')
            end_pattern2 = r'(\s*)</div>\n\s*</div>\n\s*\);\n}'
            new_content = re.sub(end_pattern2, r'\1</div>\n      </div>\n      )}\n    </AnimatedPresence>\n  );\n}', new_content)
        
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"Could not apply patterns to {filepath}")


files = [
    'src/components/PitchDeckAboutModal.tsx',
    'src/components/SearchModal.tsx',
    'src/components/ColorThemeWheel.tsx'
]

for f in files:
    process_file(f)

