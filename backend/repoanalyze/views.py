from django.shortcuts import render
import json
import base64
from django.http import JsonResponse, HttpResponse
import os
import requests
import google.generativeai as genai
from dotenv import load_dotenv
import subprocess
import shutil
import tempfile

# Load environment variables
load_dotenv()

# Configure Gemini AI
gemini_api_key = os.getenv("GEMNI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

# Gemini model setup
generation_config = {
    "temperature": 0.7,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

# Use newer Gemini model
try:
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        safety_settings=safety_settings
    )
    convo = model.start_chat(history=[])
except Exception as e:
    print(f"Gemini model init error: {e}")
    model = None
    convo = None

# Helper: Get temp directory for cloning repos
def get_temp_dir():
    temp_dir = os.path.join(tempfile.gettempdir(), "repo_analyzer")
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
    return temp_dir

# Helper: Clone repository
def repo_cloning(git_repo_link: str, branch: str = None) -> str:
    try:
        repo_name = os.path.basename(git_repo_link.rstrip('/'))
        if repo_name.endswith('.git'):
            repo_name = repo_name[:-4]

        temp_dir = get_temp_dir()
        repo_path = os.path.join(temp_dir, repo_name)

        # If repo exists, pull latest changes
        if os.path.exists(repo_path):
            try:
                subprocess.run(['git', '-C', repo_path, 'pull'],
                             capture_output=True, timeout=60)
            except:
                # If pull fails, remove and re-clone
                shutil.rmtree(repo_path, ignore_errors=True)

        if not os.path.exists(repo_path):
            cmd = ['git', 'clone', '--depth', '50']
            if branch:
                cmd.extend(['--branch', branch])
            cmd.extend([git_repo_link, repo_path])

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            if result.returncode != 0:
                # Try without branch specification
                cmd = ['git', 'clone', '--depth', '50', git_repo_link, repo_path]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
                if result.returncode != 0:
                    return None

        return repo_path
    except Exception as e:
        print(f"Clone error: {e}")
        return None

# Helper: Read dependencies
def read_dependencies(repo_path: str) -> str:
    try:
        # Check for requirements.txt
        req_file = os.path.join(repo_path, "requirements.txt")
        if os.path.exists(req_file):
            with open(req_file, "r", encoding='utf-8') as f:
                return f.read()

        # Check for setup.py
        setup_file = os.path.join(repo_path, "setup.py")
        if os.path.exists(setup_file):
            with open(setup_file, "r", encoding='utf-8') as f:
                content = f.read()
                return f"# Found setup.py\n{content}"

        # Check for package.json (Node.js)
        pkg_file = os.path.join(repo_path, "package.json")
        if os.path.exists(pkg_file):
            with open(pkg_file, "r", encoding='utf-8') as f:
                data = json.load(f)
                deps = data.get("dependencies", {})
                dev_deps = data.get("devDependencies", {})
                result = "# Dependencies\n"
                for name, version in deps.items():
                    result += f"{name}: {version}\n"
                if dev_deps:
                    result += "\n# Dev Dependencies\n"
                    for name, version in dev_deps.items():
                        result += f"{name}: {version}\n"
                return result

        # Try pipreqs to generate requirements
        try:
            result = subprocess.run(
                ['pipreqs', repo_path, '--print'],
                capture_output=True, text=True, timeout=60
            )
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout
        except:
            pass

        return "No dependencies file found (requirements.txt, setup.py, or package.json)"

    except Exception as e:
        return f"Error reading dependencies: {str(e)}"

# =============================================================================
# API ENDPOINTS
# =============================================================================

def get_dependencies(request):
    """Get dependencies from a GitHub repository"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'}, status=405)

    try:
        req = json.loads(request.body)
        git_repo_link = req.get("input", "").strip()

        if not git_repo_link:
            return JsonResponse({'error': 'Please provide a repository URL'}, status=400)

        # Validate URL format
        if not ('github.com' in git_repo_link or 'gitlab.com' in git_repo_link or git_repo_link.endswith('.git')):
            return JsonResponse({'error': 'Please provide a valid GitHub/GitLab URL'}, status=400)

        print(f"Cloning repo: {git_repo_link}")
        repo_path = repo_cloning(git_repo_link)

        if not repo_path:
            return JsonResponse({'error': 'Failed to clone repository. Check if URL is correct and repo is public.'}, status=400)

        print(f"Repo cloned to: {repo_path}")
        dependencies = read_dependencies(repo_path)

        return JsonResponse({'output': dependencies})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON request'}, status=400)
    except Exception as e:
        print(f"Error in get_dependencies: {e}")
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)


def get_commit_history(request):
    """Get commit history using local git (no token needed)"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'}, status=405)

    try:
        req = json.loads(request.body)
        git_repo_link = req.get("input", "").strip()

        if not git_repo_link:
            return JsonResponse({'error': 'Please provide a repository URL'}, status=400)

        # Clone the repo
        repo_path = repo_cloning(git_repo_link)
        if not repo_path:
            return JsonResponse({'error': 'Failed to clone repository'}, status=400)

        # Get commit history using git log
        result = subprocess.run(
            ['git', '-C', repo_path, 'log', '--pretty=format:SHA: %H%nMessage: %s%nAuthor: %an%nDate: %ad%n$', '-n', '50'],
            capture_output=True, text=True, timeout=30
        )

        if result.returncode != 0:
            return JsonResponse({'error': 'Failed to get commit history'}, status=500)

        return JsonResponse({'output': result.stdout})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON request'}, status=400)
    except Exception as e:
        print(f"Error in get_commit_history: {e}")
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)


