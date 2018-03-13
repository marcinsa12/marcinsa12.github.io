const myLittleUrl = 'https://api.spacexdata.com/v2/launches/all';
fetch(myLittleUrl)
.then(function(response) {
  return response.json();
})
.then(function(myJson) {
  myJson.forEach( elem =>{
    if(elem.launch_date_unix>Math.floor(Date.now()/1000)) {
      elem.details = 'This is an upcoming Start! Watch it live!'
    }
    if(elem.flight_number> myJson.length-10){
      myApp.eachLaunch.push(elem)
    }
  })

});
var ourRocket=[];
var launchClicked=[];

const launchLine = Vue.component('launch',{
  props:['content'],
  template:`<div class="editableDiv">
              <ol>
                <li>Flight number: {{content.flight_number}}</li>
                <li>Launch Time ZULU: {{content.launch_date_utc}}</li>
                <li>Rocket Name: {{content.rocket.rocket_name}}</li>
                <li>{{ (content.launch_date_unix > Math.floor(Date.now()/1000) ? 'Flight is planned to launch' : 'Its already in the skies')}}</li>
                <li v-if="succesfullLaunch()"> Was the launch succes? {{succesfullLaunch()}}</li>
              </ol>
              <button class="moreButton" v-on:click="showMore()" > More? </button>
            </div>`,

  methods:{
    showMore: function(elem){
      const rocketName = (this._props.content.rocket.rocket_id);
      fetch('https://api.spacexdata.com/v2/rockets/'+ rocketName)
      .then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
          ourRocket.push(myJson);
      });
      document.querySelector('.modalWrapper').style.display='block';
      launchClicked.push(this._props.content);
    },

    succesfullLaunch: function(){
      if(this.content.launch_date_unix < Math.floor(Date.now()/1000)){
        if(this.content.launch_success){ return 'Yes, yes indeed'}
        if(!this.content.launch_success){ return 'No, it was fail'}
      }else return false;
    },

  }
})

const moreDetails = Vue.component('detailer',{
  props:['content','content2'],
  template:`<ol>
              <li>Place of the launch was {{content.launch_site.site_name_long}}</li>
              <li>{{content.details}}</li>
              <li>Height {{content2.height.meters}} meters, Mass {{content2.mass.kg}}kg</li>
              <li>This rocket has {{content2.stages}} stages</li>
              <li>Rocket used for that launch was {{content2.name}} , ID: {{content2.id}}</li>
              <li>{{content2.description}}</li>
              <img v-if="photo()" :src="photo()" ></img>
              <button v-on:click="disableModal">X</button>
            </ol>`,
  methods:{
    photo: function(){return this.content.links.mission_patch},
    disableModal: function(){
      document.querySelector('.modalWrapper').style.display='none';
      ourRocket.length = 0;
      launchClicked.length = 0;
    }
  },


})


var myApp = new Vue ({
  el: '#appBuild',
  components:{launchLine, moreDetails},
  data:{
    eachLaunch: [],
    rockets: ourRocket,
    selectedLaunch: launchClicked
  },
})
