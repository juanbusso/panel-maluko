import { algoliaIndex } from "../../algolia";
import React, { useEffect, useState, useReducer } from "react";
import Populate from "../../algolia/populate";
import { db } from "../../firebase";
import getObjects from "../../algolia/getObjects";
import MUIDataTable from "mui-datatables";
import deepEqual from "deep-equal";
import {format as formatDate} from "date-fns";
import CircularProgress from "@material-ui/core/CircularProgress";
import customField from '../CustomField';
import FieldRender from "../CardFirestore/DataCard/components/FieldRender";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import {Button} from "../Wrappers";
import AddNew from "../CardFirestore/DataCard/components/AddNew";

function populateFacets(facets, showFacets) {
  let promises = [];
  for (let i in showFacets)
    if (facets[showFacets[i].name]) {
      let o = facets[showFacets[i].name];
      if (showFacets[i].index) {
        promises.push(
          new Promise(resolve => {
            getObjects(showFacets[i].index, Object.keys(o)).then(res => {
              if (showFacets[i].field)
                for (let j in o)
                  if (res[j][showFacets[i].field])
                    o[j] = { name: res[j][showFacets[i].field], count: o[j] };
              if (typeof showFacets[i].indexText === "function")
                for (let j in o)
                  if (showFacets[i].indexText(res[j]))
                    o[j] = {
                      name: showFacets[i].indexText(res[j]),
                      count: o[j]
                    };
              if (showFacets[i].indexField)
                for (let j in o)
                    o[j] = {
                      name: (res && res[j] && res[j][showFacets[i].indexField]) || '',
                      count: o[j]
                    };
              // facets[showFacets[i].name] = o;
              resolve();
            });
          })
        );
      } else
        for (let j in o)
          o[j] = {
            name: (showFacets[i].indexText && showFacets[i].indexText(j)) || j,
            count: o[j]
          };
    }
  return Promise.all(promises).then(() => facets);
}

const updateColumns = (facets, c, sData) => {
  Object.keys(facets).map(f => {
    let e = c.find(a => a.field === f);
    if (!e) {
      e = c.push({ name: f, field: f });
      e = c[e - 1];
    }
    e.options || (e.options = { display: false });
    let names,
      ff = [];
    if (
      !(sData.lastUpdate.facetFilters && sData.lastUpdate.facetFilters === f)
    ) {
      ff = Object.keys(facets[f]);
      names = ff.map(a => `${facets[f][a].name} (${facets[f][a].count})`);
      e.options.filterOptions = { names };
      e.facets = {};
      for (let i in names) e.facets[names[i]] = ff[i];
    } else names = e.options.filterOptions.names;
    e.options.filterList = names.filter(
      (a, i) =>
        sData.facetFilters[f] &&
        sData.facetFilters[f].includes(ff[i] || e.facets[names[i]])
    );
    return f;
  });
  return c;
};

const lastUpdateFacetFilter = (bf, af) => {
  for (let i in af) if (!deepEqual(af[i], bf[i])) return i;
  return "";
};

const facetCountFilteredByOthers = (sData, facets) => {
  let promises = [];
  for (let i in sData.facetFilters) {
    let facetFilters = { ...sData.facetFilters };
    delete facetFilters[i];
    let r = algoliaIndex(sData.index).search(sData.query, {
      filters: sData.filters || "",
      facets: [i],
      facetFilters: Object.keys(facetFilters).map(facet =>
        typeof facetFilters[facet] === "object"
          ? facetFilters[facet].map(ff => facet + ":" + ff)
          : facet + ":" + facetFilters[facet]
      ),
      hitsPerPage: 0,
      responseFields: ["facets"]
    });
    promises.push(r);
  }
  return Promise.all(promises).then((...a) => {
    for (let i in a) facets = { ...facets, ...a[i].facets };
    return facets;
  });
};



