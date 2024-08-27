export class ColorMap {
  private static readonly colorList: string[] = [
    "#CE971A",
    "#698017",
    "#803d17",
    "#AD1F1F",
    "#176780",
    "#411780",
    "#5e1780",
    "#2e8017",
    "#173380",
    "#80174f",
    "#17806e"
  ];
  public static Instance: ColorMap = new ColorMap();


  private colorMap: Map<string, string>;
  private currentColor: number = 0;
  private constructor() {
    this.colorMap = new Map<string, string>();
  }
  public GetOrAddUser(name: string): string {
    if (!this.HasUser(name)) {
      this.AddUser(name);
    }
    return (this.GetColor(name) as string);
  }
  public AddUser(name: string) {
    let color = ColorMap.colorList[this.currentColor];
    this.colorMap.set(name, color);
    this.currentColor++;
    if (this.currentColor > ColorMap.colorList.length) {
      this.currentColor = 0;
    }
  }
  public HasUser(name: string) {
    return this.colorMap.has(name);
  }
  public GetColor(name: string) {
    return this.colorMap.get(name);
  }
}
