
# Djed-Solidity-WebDashboard

- [What is Milkomeda?](#what-is-milkomeda)
- [What is Djed?](#what-is-djed)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [How to Contribute?](#how-to-contribute)


## What is [Milkomeda](https://docs.milkomeda.com/)? 
Milkomeda allows Apps to work in multiple blockchains. Imagine if any cool Android App could work in your iPhone without any changes!

## What is [Djed](https://milkomeda-c1.djed.one/)?
Djed is a formally verified crypto-backed autonomous stablecoin protocol. 

It has been researched since Q2 2020, its [whitepaper](https://eprint.iacr.org/2021/1069) has been released in August 2021, and it has multiple [implementations](https://github.com/DjedAlliance) and [deployments](https://docs.djed.one/implementations-and-deployments/deployments). 

Here you can interact with a deployment that uses [these smart contracts](https://github.com/DjedAlliance/Djed-Solidity/commits/Belus) on Milkomeda-C1.


## Installation

#### Getting Started with Create React App
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Pre-requisites

We handle environment variables in `.env` files with default values in [env/](./env/) folder, i.e. [env/](./env/) contains `*.env` files for specific environments. 

If the repo is freshly cloned, you can copy one of those files to the root folder as `.env`, `cp ./env/milkomeda-c1-testnet.env .env` is good enough for most cases.

We use [nvm](https://github.com/nvm-sh/nvm) to handle the Node version, if you don't use `nvm`, the Node version can take from the [.nvmrc](./.nvmrc) file.

## npm
Run `npm install` to download the project dependencies.
```bash
npm install
```

## Usage

**In the project directory, you can run:**

#### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


The page will reload when you make changes.\
You may also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run format`

Formats the code to comply with the `prettier` style.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.


## Documentation

#### Milkomeda docs
Documentation lives on [**milkomeda docs**](https://docs.milkomeda.com/).


#### Djed docs
Documentation lives on [**Djed docs**](https://docs.djed.one/alliance/the-djed-alliance).


## Contributing

Contributions are always welcome!

For anyone who wants to contribute, please join our [Discord channel](https://discord.com/invite/5TWZwGXXym), where you can learn more about how to contribute to further development.

---

Thanks for reading 😊
