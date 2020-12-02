import React, { useState, useEffect } from "react";
import { Drawer, IconButton, List } from "@material-ui/core";
import {
  Home as HomeIcon,
  NotificationsNone as NotificationsIcon,
  FormatSize as TypographyIcon,
  FilterNone as UIElementsIcon,
  BorderAll as TableIcon,
  QuestionAnswer as SupportIcon,
  LibraryBooks as LibraryIcon,
  HelpOutline as FAQIcon,
  ArrowBack as ArrowBackIcon,
} from "@material-ui/icons";
import { useTheme } from "@material-ui/styles";
import { withRouter } from "react-router-dom";
import classNames from "classnames";

// icons sets
import "@fortawesome/fontawesome-free/css/all.min.css"
// import "font-awesome/css/font-awesome.min.css";

// styles
import useStyles from "./styles";

// components
import SidebarLink from "./components/SidebarLink/SidebarLink";
import Dot from "./components/Dot";

// context
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../context/LayoutContext";
import {useAreaDataContext} from "../../context/AreaContext";
import {useRoleDataContext} from "../../context/RoleContext";

// const structure = [
//   { id: 0, label: "Dashboard", link: "/app/dashboard", icon: <HomeIcon /> },
//   {
//     id: 1,
//     label: "Typography",
//     link: "/app/typography",
//     icon: <TypographyIcon />,
//   },
//   { id: 2, label: "Tables", link: "/app/tables", icon: <TableIcon /> },
//   { id: 15, label: "Clientes", link: "/app/clientes", icon: <i className="fa fa-google" /> },
//   { id: 16, label: "Familias", link: "/app/familias", icon: <TableIcon /> },
//   { id: 17, label: "Areas", link: "/app/areas", icon: <TableIcon /> },
//
//   {
//     id: 3,
//     label: "Notifications",
//     link: "/app/notifications",
//     icon: <NotificationsIcon />,
//   },
//   {
//     id: 4,
//     label: "UI Elements",
//     link: "/app/ui",
//     icon: <UIElementsIcon />,
//     children: [
//       { label: "Icons", link: "/app/ui/icons" },
//       { label: "Charts", link: "/app/ui/charts" },
//       { label: "Maps", link: "/app/ui/maps" },
//     ],
//   },
//   { id: 5, type: "divider" },
//   { id: 6, type: "title", label: "HELP" },
//   { id: 7, label: "Library", link: "", icon: <LibraryIcon /> },
//   { id: 8, label: "Support", link: "", icon: <SupportIcon /> },
//   { id: 9, label: "FAQ", link: "", icon: <FAQIcon /> },
//   { id: 10, type: "divider" },
//   { id: 11, type: "title", label: "PROJECTS" },
//   {
//     id: 12,
//     label: "My recent",
//     link: "",
//     icon: <Dot size="large" color="warning" />,
//   },
//   {
//     id: 13,
//     label: "Starred",
//     link: "",
//     icon: <Dot size="large" color="primary" />,
//   },
//   {
//     id: 14,
//     label: "Background",
//     link: "",
//     icon: <Dot size="large" color="secondary" />,
//   },
// ];


function areaPanelstructure(area,roleData) {
  let structure =  roleData.view.filter(d=>!!area.panel[d]).map(d=>(  {
    id: d,
    label: area.panel[d].title || d,
    link: `/app/${d}`,
    icon: <i className={`fa ${area.panel[d].icon || 'fa-google'}`} />,
  }));
  structure = [{ id: 0, label: "Inicio", link: "/app/dashboard", icon: <HomeIcon /> },...structure];
  return structure;
}

function Sidebar({ location }) {
  var classes = useStyles();
  var theme = useTheme();
  const areaData = useAreaDataContext();
  const roleData = useRoleDataContext();

  const [structure,setStructure] = useState(areaPanelstructure(areaData,roleData));

  useEffect(()=>{setStructure(areaPanelstructure(areaData,roleData))},[areaData,roleData])

  // global
  var { isSidebarOpened } = useLayoutState();
  var layoutDispatch = useLayoutDispatch();

  // local
  var [isPermanent, setPermanent] = useState(true);

  useEffect(function() {
    window.addEventListener("resize", handleWindowWidthChange);
    handleWindowWidthChange();
    return function cleanup() {
      window.removeEventListener("resize", handleWindowWidthChange);
    };
  });

  return (
    <Drawer
      variant={isPermanent ? "permanent" : "temporary"}
      className={classNames(classes.drawer, {
        [classes.drawerOpen]: isSidebarOpened,
        [classes.drawerClose]: !isSidebarOpened,
      })}
      classes={{
        paper: classNames({
          [classes.drawerOpen]: isSidebarOpened,
          [classes.drawerClose]: !isSidebarOpened,
        }),
      }}
      open={isSidebarOpened}
    >
      <div className={classes.toolbar} />
      <div className={classes.mobileBackButton}>
        <IconButton onClick={() => toggleSidebar(layoutDispatch)}>
          <ArrowBackIcon
            classes={{
              root: classNames(classes.headerIcon, classes.headerIconCollapse),
            }}
          />
        </IconButton>
      </div>
      <List className={classes.sidebarList}>
        {structure.map((link,i) => (
          <SidebarLink
            key={link.id}
            location={location}
            isSidebarOpened={isSidebarOpened}
            {...link}
          />
        ))}
      </List>
    </Drawer>
  );

  // ##################################################################
  function handleWindowWidthChange() {
    var windowWidth = window.innerWidth;
    var breakpointWidth = theme.breakpoints.values.md;
    var isSmallScreen = windowWidth < breakpointWidth;

    if (isSmallScreen && isPermanent) {
      setPermanent(false);
    } else if (!isSmallScreen && !isPermanent) {
      setPermanent(true);
    }
  }
}

export default withRouter(Sidebar);
