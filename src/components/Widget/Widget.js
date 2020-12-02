import React, { useState } from "react";
import {
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import { MoreVert as MoreIcon } from "@material-ui/icons";
import classnames from "classnames";

// styles
import useStyles from "./styles";

export default function Widget({
  children,
  title,
  noBodyPadding,
  bodyClass,
  disableWidgetMenu,
  header,
  menuItems,
  ...props
}) {
  var classes = useStyles();

  // local
  var [moreButtonRef, setMoreButtonRef] = useState(null);
  var [isMoreMenuOpen, setMoreMenuOpen] = useState(false);

  return (
    <div className={classes.widgetWrapper}>
      <Paper className={classes.paper} classes={{ root: classes.widgetRoot }}>
        <div className={classes.widgetHeader}>
          {header ? (
            header
          ) : (
            <React.Fragment>
              <Typography variant="h5" color="textSecondary">
                {title}
              </Typography>

            </React.Fragment>
          )}
            {!disableWidgetMenu && (
                <IconButton
                    color="primary"
                    classes={{ root: classes.moreButton }}
                    aria-owns="widget-menu"
                    aria-haspopup="true"
                    onClick={() => setMoreMenuOpen(true)}
                    buttonRef={setMoreButtonRef}
                >
                    <MoreIcon />
                </IconButton>
            )}
        </div>
        <div
          className={classnames(classes.widgetBody, {
            [classes.noPadding]: noBodyPadding,
            [bodyClass]: bodyClass,
          })}
        >
          {children}
        </div>
      </Paper>
      <Menu
        id="widget-menu"
        open={isMoreMenuOpen}
        anchorEl={moreButtonRef}
        onClose={() => setMoreMenuOpen(false)}
        disableAutoFocusItem
      >
        {
          menuItems ?
          menuItems.map((i,j)=>
            <MenuItem key={j} onClick={()=>{ i.onclick && i.onclick(); setMoreMenuOpen(false) }}>
              <Typography>{i.name}</Typography>
            </MenuItem>
        ) : ''}
      </Menu>
    </div>
  );
}
