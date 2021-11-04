//https://deanmarktaylor.github.io/clipboard-test/
function copyTextToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
    alert("Hyperlink copied to clipboard: " + text);
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
    window.prompt("Copy to clipboard: Ctrl/Cmd+C, Enter", text);
  });
  console.log("Hyperlink: " + text);
}

L.Control.Share = L.Control.extend({
    options: {
        position: 'topleft',
        fitBounds: true,
        layerOptions: {},
        addToMap: true,
        title: 'Save to server & share',
        label: '<span class="fa-stack">\n' +
        //'    <i class="fa fa-save fa-pull-left" style="color:#555;"></i>\n'+
        '    <i class="fa fa-share-alt fa-pull-left" style="color:#555;margin-left:0.1em;"></i>\n'+
        '    <i class="fa fa-stack-1x" style="font-size:0.5em;left:0.0em;top:0.3em;width:auto;color:#444;">Share</i>\n'+
        '</span>',
    },
    initialize: function (featureGroup, options) {
        L.Util.setOptions(this, options);
        this._featureGroup = featureGroup;
    },
    onAdd: function (map) {
        return this._initContainer(map);
    },
    _initContainer: function (map) {
        var zoomName = 'leaflet-control-save leaflet-control-zoom',
            barName = 'leaflet-bar',
            partName = barName + '-part',
            container = L.DomUtil.create('div', zoomName + ' ' + barName);
        var link = L.DomUtil.create('a', zoomName + '-in ' + partName, container);
        link.innerHTML = this.options.label;
        link.title = this.options.title;

        //L.DomEvent.disableClickPropagation(link);
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
            // works with permalink plugin
            var hyperlink = [location.protocol, '//', location.host, location.pathname, location.hash].join('');
            copyTextToClipboard(hyperlink);
            return false;
          } else {
            var text = "This will save the gps data to the Wanderstories server and provide a shareable link."; // Click cancel to download the gpx file instead
            if (confirm(text)) {
              var json = JSON.stringify(data);
              var _params = {};

/*
              _params.lat = "";
              _params.lng = "";
              _params.zoom = "";
*/
              if(map){
                _params.lat = map.getCenter().lat;
                _params.lng = map.getCenter().lng;
                _params.zoom = map.getZoom();
              }

/*
              //Works with Leaflet.Permalink
              var hash = window.location.hash;
              if (hash !== '') {
                var hash = hash.replace('#', '');
                var parts = hash.split(',');
                if (parts.length === 3 || parts.length === 4 || parts.length === 5) {
                    _params.lat = parseFloat(parts[0]);
                    _params.lng = parseFloat(parts[1]);
                    _params.zoom = parseInt(parts[2].slice(0, -1), 10);
                }
              }
*/

              var id = Date.now();
              _params.id = id;

              $.ajax({
                type : "POST",
                url : "save_geojson.php",
                data : {
                  id: id,
                  json : JSON.stringify(data)
                },
                error: function(xhr){
                  alert("An error occured: " + xhr.status + " " + xhr.statusText);
                },
                success: function(response){
                  response = JSON.parse(response);
                  if (response.success) {
                    var hyperlink = [location.protocol, '//', location.host, location.pathname].join('') + '?id=' + id + location.hash;
                    copyTextToClipboard(hyperlink);
                  } else {
                    alert(response.message);
                    console.error(response.message);
                  }
                }
              });
              //} else {
              //	$('.leaflet-control-save[title="Export data to GPX"]').click();
            } else {
              return false;
            }
          }
        }, this);
        return container;
    }
});
