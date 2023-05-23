import React from "react"
import ReactDOM from "react-dom/client"
import MediaPlayer from "./components/MediaPlayer/MediaPlayer"
import TechInfo from "./components/TechInfo/TechInfo"

ReactDOM.createRoot(document.querySelector(".head__media")).render(
    // <React.StrictMode>
		  <MediaPlayer />
    // </React.StrictMode>, 
)

ReactDOM.createRoot(document.querySelector(".body__info")).render(
    // <React.StrictMode>
		  <TechInfo />
    // </React.StrictMode>,
)
