/**
 * Leaflet.Save
 * A JavaScript library for saving map data to local computer.
 * Project page: https://github.com/Luen/
 * Save to KML requires tokml.js, Save to GPX requires togpx.js
 * License: CC0 (Creative Commons Zero), see https://creativecommons.org/publicdomain/zero/1.0/
 */
function concatGeoJSON(g1, g2){
   return {
       "type" : "FeatureCollection",
       "features": g1.features.concat(g2.features)
   }
}
L.Control.Save = L.Control.extend({
    statics: {
    },
    options: {
        position: 'topleft',
        fitBounds: true,
        layerOptions: {},
        addToMap: true,
        exportType: 'geojson', // 'geojson','kml','gpx'
				title: 'Export data to GeoJSON',
				//label: '&#8965;',
        label: '<span class="fa-stack">\n' +
        //'    <i class="fa fa-save fa-pull-left" style="color:#555;"></i>\n'+
        '    <i class="fa fa-cloud-download-alt fa-pull-left" style="color:#555;"></i>\n'+
        '    <i class="fa fa-stack-1x" style="font-size:0.3em;left:0.0em;top:0.4em;width:auto;color:#444;">GeoJSON</i>\n'+
        '</span>',
        filename: 'download.geojson'
    },

    initialize: function (geojson, options) {
        L.Util.setOptions(this, options);
				if (this.options.exportType === 'kml') {
          this.options.title = 'Export data to KML';
          this.options.label = '<span class="fa-stack">\n' +
          //'    <i class="fa fa-save fa-pull-left" style="color:#555;"></i>\n'+
          '    <i class="fa fa-cloud-download-alt fa-pull-left" style="color:#555;"></i>\n'+
          '    <i class="fa fa-stack-1x" style="font-size:0.5em;left:0.1em;top:0.4em;width:auto;color:#444;">KML</i>\n'+
          '</span>';
        }
				if (this.options.exportType === 'gpx') {
          this.options.title = 'Export data to GPX';
          this.options.label = '<span class="fa-stack">\n' +
          //'    <i class="fa fa-save fa-pull-left" style="color:#555;"></i>\n'+
          '    <i class="fa fa-cloud-download-alt fa-pull-left" style="color:#555;"></i>\n'+
          '    <i class="fa fa-stack-1x" style="font-size:0.5em;left:0.2em;top:0.4em;width:auto;color:#444;">GPX</i>\n'+
          '</span>';
        }

        this._featureGroup = geojson;
    },

    onAdd: function (map) {
        // Initialize map control
        map.Save = this;

				return this._initContainer();
    },

    onRemove: function (map) {
        //$('.leaflet-control-save').remove();
        //element.parentNode.removeChild(element);
        //delete map.Save;
    },

    _initContainer: function () {
        var zoomName = 'leaflet-control-save leaflet-control-zoom',
            barName = 'leaflet-bar',
            partName = barName + '-part',
            container = L.DomUtil.create('div', zoomName + ' ' + barName);
        var link = L.DomUtil.create('a', zoomName + '-in ' + partName, container);
        link.innerHTML = this.options.label;
        link.title = this.options.title;
        link.href = this.options.filename;
        link.download = this.options.filename;

        L.DomEvent.disableClickPropagation(link);
        L.DomEvent.on(link, 'click', function (e) {
          e.preventDefault();
          var d = this._featureGroup;
          if (!Array.isArray(d)) {
            d = [d];
          }
          var data = { "type" : "FeatureCollection", "features" : [] };
          d.forEach(function(json) {
            if (json) {
              if (json.type!="FeatureCollection") { // check if GeoJSON (for Leaflet.Draw)
                json = json.toGeoJSON();
              }
              data = concatGeoJSON(data, json);
            }
          });

          if (data.features.length == 0) {
            //console.log('no data');
            alert('No features are present');
            return false;
          } else {
            var json = JSON.stringify(data);
            if (this.options.exportType === 'geojson') {
              var convertedData = data;
            } else if (this.options.exportType === 'kml') {
              var convertedData = 'application/vnd.google-earth.kml+xml;charset=utf-8,' + encodeURIComponent(tokml(data)); // Convert to dataURL format
            } else if (this.options.exportType === 'gpx') {
              var convertedData = 'application/gpx+xml;charset=utf-8,' + encodeURIComponent(togpx(data));
            }
            const download = document.createElement('a');
            download.setAttribute('style', 'display: none');
            download.href = 'data:'+convertedData;
            download.download = this.options.filename;
            download.click();
            download.remove();
            //window.URL.createObjectURL(data);
            //window.URL.revokeObjectURL();
            //var blob = new Blob([json], {type: "text/plain;charset=utf-8"});
            //saveAs(blob, "data.geojson");
          }
        }, this);
        return container;
    }
});
