# Verification

- Project contract: `C:\Users\dougl\.agents\tools\Test-AgentProjectState.cmd -Repository .`
- Python syntax: `py -3.12 -m py_compile fast-flights-sidecar\catcher.py fast-flights-sidecar\main.py fast-flights-sidecar\probe.py`
- Whitespace: `git diff --check`
- Secret scan: `gitleaks git --redact --no-banner .`
- Publication boundary: verify `venv`, `__pycache__`, `*.pyc`, runtime logs, `taskstate`, and `.env*` are absent from `git ls-files`; the value-free baseline `.env.example` is the sole exception.
- End-to-end: clone the GitHub repository to a disposable directory, rerun the boundary and project-contract checks, and verify `master` matches the pushed commit.
