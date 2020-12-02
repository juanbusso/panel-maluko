import React from "react";
import { Button } from "@material-ui/core";

// styles
import useStyles from "./styles";

// components
import { Typography } from "../Wrappers";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {useHistory} from "react-router-dom";

export default function PageTitle(props) {
  var classes = useStyles();
    const history = useHistory();

    return (
    <div className={classes.pageTitleContainer}>
      <Typography className={classes.typo} variant="h1" size="sm">
          {props.backButton && <Button onClick={history.goBack} style={{color: 'unset', fontSize: '0.6em'}}><FontAwesomeIcon icon={faArrowLeft}/></Button>}
          {props.title}
      </Typography>
      {props.button && (
        <Button
          classes={{ root: classes.button }}
          variant="contained"
          size="large"
          color="secondary"
        >
          {props.button}
        </Button>
      )}
    </div>
  );
}
