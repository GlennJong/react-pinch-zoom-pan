"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTouch = function () { return ((typeof window !== 'undefined' && 'ontouchstart' in window) ||
    !!(typeof navigator !== 'undefined' && (navigator.maxTouchPoints || navigator.msMaxTouchPoints))); };
exports.getClientXY = function (e) {
    if (e instanceof MouseEvent) {
        return { X: e.clientX, Y: e.clientY };
    }
    var touch = e.touches[0];
    return { X: touch.clientX, Y: touch.clientY };
};
exports.getMidXY = function (e) { return ({
    mX: (e.touches[0].pageX + e.touches[1].pageX) / 2,
    mY: (e.touches[0].pageY + e.touches[1].pageY) / 2,
}); };
exports.limitZoom = function (z, min, max) {
    return Math.max(Math.min(z, max), min);
};
// return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
exports.getTouchesRange = function (e) { return (Math.sqrt(Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2) +
    Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2))); };
exports.getWheelDelta = function (event) {
    var delta = event.deltaY;
    switch (event.deltaMode) {
        case WheelEvent.DOM_DELTA_LINE:
            return Math.abs(delta) >= 1
                ? delta / 100 // FF (wheel) WIN/MAC
                : delta / 100 * 2; // FF (touch) WIN
        case WheelEvent.DOM_DELTA_PAGE:
            return Math.abs(delta) >= 1
                ? delta / 100 // Ch/FF (wheel) WIN
                : delta / 10; // Ch/FF (touch) WIN
        default:
            // Big delta means that it's DOM_DELTA_PAGE (IE/EDGE)
            return Math.abs(delta) > 600 // TODO: check it
                ? delta / 10000
                : delta / 1000;
    }
};
