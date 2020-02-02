import {Ssn } from "./SSn";

export class PersonModel{

    public name: string;
    public lastname: string;
    public ssn: Ssn;

    constructor(name: string = null, lastname: string = null, ssn: string = null){
        this.name = name;
        this.lastname = lastname;
        if(ssn)
            this.ssn = new Ssn(ssn);
    }
}