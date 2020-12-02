import React from "react";
import {
  Grid,
} from "@material-ui/core";
// import { useTheme } from "@material-ui/styles";
//
// // styles
// import useStyles from "./styles";

import PageTitle from "../../components/PageTitle";
import {useAreaDataContext} from "../../context/AreaContext";
import {useRoleDataContext} from "../../context/RoleContext";
import {useUserData} from "../../context/UserContext";
import Dashboard2 from "./Dashboard2";
import CardElement from "../../components/Card/CardElement";


export default function Dashboard(props) {
  // var classes = useStyles();
  // var theme = useTheme();

  const areaData = useAreaDataContext();
  const roleData = useRoleDataContext();
  const user = useUserData();

  return <>{
    areaData.dashboard && areaData.dashboard[roleData.objectID] ?
        <>
          <PageTitle title="Inicio" button="Latest Reports" />
          <Grid container spacing={4}>
              {areaData.dashboard[roleData.objectID].map((g,i)=><CardElement key={areaData.objectID+roleData.objectID+i} properties={g} hit={user} areaData={areaData} roleData={roleData}/>)}
          </Grid>
        </>
    : <Dashboard2 />
  }</>



}

