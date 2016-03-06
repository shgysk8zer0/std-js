# Contributing to the project
**Table of Contents**
- [General](#general)
- [Requirements](#requirements)
- [Windows developer issues](#windows-issues)
- [PHP Contributions](#php)
- [JavaScript Contributions](#javascript)
- [CSS Contributions](#css)
- [Icons](#icons)
- [Git Submodules used](#git-submodules)
- [NPM Modules / Dev dependencies](#dev-dependencies)

- - -

## General
Write access to the GitHub repository is restricted, so make a fork and clone that. All work should be done on its own branch, named according to the issue number (*e.g. `42` or `bug/23`*). When you are finished with your work, push your feature branch to your fork, preserving branch name (*not to master*), and create a pull request.

**Always pull from `upstream master` prior to sending pull-requests.**

## Requirements
- [Apache](https://httpd.apache.org/)
- [Node/NPM](https://nodejs.org/en/)
- [Git](https://www.git-scm.com/download/)

## Windows issues
> This project requires several command line tools which require installation and
some configuration on Windows. The following will need to be added to your `PATH`
in order to be functional. "Git Shell" & "Git Bash" that comes with GitHub Desktop
or Git GUI are fairly usable so long as you select "Use Windows' default console window"
during installation. See [Windows Environment Extension](https://technet.microsoft.com/en-us/library/cc770493.aspx)

- Node
- Git
- GPG (GPG4Win)

## Git Hooks
Add these script in `/.git/hooks/` to automate building on pulls and testing on pushes
- `post-merge`
```
#!/bin/sh
npm run build
```
- `pre-push` *Causes major delay while tests are running and has issues on GitHub Desktop*
```
npm test
```

You should also copy or rename `.git/hooks/pre-commit.sample` to `.git/hooks.pre-commit`
to ensure that any filenames are valid across all OS's.

## JavaScript
Due to Content-Security-Policy, use of `eval` and inline scripts are **prohibited**. Further, this project uses ECMAScript 2015  [modules](http://exploringjs.com/es6/ch_modules.html), so be sure to familiarize yourself with the syntax.

![JavaScript sample](https://i.imgur.com/Ac0fKZu.png)

All JavaScript **MUST** pass Eslint according to the rules defined in `.eslintrc`
and have an extension of `.es6`.
Since this project minifies and packages all JavaScript using Babel & Webpack,
all script **MUST NOT** execute any code, but only
import/export functions, classes, etc.


## NPM
Several useful modules are included for Node users, which is strongly recommended for all development aside from PHP. Simply run `npm install` after download to install all Node modules and Git submodules. There are also several NPM scripts configured, which may be run using `npm run $script`.
- `build` which transpiles and minifies JavaScript
- `test` Runs eslint
- `git:hooks` Which sets `pre-commit`, `post-merge`, and `pre-push` hooks.
NPM also has a `postinstall` script which will automatically install dependencies
and create Git hooks, which should avoid problems with invalid file names and
outdated generated files.

## Dev dependencies
- [Babel](https://babeljs.io/)
- [Webpack](https://webpack.github.io/)
- [ESLint](http://eslint.org/)
