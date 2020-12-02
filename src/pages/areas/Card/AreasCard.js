import React  from "react";
import { Grid } from "@material-ui/core";


// components
import Widget from "../../../components/Widget";
import PageTitle from "../../../components/PageTitle";
import Card from "../../../components/CardFirestore";
import JSONEditor from "../../../components/JSONEditor";
import {updateDoc} from "../../../firebase";

export default function AreasCard({objectID,...props}) {

  return (
    <>
        <Card index={'areas'} objectID={objectID}
      render={ ({hit}) => <>
          <PageTitle title={hit.name +' - '+ hit.description} />
          <Grid container spacing={4}>
              <Grid item xs={12} md={12} lg={12}>
                  <Widget title="JSON" menuItems={[{name:'Nuevo',onclick:()=>alert('nuevo')},{name:'Editar',onclick:()=>alert('editar')}]}>
                      <JSONEditor value={hit} onSubmit={r=>updateDoc({indexName:'areas',id:objectID,hit:{...r,algoliaUpdated:false}})}/>
                  </Widget>
              </Grid>
          </Grid>
      </>
      }
      />

    </>
  );
}