export default function TableAlgolia({
  index,
  filters,
  defaultFacetFilter,
  title,
  columns,
  renderExpandableRow,
  addNew,
  ...props
}) {
  //table data
  const [data, setData] = useState({
    hits: [],
    columns: columns,
    count: 0,
    pages: 0,
    rowsPerPage :20,
  });

  const [loading,setLoading] = useState(true);
  //search Data for retrive the result
  const [sData, dispatchSData] = useReducer(
    (s, a) => a === 'reset' ? initSdata() :({
      ...s,
      [a.prop]: a.value,
      ...(a.prop === "page" ? {} : { page: 0 }),
      lastUpdate: {
        [a.prop]:
          a.prop === "facetFilters"
            ? lastUpdateFacetFilter(s.facetFilters, a.value)
            : a.value
      }
    }), {} , initSdata

  );

  function initSdata() {
    return {
      index,
      query: "",
      filters,
      populateProps: columns
          .filter(c => c.options && c.options.index)
          .map(c => ({ field: c.field, index: c.options.index.name || c.options.index })),
      facetFilters: defaultFacetFilter || {},
      showFacets: columns
          .filter(c => c.options && c.options.filter)
          .map(c => ({
            name: c.field,
            index: (c.options.index && c.options.index.name) || c.options.index,
            indexField: c.options.index && c.options.index.field,
            indexText: c.options.customFilterRender
          })),
      page: 0,
      hitsPerPage: 20,
      fields: columns.map(c => c.field),
      lastUpdate: {},
      hitsObject: {}
    }
  }

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [dColumns, setColumns] = useState(columns);

  useEffect(() => {
    if (query) {
      let timeout = setTimeout(() => {
        dispatchSData({ prop: "query", value: query });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [query]);

  useEffect(()=>{
    setLoading(true);
  },[sData]);

  //actualiza busquedad en algolia
  useEffect(() => {
    let old = false;
    algoliaIndex(sData.index)
      .search(sData.query, {
        filters: sData.filters || "",
        facets: sData.showFacets.map(f => f.name),
        facetFilters: Object.keys(sData.facetFilters).map(facet =>
          typeof sData.facetFilters[facet] === "object"
            ? sData.facetFilters[facet].map(ff => facet + ":" + ff)
            : facet + ":" + sData.facetFilters[facet]
        ),
        page: sData.page,
        hitsPerPage: sData.hitsPerPage
      })
      .then(async ({ hits, facets, nbPages, nbHits, ...r }) => {
        !old &&
          Object.keys(sData.facetFilters).length &&
          (facets = await facetCountFilteredByOthers(sData, facets));

        !old && (facets = await populateFacets(facets, sData.showFacets));

        sData.populateProps &&
          !old &&
          (hits = await Populate({ hits, props: sData.populateProps }));

        if (!old) {
          setData(d => {
            let nho = {...d.hitsObject};
            for (let i in hits) {
              let id = hits[i].objectID;
              if (!nho[id] || nho[id].algoliaUpdated !== false)
                nho[id] = hits[i];
            }


            let nh = hits.map(h => nho[h.objectID]);

            let dataTable = nh.map(h => d.columns.map(c =>
                <FieldRender f={c} hit={h} index={sData.index}/>
                // c.customField ? customField(h, c.customField) : h[c.field] ?
                //     c.options && c.options.index && c.options.index.field ?
                //         Object.keys(h[c.field]) && h[c.field].objectID ? h[c.field][c.options.index.field] : Object.keys(h[c.field]).map(hi => h[c.field][hi][c.options.index.field]).join('; ')
                //         : c.options && c.options.type === 'date' ? formatDate(new Date(h[c.field] + ' GMT-1100'), 'dd/MM/yyyy')
                //         : h[c.field]
                //     : ''
            ));


            return {
              columns: facets ? updateColumns(facets, d.columns, sData) : d.columns,
              dataTable,
              hits: nh,
              count: nbHits,
              pages: nbPages,
              hitsObject: nho
            };
          });
          setLoading(false);
        }
      });
    return function() {
      old = true;
    };
  }, [sData]);

  // useEffect(()=>{if(defaultFacetFilter)setFacetFilters(defaultFacetFilter);},[defaultFacetFilter]);

  //busca los cambios nuevos en firestore
  useEffect(() => {
    return db
      .collection(sData.index)
      .where("algoliaUpdated", "==", false)
      .limit(5)
      .onSnapshot(docs => {
        docs.forEach(async doc => {
          let hit = doc.data();
          hit.objectID = doc.id;

          if (!sData.filters || (()=> {
            let fs = sData.filters.split(' AND ');
            for (let i in fs) if (!hit[fs[i].split(':')[0]].includes(fs[i].split(':')[1])) return false;
            return true
          } )()) {

            if (!hit.delete && sData.populateProps)
              await Populate({hits: [hit], props: sData.populateProps}).then(
                  hits => {
                    hit = hits[0];
                  }
              );

            setData(d => {
              d.hitsObject = {...d.hitsObject, [doc.id]: hit};
              hit.delete && (delete d.hitsObject[doc.id]);
              for (let i in d.hits)
                if (d.hits[i].objectID === doc.id) {
                  !hit.delete ? (d.hits[i] = hit) :
                      (d.hits = d.hits.filter(a => a.objectID !== doc.id));
                  d.dataTable = d.hits.map(h => d.columns.map(c => <FieldRender f={c} hit={h} index={sData.index}/>));
                  return {...d};
                }
              d.hits = [hit, ...d.hits];
              d.dataTable = d.hits.map(h => d.columns.map(c => <FieldRender f={c} hit={h} index={sData.index}/>));
              return {...d};
              return d;
            });
          }
        });
      });
  }, [sData]);


  return (
    <>
      <MUIDataTable
          title={<>{addNew && <AddNewButton sData={sData}/>} {title || "Tabla de " + index} {loading&&<CircularProgress color="inherit" size={20} />}</>}
        data={data.dataTable}
        columns={data.columns}
        options={{
          filterType: "dropdown",
          // customToolbar:()=><div>hola</div>,
          selectableRows: "none",
          expandableRows: !!renderExpandableRow,
          renderExpandableRow: renderExpandableRow
            ? (rd, { rowIndex }) => renderExpandableRow(data.hits[rowIndex])
            : () => "",
          expandableRowsOnClick: !!renderExpandableRow,
          count: data.count,
          serverSide: true,
          searchText: query,
          responsive: 'standard',
          // tableBodyHeight: '600px',
          // setTableProps: () => {
          //   return {
          //     padding: true ? "none" : "default",
          //
          //     // material ui v4 only
          //     size: true ? "small" : "medium",
          //   };
          // },
          tableBodyMaxHeight: 'calc(100vh - 350px)',
          rowsPerPage: data.rowsPerPage,
          rowsPerPageOptions: [20,50,100,200],
          onChangePage: p => {
            setPage(p);
            dispatchSData({ prop: "page", value: p });
          },
          page: page,
          download: false,
          serverSideFilterList: data.columns.map(c=>(c.options&&c.options.filterList)||[]),
          print: false,
          onFilterChange: (...a) => {
            let f = {};
            a[1].map((a, i) => {
              a.map(b => {
                f[dColumns[i].field] || (f[dColumns[i].field] = []);
                f[dColumns[i].field].push(
                  dColumns[i].facets ? dColumns[i].facets[b] : ""
                );
                return b;
              });
              return a;
            });
            dispatchSData({ prop: "facetFilters", value: f });
          },
          onColumnViewChange: (a, b) => {
            setColumns(c => {
              let e = c.find(d => d.name === a);
              e.options || (e.options = {});
              e.options.display = b === "add";
              return [...c];
            });
          },
          onChangeRowsPerPage: hpp => {
            dispatchSData({prop: "hitsPerPage", value: hpp});
            setData(d=>({...d,rowsPerPage:hpp}));
          }, //setSData(d=>({...d,hitsPerPage:hpp,lastUpdate:{hitsPerPage:hpp}})),
          // customFilterDialogFooter: () => <>Hola</>,
          onSearchChange: q => {
            setQuery(q || "");
            q || dispatchSData({ prop: "query", value: "" });
          },
          onTableChange: (a, b) => {
          }
        }}
      />

    </>
  );
}


const AddNewButton = ({sData}) => {
  const [addNew,setAddNew] = useState(false);
  const [open,setOpen] = useState(false);

  let defaultValues = {};
  sData.filters && (()=> {
    let fs = sData.filters.split(' AND ');
    for (let i in fs) defaultValues[fs[i].split(':')[0]] = fs[i].split(':')[1];
  } )();


  return <>
    <Button variant={'contained'} startIcon={<FontAwesomeIcon icon={faPlusCircle} />} color={'primary'} onClick={()=>{setAddNew(true);setOpen(true)}}>Nuevo</Button>
    {addNew && <AddNew index={sData.index} hit={defaultValues} open={open} setOpen={setOpen}/>}
  </>
}
