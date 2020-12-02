import React, {useEffect, useState} from "react";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";

import Themes from "./themes";
import App from "./components/App";
import { LayoutProvider } from "./context/LayoutContext";
import { UserProvider } from "./context/UserContext";
import { AreaProvider } from "./context/AreaContext";
import { RoleProvider } from "./context/RoleContext";
import { PanelProvider } from "./context/PanelContext";
import {setConfig} from "./algolia";
import {initializeFirebase} from "./firebase";


export default function({settings}) {
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        setConfig(settings.config);
        initializeFirebase(settings.config.firebase);
        setLoading(false);
    },[]);

    return ( loading ||
    <PanelProvider settings={settings}>
        <LayoutProvider>
            <UserProvider>
                <AreaProvider>
                    <RoleProvider>
                        <ThemeProvider theme={Themes.default}>
                            <CssBaseline />
                            <App />
                        </ThemeProvider>
                    </RoleProvider>
                </AreaProvider>
            </UserProvider>
        </LayoutProvider>
    </PanelProvider>
)}


