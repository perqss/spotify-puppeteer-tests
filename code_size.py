import os
import re

REACT_PATH = 'C:/Users/HP/Documents/projects/magisterka-react-vite/my-react-app/src'
SVELTE_PATH = 'C:/Users/HP/Documents/projects/magisterka-svelte-1/app/src'
SOLID_PATH = 'C:/Users/HP/Documents/projects/magisterka-solid-js/my-app/src'

PATHS = {"React": REACT_PATH, "Svelte": SVELTE_PATH, "Solid": SOLID_PATH}
INCLUDED_EXTENSIONS = ['.js', '.svelte', '.css', '.jsx']
html_comment_pattern = re.compile(r'<!--.*?-->')
whitespace_pattern = re.compile(r'\s+')
jsx_comment_pattern = re.compile(r'\{/\*.*?\*/\}')

for framework, path in PATHS.items():
    total_lines = 0
    total_chars_no_whitespace = 0
    for root, _, files in os.walk(path):
        for file in files:
            _, ext = os.path.splitext(file)
            if ext in INCLUDED_EXTENSIONS:
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    for line in f:
                        if ( 
                            line.strip() == "" 
                            or jsx_comment_pattern.search(line)
                            or html_comment_pattern.search(line)
                        ): 
                            continue
                        total_lines += 1
                        no_whitespace_line = whitespace_pattern.sub('', line)
                        total_chars_no_whitespace += len(no_whitespace_line)

    print(f"Łączna liczba linii kodu (bez linii pustych) w {framework}: {total_lines}")
    print(f"Łączna liczba znaków (bez białych znaków) w {framework}: {total_chars_no_whitespace}")

