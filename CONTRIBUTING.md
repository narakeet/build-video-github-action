# Contributing and development

## Building the distribution

This action compiles all dependencies to a single file using `webpack`. To build the 
version for distribution, use:

```
npm run dist
```

The resulting file (`dist/action.js`) will be minified. 


## Releasing a new version

GitHub Actions require a published version (a git tag); don't forget to create a new
tag an push it to GitHub after building the distribution version.

## Keys and tokens

You will need both a Github Access token and a Narakeet API key to run this action. 
You can generate a GitHub Access token from your [profile settings](https://github.com/settings/tokens). To obtain
an API key, write to <contact@narakeet.com>.

## Testing

Create a `.env` file in the project root (it is ignored by git), containing
the following parameters:

```
API_KEY=
SOURCE_PATH=
GITHUB_REPOSITORY=
GITHUB_TOKEN=
```

To build from a specific SHA hash, instead of the repository head, add 

```
SHA=
```

Optionally, to use the Dev api instead of the production one, also add:

```
API_URL=https://testapi.narakeet.com/video/build
```

You can then run `npm t` to execute an integration test.
