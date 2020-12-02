import React, {useMemo} from "react";
import { Grid } from "@material-ui/core";


// components
import PageTitle from "../../components/PageTitle";
import Card from "../../components/CardFirestore";
import DataCard from "../../components/CardFirestore/DataCard/DataCard";
import customField from "../../components/CustomField";
import {Redirect} from "react-router-dom";
import {IndexTable} from "../tables";
import {useAreaDataContext} from "../../context/AreaContext";
import CardElement from "../../components/Card/CardElement";

export default function Cards({objectID,indexName,index,...props}) {
    const areaData = useAreaDataContext();
    const areaCardData = areaData && areaData.panel && areaData.panel[indexName] && areaData.panel[indexName].card;

    return (
    <>
        <Card index={indexName} objectID={String(objectID)} relatedIndexes={index.relatedIndexes}
              render={ ({hit,orginalHit}) => {
                  return <>
                  { hit && !hit.modified_date && <Redirect to={`/app/${indexName}/`} /> }
                  <PageTitle title={ (index.card && index.card.title && customField(hit, index.card.title)) || indexName }  backButton={true}/>
                  <Grid container spacing={4}>
                      <Grid item xs={12} md={12} lg={8}>
                          <DataCard hit={hit} index={indexName} orginalHit={orginalHit}/>
                      </Grid>
                      <ElementsItems hit={hit} areaCardData={areaCardData}/>
                      {/*{ areaCardData && areaCardData.items && hit && areaCardData.items.map((item,i)=><CardElement key={i} properties={item} hit={hit}/>)}*/}
                  </Grid>
              </>}}/>

    </>
  );
}

function ElementsItems({hit,areaCardData}) {
    const elements = useMemo(()=><>{ areaCardData && areaCardData.items && hit && areaCardData.items.map((item,i)=><CardElement key={i} properties={item} hit={hit}/>)}</>,[hit,areaCardData]);

    return elements;
}
