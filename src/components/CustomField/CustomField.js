const customFieldFunctions = {
    pad:(num, size) => {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    },
    textBefore:(v,text) => {
        return text + v;
    },
    ifEmpty:(v,text,hit) => v || customFieldRender(hit,text),
    if:(v,text,hit) => { text = text.split(','); return text[0] === String(v) || (text[0]==='false' && !v) ? customFieldRender(hit,text[1]) : customFieldRender(hit,text[2]) },
    date:()=> new Date(),
};

const customFieldRender = (hit,custom) => {
    let a=hit;let b=custom||'';
    let c=0;
    let n='';
    while(b.indexOf('{{',c)>-1){
        let f = b.indexOf('{{',c);
        n+=b.substring(c,f);
        let t = b.indexOf('}}',f+2);
        (()=> {
            let nf = f;
            while ((b.indexOf('{{', nf + 2) > 0) && b.indexOf('{{', nf + 2) < b.indexOf('}}', nf + 2)){
                nf = b.indexOf('{{', nf + 2);
                t = b.indexOf('}}', b.indexOf('}}', nf + 2) + 2);
            }
        })();
        let d = b.substring(f+2,t);
        // console.log(d);
        if (d.indexOf('{{')>-1 && d.indexOf('}}',d.indexOf('{{'))>-1) d = customFieldRender(hit,d);
        d = d.replace(/\\./g,';;');
        d = d.split('.');
        d = d.map(i=>i.replace(/;;/g,'.'));
        let v=a;
        for (let i of d) if ( v && typeof v === 'object')
            v=v[i];
        else if(i.substring(0,1) === '*') v =
            customFieldFunctions[i.substring(1,i.indexOf('('))](v,i.substring(i.indexOf('(')+1,i.indexOf(')')),hit) ;
        else v='';
        n+=v||'';
        c = t + 2;
    }
    n+=b.substring(c,b.length);
    return n;
}

export default customFieldRender;
