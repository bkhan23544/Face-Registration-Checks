import React,{useEffect,useState} from 'react'
import {Grid,Typography,Paper} from '@material-ui/core';

export default function Help(props){

const [help,setHelp]=useState(require("./Help/help.json"))   

useEffect(()=>{
    props.setTitle("Help")

})


return(
    <div>
        <Grid
  container
  spacing={0}
  direction="column"
  alignItems="center"
  justify="center"
  style={{ minHeight: '100vh' }}
  spacing={3}
>
  {help.helpArray.map((v,i)=>{
      return(
         <Grid item xs={7}>
           <Paper style={{padding:"20px"}}>
          <Typography variant="h6">
              {v.title}
          </Typography>
          <Typography variant="h7">
              {v.para}
          </Typography>
          </Paper>
          </Grid>
      
          )
  })}  
</Grid>
    </div>
)
}