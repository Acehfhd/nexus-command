# 🚀 How to Upload Nexus Prime to GitHub

You have two options to upload this project.

## Option A: Professional (Recommended)
This method is faster and handles large files better.

1.  **Create a New Repository** on [GitHub.com](https://github.com/new).
    *   Name it: `nexus-prime` (or whatever you like).
    *   **Do NOT** initialize with README, .gitignore, or License (we already have them).

2.  **Open your Terminal** to this folder:
    ```bash
    cd "/home/anon/AI work/anon/projects/tools/nexus_prime_release"
    ```

3.  **Run these commands** (copy-paste block):
    ```bash
    # Initialize Git
    git init
    git branch -M main

    # Stage and Commit all files
    git add .
    git commit -m "Initial release of Nexus Prime 🚀"

    # Link to your GitHub Repo
    git remote add origin https://github.com/Acehfhd/nexus-command.git

    # Push (Force push to overwrite old dashboard if needed)
    git push -u origin main --force
    ```

## Option B: Web Browser (Drag & Drop)
*Note: This might fail if you have too many files nested deep inside.*

1.  Go to [Acehfhd/nexus-command](https://github.com/Acehfhd/nexus-command).
2.  Click **"Add file"** > **"Upload files"**.
3.  Drag all folders (`backend`, `frontend`, `workflows` and `README.md`) from your file explorer into the browser window.
4.  Commit changes.

---
**Safety Note**: This folder (`nexus_prime_release`) has already been scrubbed of secrets (`.env` files) and junk (`node_modules`). It is safe to publish.
