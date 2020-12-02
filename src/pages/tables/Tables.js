import React, {useEffect, useState} from "react";
import { Grid } from "@material-ui/core";

// components
import PageTitle from "../../components/PageTitle";

// data
import TableAlgolia from "../../components/TableAgoliaFirestore";
import {Redirect,useHistory} from "react-router-dom";
import {useAreaDataContext} from "../../context/AreaContext";
import {useRoleDataContext} from "../../context/RoleContext";

export default function Tables({title='Tables',index}) {

  return (
    <>
        <PageTitle title={title}/>
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <IndexTable index={index}/>
            </Grid>
        </Grid>
    </>
  );
}

export function IndexTable({index,filters}) {
    const areaData = useAreaDataContext();
    let indexData = areaData.panel[index];

    const roleData = useRoleDataContext();

    let tableFilters = {};
    (indexData.filters||'').split(' AND ').forEach(f=>tableFilters[f.split(':')[0]] = f.split(':')[1]);

    let columns;
    if (filters) {
        columns = JSON.parse(JSON.stringify(indexData.fields));
        let f = filters.split(' AND ');
        f.forEach(f=>tableFilters[f.split(':')[0]] = f.split(':')[1]);
        for (let i in f) {
            let c = columns.find(a=>a.field === f[i].split(':')[0]);
            if (c) {
                c.options || (c.options = {});
                c.options.display = false;
            }
        }
    }



    const [loading,setLoading] = useState(true);
    useEffect(()=>{
        setLoading(true);
        setTimeout(()=>setLoading(false),100);
    },[index,areaData&&areaData.objectID])

    return <>{!loading && <TableAlgolia
        index={index}
        columns={columns || indexData.fields}
        addNew={roleData.new && roleData.new.includes(index)}
        filters={Object.keys(tableFilters).filter(f=>f).map(f=>f+':'+tableFilters[f]).join(' AND ')}
        renderExpandableRow={hit => <Redirect push to={{
            pathname: "/app/"+index+"/"+hit.objectID,
            state: {
                from: window.location.pathname,
            },}}
        />}
    />}</>
}
