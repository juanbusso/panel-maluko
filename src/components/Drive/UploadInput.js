import {makeStyles} from "@material-ui/styles";
import React, {useEffect} from "react";
import uploadToDrive from "./Upload";
import Dropzone from "react-dropzone";
import * as Icons from "@material-ui/icons";
import DeleteIcon from '@material-ui/icons/Delete';
import CircularProgress from "@material-ui/core/CircularProgress";
// import "font-awesome/css/font-awesome.min.css";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
    inputUploadContainer: {
        // margin: theme.spacing(1),
        position: 'relative',
    },
    wrapper: {
        margin: theme.spacing(0),
        position: 'relative',
        width: '100%',
        border: '0',
        color: '#4A4A4A',
        padding: '9px',
        "borderRadius": "4px",
        "cursor": "text",
        "display": "inline-flex",
        "fontSize": "1rem",
        "boxSizing": "border-box",
        "alignItems": "center",
        "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
        "fontWeight": "400",
        "lineHeight": "1.1876em",
        "letterSpacing": "0.00938em",
        borderWidth: 'thin',
        borderStyle: 'solid',
        borderColor: '#d5d5d5',
    },
    inputLabel: {
        backgroundColor: 'white',
        paddingLeft: '5px',
        paddingRight: '5px',
        zIndex: '1',
        pointerEvents: 'none',
        transformOrigin: 'top left',
        top: '0',
        left: '18px',
        position: 'absolute',
        display: 'block',
        "color": "#6E6E6E",
        "padding": "0",
        "fontSize": "0.8rem",
        "fontFamily": "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
        "fontWeight": "400",
        "letterSpacing": "0.00938em"
    },
    uploadSection: {
        width: '100%',
        padding: theme.spacing(1),
        cursor: 'pointer',
        ['& div']:{
            "textOverflow": "ellipsis",
            "overflow": "hidden",
        }
    },
    dropHere: {
        textAlign: 'center',
    },
}));


export default function InputUpload({accept,onUploaded,title,folderId,filename,fileId}) {

    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [dragOver,setdragOver] = React.useState(false);

    const classes = useStyles();

    useEffect(()=>{
        let run = true;
        if (success) setTimeout(()=>run&&setSuccess(false),1000);
        return ()=>run=false;
        },[success]);


    const onDrop = (files) => {
        if(!loading) {
            setLoading(true);
            setdragOver(false);
            console.log({files,fileIdToDelete:fileId||undefined},folderId);
            uploadToDrive({files,fileIdToDelete:fileId||undefined},folderId).then(r=>{
                setSuccess(true);
                setLoading(false);
                onUploaded && onUploaded(r,files[0].name||'');
            });
        }
    }

    const deleteHandler = e=>{
        e.stopPropagation();
        uploadToDrive({fileIdToDelete:fileId})
        onUploaded && onUploaded('','');
    }



    return <div className={classes.inputUploadContainer}>

        <label
            className={classes.inputLabel}
        >{title} <i className="fa fa-paperclip" /></label>
        <div className={classes.wrapper}>
            <Dropzone onDrop={onDrop}
                      onDragEnter={()=>setdragOver(true)}
                      onDragLeave={()=>setdragOver(false)}
            >
                {({getRootProps, getInputProps}) => (

                    <div {...getRootProps()} className={classes.uploadSection}>
                        <input {...getInputProps()} accept={accept||'*'} />
                        {dragOver ? <div className={classes.dropHere}>Arrastre y suelte el archivo aquí, o haga clic para seleccionar el archivo<br/>¡ Sueltalo !<br/>aquí</div> :
                            loading ? <div>Subiendo Archivo</div> :
                                success ? <div>Archivo Subido !! <Icons.Check/></div> :
                                    filename ? <div>{filename} <Button startIcon={<DeleteIcon />} onClick={deleteHandler}>Borrar</Button></div> :
                                    <div>Arrastre y suelte el archivo aquí, o haga clic para seleccionar el archivo</div>}
                        {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                    </div>

                )}
            </Dropzone>
        </div>
    </div>
}
