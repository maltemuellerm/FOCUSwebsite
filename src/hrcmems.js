var currentTime = new Date();
currentTime.setUTCHours(0, 0, 0, 0);
var endDate = new Date(currentTime.getTime());
L.TimeDimension.Util.addTimeDuration(endDate, "P5D", true);
var crs = new L.Proj.CRS('EPSG:5938','+proj=stere +lat_0=90 +lat_ts=90 +lon_0=-33 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m +no_defs',
  {
    resolutions: [8192, 4096, 2048],
  }
);
var crsm = new L.Proj.CRS('EPSG:4326','+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
  {
    resolutions: [8192, 4096, 2048],
    origin: [0,0]
  }
);

var map = L.map('map', {
    zoom: 3,
    crs: L.CRS.EPSG4326, 
    fullscreenControl: true,
    timeDimension: true,
    timeDimensionControl: true,
    timeDimensionOptions: {
        //timeInterval: "2016-01-01T00:00:00.000Z/"  + currentTime.toISOString(), 
        timeInterval: "P24M/" + endDate.toISOString(),
        //period: "P1D",
        period: "PT1H",
        currentTime: currentTime.getTime()
    },

    center: [79.5, 10.0]
});

var avisoWMS = "http://nrt.cmems-du.eu/thredds/wms/dataset-duacs-nrt-global-merged-allsat-phy-l4";
var aromeWMS = "http://thredds.met.no/thredds/catalog/aromearcticlatest/catalog.html?dataset=aromearcticlatest/arome_arctic_extracted_2_5km_latest.nc";
var sentinelWMS = "http://nbswms.met.no/thredds/wms/NBS/S1A/2018/11/19/EW/S1A_EW_GRDM_1SDH_20181119T074611_20181119T074721_024654_02B588_0805.nc";
var arcWMS   = "http://nrt.cmems-du.eu/thredds/wms/dataset-topaz4-arc-1hr-myoceanv2-be";
var waveWMS  = "http://nrt.cmems-du.eu/thredds/wms/dataset-wam-arctic-1hr6km-be";
var icetacWMS   = "http://nrt.cmems-du.eu/thredds/wms/METNO-ARC-SEAICE_CONC-L4-NRT-OBS";
var waveLayer = L.tileLayer.wms(waveWMS, {
    layers: 'VHM0',
    format: 'image/png',
    transparent: true,
    colorscalerange: '0,6',
    abovemaxcolor: "extend",
    belowmincolor: "extend",
    numcolorbands: 100,    
    styles: 'boxfill/rainbow'
});
var satLayer = L.tileLayer.wms(sentinelWMS, {
    layers: 'amplitude_hh,amplitude_hv',
    colorscalerange: '0,0.5',
    format: 'image/png',
    abovemaxcolor: "extend",
    belowmincolor: "extend",
    transparent: true
});
var heigthLayer = L.tileLayer.wms(avisoWMS, {
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
var waveTimeLayer = L.timeDimension.layer.wms(waveLayer, {
    proxy: proxy,
    updateTimeDimension: true,
});
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
    updateTimeDimension: true,
});
var velocityTimeLayer = L.timeDimension.layer.wms(velocityLayer, {
    proxy: proxy,
    updateTimeDimension: true,
});
var satTimeLayer = L.timeDimension.layer.wms(satLayer, {
    proxy: proxy,
    updateTimeDimension: false,
});

var overlayMaps = {
    "Sentinel": satTimeLayer,
    "Significant wave height [0 - 6 meter]": waveTimeLayer,
    "Surface geostrophic velocity [Contour; -0.2 - 0.2 meter]": heightTimeLayer,
    "Surface Geostrophic Velocity [Vector]": velocityTimeLayer,
    "Sea ice concentration [Contour; 0 to 100%]": icechartTimeLayer,
    "Sea ice concentration [line 15%]": heightContourTimeLayer
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
waveTimeLayer.addTo(map);
heightContourTimeLayer.addTo(map);
satTimeLayer.addTo(map);
//icechartTimeLayer.addTo(map);
