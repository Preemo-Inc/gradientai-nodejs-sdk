# Gradient AI SDK for JavaScript

A JavaScript client with TypeScript types definitions for [gradient](https://docs.gradient.ai/)

[![npm version](https://badge.fury.io/js/@gradientai%2Fnodejs-sdk.svg)](https://badge.fury.io/js/@gradientai%2Fnodejs-sdk)

## Installation

```
npm install --save @gradientai/nodejs-sdk
```

## Usage

> Refer to [SDK quickstart](https://docs.gradient.ai/docs/sdk-quickstart) page for more examples. The [gradient-sdk-typescript-example](https://github.com/Preemo-Inc/gradient-sdk-typescript-example) repository has a complete working example!

```js
import { Gradient } from "@gradientai/nodejs-sdk";

const gradient = new Gradient({});
const models = await gradient.listModels();
```

> See the complete list of endpoints in the [API reference](https://docs.gradient.ai/reference/listmodels).

## Requirements

This package requires NodeJS at least in version 18.

## Getting help

To report issues with the SDK, it is possible to [submit an issue](https://github.com/Preemo-Inc/gradientai-nodejs-sdk/issues) in the package repo.
