import {Grid} from "@material-ui/core";
import TableAlgolia from "../TableAgoliaFirestore";
import customFieldRender from "../CustomField";
import React from "react";
import {Redirect} from "react-router-dom";
import {useUserData} from "../../context/UserContext";
import {IndexTable} from "../../pages/tables";
import customField from "../CustomField";

export default function CardElement({areaData,roleData,hit,properties}) {

    const user = useUserData();

    console.log({
    index:properties.table.index, filters:customField(hit, properties.table.filters)
})

    let grid = {lg:12,md:12,sm:12,xs:12};
    properties.grid && (grid = {...grid,...properties.grid});

    return <Grid item lg={grid.lg} md={grid.md} sm={grid.sm} xs={grid.xs} > {properties.type === 'table' && <TableAlgolia
        title={properties.table.title}
        index={properties.table.index}
        columns={properties.table.fields}
        addNew={roleData.new && roleData.new.includes(properties.table.index)}
        filters={properties.table.filters?customFieldRender({...hit,user},properties.table.filters):''}
        renderExpandableRow={properties.table.openOnClick && (hit => <Redirect push to={{
            pathname: "/app/"+properties.table.index+"/"+hit.objectID,
            state: {
                from: window.location.pathname,
            },}}
        />)}
    /> }
        {
            properties.type === 'indextable' &&
                <IndexTable index={properties.table.index} filters={customField(hit, properties.table.filters)}/>
        }
    </Grid>
}
