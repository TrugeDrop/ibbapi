// Source: https://github.com/hakanatak/dataibbgovtr/blob/dataibbgovtr/routes/filo.js
// Bazı düzenlemeler yapılmıştır.

let express = require('express');
let filo = express.Router();
let soap = require('soap');
let url = 'https://api.ibb.gov.tr/iett/FiloDurum/SeferGerceklesme.asmx?wsdl';
filo.get('/filo', function(req, res, next) {
    let geojson = {"type" : "FeatureCollection",
        "features" : []
    };
    let args = {};
    soap.createClient(url, function(err, client) {
        client.GetFiloAracKonum_json(args, function(err, result) {
            if(!result.GetFiloAracKonum_jsonResult) return;
            
            result = JSON.parse(result.GetFiloAracKonum_jsonResult);
                result.forEach(function (e,i) {
                    if(req.query.KapiNo && req.query.KapiNo != e.KapiNo) return;
                    
                    enlem = JSON.parse(e.Enlem.replace(" ", ""));
                    boylam = JSON.parse(e.Boylam.replace(" ", ""));
                    geojson.features.push({
                        "type": "Feature",
                        "properties": {
                            "Operator":e.Operator,
                            "Garaj":e.Garaj,
                            "KapiNo":e.KapiNo,
                             "Saat":e.Saat,
                             "Boylam":e.Boylam,
                              "Enlem":e.Enlem,
                               "hiz":e.hiz,
                              "Plaka":e.Plaka
                        },
                        "geometry": {
                            "type":"Point",
                            "coordinates": [boylam, enlem]
                        }
                    });
                });
            res.send(geojson);
        });
    });
});
let jsonCache;
generateGeojson = (function (geojson) {
    jsonCache = geojson;
    res.send(geojson);
});
module.exports = filo;