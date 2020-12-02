import React from "react";
import {auth, db, updateDoc} from "../firebase";
import {useUserData} from "./UserContext";

const AreaDataSetContext = React.createContext();
const AreaDataContext = React.createContext();

function AreaProvider({ children }) {
    const [areaData,setAreaData] = React.useState(false);
    const [loading,setLoading] = React.useState(true);
    const user = useUserData();

    React.useEffect(()=>{
        if (user.currentArea||(user.areas&&user.areas[0]))
        return db.collection('areas').doc(user.currentArea||user.areas[0]).onSnapshot(d=> {
                setAreaData({...d.data(),objectID:d.id});
            }
        );
        else if (user.uid) setLoading(false);
    },[user]);


    const setArea = (area) => updateDoc({indexName:'users',id:user.uid,hit:{currentArea:area}});

    return ( areaData || !user.uid ?
                <AreaDataSetContext.Provider value={setArea}>
                    <AreaDataContext.Provider value={areaData}>
                        {children}
            </AreaDataContext.Provider>
        </AreaDataSetContext.Provider> :
            <>{loading ? 'Cargando...' :
        <div>'No Tienes AREA Asignada'<br/><button onClick={()=>auth.signOut()}>Cerrar Sesion</button></div>}
                </>
    )
    }


function useAreaDataContext() {
    const context = React.useContext(AreaDataContext);
    if (context === undefined) {
        throw new Error("AreaStateContext must be used within a UserProvider");
    }
    return context;
}

function useAreaSetContext() {
    var context = React.useContext(AreaDataSetContext);
    if (context === undefined) {
        throw new Error("AreaDataSetContext must be used within a UserProvider");
    }
    return context;
}

export {AreaProvider,useAreaDataContext,useAreaSetContext}
