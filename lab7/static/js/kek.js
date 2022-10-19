const getJson = async (url) => {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const response = await fetch(url, requestOptions);
    document.getElementById('data_json').innerHTML = await response.text();
}
const getXml = async (url) => {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/xml'
        }
    }
    const response = await fetch(url, requestOptions);
    document.getElementById('data_xml').innerHTML = await response.text();
}
getJson("json/lol.json");
getXml("xml/lol.xml");