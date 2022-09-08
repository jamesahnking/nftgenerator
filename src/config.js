const layersOrder = [
    'b0',
    'd0',
    'c0',
    'c1',
    'c2',
    'd2',
    'c3',
    'd1',
    'c4',
    'c5',
    'n0',
    'n1'
    // 'n3',
    // 'x1'
];
  
const format = {
    width: 500,
    height: 500
};

// declare what addendums to the file name means 
// in regard to rarity.
// more items can be added to this array 
const rarity = [
    { key: "", val: "original" },
    { key: "_r", val: "rare" },
    { key: "_sr", val: "super rare" },
];

const defaultEdition = 20;

module.exports = { layersOrder, format, rarity, defaultEdition };