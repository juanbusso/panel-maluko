import {algoliaIndex, algoliaIndexBrowser} from './index';

var data = {};

function sleep(delay = 0) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

const getObjects = async (index, o)=> {
    if (!data[index]) data[index] = {};
    o = [...new Set(o)];
    let op = []; let keys = Object.keys(data[index]);
    let updating = false;
    for (let i in o) {
        op.push(o[i]);
        // if (!keys.includes(o[i])) {data[index][o[i]] = { updating : true } ; op.push(o[i])}
        // data[index][o[i]].updating && (updating=true);
    };
    // updating && await sleep(2000);
    let rr =  JSON.parse(JSON.stringify(data[index]));
    if (!op.length) return rr;
    return algoliaIndex(index).getObjects(op).then(a=>{
        let r = a.results; for (let i of r) if(i) data[index][i.objectID] = i;
        let rr = JSON.parse(JSON.stringify(data[index]));
        return rr;
    });
    };

export const setObjects = (index,objects) => {
    if (!data[index]) data[index] = {};
    for (let i in objects) data[index][i] = objects[i];
}

export const AlgBrowser = (index,resolve) => {
    if (!data[index]) data[index] = {};

    algoliaIndexBrowser(index).browseObjects({
        query: '', // Empty query will match all records
        facetFilters: ['seller:v'],
        batch: batch => {
            // hits = hits.concat(batch);
            for (const i in batch) {data[index][batch[i].objectID]=batch[i]}
        }
    }).then(() => resolve(data[index]));

}

export var gdata = data;
export default getObjects;
