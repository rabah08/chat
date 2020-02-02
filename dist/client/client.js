"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Message_model_1 = require("./model/Message.model");
const Person_model_1 = require("./model/Person.model");
const Ssn_model_1 = require("./model/Ssn.model");
const typeorm_1 = require("typeorm");
const Person_entity_1 = require("./entity/Person.entity");
//269054958815780
class Client {
    constructor(socket, botName) {
        this.botName = botName;
        this.socket = socket;
        this.socket.emit('message', new Message_model_1.Message(this.botName, `Bonjour, je suis ${this.botName} ! 
            Je peux vous aider à décoder votre SSN !
            Quel est votre nom ?`, "nom"));
        this.socket.on("nom", (msg) => {
            let reg = /^[a-z '-]+$/;
            if (reg.test(msg)) {
                this.setPersonName(msg);
                this.socket.emit('message', new Message_model_1.Message(this.botName, "Votre nom a été enregistré. Quel est votre ssn ?", "ssn"));
            }
            else {
                this.error("nom");
            }
        });
        this.socket.on("ssn", (msg) => {
            let reg = /^([1278])(\d{2})(0[1-9]|1[0-2]|62|63)(\d{2}|2[AB])(\d{3})(\d{3})([0-9][0-7])$/;
            if (reg.test(msg)) {
                this.setPersonSSn(msg);
                this.socket.emit('message', new Message_model_1.Message(this.botName, `Votre ssn a été enregistré. Voici ses données:
                    ${this.person.ssn.toString()}
                    Les données sont t'elles correctes ?
                    `, "verification"));
            }
            else {
                this.error("ssn");
            }
        });
        this.socket.on("verification", (msg) => {
            let reg = /^oui|non$/i;
            if (reg.test(msg)) {
                if (msg === "oui") {
                    this.socket.emit('message', new Message_model_1.Message(this.botName, `Voulez sauvegarder votre résultat dans notre base de données ?`, 'sauvegarde'));
                }
                else {
                    this.socket.emit('message', new Message_model_1.Message(this.botName, `Veuillez rentrer de nouveau votre ssn.`, 'ssn'));
                }
            }
            else {
                this.error("verification");
            }
        });
        this.socket.on("sauvegarde", (msg) => {
            let reg = /^oui|non$/i;
            if (reg.test(msg)) {
                if (msg === "oui") {
                    this.savePerson().then(user => {
                        if (user) {
                            this.socket.emit('message', new Message_model_1.Message(this.botName, `Vos données ont été sauvegardées dans notre base de donnée ! 
                                Vous pouvez continuer avec un nouveau SSN. 
                                Pour cela, tapez de nouveau un nom.`, 'nom'));
                        }
                        else {
                            this.socket.emit('message', new Message_model_1.Message(this.botName, `Une erreur à eu lieu durant la sauvegarde... Je suis désolé du désagrément. 
                                Vous pouvez continuer avec un nouveau SSN. 
                                Pour cela, tapez de nouveau un nom.`, 'nom'));
                        }
                    });
                }
                else {
                    this.socket.emit('message', new Message_model_1.Message(this.botName, `Vos données n'ont pas été sauvegardées dans notre base de donnée. 
                        Vous pouvez continuer avec un nouveau SSN.
                        Pour cela, tapez de nouveau un nom.`, 'nom'));
                }
            }
            else {
                this.error("sauvegarde");
            }
        });
        this.save = false;
    }
    setPersonSSn(ssn) {
        let data = new Ssn_model_1.SsnModel(ssn);
        this.person.ssn = data;
    }
    setPersonName(name) {
        let data = name.split(/ (.+)/);
        this.person = new Person_model_1.PersonModel(data[0], data[1]);
    }
    error(event) {
        this.socket.emit("message", new Message_model_1.Message(this.botName, "Je ne comprends pas votre réponse. Pouvez vous recommencer ?", event));
    }
    savePerson() {
        let entity = new Person_entity_1.PersonEntity();
        entity = Object.assign(entity, this.person);
        return typeorm_1.getMongoManager().save(entity);
    }
}
exports.Client = Client;
