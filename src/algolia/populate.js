import getObjects from "./getObjects";

export default function Populate({hits,props}) {
    if (!hits) return new Promise(r=>r([]));
    hits = hits.filter(h=>h);
    let promises = [];
    let data = {};
    for (let i in props) {
        let {index, field} = props[i];
        let ob = [];

        if(field&&field.includes('.')) { let fields = field.split('.'); let f = fields.shift();

        if (f==='array') {
            let hits1 = hits.flat();
            // let f = fields.shift();
            promises.push(Populate({props:[{index, field:fields.join('.')}],hits:hits1}))
        }
        else
            promises.push(Populate({props:[{index, field:fields.join('.')}],hits:hits.map(h=>h[f])}));
        }
        else {
            for (let hit of hits) if (hit && hit[field]) {
                if (typeof hit[field] == 'number') hit[field] = hit[field].toString();
                if (typeof hit[field] == 'object') for (let hf in hit[field]) ob.push(hit[field][hf]);
                else if (typeof hit[field] == 'string') ob.push(hit[field]);
            }
            data[index] ? (data[index] = [...new Set([...ob, ...data[index]])]) : (data[index] = ob);
        }
    }

    for (let i in data) promises.push(getObjects(i,data[i]).then(r=>{data[i]=r}));

    return Promise.all(promises).then(()=>{
    for (let i in props) {
        let {index, field} = props[i];
        popHits(hits,data[index],field);
    }
   return hits;
})
}

function popHits(hits,popHits,field) {

    for (let i in hits) if (hits[i]&&hits[i][field]) {
        let f=hits[i][field];
        if (typeof f == 'object') {let new_field = {}; for (let hf in f) new_field[f[hf]]=popHits[f[hf]]||f[hf]; hits[i][field]=new_field }
        else if (typeof f == 'string') hits[i][field]=popHits[f]||f;
    }
}
