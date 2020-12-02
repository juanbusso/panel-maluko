import React, {lazy, Suspense } from "react";
import { Route, Switch, Redirect, BrowserRouter} from "react-router-dom";
import { auth } from "../firebase";

// components
// import Layout from "./Layout";

// pages
import Error from "../pages/error";
// import Login from "../pages/login";

// context
import {useUserData, useUserState} from "../context/UserContext";

const LayoutComponent = (
    lazy(() => (
        import('./Layout')
    ))
);

const LoginComponent = (
    lazy(() => (
        import('../pages/login')
    ))
);

export default function App() {

    const {isAuthenticated} = useUserState();
    const {roles, uid} = useUserData();

    return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/app/dashboard" />} />
        <Route
          exact
          path="/app"
          render={() => <Redirect to="/app/dashboard" />}
        />
        <PrivateRoute path="/app" isAuthenticated={isAuthenticated} roles={roles} uid={uid}
                      LazyComponent={LayoutComponent}
        />
        <PublicRoute path="/login" isAuthenticated={isAuthenticated}
                      LazyComponent={LoginComponent}
        />
        <Route component={Error} />
      </Switch>
    </BrowserRouter>
  );

  // #######################################################################


}

function PrivateRoute({ component, LazyComponent,isAuthenticated,roles,uid, ...rest }) {

    const LoadingMessage = ({uid}) => (
        <>{ uid ? <div>No esta autorizado<br/><button onClick={()=>auth.signOut()}>Cerrar Sesion</button></div> : "I'm loading..." }</>
    )

    return (
        <Route
            {...rest}
            render={props =>
                isAuthenticated ? (roles) ? (
                    component ? (React.createElement(component, props)) : (
                        <Suspense fallback={<LoadingMessage />}>
                            <LazyComponent {...props} />
                        </Suspense> )
                ) : <LoadingMessage uid={uid}/>  : (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: {
                                from: props.location,
                            },
                        }}
                    />
                )
            }
        />
    );
}

function PublicRoute({ component, LazyComponent,isAuthenticated, ...rest }) {

    const LoadingMessage = () => (
        "I'm loading..."
    )

    return (
        <Route
            {...rest}
            render={props =>
                isAuthenticated ? (
                    <Redirect
                        to={{
                            pathname: "/",
                        }}
                    />
                ) : (
                    component ? (React.createElement(component, props)) : (
                        <Suspense fallback={<LoadingMessage />}>
                            <LazyComponent {...props} />
                        </Suspense> )
                )
            }
        />
    );
}
