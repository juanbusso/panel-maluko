import React from "react";
import { Grid } from "@material-ui/core";

// components
import PageTitle from "../../components/PageTitle";
import Widget from "../../components/Widget";
import Table from "../dashboard/components/Table/Table";

// data
import mock from "../dashboard/mock";
import TableAlgolia from "../../components/TableAgoliaFirestore";

import ClienteCard from "./Card/ClienteCard.js";
import { Route, Switch, Redirect } from "react-router-dom";
import Tables, {IndexTable} from "../tables";

export default function Clientes() {

  const columns = [
    {
      name: "Nombre",
      field: "razonsocial",
      options: {
        filter: false,
        sort: false
      }
    },
    {
      name: "Cuit",
      field: "cuit",
      options: {
        filter: false,
        sort: false
      }
    },
    {
      name: "Familias Activas",
      field: "active_fams",
      options: {
        filterType: "range",
        sort: false
      }
    },
    {
      name: "Editado por",
      field: "lastEditBy",
      options: {
        customBodyRender: h => (h && h.name) || "",
        customFilterRender: h => (h && h.name) || "",
        display: false,
        filter: true,
        sort: false,
        index: "users"
      }
    },
    {
      name: "Escritura",
      field: "escritura",
      options: {
        display: false,
        filter: true,
        sort: false,
        filterType: "checkbox",
        customBodyRender: r => (r === true || r === "true" ? "ok" : "falta"),
        customFilterRender: r => (r === true || r === "true" ? "ok" : "falta")
      }
    },
    {
      name: "Areas",
      field: "areas",
      options: {
        display: false,
        filter: true,
        sort: false,
        index: "areas",
        filterType: "checkbox",
        customBodyRender: hit =>
            hit ?
          Object.keys(hit)
            .map(i => hit[i] && hit[i].name)
            .join("; ") : '',
        customFilterRender: hit => hit.name
      }
    }
  ];

  return (
    <>
        <Switch>
          <Route exact path="/app/clientes">
            <PageTitle title="Clientes" />
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <IndexTable index={"clientes"}/>
              </Grid>
            </Grid>
          </Route>
          <Route path="/app/clientes/:clienteID" render={props => <ClienteCard objectID={props.match.params.clienteID} />}/>
        </Switch>
    </>
  );
}
