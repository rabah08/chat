import * as http from "https"

export class Ssn{
    
    public ssn: string;
    public genre: string;
    public annee: string;
    public mois: string;
    public departement: string;
    public departementNom: string;
    public pays: string
    public ville: string;
    public villeNom: string;
    public certificat: string;
    public clef: string;
    public keyvalable: boolean;
    public valable: boolean

    constructor(ssn : string){
        this.ssn = ssn.replace(' ', '').trim();
        this.valable = this.verification();
        if(this.valable){
            this.grouping();
        }
    }

    private verification() {
        //let regex = /^(?P<genre>[1278])(?P<annee>\d{2})(?P<mois>0[1-9]|1[0-2]|62|63)(?P<departement>\d{2}|2[AB])(?P<ville>\d{3})(?P<certificat>\d{3})(?P<clef>[0-9][0-7])$/;
        let regex = /^([1278])(\d{2})(0[1-9]|1[0-2]|62|63)(\d{2}|2[AB])(\d{3})(\d{3})([0-9][0-7])$/
        
        return regex.test(this.ssn);
    }

    private grouping(){
        let regex = /^([123478])(\d{2})(0[1-9]|1[0-2]|62|63)(\d{2}|2[AB])(\d{3})(\d{3})([0-9][0-7])$/
        let match = this.ssn.match(regex);
        if(match){
            this.genre = match[1]
            this.annee = match[2]
            this.mois = match[3]
            this.departement = match[4]
            this.ville = match[5]
            this.certificat = match[6]
            this.clef = match[7]
        }
        this.keyvalable = false //formule toujours false
    }

    public getVilleName(){
        let link = `https://geo.api.gouv.fr/communes/${this.departement}${this.ville}`;
        return new Promise((resolve, reject) => {
            http.get(link, (res) =>{
                if(res.statusCode !== 404){
                    res.setEncoding("utf-8");
                    res.on('data', (data) => {
                        resolve(JSON.parse(data).nom);
                    });
                    res.on('error', (error) => {
                        reject(error.message);
                    })
                }
            });
        });
    }

    public getDepartementName(){
        let link = `https://geo.api.gouv.fr/departements/${this.departement}`;
        return new Promise((resolve, reject) => {
            http.get(link, (res) =>{
                if(res.statusCode !== 404){
                    res.setEncoding("utf-8");
                    res.on('data', (data) => {
                        console.log("ok")
                        resolve(JSON.parse(data).nom);
                    });
                }
                else{
                   reject(new Error("Etranger"));
                }
            });
        });
    }

    public toString(){
        return `sexe: ${this.genre}
        annee: ${this.annee}
        mois: ${this.mois}
        departement: ${this.departement}
        ville: ${this.ville}
        certificat: ${this.certificat}
        clef: ${this.clef}
        validité du ssn: ${this.valable}`;
    }

}