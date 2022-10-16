// Source: https://github.com/hakanatak/dataibbgovtr/blob/dataibbgovtr/routes/filo.js
// Bazı düzenlemeler yapılmıştır.

let express = require('express');
let hat = express.Router();
let soap = require('soap');
let url = 'https://api.ibb.gov.tr/iett/FiloDurum/SeferGerceklesme.asmx?wsdl';
hat.get('/hat-takip', function(req, res, next) {
    let geojson = {"type" : "FeatureCollection",
        "features" : []
    };
    
    if(!req.query.HatKodu) res.sendStatus(500);
    
    let args = {HatKodu: req.query.HatKodu};
    soap.createClient(url, function(err, client) {
        client.GetHatOtoKonum_json(args, function(err, result) {
            try{
                result = JSON.parse(result.GetHatOtoKonum_jsonResult);
            }catch (e){
                return res.sendStatus(404);
            }
                result.forEach(function (e,i) {
                    enlem = JSON.parse(e.enlem.replace(" ", ""));
                    boylam = JSON.parse(e.boylam.replace(" ", ""));
                    geojson.features.push({
                        "type": "Feature",
                        "properties": {
                            "hatkodu":e.hatkodu,
                            "Garaj":e.Garaj,
                            "guzergahkodu":e.guzergahkodu,
                            "hatad":e.hatad,
                            "yon": e.yon,
                            "Boylam":e.Boylam,
                            "Enlem":e.Enlem,
                            "son_konum_zamani":e.son_konum_zamani,
                            "yakinDurakKodu":e.yakinDurakKodu
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
module.exports = hat;