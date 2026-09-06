export class Constants {
    public static appName: string = 'CheckList'
    public static token: string = `${this.appName.toLowerCase()}-token`;
    public static listDetails: string = `${this.appName.toLowerCase()}-listDetails`;
    public static THEME_KEY: string = (this.appName.toLowerCase() + '-app-theme').toLowerCase();
}