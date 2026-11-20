# Publishing

Target repository: <https://github.com/Mest1l/opencode-quota-header> (public, MIT).

## Does GitHub need a password to upload?

- **Web upload:** no separate password. You log in in the browser (email/username,
  password, and 2FA if enabled); the browser session authorizes the upload. Only
  you can write to your repository; a public repository is public to read, not to
  write.
- **Git over HTTPS:** your GitHub account password does **not** work. GitHub
  requires a personal access token (PAT), an SSH key, or GitHub CLI/OAuth. This
  has been the rule since 2021.
- **Git over SSH:** no password either; your SSH key authenticates.
- **GitHub Desktop:** sign in through the browser; it stores the credential.

## Option A: upload in the browser (no git, no token)

1. Open <https://github.com/new>.
2. Repository name: `opencode-quota-header`; visibility: **Public**. Do not add a
   README, `.gitignore`, or license on this page — this folder already has them.
3. Create the repository. On the empty page, click **uploading an existing file**.
4. Drag these files from this folder:
   - `gui-experimental.cjs`
   - `package.json`
   - `README.md`
   - `LICENSE`
   - `PUBLISH.md`
   - `.gitignore`
5. Commit the changes.

This uses your browser login. If 2FA is on, approve the prompt. No password is
typed into git.

## Option B: git + PAT (recommended for updates)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** →
   **Fine-grained tokens** → **Generate new token**.
2. Repository access: **Only select repositories** → `opencode-quota-header`.
3. Permissions → **Contents: Read and write**. (Metadata: read is automatic.)
4. Generate the token and copy it once. Do not paste it into chat or commit it.
5. In this folder:

   ```sh
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/Mest1l/opencode-quota-header.git
   git push -u origin main
   ```

   When git asks for a username, enter `Mest1l`; for a password, paste the PAT.
   Windows Git Credential Manager stores it after the first push.

Alternatively, use GitHub Desktop: **File → Add local repository**, then publish,
and sign in through the browser.

## Option C: SSH

```sh
ssh-keygen -t ed25519 -C "Mest1l@users.noreply.github.com"
# Add ~/.ssh/id_ed25519.pub to GitHub → Settings → SSH and GPG keys
git remote add origin git@github.com:Mest1l/opencode-quota-header.git
git push -u origin main
```

## After pushing

- Check that the repository page shows the README and the MIT license badge.
- Test the install:

  ```sh
  opencode plugin add github:Mest1l/opencode-quota-header
  ```

- Optional tag and release:

  ```sh
  git tag v0.1.0
  git push origin v0.1.0
  ```

- Optional npm publish:

  ```sh
  npm publish --access public
  ```

## Notes

- The repository must be **public** for `opencode plugin add github:...` to work
  without credentials.
- The `.zip` is a manual-install bundle; keep it out of the repository
  (`.gitignore` ignores `*.zip`).
- This machine has `git` but not `gh`. `git push` may need a proxy if GitHub is
  blocked.
