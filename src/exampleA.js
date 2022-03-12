var currentTime = new Date();
currentTime.setUTCHours(0, 0, 0, 0);
var endDate = new Date(currentTime.getTime());

var map = L.map('map', {
    zoom: 4,
    fullscreenControl: true,
    timeDimension: true,
    timeDimensionControl: true,
    timeDimensionOptions: {
        timeInterval: "2016-01-01T00:00:00.000Z/2018-05-23T00:00:00.000Z",
        period: "P1D",
        currentTime: currentTime.getTime()
    },

    center: [78.0, 10.0]
});

var avisoWMS = "http://nrt.cmems-du.eu/thredds/wms/dataset-armor-3d-nrt-weekly";
var avisoWMS = "http://nrt.cmems-du.eu/thredds/wms/dataset-duacs-nrt-global-merged-allsat-phy-l4";
var arcWMS   = "http://thredds.met.no/thredds/wms/topaz/dataset-topaz4-arc-1hr-myoceanv2-be";
var icetacWMS   = "http://nrt.cmems-du.eu/thredds/wms/METNO-ARC-SEAICE_CONC-L4-NRT-OBS";
var heigthLayer = L.tileLayer.wms(avisoWMS, {
//    layers: 'geostrophic_sea_water_velocity',
    layers: 'surface_geostrophic_sea_water_velocity_assuming_sea_level_for_geoid',
    format: 'image/png',
    transparent: true,
    colorscalerange: '-0.2,0.2',
    abovemaxcolor: "extend",
    belowmincolor: "extend",
    numcolorbands: 100,    
    styles: 'boxfill/rainbow'
});
var icechartLayer =  L.tileLayer.wms(arcWMS, {
    layers: 'fice',
    format: 'image/png',
    transparent: true,
    colorscalerange: '0.,1',
    abovemaxcolor: "extend",
    belowmincolor: "extend",
    numcolorbands: 100,
    styles: 'boxfill/occam'
});

var heigthContourLayer = L.tileLayer.wms(arcWMS, {
    layers: 'fice',
    format: 'image/png',
    transparent: true,
    colorscalerange: '0.14,0.15',
    numcontours: 1,    
    styles: 'contour/rainbow'
});


var velocityLayer = L.nonTiledLayer.wms(avisoWMS, {
//    layers: 'geostrophic_sea_water_velocity',
    layers: 'surface_geostrophic_sea_water_velocity_assuming_sea_level_for_geoid',
    format: 'image/png',
    transparent: true,
    colorscalerange: '-20,100',
    markerscale: 10,
    markerspacing: 8,
    abovemaxcolor: "extend",
    belowmincolor: "extend",
    numcolorbands: 100,    
    styles: 'prettyvec/greyscale' //linevec/alg'
});

var proxy = 'server/proxy.php';
var heightTimeLayer = L.timeDimension.layer.wms(heigthLayer, {
    proxy: proxy,
    updateTimeDimension: true,
});

var icechartTimeLayer = L.timeDimension.layer.wms(icechartLayer, {
    proxy: proxy,
    updateTimeDimension: true,
});

var heightContourTimeLayer = L.timeDimension.layer.wms(heigthContourLayer, {
    proxy: proxy,
    updateTimeDimension: false,
});
var velocityTimeLayer = L.timeDimension.layer.wms(velocityLayer, {
    proxy: proxy,
    updateTimeDimension: true,
});

var overlayMaps = {
    "Surface Geostrophic Velocity Contour": heightTimeLayer,
    "Sea Ice Concentration Contour": icechartTimeLayer,
    "Surface Geostrophic Velocity Vector": velocityTimeLayer,
    "Sea Ice Concentration Contourline 15%": heightContourTimeLayer
};

// Legends
//var heigthLegend = L.control({
//    position: 'bottomright'
//});
//heigthLegend.onAdd = function(map) {
//    var src = avisoWMS + "?REQUEST=GetLegendGraphic&LAYER=geostrophic_sea_water_velocity&PALETTE=rainbow";
//    var div = L.DomUtil.create('div', 'info legend');
//    div.innerHTML +=
//        '<img src="' + src + '" alt="legend">';
//    return div;
//};

//var velocityLegend = L.control({
//    position: 'bottomright'
//});
//velocityLegend.onAdd = function(map) {
//    var div = L.DomUtil.create('div', 'info legend');
//    div.innerHTML += '<img src="img/black-arrow.png" /> Surface geostrophic<br/>sea water velocity';
//    return div;
//};


//map.on('overlayadd', function(eventLayer) {
//        heigthLegend.addTo(this);
//});

//map.on('overlayremove', function(eventLayer) {
//    if (eventLayer.name == 'AVISO - Sea surface height above geoid') {
//        map.removeControl(heigthLegend);
//    } else if (eventLayer.name == 'AVISO - Surface geostrophic sea water velocity') {
//        map.removeControl(velocityLegend);
//    }     
//});

var baseLayers = getCommonBaseLayers(map); // see baselayers.js
L.control.layers(baseLayers, overlayMaps).addTo(map);

heightTimeLayer.addTo(map);
heightContourTimeLayer.addTo(map);
velocityTimeLayer.addTo(map);
icechartTimeLayer.addTo(map);
