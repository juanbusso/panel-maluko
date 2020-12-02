import React, {useState} from "react";
import { Grid, Card as MaterialCard, CardContent, CardMedia } from "@material-ui/core";

// styles
import useStyles from "./styles";

// components
import Widget from "../../../components/Widget";
import PageTitle from "../../../components/PageTitle";
import { Typography } from "../../../components/Wrappers";
import Card from "../../../components/CardFirestore";
import DataCard from "../../../components/CardFirestore/DataCard/DataCard";

import normasFunction from "../../../components/Normas";
import ModelosTable from "./modelos";
import CircularProgress from "@material-ui/core/CircularProgress";
import {format as formatDate} from "date-fns";
import AddNew from "../../../components/CardFirestore/DataCard/components/AddNew";
import DriveFileViewButtonModal from "../../../components/Drive/Modal";
import {Link} from "react-router-dom";
import CardElement from "../../../components/Card/CardElement";
import {useAreaDataContext} from "../../../context/AreaContext";
import Button from "@material-ui/core/Button";
import {firestore} from "firebase/app";
import {db} from "../../../firebase";

export default function FamiliaCard({objectID,...props}) {
    const classes = useStyles();
    const areaData = useAreaDataContext();
    const areaCardData = areaData && areaData.panel && areaData.panel['familias'] && areaData.panel['familias'].card;


    return (
    <>
        <Card index={'familias'} objectID={objectID} relatedIndexes={[{index:'certificados',field:'family'},{index:'scans',field:'family'},{index:'cotizaciones',field:'families',logical:'array-contains'}]}
      render={ ({hit,relatedHits,orginalHit}) => <>
          <PageTitle title={((hit.client && hit.client.matricula) || '--') +' / '+  hit.family +' - '+ hit.product}  backButton={true}/>
          <Grid container spacing={4}>
        <Grid item xs={12} md={6} lg={4}>
            <DataCard hit={hit} index={'familias'} orginalHit={orginalHit}
                      transformBody={{normas:h=>typeof h === 'object'&&normasFunction(h)}}
            />
        </Grid>
              {relatedHits.certificados ?
                  <Grid item xs={12} md={6} lg={4}>
                      <CertificadosRelatedWidget classes={classes} title={'Certificados'} relatedHits={relatedHits} hit={hit}/>
                  </Grid> : ''}
              {relatedHits.cotizaciones ?
                  <Grid item xs={12} md={6} lg={4}>
                      <CotizacionesRelatedWidget classes={classes} title={'Cotizaciones'} relatedHits={relatedHits} hit={hit}/>
                  </Grid> : ''}
              <Grid item xs={12} md={12} lg={12}>
                  <ModelosTable hit={hit}/>
              </Grid>
              { areaCardData && areaCardData.items && hit && areaCardData.items.map((item,i)=><CardElement key={i} properties={item} hit={hit}/>)}
              <Grid item xs={12} md={12} lg={12}>
                  <HistoricoRelatedWidget classes={classes} title={'Historico'} relatedHits={relatedHits} hit={hit}/>
              </Grid>
          </Grid>
      </>
      }
      />

    </>
  );
}

function HistoricoRelatedWidget({classes,relatedHits,title,hit}) {

    return <Widget title={title} menuItems={[]}>
        <Grid container spacing={4}>
        {relatedHits.scans && relatedHits.scans[0] && relatedHits.scans[0].files && relatedHits.scans[0].files.map(c=>
            <Grid item xs={12} md={4} lg={3} key={c.name}>
            <MaterialCard className={classes.historicCard} key={c.objectID} key={c.id}>
                <CardContent>
                    <CardMedia image={'https://drive.google.com/uc?export=download&id='+c.thumbnail} style={{paddingTop:'100%'}}/>
                    { c.name ?
                        <Typography className={classes.text} size="md">
                            {c.name} <DriveFileViewButtonModal driveFileId={c.id}/> <Button onClick={()=>db.collection('scans').doc(relatedHits.scans[0].objectID).update({files:firestore.FieldValue.arrayRemove(c)})}>Delete</Button>
                        </Typography> : ''}
                </CardContent>
            </MaterialCard>
            </Grid>)}
        </Grid>
    </Widget>
}

function CertificadosRelatedWidget({classes,relatedHits,title,hit}) {

    const [addNew,setAddNew] = useState(false);

    return <Widget title={title} menuItems={[{name:'Nuevo',onclick:()=>hit&&setAddNew(true)},{name:'Editar',onclick:()=>alert('editar')}]}>
        {addNew && <AddNew index={'certificados'} hit={{client:hit.client,family:hit,issuedate:formatDate(new Date(), 'yyyy-MM-dd'),area:hit.area}}/>}
            {relatedHits.certificados.map(c=>
                <MaterialCard className={classes.contactCard} key={c.objectID}>
                    <CardContent>
                        { c.number ?
                            <Typography className={classes.text} size="md">
                                <Link to={`/app/certificados/${c.objectID}`}>
                                {certFormat(c)}
                                </Link>
                            </Typography> : ''}
                        { c.issuedate ?
                            <Typography className={classes.text} size="sm">
                                Fecha: { formatDate(new Date(c.issuedate + ' GMT-1100'), 'dd/MM/yyyy')}
                            </Typography> : ''}

                        { (()=>{ let fileID = c.scan_file_id || c.drive_doc_id || c.drive_file_id;
                        return fileID ? <DriveFileViewButtonModal driveFileId={fileID}/> :  <CircularProgress color="inherit" size={20} />
                        })() }
                    </CardContent>
                </MaterialCard> )}

    </Widget>
}


function CotizacionesRelatedWidget({classes,relatedHits,title,hit}) {

    const [addNew,setAddNew] = useState(false);

    return <Widget title={title} menuItems={[{name:'Nuevo',onclick:()=>hit&&setAddNew(true)},{name:'Editar',onclick:()=>alert('editar')}]}>
        {addNew && <AddNew index={'cotizaciones'} hit={{client:hit.client,families:{[hit.objectID]:hit},issuedate:formatDate(new Date(), 'yyyy-MM-dd'),area:hit.area}}/>}
        {relatedHits.cotizaciones.map(c=>
            <MaterialCard className={classes.contactCard} key={c.objectID}>
                <CardContent>
                    { c.number ?
                        <Typography className={classes.text} size="md">
                            <Link to={`/app/cotizaciones/${c.objectID}`}>
                                {certFormat(c)}
                            </Link>
                        </Typography> : ''}
                    { c.issuedate ?
                        <Typography className={classes.text} size="sm">
                            Fecha: { formatDate(new Date(c.issuedate + ' GMT-1100'), 'dd/MM/yyyy')}
                        </Typography> : ''}

                    { (()=>{ let fileID = c.scan_file_id || c.drive_doc_id || c.drive_file_id;
                        return fileID ? <DriveFileViewButtonModal driveFileId={fileID}/> :  <CircularProgress color="inherit" size={20} />
                    })() }
                </CardContent>
            </MaterialCard> )}

    </Widget>
}



function certFormat (hit)  {
    let rev = hit.revisionnumber||hit.extensionnumber?'/Rev.'+pad(hit.revisionnumber||0,2):'';
    let rep = hit.repuestosnumber?'/R'+hit.repuestosnumber:'';
    let ext = hit.extensionnumber&&hit.cuit_extension?'/'+hit.cuit_extension.toString().substring(7,11)+'/E'+pad(hit.extensionnumber,2):'';
    return 'BVA/E/'+pad(hit.number,4)+'-'+pad(hit.year,2)+rev+ext+rep;};

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}
