import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {UserService} from '../../services/user.service';
import {FirebaseService} from '../../services/firebase.service';
import * as moment from 'moment';
import * as keyboardJS from 'keyboardjs/dist/keyboard.min';

declare var $: any;
declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  map: any;
  polyline: any;
  polylineListener: any;
  latlng: any;
  mapConfig: any;
  isDrawing: any;
  cursor: any;
  issueLineColorConfig: any;
  charityLineColorConfig: any;
  selectedLineIdForDelete: any;
  userMarker: any;
  userInfoWindow: any;

  @ViewChild('description', {static: false}) description: ElementRef;

  constructor(private userService: UserService, private toastr: ToastrService, private firebaseService: FirebaseService) {
    let polylinesRefList = [];
    this.firebaseService.getPolylinesData().subscribe(result => {
      console.log('polylinesData ', result);
      // clear all lines from map
      for (const polylineRef of polylinesRefList) {
        polylineRef.setMap(null);
      }
      polylinesRefList = [];
      // generate new lines from scratch
      result.forEach(obj => {
        const {id} = obj;
        for (const polylineObject of obj['data']) {
          const {colorConfig, dateTime, description, user} = polylineObject;
          const startPointEndPointSymbol = {
            path: 'M -1,0 0,-1 1,0 0,1 z',
            strokeColor: colorConfig.edgeColor,
            fillColor: colorConfig.edgeColor,
            fillOpacity: 1
          };
          const polylineRef = new google.maps.Polyline({
            path: obj['data'],
            strokeColor: colorConfig.lineColor,
            strokeOpacity: 1.0,
            strokeWeight: 3,
            icons: [
              {icon: startPointEndPointSymbol, offset: '0%'},
              {icon: startPointEndPointSymbol, offset: '100%'}
            ],
            map: this.map
          });
          const infoWindow = new google.maps.InfoWindow();

          polylineRef.addListener('mouseover', (event) => {
            const infoWindowContent = `
              <div class='media h-100'>
                <img src='${user.photoUrl}' alt='${user.displayName}' width="30" class='rounded-circle'>
                <div class='media-body ml-2'>
                  ${user.displayName}
                  <div class='small text-muted'>${description ? description : ''}</div>
                  <div class='small text-muted'>${moment(dateTime).fromNow()}</div>
                </div>
              </div>
            `;
            infoWindow.setPosition(event.latLng);
            infoWindow.setContent(infoWindowContent);
            infoWindow.open(this.map);
          });
          polylineRef.addListener('mouseout', (event) => {
            infoWindow.setContent(null);
            infoWindow.close();
          });
          polylineRef.addListener('click', (event) => {
            if (user.email === this.userService.getUser().email) {
              this.openDeleteModal(id);
            }
          });
          polylinesRefList.push(polylineRef);
        }
      });
    });
  }

  ngOnInit() {
    this.issueLineColorConfig = {
      lineColor: '#ff4136',
      edgeColor: '#f00000',
    };
    this.charityLineColorConfig = {
      lineColor: '#0074d9',
      edgeColor: '#0000ff',
    };
    this.isDrawing = {
      status: false,
      type: null,
      started: false,
    };
    this.latlng = {
      lat: 24.8607,
      lng: 67.0011,
    };
    this.cursor = {
      defaultCursor: 'url(http://maps.gstatic.com/mapfiles/openhand_8_8.cur),default',
      drawingCursor: 'crosshair'
    };
    this.mapConfig = {
      center: this.latlng,
      zoom: 11,
      draggableCursor: this.cursor.defaultCursor,
    };
    $('#delete_modal').on('shown.bs.modal', (ev) => {
      $(ev.currentTarget).find('.confirm-btn').trigger('focus');
    });
    $('#add_modal').on('shown.bs.modal', (ev) => {
      $(ev.currentTarget).find('.save-btn').trigger('focus');
    });
  }

  openDeleteModal(id) {
    this.selectedLineIdForDelete = id;
    $('#delete_modal').modal();
  }

  deleteLine(type) {
    if (type === 'confirm') {
      this.firebaseService.deletePolyline(this.selectedLineIdForDelete);
    }
    this.selectedLineIdForDelete = null;
  }

  ngAfterViewInit() {
    this.initMap();
    this.keyboardEvent('bind');
    this.initTooltipAndPopover(true);
  }

  ngOnDestroy() {
    this.keyboardEvent('unbind');
  }

  keyboardEvent(type) {
    switch (type) {
      case 'bind': {
        keyboardJS.bind('ctrl+z', (e) => {
          if (!this.polyline) {
            return;
          }
          this.polyline.getPath().pop();
          if (this.polyline.getPath().length < 2) {
            this.isDrawing.started = false;
          }
        });
        keyboardJS.bind('ctrl+x', (e) => {
          if (!this.polyline) {
            return;
          }
          this.polyline.getPath().clear();
          this.isDrawing.started = false;
        });
        keyboardJS.bind('esc', (e) => {
          if (!this.polyline) {
            return;
          }
          this.map.setOptions({draggableCursor: this.cursor.defaultCursor});
          this.isDrawing.type = null;
          this.isDrawing.status = false;
          this.isDrawing.started = false;
          this.polyline.setMap(null);
          this.polyline = null;
          google.maps.event.removeListener(this.polylineListener);
        });
        return;
      }
      case 'unbind': {
        keyboardJS.unbind('ctrl+z');
        keyboardJS.unbind('ctrl+x');
        keyboardJS.unbind('esc');
        return;
      }
    }
  }

  addDescription() {
    if (this.isDrawing.started) {
      $('#add_modal').modal();
    }
  }

  saveDrawing(description) {
    if (!this.isDrawing.started) {
      return;
    }

    const pathData = JSON.parse(JSON.stringify(this.polyline.getPath().getArray()));
    this.addRouteDetails(pathData, description.value);

    this.isDrawing.type = null;
    this.isDrawing.status = false;
    this.isDrawing.started = false;
    this.polyline.setMap(null);
    this.polyline = null;
    this.description.nativeElement.value = null;
    this.map.setOptions({draggableCursor: this.cursor.defaultCursor});
    google.maps.event.removeListener(this.polylineListener);
  }

  addRouteDetails(arr, description) {
    const user = this.userService.getUser();
    const dateTime = +new Date();
    for (let i = 0, len = arr.length; i < len; i++) {
      arr[i].user = user;
      arr[i].dateTime = dateTime;
      arr[i].description = description ? description : null;
      arr[i].type = this.isDrawing.type;
      if (arr[i].type === 'issue') {
        arr[i].colorConfig = this.issueLineColorConfig;
      } else {
        arr[i].colorConfig = this.charityLineColorConfig;
      }
    }
    this.toastr.info('Saving..', '', {timeOut: 3000}).onHidden
      .subscribe(() => {
        this.firebaseService.addPolyline(arr)
          .then(res => {
            res.onSnapshot((data) => {
              // console.log('polyline added, ', data.data().data);
              const currentUser = this.userService.getUser();
              if (data.exists && currentUser) {
                const successMsg = `Good job ${currentUser.displayName}.`;
                this.toastr.success(successMsg, '', {progressBar: false, timeOut: 2000});
              } else {
                const deleteMsg = `Deleted successfully.`;
                this.toastr.show(deleteMsg, '', {progressBar: false, timeOut: 2000});
              }
            });
          })
          .catch(err => {
            this.toastr.error(err, '', {progressBar: false, timeOut: 2000});
          });
      });
  }

  draw(type) {
    this.isDrawing.status = true;
    this.isDrawing.type = type;
    switch (type) {
      case 'issue': {
        this.initPolyline(this.issueLineColorConfig);
        break;
      }
      case 'charity': {

        break;
      }
      case 'helpNeeded': {

        break;
      }
    }
    this.map.setOptions({draggableCursor: this.cursor.drawingCursor});
  }

  initPolyline(config) {
    const startPointEndPointSymbol = {
      path: 'M -1,0 0,-1 1,0 0,1 z',
      strokeColor: config.edgeColor,
      fillColor: config.edgeColor,
      fillOpacity: 1
    };
    this.polyline = new google.maps.Polyline({
      strokeColor: config.lineColor,
      strokeOpacity: 1.0,
      strokeWeight: 3,
      icons: [
        {icon: startPointEndPointSymbol, offset: '0%'},
        {icon: startPointEndPointSymbol, offset: '100%'}
      ],
    });

    this.polyline.setMap(this.map);

    this.polylineListener = this.map.addListener('click', (event) => {
      const currentLatLng = event.latLng;
      const path = this.polyline.getPath();
      path.push(currentLatLng);
      if (this.polyline.getPath().length > 1) {
        this.isDrawing.started = true;
      }
    });
  }

  addMarker(latlng, info, isOpen?) {
    this.userMarker = new google.maps.Marker({
      title: info,
      position: latlng,
      map: this.map
    });

    const infoWindowContent = `
      <div class='media h-100 align-items-center'>
        <img src='${this.userService.getUser().photoUrl}' alt='${this.userService.getUser().displayName}' width="30" class='rounded-circle'>
        <div class='media-body ml-2'>
          ${this.userService.getUser().displayName}
        </div>
      </div>
    `;

    this.userInfoWindow = new google.maps.InfoWindow({
      content: infoWindowContent
    });

    this.userMarker.addListener('click', () => {
      this.userInfoWindow.open(this.userMarker.get('map'), this.userMarker);
    });

    if (isOpen) {
      this.userInfoWindow.open(this.userMarker.get('map'), this.userMarker);
    }
  }

  closeFABMenu(fab) {
    fab.checked = false;
    this.initTooltipAndPopover(false);
  }

  initTooltipAndPopover(trigger) {
    if (trigger) {
      $('[data-toggle="tooltip"]').tooltip({
        placement: 'right'
      });
      $('[data-toggle="popover"]').popover({
        title: () => {
          const startedMessage = 'Click to add description.';
          const notStartedMessage = `Route map definition (${this.isDrawing.type})`;
          const title = !this.isDrawing.started ? notStartedMessage : startedMessage;
          return title;
        },
        content: () => {
          const startedMessage = 'PS: You can also use keyboard shortcuts i.e (ctrl+z) to Undo, (ctrl+x) to Delete entire line.';
          const notStartedMessage = `Click on the map to start drawing route path, make sure its clear and visible to everyone.`;
          const content = !this.isDrawing.started ? notStartedMessage : startedMessage;
          return content;
        }
      });
    } else {
      $('[data-toggle="tooltip"]').tooltip('hide');
      $('[data-toggle="popover"]').popover('hide');
    }
  }

  reCenter() {
    this.map.panTo(this.latlng);
    this.userInfoWindow.open(this.userMarker.get('map'), this.userMarker);
  }

  initMap() {
    try {
      this.createMap();
      this.getCurrentLocation();
    } catch (e) {
      console.log(`Map doesn't loaded for some reason. \n `, e);
    }
  }

  createMap() {
    const mapDiv = document.getElementById('map');
    this.map = new google.maps.Map(mapDiv, this.mapConfig);
    console.log('map ', this.map);
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        const info = this.userService.getUser() ? `You (${this.userService.getUser().displayName})` : 'You';
        this.addMarker(this.latlng, info, true);
      }, () => {
        this.handleLocationError(true);
      });
    } else {
      // Browser doesn't support Geolocation
      this.handleLocationError(false);
    }
  }

  handleLocationError(browserHasGeolocation) {
    const serviceFailedMsg = 'For some reason Geolocation service failed';
    const unsupportedBrowserMsg = 'Your browser doesn\'t support geolocation.';
    const infoWindow = new google.maps.InfoWindow({
      content: browserHasGeolocation ? serviceFailedMsg : unsupportedBrowserMsg
    });
    infoWindow.setPosition(this.map.getCenter());
    infoWindow.open(this.map);
  }
}
