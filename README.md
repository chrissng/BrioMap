BrioMap beautifies OpenLayers with butter smooth map zooming.

*This work was originally intent for OpenLayers 2.11 (https://github.com/openlayers/ol2/releases/tag/release-2.11) used in my work some time ago where there is no slick map zooming*

### Usage with OpenLayers ###

Following code example use the zoomTo() function to achieve smooth zooming:

```javascript
map = new OpenLayers.BrioMap({
	controls: [
		new OpenLayers.Control.Navigation({
			defaultDblClick: function (evt) { // touch
				this.map.zoomTo(this.map.zoom + 1, evt.xy);
			},
			defaultClick: function (evt) { // touch: default is zoomOut()
				if (evt.lastTouches && evt.lastTouches.length == 2) {
					this.map.zoomTo(this.map.zoom - 1, evt.xy);
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
				this.map.zoomTo(newZoom, evt.xy);
			}
		})
	]
});
```


### Additional Information ###

BrioMap is adapted from Andreas Hocevar's deprecated animate-zoomto


### Dependency ###

BrioMap makes use of the awesome Tween.js library implemented by sole
