# Contributing to the project

Due to Content-Security-Policy, use of `eval` and inline scripts are **prohibited**.
Further, this project uses [native JavaScript modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/),
so be sure to familiarize yourself with the syntax. It also uses [classes](https://hacks.mozilla.org/2015/07/es6-in-depth-classes/)
and many other [ES6](https://hacks.mozilla.org/category/es6-in-depth/) features,
so you should be familiar with them.

All JavaScript **MUST** pass Eslint according to the rules defined in `.eslintrc`
and have an extension of `.js`.
Since this project minifies and packages all JavaScript using Babel & Webpack,
all script **MUST NOT** execute any code, but only
import/export functions, classes, etc.
