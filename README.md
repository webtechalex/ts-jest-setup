## Summary

This project is an example of how to set up a simple TDD environment using TypeScript.

## How to use this repo

You can clone this project and use it to do TDD with TypeScript, or you can use this README to help you set up your own TypeScript TDD project and absorb the learnings about how Node.js and Jest interact with ESModule syntax and as a starting point for a deeper understanding of how they both interact with the `tsc` compiler.

This code has been tested with Node v18.16.0. If you want to use the code directly, feel free to fork amd then if you use `nvm`, run `nvm use` at the project root to ensure node compatibility. Now just `npm install` and play with the scripts and files as you wish!

If you want to start learning how it all fits together and create your own TTD environment from scratch, read on!

## Preparation

The required development dependencies for a TypeScript TDD project with Jest are:
- jest (our test runner, which works with JavaScript only)
- ts-jest (the critical part of this setup. It is the transformer that jest will use to transform `*(.spec).ts` files into something it can run)
- typescript (to transpile our TypeScript files into JavaScript files. It is required as a peer dependency of ts-jest)
- @types/jest (the type declarations used by ts-jest. It is required as a peer dependency of ts-jest)

For the purpose of this documentation, we will use `npm` as the package manager.

We start by creating a project 
```
mkdir my-awesome-tdd
cd my-awesome-tdd
npm init -y`
```
## Installing dependencies

Then install the development dependencies (see above for a brief description of each)
```
npm install --save-dev jest typescript ts-jest @types/jest
```
Typescript will need a basic configuration file to tell it how to process the `*.ts` files and emit `*.js` files. Luckily for us, we can ask it to generate one automatically
```
npx tsc --init
```
We also need a config file for Jest and we need to make sure that it is configured correctly to use `ts-jest` as a transformer for `*.ts` files when running the tests. Again, luckily for us, we can ask ts-jest to generate one for us
```
npx ts-jest config:init
```

## Creating and testing the scripts
Now we just need to make all the npm scripts that we need. The following examples are all entries in the `scripts` section of `package.json`.

We can start with a build script and use it to check that `tsc` is working. In this project, the `outDir` property in the `tsconfig` has been modified so that all the emitted `*.js` files go to one place: `./dist`. Our build script entry is really simple
```
"build": "tsc"
```
We then make a run script just to show that `node` can run the emitted `*.js` files after building. This is not really a necessary script for our purposes, (see `ts-node` below) it's just a useful sanity check
```
"dev:js": "node ./dist/index.js"
```
Now we want to be able to run our tests. We have already configured Jest to transform files with `ts-jest` so our test script entry is very simple
```
"test": "jest"
```
We have already got Node running the emitted `*.js` files, but we need to build after every change and then run it. What if Node could run our `*.ts` files directly? We can use `ts-node` for this. The project installs `ts-node` and includes a script to run it
```
"dev": "ts-node ./src/index.ts"
```
## An important note about the emitted JavaScript

Notice that we have chosen to emit modules that use CommonJS module syntax. We can configure TypeScript to emit ESModules, but there is a critical difference between how TypeScript allows ESM imports to be expressed and what NodeJS expects from ESM import syntax:

Typescript allows the file extension to be omitted in the file path value, so the import in our TypeScript file looks like this:

```typescript
import { greeting } from "./greeting"
```

Node wants the emitted JavaScript to look like this, (note the `.js` file extension):
```javascript
import { greeting } from "./greeting.js"
```

For some reason, `tsc` cannot insert file extensions on imports of emitted JavaScript files, even when the imports are from files that TypeScript emitted! This is not a problem when we use a module bundler however, because bundlers have processes that can modify the emitted files post-transpilation if we want them to. If we specifically want to emit and use ESModules in the built project it is probably best to include a module bundler on top of this setup. 

This particular project is about keeping things simple, so we have configured TypeScript to emit CommonJS modules as they are not subject to the above issues.

If we were emitting ESModules there are a couple of things to note about Node setup and running Jest:

We need to tell Node to expect ESModules when it runs. We can do this in one of three ways: by using `*.mjs` file extensions; including a specific flag while running; by adding the entry `"type": "module"` to `package.json`. More info [here](https://nodejs.org/api/esm.html#enabling).

We need to tell Jest to expect ESModules by running it directly with `node` and passing a flag
```
node --experimental-vm-modules node_modules/.bin/jest
```
In this project we can see that we just need to run `jest`. This is because the `ts-jest` transformer is using our `tsconfig.json` which is telling `tsc` to emit CommonJS modules that Jest understands out of the box.