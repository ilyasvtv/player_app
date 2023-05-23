import { useEffect, useRef, useState } from "react"
import "./MediaControl.sass"

const speedSettings = [0.5, 1, 1.5];

const MediaControl = (
    {
        onPause, 
        mediaProgress, 
        soundVolume, 
        handleMediaRange, 
        handleSoundRange,
        mediaControl, 
        currentTime, 
        changeSpeed,
        typeOfSource, 
        handlePannerRange, 
        pannerValue, 
        decodedData, 
        analyser
    }) => {

    const [pannerValuePosition, setPannerValuePosition] = useState("45px");
    const [speedSettingStatus, setSpeedSettingStatus] = useState(false);

    const pannerRef = useRef(null);
    const canvasRef = useRef(null);
    const timerRadioID = useRef(null);

    //adj and handl panner
    useEffect(() => {
        if (!pannerRef.current) return;
        if (!decodedData) return;
        const PANNER_HEIGHT = 16;
        const percentage = (Number(pannerValue) + 1) / 2;
        const pannerWidth = pannerRef.current.offsetWidth - PANNER_HEIGHT;
        const calcPos = Math.round(percentage *  pannerWidth);
        const newPos = calcPos - (PANNER_HEIGHT / 2) + "px";
        setPannerValuePosition(newPos);
    }, [pannerValue])

    //draw waves
    const draw = (data, color, length, refreshCanvas) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const posDif = canvas.width / data.length;
        const WIDTH_OF_RECT = Math.floor(posDif) - 1;
        ctx.fillStyle = color;
        if (refreshCanvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < length; i++) {
            let size;
            if (typeOfSource !== "radio") size = Math.floor(data[i] / (Math.max(...data) + 1) * canvas.height) - 25;
            else size = Math.abs((data[i] / 2 - canvas.height));
            size = size <= 0 ? 1 : size;
            ctx.fillRect(i * posDif, canvas.height / 2 - size / 2, WIDTH_OF_RECT, size);
        }
    }

    //radio waves and first draw
    useEffect(() => {
        if (!decodedData) return;
        draw(decodedData, "#fff", decodedData.length, true);
        if (typeOfSource === "radio") {
            const BUFFER_LENGTH = 256;
            const dataArray = new Uint8Array(BUFFER_LENGTH);
            timerRadioID.current = setInterval(() => {
                analyser.getByteTimeDomainData(dataArray);
                draw(dataArray, "#fff", decodedData.length, true)
            }, 30)
        }

        return () => {
            clearInterval(timerRadioID.current)
        }
    }, [decodedData])

    //paint played interval of audio
    useEffect(() => {
        if (typeOfSource === "radio") return;
        if (!decodedData) return;
        draw(decodedData, "#fff", decodedData.length, true);
        const currentTime = Math.ceil(mediaProgress / 100 * decodedData.length);
        draw(decodedData, "#C6A827", currentTime, false);
    }, [onPause, mediaProgress])

    //speed setting
    const speedControl = (value) => {
        if (!decodedData) return;
        setSpeedSettingStatus(false)
        changeSpeed(value);
    }

    return (
        <>
            <div className={onPause ? "media-control" : "media-control animated"} style={{display: decodedData ? "flex" : "none"}}>
				<div className="main-wrap">
                    <button className="media-control__button" onClick={() => mediaControl()}>
                        {onPause &&
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 40V0H4.34286L40 18.7952V20.9639L4.34286 40H0Z" fill="white"/>
                            </svg>
                        }
                        {!onPause &&
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" width="4" height="40" fill="white"/>
                                <rect x="32" width="4" height="40" fill="white"/>
                            </svg>
                        }
                    </button>
                    {typeOfSource !== "radio" &&
                        <input 
                            className="media-control__drag"
                            type="range" 
                            value={mediaProgress}
                            min={0}
                            step={0.1} 
                            max={100}
                            onChange={(e) => handleMediaRange(e.target.value)}
                        />
                    }
                    <canvas className="media-control__canvas" ref={canvasRef} width={528} height={62}></canvas>
                    <div className="media-control__settings">
                        <div className="media-control__time">{currentTime}</div>
                        <input 
                            className="media-control__sound-drag" 
                            type="range" 
                            value={soundVolume}
                            min={0} 
                            step={0.01} 
                            max={1} 
                            onChange={(e) => handleSoundRange(e.target.value)}
                            style={{background: `linear-gradient(to right, #000 0%, #000 ${soundVolume / 1 * 100}%, #fff ${soundVolume / 1 * 100}%, #fff 100%)`}}
                        />
                    </div>
                </div>
                <div className="sub-wrap">
                    <button className="sub-wrap__settings-btn" onClick={() => setSpeedSettingStatus(prev => !prev)}>
                        <svg width="4" height="18" viewBox="0 0 4 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M3.75 2.5C3.75 3.4665 2.9665 4.25 2 4.25C1.0335 4.25 0.25 3.4665 0.25 2.5C0.25 1.5335 1.0335 0.75 2 0.75C2.9665 0.75 3.75 1.5335 3.75 2.5ZM3.75 9C3.75 9.9665 2.9665 10.75 2 10.75C1.0335 10.75 0.25 9.9665 0.25 9C0.25 8.0335 1.0335 7.25 2 7.25C2.9665 7.25 3.75 8.0335 3.75 9ZM2 17.25C2.9665 17.25 3.75 16.4665 3.75 15.5C3.75 14.5335 2.9665 13.75 2 13.75C1.0335 13.75 0.25 14.5335 0.25 15.5C0.25 16.4665 1.0335 17.25 2 17.25Z" fill="#1B191C"/>
                        </svg>
                    </button>
                    <div className="sub-wrap__speed-setting" style={{display: speedSettingStatus ? "flex" : "none"}}>
                        {speedSettings.map((el, i) => {
                            return  <div className="setting" onClick={() => speedControl(el)} key={i}>
                                        x{el}
                                    </div>
                        })}
                    </div>
                    <div className="input-wrap">
                        <input className="sub-wrap__panner" ref={pannerRef} onChange={(e) => handlePannerRange(e.target.value)} min={-1} max={1} step={0.1} value={pannerValue} type="range"/>
                        <div className="sub-wrap__panner-value" style={{left: pannerValuePosition}}>{pannerValue == 0 ? "0.0" : pannerValue}</div>
                    </div>
                </div>
			</div>
        </>
    )
}

export default MediaControl