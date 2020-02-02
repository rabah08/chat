
import * as socketio from "socket.io";
import { Message } from "./model/Message";
import { PersonModel } from "./model/Person.model";
import { SsnModel } from "./model/Ssn.model";
import { getMongoManager } from "typeorm";
import { PersonEntity } from "./entity/Person.entity";

//269054958815780

export class Client{
    private botName: string;
    private socket: socketio.Socket;
    public person: PersonModel;
    public save: false;

    constructor(socket: socketio.Socket, botName: string){
        this.botName = botName;
        this.socket = socket;

        this.socket.emit('message', new Message(
            this.botName, 
            `Bonjour, je suis ${this.botName} ! 
            Je peux vous aider à décoder votre SSN !
            Quel est votre nom ?`,
            "nom",
        ));

        this.socket.on("nom", (msg) =>{
            let reg = /^[a-z '-]+$/;
            if(reg.test(msg)){
                this.setPersonName(msg);
                this.socket.emit('message', new Message(
                    this.botName,
                    "Votre nom a été enregistré. Quel est votre ssn ?",
                    "ssn"
                ));
            } else {
                this.error("nom");
            }
        });

        this.socket.on("ssn", (msg) =>{
            let reg = /^([1278])(\d{2})(0[1-9]|1[0-2]|62|63)(\d{2}|2[AB])(\d{3})(\d{3})([0-9][0-7])$/
            if(reg.test(msg)){
                this.setPersonSSn(msg);
                this.socket.emit('message', new Message(
                    this.botName,
                    `Votre ssn a été enregistré. Voici ses données:
                    ${this.person.ssn.toString()}
                    Les données sont t'elles correctes ?
                    `, 
                    "verification"
                ));
            } else {
                this.error("ssn");
            }
        });

        this.socket.on("verification",(msg) => {
            let reg = /^oui|non$/i
            if(reg.test(msg)){
                if(msg === "oui"){
                    this.socket.emit('message', new Message(
                        this.botName,
                        `Voulez sauvegarder votre résultat dans notre base de données ?`,
                        'sauvegarde'
                    ));
                } else{
                    this.socket.emit('message', new Message(
                        this.botName,
                        `Veuillez rentrer de nouveau votre ssn.`,
                        'ssn'
                    ));
                }
            } else {
                this.error("verification");
            }
        });

        this.socket.on("sauvegarde", (msg) => {
            let reg = /^oui|non$/i
            if(reg.test(msg)){
                if(msg === "oui"){
                    this.savePerson().then(user => {
                        if(user){
                            this.socket.emit('message', new Message(
                                this.botName,
                                `Vos données ont été sauvegardées dans notre base de donnée ! 
                                Vous pouvez continuer avec un nouveau SSN. 
                                Pour cela, tapez de nouveau un nom.`,
                                'nom'
                            ));
                        }else {

                            this.socket.emit('message', new Message(
                                this.botName,
                                `Une erreur à eu lieu durant la sauvegarde... Je suis désolé du désagrément. 
                                Vous pouvez continuer avec un nouveau SSN. 
                                Pour cela, tapez de nouveau un nom.`,
                                'nom'
                            ));
                        }
                    });
                } else{
                    this.socket.emit('message', new Message(
                        this.botName,
                        `Vos données n'ont pas été sauvegardées dans notre base de donnée. 
                        Vous pouvez continuer avec un nouveau SSN.
                        Pour cela, tapez de nouveau un nom.`,
                        'nom'
                    ));
                }
            } else {
                this.error("sauvegarde");
            }
        });

        this.save = false
    }

    private setPersonSSn(ssn: string){
        let data = new SsnModel(ssn);
        this.person.ssn = data;
    }

    private setPersonName(name: string ){
        let data =  name.split(/ (.+)/);
        this.person = new PersonModel(data[0],data[1]);
    }

    private error(event: string){
        this.socket.emit("message", new Message(
            this.botName,
            "Je ne comprends pas votre réponse. Pouvez vous recommencer ?",
            event
        ));
    }

    private savePerson(){
        let entity: PersonEntity = new PersonEntity();
        entity = Object.assign(entity, this.person);
        return getMongoManager().save(entity);
    }
}
