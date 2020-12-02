import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {Button, Typography} from "../../../Wrappers";
import DateFnsUtils from "@date-io/date-fns";
import Widget from "../../../Widget";
import EditForm from "./EditForm";
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import {useAreaDataContext} from "../../../../context/AreaContext";
import Populate from "../../../../algolia/populate";
import {newDoc, updateDoc} from "../../../../firebase";
import IconButton from "@material-ui/core/IconButton";
import {useSnackbar} from "notistack";
import { useHistory } from "react-router-dom";
import {setObjects} from "../../../../algolia/getObjects";
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

export default function AddNew({hit,index,onAdd,open,setOpen}) {

    const classes = useStyles();
    const [anopen, setanOpen] = React.useState(open!==false);
    const [values,setValues] = useState(hit);

    let history = useHistory();

    useEffect(()=>{setanOpen(open!==false)},[open]);
    useEffect(()=>{setOpen&&setOpen(anopen)},[anopen]);

    const { enqueueSnackbar } = useSnackbar();

    const areaData = useAreaDataContext();
    const fields = areaData.panel[index].fields;

    useEffect(( )=>{
        !hit && (hit = {});
        let filters = areaData.panel[index].filters;
        filters && (()=> {
            let fs = filters.split(' AND ');
            for (let i in fs) if(!hit[fs[i].split(':')[0]]) hit[fs[i].split(':')[0]] = fs[i].split(':')[1];
        } )();
        for (let i in fields) if ( !hit[fields[i].field] && fields[i].options && fields[i].options.default) hit[fields[i].field] = fields[i].options.default;
        if(Object.keys(hit)) {
            let populateOptions = fields.filter(f => f.options && f.options.index).map(f => ({
                index: f.options.index.name,
                field: f.field
            }));
            Populate({hits:[hit],props:populateOptions}).then(a=>(setValues({...a[0]})));
        }},[hit,fields,areaData]);

    const update = ({field,value,hit}) => {
        const updateField = async (field,value) => {
            let c = fields.find(f=>f.field===field);
            value && c && c.options && c.options.index && (value = await Populate({ hits:[{[field]:value}], props: [{index:c.options.index.name,field}] }).then(a=>a[0][field]));
            let f = field.split('.');
            setValues(v=>({...v,[f[0]]: f[1] ? {...(typeof v[f[0]] === 'object' ? v[f[0]] : {}),[f[1]]:value} : value}));
        }
        console.log(hit);

        if (hit) for (let f in hit) updateField(f,hit[f]);
        else updateField(field,value);
    }

    const handleAddButton = () => {
        let v = {...values};
        for (let i in v) {
            // let c = fields.find(f=>f.field===i);
            v[i] && ( v[i] = v[i].objectID || ( typeof v[i] === 'object' && !v[i][0] && Object.keys(v[i]) ) || v[i] );
        }
        setanOpen(false);
        newDoc({indexName:index,hit:v}).then(d=> { setObjects(index,{[d.id]:v}); EnqueueSnackbar(d.id); onAdd && onAdd(d.id,v); });
    }

    function EnqueueSnackbar(id) {

    enqueueSnackbar('Documento Creado.',{
        autoHideDuration: 10000,
        anchorOrigin:{ horizontal: 'right', vertical: 'bottom' },
        action:
            <React.Fragment>
                {/*<Button color="secondary" size="small" onClick={()=>updateDoc({indexName:index,id:hit.objectID,hit:{*/}
                {/*        [field]: hit[field] === undefined ? '' : typeof hit[field] !== 'object' ? hit[field] : hit[field].objectID || Object.keys(hit[field])*/}
                {/*    }})}>*/}
                {/*    DESHACER*/}
                {/*</Button>*/}
                <Button color="secondary" size="small" onClick={()=> history.push(`/app/${index}/${id}`)}>
                    ABRIR
                </Button>
                <IconButton size="small" aria-label="close" color="inherit">
                    {/*<CloseIcon fontSize="small" />*/}
                </IconButton>
            </React.Fragment>

    })}

    return <>
        <Modal
        open={anopen}
        onClose={()=> setanOpen(false) }
        >
            <div className={classes.modal}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Widget header={ <>
                        Nuevo en {areaData.panel[index].title || index}
                    </>
                    } >
                        <div>
                             <EditForm hit={values} fields={fields.filter(f=>!f.options||(!f.options.nested&&!f.options.multiple))} update={update}/>
                        </div>
                        <Button variant="contained" color="primary" onClick={handleAddButton}>Agregar Nuevo</Button>
                    </Widget></MuiPickersUtilsProvider>
            </div>
        </Modal>
    </>
}


