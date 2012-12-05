BrioMap enables butter smooth map zooming in OpenLayers

### Usage with OpenLayers ###

Following code example use the zoomTo() function to achieve smooth zooming:

```html
map = new OpenLayers.BrioMap({
	controls: [
		new OpenLayers.Control.Navigation({
			defaultDblClick: function (evt) { // touch
				if (this.map.restrictedExtent.containsBounds(map.calculateBounds()) && 
					this.map.restrictedExtent.containsLonLat(map.getLonLatFromPixel(evt.xy))) {
					this.map.zoomTo(this.map.zoom + 1, evt.xy);
				} else {
					this.map.zoomTo(this.map.zoom + 1);
				}
			},
			defaultClick: function (evt) { // touch: default is zoomOut()
				if (evt.lastTouches && evt.lastTouches.length == 2) {
					if (this.map.restrictedExtent.containsBounds(map.calculateBounds()) && 
					this.map.restrictedExtent.containsLonLat(map.getLonLatFromPixel(evt.xy))) {
						this.map.zoomTo(this.map.zoom - 1, evt.xy);
					} else {
						this.map.zoomTo(this.map.zoom - 1);
					}
				}
			},
			wheelChange: function(evt, deltaZ) {
				var currentZoom = this.map.getZoom();
				var newZoom = this.map.getZoom() + Math.round(deltaZ);
				newZoom = Math.max(newZoom, 0);
				newZoom = Math.min(newZoom, this.map.getNumZoomLevels());
				if (newZoom === currentZoom) {
					return;
				}
				if (this.map.restrictedExtent.containsBounds(map.calculateBounds()) && 
					this.map.restrictedExtent.containsLonLat(map.getLonLatFromPixel(evt.xy))) {
					this.map.zoomTo(newZoom, evt.xy);
				} else {
					this.map.zoomTo(newZoom);
				}
			}
		})
	]
});
```


### Additional Information ###

BrioMap is adapted from Andreas Hocevar's deprecated animate-zoomto


### Dependency ###

BrioMap makes use of the awesome Tween.js library implemented by sole