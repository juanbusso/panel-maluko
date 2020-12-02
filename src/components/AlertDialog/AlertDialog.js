import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function AlertDialog({agreeAction,disagreeAction,message,handleClose,title}) {
    return (
        <div>
            <Dialog
                open={true}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle>{title||"Borrar?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={disagreeAction||handleClose} color="primary">
                        No
                    </Button>
                    <Button onClick={agreeAction||handleClose} color="primary" autoFocus>
                        Si
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
