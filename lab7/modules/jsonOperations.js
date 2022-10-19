import {sum} from "./mathOperations.js";

const jsonResponse = (json) => {
    let data = JSON.parse(json);
    let responseJson = {
        "comment": data.comment,
        "x_plus_y": sum(data.x, data.y),
        "concatenation": data.message + ": " + data.author.name + " " + data.author.surname,
        "length_m": data.mass.length,
    }
    return JSON.stringify(responseJson);
}

export default jsonResponse;
