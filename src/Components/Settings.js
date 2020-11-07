import React,{useState,useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';


const useStyles = makeStyles({
    table: {
      maxWidth:650
    },
  });


export default function Setting(props){
    const classes = useStyles();

    const [Regsetting,setRegSetting] = useState(require("./Settings/settings.json"))
    const [Matsetting,setMatSetting] = useState(require("./Match-settings/settings.json"))

    useEffect(()=>{
        props.setTitle("Settings")
    
    })

    return(
        <div style={{marginTop:"6%"}}>
            <Grid
  container
  direction="row"
  alignItems="center"
  justify="center"
  alignItems="stretch"
  spacing={3}
>
    <Grid item xs={4}>
              <TableContainer component={Paper}>
                  <Typography variant="h6" align="center">Registration Settings</Typography>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Setting</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(Regsetting).map((row,i)=>{
              return(
<TableRow key={i}>
    <TableCell component="th" scope="row">
        {row[0]}
    </TableCell>
    <TableCell component="th" scope="row">
        {row[1].toString()}
    </TableCell>
</TableRow>
)
          })}
        </TableBody>
      </Table>
    </TableContainer>
    </Grid>

    <Grid item xs={4}>
              <TableContainer component={Paper}>
                  <Typography variant="h6" align="center">Face Match Settings</Typography>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Setting</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(Matsetting).map((row,i)=>{
              return(
<TableRow key={i}>
    <TableCell component="th" scope="row">
        {row[0]}
    </TableCell>
    <TableCell component="th" scope="row">
    {row[1].toString()}
    </TableCell>
</TableRow>
)
          })}
        </TableBody>
      </Table>
    </TableContainer>
    </Grid>
    </Grid>
        </div>
    )
}

