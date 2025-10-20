# Guide to Contributing


# Team norms

- be active in the chat room
- regularly update others on your progress (through standups, chat, or Git commits)
- communicate blockers early/dont do work last minute
- respect each other’s time zones, workloads, and schedules.


## Team values

- be open minded to explore different ideas and provide feedback on every decisions
- make sure all voices are heard, especially quieter member
- encourage constructive criticism
- recognize that teammates have different strengths, learning styles, and life circumstances

## Sprint cadence

- each sprint should last 2 weeks
- use GitHub Projects (or your task board) to track deliverables and ownership
- each member must have at least one assigned and actionable item per sprint to make sure everyone is contributing

## Daily standups

- Standup times will take place remotely and time be decided based on the discord chat.
- Each standup should last at most 15 minutes
- All members are to be present during standups.
- Members will not cover for other members who do not participate.
- A member who makes no progress on a task for two standups or more in a row will be reported to management.

## Coding standards

- We will be using [vscode](https://code.visualstudio.com/) as our primary IDE
- Make granular and small commits, per feature or per bug fix.
- Provide small descriptive commit messages.
- Don't leave dead/commented out code behind. If you see such code, delete it.

## Git Workflow
Default branch: `master`

- Work on your own branch named **<yourname>**; do not commit directly to `master`.
- Commit messages: **one line**, meaningful and concise (what changed + why).
- Open a Pull Request to `master`; **at least 1 peer review is required** before merge.

**Steps**
```bash
# update local master
git checkout master
git pull origin master

# create your branch
git checkout -b <new-branch-name>

# stage and commit (one-line message)
git add .
git commit -m "meaningful one-line message"

# push your branch and open a PR to master
git push origin <new-branch-name>
```

## Concluding thoughts

- Let's make it easy to eat and stay healthy
