import React, { useEffect } from 'react'
import '../App.css';
import * as faceapi from 'face-api.js';
import Webcam from "react-webcam";
import Jimp from 'jimp'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress'
import writeJsonFile from 'write-json-file'


const useStyles = makeStyles((theme) => ({
  root: {
    justifyContent: 'center',
    textAlign: 'center'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));


function Face() {

  const classes = useStyles();
  const webcamRef = React.useRef(null);
  const vidHeight = 360;
  const vidWidth = 480;
  const [croppedImages, setCroppedImages] = React.useState([])
  const [settings, setSettings] = React.useState({})
  const [ogImages, setOgImages] = React.useState([])
  const [inside, setInside] = React.useState(false)
  const [close, setClose] = React.useState(false)
  const [align, setAlign] = React.useState(false)
  const [bright, setBright] = React.useState(false)
  const [faceStat, setFaceStat] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [faceLoading, setFaceLoading] = React.useState(false)


  const handleSaveToPC = jsonData => {
    const fileData = JSON.stringify(jsonData);
    const blob = new Blob([fileData], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'sample.json';
    link.href = url;
    link.click();
  }


  useEffect(() => {


    var setting = {}
    const queryString = require('query-string');
    const parsed = queryString.parse(window.location.search);
    if (parsed.setting) {
      setting = require("./Settings/" + parsed.setting)
      //setting can be accessed from anywhere in the component
      setSettings(setting)
    }
    else {
      setting = require("./Settings/settings.json")
      setSettings(setting)
      console.log(setting, "settings")
    }


    Promise.all([
      faceapi.loadFaceLandmarkModel('models'),
      faceapi.loadTinyFaceDetectorModel('models'),

    ]).then(() => {
      setLoading(false)
      const c = document.getElementById("canvas1")
      const ctx = c.getContext("2d")
      ctx.strokeStyle = "#FF0000";
      ctx.setLineDash([6]);
      ctx.strokeRect((vidWidth / 100) * 21, (vidHeight / 100) * 10, 0.75 * vidHeight, (vidHeight / 100) * 80);
      ctx.font = "12px Arial";
      ctx.fillText("Come closer", 10, 20);
      ctx.fillText("Keep face straight and front looking", 10, 40);
      // console.log("loaded")
    })
  },[])

  function performChecks(e) {

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

      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      if (resizedDetections[0] && resizedDetections[0].alignedRect.score > 0.7) {
        var pTopLeft = { x: resizedDetections[0].alignedRect.box.topLeft.x, y: resizedDetections[0].alignedRect.box.topLeft.y }
        var pBottomRight = { x: resizedDetections[0].alignedRect.box.bottomRight.x, y: resizedDetections[0].alignedRect.box.bottomRight.y }
        var bb = { ix: (vidWidth / 100) * 21, iy: (vidHeight / 100) * 10, ax: (vidWidth / 100) * 77, ay: (vidHeight / 100) * 90 }

        //checking if face is inside the box.
        if ((isInside(pTopLeft, bb) && isInside(pBottomRight, bb))) {
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          handleInside(false)
          const dist = faceapi.euclideanDistance([resizedDetections[0].landmarks.getRightEye()[0]._x, resizedDetections[0].landmarks.getRightEye()[0]._y], [resizedDetections[0].landmarks.getLeftEye()[0]._x, resizedDetections[0].landmarks.getLeftEye()[0]._y])
          const slope = (resizedDetections[0].landmarks.getLeftEye()[0]._y - resizedDetections[0].landmarks.getRightEye()[0]._y) / (resizedDetections[0].landmarks.getLeftEye()[0]._x - resizedDetections[0].landmarks.getRightEye()[0]._x)
          //checking if height and width are greater than 200px
          if ((resizedDetections[0].alignedRect.box.width > 200 && resizedDetections[0].alignedRect.box.height > 200)) {
            handleClose(false)
            //checking if face is properly aligned.
            if (((dist > 75 && dist < 83) && (slope > -0.1 && slope < 0.3))) {
              Promise.all([
                handleAlign(false)
              ])
                .then(() => {
                 var al = resizedDetections[0].landmarks.align()
                // console.log(resizedDetections[0])
                  cropAndSave(e, al,interval, canvas)
                })
            }
            else {
              handleAlign(true)
            }
          }
          else {
            handleClose(true)
          }
        }
        else {
          handleInside(true)
        }
      }
    }, 500)

  }

  const isInside = (p, bb) => {
    if (bb.ix <= p.x && p.x <= bb.ax && bb.iy <= p.y && p.y <= bb.ay) {
      return true
    }

    else {
      return false
    }
  }

  const cropAndSave = (e, box, interval, canvas) => {

    const images = croppedImages
    var og = ogImages
    var srcimg = webcamRef.current.getScreenshot();

    Jimp.read(srcimg)
      .then((img) => {

        getImageLightness(img.bitmap, function (brightness) {

          //checking if brightness is not too high and not too low.
          if (brightness > 100 && brightness < 150) {
            handleInside(false)
            handleAlign(false)
            handleClose(false)
            handleBright(false)
            img.getBase64(Jimp.AUTO, async (err, src) => {
              og[e.target.id] = src
              setOgImages(og)
            })
            img.crop(box.x, box.y, box.width, box.height)
            img.getBase64(Jimp.AUTO, async (err, src) => {
              
              e.target.src = src
              e.target.style = "border:4px solid green"
              clearInterval(interval)
              canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
              images[e.target.id] = src;
              setCroppedImages(images);
            })
          }
          else {
            handleBright(true)
          }
        })

      })
  }

  const matchImages = async () => {
    setFaceLoading(true)
    Promise.all([
      faceapi.loadFaceRecognitionModel('models'),
      faceapi.loadSsdMobilenetv1Model('models')
    ])
      .then(async () => {
        //detecting faces with descriptors
        const img1 = await faceapi.detectAllFaces(base64ToEl(ogImages[0]), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const img2 = await faceapi.detectAllFaces(base64ToEl(ogImages[1]), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const img3 = await faceapi.detectAllFaces(base64ToEl(ogImages[2]), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const img4 = await faceapi.detectAllFaces(base64ToEl(ogImages[3]), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const displaySize = { width: vidWidth, height: vidHeight };
        //resizing detections
        var detections = {
          detection1: faceapi.resizeResults(img1, displaySize),
          detection2: faceapi.resizeResults(img2, displaySize),
          detection3: faceapi.resizeResults(img3, displaySize),
          detection4: faceapi.resizeResults(img4, displaySize),
        }

        //getting eucledian distance between detections. Less means more close
        if (detections.detection1[0] && detections.detection2[0] && detections.detection3[0] && detections.detection4[0]) {
          const distance1 = faceapi.euclideanDistance(detections.detection1[0].descriptor, detections.detection2[0].descriptor);
          const distance2 = faceapi.euclideanDistance(detections.detection1[0].descriptor, detections.detection3[0].descriptor);
          const distance3 = faceapi.euclideanDistance(detections.detection1[0].descriptor, detections.detection4[0].descriptor);
          if (distance1 < 0.3 && distance2 < 0.3 && distance3 < 0.3) {
            var finalArray = [
              {
                fullImg: ogImages[0],
                croppedImg: croppedImages[0],
                resizedDetections: detections.detection1,
                timeStamp:Date.now()
              },
              {
                fullImg: ogImages[0],
                croppedImg: croppedImages[1],
                resizedDetections: detections.detection2,
                timeStamp:Date.now()
              },
              {
                fullImg: ogImages[2],
                croppedImg: croppedImages[2],
                resizedDetections: detections.detection3,
                timeStamp:Date.now()
              },
              {
                fullImg: ogImages[3],
                croppedImg: croppedImages[3],
                resizedDetections: detections.detection4,
                timeStamp:Date.now()
              }
            ]

            var finalObj={
              userData:JSON.parse(localStorage.getItem("userData")),
              images:finalArray
}


const response = await fetch(settings.server_url, {
  method: settings.server_method, 
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(finalObj)
});
console.log(response.json(),"response"); 
          
            setFaceLoading(false)
            setFaceStat("Same Faces")
            var canvas = document.getElementById("canvas1")
            
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "30px Arial";
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.fillText("Thanks!", canvas.width/2, canvas.height/2);

            setTimeout(() => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              setFaceStat("")
            }, 3000);
            
          }

          else {
            setFaceLoading(false)
            setFaceStat("Not Same")
            setTimeout(() => {
              setFaceStat("")
            }, 3000);
          }
        }
        else {
          for (var i = 1; i < 5; i++) {
            if (detections["detection" + i].length == 0) {
              setFaceStat(`Take Image ${i} Again`)
            }
          }
          setFaceLoading(false)
          setTimeout(() => {
            setFaceStat("")
          }, 3000);

        }
      })
  }

  const base64ToEl = (src) => {
    var img = document.createElement("img")
    img.src = src
    return img;
  }


  function getImageLightness(imageSrc, callback) {
    var colorSum = 0;

    var data = imageSrc.data;
    var r, g, b, avg;

    for (var x = 0, len = data.length; x < len; x += 4) {
      r = data[x];
      g = data[x + 1];
      b = data[x + 2];

      avg = Math.floor((r + g + b) / 3);
      colorSum += avg;
    }

    var brightness = Math.floor(colorSum / (imageSrc.width * imageSrc.height));
    callback(brightness);

  }

  const handleInside = async (status) => {
    setInside(status)
  }

  const handleAlign = async (status) => {
    setAlign(status)
  }

  const handleClose = async (status) => {
    setClose(status)
  }

  const handleBright = async (status) => {
    setBright(status)
  }






  return (
    <div className={classes.root}>
      <Grid container spacing={3}
        justify="center">
        <Grid item xs={12}>
          <Paper>
            <Typography variant="body1">Face Registration/New</Typography>
          </Paper>
        </Grid>
        <Grid id="icons-side" item xs={2}>
          <Paper>
            <img src="https://icons.iconarchive.com/icons/osullivanluke/orb-os-x/512/Image-Capture-icon.png" width="100" height="100" id="0" className="mt-1" onClick={(e) => { performChecks(e) }} />
            <img src="https://icons.iconarchive.com/icons/osullivanluke/orb-os-x/512/Image-Capture-icon.png" width="100" height="100" id="1" className="mt-1" onClick={(e) => { performChecks(e) }} />
            <img src="https://icons.iconarchive.com/icons/osullivanluke/orb-os-x/512/Image-Capture-icon.png" width="100" height="100" id="2" className="mt-1" onClick={(e) => { performChecks(e) }} />
            <img src="https://icons.iconarchive.com/icons/osullivanluke/orb-os-x/512/Image-Capture-icon.png" width="100" height="100" id="3" className="mt-1" onClick={(e) => { performChecks(e) }} />
          </Paper>
        </Grid>
        <Grid item xs={4.5}>


          {loading ? <CircularProgress />
            :
            <div className="row"><Webcam
              audio={false}
              height={vidHeight}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={vidWidth}
            />
              <canvas id="canvas" width={vidWidth} height={vidHeight} />
              <canvas id="canvas1" width={vidWidth} height={vidHeight} />
            </div>}




        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.paper}>
            <h3>Instruction Panel</h3>
            <div style={{ textAlign: "left" }}>
              {!loading && <p style={{ marginTop: "0px", marginBottom: "0px", color: "green", textAlign: "center" }}>Webcam Ready</p>}
              <p style={{ marginTop: "0px", marginBottom: "0px" }}>1. Put your face inside the square box.</p>
              <p style={{ marginTop: "0px", marginBottom: "0px" }}>2. Press camera icon to take picture.</p>
              <p style={{ marginTop: "0px", marginBottom: "0px" }}>3. Align face in front direction.</p>
              <p style={{ marginTop: "0px", marginBottom: "0px" }}>4. Make sure it is not too bright or too dark.</p>
              <p style={{ marginTop: "0px", marginBottom: "0px" }}>5. Press Submit after taking all 4 images to submit images.</p>
            </div>

            {faceLoading ? <CircularProgress /> :
              <div>
                <Button variant="contained" color="primary" onClick={matchImages}>
                  Submit
</Button>
                <p>{faceStat}</p>
              </div>}
          </Paper>

        </Grid>
        <Grid item xs={3}>
          <Paper>
            {(inside || close || align || bright) && <h6>Errors:</h6>}
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