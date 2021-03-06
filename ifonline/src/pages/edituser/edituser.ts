import { Component, SecurityContext } from '@angular/core';
import { AlertController, NavParams, LoadingController  } from 'ionic-angular';
import {DomSanitizer} from '@angular/platform-browser';
import { UserService } from '../../app/services/user.service'; //

import { Storage } from "@ionic/storage";
import { Camera } from '@ionic-native/camera';

export interface User {
    username:'',
    name:'',
    typeUser:'',
    email:'',
    birthDate:'',
    _id:'',
    idOther:'',
    avatar:''
}

@Component({
  selector: 'EditUserPage',
  templateUrl: 'edituser.html',
})
export class EditUserPage {

  loggedUser:User;
  token:string;
  switchImage:boolean=false;
  //createdUser:any={name:''};

  constructor(
   // private navCtrl: NavController, 
    private userService:UserService, 
    private alert:AlertController,
    private storage: Storage,
    private navParams:NavParams,
    private loadingCtrl:LoadingController,
    private camera:Camera,
    private domSanitizer:DomSanitizer
   ) 
   {
       this.loggedUser = this.navParams.data.user;
   }

  ionViewWillEnter() {
    let tabs = document.querySelectorAll('.tabbar');
    if ( tabs !== null ) {
      Object.keys(tabs).map((key) => {
        tabs[ key ].style.transform = 'translateY(56px)';
      });
    } // end if
  }

  ionViewDidLeave() {
    let tabs = document.querySelectorAll('.tabbar');
    if ( tabs !== null ) {
      Object.keys(tabs).map((key) => {
        tabs[ key ].style.transform = 'translateY(0)';
      });
    } // end if
  }

  ngOnInit() {
    this.storage.get('token')
      .then((token) => {
        this.token = token;
      })
      .catch( err => {
        console.log("erro no ngOnInit(): ",err);
      })
  }

  update() {
    let loading = this.loadingCtrl.create({content:'Carregando...'});
    loading.present();

    this.userService.update(this.token,this.loggedUser)
      .subscribe( result => {
        this.presentAlert(result.name);
        loading.dismiss();
      }, err => {
        loading.dismiss();
        this.presentErrorAlert('Erro ao atualizar usuário!');
      })  
  }

  openGallery() {
    let cameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,      
      quality: 100,
      targetWidth: 1000,
      targetHeight: 1000,
      encodingType: this.camera.EncodingType.JPEG,      
      correctOrientation: true
    }

    this.camera.getPicture(cameraOptions)
      .then((file_uri) => {
        
        this.loggedUser.avatar = file_uri;
        this.loadProfileImage();
      }, 
      err => console.log(err));   
  }

  presentErrorAlert(text:string) {
    const alert = this.alert.create({
      title: 'Error',
      subTitle: text,
      buttons: ['Dismiss']
    });
    alert.present();
  }

  presentAlert(name) {
    const alert = this.alert.create({
      title: 'Sucesso',
      subTitle: 'Usuário '+name+' alterado com sucesso!',
      buttons: ['Dismiss']
    });
    alert.present();
  }

  loadProfileImage() {
    const regex = new RegExp("^(http|https)://", "i");
    if(regex.test(this.loggedUser.avatar)) {
      return this.loggedUser.avatar;
    } else {
      return this.domSanitizer.sanitize(SecurityContext.URL, `data:image/png;base64,${this.loggedUser.avatar}`);
    } 
  }

}