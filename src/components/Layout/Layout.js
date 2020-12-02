import React from "react";
import {
  Route,
  Switch,
  Redirect,
  withRouter,
} from "react-router-dom";
import classnames from "classnames";

// styles
import useStyles from "./styles";

// components
import Header from "../Header";
import Sidebar from "../Sidebar";
import { SnackbarProvider } from 'notistack';

// pages
import Dashboard from "../../pages/dashboard";
import Typography from "../../pages/typography";
import Notifications from "../../pages/notifications";
import Maps from "../../pages/maps";
import Tables from "../../pages/tables";
import Icons from "../../pages/icons";
import Charts from "../../pages/charts";
import Clientes from "../../pages/clientes";

// context
import { useLayoutState } from "../../context/LayoutContext";
import Familias from "../../pages/familias";
import Areas from "../../pages/areas";
import {useAreaDataContext} from "../../context/AreaContext";
import Cards from "../../pages/cards";

function Layout(props) {
  var classes = useStyles();

  // global
  var layoutState = useLayoutState();


  return (
    <div className={classes.root}>
        <>
          <SnackbarProvider maxSnack={3}>
          <Header history={props.history} />
          <Sidebar />
          <div
            className={classnames(classes.content, {
              [classes.contentShift]: layoutState.isSidebarOpened,
            })}
          >
            {/*<div className={classes.fakeToolbar} />*/}
            <Switch>
              <Route path="/app/dashboard" component={Dashboard} />
              <Route path="/app/typography" component={Typography} />
              <Route path="/app/tables" component={Tables} />
              <Route path="/app/clientes" component={Clientes} />
              <Route path="/app/familias" component={Familias} />
              <Route path="/app/areas" component={Areas} />
              <Route path="/app/notifications" component={Notifications} />
              <Route
                exact
                path="/app/ui"
                render={() => <Redirect to="/app/ui/icons" />}
              />
              <Route path="/app/ui/maps" component={Maps} />
              <Route path="/app/ui/icons" component={Icons} />
              <Route path="/app/ui/charts" component={Charts} />
              <Route exact path="/app/:indexName" component={LookIndexTable}/>
              <Route path="/app/:indexName/:objectID" component={LookIndexCard}/>
            </Switch>
          </div>
          </SnackbarProvider>
        </>
    </div>
  );
}

function LookIndexTable({...props}) {
  const areaData = useAreaDataContext();
  let index = areaData.panel[props.match.params.indexName];

  return ( index ? <Tables title={index.title || props.match.params.indexName} index={props.match.params.indexName} fields={index.fields}/> : '' );

}

function LookIndexCard({...props}) {
  const areaData = useAreaDataContext();

  let indexName = props.match.params.indexName;
  let index = areaData.panel[indexName];
  let objectID = props.match.params.objectID;

  return ( index ? <Cards index={index} objectID={objectID} indexName={indexName}/>
                           : '' );

}

export default withRouter(Layout);
