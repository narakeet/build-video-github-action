# Contributing and development

## Building the distribution

This action compiles all dependencies to a single file using `webpack`. To build the 
version for distribution, use `npm run dist`;

## Releasing a new version

GitHub Actions require a published version (a git tag); don't forget to create a new
tag an push it to GitHub after building the distribution version.

## Testing

Create a `.env` file in the project root (it is ignored by git), containing
the following parameters:

```
VIDEOPUPPET_API_KEY=
SOURCE_PATH=
GITHUB_REPOSITORY=
GITHUB_TOKEN=
```

To build from a specific SHA hash, instead of the repository head, add 

```
SHA=
``

Optionally, to use the Dev api instead of the production one, also add:

```
API_URL=https://testapi.videopuppet.com/video/build
```

You can then run `npm t` to execute an integration test.
