import React, {useEffect, useState} from "react";

// data
import TableAlgolia from "../../components/TableAgoliaFirestore";
import {Redirect} from "react-router-dom";
import {useAreaDataContext} from "../../context/AreaContext";


export default function FamiliasTable({filters,columnsView,addNew,...rest}) {

    const areaData = useAreaDataContext();
    let indexData = areaData.panel['familias'];
    const [columns,setColumns] = useState(JSON.parse(JSON.stringify(indexData.fields)));

    useEffect(()=>{setColumns(JSON.parse(JSON.stringify(indexData.fields)))},[indexData]);

    columnsView = columnsView || ['client','family','product','system','vigencia'];
    for (let i in columns) {
        !columns[i].options&&(columns[i].options={});
        columns[i].options.display = columnsView.includes(columns[i].field);
    }

    let filtersArray = [];
    filters && filtersArray.push(filters);
    indexData.filters && filtersArray.push(indexData.filters);

    return (
        <>
            <TableAlgolia
                index={'familias'}
                addNew={!!addNew || !!indexData.addNew}
                columns={columns}
                filters={filtersArray.join(' AND ')}
                renderExpandableRow={hit => <Redirect push to={{
                        pathname: "/app/familias/"+hit.objectID,
                        state: {
                            from: window.location.pathname,
                        }}}/>}
            />
        </>
    );
}


// const columns = [
//     {
//         name: "Cliente",
//         field: "client",
//         options: {
//             // customBodyRender:h=>(h&&h.razonsocial)||'',
//             sort: false,
//             filter:false,
//             index:'clientes',
//         }
//     },
//     {
//         name: "Familia",
//         field: "family",
//         options: {
//             filter: false,
//             filterType: 'textField',
//             sort: false,
//
//         }
//     },
//     {
//         name: "Producto",
//         field: "product",
//         options: {
//             filterType: 'range',
//             sort: false,
//             filter: false,
//         }
//     },
//     {
//         name:'Sistema',
//         field:'system',
//         options:{
//             sort: false,
//             filter: true,
//             filterType: 'checkbox',
//         }
//     },
//     {
//         name:'Vigencia',
//         field:'vigencia',
//         options:{
//             sort: false,
//             filter: true,
//             display:false,
//             filterType: 'checkbox',
//             // customFilterRender: r => r === 'true' ? 'Vigente' : 'No Vigente',
//             // customBodyRender: r => r ? 'Vigente' : 'No Vigente',
//         }
//     },
//     {
//         name: "Area",
//         field: "area",
//         options: {
//             display: false,
//             filter: true,
//             sort: false,
//             index: 'areas',
//             filterType: 'checkbox',
//             // customBodyRender: (hit) => (hit && hit.name) ||
//             //     Object.keys(hit).map(i=>( hit[i] && hit[i].name ) || '').join('; '),
//             // customFilterRender: (hit) => (hit && hit.name),
//         }
//     },
//     {
//         name: "Responsable",
//         field: "responsable",
//         options: {
//             // customBodyRender:h=>(h&&h.name)||'',
//             // customFilterRender:h=>(h&&h.name)||'',
//             display: false,
//             filter: true,
//             sort: false,
//             index: 'employees',
//         }
//     },
// ];
