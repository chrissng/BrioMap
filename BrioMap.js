/*
 * OpenLayers.BrioMap - OpenLayers map with butter smooth zooming using zoomTo()
 * 
 * Forked from Andreas Hocevar's deprecated animate-zoomto
 * Requires Tween.js (https://github.com/sole/tween.js) implemented by sole
 */

OpenLayers.BrioMap = OpenLayers.Class(OpenLayers.Map, {
	
	CLASS_NAME: "OpenLayers.BrioMap",
	
	isZoomTweening: false,
	
	zoomAnimate: true,

    zoomTween: null,

	zoomDuration: 300,
	
    zoomMethod: TWEEN.Easing.Quadratic.InOut,

	panMethod: OpenLayers.Easing.Expo.easeOut,
    
	/**
     * Property: layerContainerOriginPx
     * {Object} Cached object representing the layer container origin (in pixels).
     */
    layerContainerOriginPx: {x: 0, y: 0},
	
    /*
    zoomTo: function(zoom) {
        if (this.isValidZoomLevel(zoom)) {
            this.setCenter(null, zoom);
        }
    },
    */

    /**
     * Method: zoomTo
     * Smooth zooming to a specific zoom level
     *
     * Parameters:
     * zoom - {Integer} target zoom level
     * xy - {<OpenLayers.Pixel>} optional zoom origin
     */
    zoomTo: function(zoom, xy) {
        if (map.isValidZoomLevel(zoom)) {
            if (map.baseLayer.wrapDateLine) {
                zoom = map.adjustZoom(zoom);
            }
            if (map.zoomAnimate) {
				if (!xy) xy = {x: map.getSize().w / 2, y: map.getSize().h / 2};
				if (this.finalZoom == undefined) this.finalZoom = zoom;
				
				var currentRes = map.getResolution(),
                    targetRes = map.getResolutionForZoom(zoom);
				
				var zoomTweenFn = function(fromData, toData) {
					return new TWEEN.Tween(fromData)
					.to(toData, map.zoomDuration)
					.delay(0)
					.easing(map.zoomMethod)
					.onStart(function() {
						map.isZoomTweening = true;
					})
					.onUpdate(function() {
						var containerOrigin = map.layerContainerOriginPx,
							scale = this.scale,
							dx = ((scale - 1) * (containerOrigin.x + map.getPixelOffset().x + 50 - this.xy.x)) | 0,
							dy = ((scale - 1) * (containerOrigin.y + map.getPixelOffset().y + 50 - this.xy.y)) | 0;
						map.applyTransform(dx, dy, scale);
					})
					.onComplete(function() {
						map.applyTransform();
						var resolution = map.getResolution() / this.scale,
							zoom = map.getZoomForResolution(resolution, true)
						map.moveTo(map.getZoomTargetCenter(this.xy, resolution), zoom, true);
						
						map.isZoomTweening = false;
						//clearInterval(zoomTweenUpdateIntervalID);
						
					});
				};
				
				if (map.isZoomTweening) {
					if (this.getZoom() < zoom) { 	// zoom in
						this.finalZoom++;
					} else { 						// zoom out
						this.finalZoom--;
					}
					
					var newZoomTween = zoomTweenFn({scale: 1, xy: xy}, {scale: map.getResolutionForZoom(this.prevZoom) / map.getResolutionForZoom(this.finalZoom) });
					map.zoomTween.chain(newZoomTween);
					map.zoomTween = newZoomTween;
					this.prevZoom = this.finalZoom;
				} else {
					if (zoom != this.finalZoom) this.finalZoom = zoom; //reset (important)
				
					map.zoomTween = zoomTweenFn({scale: 1, xy: xy}, {scale: currentRes / targetRes}).start();
					this.prevZoom = zoom;
				}
				
                if (!this.zoomTweenUpdateIntervalID) {
                    this.zoomTweenUpdateIntervalID = setInterval(function() { TWEEN.update(); }, 10);
                }
				
            } else {
                var center = xy ? map.getZoomTargetCenter(xy, map.getResolutionForZoom(zoom)) : null;
                map.setCenter(center, zoom);
            }
        }
    },
	
	getPixelOffset: function () {
		var o = this.layerContainerOrigin,
			o_lonlat = new OpenLayers.LonLat(o.lon, o.lat),
			o_pixel = this.getViewPortPxFromLonLat(o_lonlat),
			c = this.center,
			c_lonlat = new OpenLayers.LonLat(c.lon, c.lat),
			c_pixel = this.getViewPortPxFromLonLat(c_lonlat);

		return { 
			x: o_pixel.x - c_pixel.x,
			y: o_pixel.y - c_pixel.y 
		};

	},
	
	/**
     * Method: applyTransform
     * Applies the transform described by x- and y-offset and scale to
     * the <layerContainerDiv>. If no arguments are passed, any existing
     * transform will be cleared.
     *
     * Parameters:
     * dx - {Integer} x offset
     * dy - {Integer} y offset
     * scale - {Float} scale
     */
    applyTransform: function(dx, dy, scale) {
        var style = this.layerContainerDiv.style;
        if (style.transform !== undefined ||
                style.WebkitTransform !== undefined ||
                style.MozTransform !== undefined ||
                style.OTransform !== undefined ||
                style.msTransform !== undefined) {
            var transform = "";
            if (arguments.length !== 0) {
                transform = "translate(" + dx + "px, " + dy + "px) " +
                    "scale(" + scale + ")";
            }
            style.transform = transform;
            style.WebkitTransform = transform;
            style.MozTransform = transform;
            style.OTransform = transform;
            style.msTransform = transform;
        } else {
            var containerOrigin = this.layerContainerOriginPx,
                containerCenter = {
                    x: containerOrigin.x + 50,
                    y: containerOrigin.y + 50
                },
                scale = scale || 1, dx = dx || 0, dy = dy || 0;
            style.width = Math.round(100 * scale) + "px";
            style.height = Math.round(100 * scale) + "px";
			
			var pixelOffset = map.getPixelOffset();
			//style.top = ((pixelOffset.y > 0)?('-'+pixelOffset.y):(Math.abs(pixelOffset.y)))+'px';
			//style.left = ((pixelOffset.x > 0)?('-'+pixelOffset.x):(Math.abs(pixelOffset.x)))+'px';
            
			style.left = Math.round(containerCenter.x - 50 * scale + dx + pixelOffset.x) + "px";
            style.top = Math.round(containerCenter.y - 50 * scale + dy + pixelOffset.y) + "px";
        }
        if (arguments.length === 0) {
            // Force a reflow when resetting the transform. This is to work
            // around an issue occuring in iOS + OSX Safari.
            //
            // See https://github.com/openlayers/openlayers/pull/351.
            //
            // Without a reflow setting the layer container div's top left
            // style properties to "0px" - as done in Map.moveTo when zoom
            // is changed - won't actually correctly reposition the layer
            // container div.
            //
            // Also, we need to use a statement that the Google Closure
            // compiler won't optimize away.
            try {
                this.div.clientWidth = this.div.clientWidth;
            } catch(e) {
                // this fails in IE
            }
        }
    },
	
	/**
     * Method: getZoomTargetCenter
     *
     * Parameters:
     * xy - {<OpenLayers.Pixel>} The zoom origin pixel location on the screen
     * resolution - {Float} The resolution we want to get the center for
     *
     * Returns:
     * {<OpenLayers.LonLat>} The location of the map center after the
     *     transformation described by the origin xy and the target resolution.
     */
    getZoomTargetCenter: function (xy, resolution) {
        var lonlat = null,
            size = this.getSize(),
            deltaX  = size.w/2 - xy.x,
            deltaY  = xy.y - size.h/2,
            zoomPoint = this.getLonLatFromPixel(xy);
        if (zoomPoint) {
            lonlat = new OpenLayers.LonLat(
                zoomPoint.lon + deltaX * resolution,
                zoomPoint.lat + deltaY * resolution
            );
        }
        return lonlat;
    }
});