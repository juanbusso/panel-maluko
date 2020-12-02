import {Button} from "../Wrappers";
import React, {useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {ajax} from "can";
import printJS from "print-js";
import IconButton from "@material-ui/core/IconButton";
import ViewButton from "@material-ui/icons/Visibility";
import PrintIcon from '@material-ui/icons/Print';
import {CircularProgress, Modal} from "@material-ui/core";


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
    },
    iframe: {
        height: '-webkit-fill-available',
        width: '100%',
    }
}));


export default function DriveFileViewButtonModal({driveFileId}) {

    const classes = useStyles();
    const [open, setOpen] = React.useState(false);


    const handleOpen = (e) => {
        e.stopPropagation();
        setOpen(true);
    };

    const handleClose = (e) => {
        e.stopPropagation();
        setOpen(false);
    };

    return  (
        <>
            {/*<Button variant="contained" size="small" color="primary" onClick={handleOpen}>Ver Archivo</Button>*/}
            <IconButton onClick={handleOpen}>
                <ViewButton />
            </IconButton>
            <Modal
                open={open}
                onClose={handleClose}
            >
                <div className={classes.modal}>
                <iframe title={driveFileId} src={`https://drive.google.com/file/d/${driveFileId}/preview`} className={classes.iframe}/>
                </div>
            </Modal>
        </>
    );
}

const DriveFilePrintButton = ({driveFileId}) => {
    const [loading,setLoading] = useState(false);

    const handleClick = async (e) => {
        e.stopPropagation();
        setLoading(true);

        await ajax({
            crossDomain: true,
            url: 'https://script.google.com/macros/s/AKfycbwov3pdmHC2B3rXfoD49jO9Qxxl-QBYVsz_wRM_4GCYCPt5Gp0u/exec?id='+driveFileId,
            type: "GET"
        }).then(r=>r.response).then(base64=>printJS({printable: base64, type: 'pdf', base64: true}))

        setLoading(false);
    };

    return <>
        <IconButton onClick={handleClick} aria-label="delete" disabled={loading}>
        <PrintIcon />
        </IconButton>
        {loading&&<CircularProgress/>}
        </>
}

export {DriveFilePrintButton}
