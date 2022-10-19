import {parseString} from "xml2js";
import xmlbuilder from "xmlbuilder";

const xmlResponse = (xml) => {
    let response;
    parseString(xml, {trim: true}, (err, result) => {
        if (err) {
            response = err;
        } else {
            let xSum = 0;
            result.request.x.forEach((p) => {
                xSum += parseInt(p.$.value);
            });
            let mSum = '';
            result.request.m.forEach((p) => {
                mSum += p.$.value;
            });
            let xmlObj = xmlbuilder.create('response').att('id', result.request.$.id)
                .ele('sum').att('element', 'x').att('result', xSum).up()
                .ele('concat').att('element', 'm').att('result', mSum)
                .end({pretty: true});
            response = xmlObj.toString();
        }
    });
    return response;
}

export default xmlResponse;