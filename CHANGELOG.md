<!-- markdownlint-disable -->
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Add missing params to `CookieStore`
- `changeTagName` function
- `Element.prototype.getAttributeNames` shim

### Changed
- Get existing cookie when deleting them (for change events)
- Normalize params for `CookieStore`

### Fixed
- Update `cookieStore` to match behavior experienced in Origin-Trail in Chrome
- Fix missing params in `cookieStore.delete()` causing cookies to not be deleted
- Fix `cookieStore.delete()` only deleting single cookie

# [v2.5.3] - 2020-10-20

### Added
- Implement [`cookieStore` API](https://wicg.github.io/cookie-store/)
- `async whenInViewportFor(el, ms)` to track timed visiblity of elements
- Add shims for `requestIdleCallback()` and `cancelIdleCallback()`
- Add default handlers for Google Analytics (`tel;`, `mailto:`, etc)

### Changed
- `whenInViewport()` and `whenNotInViewport()` now return intersection data
- Update `$().intersect()` to work with individual items rather than all entries

## 2.5.2 - 2020-09-09

### Added
- `navigator.getInstalledRelatedApps()` shim
- Add `UTM` generator and validator class, extending `URL`
- `Promise.prototype.finally` shim
- `preload()` function, creating a `<link rel="preload">`
- Add `parseHTML()` function, which parses text and returns a document fragment
- More functions for other preloading techniques
- Add module containing functions to wait for visibility in viewport
- Add function to check if an element is visible withing the viewport (no waiting)
- Create function to get bounds of current viewport

### Changed
- Update `$.visible()` to be more similar to jQuery's `.visible()`
- Make `$.matches()` able to test all elements or any element

## [v2.5.1] - 2020-08-21

### Added
- `Promise.allSettled()` shim
- Polyfill for `navigator.permissions.query()` and `navigator.permissions.request()`
- `google-analytics.js`, exporting functions to import Google Analytics script

## [v2.5.0] 2020-08-03

### Added
- `debounce()` function in `functions.js`
- `$.debounce()`
- `loadImage()` function to load images after they have been fetched
- Polyfill for `img.complete` and `img.decode()`
- Polyfill for `Object.entries()`
- Polyfill for `Array.of` and `Arary.from`

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
