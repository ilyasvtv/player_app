import { useEffect, useState } from "react";
import Media from "../Media/Media";

const MediaPlayer = () => {
	const [inputValue, setInputValue] = useState("");
	const [sourceLink, setSourceLink] = useState("");

	const [error, setErrorStatus] = useState(false);
	const [errorMesage, setErrorMesage] = useState("Error!");
	
	const [historyStatus, setHistoryStatus] = useState(false);
	const [historyData, setHistoryData] = useState([]);

	const [possibilityClose, setPossibilityClose] = useState(true);

	const [currentPlay, setCurrentPlay] = useState(false);

	//init
	useEffect(() => {
		//history managment
		const data = [];
		if (sourceLink.length > 1) localStorage.setItem(`${localStorage.length}`, sourceLink);
		for (let i = 0; i < localStorage.length; i++) {
			data.unshift(localStorage.getItem(`${i}`));
		}
		const MAX_LENGTH = 4;
		if (data.length > MAX_LENGTH) {
			data.splice(data.length - 1);
			localStorage.clear();
			for(let i = 0; i < data.length; i++) {
				localStorage.setItem(`${data.length - 1 - i}`, data[i]);
			}
		}
		setHistoryData(data);
	}, [sourceLink])
	
	useEffect(() => {
		localStorage.clear();
	}, [])

	const handleForm = (e) => {
		e.preventDefault();

		//error part
		const regexp = /fm|stream|media|mp3|mp4|webm/;
		if (!regexp.exec(inputValue)) {
			setInputValue("");
			setErrorStatus(true);
			setErrorMesage("Error message here");
			return;
		}
		
		//success part
		setSourceLink(inputValue);
		setErrorStatus(false);
		setInputValue("")
	}

	const handleInput = (value) => {
		setInputValue(value);
		setPossibilityClose(true);
		if (value.length > 0) setHistoryStatus(false);
		else if(historyData.length > 0 && value.length === 0) setHistoryStatus(true);
	}

	const handleFocus = () => {
		if (inputValue === "" && historyData.length > 0) setHistoryStatus(true);
	}

	const returnButtonClick = () => {
		setSourceLink("");
	}

	const clickHistoryLink = (link) => {
		setInputValue(link);
		setHistoryStatus(false); 
	}

	const handleBlur = () => {
		possibilityClose &&	setHistoryStatus(false);
	}

	const mouseEnter = (e) => {
		setPossibilityClose(false);
		e.target.classList.add("active");
	}

	const mouseLeave = (e) => {
		setPossibilityClose(true);
		e.target.classList.remove("active");
	}

	return (
		<>
			{sourceLink !== "" &&
				<>
					<Media sourceLink={sourceLink} returnButtonClick={returnButtonClick} currentPlay={currentPlay} setCurrentPlay={setCurrentPlay}/>
					<Media sourceLink={sourceLink} currentPlay={!currentPlay} setCurrentPlay={setCurrentPlay}/>
				</>
			}

			{sourceLink === "" && 
				<>
					<div className="media-title">Insert the link</div>
					<form className="wrap" onSubmit={(e) => handleForm(e)}>
					<input  onChange={(e) => handleInput(e.target.value)} 
							onBlur={() => handleBlur()} 
							onFocus={() => handleFocus()} 
							type="text" 
							className="link-input" 
							placeholder="https://" 
							value={inputValue} 
					/>
					{historyStatus &&
						<div className="history">
							{historyData.map((el, i) => {
								return  <div onMouseEnter={(e) => mouseEnter(e)} 
											 onMouseLeave={(e) => mouseLeave(e)}
											 onClick={() => clickHistoryLink(el)} 
											 className="history__item"
											 key={i}>
											 {el}
										</div>
							})}
						</div>
					}
					{error && 
						<div className="error-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#C6A827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								<path d="M12 8V12" stroke="#C6A827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								<circle cx="12" cy="16" r="0.5" fill="black" stroke="#C6A827"/>
							</svg>
						</div>
					}
					<button className="square-btn">
						<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fillRule="evenodd" clipRule="evenodd" d="M67.7197 48.6943C68.0934 48.3068 68.0934 47.693 67.7197 47.3056L51.7197 30.7216L51.0253 30.002L49.586 31.3906L50.2803 32.1103L64.6457 46.9999H29H28V48.9999H29H64.6457L50.2803 63.8896L49.586 64.6093L51.0253 65.9979L51.7197 65.2782L67.7197 48.6943Z" fill="#1B191C"/>
						</svg>									
					</button>
					</form>
				</>
			}
			{error &&
				<>
					<div className="error-popup-message">
						<div className="error-popup-message__image">
							<svg width="3" height="16" viewBox="0 0 3 16" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M2.96002 14.008L0.488022 14.008L0.488022 16L2.96002 16L2.96002 14.008ZM2.69602 0.039999L0.776023 0.0399988L0.776022 12.04L2.69602 12.04L2.69602 0.039999Z" fill="black"/>
							</svg>
						</div>
						<div className="error-popup-message__problem">
							<div className="warning">Warning</div>
							<div className="problem">{errorMesage}</div>
						</div>
						<button onClick={() => setErrorStatus(false)} className="error-popup-message__close">
							<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
								<g opacity="0.8">
									<path d="M25 7L7 25" stroke="#767577" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
									<path d="M7 7L25 25" stroke="#767577" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
								</g>
							</svg>
						</button>
					</div>
					<div className="error-message">{errorMesage}</div>
				</>
			}
		</>
	)
}

export default MediaPlayer
