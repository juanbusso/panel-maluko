import React from "react";
import {db,auth,googleAuthProvider} from "../firebase";
import deepEqual from "deep-equal";


var UserStateContext = React.createContext();
var UserDispatchContext = React.createContext();
var UserDataContext = React.createContext();
var UserDataSetContext = React.createContext();

function userReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: true };
    case "SIGN_OUT_SUCCESS":
      return { ...state, isAuthenticated: false };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}


function UserProvider({ children }) {
  var [state, dispatch] = React.useReducer(userReducer, {
    // isAuthenticated: !!localStorage.getItem("id_token"),
    isAuthenticated: false
  });


  var [userData,setUserData] = React.useState({});
  var [userID,setUserID] = React.useState('');


  var [loading, setLoading] = React.useState(true);

  React.useEffect(() => auth.onAuthStateChanged(user=>{
    dispatch({ type: user ? 'LOGIN_SUCCESS' : "SIGN_OUT_SUCCESS" });
    user ? localStorage.setItem("id_token", 1):localStorage.removeItem("id_token");
    if (user) { setUserID(user.uid); }
    else setUserData({});
        setLoading(false);
      }
    ),[]);

  React.useEffect( () => {
    if (userID) return db.collection('users').doc(userID).onSnapshot(uD => {
      if (uD.exists) setUserData( pd => { if( pd.currentRole !== uD.data().currentRole || pd.currentArea !== uD.data().currentArea || !pd.roles || !uD.data().roles || deepEqual(pd.roles,uD.data().roles) ) return { ...uD.data(), uid:userID }; else return pd } );
      else setUserData({uid:userID});
    });
  },[userID]);

  const updateUserData = ( data ) => {
    let userDoc = db.collection('users').doc(userID);
    Object.keys(userData).length ?
        userDoc.update( data ) :
        userDoc.set( data );
  }


    return !loading ? (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        <UserDataContext.Provider value={userData}>
          <UserDataSetContext.Provider value={updateUserData}>
        {children}
          </UserDataSetContext.Provider>
        </UserDataContext.Provider>
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  ) : <></>;
}

function useUserState() {
  const context = React.useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}

function useUserDispatch() {
  var context = React.useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context;
}

function useUserData() {
  var context = React.useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserProvider");
  }
  return context;
}

function useUserDataSet() {
  var context = React.useContext(UserDataSetContext);
  if (context === undefined) {
    throw new Error("useUserDataSet must be used within a UserProvider");
  }
  return context;
}

export { UserProvider, useUserState, useUserDispatch, loginUser, signOut, useUserData, useUserDataSet };

// ###########################################################


function loginUser( { userDispatch, email, password, history, setIsLoading, setError, google } ) {

  if(google) {
    return auth.signInWithPopup(googleAuthProvider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  setError(false);
  setIsLoading(true);

  !email.match('@') && ( email += '@bureauveritas.com');
  if ( /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email) ) {

    auth.signInWithEmailAndPassword(email,password).catch(a=>{
      console.log(a)
      a.code === 'auth/wrong-password' ? setError('password') : setError(true);

      setIsLoading(false);
    });

  } else {
    userDispatch({ type: "LOGIN_FAILURE" });
    setError(true);
    setIsLoading(false);
  }
}

function signOut(dispatch, history) {
  auth.signOut();
  // localStorage.removeItem("id_token");
  // dispatch({ type: "SIGN_OUT_SUCCESS" });
  // history.push("/login");
}
