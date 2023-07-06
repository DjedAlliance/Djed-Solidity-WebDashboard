# Djed-Solidity-WebDashboard

Djed is a formally verified crypto-backed autonomous stablecoin protocol. To learn more, please check our **[gitbook docs](https://docs.djed.one/alliance/the-djed-alliance)**.

This repository contains the complete source code for a frontend application designed to facilitate user interaction with deployments of a [Solidity implementation](https://github.com/DjedAlliance/Djed-Solidity) of the Djed protocol. 

Known deployments of this frontend can be used at:

* [https://milkomeda-c1.djed.one](https://milkomeda-c1.djed.one)
* [https://milkomeda-c1-testnet.djed.one](https://milkomeda-c1-testnet.djed.one)

By utilizing this frontend application, users can conveniently engage with Djed deployments and explore the functionalities provided by the smart contracts.

To run this frontend locally, follow the [Installation](#installation) and [Usage](#usage) instructions below.

And, please, feel welcome to [contribute](#contributing).

## Installation

We use [nvm](https://github.com/nvm-sh/nvm) to handle the Node version, if you don't use `nvm`, the Node version can be taken from the [.nvmrc](./.nvmrc) file.

To download the project dependencies, run:
```
npm install
```

## Usage

In the project directory, run:

```
npm start
```

This will run the app in development mode. 
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will automatically reload when you make changes in the code.
You may also see any lint errors in the console.


To launch the test runner in interactive watch mode, run:

```
npm test
```

See React's documentation section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

To format the code to comply with the `prettier` style, run:

```
npm run format
```

To build the app for production to the `build` folder, run:

```
npm run build
```

This will correctly bundle React in production mode and optimize the build for the best performance.
The build is minified and the filenames include the hashes.
The app is ready to be deployed!

See React's documentation section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


## Contributing

Contributions are always welcome!

If you would like to contribute, please join our [Discord channel](https://discord.gg/vXQ86XGSbQ) and reach out to us.

---

Thanks for reading 😊