def get_files_from_repository(request):
    """Get list of files from a GitHub repository"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'}, status=405)

    try:
        req = json.loads(request.body)
        git_repo_link = req.get("input", "").strip()

        if not git_repo_link:
            return JsonResponse({'error': 'Please provide a repository URL'}, status=400)

        # Clone and get files locally
        repo_path = repo_cloning(git_repo_link)
        if not repo_path:
            return JsonResponse({'error': 'Failed to clone repository'}, status=400)

        # Get all Python files
        file_names = []
        for root, dirs, files in os.walk(repo_path):
            # Skip hidden directories and common non-code directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'venv', '__pycache__', 'env']]

            for file in files:
                if file.endswith('.py'):
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, repo_path)
                    # Create a fake GitHub URL for frontend compatibility
                    file_url = f"{git_repo_link}/blob/main/{rel_path.replace(os.sep, '/')}"
                    file_names.append(file_url)

        if not file_names:
            return JsonResponse({'error': 'No Python files found in repository'}, status=400)

        return JsonResponse({'output': file_names})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON request'}, status=400)
    except Exception as e:
        print(f"Error in get_files_from_repository: {e}")
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)


def generate_by_model(prompt: str) -> str:
    """Generate content using Gemini AI"""
    if not convo:
        return "Error: Gemini AI not configured"
    try:
        convo.send_message(prompt)
        return convo.last.text
    except Exception as e:
        print(f"Gemini error: {e}")
        return f"Error generating content: {str(e)}"


def generate_doc_strings(request):
    """Generate docstrings for Python files (returns generated code, doesn't push to GitHub)"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'}, status=405)

    try:
        req = json.loads(request.body)
        files = req.get("input", [])

        if not files:
            return JsonResponse({'error': 'No files selected'}, status=400)

        if not model:
            return JsonResponse({'error': 'Gemini AI not configured. Check API key.'}, status=500)

        # Get repo path from first file URL
        first_file = files[0]
        parts = first_file.split('/')
        if 'github.com' in first_file:
            repo_url = '/'.join(parts[:5])  # https://github.com/user/repo
            repo_path = repo_cloning(repo_url)
        else:
            return JsonResponse({'error': 'Invalid file URL format'}, status=400)

        if not repo_path:
            return JsonResponse({'error': 'Failed to access repository'}, status=400)

        generated_results = []

        for file_url in files:
            try:
                # Extract relative path from URL
                rel_path = '/'.join(file_url.split('/blob/main/')[1:]) if '/blob/main/' in file_url else file_url.split('/')[-1]
                local_file_path = os.path.join(repo_path, rel_path.replace('/', os.sep))

                if os.path.exists(local_file_path):
                    with open(local_file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Generate docstrings
                    prompt = f"""Add professional docstrings to the following Python code.
Keep the code exactly the same, only add docstrings where missing.
Use Google-style docstrings format.

```python
{content}
```

Return only the Python code with docstrings, no explanations."""

                    result = generate_by_model(prompt)
                    generated_results.append({
                        'file': rel_path,
                        'content': result
                    })
            except Exception as e:
                print(f"Error processing {file_url}: {e}")
                generated_results.append({
                    'file': file_url,
                    'error': str(e)
                })

        return JsonResponse({
            'output': 'Docstrings generated successfully!',
            'results': generated_results
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON request'}, status=400)
    except Exception as e:
        print(f"Error in generate_doc_strings: {e}")
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)


def genDocument_from_docstr(request):
    """Generate Sphinx documentation from repository"""
    global CURRENT_DOCS_PATH

    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'}, status=405)

    try:
        req = json.loads(request.body)
        repo_link = req.get("input", "").strip()

        if not repo_link:
            return JsonResponse({'error': 'Please provide a repository URL'}, status=400)

        # Clone repository
        repo_path = repo_cloning(repo_link)
        if not repo_path:
            return JsonResponse({'error': 'Failed to clone repository'}, status=400)

        repo_name = os.path.basename(repo_path)
        original_dir = os.getcwd()

        try:
            # Create docs directory
            docs_dir = os.path.join(repo_path, "docs")
            if os.path.exists(docs_dir):
                shutil.rmtree(docs_dir)
            os.makedirs(docs_dir)

            # Get all Python files for documentation
            py_files = []
            py_modules = set()
            for root, dirs, files in os.walk(repo_path):
                dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['docs', 'venv', '__pycache__', 'env', 'node_modules']]
                for f in files:
                    if f.endswith('.py') and not f.startswith('_'):
                        rel_path = os.path.relpath(os.path.join(root, f), repo_path)
                        py_files.append(rel_path)
                        module_name = rel_path.replace(os.sep, '.').replace('.py', '')
                        py_modules.add(module_name)

            # Create conf.py
            conf_content = f'''# Configuration file for Sphinx documentation builder.
import os
import sys
sys.path.insert(0, os.path.abspath('..'))

project = '{repo_name}'
copyright = '2024, RepoAnalyzer'
author = 'RepoAnalyzer'

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode',
    'sphinx.ext.napoleon',
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

html_theme = 'alabaster'
html_static_path = ['_static']

# Napoleon settings for Google/NumPy style docstrings
napoleon_google_docstring = True
napoleon_numpy_docstring = True
'''
            with open(os.path.join(docs_dir, 'conf.py'), 'w') as f:
                f.write(conf_content)

            # Create index.rst with file listing
            modules_list = '\n   '.join(sorted(py_modules)[:20])  # Limit to 20 modules

            index_content = f'''{repo_name} Documentation
{'=' * (len(repo_name) + 14)}

Welcome to the documentation for **{repo_name}**.

Project Overview
----------------

This documentation was auto-generated using RepoAnalyzer.

Python Files in this Repository
-------------------------------

'''
            # Add file tree
            for py_file in sorted(py_files)[:30]:  # Limit display
                index_content += f"* ``{py_file}``\n"

            index_content += '''

Module Documentation
--------------------

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   modules

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
'''
            with open(os.path.join(docs_dir, 'index.rst'), 'w') as f:
                f.write(index_content)

            # Generate API documentation
            os.chdir(repo_path)
            subprocess.run([
                'sphinx-apidoc',
                '-f',  # Force overwrite
                '-e',  # Separate pages for each module
                '-o', 'docs',  # Output directory
                '.',  # Source directory
                'docs', 'venv', 'env', '__pycache__', 'setup.py'  # Exclude
            ], capture_output=True, timeout=60)

            # Create _static and _templates directories
            os.makedirs(os.path.join(docs_dir, '_static'), exist_ok=True)
            os.makedirs(os.path.join(docs_dir, '_templates'), exist_ok=True)

            # Build HTML
            os.chdir(docs_dir)
            if os.name == 'nt':  # Windows
                result = subprocess.run(['sphinx-build', '-b', 'html', '.', '_build/html'],
                                       capture_output=True, text=True, timeout=120)
            else:
                result = subprocess.run(['sphinx-build', '-b', 'html', '.', '_build/html'],
                                       capture_output=True, text=True, timeout=120)

            print(f"Sphinx build output: {result.stdout}")
            if result.stderr:
                print(f"Sphinx build errors: {result.stderr}")

            os.chdir(original_dir)

            # Set the docs path for serving
            html_path = os.path.join(docs_dir, '_build', 'html')
            if os.path.exists(html_path):
                CURRENT_DOCS_PATH = html_path
            else:
                CURRENT_DOCS_PATH = docs_dir

            # Also create zip for download option
            zip_path = os.path.join(get_temp_dir(), 'documentation')
            if os.path.exists(html_path):
                shutil.make_archive(zip_path, 'zip', html_path)
            else:
                shutil.make_archive(zip_path, 'zip', docs_dir)

            return JsonResponse({
                'output': zip_path + '.zip',
                'docs_url': 'http://127.0.0.1:8000/repoanalyze/docs/',
                'message': 'Documentation generated successfully!',
                'files_documented': len(py_files)
            })

        finally:
            os.chdir(original_dir)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON request'}, status=400)
    except Exception as e:
        print(f"Error in genDocument_from_docstr: {e}")
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)


