(function(global){
  console.log('CCCCCCCCC')
  const launchLine = Vue.component('launch',{
    props: ['content'],
    template:'<li class="flight">'+
                '<ul class="flight-list">'+
                  '<li>Flight number: {{content.flight_number}}</li>'+
                  '<li>Launch Time ZULU: {{content.launch_date_utc}}</li>'+
                  '<li>Rocket Name: {{content.rocket.rocket_name}}</li>'+
                  '<li>{{ (content.launch_date_unix > Math.floor(Date.now()/1000) ? "Flight is planned to launch" : "Its already in the skies")}}</li>'+
                  '<li v-if="succesfullLaunch"> Was the launch succes? {{succesfullLaunch}}</li>'+
                '</ul>'+
                '<button class="flight-btn" v-on:click="showMore()">More</button>'+
              '</li>',

    methods: {
      showMore: function(){
        myApp.dataLoaded = false;
        const rocketId = this._props.content.rocket.rocket_id;
        const flightId = this._props.content.flight_number;
        function openModal() {
          myApp.currentRocket = myApp.rockets[rocketId];
          myApp.currentLaunch = myApp.launches[flightId];
          myApp.isModalOpen = true;
        }
        if(!myApp.rockets[rocketId]) {
          fetch(myApp.rocketsURL + rocketId)
          .then(function(response) {
            return response.json();
          })
          .catch(function(error) {
            throw new Error(error)
          })
          .then(function(myJson) {
            myApp.rockets[myJson.id] = myJson;
            openModal();
            myApp.dataLoaded = true;
          })
          .catch(function(error){
            console.log(error)
            myApp.failedFetched = true;
          });
        } else {
          openModal();
          myApp.dataLoaded = true;
        }
      },
    },

    computed: {
      succesfullLaunch: function() {
        const isFlightDeparted = this.content.launch_date_unix < Math.floor(Date.now()/1000);
        if (isFlightDeparted) {
          return this.content.launch_success ? 'Yes, yes indeed' : 'No, it was fail'
        } else return false;
      },
    }
  })

  const moreDetails = Vue.component('detailer',{
    props: ['flight','rocket'],
    template: '<div v-if="shouldShowModal()" v-on:click="disableModal($event)" class="modal">'+
                '<div class="modal-content">'+
                  '<ul class="modal-list">'+
                    '<li>Place of the launch was {{flight.launch_site.site_name_long}}</li>'+
                    '<li>{{flight.details}}</li>'+
                    '<li>Height {{rocket.height.meters}} meters, Mass {{rocket.mass.kg}}kg</li>'+
                    '<li>This rocket has {{rocket.stages}} stages</li>'+
                    '<li>Rocket used for that launch was {{rocket.name}},<br> ID: {{rocket.id}}</li>'+
                    '<li>{{rocket.description}}</li>'+
                  '</ul>'+
                  '<img class="modal-background" v-if="photo" :src="photo" alt="Mission Patch"></img>'+
                  '<span class="modal-close">&times;</span>'+
                '</div>'+
              '</div>',
    methods: {
      disableModal: function(e) {
        if(e.target.classList.contains('modal-close') || e.target.classList.contains('modal')){
          myApp.isModalOpen = false;
        }
      },
      shouldShowModal: function() {
        return myApp && myApp.isModalOpen && this.flight && this.rocket;
      },
    },

    computed:{
      photo: function() {
        return this.flight.links.mission_patch
      },
    }
  })

  var myApp = new Vue ({
    el: '#appBuild',
    components:{launchLine, moreDetails},
    data: {
      currentLaunch: null,
      currentRocket: null,
      launches: {},
      rockets: {},
      accessLaunchesURL: 'https://api.spacexdata.com/v2/launches/all',
      rocketsURL: 'https://api.spacexdata.com/v2/rockets/',
      isModalOpen: false,
      dataLoaded: false,
      failedFetched: false
    },
    template: '<div class="results">'+
                '<h1>List of last 10 SpaceX Launches - Past and upcoming</h1>'+
                '<div v-if="failedFetched" class="errorMsg">Couldnt reach json data. Please check your internet connection and try again.</div>'+
                '<div v-if="!dataLoaded" class="spinner"></div>'+
                '<ul class="launches">'+
                  '<launch v-for="(launch, index) in launches" v-bind:content="launch" v-bind:key="launch.flight_number">'+
                  '</launch>'+
                '</ul>'+
                '<detailer v-if="isModalOpen" v-bind:flight="currentLaunch" v-bind:rocket="currentRocket">'+
                '</detailer>'+
              '<div>',

  })

  fetch(myApp.accessLaunchesURL)
  .then(function(response){
    return response.json();
  })
  .catch(function(error) {
    throw new Error(error)
  })
  .then(function(myJson) {
    const flightsToDisplay = myJson.filter(function(flight) {
      return flight.flight_number > myJson.length - 10
    });
    myApp.launches = flightsToDisplay.reduce(function(accumulator, item) {
      accumulator[item.flight_number] = item;
      return accumulator
    }, {});
    myApp.dataLoaded = true;
  })
  .catch(function(error){
    console.log(error)
    myApp.failedFetched = true;
  })

  global.myApp = myApp;
})(window);
