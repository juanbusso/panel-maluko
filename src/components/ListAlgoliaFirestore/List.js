import {algoliaIndex} from "../../algolia";
import React, {useEffect, useState} from "react";
import Populate from "../../algolia/populate";
import {db} from "../../firebase";
import './List.css';
import getObjects from "../../algolia/getObjects";
// import {SlideDown} from 'react-slidedown'
// import 'react-slidedown/lib/slidedown.css'

function populateFacets(facets,showFacets) {
    let promises = [];
    for (let i in showFacets) if(facets[showFacets[i].name]) {
        let o = facets[showFacets[i].name];
        if (showFacets[i].index) {
        promises.push(new Promise(resolve=>{
            getObjects(showFacets[i].index,Object.keys(o)).then(res=>{
                if (showFacets[i].field) for (let j in o) if (res[j][showFacets[i].field]) o[j] = {name:res[j][showFacets[i].field],count:o[j]};
                if (typeof showFacets[i].indexText === 'function') for (let j in o) if(showFacets[i].indexText(res[j])) o[j] = {name:showFacets[i].indexText(res[j]),count:o[j]};
                // facets[showFacets[i].name] = o;
                resolve();
            })
        }))
    }
        if (typeof showFacets[i].text === 'function') for (let j in o) if(showFacets[i].text(j)) o[j] = {name:showFacets[i].text(j),count:o[j]};
    }
    return Promise.all(promises).then(()=>facets);
}


export default function ListAlgolia ({q,index,LiElement,populateProps,filters,showFacets,firestoreFilter,defaultFacetFilter,...props}) {

    const [hits,setHits] = useState([]);
    const [,setHitsObject] = useState({});
    const [facets,setFacets] = useState([]);
    const [newState,setNew] = useState(false);
    const [query,setQuery] = useState(q||'');
    const [facetFilters,setFacetFilters] = useState({});
    const [page,setPage] = useState(0);
    const [pages,setPages] = useState(0);

    useEffect(()=>{setQuery(q||'')},[q]);

    useEffect(()=>{setPage(0)},[query,facetFilters]);

    //actualiza busquedad en algolia
    useEffect(()=>{
        algoliaIndex(index).search(query,{
            filters:filters||'',facets:showFacets?showFacets.map(f=>f.name):'',
            facetFilters:Object.keys(facetFilters).map(facet=>facet+":"+facetFilters[facet]),
            page: page
        }).then(({hits,facets,nbPages,...r})=>{
            populateFacets(facets,showFacets).then(facets=>setFacets(facets));//f=>!!Object.keys(f).length?f:facets));
            setNew(true);
            for (let i in hits) hits[i].algoliaUpdated=true;
            setPages(pg =>  (pg!==(nbPages-1)) ? (nbPages-1) : pg );
            const updateHits = (hits) => setHitsObject(ho => {
                let nho = {...ho};
                for (let i in hits) { let id = hits[i].objectID; if ( !nho[id] || nho[id].algoliaUpdated ) nho[id]=hits[i]; }

                setHits(hh => {
                    let nh = (page?[...hh,...hits]:hits).map(h=>h.objectID);
                    return Object.keys(nho)
                        .filter(h=>nh.includes(h))
                        .sort((a,b)=>(nho[a].timestamp.seconds||nho[a].timestamp._seconds)-(nho[b].timestamp.seconds||nho[b].timestamp._seconds))
                        .map(h=>nho[h]);
                })
                return nho;
            })

            if (populateProps) Populate({hits,props:populateProps}).then(hits=>{updateHits(hits)});
            else {updateHits(hits)};
        })
        },[index,query,filters,populateProps,facetFilters,showFacets,page]);

     useEffect(()=>{if(defaultFacetFilter)setFacetFilters(defaultFacetFilter);},[defaultFacetFilter]);

    //busca los cambios nuevos en firestore
    useEffect(()=>{
        return db.collection(index).where('algoliaUpdated','==',false).limit(10).onSnapshot(docs=>{
        docs.forEach(doc=>{
            let data = doc.data();
            data.objectID = doc.id;
            // setTimeout(()=>{setHits(hh=>{hh[0].algoliaUpdated=true; return [...hh]})},500);
            const addHit = (hit) => setHitsObject(ho=>{
                let nho = {...ho,[doc.id]:hit}

                let add = !hit.delete;
                for (let i in firestoreFilter) if (hit[firestoreFilter[i].field] !== firestoreFilter[i].value ) add = false;

                 setHits(hh=>{
                    let nh = [hit,...hh].map(h=>h.objectID);
                    if (!add) nh = nh.filter(h=>h!==doc.id);
                    return Object.keys(nho)
                    .filter(h=>nh.includes(h))
                    .sort((a,b)=>(nho[a].timestamp.seconds||nho[a].timestamp._seconds)-(nho[b].timestamp.seconds||nho[b].timestamp._seconds))
                    .map(h=>nho[h]);
                })
                return nho;
            });
            if (populateProps) Populate({hits:[data],props:populateProps}).then(hits=>addHit(hits[0]));
            else addHit(data);
        })
    }) },[index,filters,populateProps,firestoreFilter]);


    return ( <>
        <input type="text" value={query} onChange={e=>setQuery(e.target.value)} className="searchBar" placeholder="Buscar.."/>
        {facets ? Object.keys(facets).map(facet => <div key={facet} className="w3-bar w3-margin-bottom"> {
               Object.keys(facets[facet]).map(fac =>
                <button key={fac} onClick={()=>setFacetFilters(prevState => {return {...prevState,[facet]:prevState[facet]===fac?'':fac}})} className={`w3-button w3-round-large w3-border w3-item-bar${facetFilters[facet]===fac?' w3-blue w3-hover-light-blue':''}`}>
                    {facets[facet][fac].name ? (facets[facet][fac].name + ' (' + facets[facet][fac].count + ')') :(fac + ' (' + facets[facet][fac] + ')')}
                </button>
               )}
            </div>
        )
         : ''}

        { pages && pages !== page ?  <div className={'w3-button w3-round-large w3-border w3-margin'} onClick={()=>setPage(p=>p+1)}>Cargar Mas...</div> : '' }

        {hits ? (<>
        <ul className="w3-ul w3-card-4">
            {hits.map(hit => <LiElement hit={{...hit, nnn: newState}} key={hit.objectID}/>)}
        </ul>
    </>) : ''
    }
        </>)
}
