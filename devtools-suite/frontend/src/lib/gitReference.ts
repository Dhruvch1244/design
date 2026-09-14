export type GitCommand = { cmd: string; description: string }
export type GitCategory = { category: string; commands: GitCommand[] }

export const GIT_REFERENCE: GitCategory[] = [
  {
    category: 'Setup & Config',
    commands: [
      { cmd: 'git config --global user.name "Name"', description: 'Set your commit author name, globally' },
      { cmd: 'git config --global user.email "you@example.com"', description: 'Set your commit author email, globally' },
      { cmd: 'git config --global init.defaultBranch main', description: 'Set the default branch name for new repos' },
      { cmd: 'git config --global core.editor "code --wait"', description: 'Set the editor used for commit messages, rebase, etc.' },
      { cmd: 'git config --list', description: 'Show all effective config values and where they came from' },
    ],
  },
  {
    category: 'Basics',
    commands: [
      { cmd: 'git init', description: 'Create a new repo in the current directory' },
      { cmd: 'git clone <url>', description: 'Copy a remote repo locally' },
      { cmd: 'git status', description: 'Show staged/unstaged/untracked changes' },
      { cmd: 'git add <file>', description: 'Stage a file (git add . stages everything)' },
      { cmd: 'git add -p', description: 'Interactively stage specific hunks within a file' },
      { cmd: 'git commit -m "message"', description: 'Commit staged changes' },
      { cmd: 'git commit -am "message"', description: 'Stage all tracked-file changes and commit in one step' },
      { cmd: 'git push', description: 'Push commits to the remote tracking branch' },
      { cmd: 'git pull', description: 'Fetch and merge (or rebase, per config) from the remote' },
    ],
  },
  {
    category: 'Branching & Merging',
    commands: [
      { cmd: 'git branch', description: 'List local branches' },
      { cmd: 'git branch <name>', description: 'Create a new branch (doesn\'t switch to it)' },
      { cmd: 'git switch <name>', description: 'Switch to an existing branch' },
      { cmd: 'git switch -c <name>', description: 'Create and switch to a new branch' },
      { cmd: 'git checkout <name>', description: 'Older equivalent of switch — also used for files (see Undoing)' },
      { cmd: 'git merge <branch>', description: 'Merge another branch into the current one' },
      { cmd: 'git branch -d <name>', description: 'Delete a branch (fails if not fully merged)' },
      { cmd: 'git branch -D <name>', description: 'Force-delete a branch, merged or not' },
      { cmd: 'git branch -m <old> <new>', description: 'Rename a branch' },
    ],
  },
  {
    category: 'Undoing Changes',
    commands: [
      { cmd: 'git restore <file>', description: 'Discard unstaged changes to a file' },
      { cmd: 'git restore --staged <file>', description: 'Unstage a file, keeping its working-directory changes' },
      { cmd: 'git reset --soft HEAD~1', description: 'Undo the last commit, keep changes staged' },
      { cmd: 'git reset --mixed HEAD~1', description: 'Undo the last commit, keep changes unstaged (default mode)' },
      { cmd: 'git reset --hard HEAD~1', description: 'Undo the last commit and discard its changes entirely' },
      { cmd: 'git revert <commit>', description: 'Create a new commit that undoes another — safe on shared history' },
      { cmd: 'git commit --amend', description: 'Rewrite the last commit (message and/or staged changes)' },
      { cmd: 'git clean -fd', description: 'Delete untracked files and directories' },
    ],
  },
  {
    category: 'Stash',
    commands: [
      { cmd: 'git stash', description: 'Shelve uncommitted changes, restore a clean working directory' },
      { cmd: 'git stash -u', description: 'Stash including untracked files' },
      { cmd: 'git stash list', description: 'List all stashes' },
      { cmd: 'git stash pop', description: 'Reapply the most recent stash and remove it from the list' },
      { cmd: 'git stash apply', description: 'Reapply the most recent stash but keep it in the list' },
      { cmd: 'git stash drop', description: 'Delete the most recent stash without applying it' },
      { cmd: 'git stash show -p', description: 'Show the diff contained in the most recent stash' },
    ],
  },
  {
    category: 'Rebase & History Rewriting',
    commands: [
      { cmd: 'git rebase <branch>', description: 'Replay your commits on top of another branch' },
      { cmd: 'git rebase -i HEAD~N', description: 'Interactively edit/squash/reorder the last N commits' },
      { cmd: 'git rebase --continue', description: 'Resume a rebase after resolving a conflict' },
      { cmd: 'git rebase --abort', description: 'Cancel a rebase in progress, return to the pre-rebase state' },
      { cmd: 'git cherry-pick <commit>', description: 'Apply one specific commit onto the current branch' },
      { cmd: 'git commit --fixup <commit>', description: 'Create a fixup commit for later autosquashing' },
      { cmd: 'git rebase -i --autosquash HEAD~N', description: 'Rebase, automatically folding fixup! commits into their targets' },
    ],
  },
  {
    category: 'Remote',
    commands: [
      { cmd: 'git remote -v', description: 'List remotes and their URLs' },
      { cmd: 'git remote add <name> <url>', description: 'Add a new remote' },
      { cmd: 'git fetch', description: 'Download remote refs/objects without merging' },
      { cmd: 'git push -u origin <branch>', description: 'Push and set the upstream tracking branch' },
      { cmd: 'git push --force-with-lease', description: 'Force-push, but abort if the remote has commits you haven\'t seen' },
      { cmd: 'git push origin --delete <branch>', description: 'Delete a remote branch' },
      { cmd: 'git branch -r', description: 'List remote-tracking branches' },
    ],
  },
  {
    category: 'Inspecting',
    commands: [
      { cmd: 'git log --oneline --graph --all', description: 'Compact, visual log of all branches' },
      { cmd: 'git log -p <file>', description: 'Show the full diff history of a file' },
      { cmd: 'git log -S "text"', description: 'Find commits that added or removed a given string' },
      { cmd: 'git diff', description: 'Show unstaged changes' },
      { cmd: 'git diff --staged', description: 'Show staged changes' },
      { cmd: 'git diff <a>..<b>', description: 'Show changes between two commits/branches' },
      { cmd: 'git show <commit>', description: 'Show the diff introduced by one commit' },
      { cmd: 'git blame <file>', description: 'Show who last changed each line, and in which commit' },
      { cmd: 'git bisect start', description: 'Binary-search commit history to find which commit broke something' },
    ],
  },
  {
    category: 'Tags',
    commands: [
      { cmd: 'git tag', description: 'List tags' },
      { cmd: 'git tag v1.0.0', description: 'Create a lightweight tag on HEAD' },
      { cmd: 'git tag -a v1.0.0 -m "message"', description: 'Create an annotated tag (recommended for releases)' },
      { cmd: 'git push origin v1.0.0', description: 'Push a single tag' },
      { cmd: 'git push origin --tags', description: 'Push all tags' },
      { cmd: 'git tag -d v1.0.0', description: 'Delete a local tag' },
    ],
  },
  {
    category: 'Submodules',
    commands: [
      { cmd: 'git submodule add <url> <path>', description: 'Add a submodule' },
      { cmd: 'git submodule update --init --recursive', description: 'Fetch and check out submodules after cloning' },
      { cmd: 'git submodule foreach git pull', description: 'Pull latest changes in every submodule' },
    ],
  },
]

