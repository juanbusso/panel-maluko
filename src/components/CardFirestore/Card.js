import React, {useEffect, useState} from "react";

// components
import Populate from "../../algolia/populate";
import {db} from "../../firebase";
import {useAreaDataContext} from "../../context/AreaContext";

//checkea si hay indices adentro de nested o multiples
function fieldNorMreview(b,f){
  if(f.options && f.options.multiple) {
    return [fieldNorMreview(b + f.field + '.array.',{...f,options:{...f.options,multiple:false}})];
  }
  if(f.options && f.options.nested) {
    let nf = f.options.nested;
    const lastArray = b.split('.')[b.split('.').length-2] === 'array';
    return nf.map(nff=>fieldNorMreview(b + (lastArray? '' : f.field + '.'),nff));
  }
  if(f.options && f.options.index) {
    return {index:f.options.index.name,field:b+f.field}
  }
  return '';
  }

export default function Card({index,objectID,populateProps,relatedIndexes,render,...props}) {
  const [hit,setHit] = useState([]);
  const [relatedHits,setRelatedHits] = useState({});
  const [populatePropsState,setPopulatePropsState] = useState(populateProps);

  const areaData = useAreaDataContext();
  useEffect(()=>{
    !populateProps && areaData.panel[index] ? setPopulatePropsState(areaData.panel[index].fields.map(f=>fieldNorMreview('',f)).flat(10).filter(f=>!!f))//areaData.panel[index].fields.filter((f)=>f.options&&f.options.index).map(f=>({index:f.options.index.name,field:f.field})))
    : setPopulatePropsState({});
  },[areaData.panel,index,populateProps])

  useEffect(()=>{
    if(populatePropsState) return db.collection(index).doc(objectID).onSnapshot(async doc=>{
      let data = {...doc.data(),objectID};
      populatePropsState && Object.keys(populatePropsState) && (data = await Populate({ hits:[data], props: populatePropsState }).then(a=>a[0]));
      setHit([data,{...doc.data(),objectID}]);
    })
  },[index,objectID,populatePropsState]);

  useEffect(()=>{
    let snapshots = [];
    for (let i in relatedIndexes)
      snapshots.push(db.collection(relatedIndexes[i].index).where(relatedIndexes[i].field,relatedIndexes[i].logical || '==',objectID).onSnapshot(async docs=>{
        let hits = [];
        for (let j in docs.docs) hits.push({...docs.docs[j].data(), objectID: docs.docs[j].id});
        let pp = relatedIndexes[i].populateProps;
        pp && (hits = await Populate({hits, props: pp}));
        setRelatedHits(h=>({...h,[relatedIndexes[i].index]:hits}));
    }));
    return () => {for(let k in snapshots)snapshots[k]()}
  },[index,objectID,relatedIndexes]);

  return React.createElement(render,{hit:hit[0]||false,orginalHit:hit[1]||false,relatedHits});
}
