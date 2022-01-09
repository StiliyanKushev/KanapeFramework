import { Module } from "../../classes/Module";

export default class DefaultModule extends Module {
    public variable: string;
    public description = 'This module is designed to act as a showcase for the module syntax. Check the source for more info.';

    public args = [
        {
            arg: `set_var=`,
            desc: `Set the variable to a value.`,
            handler: (value) => {
                this.variable = value;
            }
        },
        {
            arg: `get_var`,
            desc: `Print the variable value.`,
            handler: () => {
                console.log(this.variable);
            }
        }
    ]
}