export type GitRecipe = { question: string; command: string; note?: string }

export const GIT_RECIPES: GitRecipe[] = [
  { question: 'Undo the last commit but keep the changes', command: 'git reset --soft HEAD~1' },
  { question: 'Undo the last commit and discard the changes', command: 'git reset --hard HEAD~1', note: 'Destructive — the changes are gone.' },
  { question: 'Discard all local uncommitted changes', command: 'git restore .', note: 'Older Git: git checkout -- .' },
  { question: 'Change the last commit message', command: 'git commit --amend -m "new message"' },
  { question: 'Add a forgotten file to the last commit', command: 'git add <file> && git commit --amend --no-edit' },
  { question: 'Squash the last 3 commits into one', command: 'git reset --soft HEAD~3 && git commit -m "message"' },
  { question: 'Rename the current branch', command: 'git branch -m <new-name>' },
  { question: 'Delete a remote branch', command: 'git push origin --delete <branch>' },
  { question: 'See what changed in a specific commit', command: 'git show <commit>' },
  { question: 'Find which commit deleted a line of code', command: 'git log -S "the deleted text" --source --all' },
  { question: 'Move uncommitted changes to a different branch', command: 'git stash && git switch <branch> && git stash pop' },
  { question: 'Recover a branch you accidentally deleted', command: 'git reflog', note: 'Find the commit SHA, then git branch <name> <sha>.' },
  { question: 'Update a feature branch with the latest main', command: 'git switch feature && git rebase main', note: 'Or git merge main if you prefer merge commits.' },
  { question: 'Force-push safely after a rebase', command: 'git push --force-with-lease' },
  { question: 'See who last touched a line', command: 'git blame -L 10,20 <file>' },
  { question: 'Compare two branches', command: 'git diff main..feature' },
  { question: 'List files changed in a commit', command: 'git show --stat <commit>' },
  { question: 'Temporarily set aside changes to pull latest', command: 'git stash && git pull && git stash pop' },
  { question: 'Remove a file from git but keep it on disk', command: 'git rm --cached <file>' },
  { question: 'Undo a git add (unstage a file)', command: 'git restore --staged <file>' },
]

