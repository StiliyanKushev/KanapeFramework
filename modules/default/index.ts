import { Module } from "../../classes/Module";

export default class DefaultModule extends Module {
    public variable: string;
    public description = 'This module is designed to act as a showcase for the module syntax. Check the source for more info.';
    public help = Module.makeHelp([
        { arg: `set_var="someValue"`, desc: `Set the variable to a value.` },
        { arg: `get_var`, desc: `Print the variable value.` }
    ]);

    public args = [
        {
            arg: `set_var=`,
            handler: (value) => {
                this.variable = value;
            }
        },
        {
            arg: `get_var`,
            handler: () => {
                console.log(this.variable);
            }
        }
    ]
}