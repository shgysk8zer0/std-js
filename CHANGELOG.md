<!-- markdownlint-disable -->
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `google-analytics.js`, exporting functions to import Google Analytics script
- `debounce()` function in `functions.js`
- `$.debounce()`
- `loadImage()` function to load images after they have been fetched
- Polyfill for `img.complete` and `img.decode()`

### Changed
- Mark several functions and methods as deprecated, for removal in v3.0.0

## [v2.4.4] - 2020-08-01

### Added
- Script and stylesheet loader functions
- Notification shim using `<html-notification>`, checking for false support (Chrome Android)

### Changed
- Update `.editorconfig` to specifiy tab style and width

## [v2.4.3] - 2020-07-17

### Updated
- eslint now indents on each `case` for a `switch`

## [v2.4.2] - 2020-07-15

### Added
- `registerCustomElement(tag, classObject)` function
- `getCustomElement(tag)` function
- `createCustomElement(tag, ...args)` function
- `navigator.setAppbadge()` shim (just a promise that rejects)
- `navigator.clearAppBadge()` shim (calls `navigator.setAppBadge(0)`)

## [v2.4.1] - 2020-07-09

### Added
- Single module as wrapper for `crypto.subtle.digest`
- Shim for [`ParentNode.replaceChildren()`](https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/replaceChildren)

### Changed
- Update eslint config and do not use project-wide globals

### Removed
- Uninstall eslint-babel plugin

## [v2.4.0] - 2020-06-27

### Added
- Dependabot
- GitHub Super Linter
- Changelog

### Changed
- Update Issue Templates, etc.
- Dependency updates

### Removed
- Travis-CI config
<!-- markdownlint-restore -->
