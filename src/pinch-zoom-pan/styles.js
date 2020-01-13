"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOT_STYLES = {
    position: 'relative',
    transform: 'translateZ(0)',
    overflow: 'hidden',
};
exports.POINT_STYLES = {
    position: 'absolute',
    width: 0,
    height: 0,
    transform: 'translate(0, 0) scale(1)',
    transformOrigin: 'center',
    willChange: 'transform',
};
exports.CANVAS_STYLES = {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
};
exports.DEBUG_STYLES = {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 4,
    fontSize: 10,
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, .3)',
    whiteSpace: 'pre-wrap',
};
