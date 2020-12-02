import React from "react";
import { Grid } from "@material-ui/core";

// components
import PageTitle from "../../components/PageTitle";
import Widget from "../../components/Widget";
import Table from "../dashboard/components/Table/Table";

// data
import mock from "../dashboard/mock";
import TableAlgolia from "../../components/TableAgoliaFirestore";

import AreasCard from "./Card/AreasCard.js";
import { Route, Switch, Redirect } from "react-router-dom";

export default function Areas() {

  const columns = [
    {
      name: "Nombre",
      field: "name",
      options: {
        filter: false,
        sort: false
      }
    },
    {
      name: "Descripcion",
      field: "description",
      options: {
        filter: false,
        sort: false
      }
    },

  ];

  return (
    <>
        <Switch>
          <Route exact path="/app/areas">
            <PageTitle title="Areas" />
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TableAlgolia
                    index={"areas"}
                    columns={columns}
                    renderExpandableRow={hit => <Redirect to={{
                      pathname: "/app/areas/"+hit.objectID,
                      state: {
                        from: window.location.pathname,
                      },}}
                />}
                    />
              </Grid>
              <Grid item xs={12}>
                <Widget title="Material-UI Table" upperTitle noBodyPadding>
                  <Table data={mock.table} />
                </Widget>
              </Grid>
            </Grid>
          </Route>
          <Route path="/app/areas/:areaID" render={props => <AreasCard objectID={props.match.params.areaID} />}/>
        </Switch>
    </>
  );
}
