import algoliasearch from 'algoliasearch';
import {createNullCache} from "@algolia/cache-common";

let algoliaconfig, clientAlgolia, algoliasearchBrowse;

export function setConfig (config) { algoliaconfig = config.algolia;
     clientAlgolia = algoliasearch(algoliaconfig.appID, algoliaconfig.apiKey,{responsesCache:createNullCache(),requestsCache:createNullCache()});
     algoliasearchBrowse = algoliasearch(algoliaconfig.browse.appID, algoliaconfig.browse.apiKey);
}

let indexAlgolia = {};
let indexAlgoliaBrowse = {};


let initIndex = (index) => {
    if (!indexAlgolia[index]) {
        if(!algoliaconfig[index]) indexAlgolia[index]=clientAlgolia.initIndex(index);
        else indexAlgolia[index] = algoliasearch(algoliaconfig[index].appID, algoliaconfig[index].apiKey,{responsesCache:createNullCache(),requestsCache:createNullCache()}).initIndex(index)}
}

let algoliaIndex = (index) => {
    initIndex(index);
    return indexAlgolia[index];
}

let initIndexBrowser = (index) => {
    if (!indexAlgoliaBrowse[index]) {
        if(!algoliaconfig.browse[index]) indexAlgoliaBrowse[index]=algoliasearchBrowse.initIndex(index);
        else indexAlgoliaBrowse[index] = algoliasearch(algoliaconfig.browse[index].appID, algoliaconfig.browse[index].apiKey).initIndex(index)}
}

let algoliaIndexBrowser = (index) => {
    initIndexBrowser(index);
    return indexAlgoliaBrowse[index];
}


export { algoliaIndex,algoliaIndexBrowser }