const GIT_FLAGS: Record<string, GitCommand[]> = {
  commit: [
    { cmd: '-m "msg"', description: 'Commit message inline, no editor' },
    { cmd: '-a', description: 'Stage all tracked-file changes before committing' },
    { cmd: '--amend', description: 'Rewrite the previous commit instead of creating a new one' },
    { cmd: '--no-edit', description: 'Keep the previous commit message when amending' },
    { cmd: '--fixup <commit>', description: 'Create a fixup! commit for later autosquash' },
  ],
  checkout: [
    { cmd: '-b <name>', description: 'Create and switch to a new branch' },
    { cmd: '-- <file>', description: 'Discard changes to a file (use git restore instead on modern Git)' },
    { cmd: '<commit> -- <file>', description: 'Restore a file to its state at a specific commit' },
  ],
  branch: [
    { cmd: '-d <name>', description: 'Delete a branch (only if fully merged)' },
    { cmd: '-D <name>', description: 'Force-delete a branch' },
    { cmd: '-m <old> <new>', description: 'Rename a branch' },
    { cmd: '-r', description: 'List remote-tracking branches' },
    { cmd: '-a', description: 'List local and remote branches' },
  ],
  rebase: [
    { cmd: '-i', description: 'Interactive rebase — edit, squash, reorder, drop commits' },
    { cmd: '--onto <branch>', description: 'Replay commits onto a different base than the rebase target' },
    { cmd: '--continue', description: 'Resume after resolving a conflict' },
    { cmd: '--abort', description: 'Cancel and return to the pre-rebase state' },
    { cmd: '--autosquash', description: 'Automatically fold fixup!/squash! commits into their targets' },
  ],
  reset: [
    { cmd: '--soft', description: 'Move HEAD only, keep changes staged' },
    { cmd: '--mixed', description: 'Move HEAD, unstage changes but keep them in the working directory (default)' },
    { cmd: '--hard', description: 'Move HEAD and discard changes entirely — destructive' },
    { cmd: 'HEAD~N', description: 'Target N commits before the current HEAD' },
  ],
  log: [
    { cmd: '--oneline', description: 'One line per commit' },
    { cmd: '--graph', description: 'ASCII graph of branch/merge structure' },
    { cmd: '--all', description: 'Show commits reachable from any ref, not just HEAD' },
    { cmd: '-p', description: 'Show the diff for each commit' },
    { cmd: '-S "text"', description: 'Only show commits that added/removed this string ("pickaxe" search)' },
    { cmd: '--stat', description: 'Show a summary of files changed per commit' },
  ],
  diff: [
    { cmd: '--staged', description: 'Diff staged changes against the last commit' },
    { cmd: '--stat', description: 'Summary of changed files instead of a full diff' },
    { cmd: '<a>..<b>', description: 'Diff between two commits/branches' },
  ],
  push: [
    { cmd: '-u', description: 'Set the upstream tracking branch (short for --set-upstream)' },
    { cmd: '--force', description: 'Overwrite remote history — dangerous on shared branches' },
    { cmd: '--force-with-lease', description: 'Force-push, but abort if the remote moved since your last fetch' },
    { cmd: '--tags', description: 'Push all local tags' },
    { cmd: '--delete <branch>', description: 'Delete a remote branch' },
  ],
  stash: [
    { cmd: '-u', description: 'Include untracked files' },
    { cmd: 'pop', description: 'Reapply and remove the most recent stash' },
    { cmd: 'apply', description: 'Reapply but keep the stash in the list' },
    { cmd: 'list', description: 'Show all stashes' },
    { cmd: 'drop', description: 'Delete the most recent stash' },
  ],
}

export function explainGitCommand(input: string): GitCommand[] {
  const tokens = input.trim().split(/\s+/)
  if (tokens[0] !== 'git') return []
  const subcommand = tokens[1]
  const docs = GIT_FLAGS[subcommand]
  if (!docs) return []
  const matched: GitCommand[] = []
  for (const token of tokens.slice(2)) {
    const flagKey = token.replace(/^(--?[a-zA-Z-]+).*/, '$1')
    const doc = docs.find((d) => d.cmd.startsWith(flagKey) && flagKey.length > 1)
    if (doc && !matched.includes(doc)) matched.push(doc)
  }
  return matched
}

export function searchGitReference(query: string): GitCategory[] {
  if (!query.trim()) return GIT_REFERENCE
  const q = query.toLowerCase()
  return GIT_REFERENCE
    .map((cat) => ({
      category: cat.category,
      commands: cat.commands.filter((c) => c.cmd.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)),
    }))
    .filter((cat) => cat.commands.length > 0)
}
