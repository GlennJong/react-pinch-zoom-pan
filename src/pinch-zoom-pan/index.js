"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var helpers_1 = require("./helpers");
var styles_1 = require("./styles");
var types_1 = require("./types");
var PinchZoomPan = /** @class */ (function (_super) {
    __extends(PinchZoomPan, _super);
    function PinchZoomPan(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            transform: { x: 0, y: 0, z: 1 },
            action: types_1.pzpAction.None,
        };
        _this.onTouchStart = function (event) {
            event.preventDefault();
            if (typeof TouchEvent !== 'undefined' && // IE & EDGE doesn't have TouchEvent
                event instanceof TouchEvent &&
                event.touches.length === 2) {
                _this.setState({ action: types_1.pzpAction.Pinching });
                _this.currentZ = _this.state.transform.z;
                _this.currentR = helpers_1.getTouchesRange(event);
            }
            else {
                _this.startMoving(event);
            }
        };
        _this.onTouchEnd = function (event) {
            if (_this.state.action === types_1.pzpAction.Pinching &&
                typeof TouchEvent !== 'undefined' && // IE & EDGE doesn't have TouchEvent
                event instanceof TouchEvent &&
                event.touches.length === 1) {
                _this.startMoving(event);
            }
            else {
                _this.setState({ action: types_1.pzpAction.None });
            }
        };
        _this.onTouchMove = function (event) {
            event.stopImmediatePropagation();
            event.preventDefault();
            var action = _this.state.action;
            if (action === types_1.pzpAction.Moving)
                _this.move(event);
            else if (action === types_1.pzpAction.Pinching)
                _this.pinch(event);
        };
        _this.onWheel = function (event) {

            if (!_this.props.captureWheel && !event.altKey)
                return;
            event.preventDefault();
            event.stopPropagation();
            var delta = helpers_1.getWheelDelta(event) * -1;
            var z = helpers_1.limitZoom(_this.state.transform.z + delta, _this.props.min, _this.props.max);
            var _a = _this.getPositionByPoint(z, event.pageX, event.pageY),
                x = _a.x,
                y = _a.y;

            var actionWidth = _this.root.querySelector('#action-area').getBoundingClientRect().width;
            var actionHeight = _this.root.querySelector('#action-area').getBoundingClientRect().height;

            var wrapWidth = _this.root.getBoundingClientRect().width;
            var wrapHeight = _this.root.getBoundingClientRect().height;

            var rangeX = ((actionWidth / 2) - (wrapWidth / 2)) * _this.props.zoomOverScale;
            var rangeY = ((actionHeight / 2) - (wrapHeight / 2)) * _this.props.zoomOverScale;

            if (x > (wrapWidth / 2) + rangeX) {
                x = (wrapWidth / 2) + rangeX;
            };
            if (x < (wrapWidth / 2) - rangeX) {
                x = (wrapWidth / 2) - rangeX;
            };
            if (y > (wrapHeight / 2) + rangeY) {
                y = (wrapHeight / 2) + rangeY;
            };
            if (y < (wrapHeight / 2) - rangeY) {
                y = (wrapHeight / 2) - rangeY;
            };
            
            _this.setState({ transform: _this.updateTransform({ x: x, y: y, z: z }) });
        };
        _this.onClickZoomIn = function (event) {
            event.preventDefault();
            event.stopPropagation();
            var delta = _this.props.zoomDelta;
            var w = _this.root.offsetWidth;
            var h = _this.root.offsetHeight;
            var z = helpers_1.limitZoom(_this.state.transform.z + delta, _this.props.min, _this.props.max);
            var _a = _this.getPositionByPoint(z, w/2, h/2),
                x = _a.x,
                y = _a.y;

            _this.setState({ transform: _this.updateTransform({ x: x, y: y, z: z }) });
        };
        _this.onClickZoomOut = function (event) {
            event.preventDefault();
            event.stopPropagation();
            var delta = _this.props.zoomDelta;
            var w = _this.root.offsetWidth;
            var h = _this.root.offsetHeight;
            var z = helpers_1.limitZoom(_this.state.transform.z - delta, _this.props.min, _this.props.max);
            var _a = _this.getPositionByPoint(z, w/2, h/2),
                x = _a.x,
                y = _a.y;

            _this.setState({ transform: _this.updateTransform({ x: x, y: y, z: z }) });
        };
        _this.setAutoMove = function (pos) {
            var x = pos.x;
            var y = pos.y;
            _this.autoMove(x, y);
        }
        _this.setRoot = function (el) {
            return _this.root = el;
        };
        var touch = helpers_1.isTouch();
        _this.eventsMap = [
            { name: touch ? 'touchstart' : 'mousedown', handler: _this.onTouchStart },
            { name: touch ? 'touchmove' : 'mousemove', handler: _this.onTouchMove },
            { name: touch ? 'touchend' : 'mouseup', handler: _this.onTouchEnd },
            { name: touch ? 'touchleave' : 'mouseleave', handler: _this.onTouchEnd },
            { name: 'touchcancel', handler: _this.onTouchEnd },
            { name: 'wheel', handler: _this.onWheel },
        ];
        return _this;
    }
    PinchZoomPan.prototype.componentDidMount = function () {
        this.subscribe();
        this.init();
    };
    PinchZoomPan.prototype.componentWillUnmount = function () {
        this.unsubscribe();
    };
    PinchZoomPan.prototype.subscribe = function () {
        var _this = this;
        this.eventsMap.forEach(function (event) {
            _this.root.addEventListener(event.name, event.handler);
        });
    };
    PinchZoomPan.prototype.unsubscribe = function () {
        var _this = this;
        this.eventsMap.forEach(function (event) {
            _this.root.removeEventListener(event.name, event.handler);
        });
    };
    PinchZoomPan.prototype.init = function () {
        var rootRect = this.root.getBoundingClientRect();
        var x = rootRect.width / 2;
        var y = rootRect.height / 2;
        this.setState({ transform: this.updateTransform({ x: x, y: y, z: this.props.zoomInit }) });
    };
    PinchZoomPan.prototype.updateTransform = function (transform) {
        return __assign({}, this.state.transform, transform);
    };
    PinchZoomPan.prototype.updateCurrentPos = function (X, Y) {
        this.currentX = X;
        this.currentY = Y;
    };
    PinchZoomPan.prototype.getPositionByPoint = function (zoom, X, Y) {
        var _a = this.state.transform,
            x = _a.x,
            y = _a.y,
            z = _a.z;
        var _b = this.root.getBoundingClientRect(), left = _b.left, top = _b.top;
        var offsetX = (X - left - window.pageXOffset) - x;
        var offsetY = (Y - top - window.pageYOffset) - y;
        var ratio = zoom / z;
        return {
            x: x - (offsetX * ratio - offsetX),
            y: y - (offsetY * ratio - offsetY),
        };
    };
    PinchZoomPan.prototype.startMoving = function (event) {
        this.setState({ action: types_1.pzpAction.Moving });
        var _a = helpers_1.getClientXY(event), X = _a.X, Y = _a.Y;
        this.updateCurrentPos(X, Y);
    };
    PinchZoomPan.prototype.move = function (event) {
        var _a = helpers_1.getClientXY(event), X = _a.X, Y = _a.Y;

        var actionWidth = this.root.querySelector('#action-area').getBoundingClientRect().width;
        var actionHeight = this.root.querySelector('#action-area').getBoundingClientRect().height;

        var wrapWidth = this.root.getBoundingClientRect().width;
        var wrapHeight = this.root.getBoundingClientRect().height;

        var x = this.state.transform.x - (this.currentX - X);
        var y = this.state.transform.y - (this.currentY - Y);

        var rangeX = ((actionWidth / 2) - (wrapWidth / 2)) * this.props.zoomOverScale;
        var rangeY = ((actionHeight / 2) - (wrapHeight / 2)) * this.props.zoomOverScale;

        if (x > (wrapWidth / 2) + rangeX) {
            x = (wrapWidth / 2) + rangeX;
        };
        if (x < (wrapWidth / 2) - rangeX) {
            x = (wrapWidth / 2) - rangeX;
        };
        if (y > (wrapHeight / 2) + rangeY ) {
            y = (wrapHeight / 2) + rangeY;
        };
        if (y < (wrapHeight / 2) - rangeY) {
            y = (wrapHeight / 2) - rangeY;
        };

        this.setState({ transform: this.updateTransform({ x: x, y: y }) });
        this.updateCurrentPos(X, Y);
    };
    PinchZoomPan.prototype.autoMove = function (posX, posY) {
        var actionWidth = this.root.querySelector('#action-area').getBoundingClientRect().width;
        var actionHeight = this.root.querySelector('#action-area').getBoundingClientRect().height;

        var wrapWidth = this.root.getBoundingClientRect().width;
        var wrapHeight = this.root.getBoundingClientRect().height;

        var widthScaleTransfer = actionWidth / wrapWidth;
        var heightScaleTransfer = actionHeight / wrapHeight;

        var X = ((wrapWidth / 2) - posX) * widthScaleTransfer;
        var Y = ((wrapHeight / 2) - posY) * heightScaleTransfer;

        var targetX = (wrapWidth / 2) + X;
        var targetY = (wrapHeight / 2) + Y;

        var rangeX = ((actionWidth / 2) - (wrapWidth / 2)) * this.props.zoomOverScale;
        var rangeY = ((actionHeight / 2) - (wrapHeight / 2)) * this.props.zoomOverScale;

        if (targetX > (wrapWidth / 2) + rangeX) {
            targetX = (wrapWidth / 2) + rangeX;
        };
        if (targetX < (wrapWidth / 2) - rangeX) {
            targetX = (wrapWidth / 2) - rangeX;
        };
        if (targetY > (wrapHeight / 2) + rangeY) {
            targetY = (wrapHeight / 2) + rangeY;
        };
        if (targetY < (wrapHeight / 2) - rangeY) {
            targetY = (wrapHeight / 2) - rangeY;
        };

        var directionX, directionY;

        var currentX = this.state.transform.x;
        var currentY = this.state.transform.y;

        // what's direction?
        directionX = (targetX - currentX) / 100;
        directionY = (targetY - currentY) / 100;

        if (Math.abs(targetX - currentX) > 1 || Math.abs(targetY - currentY) > 1) {
            window.requestAnimationFrame(run);
        }

        var _this = this;
        var easeNumber = 0;
        function run() {
            easeNumber += 1;
            currentX = currentX + (directionX * easeNumber);
            currentY = currentY + (directionY * easeNumber);

            _this.setState({ transform: _this.updateTransform({ x: currentX, y: currentY }) });
            if ((directionX > 0 && targetX < currentX) || (directionX < 0 && targetX > currentX)) {
                currentX = targetX;
            }
            if ((directionY > 0 && targetY < currentY) || (directionY < 0 && targetY > currentY)) {
                currentY = targetY;
            }
            if ((directionX > 0 && targetX > currentX) ||
                (directionY > 0 && targetY > currentY) ||
                (directionX < 0 && targetX < currentX) ||
                (directionY < 0 && targetY < currentY)) {
                window.requestAnimationFrame(run);
            }
            else {
                _this.setState({ transform: _this.updateTransform({ x: targetX, y: targetY }) });
            }
        }
        var moveAnimation = window.requestAnimationFrame(run);
        cancelAnimationFrame(moveAnimation);

    };
    PinchZoomPan.prototype.zoomIn = function (event) {
        event.preventDefault();
        event.stopPropagation();
        var delta = this.props.zoomDelta;
        var w = this.root.offsetWidth;
        var h = this.root.offsetHeight;
        var z = helpers_1.limitZoom(this.state.transform.z + delta, this.props.min, this.props.max);
        var _a = this.getPositionByPoint(z, w / 2, h / 2),
            x = _a.x,
            y = _a.y;

        this.setState({ transform: this.updateTransform({ x: x, y: y, z: z }) });
    };
    PinchZoomPan.prototype.zoomOut = function (event) {
        event.preventDefault();
        event.stopPropagation();
        var delta = this.props.zoomDelta;
        var w = this.root.offsetWidth;
        var h = this.root.offsetHeight;
        var z = helpers_1.limitZoom(this.state.transform.z - delta, this.props.min, this.props.max);
        var _a = this.getPositionByPoint(z, w / 2, h / 2),
            x = _a.x,
            y = _a.y;

        this.setState({ transform: this.updateTransform({ x: x, y: y, z: z }) });
    };
    PinchZoomPan.prototype.pinch = function (event) {
        // webkit
        var scale = event.scale;
        var pageX = event.pageX;
        var pageY = event.pageY;
        // others
        if (scale === undefined || pageX === undefined || pageY === undefined) {
            scale = helpers_1.getTouchesRange(event) / this.currentR;
            var _a = helpers_1.getMidXY(event), mX = _a.mX, mY = _a.mY;
            pageX = mX;
            pageY = mY;
        }
        var z = helpers_1.limitZoom(this.currentZ * scale, this.props.min, this.props.max);
        var _b = this.getPositionByPoint(z, pageX, pageY), x = _b.x, y = _b.y;
        this.setState({ transform: this.updateTransform({ x: x, y: y, z: z }) });
    };
    PinchZoomPan.prototype.render = function () {
        var _a = this.state.transform, x = _a.x, y = _a.y, z = _a.z;
        var transform = "translate(" + x + "px, " + y + "px) scale(" + z + ")";
        return (React.createElement("div", { ref: this.setRoot, className: this.props.className, style: __assign({}, styles_1.ROOT_STYLES, this.props.style) },
            React.createElement("div", { style: __assign({}, styles_1.POINT_STYLES, { transform: transform }) },
                React.createElement("div", { id: 'action-area', style: styles_1.CANVAS_STYLES }, this.props.children)),
            this.props.debug && (React.createElement("div", { className: 'debugger', style: styles_1.DEBUG_STYLES }, JSON.stringify(this.state, null, '  ')))));
    };
    PinchZoomPan.defaultProps = {
        min: 0.1,
        max: 3.5,
        zoomOverScale: 1,
        zoomInit: 1,
        zoomDelta: 0.1,
    };
    return PinchZoomPan;
}(React.Component));
exports.default = PinchZoomPan;
