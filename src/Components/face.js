import React, { useEffect } from 'react'
import '../App.css';
import * as faceapi from 'face-api.js';
import Webcam from "react-webcam";
import Jimp from 'jimp'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import {Typography} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';


const useStyles = makeStyles((theme) => ({
  root: {
justifyContent:'center',
textAlign:'center'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));


function Face(){

    const classes = useStyles();
    const webcamRef = React.useRef(null);
    const vidHeight = 360;
    const vidWidth = 480;
    const[capImages,setCapImages]=React.useState([])
    const[settings,setSettings] = React.useState({})
    const[ogImages,setOgImages] = React.useState([])
    const[inside,setInside] = React.useState(false)
    const[close,setClose] = React.useState(false)
    const[align,setAlign] = React.useState(false)
    const[bright,setBright] = React.useState(false)
    const[faceStat,setFaceStat] = React.useState("")

useEffect(()=>{
    let setting = require("./Settings/settings.json")
    setSettings(setting)
    //////////console.log(settings,"settings")
    const c = document.getElementById("canvas1")
    const ctx = c.getContext("2d")
    ctx.strokeStyle = "#FF0000";
    ctx.setLineDash([6]);
    ctx.strokeRect(40, 30, 400, 300);
    
    Promise.all([
        faceapi.loadFaceLandmarkModel('models'),
        faceapi.loadTinyFaceDetectorModel('models'),
        faceapi.loadFaceRecognitionModel('models'),
        faceapi.loadSsdMobilenetv1Model('models')
        
      ])
})

function performChecks(e){
    
  const video = webcamRef;
  //Creating a canvas to add overlay image
  const canvas = document.getElementById("canvas")
  const displaySize = { width: vidWidth, height: vidHeight };
  faceapi.matchDimensions(canvas, displaySize);
  
  //Asynchronusly get detections from the video Stream
    var interval = setInterval(async () => {
      
      const detections = await faceapi
        .detectAllFaces(video.current.video, new faceapi.TinyFaceDetectorOptions()) //Face Detectors
        .withFaceLandmarks() // Get cordinates of landmarks
  // Resize and Display the detections on the video frame using canvas
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      // setPrevFace(resizedDetections[0])

      // //////////console.log(prevFace,"prevFace")
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      if(resizedDetections[0]){
        var pTopLeft={x:resizedDetections[0].detection.box.topLeft.x,y:resizedDetections[0].detection.box.topLeft.y}
        var pBottomRight={x:resizedDetections[0].detection.box.bottomRight.x,y:resizedDetections[0].detection.box.bottomRight.y}
        var bb = {ix:120,iy:40,ax:520,ay:430}


        if((isInside(pTopLeft,bb) && isInside(pBottomRight,bb)) || !settings.insideBox) {
          setInside(false)
      const dist = faceapi.euclideanDistance([resizedDetections[0].landmarks.getRightEye()[0]._x,resizedDetections[0].landmarks.getRightEye()[0]._y], [resizedDetections[0].landmarks.getLeftEye()[0]._x,resizedDetections[0].landmarks.getLeftEye()[0]._y])
      const slope = (resizedDetections[0].landmarks.getLeftEye()[0]._y-resizedDetections[0].landmarks.getRightEye()[0]._y)/(resizedDetections[0].landmarks.getLeftEye()[0]._x-resizedDetections[0].landmarks.getRightEye()[0]._x)
     if((resizedDetections[0].detection.box.width>200 && resizedDetections[0].detection.box.height>200) || !settings.hw200){
      setClose(false)
     if(((dist>75 && dist<83) && (slope>-0.1 && slope<0.3)) || !settings.aligned){
       Promise.all([
        setAlign(false)
       ])
    .then(()=>{cropAndSave(e,resizedDetections[0].detection.box,interval,canvas)
    })
    }
    else{
      setAlign(true)
    }
    }
    else{
      setClose(true)
    }
    }
    else{
      setInside(true)
    }
  }
}, 100)

}

const isInside=(p,bb)=>{
  if( bb.ix <= p.x && p.x <= bb.ax && bb.iy <= p.y && p.y <= bb.ay ) {
return true
  }

  else{
    return false
  }
}

const cropAndSave=(e,box,interval,canvas)=>{

const images = capImages
var og = ogImages
var srcimg = webcamRef.current.getScreenshot();

Jimp.read(srcimg)
.then((img)=>{
//////////console.log(img,"image")

  getImageLightness(img.bitmap,function(brightness){
    
    ////////console.log(brightness,"bro")
if(brightness>100 || !settings.brightness){
  setBright(false)
  setAlign(false)
  setClose(false)
  setInside(false)
img.getBase64(Jimp.AUTO, async(err, src) => {
og[e.target.id] = src
setOgImages(og)
})
   img.crop(box.x, box.y, box.width, box.height)
      img.getBase64(Jimp.AUTO, async(err, src) => {

  e.target.src=src
  clearInterval(interval)
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  images[e.target.id] = src;
          setCapImages(images);
          //////////console.log(images)
          })
        }
        else{
          setBright(true)
        }
      })
 
})
}

const matchImages =async()=>{



var imgEl1 = document.createElement("img")
imgEl1.src = ogImages[1]
  const img1 = await faceapi.detectAllFaces(base64ToEl(ogImages[0]),new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
  const img2 = await faceapi.detectAllFaces(base64ToEl(ogImages[1]),new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
  const img3 = await faceapi.detectAllFaces(base64ToEl(ogImages[2]),new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
  const img4 = await faceapi.detectAllFaces(base64ToEl(ogImages[3]),new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
  const displaySize = { width: vidWidth, height: vidHeight };
  const detection1 = faceapi.resizeResults(img1, displaySize);
  const detection2 = faceapi.resizeResults(img2, displaySize);
  const detection3 = faceapi.resizeResults(img3, displaySize);
  const detection4 = faceapi.resizeResults(img4, displaySize);
  //////////console.log(detection1[0],detection2[0],detection3[0],detection4[0],"detections")
  if(detection1[0] && detection2[0] && detection3[0] && detection4[0]){
  const distance1 = faceapi.euclideanDistance(detection1[0].descriptor, detection2[0].descriptor);
  const distance2 = faceapi.euclideanDistance(detection1[0].descriptor, detection3[0].descriptor);
  const distance3 = faceapi.euclideanDistance(detection1[0].descriptor, detection4[0].descriptor);
  if(distance1<0.3 && distance2<0.3 && distance3<0.3){
    // //////////console.log(distance1,distance2,distance3,"same faces")
    setFaceStat("Same Faces")
    setTimeout(() => {
      setFaceStat("")
    }, 3000);
    }
  
  else{
    setFaceStat("Not Same")
    setTimeout(() => {
      setFaceStat("")
    }, 3000);
    //////////console.log(distance1,distance2,distance3,"not same")
  }
}
else{
  //////////console.log("not detected")
  setFaceStat("Take Image Again")
  setTimeout(() => {
    setFaceStat("")
  }, 3000);

}


}

const base64ToEl=(src)=>{
  var img = document.createElement("img")
  img.src = src
  return img;
}


function getImageLightness(imageSrc,callback) {

var colorSum = 0;

      var data = imageSrc.data;
      //////////console.log(data)
      var r,g,b,avg;

      for(var x = 0, len = data.length; x < len; x+=4) {
          r = data[x];
          g = data[x+1];
          b = data[x+2];

          avg = Math.floor((r+g+b)/3);
          colorSum += avg;
      }

      var brightness = Math.floor(colorSum / (imageSrc.width*imageSrc.height));
      callback(brightness);
  
}






    return(

<div className={classes.root}>
<Grid container spacing={3}
  justify="center">
    <Grid item xs={12}>
      <Paper>
      <Typography variant="h7">Face Registration/New</Typography>
      </Paper>
    </Grid>
  <Grid item xs={4.5}>
  
      <div className="row">
     <Webcam
        audio={false}
        height={vidHeight}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={vidWidth}
      />
<canvas id="canvas" width={vidWidth} height={vidHeight}/>
<canvas id="canvas1" width={vidWidth} height={vidHeight}/>
</div>


  </Grid>
  <Grid item xs={3}>
    <Paper className={classes.paper}>
<h3>Instruction Panel</h3>
<div style={{textAlign:"left"}}>
<p style={{marginTop:"0px",marginBottom:"0px"}}>1. Wait for models to load.</p>
 <p style={{marginTop:"0px",marginBottom:"0px"}}>2. Put your face inside the square box.</p>
 <p style={{marginTop:"0px",marginBottom:"0px"}}>3. Put face close to the camera.</p>
 <p style={{marginTop:"0px",marginBottom:"0px"}}>4. Align face in front direction.</p>
 <p style={{marginTop:"0px",marginBottom:"0px"}}>5. Make sure it is not too bright or too dark.</p>
 <p style={{marginTop:"0px",marginBottom:"0px"}}>6. Press match images after taking all 4 images to check if all faces are same.</p>
 </div>
 <Button variant="contained" color="primary" onClick={matchImages}>
  Match Images
</Button>
<p>{faceStat}</p>
    </Paper>

  </Grid>
  <Grid item xs={5}>
    <Paper>
         <img src="4.png" width="100" id="0" onClick={(e)=>{performChecks(e)}}/>
   <img src="4.png" width="100" id="1" onClick={(e)=>{performChecks(e)}}/>
    <img src="4.png" width="100" id="2" onClick={(e)=>{performChecks(e)}}/>
    <img src="4.png" width="100" id="3" onClick={(e)=>{performChecks(e)}}/>
    </Paper>
  </Grid>
  <Grid xs={3}>
    <Paper>
      <h6>Errors:</h6>
  {inside && <p>Not Inside</p>}
{close && <p>Not close</p>}
{align && <p>Not Aligned</p>}
{bright && <p>Too bright or too dark</p>}
</Paper>
  </Grid>
</Grid>
</div>

    )
}

export default Face;