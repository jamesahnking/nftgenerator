const fs = require("fs"); // read the files system 
const { createCanvas, loadImage } = require("canvas"); //create and load the content
const console = require("console"); // 
const { layersOrder, format, rarity } = require("./config.js");

const canvas = createCanvas(format.width, format.height); // create the canvas
const ctx = canvas.getContext("2d"); // library dimension

if (!process.env.PWD) {
  process.env.PWD = process.cwd();
}

const buildDir = `${process.env.PWD}/build`;
const metDataFile = '_metadata.json';
const layersDir = `${process.env.PWD}/layers`;

let metadata = [];
let attributes = [];
let hash = [];
let decodedHash = [];

const addRarity = _str => {
  let itemRarity;

  rarity.forEach((r) => {
    if (_str.includes(r.key)) {
      itemRarity = r.val;
    }
  });

  return itemRarity;
};

// check for the rarity in the filename from 'rarity'
// git rid of any of the 
const cleanName = _str => {
  let name = _str.slice(0, -4);
  rarity.forEach((r) => {
    name = name.replace(r.key, "");
  });
  return name;
};

// get the desired elements objects and add it to the array
// sort rarity based on _s or _sr in the file name it will delete it 
const getElements = path => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))//filter for mac 
    .map((i, index) => { // build
      return {
        id: index + 1,
        name: cleanName(i),
        fileName: i,
        rarity: addRarity(i),
      };
    });
};

// fetch layers from directory
const layersSetup = layersOrder => {
  const layers = layersOrder.map((layer, index) => ({
    id: index,
    name: layer,
    location: `${layersDir}/${layer}/`,
    elements: getElements(`${layersDir}/${layer}/`),
    position: { x: 0, y: 0 },
    size: { width: format.width, height: format.height },
  }));

  return layers;
}; 

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
};

const saveLayer = (_canvas, _edition) => {
  fs.writeFileSync(`${buildDir}/${_edition}.png`, _canvas.toBuffer("image/png"));
};

const addMetadata = _edition => {
  let dateTime = Date.now();
  let tempMetadata = {
    hash: hash.join(""),
    decodedHash: decodedHash,
    edition: _edition,
    date: dateTime,
    attributes: attributes,
  };
  metadata.push(tempMetadata);
  attributes = [];
  hash = [];
  decodedHash = [];
};

const addAttributes = (_element, _layer) => {
  let tempAttr = {
    id: _element.id,
    layer: _layer.name,
    name: _element.name,
    rarity: _element.rarity,
  };
  attributes.push(tempAttr);
  hash.push(_layer.id);
  hash.push(_element.id);
  decodedHash.push({ [_layer.id]: _element.id });
};

// Draw image to file based on layers
const drawLayer = async (_layer, _edition) => {
  let element =
    _layer.elements[Math.floor(Math.random() * _layer.elements.length)];
  addAttributes(element, _layer);
  const image = await loadImage(`${_layer.location}${element.fileName}`);

  ctx.drawImage(
    image,
    _layer.position.x,
    _layer.position.y,
    _layer.size.width,
    _layer.size.height
  );
  // Save image to file
  saveLayer(canvas, _edition);
};

// generate final file 
const createFiles = edition => {
  const layers = layersSetup(layersOrder);

  for (let i = 1; i <= edition; i++) {
    layers.forEach((layer) => {
      drawLayer(layer, i);
    });
    addMetadata(i);
    console.log("Creating edition " + i);
  }
};

const createMetaData = () => {
  fs.stat(`${buildDir}/${metDataFile}`, (err) => {
    if(err == null || err.code === 'ENOENT') {
      fs.writeFileSync(`${buildDir}/${metDataFile}`, JSON.stringify(metadata));
    } else {
        console.log('Oh no, error: ', err.code);
    }
  });
};

module.exports = { buildSetup, createFiles, createMetaData };