import React  from "react";
import { Grid, Card as MaterialCard, CardContent } from "@material-ui/core";

// styles
import useStyles from "./styles";

// components
import Widget from "../../../components/Widget";
import PageTitle from "../../../components/PageTitle";
import { Typography } from "../../../components/Wrappers";
import Card from "../../../components/CardFirestore";
import FamiliasTable from "../../familias/FamiliasTable";
import DataCard from "../../../components/CardFirestore/DataCard/DataCard";
import {IndexTable} from "../../tables";

export default function ClienteCard({objectID,...props}) {
  var classes = useStyles();

  return (
    <>
        <Card index={'clientes'} objectID={objectID} relatedIndexes={[]}
      render={ ({hit,relatedHits,orginalHit}) => <>
          <PageTitle title={hit.matricula +' - '+ hit.razonsocial}  backButton={true}/>
          <Grid container spacing={4}>
        <Grid item xs={12} md={6} lg={4}>
            <DataCard hit={hit} index={'clientes'} orginalHit={orginalHit}/>
        </Grid>
              {relatedHits.contactos ?
                  <Grid item xs={12} md={6} lg={4}>
                      <Widget title="Contactos" menuItems={[{name:'Nuevo',onclick:()=>alert('nuevo')},{name:'Editar',onclick:()=>alert('editar')}]}>
                          <>
                              {relatedHits.contactos.map(c=>
                                  <MaterialCard className={classes.contactCard} key={c.objectID}>
                                      <CardContent>
                                      { c.name ?
                                          <Typography className={classes.text} size="md">
                                              {c.name} {c.lastName}
                                          </Typography> : ''}
                                      { c.position ?
                                          <Typography className={classes.text} size="sm">
                                              Cargo: {c.position}
                                          </Typography> : ''}
                                      { c.email ?
                                        <Typography className={classes.text}>
                                          {c.email}
                                        </Typography> : ''}
                                      { c.comments ?
                                          <Typography className={classes.text} size="sm">
                                              Comentarios: {c.comments}
                                          </Typography> : ''}
                                      </CardContent>
                                       </MaterialCard> )}
                          </>
                      </Widget>
                  </Grid> : ''}
              <Grid item xs={12} md={12} lg={8}>
                <FamiliasTable filters={'client:'+objectID} columnsView={['family','product','system','vigencia']} addNew={true}/>
              </Grid>
              <Grid item xs={12} md={12} lg={12}>
                  <IndexTable index={'cotizaciones'} filters={'client:'+objectID}/>
              </Grid>
          </Grid>
      </>
      }
      />

    </>
  );
}
