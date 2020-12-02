import {useUserData} from "../../../context/UserContext";
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import Widget from "../../Widget";
import EditForm from "../../CardFirestore/DataCard/components/EditForm";
import {Button} from "../../Wrappers";
import React, {useState,useEffect} from "react";
import Populate from "../../../algolia/populate";
import {makeStyles} from "@material-ui/styles";
import {updateDoc} from "../../../firebase";
import IconButton from "@material-ui/core/IconButton";
import {useSnackbar} from "notistack";
import {Modal} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    modal: {
        position: 'absolute',
        width: '80%',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 2, 2),
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%)`,
        maxHeight: `90%`,
        overflowY: `scroll`,
    },
    iframe: {
        height: '-webkit-fill-available',
        width: '100%',
    }
}));


export default function UserUpdateModal({closeModal}) {
    const getuser = useUserData();
    const [open,setOpen] = useState(true);
    const [fields,setFields] = useState([]);
    const [values,setValues] = useState({});
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();


    useEffect(()=>{
        (async ()=> {
            let user = JSON.parse(JSON.stringify(getuser));
            const pUser = await Populate({ hits:[user], props: [{index:'roles',field:'roles'},{index:'areas',field:'areas'},{index:'roles',field:'currentRole'},{index:'areas',field:'currentArea'}] }).then(a=>a[0]);

            setValues(pUser);

            const fields = [
                {
                    name: "Area",
                    field: "currentArea",
                    options:{
                        options: Object.keys(pUser.areas||{}).map(r=>pUser.areas[r]),
                        type: 'autocomplete',
                        field: 'name'
                    }
                },
                {
                    name: "Role",
                    field: "currentRole",
                    options:{
                        options: Object.keys(pUser.roles||{}).map(r=>pUser.roles[r]),
                        type: 'autocomplete',
                        field: 'title',
                    }
                }
            ];
        setFields(fields);
        })()
    },[getuser]);

    const update = ({field,value,...r}) => {
        const hit = getuser;
        const nhit = r.hit;
        !field && (field=Object.keys(nhit)[0]);
        const ovalue = field.includes('.') ? field.split('.').reduce((p,a)=>p[a]||'',hit) : hit[field];
        let ohit = {[field]:ovalue === undefined || ovalue === null ? '' : typeof ovalue !== 'object' ? ovalue : ovalue.objectID || Object.keys(ovalue)};
        if (nhit) for (let f in nhit) ohit[f] = hit[f] === undefined ? '' : typeof hit[f] !== 'object' ? hit[f] : hit[f].objectID || Object.keys(hit[f]);
        updateDoc({indexName:'users',id:getuser.uid,hit:nhit||{[field]:value}}).then(()=>enqueueSnackbar(field === 'delete'? 'Documento Borrado' :(fields.find(f=>f.field===field).name||field)+' actualizado.',{
            action:
                <React.Fragment>
                    { field !== 'delete' && <Button color="secondary" size="small" onClick={()=>updateDoc({indexName:'users',id:getuser.uid,hit:ohit})}>
                        DESHACER
                    </Button> }
                    <IconButton size="small" aria-label="close" color="inherit">
                        {/*<CloseIcon fontSize="small" />*/}
                    </IconButton>
                </React.Fragment>

        }));
    };

    return  <Modal
        open={open}
        onClose={()=> { setOpen(false); closeModal() } }
    >
        <div className={classes.modal}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Widget header={ <>
                    Actualizar Usuario
                </>
                } >
                    <div>
                        <EditForm hit={values} fields={fields} update={update}/>
                    </div>
                </Widget></MuiPickersUtilsProvider>
        </div>
    </Modal>
}
