import React from "react";
import {db, updateDoc} from "../firebase";
import {useUserData} from "./UserContext";

const RoleDataSetContext = React.createContext();
const RoleDataContext = React.createContext();

function RoleProvider({ children }) {
    const [roleData,setRoleData] = React.useState(false);
    const user = useUserData();

    React.useEffect(()=>{
        if (user.currentRole||(user.roles&&user.roles[0]))
        return db.collection('roles').doc(user.currentRole||user.roles[0]).onSnapshot(d=>
            setRoleData({...d.data(),objectID:d.id})
        );
    },[user]);

    const setRole = (role) => updateDoc({indexName:'users',id:user.id,hit:{currentRole:role}});

    return (roleData || !user.uid ?
                <RoleDataSetContext.Provider value={setRole}>
                    <RoleDataContext.Provider value={roleData}>
                        {children}
            </RoleDataContext.Provider>
        </RoleDataSetContext.Provider> :
        'No Tienes ROL Asignada')
    }


function useRoleDataContext() {
    const context = React.useContext(RoleDataContext);
    if (context === undefined) {
        throw new Error("RoleStateContext must be used within a UserProvider");
    }
    return context;
}

function useRoleSetContext() {
    var context = React.useContext(RoleDataSetContext);
    if (context === undefined) {
        throw new Error("RoleDataSetContext must be used within a UserProvider");
    }
    return context;
}

export {RoleProvider,useRoleDataContext,useRoleSetContext}
