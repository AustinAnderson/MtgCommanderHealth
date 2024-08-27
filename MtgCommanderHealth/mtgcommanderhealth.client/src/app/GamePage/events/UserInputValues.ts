export class UserInputValues {
  public static Instance: UserInputValues = new UserInputValues();
  private constructor() { }
  public reset() {
    this.commanderDamage = undefined;
    this.normalDamage = undefined;
    this.healAmount = undefined;
  }
  public commanderDamage: number | undefined;
  public normalDamage: number | undefined;
  public healAmount: number | undefined;
}
