/* global variables */
window.refreshLocations = true;
window.defaultZoom = 14;

/* utils */
const findClosest = (arr, num) => {
    const creds = arr.reduce((acc, val, ind) => {
        let { diff, index } = acc;
        const difference = Math.abs(val - num);
        
        if(difference < diff){
            diff = difference;
            index = ind;
        };
        
        return { diff, index };
    }, {
        diff: Infinity,
        index: -1
    });
    
    return arr[creds.index];
};

function clearLayers(){
        Object.keys(map._layers).forEach(function(key) {
            try {
                if(map._layers[key]._url) return;
                let layer = map._layers[key];
                if(layer.options.title === "Sen") return;
                layer.remove();
            } catch {
                return;
            }
        });
    };
/* utils end */

/* loader */
setTimeout(() => $('#loader').hide(), 500);

/* map */
var element = document.getElementById('map');
element.style = 'height: 100%;';
var map = L.map(element);
            
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
            
var target = L.latLng(41.015137, 28.979530);

map.setView(target, window.defaultZoom); 
/* map end */

/* find location */
function findLocation(){
        if (navigator.geolocation) {
            let {gc1, gc2} = [null, null];
            function position(mapViewI){
                navigator.geolocation.getCurrentPosition(position => {
                   window.userLocation = [position.coords.longitude, position.coords.latitude];
                    
                   if(gc1 === position.coords.longitude || gc2 === position.coords.latitude) return;
                    
                   gc1 = position.coords.longitude;
                   gc2 = position.coords.latitude;
                    
                   addToMap({
                       name: "Sen",
                       coordinates: [position.coords.longitude, position.coords.latitude],
                       mapViewI: mapViewI,
                       iconURL: "/images/marker-circle.png",
                       unique: true,
                       multipleLayer: true
                   });
                });
            };
            position(14);
            setInterval(() => position(false), 5000);
        } else {
            alert("Coğrafi konum bu tarayıcı tarafından desteklenmiyor.");
        }
};

findLocation();

/* add to map */
function addToMap(e){
    if(e.unique === true){
        Object.keys(map._layers).forEach(function(key) {
            try{
                let layer = map._layers[key];
                if(layer && layer.options.title === e.name) layer.remove();
            }catch (e){
                console.log(e);
            }
        });
    };
        
    if(e.multipleLayer !== true) clearLayers();
        
    let customIcon = {
        iconUrl: e.iconURL ? e.iconURL : "https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png",
        iconSize:[30,30]
    }
                
    let myIcon = L.icon(customIcon);

    let iconOptions = {
        title: e.name,
        draggable: false,
        icon: myIcon
    }
                
    let marker = new L.Marker([e.coordinates[1], e.coordinates[0]], iconOptions);
    marker.addTo(map);
    marker.bindPopup(e.popupBind ? e.popupBind : `<h6>${e.name}</h6>`);
        
    if(e.openPopup === true) marker.openPopup();
    if(e.mapViewI) map.setView(L.latLng(e.coordinates[1], e.coordinates[0]), e.mapViewI);
};

/* hat takip */
function hatTakip(hatKodu, callback){
        $.ajax({
            method: "GET",
            url: "/api/hat-takip",
            data: {
                HatKodu: hatKodu
            },
            success: function(result){
                let coordinates = [];
                let coors0 = [];
                
                result.features.forEach(hat => {
                   let data = hat.geometry.coordinates;
                   let userData = window.userLocation;
                   
                   coordinates.push([data[0], data[1]]);
                   coors0.push(data[0]);
                });
                
                if(result.features.length <= 0) return callback({ status: 404 });
                
                clearLayers();

                result.features.forEach(e => {
                    addToMap({
                        name: e.properties.hatkodu,
                        coordinates: e.geometry.coordinates,
                        popupBind: `<div style="display: flex!important; align-content: center; flex-direction: row; align-items: center;"><b style="font-size: 1.5rem; margin-right: 0.5rem;">${e.properties.hatkodu}</b>${e.properties.hatad}</div>${e.properties.yon}`,
                        multipleLayer: true,
                        addLayer: true,
                        mapViewI: true
                     });
               });
                
                let closest = findClosest(coors0.sort(), window.userLocation[0]);
                
                let findData = coordinates.find(function(a){
                    return closest == a[0];  
                });
                
                map.setView(L.latLng(findData[1], findData[0]), window.defaultZoom);
                
                return callback({ status: 200 });
           },
           error: function(){
               return callback({ status: 404 });
           }
       });
    };
    
    function searchFunc(event){
        event.preventDefault();
        $('#search').attr("disabled", true);
        $('#loader').show();
        
        const searchValue = event.target[0].value;
        
        function hatTakipFunc(refresh){
            hatTakip(searchValue, function(data){
               if(data.status !== 200) return alert("Sonuç bulunamadı!");
                
                if(!refresh && window.screen.width < 580) bottomMenu();
                
                $('#search').attr("disabled", false);
                $('#loader').hide();
            });
        };
        
        hatTakipFunc(false);
        
        if(window.hatTakipInterval) clearInterval(window.hatTakipInterval);
        
        if(!window.refreshLocations) return;
        
        window.hatTakipInterval = setInterval(() => {
            if(!window.refreshLocations) return;
               
            hatTakipFunc(true);
        }, 5000);
    };

/* settings */
$('#refreshLocationsCheck').on("change", function(e){
    window.refreshLocations = e.target.checked;
});

$('#setDefaultZoom').on("change", function(e){
    window.defaultZoom = Number(e.target.value);
});

/* bottom menu */
function bottomMenu(){
    document.getElementById("menu").classList.toggle("d-block");
    document.getElementById("map-content").classList.toggle("d-none");
    document.getElementById("findLocationBtn").classList.toggle("d-none");
};

/*function kapiNoTakip(kapiNo, callback){
        $.ajax({
            method: "GET",
            url: "/api/filo",
            data: {
                KapiNo: kapiNo
            },
            success: function(result){
                const arac = result.features[0];
                
                if(!arac) return callback({ status: 404 });
                
                clearLayers();
                    
                addToMap({
                    name: arac.properties.KapiNo,
                    coordinates: arac.geometry.coordinates,
                    mapViewI: 13,
                    addLayer: true
                });
                
                return callback({ status: 200 });
            },
            error: function(){
                return callback({ status: 404 });
            }
        });
    };*/