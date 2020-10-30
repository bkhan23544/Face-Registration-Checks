import React, { useEffect } from 'react'
import Webcam from "react-webcam";
import * as faceapi from 'face-api.js';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress'
import Jimp from 'jimp'
import Button from '@material-ui/core/Button';




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

export default function FaceMatch() {
  const classes = useStyles();
  const webcamRef = React.useRef(null);
  const [settings, setSettings] = React.useState({})
  const [loading, setLoading] = React.useState(true)
  const [croppedImage, setcroppedImage] = React.useState("")
  const [ogImage, setogImage] = React.useState("")
  const [inside, setInside] = React.useState(false)
  const [close, setClose] = React.useState(false)
  const [align, setAlign] = React.useState(false)
  const [bright, setBright] = React.useState(false)
  const [faceLoading, setFaceLoading] = React.useState(false)
  const [faceStat, setFaceStat] = React.useState("")
  const vidHeight = settings.vidHeight;
  const vidWidth = settings.vidWidth;

  useEffect(() => {
    var setting = {}
    const queryString = require('query-string');
    const parsed = queryString.parse(window.location.search);
    if (parsed.setting) {
      setting = require("./Settings/" + parsed.setting)
      //setting can be accessed from anywhere in the component
      setSettings(setting)
      loadModels(setting)
    }
    else {
      setting = require("./Match-settings/settings.json")
      setSettings(setting)
      loadModels(setting)
      console.log(setting, "settings")
    }
  }, [])

  const loadModels = (setting) => {
    Promise.all([
      faceapi.loadFaceLandmarkModel('models'),
      faceapi.loadTinyFaceDetectorModel('models'),

    ]).then(() => {
      setLoading(false)
      var c = document.getElementById("canvas1")
      var ctx = c.getContext("2d")
      ctx.strokeStyle = "#FF0000";
      ctx.setLineDash([6]);
      console.log(setting.vidWidth, setting.vidHeight)
      ctx.strokeRect((setting.vidWidth / 100) * 21, (setting.vidHeight / 100) * 10, 0.75 * setting.vidHeight, (setting.vidHeight / 100) * 80);
      // console.log("loaded")
    })
  }

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
      if (resizedDetections[0] && resizedDetections[0].alignedRect.score > settings.minFaceScore) {
        var pTopLeft = { x: resizedDetections[0].alignedRect.box.topLeft.x, y: resizedDetections[0].alignedRect.box.topLeft.y }
        var pBottomRight = { x: resizedDetections[0].alignedRect.box.bottomRight.x, y: resizedDetections[0].alignedRect.box.bottomRight.y }
        var bb = { ix: (vidWidth / 100) * 21, iy: (vidHeight / 100) * 10, ax: (vidWidth / 100) * 77, ay: (vidHeight / 100) * 90 }

        //checking if face is inside the box.
        if ((isInside(pTopLeft, bb) && isInside(pBottomRight, bb)) || !settings.insideCheck) {
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          handleInside(false)
          const dist = faceapi.euclideanDistance([resizedDetections[0].landmarks.getRightEye()[0]._x, resizedDetections[0].landmarks.getRightEye()[0]._y], [resizedDetections[0].landmarks.getLeftEye()[0]._x, resizedDetections[0].landmarks.getLeftEye()[0]._y])
          const slope = (resizedDetections[0].landmarks.getLeftEye()[0]._y - resizedDetections[0].landmarks.getRightEye()[0]._y) / (resizedDetections[0].landmarks.getLeftEye()[0]._x - resizedDetections[0].landmarks.getRightEye()[0]._x)
          //checking if height and width are greater than 200px
          if ((resizedDetections[0].alignedRect.box.width > settings.minRes && resizedDetections[0].alignedRect.box.height > settings.minRes) || !settings.closeCheck) {
            handleClose(false)
            //checking if face is properly aligned.
            if (((dist > settings.minEyeDist && dist < settings.maxEyeDist) && (slope > settings.minSlope && slope < settings.maxSlope)) || !settings.alignCheck) {
              Promise.all([
                handleAlign(false)
              ])
                .then(() => {
                  var al = resizedDetections[0].landmarks.align()
                  // console.log(resizedDetections[0])
                  cropAndSave(e, al, interval, canvas)
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
    var srcimg = webcamRef.current.getScreenshot();

    Jimp.read(srcimg)
      .then((img) => {

        getImageLightness(img.bitmap, function (brightness) {
          console.log(brightness)
          //checking if brightness is not too high and not too low.
          if ((brightness > settings.minBright && brightness < settings.maxBright) || !settings.brightnessCheck) {
            handleInside(false)
            handleAlign(false)
            handleClose(false)
            handleBright(false)
            img.getBase64(Jimp.AUTO, async (err, src) => {
              setogImage(src)
              if (src !== undefined) {
                document.getElementById("submit").style.display = "inline"
              }
            })
            img.crop(box.x, box.y, box.width, box.height)
            img.getBase64(Jimp.AUTO, async (err, src) => {

              e.target.src = src
              e.target.style = "border:4px solid green"
              clearInterval(interval)
              canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
              setcroppedImage(src);
            })
          }
          else {
            handleBright(true)
          }
        })

      })
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

  const onSubmit = async (e) => {
    var sample = require("./sample.json")
    var src = sample.images[0].fullImg
    setFaceLoading(true)
    if (settings.client_matching) {
      Promise.all([
        faceapi.loadFaceRecognitionModel('models'),
        faceapi.loadSsdMobilenetv1Model('models')
      ])
        .then(async () => {
          const img1 = await faceapi.detectAllFaces(base64ToEl(src), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
          const img2 = await faceapi.detectAllFaces(base64ToEl(ogImage), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
          const displaySize = { width: vidWidth, height: vidHeight };
          var detections = {
            detection1: faceapi.resizeResults(img1, displaySize),
            detection2: faceapi.resizeResults(img2, displaySize),
          }

          if (detections.detection1[0] && detections.detection2[0]) {
            const distance1 = faceapi.euclideanDistance(detections.detection1[0].descriptor, detections.detection2[0].descriptor);
            if (distance1 < settings.faceMatchDist) {
              setFaceLoading(false)
              document.getElementById("submit").style.display = "inline"
              setFaceStat("Same Faces")
              setTimeout(() => {
                setFaceStat("")
              }, 3000);
              var finalObj = {
                fullImg: ogImage,
                croppedImg: croppedImage,
                organization: settings.organization,
                project: settings.project,
                matching_mode: settings.matching_mode,
                client_matching: settings.client_matching,
                server_matching: settings.server_matching
              }
              const response = await fetch(settings.server_url, {
                method: settings.server_method,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalObj)
              });
              console.log(response.json(), "response");
            }
            else {
              setFaceLoading(false)
              document.getElementById("submit").style.display = "inline"
              setFaceStat("Not Same")
              setTimeout(() => {
                setFaceStat("")
              }, 3000);
            }
          }

          else {
            setFaceStat(`Take Image Again`)
            document.getElementById("submit").style.display = "inline"
            setFaceLoading(false)
            setTimeout(() => {
              setFaceStat("")
            }, 3000);

          }





        })

    }
    else {
      setFaceLoading(false)
      var finalObj = {
        fullImg: ogImage,
        croppedImg: croppedImage,
      }
      const response = await fetch(settings.server_url, {
        method: settings.server_method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalObj)
      });
      console.log(response.json(), "response");

    }
  }

  const base64ToEl = (src) => {
    var img = document.createElement("img")
    img.src = src
    return img;
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
        <Grid container spacing={3} xs={9} justify="center">
          <Grid item xs={4.5}>


            {loading ? <CircularProgress />
              :
              <div className="row" style={{ border: "7px solid red" }}><Webcam
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
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <h5>Past Result Messages</h5>
              {faceLoading ? <CircularProgress />
                : <Button id="submit" variant="contained" color="primary" onClick={onSubmit} style={{ display: "none" }}>
                  Submit
</Button>}
              <p>{faceStat}</p>

            </Paper>

          </Grid>
          <Grid id="icons-side" item xs={8}>
            <Paper style={{ backgroundColor: "red", color: "white" }}>
              {(inside || close || align || bright) && <h6>Errors:</h6>}
              {inside && <p>Not Inside</p>}
              {close && <p>Not close</p>}
              {align && <p>Not Aligned</p>}
              {bright && <p>Too bright or too dark</p>}
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper>
              <img src="https://icons.iconarchive.com/icons/osullivanluke/orb-os-x/512/Image-Capture-icon.png" width="100" height="100" id="0" className="ml-1" onClick={(e) => { performChecks(e) }} />
            </Paper>
          </Grid>


        </Grid>
      </Grid>
    </div>
  )
}