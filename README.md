# tree-sitter-teal

[![CI](https://github.com/euclidianAce/tree-sitter-teal/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/euclidianAce/tree-sitter-teal/actions/workflows/ci.yml)

It's a tree-sitter parser for Teal

Teal is a typed dialect of Lua, [get it here](https://github.com/teal-language/tl)

## Maintenance

There are a couple of things that occaisionally need to be done after updating the grammar or going to a new tree-sitter version.

### Updating the version
The version number should be updated using [semver](https://semver.org/). The `tree-sitter version` [command](https://tree-sitter.github.io/tree-sitter/creating-parsers#command-version) should be run to update the version across all the bindings:

- tree-sitter.json
- Cargo.toml
- package.json
- Makefile
- CMakeLists.txt
- pyproject.toml

NOTE: this command is not yet available in `tree-sitter` (as of 11/2024, version: 0.24.0), so these files _need to be updated manually_.

Afterwards, a new git tag can be created and a release will be generated by the GHA publish workflow.

### Updating to a new tree-sitter version
We're still figuring out the best way to do this, so some of the steps below may not be fully correct. It is best to check the tree-sitter [changelog](https://github.com/tree-sitter/tree-sitter/releases) and see what bindings were updated and ensure the changes are reflected correctly.

Update via `tree-sitter init --update` command:
- The `--update` flag that should update the generated code accordingly.
  - Check if the files updated are in-accordance with what the changelog indicates. If they aren't, you may need to fully regenerate the bindings.

Fully regenerate bindings:
1. Delete the language folder in `bindings`
2. Delete the corresponding package file (ex: Cargo.toml for rust, pyproject.toml for python, etc)
3. Run `tree-sitter init` to recreate the files.
4. From there, grep for "scanner", "query", and "queries" in the associated files (including the package files) and add/update the files as necessary
    - The code that needs to be added is usually explained in the comments, the grep will help find the comments.

The GHA CI workflow will try and build for the various languages and will error out if there are any issues.


