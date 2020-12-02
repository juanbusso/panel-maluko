import React, {useState} from "react";
import Widget from "../../Widget";
import {updateDoc} from "../../../firebase";

// components
import Avatar from "@material-ui/core/Avatar";
import {Button, Typography} from "../../Wrappers";
import * as Icons from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";
import IconButton from '@material-ui/core/IconButton';
import { useSnackbar } from 'notistack';
import {useAreaDataContext} from "../../../context/AreaContext";
import { green } from '@material-ui/core/colors';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import FieldRender from "./components/FieldRender";
import EditForm from "./components/EditForm";
import {useRoleDataContext} from "../../../context/RoleContext";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AlertDialog from "../../AlertDialog";
import {useHistory} from "react-router-dom";
import customField from "../../CustomField";
import AccordionDetails from "@material-ui/core/AccordionDetails";

const useStyles = makeStyles((theme) => ({
    form: {
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: '100%',
        },
    },
    text: {
        marginBottom: theme.spacing(1),
    },
    title: {
        textDecoration: 'underline',
    },
    toggleContainer: {
        margin: theme.spacing(1),
    },
    fileInput: {
        display: 'none',
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    buttonSuccess: {
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
    }
}));

export default function DataCard({index,hit,fields,orginalHit,transformBody}) {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    let history = useHistory();

    const [edit,setEdit] = useState(false);
    const [deleteDialog,setDeleteDialog] = useState(false);

    const areaData = useAreaDataContext();
    fields = fields || areaData.panel[index].fields;

    const roleData = useRoleDataContext();


    const update = ({field,value,...r}) => {
        const oldValue = field && field.split('.').reduce((p,a)=>p&&p[a],hit);
        if (!field || (oldValue !== value && (!oldValue || !oldValue.objectID || oldValue.objectID !== value ) )) {
            const nhit = r.hit;
            !field && (field = Object.keys(nhit)[0]);
            const ovalue = hit[field.split('.')[0]];
            let ohit = {[field.split('.')[0]]: ovalue === undefined || ovalue === null ? '' : typeof ovalue !== 'object' || field.includes('.') ? ovalue : ovalue.objectID || Object.keys(ovalue)};
            if (nhit) {
                for (let f in nhit) ohit[f] = hit[f] === undefined ? '' : typeof hit[f] !== 'object' ? hit[f] : hit[f].objectID || Object.keys(hit[f]);
                // checkHit(nhit);
            }
            // function checkHit(innerHit) {
            //     for (let f in innerHit) {
            //         let fs = f.split('.');
            //         if (/^[0-9]+$/.test(fs[fs.length-1]))
            //             }
            // }

            updateDoc({
                indexName: index,
                id: hit.objectID,
                hit: nhit || {[field]: value}
            }).then(() => enqueueSnackbar(field === 'delete' ? 'Documento Borrado' : ((fields.find(f => f.field === field) || {}).name || field) + ' actualizado.', {
                action:
                    <React.Fragment>
                        {field !== 'delete' && <Button color="secondary" size="small" onClick={() => updateDoc({
                            indexName: index,
                            id: hit.objectID,
                            hit: ohit
                        })}>
                            DESHACER
                        </Button>}
                        <IconButton size="small" aria-label="close" color="inherit">
                            {/*<CloseIcon fontSize="small" />*/}
                        </IconButton>
                    </React.Fragment>

            }));
        }
    }


    let menuItems = [];
    roleData.edit && roleData.edit.includes(index) && menuItems.push({name:<>Editar {edit?<Icons.Check />:''}</>,onclick:()=>setEdit(e=>!e)});
    roleData.deleteElement && roleData.deleteElement.includes(index) && menuItems.push({name:<>Borrar <FontAwesomeIcon icon={faTrash} /></>,onclick:()=>setDeleteDialog(true)});

    return <>
        {deleteDialog && <AlertDialog agreeAction={()=>{update({field:'delete',value:true});history.push('/app/'+index)}} handleClose={()=>setDeleteDialog(false)} message={`Seguro/a que quiere Borrar el documento?`}/>}
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Widget header={ <>
        {edit ?
        <IconButton onClick={()=>setEdit(false)}
        ><Icons.ArrowBack /></IconButton>
            : <Avatar aria-label="recipe" alt={hit.razonsocial} src={hit.img||''}>
                {hit.razonsocial ? hit.razonsocial.substring(0,1).toUpperCase() : ''}
            </Avatar>}
        </>
    } menuItems={menuItems}>
        <div>
            {!edit ?
                filterToDisplay(fields,hit)
                        .map(f=>
                <div key={f.field} className={classes.text}>
                    {f.name && !(f.options && f.options.nested) && <><span className={classes.name}>{f.name}</span>: </>}
                    <FieldRender f={f} hit={hit} transformBody={transformBody} index={index} classes={classes}/>
                </div>
            )
                :
                <EditForm hit={hit} fields={fields} update={update} transformBody={transformBody} orginalHit={orginalHit}/>
            }
        </div>
    </Widget></MuiPickersUtilsProvider></>
}


export function filterToDisplay(fields,hit) {
    return fields.filter(f=>!f.options || (f.options.display === undefined || (typeof f.options.display === 'string' && customField(hit, f.options.display)) || f.options.display === true) || ((typeof f.options.cardDisplay === 'string' && customField(hit, f.options.cardDisplay)) || f.options.cardDisplay === true))
}
