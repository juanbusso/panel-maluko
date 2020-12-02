import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

var db,auth,googleAuthProvider,uid;

export function initializeFirebase(firebaseConfig) {
    firebase.initializeApp(firebaseConfig);

    db = firebase.firestore();
    auth = firebase.auth();
    googleAuthProvider = new firebase.auth.GoogleAuthProvider();
    auth.onAuthStateChanged(u => uid = u && u.uid);
}

const updateDoc = ({indexName,id,hit,delete_fields}) => {
    if(!hit)hit={};
    if (delete_fields) for (let i in delete_fields) hit[delete_fields[i]] = firebase.firestore.FieldValue.delete();
    if(uid) hit.lastEditBy=uid;
    return db.collection(indexName).doc(id).update({algoliaUpdated:false,...hit});
};
const newDoc = ({indexName,hit}) => {
    if(!hit)hit={};
    if(uid) hit.lastEditBy=uid;
    return db.collection(indexName).add({algoliaUpdated:false,modified_date:firebase.firestore.Timestamp.fromDate(new Date()),...hit});
};
export {db,auth,updateDoc,newDoc,googleAuthProvider}
export default firebase;