def download_documentation(request):
    """Download generated documentation ZIP file"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'}, status=405)

    try:
        req = json.loads(request.body)
        zip_file_path = req.get("input", "")

        if not zip_file_path or not os.path.exists(zip_file_path):
            return JsonResponse({'error': 'Documentation file not found'}, status=404)

        with open(zip_file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/zip')
            response['Content-Disposition'] = 'attachment; filename=documentation.zip'
            return response

    except Exception as e:
        print(f"Error in download_documentation: {e}")
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)


def remove_zip(request):
    """Remove temporary zip file"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'}, status=405)

    try:
        req = json.loads(request.body)
        zip_file_path = req.get("input", "")

        if zip_file_path and os.path.exists(zip_file_path):
            os.remove(zip_file_path)

        return JsonResponse({'output': 'Cleanup successful'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# Global variable to store the docs path
CURRENT_DOCS_PATH = None

def serve_docs(request, path):
    """Serve generated documentation HTML files"""
    global CURRENT_DOCS_PATH

    if not CURRENT_DOCS_PATH or not os.path.exists(CURRENT_DOCS_PATH):
        return HttpResponse("Documentation not generated yet", status=404)

    # Default to index.html
    if not path or path == '':
        path = 'index.html'

    file_path = os.path.join(CURRENT_DOCS_PATH, path)

    if not os.path.exists(file_path):
        return HttpResponse(f"File not found: {path}", status=404)

    # Determine content type
    content_type = 'text/html'
    if path.endswith('.css'):
        content_type = 'text/css'
    elif path.endswith('.js'):
        content_type = 'application/javascript'
    elif path.endswith('.png'):
        content_type = 'image/png'
    elif path.endswith('.jpg') or path.endswith('.jpeg'):
        content_type = 'image/jpeg'
    elif path.endswith('.svg'):
        content_type = 'image/svg+xml'
    elif path.endswith('.woff') or path.endswith('.woff2'):
        content_type = 'font/woff2'

    try:
        if content_type.startswith('text') or content_type == 'application/javascript':
            with open(file_path, 'r', encoding='utf-8') as f:
                return HttpResponse(f.read(), content_type=content_type)
        else:
            with open(file_path, 'rb') as f:
                return HttpResponse(f.read(), content_type=content_type)
    except Exception as e:
        return HttpResponse(f"Error reading file: {str(e)}", status=500)
