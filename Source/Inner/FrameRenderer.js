/*
---

name: "Inner.FrameRenderer"

description: "Private class for inner usage in LibCanvas.Canvas2D"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Utils.Trace

provides: Inner.FrameRenderer

...
*/

LibCanvas.namespace('Inner').FrameRenderer = atom.Class({
	checkAutoDraw : function () {
		if (this.updateFrame) {
			this.updateFrame = false;
			return true;
		}
		return false;
	},
	show : function () {
		if (this.elem != this.origElem) {
			this.origCtx.clearAll();
			this.origCtx.drawImage(this.elem);
		}
		return this;
	},
	drawAll : function () {
		var elems = this.elems.sortBy('getZIndex');
		for (var i = elems.length; i--;) {
			if (elems[i].isReady()) elems[i].draw();
		}
		return this;
	},
	processing : function (type) {
		this.processors[type].forEach(function (processor) {
			if ('process' in processor) {
				processor.process(this);
			} else if ('processCanvas' in processor) {
				processor.processCanvas(this.elem);
			} else if ('processPixels' in processor) {
				this.ctx.putImageData(
					processor.processCanvas(
						this.ctx.getImageData()
					)
				);
			}
		}.context(this));
		return this;
	},
	innerInvoke : function (type, time) {
		var f = this.funcs[type].sortBy('priority');
		for (var i = f.length; i--;) f[i].call(this, time);
		return this;
	},
	renderFrame : function (time) {
		this.innerInvoke('plain', time);
		if (this.checkAutoDraw()) {
			this.processing('pre');
			if (this.isReady()) {
				this.innerInvoke('render', time);
				this.drawAll();
			} else {
				this.renderProgress();
			}
			this.processing('post');
			this.show();
			return true;
		}
		return false;
	}
});