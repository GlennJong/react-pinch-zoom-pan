import React, { Component } from 'react';
import './index.scss';
import PinchZoomPan from '../pinch-zoom-pan';
import PropTypes from 'prop-types';

import metroSVG from '../images/metro.png';
import metroStations from '../config/stations.json';

class MetroMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      touchClient: [0, 0],
      currentStation: '',
      currentStationIndex: null,
      currentStationName: '',
      currentStationLine: '',
      isSearchInput: false,
      searchInputString: '',
      pinX: 0,
      pinY: 0,
    };
  }
  handleTouchStartStation = (e) => {
    let x = e.touches[0].clientX;
    let y = e.touches[0].clientY;

    this.setState({
      touchClient: [x, y]
    })
  }
  handleTouchEndStation = (e) => {
    let deltaX = e.changedTouches[0].clientX - this.state.touchClient[0];
    let deltaY = e.changedTouches[0].clientY - this.state.touchClient[1];
    let delta = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

    if (delta < 10) {
      const target = e.currentTarget;
      const station = this.getStationInfo(target.dataset.id);
      this.setState({
        currentStation: station.id,
        currentStationIndex: station.index,
        currentStationLine: station.line,
        currentStationName: station.name,
      })
      console.log('pick station ' + station.index);

      this.setAutoMoveStation(station);
    }
  }
  handleClickStation = (e) => {
    const target = e.currentTarget;
    const station = this.getStationInfo(target.dataset.id);
    this.setState({
      currentStation: station.id,
      currentStationIndex: station.index,
      currentStationLine: station.line,
      currentStationName: station.name,
    })
    console.log('pick station ' + station.index);

    this.setAutoMoveStation(station);
  }
  setAutoMoveStation = (station) => {
    const posX = station.translate.x;
    const posY = station.translate.y;
    const sizeW = station.width;
    const sizeH = station.height;

    // pixel trasnfer
    const actionWidth = this.refs.pinchZoomPan.root.offsetWidth;
    const actionHeight = this.refs.pinchZoomPan.root.offsetHeight;
    const widthTransfer = actionWidth / 550;
    const heightTransfer = actionHeight / 550;

    const x = (posX * widthTransfer) + (sizeW / 2);
    const y = (posY * heightTransfer) + (sizeH / 2);

    // set pin
    this.setState({
      pinX: posX + (sizeW / 2),
      pinY: posY + (sizeH / 2),
    })
    this.refs.pinchZoomPan.setAutoMove({ x: x, y: y });
  }
  getStationInfo(stationID) {

    const { stations } = metroStations;

    let station = stations.find(item => item.id === stationID);
    let index = stations.findIndex(item => item.id === stationID);

    return { ...station, index: index };
  }

  computedConfirmDisplayLabel = (stationName) => {
    let rtn = '';
    const { doubleRouteStations, stations } = metroStations;
    if (doubleRouteStations.find(item => item === stationName)) {
      const currentStations = stations.filter(item => item.name === stationName);
      return `${currentStations[0].line}/${currentStations[1].line} , ${currentStations[0].id}/${currentStations[1].id}`;
    }
    return this.state.currentStationLine + ', ' + this.state.currentStation;
  }

  handleInputSearch = (e) => {
    const target = e.currentTarget;
    if (target.value !== '') {
      this.setState({
        isSearchInput: true,
        searchInputString: target.value.replace(/\s/g, '')
      })
    }
    else {
      this.setState({
        isSearchInput: false,
        searchInputString: ''
      })
    }

  }
  handleClickSearchList = (e) => {
    const target = e.currentTarget;
    const station = this.getStationInfo(target.dataset.id);
    this.refs.searchInput.value = '';

    this.setState({
      currentStation: station.id,
      currentStationIndex: station.index,
      currentStationLine: station.line,
      currentStationName: station.name,
      isSearchInput: false,
      searchInputString: ''
    });
    this.setAutoMoveStation(station);
    console.log('Search station to ' + station.index);

  }
  handleClickCooradinate = () => {
    const getPosition = function (options) {
      return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    }

    let lat, lon;
    getPosition()
      .then((position) => {
        lat = position.coords.latitude;
        lon = position.coords.longitude;

        const { stations } = metroStations;
        let crdItems = [];
        stations.map((item) => {
          const diff = Math.abs(item.lat - lat) + Math.abs(item.lon - lon);
          crdItems.push(diff);
        });

        const closestStation = stations[crdItems.indexOf(Math.min(...crdItems))];

        const station = this.getStationInfo(closestStation.id);

        this.setState({
          currentStation: station.id,
          currentStationLine: station.line,
          currentStationName: station.name,
        });

        this.setAutoMoveStation(station);
      })
      .catch((err) => {
        console.error(err.message);
      });

  }
  handleClickZoomIn = (e) => {
    this.refs.pinchZoomPan.zoomIn(e);
  }
  handleClickZoomOut = (e) => {
    this.refs.pinchZoomPan.zoomOut(e);
  }
  handleTouchPinBoard = (e) => {
    this.setState({
      currentStation: ''
    })
  }
  render() {
    const { stations } = metroStations;
    const mapSettings = {
      style: {
        position: 'absolute',
        width: '100%',
        height: '100%',
      },
      captureWheel: true,
      min: .2,
      max: 3,
      zoomOverScale: 1.33,
      zoomInit: .5,
      zoomDelta: 0.1
    };
    const { searchInputString } = this.state;

    return (
      <div className="metro-map">
        <div className="map">

          {/* Search Bar */}
          <div className={'search-bar' + (this.state.currentStation === '' ? ' -show' : ' -hide')}>
            <div className="input animated fadeInDown delay-0-1s">
              <input ref="searchInput" type="text" onChange={this.handleInputSearch} placeholder="請輸入捷運站名稱 ..." />
            </div>
            <div className={"list animated fadeIn" + (this.state.isSearchInput ? ' -show' : ' -hide')}>
              <ul>
                {
                  stations.map((item, i) => {
                    const { name, id } = item;
                    if (name.indexOf(searchInputString) !== -1) {
                      const doubleStationCheck = stations.filter(sI => sI.name === name);
                      if (doubleStationCheck?.length >= 2 && doubleStationCheck?.[0] === item) {
                        return;
                      }
                      return (
                        <li key={'ms' + i} className="-show">
                          <button onClick={this.handleClickSearchList} data-id={id} >{name}</button>
                        </li>
                      )
                    }
                  })
                }
              </ul>
            </div>
          </div>


          {/* Zoom Controls */}
          <div className="zoom-controller controller">
            <button className="btn circle-btn -white zoomin animated zoomIn fast delay-0-5s" onTouchEnd={this.handleClickZoomIn} onClick={this.handleClickZoomIn} >+放大</button>
            <button className="btn circle-btn -white zoomout animated zoomIn fast delay-0-7s" onTouchEnd={this.handleClickZoomOut} onClick={this.handleClickZoomOut} >-縮小</button>
            <button className="btn circle-btn -yellow coordinate animated zoomIn fast delay-0-9s" onTouchEnd={this.handleClickCooradinate} onClick={this.handleClickCooradinate}>定位</button>
          </div>


          {/* Confirm Modal */}
          <div className={'check-station' + (this.state.currentStation !== '' ? ' -show' : ' -hide')}>
            <div className="station">{this.state.currentStationName}</div>
            <div className="info">{this.computedConfirmDisplayLabel(this.state.currentStationName)}</div>
          </div>


          {/* Map */}
          <PinchZoomPan ref="pinchZoomPan" className={'interact-map' + (this.state.currentStation !== '' ? ' -focus' : '')} {...mapSettings}>
            <svg className={'pinboard' + (this.state.currentStation !== '' ? ' -show' : ' -hide')}
              onTouchEnd={this.handleTouchPinBoard}
              onClick={this.handleTouchPinBoard}
              width="550px" height="550px" viewBox="0 0 550 550"
            >
              <g className={'pin' + (this.state.currentStation !== '' ? ' -show' : ' -hide')} transform={'translate(' + this.state.pinX + ',' + this.state.pinY + ')'}>
                <g className="icon">
                  <path transform="translate(0, -12)" d="M2,0.916666667 C2,1.24609375 1.8046875,1.53971354 1.5,1.70442708 L1.5,10.7708333 C1.5,10.8925781 1.3828125,11 1.25,11 L0.75,11 C0.6171875,11 0.5,10.8925781 0.5,10.7708333 L0.5,1.70442708 C0.1953125,1.53971354 0,1.24609375 0,0.916666667 C0,0.408203125 0.4453125,0 1,0 C1.5546875,0 2,0.408203125 2,0.916666667 Z" ></path>
                  <path transform="translate(0, -12)" d="M12,1.4375 L12,6.65332031 C12,6.90625 11.84375,7.00195312 11.6467391,7.10449219 C10.8790761,7.52148438 10.0298913,7.89746094 9.13994565,7.89746094 C7.88994565,7.89746094 7.29211957,6.94042969 5.8111413,6.94042969 C4.73097826,6.94042969 3.59646739,7.43261719 2.65896739,7.93847656 C2.58423913,7.97949219 2.51630435,8 2.43478261,8 C2.19701087,8 2,7.80175781 2,7.5625 L2,2.49023438 C2,2.32617188 2.08152174,2.20996094 2.21059783,2.11425781 C2.3736413,2.00488281 2.57065217,1.90917969 2.74728261,1.8203125 C3.60326087,1.3828125 4.64266304,1 5.60733696,1 C6.67391304,1 7.50951087,1.35546875 8.45380435,1.79980469 C8.64402174,1.89550781 8.84103261,1.9296875 9.05163043,1.9296875 C10.1182065,1.9296875 11.2663043,1 11.5652174,1 C11.8029891,1 12,1.19824219 12,1.4375 Z" ></path>
                </g>
              </g>
            </svg>
            <svg className="station" width="550px" height="550px" viewBox="0 0 550 550">
              {
                stations.map((item, i) => {
                  const { id, width, height, name, translate } = item;
                  return (
                    <rect key={i} data-id={id} width={width} height={height} name={name}
                      fill="rgba(0, 0, 0, 0)"
                      transform={"translate(" + translate.x + ',' + translate.y + ")"}
                      onClick={this.handleClickStation}
                      onTouchStart={this.handleTouchStartStation}
                      onTouchEnd={this.handleTouchEndStation}></rect>
                  )
                })
              }
            </svg>
            <img className="image" src={metroSVG} />
          </PinchZoomPan>


        </div>
      </div>
    );
  }
}

MetroMap.propTypes = {
  onNext: PropTypes.func,
}

export default MetroMap;
