import React from "react";
import MUIDataTable from "mui-datatables";


export default function ModelosTable({hit}) {

    const {columns,data} = hitToModels(hit);

    return (
        <>
            <MUIDataTable
                title="Tabla de Modelos"
                data={data}
                columns={columns}
                options={{
                    filterType: "checkbox",
                    print: false,
                    onCellClick:(...a)=>console.log(a),
                    onTableChange: (a,b)=>{
                        // setQuery(b.searchText||'');
                    },
                }}
            />
        </>
    );
}


function hitToModels(hit) {
//TABLA MODELOS
//desagrupa marcas & reemplaza brands de hit.brands a model.brand
    if (hit.models) for (let m of hit.models) if (typeof m.brand == 'object') {
        for (let j = 1; j < m.brand.length; j++) hit.models.push({
            ...m,
            brand: typeof m.brand[j] === 'number' ? (hit.brands[m.brand[j]] || m.brand[j]) : m.brand[j]
        });
        m.brand = typeof m.brand[0] === 'number' ? (hit.brands[m.brand[0]] || m.brand[0]) : m.brand[0];
    } else if (!m.brand && hit.brands) {
        for (let j = 1; j < hit.brands.length; j++) hit.models.push({...m, brand: hit.brands[j]});
        m.brand = hit.brands[0];
    }
    let specsNames = {
        'product': 'Producto',
        'brand': 'Marca',
        'model': 'Modelo',
        'voltage': 'Tension',
        'freq': 'Frec',
        'power': 'Potencia',
        'current': 'Corr',
        'class': 'Clase',
        'ip': 'IP',
        'cap': 'Casquillo',
        'others': 'Otros',
        'comments': 'Comentarios'
    };

    let mspecst = [];
    let comments = false;
    let units = {};
    for (let i in hit.models) {
        for (let j in hit.models[i].specs) {
            let u = hit.models[i].specs[j].replace(/[^a-zA-Z]+/g, "");
            if (u && !units[j]) units[j] = u; else if (units[j] && units[j].toUpperCase() !== u.toUpperCase() && units[j] !== 'diff') units[j] = 'diff';
            if (!mspecst.includes(j)) {
                mspecst.push(j);
            }
        }
        ;
        if (hit.models[i].comments && !comments) comments = true
    }
    for (let i in units) if (units[i] === 'diff') delete units[i];
    let columns = [{name:'Marca'},{name:'Modelo'}];
    for (let j in mspecst) columns.push({name:`${specsNames[mspecst[j]]} ${units[mspecst[j]] ? ('(' + units[mspecst[j]] + ')') : ''}`});
    if (comments) columns.push({name:'Comentarios'});

    let data = [];
    if (hit.models) for (let m of hit.models) {
        let modelRow = [typeof m.brand === 'number' ? (hit.brands[m.brand] || m.brand) : m.brand,m.model];
        for (let j in mspecst) modelRow.push((m.specs[mspecst[j]] || '').replace(units[mspecst[j]] || "", ""));
        comments && modelRow.push(m.comments);
        data.push(modelRow);
    }
    return {columns,data};
}
