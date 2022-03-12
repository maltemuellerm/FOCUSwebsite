var currentTime = new Date();
currentTime.setUTCHours(14, 0, 0, 0);
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
    zoom: 4,
//    crs: L.CRS.EPSG4326, 
    fullscreenControl: true,
    timeDimension: true,
    timeDimensionControl: true,
    timeDimensionOptions: {
        timeInterval: "2018-09-01T14:00:00.000Z/"  + endDate.toISOString(),
        //timeInterval: "P24M/" + endDate.toISOString(),
        period: "P1D",
        //period: "PT1H",
        //currentTime: currentTime.getTime()
    },
    center: [79.5, 10.0]
});

var aromeWMS = "http://thredds.met.no/thredds/catalog/aromearcticlatest/catalog.html?dataset=aromearcticlatest/arome_arctic_extracted_2_5km_latest.nc";
var sentinelWMS = "http://nbswms.met.no/thredds/wms/NBS/S1A/2018/11/19/EW/S1A_EW_GRDM_1SDH_20181119T074611_20181119T074721_024654_02B588_0805.nc";
var arcWMS   = "http://nrt.cmems-du.eu/thredds/wms/dataset-topaz4-arc-1hr-myoceanv2-be";
var icetacWMS   = "http://nrt.cmems-du.eu/thredds/wms/METNO-ARC-SEAICE_CONC-L4-NRT-OBS";
var sariceWMS ="http://thredds.met.no/thredds/wms/sea_ice/SIW-METNO-ARC-SEAICE_HR-OBS/ice_conc_svalbard_aggregated";





var ARCconcLayer =  L.tileLayer.wms(arcWMS, {
    layers: 'fice',
    format: 'image/png',
    transparent: true,
    colorscalerange: '0.,1',
    abovemaxcolor: "extend",
    belowmincolor: "extend",
    numcolorbands: 100,
    styles: 'boxfill/occam'
});


var proxy = 'server/proxy.php';

var imageUrl = './img/s1_mosaic_20181129.png', //temperatureMapDefault.png
    imageBounds = [[70, -35], [90, 40]]; // [[ymin, xmin][ymax, xmax]]
var SARLayer = L.imageOverlay(imageUrl, imageBounds);

var ARCedgeTimeLayer = L.timeDimension.layer.wms(
      L.tileLayer.wms(arcWMS, {
      layers: 'fice',
      format: 'image/png',
      transparent: true,
      colorscalerange: '0.14,0.15',
      numcontours: 1,   
      styles: 'contour/rainbow' }), {
    proxy: proxy,
    updateTimeDimension: true,
});


var SARedgeTimeLayer = L.timeDimension.layer.wms(
      L.tileLayer.wms(sariceWMS, {
      layers: 'ice_concentration',
      format: 'image/png',
      transparent: true,
      colorscalerange: '14,15',
      numcontours: 1,
      styles: 'contour/occam_pastel-30' }), {
    proxy: proxy,
    updateTimeDimension: true
});

var SARconcTimeLayer = L.timeDimension.layer.wms(
      L.tileLayer.wms(sariceWMS, {
      layers: 'ice_concentration',
      format: 'image/png',
      transparent: true,
      colorscalerange: '0,100',
      numcontours: 1,
      styles: 'boxfill/occam' }), {
    proxy: proxy,
    updateTimeDimension: true
});
    

var satTimeLayer = L.timeDimension.layer.wms(
      L.tileLayer.wms(sentinelWMS, {
      layers: 'amplitude_hh,amplitude_hv',
      colorscalerange: '1,100',
      format: 'image/png',
      opacity : 0.8,
      transparent: true }), {
    proxy: proxy,
    updateTimeDimension: false,
});

var overlayMaps = {
    "Sea Ice  - sea ice edge": SARLayer,
    "Sea Ice Chart - [0 100]": SARconcTimeLayer,
    "Forecasting System - TOPAZ4 - sea-ice edge": ARCedgeTimeLayer,
    "Sea Ice Chart - sea ice edge": SARedgeTimeLayer
};

var testLegend = L.control({
    position: 'bottomleft'
});
testLegend.onAdd = function(map) {
    var src = sariceWMS + "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=ice_concentration&PALETTE=occam&numcolorbands=10&colorscalerange=0,100";
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML +=
        '<img src="' + src + '" alt="legend">';
    return div;
};
testLegend.addTo(map);


var baseLayers = getCommonBaseLayers(map); // see baselayers.js
L.control.layers(baseLayers, overlayMaps).addTo(map);
SARLayer.addTo(map);
ARCedgeTimeLayer.addTo(map);
SARedgeTimeLayer.addTo(map);

