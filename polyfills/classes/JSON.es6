/*eslint quotes: 0, curly: 0, no-extra-semi: 0*/
export default class JSON {
	static parse(sJSON) {
		return eval("(" + sJSON + ")");
	}
	static stringify(vContent) {
		if (vContent instanceof Object) {
			let sOutput = "";
			if (vContent.constructor === Array) {
			for (let nId = 0; nId < vContent.length; sOutput += this.stringify(vContent[nId]) + ",", nId++);
				return `[${sOutput.substr(0, sOutput.length - 1)}]`;
			}
			if (vContent.toString !== Object.prototype.toString) {
				return `"${vContent.toString().replace(/"/g, "\\$&")}"`;
			}
			for (let sProp in vContent) {
				sOutput += `"${sProp.replace(/"/g, "\\$&")}:${this.stringify(vContent[sProp])}",`;
			}
			return `{${sOutput.substr(0, sOutput.length - 1)}}`;
		}
		return typeof vContent === "string" ? `"${vContent.replace(/"/g, "\\$&")}"` : String(vContent);
	}
}
