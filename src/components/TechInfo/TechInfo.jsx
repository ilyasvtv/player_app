import { useState } from "react"

const ownServerTags = [
	["OS + apps", "Unix/OSX + docker + nvidia-docker"],
	["Free space", "100 GB of free space"],
	["CPU", "4 cores or more (e.g. intel core i5)"],
	["Graphics hardware", "GPU: NVidia only 2Gb+"],
	["Memory", "16 GB RAM"],
]

const amazonInstanceTags = [
	["Instance", "g4dn.xlarge"],
	["Memory", "16 GB RAM"],
	["GPU", "1"],
	["Storage", "125 GB"],
	["vCPUs", "4"],
]

const TechInfo = () => {
	const [currentTags, setCurrentTag] = useState(ownServerTags);
	const [currentTagID, setCurrentTagID] = useState(0);

	const switchTag = (tag, tagID) => {
		setCurrentTag(tag);
		setCurrentTagID(tagID);
	}

	return (
		<>
			<div className="title">Technical requirements</div>
			<div className="tags">
				<div className={currentTagID === 0 ? "switch-tag active" : "switch-tag"} onClick={() => switchTag(ownServerTags, 0)}>Own server</div>
				<div className={currentTagID === 1 ? "switch-tag active" : "switch-tag"} onClick={() => switchTag(amazonInstanceTags, 1)}>Amazon Instance</div>
			</div>
			<div className="specs">
				{currentTags.map((el, i) => {
					return <div key={i} className="spec">
								<div className="name">{el[0]}</div>
								<div className="value">{el[1]}</div>
							</div>
				})}
			</div>
		</>
	)
}

export default TechInfo