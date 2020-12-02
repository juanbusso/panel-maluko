import React from "react";
import { Grid } from "@material-ui/core";

// components
import PageTitle from "../../components/PageTitle";

// data
import FamiliasTable from "./FamiliasTable";
import {Route, Switch} from "react-router-dom";
import FamiliaCard from "./Card/FamiliaCard";

export default function Familias() {


    return (
        <>
        <Switch>
        <Route exact path="/app/familias">
        <PageTitle title="Familias" />
        <Grid container spacing={4}>
        <Grid item xs={12}>
            <FamiliasTable/>
</Grid>
</Grid>
</Route>
<Route path="/app/familias/:familiaID" render={props => <FamiliaCard objectID={props.match.params.familiaID} />}/>
</Switch>
</>
    );
}
