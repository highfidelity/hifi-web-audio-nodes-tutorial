
# HiFi Spatial Audio Tutorial

## Tutorial

The tutorial text is provided in the file, [HiFi Spatial Audio Tutorial](./docs/TUTORIAL.md).


---

## Development

The SPA created by the tutorial is developed as follows.


### Prerequisites

#### Node.js

**node** version 18 

**npm** version 8

https://nodejs.org/en/download/

#### Source

Make a local copy of the HiFi Spatial Audio Tutorial repo:
```
git clone https://github.com/highfidelity/hifi-spatial-audio-tutorial.git
```


### Development

#### Install the dependencies

Install the dependencies:
```
npm install
```

To use a local build of the Nodes library:
```
npm run install-local-audio-nodes
```
Note: When using a local build pf the Nodes library, whenever you change the library code, you need to rebuild it and restart
the demo server.

#### Lint the app

```
npm run lint
```

#### Build the app

Copy the app files into a `/dist` directory:
```
npm run build
```

#### Serve the app

Serve the app at [http://localhost:8080](http://localhost:8080):
```
npm run serve
```
