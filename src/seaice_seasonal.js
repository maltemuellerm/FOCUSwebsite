var startDate = new Date();
var currentTime = new Date();
currentTime.setUTCHours(0, 0, 0, 0);
var startDate = new Date(currentTime.getTime());
var endDate = new Date(currentTime.getTime());
L.TimeDimension.Util.addTimeDuration(endDate, "P6M", true);
startDate.setUTCHours(0, 0, 0, 0);

var map = L.map('map', {
    zoom: 4,
    fullscreenControl: true,
    timeDimensionControl: true,
    timeDimensionControlOptions: {
        position: 'bottomleft',
        playerOptions: {
            transitionTime: 1000,
        }
    },
    timeDimensionOptions: {
        timeInterval: startDate.toISOString() + "/" + endDate.toISOString(),
        period: "P1D",
    },
    timeDimension: true,
    center: [79, 10.5]
});

var seas5WMS = "http://thredds.met.no/thredds/wms/metusers/maltem/SALIENSEAS/SEAS5/Arctic.SEAS5_sfc_SIP_00-50_20190501.nc"
var osisWMS = "http://thredds.met.no/thredds/wms/metusers/maltem/SALIENSEAS/SEAS5/OSISAF_climatology_SIP_2009_2018_20190501.nc";
var SEASconcLayer = L.tileLayer.wms(seas5WMS, {
    layers: 'SIP_15',
    format: 'image/png',
    transparent: true,
    colorscalerange: '0,1',
    abovemaxcolor: "extend",
    belowmincolor: "extend",
    numcolorbands: 100,
    styles: 'boxfill/occam' 
});
var OSIconcLayer = L.tileLayer.wms(osisWMS, {
    layers: 'SIP',
    format: 'image/png',
    transparent: true,
    colorscalerange: '0,1',
    abovemaxcolor: "extend",
    belowmincolor: "extend",
    numcolorbands: 100,
    styles: 'boxfill/occam' 
});

var proxy = 'server/proxy.php';
var SEASconcTimeLayer = L.timeDimension.layer.wms.timeseries(SEASconcLayer, {
    proxy: proxy,
    updateTimeDimension: true,
    name: "Sea Ice Probability",
    units: "in %",
    enableNewMarkers: true
});

var OSIconcTimeLayer = L.timeDimension.layer.wms(OSIconcLayer, {
    proxy: proxy
});

var SEASLegend = L.control({
    position: 'bottomright'
});
SEASLegend.onAdd = function(map) {
    var src = seas5WMS + "?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&LAYER=SIP&colorscalerange=0,1&PALETTE=boxfill/occam&numcolorbands=100";
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML +=
        '<img src="' + src + '" alt="legend">';
    return div;
};
SEASLegend.addTo(map);

var overlayMaps = {
    "Sea Ice Probability Forecast": SEASconcTimeLayer,
    "Sea Ice Probability Climatology": OSIconcTimeLayer
};


var baseLayers = getCommonBaseLayers(map); // see baselayers.js
L.control.layers(baseLayers, overlayMaps).addTo(map);

SEASconcTimeLayer.addTo(map);
