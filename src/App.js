import React,{useState,Fragment,useEffect } from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Switch,Link} from 'react-router-dom'
import { createBrowserHistory } from "history";
import Form1 from './Components/form-materialui'
import Face from './Components/face'
import FaceMatch from './Components/face match'
import Home from './Components/Home'
import Help from './Components/Help'
import Settings from "./Components/Settings"
import { withStyles,useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import HelpIcon from '@material-ui/icons/Help';
import SettingsIcon from '@material-ui/icons/Settings';
import Typography from '@material-ui/core/Typography';
import {MDBContainer,MDBFooter} from "mdbreact";


const drawerWidth = 240;
const history = createBrowserHistory();

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  flex: {
    flex: 1
  },
  drawerPaper: {
    position: "absolute",
    width: drawerWidth
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  toolbarMargin: theme.mixins.toolbar,
  aboveDrawer: {
    zIndex: theme.zIndex.drawer-1
  }
});


const MyToolbar = withStyles(styles)(
  ({ classes, title, onMenuClick }) => (
    <Fragment>
      <AppBar className={classes.aboveDrawer}>
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
            onClick={onMenuClick}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            color="inherit"
            className={classes.flex}
          >
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      {/* <div className={classes.toolbarMargin} /> */}
    </Fragment>
  )
);


const MyDrawer = withStyles(styles)(
  ({ classes, open, onClose, onItemClick,theme,setTitle }) => (
<Router history={history}>

<CssBaseline />
        <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="left"
          open={open}
          onClose={onClose}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={onClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </div>
          <Divider />
          <List>
          <ListItem button key={"Home"} onClick={()=>onItemClick('Home','/')}>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary={"Home"} />
              </ListItem>
              <ListItem button key={"Face Registration"} onClick={()=>onItemClick('Face Registration',"/form")}>
                <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                <ListItemText primary={"Face Registration"} />
              </ListItem>
              <ListItem button key={"Settings"} onClick={()=>onItemClick('Settings','/settings')}>
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary={"Settings"} />
              </ListItem>
              <ListItem button key={"Help"} onClick={()=>onItemClick('Help','/help')}>
                <ListItemIcon><HelpIcon /></ListItemIcon>
                <ListItemText primary={"Help"} />
              </ListItem>
          </List>
        </Drawer>
  <Switch>

  <Route exact path="/face">
    <Face setTitle={setTitle}/>
  </Route>

  <Route exact path="/">
    <Home setTitle={setTitle}/>
  </Route>

  <Route exact path="/form">
    <Form1 setTitle={setTitle}/>
  </Route>

  <Route exact path="/face-match">
    <FaceMatch setTitle={setTitle}/>
  </Route>
  <Route exact path="/help">
    <Help setTitle={setTitle}/>
  </Route>
  <Route exact path="/settings">
    <Settings setTitle={setTitle}/>
  </Route>
  </Switch>

  <div className="footer-copyright text-center py-3" style={{backgroundColor:"#3F51B5",marginTop:"20px",color:"white"}}>
        <MDBContainer fluid>
          &copy; {new Date().getFullYear()} Copyright: Abc
        </MDBContainer>
      </div>
    


</Router>

  ))


function App() {

  const [drawer, setDrawer] = useState(false);
  const [title, setTitle] = useState('');
  const theme = useTheme();

  const setTitles=(titles)=>{
    setTitle(titles)
  }

 

  const onItemClick = (title,route) => {
    setDrawer(drawer);
    setDrawer(!drawer);
    history.push(route)
    history.go(0)
  };

  const toggleDrawer = () => {
    setDrawer(!drawer);
  }

  return (
<div>
      <MyToolbar title={title} onMenuClick={toggleDrawer} />
      <MyDrawer
        open={drawer}
        onClose={toggleDrawer}
        onItemClick={onItemClick}
        theme={theme}
        setTitle={setTitles}
      />
    </div>
  );
}

export default App;
