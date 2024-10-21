import DataURIParser from "datauri/parser.js";
import path from "path";

const getUrl = (file) => {
    if (!file || !file.originalname || !file.buffer) {
        throw new Error("Invalid file object provided");
    }
    
    const parser = new DataURIParser();
    const extname = path.extname(file.originalname).toLowerCase(); 
    return parser.format(extname, file.buffer);
}

export default getUrl;