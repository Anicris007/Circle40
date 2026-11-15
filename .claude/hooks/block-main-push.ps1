# PreToolUse hook: stops Claude from pushing to main (or merging PRs itself).
# Reads the tool call as JSON on stdin. Exit 2 = block the command, with the reason on stderr.

try {
    $raw  = [Console]::In.ReadToEnd()
    $data = $raw | ConvertFrom-Json
} catch { exit 0 }

$cmd = [string]$data.tool_input.command
if (-not $cmd) { exit 0 }
$cwd = [string]$data.cwd
if (-not $cwd) { $cwd = (Get-Location).Path }

function Deny([string]$why) {
    [Console]::Error.WriteLine("BLOCKED by Circle40 repo rule: $why Claude never pushes to main. Work on a branch (git switch -c <name>), push that branch, and open a pull request (gh pr create). The owner reviews and merges it.")
    exit 2
}

function Get-CurrentBranch {
    $git = 'git'
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { $git = "$env:ProgramFiles\Git\cmd\git.exe" }
    $ErrorActionPreference = 'Continue'
    try { return [string](& $git -C $cwd rev-parse --abbrev-ref HEAD 2>$null) } catch { return '' }
}

$protected = '^(refs/heads/)?(main|master)$'
$segments = $cmd -split '\r?\n|;|&&|\|\||\|'

foreach ($seg in $segments) {
    $s = $seg.Trim()
    if (-not $s) { continue }

    if ($s -match '(^|[\s&"''])gh(\.exe)?["'']?\s+pr\s+merge\b') {
        Deny 'Merging pull requests into main is left to the repo owner.'
    }

    if ($s -notmatch '(^|[\s&"''])git(\.exe)?["'']?\s+(.*\s)?push(\s|$)') { continue }

    $after  = ($s -split '\bpush\b', 2)[1]
    $tokens = @($after -split '\s+' | Where-Object { $_ -ne '' } | ForEach-Object { $_.Trim('"', "'") })

    if ($tokens -contains '--all' -or $tokens -contains '--mirror') {
        Deny 'Pushing all branches would include main.'
    }

    $positional = @($tokens | Where-Object { -not $_.StartsWith('-') })
    $refspecs   = @()
    if ($positional.Count -gt 1) { $refspecs = $positional[1..($positional.Count - 1)] }

    if ($refspecs.Count -eq 0) {
        $branch = Get-CurrentBranch
        if ($branch -match $protected) { Deny 'The current branch is main, so this push would update main.' }
        continue
    }

    foreach ($r in $refspecs) {
        $dst = ($r.TrimStart('+') -split ':')[-1]
        if ($dst -match $protected) { Deny 'This push targets main.' }
        if ($dst -eq 'HEAD' -or $dst -eq '@') {
            $branch = Get-CurrentBranch
            if ($branch -match $protected) { Deny 'HEAD is main, so this push would update main.' }
        }
    }
}

exit 0
