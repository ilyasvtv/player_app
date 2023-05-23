import { useEffect, useRef, useState } from "react";
import MediaControl from "../MediaControl/MediaControl";

const Media = ({ sourceLink, returnButtonClick, currentPlay, setCurrentPlay }) => {
	const [typeOfMedia, setTypeOfMedia] = useState(null);
	const [decodedData, setDecodedData] = useState(null);
	const [onPause, setOnPause] = useState(true);
	const [speedValue, setSpeedValue] = useState(1);
	const [mediaProgress, setMediaProgress] = useState(0);
	const [currentTime, setCurrentTime] = useState("00:00");
	//start Web Audio API
	const [analyser, setAnalyzer] = useState(null);
	const [panner, setPanner] = useState(null);
	const [volume, setVolume] = useState(null);

	const [pannerValue, setPannerValue] = useState(0);
	const [soundVolume, setSoundVolume] = useState(0.5);
	//end Web Audio API
	
	const mediaRef = useRef(null);
	const timerID = useRef(null);
	const intervalID = useRef(null);

	//init
	useEffect(() => {
	const audioContext = new AudioContext();
		
	const regexpRadio = /fm|stream|radio/;
	const regexpVideo = /mp4|webm/;
		
	if (!regexpRadio.exec(sourceLink)) {
		const type = regexpVideo.exec(sourceLink) ? "video" : "audio";
		setTypeOfMedia(type);
			//get data of the audio for further creating waveforms
			//also we can use buffer below to play audio, but it will be ignore <audio> tag if we will do this
			fetch(sourceLink)
				.then(response => response.arrayBuffer())
				.then(audioData => audioContext.decodeAudioData(audioData))
				.then(audioBuffer => {
					const dataArray = [];
					const NUM_CHANNELS = 1;
					const duration = audioBuffer.duration;
					const samplesPerInterval = Math.round(audioBuffer.sampleRate);
					for (let channel = 0; channel < NUM_CHANNELS; channel++) {
						//maybe, the better way to use both channels, then calculate data with another way to get properly values of decoding, idk
						const channelData = audioBuffer.getChannelData(channel);
						const numIntervals = Math.ceil(duration);
						for (let i = 0; i < numIntervals; i++) {
							const startSample = i * samplesPerInterval;
							const endSample = Math.min(startSample + samplesPerInterval, channelData.length);
							let sum = 0;
							//i don't like that we calculate 48000 values each iteration (96000 for 2 channels), i feel that there is a more tricky way to analyze data
							for (let j = startSample; j < endSample; j++) {
								sum += Math.abs(channelData[j]);
							}
							const avg = sum / (endSample - startSample);
							const adj = Math.floor(avg * 100);
							dataArray.push(adj)
						}
					}
					setDecodedData(dataArray);
				})
				.catch(error => console.error(error));
			} else {
				const BUFFER_LENGTH = 256;
				const emptyData = Array(BUFFER_LENGTH).fill(0);
				setTypeOfMedia("radio");
				setDecodedData(emptyData);
			}

		//get source of audio from <audio> / <video> tags
		const sourceNode = audioContext.createMediaElementSource(mediaRef.current);
		sourceNode.connect(audioContext.destination);

		//volume
		const gainNode = audioContext.createGain();
		gainNode.gain.value = 0.5;
		sourceNode.connect(gainNode);
		gainNode.connect(audioContext.destination);
		setVolume(gainNode);
		
		//panner
		const pannerNode = audioContext.createStereoPanner();
		sourceNode.connect(pannerNode);
		pannerNode.connect(audioContext.destination);
		setPanner(pannerNode);

		//analyzer for creating waves of radio
		const analyserNode = audioContext.createAnalyser();
		analyserNode.fftSize = 2048;
		sourceNode.connect(analyserNode);
		analyserNode.connect(audioContext.destination);
		setAnalyzer(analyserNode);

		return () => {
			sourceNode.disconnect(audioContext.destination);
			audioContext.close();
		};
	}, [])

	//click button
	const mediaControl = () => {
		if (typeOfMedia !== "radio" && !decodedData) return;
		setOnPause(prev => !prev);
	}

	//control with range
	const handleMediaRange = (value) => {
		if (!mediaRef.current) return;
		if (!decodedData) return;
		clearInterval(timerID.current);
		mediaRef.current.pause();
		mediaRef.current.currentTime = value / 100 * mediaRef.current.duration;
		setMediaProgress(value)
		timerID.current = setTimeout(() => {
			if (onPause) return;
			mediaRef.current.play();
		}, 100)
	}
 
	//timer
	useEffect(() => {
		if (!mediaRef.current) return;
		if (typeOfMedia === "radio") return;
		if (!decodedData) return;
		intervalID.current = setInterval(() => {
			const currentTime = mediaRef.current.currentTime;
			const duration = mediaRef.current.duration;
			const progressPercent = (currentTime / duration) * 100;
			let minutes = String(Math.floor(currentTime / 60));
			let seconds = String(Math.floor(currentTime % 60));
			if (seconds.length < 2) seconds = "0" + seconds;
			if (minutes.length < 2) minutes = "0" + minutes;
			const time = `${minutes} : ${seconds}`;
			setMediaProgress(progressPercent);
			setCurrentTime(time);
		}, 1000 / speedValue)

		return () => {
			clearInterval(intervalID.current)
		}
	}, [decodedData, speedValue])

	//handle double source media
	useEffect(() => {
		if (!currentPlay) setOnPause(true);
	}, [currentPlay])

	//play/pause control
	useEffect(() => {
		if (!mediaRef.current) return;
		if (!typeOfMedia) return;
		if (typeOfMedia !== "radio" && !decodedData) return;
		if (!onPause) {
			if (!currentPlay) setCurrentPlay(prev => !prev)
			mediaRef.current.play();
		}
		else mediaRef.current.pause();
	}, [onPause])

	//volume control
	useEffect(() => {
		if (!mediaRef.current) return;
		if (!volume) return;
		volume.gain.value = soundVolume;
		mediaRef.current.volume = soundVolume;
	}, [soundVolume])

	//control speed
	useEffect(() => {
		if (!mediaRef.current) return;
		if (!decodedData) return;
		mediaRef.current.playbackRate = speedValue;
	}, [speedValue])

	//panner control
	useEffect(() => {
		if (!panner) return;
		panner.pan.setValueAtTime(pannerValue, 0);
	}, [pannerValue])

	//keyboard control
	useEffect(() => {
		if (!typeOfMedia) return;
		if (typeOfMedia !== "radio" && !decodedData) return;
		const keyPressing = (e) => {
			switch(e.code) {
				case "KeyE":
					setPannerValue(prev => {
						if (prev == 1) return prev;
						const value = (Number(prev) + 0.1).toFixed(1);
						return value
					})
					break;
				case "KeyQ":
					setPannerValue(prev => {
						if (prev == -1) return prev;
						const value = (prev - 0.1).toFixed(1);
						return value 
					})
					break;
				case "KeyD":
					setSoundVolume(prev => {
						if(prev == 1) return prev;
						const value = (Number(prev) + 0.05).toFixed(2);
						return value 
					})
					break;
				case "KeyA":
					setSoundVolume(prev => {
						if (prev == 0) return prev;
						const value = (prev - 0.05).toFixed(2);
						return value 
					})
					break;
				case "KeyP":
					setOnPause(prev => !prev)
					break;	
				default:
					break;
			}
		}
		addEventListener("keydown", keyPressing);
		return () => removeEventListener("keydown", keyPressing)
	}, [typeOfMedia, decodedData])

	return (
		<>
			<div className="media-container">
				{!!returnButtonClick &&
					<button onClick={() => returnButtonClick()} className="back-btn"> ← Back </button>
				}
				<div className="loader" style={{display: decodedData ? "none" : "block"}}>
					<div className="running-line"></div>
					<div className="running-line"></div>
					<div className="running-line"></div>
				</div>
				{typeOfMedia === "video" &&
					<video
						ref={mediaRef}
						crossOrigin="anonymous"
						className="video-player"
						onEnded={() => setOnPause(true)} 
						width="100%"
						style={{display: decodedData ? "block" : "none"}} 
						src={sourceLink}>
					</video>
				}
				{typeOfMedia !== "video" &&
					<audio
						ref={mediaRef}
						crossOrigin="anonymous"
						onEnded={() => setOnPause(true)}
						style={{display: decodedData ? "block" : "none"}}  
						src={sourceLink}>
					</audio>
				}
				<MediaControl
					handleMediaRange={handleMediaRange}
					handleSoundRange={setSoundVolume}
					mediaControl={mediaControl}
					handlePannerRange={setPannerValue}
					changeSpeed={setSpeedValue}
					onPause={onPause}
					mediaProgress={mediaProgress}
					soundVolume={soundVolume}
					pannerValue={pannerValue}
					currentTime={currentTime}
					speedValue={speedValue}
					decodedData={decodedData}
					analyser={analyser}
					typeOfSource={typeOfMedia}
				/>
			</div>
		</>
	)
}

export default Media
