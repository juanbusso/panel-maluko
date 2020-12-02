

const normasFunction = (n,r) => {
    if (n) {
    let t = n.full_title || r.full_title;
    let resp = n.full_title;
    resp = resp.replace(/\//gi,"+").replace(/AMD/gi,"A").replace(/:/gi,": ").replace(/\+em/gi,"/").replace(/A2/gi,"A1+A2");
    let pub_date = n.pub_date || r.pub_date;
//  let year = n.year || r.year;
    let year = pub_date.substring(0,4);
    if (t.indexOf('CSV')>0){
        return t.substring(0,t.indexOf(':')) + ": " + year;
    }
    else return resp;
}}


export default normasFunction;
