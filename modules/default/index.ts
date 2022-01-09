import { Module } from "../../classes/Module";

export default class DefaultModule extends Module {
    public variable: string;
    public help = Module.makeHelp([
        { arg: `set_var="someValue"`, desc: `Set the variable to a value.` },
        { arg: `get_var`, desc: `Print the variable value.` }
    ]);

    public args = [
        {
            cmd: `set_var=`,
            handler: (value) => {
                this.variable = value;
            }
        },
        {
            cmd: `get_var`,
            handler: () => {
                console.log(this.variable);
            }
        }
    ]
}