import React, {useState, useEffect } from 'react';
import getObjects, {gdata} from "./getObjects";

import {
    RefinementList
} from 'react-instantsearch-dom';

function containsAll(needles, haystack){
    for(var i = 0; i < needles.length; i++){
        if(!haystack.includes(needles[i])) return false;
    }
    return true;
}

export default function ( { attribute } ) {

    const [itemsState,setItemsState] = useState([]);
    const [data,setData] = useState(gdata[attribute]||{});

    useEffect(()=>{
        if(itemsState.length)  if (!containsAll(itemsState.map(i=>i.label),Object.keys(data))) getObjects('areas',itemsState.map(i=>i.label)).then(o=>setData(o));
    },[itemsState,data]);

    return <RefinementList attribute={attribute}
                           transformItems={items => { if (!itemsState.length || !containsAll(items.map(i=>i.label),itemsState.map(i=>i.label))) setItemsState(items);
                           return items.map(item => ({
                                   ...item,
                                   label: data[item.label]?data[item.label][gdata.config[attribute]?gdata.config[attribute].asFacet||'name':'name']:item.label,
                               }))
                           }}
    />

}